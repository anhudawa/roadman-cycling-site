import { NextResponse } from "next/server";
import { ASK_SESSION_COOKIE, ASK_SESSION_COOKIE_OPTS } from "@/lib/ask-auth/auth";

export const runtime = "nodejs";

/**
 * POST /api/ask/auth/signout
 *
 * Clears the ask_session cookie. Returns 200 even if there was no
 * cookie to clear — idempotent.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ASK_SESSION_COOKIE, "", {
    ...ASK_SESSION_COOKIE_OPTS,
    maxAge: 0,
  });
  return response;
}
