import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Password hashing for team_users. The stored hash is self-describing:
 *
 *   - bcrypt hashes start with `$2a$`, `$2b$`, or `$2y$` (60 chars)
 *   - legacy SHA-256 hashes are exactly 64 hex chars (no prefix)
 *
 * `verifyPassword` accepts either format and signals when a legacy hash
 * should be re-hashed with bcrypt on the next successful login. New hashes
 * are always bcrypt — `hashPasswordForStorage` is the only writer.
 */

const BCRYPT_ROUNDS = 12;
const LEGACY_SHA256_RE = /^[a-f0-9]{64}$/;

function isBcryptHash(stored: string): boolean {
  return /^\$2[aby]\$/.test(stored);
}

function isLegacySha256Hash(stored: string): boolean {
  return LEGACY_SHA256_RE.test(stored);
}

function legacySha256(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export interface PasswordVerdict {
  ok: boolean;
  /** True when the matched hash was the legacy unsalted SHA-256 scheme. */
  needsRehash: boolean;
}

/** Verify a plaintext password against any supported stored hash. */
export async function verifyPassword(
  plaintext: string,
  storedHash: string
): Promise<PasswordVerdict> {
  if (!plaintext || !storedHash) return { ok: false, needsRehash: false };

  if (isBcryptHash(storedHash)) {
    try {
      const ok = await bcrypt.compare(plaintext, storedHash);
      return { ok, needsRehash: false };
    } catch {
      return { ok: false, needsRehash: false };
    }
  }

  if (isLegacySha256Hash(storedHash)) {
    const candidate = legacySha256(plaintext);
    const a = Buffer.from(candidate, "hex");
    const b = Buffer.from(storedHash, "hex");
    if (a.length !== b.length) return { ok: false, needsRehash: false };
    const ok = crypto.timingSafeEqual(a, b);
    return { ok, needsRehash: ok };
  }

  return { ok: false, needsRehash: false };
}

/** Produce a bcrypt hash suitable for storing in `team_users.password_hash`. */
export async function hashPasswordForStorage(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, BCRYPT_ROUNDS);
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
