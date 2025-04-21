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

      // Step 4: Process each person in parallel
      const results = await Promise.all(
        pcoPersonIds.map(async (pcoPersonId) => {
          let currentMemberRecordId: number | null = null;
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
            currentMemberRecordId = newMemberData.id;

            // Process all steps for this person
            for (let i = 0; i < steps.length; i++) {
              const step = steps[i] as AutomationStep;

              if (step.type === "wait") {
                const waitValues = step.values as WaitStepValues;
                if (!waitValues || !waitValues.unit || !waitValues.value) {
                  throw new Error(
                    `Invalid wait step configuration for step ID ${step.id}: Missing values.`,
                  );
                }

                if (waitValues.unit === "days") {
                  await wait.for({ days: waitValues.value });
                } else if (waitValues.unit === "hours") {
                  await wait.for({ hours: waitValues.value });
                } else {
                  throw new Error(`Unsupported wait unit: ${waitValues.unit}`);
                }

                await supabase
                  .from("email_automation_members")
                  .update({
                    last_completed_step_id: step.id,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", currentMemberRecordId);
              } else if (step.type === "send_email") {
                const emailTemplateId = step.email_template;

                if (!emailTemplateId) {
                  throw new Error(
                    `Invalid email step configuration for step ID ${step.id}: Missing email_template ID.`,
                  );
                }

                const { data: personEmailData, error: personEmailError } =
                  await supabase
                    .from("people_emails")
                    .select(
                      "id, email, status, people!inner(first_name, last_name)",
                    )
                    .eq("pco_person_id", pcoPersonId)
                    .eq("organization_id", organizationId)
                    .eq("status", "subscribed")
                    .limit(1)
                    .maybeSingle();

                if (personEmailError) {
                  console.error(
                    `Error fetching email for PCO person ${pcoPersonId}: ${personEmailError.message}`,
                  );
                  await supabase
                    .from("email_automation_members")
                    .update({
                      status: "canceled",
                      reason: `Error fetching email: ${personEmailError.message}`,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", currentMemberRecordId);
                  return {
                    pcoPersonId,
                    status: "canceled",
                    reason: `Error fetching email: ${personEmailError.message}`,
                  };
                }

                if (!personEmailData) {
                  await supabase
                    .from("email_automation_members")
                    .update({
                      status: "canceled",
                      reason: "Person not subscribed or no email found",
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", currentMemberRecordId);
                  return {
                    pcoPersonId,
                    status: "canceled",
                    reason: "Person not subscribed or no email found",
                  };
                }

                const recipientEmail = personEmailData.email;
                const peopleEmailId = personEmailData.id;
                const firstName =
                  personEmailData.people?.first_name || undefined;
                const lastName = personEmailData.people?.last_name || undefined;

                const { data: unsubscribeData, error: unsubscribeError } =
                  await supabase
                    .from("email_category_unsubscribes")
                    .select("id")
                    .eq("email_category_id", emailCategoryId)
                    .eq("organization_id", organizationId)
                    .eq("email_address", recipientEmail)
                    .maybeSingle();

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
                    pcoPersonId,
                    status: "canceled",
                    reason: "Unsubscribed from email category",
                  };
                }

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

                await supabase
                  .from("email_automation_members")
                  .update({
                    last_completed_step_id: step.id,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", currentMemberRecordId);
              }
            }

            // Mark automation as completed for this member
            await supabase
              .from("email_automation_members")
              .update({
                status: "completed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", currentMemberRecordId);

            return {
              pcoPersonId,
              status: "completed",
              processedSteps: steps.length,
            };
          } catch (error) {
            console.error(
              `Error processing automation ${automationId} for PCO person ${pcoPersonId}:`,
              error,
            );

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
            }

            return {
              pcoPersonId,
              status: "failed",
              error:
                error instanceof Error
                  ? error.message
                  : "An unknown error occurred",
            };
          }
        }),
      );

      return {
        status: "completed",
        results,
      };
    } catch (error) {
      console.error(`Error in automation job:`, error);
      throw error;
    }
  },
});
