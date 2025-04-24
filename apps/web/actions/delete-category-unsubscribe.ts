"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { deleteEmailCategoryUnsubscribe } from "@church-space/supabase/mutations/emails";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { PostgrestError } from "@supabase/supabase-js";

export const deleteCategoryUnsubscribeAction = authActionClient
  .schema(
    z.object({
      emailAddress: z.string(),
      organizationId: z.string(),
      categoryId: z.number(),
    }),
  )
  .metadata({
    name: "delete-category-unsubscribe",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();

      const { data, error } = await deleteEmailCategoryUnsubscribe(
        supabase,
        parsedInput.parsedInput.emailAddress,
        parsedInput.parsedInput.organizationId,
        parsedInput.parsedInput.categoryId,
      );

      if (error) {
        const pgError = error as PostgrestError;
        return {
          success: false,
          error: pgError.message || "Failed to delete category unsubscribe",
        };
      }

      if (!data || !data[0]) {
        return {
          success: false,
          error: "No data returned from category unsubscribe deletion",
        };
      }

      return {
        success: true,
        data: { id: data[0].id },
      };
    } catch (error) {
      console.error("Error deleting category unsubscribe:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete category unsubscribe",
      };
    }
  });
