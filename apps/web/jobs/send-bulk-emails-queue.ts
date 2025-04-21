import "server-only";
import { task, queue } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import { createClient } from "@church-space/supabase/job";
import { SignJWT } from "jose";
import { Section, BlockType, BlockData } from "@/types/blocks";
import { v4 as uuidv4 } from "uuid";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Create a queue for email sending
const emailQueue = queue({
  name: "bulk-email-queue",
  concurrencyLimit: 18,
});

// Interface for the payload
interface BulkEmailPayload {
  emailId: number;
  recipients: Record<
    string,
    {
      email: string;
      firstName?: string;
      lastName?: string;
    }
  >;
  organizationId: string;
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
    is_rounded?: boolean;
    block_spacing?: number;
    default_text_color?: string;
    accent_text_color?: string;
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

export const sendBulkEmails = task({
  id: "send-bulk-emails",
  retry: {
    maxAttempts: 1,
  },
  queue: emailQueue,
  run: async (payload: BulkEmailPayload) => {
    const { emailId, recipients } = payload;
    const supabase = createClient();
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    try {
      // Get email data with blocks and footer
      const { data: emailData, error: emailError } = await supabase
        .from("emails")
        .select(
          `
          *,
          blocks:email_blocks(*),
          footer:email_footers(*),
          from_domain:domains!emails_from_email_domain_fkey(*),
          reply_to_domain:domains!emails_reply_to_domain_fkey(*)
        `,
        )
        .eq("id", emailId)
        .single();

      if (emailError || !emailData) {
        throw new Error(
          `Failed to fetch email data: ${emailError?.message || "Email not found"}`,
        );
      }

      const typedEmailData = emailData as unknown as EmailData & {
        from_domain: { domain: string } | null;
        reply_to_domain: { domain: string } | null;
      };

      // Verify email status is not SENT or DRAFT
      if (
        typedEmailData.status === "sent" ||
        typedEmailData.status === "draft"
      ) {
        throw new Error(
          `Email has invalid status for sending: ${typedEmailData.status}`,
        );
      }

      try {
        // Update email status to sending
        await supabase
          .from("emails")
          .update({ status: "sending" })
          .eq("id", emailId);
      } catch (error) {
        console.error("Error updating email status to sending:", error);
      }

      // Verify scheduled time if applicable
      if (typedEmailData.scheduled_for) {
        const scheduledTime = new Date(typedEmailData.scheduled_for);
        const now = new Date();
        if (scheduledTime > now) {
          throw new Error("Email is scheduled for future delivery");
        }
      }

      // Build from and reply-to addresses
      if (!typedEmailData.from_email || !typedEmailData.from_domain?.domain) {
        throw new Error("Missing from email or domain information");
      }

      const fromAddress = `${typedEmailData.from_email}@${typedEmailData.from_domain.domain}`;
      const replyToAddress =
        typedEmailData.reply_to && typedEmailData.reply_to_domain?.domain
          ? `${typedEmailData.reply_to}@${typedEmailData.reply_to_domain.domain}`
          : undefined;

      // Verify sender domain
      const senderDomain = typedEmailData.from_domain.domain;

      // Check if domain is verified for this organization
      const { data: domainData, error: domainError } = await supabase
        .from("domains")
        .select("*")
        .eq("organization_id", typedEmailData.organization_id)
        .eq("domain", senderDomain)
        .eq("is_verified", true);

      if (domainError || !domainData || domainData.length === 0) {
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
          `Sender domain ${senderDomain} is not verified for this organization`,
        );
      }

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
        isRounded: emailStyle.is_rounded || false,
        emailBgColor: emailStyle.bg_color || "#eeeeee",
        defaultTextColor: emailStyle.default_text_color || "#000000",
        accentTextColor: emailStyle.accent_text_color || "#000000",
        defaultFont: emailStyle.default_font || "sans-serif",
        linkColor: emailStyle.link_color || "#0000ff",
      };

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
        // Update email status to failed if rendering fails
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
          const { email, firstName, lastName } = recipientData;

          try {
            // Create JWT token for unsubscribe link
            const unsubscribeToken = await new SignJWT({
              email_id: emailId,
              people_email_id: parseInt(peopleEmailId),
            })
              .setProtectedHeader({ alg: "HS256" })
              .setIssuedAt()
              .sign(
                new TextEncoder().encode(process.env.UNSUBSCRIBE_JWT_SECRET),
              );

            // Store token for later use
            batchTokens[peopleEmailId] = unsubscribeToken;

            // Generate unsubscribe and manage preferences URLs
            const unsubscribeUrl = `https://churchspace.co/email-manager?tk=${unsubscribeToken}&type=unsubscribe`;
            const oneClickUnsubscribeUrl = `https://churchspace.co/email-manager/one-click?tk=${unsubscribeToken}&type=unsubscribe`;
            const managePreferencesUrl = `https://churchspace.co/email-manager?tk=${unsubscribeToken}&type=manage`;

            // ---- START: Personalize content ----
            let personalizedHtml = baseHtml
              .replace(
                /<span data-type="mention" data-id="first-name">@first-name<\/span>/g,
                firstName || "",
              )
              .replace(
                /<span data-type="mention" data-id="last-name">@last-name<\/span>/g,
                lastName || "",
              )
              .replace(
                /<span data-type="mention" data-id="email">@email<\/span>/g,
                email || "",
              )
              // Use regex to replace href="#" within the correct <a> tag for manage preferences
              .replace(
                /(<a[^>]*id="manage-preferences-link"[^>]*)href="#"([^>]*>)/g,
                `$1href="${managePreferencesUrl}"$2`,
              )
              // Use regex to replace href="#" within the correct <a> tag for unsubscribe
              .replace(
                /(<a[^>]*id="unsubscribe-link"[^>]*)href="#"([^>]*>)/g,
                `$1href="${unsubscribeUrl}"$2`,
              );

            let personalizedText = baseText
              .replace(/@first-name/g, firstName || "")
              .replace(/@last-name/g, lastName || "")
              .replace(/@email/g, email || "");

            // Append unsubscribe/manage links to text version
            personalizedText += `\n\n---\nUnsubscribe: ${unsubscribeUrl}\nManage Preferences: ${managePreferencesUrl}`;
            // ---- END: Personalize content ----

            // Add to batch using personalized content
            emailBatch.push({
              from: `${typedEmailData.from_name || typedEmailData.from_email} <${fromAddress}>`,
              replyTo: replyToAddress,
              to: recipientData.email,
              subject: typedEmailData.subject || "No Subject",
              html: personalizedHtml, // Use personalized HTML
              text: personalizedText, // Use personalized Text
              headers: {
                "X-Entity-Email-ID": `${emailId}`,
                "X-Entity-People-Email-ID": `${peopleEmailId}`,
                "X-Entity-Ref-ID": uuidv4(),
                "List-Unsubscribe": `<${oneClickUnsubscribeUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            });
          } catch (error) {
            console.error(
              `Error preparing email for ${recipientData.email}:`,
              error,
            );
            failureCount++;
            if (batchTokens[peopleEmailId]) {
              try {
                await supabase.from("email_recipients").insert({
                  email_id: emailId,
                  people_email_id: parseInt(peopleEmailId),
                  email_address: recipientData.email,
                  status: "did-not-send",
                  unsubscribe_token: batchTokens[peopleEmailId],
                  error_message:
                    error instanceof Error
                      ? error.message
                      : "Failed to render or personalize email",
                });
              } catch (insertError) {
                console.error(
                  `Failed to create recipient record for ${recipientData.email} after render error:`,
                  insertError,
                );
              }
            }
          }
        }

        if (emailBatch.length > 0) {
          try {
            // Send batch
            const response = await resend.batch.send(emailBatch);
            results.push(response);

            // ---- START: Update recipient records based on send status ----
            // Define type for Resend batch response items
            interface ResendBatchItem {
              id: string;
              to: string;
              error: { message: string; type: string } | null;
            }
            const sentEmailData = (response.data?.data ||
              []) as ResendBatchItem[];

            // --- DEBUG LOGGING START ---
            console.log(
              "Resend batch response data:",
              JSON.stringify(sentEmailData, null, 2),
            );
            // --- DEBUG LOGGING END ---

            const peopleEmailIdsInBatch = emailBatch.map(
              (email) => email.headers["X-Entity-People-Email-ID"],
            );

            for (const peopleEmailId of peopleEmailIdsInBatch) {
              const recipientData = recipients[peopleEmailId];
              const emailAddress = recipientData.email;
              const sentInfo = sentEmailData.find(
                (sent) => sent.to === emailAddress,
              );

              // --- DEBUG LOGGING START ---
              console.log(`Processing recipient: ${emailAddress}`);
              console.log("Found sentInfo:", JSON.stringify(sentInfo, null, 2));
              // --- DEBUG LOGGING END ---

              // Map Resend status/error to Supabase status
              const status =
                sentInfo && !sentInfo.error ? "sent" : "did-not-send";
              const errorMessage = sentInfo?.error?.message; // Use Resend error message
              const messageId = sentInfo?.id;

              // --- DEBUG LOGGING START ---
              console.log(`Determined status: ${status}`);
              // --- DEBUG LOGGING END ---

              try {
                await supabase.from("email_recipients").insert({
                  email_id: emailId,
                  people_email_id: parseInt(peopleEmailId),
                  email_address: emailAddress,
                  status: status,
                  unsubscribe_token: batchTokens[peopleEmailId] || "",
                  error_message: errorMessage,
                  resend_email_id: messageId, // Use correct column name
                });

                if (status === "sent") {
                  successCount++;
                } else {
                  failureCount++;
                }
              } catch (insertError) {
                console.error(
                  `Failed to create recipient record for ${emailAddress}:`,
                  insertError,
                );
                // Increment failure count even if DB insert fails, as the email itself failed to send or record
                failureCount++;
              }
            }
            // ---- END: Update recipient records based on send status ----
          } catch (error) {
            console.error("Error sending batch:", error);
            failureCount += emailBatch.length; // Assume all in batch failed if send throws

            // Create recipient records for failed sends in this batch
            const peopleEmailIdsInBatch = emailBatch.map(
              (email) => email.headers["X-Entity-People-Email-ID"],
            );
            for (const peopleEmailId of peopleEmailIdsInBatch) {
              const recipientData = recipients[peopleEmailId];
              const emailAddress = recipientData.email;

              try {
                await supabase.from("email_recipients").insert({
                  email_id: emailId,
                  people_email_id: parseInt(peopleEmailId),
                  email_address: emailAddress,
                  status: "did-not-send", // Marked as did-not-send if batch fails
                  unsubscribe_token: batchTokens[peopleEmailId] || "",
                  error_message:
                    error instanceof Error
                      ? error.message
                      : "Batch send failed",
                });

                // failureCount++; - Handled above by incrementing for the whole batch
              } catch (insertError) {
                console.error(
                  `Failed to create failed recipient record for ${emailAddress}:`,
                  insertError,
                );
              }
            }
          }
        }
      }

      // Get current email usage for the organization
      const { data: emailUsage, error: emailUsageError } = await supabase
        .from("org_email_usage")
        .select("sends_remaining, sends_used")
        .eq("organization_id", payload.organizationId)
        .single();

      if (emailUsageError) {
        throw new Error(
          `Failed to fetch email usage: ${emailUsageError.message}`,
        );
      }

      if (!emailUsage) {
        throw new Error("No email usage limits found for this organization");
      }

      // Update the organization's remaining email sends based on actual successful sends
      const { error: updateUsageError } = await supabase
        .from("org_email_usage")
        .update({
          sends_remaining: emailUsage.sends_remaining - successCount,
          updated_at: new Date().toISOString(),
          sends_used: emailUsage.sends_used + successCount,
        })
        .eq("organization_id", payload.organizationId);

      if (updateUsageError) {
        throw new Error(
          `Failed to update email usage: ${updateUsageError.message}`,
        );
      }

      // Update email status based on results
      if (successCount === 0) {
        // If no emails sent successfully, mark as failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: "Failed to send any emails",
          })
          .eq("id", emailId);
      } else {
        // If some emails sent successfully, mark as sent but include error message if there were failures
        await supabase
          .from("emails")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            error_message:
              failureCount > 0
                ? `Successfully sent ${successCount} emails, but failed to send ${failureCount} emails`
                : null,
          })
          .eq("id", emailId);
      }

      return {
        emailId,
        totalRecipients: Object.keys(recipients).length,
        successCount,
        failureCount,
        status: successCount === 0 ? "failed" : "sent",
      };
    } catch (error) {
      console.error("Error in bulk email job:", error);

      // Update email status to failed
      await supabase
        .from("emails")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
          error_message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred while sending bulk emails",
        })
        .eq("id", emailId);

      throw error;
    }
  },
});
