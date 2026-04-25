// Slug generation for predictions and uploaded courses.
// Format: 9 chars, alphanumeric (no I/l/0/O confusion). Collision-resistant
// for the volumes we expect (≪100k predictions/year).

const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export function generateSlug(prefix = ""): string {
  let s = prefix;
  for (let i = 0; i < 9; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}

export function isLikelySlug(s: string): boolean {
  return typeof s === "string" && /^[a-z0-9-]{6,40}$/.test(s);
}
