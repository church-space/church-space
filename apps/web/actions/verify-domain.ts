"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { updateDomain } from "@church-space/supabase/mutations/domains";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { revalidateTag } from "next/cache";
import { Resend } from "resend";

// Define types for Resend API responses
type ResendDnsRecord = {
  record: string;
  name: string;
  type: string;
  ttl: string;
  status: string;
  value: string;
  priority?: number;
};

type ResendDomainResponse = {
  id: string;
  name: string;
  created_at: string;
  status: string;
  records: ResendDnsRecord[];
  region: string;
};

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export const verifyDomainAction = authActionClient
  .schema(
    z.object({
      domain_id: z.number(),
      resend_domain_id: z.string(),
    }),
  )
  .metadata({
    name: "verify-domain",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      console.log("Starting domain verification with:", {
        domain_id: parsedInput.parsedInput.domain_id,
        resend_domain_id: parsedInput.parsedInput.resend_domain_id,
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

      // Check if domain has already been verified once
      if (existingDomain.has_clicked_verify) {
        console.error("Domain verification already initiated");
        return {
          success: false,
          error:
            "Domain verification has already been initiated. Please wait for the verification process to complete.",
        };
      }

      console.log("Domain found, verifying with Resend...");

      try {
        // First, update has_clicked_verify to true
        const { error: updateError } = await supabase
          .from("domains")
          .update({ has_clicked_verify: true })
          .eq("id", parsedInput.parsedInput.domain_id);

        if (updateError) {
          console.error("Error updating has_clicked_verify:", updateError);
          return {
            success: false,
            error: `Failed to update domain verification status: ${updateError.message}`,
          };
        }

        // First, trigger domain verification with Resend
        await resend.domains.verify(parsedInput.parsedInput.resend_domain_id);

        // Enable open and click tracking for the domain
        await resend.domains.update({
          id: parsedInput.parsedInput.resend_domain_id,
          openTracking: true,
          clickTracking: true,
        });

        // Wait for 10 seconds to ensure the domain is verified
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Then, get the updated domain details including DNS status
        const resendResponse = await resend.domains.get(
          parsedInput.parsedInput.resend_domain_id,
        );

        console.log(
          "Raw Resend API response:",
          JSON.stringify(resendResponse, null, 2),
        );

        // Handle different response structures - use any type for flexibility
        const responseAny = resendResponse as any;
        let resendDomainData: ResendDomainResponse;

        if (
          responseAny &&
          // Check for id in different possible locations
          (responseAny.id || (responseAny.data && responseAny.data.id))
        ) {
          // Extract the domain data from the response based on its structure
          resendDomainData = responseAny.id
            ? (responseAny as ResendDomainResponse)
            : (responseAny.data as ResendDomainResponse);

          console.log(
            "Parsed Resend domain data:",
            JSON.stringify(resendDomainData, null, 2),
          );
        } else {
          console.error(
            "Invalid Resend API response structure:",
            resendResponse,
          );
          return {
            success: false,
            error: "Failed to get domain data from Resend: Invalid response",
          };
        }

        // Update the domain in Supabase with the latest DNS records status
        console.log(
          "Sending to Supabase - dns_records:",
          JSON.stringify(resendDomainData.records, null, 2),
        );

        // Ensure records are properly formatted without double stringification
        const dnsRecordsForUpdate = resendDomainData.records;

        console.log(
          "Final dns_records being sent to Supabase:",
          JSON.stringify(dnsRecordsForUpdate, null, 2),
        );

        const result = await updateDomain(
          supabase,
          parsedInput.parsedInput.domain_id,
          {
            dns_records: dnsRecordsForUpdate,
          },
        );

        console.log(
          "Result from updateDomain:",
          JSON.stringify(result, null, 2),
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

        console.log("Domain verification complete:", result.data);
        return {
          success: true,
          data: {
            domain: result.data,
            resendData: resendDomainData,
          },
        };
      } catch (updateError) {
        console.error("Error in domain verification:", updateError);
        // Ensure we're returning a proper error message
        const errorMessage =
          updateError instanceof Error
            ? updateError.message
            : "Failed to verify domain";

        console.error("Returning error message:", errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error("Error verifying domain:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? `Failed to verify domain: ${error.message}`
            : "Failed to verify domain due to an unknown error",
      };
    }
  });
