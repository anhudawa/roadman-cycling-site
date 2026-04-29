/**
 * Generic IP-based sliding-window rate limiter for public, unauthenticated
 * endpoints (contact form, newsletter signup, lead-magnet subscribe, etc.).
 *
 * Mirrors the pattern in `src/lib/ask/rate-limit.ts` but keys on the
 * caller IP (best-effort from request headers) plus an endpoint
 * namespace, so each endpoint can have its own bucket without
 * stomping on neighbours.
 *
 * When Upstash Redis isn't configured (local dev), every check passes
 * so endpoints stay usable without external infra. In production
 * (where Upstash IS configured per `/api/ask`), the limit is enforced.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const limiters: Map<string, Ratelimit> = new Map();

function redisAvailable(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function redis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

export interface IpRateLimitConfig {
  /** Endpoint identifier — used as the Redis key prefix. */
  namespace: string;
  /** Max requests per window. */
  tokens: number;
  /** Sliding window, e.g. "1 m", "10 m", "1 h", "24 h". */
  window: `${number} ${"s" | "m" | "h" | "d"}`;
}

function limiterFor(cfg: IpRateLimitConfig): Ratelimit {
  const key = `${cfg.namespace}:${cfg.tokens}:${cfg.window}`;
  const cached = limiters.get(key);
  if (cached) return cached;
  const rl = new Ratelimit({
    redis: redis(),
    limiter: Ratelimit.slidingWindow(cfg.tokens, cfg.window),
    prefix: `roadman_rl:${cfg.namespace}`,
  });
  limiters.set(key, rl);
  return rl;
}

/**
 * Best-effort caller-IP extraction from a Next.js `Request`.
 * `x-forwarded-for` may contain a comma-separated chain — take the
 * first (client) entry. Falls back to `unknown` so we still rate-limit
 * (lumping unknown callers into one bucket beats no limit at all).
 */
export function getCallerIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export interface IpRateLimitResult {
  success: boolean;
  remaining?: number;
  retryAfterSeconds?: number;
}

export async function checkIpRateLimit(
  req: Request,
  cfg: IpRateLimitConfig,
): Promise<IpRateLimitResult> {
  if (!redisAvailable()) {
    // Dev-mode fallback: never block. Production has Upstash via the
    // same env vars `/api/ask` uses, so this branch is dev-only.
    return { success: true };
  }
  const ip = getCallerIp(req);
  const res = await limiterFor(cfg).limit(ip);
  if (res.success) {
    return { success: true, remaining: res.remaining };
  }
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((res.reset - Date.now()) / 1000),
  );
  return { success: false, remaining: res.remaining, retryAfterSeconds };
}

/**
 * Convenience wrapper that returns a 429 `Response` ready to be
 * returned from an API route, or `null` if the request is allowed.
 *
 * Usage:
 *   const limited = await rateLimitOr429(request, {
 *     namespace: "contact",
 *     tokens: 5,
 *     window: "10 m",
 *   });
 *   if (limited) return limited;
 */
export async function rateLimitOr429(
  req: Request,
  cfg: IpRateLimitConfig,
): Promise<Response | null> {
  const result = await checkIpRateLimit(req, cfg);
  if (result.success) return null;
  const retry = result.retryAfterSeconds ?? 60;
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retryAfterSeconds: retry,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retry),
      },
    },
  );
}
