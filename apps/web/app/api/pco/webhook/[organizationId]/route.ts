import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@trivo/supabase/job";
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
      console.log("people.v2.events.list.created");
      console.log("data", data);
      console.log("attributes", data.data[0].attributes);
      console.log("relationships", data.data[0].relationships);
      break;
    case "people.v2.events.list.updated":
      console.log("people.v2.events.list.updated");
      console.log("data", data);
      console.log("attributes", data.data[0].attributes);
      console.log("relationships", data.data[0].relationships);
      break;
    case "people.v2.events.list.destroyed":
      console.log("people.v2.events.list.destroyed");
      console.log("data", data);
      console.log("attributes", data.data[0].attributes);
      console.log("relationships", data.data[0].relationships);
      break;
    case "people.v2.events.list_result.created":
      console.log("people.v2.events.list_result.created");
      console.log("data", data);
      console.log("attributes", data.data[0].attributes);
      console.log("relationships", data.data[0].relationships);
      break;
    case "people.v2.events.list_result.destroyed":
      console.log("people.v2.events.list_result.destroyed");
      console.log("data", data);
      console.log("attributes", data.data[0].attributes);
      console.log("relationships", data.data[0].relationships);
      break;
    case "people.v2.events.email.created":
      {
        console.log("people.v2.events.email.created");
        const emailData = JSON.parse(data.data[0].attributes.payload).data;
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
        console.log("people.v2.events.email.destroyed");
        const emailData = JSON.parse(data.data[0].attributes.payload).data;
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
        console.log("people.v2.events.email.updated");
        const emailData = JSON.parse(data.data[0].attributes.payload).data;
        const email = emailData.attributes.address;
        const pcoEmailId = emailData.id;
        const { error } = await supabase
          .from("people_emails")
          .update({ email: email })
          .eq("pco_email_id", pcoEmailId)
          .eq("organization_id", organizationId);

        if (error) {
          console.error("Error updating email:", error);
          return NextResponse.json(
            { received: false, error: "Failed to update email" },
            { status: 500 }
          );
        }
      }
      break;
    default:
      console.log("Unknown webhook name:", webhookName);
  }

  return NextResponse.json({ received: true });
}
