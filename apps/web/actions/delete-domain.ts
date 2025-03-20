"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { deleteDomain } from "@church-space/supabase/mutations/domains";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { revalidateTag } from "next/cache";
import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export const deleteDomainAction = authActionClient
  .schema(
    z.object({
      organization_id: z.string(),
      domain_id: z.number(),
      resend_domain_id: z.string(),
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
        resend_domain_id: parsedInput.parsedInput.resend_domain_id,
      });

      // First, delete the domain from Resend if we have a resend_domain_id
      if (parsedInput.parsedInput.resend_domain_id) {
        console.log("Deleting domain from Resend...");
        try {
          await resend.domains.remove(parsedInput.parsedInput.resend_domain_id);
          console.log("Domain deleted from Resend successfully");
        } catch (resendError) {
          console.error("Error deleting domain from Resend:", resendError);
          // Continue with database deletion even if Resend deletion fails
          console.log("Continuing with database deletion despite Resend error");
        }
      }

      const supabase = await createClient();

      console.log("Deleting domain from database...");
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

        // Check if there's only one domain left for this organization
        console.log("Checking if there's only one domain left...");
        const { data: remainingDomains, error: fetchError } = await supabase
          .from("domains")
          .select("id")
          .eq("organization_id", parsedInput.parsedInput.organization_id);

        if (fetchError) {
          console.error("Error fetching remaining domains:", fetchError);
        } else if (remainingDomains && remainingDomains.length === 1) {
          console.log("Only one domain left, setting it as primary...");
          // Set the remaining domain as primary
          const { error: updateError } = await supabase
            .from("domains")
            .update({ is_primary: true })
            .eq("id", remainingDomains[0].id)
            .eq("organization_id", parsedInput.parsedInput.organization_id);

          if (updateError) {
            console.error("Error setting domain as primary:", updateError);
          } else {
            console.log("Domain set as primary successfully");
          }
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
