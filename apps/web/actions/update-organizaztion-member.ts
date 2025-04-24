"use server";

import type { ActionResponse } from "@/types/action";
import { updateOrganizationMember } from "@church-space/supabase/mutations/platform";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const updateOrganizationMemberAction = authActionClient
  .schema(
    z.object({
      memberId: z.number(),
      role: z.enum(["owner", "admin", "member"]),
    }),
  )
  .metadata({
    name: "update-organization-member",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();
      const data = await updateOrganizationMember(
        supabase,
        parsedInput.parsedInput.memberId,
        parsedInput.parsedInput.role,
      );

      if (!data) {
        return {
          success: false,
          error: "Organization member update failed: no data returned.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error updating organization member:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update organization member due to an unknown error";

      return {
        success: false,
        error: `Failed to update organization member: ${errorMessage}`,
      };
    }
  });
