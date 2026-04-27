/**
 * Shared resolver for the secret used to sign admin session tokens and OAuth
 * state. Centralised so the production-must-be-set rule cannot be bypassed by
 * a stray copy of the lookup logic.
 *
 * Security rules:
 *   - Production: AUTH_SECRET (or legacy ADMIN_PASSWORD) MUST be set. Throw
 *     otherwise so a missing env var brings the route down loudly instead of
 *     issuing forgeable tokens with a publicly-known fallback.
 *   - Non-production: a fixed dev fallback is allowed so local development
 *     and test runs work without env setup.
 */
export function authSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET (or ADMIN_PASSWORD) must be set in production — refusing to use a fallback secret."
    );
  }
  return "fallback-dev-secret";
}
