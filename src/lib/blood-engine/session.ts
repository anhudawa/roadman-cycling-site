/**
 * Stateless HMAC-signed session for Blood Engine users.
 *
 * Token format: `<userId>.<expiryUnix>.<base64url(hmacSha256(userId|expiry, secret))>`
 *
 * No DB lookups required to verify a token — we only hit the DB to materialise
 * the user object after a successful HMAC verify. This keeps the session layer
 * cheap and decoupled from the rest of the app.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const BE_COOKIE_NAME = "be_session";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
export const MAGIC_LINK_TTL_SECONDS = 30 * 60; // 30 minutes

export interface BloodEngineToken {
  userId: number;
  expiresAt: number; // unix seconds
}

function getSecret(): string {
  const s = process.env.BLOOD_ENGINE_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "BLOOD_ENGINE_SESSION_SECRET is missing or too short (need ≥32 chars)"
    );
  }
  return s;
}

function sign(payload: string): string {
  const sig = createHmac("sha256", getSecret()).update(payload).digest();
  return base64url(sig);
}

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(s: string): Buffer {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((s.length + 2) % 4);
  return Buffer.from(padded, "base64");
}

/** Mint a token for the given userId with `ttlSeconds` of validity. */
export function mintToken(userId: number, ttlSeconds = SESSION_TTL_SECONDS): string {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

/** Verify a token's signature + expiry. Returns the parsed token or null. */
export function verifyToken(token: string | undefined | null): BloodEngineToken | null {
  const sigOnly = verifyTokenSignatureOnly(token);
  if (!sigOnly) return null;
  if (sigOnly.expiresAt < Math.floor(Date.now() / 1000)) return null;
  return sigOnly;
}

/**
 * Verify HMAC signature only — IGNORES expiry. Use ONLY for UX (e.g. pre-fill
 * an email field on the "link expired" page). Never grant access from this.
 */
export function verifyTokenSignatureOnly(
  token: string | undefined | null
): BloodEngineToken | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userIdStr, expiresAtStr, sig] = parts;
  const userId = Number(userIdStr);
  const expiresAt = Number(expiresAtStr);
  if (!Number.isInteger(userId) || !Number.isInteger(expiresAt)) return null;

  const expectedSig = sign(`${userId}.${expiresAt}`);
  let a: Buffer;
  let b: Buffer;
  try {
    a = fromBase64url(sig);
    b = fromBase64url(expectedSig);
  } catch {
    return null;
  }
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  return { userId, expiresAt };
}

/** Sets the session cookie. Must be called from a Server Action / Route Handler. */
export async function setSessionCookie(userId: number): Promise<void> {
  const token = mintToken(userId);
  const jar = await cookies();
  jar.set(BE_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(BE_COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

/** Read + verify the session cookie. Returns the userId or null. */
export async function getSessionUserId(): Promise<number | null> {
  const jar = await cookies();
  const c = jar.get(BE_COOKIE_NAME);
  const parsed = verifyToken(c?.value);
  return parsed?.userId ?? null;
}
