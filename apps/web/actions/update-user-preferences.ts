"use server";

import type { ActionResponse } from "@/types/action";
import { updateUserPreferences } from "@church-space/supabase/mutations/user";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const updateUserPreferencesAction = authActionClient
  .schema(
    z.object({
      userId: z.string(),
      preferences: z.object({
        productUpdateEmails: z.boolean(),
      }),
    }),
  )
  .metadata({
    name: "update-user",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();
      const data = await updateUserPreferences(
        supabase,
        parsedInput.parsedInput.userId,
        parsedInput.parsedInput.preferences,
      );

      if (!data) {
        return {
          success: false,
          error: "User preferences update failed: no data returned.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error updating user preferences:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update user preferences due to an unknown error";

      return {
        success: false,
        error: `Failed to update user preferences: ${errorMessage}`,
      };
    }
  });
