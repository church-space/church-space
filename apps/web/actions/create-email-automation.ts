"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { createEmailAutomation } from "@church-space/supabase/mutations/automations";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { PostgrestError } from "@supabase/supabase-js";

export interface EmailAutomationResponse {
  id: number;
}

export const createEmailAutomationAction = authActionClient
  .schema(
    z.object({
      name: z.string(),
      organization_id: z.string(),
    }),
  )
  .metadata({
    name: "create-email-automation",
  })
  .action(
    async (parsedInput): Promise<ActionResponse<EmailAutomationResponse>> => {
      try {
        const supabase = await createClient();

        const { data, error } = await createEmailAutomation(supabase, {
          name: parsedInput.parsedInput.name,
          organization_id: parsedInput.parsedInput.organization_id,
          is_active: false,
        });

        if (error) {
          const pgError = error as PostgrestError;
          return {
            success: false,
            error: pgError.message || "Failed to create email automation",
          };
        }

        if (!data || !data[0]) {
          return {
            success: false,
            error: "No data returned from email automation creation",
          };
        }

        return {
          success: true,
          data: { id: data[0].id },
        };
      } catch (error) {
        console.error("Error creating email automation:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create email automation",
        };
      }
    },
  );
