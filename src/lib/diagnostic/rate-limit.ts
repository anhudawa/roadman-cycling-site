import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { diagnosticSubmissions } from "@/lib/db/schema";

/**
 * Abuse / cost protection for `POST /api/diagnostic/submit`.
 *
 * The submit endpoint is public, writes to Postgres, and calls the
 * Claude API on every legitimate request. Without a throttle anyone
 * can spam submissions and burn through Anthony's API budget.
 *
 * Two layers:
 *
 *  1. **In-memory per-instance** token bucket keyed by IP. Stops
 *     casual flooding from a single client without touching the DB.
 *     Not shared across Vercel serverless instances — a determined
 *     attacker hitting different regions bypasses this layer.
 *
 *  2. **DB-backed email throttle** via a count query against
 *     `diagnostic_submissions`. Reliable across instances. Even a
 *     distributed attacker using different IPs gets rate-limited by
 *     the email they're spamming. Legitimate retakes are days apart
 *     in practice so a 10-minute window is generous.
 *
 * Both layers are best-effort on failure — if the DB query blows up
 * we fall back to "allow" rather than block real users.
 */

// Arbitrary but sensible defaults. Adjust if real traffic patterns
// justify it. See docs/plateau-diagnostic.md.
const IP_MAX_HITS = 5;
const IP_WINDOW_MS = 60_000; // 1 minute
const EMAIL_MAX_HITS = 3;
const EMAIL_WINDOW_MINUTES = 10;

// Module-level so the Map survives between invocations on a single
// warm serverless instance.
const ipHits = new Map<string, number[]>();

/** Extract the best-effort client IP from the standard Vercel headers. */
export function extractIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    // x-forwarded-for can be a comma-separated list; the client is the first.
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? null;
}

export type RateLimitVerdict =
  | { ok: true }
  | { ok: false; reason: "ip" | "email"; retryAfterSeconds: number };

/**
 * In-memory IP throttle. Called first because it's free (no DB
 * round-trip). Returns `null` when the caller has no IP to key off —
 * the submit route still runs the DB layer in that case.
 */
function checkIpBucket(ip: string | null): RateLimitVerdict | null {
  if (!ip) return null;
  const now = Date.now();
  const hits = ipHits.get(ip) ?? [];
  const fresh = hits.filter((t) => now - t < IP_WINDOW_MS);
  if (fresh.length >= IP_MAX_HITS) {
    const oldest = fresh[0];
    const retryAfter = Math.ceil((IP_WINDOW_MS - (now - oldest)) / 1000);
    return { ok: false, reason: "ip", retryAfterSeconds: Math.max(retryAfter, 1) };
  }
  fresh.push(now);
  ipHits.set(ip, fresh);

  // Opportunistic cleanup so the Map doesn't leak across a long-lived
  // warm instance. 5% probability keeps the bound well under the
  // expected traffic-per-instance, even if Vercel reuses the process
  // for hours.
  if (Math.random() < 0.05) {
    for (const [key, stamps] of ipHits.entries()) {
      const recent = stamps.filter((t) => now - t < IP_WINDOW_MS);
      if (recent.length === 0) ipHits.delete(key);
      else ipHits.set(key, recent);
    }
  }
  return { ok: true };
}

/**
 * DB-backed email throttle. Counts same-email submissions inside the
 * window. Safe on failure — a DB hiccup doesn't block legitimate
 * traffic.
 */
async function checkEmailThrottle(email: string): Promise<RateLimitVerdict> {
  try {
    const [row] = await db
      .select({ cnt: sql<number>`count(*)` })
      .from(diagnosticSubmissions)
      .where(
        sql`${diagnosticSubmissions.email} = ${email} AND ${diagnosticSubmissions.createdAt} > NOW() - make_interval(mins => ${EMAIL_WINDOW_MINUTES})`
      );
    const count = Number(row?.cnt ?? 0);
    if (count >= EMAIL_MAX_HITS) {
      return {
        ok: false,
        reason: "email",
        retryAfterSeconds: EMAIL_WINDOW_MINUTES * 60,
      };
    }
    return { ok: true };
  } catch (err) {
    console.error("[Diagnostic/rate-limit] email throttle query failed:", err);
    return { ok: true };
  }
}

/**
 * Full rate-limit check. Call before scoring / Claude — cheap enough
 * that we never start the expensive work for an abusive caller.
 */
export async function checkRateLimit(
  request: Request,
  email: string
): Promise<RateLimitVerdict> {
  const ip = extractIp(request);
  const ipVerdict = checkIpBucket(ip);
  if (ipVerdict && !ipVerdict.ok) return ipVerdict;
  return checkEmailThrottle(email);
}

// Test-only reset. Module-level Map otherwise bleeds state between
// vitest test cases.
export function __resetRateLimit(): void {
  ipHits.clear();
}
