"use server";

import type { ActionResponse } from "@/types/action";
import { upsertBrandColor } from "@church-space/supabase/mutations/brand";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";

// Define the expected input type for the Supabase function
interface UpsertBrandColorInput {
  organizationId: string;
  colors: {
    color: string;
    title: string;
  }[];
}

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
  .action(async ({ parsedInput }): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();
      // Explicitly type the input for clarity
      const input: UpsertBrandColorInput = {
        organizationId: parsedInput.organizationId,
        colors: parsedInput.colors,
      };
      // Call the mutation. It throws on Supabase error.
      const data = await upsertBrandColor(supabase, input);

      return {
        success: true,
        // Optionally return the data, or just indicate success
        data: data ?? {
          message: "Upsert successful, no specific data returned.",
        },
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
