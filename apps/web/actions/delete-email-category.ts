"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { deleteEmailCategory } from "@church-space/supabase/mutations/emails";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { PostgrestError } from "@supabase/supabase-js";
import { getAutomationsInCategory } from "@church-space/supabase/queries/all/get-automations-in-category";
import { getScheduledEmailsInCategory } from "@church-space/supabase/queries/all/get-scheduled-emails-in-category";

export interface EmailCategoryResponse {
  id?: number;
  automationsInCategory?: {
    id: number;
    name: string;
  }[];
  scheduledEmailsInCategory?: {
    id: number;
    subject: string | null;
  }[];
}

export const deleteEmailCategoryAction = authActionClient
  .schema(
    z.object({
      emailCategoryId: z.number(),
    }),
  )
  .metadata({
    name: "delete-email-category",
  })
  .action(
    async (parsedInput): Promise<ActionResponse<EmailCategoryResponse>> => {
      try {
        const supabase = await createClient();

        const {
          data: automationsInCategory,
          error: automationsInCategoryError,
        } = await getAutomationsInCategory(
          supabase,
          parsedInput.parsedInput.emailCategoryId,
        );

        if (automationsInCategoryError) {
          throw automationsInCategoryError;
        }

        const {
          data: scheduledEmailsInCategory,
          error: scheduledEmailsInCategoryError,
        } = await getScheduledEmailsInCategory(
          supabase,
          parsedInput.parsedInput.emailCategoryId,
        );

        if (scheduledEmailsInCategoryError) {
          throw scheduledEmailsInCategoryError;
        }

        if (automationsInCategory.length > 0) {
          return {
            success: false,
            error: "Email category is associated with active automations",
            data: {
              automationsInCategory,
            },
          };
        }

        if (scheduledEmailsInCategory.length > 0) {
          return {
            success: false,
            error: "Email category is associated with scheduled emails",
            data: {
              scheduledEmailsInCategory,
            },
          };
        }

        const { data, error } = await deleteEmailCategory(
          supabase,
          parsedInput.parsedInput.emailCategoryId,
        );

        if (error) {
          const pgError = error as PostgrestError;
          return {
            success: false,
            error: pgError.message || "Failed to delete email category",
          };
        }

        if (!data || !data[0]) {
          return {
            success: false,
            error: "No data returned from email category deletion",
          };
        }

        return {
          success: true,
          data: { id: data[0].id },
        };
      } catch (error) {
        console.error("Error deleting email category:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete email category",
        };
      }
    },
  );
