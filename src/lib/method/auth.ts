/**
 * The Method — passwordless auth (custom, separate from admin NextAuth).
 *
 * Why custom: see docs/method-architecture.md §3.1. The admin NextAuth
 * instance is locked to an env allowlist; mixing paid-customer surface
 * area into it widens the blast radius of an admin-cookie compromise.
 *
 * Flow:
 *   1. POST /api/method/login {email}
 *      → mint 32-byte random token, bcrypt-hash, insert into
 *        method_login_tokens with 15-min TTL, email raw token via Resend.
 *   2. GET /api/method/login/verify?token=...
 *      → bcrypt-compare against unused, unexpired hashes; mark used;
 *        set `method_session` cookie (HMAC-signed JWT, 30-day expiry).
 *   3. Server components call `getMethodSession()` to read + verify.
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

export const METHOD_SESSION_COOKIE = "method_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const TOKEN_TTL_SECONDS = 60 * 15; // 15 minutes
const BCRYPT_ROUNDS = 12;

interface MethodSessionPayload {
  /** Enrollment row id. */
  eid: number;
  /** Lowercased email (for display; do NOT use as the source of truth). */
  email: string;
  /** Issued-at, seconds since epoch. */
  iat: number;
  /** Expires-at, seconds since epoch. */
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.METHOD_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "METHOD_SESSION_SECRET must be set to a value of at least 32 characters",
    );
  }
  return secret;
}

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64");
}

/* ─────────────────────────────────────────────────────────── */
/*  Magic-link tokens                                          */
/* ─────────────────────────────────────────────────────────── */

/** Mint a one-time login token for an enrollment. Returns the RAW token —
 *  caller must email it; the database only ever stores the hash. */
export async function mintLoginToken(enrollmentId: number): Promise<{
  rawToken: string;
  expiresAt: Date;
}> {
  const rawToken = base64url(randomBytes(32));
  const tokenHash = await bcrypt.hash(rawToken, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);

  await db.insert(methodLoginTokens).values({
    enrollmentId,
    tokenHash,
    expiresAt,
  });

  return { rawToken, expiresAt };
}

/**
 * Consume a raw token. Returns the enrollment if the token is valid,
 * unused, and unexpired. Marks the token used. Single-use is enforced
 * by the `usedAt` column (set in the same statement that selects).
 *
 * NOTE: bcrypt forces a per-row compare, so this scans unused/unexpired
 * tokens. With 15-min TTL the working set stays tiny in practice. If
 * volume changes, swap to HMAC-prefix lookup.
 */
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

  for (const candidate of candidates) {
    const matches = await bcrypt.compare(rawToken, candidate.tokenHash);
    if (!matches) continue;

    // Race-tolerant single-use: only succeeds if usedAt is still NULL.
    const claimed = await db
      .update(methodLoginTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(methodLoginTokens.id, candidate.id),
          isNull(methodLoginTokens.usedAt),
        ),
      )
      .returning({ id: methodLoginTokens.id });
    if (claimed.length === 0) return null;

    const enrollmentRows = await db
      .select()
      .from(methodEnrollments)
      .where(eq(methodEnrollments.id, candidate.enrollmentId))
      .limit(1);
    const enrollment = enrollmentRows[0];
    if (!enrollment || enrollment.status !== "active") return null;
    return enrollment;
  }
  return null;
}

/* ─────────────────────────────────────────────────────────── */
/*  Session JWT (HMAC, no external lib)                        */
/* ─────────────────────────────────────────────────────────── */

function signSessionPayload(payload: MethodSessionPayload): string {
  const headerJson = JSON.stringify({ alg: "HS256", typ: "JWT" });
  const payloadJson = JSON.stringify(payload);
  const header = base64url(Buffer.from(headerJson));
  const body = base64url(Buffer.from(payloadJson));
  const signingInput = `${header}.${body}`;
  const signature = base64url(
    createHmac("sha256", getSessionSecret()).update(signingInput).digest(),
  );
  return `${signingInput}.${signature}`;
}

function verifySessionToken(token: string): MethodSessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const signingInput = `${header}.${body}`;
  const expected = createHmac("sha256", getSessionSecret())
    .update(signingInput)
    .digest();
  let providedBuf: Buffer;
  try {
    providedBuf = base64urlDecode(signature);
  } catch {
    return null;
  }
  if (providedBuf.length !== expected.length) return null;
  if (!timingSafeEqual(providedBuf, expected)) return null;

  let payload: MethodSessionPayload;
  try {
    payload = JSON.parse(base64urlDecode(body).toString("utf8"));
  } catch {
    return null;
  }
  if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export async function setMethodSessionCookie(enrollment: MethodEnrollment): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const token = signSessionPayload({
    eid: enrollment.id,
    email: enrollment.email,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  });
  const store = await cookies();
  store.set(METHOD_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearMethodSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(METHOD_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export interface MethodSession {
  enrollment: MethodEnrollment;
  payload: MethodSessionPayload;
}

/**
 * Read + verify the session cookie. Returns null if the cookie is missing,
 * tampered, expired, or the underlying enrollment is no longer active.
 *
 * IMPORTANT: every check goes back to the DB so `status='refunded'` takes
 * effect on the next request — we do NOT trust the JWT to encode status.
 */
export async function getMethodSession(): Promise<MethodSession | null> {
  const store = await cookies();
  const cookie = store.get(METHOD_SESSION_COOKIE);
  if (!cookie?.value) return null;
  const payload = verifySessionToken(cookie.value);
  if (!payload) return null;

  const rows = await db
    .select()
    .from(methodEnrollments)
    .where(eq(methodEnrollments.id, payload.eid))
    .limit(1);
  const enrollment = rows[0];
  if (!enrollment || enrollment.status !== "active") return null;
  return { enrollment, payload };
}

/** Convenience wrapper that throws on missing/invalid session. Use in API
 *  routes; in pages prefer redirect-based gating in the layout. */
export async function requireMethodSession(): Promise<MethodSession> {
  const session = await getMethodSession();
  if (!session) {
    throw new MethodAuthError("Not signed in");
  }
  return session;
}

export class MethodAuthError extends Error {
  readonly status = 401;
}
