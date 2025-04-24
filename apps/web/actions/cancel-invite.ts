"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { cancelInvite } from "@church-space/supabase/mutations/platform";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { PostgrestError } from "@supabase/supabase-js";

export interface InviteResponse {
  id: number;
}

export const cancelInviteAction = authActionClient
  .schema(
    z.object({
      inviteId: z.number(),
    }),
  )
  .metadata({
    name: "cancel-invite",
  })
  .action(async (parsedInput): Promise<ActionResponse<InviteResponse>> => {
    try {
      const supabase = await createClient();

      const { data, error } = await cancelInvite(
        supabase,
        parsedInput.parsedInput.inviteId,
      );

      if (error) {
        const pgError = error as PostgrestError;
        return {
          success: false,
          error: pgError.message || "Failed to cancel invite",
        };
      }

      if (!data || !data[0]) {
        return {
          success: false,
          error: "No data returned from invite cancellation",
        };
      }

      return {
        success: true,
        data: { id: data[0].id },
      };
    } catch (error) {
      console.error("Error canceling invite:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to cancel invite",
      };
    }
  });
