import { NextResponse, type NextRequest } from "next/server";
import {
  consumeLoginToken,
  signSessionToken,
  METHOD_SESSION_COOKIE,
  SESSION_COOKIE_OPTS,
} from "@/lib/method/auth";

/**
 * GET /api/method/login/verify?token=...
 *
 * Consumes a one-time magic-link token.
 *
 * On success: sets `method_session` cookie directly on the 302
 * response, then redirects to /method/dashboard. The cookie is
 * set on the response object — NOT via the cookies() helper —
 * so the Set-Cookie header is guaranteed to be present.
 *
 * On failure: redirects to /method/login?error=invalid.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const rawToken = url.searchParams.get("token")?.trim() ?? "";
  const origin = url.origin;

  if (!rawToken) {
    return NextResponse.redirect(`${origin}/method/login?error=invalid`);
  }

  let enrollment;
  try {
    enrollment = await consumeLoginToken(rawToken);
  } catch (err) {
    console.error("[method/verify] token consumption failed:", err);
    return NextResponse.redirect(`${origin}/method/login?error=invalid`);
  }

  if (!enrollment) {
    return NextResponse.redirect(`${origin}/method/login?error=invalid`);
  }

  /* ── Build redirect with cookie attached ── */
  const { jwt } = signSessionToken(enrollment);
  const response = NextResponse.redirect(`${origin}/method/dashboard`);

  response.cookies.set(METHOD_SESSION_COOKIE, jwt, SESSION_COOKIE_OPTS);

  // Non-httpOnly hint so the login page can say "Welcome back" on
  // future visits. No PII — just a boolean flag.
  response.cookies.set("method_return_hint", "1", {
    httpOnly: false,
    secure: SESSION_COOKIE_OPTS.secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
