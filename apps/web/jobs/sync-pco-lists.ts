import "server-only";

import { createClient } from "@church-space/supabase/job";
import { task } from "@trigger.dev/sdk/v3";

export const syncPcoLists = task({
  id: "sync-pco-lists",

  run: async (payload: { organization_id: string }, io) => {
    const supabase = createClient();

    // Track all PCO IDs we see during sync
    const seenCategoryIds = new Set<string>();
    const seenListIds = new Set<string>();
    const seenListMemberKeys = new Set<string>();

    // Get PCO connection for this organization

    const { data: pcoConnection, error: pcoError } = await supabase
      .from("pco_connections")
      .select("*")
      .eq("organization_id", payload.organization_id)
      .single();

    if (pcoError || !pcoConnection) {
      console.error(
        `PCO connection error: ${pcoError?.message || "Connection not found"}`,
      );
      throw new Error(
        `No PCO connection found for org ${payload.organization_id}`,
      );
    }

    // First sync list categories

    const categoriesResponse = await fetch(
      "https://api.planningcenteronline.com/people/v2/list_categories",
      {
        headers: {
          Authorization: `Bearer ${pcoConnection.access_token}`,
        },
      },
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

      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${pcoConnection.access_token}`,
        },
      });

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
            const listResultsResponse = await fetch(listResultsNextUrl, {
              headers: {
                Authorization: `Bearer ${pcoConnection.access_token}`,
              },
            });

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
        .not("pco_id", "in", Array.from(seenCategoryIds));

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
        .not("pco_list_id", "in", Array.from(seenListIds));

      if (deleteStaleListsError) {
        console.error("Error deleting stale lists:", deleteStaleListsError);
      }

      // For list members, we need to handle the composite key differently
      const { error: deleteStaleListMembersError } = await supabase
        .from("pco_list_members")
        .delete()
        .eq("organization_id", payload.organization_id)
        .not("pco_list_id", "in", Array.from(seenListIds));

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
