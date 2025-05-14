import "server-only";

import { createClient } from "@church-space/supabase/job";
import { task } from "@trigger.dev/sdk/v3";

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

export const syncPcoLists = task({
  id: "sync-pco-lists",

  run: async (payload: { organization_id: string }, io) => {
    const supabase = createClient();

    // Track all PCO IDs we see during sync
    const seenCategoryIds = new Set<string>();
    const seenListIds = new Set<string>();
    const seenListMemberKeys = new Set<string>();

    // Get PCO connection for this organization

    const { data: pcoConnectionData, error: pcoError } = await supabase
      .from("pco_connections")
      .select("*")
      .eq("organization_id", payload.organization_id)
      .single();

    if (pcoError || !pcoConnectionData) {
      console.error(
        `PCO connection error: ${pcoError?.message || "Connection not found"}`,
      );
      throw new Error(
        `No PCO connection found for org ${payload.organization_id}`,
      );
    }
    const pcoConnection: PCOConnection = pcoConnectionData as PCOConnection;

    // First sync list categories

    const categoriesResponse = await fetchPCOWithRetry(
      "https://api.planningcenteronline.com/people/v2/list_categories",
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

    if (!categoriesResponse.ok) {
      console.error(
        `PCO API error fetching categories: ${categoriesResponse.status} ${categoriesResponse.statusText}`,
      );
      throw new Error(
        `PCO API error fetching categories: ${categoriesResponse.status} ${categoriesResponse.statusText}`,
      );
    }

    const categoriesData = await categoriesResponse.json();

    // Process each category
    for (const category of categoriesData.data) {
      seenCategoryIds.add(category.id);

      await supabase.from("pco_list_categories").upsert(
        {
          organization_id: payload.organization_id,
          pco_name: category.attributes.name,
          pco_id: category.id,
        },
        { onConflict: "pco_id" },
      );
    }

    // Now proceed with syncing lists

    let nextUrl =
      "https://api.planningcenteronline.com/people/v2/lists?include=category";
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
        console.error(
          `PCO API error fetching lists: ${response.status} ${response.statusText}`,
        );
        throw new Error(
          `PCO API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Process each list
      for (const list of data.data) {
        try {
          const listId = list.id;
          seenListIds.add(listId);
          const listDescription = list.attributes.name_or_description;
          const lastRefreshedAt = list.attributes.refreshed_at;
          const totalPeople = list.attributes.total_people;

          // Extract category ID
          let categoryId = null;
          if (list.relationships.category.data) {
            categoryId = list.relationships.category.data.id;
          } else {
            console.log(`List has no category`);
          }

          // Insert into pco_lists table

          await supabase.from("pco_lists").upsert(
            {
              organization_id: payload.organization_id,
              pco_list_id: listId,
              pco_list_description: listDescription,
              pco_last_refreshed_at: lastRefreshedAt,
              pco_total_people: totalPeople,
              pco_list_category_id: categoryId,
            },
            { onConflict: "pco_list_id" },
          );

          // Fetch and process list results (members)

          let listResultsNextUrl = `https://api.planningcenteronline.com/people/v2/lists/${listId}/list_results`;
          let listResultsPage = 0;
          const maxListResultsPages = 1000;

          while (listResultsNextUrl && listResultsPage < maxListResultsPages) {
            const listResultsResponse = await fetchPCOWithRetry(
              listResultsNextUrl,
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

            if (!listResultsResponse.ok) {
              console.error(
                `PCO API error fetching list results: ${listResultsResponse.status} ${listResultsResponse.statusText} for list ${listId}`,
              );
              throw new Error(
                `PCO API error fetching list results: ${listResultsResponse.status} ${listResultsResponse.statusText}`,
              );
            }

            const listResultsData = await listResultsResponse.json();

            for (const result of listResultsData.data) {
              const personId = result.relationships.person.data.id;
              seenListMemberKeys.add(`${listId}:${personId}`);

              // Insert into pco_list_members table
              try {
                await supabase.from("pco_list_members").upsert(
                  {
                    organization_id: payload.organization_id,
                    pco_list_id: listId,
                    pco_person_id: personId,
                  },
                  {
                    onConflict: "pco_list_id,pco_person_id",
                  },
                );
              } catch (memberError) {
                console.error(
                  `Error upserting list member (List: ${listId}, Person: ${personId}):`,
                  memberError,
                );
              }
            }

            listResultsNextUrl = listResultsData.links?.next; // Use optional chaining
            listResultsPage++;
          }
        } catch (error) {
          // Log error but continue processing other lists
          console.error(`Error processing list ${list.id}:`, error);
        }
      }

      // Get next page URL
      nextUrl = data.links.next;
      processedCount += data.data.length;
      pageCount++; // Increment page count
    }

    // Clean up stale records
    if (seenCategoryIds.size > 0) {
      const { error: deleteStaleCategoriesError } = await supabase
        .from("pco_list_categories")
        .delete()
        .eq("organization_id", payload.organization_id)
        .not("pco_id", "in", `(${Array.from(seenCategoryIds).join(",")})`);

      if (deleteStaleCategoriesError) {
        console.error(
          "Error deleting stale categories:",
          deleteStaleCategoriesError,
        );
      }
    }

    if (seenListIds.size > 0) {
      const { error: deleteStaleListsError } = await supabase
        .from("pco_lists")
        .delete()
        .eq("organization_id", payload.organization_id)
        .not("pco_list_id", "in", `(${Array.from(seenListIds).join(",")})`);

      if (deleteStaleListsError) {
        console.error("Error deleting stale lists:", deleteStaleListsError);
      }

      // For list members, we need to handle the composite key differently
      const { error: deleteStaleListMembersError } = await supabase
        .from("pco_list_members")
        .delete()
        .eq("organization_id", payload.organization_id)
        .not("pco_list_id", "in", `(${Array.from(seenListIds).join(",")})`);

      if (deleteStaleListMembersError) {
        console.error(
          "Error deleting stale list members:",
          deleteStaleListMembersError,
        );
      }
    }

    await supabase.from("pco_sync_status").upsert({
      organization_id: payload.organization_id,
      type: "lists",
      synced_at: new Date().toISOString(),
    });

    return {
      message: "PCO lists sync completed",
      stats: {
        categories_synced: seenCategoryIds.size,
        lists_synced: seenListIds.size,
        list_members_synced: seenListMemberKeys.size,
      },
    };
  },
});
