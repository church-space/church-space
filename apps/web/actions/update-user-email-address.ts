"use server";

import { createClient } from "@church-space/supabase/server";
import { actionClient } from "./safe-action";
import { z } from "zod";

const updateUserEmailAddressSchema = z.object({
  email: z.string().email(),
});

export const updateUserEmailAddressAction = actionClient
  .schema(updateUserEmailAddressSchema)

  .action(async ({ parsedInput: { email } }) => {
    const supabase = await createClient();

    try {
      await supabase.auth.updateUser({
        email,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error updating user email:", error);
      return {
        success: false,
      };
    }
  });
