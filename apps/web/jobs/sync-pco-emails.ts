import "server-only";
import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";

export const syncPcoEmails = task({
  id: "sync-pco-emails",

  run: async (payload: { organization_id: string }, io) => {
    const supabase = createClient();

    // Track all PCO IDs we see during sync
    const seenPeopleIds = new Set<string>();
    const seenEmailIds = new Set<string>();

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

            let status = "subscribed";

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
                  status: status as
                    | "unsubscribed"
                    | "pco_blocked"
                    | "subscribed",
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
