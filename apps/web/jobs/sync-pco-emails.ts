import "server-only";
import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";

export const syncPcoEmails = task({
  id: "sync-pco-emails",

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

    let nextUrl =
      "https://api.planningcenteronline.com/people/v2/people?include=emails&where%5Bstatus%5D=active";
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

      // Process each person
      for (const person of data.data) {
        try {
          // Insert into people table
          const { error: personError } = await supabase.from("people").insert({
            pco_id: person.id,
            first_name: person.attributes.first_name,
            middle_name: person.attributes.middle_name,
            last_name: person.attributes.last_name,
            nickname: person.attributes.nickname,
            given_name: person.attributes.given_name,
            organization_id: payload.organization_id,
          });

          if (personError) {
            console.error(`Error inserting person ${person.id}:`, personError);
            continue; // Continue to the next person if insert fails
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

            let status = "subscribed";

            if (pcoBlocked) {
              status = "pco_blocked";
            }

            // Insert into people_emails table
            const { error: emailError } = await supabase
              .from("people_emails")
              .insert({
                organization_id: payload.organization_id,
                pco_person_id: person.id,
                pco_email_id: email.id,
                email: emailAddress,
                status: status as "unsubscribed" | "pco_blocked" | "subscribed",
              });

            if (emailError) {
              console.error(
                `Error inserting email ${email.id} for person ${person.id}:`,
                emailError,
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

    await supabase.from("pco_sync_status").upsert({
      organization_id: payload.organization_id,
      type: "emails", // Consider changing this to "people_and_emails" or similar
      synced_at: new Date().toISOString(),
    });

    return { message: "PCO people and emails sync completed" };
  },
});
