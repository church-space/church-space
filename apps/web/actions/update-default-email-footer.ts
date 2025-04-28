"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { updateDefaultEmailFooter } from "@church-space/supabase/mutations/emails";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { revalidateTag } from "next/cache";

export const updateDefaultEmailFooterAction = authActionClient
  .schema(
    z.object({
      organization_id: z.string(),
      footer_data: z
        .object({
          id: z.number(),
          created_at: z.string(),
          name: z.string().nullable(),
          subtitle: z.string().nullable(),
          logo: z.string().nullable(),
          links: z
            .array(
              z.object({
                icon: z.string(),
                url: z.string(),
                order: z.number(),
              }),
            )
            .nullable(),
          organization_id: z.string(),
          socials_style: z.enum(["filled", "outline", "icon-only"]),
          socials_color: z.string().nullable(),
          socials_icon_color: z.string().nullable(),
        })
        .partial(),
    }),
  )
  .metadata({
    name: "update-default-email-footer",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();

      try {
        const result = await updateDefaultEmailFooter(
          supabase,
          parsedInput.parsedInput.organization_id,
          parsedInput.parsedInput.footer_data,
        );

        if (result.error) {
          console.error("Error updating default email footer:", result.error);
          return {
            success: false,
            error: `Failed to update default email footer: ${result.error}`,
          };
        }

        revalidateTag(`emails_${parsedInput.parsedInput.organization_id}`);

        return {
          success: true,
        };
      } catch (updateError) {
        console.error("Error in updateDefaultEmailFooter:", updateError);
        // Ensure we're returning a proper error message
        const errorMessage =
          updateError instanceof Error
            ? updateError.message
            : "Failed to update default email footer";

        console.error("Returning error message:", errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error("Error updating default email footer:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? `Failed to update default email footer: ${error.message}`
            : "Failed to update email due to an unknown error",
      };
    }
  });
