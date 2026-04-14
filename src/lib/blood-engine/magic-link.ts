/**
 * Magic-link tokens reuse the same HMAC primitive as session tokens, but with
 * a much shorter TTL. Verifying a magic-link token does not set a session;
 * the verify route handler does that explicitly.
 */

import { mintToken, MAGIC_LINK_TTL_SECONDS, verifyToken } from "./session";

export function mintMagicLinkToken(userId: number): string {
  return mintToken(userId, MAGIC_LINK_TTL_SECONDS);
}

export function verifyMagicLinkToken(token: string | undefined | null): number | null {
  const parsed = verifyToken(token);
  return parsed?.userId ?? null;
}

export function magicLinkUrl(baseUrl: string, token: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return `${base}/blood-engine/login/verify?token=${encodeURIComponent(token)}`;
}
