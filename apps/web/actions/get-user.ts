"use server";

import { createClient } from "@church-space/supabase/server";
import { getUserQuery } from "@church-space/supabase/get-user";
import { authActionClient } from "./safe-action";

export const getUserAction = authActionClient
  .metadata({
    name: "getUser",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    // Get emails data
    const { data, error } = await getUserQuery(supabase);

    return {
      data,
      error,
    };
  });
