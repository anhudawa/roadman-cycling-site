/**
 * Free-tier rate limiter for /api/predict.
 *
 * Cap: PREDICT_FREE_DAILY (default 3) predictions per anon session per
 * 24-hour rolling window. After that, the API returns 429 with a CTA toward
 * the Race Report or the Not Done Yet community.
 *
 * Two backends:
 *   1. Upstash Redis sliding-window (production / preview when configured)
 *   2. Signed-cookie counter fallback (local dev, or any env without Redis)
 *
 * The cookie fallback is intentionally weak — a determined user can clear it.
 * That's fine: the goal is to slow casual abuse, not to block the determined.
 * The real moat is the email gate + paid Race Report.
 */

import { cookies } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const COOKIE_NAME = "roadman_predict_quota";
const WINDOW_HOURS = 24;
const DEFAULT_LIMIT = 3;

function freeLimit(): number {
  const raw = Number(process.env.PREDICT_FREE_DAILY ?? DEFAULT_LIMIT);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_LIMIT;
}

function redisAvailable(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

let _limiter: Ratelimit | null = null;
function limiter(): Ratelimit {
  if (_limiter) return _limiter;
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  _limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(freeLimit(), `${WINDOW_HOURS} h`),
    prefix: "roadman_predict:free_daily",
  });
  return _limiter;
}

export interface PredictRateLimitInput {
  /** Anon session key from the cookie. */
  sessionKey: string;
  /** SHA-256 IP fragment for fallback identification. */
  ipHash: string;
}

export interface PredictRateLimitResult {
  success: boolean;
  used: number;
  limit: number;
  retryAfterSeconds?: number;
}

/**
 * Check (and consume) one prediction credit. Returns success=false if the
 * caller has hit the daily cap.
 */
export async function checkPredictRateLimit(
  input: PredictRateLimitInput,
): Promise<PredictRateLimitResult> {
  const limit = freeLimit();
  const key = input.sessionKey || input.ipHash || "unknown";

  if (redisAvailable()) {
    try {
      const res = await limiter().limit(key);
      return {
        success: res.success,
        used: limit - res.remaining,
        limit,
        retryAfterSeconds: res.success
          ? undefined
          : Math.max(60, Math.ceil((res.reset - Date.now()) / 1000)),
      };
    } catch (err) {
      // Don't block users on a Redis outage — fall through to cookie.
      console.warn("[predict-rate-limit] redis failed, falling back to cookie:", err);
    }
  }

  return cookieRateLimit(limit);
}

interface CookieState {
  /** ms epoch — when this counter resets. */
  resetAt: number;
  /** count consumed in current window. */
  used: number;
}

async function cookieRateLimit(limit: number): Promise<PredictRateLimitResult> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  const now = Date.now();
  let state: CookieState = { resetAt: now + WINDOW_HOURS * 3600 * 1000, used: 0 };
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as CookieState;
      if (typeof parsed.resetAt === "number" && typeof parsed.used === "number") {
        state = parsed;
      }
    } catch {
      // ignore corrupt cookie — start fresh
    }
  }
  // Window expired: reset.
  if (now >= state.resetAt) {
    state = { resetAt: now + WINDOW_HOURS * 3600 * 1000, used: 0 };
  }

  if (state.used >= limit) {
    return {
      success: false,
      used: state.used,
      limit,
      retryAfterSeconds: Math.max(60, Math.ceil((state.resetAt - now) / 1000)),
    };
  }

  state.used += 1;
  jar.set(COOKIE_NAME, JSON.stringify(state), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: WINDOW_HOURS * 3600,
  });
  return { success: true, used: state.used, limit };
}
