import "server-only";

import { task, wait } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";
import { sendAutomationEmail } from "./send-automation-email";

// Interface for the payload
interface FilterAutomationEmailsPayload {
  automationId: number;
  pcoPersonId: string; // This is the pco_id from the people table
  organizationId: string;
}

// Interface for Automation Step Values
interface WaitStepValues {
  unit: "days" | "hours";
  value: number;
}

interface EmailStepValues {
  fromName: string | null;
  fromEmail: string | null;

  subject: string | null;
}

// Interface for Automation Step
interface AutomationStep {
  id: number;
  type: "wait" | "send_email";
  values: WaitStepValues | EmailStepValues | null;
  order: number | null;
  from_email_domain: number | null;
  email_template: number | null;
  automation_id: number;
}

export const filterAutomationEmails = task({
  id: "filter-automation-emails",
  retry: {
    maxAttempts: 1,
  },
  run: async (payload: FilterAutomationEmailsPayload, { ctx }) => {
    const { automationId, pcoPersonId, organizationId } = payload;
    const supabase = createClient();
    let currentMemberRecordId: number | null = null;

    try {
      // Step 1: Fetch the internal Person ID needed for the members table FK
      const { data: personData, error: personError } = await supabase
        .from("people")
        .select("id") // Select the internal ID
        .eq("pco_id", pcoPersonId) // Query using the provided pcoPersonId
        .eq("organization_id", organizationId)
        .single();

      if (personError || !personData) {
        throw new Error(
          `Failed to fetch internal person ID for PCO ID ${pcoPersonId}: ${personError?.message || "Person not found"}`,
        );
      }
      const internalPersonId = personData.id; // This is the ID for the email_automation_members table

      // Step 2: Fetch the automation details, including the email_category_id
      const { data: automationData, error: automationError } = await supabase
        .from("email_automations")
        .select("id, email_category_id, organization_id")
        .eq("id", automationId)
        .eq("organization_id", organizationId)
        .single();

      if (automationError || !automationData) {
        throw new Error(
          `Failed to fetch automation data for ID ${automationId}: ${automationError?.message || "Automation not found"}`,
        );
      }
      const automationCategoryId = automationData.email_category_id;

      if (!automationCategoryId) {
        throw new Error(
          `Automation ${automationId} does not have an email_category_id configured.`,
        );
      }
      // Step 3: Fetch the associated email category ID
      const { data: emailCategoryData, error: emailCategoryError } =
        await supabase
          .from("email_categories")
          .select("id")
          .eq("id", automationCategoryId)
          .eq("organization_id", organizationId)
          .single();

      if (emailCategoryError || !emailCategoryData) {
        throw new Error(
          `Failed to fetch email category data for category ID ${automationCategoryId}: ${emailCategoryError?.message || "Category not found"}`,
        );
      }

      const emailCategoryId = emailCategoryData.id;
      if (!emailCategoryId) {
        throw new Error(
          `Category ${automationCategoryId} does not have an email_category_id.`,
        );
      }

      // Step 5: Fetch the automation steps, ordered correctly
      const { data: steps, error: stepsError } = await supabase
        .from("email_automation_steps")
        .select("*")
        .eq("automation_id", automationId)
        .order("order", { ascending: true });

      if (stepsError || !steps) {
        throw new Error(
          `Failed to fetch steps for automation ${automationId}: ${stepsError?.message || "Steps query failed"}`,
        );
      }

      if (steps.length === 0) {
        // Consider if we need to create a member record indicating failure/completion immediately
        // For now, just exit gracefully.
        return {
          status: "no_steps",
          reason: "Automation has no defined steps.",
        };
      }

      // Step 6: Create the NEW automation member record (always start fresh)

      const { data: newMemberData, error: createMemberError } = await supabase
        .from("email_automation_members")
        .insert({
          automation_id: automationId,
          person_id: internalPersonId, // Use the fetched internal person ID
          // Set initial last_completed_step_id to the *first* step ID due to NOT NULL constraint.
          // The loop below starts at index 0, processing this first step correctly.
          last_completed_step_id: steps[0].id,
          status: "in-progress",
          trigger_dev_id: ctx.run.id,
        })
        .select("id") // Select only the ID
        .single();

      if (createMemberError || !newMemberData) {
        throw new Error(
          `Failed to create automation member record: ${createMemberError?.message || "Insert failed"}`,
        );
      }
      currentMemberRecordId = newMemberData.id;

      // Step 7: Iterate through ALL steps from the beginning
      const startIndex = 0; // Always start from the first step

      for (let i = startIndex; i < steps.length; i++) {
        const step = steps[i] as AutomationStep;

        if (step.type === "wait") {
          const waitValues = step.values as WaitStepValues;
          if (!waitValues || !waitValues.unit || !waitValues.value) {
            throw new Error(
              `Invalid wait step configuration for step ID ${step.id}: Missing values.`,
            );
          }

          // Use conditional logic instead of computed property for wait.for
          if (waitValues.unit === "days") {
            await wait.for({ days: waitValues.value });
          } else if (waitValues.unit === "hours") {
            await wait.for({ hours: waitValues.value });
          } else {
            // Handle unexpected unit or throw error
            throw new Error(`Unsupported wait unit: ${waitValues.unit}`);
          }

          // Update last completed step ID after wait
          await supabase
            .from("email_automation_members")
            .update({
              last_completed_step_id: step.id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentMemberRecordId);
          // lastCompletedStepId = step.id; // No longer need to track this locally
        } else if (step.type === "send_email") {
          const emailTemplateId = step.email_template;

          if (!emailTemplateId) {
            throw new Error(
              `Invalid email step configuration for step ID ${step.id}: Missing email_template ID.`,
            );
          }

          // a) Fetch the person's email and subscription status using pcoPersonId
          const { data: personEmailData, error: personEmailError } =
            await supabase
              .from("people_emails")
              .select("id, email, status, people!inner(first_name, last_name)")
              .eq("pco_person_id", pcoPersonId) // Use pcoPersonId from payload
              .eq("organization_id", organizationId)
              .eq("status", "subscribed")
              .limit(1)
              .maybeSingle(); // Use maybeSingle as they might not have a subscribed email

          if (personEmailError) {
            // Log the error but treat as not subscribed if error occurs during fetch
            console.error(
              `Error fetching email for PCO person ${pcoPersonId}: ${personEmailError.message}`,
            );
            // Update member record and stop
            await supabase
              .from("email_automation_members")
              .update({
                status: "canceled",
                reason: `Error fetching email: ${personEmailError.message}`,
                updated_at: new Date().toISOString(),
              })
              .eq("id", currentMemberRecordId);
            return {
              status: "canceled",
              reason: `Error fetching email: ${personEmailError.message}`,
            };
          }

          if (!personEmailData) {
            // No subscribed email found

            await supabase
              .from("email_automation_members")
              .update({
                status: "canceled",
                reason: "Person not subscribed or no email found",
                updated_at: new Date().toISOString(),
              })
              .eq("id", currentMemberRecordId);
            return {
              status: "canceled",
              reason: "Person not subscribed or no email found",
            };
          }

          const recipientEmail = personEmailData.email;
          const peopleEmailId = personEmailData.id;
          const firstName = personEmailData.people?.first_name || undefined;
          const lastName = personEmailData.people?.last_name || undefined;

          // b) Check email category unsubscribes
          const { data: unsubscribeData, error: unsubscribeError } =
            await supabase
              .from("email_category_unsubscribes")
              .select("id")
              .eq("email_category_id", emailCategoryId)
              .eq("organization_id", organizationId)
              .eq("email_address", recipientEmail)
              .maybeSingle(); // Check if a record exists

          if (unsubscribeError) {
            throw new Error(
              `Error checking email category unsubscribes for ${recipientEmail}: ${unsubscribeError.message}`,
            );
          }

          if (unsubscribeData) {
            await supabase
              .from("email_automation_members")
              .update({
                status: "canceled",
                reason: "Unsubscribed from email category",
                updated_at: new Date().toISOString(),
              })
              .eq("id", currentMemberRecordId);
            return {
              status: "canceled",
              reason: "Unsubscribed from email category",
            };
          }

          // c) Trigger sendBulkEmails
          const recipients: Record<
            string,
            { email: string; firstName?: string; lastName?: string }
          > = {
            [peopleEmailId.toString()]: {
              email: recipientEmail,
              firstName: firstName,
              lastName: lastName,
            },
          };

          if (!step.from_email_domain) {
            await supabase
              .from("email_automation_members")
              .update({
                status: "canceled",
                reason: "Invalid email step configuration",
                updated_at: new Date().toISOString(),
              })
              .eq("id", currentMemberRecordId);
            throw new Error(
              `Invalid email step configuration for step ID ${step.id}: Missing from_email_domain.`,
            );
          }

          await sendAutomationEmail.trigger({
            emailId: emailTemplateId,
            recipient: {
              pcoPersonId: pcoPersonId,
              email: recipientEmail,
              firstName: firstName,
              lastName: lastName,
            },
            organizationId: organizationId,
            fromEmail: (step.values as EmailStepValues).fromEmail || "",
            fromEmailDomain: step.from_email_domain,
            fromName: (step.values as EmailStepValues).fromName || "",
            subject: (step.values as EmailStepValues).subject || "",
            automationId: automationId,
            personId: internalPersonId,
            triggerAutomationRunId: ctx.run.id,
          });

          // d) Update last completed step ID after successful trigger
          await supabase
            .from("email_automation_members")
            .update({
              last_completed_step_id: step.id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentMemberRecordId);
          // lastCompletedStepId = step.id; // No longer need to track
        } else {
          console.warn(`Unknown step type encountered: ${step.type}`);
        }
      }

      // Step 8: Mark automation as completed for this member

      await supabase
        .from("email_automation_members")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentMemberRecordId);

      return { status: "completed", processedSteps: steps.length };
    } catch (error) {
      console.error(
        `Error processing automation ${automationId} for PCO person ${pcoPersonId}:`,
        error,
      );

      // Update member status to failed if we have an ID
      if (currentMemberRecordId) {
        try {
          await supabase
            .from("email_automation_members")
            .update({
              status: "failed",
              reason:
                error instanceof Error
                  ? error.message
                  : "An unknown error occurred",
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentMemberRecordId);
        } catch (updateError) {
          console.error(
            `Failed to update member ${currentMemberRecordId} status to failed:`,
            updateError,
          );
        }
      } else {
        console.error(
          "Could not update member status to failed as currentMemberRecordId was not established.",
        );
      }

      // Re-throw the error to fail the Trigger.dev run
      throw error;
    }
  },
});
