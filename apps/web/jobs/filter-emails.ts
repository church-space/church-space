import "server-only";

import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";
import { sendBulkEmails } from "./send-bulk-emails-queue";

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

      if (!emailData.email_category) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: "Email must have a category to send to",
          })
          .eq("id", emailId);

        throw new Error("Email must have a category to send to");
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
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: "The category does not belong to your organization",
          })
          .eq("id", emailId);

        throw new Error(
          "The category does not belong to the email's organization",
        );
      }

      // Step 3: Get the PCO list ID from our lists table
      const { data: pcoList, error: pcoListError } = await supabase
        .from("pco_lists")
        .select("pco_list_id")
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

      // Step 4: Get all members of the list - with pagination to handle more than 1000 records
      let allListMembers: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMoreRecords = true;

      while (hasMoreRecords) {
        const {
          data: listMembersPage,
          error: listMembersError,
          count,
        } = await supabase
          .from("pco_list_members")
          .select("pco_person_id", { count: "exact" })
          .eq("pco_list_id", pcoList.pco_list_id)
          .eq("organization_id", emailData.organization_id)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (listMembersError) {
          await supabase
            .from("emails")
            .update({
              status: "failed",
              updated_at: new Date().toISOString(),
              error_message: `Failed to fetch list members: ${listMembersError.message}`,
            })
            .eq("id", emailId);
          throw new Error(
            `Failed to fetch list members: ${listMembersError.message}`,
          );
        }

        if (!listMembersPage || listMembersPage.length === 0) {
          // No more records to fetch
          hasMoreRecords = false;
        } else {
          // Add the current page of results to our collection
          allListMembers = [...allListMembers, ...listMembersPage];

          // Check if we've reached the end
          if (
            listMembersPage.length < pageSize ||
            (count && allListMembers.length >= count)
          ) {
            hasMoreRecords = false;
          } else {
            // Move to next page
            page++;
          }
        }
      }

      if (!allListMembers || allListMembers.length === 0) {
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
      const personIds = allListMembers.map((member) => member.pco_person_id);

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
          await supabase
            .from("emails")
            .update({
              status: "failed",
              updated_at: new Date().toISOString(),
              error_message: `Failed to fetch people emails: ${peopleEmailsError.message}`,
            })
            .eq("id", emailId);
          throw new Error(
            `Failed to fetch people emails: ${peopleEmailsError.message}`,
          );
        }

        if (peopleEmails && peopleEmails.length > 0) {
          allPeopleEmails = [...allPeopleEmails, ...peopleEmails];
        }
      }

      if (!allPeopleEmails || allPeopleEmails.length === 0) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: "No email addresses found for people in the list",
          })
          .eq("id", emailId);

        throw new Error("No email addresses found for people in the list");
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
          await supabase
            .from("emails")
            .update({
              status: "failed",
              updated_at: new Date().toISOString(),
              error_message: `Failed to fetch email statuses: ${emailStatusesError.message}`,
            })
            .eq("id", emailId);
          throw new Error(
            `Failed to fetch email statuses: ${emailStatusesError.message}`,
          );
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

      // Step 6: Get all email addresses that have unsubscribed from this audience - with pagination
      let allCategoryUnsubscribes: any[] = [];
      page = 0; // Reset page counter
      hasMoreRecords = true; // Reset hasMoreRecords flag

      while (hasMoreRecords) {
        const {
          data: unsubscribesPage,
          error: unsubscribesError,
          count,
        } = await supabase
          .from("email_category_unsubscribes")
          .select("email_address", { count: "exact" })
          .eq("category_id", emailData.email_category)
          .eq("organization_id", emailData.organization_id)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (unsubscribesError) {
          throw new Error(
            `Failed to fetch audience unsubscribes: ${unsubscribesError.message}`,
          );
        }

        if (!unsubscribesPage || unsubscribesPage.length === 0) {
          // No more records to fetch
          hasMoreRecords = false;
        } else {
          // Add the current page of results to our collection
          allCategoryUnsubscribes = [
            ...allCategoryUnsubscribes,
            ...unsubscribesPage,
          ];

          // Check if we've reached the end
          if (
            unsubscribesPage.length < pageSize ||
            (count && allCategoryUnsubscribes.length >= count)
          ) {
            hasMoreRecords = false;
          } else {
            // Move to next page
            page++;
          }
        }
      }

      // Create a set of unsubscribed email addresses for faster lookup
      const unsubscribedEmails = new Set(
        allCategoryUnsubscribes?.map((unsub) =>
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
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message:
              "All recipients have unsubscribed from this email category",
          })
          .eq("id", emailId);

        throw new Error(
          "All recipients have unsubscribed from this email category",
        );
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
        listName: listData.pco_list_description || "",
        organizationName: emailData.organizations.name || "",
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
