import { createClient } from "@church-space/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";

export async function POST(request: NextRequest) {
  // Check for 307 error and redirect if needed (can occur during Next.js routing)
  if (request.headers.get("x-nextjs-error-code") === "307") {
    return NextResponse.json({ error: "Temporary Redirect" }, { status: 307 });
  }

  const supabase = await createClient();
  const user = await getUserWithDetailsQuery(supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.pcoConnection) {
    return NextResponse.json(
      { error: "PCO connection not found" },
      { status: 404 },
    );
  }

  if (!user.organizationMembership) {
    return NextResponse.json(
      { error: "Organization membership not found" },
      { status: 404 },
    );
  }

  // Get the current PCO connection
  const { data: pcoConnection } = await supabase
    .from("pco_connections")
    .select("*")
    .eq("organization_id", user.organizationMembership.organization_id)
    .single();

  if (!pcoConnection) {
    return NextResponse.json(
      { error: "PCO connection not found for organization" },
      { status: 404 },
    );
  }

  // ---------------------------------------------------------------------------
  // Guard against multiple simultaneous refresh attempts
  // If the token has already been refreshed by another request within the last
  // two hours, we can safely skip the refresh call and return current data.
  // ---------------------------------------------------------------------------
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  if (pcoConnection.last_refreshed) {
    const lastRefreshed = new Date(pcoConnection.last_refreshed);

    // If we've refreshed within the last two hours, return current data.
    if (lastRefreshed > twoHoursAgo) {
      return NextResponse.json({
        id: pcoConnection.id.toString(),
        accessToken: pcoConnection.access_token,
        refreshToken: pcoConnection.refresh_token,
        lastRefreshed: pcoConnection.last_refreshed,
        message: "Token recently refreshed, skipping.",
      });
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
    const errorText = response ? await response.text() : "No response";
    console.error("Failed to refresh PCO token:", {
      status: response?.status,
      statusText: response?.statusText,
      error: errorText,
      clientId: process.env.NEXT_PUBLIC_PCO_CLIENT_ID ? "present" : "missing",
      clientSecret: process.env.PCO_SECRET ? "present" : "missing",
    });

    // If refresh fails (e.g., invalid grant), attempt to delete the connection
    if (response?.status === 400 || response?.status === 401) {
      // Common statuses for invalid refresh token
      await supabase
        .from("pco_connections")
        .delete()
        .eq("id", pcoConnection.id);
      return NextResponse.json(
        {
          error: "Failed to refresh token, connection removed.",
          requiresReconnect: true,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: `Failed to refresh PCO token: ${errorText}` },
      { status: response?.status || 500 },
    );
  }

  const data = await response.json();
  const refreshedAt = new Date().toISOString();

  // Update the database with the new tokens
  const { error: updateError } = await supabase
    .from("pco_connections")
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      last_refreshed: refreshedAt,
    })
    .eq("id", pcoConnection.id);

  if (updateError) {
    console.error("Failed to update PCO tokens:", updateError);
    // Even if DB update fails, the refresh *might* have worked, but the client needs to know something's wrong.
    // Consider returning an error or the old data depending on desired behavior.
    return NextResponse.json(
      { error: "Failed to update database after token refresh." },
      { status: 500 },
    );
  }

  // Optional: Verify the new token works by fetching PCO user data
  // (This adds latency but ensures the token is valid and permissions are correct)
  const pcoUserResponse = await fetch(
    "https://api.planningcenteronline.com/people/v2/me",
    {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    },
  );

  if (!pcoUserResponse || !pcoUserResponse.ok) {
    console.error("Failed to get PCO user data after refresh:", {
      status: pcoUserResponse?.status,
      statusText: pcoUserResponse?.statusText,
    });
    // If fetching user data fails, the token might be invalid or permissions changed.
    // Delete the connection as a safety measure.
    await supabase.from("pco_connections").delete().eq("id", pcoConnection.id);
    return NextResponse.json(
      {
        error: "Failed to verify refreshed token, connection removed.",
        requiresReconnect: true,
      },
      { status: 400 },
    );
  }

  const pcoUserData = await pcoUserResponse.json();

  if (pcoUserData.data.attributes.people_permissions !== "Manager") {
    console.warn("PCO User permissions changed to non-Manager after refresh.");
    // Permissions changed, invalidate connection.
    await supabase.from("pco_connections").delete().eq("id", pcoConnection.id);
    return NextResponse.json(
      {
        error:
          "User permissions insufficient after refresh, connection removed.",
        requiresReconnect: true,
      },
      { status: 403 },
    );
  }

  // Return the updated PCO data
  return NextResponse.json({
    id: pcoConnection.id.toString(),
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    lastRefreshed: refreshedAt,
    message: "Token refreshed successfully.",
  });
}
