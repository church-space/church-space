import "server-only";
import { queue, task } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";

// Add PCOConnection interface
interface PCOConnection {
  id: number;
  access_token: string;
  refresh_token: string;
  pco_organization_id: string;
  last_refreshed: string | null;
}

// Add fetchPCOWithRetry function (adapted from import-subscibes.ts)
const fetchPCOWithRetry = async (
  url: string,
  options: RequestInit,
  supabaseClient: any, // Using 'any' for simplicity, consider a more specific type
  orgId: string,
  pcoConn: PCOConnection,
  io: any, // Added io parameter for Trigger.dev tasks
  retryCount = 0,
): Promise<Response> => {
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${pcoConn.access_token}`,
  };

  let response = await fetch(url, options);

  if (response.status === 401 && retryCount < 1) {
    console.warn(
      `PCO API returned 401 for ${url}. Attempting to refresh token.`,
    );
    try {
      const refreshResponse = await fetch(
        "https://api.planningcenteronline.com/oauth/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: process.env.PCO_CLIENT_ID!,
            client_secret: process.env.PCO_CLIENT_SECRET!,
            refresh_token: pcoConn.refresh_token,
          }).toString(),
        },
      );

      if (!refreshResponse.ok) {
        const errorData = await refreshResponse.json();
        console.error("Failed to refresh PCO token.", {
          status: refreshResponse.status,
          errorData,
        });
        return response;
      }

      const tokenData = await refreshResponse.json();
      console.log("Successfully refreshed PCO token.");

      pcoConn.access_token = tokenData.access_token;
      if (tokenData.refresh_token) {
        pcoConn.refresh_token = tokenData.refresh_token;
      }
      pcoConn.last_refreshed = new Date().toISOString();

      const { error: updateError } = await supabaseClient
        .from("pco_connections")
        .update({
          access_token: pcoConn.access_token,
          refresh_token: pcoConn.refresh_token,
          last_refreshed: pcoConn.last_refreshed,
        })
        .eq("organization_id", orgId);

      if (updateError) {
        console.error("Failed to update PCO token in database.", {
          error: updateError,
        });
      }

      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${pcoConn.access_token}`,
      };
      response = await fetch(url, options);
    } catch (refreshError) {
      console.error("Error during PCO token refresh process:", {
        error:
          refreshError instanceof Error
            ? refreshError.message
            : String(refreshError),
      });
      return response;
    }
  }

  if (response.status === 429) {
    const retryAfterHeader = response.headers.get("Retry-After");
    console.warn("Rate limit hit for PCO API", {
      url,
      status: response.status,
      retryAfter: retryAfterHeader || "N/A",
    });

    if (retryCount < 2) {
      let waitSeconds = 20;
      if (retryAfterHeader) {
        const parsedRetryAfter = parseInt(retryAfterHeader, 10);
        if (!isNaN(parsedRetryAfter) && parsedRetryAfter > 0) {
          waitSeconds = parsedRetryAfter;
        }
      }
      console.log(
        `Rate limit: Retrying PCO API call to ${url} after ${waitSeconds} seconds (attempt ${retryCount + 2} of 3)...`,
      );
      // Use io.wait.for in Trigger.dev tasks
      await io.wait.for({ seconds: waitSeconds });
      return fetchPCOWithRetry(
        url,
        options,
        supabaseClient,
        orgId,
        pcoConn,
        io, // Pass io recursively
        retryCount + 1,
      );
    } else {
      console.error(
        `Max retries (3 total attempts) reached for PCO API call to ${url} after rate limiting.`,
      );
      return response;
    }
  }
  return response;
};

const syncPCOEmailsQueue = queue({
  name: "sync-pco-emails-queue",
  concurrencyLimit: 20,
});

