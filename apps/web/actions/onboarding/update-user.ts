"use server";

import { authActionClient } from "../safe-action";
import { updateUser } from "@trivo/supabase/mutations/platform";
import { createClient } from "@trivo/supabase/server";
import { z } from "zod";

export const updateUserOnboardingAction = authActionClient
  .schema(
    z.object({
      first_name: z.string(),
      last_name: z.string(),
    })
  )
  .metadata({
    name: "update-user-onboarding",
  })
  .action(async ({ parsedInput, ctx }) => {
    try {
      const supabase = createClient();

      const { error } = await updateUser(supabase, parsedInput);

      if (error) throw new Error(error.message);

      return {
        success: true,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update user",
      };
    }
  });
