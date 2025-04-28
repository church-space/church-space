import "server-only";

import { runs, task } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";

interface DeleteAutomationPayload {
  automationId: number;
}

export const deleteAutomationTask = task({
  id: "delete-automation",
  retry: {
    maxAttempts: 1,
  },
  run: async (payload: DeleteAutomationPayload, { ctx }) => {
    const supabase = createClient();

    const { data: automationData, error: automationError } = await supabase
      .from("email_automation_members")
      .select("id, trigger_dev_id")
      .eq("automation_id", payload.automationId)
      .eq("status", "in-progress")
      .not("trigger_dev_id", "is", null);

    if (automationError) {
      throw new Error(
        `Error fetching automation members: ${automationError.message}`,
      );
    }

    if (!automationData || automationData.length === 0) {
      console.log(
        `No in-progress runs found for automation ID: ${payload.automationId}`,
      );
      return;
    }

    const uniqueTriggerDevIds = [
      ...new Set(
        automationData
          .map((member) => member.trigger_dev_id)
          .filter((id): id is string => id !== null),
      ),
    ];

    for (const triggerDevId of uniqueTriggerDevIds) {
      try {
        await runs.cancel(triggerDevId);
        console.log(
          `Successfully requested cancellation for run ID: ${triggerDevId}`,
        );
      } catch (error) {
        console.error(`Failed to cancel run ID: ${triggerDevId}`, error);
      }
    }

    const { error: deleteError } = await supabase
      .from("email_automations")
      .delete()
      .eq("id", payload.automationId);

    if (deleteError) {
      throw new Error(`Error deleting automation: ${deleteError.message}`);
    }
  },
});
