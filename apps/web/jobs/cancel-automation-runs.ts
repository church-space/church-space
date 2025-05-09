import "server-only";

import { runs, task } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";

/** helper: split any array into N‑sized slices */
const chunk = <T>(arr: T[], n: number) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) =>
    arr.slice(i * n, i * n + n),
  );

interface CancelAutomationRunsPayload {
  automationId: number;
  reason: string;
}

export const cancelAutomationRunsTask = task({
  id: "cancel-automation-runs",
  retry: {
    maxAttempts: 1,
  },
  run: async (payload: CancelAutomationRunsPayload, { ctx }) => {
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

    // Get the IDs of the members whose runs were attempted to be canceled
    const memberIdsToUpdate = automationData.map((member) => member.id);

    // Update the status and reason for these members
    if (memberIdsToUpdate.length > 0) {
      // Process in batches of 50 IDs at a time
      for (const idBatch of chunk(memberIdsToUpdate, 50)) {
        const { error: updateError } = await supabase
          .from("email_automation_members")
          .update({
            status: "canceled",
            reason: payload.reason,
          })
          .in("id", idBatch);

        if (updateError) {
          // Log the error but don't throw, as the primary goal (cancelling runs) might have succeeded
          console.error(
            `Failed to update status for members: ${idBatch.join(", ")}`,
            updateError,
          );
        } else {
          console.log(
            `Successfully updated status to 'canceled' for members: ${idBatch.join(", ")}`,
          );
        }
      }
    }
  },
});
