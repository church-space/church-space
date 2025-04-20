"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { createEmailCategory } from "@church-space/supabase/mutations/emails";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { PostgrestError } from "@supabase/supabase-js";

export interface EmailCategoryResponse {
  id: number;
}

export const createEmailCategoryAction = authActionClient
  .schema(
    z.object({
      name: z.string(),
      description: z.string().nullable(),
      organization_id: z.string(),
    }),
  )
  .metadata({
    name: "create-email-category",
  })
  .action(
    async (parsedInput): Promise<ActionResponse<EmailCategoryResponse>> => {
      try {
        const supabase = await createClient();

        const { data, error } = await createEmailCategory(supabase, {
          name: parsedInput.parsedInput.name,
          organization_id: parsedInput.parsedInput.organization_id,
          description: parsedInput.parsedInput.description,
        });

        if (error) {
          const pgError = error as PostgrestError;
          return {
            success: false,
            error: pgError.message || "Failed to create email category",
          };
        }

        if (!data || !data[0]) {
          return {
            success: false,
            error: "No data returned from email category creation",
          };
        }

        return {
          success: true,
          data: { id: data[0].id },
        };
      } catch (error) {
        console.error("Error creating email category:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create email category",
        };
      }
    },
  );
