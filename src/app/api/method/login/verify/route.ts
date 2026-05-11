import { NextResponse, type NextRequest } from "next/server";
import {
  consumeLoginToken,
  signSessionToken,
  METHOD_SESSION_COOKIE,
} from "@/lib/method/auth";

/**
 * GET /api/method/login/verify?token=...
 *
 * Consumes a magic-link token. On success, sets the `method_session`
 * cookie directly on the redirect response and 302s to /method/dashboard.
 *
 * IMPORTANT: we set the cookie on the NextResponse object itself (not
 * via the `cookies()` helper from next/headers) because the helper
 * writes to a mutable store that may not be flushed onto a separately
 * created NextResponse.redirect(). Setting it on the response object
 * guarantees the Set-Cookie header is present on the actual 302.
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

  const { jwt, maxAge, secure } = signSessionToken(enrollment);

  // Redirect straight to /method/dashboard — avoids the extra hop
  // through /method that the middleware would add anyway.
  const response = NextResponse.redirect(`${baseUrl}/method/dashboard`);
  response.cookies.set(METHOD_SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  // Drop a non-httpOnly hint so the login page can show "Welcome back"
  // on future visits. Carries no PII — it's just a boolean flag.
  response.cookies.set("method_return_hint", "1", {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return response;
}
