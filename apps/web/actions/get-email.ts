"use server";

import { createClient } from "@church-space/supabase/server";
import { getEmailQuery } from "@church-space/supabase/queries/all/get-email";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getEmailSchema = z.object({
  emailId: z.number(),
});

export const getEmailAction = authActionClient
  .schema(getEmailSchema)
  .metadata({
    name: "getEmail",
  })
  .action(async ({ parsedInput }) => {
    console.log("parsedInput", parsedInput);
    const supabase = await createClient();

    // Get emails data
    const { data, error } = await getEmailQuery(supabase, parsedInput.emailId);

    return {
      data,
      error,
    };
  });
