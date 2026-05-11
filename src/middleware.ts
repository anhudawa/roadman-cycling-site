import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight middleware that forwards the request pathname as a header
 * so server-component layouts can read it via `headers()`.
 *
 * Next.js App Router doesn't expose the pathname to server components
 * out of the box — this is the recommended workaround.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/method/:path*"],
};
