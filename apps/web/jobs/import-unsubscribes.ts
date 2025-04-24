import "server-only";

import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";
import Papa from "papaparse";
import { z } from "zod";

// Define the allowed email statuses based on the table constraint
const EmailStatusEnum = z.enum([
  "unsubscribed",
  "pco_blocked",
  "subscribed",
  "cleaned",
]);

const importUnsubscribesPayload = z.object({
  organizationId: z.string().uuid(),
  fileUrl: z.string().url(),
  emailColumn: z.string(), // The exact header name for the email column
  status: EmailStatusEnum, // The status to assign
});

export const importUnsubscribes = task({
  id: "import-unsubscribes",
  run: async (payload: z.infer<typeof importUnsubscribesPayload>, io) => {
    const { organizationId, fileUrl, emailColumn, status } = payload;
    const supabase = createClient();

    // Fetch the CSV file content using standard fetch
    const response = await fetch(fileUrl, {
      method: "GET",
      headers: {
        Accept: "text/csv",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch CSV content.", {
        fileUrl,
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(
        `Failed to fetch CSV content: ${response.status} ${response.statusText}`,
      );
    }

    const csvContent = await response.text(); // Get text content from response

    if (!csvContent) {
      console.error("Fetched CSV content is empty.", { fileUrl });
      throw new Error("Fetched CSV content is empty.");
    }

    // Parse the CSV content
    const parseResult = Papa.parse<Record<string, string>>(csvContent, {
      header: true, // Treat the first row as headers
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error("Failed to parse CSV.", {
        errors: parseResult.errors,
      });
      throw new Error(`Failed to parse CSV: ${parseResult.errors[0]?.message}`);
    }

    if (parseResult.data.length === 0) {
      console.log("CSV file is empty or contains no data rows.");
      return { message: "CSV file is empty or contains no data rows." };
    }

    // Validate that the email column exists in the headers
    const headers = parseResult.meta.fields;
    if (!headers || !headers.includes(emailColumn)) {
      console.error(`Email column "${emailColumn}" not found in CSV headers.`, {
        headers,
      });
      throw new Error(
        `Email column "${emailColumn}" not found in CSV headers. Available headers: ${headers?.join(", ")}`,
      );
    }

    // Prepare data for UPSERT
    const dataToUpsert = parseResult.data
      .map((row) => {
        const email = row[emailColumn]?.trim();
        // Validate email using Zod
        const validationResult = z.string().email().safeParse(email);
        if (validationResult.success) {
          return {
            organization_id: organizationId,
            email_address: validationResult.data.toLowerCase(), // Normalize email
            status: status,
            // 'reason' could potentially be added if available in CSV
          };
        }
        // Log invalid emails if needed
        // console.warn(`Invalid email format found: ${email}`);
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null); // Filter out invalid/missing emails

    if (dataToUpsert.length === 0) {
      console.log("No valid email addresses found in the specified column.");
      return {
        message: "No valid email addresses found in the specified column.",
      };
    }

    console.log(`Preparing to upsert ${dataToUpsert.length} email statuses.`);

    // Perform batch UPSERT directly using the Supabase client
    const { error: upsertError } = await supabase
      .from("people_email_statuses")
      .upsert(dataToUpsert, {
        onConflict: "organization_id, email_address", // Specify conflict target
        // defaultToNull makes sure unspecified columns in the upsert data
        // don't overwrite existing values with NULL, but we want to overwrite status
        // ignoreDuplicates: false, // Default is false, ensures updates happen
      });

    if (upsertError) {
      console.error("Failed to upsert email statuses.", {
        error: upsertError,
      });
      throw new Error(
        `Failed to upsert email statuses: ${upsertError.message}`,
      );
    }

    console.log(
      `Successfully upserted ${dataToUpsert.length} email statuses for organization ${organizationId}.`,
    );

    return {
      message: `Successfully processed ${dataToUpsert.length} records.`,
      processedCount: dataToUpsert.length,
    };
  },
});
