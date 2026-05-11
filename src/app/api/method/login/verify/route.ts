import { NextResponse, type NextRequest } from "next/server";
import { consumeLoginToken, setMethodSessionCookie } from "@/lib/method/auth";

/**
 * GET /api/method/login/verify?token=...
 *
 * Consumes a magic-link token. On success, sets the `method_session`
 * cookie and 302-redirects to /method (the dashboard). On failure
 * (expired, used, malformed, refunded) redirects back to /method/login
 * with `?error=invalid` so the page can render an explanatory message.
 *
 * GET is appropriate here because the token is single-use and the action
 * is idempotent on success (re-clicking the link after sign-in just
 * lands the user on the dashboard already authenticated).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() ?? "";
  const baseUrl = url.origin;

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/method/login?error=invalid`);
  }

  const enrollment = await consumeLoginToken(token);
  if (!enrollment) {
    return NextResponse.redirect(`${baseUrl}/method/login?error=invalid`);
  }

  await setMethodSessionCookie(enrollment);
  return NextResponse.redirect(`${baseUrl}/method`);
}
