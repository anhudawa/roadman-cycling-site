/**
 * The Method — passwordless auth helpers.
 *
 * Rebuilt 2026-05-11. Architecture rule: cookie mutations NEVER use
 * the `cookies()` helper from `next/headers`. Callers that need to
 * set or clear the session cookie operate on a NextResponse object
 * directly (see signSessionToken / SESSION_COOKIE_OPTS). This avoids
 * the Next.js footgun where `cookies().set()` modifies an internal
 * store that may not be flushed to a separately created NextResponse.
 *
 * Flow:
 *   1. POST /api/method/login { email }
 *      → mint bcrypt-hashed token, email raw token via Resend.
 *   2. GET /api/method/login/verify?token=...
 *      → bcrypt-compare, set `method_session` cookie ON the redirect
 *        response, 302 to /method/dashboard.
 *   3. Server components call getMethodSession() to read + verify.
 *      Read-only — never mutates cookies.
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  methodEnrollments,
  methodLoginTokens,
  type MethodEnrollment,
} from "./schema";

/* ─── Constants ─────────────────────────────────────────────── */

export const METHOD_SESSION_COOKIE = "method_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const TOKEN_TTL_SECONDS = 60 * 15; // 15 minutes
const BCRYPT_ROUNDS = 12;

/** Cookie attributes for callers that set/clear on their own response. */
export const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

/* ─── Types ─────────────────────────────────────────────────── */

interface SessionPayload {
  eid: number;
  email: string;
  iat: number;
  exp: number;
}

export interface MethodSession {
  enrollment: MethodEnrollment;
  payload: SessionPayload;
}

export class MethodAuthError extends Error {
  readonly status = 401;
}

/* ─── Secret ────────────────────────────────────────────────── */

function getSecret(): string {
  const s = process.env.METHOD_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "METHOD_SESSION_SECRET must be ≥ 32 characters",
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

export async function mintLoginToken(
  enrollmentId: number,
): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = b64url(randomBytes(32));
  const tokenHash = await bcrypt.hash(rawToken, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);
  await db.insert(methodLoginTokens).values({
    enrollmentId,
    tokenHash,
    expiresAt,
  });
  return { rawToken, expiresAt };
}

export async function consumeLoginToken(
  rawToken: string,
): Promise<MethodEnrollment | null> {
  const candidates = await db
    .select()
    .from(methodLoginTokens)
    .where(
      and(
        gt(methodLoginTokens.expiresAt, new Date()),
        isNull(methodLoginTokens.usedAt),
      ),
    )
    .limit(50);

  for (const row of candidates) {
    if (!(await bcrypt.compare(rawToken, row.tokenHash))) continue;

    const claimed = await db
      .update(methodLoginTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(methodLoginTokens.id, row.id),
          isNull(methodLoginTokens.usedAt),
        ),
      )
      .returning({ id: methodLoginTokens.id });
    if (claimed.length === 0) return null;

    const [enrollment] = await db
      .select()
      .from(methodEnrollments)
      .where(eq(methodEnrollments.id, row.enrollmentId))
      .limit(1);
    if (!enrollment || enrollment.status !== "active") return null;
    return enrollment;
  }
  return null;
}

/* ─── JWT (HMAC-signed, no external lib) ────────────────────── */

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
  if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
  return payload;
}

/* ─── Public API ────────────────────────────────────────────── */

/**
 * Sign a session JWT for an enrollment. Returns the raw JWT and
 * cookie config so the caller can attach it to any NextResponse.
 *
 * Usage in a route handler:
 *   const { jwt } = signSessionToken(enrollment);
 *   response.cookies.set(METHOD_SESSION_COOKIE, jwt, SESSION_COOKIE_OPTS);
 */
export function signSessionToken(enrollment: MethodEnrollment): {
  jwt: string;
} {
  const now = Math.floor(Date.now() / 1000);
  return {
    jwt: signPayload({
      eid: enrollment.id,
      email: enrollment.email,
      iat: now,
      exp: now + SESSION_MAX_AGE,
    }),
  };
}

/**
 * Read + verify the session cookie. Returns null if the cookie is
 * missing, tampered, expired, or the enrollment is no longer active.
 *
 * Read-only — never mutates cookies. Safe to call in layouts and
 * pages without risk of interfering with responses.
 */
export async function getMethodSession(): Promise<MethodSession | null> {
  const store = await cookies();
  const cookie = store.get(METHOD_SESSION_COOKIE);
  if (!cookie?.value) return null;

  const payload = verifyJwt(cookie.value);
  if (!payload) return null;

  const [enrollment] = await db
    .select()
    .from(methodEnrollments)
    .where(eq(methodEnrollments.id, payload.eid))
    .limit(1);
  if (!enrollment || enrollment.status !== "active") return null;
  return { enrollment, payload };
}

/**
 * Throws on missing/invalid session. Use in API routes;
 * in pages prefer the middleware gate.
 */
export async function requireMethodSession(): Promise<MethodSession> {
  const session = await getMethodSession();
  if (!session) throw new MethodAuthError("Not signed in");
  return session;
}

/**
 * @deprecated Use signSessionToken + response.cookies.set instead.
 * Kept only for the Stripe webhook handler which doesn't return
 * a NextResponse.
 */
export async function setMethodSessionCookie(
  enrollment: MethodEnrollment,
): Promise<void> {
  const { jwt } = signSessionToken(enrollment);
  const store = await cookies();
  store.set(METHOD_SESSION_COOKIE, jwt, SESSION_COOKIE_OPTS);
}

/**
 * @deprecated Use response.cookies.set with maxAge:0 instead.
 */
export async function clearMethodSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(METHOD_SESSION_COOKIE, "", { ...SESSION_COOKIE_OPTS, maxAge: 0 });
}
