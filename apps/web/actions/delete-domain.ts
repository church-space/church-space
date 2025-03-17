"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { deleteDomain } from "@church-space/supabase/mutations/domains";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { revalidateTag } from "next/cache";

export const deleteDomainAction = authActionClient
  .schema(
    z.object({
      organization_id: z.string(),
      domain_id: z.number(),
    }),
  )
  .metadata({
    name: "delete-domain",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      console.log("Starting domain deletion with:", {
        organization_id: parsedInput.parsedInput.organization_id,
        domain_id: parsedInput.parsedInput.domain_id,
      });

      const supabase = await createClient();

      console.log("Deleting domain...");
      try {
        const result = await deleteDomain(
          supabase,
          parsedInput.parsedInput.organization_id,
          parsedInput.parsedInput.domain_id,
        );

        if (result.error) {
          console.error("Error deleting domain:", result.error);
          return {
            success: false,
            error: `Failed to delete domain: ${result.error.message}`,
          };
        }

        // Revalidate the domains query tag
        console.log("Domain deleted successfully, revalidating...");
        try {
          revalidateTag(`domains_${parsedInput.parsedInput.organization_id}`);
        } catch (revalidateError) {
          console.error("Error revalidating tag:", revalidateError);
          // Continue even if revalidation fails
        }

        console.log("Domain deletion complete");
        return {
          success: true,
          data: { id: parsedInput.parsedInput.domain_id },
        };
      } catch (deleteError) {
        console.error("Error in deleteDomain:", deleteError);
        const errorMessage =
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete domain";

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error("Error deleting domain:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? `Failed to delete domain: ${error.message}`
            : "Failed to delete domain due to an unknown error",
      };
    }
  });
