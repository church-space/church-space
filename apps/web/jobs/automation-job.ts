import "server-only";

import { task, wait, batch } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";
import { sendAutomationEmail } from "./send-automation-email";

// Interface for the payload
interface AutomationPayload {
  automationId: number;
  pcoPersonIds: string[]; // Changed from single pcoPersonId to array of IDs
  organizationId: string;
}

// Interface for Automation Step Values
interface WaitStepValues {
  unit: "days" | "hours";
  value: number;
}

interface EmailStepValues {
  fromName: string;
  fromEmail: string;
  subject: string;
}

// Interface for Automation Step
interface AutomationStep {
  id: number;
  type: "wait" | "send_email";
  values: WaitStepValues | EmailStepValues;
  order: number | null;
  from_email_domain: number | null;
  email_template: number | null;
  automation_id: number;
}

interface PersonEmailData {
  pcoPersonId: string;
  internalPersonId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  memberRecordId: number;
}

interface DatabasePerson {
  first_name: string | null;
  last_name: string | null;
}

export const automationJob = task({
  id: "automation-job",
  retry: {
    maxAttempts: 1,
  },
  run: async (payload: AutomationPayload, { ctx }) => {
    const { automationId, pcoPersonIds, organizationId } = payload;
    const supabase = createClient();

    try {
      // Step 1: Fetch the automation details first since it's common for all persons
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

      // Step 2: Fetch the associated email category ID (common for all persons)
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

      // Step 3: Fetch all automation steps once (common for all persons)
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
        return {
          status: "no_steps",
          reason: "Automation has no defined steps.",
        };
      }

      // Step 4: Initialize all person records first
      const personRecords: PersonEmailData[] = [];
      for (const pcoPersonId of pcoPersonIds) {
        try {
          // Fetch the internal Person ID
          const { data: personData, error: personError } = await supabase
            .from("people")
            .select("id")
            .eq("pco_id", pcoPersonId)
            .eq("organization_id", organizationId)
            .single();

          if (personError || !personData) {
            throw new Error(
              `Failed to fetch internal person ID for PCO ID ${pcoPersonId}: ${personError?.message || "Person not found"}`,
            );
          }
          const internalPersonId = personData.id;

          // Create automation member record
          const { data: newMemberData, error: createMemberError } =
            await supabase
              .from("email_automation_members")
              .insert({
                automation_id: automationId,
                person_id: internalPersonId,
                last_completed_step_id: steps[0].id,
                status: "in-progress",
                trigger_dev_id: ctx.run.id,
              })
              .select("id")
              .single();

          if (createMemberError || !newMemberData) {
            throw new Error(
              `Failed to create automation member record: ${createMemberError?.message || "Insert failed"}`,
            );
          }

          // Fetch person's email data
          const { data: personEmailData, error: personEmailError } =
            await supabase
              .from("people_emails")
              .select("id, email, status, people!inner(first_name, last_name)")
              .eq("pco_person_id", pcoPersonId)
              .eq("organization_id", organizationId)
              .eq("status", "subscribed")
              .limit(1)
              .maybeSingle();

          if (personEmailError) {
            throw new Error(
              `Error fetching email: ${personEmailError.message}`,
            );
          }

          if (!personEmailData) {
            await supabase
              .from("email_automation_members")
              .update({
                status: "canceled",
                reason: "Person not subscribed or no email found",
                updated_at: new Date().toISOString(),
              })
              .eq("id", newMemberData.id);
            continue;
          }

          // Check if unsubscribed from category
          const { data: unsubscribeData, error: unsubscribeError } =
            await supabase
              .from("email_category_unsubscribes")
              .select("id")
              .eq("category_id", emailCategoryId)
              .eq("organization_id", organizationId)
              .eq("email_address", personEmailData.email)
              .maybeSingle();

          if (unsubscribeError) {
            throw new Error(
              `Error checking email category unsubscribes for ${personEmailData.email}: ${unsubscribeError.message}`,
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
              .eq("id", newMemberData.id);
            continue;
          }

          const person = personEmailData.people as DatabasePerson;
          personRecords.push({
            pcoPersonId,
            internalPersonId,
            email: personEmailData.email,
            firstName: person?.first_name || undefined,
            lastName: person?.last_name || undefined,
            memberRecordId: newMemberData.id,
          });
        } catch (error) {
          console.error(`Error initializing person ${pcoPersonId}:`, error);
          continue;
        }
      }

      // Step 5: Process steps in sequence, but handle each step in batch
      for (const step of steps) {
        const stepValues = step.values as unknown as
          | WaitStepValues
          | EmailStepValues;
        if (!stepValues) continue;

        if (step.type === "wait") {
          const waitValues = stepValues as WaitStepValues;
          if (!waitValues.unit || !waitValues.value) {
            throw new Error(
              `Invalid wait step configuration for step ID ${step.id}: Missing values.`,
            );
          }

          // Wait for all persons at once
          if (waitValues.unit === "days") {
            await wait.for({ days: waitValues.value });
          } else if (waitValues.unit === "hours") {
            await wait.for({ hours: waitValues.value });
          } else {
            throw new Error(`Unsupported wait unit: ${waitValues.unit}`);
          }

          // Update all member records after wait
          if (personRecords.length > 0) {
            await supabase
              .from("email_automation_members")
              .update({
                last_completed_step_id: step.id,
                updated_at: new Date().toISOString(),
              })
              .in(
                "id",
                personRecords.map((p) => p.memberRecordId),
              );
          }
        } else if (step.type === "send_email") {
          const emailTemplateId = step.email_template;
          if (!emailTemplateId || !step.from_email_domain) {
            throw new Error(
              `Invalid email step configuration for step ID ${step.id}: Missing required fields.`,
            );
          }

          const emailValues = stepValues as EmailStepValues;

          // Prepare email tasks for batch processing
          const emailTasks = personRecords.map((person) => ({
            id: `${automationId}-${step.id}-${person.pcoPersonId}`,
            taskId: sendAutomationEmail.id,
            payload: {
              emailId: emailTemplateId,
              recipient: {
                pcoPersonId: person.pcoPersonId,
                email: person.email,
                firstName: person.firstName,
                lastName: person.lastName,
              },
              organizationId,
              fromEmail: emailValues.fromEmail || "",
              fromEmailDomain: step.from_email_domain,
              fromName: emailValues.fromName || "",
              subject: emailValues.subject || "",
              automationId,
              personId: person.internalPersonId,
              triggerAutomationRunId: ctx.run.id,
            },
          }));

          // Batch trigger all email tasks and wait for completion
          if (emailTasks.length > 0) {
            await batch.triggerAndWait(emailTasks);

            // Update all member records after sending emails
            await supabase
              .from("email_automation_members")
              .update({
                last_completed_step_id: step.id,
                updated_at: new Date().toISOString(),
              })
              .in(
                "id",
                personRecords.map((p) => p.memberRecordId),
              );
          }
        }
      }

      // Mark all automation members as completed
      if (personRecords.length > 0) {
        await supabase
          .from("email_automation_members")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .in(
            "id",
            personRecords.map((p) => p.memberRecordId),
          );
      }

      return {
        status: "completed",
        processedPersons: personRecords.length,
        totalPersons: pcoPersonIds.length,
      };
    } catch (error) {
      console.error(`Error in automation job:`, error);
      throw error;
    }
  },
});
