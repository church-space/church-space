"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { updateDomain } from "@church-space/supabase/mutations/domains";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { revalidateTag } from "next/cache";

export const updateDomainsAction = authActionClient
  .schema(
    z.object({
      domain_id: z.number(),
      domain_data: z
        .object({
          domain: z.string().optional(),
          dns_records: z.record(z.any()).nullable().optional(),
          is_primary: z.boolean().nullable().optional(),
          organization_id: z.string().optional(),
        })
        .partial(),
    }),
  )
  .metadata({
    name: "update-domain",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      console.log("Starting domain update with:", {
        domain_id: parsedInput.parsedInput.domain_id,
        domain_data: parsedInput.parsedInput.domain_data,
      });

      const supabase = await createClient();

      // First check if the domain exists
      console.log("Checking if domain exists...");
      const { data: existingDomain, error: domainCheckError } = await supabase
        .from("domains")
        .select("*")
        .eq("id", parsedInput.parsedInput.domain_id)
        .single();

      if (domainCheckError) {
        console.error("Domain check error:", domainCheckError);
        return {
          success: false,
          error: `Error checking domain: ${domainCheckError.message}`,
        };
      }

      if (!existingDomain) {
        console.error("Domain not found");
        return {
          success: false,
          error: "Domain not found",
        };
      }

      console.log("Domain found, updating...");

      try {
        const result = await updateDomain(
          supabase,
          parsedInput.parsedInput.domain_id,
          parsedInput.parsedInput.domain_data,
        );

        if (result.error) {
          console.error("Error updating domain:", result.error);
          return {
            success: false,
            error: `Failed to update domain: ${result.error.message}`,
          };
        }

        // Revalidate the domain query tag
        console.log("Domain updated successfully, revalidating...");
        try {
          revalidateTag(`domains_${existingDomain.organization_id}`);
        } catch (revalidateError) {
          console.error("Error revalidating tag:", revalidateError);
          // Continue even if revalidation fails
        }

        console.log("Domain update complete:", result.data);
        return {
          success: true,
          data: result.data,
        };
      } catch (updateError) {
        console.error("Error in updateDomain:", updateError);
        // Ensure we're returning a proper error message
        const errorMessage =
          updateError instanceof Error
            ? updateError.message
            : "Failed to update domain";

        console.error("Returning error message:", errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error("Error updating domain:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? `Failed to update domain: ${error.message}`
            : "Failed to update domain due to an unknown error",
      };
    }
  });
