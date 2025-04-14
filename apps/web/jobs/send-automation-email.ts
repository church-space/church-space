import { task, queue, runs } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import { createClient } from "@church-space/supabase/job";
import { SignJWT } from "jose";
import { Section, BlockType, BlockData } from "@/types/blocks";
import { v4 as uuidv4 } from "uuid";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Create a queue for email sending
const emailQueue = queue({
  name: "automation-email-queue",
  concurrencyLimit: 5, // Keep concurrency for the queue itself
});

// Interface for the payload
interface SendAutomationEmailPayload {
  emailId: number;
  recipient: {
    pcoPersonId: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  organizationId: string;
  fromEmail: string;
  fromEmailDomain: number;
  fromName: string;
  subject: string;
  automationId: number; // Assuming this might be needed for tracking/logging
  personId: number;
  triggerAutomationRunId: string;
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

// Renamed task
export const sendAutomationEmail = task({
  id: "send-automation-email", // Updated task ID
  queue: emailQueue,
  run: async (payload: SendAutomationEmailPayload) => {
    const {
      emailId,
      recipient,
      fromEmail,
      fromEmailDomain,
      fromName,
      subject,
      organizationId,
      automationId,
      personId,
      triggerAutomationRunId,
    } = payload;
    const supabase = createClient();

    let emailSentSuccessfully = false;
    let errorMessage: string | null = null;
    let unsubscribeToken: string | null = null;

    try {
      const { data: peopleEmailId, error: peopleEmailIdError } = await supabase
        .from("people_emails")
        .select("id")
        .eq("email", recipient.email)
        .eq("organization_id", organizationId)
        .eq("pco_person_id", recipient.pcoPersonId)
        .single();

      if (peopleEmailIdError || !peopleEmailId) {
        throw new Error(
          `Failed to fetch people_email_id for ${recipient.email}: ${peopleEmailIdError?.message || "People email not found"}`,
        );
      }

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

      // Get domain for From address
      const { data: domainData, error: domainError } = await supabase
        .from("domains")
        .select("domain")
        .eq("organization_id", organizationId)
        .eq("id", fromEmailDomain)
        .single();

      if (domainError || !domainData) {
        throw new Error(
          `Failed to fetch domain data: ${domainError?.message || "Domain not found"}`,
        );
      }

      const fromAddress = `${fromEmail}@${domainData.domain}`;

      // Convert blocks to sections format for email generation
      const sections: Section[] = [
        {
          id: "main-section", // Or use a dynamic ID if needed
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

      // Generate unsubscribe token
      unsubscribeToken = await new SignJWT({
        email_id: emailId,
        people_email_id: peopleEmailId,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1y") // Consider if expiration time should be configurable
        .sign(new TextEncoder().encode(process.env.UNSUBSCRIBE_JWT_SECRET));

      const unsubscribeUrl = `https://churchspace.co/email-manager?tk=${unsubscribeToken}&type=unsubscribe`;
      const managePreferencesUrl = `https://churchspace.co/email-manager?tk=${unsubscribeToken}&type=manage`;

      // Render the email content via API call
      const renderResponse = await fetch(
        "https://churchspace.co/api/emails/render",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Trigger-Secret": process.env.TRIGGER_API_ROUTE_SECRET || "",
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "One-Click",
            "X-Entity-Automation-ID": `${automationId}`,
          },
          body: JSON.stringify({
            sections: sections,
            style: style,
            footer: typedEmailData.footer,
            unsubscribeUrl,
            managePreferencesUrl,
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            email: recipient.email,
          }),
        },
      );

      if (!renderResponse.ok) {
        const errorBody = await renderResponse.text();
        throw new Error(
          `Failed to render email: ${renderResponse.status} ${renderResponse.statusText} - ${errorBody}`,
        );
      }

      const { html: personalizedHtml, text: personalizedText } =
        await renderResponse.json();

      // Prepare email data for sending
      const emailSendData = {
        from: `${fromName} <${fromAddress}>`,
        to: recipient.email,
        subject: subject, // Use subject from payload
        html: personalizedHtml,
        text: personalizedText,
        headers: {
          "X-Entity-Email-ID": `${emailId}`,
          "X-Entity-Automation-ID": `${automationId}`,
          "X-Entity-People-Email-ID": `${peopleEmailId}`, // Use ID from payload
          "X-Entity-Ref-ID": uuidv4(), // Unique reference for this specific send
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "One-Click",
        },
      };

      // Send the email using Resend
      const { data: sendData, error: sendError } =
        await resend.emails.send(emailSendData);

      if (sendError) {
        // Log error and set status
        console.error(
          `Resend failed to send email to ${recipient.email} for email ID ${emailId}:`,
          sendError,
        );
        errorMessage = `Resend error: ${sendError.message}`;
        emailSentSuccessfully = false;
      } else if (sendData) {
        console.log(
          `Email successfully sent to ${recipient.email} via Resend. ID: ${sendData.id}`,
        );
        emailSentSuccessfully = true;
      } else {
        // Should not happen based on Resend types, but handle defensively
        errorMessage = "Resend returned no data and no error.";
        emailSentSuccessfully = false;
      }

      // Update the automation member status based on the email send result
      const { data: automationMember, error: memberError } = await supabase
        .from("email_automation_members")
        .select("id, status")
        .eq("automation_id", automationId)
        .eq("person_id", personId)
        .single();

      if (memberError || !automationMember) {
        console.error(
          `Failed to fetch automation member record for automation ${automationId}, person ${peopleEmailId.id}:`,
          memberError?.message || "Member not found",
        );
      } else {
        // Only update if the status indicates we should (e.g., don't update if already failed/completed)
        if (automationMember.status === "in-progress") {
          await supabase
            .from("email_automation_members")
            .update({
              status: emailSentSuccessfully ? "in-progress" : "failed",
              reason: errorMessage,
              updated_at: new Date().toISOString(),
            })
            .eq("id", automationMember.id);
        }
      }

      // If successfully sent, update organization usage
      if (emailSentSuccessfully) {
        const { data: emailUsage, error: emailUsageError } = await supabase
          .from("org_email_usage")
          .select("sends_remaining, sends_used")
          .eq("organization_id", organizationId)
          .single();

        if (emailUsageError || !emailUsage) {
          // Log this error but don't fail the whole job
          console.error(
            `Failed to fetch email usage for org ${organizationId}: ${emailUsageError?.message || "Usage record not found"}`,
          );
        } else {
          const { error: updateUsageError } = await supabase
            .from("org_email_usage")
            .update({
              sends_remaining: Math.max(0, emailUsage.sends_remaining - 1), // Decrement, ensure not negative
              sends_used: emailUsage.sends_used + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("organization_id", organizationId);

          if (updateUsageError) {
            // Log this error but don't fail the whole job
            console.error(
              `Failed to update email usage for org ${organizationId}: ${updateUsageError.message}`,
            );
          }
        }
      }

      return {
        emailId,
        recipientEmail: recipient.email,
        status: emailSentSuccessfully ? "sent" : "failed",
        errorMessage: errorMessage,
      };
    } catch (error) {
      console.error(
        `Error in sendAutomationEmail job for email ID ${emailId}, recipient ${recipient?.email}:`,
        error,
      );

      errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      // Try to update the automation member status on error
      try {
        const { data: automationMember, error: memberError } = await supabase
          .from("email_automation_members")
          .select("id, status")
          .eq("automation_id", automationId)
          .eq("person_id", personId)
          .single();

        if (memberError || !automationMember) {
          console.error(
            `Failed to fetch automation member record for automation ${automationId}, person ${recipient.pcoPersonId}:`,
            memberError?.message || "Member not found",
          );
        } else if (automationMember.status === "in-progress") {
          await supabase
            .from("email_automation_members")
            .update({
              status: "failed",
              reason: errorMessage,
              updated_at: new Date().toISOString(),
            })
            .eq("id", automationMember.id);

          await runs.cancel(triggerAutomationRunId);
        }
      } catch (updateError) {
        console.error(
          `Failed to update automation member status for automation ${automationId}:`,
          updateError,
        );
      }

      // Re-throw the error
      throw error;
    }
  },
});
