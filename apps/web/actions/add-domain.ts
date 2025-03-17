"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { addDomain } from "@church-space/supabase/mutations/domains";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { revalidateTag } from "next/cache";

export const addDomainAction = authActionClient
  .schema(
    z.object({
      organization_id: z.string(),
      domain: z.string().min(3),
      is_primary: z.boolean().optional(),
    }),
  )
  .metadata({
    name: "add-domain",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      console.log("Starting domain addition with:", {
        organization_id: parsedInput.parsedInput.organization_id,
        domain: parsedInput.parsedInput.domain,
      });

      const supabase = await createClient();

      console.log("Adding domain...");
      try {
        const result = await addDomain(
          supabase,
          parsedInput.parsedInput.organization_id,
          parsedInput.parsedInput.domain,
          parsedInput.parsedInput.is_primary,
        );

        if (result.error) {
          console.error("Error adding domain:", result.error);
          return {
            success: false,
            error: `Failed to add domain: ${result.error.message}`,
          };
        }

        // Revalidate the domains query tag
        console.log("Domain added successfully, revalidating...");
        try {
          revalidateTag(`domains_${parsedInput.parsedInput.organization_id}`);
        } catch (revalidateError) {
          console.error("Error revalidating tag:", revalidateError);
          // Continue even if revalidation fails
        }

        console.log("Domain addition complete:", result.data);
        return {
          success: true,
          data: result.data,
        };
      } catch (addError) {
        console.error("Error in addDomain:", addError);
        const errorMessage =
          addError instanceof Error ? addError.message : "Failed to add domain";

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error("Error adding domain:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? `Failed to add domain: ${error.message}`
            : "Failed to add domain due to an unknown error",
      };
    }
  });
