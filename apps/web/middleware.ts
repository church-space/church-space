import { updateSession } from "@trivo/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // Add the current pathname to the headers
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  if (request.nextUrl.pathname.startsWith("/api/pco")) {
    console.log("Handling PCO request in middleware");
    return NextResponse.json(
      { message: "Handled by middleware" },
      { status: 200 }
    );
  }

  // First update the headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Then update the session
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
