"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { updateEmailAutomationStep } from "@church-space/supabase/mutations/automations";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { EmailAutomationStepResponse } from "./create-email-automation-step";

export const updateEmailAutomationStepAction = authActionClient
  .schema(
    z.object({
      id: z.number(),
      automation_data: z
        .object({
          type: z.string(),
          values: z.any().nullable(),
          order: z.number().nullable(),
          from_email_domain: z.number().nullable(),
          email_template: z.number().nullable(),
          automation_id: z.number(),
          updated_at: z.string().nullable(),
        })
        .partial(),
    }),
  )
  .metadata({
    name: "update-email-automation-step",
  })
  .action(
    async (
      parsedInput,
    ): Promise<ActionResponse<EmailAutomationStepResponse>> => {
      try {
        const supabase = await createClient();

        try {
          const { data, error } = await updateEmailAutomationStep(
            supabase,
            parsedInput.parsedInput.automation_data,
            parsedInput.parsedInput.id,
          );

          if (error) {
            console.error("Error updating email automation step:", error);
            return {
              success: false,
              error: `Failed to update email automation step: ${error.message}`,
            };
          }

          if (!data || !data[0]) {
            return {
              success: false,
              error: "No data returned from email automation step update",
            };
          }

          return {
            success: true,
            data: { id: data[0].id },
          };
        } catch (updateError) {
          console.error("Error in updateEmailAutomationStep:", updateError);
          const errorMessage =
            updateError instanceof Error
              ? updateError.message
              : "Failed to update email automation step";

          return {
            success: false,
            error: errorMessage,
          };
        }
      } catch (error) {
        console.error("Error updating email automation step:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? `Failed to update email automation step: ${error.message}`
              : "Failed to update email automation step due to an unknown error",
        };
      }
    },
  );
