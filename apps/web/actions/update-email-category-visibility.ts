"use server";

import type { ActionResponse } from "@/types/action";
import { updateEmailCategory } from "@church-space/supabase/mutations/emails";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const updateEmailCategoryVisibilityAction = authActionClient
  .schema(
    z.object({
      emailCategoryId: z.number(),
      isPublic: z.boolean(),
    }),
  )
  .metadata({
    name: "update-email-category-visibility",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();
      const data = await updateEmailCategory(
        supabase,
        parsedInput.parsedInput.emailCategoryId,
        {
          is_public: parsedInput.parsedInput.isPublic,
        },
      );

      if (!data) {
        return {
          success: false,
          error: "Email category update failed: no data returned.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error updating email category:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update email category due to an unknown error";

      return {
        success: false,
        error: `Failed to update email category: ${errorMessage}`,
      };
    }
  });
