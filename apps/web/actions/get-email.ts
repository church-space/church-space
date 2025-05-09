"use server";

import { createClient } from "@church-space/supabase/server";
import { getEmailQuery } from "@church-space/supabase/queries/all/get-email";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getEmailSchema = z.object({
  emailId: z.number(),
  organizationId: z.string(),
});

export const getEmailAction = authActionClient
  .schema(getEmailSchema)
  .metadata({
    name: "getEmail",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    // Get emails data
    const { data, error } = await getEmailQuery(
      supabase,
      parsedInput.emailId,
      parsedInput.organizationId,
    );

    return {
      data,
      error,
    };
  });
