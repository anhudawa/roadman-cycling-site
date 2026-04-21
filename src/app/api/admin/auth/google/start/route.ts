import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthUrl,
  configured,
  createState,
  STATE_COOKIE,
  CALENDAR_SCOPE_EMAIL,
} from "@/lib/admin/google-oauth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!configured()) {
    return NextResponse.json(
      {
        error:
          "Google OAuth not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI on Vercel.",
      },
      { status: 503 }
    );
  }

  const { searchParams } = req.nextUrl;
  const next = searchParams.get("next") ?? "/admin";
  // Allow caller to request calendar scope (the login page can pre-hint for
  // Anthony via `?email=anthony@...`); otherwise we default to base scopes.
  // First-time Anthony sign-in should use ?calendar=1 to grant calendar.
  const wantsCalendar =
    searchParams.get("calendar") === "1" ||
    searchParams.get("email") === CALENDAR_SCOPE_EMAIL;

  const state = createState(next);
  const authUrl = buildAuthUrl(state, {
    includeCalendar: wantsCalendar,
    forceConsent: wantsCalendar, // needed to re-issue refresh_token
    next,
  });

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 min
  });
  return res;
}
