import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@church-space/supabase/job";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  context: unknown
): Promise<NextResponse> {
  // Safely cast the context so that we know params has organizationId.
  const { organizationId } = (context as { params: { organizationId: string } })
    .params;
  const data = await request.json();
  const supabase = await createClient();

  const webhookId = request.headers.get("X-PCO-Webhooks-Event-ID");
  const webhookName = request.headers.get("X-PCO-Webhooks-Name");
  const webhookAuthenticity = request.headers.get(
    "X-PCO-Webhooks-Authenticity"
  );

  if (!webhookId) {
    console.error("No webhook ID found in request headers");
    return NextResponse.json(
      { received: false, error: "No webhook ID found" },
      { status: 400 }
    );
  }

  if (!webhookAuthenticity) {
    console.error("No authenticity secret found in request headers");
    return NextResponse.json(
      { received: false, error: "No authenticity secret found" },
      { status: 400 }
    );
  }

  if (!webhookName) {
    console.error("No webhook name found in request headers");
    return NextResponse.json(
      { received: false, error: "No webhook name found" },
      { status: 400 }
    );
  }

  const { data: webhookData, error: fetchError } = await supabase
    .from("pco_webhooks")
    .select("authenticity_secret")
    .eq("name", webhookName)
    .eq("organization_id", organizationId)
    .single();

  if (fetchError) {
    console.error("Error fetching webhook data:", fetchError);
    return NextResponse.json(
      { received: false, error: "Failed to fetch secret" },
      { status: 500 }
    );
  }

  if (!webhookData?.authenticity_secret) {
    console.error("No authenticity secret found for webhook ID:", webhookId);
    return NextResponse.json(
      { received: false, error: "Authenticity secret not found" },
      { status: 404 }
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
      { status: 401 }
    );
  }

  switch (webhookName) {
    case "people.v2.events.list.created":
    case "people.v2.events.list.updated":
    case "people.v2.events.list.destroyed": {
      // Parse the payload string *first*.
      const payloadString = data.data[0].attributes.payload;
      const payload = JSON.parse(payloadString);
      const listData = payload.data;
      const listId = listData.id;
      const listDescription =
        listData.attributes?.name || listData.attributes?.name_or_description;
      const lastRefreshedAt = listData.attributes?.refreshed_at;
      const totalPeople = listData.attributes?.total_people;

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
            { status: 500 }
          );
        }
      } else {
        // Upsert the list (insert or update)
        const { error: upsertError } = await supabase.from("pco_lists").upsert(
          {
            organization_id: organizationId,
            pco_list_id: listId,
            pco_list_description: listDescription,
            pco_last_refreshed_at: lastRefreshedAt,
            pco_total_people: totalPeople,
          },
          {
            onConflict: "pco_list_id",
            ignoreDuplicates: false,
          }
        );

        if (upsertError) {
          console.error("Error inserting/updating list:", upsertError);
          return NextResponse.json(
            { received: false, error: "Failed to insert/update list" },
            { status: 500 }
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

        const { error } = await supabase
          .from("people_emails")
          .insert({
            organization_id: organizationId,
            pco_person_id: pcoPersonId,
            pco_email_id: pcoEmailId,
            email: email,
          })
          .select("id");
        if (error) {
          console.error("Error inserting email:", error);
          return NextResponse.json(
            { received: false, error: "Failed to insert email" },
            { status: 500 }
          );
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
            { status: 500 }
          );
        }
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
            status: emailData.attributes.blocked ? "pco_blocked" : undefined,
          })
          .eq("pco_email_id", pcoEmailId)
          .eq("organization_id", organizationId);

        if (error) {
          console.error("Error updating email:", error);
          return NextResponse.json(
            { received: false, error: "Failed to update email" },
            { status: 500 }
          );
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
              { status: 500 }
            );
          }
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
              { status: 500 }
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
            }
          );

          if (upsertError) {
            console.error("Error inserting/updating person:", upsertError);
            return NextResponse.json(
              { received: false, error: "Failed to insert/update person" },
              { status: 500 }
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
