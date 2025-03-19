"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { updateEmail } from "@church-space/supabase/mutations/emails";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { revalidateTag } from "next/cache";

export const updateEmailAction = authActionClient
  .schema(
    z.object({
      email_id: z.number(),
      email_data: z
        .object({
          id: z.number(),
          created_at: z.string(),
          from_email: z.string().nullable(),
          from_name: z.string().nullable(),
          list_id: z.number().nullable(),
          organization_id: z.string(),
          reply_to: z.string().nullable(),
          scheduled_for: z.string().nullable(),
          sent_at: z.string().nullable(),
          status: z.enum(["draft", "scheduled", "sending", "sent", "failed"]),
          style: z.any().nullable(),
          subject: z.string().nullable(),
          trigger_dev_schduled_id: z.string().nullable(),
          type: z.enum(["standard", "template"]),
          updated_at: z.string().nullable(),
          category_id: z.number().nullable(),
        })
        .partial(),
    }),
  )
  .metadata({
    name: "update-email",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();

      try {
        const result = await updateEmail(
          supabase,
          parsedInput.parsedInput.email_id,
          parsedInput.parsedInput.email_data,
        );

        if (result.error) {
          console.error("Error updating email:", result.error);
          return {
            success: false,
            error: `Failed to update email: ${result.error}`,
          };
        }

        try {
          revalidateTag(
            `emails_${parsedInput.parsedInput.email_data.organization_id}`,
          );
          revalidateTag(`email_${parsedInput.parsedInput.email_id}`);
        } catch (revalidateError) {
          console.error("Error revalidating tag:", revalidateError);
          // Continue even if revalidation fails
        }

        return {
          success: true,
        };
      } catch (updateError) {
        console.error("Error in updateEmail:", updateError);
        // Ensure we're returning a proper error message
        const errorMessage =
          updateError instanceof Error
            ? updateError.message
            : "Failed to update email";

        console.error("Returning error message:", errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error("Error updating email:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? `Failed to update email: ${error.message}`
            : "Failed to update email due to an unknown error",
      };
    }
  });
