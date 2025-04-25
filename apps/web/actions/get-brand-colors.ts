"use server";

import { createClient } from "@church-space/supabase/server";
import { getBrandColorsQuery } from "@church-space/supabase/queries/all/get-brand-colors";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getBrandColorsSchema = z.object({
  organizationId: z.string(),
});

export const getBrandColors = authActionClient
  .schema(getBrandColorsSchema)
  .metadata({
    name: "getBrandColors",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    // Get emails data
    const { colors } = await getBrandColorsQuery(
      supabase,
      parsedInput.organizationId,
    );

    return {
      colors,
    };
  });
