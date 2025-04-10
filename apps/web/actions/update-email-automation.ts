"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { updateEmailAutomation } from "@church-space/supabase/mutations/automations";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";

export const updateEmailAutomationAction = authActionClient
  .schema(
    z.object({
      automation_id: z.number(),
      automation_data: z
        .object({
          id: z.number(),
          created_at: z.string(),
          name: z.string(),
          trigger_type: z.string().nullable(),
          pco_list_id: z.string().nullable(),
          notify_admin: z.any().nullable(),
          wait: z.any().nullable(),
          email_details: z.any().nullable(),
          list_id: z.number().nullable(),
          description: z.string().nullable(),
          organization_id: z.string(),
          is_active: z.boolean(),
        })
        .partial(),
    }),
  )
  .metadata({
    name: "update-email-automation",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();

      try {
        const result = await updateEmailAutomation(
          supabase,
          parsedInput.parsedInput.automation_data,
        );

        if (result.error) {
          console.error("Error updating email automation:", result.error);
          return {
            success: false,
            error: `Failed to update email automation: ${result.error}`,
          };
        }

        return {
          success: true,
        };
      } catch (updateError) {
        console.error("Error in updateEmailAutomation:", updateError);
        // Ensure we're returning a proper error message
        const errorMessage =
          updateError instanceof Error
            ? updateError.message
            : "Failed to update email automation";

        console.error("Returning error message:", errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error("Error updating email automation:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? `Failed to update email automation: ${error.message}`
            : "Failed to update email automation due to an unknown error",
      };
    }
  });
