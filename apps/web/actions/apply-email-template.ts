"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { applyEmailTemplate } from "@church-space/supabase/mutations/emails";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { getEmailWithFooterAndBlocksQuery } from "@church-space/supabase/queries/all/get-email-with-footer-and-blocks";
import { revalidateTag } from "next/cache";

export const applyEmailTemplateAction = authActionClient
  .schema(
    z.object({
      target_email_id: z.number(),
      template_email_id: z.number(),
      style_only: z.boolean(),
    }),
  )
  .metadata({
    name: "apply-email-template",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();

      // First check if the template email exists
      const { data: templateEmail, error: templateError } =
        await getEmailWithFooterAndBlocksQuery(
          supabase,
          parsedInput.parsedInput.template_email_id,
        );

      if (templateError) {
        console.error("Template email fetch error:", templateError);
        return {
          success: false,
          error: `Error fetching template email: ${templateError.message}`,
        };
      }

      if (!templateEmail) {
        console.error("Template email not found");
        return {
          success: false,
          error: "Template email not found",
        };
      }

      try {
        const result = await applyEmailTemplate(
          supabase,
          parsedInput.parsedInput.target_email_id,
          parsedInput.parsedInput.template_email_id,
          parsedInput.parsedInput.style_only,
        );

        // Revalidate the email query tag

        try {
          // Revalidate both the email and emailTemplates tags
          revalidateTag(`email-${parsedInput.parsedInput.target_email_id}`);
          revalidateTag("emailTemplates");
        } catch (revalidateError) {
          console.error("Error revalidating tag:", revalidateError);
          // Continue even if revalidation fails
        }

        return {
          success: true,
          data: result,
        };
      } catch (applyError) {
        console.error("Error in applyEmailTemplate:", applyError);
        // Ensure we're returning a proper error message
        const errorMessage =
          applyError instanceof Error
            ? applyError.message
            : "Failed to apply template";

        console.error("Returning error message:", errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error("Error applying email template:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? `Failed to apply template: ${error.message}`
            : "Failed to apply template due to an unknown error",
      };
    }
  });
