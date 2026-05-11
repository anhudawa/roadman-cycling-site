import { NextResponse, type NextRequest } from "next/server";

/**
 * Method auth gate — runs at the edge before the page renders.
 *
 * Handles two redirects that previously lived in the layout and caused
 * an infinite redirect loop because the layout couldn't reliably read
 * the request pathname:
 *
 *   1. Authenticated user on /method (sales page) → /method/dashboard
 *   2. Unauthenticated user on a protected page → /method/login
 *
 * Cookie presence is a fast proxy for "has session". The actual JWT
 * verification + DB enrollment check still happens in getMethodSession()
 * inside each page component — this is just the first-pass gate.
 *
 * Also sets x-pathname so server components can read the real path
 * for rendering decisions (e.g. sales vs members header variant).
 */

const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  "/method",
  "/method/login",
  "/method/login/check-email",
  "/method/login/verify",
  "/method/checkout",
  "/method/welcome",
]);

const SESSION_COOKIE = "method_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE);

  // Authenticated user on the sales page → send to dashboard
  if (pathname === "/method" && hasSessionCookie) {
    return NextResponse.redirect(new URL("/method/dashboard", request.url));
  }

  // Unauthenticated user on a protected path → send to login
  if (!isPublicPath(pathname) && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/method/login", request.url));
  }

  // Pass through with x-pathname for rendering decisions
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  for (const p of PUBLIC_PATHS) {
    if (pathname.startsWith(`${p}/`)) return true;
  }
  return false;
}

export const config = {
  matcher: ["/method/:path*"],
};
