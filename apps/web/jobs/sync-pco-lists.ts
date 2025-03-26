import { createClient } from "@church-space/supabase/job";
import { task } from "@trigger.dev/sdk/v3";

export const syncPcoLists = task({
  id: "sync-pco-lists",

  run: async (payload: { organization_id: string }, io) => {
    console.log(
      `Starting PCO lists sync for organization: ${payload.organization_id}`,
    );
    const supabase = createClient();

    // Get PCO connection for this organization
    console.log(`Fetching PCO connection for org: ${payload.organization_id}`);
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
    console.log(`Found PCO connection for org: ${payload.organization_id}`);

    // First sync list categories
    console.log(`Syncing PCO list categories`);
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
    console.log(`Retrieved ${categoriesData.data.length} categories from PCO`);

    // Process each category
    for (const category of categoriesData.data) {
      console.log(
        `Upserting category: ${category.attributes.name} (ID: ${category.id})`,
      );
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
    console.log(`Starting to sync PCO lists`);
    let nextUrl =
      "https://api.planningcenteronline.com/people/v2/lists?include=category";
    let processedCount = 0;
    let pageCount = 0;
    const maxPages = 1000; // Add a limit for the number of pages to process.

    while (nextUrl && pageCount < maxPages) {
      // Check for nextUrl and page limit
      console.log(`Fetching lists page ${pageCount + 1}, URL: ${nextUrl}`);

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
      console.log(
        `Retrieved ${data.data.length} lists on page ${pageCount + 1}`,
      );

      // Process each list
      for (const list of data.data) {
        try {
          const listId = list.id;
          const listDescription = list.attributes.name_or_description;
          const lastRefreshedAt = list.attributes.refreshed_at;
          const totalPeople = list.attributes.total_people;

          console.log(
            `Processing list: ${listDescription} (ID: ${listId}), with ${totalPeople} people`,
          );

          // Extract category ID
          let categoryId = null;
          if (list.relationships.category.data) {
            categoryId = list.relationships.category.data.id;
            console.log(`List has category ID: ${categoryId}`);
          } else {
            console.log(`List has no category`);
          }

          // Insert into pco_lists table
          console.log(`Upserting list into database: ${listId}`);
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
          console.log(`Fetching members for list: ${listId}`);
          let listResultsNextUrl = `https://api.planningcenteronline.com/people/v2/lists/${listId}/list_results`;
          let listResultsPage = 0;
          const maxListResultsPages = 1000;

          while (listResultsNextUrl && listResultsPage < maxListResultsPages) {
            console.log(
              `Fetching list results page ${listResultsPage + 1} for list ${listId}, URL: ${listResultsNextUrl}`,
            );
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
            console.log(
              `Retrieved ${listResultsData.data.length} members for list ${listId} on page ${listResultsPage + 1}`,
            );

            for (const result of listResultsData.data) {
              const personId = result.relationships.person.data.id;
              console.log(
                `Processing member: Person ID ${personId} for list ${listId}`,
              );

              // Insert into pco_list_members table
              try {
                await supabase.from("pco_list_members").insert({
                  organization_id: payload.organization_id,
                  pco_list_id: listId,
                  pco_person_id: personId,
                });
              } catch (memberError) {
                console.error(
                  `Error inserting list member (List: ${listId}, Person: ${personId}):`,
                  memberError,
                );
              }
            }

            listResultsNextUrl = listResultsData.links?.next; // Use optional chaining
            listResultsPage++;
          }
          console.log(`Completed processing all members for list ${listId}`);
        } catch (error) {
          // Log error but continue processing other lists
          console.error(`Error processing list ${list.id}:`, error);
        }
      }

      // Get next page URL
      nextUrl = data.links.next;
      processedCount += data.data.length;
      pageCount++; // Increment page count
      console.log(
        `Total lists processed so far: ${processedCount}, moving to page ${pageCount + 1}`,
      );
    }

    console.log(
      `Updating sync status for organization: ${payload.organization_id}`,
    );
    await supabase.from("pco_sync_status").upsert({
      organization_id: payload.organization_id,
      type: "lists",
      synced_at: new Date().toISOString(),
    });

    console.log(
      `PCO lists sync completed for organization: ${payload.organization_id}, processed ${processedCount} lists`,
    );
    return { message: "PCO lists sync completed" };
  },
});
