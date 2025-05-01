"use server";

import type { ActionResponse } from "@/types/action";
import { updateOrganizationAddress } from "@church-space/supabase/mutations/platform";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const updateOrganizationAddressAction = authActionClient
  .schema(
    z.object({
      organizationId: z.string(),
      address: z.object({
        line1: z.string(),
        line2: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
        country: z.string(),
      }),
    }),
  )
  .metadata({
    name: "update-organization-address",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();

      const data = await updateOrganizationAddress(supabase, {
        organizationId: parsedInput.parsedInput.organizationId,
        address: parsedInput.parsedInput.address,
      });

      if (!data) {
        return {
          success: false,
          error: "Organization address update failed: no data returned.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error updating organization:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update organization due to an unknown error";

      return {
        success: false,
        error: `Failed to update organization address: ${errorMessage}`,
      };
    }
  });
