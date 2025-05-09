"use server";

import type { ActionResponse } from "@/types/action";
import { updateEmailStatus } from "@church-space/supabase/mutations/emails";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const updatePersonSubscriptionStatusAction = authActionClient
  .schema(
    z.object({
      emailAddress: z.string(),
      organizationId: z.string(),
      status: z.enum(["unsubscribed", "pco_blocked", "subscribed", "cleaned"]),
      protectedFromCleaning: z.boolean().optional(),
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
        parsedInput.parsedInput.emailAddress,
        parsedInput.parsedInput.organizationId,
        parsedInput.parsedInput.status,
        parsedInput.parsedInput.protectedFromCleaning,
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
