/**
 * Roadman Fantasy Tour — passwordless auth (magic link + email deep links).
 *
 * Mirrors the proven Ask Roadman pattern (src/lib/ask-auth) with one
 * addition from the brief (Section 5.2): two token purposes.
 *
 *  - "login":    single-use, 24h expiry. Sent on "Save your team" and
 *                from the sign-in form. Grants a full-scope session and
 *                doubles as the GDPR double-opt-in confirmation.
 *  - "deeplink": multi-use, 7-day expiry. Embedded in the daily stage
 *                email CTA so "Make your changes" is one tap on the
 *                phone. Grants a play-scoped session (view team, make
 *                transfers, set captain) — not account management.
 *
 * Cookie: `fantasy_session`, payload typ "fantasy" so it can never be
 * confused with ask/method/rider sessions.
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyAuthTokens, fantasyPlayers } from "@/lib/db/schema";

export const FANTASY_SESSION_COOKIE = "fantasy_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const LOGIN_TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours, single use
const DEEPLINK_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days, multi-use
const BCRYPT_ROUNDS = 12;

export type SessionScope = "full" | "play";

export const FANTASY_SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

interface FantasySessionPayload {
  typ: "fantasy";
  email: string;
  scope: SessionScope;
  iat: number;
  exp: number;
}

export interface FantasySession {
  email: string;
  scope: SessionScope;
}

function getSecret(): string {
  const s =
    process.env.FANTASY_SESSION_SECRET ??
    process.env.ASK_SESSION_SECRET ??
    process.env.METHOD_SESSION_SECRET ??
    "";
  if (!s || s.length < 32) {
    throw new Error(
      "FANTASY_SESSION_SECRET (or ASK_SESSION_SECRET / METHOD_SESSION_SECRET) must be ≥ 32 characters",
    );
  }
  return s;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/* ─── Tokens ────────────────────────────────────────────────── */

export async function mintFantasyToken(
  email: string,
  purpose: "login" | "deeplink",
): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = b64url(randomBytes(32));
  const tokenHash = await bcrypt.hash(rawToken, BCRYPT_ROUNDS);
  const ttl = purpose === "login" ? LOGIN_TOKEN_TTL_SECONDS : DEEPLINK_TOKEN_TTL_SECONDS;
  const expiresAt = new Date(Date.now() + ttl * 1000);
  await db.insert(fantasyAuthTokens).values({
    email: email.toLowerCase(),
    tokenHash,
    purpose,
    expiresAt,
  });
  return { rawToken, expiresAt };
}

/**
 * Consume a raw token. Login tokens burn on first use; deeplink tokens
 * increment a use counter and stay valid until expiry. Returns the
 * verified email, the session scope to grant, and whether this click
 * was the player's first verification (fires Beehiiv sync + CAPI).
 */
export async function consumeFantasyToken(rawToken: string): Promise<{
  email: string;
  scope: SessionScope;
  isFirstVerification: boolean;
} | null> {
  const candidates = await db
    .select()
    .from(fantasyAuthTokens)
    .where(gt(fantasyAuthTokens.expiresAt, new Date()))
    .limit(100);

  for (const row of candidates) {
    if (row.purpose === "login" && row.usedAt) continue;
    if (!(await bcrypt.compare(rawToken, row.tokenHash))) continue;

    if (row.purpose === "login") {
      const claimed = await db
        .update(fantasyAuthTokens)
        .set({ usedAt: new Date(), useCount: sql`${fantasyAuthTokens.useCount} + 1` })
        .where(and(eq(fantasyAuthTokens.id, row.id), sql`${fantasyAuthTokens.usedAt} IS NULL`))
        .returning({ id: fantasyAuthTokens.id });
      if (claimed.length === 0) return null;
    } else {
      await db
        .update(fantasyAuthTokens)
        .set({ usedAt: new Date(), useCount: sql`${fantasyAuthTokens.useCount} + 1` })
        .where(eq(fantasyAuthTokens.id, row.id));
    }

    const isFirstVerification = await markPlayerVerified(row.email);
    return {
      email: row.email,
      scope: row.purpose === "login" ? "full" : "play",
      isFirstVerification,
    };
  }
  return null;
}

