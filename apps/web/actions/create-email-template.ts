"use server";

import type { ActionResponse } from "@/types/action";
import { createEmailTemplate } from "@church-space/supabase/mutations/emails";
import { createClient } from "@church-space/supabase/server";

import { z } from "zod";
import { authActionClient } from "./safe-action";

export interface EmailTemplateResponse {
  id: number;
}

interface EmailTemplate {
  id: number;
  organization_id: string;
  subject: string;
}

export const createEmailTemplateAction = authActionClient
  .schema(
    z.object({
      subject: z.string(),
      organization_id: z.string(),
    }),
  )
  .metadata({
    name: "create-email-template",
  })
  .action(
    async (parsedInput): Promise<ActionResponse<EmailTemplateResponse>> => {
      try {
        const supabase = await createClient();

        const { data, error } = (await createEmailTemplate(
          supabase,
          {
            organization_id: parsedInput.parsedInput.organization_id,
            subject: parsedInput.parsedInput.subject,
          },
          parsedInput.parsedInput.organization_id,
        )) as { data: EmailTemplate[] | null; error: any | null };

        if (error) {
          return {
            success: false,
            error: error.message || "Failed to create email template",
          };
        }

        if (!data || !data[0]) {
          return {
            success: false,
            error: "No data returned from email template creation",
          };
        }

        return {
          success: true,
          data: { id: data[0].id },
        };
      } catch (error) {
        console.error("Error creating email template:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create email template",
        };
      }
    },
  );
