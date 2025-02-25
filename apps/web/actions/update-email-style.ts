"use server";

import { authActionClient } from "@/actions/safe-action";
import { updateEmailStyle } from "@trivo/supabase/mutations/emails";
import { createClient } from "@trivo/supabase/server";
import { z } from "zod";

export const updateEmailStyleAction = authActionClient
  .schema(
    z.object({
      emailId: z.number(),
      updates: z.object({
        blocks_bg_color: z.string().optional(),
        bg_color: z.string().optional(),
        default_text_color: z.string().optional(),
        default_font: z.string().optional(),
        is_inset: z.boolean().optional(),
        footer_bg_color: z.string().optional(),
        footer_font: z.string().optional(),
        footer_text_color: z.string().optional(),
      }),
    })
  )
  .metadata({
    name: "update-email-style",
  })
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createClient();
      const result = await updateEmailStyle(
        supabase,
        parsedInput.emailId,
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
            : "Failed to update email style",
      };
    }
  });
