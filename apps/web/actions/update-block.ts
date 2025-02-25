"use server";

import { authActionClient } from "@/actions/safe-action";
import { updateEmailBlock } from "@trivo/supabase/mutations/emails";
import { createClient } from "@trivo/supabase/server";
import { z } from "zod";

export const updateEmailBlockAction = authActionClient
  .schema(
    z.object({
      blockId: z.number(),
      updates: z.object({
        type: z.enum([
          "cards",
          "button",
          "text",
          "divider",
          "video",
          "file-download",
          "image",
          "spacer",
          "author",
          "list",
        ]),
        value: z.any().optional(),
        order: z.number().nullable().optional(),
        linked_file: z.string().nullable().optional(),
        email_id: z.number(),
      }),
    })
  )
  .metadata({
    name: "update-email-block",
  })
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createClient();
      const result = await updateEmailBlock(
        supabase,
        parsedInput.blockId,
        parsedInput.updates
      );

      if (result.error) {
        console.error("Update operation failed:", result.error);
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
            : "Failed to update email block",
      };
    }
  });
