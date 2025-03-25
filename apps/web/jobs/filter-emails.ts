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
        .select("*, organization_id, audience_id, status")
        .eq("id", emailId)
        .single();

      if (emailError || !emailData) {
        throw new Error(
          `Failed to fetch email data: ${emailError?.message || "Email not found"}`,
        );
      }

      // Step 2: Validate that the email has audience_id
      if (!emailData.audience_id) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", emailId);

        throw new Error("Email must have an audience_id");
      }

      // Step 3: Get the PCO list ID from our lists table
      const { data: pcoList, error: pcoListError } = await supabase
        .from("email_audiences")
        .select("pco_list_id")
        .eq("id", emailData.audience_id)
        .eq("organization_id", emailData.organization_id)
        .single();

      if (pcoListError || !pcoList) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", emailId);

        throw new Error(
          `Failed to fetch PCO list data: ${pcoListError?.message || "List not found"}`,
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
          })
          .eq("id", emailId);

        throw new Error("No members found in the specified list");
      }

      // Extract person IDs from list members
      const personIds = listMembers.map((member) => member.pco_person_id);

      // Step 5: Get all emails for these people that are subscribed
      const { data: peopleEmails, error: peopleEmailsError } = await supabase
        .from("people_emails")
        .select("id, email, pco_person_id")
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
          })
          .eq("id", emailId);

        throw new Error("No subscribed emails found for people in the list");
      }

      // Step 6: Get all email addresses that have unsubscribed from this audience
      const { data: audienceUnsubscribes, error: unsubscribesError } =
        await supabase
          .from("email_audience_unsubscribes")
          .select("email_address")
          .eq("audience_id", emailData.audience_id)
          .eq("organization_id", emailData.organization_id);

      if (unsubscribesError) {
        throw new Error(
          `Failed to fetch audience unsubscribes: ${unsubscribesError.message}`,
        );
      }

      // Create a set of unsubscribed email addresses for faster lookup
      const unsubscribedEmails = new Set(
        audienceUnsubscribes?.map((unsub) =>
          unsub.email_address.toLowerCase(),
        ) || [],
      );

      // Step 7: Filter out unsubscribed emails
      const filteredEmails = peopleEmails.filter(
        (emailRecord) =>
          !unsubscribedEmails.has(emailRecord.email.toLowerCase()),
      );

      if (filteredEmails.length === 0) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", emailId);

        throw new Error("All recipients have unsubscribed from this audience");
      }

      // Step 8: Format recipients for the bulk email queue
      const recipients: Record<string, string> = {};
      filteredEmails.forEach((email) => {
        recipients[email.id.toString()] = email.email;
      });

      // Step 9: Update email status to sending
      await supabase
        .from("emails")
        .update({
          status: "sending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", emailId);

      // Step 10: Send to bulk email queue
      const result = await sendBulkEmails.trigger({
        emailId,
        recipients,
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
        })
        .eq("id", emailId);

      throw error;
    }
  },
});
