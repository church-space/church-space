"use server";

import { createClient } from "@church-space/supabase/server";
import { getSubscribedPeopleCount } from "@church-space/supabase/queries/all/get-people-with-emails";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getSubscribedPeopleCountSchema = z.object({
  organizationId: z.string(),
});

export const getSubscribedPeopleCountAction = authActionClient
  .schema(getSubscribedPeopleCountSchema)
  .metadata({
    name: "getSubscribedPeopleCount",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    const count = await getSubscribedPeopleCount(
      supabase,
      parsedInput.organizationId,
    );

    return {
      count,
    };
  });
