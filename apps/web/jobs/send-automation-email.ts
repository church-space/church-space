import { BlockData, BlockType, Section } from "@/types/blocks";
import { createClient } from "@church-space/supabase/job";
import { queue, runs, task } from "@trigger.dev/sdk/v3";
import { SignJWT } from "jose";
import { Resend } from "resend";
import "server-only";
import { v4 as uuidv4 } from "uuid";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Create a queue for email sending
const emailQueue = queue({
  name: "bulk-email-queue",
  concurrencyLimit: 20,
});

// Interface for the payload
interface SendAutomationEmailPayload {
  emailId: number;
  recipients: Record<
    string,
    {
      pcoPersonId: string;
      email: string;
      firstName?: string;
      lastName?: string;
      personId: number;
    }
  >;
  organizationId: string;
  fromEmail: string;
  fromEmailDomain: number;
  fromName: string;
  subject: string;
  automationId: number;
  automationStepId: number;
  triggerAutomationRunId: string;
  organizationName: string;
}

// Interface for email data
interface EmailData {
  id: number;
  subject: string | null;
  from_email: string | null;
  from_name: string | null;
  reply_to: string | null;
  reply_to_domain: string | null;
  status: string | null;
  scheduled_for: string | null;
  organization_id: string;
  style: {
    bg_color?: string;
    blocks_bg_color?: string;
    is_inset?: boolean;
    corner_radius?: number;
    default_text_color?: string;
    accent_text_color?: string;
    block_spacing?: number;
    default_font?: string;
    link_color?: string;
  } | null;
  blocks: Array<{
    id: number;
    type: string;
    value: any;
    order: number | null;
  }>;
  footer: any;
}

