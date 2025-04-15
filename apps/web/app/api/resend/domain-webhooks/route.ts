import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

const secret = process.env.RESEND_DOMAIN_WEBHOOK_SECRET;

type DomainRecord = {
  record: string;
  name: string;
  type: string;
  ttl: string;
  status: string;
  value: string;
  priority?: number;
};

type ResendWebhookEvent = {
  type: "domain.updated";
  data: {
    id: string;
    name: string;
    status: string;
    created_at: string;
    region: string;
    records: DomainRecord[];
  };
};

export async function POST(request: NextRequest) {
  // Check if this is a test webhook
  if (request.headers.get("X-Entity-Church-Space-Test") === "true") {
    return NextResponse.json({ success: true });
  }

  // Get the headers we need to verify
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  // Make sure the headers are present
  if (!svixId || !svixTimestamp || !svixSignature || !secret) {
    return new NextResponse("Missing webhook headers", { status: 400 });
  }

  // Get the raw body
  const rawBody = await request.text();

  // Create an object of headers needed for verification
  const webhookHeaders = {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  };

  // Verify the webhook
  let payload: ResendWebhookEvent;
  try {
    const wh = new Webhook(secret);
    payload = wh.verify(rawBody, webhookHeaders) as ResendWebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new NextResponse("Webhook verification failed", { status: 400 });
  }

  // Handle domain.updated event
  switch (payload.type) {
    case "domain.updated":
      console.log("Domain updated:", {
        domain: payload.data.name,
        status: payload.data.status,
        records: payload.data.records,
      });
      break;
  }

  return NextResponse.json({ success: true });
}
