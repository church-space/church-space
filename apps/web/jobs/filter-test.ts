import "server-only";

import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";
// import { sendBulkEmails } from "./send-bulk-emails-queue";

/** helper: split any array into N‑sized slices */
const chunk = <T>(arr: T[], n: number) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) =>
    arr.slice(i * n, i * n + n),
  );

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
        .select(
          `
          *,
          organizations!inner (
            name
          )
        `,
        )
        .eq("id", emailId)
        .single();

      if (emailError || !emailData) {
        throw new Error(
          `Failed to fetch email data: ${emailError?.message || "Email not found"}`,
        );
      }

      // Remove the check for already sent emails
      // if (emailData.status === "sending" || emailData.status === "sent") {
      //   throw new Error(
      //     "This email is already sending or has been sent. Please try again later.",
      //   );
      // }

      // Add scheduled time validation
      if (emailData.scheduled_for) {
        const scheduledTime = new Date(emailData.scheduled_for);
        const now = new Date();
        if (scheduledTime > now) {
          console.log("Email is scheduled for future delivery");
          return {
            status: "skipped",
            reason: "Email is scheduled for future delivery",
          };
        }
      }

      // Validate required email fields
      if (
        !emailData.from_email ||
        !emailData.from_name ||
        !emailData.from_email_domain
      ) {
        console.log(
          "Email must have a from email, from name, and from email domain",
        );
        return { status: "skipped", reason: "Missing required email fields" };
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
        console.log("Cannot send emails from or reply to no-reply addresses");
        return {
          status: "skipped",
          reason: "Invalid from/reply-to email address",
        };
      }

      // Validate subject
      if (!emailData.subject) {
        console.log("Email must have a subject");
        return { status: "skipped", reason: "Missing subject" };
      }

      // Step 2: Validate that the email has list_id
      if (!emailData.list_id) {
        console.log("Email must have a list to send to");
        return { status: "skipped", reason: "Missing list_id" };
      }

      if (!emailData.email_category) {
        console.log("Email must have a category to send to");
        return { status: "skipped", reason: "Missing email_category" };
      }

      // Validate list ownership
      const { data: listData, error: listOwnershipError } = await supabase
        .from("pco_lists")
        .select("organization_id, pco_list_description")
        .eq("id", emailData.list_id)
        .single();

      if (
        listOwnershipError ||
        !listData ||
        listData.organization_id !== emailData.organization_id
      ) {
        console.log("The list does not belong to your organization");
        return { status: "skipped", reason: "Invalid list ownership" };
      }

      // Validate category ownership
      const { data: categoryData, error: categoryOwnershipError } =
        await supabase
          .from("email_categories")
          .select("organization_id")
          .eq("id", emailData.email_category)
          .single();

      if (
        categoryOwnershipError ||
        !categoryData ||
        categoryData.organization_id !== emailData.organization_id
      ) {
        console.log("The category does not belong to your organization");
        return { status: "skipped", reason: "Invalid category ownership" };
      }

      // Step 3: Get the PCO list ID from our lists table
      const { data: pcoList, error: pcoListError } = await supabase
        .from("pco_lists")
        .select("pco_list_id")
        .eq("id", emailData.list_id)
        .eq("organization_id", emailData.organization_id)
        .single();

      if (pcoListError || !pcoList) {
        console.log(
          `Failed to fetch PCO list data: ${pcoListError?.message || "List not found"}`,
        );
        return { status: "skipped", reason: "PCO list not found" };
      }

      // Step 4: Get all members of the list
      const { data: listMembers, error: listMembersError } = await supabase
        .from("pco_list_members")
        .select("pco_person_id")
        .eq("pco_list_id", pcoList.pco_list_id)
        .eq("organization_id", emailData.organization_id);

      if (listMembersError) {
        console.log(
          `Failed to fetch list members: ${listMembersError.message}`,
        );
        return { status: "skipped", reason: "Failed to fetch list members" };
      }

      if (!listMembers || listMembers.length === 0) {
        console.log("No members found in the specified list");
        return { status: "skipped", reason: "No list members found" };
      }

      // Extract person IDs from list members
      const personIds = listMembers.map((member) => member.pco_person_id);

      // Step 5: Get all emails for these people
      let allPeopleEmails: any[] = [];

      // Process in batches of 50 IDs at a time
      for (const personIdBatch of chunk(personIds, 50)) {
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
          .in("pco_person_id", personIdBatch)
          .eq("organization_id", emailData.organization_id);

        if (peopleEmailsError) {
          console.log(
            `Failed to fetch people emails: ${peopleEmailsError.message}`,
          );
          return { status: "skipped", reason: "Failed to fetch people emails" };
        }

        if (peopleEmails && peopleEmails.length > 0) {
          allPeopleEmails = [...allPeopleEmails, ...peopleEmails];
        }
      }

      if (!allPeopleEmails || allPeopleEmails.length === 0) {
        console.log("No email addresses found for people in the list");
        return { status: "skipped", reason: "No email addresses found" };
      }

      // Extract unique email addresses to check statuses
      const emailAddressesToCheck = Array.from(
        new Set(allPeopleEmails.map((pe) => pe.email)),
      );

      // Step 5.1: Get subscribed statuses for these email addresses
      let allEmailStatuses: any[] = [];

      // Process in batches of 50 email addresses at a time
      for (const emailBatch of chunk(emailAddressesToCheck, 50)) {
        const { data: emailStatuses, error: emailStatusesError } =
          await supabase
            .from("people_email_statuses")
            .select("email_address")
            .eq("organization_id", emailData.organization_id)
            .in("email_address", emailBatch)
            .eq("status", "subscribed");

        if (emailStatusesError) {
          console.log(
            `Failed to fetch email statuses: ${emailStatusesError.message}`,
          );
          return {
            status: "skipped",
            reason: "Failed to fetch email statuses",
          };
        }

        if (emailStatuses && emailStatuses.length > 0) {
          allEmailStatuses = [...allEmailStatuses, ...emailStatuses];
        }
      }

      // Create a set of subscribed email addresses for efficient lookup
      const subscribedEmailAddresses = new Set(
        allEmailStatuses?.map((status) => status.email_address) || [],
      );

      // Filter peopleEmails based on subscribed status
      const subscribedPeopleEmails = allPeopleEmails.filter((pe) =>
        subscribedEmailAddresses.has(pe.email),
      );

      if (subscribedPeopleEmails.length === 0) {
        console.log(
          "No subscribed email addresses found for people in the list",
        );
        return { status: "skipped", reason: "No subscribed emails found" };
      }

      // Step 6: Get all email addresses that have unsubscribed from this audience
      const { data: categoryUnsubscribes, error: unsubscribesError } =
        await supabase
          .from("email_category_unsubscribes")
          .select("email_address")
          .eq("category_id", emailData.email_category)
          .eq("organization_id", emailData.organization_id);

      if (unsubscribesError) {
        console.log(
          `Failed to fetch audience unsubscribes: ${unsubscribesError.message}`,
        );
        return { status: "skipped", reason: "Failed to fetch unsubscribes" };
      }

      // Create a set of unsubscribed email addresses for faster lookup
      const unsubscribedEmails = new Set(
        categoryUnsubscribes?.map((unsub) =>
          unsub.email_address.toLowerCase(),
        ) || [],
      );

      // Step 7: Filter out unsubscribed emails and no-reply addresses
      const filteredEmails = subscribedPeopleEmails.filter(
        (emailRecord) =>
          !unsubscribedEmails.has(emailRecord.email.toLowerCase()) &&
          !emailRecord.email.toLowerCase().includes("no-reply") &&
          !emailRecord.email.toLowerCase().includes("noreply") &&
          !emailRecord.email.toLowerCase().includes("no_reply"),
      );

      // Deduplicate by email address (case-insensitive)
      const uniqueEmails = new Set<string>();
      const dedupedEmails = filteredEmails.filter((email: any) => {
        const lower = email.email.toLowerCase();
        if (uniqueEmails.has(lower)) return false;
        uniqueEmails.add(lower);
        return true;
      });

      if (dedupedEmails.length === 0) {
        console.log(
          "All recipients have unsubscribed from this email category",
        );
        return { status: "skipped", reason: "All recipients unsubscribed" };
      }

      // Step 8: Format recipients for the bulk email queue
      const recipients: Record<
        string,
        { email: string; firstName?: string; lastName?: string }
      > = {};
      dedupedEmails.forEach((email: any) => {
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
        console.log(`Failed to fetch email usage: ${emailUsageError.message}`);
        return { status: "skipped", reason: "Failed to fetch email usage" };
      }

      if (!emailUsage) {
        console.log("No email usage limits found for this organization");
        return { status: "skipped", reason: "No email usage limits found" };
      }

      const recipientCount = Object.keys(recipients).length;
      if (emailUsage.sends_remaining < recipientCount) {
        console.log(
          `Email limit exceeded. Required: ${recipientCount}, Remaining: ${emailUsage.sends_remaining}`,
        );
        return { status: "skipped", reason: "Email limit exceeded" };
      }

      // Log recipients instead of sending emails
      console.log("Recipients that would receive the email:");
      console.log(JSON.stringify(recipients, null, 2));
      console.log(`Total recipients: ${Object.keys(recipients).length}`);

      return {
        emailId,
        totalRecipients: Object.keys(recipients).length,
        status: "preview_only",
        recipients,
      };
    } catch (error) {
      console.error("Error in filter email recipients job:", error);
      return {
        status: "error",
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  },
});
