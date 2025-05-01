"use server";

import { createClient } from "@church-space/supabase/server";
import { getEmailWithBlocksQuery } from "@church-space/supabase/queries/all/get-email-with-blocks";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getEmailWithBlocksSchema = z.object({
  emailId: z.number(),
  organizationId: z.string(),
});

export const getEmailWithBlocksAction = authActionClient
  .schema(getEmailWithBlocksSchema)
  .metadata({
    name: "getEmailWithBlocks",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    // Get emails data
    const { email, blocks, footer } = await getEmailWithBlocksQuery(
      supabase,
      parsedInput.emailId,
      parsedInput.organizationId,
    );

    return {
      email,
      blocks,
      footer,
    };
  });
