"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { createEmailFromEmail } from "@church-space/supabase/mutations/emails";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { revalidateTag } from "next/cache";

export const createEmailTemplateFromEmailAction = authActionClient
  .schema(
    z.object({
      subject: z.string(),
      organization_id: z.string(),
      source_email_id: z.number(),
    }),
  )
  .metadata({
    name: "create-email-template-from-email",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();

      try {
        const data = await createEmailFromEmail(
          supabase,
          parsedInput.parsedInput.subject,
          parsedInput.parsedInput.organization_id,
          parsedInput.parsedInput.source_email_id,
          "template",
        );

        // Revalidate the emailTemplates query tag
        try {
          revalidateTag("emailTemplates");
        } catch (revalidateError) {
          console.error("Error revalidating tag:", revalidateError);
          // Continue even if revalidation fails
        }

        if (data) {
          return {
            success: true,
            data: data,
          };
        } else {
          console.error("No data returned from createEmailFromEmail");
          return {
            success: false,
            error: "Template creation failed: no data returned.",
          };
        }
      } catch (createError) {
        console.error("Error in createEmailFromEmail:", createError);
        const errorMessage =
          createError instanceof Error
            ? createError.message
            : "Failed to create template";

        console.error("Returning error message:", errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error("Error creating email template:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
      });

      if (error instanceof Error) {
        if (error.message.includes("email_footers_email_id_key")) {
          return {
            success: false,
            error:
              "A database constraint occurred during footer handling. Please try again.",
          };
        }

        return {
          success: false,
          error: `Failed to create template: ${error.message}`,
        };
      }

      return {
        success: false,
        error: "Failed to create template due to an unknown error",
      };
    }
  });
