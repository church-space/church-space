import { createClient } from "@trivo/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserWithDetailsQuery } from "@trivo/supabase/get-user-with-details";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const user = await getUserWithDetailsQuery(supabase);

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user.userDetails[0].organization_id) {
    return NextResponse.redirect(
      new URL("/settings#pco-connection", request.url)
    );
  }

  // Get the current PCO connection
  const { data: pcoConnection } = await supabase
    .from("pco_connections")
    .select("*")
    .eq("organization_id", user.userDetails[0].organization_id)
    .single();

  if (!pcoConnection) {
    return NextResponse.redirect(
      new URL("/settings#pco-connection", request.url)
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
    }
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
      new URL("/settings#pco-connection", request.url)
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

  // Redirect back to the original URL
  const returnUrl = request.nextUrl.searchParams.get("return_to") || "/home";
  return NextResponse.redirect(new URL(returnUrl, request.url));
}
