import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const redirectTo = searchParams.get("redirectTo") || "/";

  if (!id) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Set the organization cookie
  const cookieStore = await cookies();
  cookieStore.set("organizationId", id);

  // Redirect to the specified URL
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
