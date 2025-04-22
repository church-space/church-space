import "server-only";

import { task, wait } from "@trigger.dev/sdk/v3";
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

// Interface for recipient data
interface RecipientData {
  pcoPersonId: string;
  internalPersonId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  memberRecordId: number;
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

      // Step 4: Create automation member records for all people
      const recipients: RecipientData[] = [];
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
            console.error(
              `Failed to fetch internal person ID for PCO ID ${pcoPersonId}: ${personError?.message || "Person not found"}`,
            );
            continue;
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
            console.error(
              `Failed to create automation member record for PCO ID ${pcoPersonId}: ${createMemberError?.message || "Insert failed"}`,
            );
            continue;
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

          if (personEmailError || !personEmailData) {
            console.error(
              `Error fetching email for PCO person ${pcoPersonId}: ${personEmailError?.message || "No email found"}`,
            );
            continue;
          }

          recipients.push({
            pcoPersonId,
            internalPersonId,
            email: personEmailData.email,
            firstName: personEmailData.people?.first_name || undefined,
            lastName: personEmailData.people?.last_name || undefined,
            memberRecordId: newMemberData.id,
          });
        } catch (error) {
          console.error(`Error processing person ${pcoPersonId}:`, error);
        }
      }

      if (recipients.length === 0) {
        return {
          status: "no_recipients",
          reason: "No valid recipients found for automation.",
        };
      }

      // Step 5: Process all steps for all recipients together
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i] as AutomationStep;

        if (step.type === "wait") {
          const waitValues = step.values as WaitStepValues;
          if (!waitValues || !waitValues.unit || !waitValues.value) {
            throw new Error(
              `Invalid wait step configuration for step ID ${step.id}: Missing values.`,
            );
          }

          // Wait for all recipients together
          if (waitValues.unit === "days") {
            await wait.for({ days: waitValues.value });
          } else if (waitValues.unit === "hours") {
            await wait.for({ hours: waitValues.value });
          } else {
            throw new Error(`Unsupported wait unit: ${waitValues.unit}`);
          }

          // Update all member records after wait
          await supabase
            .from("email_automation_members")
            .update({
              last_completed_step_id: step.id,
              updated_at: new Date().toISOString(),
            })
            .in(
              "id",
              recipients.map((r) => r.memberRecordId),
            );
        } else if (step.type === "send_email") {
          const emailTemplateId = step.email_template;
          if (!emailTemplateId) {
            throw new Error(
              `Invalid email step configuration for step ID ${step.id}: Missing email_template ID.`,
            );
          }

          // Process recipients in batches of 100 for email sending
          const batchSize = 100;
          for (let j = 0; j < recipients.length; j += batchSize) {
            const batch = recipients.slice(j, j + batchSize);

            // Check unsubscribes for the batch
            const validRecipients = await Promise.all(
              batch.map(async (recipient) => {
                const { data: unsubscribeData, error: unsubscribeError } =
                  await supabase
                    .from("email_category_unsubscribes")
                    .select("id")
                    .eq("email_category_id", emailCategoryId)
                    .eq("organization_id", organizationId)
                    .eq("email_address", recipient.email)
                    .maybeSingle();

                if (unsubscribeError) {
                  console.error(
                    `Error checking unsubscribes for ${recipient.email}: ${unsubscribeError.message}`,
                  );
                  return null;
                }

                if (unsubscribeData) {
                  await supabase
                    .from("email_automation_members")
                    .update({
                      status: "canceled",
                      reason: "Unsubscribed from email category",
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", recipient.memberRecordId);
                  return null;
                }

                return recipient;
              }),
            );

            // Filter out null values and unsubscribed recipients
            const filteredRecipients = validRecipients.filter(
              (r): r is RecipientData => r !== null,
            );

            // Send emails to valid recipients
            await Promise.all(
              filteredRecipients.map((recipient) =>
                sendAutomationEmail.trigger({
                  emailId: emailTemplateId,
                  recipient: {
                    pcoPersonId: recipient.pcoPersonId,
                    email: recipient.email,
                    firstName: recipient.firstName,
                    lastName: recipient.lastName,
                  },
                  organizationId: organizationId,
                  fromEmail: (step.values as EmailStepValues).fromEmail || "",
                  fromEmailDomain: step.from_email_domain!,
                  fromName: (step.values as EmailStepValues).fromName || "",
                  subject: (step.values as EmailStepValues).subject || "",
                  automationId: automationId,
                  personId: recipient.internalPersonId,
                  triggerAutomationRunId: ctx.run.id,
                }),
              ),
            );

            // Update member records for this batch
            await supabase
              .from("email_automation_members")
              .update({
                last_completed_step_id: step.id,
                updated_at: new Date().toISOString(),
              })
              .in(
                "id",
                filteredRecipients.map((r) => r.memberRecordId),
              );
          }
        }
      }

      // Mark all remaining automation members as completed
      await supabase
        .from("email_automation_members")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .in(
          "id",
          recipients.map((r) => r.memberRecordId),
        )
        .eq("status", "in-progress");

      return {
        status: "completed",
        processedRecipients: recipients.length,
        processedSteps: steps.length,
      };
    } catch (error) {
      console.error(`Error in automation job:`, error);
      throw error;
    }
  },
});
