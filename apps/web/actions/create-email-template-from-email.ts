"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { createEmailTemplateFromEmail } from "@church-space/supabase/mutations/emails";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { getEmailWithFooterAndBlocksQuery } from "@church-space/supabase/queries/all/get-email-with-footer-and-blocks";
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

      // First check if the source email exists
      const { data: sourceEmail, error: sourceError } =
        await getEmailWithFooterAndBlocksQuery(
          supabase,
          parsedInput.parsedInput.source_email_id,
        );

      if (sourceError) {
        console.error("Source email fetch error:", sourceError);
        return {
          success: false,
          error: `Error fetching source email: ${sourceError.message}`,
        };
      }

      if (!sourceEmail) {
        console.error("Source email not found");
        return {
          success: false,
          error: "Source email not found",
        };
      }

      // Check if the footer exists directly
      const { data: footerCheck, error: footerCheckError } = await supabase
        .from("email_footers")
        .select("id")
        .eq("email_id", parsedInput.parsedInput.source_email_id)
        .maybeSingle();

      if (footerCheckError) {
        console.error("Footer check error:", footerCheckError);
      }

      try {
        const data = await createEmailTemplateFromEmail(
          supabase,
          parsedInput.parsedInput.subject,
          parsedInput.parsedInput.organization_id,
          parsedInput.parsedInput.source_email_id,
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
          console.error("No data returned from createEmailTemplate");
          return {
            success: false,
            error: "Template creation failed: no data returned.",
          };
        }
      } catch (createError) {
        console.error("Error in createEmailTemplate:", createError);
        // Ensure we're returning a proper error message
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

      // Check for specific database constraint errors
      if (error instanceof Error) {
        if (error.message.includes("email_footers_email_id_key")) {
          return {
            success: false,
            error:
              "A footer is already associated with this email. Please try again.",
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
