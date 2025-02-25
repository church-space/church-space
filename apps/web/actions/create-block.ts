"use server";

import { authActionClient } from "@/actions/safe-action";
import { insertEmailBlock } from "@trivo/supabase/mutations/emails";
import { createClient } from "@trivo/supabase/server";
import { z } from "zod";

export const createEmailBlockAction = authActionClient
  .schema(
    z.object({
      blockId: z.number(),
      data: z.object({
        type: z.enum([
          "cards",
          "button",
          "text",
          "divider",
          "video",
          "file-download",
          "image",
          "spacer",
          "list",
          "author",
        ]),
        value: z.any().optional(),
        order: z.number().nullable().optional(),
        linked_file: z.string().nullable().optional(),
        email_id: z.number(),
      }),
    })
  )
  .metadata({
    name: "create-email-block",
  })
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createClient();
      const result = await insertEmailBlock(supabase, parsedInput.data);

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
            : "Failed to create email block",
      };
    }
  });
