"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { deleteEmailAutomationStep } from "@church-space/supabase/mutations/automations";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { PostgrestError } from "@supabase/supabase-js";

export interface EmailAutomationResponse {
  id: number;
}

export const deleteEmailAutomationStepAction = authActionClient
  .schema(
    z.object({
      stepId: z.number(),
    }),
  )
  .metadata({
    name: "delete-email-automation-step",
  })
  .action(
    async (parsedInput): Promise<ActionResponse<EmailAutomationResponse>> => {
      try {
        const supabase = await createClient();

        const { data, error } = await deleteEmailAutomationStep(
          supabase,
          parsedInput.parsedInput.stepId,
        );

        if (error) {
          const pgError = error as PostgrestError;
          return {
            success: false,
            error: pgError.message || "Failed to delete email automation step",
          };
        }

        if (!data || !data[0]) {
          return {
            success: false,
            error: "No data returned from email automation step deletion",
          };
        }

        return {
          success: true,
          data: { id: data[0].id },
        };
      } catch (error) {
        console.error("Error deleting email automation step:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete email automation step",
        };
      }
    },
  );
