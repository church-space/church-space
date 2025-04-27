"use server";

import { createClient } from "@church-space/supabase/server";
import { getActiveAutomationMemberCount } from "@church-space/supabase/queries/all/get-active-automation-member-count";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getActiveAutomationMembersCountSchema = z.object({
  automationId: z.number(),
});

export const getActiveAutomationMembersCount = authActionClient
  .schema(getActiveAutomationMembersCountSchema)
  .metadata({
    name: "getActiveAutomationMembersCount",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    // Get emails data
    const { count } = await getActiveAutomationMemberCount(
      supabase,
      parsedInput.automationId,
    );

    return {
      count,
    };
  });
