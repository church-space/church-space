import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get("organizationId");
  const returnTo = searchParams.get("returnTo") || "/";

  if (!organizationId) {
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  // Create a response to redirect
  const response = NextResponse.redirect(new URL(returnTo, request.url));

  // Set the cookie using headers instead of cookies() API
  response.cookies.set("organizationId", organizationId);

  // Return the response with the cookie
  return response;
}
