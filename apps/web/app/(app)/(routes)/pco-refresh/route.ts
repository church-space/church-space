import { createClient } from "@church-space/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const user = await getUserWithDetailsQuery(supabase);

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user.pcoConnection) {
    return NextResponse.redirect(
      new URL("/settings#pco-connection", request.url),
    );
  }
  if (!user.organizationMembership) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Get the current PCO connection
  const { data: pcoConnection } = await supabase
    .from("pco_connections")
    .select("*")
    .eq("organization_id", user.organizationMembership.organization_id)
    .single();

  if (!pcoConnection) {
    return NextResponse.redirect(
      new URL("/settings#pco-connection", request.url),
    );
  }

  // Refresh the token with Planning Center
  const response = await fetch(
    "https://api.planningcenteronline.com/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.NEXT_PUBLIC_PCO_CLIENT_ID!,
        client_secret: process.env.PCO_SECRET!,
        refresh_token: pcoConnection.refresh_token,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to refresh PCO token:", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      clientId: process.env.NEXT_PUBLIC_PCO_CLIENT_ID ? "present" : "missing",
      clientSecret: process.env.PCO_SECRET ? "present" : "missing",
    });
    return NextResponse.redirect(
      new URL("/settings#pco-connection", request.url),
    );
  }

  const data = await response.json();

  // Update the database with the new tokens
  await supabase
    .from("pco_connections")
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      last_refreshed: new Date().toISOString(),
    })
    .eq("id", pcoConnection.id);

  // Get current user's PCO info
  const pcoUserResponse = await fetch(
    "https://api.planningcenteronline.com/people/v2/me",
    {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    },
  );

  const pcoUserData = await pcoUserResponse.json();

  if (
    !(
      pcoUserData.data.attributes.people_permissions === "Manager" ||
      pcoUserData.data.attributes.people_permissions === "Editor"
    ) ||
    !pcoUserData.data.attributes.can_email_lists
  ) {
    const { error: deleteError } = await supabase
      .from("organization_memberships")
      .delete()
      .eq("user_id", user.user.id);

    if (deleteError) {
      console.error("Failed to delete organization membership:", deleteError);
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/pco-no-permissions`,
    );
  }

  // Redirect back to the original URL
  const returnUrl = request.nextUrl.searchParams.get("return_to");
  const finalReturnUrl =
    returnUrl && returnUrl !== "/email"
      ? returnUrl
      : request.headers
          .get("referer")
          ?.replace(request.headers.get("origin") || "", "") || "/email";

  return NextResponse.redirect(new URL(finalReturnUrl, request.url));
}
