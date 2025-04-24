"use server";

import type { ActionResponse } from "@/types/action";
import { removeOrganizationMember } from "@church-space/supabase/mutations/platform";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const deleteOrganizationMemberAction = authActionClient
  .schema(
    z.object({
      memberId: z.number(),
    }),
  )
  .metadata({
    name: "delete-organization-member",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();
      const data = await removeOrganizationMember(
        supabase,
        parsedInput.parsedInput.memberId,
      );

      if (!data) {
        return {
          success: false,
          error: "Organization member deletion failed: no data returned.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error deleting organization member:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete organization member due to an unknown error";

      return {
        success: false,
        error: `Failed to delete organization member: ${errorMessage}`,
      };
    }
  });
