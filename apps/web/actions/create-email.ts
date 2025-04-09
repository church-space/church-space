"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { createEmail } from "@church-space/supabase/mutations/emails";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { revalidateTag } from "next/cache";
import { PostgrestError } from "@supabase/supabase-js";

export interface EmailResponse {
  id: number;
}

export const createEmailAction = authActionClient
  .schema(
    z.object({
      subject: z.string(),
      organization_id: z.string(),
      type: z.enum(["standard", "template"]),
    }),
  )
  .metadata({
    name: "create-email",
  })
  .action(async (parsedInput): Promise<ActionResponse<EmailResponse>> => {
    try {
      const supabase = await createClient();

      const { data, error } = await createEmail(
        supabase,
        {
          subject: parsedInput.parsedInput.subject,
          organization_id: parsedInput.parsedInput.organization_id,
          type: parsedInput.parsedInput.type,
        },
        parsedInput.parsedInput.organization_id,
      );

      if (error) {
        const pgError = error as PostgrestError;
        return {
          success: false,
          error: pgError.message || "Failed to create email",
        };
      }

      if (!data || !data[0]) {
        return {
          success: false,
          error: "No data returned from email creation",
        };
      }

      // Revalidate the emailTemplates query tag
      try {
        revalidateTag(`emails_${parsedInput.parsedInput.organization_id}`);
      } catch (revalidateError) {
        console.error("Error revalidating tag:", revalidateError);
        // Continue even if revalidation fails
      }

      return {
        success: true,
        data: { id: data[0].id },
      };
    } catch (error) {
      console.error("Error creating email:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create email",
      };
    }
  });
