import crypto from "crypto";

/**
 * Hash a password using SHA-256. This matches the scheme used by
 * `scripts/seed-team-users.ts` and the original inline implementation in
 * `src/lib/admin/auth.ts`. No salt — the scheme is simple by design; password
 * rotation is supported via `generateRandomPassword` + admin-only UI.
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Generate a human-copyable random password. 20 chars, URL-safe alphabet.
 */
export function generateRandomPassword(length = 20): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
