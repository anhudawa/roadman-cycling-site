import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  exchangeCodeForTokens,
  fetchUserInfo,
  isWhitelisted,
  sanitizeNext,
  STATE_COOKIE,
  verifyState,
  CALENDAR_SCOPE_EMAIL,
} from "@/lib/admin/google-oauth";
import { createSessionCookieForUser } from "@/lib/admin/auth";

export const runtime = "nodejs";

function errRedirect(req: NextRequest, message: string): NextResponse {
  const url = new URL("/admin/login", req.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const err = searchParams.get("error");

  if (err) return errRedirect(req, `Google: ${err}`);
  if (!code || !stateParam)
    return errRedirect(req, "Missing OAuth code or state");

  const stateCookie = req.cookies.get(STATE_COOKIE)?.value;
  if (!stateCookie || stateCookie !== stateParam)
    return errRedirect(req, "OAuth state mismatch — try again");

  const next = verifyState(stateParam);
  if (!next) return errRedirect(req, "Invalid OAuth state signature");

  // 1. Exchange code → tokens
  let tokens: Awaited<ReturnType<typeof exchangeCodeForTokens>>;
  try {
    tokens = await exchangeCodeForTokens(code);
  } catch (e) {
    return errRedirect(
      req,
      e instanceof Error ? e.message : "Token exchange failed"
    );
  }

  // 2. Fetch userinfo
  let info: Awaited<ReturnType<typeof fetchUserInfo>>;
  try {
    info = await fetchUserInfo(tokens.access_token);
  } catch (e) {
    return errRedirect(
      req,
      e instanceof Error ? e.message : "userinfo fetch failed"
    );
  }

  const email = info.email?.toLowerCase();
  if (!email) return errRedirect(req, "Google did not return an email");
  if (!info.email_verified)
    return errRedirect(req, "Google email is not verified");
  if (!isWhitelisted(email))
    return errRedirect(req, `${email} is not authorized for this workspace`);

  // 3. Link to team_users row
  const rows = await db
    .select()
    .from(teamUsers)
    .where(eq(teamUsers.email, email))
    .limit(1);
  const user = rows[0];
  if (!user || !user.active)
    return errRedirect(req, `No active team_user for ${email}`);

  // 4. Persist google link + refresh_token (if provided this round)
  const patch: Partial<typeof teamUsers.$inferInsert> = {
    googleSub: info.sub,
    googleLinkedAt: new Date(),
    lastLoginAt: new Date(),
  };
  if (tokens.refresh_token) {
    patch.googleRefreshToken = tokens.refresh_token;
  }
  await db.update(teamUsers).set(patch).where(eq(teamUsers.id, user.id));

  // 5. Set session cookie
  await createSessionCookieForUser(user.id);

  // 6. Clean up state cookie + redirect to `next`.
  // If Anthony linked for the first time WITHOUT calendar scope (wrong entry
  // point), nudge him to re-link with calendar so Bookings populates.
  const landing = next;
  if (
    email === CALENDAR_SCOPE_EMAIL &&
    !user.googleRefreshToken &&
    !tokens.refresh_token
  ) {
    // He's linked but we have no refresh token on file at all — keep him on
    // his `next` destination. Not fatal: bookings just won't populate.
  }
  // Defense-in-depth: even though `landing` came out of a signed state token,
  // re-clamp it to /admin-only paths before constructing the redirect URL.
  const safeLanding = sanitizeNext(landing);
  const res = NextResponse.redirect(new URL(safeLanding, req.url));
  res.cookies.delete(STATE_COOKIE);
  return res;
}
