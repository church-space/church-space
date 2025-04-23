"use server";

import type { ActionResponse } from "@/types/action";
import { updateOrganization } from "@church-space/supabase/mutations/platform";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const updateOrganizationDataAction = authActionClient
  .schema(
    z.object({
      organizationId: z.string(),
      name: z.string(),
      defaultEmail: z.string(),
      defaultEmailDomain: z.number().nullable(),
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
    name: "update-organization-data",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();

      // Handle defaultEmailDomain - if it's 0, send null to the database
      const defaultEmailDomain =
        parsedInput.parsedInput.defaultEmailDomain === 0
          ? null
          : parsedInput.parsedInput.defaultEmailDomain;

      const data = await updateOrganization(supabase, {
        organizationId: parsedInput.parsedInput.organizationId,
        name: parsedInput.parsedInput.name,
        defaultEmail: parsedInput.parsedInput.defaultEmail,
        defaultEmailDomain,
        address: parsedInput.parsedInput.address,
      });

      if (!data) {
        return {
          success: false,
          error: "Organization update failed: no data returned.",
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
        error: `Failed to update organization: ${errorMessage}`,
      };
    }
  });
