import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";
import { sendBulkEmails } from "./send-bulk-emails-queue";

// Interface for the payload
interface FilterEmailRecipientsPayload {
  emailId: number;
}

export const filterEmailRecipients = task({
  id: "filter-email-recipients",
  run: async (payload: FilterEmailRecipientsPayload) => {
    const { emailId } = payload;
    const supabase = createClient();

    try {
      // Step 1: Get the email details
      const { data: emailData, error: emailError } = await supabase
        .from("emails")
        .select("*, organization_id, list_id, status")
        .eq("id", emailId)
        .single();

      if (emailError || !emailData) {
        throw new Error(
          `Failed to fetch email data: ${emailError?.message || "Email not found"}`,
        );
      }

      if (emailData.status === "sending" || emailData.status === "sent") {
        throw new Error(
          "This email is already sending or has been sent. Please try again later.",
        );
      }

      // Add scheduled time validation
      if (emailData.scheduled_for) {
        const scheduledTime = new Date(emailData.scheduled_for);
        const now = new Date();
        if (scheduledTime > now) {
          await supabase
            .from("emails")
            .update({
              status: "failed",
              updated_at: new Date().toISOString(),
              error_message: "Email is scheduled for future delivery",
            })
            .eq("id", emailId);

          throw new Error("Email is scheduled for future delivery");
        }
      }

      await supabase
        .from("emails")
        .update({
          status: "sending",
        })
        .eq("id", emailId);

      // Validate required email fields
      if (
        !emailData.from_email ||
        !emailData.from_name ||
        !emailData.from_email_domain
      ) {
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message:
              "Email must have a from email, from name, and from email domain",
          })
          .eq("id", emailId);

        throw new Error(
          "Email must have a from email, from name, and from email domain",
        );
      }

      // Validate that the from_email is not a no-reply address
      if (
        emailData.from_email.toLowerCase().includes("no-reply") ||
        emailData.from_email.toLowerCase().includes("noreply") ||
        emailData.from_email.toLowerCase().includes("no_reply") ||
        (emailData.reply_to &&
          (emailData.reply_to.toLowerCase().includes("no-reply") ||
            emailData.reply_to.toLowerCase().includes("noreply") ||
            emailData.reply_to.toLowerCase().includes("no_reply")))
      ) {
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message:
              "Cannot send emails from or reply to no-reply addresses",
          })
          .eq("id", emailId);

        throw new Error(
          "Cannot send emails from or reply to no-reply addresses",
        );
      }

      // Validate subject
      if (!emailData.subject) {
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: "Email must have a subject",
          })
          .eq("id", emailId);

        throw new Error("Email must have a subject");
      }

      // Step 2: Validate that the email has list_id
      if (!emailData.list_id) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: "Email must have a list to send to",
          })
          .eq("id", emailId);

        throw new Error("Email must have a list_id");
      }

      // Validate list ownership
      const { data: listData, error: listOwnershipError } = await supabase
        .from("pco_lists")
        .select("organization_id")
        .eq("id", emailData.list_id)
        .single();

      if (
        listOwnershipError ||
        !listData ||
        listData.organization_id !== emailData.organization_id
      ) {
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: "The list does not belong to your organization",
          })
          .eq("id", emailId);

        throw new Error("List does not belong to the email's organization");
      }

      // Step 3: Get the PCO list ID from our lists table
      const { data: pcoList, error: pcoListError } = await supabase
        .from("pco_lists")
        .select("pco_list_id, pco_list_category_id")
        .eq("id", emailData.list_id)
        .eq("organization_id", emailData.organization_id)
        .single();

      if (pcoListError || !pcoList) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: `Failed to fetch PCO list data: ${pcoListError?.message || "List not found"}`,
          })
          .eq("id", emailId);

        throw new Error(
          `Failed to fetch PCO list data: ${pcoListError?.message || "List not found"}`,
        );
      }

      if (!pcoList.pco_list_category_id) {
        throw new Error("List does not have a category");
      }

      const { data: pcoListCategory, error: pcoListCategoryError } =
        await supabase
          .from("pco_list_categories")
          .select("id")
          .eq("pco_id", pcoList.pco_list_category_id)
          .single();

      if (pcoListCategoryError) {
        throw new Error(
          `Failed to fetch PCO list category data: ${pcoListCategoryError.message}`,
        );
      }

      // Step 4: Get all members of the list
      const { data: listMembers, error: listMembersError } = await supabase
        .from("pco_list_members")
        .select("pco_person_id")
        .eq("pco_list_id", pcoList.pco_list_id)
        .eq("organization_id", emailData.organization_id);

      if (listMembersError) {
        throw new Error(
          `Failed to fetch list members: ${listMembersError.message}`,
        );
      }

      if (!listMembers || listMembers.length === 0) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: "No members found in the specified list",
          })
          .eq("id", emailId);

        throw new Error("No members found in the specified list");
      }

      // Extract person IDs from list members
      const personIds = listMembers.map((member) => member.pco_person_id);

      // Step 5: Get all emails for these people that are subscribed
      const { data: peopleEmails, error: peopleEmailsError } = await supabase
        .from("people_emails")
        .select(
          `
          id, 
          email, 
          pco_person_id,
          people!people_emails_pco_person_id_fkey(
            first_name,
            last_name
          )
        `,
        )
        .in("pco_person_id", personIds)
        .eq("organization_id", emailData.organization_id)
        .eq("status", "subscribed");

      if (peopleEmailsError) {
        throw new Error(
          `Failed to fetch people emails: ${peopleEmailsError.message}`,
        );
      }

      if (!peopleEmails || peopleEmails.length === 0) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message:
              "No subscribed email addresses found for people in the list",
          })
          .eq("id", emailId);

        throw new Error("No subscribed emails found for people in the list");
      }

      // Step 6: Get all email addresses that have unsubscribed from this audience
      const { data: listCategoryUnsubscribes, error: unsubscribesError } =
        await supabase
          .from("email_list_category_unsubscribes")
          .select("email_address")
          .eq("pco_list_category", pcoListCategory.id)
          .eq("organization_id", emailData.organization_id);

      if (unsubscribesError) {
        throw new Error(
          `Failed to fetch audience unsubscribes: ${unsubscribesError.message}`,
        );
      }

      // Create a set of unsubscribed email addresses for faster lookup
      const unsubscribedEmails = new Set(
        listCategoryUnsubscribes?.map((unsub) =>
          unsub.email_address.toLowerCase(),
        ) || [],
      );

      // Step 7: Filter out unsubscribed emails and no-reply addresses
      const filteredEmails = peopleEmails.filter(
        (emailRecord) =>
          !unsubscribedEmails.has(emailRecord.email.toLowerCase()) &&
          !emailRecord.email.toLowerCase().includes("no-reply") &&
          !emailRecord.email.toLowerCase().includes("noreply") &&
          !emailRecord.email.toLowerCase().includes("no_reply"),
      );

      if (filteredEmails.length === 0) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message:
              "All recipients have unsubscribed from this list category",
          })
          .eq("id", emailId);

        throw new Error(
          "All recipients have unsubscribed from this list category",
        );
      }

      // Step 8: Format recipients for the bulk email queue
      const recipients: Record<
        string,
        { email: string; firstName?: string; lastName?: string }
      > = {};
      filteredEmails.forEach((email: any) => {
        recipients[email.id.toString()] = {
          email: email.email,
          firstName: email.people?.first_name || undefined,
          lastName: email.people?.last_name || undefined,
        };
      });

      // Step 9: Check organization's email usage limits
      const { data: emailUsage, error: emailUsageError } = await supabase
        .from("org_email_usage")
        .select("sends_remaining, sends_used")
        .eq("organization_id", emailData.organization_id)
        .single();

      if (emailUsageError) {
        throw new Error(
          `Failed to fetch email usage: ${emailUsageError.message}`,
        );
      }

      if (!emailUsage) {
        throw new Error("No email usage limits found for this organization");
      }

      const recipientCount = Object.keys(recipients).length;
      if (emailUsage.sends_remaining < recipientCount) {
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: `Email limit exceeded. Required: ${recipientCount}, Remaining: ${emailUsage.sends_remaining}. If this is a one-off exception and the ammount needed is close to your remaininglimit, email support@churchspace.co and we may increase your limit for this month at no extra charge.`,
          })
          .eq("id", emailId);

        throw new Error(
          `Email limit exceeded. Required: ${recipientCount}, Remaining: ${emailUsage.sends_remaining}`,
        );
      }

      // Step 10: Update email status to sending
      await supabase
        .from("emails")
        .update({
          status: "sending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", emailId);

      // Step 11: Send to bulk email queue
      const result = await sendBulkEmails.trigger({
        emailId,
        recipients,
        organizationId: emailData.organization_id,
      });

      return {
        emailId,
        totalRecipients: Object.keys(recipients).length,
        status: "sending",
        result,
      };
    } catch (error) {
      console.error("Error in filter email recipients job:", error);

      // Update email status to failed if not already updated
      await supabase
        .from("emails")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
          error_message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        })
        .eq("id", emailId);

      throw error;
    }
  },
});
