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

/**
 * Paths that don't require a session cookie. The /method root is the
 * sales page — it's public, but it's handled by its own explicit check
 * above (authenticated → dashboard), so it's listed here too.
 *
 * IMPORTANT: only list leaf paths and their direct children. The
 * `isPublicPath` helper below also matches child segments (e.g.
 * /method/login/check-email matches because /method/login is listed),
 * but we deliberately exclude "/method" from the prefix list to avoid
 * treating /method/dashboard, /method/account etc. as public.
 */
const PUBLIC_EXACT: ReadonlySet<string> = new Set([
  "/method",
  "/method/login",
  "/method/login/check-email",
  "/method/login/verify",
  "/method/checkout",
  "/method/welcome",
]);

/**
 * Prefixes whose child segments are also public. "/method" itself is
 * NOT here — only specific subtrees that need prefix matching.
 */
const PUBLIC_PREFIXES: readonly string[] = [
  "/method/login",
  "/method/checkout",
  "/method/welcome",
];

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
  if (PUBLIC_EXACT.has(pathname)) return true;
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(`${prefix}/`)) return true;
  }
  return false;
}

export const config = {
  // "/method" explicitly listed — ":path*" is zero-or-more segments but
  // some Next.js versions only match when at least one segment is present.
  matcher: ["/method", "/method/:path*"],
};
