import { createClient } from "@church-space/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";

export async function GET(request: NextRequest) {
  // Check for 307 error and redirect if needed (can occur during Next.js routing)
  if (request.headers.get("x-nextjs-error-code") === "307") {
    return NextResponse.redirect(new URL("/homepage", request.url));
  }

  const supabase = await createClient();
  const user = await getUserWithDetailsQuery(supabase);

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user.pcoConnection) {
    return NextResponse.redirect(new URL("/pco-reconnect", request.url));
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
    return NextResponse.redirect(new URL("/pco-reconnect", request.url));
  }

  // ---------------------------------------------------------------------------
  // Guard against multiple simultaneous refresh attempts
  // If the token has already been refreshed by another request within the last
  // two hours, we can safely skip the refresh call and continue. This prevents
  // a second request from trying to use a refresh token that has just been
  // invalidated by the first successful refresh, which results in the
  // `invalid_grant` error and an unnecessary redirect loop.
  // ---------------------------------------------------------------------------
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  if (pcoConnection.last_refreshed) {
    const lastRefreshed = new Date(pcoConnection.last_refreshed);

    // If we've refreshed within the last two hours, short-circuit early.
    if (lastRefreshed > twoHoursAgo) {
      const returnUrl = request.nextUrl.searchParams.get("return_to");
      const finalReturnUrl =
        returnUrl && returnUrl !== "/emails"
          ? returnUrl
          : request.headers
              .get("referer")
              ?.replace(request.headers.get("origin") || "", "") || "/emails";

      return NextResponse.redirect(new URL(finalReturnUrl, request.url));
    }
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

  if (!response || !response.ok) {
    // Check for 307 status and redirect to homepage
    if (response?.status === 307) {
      return NextResponse.redirect(new URL("/homepage", request.url));
    }

    const errorText = response ? await response.text() : "No response";
    console.error("Failed to refresh PCO token:", {
      status: response?.status,
      statusText: response?.statusText,
      error: errorText,
      clientId: process.env.NEXT_PUBLIC_PCO_CLIENT_ID ? "present" : "missing",
      clientSecret: process.env.PCO_SECRET ? "present" : "missing",
    });

    // Delete the PCO connection
    await supabase.from("pco_connections").delete().eq("id", pcoConnection.id);

    return NextResponse.redirect(new URL("/pco-reconnect", request.url));
  }

  const data = await response.json();

  // Update the database with the new tokens - Ensure this completes before redirecting
  const { error: updateError } = await supabase
    .from("pco_connections")
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      last_refreshed: new Date().toISOString(),
    })
    .eq("id", pcoConnection.id);

  if (updateError) {
    console.error("Failed to update PCO tokens:", updateError);
    return NextResponse.redirect(new URL("/pco-reconnect", request.url));
  }

  // Get current user's PCO info
  const pcoUserResponse = await fetch(
    "https://api.planningcenteronline.com/people/v2/me",
    {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    },
  );

  if (!pcoUserResponse || !pcoUserResponse.ok) {
    // Check for 307 status and redirect to homepage
    if (pcoUserResponse?.status === 307) {
      return NextResponse.redirect(new URL("/homepage", request.url));
    }

    console.error("Failed to get PCO user data:", {
      status: pcoUserResponse?.status,
      statusText: pcoUserResponse?.statusText,
    });

    // Delete the PCO connection
    await supabase.from("pco_connections").delete().eq("id", pcoConnection.id);

    return NextResponse.redirect(new URL("/pco-reconnect", request.url));
  }

  const pcoUserData = await pcoUserResponse.json();

  if (pcoUserData.data.attributes.people_permissions !== "Manager") {
    // Delete the PCO connection instead of org membership
    const { error: deleteError } = await supabase
      .from("pco_connections")
      .delete()
      .eq("id", pcoConnection.id);

    if (deleteError) {
      console.error("Failed to delete PCO connection:", deleteError);
    }

    return NextResponse.redirect(new URL("/pco-reconnect", request.url));
  }

  // Redirect back to the original URL
  const returnUrl = request.nextUrl.searchParams.get("return_to");
  const finalReturnUrl =
    returnUrl && returnUrl !== "/emails"
      ? returnUrl
      : request.headers
          .get("referer")
          ?.replace(request.headers.get("origin") || "", "") || "/emails";

  // Add a small delay to ensure database updates are fully processed before redirect
  await new Promise((resolve) => setTimeout(resolve, 100));

  return NextResponse.redirect(new URL(finalReturnUrl, request.url));
}
