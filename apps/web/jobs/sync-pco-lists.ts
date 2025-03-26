import { createClient } from "@church-space/supabase/job";
import { task } from "@trigger.dev/sdk/v3";

export const syncPcoLists = task({
  id: "sync-pco-lists",

  run: async (payload: { organization_id: string }, io) => {
    const supabase = createClient();

    // Get PCO connection for this organization
    const { data: pcoConnection, error: pcoError } = await supabase
      .from("pco_connections")
      .select("*")
      .eq("organization_id", payload.organization_id)
      .single();

    if (pcoError || !pcoConnection) {
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
      throw new Error(
        `PCO API error fetching categories: ${categoriesResponse.status} ${categoriesResponse.statusText}`,
      );
    }

    const categoriesData = await categoriesResponse.json();

    // Process each category
    for (const category of categoriesData.data) {
      await supabase.from("pco_list_categories").upsert(
        {
          organization_id: payload.organization_id,
          pco_name: category.attributes.name,
          pco_id: category.id,
          is_public: false,
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
        throw new Error(
          `PCO API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Process each list
      for (const list of data.data) {
        try {
          const listId = list.id;
          const listDescription = list.attributes.name_or_description;
          const lastRefreshedAt = list.attributes.refreshed_at;
          const totalPeople = list.attributes.total_people;

          // Extract category ID
          let categoryId = null;
          if (list.relationships.category.data) {
            categoryId = list.relationships.category.data.id;
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
                `PCO API error fetching list results: ${listResultsResponse.status} ${listResultsResponse.statusText}`,
              ); // More specific error log
              throw new Error(
                `PCO API error fetching list results: ${listResultsResponse.status} ${listResultsResponse.statusText}`,
              );
            }

            const listResultsData = await listResultsResponse.json();

            for (const result of listResultsData.data) {
              const personId = result.relationships.person.data.id;

              // Insert into pco_list_members table
              await supabase.from("pco_list_members").insert({
                organization_id: payload.organization_id,
                pco_list_id: listId,
                pco_person_id: personId,
              });
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

    await supabase.from("pco_sync_status").upsert({
      organization_id: payload.organization_id,
      type: "lists",
      synced_at: new Date().toISOString(),
    });

    return { message: "PCO lists sync completed" };
  },
});
