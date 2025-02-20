import { NextRequest } from "next/server";
import { createClient } from "@trivo/supabase/job";
import crypto from "crypto";

interface RouteParams {
  organizationId: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  const data = await req.json();
  const supabase = await createClient();

  const webhookId = req.headers.get("X-PCO-Webhooks-Event-ID");
  const webhookName = req.headers.get("X-PCO-Webhooks-Name");
  const webhookAuthenticity = req.headers.get("X-PCO-Webhooks-Authenticity");

  if (!webhookId) {
    console.error("No webhook ID found in request headers");
    return Response.json(
      { received: false, error: "No webhook ID found" },
      { status: 400 }
    );
  }

  const { data: webhookData, error: fetchError } = await supabase
    .from("pco_webhooks")
    .select("authenticity_secret")
    .eq("webhook_id", webhookId)
    .eq("organization_id", params.organizationId)
    .single();

  if (fetchError) {
    console.error("Error fetching webhook data:", fetchError);
    return Response.json(
      { received: false, error: "Failed to fetch secret" },
      { status: 500 }
    );
  }

  if (!webhookData?.authenticity_secret) {
    console.error("No authenticity secret found for webhook ID:", webhookId);
    return Response.json(
      { received: false, error: "Authenticity secret not found" },
      { status: 404 }
    );
  }

  const secret = webhookData.authenticity_secret;

  // Verify the signature
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(data))
    .digest("hex");

  if (hmac !== webhookAuthenticity) {
    console.error("Webhook authenticity verification failed.");
    return Response.json(
      { received: false, error: "Invalid signature" },
      { status: 401 }
    );
  }

  console.log("Webhook authenticity verified successfully!");
  if (webhookData) {
    console.log(webhookName, webhookData.authenticity_secret);
  }

  return Response.json({ received: true });
}
