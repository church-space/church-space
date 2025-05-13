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

      // Check for missing Email-ID and Automation-ID headers
      const clickedEventHeaders = payload.data.headers;
      const clickedEmailIdHeader = getHeaderValue(
        clickedEventHeaders,
        "X-Entity-Email-ID",
      );
      const clickedAutomationIdHeader = getHeaderValue(
        clickedEventHeaders,
        "X-Entity-Automation-ID",
      );

      if (!clickedEmailIdHeader && !clickedAutomationIdHeader) {
        return NextResponse.json({ success: true });
      }

      const clickedIds = validateIds(clickedEventHeaders);
      if (!clickedIds) {
        console.error("email.clicked: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }

      const clickedLink = payload.data.click?.link;
      const shouldInsertClick =
        clickedLink &&
        !clickedLink.startsWith("https://churchspace.co/email-manager?");

      // Only record clicked links that don't start with the email manager URL
      if (shouldInsertClick) {
        try {
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
        return NextResponse.json({ success: true });
      }

      // Check for missing Email-ID and Automation-ID headers
      const sentEventHeaders = payload.data.headers;
      const sentEmailIdHeader = getHeaderValue(
        sentEventHeaders,
        "X-Entity-Email-ID",
      );
      const sentAutomationIdHeader = getHeaderValue(
        sentEventHeaders,
        "X-Entity-Automation-ID",
      );

      if (!sentEmailIdHeader && !sentAutomationIdHeader) {
        return NextResponse.json({ success: true });
      }

      const sentIds = validateIds(sentEventHeaders);
      if (!sentIds) {
        console.error("email.sent: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
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
        return NextResponse.json({ success: true });
      }

      // Check for missing Email-ID and Automation-ID headers
      const deliveredEventHeaders = payload.data.headers;
      const deliveredEmailIdHeader = getHeaderValue(
        deliveredEventHeaders,
        "X-Entity-Email-ID",
      );
      const deliveredAutomationIdHeader = getHeaderValue(
        deliveredEventHeaders,
        "X-Entity-Automation-ID",
      );

      if (!deliveredEmailIdHeader && !deliveredAutomationIdHeader) {
        return NextResponse.json({ success: true });
      }

      const deliveredIds = validateIds(deliveredEventHeaders);
      if (!deliveredIds) {
        console.error("email.delivered: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
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
        return NextResponse.json({ success: true });
      }

      // Check for missing Email-ID and Automation-ID headers
      const delayedEventHeaders = payload.data.headers;
      const delayedEmailIdHeader = getHeaderValue(
        delayedEventHeaders,
        "X-Entity-Email-ID",
      );
      const delayedAutomationIdHeader = getHeaderValue(
        delayedEventHeaders,
        "X-Entity-Automation-ID",
      );

      if (!delayedEmailIdHeader && !delayedAutomationIdHeader) {
        return NextResponse.json({ success: true });
      }

      const delayedIds = validateIds(delayedEventHeaders);
      if (!delayedIds) {
        console.error("email.delivery_delayed: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
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
        return NextResponse.json({ success: true });
      }

      // Check for missing Email-ID and Automation-ID headers
      const complainedEventHeaders = payload.data.headers;
      const complainedEmailIdHeader = getHeaderValue(
        complainedEventHeaders,
        "X-Entity-Email-ID",
      );
      const complainedAutomationIdHeader = getHeaderValue(
        complainedEventHeaders,
        "X-Entity-Automation-ID",
      );

      if (!complainedEmailIdHeader && !complainedAutomationIdHeader) {
        return NextResponse.json({ success: true });
      }

      const ids = validateIds(complainedEventHeaders); // Renamed for clarity within this scope
      if (!ids) {
        console.error("email.complained: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
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
        return NextResponse.json({ success: true });
      }

      // Check for missing Email-ID and Automation-ID headers
      const bouncedEventHeaders = payload.data.headers;
      const bouncedEmailIdHeader = getHeaderValue(
        bouncedEventHeaders,
        "X-Entity-Email-ID",
      );
      const bouncedAutomationIdHeader = getHeaderValue(
        bouncedEventHeaders,
        "X-Entity-Automation-ID",
      );

      if (!bouncedEmailIdHeader && !bouncedAutomationIdHeader) {
        return NextResponse.json({ success: true });
      }

      const bouncedIds = validateIds(bouncedEventHeaders);
      if (!bouncedIds) {
        console.error("email.bounced: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
      }

      const organizationId = extractOrganizationId(bouncedEventHeaders);

      const upsertPromise = (() => {
        const upsertData = {
          resend_email_id: payload.data.email_id,
          status: "bounced" as const,
          email_id: bouncedIds.email_id,
          people_email_id: bouncedIds.people_email_id,
          email_address: payload.data.to[0],
          automation_id: bouncedIds.automation_id,
        };

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
        await Promise.all([upsertPromise, updateStatusPromise]);
      } catch (error) {
        console.error("email.bounced: Error in Promise.all:", error);
        // Decide if we should return an error response
        // For now, we still return success as Resend expects 2xx
      }
      break;
    case "email.opened":
      // Return success if headers are undefined
      if (!payload.data.headers) {
        return NextResponse.json({ success: true });
      }

      // Check for missing Email-ID and Automation-ID headers
      const openedEventHeaders = payload.data.headers;
      const openedEmailIdHeader = getHeaderValue(
        openedEventHeaders,
        "X-Entity-Email-ID",
      );
      const openedAutomationIdHeader = getHeaderValue(
        openedEventHeaders,
        "X-Entity-Automation-ID",
      );

      if (!openedEmailIdHeader && !openedAutomationIdHeader) {
        return NextResponse.json({ success: true });
      }

      const openedIds = validateIds(openedEventHeaders);
      if (!openedIds) {
        console.error("email.opened: Invalid IDs in headers.");
        return new NextResponse(
          "Invalid email_id or people_email_id in headers",
          { status: 400 },
        );
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

  return NextResponse.json({ success: true });
}
