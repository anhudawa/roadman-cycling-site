import { NextResponse } from "next/server";
import {
  METHOD_SESSION_COOKIE,
  SESSION_COOKIE_OPTS,
} from "@/lib/method/auth";

/** Cookie-clearing attributes — same as session opts but maxAge 0. */
const CLEAR = { ...SESSION_COOKIE_OPTS, maxAge: 0 };

/**
 * POST /api/method/logout
 *
 * Called by the LogoutButton component. Clears the session cookie
 * directly on the JSON response.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(METHOD_SESSION_COOKIE, "", CLEAR);
  return response;
}

/**
 * GET /api/method/logout
 *
 * Convenience: visiting this URL in a browser clears the httpOnly
 * cookie and redirects to /method/login. Escape hatch when a stale
 * cookie causes problems.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(`${origin}/method/login`);
  response.cookies.set(METHOD_SESSION_COOKIE, "", CLEAR);
  response.cookies.set("method_return_hint", "", {
    httpOnly: false,
    secure: SESSION_COOKIE_OPTS.secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
