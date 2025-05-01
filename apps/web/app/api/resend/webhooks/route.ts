import "server-only";

import {
  insertEmailLinkClicked,
  upsertEmailRecipient,
  updatePeopleEmailStatus,
} from "@church-space/supabase/mutations/resend";
import { createClient } from "@church-space/supabase/job";
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
    to: string[];
    click?: {
      link: string;
    };
    headers: { name: string; value: string }[];
  };
};

// Add this helper function at the top of the file
function getHeaderValue(
  headers: { name: string; value: string }[],
  name: string,
): string | undefined {
  return headers.find((h) => h.name === name)?.value;
}

// Add validation helper
function validateIds(headers: { name: string; value: string }[]): {
  email_id?: number;
  people_email_id: number;
  automation_id?: number;
} | null {
  const emailIdStr = getHeaderValue(headers, "X-Entity-Email-ID");
  const peopleEmailIdStr = getHeaderValue(headers, "X-Entity-People-Email-ID");
  const automationIdStr = getHeaderValue(headers, "X-Entity-Automation-ID");

  const emailId = emailIdStr ? Number(emailIdStr) : undefined;
  const peopleEmailId = peopleEmailIdStr ? Number(peopleEmailIdStr) : NaN;
  const automationId = automationIdStr ? Number(automationIdStr) : undefined;

  if (
    (emailIdStr && isNaN(emailId!)) ||
    isNaN(peopleEmailId) ||
    (automationIdStr && isNaN(automationId!))
  ) {
    console.error("Invalid email_id, people_email_id, or automation_id:", {
      emailIdStr,
      peopleEmailIdStr,
      automationIdStr,
    });
    return null;
  }

  return {
    email_id: emailId,
    people_email_id: peopleEmailId,
    automation_id: automationId,
  };
}

// Add this helper function after the other helper functions
function extractOrganizationId(
  headers: { name: string; value: string }[],
): string | undefined {
  const mailerHeader = getHeaderValue(headers, "X-Mailer");
  if (!mailerHeader) return undefined;

  // Updated regex to match UUID format within the Customer identifier
  const match = mailerHeader.match(/Customer ([0-9a-f-]+)/i);
  return match?.[1];
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Get the raw body and signature
  const rawBody = await request.text();

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
      const clickedIds = validateIds(payload.data.headers);
      if (!clickedIds) {
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }

      // Return success if no email_id or automation_id
      if (!clickedIds.email_id && !clickedIds.automation_id) {
        return NextResponse.json({ success: true });
      }

      // Only record clicked links that don't start with the email manager URL
      if (
        !payload.data.click?.link.startsWith(
          "https://churchspace.co/email-manager?",
        )
      ) {
        await insertEmailLinkClicked(supabase, {
          resend_email_id: payload.data.email_id,
          link_clicked: payload.data.click!.link,
          email_id: clickedIds.email_id!,
        });
      }

      await upsertEmailRecipient(supabase, {
        resend_email_id: payload.data.email_id,
        status: "opened",
        email_id: clickedIds.email_id,
        people_email_id: clickedIds.people_email_id,
        email_address: payload.data.to[0],
        automation_id: clickedIds.automation_id,
      });
      break;
    case "email.sent":
      const sentIds = validateIds(payload.data.headers);
      if (!sentIds) {
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }

      // Return success if no email_id or automation_id
      if (!sentIds.email_id && !sentIds.automation_id) {
        return NextResponse.json({ success: true });
      }

      await upsertEmailRecipient(supabase, {
        resend_email_id: payload.data.email_id,
        status: "sent",
        email_id: sentIds.email_id,
        people_email_id: sentIds.people_email_id,
        email_address: payload.data.to[0],
        automation_id: sentIds.automation_id,
      });
      break;
    case "email.delivered":
      const deliveredIds = validateIds(payload.data.headers);
      if (!deliveredIds) {
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }

      // Return success if no email_id or automation_id
      if (!deliveredIds.email_id && !deliveredIds.automation_id) {
        return NextResponse.json({ success: true });
      }

      await upsertEmailRecipient(supabase, {
        resend_email_id: payload.data.email_id,
        status: "delivered",
        email_id: deliveredIds.email_id,
        people_email_id: deliveredIds.people_email_id,
        email_address: payload.data.to[0],
        automation_id: deliveredIds.automation_id,
      });
      break;
    case "email.delivery_delayed":
      const delayedIds = validateIds(payload.data.headers);
      if (!delayedIds) {
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }

      // Return success if no email_id or automation_id
      if (!delayedIds.email_id && !delayedIds.automation_id) {
        return NextResponse.json({ success: true });
      }

      await upsertEmailRecipient(supabase, {
        resend_email_id: payload.data.email_id,
        status: "delivery_delayed",
        email_id: delayedIds.email_id,
        people_email_id: delayedIds.people_email_id,
        email_address: payload.data.to[0],
        automation_id: delayedIds.automation_id,
      });
      break;
    case "email.complained":
      const ids = validateIds(payload.data.headers);
      if (!ids) {
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }

      // Return success if no email_id or automation_id
      if (!ids.email_id && !ids.automation_id) {
        return NextResponse.json({ success: true });
      }

      await upsertEmailRecipient(supabase, {
        resend_email_id: payload.data.email_id,
        status: "complained",
        email_id: ids.email_id,
        people_email_id: ids.people_email_id,
        email_address: payload.data.to[0],
        automation_id: ids.automation_id,
      });
      break;
    case "email.bounced":
      const bouncedIds = validateIds(payload.data.headers);
      if (!bouncedIds) {
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }

      // Return success if no email_id or automation_id
      if (!bouncedIds.email_id && !bouncedIds.automation_id) {
        return NextResponse.json({ success: true });
      }

      const organizationId = extractOrganizationId(payload.data.headers);
      await Promise.all([
        upsertEmailRecipient(supabase, {
          resend_email_id: payload.data.email_id,
          status: "bounced",
          email_id: bouncedIds.email_id,
          people_email_id: bouncedIds.people_email_id,
          email_address: payload.data.to[0],
          automation_id: bouncedIds.automation_id,
        }),
        ...(organizationId
          ? [
              updatePeopleEmailStatus(supabase, {
                status: "cleaned",
                reason: "email bounced",
                email_address: payload.data.to[0],
                organization_id: organizationId,
              }),
            ]
          : []),
      ]);
      break;
    case "email.opened":
      const openedIds = validateIds(payload.data.headers);
      if (!openedIds) {
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }

      // Return success if no email_id or automation_id
      if (!openedIds.email_id && !openedIds.automation_id) {
        return NextResponse.json({ success: true });
      }

      await upsertEmailRecipient(supabase, {
        resend_email_id: payload.data.email_id,
        status: "opened",
        email_id: openedIds.email_id,
        people_email_id: openedIds.people_email_id,
        email_address: payload.data.to[0],
        automation_id: openedIds.automation_id,
      });
      break;
  }

  return NextResponse.json({ success: true });
}
