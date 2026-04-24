import crypto from "crypto";

/**
 * Magic-link token for the /results history page. Signed with
 * `RIDER_HISTORY_SECRET` (falls back to `NEXTAUTH_SECRET` or a
 * deployment-scoped default in dev so the route still works without
 * extra env wiring). Each token is tied to a specific email + a TTL
 * so links don't live forever once shared.
 */

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret(): string {
  return (
    process.env.RIDER_HISTORY_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "dev-rider-history-secret"
  );
}

function sign(data: string): string {
  return crypto
    .createHmac("sha256", secret())
    .update(data)
    .digest("base64url");
}

export interface MintedHistoryToken {
  token: string;
  expiresAt: Date;
}

export function mintHistoryToken(
  email: string,
  ttlMs: number = DEFAULT_TTL_MS,
): MintedHistoryToken {
  const expires = Date.now() + ttlMs;
  const payload = `${email}.${expires}`;
  const sig = sign(payload);
  return {
    token: `${Buffer.from(payload).toString("base64url")}.${sig}`,
    expiresAt: new Date(expires),
  };
}

export interface VerifiedHistoryToken {
  email: string;
  expiresAt: Date;
}

export function verifyHistoryToken(token: string): VerifiedHistoryToken | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, providedSig] = parts;
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = sign(payload);
  const a = Buffer.from(expected);
  const b = Buffer.from(providedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const [email, expiresStr] = payload.split(".");
  const expires = Number(expiresStr);
  if (!email || !Number.isFinite(expires) || expires < Date.now()) return null;
  return { email, expiresAt: new Date(expires) };
}
