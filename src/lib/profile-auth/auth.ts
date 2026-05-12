/**
 * Rider profile — passwordless magic-link auth.
 *
 * Mirrors the Method auth flow (src/lib/method/auth.ts) but resolves
 * against the unified `rider_profiles` table rather than paid Method
 * enrollments. ANY rider with a `rider_profiles` row — created by a
 * tool completion, the plateau diagnostic, or a Method purchase — can
 * request a magic link and sign in to `/profile`.
 *
 * Cookie:  `rider_session` (separate from `method_session` so Method
 *          enrollees can hold both simultaneously without collision).
 * Secret:  reuses METHOD_SESSION_SECRET to avoid a second env var.
 *          The payload includes a `typ: "rider"` field so a Method
 *          session cookie can never be verified as a rider session.
 *
 * Read-only callers (server components) call getRiderSession().
 * Cookie mutations operate on a NextResponse directly — never via
 * the `cookies()` helper — same footgun avoidance as method/auth.ts.
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { riderLoginTokens, riderProfiles } from "@/lib/db/schema";
import { loadById } from "@/lib/rider-profile/store";
import type { RiderProfile } from "@/lib/rider-profile/types";

/* ─── Constants ─────────────────────────────────────────────── */

export const RIDER_SESSION_COOKIE = "rider_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const TOKEN_TTL_SECONDS = 60 * 15; // 15 minutes
const BCRYPT_ROUNDS = 12;

export const RIDER_SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

/* ─── Types ─────────────────────────────────────────────────── */

interface SessionPayload {
  typ: "rider";
  rpid: number;
  email: string;
  iat: number;
  exp: number;
}

export interface RiderSession {
  profile: RiderProfile;
  payload: SessionPayload;
}

export class RiderAuthError extends Error {
  readonly status = 401;
}

/* ─── Secret ────────────────────────────────────────────────── */

function getSecret(): string {
  const s =
    process.env.RIDER_SESSION_SECRET ??
    process.env.METHOD_SESSION_SECRET ??
    "";
  if (!s || s.length < 32) {
    throw new Error(
      "RIDER_SESSION_SECRET (or METHOD_SESSION_SECRET) must be ≥ 32 characters",
    );
  }
  return s;
}

/* ─── Base64url helpers ─────────────────────────────────────── */

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

export async function mintRiderLoginToken(
  riderProfileId: number,
): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = b64url(randomBytes(32));
  const tokenHash = await bcrypt.hash(rawToken, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);
  await db.insert(riderLoginTokens).values({
    riderProfileId,
    tokenHash,
    expiresAt,
  });
  return { rawToken, expiresAt };
}

/**
 * Consume a raw token. Returns the rider profile on success, null
 * otherwise. Single-use: a successful consume sets `used_at`.
 *
 * We can't index by the raw token (it's not stored), so we read all
 * unused/unexpired tokens and bcrypt-compare. In practice the table
 * is small (15-min TTL + single-use) — 50-row cap is a safety belt.
 */
export async function consumeRiderLoginToken(
  rawToken: string,
): Promise<RiderProfile | null> {
  const candidates = await db
    .select()
    .from(riderLoginTokens)
    .where(
      and(
        gt(riderLoginTokens.expiresAt, new Date()),
        isNull(riderLoginTokens.usedAt),
      ),
    )
    .limit(50);

  for (const row of candidates) {
    if (!(await bcrypt.compare(rawToken, row.tokenHash))) continue;

    const claimed = await db
      .update(riderLoginTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(riderLoginTokens.id, row.id),
          isNull(riderLoginTokens.usedAt),
        ),
      )
      .returning({ id: riderLoginTokens.id });
    if (claimed.length === 0) return null;

    return await loadById(row.riderProfileId);
  }
  return null;
}

/* ─── JWT (HMAC-signed) ─────────────────────────────────────── */

function signPayload(payload: SessionPayload): string {
  const h = b64url(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const p = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = b64url(
    createHmac("sha256", getSecret()).update(`${h}.${p}`).digest(),
  );
  return `${h}.${p}.${sig}`;
}

function verifyJwt(token: string): SessionPayload | null {
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

  let payload: SessionPayload;
  try {
    payload = JSON.parse(b64urlDecode(body).toString("utf8"));
  } catch {
    return null;
  }
  // Rider sessions must declare typ === "rider". Method-session cookies,
  // even though they share the secret, omit this field — so they cannot
  // be verified as rider sessions.
  if (payload.typ !== "rider") return null;
  if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
  return payload;
}

/* ─── Public API ────────────────────────────────────────────── */

/**
 * Sign a session JWT for a rider profile. Caller attaches the JWT to
 * a NextResponse via response.cookies.set(...).
 */
export function signRiderSessionToken(profile: RiderProfile): { jwt: string } {
  const now = Math.floor(Date.now() / 1000);
  return {
    jwt: signPayload({
      typ: "rider",
      rpid: profile.id,
      email: profile.email,
      iat: now,
      exp: now + SESSION_MAX_AGE,
    }),
  };
}

/**
 * Read + verify the rider session cookie. Returns null when the
 * cookie is missing, tampered, expired, or the rider profile no
 * longer exists.
 */
export async function getRiderSession(): Promise<RiderSession | null> {
  const store = await cookies();
  const cookie = store.get(RIDER_SESSION_COOKIE);
  if (!cookie?.value) return null;

  const payload = verifyJwt(cookie.value);
  if (!payload) return null;

  const profile = await loadById(payload.rpid);
  if (!profile) return null;
  return { profile, payload };
}

export async function requireRiderSession(): Promise<RiderSession> {
  const session = await getRiderSession();
  if (!session) throw new RiderAuthError("Not signed in");
  return session;
}

/**
 * Look up an existing rider profile by email — for the login route.
 * Returns null if no profile exists. We deliberately do NOT create
 * a profile on first login attempt: the rider must first complete
 * a tool, diagnostic, or Method purchase. This stops random emails
 * from creating empty profile rows.
 */
export async function findRiderProfileByEmailForLogin(
  email: string,
): Promise<RiderProfile | null> {
  const [row] = await db
    .select()
    .from(riderProfiles)
    .where(eq(riderProfiles.email, email.toLowerCase()))
    .limit(1);
  if (!row) return null;
  return await loadById(row.id);
}
