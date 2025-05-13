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
  headers: { name: string; value: string }[] | undefined,
  name: string,
): string | undefined {
  return headers?.find((h) => h.name === name)?.value;
}

// Add validation helper
function validateIds(headers: { name: string; value: string }[] | undefined): {
  email_id?: number;
  people_email_id: number;
  automation_id?: number;
} | null {
  if (!headers) {
    console.error("Headers are undefined");
    return null;
  }

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
  headers: { name: string; value: string }[] | undefined,
): string | undefined {
  if (!headers) {
    return undefined;
  }

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
      // Return success if headers are undefined
      if (!payload.data.headers) {
        return NextResponse.json({ success: true });
      }

      const clickedIds = validateIds(payload.data.headers);
      if (!clickedIds) {
        console.error("email.clicked: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }

      // Return success if no email_id or automation_id
      if (!clickedIds.email_id && !clickedIds.automation_id) {
        return NextResponse.json({ success: true });
      }

      const clickedLink = payload.data.click?.link;
      const shouldInsertClick =
        clickedLink &&
        !clickedLink.startsWith("https://churchspace.co/email-manager?");

      // Only record clicked links that don't start with the email manager URL
      if (shouldInsertClick) {
        try {
          console.log("email.clicked: Calling insertEmailLinkClicked with:", {
            resend_email_id: payload.data.email_id,
            link_clicked: clickedLink!,
            email_id: clickedIds.email_id!,
          });
          const { error: clickError } = await insertEmailLinkClicked(supabase, {
            resend_email_id: payload.data.email_id,
            link_clicked: clickedLink!,
            email_id: clickedIds.email_id!,
          });
          if (clickError) {
            console.error(
              "email.clicked: Error from insertEmailLinkClicked:",
              clickError,
            );
          } else {
            console.log("email.clicked: insertEmailLinkClicked successful.");
          }
        } catch (e) {
          console.error(
            "email.clicked: Exception calling insertEmailLinkClicked:",
            e,
          );
        }
      }

      try {
        const upsertData = {
          resend_email_id: payload.data.email_id,
          status: "opened" as const, // Explicitly setting as 'opened'
          email_id: clickedIds.email_id,
          people_email_id: clickedIds.people_email_id,
          email_address: payload.data.to[0],
          automation_id: clickedIds.automation_id,
        };
        console.log(
          "email.clicked: Calling upsertEmailRecipient with:",
          upsertData,
        );
        const { error: upsertError } = await upsertEmailRecipient(
          supabase,
          upsertData,
        );
        if (upsertError) {
          console.error(
            "email.clicked: Error from upsertEmailRecipient:",
            upsertError,
          );
        } else {
          console.log("email.clicked: upsertEmailRecipient successful.");
        }
      } catch (e) {
        console.error(
          "email.clicked: Exception calling upsertEmailRecipient:",
          e,
        );
      }
      break;
    case "email.sent":
      // Return success if headers are undefined
      if (!payload.data.headers) {
        console.log("email.sent: Headers undefined, returning success.");
        return NextResponse.json({ success: true });
      }

      const sentIds = validateIds(payload.data.headers);
      if (!sentIds) {
        console.error("email.sent: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }
      console.log("email.sent: Validated IDs:", sentIds);

      // Return success if no email_id or automation_id
      if (!sentIds.email_id && !sentIds.automation_id) {
        console.log(
          "email.sent: No email_id or automation_id, returning success.",
        );
        return NextResponse.json({ success: true });
      }

      try {
        const upsertData = {
          resend_email_id: payload.data.email_id,
          status: "sent" as const,
          email_id: sentIds.email_id,
          people_email_id: sentIds.people_email_id,
          email_address: payload.data.to[0],
          automation_id: sentIds.automation_id,
        };
        console.log(
          "email.sent: Calling upsertEmailRecipient with:",
          upsertData,
        );
        const { error: upsertError } = await upsertEmailRecipient(
          supabase,
          upsertData,
        );
        if (upsertError) {
          console.error(
            "email.sent: Error from upsertEmailRecipient:",
            upsertError,
          );
        } else {
          console.log("email.sent: upsertEmailRecipient successful.");
        }
      } catch (e) {
        console.error("email.sent: Exception calling upsertEmailRecipient:", e);
      }
      break;
    case "email.delivered":
      // Return success if headers are undefined
      if (!payload.data.headers) {
        console.log("email.delivered: Headers undefined, returning success.");
        return NextResponse.json({ success: true });
      }

      const deliveredIds = validateIds(payload.data.headers);
      if (!deliveredIds) {
        console.error("email.delivered: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }
      console.log("email.delivered: Validated IDs:", deliveredIds);

      // Return success if no email_id or automation_id
      if (!deliveredIds.email_id && !deliveredIds.automation_id) {
        console.log(
          "email.delivered: No email_id or automation_id, returning success.",
        );
        return NextResponse.json({ success: true });
      }

      try {
        const upsertData = {
          resend_email_id: payload.data.email_id,
          status: "delivered" as const,
          email_id: deliveredIds.email_id,
          people_email_id: deliveredIds.people_email_id,
          email_address: payload.data.to[0],
          automation_id: deliveredIds.automation_id,
        };
        console.log(
          "email.delivered: Calling upsertEmailRecipient with:",
          upsertData,
        );
        const { error: upsertError } = await upsertEmailRecipient(
          supabase,
          upsertData,
        );
        if (upsertError) {
          console.error(
            "email.delivered: Error from upsertEmailRecipient:",
            upsertError,
          );
        } else {
          console.log("email.delivered: upsertEmailRecipient successful.");
        }
      } catch (e) {
        console.error(
          "email.delivered: Exception calling upsertEmailRecipient:",
          e,
        );
      }
      break;
    case "email.delivery_delayed":
      // Return success if headers are undefined
      if (!payload.data.headers) {
        console.log(
          "email.delivery_delayed: Headers undefined, returning success.",
        );
        return NextResponse.json({ success: true });
      }

      const delayedIds = validateIds(payload.data.headers);
      if (!delayedIds) {
        console.error("email.delivery_delayed: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }
      console.log("email.delivery_delayed: Validated IDs:", delayedIds);

      // Return success if no email_id or automation_id
      if (!delayedIds.email_id && !delayedIds.automation_id) {
        console.log(
          "email.delivery_delayed: No email_id or automation_id, returning success.",
        );
        return NextResponse.json({ success: true });
      }

      try {
        const upsertData = {
          resend_email_id: payload.data.email_id,
          status: "delivery_delayed" as const,
          email_id: delayedIds.email_id,
          people_email_id: delayedIds.people_email_id,
          email_address: payload.data.to[0],
          automation_id: delayedIds.automation_id,
        };
        console.log(
          "email.delivery_delayed: Calling upsertEmailRecipient with:",
          upsertData,
        );
        const { error: upsertError } = await upsertEmailRecipient(
          supabase,
          upsertData,
        );
        if (upsertError) {
          console.error(
            "email.delivery_delayed: Error from upsertEmailRecipient:",
            upsertError,
          );
        } else {
          console.log(
            "email.delivery_delayed: upsertEmailRecipient successful.",
          );
        }
      } catch (e) {
        console.error(
          "email.delivery_delayed: Exception calling upsertEmailRecipient:",
          e,
        );
      }
      break;
    case "email.complained":
      // Return success if headers are undefined
      if (!payload.data.headers) {
        console.log("email.complained: Headers undefined, returning success.");
        return NextResponse.json({ success: true });
      }

      const ids = validateIds(payload.data.headers); // Renamed for clarity within this scope
      if (!ids) {
        console.error("email.complained: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }
      console.log("email.complained: Validated IDs:", ids);

      // Return success if no email_id or automation_id
      if (!ids.email_id && !ids.automation_id) {
        console.log(
          "email.complained: No email_id or automation_id, returning success.",
        );
        return NextResponse.json({ success: true });
      }

      try {
        const upsertData = {
          resend_email_id: payload.data.email_id,
          status: "complained" as const,
          email_id: ids.email_id,
          people_email_id: ids.people_email_id,
          email_address: payload.data.to[0],
          automation_id: ids.automation_id,
        };

        const { error: upsertError } = await upsertEmailRecipient(
          supabase,
          upsertData,
        );
        if (upsertError) {
          console.error(
            "email.complained: Error from upsertEmailRecipient:",
            upsertError,
          );
        } else {
          console.log("email.complained: upsertEmailRecipient successful.");
        }
      } catch (e) {
        console.error(
          "email.complained: Exception calling upsertEmailRecipient:",
          e,
        );
      }
      break;
    case "email.bounced":
      // Return success if headers are undefined
      if (!payload.data.headers) {
        console.log("email.bounced: Headers undefined, returning success.");
        return NextResponse.json({ success: true });
      }

      const bouncedIds = validateIds(payload.data.headers);
      if (!bouncedIds) {
        console.error("email.bounced: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }
      console.log("email.bounced: Validated IDs:", bouncedIds);

      // Return success if no email_id or automation_id
      if (!bouncedIds.email_id && !bouncedIds.automation_id) {
        console.log(
          "email.bounced: No email_id or automation_id, returning success.",
        );
        return NextResponse.json({ success: true });
      }

      const organizationId = extractOrganizationId(payload.data.headers);
      console.log(`email.bounced: Extracted organizationId: ${organizationId}`);

      const upsertPromise = (() => {
        const upsertData = {
          resend_email_id: payload.data.email_id,
          status: "bounced" as const,
          email_id: bouncedIds.email_id,
          people_email_id: bouncedIds.people_email_id,
          email_address: payload.data.to[0],
          automation_id: bouncedIds.automation_id,
        };
        console.log(
          "email.bounced: Calling upsertEmailRecipient with:",
          upsertData,
        );
        return upsertEmailRecipient(supabase, upsertData).then(({ error }) => {
          if (error) {
            console.error(
              "email.bounced: Error from upsertEmailRecipient:",
              error,
            );
            throw error; // Rethrow to fail Promise.all
          } else {
            console.log("email.bounced: upsertEmailRecipient successful.");
          }
        });
      })();

      const updateStatusPromise = organizationId
        ? (() => {
            const statusData = {
              status: "cleaned" as const,
              reason: "email bounced",
              email_address: payload.data.to[0],
              organization_id: organizationId,
            };
            console.log(
              "email.bounced: Calling updatePeopleEmailStatus with:",
              statusData,
            );
            return updatePeopleEmailStatus(supabase, statusData).then(
              ({ error }) => {
                if (error) {
                  console.error(
                    "email.bounced: Error from updatePeopleEmailStatus:",
                    error,
                  );
                  throw error; // Rethrow to fail Promise.all
                } else {
                  console.log(
                    "email.bounced: updatePeopleEmailStatus successful.",
                  );
                }
              },
            );
          })()
        : Promise.resolve(); // If no organizationId, resolve immediately

      try {
        console.log(
          "email.bounced: Awaiting Promise.all for upsert and update status.",
        );
        await Promise.all([upsertPromise, updateStatusPromise]);
        console.log("email.bounced: Promise.all successful.");
      } catch (error) {
        console.error("email.bounced: Error in Promise.all:", error);
        // Decide if we should return an error response
        // For now, we still return success as Resend expects 2xx
      }
      break;
    case "email.opened":
      // Return success if headers are undefined
      if (!payload.data.headers) {
        console.log("email.opened: Headers undefined, returning success.");
        return NextResponse.json({ success: true });
      }

      const openedIds = validateIds(payload.data.headers);
      if (!openedIds) {
        console.error("email.opened: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }
      console.log("email.opened: Validated IDs:", openedIds);

      // Return success if no email_id or automation_id
      if (!openedIds.email_id && !openedIds.automation_id) {
        console.log(
          "email.opened: No email_id or automation_id, returning success.",
        );
        return NextResponse.json({ success: true });
      }

      try {
        const upsertData = {
          resend_email_id: payload.data.email_id,
          status: "opened" as const,
          email_id: openedIds.email_id,
          people_email_id: openedIds.people_email_id,
          email_address: payload.data.to[0],
          automation_id: openedIds.automation_id,
        };
        console.log(
          "email.opened: Calling upsertEmailRecipient with:",
          upsertData,
        );
        const { error: upsertError } = await upsertEmailRecipient(
          supabase,
          upsertData,
        );
        if (upsertError) {
          console.error(
            "email.opened: Error from upsertEmailRecipient:",
            upsertError,
          );
        } else {
          console.log("email.opened: upsertEmailRecipient successful.");
        }
      } catch (e) {
        console.error(
          "email.opened: Exception calling upsertEmailRecipient:",
          e,
        );
      }
      break;
  }

  console.log(`Finished processing webhook type: ${payload.type}`);
  return NextResponse.json({ success: true });
}
