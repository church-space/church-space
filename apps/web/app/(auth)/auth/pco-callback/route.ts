import { createClient } from "@church-space/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { syncPcoEmails } from "@/jobs/sync-pco-emails";
import { syncPcoLists } from "@/jobs/sync-pco-lists";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    const supabase = await createClient();

    // const user_id = searchParams.get("user_id");

    // console.log("user_id", user_id);

    if (error) {
      console.error("PCO OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?error=${error}`,
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?error=no_code`,
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
          redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/pco-callback`,
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("PCO token error:", tokenData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?error=token_error`,
      );
    }

    const checkExistingConnection = await fetch(
      "https://api.planningcenteronline.com/api/v2/connected_applications/3520/people",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    const checkExistingConnectionData = await checkExistingConnection.json();

    if (
      checkExistingConnectionData.data &&
      checkExistingConnectionData.data.length > 0
    ) {
      const connectedPerson = checkExistingConnectionData.data[0];
      const firstName = connectedPerson.attributes.first_name;
      const lastName = connectedPerson.attributes.last_name;
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/pco-existing-connection?connectedByFirstName=${firstName}&connectedByLastName=${lastName}`,
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

    const pcoOrganizationResponse = await fetch(
      `https://api.planningcenteronline.com/people/v2/people/${pcoUserData.data.id}/organization`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    const pcoOrganizationData = await pcoOrganizationResponse.json();

    if (pcoUserData.data.attributes.people_permissions !== "Manager") {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding/permissions-error`,
      );
    }

    // Store the connection in Supabase

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?error=auth_error`,
      );
    }

    const uuid = uuidv4();

    const organizationId = `${uuid}`;

    console.log("organizationId", organizationId);

    const { data: organization, error: insertOrganizationError } =
      await supabase.from("organizations").insert({
        id: organizationId,
        name: pcoOrganizationData.data.attributes.name,
        created_by: user.id,
        pco_org_id: pcoOrganizationData.data.id,
      });

    if (insertOrganizationError) {
      console.error("Supabase error:", insertOrganizationError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?error=organization_db_error`,
      );
    }

    // Helper function to delete organization and redirect
    const handleError = async (error: any, errorType: string) => {
      console.error("Supabase error:", error);
      // Delete the organization if it exists
      if (organizationId) {
        await supabase.from("organizations").delete().eq("id", organizationId);
      }
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?error=${errorType}`,
      );
    };

    const { error: insertOrganizationMembershipError } = await supabase
      .from("organization_memberships")
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        role: "owner",
      });

    if (insertOrganizationMembershipError) {
      return handleError(
        insertOrganizationMembershipError,
        "organization_membership_db_error",
      );
    }

    const { error: updateUserError } = await supabase
      .from("users")
      .update({
        first_name: pcoUserData.data.attributes.first_name,
        last_name: pcoUserData.data.attributes.last_name,
        avatar_url: pcoUserData.data.attributes.avatar,
      })
      .eq("id", user.id);

    if (updateUserError) {
      return handleError(updateUserError, "user_db_error");
    }

    const { error: upsertError } = await supabase
      .from("pco_connections")
      .insert({
        connected_by: user.id,
        pco_user_id: pcoUserData.data.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        scope: tokenData.scope,
        organization_id: organizationId,
        last_refreshed: new Date().toISOString(),
        pco_organization_id: pcoOrganizationData.data.id,
      })
      .select("id");

    if (upsertError) {
      return handleError(upsertError, "pco_connection_db_error");
    }

    // First create webhook entries in Supabase
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
      // First create the webhook in PCO
      const createWebhookResponse = await fetch(
        "https://api.planningcenteronline.com/webhooks/v2/subscriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              type: "Subscription",
              attributes: {
                name: event,
                url: `https://churchspace.co/api/pco/webhook/${organizationId}`,
                active: true,
              },
            },
          }),
        },
      );

      if (!createWebhookResponse.ok) {
        console.error(`Failed to create PCO webhook for ${event}`);
        return handleError(
          new Error(`Failed to create PCO webhook for ${event}`),
          "webhook_creation_error",
        );
      }

      const webhookData = await createWebhookResponse.json();

      // Then create the webhook record in our database
      const { error: webhookError } = await supabase
        .from("pco_webhooks")
        .insert({
          organization_id: organizationId,
          name: event,
          webhook_id: webhookData.data.id,
          authenticity_secret: webhookData.data.attributes.authenticity_secret,
        })
        .select("id")
        .single();

      if (webhookError) {
        console.error(
          `Failed to create webhook record for ${event}:`,
          webhookError,
        );
        // Delete the PCO webhook we just created
        await fetch(
          `https://api.planningcenteronline.com/webhooks/v2/subscriptions/${webhookData.data.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          },
        );
        return handleError(webhookError, "webhook_db_error");
      }
    }

    // Trigger the syncPcoEmails task
    await tasks.trigger<typeof syncPcoEmails>("sync-pco-emails", {
      organization_id: organizationId,
    });

    // Trigger the syncPcoLists task
    await tasks.trigger<typeof syncPcoLists>("sync-pco-lists", {
      organization_id: organizationId,
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/emails?pco_connection_success=true`,
    );
  } catch (error) {
    console.error("PCO callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?pco_connection_error=unknown`,
    );
  }
}
