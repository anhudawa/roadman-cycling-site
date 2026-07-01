/**
 * Roadman Fantasy Tour — private beta gate.
 *
 * When FANTASY_BETA_CODE is set (demo/preview deployments only), every
 * /fantasy page renders a code-entry screen until the visitor presents
 * the code — either typed into the form or carried in the share link
 * (/api/fantasy/beta?code=...). Access is remembered per device via an
 * httpOnly cookie holding a hash of the code, so rotating the env var
 * revokes everyone at once.
 *
 * Production never sets the env var, so the gate code never runs and
 * the /fantasy landing stays statically rendered.
 *
 * This is a privacy curtain for a beta group, not a security boundary:
 * page access is gated; the JSON APIs are not.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const BETA_COOKIE = "fantasy_beta";

export function betaGateEnabled(): boolean {
  return !!process.env.FANTASY_BETA_CODE?.trim();
}

function codeHash(code: string): string {
  return createHash("sha256").update(code.trim().toLowerCase()).digest("hex");
}

export function isValidBetaCode(candidate: string): boolean {
  const expected = process.env.FANTASY_BETA_CODE?.trim();
  if (!expected) return false;
  const a = Buffer.from(codeHash(candidate));
  const b = Buffer.from(codeHash(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Cookie value for a granted device. */
export function betaCookieValue(): string {
  return codeHash(process.env.FANTASY_BETA_CODE ?? "");
}

export async function hasBetaAccess(): Promise<boolean> {
  if (!betaGateEnabled()) return true;
  const store = await cookies();
  const cookie = store.get(BETA_COOKIE)?.value;
  return !!cookie && cookie === betaCookieValue();
}
