"use server";

import type { ActionResponse } from "@/types/action";
import { updateUser } from "@church-space/supabase/mutations/user";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const updateUserAction = authActionClient
  .schema(
    z.object({
      userId: z.string(),
      firstName: z.string(),
      lastName: z.string(),
    }),
  )
  .metadata({
    name: "update-user",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();
      const data = await updateUser(supabase, {
        userId: parsedInput.parsedInput.userId,
        firstName: parsedInput.parsedInput.firstName,
        lastName: parsedInput.parsedInput.lastName,
      });

      if (!data) {
        return {
          success: false,
          error: "User update failed: no data returned.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error updating user:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update user due to an unknown error";

      return {
        success: false,
        error: `Failed to update user: ${errorMessage}`,
      };
    }
  });
