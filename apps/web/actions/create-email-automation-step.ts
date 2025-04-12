"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { createEmailAutomationStep } from "@church-space/supabase/mutations/automations";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { PostgrestError } from "@supabase/supabase-js";

export interface EmailAutomationStepResponse {
  id: number;
}

export const createEmailAutomationStepAction = authActionClient
  .schema(
    z.object({
      type: z.string(),
      values: z.any().nullable(),
      order: z.number().nullable(),
      from_email_domain: z.number().nullable(),
      email_template: z.number().nullable(),
      automation_id: z.number(),
    }),
  )
  .metadata({
    name: "create-email-automation-step",
  })
  .action(
    async (
      parsedInput,
    ): Promise<ActionResponse<EmailAutomationStepResponse>> => {
      try {
        const supabase = await createClient();

        const { data, error } = await createEmailAutomationStep(supabase, {
          type: parsedInput.parsedInput.type,
          values: parsedInput.parsedInput.values,
          order: parsedInput.parsedInput.order,
          from_email_domain: parsedInput.parsedInput.from_email_domain,
          email_template: parsedInput.parsedInput.email_template,
          automation_id: parsedInput.parsedInput.automation_id,
        });

        if (error) {
          const pgError = error as PostgrestError;
          return {
            success: false,
            error: pgError.message || "Failed to create email automation step",
          };
        }

        if (!data || !data[0]) {
          return {
            success: false,
            error: "No data returned from email automation step creation",
          };
        }

        return {
          success: true,
          data: { id: data[0].id },
        };
      } catch (error) {
        console.error("Error creating email automation step:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create email automation step",
        };
      }
    },
  );
