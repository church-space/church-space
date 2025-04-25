"use server";

import { createClient } from "@church-space/supabase/server";
import { getOrgFooterDetailsQuery } from "@church-space/supabase/queries/all/get-org-footer-details";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getOrgFooterDetailsSchema = z.object({
  organizationId: z.string(),
});

export const getOrgFooterDetailsAction = authActionClient
  .schema(getOrgFooterDetailsSchema)
  .metadata({
    name: "getOrgFooterDetails",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    // Get org footer details
    const { data, error } = await getOrgFooterDetailsQuery(
      supabase,
      parsedInput.organizationId,
    );

    return {
      data,
      error,
    };
  });
