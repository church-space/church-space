"use server";

import { z } from "zod";
import { authActionClient } from "./safe-action";
import { runs } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/server";
import { updateEmail } from "@church-space/supabase/mutations/emails";

const input = z.object({
  emailId: z.number(),
});

export const cancelScheduledEmail = authActionClient
  .schema(input)
  .metadata({
    name: "cancel-scheduled-email",
  })
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createClient();

      // Get the email and verify ownership
      const { data: email, error: emailError } = await supabase
        .from("emails")
        .select("*")
        .eq("id", parsedInput.emailId)
        .single();

      console.log(email);

      if (emailError || !email) {
        throw new Error("Email not found");
      }

      if (!email.trigger_dev_schduled_id) {
        throw new Error("No scheduled run found for this email");
      }

      // Cancel the run in Trigger.dev
      await runs.cancel(email.trigger_dev_schduled_id);

      // Update the email status
      await updateEmail(supabase, parsedInput.emailId, {
        status: "draft",
        scheduled_for: null,
        trigger_dev_schduled_id: null,
      });

      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to cancel scheduled email");
    }
  });
