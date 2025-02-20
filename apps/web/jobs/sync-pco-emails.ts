import { task, wait } from "@trigger.dev/sdk/v3";
import { createClient } from "@trivo/supabase/job";
import { isValidEmail } from "../lib/utils";

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
        `No PCO connection found for org ${payload.organization_id}`
      );
    }

    let nextUrl =
      "https://api.planningcenteronline.com/people/v2/emails?where[primary]=true&where[blocked]=false&per_page=100";
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

      console.log("response", response);

      if (!response.ok) {
        throw new Error(
          `PCO API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      console.log("data", data);

      // Process each email
      for (const email of data.data) {
        try {
          const emailAddress = email.attributes.address;

          // Validate email format
          if (!isValidEmail(emailAddress)) {
            console.warn(`Invalid email format: ${emailAddress}`);
            continue;
          }

          console.log("adding email", email);
          console.log("adding address", emailAddress);
          // Insert into people_emails table
          await supabase.from("people_emails").insert({
            organization_id: payload.organization_id,
            pco_person_id: email.relationships.person.data.id,
            pco_email_id: email.id,
            email: emailAddress,
          });
        } catch (error) {
          // Log error but continue processing other emails
          console.error(`Error processing email ${email.id}:`, error);
        }
      }

      // Get next page URL
      nextUrl = data.links.next;
      processedCount += data.data.length;
      pageCount++; // Increment page count
      console.log(`Processed page ${processedCount}, nextUrl: ${nextUrl}`);
    }

    await supabase
      .from("pco_sync_status")
      .upsert({
        organization_id: payload.organization_id,
        emails_synced: true,
        emails_synced_at: new Date().toISOString(),
      })
      .eq("organization_id", payload.organization_id);

    return { message: "PCO emails sync completed" };
  },
});
