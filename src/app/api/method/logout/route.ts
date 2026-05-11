import { NextResponse } from "next/server";
import { clearMethodSessionCookie } from "@/lib/method/auth";

export async function POST() {
  await clearMethodSessionCookie();
  return NextResponse.json({ ok: true });
}

/**
 * GET /api/method/logout
 *
 * Convenience endpoint: visiting this URL in a browser clears the
 * method_session cookie and redirects to /method/login. Useful when
 * a stale httpOnly cookie causes a redirect loop that can't be fixed
 * by clearing cookies from JavaScript.
 */
export async function GET(request: Request) {
  await clearMethodSessionCookie();
  const url = new URL(request.url);
  return NextResponse.redirect(`${url.origin}/method/login`);
}
