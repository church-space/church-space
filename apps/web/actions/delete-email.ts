"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { deleteEmail } from "@church-space/supabase/mutations/emails";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { PostgrestError } from "@supabase/supabase-js";

export interface EmailResponse {
  id: number;
}

export const deleteEmailAction = authActionClient
  .schema(
    z.object({
      emailId: z.number(),
    }),
  )
  .metadata({
    name: "delete-email",
  })
  .action(async (parsedInput): Promise<ActionResponse<EmailResponse>> => {
    try {
      const supabase = await createClient();

      const { data, error } = await deleteEmail(
        supabase,
        parsedInput.parsedInput.emailId,
      );

      if (error) {
        const pgError = error as PostgrestError;
        return {
          success: false,
          error: pgError.message || "Failed to delete email",
        };
      }

      if (!data || !data[0]) {
        return {
          success: false,
          error: "No data returned from email deletion",
        };
      }

      return {
        success: true,
        data: { id: data[0].id },
      };
    } catch (error) {
      console.error("Error deleting email:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete email",
      };
    }
  });
