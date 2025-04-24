"use server";

import { createClient } from "@church-space/supabase/server";
import { getEmailAutomationQuery } from "@church-space/supabase/queries/all/get-email-automation";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getEmailAutomationSchema = z.object({
  automationId: z.number(),
  organizationId: z.string(),
});

export const getEmailAutomationAction = authActionClient
  .schema(getEmailAutomationSchema)
  .metadata({
    name: "getEmailAutomation",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    // Get emails data
    const { data, error } = await getEmailAutomationQuery(
      supabase,
      parsedInput.automationId,
      parsedInput.organizationId,
    );

    return {
      data,
      error,
    };
  });
