import { createClient } from "@church-space/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { syncPcoEmails } from "@/jobs/sync-pco-emails";
import { syncPcoLists } from "@/jobs/sync-pco-lists";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("❌ PCO OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?error=${error}`,
      );
    }

    if (!code) {
      console.error("❌ No code provided in callback");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?error=no_code`,
      );
    }

    // Exchange the code for tokens
    const tokenResponse = await fetch(
      "https://api.planningcenteronline.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          client_id: process.env.NEXT_PUBLIC_PCO_CLIENT_ID,
          client_secret: process.env.PCO_SECRET,
          redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/pco-reconnect-callback`,
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("❌ PCO token exchange failed:", tokenData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?error=token_error`,
      );
    }

    // Get current user's PCO info
    const pcoUserResponse = await fetch(
      "https://api.planningcenteronline.com/people/v2/me",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    const pcoUserData = await pcoUserResponse.json();

    if (
      pcoUserData.data.attributes.can_email_lists !== true ||
      pcoUserData.data.attributes.people_permissions !== "Manager"
    ) {
      console.error("❌ Insufficient permissions");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding/permissions-error`,
      );
    }

    // Get organization data
    const pcoOrganizationResponse = await fetch(
      `https://api.planningcenteronline.com/people/v2/people/${pcoUserData.data.id}/organization`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    const pcoOrganizationData = await pcoOrganizationResponse.json();

    // Store the connection in Supabase
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ Supabase auth error:", authError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?error=auth_error`,
      );
    }

    const { data: userDetails } = await supabase
      .from("organization_memberships")
      .select("organization_id, organizations (pco_org_id)")
      .eq("user_id", user.id)
      .eq("role", "owner");

    if (!userDetails?.length || !userDetails[0].organization_id) {
      console.error("❌ User is not organization owner");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?error=user_is_not_owner_of_organization`,
      );
    }

    if (
      userDetails[0].organizations.pco_org_id !== pcoOrganizationData.data.id
    ) {
      console.error("❌ PCO organization ID does not match");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?error=pco_organization_id_mismatch`,
      );
    }

    // Get existing webhooks from PCO
    const webhooksResponse = await fetch(
      "https://api.planningcenteronline.com/webhooks/v2/webhook_subscriptions",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "X-PCO-API-Version": "2022-10-20",
        },
      },
    );

    const webhooksData = await webhooksResponse.json();

    // Delete webhooks that match our URL pattern
    for (const webhook of webhooksData.data) {
      if (
        webhook.attributes.url.startsWith(
          "https://churchspace.co/api/pco/webhook/",
        )
      ) {
        await fetch(
          `https://api.planningcenteronline.com/webhooks/v2/webhook_subscriptions/${webhook.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              "X-PCO-API-Version": "2022-10-20",
            },
          },
        );
      }
    }

    // Delete webhooks from our database for this organization
    await supabase
      .from("pco_webhooks")
      .delete()
      .eq("organization_id", userDetails[0].organization_id);

    const { error: deleteOldConnectionError } = await supabase
      .from("pco_connections")
      .delete()
      .eq("organization_id", userDetails[0].organization_id)
      .eq("pco_organization_id", pcoOrganizationData.data.id);

    if (deleteOldConnectionError) {
      console.error(
        "❌ Error deleting old connection:",
        deleteOldConnectionError,
      );
    }

    const { error: upsertError } = await supabase
      .from("pco_connections")
      .insert({
        connected_by: user.id,
        pco_user_id: pcoUserData.data.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        scope: tokenData.scope,
        organization_id: userDetails[0].organization_id,
        last_refreshed: new Date().toISOString(),
        pco_organization_id: pcoOrganizationData.data.id,
      })
      .select("id");

    if (upsertError) {
      console.error("❌ Error creating PCO connection:", upsertError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?error=pco_connection_db_error`,
      );
    }

    // Create new webhooks
    const webhookEvents = [
      "people.v2.events.list.created",
      "people.v2.events.list.destroyed",
      "people.v2.events.list.updated",
      "people.v2.events.list.refreshed",
      "people.v2.events.list_result.created",
      "people.v2.events.list_result.destroyed",
      "people.v2.events.email.created",
      "people.v2.events.email.destroyed",
      "people.v2.events.email.updated",
      "people.v2.events.person.created",
      "people.v2.events.person.destroyed",
      "people.v2.events.person.updated",
    ];

    for (const event of webhookEvents) {
      // Create the webhook in PCO
      const createWebhookResponse = await fetch(
        "https://api.planningcenteronline.com/webhooks/v2/webhook_subscriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json",
            "X-PCO-API-Version": "2022-10-20",
          },
          body: JSON.stringify({
            data: {
              type: "WebhookSubscription",
              attributes: {
                name: event,
                url: `https://churchspace.co/api/pco/webhook/${userDetails[0].organization_id}`,
                active: true,
              },
            },
          }),
        },
      );

      if (!createWebhookResponse.ok) {
        console.error(`Failed to create PCO webhook for ${event}`);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL}?error=webhook_creation_error`,
        );
      }

      const webhookData = await createWebhookResponse.json();

      // Create the webhook record in our database
      const { error: webhookError } = await supabase
        .from("pco_webhooks")
        .insert({
          organization_id: userDetails[0].organization_id,
          name: event,
          webhook_id: webhookData.data.id,
          authenticity_secret: webhookData.data.attributes.authenticity_secret,
        });

      if (webhookError) {
        console.error(
          `Failed to create webhook record for ${event}:`,
          webhookError,
        );
        // Delete the PCO webhook we just created
        await fetch(
          `https://api.planningcenteronline.com/webhooks/v2/webhook_subscriptions/${webhookData.data.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              "X-PCO-API-Version": "2022-10-20",
            },
          },
        );
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL}?error=webhook_db_error`,
        );
      }
    }

    // Trigger the syncPcoEmails task
    await tasks.trigger<typeof syncPcoEmails>("sync-pco-emails", {
      organization_id: userDetails[0].organization_id,
    });

    // Trigger the syncPcoLists task
    await tasks.trigger<typeof syncPcoLists>("sync-pco-lists", {
      organization_id: userDetails[0].organization_id,
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/emails?pco_connection_success=true`,
    );
  } catch (error) {
    console.error("❌ Unexpected error in PCO callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?pco_connection_error=unknown`,
    );
  }
}
