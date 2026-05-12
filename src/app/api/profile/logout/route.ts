import { NextResponse } from "next/server";
import { RIDER_SESSION_COOKIE, RIDER_SESSION_COOKIE_OPTS } from "@/lib/profile-auth/auth";

/**
 * POST /api/profile/logout
 *
 * Clears the rider_session cookie. Returns 200 — the page does the redirect.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(RIDER_SESSION_COOKIE, "", {
    ...RIDER_SESSION_COOKIE_OPTS,
    maxAge: 0,
  });
  return response;
}
