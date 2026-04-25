import { Resend } from "resend";

/**
 * Centralised Resend client factory. Returns `null` when
 * RESEND_API_KEY is absent so callers can fall back gracefully
 * (usually "log a warning, skip the email, don't block the flow").
 *
 * Consolidates the `getResend()` helper that used to live inline in
 * every route that sends transactional email. Keep the null-on-missing
 * posture $€” a Vercel deploy without the key should be a WARN not a
 * 500 for most flows.
 */
export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}
