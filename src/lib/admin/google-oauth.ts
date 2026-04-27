import crypto from "crypto";
import { authSecret } from "@/lib/admin/secret";

/**
 * Google OAuth 2.0 helpers. We deliberately do NOT pull in NextAuth or
 * googleapis — both add significant surface area for a flow with just two
 * endpoints. Keep it small and boring.
 */

/**
 * Sanitize a `next` redirect path. The OAuth start endpoint accepts a
 * `?next=` query param so the user lands on the page they meant to visit.
 * That parameter is attacker-controlled — without sanitization a crafted
 * link can bounce a logged-in admin to an external host (open redirect)
 * or to a non-admin path that leaks session context.
 *
 * Rule: the only acceptable `next` is a relative path under `/admin`.
 *
 *   "/admin"             → "/admin"          (default)
 *   "/admin/inbox"       → "/admin/inbox"
 *   "/admin/x?y=1"       → "/admin/x?y=1"
 *   "/dashboard"         → "/admin"          (not under /admin)
 *   "//evil.com/x"       → "/admin"          (protocol-relative)
 *   "https://evil.com"   → "/admin"          (absolute URL)
 *   "javascript:..."     → "/admin"
 */
export function sanitizeNext(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) return "/admin";
  // Reject protocol-relative ("//foo") and any URL with a scheme ("https://", "javascript:").
  if (value.startsWith("//")) return "/admin";
  if (value.includes("://")) return "/admin";
  // Must start with /admin and either end there or continue with /, ?, or #.
  if (!value.startsWith("/admin")) return "/admin";
  const after = value.slice("/admin".length);
  if (after.length > 0 && !"/?#".includes(after[0])) return "/admin";
  return value;
}

export const WHITELIST_EMAILS = [
  "anthony@roadmancycling.com",
  "sarah@roadmancycling.com",
  "matthew@roadmancycling.com",
  "wes@roadmancycling.com",
];

/** Only Anthony grants Calendar scope so we can pull his calendar. */
export const CALENDAR_SCOPE_EMAIL = "anthony@roadmancycling.com";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export const STATE_COOKIE = "roadman_admin_oauth_state";

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
  id_token?: string;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export interface StartOptions {
  /** Where to land after login. Defaults to /admin. */
  next?: string;
  /** Force consent prompt (required to receive refresh_token on re-link). */
  forceConsent?: boolean;
  /** Include Google Calendar scope (only for Anthony). */
  includeCalendar?: boolean;
}

export function getConfig(): {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
} {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI"
    );
  }
  return { clientId, clientSecret, redirectUri };
}

export function configured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI
  );
}

/** Signed state token — CSRF protection + carries the `next` redirect. */
export function createState(next: string): string {
  const safeNext = sanitizeNext(next);
  const secret = authSecret();
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${nonce}|${encodeURIComponent(safeNext)}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}|${sig}`;
}

/** Parse + verify state; returns `next` path on success, null on failure. */
export function verifyState(state: string): string | null {
  if (!state) return null;
  const parts = state.split("|");
  if (parts.length !== 3) return null;
  const [nonce, nextEnc, sig] = parts;
  const payload = `${nonce}|${nextEnc}`;
  const secret = authSecret();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  if (sig.length !== expected.length) return null;
  try {
    if (
      !crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))
    )
      return null;
  } catch {
    return null;
  }
  let decoded: string;
  try {
    decoded = decodeURIComponent(nextEnc);
  } catch {
    return null;
  }
  // Defense-in-depth: re-sanitize on the consume side. A signed-but-malformed
  // payload (e.g. created before sanitisation was added) still gets clamped.
  return sanitizeNext(decoded);
}

export function buildAuthUrl(state: string, opts: StartOptions = {}): string {
  const cfg = getConfig();
  const scopes = ["openid", "email", "profile"];
  if (opts.includeCalendar) {
    scopes.push("https://www.googleapis.com/auth/calendar.readonly");
  }
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    state,
    access_type: "offline",
    // Force consent on the "include calendar" flow so we get a refresh_token
    // every time Anthony re-links.
    prompt: opts.forceConsent ? "consent" : "select_account",
    include_granted_scopes: "true",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<GoogleTokenResponse> {
  const cfg = getConfig();
  const body = new URLSearchParams({
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: cfg.redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google token exchange failed: ${res.status} ${text.slice(0, 200)}`);
  }
  return (await res.json()) as GoogleTokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const cfg = getConfig();
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    grant_type: "refresh_token",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Google refresh_token exchange failed: ${res.status} ${text.slice(0, 200)}`
    );
  }
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  return data;
}

export async function fetchUserInfo(
  accessToken: string
): Promise<GoogleUserInfo> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Google userinfo fetch failed: ${res.status}`);
  }
  return (await res.json()) as GoogleUserInfo;
}

export function isWhitelisted(email: string): boolean {
  return WHITELIST_EMAILS.includes(email.trim().toLowerCase());
}