// Renamed task
export const sendAutomationEmail = task({
  id: "send-automation-email",
  queue: emailQueue,
  run: async (payload: SendAutomationEmailPayload) => {
    const {
      emailId,
      recipients,
      fromEmail,
      fromEmailDomain,
      fromName,
      subject,
      organizationId,
      automationId,
      automationStepId,
      triggerAutomationRunId,
    } = payload;
    const supabase = createClient();

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    try {
      // Get domain for From address
      const { data: domainData, error: domainError } = await supabase
        .from("domains")
        .select("domain")
        .eq("organization_id", organizationId)
        .eq("id", fromEmailDomain)
        .eq("is_verified", true)
        .single();

      if (domainError || !domainData) {
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message:
              "Sender domain is not verified for this organization",
          })
          .eq("id", emailId);
        throw new Error(
          `Failed to fetch domain data: ${domainError?.message || "Domain not found"}`,
        );
      }

      const fromAddress = `${fromEmail}@${domainData.domain}`;

      // Get email data with blocks and footer
      const { data: emailData, error: emailError } = await supabase
        .from("emails")
        .select(
          `
          *,
          blocks:email_blocks(*),
          footer:email_footers(*)
        `,
        )
        .eq("id", emailId)
        .eq("organization_id", organizationId)
        .eq("type", "template")
        .single();

      if (emailError || !emailData) {
        throw new Error(
          `Failed to fetch email template data: ${emailError?.message || "Email template not found"}`,
        );
      }

      const typedEmailData = emailData as unknown as EmailData;

      // Convert blocks to sections format for email generation
      const sections: Section[] = [
        {
          id: "main-section",
          blocks: typedEmailData.blocks
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((block) => ({
              id: block.id.toString(),
              type: block.type as BlockType,
              order: block.order || 0,
              data: block.value as unknown as BlockData,
            })),
        },
      ];

      // Get style from email data
      const emailStyle = typedEmailData.style || {};
      const style = {
        bgColor: emailStyle.blocks_bg_color || "#ffffff",
        isInset: emailStyle.is_inset || false,
        cornerRadius: emailStyle.corner_radius || 0,
        emailBgColor: emailStyle.bg_color || "#eeeeee",
        defaultTextColor: emailStyle.default_text_color || "#000000",
        accentTextColor: emailStyle.accent_text_color || "#000000",
        defaultFont: emailStyle.default_font || "sans-serif",
        linkColor: emailStyle.link_color || "#0000ff",
        blockSpacing: emailStyle.block_spacing || 16,
      };

      // Get org footer details
      const { data: orgFooterDetails, error: orgFooterDetailsError } =
        await supabase
          .from("organizations")
          .select("name, address")
          .eq("id", typedEmailData.organization_id)
          .single();

      if (orgFooterDetailsError) {
        console.error(
          "Error fetching org footer details:",
          orgFooterDetailsError,
        );
      }

      // ---- START: Render email template once ----
      let baseHtml: string;
      let baseText: string;

      try {
        const renderResponse = await fetch(
          "https://churchspace.co/api/emails/render",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Trigger-Secret": process.env.TRIGGER_API_ROUTE_SECRET || "",
            },
            body: JSON.stringify({
              sections: sections,
              style: style,
              footer: typedEmailData.footer,
              orgFooterDetails: orgFooterDetails,
            }),
          },
        );

        if (!renderResponse.ok) {
          const errorBody = await renderResponse.text();
          throw new Error(
            `Failed to render email template: ${renderResponse.status} ${renderResponse.statusText} - ${errorBody}`,
          );
        }

        const renderedEmail = await renderResponse.json();
        baseHtml = renderedEmail.html;
        baseText = renderedEmail.text;
      } catch (error) {
        console.error("Error rendering base email template:", error);
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: "Failed to render email template",
          })
          .eq("id", emailId);
        throw new Error("Failed to render base email template.");
      }
      // ---- END: Render email template once ----

      // Process recipients in batches of 100
      const peopleEmailIds = Object.keys(recipients);
      const batches = [];

      for (let i = 0; i < peopleEmailIds.length; i += 100) {
        batches.push(peopleEmailIds.slice(i, i + 100));
      }

      for (const batch of batches) {
        const emailBatch = [];
        const batchTokens: Record<string, string> = {};

        for (const peopleEmailId of batch) {
          const recipientData = recipients[peopleEmailId];
          const { email, firstName, lastName, pcoPersonId, personId } =
            recipientData;

          try {
            // Generate unsubscribe token
            const unsubscribeToken = await new SignJWT({
              automation_step_id: automationStepId,
              people_email_id: parseInt(peopleEmailId),
            })
              .setProtectedHeader({ alg: "HS256" })
              .setIssuedAt()
              .sign(
                new TextEncoder().encode(process.env.UNSUBSCRIBE_JWT_SECRET),
              );

            batchTokens[peopleEmailId] = unsubscribeToken;

            const unsubscribeUrl = `https://churchspace.co/email-manager?tk=${unsubscribeToken}&type=unsubscribe`;
            const oneClickUnsubscribeUrl = `https://churchspace.co/email-manager/one-click?tk=${unsubscribeToken}&type=unsubscribe`;
            const managePreferencesUrl = `https://churchspace.co/email-manager?tk=${unsubscribeToken}&type=manage`;
            const unsubscribeEmail = `unsubscribe@churchspace.co?subject=unsubscribe&body=automationId%3A%20${automationId}%0ApersonEmailId%3A%20${peopleEmailId}`;

            // ---- START: Personalize content ----
            let personalizedHtml = baseHtml
              .replace(
                /<span\s+data-type="mention" data-id="first-name">@first-name<\/span>/g,
                firstName || "",
              )
              .replace(
                /<span\s+data-type="mention" data-id="last-name">@last-name<\/span>/g,
                lastName || "",
              )
              .replace(
                /<span\s+data-type="mention" data-id="email">@email<\/span>/g,
                email || "",
              )
              .replace(
                /(<a(?=[^>]*id="manage-preferences-link")[^>]*?)href="#"([^>]*>)/g,
                `$1href="${managePreferencesUrl}"$2`,
              )
              .replace(
                /(<a(?=[^>]*id="unsubscribe-link")[^>]*?)href="#"([^>]*>)/g,
                `$1href="${unsubscribeUrl}"$2`,
              );

            let personalizedText = baseText
              .replace(/@first-name/g, firstName || "")
              .replace(/@last-name/g, lastName || "")
              .replace(/@email/g, email || "");

            personalizedText += `\n\n---\nUnsubscribe: ${unsubscribeUrl}\nManage Preferences: ${managePreferencesUrl}`;

            emailBatch.push({
              from: `${fromName} <${fromAddress}>`,
              to: email,
              subject: subject,
              html: personalizedHtml,
              text: personalizedText,
              headers: {
                "X-Entity-Automation-ID": `${automationId}`,
                "X-Entity-People-Email-ID": `${peopleEmailId}`,
                "X-Entity-Ref-ID": uuidv4(),
                "List-Unsubscribe": `<${oneClickUnsubscribeUrl}>, mailto:${unsubscribeEmail}`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                "X-Mailer": `Church Space Mailer - **Customer ${organizationId}**`,
                "X-Report-Abuse": `<mailto:report@churchspace.co>`,
                "List-ID": `${payload.organizationName} - Automation ${automationId}`,
              },
            });
          } catch (error) {
            console.error(`Error preparing email for ${email}:`, error);
            failureCount++;

            // Update automation member status on error
            try {
              const { data: automationMember, error: memberError } =
                await supabase
                  .from("email_automation_members")
                  .select("id, status")
                  .eq("automation_id", automationId)
                  .eq("person_id", personId)
                  .single();

              if (
                !memberError &&
                automationMember &&
                automationMember.status === "in-progress"
              ) {
                await supabase
                  .from("email_automation_members")
                  .update({
                    status: "failed",
                    reason:
                      error instanceof Error
                        ? error.message
                        : "Failed to prepare email",
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", automationMember.id);
              }
            } catch (updateError) {
              console.error(
                `Failed to update automation member status for person ${personId}:`,
                updateError,
              );
            }
          }
        }

        if (emailBatch.length > 0) {
          try {
            // Send batch
            const response = await resend.batch.send(emailBatch);
            results.push(response);

            // Process batch results
            const sentEmailData = (response.data?.data || []) as Array<{
              id: string;
              to: string;
              error: { message: string; type: string } | null;
            }>;

            // Process each sent email in the batch
            emailBatch.forEach(async (sentRequest, index) => {
              const peopleEmailId =
                sentRequest.headers["X-Entity-People-Email-ID"];
              const recipientData = recipients[peopleEmailId];
              const sentInfo = sentEmailData[index];
              const isSuccess = sentInfo && !sentInfo.error;

              // Update automation member status
              try {
                const { data: automationMember, error: memberError } =
                  await supabase
                    .from("email_automation_members")
                    .select("id, status")
                    .eq("automation_id", automationId)
                    .eq("person_id", recipientData.personId)
                    .single();

                if (
                  !memberError &&
                  automationMember &&
                  automationMember.status === "in-progress"
                ) {
                  await supabase
                    .from("email_automation_members")
                    .update({
                      status: isSuccess ? "in-progress" : "failed",
                      reason: sentInfo?.error?.message,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", automationMember.id);
                }

                if (isSuccess) {
                  successCount++;
                } else {
                  failureCount++;
                  if (!isSuccess) {
                    await runs.cancel(triggerAutomationRunId);
                  }
                }
              } catch (updateError) {
                console.error(
                  `Failed to update automation member status for person ${recipientData.personId}:`,
                  updateError,
                );
                failureCount++;
              }
            });
          } catch (error) {
            console.error("Error sending batch:", error);
            failureCount += emailBatch.length;

            // Update automation member status for failed batch
            for (const peopleEmailId of batch) {
              const recipientData = recipients[peopleEmailId];
              try {
                const { data: automationMember, error: memberError } =
                  await supabase
                    .from("email_automation_members")
                    .select("id, status")
                    .eq("automation_id", automationId)
                    .eq("person_id", recipientData.personId)
                    .single();

                if (
                  !memberError &&
                  automationMember &&
                  automationMember.status === "in-progress"
                ) {
                  await supabase
                    .from("email_automation_members")
                    .update({
                      status: "failed",
                      reason:
                        error instanceof Error
                          ? error.message
                          : "Batch send failed",
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", automationMember.id);
                }
              } catch (updateError) {
                console.error(
                  `Failed to update automation member status for person ${recipientData.personId}:`,
                  updateError,
                );
              }
            }
          }
        }
      }

      // Update organization's email usage
      if (successCount > 0) {
        const { data: emailUsage, error: emailUsageError } = await supabase
          .from("org_email_usage")
          .select("sends_remaining, sends_used")
          .eq("organization_id", organizationId)
          .single();

        if (emailUsageError || !emailUsage) {
          console.error(
            `Failed to fetch email usage for org ${organizationId}:`,
            emailUsageError?.message || "Usage record not found",
          );
        } else {
          const { error: updateUsageError } = await supabase
            .from("org_email_usage")
            .update({
              sends_remaining: Math.max(
                0,
                emailUsage.sends_remaining - successCount,
              ),
              sends_used: emailUsage.sends_used + successCount,
              updated_at: new Date().toISOString(),
            })
            .eq("organization_id", organizationId);

          if (updateUsageError) {
            console.error(
              `Failed to update email usage for org ${organizationId}:`,
              updateUsageError.message,
            );
          }
        }
      }

      return {
        emailId,
        totalRecipients: Object.keys(recipients).length,
        successCount,
        failureCount,
        status: successCount === 0 ? "failed" : "sent",
      };
    } catch (error) {
      console.error(
        `Error in sendAutomationEmail job for email ID ${emailId}:`,
        error,
      );

      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      // Cancel the automation run on error
      await runs.cancel(triggerAutomationRunId);

      throw error;
    }
  },
});
