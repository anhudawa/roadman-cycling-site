/**
 * Shared input validation helpers for API routes.
 *
 * Keep these intentionally boring. Every public form endpoint pulls
 * from here rather than re-implementing regexes and length caps $—
 * prevents drift between /apply / /contact / /newsletter / /tools/report.
 */

/** RFC 5322-lite $— rejects `foo@`, `@bar`, `foo@bar`, and other fat-finger failures. */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Input size caps, matched against DB column sizes where applicable. */
export const LIMITS = {
  name: 200,
  email: 200,
  subject: 200,
  message: 5000,
  shortText: 500,
  longText: 2000,
} as const;

/**
 * Validate an email string. Returns a normalised lowercase email OR
 * null if invalid. Callers should check null and return a 400.
 */
export function normaliseEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!EMAIL_REGEX.test(trimmed)) return null;
  if (trimmed.length > LIMITS.email) return null;
  return trimmed.toLowerCase();
}

/**
 * Clamp a string to a maximum length. Returns the original trimmed
 * string truncated to max, or null if input isn't a string.
 */
export function clampString(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, max);
}

/**
 * HTML-escape a string for safe inclusion in email templates or
 * server-rendered contexts that aren't using React's auto-escaping.
 * Handles &, <, >, ", '.
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
