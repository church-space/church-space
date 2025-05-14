import "server-only";

import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@church-space/supabase/job";
import crypto from "crypto";
import { getCachedEmailAutomationsByPCOId } from "@church-space/supabase/queries/cached/automations";

// Add PCOConnection interface
interface PCOConnection {
  id: number; // Assuming id is number, adjust if necessary based on your DB schema
  access_token: string;
  refresh_token: string;
  pco_organization_id: string;
  last_refreshed: string | null;
}

// Add fetchPCOWithRetry function
const fetchPCOWithRetry = async (
  url: string,
  options: RequestInit,
  supabaseClient: any,
  orgId: string,
  pcoConn: PCOConnection,
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
      await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
      return fetchPCOWithRetry(
        url,
        options,
        supabaseClient,
        orgId,
        pcoConn,
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

// Helper function to wait for specified milliseconds
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry helper that will attempt an operation multiple times with delay
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await wait(delayMs);
      }
    }
  }

  throw lastError;
}

export async function POST(
  request: NextRequest,
  context: unknown,
): Promise<NextResponse> {
  // Safely cast the context so that we know params has organizationId.
  const { organizationId } = (context as { params: { organizationId: string } })
    .params;
  const data = await request.json();
  const supabase = await createClient();

  const webhookId = request.headers.get("X-PCO-Webhooks-Event-ID");
  const webhookName = request.headers.get("X-PCO-Webhooks-Name");
  const webhookAuthenticity = request.headers.get(
    "X-PCO-Webhooks-Authenticity",
  );

  if (!webhookId) {
    console.error("No webhook ID found in request headers");
    return NextResponse.json(
      { received: false, error: "No webhook ID found" },
      { status: 400 },
    );
  }

  if (!webhookAuthenticity) {
    console.error("No authenticity secret found in request headers");
    return NextResponse.json(
      { received: false, error: "No authenticity secret found" },
      { status: 400 },
    );
  }

  if (!webhookName) {
    console.error("No webhook name found in request headers");
    return NextResponse.json(
      { received: false, error: "No webhook name found" },
      { status: 400 },
    );
  }

  const { data: webhookData, error: fetchError } = await supabase
    .from("pco_webhooks")
    .select("authenticity_secret")
    .eq("organization_id", organizationId)
    .eq("name", webhookName)
    .single();

  if (fetchError) {
    console.error("Error fetching webhook data:", fetchError);
    return NextResponse.json(
      { received: false, error: "Failed to fetch secret" },
      { status: 500 },
    );
  }

  if (!webhookData?.authenticity_secret) {
    console.error("No authenticity secret found for webhook ID:", webhookId);
    return NextResponse.json(
      { received: false, error: "Authenticity secret not found" },
      { status: 404 },
    );
  }

  // Verify the signature
  const hmac = crypto
    .createHmac("sha256", webhookData.authenticity_secret)
    .update(JSON.stringify(data))
    .digest("hex");

  if (hmac !== webhookAuthenticity) {
    console.error("Webhook authenticity verification failed.");
    return NextResponse.json(
      { received: false, error: "Invalid signature" },
      { status: 401 },
    );
  }

  switch (webhookName) {
    case "people.v2.events.list.created":
    case "people.v2.events.list.updated":
    case "people.v2.events.list.refreshed":
    case "people.v2.events.list.destroyed": {
      // Parse the payload string *first*.
      const payloadString = data.data[0].attributes.payload;
      const payload = JSON.parse(payloadString);
      const listData = payload.data;
      const listId = listData.id;
      const listDescription = listData.attributes?.name_or_description;
      const lastRefreshedAt = listData.attributes?.refreshed_at;
      const totalPeople = listData.attributes?.total_people;

      // Extract category ID from the links if present
      let categoryId = null;
      if (listData.links?.category) {
        const categoryUrl = listData.links.category;
        const categoryIdMatch = categoryUrl.match(/\/list_categories\/(\d+)$/);
        if (categoryIdMatch) {
          categoryId = categoryIdMatch[1];
        }
      }

      if (webhookName === "people.v2.events.list.destroyed") {
        // Delete the list
        const { error: deleteError } = await supabase
          .from("pco_lists")
          .delete()
          .eq("pco_list_id", listId)
          .eq("organization_id", organizationId);

        if (deleteError) {
          console.error("Error deleting list:", deleteError);
          return NextResponse.json(
            { received: false, error: "Failed to delete list" },
            { status: 500 },
          );
        }
      } else {
        // For created/updated, check if we need to sync the category
        if (categoryId) {
          const { data: existingCategory, error: categoryCheckError } =
            await supabase
              .from("pco_list_categories")
              .select("id")
              .eq("pco_id", categoryId)
              .eq("organization_id", organizationId)
              .single();

          if (categoryCheckError && categoryCheckError.code !== "PGRST116") {
            // PGRST116 is "not found" error
            console.error("Error checking category:", categoryCheckError);
            return NextResponse.json(
              { received: false, error: "Failed to check category" },
              { status: 500 },
            );
          }

          // If category doesn't exist, fetch all categories and sync them
          if (!existingCategory) {
            const { data: pcoConnectionData, error: pcoError } = await supabase
              .from("pco_connections")
              .select("*") // Select all fields needed for PCOConnection
              .eq("organization_id", organizationId)
              .single();

            if (pcoError || !pcoConnectionData) {
              console.error("No PCO connection found for org", organizationId);
              return NextResponse.json(
                { received: false, error: "No PCO connection found" },
                { status: 500 },
              );
            }
            const pcoConnection: PCOConnection =
              pcoConnectionData as PCOConnection;

            const categoriesResponse = await fetchPCOWithRetry(
              "https://api.planningcenteronline.com/people/v2/list_categories",
              {
                headers: {
                  // Authorization is handled by fetchPCOWithRetry
                },
              },
              supabase,
              organizationId,
              pcoConnection,
            );

            if (!categoriesResponse.ok) {
              console.error(
                "Error fetching categories from PCO:",
                categoriesResponse.statusText,
              );
              return NextResponse.json(
                {
                  received: false,
                  error: "Failed to fetch categories from PCO",
                },
                { status: 500 },
              );
            }

            const categoriesData = await categoriesResponse.json();

            // Upsert all categories
            for (const cat of categoriesData.data) {
              const { error: categoryUpsertError } = await supabase
                .from("pco_list_categories")
                .upsert(
                  {
                    organization_id: organizationId,
                    pco_id: cat.id,
                    pco_name: cat.attributes.name,
                  },
                  {
                    onConflict: "pco_id",
                  },
                );

              if (categoryUpsertError) {
                console.error("Error upserting category:", categoryUpsertError);
                // Continue with other categories even if one fails
                continue;
              }
            }
          }
        }

        // Upsert the list with category reference
        const { error: upsertError } = await supabase.from("pco_lists").upsert(
          {
            organization_id: organizationId,
            pco_list_id: listId,
            pco_list_description: listDescription,
            pco_last_refreshed_at: lastRefreshedAt,
            pco_total_people: totalPeople,
            pco_list_category_id: categoryId,
          },
          {
            onConflict: "pco_list_id",
            ignoreDuplicates: false,
          },
        );

        if (upsertError) {
          console.error("Error inserting/updating list:", upsertError);
          return NextResponse.json(
            { received: false, error: "Failed to insert/update list" },
            { status: 500 },
          );
        }
      }

      break;
    }
    case "people.v2.events.list_result.created": {
      // Parse the payload string *first*.
      const payloadString = data.data[0].attributes.payload;
      const payload = JSON.parse(payloadString);
      let listResults = payload.data;

      if (!Array.isArray(listResults)) {
        // If it's not an array, make it an array.
        listResults = [listResults];
      }

      for (const listResult of listResults) {
        const pcoPersonId = listResult.relationships.person.data.id;
        const pcoListId = listResult.relationships.list.data.id;

        const { error: insertError } = await supabase
          .from("pco_list_members")
          .insert({
            organization_id: organizationId,
            pco_person_id: pcoPersonId,
            pco_list_id: pcoListId,
          });

        if (insertError) {
          console.error("Error inserting list member:", insertError);
          //  Don't return here. Keep processing.
        }
        const automations = await getCachedEmailAutomationsByPCOId(
          pcoListId,
          organizationId,
          supabase,
          "person_added",
        );

        for (const automation of automations?.data || []) {
          const { error: insertError } = await supabase
            .from("pending_automation_runs")
            .insert({
              organization_id: organizationId,
              person_id: pcoPersonId,
              status: "queued",
              automation_id: automation.id,
            });

          if (insertError) {
            console.error("Error inserting list member:", insertError);
            //  Don't return here. Keep processing.
          }
        }
      }
      break;
    }
    case "people.v2.events.list_result.destroyed": {
      // Parse the payload string *first*.
      const payloadString = data.data[0].attributes.payload;
      const payload = JSON.parse(payloadString);
      let listResults = payload.data;

      if (!Array.isArray(listResults)) {
        // If it's not an array, make it an array.
        listResults = [listResults];
      }

      for (const listResult of listResults) {
        const pcoPersonId = listResult.relationships.person.data.id;
        const pcoListId = listResult.relationships.list.data.id;

        const { error: deleteError } = await supabase
          .from("pco_list_members")
          .delete()
          .eq("pco_person_id", pcoPersonId)
          .eq("pco_list_id", pcoListId)
          .eq("organization_id", organizationId);

        if (deleteError) {
          console.error("Error deleting list member:", deleteError);
          // Don't return here. Keep processing.
        }

        const automations = await getCachedEmailAutomationsByPCOId(
          pcoListId,
          organizationId,
          supabase,
          "person_removed",
        );

        for (const automation of automations?.data || []) {
          const { error: insertError } = await supabase
            .from("pending_automation_runs")
            .insert({
              organization_id: organizationId,
              person_id: pcoPersonId,
              status: "queued",
              automation_id: automation.id,
            });

          if (insertError) {
            console.error("Error inserting list member:", insertError);
            //  Don't return here. Keep processing.
          }
        }
      }

      break;
    }
    case "people.v2.events.email.created":
      {
        const payloadString = data.data[0].attributes.payload;
        const payload = JSON.parse(payloadString);
        const emailData = payload.data;
        const email = emailData.attributes.address;
        const pcoEmailId = emailData.id;
        const pcoPersonId = emailData.relationships.person.data.id;

        // Only insert if this is a primary email
        if (emailData.attributes.primary) {
          try {
            await retryOperation(async () => {
              const { error } = await supabase
                .from("people_emails")
                .insert({
                  organization_id: organizationId,
                  pco_person_id: pcoPersonId,
                  pco_email_id: pcoEmailId,
                  email: email,
                })
                .select("id");
              if (error) throw error;
            });

            // Insert into people_email_statuses
            try {
              const { error: statusError } = await supabase
                .from("people_email_statuses")
                .insert({
                  organization_id: organizationId,
                  email_address: email,
                  status: "subscribed",
                });

              if (
                statusError &&
                !statusError.message.includes("duplicate key")
              ) {
                console.error(
                  "Error inserting email status (non-critical):",
                  statusError,
                );
              }
            } catch (error) {
              console.error(
                "Error inserting email status (non-critical):",
                error,
              );
              // Continue execution - this is non-critical
            }
          } catch (error) {
            console.error("Error inserting email after retries:", error);
            return NextResponse.json(
              {
                received: false,
                error: "Failed to insert email after retries",
              },
              { status: 500 },
            );
          }
        }
      }
      break;
    case "people.v2.events.email.destroyed":
      {
        const payloadString = data.data[0].attributes.payload;
        const payload = JSON.parse(payloadString);
        const emailData = payload.data;
        const pcoEmailId = emailData.id;
        const { error } = await supabase
          .from("people_emails")
          .delete()
          .eq("pco_email_id", pcoEmailId)
          .eq("organization_id", organizationId);

        if (error) {
          console.error("Error deleting email:", error);
          return NextResponse.json(
            { received: false, error: "Failed to delete email" },
            { status: 500 },
          );
        }
        // No action needed for people_email_statuses on delete as requested
      }
      break;
    case "people.v2.events.email.updated":
      {
        const payloadString = data.data[0].attributes.payload;
        const payload = JSON.parse(payloadString);
        const emailData = payload.data;
        const email = emailData.attributes.address;
        const pcoEmailId = emailData.id;
        const pcoPersonId = emailData.relationships.person.data.id;

        const { error } = await supabase
          .from("people_emails")
          .update({
            email: email,
            organization_id: organizationId,
            pco_email_id: pcoEmailId,
            pco_person_id: pcoPersonId,
          })
          .eq("pco_email_id", pcoEmailId)
          .eq("organization_id", organizationId);

        if (error) {
          console.error("Error updating email:", error);
          return NextResponse.json(
            { received: false, error: "Failed to update email" },
            { status: 500 },
          );
        }

        // Insert into people_email_statuses table
        try {
          const { error: statusError } = await supabase
            .from("people_email_statuses")
            .insert({
              organization_id: organizationId,
              email_address: email,
              status: emailData.attributes.blocked
                ? "pco_blocked"
                : "subscribed",
            });

          if (statusError && !statusError.message.includes("duplicate key")) {
            console.error(
              "Error inserting email status (non-critical):",
              statusError,
            );
          }
        } catch (error) {
          console.error(
            "Error inserting/updating email status (non-critical):",
            error,
          );
          // Continue execution - this is non-critical
        }

        // If the email is no longer primary, delete it.
        if (emailData.attributes.primary === false) {
          const { error: deleteError } = await supabase
            .from("people_emails")
            .delete()
            .eq("pco_email_id", pcoEmailId)
            .eq("organization_id", organizationId);

          if (deleteError) {
            console.error("Error deleting email:", deleteError);
            return NextResponse.json(
              { received: false, error: "Failed to delete email" },
              { status: 500 },
            );
          }
          // No action needed for people_email_statuses on email removal as requested
        }
      }
      break;
    case "people.v2.events.person.created":
    case "people.v2.events.person.updated":
    case "people.v2.events.person.destroyed":
      {
        const payloadString = data.data[0].attributes.payload;
        const payload = JSON.parse(payloadString);
        const personData = payload.data;

        if (webhookName === "people.v2.events.person.destroyed") {
          const { error: deleteError } = await supabase
            .from("people")
            .delete()
            .eq("pco_id", personData.id)
            .eq("organization_id", organizationId);
          if (deleteError) {
            console.error("Error deleting person:", deleteError);
            return NextResponse.json(
              { received: false, error: "Failed to delete person" },
              { status: 500 },
            );
          }
        } else {
          const { error: upsertError } = await supabase.from("people").upsert(
            {
              organization_id: organizationId,
              pco_id: personData.id,
              first_name: personData.attributes.first_name,
              middle_name: personData.attributes.middle_name,
              last_name: personData.attributes.last_name,
              nickname: personData.attributes.nickname,
              given_name: personData.attributes.given_name,
            },
            {
              onConflict: "pco_id",
              ignoreDuplicates: false,
            },
          );

          if (upsertError) {
            console.error("Error inserting/updating person:", upsertError);
            return NextResponse.json(
              { received: false, error: "Failed to insert/update person" },
              { status: 500 },
            );
          }
        }
      }
      break;

    default:
      console.error("Unknown webhook name:", webhookName);
  }

  return NextResponse.json({ received: true });
}
