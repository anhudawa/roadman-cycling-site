import { NextResponse, type NextRequest } from "next/server";
import {
  consumeRiderLoginToken,
  signRiderSessionToken,
  RIDER_SESSION_COOKIE,
  RIDER_SESSION_COOKIE_OPTS,
} from "@/lib/profile-auth/auth";

/**
 * GET /api/profile/login/verify?token=...
 *
 * Consumes the one-time magic-link token, sets the `rider_session`
 * cookie on the redirect response, and sends the rider to /profile.
 * Invalid / expired / already-used tokens redirect back to the login
 * page with ?error=invalid.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const rawToken = url.searchParams.get("token")?.trim() ?? "";
  const origin = url.origin;

  if (!rawToken) {
    return NextResponse.redirect(`${origin}/profile/login?error=invalid`);
  }

  let profile;
  try {
    profile = await consumeRiderLoginToken(rawToken);
  } catch (err) {
    console.error("[profile/verify] token consumption failed:", err);
    return NextResponse.redirect(`${origin}/profile/login?error=invalid`);
  }

  if (!profile) {
    return NextResponse.redirect(`${origin}/profile/login?error=invalid`);
  }

  const { jwt } = signRiderSessionToken(profile);
  const response = NextResponse.redirect(`${origin}/profile`);
  response.cookies.set(RIDER_SESSION_COOKIE, jwt, RIDER_SESSION_COOKIE_OPTS);
  // Non-PII boolean hint so /profile/login can show "Welcome back".
  response.cookies.set("rider_return_hint", "1", {
    httpOnly: false,
    secure: RIDER_SESSION_COOKIE_OPTS.secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
