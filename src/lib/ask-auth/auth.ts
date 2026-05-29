/**
 * Ask Roadman — passwordless email magic-link auth.
 *
 * Lead-gen gate for /ask. Anyone with an email can authenticate
 * (no rider_profiles requirement — this is the funnel that *creates*
 * the lead). On first authentication we sync the email to Beehiiv
 * tagged "ask-roadman" so Anthony can segment them.
 *
 * Cookie:  `ask_session` (separate from `rider_session` / `method_session`).
 * Secret:  ASK_SESSION_SECRET, falls back to METHOD_SESSION_SECRET so
 *          a single-secret deploy works. Payload carries `typ: "ask"`
 *          so other session cookies can't be confused with this one.
 * TTL:     7-day session, 15-minute single-use magic link.
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { askAuthSubscribers, askAuthTokens } from "@/lib/db/schema";

export const ASK_SESSION_COOKIE = "ask_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const TOKEN_TTL_SECONDS = 60 * 15; // 15 minutes
const BCRYPT_ROUNDS = 12;

export const ASK_SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

interface AskSessionPayload {
  typ: "ask";
  email: string;
  iat: number;
  exp: number;
}

export interface AskSession {
  email: string;
  payload: AskSessionPayload;
}

export class AskAuthError extends Error {
  readonly status = 401;
}

function getSecret(): string {
  const s =
    process.env.ASK_SESSION_SECRET ??
    process.env.METHOD_SESSION_SECRET ??
    process.env.RIDER_SESSION_SECRET ??
    "";
  if (!s || s.length < 32) {
    throw new Error(
      "ASK_SESSION_SECRET (or METHOD_SESSION_SECRET / RIDER_SESSION_SECRET) must be ≥ 32 characters",
    );
  }
  return s;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/* ─── Magic-link tokens ─────────────────────────────────────── */

export async function mintAskAuthToken(
  email: string,
): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = b64url(randomBytes(32));
  const tokenHash = await bcrypt.hash(rawToken, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);
  await db.insert(askAuthTokens).values({
    email,
    tokenHash,
    expiresAt,
  });
  return { rawToken, expiresAt };
}

/**
 * Consume a raw token. Returns the verified email + whether this is a
 * first-time auth (so the caller can fire the Beehiiv sync only on
 * first verification, not on every magic-link click).
 *
 * Token rows aren't indexed by raw token (it's never stored), so we
 * read unused/unexpired rows and bcrypt-compare. 50-row safety cap.
 */
export async function consumeAskAuthToken(
  rawToken: string,
): Promise<{ email: string; isFirstAuth: boolean } | null> {
  const candidates = await db
    .select()
    .from(askAuthTokens)
    .where(
      and(
        gt(askAuthTokens.expiresAt, new Date()),
        isNull(askAuthTokens.usedAt),
      ),
    )
    .limit(50);

  for (const row of candidates) {
    if (!(await bcrypt.compare(rawToken, row.tokenHash))) continue;

    const claimed = await db
      .update(askAuthTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(askAuthTokens.id, row.id),
          isNull(askAuthTokens.usedAt),
        ),
      )
      .returning({ id: askAuthTokens.id });
    if (claimed.length === 0) return null;

    const isFirstAuth = await upsertAskSubscriber(row.email);
    return { email: row.email, isFirstAuth };
  }
  return null;
}

/**
 * Insert or update the subscriber row. Returns true when this was a
 * first-time auth (a brand-new row), false on a returning auth — the
 * caller uses this to gate the Beehiiv sync call.
 */
async function upsertAskSubscriber(email: string): Promise<boolean> {
  const existing = await db
    .select({ id: askAuthSubscribers.id })
    .from(askAuthSubscribers)
    .where(eq(askAuthSubscribers.email, email))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(askAuthSubscribers)
      .set({
        lastAuthenticatedAt: new Date(),
        authCount: sql`${askAuthSubscribers.authCount} + 1`,
      })
      .where(eq(askAuthSubscribers.id, existing[0].id));
    return false;
  }
  await db.insert(askAuthSubscribers).values({
    email,
    source: "ask-roadman",
  });
  return true;
}

export async function recordBeehiivSync(
  email: string,
  subscriberId: string | null,
): Promise<void> {
  await db
    .update(askAuthSubscribers)
    .set({
      beehiivSubscriberId: subscriberId,
      beehiivSyncedAt: new Date(),
    })
    .where(eq(askAuthSubscribers.email, email));
}

/* ─── HMAC-signed JWT ────────────────────────────────────────── */

function signPayload(payload: AskSessionPayload): string {
  const h = b64url(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const p = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = b64url(
    createHmac("sha256", getSecret()).update(`${h}.${p}`).digest(),
  );
  return `${h}.${p}.${sig}`;
}

function verifyJwt(token: string): AskSessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, body, sig] = parts;
  const expected = createHmac("sha256", getSecret())
    .update(`${header}.${body}`)
    .digest();

  let provided: Buffer;
  try {
    provided = b64urlDecode(sig);
  } catch {
    return null;
  }
  if (provided.length !== expected.length) return null;
  if (!timingSafeEqual(provided, expected)) return null;

  let payload: AskSessionPayload;
  try {
    payload = JSON.parse(b64urlDecode(body).toString("utf8"));
  } catch {
    return null;
  }
  if (payload.typ !== "ask") return null;
  if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export function signAskSessionToken(email: string): { jwt: string } {
  const now = Math.floor(Date.now() / 1000);
  return {
    jwt: signPayload({
      typ: "ask",
      email,
      iat: now,
      exp: now + SESSION_MAX_AGE,
    }),
  };
}

export async function getAskSession(): Promise<AskSession | null> {
  const store = await cookies();
  const cookie = store.get(ASK_SESSION_COOKIE);
  if (!cookie?.value) return null;
  const payload = verifyJwt(cookie.value);
  if (!payload) return null;
  return { email: payload.email, payload };
}

/**
 * Cookie-free verify for use in API routes that only have a Request
 * (e.g. /api/ask/route.ts) — reads the cookie header directly instead
 * of going through next/headers.
 */
export function getAskSessionFromRequest(request: Request): AskSession | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  const match = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ASK_SESSION_COOKIE}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.slice(ASK_SESSION_COOKIE.length + 1));
  const payload = verifyJwt(value);
  if (!payload) return null;
  return { email: payload.email, payload };
}
