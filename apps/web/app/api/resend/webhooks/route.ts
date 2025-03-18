import {
  insertEmailLinkClicked,
  upsertEmailRecipient,
} from "@church-space/supabase/mutations/resend";
import { createClient } from "@church-space/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

const secret = process.env.RESEND_WEBHOOK_SECRET;

// Add these type definitions at the top of the file
type ResendWebhookEvent = {
  type:
    | "email.clicked"
    | "email.sent"
    | "email.delivered"
    | "email.delivery_delayed"
    | "email.complained"
    | "email.bounced"
    | "email.opened";
  data: {
    email_id: string;
    click?: {
      link: string;
    };
  };
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Get the raw body and signature
  const rawBody = await request.text();

  // Get the headers we need to verify
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  // Make sure the headers are present
  if (!svixId || !svixTimestamp || !svixSignature || !secret) {
    return new NextResponse("Missing webhook headers", { status: 400 });
  }

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

  // Handle email status events
  switch (payload.type) {
    case "email.clicked":
      await insertEmailLinkClicked(supabase, {
        resend_email_id: payload.data.email_id,
        link_clicked: payload.data.click!.link,
      });
      break;
    case "email.sent":
      await upsertEmailRecipient(supabase, {
        resend_email_id: payload.data.email_id,
        status: "sent",
      });
      break;
    case "email.delivered":
      await upsertEmailRecipient(supabase, {
        resend_email_id: payload.data.email_id,
        status: "delivered",
      });
      break;
    case "email.delivery_delayed":
      await upsertEmailRecipient(supabase, {
        resend_email_id: payload.data.email_id,
        status: "delivery_delayed",
      });
      break;
    case "email.complained":
      await upsertEmailRecipient(supabase, {
        resend_email_id: payload.data.email_id,
        status: "complained",
      });
      break;
    case "email.bounced":
      await upsertEmailRecipient(supabase, {
        resend_email_id: payload.data.email_id,
        status: "bounced",
      });
      break;
    case "email.opened":
      await upsertEmailRecipient(supabase, {
        resend_email_id: payload.data.email_id,
        status: "opened",
      });
      break;
  }

  return NextResponse.json({ success: true });
}
