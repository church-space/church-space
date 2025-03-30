import { createClient } from "@church-space/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("PCO OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?error=${error}`,
      );
    }

    if (!code) {
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
      console.error("PCO token error:", tokenData);
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
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding/permissions-error`,
      );
    }

    // Store the connection in Supabase
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?error=auth_error`,
      );
    }

    const { data: userDetails } = await supabase
      .from("organization_memberships")
      .select("organization_id")
      .eq("user_id", user.id);

    if (!userDetails || !userDetails[0].organization_id) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?error=user_details_error`,
      );
    }

    const { error: deleteOldConnectionError } = await supabase
      .from("pco_connections")
      .delete()
      .eq("organization_id", userDetails[0].organization_id)
      .eq(
        "pco_organization_id",
        pcoUserData.data.relationships.organization.data.id,
      );

    if (deleteOldConnectionError) {
      console.error("Supabase error:", deleteOldConnectionError);
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
        pco_organization_id:
          pcoUserData.data.relationships.organization.data.id,
      })
      .select("id");

    if (upsertError) {
      console.error("Supabase error:", upsertError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?error=pco_connection_db_error`,
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/email?pco_connection_success=true`,
    );
  } catch (error) {
    console.error("PCO callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?pco_connection_error=unknown`,
    );
  }
}
