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
          subject: z.string().optional(),
          type: z.enum(["standard", "template"]).optional(),
          organization_id: z.string().optional(),
          style: z.record(z.any()).optional(),
          from_name: z.string().nullable().optional(),
          from_email: z.string().nullable().optional(),
          reply_to: z.string().nullable().optional(),
          status: z
            .enum(["sent", "draft", "sending", "scheduled", "failed"])
            .nullable()
            .optional(),
          // Add other fields as needed
        })
        .partial(),
    }),
  )
  .metadata({
    name: "update-email",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      console.log("Starting email update with:", {
        email_id: parsedInput.parsedInput.email_id,
        email_data: parsedInput.parsedInput.email_data,
      });

      const supabase = await createClient();

      // First check if the email exists
      console.log("Checking if email exists...");
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from("emails")
        .select("*")
        .eq("id", parsedInput.parsedInput.email_id)
        .single();

      if (emailCheckError) {
        console.error("Email check error:", emailCheckError);
        return {
          success: false,
          error: `Error checking email: ${emailCheckError.message}`,
        };
      }

      if (!existingEmail) {
        console.error("Email not found");
        return {
          success: false,
          error: "Email not found",
        };
      }

      console.log("Email found, updating...");

      try {
        // Merge the existing email with the updates
        const updatedEmail = {
          ...existingEmail,
          ...parsedInput.parsedInput.email_data,
        };

        const result = await updateEmail(
          supabase,
          parsedInput.parsedInput.email_id,
          updatedEmail,
        );

        // Revalidate the email query tag
        console.log("Email updated successfully, revalidating...");
        try {
          revalidateTag(`email-${parsedInput.parsedInput.email_id}`);
        } catch (revalidateError) {
          console.error("Error revalidating tag:", revalidateError);
          // Continue even if revalidation fails
        }

        console.log("Email update complete:", result);
        return {
          success: true,
          data: result,
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
