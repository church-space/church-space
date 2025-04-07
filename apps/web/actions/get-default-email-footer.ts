"use server";

import { createClient } from "@church-space/supabase/server";
import { getDefaultFooterQuery } from "@church-space/supabase/queries/all/get-default-footer";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getDefaultEmailFooterSchema = z.object({
  organizationId: z.string(),
});

export const getDefaultEmailFooter = authActionClient
  .schema(getDefaultEmailFooterSchema)
  .metadata({
    name: "getDefaultEmailFooter",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    // Get emails data
    const { footer } = await getDefaultFooterQuery(
      supabase,
      parsedInput.organizationId,
    );

    return {
      footer,
    };
  });