export const syncPcoEmails = task({
  id: "sync-pco-emails",
  maxDuration: 18000, // 5 hours
  queue: syncPCOEmailsQueue,
  run: async (payload: { organization_id: string }, io) => {
    const supabase = createClient();

    // Track all PCO IDs we see during sync
    const seenPeopleIds = new Set<string>();
    const seenEmailIds = new Set<string>();

    // Get PCO connection for this organization
    const { data: pcoConnectionData, error: pcoError } = await supabase
      .from("pco_connections")
      .select("*")
      .eq("organization_id", payload.organization_id)
      .single();

    if (pcoError || !pcoConnectionData) {
      throw new Error(
        `No PCO connection found for org ${payload.organization_id}`,
      );
    }
    const pcoConnection: PCOConnection = pcoConnectionData as PCOConnection;

    let nextUrl =
      "https://api.planningcenteronline.com/people/v2/people?include=emails&where%5Bstatus%5D=active";
    let processedCount = 0;
    let pageCount = 0;
    const maxPages = 1000; // Add a limit for the number of pages to process.

    while (nextUrl && pageCount < maxPages) {
      // Check for nextUrl and page limit

      const response = await fetchPCOWithRetry(
        nextUrl,
        {
          headers: {
            // Authorization is handled by fetchPCOWithRetry
          },
        },
        supabase,
        payload.organization_id,
        pcoConnection,
        io, // Pass io to fetchPCOWithRetry
      );

      if (!response.ok) {
        throw new Error(
          `PCO API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Process each person
      for (const person of data.data) {
        try {
          seenPeopleIds.add(person.id);

          // Insert into people table
          const { error: personError } = await supabase.from("people").upsert(
            {
              pco_id: person.id,
              first_name: person.attributes.first_name,
              middle_name: person.attributes.middle_name,
              last_name: person.attributes.last_name,
              nickname: person.attributes.nickname,
              given_name: person.attributes.given_name,
              organization_id: payload.organization_id,
            },
            {
              onConflict: "pco_id",
            },
          );

          if (personError) {
            console.error(`Error upserting person ${person.id}:`, personError);
            continue; // Continue to the next person if upsert fails
          }

          // Process each email for the current person
          for (const emailData of person.relationships.emails.data) {
            // Find the email in the included array
            const email = data.included.find(
              (item: any) => item.type === "Email" && item.id === emailData.id,
            );

            if (!email) {
              console.warn(`Email data not found for email ID ${emailData.id}`);
              continue;
            }

            seenEmailIds.add(email.id);

            // Only process primary emails
            if (!email.attributes.primary) {
              continue;
            }

            // Skip blocked emails
            if (email.attributes.blocked) {
              console.warn(
                `Skipping blocked email ${email.id} for person ${person.id}`,
              );
              continue;
            }

            const emailAddress = email.attributes.address;

            const pcoBlocked = email.attributes.blocked;

            let status: "subscribed" | "pco_blocked" = "subscribed";

            if (pcoBlocked) {
              status = "pco_blocked";
            }

            // Insert into people_emails table
            const { error: emailError } = await supabase
              .from("people_emails")
              .upsert(
                {
                  organization_id: payload.organization_id,
                  pco_person_id: person.id,
                  pco_email_id: email.id,
                  email: emailAddress,
                },
                {
                  onConflict: "pco_email_id,organization_id",
                },
              );

            if (emailError) {
              console.error(
                `Error upserting email ${email.id} for person ${person.id}:`,
                emailError,
              );
              continue;
            }

            // Insert status into people_email_statuses only if it doesn't exist
            const { error: statusError } = await supabase
              .from("people_email_statuses")
              .upsert(
                {
                  organization_id: payload.organization_id,
                  email_address: emailAddress,
                  status: status,
                },
                {
                  onConflict: "organization_id,email_address",
                  ignoreDuplicates: true,
                },
              );

            if (statusError) {
              console.error(
                `Error upserting status for email ${emailAddress} for person ${person.id}:`,
                statusError,
              );
            }
          }
        } catch (error) {
          // Log error but continue processing other people
          console.error(`Error processing person ${person.id}:`, error);
        }
      }

      // Get next page URL
      nextUrl = data.links.next;
      processedCount += data.data.length;
      pageCount++; // Increment page count
    }

    // Clean up stale records
    if (seenPeopleIds.size > 0) {
      const { error: deleteStaleEmailsError } = await supabase
        .from("people_emails")
        .delete()
        .eq("organization_id", payload.organization_id)
        .not("pco_email_id", "in", `(${Array.from(seenEmailIds).join(",")})`);

      if (deleteStaleEmailsError) {
        console.error("Error deleting stale emails:", deleteStaleEmailsError);
      }

      const { error: deleteStalePeopleError } = await supabase
        .from("people")
        .delete()
        .eq("organization_id", payload.organization_id)
        .not("pco_id", "in", `(${Array.from(seenPeopleIds).join(",")})`);

      if (deleteStalePeopleError) {
        console.error("Error deleting stale people:", deleteStalePeopleError);
      }
    }

    await supabase.from("pco_sync_status").upsert({
      organization_id: payload.organization_id,
      type: "emails",
      synced_at: new Date().toISOString(),
    });

    return {
      message: "PCO people and emails sync completed",
      stats: {
        people_synced: seenPeopleIds.size,
        emails_synced: seenEmailIds.size,
      },
    };
  },
});
