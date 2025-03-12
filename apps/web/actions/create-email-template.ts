"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { createEmailTemplate } from "@church-space/supabase/mutations/emails";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { getEmailWithFooterAndBlocksQuery } from "@church-space/supabase/queries/all/get-email-with-footer-and-blocks";
import { revalidateTag } from "next/cache";

export const createEmailTemplateAction = authActionClient
  .schema(
    z.object({
      subject: z.string(),
      organization_id: z.string(),
      source_email_id: z.number(),
    }),
  )
  .metadata({
    name: "create-email-template",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      console.log("Starting template creation with:", {
        subject: parsedInput.parsedInput.subject,
        organization_id: parsedInput.parsedInput.organization_id,
        source_email_id: parsedInput.parsedInput.source_email_id,
      });

      const supabase = await createClient();

      // First check if the source email exists
      console.log("Fetching source email...");
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
      console.log("Checking for footer...");
      const { data: footerCheck, error: footerCheckError } = await supabase
        .from("email_footers")
        .select("id")
        .eq("email_id", parsedInput.parsedInput.source_email_id)
        .maybeSingle();

      if (footerCheckError) {
        console.error("Footer check error:", footerCheckError);
      } else {
        console.log(
          "Footer check result:",
          footerCheck ? "Footer found" : "No footer found",
        );
      }

      console.log("Source email found, creating template...");
      console.log(
        "Source email has footer:",
        sourceEmail.email_footers &&
          Array.isArray(sourceEmail.email_footers) &&
          sourceEmail.email_footers.length > 0,
      );
      console.log(
        "Source email has blocks:",
        sourceEmail.email_blocks &&
          Array.isArray(sourceEmail.email_blocks) &&
          sourceEmail.email_blocks.length > 0,
      );

      try {
        const data = await createEmailTemplate(
          supabase,
          parsedInput.parsedInput.subject,
          parsedInput.parsedInput.organization_id,
          parsedInput.parsedInput.source_email_id,
        );

        // Revalidate the emailTemplates query tag
        console.log("Template created successfully, revalidating...");
        try {
          revalidateTag("emailTemplates");
        } catch (revalidateError) {
          console.error("Error revalidating tag:", revalidateError);
          // Continue even if revalidation fails
        }

        if (data) {
          console.log("Template creation complete:", data);
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
