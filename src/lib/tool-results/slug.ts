import crypto from "crypto";

/**
 * URL-friendly slug for tool_results rows. 10 chars from a 36-symbol
 * alphabet ≈ 3.6e15 combinations — unique-constraint retries on the
 * DB side cover the vanishingly small collision probability.
 */
const SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const SLUG_LEN = 10;

export function generateToolResultSlug(): string {
  const bytes = crypto.randomBytes(SLUG_LEN);
  let out = "";
  for (let i = 0; i < SLUG_LEN; i++) {
    out += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  }
  return out;
}
