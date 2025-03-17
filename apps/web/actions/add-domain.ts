"use server";

import { authActionClient } from "./safe-action";
import { createClient } from "@church-space/supabase/server";
import { addDomain } from "@church-space/supabase/mutations/domains";
import { z } from "zod";
import type { ActionResponse } from "@/types/action";
import { revalidateTag } from "next/cache";
import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

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

      // First, add the domain to Resend
      console.log("Adding domain to Resend...");
      let resendDomainData: ResendDomainResponse;
      try {
        // The Resend API response structure might be different than expected
        const resendResponse = await resend.domains.create({
          name: parsedInput.parsedInput.domain,
        });

        console.log("Raw Resend API response:", resendResponse);

        // Handle different response structures - use any type for flexibility
        const responseAny = resendResponse as any;

        if (
          responseAny &&
          // Check for id in different possible locations
          (responseAny.id || (responseAny.data && responseAny.data.id))
        ) {
          // Extract the domain data from the response based on its structure
          resendDomainData = responseAny.id
            ? (responseAny as ResendDomainResponse)
            : (responseAny.data as ResendDomainResponse);

          console.log("Parsed Resend domain data:", resendDomainData);
        } else {
          console.error(
            "Invalid Resend API response structure:",
            resendResponse,
          );
          return {
            success: false,
            error: "Failed to add domain to Resend: Invalid response",
          };
        }

        console.log("Domain added to Resend:", resendDomainData);
      } catch (resendError) {
        console.error("Error adding domain to Resend:", resendError);
        const errorMessage =
          resendError instanceof Error
            ? resendError.message
            : "Failed to add domain to Resend";

        return {
          success: false,
          error: errorMessage,
        };
      }

      console.log("Creating Supabase client...");
      let supabase;
      try {
        // Make sure we're using the server-side client with cookies
        supabase = await createClient();

        // Verify that we have a valid session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          return {
            success: false,
            error: "Authentication error: " + sessionError.message,
          };
        }

        if (!sessionData?.session) {
          console.error("No active session found");
          return {
            success: false,
            error: "No active session found. Please log in again.",
          };
        }

        console.log(
          "Supabase client created successfully with authenticated session",
        );
      } catch (clientError) {
        console.error("Error creating Supabase client:", clientError);
        return {
          success: false,
          error: "Failed to connect to database",
        };
      }

      // Validate organization ID format
      if (
        !parsedInput.parsedInput.organization_id ||
        typeof parsedInput.parsedInput.organization_id !== "string" ||
        parsedInput.parsedInput.organization_id.length < 10
      ) {
        console.error(
          "Invalid organization ID:",
          parsedInput.parsedInput.organization_id,
        );
        return {
          success: false,
          error: "Invalid organization ID format",
        };
      }

      console.log("Adding domain to database...");
      try {
        console.log("addDomain params:", {
          organizationId: parsedInput.parsedInput.organization_id,
          domain: parsedInput.parsedInput.domain,
          isPrimary: parsedInput.parsedInput.is_primary,
          resendDomainId: resendDomainData.id,
          recordsCount: resendDomainData.records?.length,
        });

        const result = await addDomain(
          supabase,
          parsedInput.parsedInput.organization_id,
          parsedInput.parsedInput.domain,
          parsedInput.parsedInput.is_primary,
          resendDomainData.id,
          resendDomainData.records,
        );

        console.log("Supabase result:", result);

        if (result.error) {
          console.error("Error adding domain:", result.error);
          return {
            success: false,
            error: `Failed to add domain: ${result.error.message}`,
          };
        }

        // Check if we have valid data
        if (!result.data || result.data.length === 0) {
          console.error(
            "No data returned from Supabase after successful insert",
          );
          return {
            success: false,
            error: "Domain was added but no data was returned",
          };
        }

        // Revalidate the domains query tag
        console.log("Domain added successfully, revalidating...");
        try {
          // Force revalidation to update the UI
          revalidateTag(`domains_${parsedInput.parsedInput.organization_id}`);
          console.log("Tag revalidated successfully");
        } catch (revalidateError) {
          console.error("Error revalidating tag:", revalidateError);
          // Continue even if revalidation fails
        }

        console.log("Domain addition complete:", result.data);
        return {
          success: true,
          data: result.data[0], // Return the first item from the array
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
