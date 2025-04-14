import { updateSession } from "@church-space/supabase/middleware";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // Add the current pathname to the headers
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  // Create a new request with updated headers
  const requestWithHeaders = new NextRequest(request.url, {
    headers: requestHeaders,
  });

  // Update the session with the modified request
  return await updateSession(requestWithHeaders);
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
