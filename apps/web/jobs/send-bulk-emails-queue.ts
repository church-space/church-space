import { task, queue, wait } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import { createClient } from "@church-space/supabase/job";
import { SignJWT } from "jose";
import { Section, BlockType, BlockData } from "@/types/blocks";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Create a queue for email sending
const emailQueue = queue({
  name: "bulk-email-queue",
  concurrencyLimit: 5,
});

// Interface for the payload
interface BulkEmailPayload {
  emailId: number;
  recipients: Record<string, string>; // Map of people_email_id to email address
}

// Interface for email data
interface EmailData {
  id: number;
  subject: string | null;
  from_email: string | null;
  from_name: string | null;
  reply_to: string | null;
  status: string | null;
  scheduled_for: string | null;
  organization_id: string;
  style: {
    bg_color?: string;
    blocks_bg_color?: string;
    is_inset?: boolean;
    is_rounded?: boolean;
    default_text_color?: string;
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
  queue: emailQueue,
  run: async (payload: BulkEmailPayload) => {
    const { emailId, recipients } = payload;
    const supabase = createClient();
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    try {
      // Update email status to sending
      await supabase
        .from("emails")
        .update({ status: "sending" })
        .eq("id", emailId);

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
        .eq("domain", senderDomain);

      if (domainError || !domainData || domainData.length === 0) {
        throw new Error(
          `Sender domain ${senderDomain} is not verified for this organization`,
        );
      }

      // Convert blocks to sections format for email generation
      const sections: Section[] = [
        {
          id: "main-section",
          blocks: typedEmailData.blocks.map((block) => ({
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
        defaultFont: emailStyle.default_font || "sans-serif",
        linkColor: emailStyle.link_color || "#0000ff",
      };

      // Make API request to render email
      const renderResponse = await fetch(
        "https://churchspace.co/api/emails/render",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sections: sections,
            style: style,
            footer: typedEmailData.footer,
          }),
        },
      );

      if (!renderResponse.ok) {
        throw new Error(
          `Failed to render email: ${renderResponse.status} ${renderResponse.statusText}`,
        );
      }

      const { html: baseEnhancedHtmlContent } = await renderResponse.json();

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
          const emailAddress = recipients[peopleEmailId];

          try {
            // Create JWT token for unsubscribe link
            const unsubscribeToken = await new SignJWT({
              email_id: emailId,
              people_email_id: parseInt(peopleEmailId),
            })
              .setProtectedHeader({ alg: "HS256" })
              .setIssuedAt()
              .setExpirationTime("1y")
              .sign(
                new TextEncoder().encode(process.env.UNSUBSCRIBE_JWT_SECRET),
              );

            // Store token for later use
            batchTokens[peopleEmailId] = unsubscribeToken;

            // Generate unsubscribe and manage preferences URLs
            const unsubscribeUrl = `https://churchspace.co/email-manager?tk=${unsubscribeToken}&type=unsubscribe`;
            const managePreferencesUrl = `https://churchspace.co/email-manager?tk=${unsubscribeToken}&type=manage`;

            // Insert the links before the closing body tag
            let personalizedHtml = baseEnhancedHtmlContent;

            // Only add if not already in the content (to avoid duplicates)
            if (!personalizedHtml.includes("Unsubscribe</a>")) {
              personalizedHtml = personalizedHtml.replace(
                "</body>",
                `<div style="text-align: center; font-size: 12px; color: #666; margin-top: 20px; font-family: sans-serif;">
                  <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe</a>
                  <span style="margin: 0 8px">|</span>
                  <a href="${managePreferencesUrl}" style="color: #666; text-decoration: underline;">Manage Preferences</a>
                </div></body>`,
              );
            }

            // Add to batch
            emailBatch.push({
              from: `${typedEmailData.from_name || typedEmailData.from_email} <${fromAddress}>`,
              reply_to: replyToAddress,
              to: emailAddress,
              subject: typedEmailData.subject || "No Subject",
              html: personalizedHtml,
              headers: {
                "X-Entity-Ref-ID": `${emailId}-${peopleEmailId}`,
              },
            });
          } catch (error) {
            console.error(`Error preparing email for ${emailAddress}:`, error);
            failureCount++;
          }
        }

        if (emailBatch.length > 0) {
          try {
            // Send batch
            const response = await resend.batch.send(emailBatch);
            results.push(response);

            // Create email_recipients records for successful sends
            if (response.data) {
              // We need to handle the response data carefully since it might not be an array
              // with the same structure as our batch
              const responseData = Array.isArray(response.data)
                ? response.data
                : [response.data];

              // Create records for each successfully sent email
              for (
                let i = 0;
                i < Math.min(responseData.length, batch.length);
                i++
              ) {
                const peopleEmailId = batch[i];
                const emailAddress = recipients[peopleEmailId];
                const resendEmailId = responseData[i]?.id;

                if (resendEmailId) {
                  try {
                    await supabase.from("email_recipients").insert({
                      email_id: emailId,
                      people_email_id: parseInt(peopleEmailId),
                      email_address: emailAddress,
                      resend_email_id: resendEmailId,
                      status: "pending",
                      unsubscribe_token: batchTokens[peopleEmailId],
                    });
                    successCount++;
                  } catch (insertError) {
                    console.error(
                      "Error creating recipient record:",
                      insertError,
                    );
                    failureCount++;
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error sending batch:", error);

            // Create recipient records for failed sends
            for (const peopleEmailId of batch) {
              const emailAddress = recipients[peopleEmailId];

              try {
                await supabase.from("email_recipients").insert({
                  email_id: emailId,
                  people_email_id: parseInt(peopleEmailId),
                  email_address: emailAddress,
                  status: "did-not-send",
                  unsubscribe_token: batchTokens[peopleEmailId] || "",
                });
                failureCount++;
              } catch (insertError) {
                console.error(
                  "Error creating failed recipient record:",
                  insertError,
                );
              }
            }
          }
        }
      }

      // Update email status based on results
      if (failureCount > 0 && successCount === 0) {
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", emailId);
      } else {
        await supabase
          .from("emails")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", emailId);
      }

      return {
        emailId,
        totalRecipients: Object.keys(recipients).length,
        successCount,
        failureCount,
        status: failureCount > 0 && successCount === 0 ? "failed" : "sent",
      };
    } catch (error) {
      console.error("Error in bulk email job:", error);

      // Update email status to failed
      await supabase
        .from("emails")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", emailId);

      throw error;
    }
  },
});
