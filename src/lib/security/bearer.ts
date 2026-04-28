/**
 * Constant-time Bearer-token verification for cron / internal endpoints.
 *
 * Plain `===` on a secret is timing-attack vulnerable: the comparison
 * short-circuits on the first byte mismatch, leaking how many leading
 * bytes are correct. With enough samples an attacker can recover the
 * secret byte-by-byte.
 *
 * `crypto.timingSafeEqual` runs in time proportional to the length of
 * the inputs only, not their contents.
 */

import { timingSafeEqual } from "node:crypto";

/**
 * Returns `true` iff the request carries `Authorization: Bearer <secret>`.
 * Uses a constant-time compare so the check leaks no information about
 * the secret on mismatch.
 */
export function verifyBearer(authHeader: string | null, secret: string): boolean {
  if (!authHeader) return false;
  const expected = `Bearer ${secret}`;
  // Both buffers must be the same length for timingSafeEqual; the
  // length-mismatch shortcut is itself constant time (one buffer
  // allocation, one length compare) and safe.
  if (authHeader.length !== expected.length) return false;
  const a = Buffer.from(authHeader);
  const b = Buffer.from(expected);
  return timingSafeEqual(a, b);
}