/** Returns true when this click verified the player for the first time. */
async function markPlayerVerified(email: string): Promise<boolean> {
  const [player] = await db
    .select({ id: fantasyPlayers.id, verifiedAt: fantasyPlayers.verifiedAt })
    .from(fantasyPlayers)
    .where(eq(fantasyPlayers.email, email));
  if (!player) return false;
  if (player.verifiedAt) return false;
  await db
    .update(fantasyPlayers)
    .set({ verifiedAt: new Date() })
    .where(eq(fantasyPlayers.id, player.id));
  return true;
}

/* ─── HMAC-signed session JWT ───────────────────────────────── */

function signPayload(payload: FantasySessionPayload): string {
  const h = b64url(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const p = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = b64url(createHmac("sha256", getSecret()).update(`${h}.${p}`).digest());
  return `${h}.${p}.${sig}`;
}

function verifyJwt(token: string): FantasySessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, body, sig] = parts;
  const expected = createHmac("sha256", getSecret()).update(`${header}.${body}`).digest();

  let provided: Buffer;
  try {
    provided = b64urlDecode(sig);
  } catch {
    return null;
  }
  if (provided.length !== expected.length) return null;
  if (!timingSafeEqual(provided, expected)) return null;

  let payload: FantasySessionPayload;
  try {
    payload = JSON.parse(b64urlDecode(body).toString("utf8"));
  } catch {
    return null;
  }
  if (payload.typ !== "fantasy") return null;
  if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
  return payload;
}

/**
 * Stateless 7-day deep-link token for the daily stage email CTA.
 * A signed play-scoped JWT rather than a DB row: the cron mints one per
 * player per day (15k bcrypt rows would blow the cron budget), it's
 * multi-use until expiry, and it can only open a play-scoped session
 * (view team, transfers, captain) — never account management. The
 * 7-day expiry is the revocation story; the secret rotates if a batch
 * ever leaks.
 */
export function mintDeepLinkToken(email: string): string {
  const now = Math.floor(Date.now() / 1000);
  return signPayload({
    typ: "fantasy",
    email: email.toLowerCase(),
    scope: "play",
    iat: now,
    exp: now + DEEPLINK_TOKEN_TTL_SECONDS,
  });
}

/** Verify a stateless deep-link token (the JWT-shaped `token` variant). */
export function verifyDeepLinkToken(token: string): { email: string } | null {
  const payload = verifyJwt(token);
  if (!payload || payload.scope !== "play") return null;
  return { email: payload.email };
}

export function signFantasySessionToken(email: string, scope: SessionScope): string {
  const now = Math.floor(Date.now() / 1000);
  return signPayload({
    typ: "fantasy",
    email: email.toLowerCase(),
    scope,
    iat: now,
    exp: now + SESSION_MAX_AGE,
  });
}

export async function getFantasySession(): Promise<FantasySession | null> {
  const store = await cookies();
  const cookie = store.get(FANTASY_SESSION_COOKIE);
  if (!cookie?.value) return null;
  const payload = verifyJwt(cookie.value);
  if (!payload) return null;
  return { email: payload.email, scope: payload.scope };
}

/** Cookie-header verify for API routes that only hold a Request. */
export function getFantasySessionFromRequest(request: Request): FantasySession | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  const match = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${FANTASY_SESSION_COOKIE}=`));
  if (!match) return null;
  const payload = verifyJwt(decodeURIComponent(match.slice(FANTASY_SESSION_COOKIE.length + 1)));
  if (!payload) return null;
  return { email: payload.email, scope: payload.scope };
}
