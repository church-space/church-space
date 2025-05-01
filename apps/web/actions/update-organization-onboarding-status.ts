"use server";

import type { ActionResponse } from "@/types/action";
import { updateOrganizationOnboardingStatus } from "@church-space/supabase/mutations/platform";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const updateOrganizationOnboardingStatusAction = authActionClient
  .schema(
    z.object({
      organizationId: z.string(),
      onboardingStatus: z.boolean(),
    }),
  )
  .metadata({
    name: "update-organization-onboarding-status",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();

      const data = await updateOrganizationOnboardingStatus(
        supabase,
        parsedInput.parsedInput.organizationId,
        parsedInput.parsedInput.onboardingStatus,
      );

      if (!data) {
        return {
          success: false,
          error:
            "Organization onboarding status update failed: no data returned.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error updating organization onboarding status:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update organization due to an unknown error";

      return {
        success: false,
        error: `Failed to update organization onboarding status: ${errorMessage}`,
      };
    }
  });
