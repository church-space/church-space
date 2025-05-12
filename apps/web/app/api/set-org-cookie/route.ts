import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { organizationId } = await request.json();

  if (!organizationId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 },
    );
  }

  // Create a response with success status
  const response = NextResponse.json({ success: true });

  // Set the cookie
  response.cookies.set("organizationId", organizationId);

  return response;
}
