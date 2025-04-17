import "server-only";
import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";
import { wait } from "@trigger.dev/sdk/v3";
import { filterEmailRecipients } from "./filter-emails";

// Interface for the payload
interface ScheduleEmailPayload {
  emailId: number;
}

export const scheduleEmail = task({
  id: "schedule-email",
  run: async (payload: ScheduleEmailPayload, { ctx }) => {
    const { emailId } = payload;
    const supabase = createClient();

    try {
      // Step 1: Get the email details
      const { data: emailData, error: emailError } = await supabase
        .from("emails")
        .select("*, organization_id, scheduled_for, status")
        .eq("id", emailId)
        .single();

      if (emailError || !emailData) {
        throw new Error(
          `Failed to fetch email data: ${emailError?.message || "Email not found"}`,
        );
      }

      // Step 2: Validate that the email has a scheduled_for date
      if (!emailData.scheduled_for) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: "Email must have a scheduled_for date",
          })
          .eq("id", emailId);

        throw new Error("Email must have a scheduled_for date");
      }

      // Step 3: Validate the email status
      if (
        emailData.status === "sent" ||
        emailData.status === "sending" ||
        emailData.status === "draft" ||
        emailData.status === "failed" ||
        emailData.status === null
      ) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: `Email cannot be scheduled with status: ${emailData.status}`,
          })
          .eq("id", emailId);

        throw new Error(
          `Email cannot be scheduled with status: ${emailData.status}`,
        );
      }

      // Step 4: Validate the scheduled date
      const scheduledDate = new Date(emailData.scheduled_for);
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);

      // Check if date is in the past
      if (scheduledDate < now) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message: "Email cannot be scheduled for a date in the past",
          })
          .eq("id", emailId);

        throw new Error("Email cannot be scheduled for a date in the past");
      }

      // Check if date is more than a year in the future
      if (scheduledDate > oneYearFromNow) {
        // Update email status to failed
        await supabase
          .from("emails")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            error_message:
              "Email cannot be scheduled more than a year in the future",
          })
          .eq("id", emailId);

        throw new Error(
          "Email cannot be scheduled more than a year in the future",
        );
      }

      // Step 5: Update the trigger_dev_schduled_id with the current run ID
      await supabase
        .from("emails")
        .update({
          trigger_dev_schduled_id: ctx.run.id,
          updated_at: new Date().toISOString(),
          status: "scheduled",
        })
        .eq("id", emailId);

      // Step 6: Wait until the scheduled date
      await wait.until({ date: scheduledDate, throwIfInThePast: true });

      // Step 7: Trigger the email filtering job
      const result = await filterEmailRecipients.trigger({
        emailId,
      });

      return {
        emailId,
        scheduledDate,
        status: "triggered",
        result,
      };
    } catch (error) {
      console.error("Error in schedule email job:", error);

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
