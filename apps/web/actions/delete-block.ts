"use server";

import { authActionClient } from "@/actions/safe-action";
import { deleteEmailBlock } from "@trivo/supabase/mutations/emails";
import { createClient } from "@trivo/supabase/server";
import { z } from "zod";

export const deleteEmailBlockAction = authActionClient
  .schema(
    z.object({
      blockId: z.number(),
    })
  )
  .metadata({
    name: "delete-email-block",
  })
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createClient();
      const result = await deleteEmailBlock(supabase, parsedInput.blockId);

      if (result.error) {
        console.error("Delete operation failed:", result.error);
        throw result.error;
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Action error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete email block",
      };
    }
  });
