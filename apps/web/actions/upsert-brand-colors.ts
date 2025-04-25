"use server";

import type { ActionResponse } from "@/types/action";
import { upsertBrandColor } from "@church-space/supabase/mutations/brand";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const upsertBrandColorsAction = authActionClient
  .schema(
    z.object({
      organizationId: z.string(),
      colors: z.array(
        z.object({
          color: z.string(),
          title: z.string(),
        }),
      ),
    }),
  )
  .metadata({
    name: "upsert-brand-colors",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();
      const data = await upsertBrandColor(supabase, {
        organizationId: parsedInput.parsedInput.organizationId,
        colors: parsedInput.parsedInput.colors,
      });

      if (!data) {
        return {
          success: false,
          error: "Brand colors upsert failed: no data returned.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error upserting brand colors:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upsert brand colors due to an unknown error";

      return {
        success: false,
        error: `Failed to upsert brand colors: ${errorMessage}`,
      };
    }
  });
