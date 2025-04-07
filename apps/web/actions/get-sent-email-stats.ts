"use server";

import { createClient } from "@church-space/supabase/server";
import { getSentEmailStats } from "@church-space/supabase/queries/all/get-sent-email-stats";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getSentEmailStatsSchema = z.object({
  emailId: z.string(),
});

export const getSentEmailStatsAction = authActionClient
  .schema(getSentEmailStatsSchema)
  .metadata({
    name: "getSentEmailStats",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    // Get emails data
    const { metrics, linkStats } = await getSentEmailStats(
      supabase,
      parseInt(parsedInput.emailId),
    );

    return {
      metrics,
      linkStats,
    };
  });
