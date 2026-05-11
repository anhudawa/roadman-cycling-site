import { NextResponse, type NextRequest } from "next/server";

/* ═══════════════════════════════════════════════════════════════
 * Method Auth Middleware
 * ═══════════════════════════════════════════════════════════════
 *
 * This is the SOLE auth-routing gate for /method/*. No other
 * file should redirect based on auth state. Pages read sessions
 * for display — they do NOT redirect.
 *
 * Rules (in evaluation order):
 *
 *   1. Has cookie + on sales page (/method) → dashboard
 *   2. No cookie + on protected page → login
 *   3. Everything else → pass through
 *
 * "Protected" = any /method/* path that isn't in GUEST_PATHS.
 * Cookie presence is a fast proxy — real JWT + DB verification
 * happens in getMethodSession() inside page server components.
 * ═══════════════════════════════════════════════════════════════ */

const COOKIE = "method_session";

/**
 * Paths accessible WITHOUT a session cookie.
 * Every other /method/* path is protected.
 */
const GUEST_PATHS = new Set([
  "/method",
  "/method/checkout",
  "/method/login",
  "/method/login/check-email",
  "/method/login/verify",
  "/method/welcome",
]);

function isGuestPath(pathname: string): boolean {
  return GUEST_PATHS.has(pathname);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasCookie = request.cookies.has(COOKIE);

  /* ── Rule 1: authenticated user on sales page → dashboard ── */
  if (pathname === "/method" && hasCookie) {
    return NextResponse.redirect(
      new URL("/method/dashboard", request.url),
    );
  }

  /* ── Rule 2: guest on protected page → login ── */
  if (!isGuestPath(pathname) && !hasCookie) {
    return NextResponse.redirect(
      new URL("/method/login", request.url),
    );
  }

  /* ── Rule 3: pass through ── */
  const headers = new Headers(request.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/method", "/method/:path*"],
};
