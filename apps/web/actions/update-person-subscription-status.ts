"use server";

import type { ActionResponse } from "@/types/action";
import { updateEmailStatus } from "@church-space/supabase/mutations/emails";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const updatePersonSubscriptionStatusAction = authActionClient
  .schema(
    z.object({
      emailId: z.number(),
      status: z.enum(["unsubscribed", "pco_blocked", "subscribed", "cleaned"]),
    }),
  )
  .metadata({
    name: "update-person-subscription-status",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();
      const data = await updateEmailStatus(
        supabase,
        parsedInput.parsedInput.emailId,
        parsedInput.parsedInput.status,
      );

      if (!data) {
        return {
          success: false,
          error: "Email status update failed: no data returned.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error updating email status:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update email status due to an unknown error";

      return {
        success: false,
        error: `Failed to update email status: ${errorMessage}`,
      };
    }
  });
