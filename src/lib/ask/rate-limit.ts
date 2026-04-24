/**
 * Tier-aware sliding-window rate limiter for /api/ask.
 *
 * - Anonymous sessions: per-session limits on short (10m) and long (24h) windows
 *   so a single browser can't blast the model.
 * - Rider-profile sessions: higher per-hour limit, keyed by profile id.
 *
 * When Upstash Redis isn't configured (local dev), all checks pass so `/ask`
 * works without external infra.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type LimiterKind = "anon_short" | "anon_daily" | "profile_hourly";

const limiters: Partial<Record<LimiterKind, Ratelimit>> = {};

function redisAvailable(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function redis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

function limiterFor(kind: LimiterKind): Ratelimit {
  const cached = limiters[kind];
  if (cached) return cached;

  const anonRpm = Number(process.env.ASK_ROADMAN_ANON_RPM ?? 5);
  const anonDaily = Number(process.env.ASK_ROADMAN_ANON_DAILY ?? 10);
  const profileRph = Number(process.env.ASK_ROADMAN_PROFILE_RPH ?? 30);

  const configs: Record<LimiterKind, { tokens: number; window: `${number} ${"m" | "h" | "d" | "s"}` }> = {
    anon_short: { tokens: anonRpm, window: "10 m" },
    anon_daily: { tokens: anonDaily, window: "24 h" },
    profile_hourly: { tokens: profileRph, window: "1 h" },
  };
  const cfg = configs[kind];

  const rl = new Ratelimit({
    redis: redis(),
    limiter: Ratelimit.slidingWindow(cfg.tokens, cfg.window),
    prefix: `roadman_ask:${kind}`,
  });
  limiters[kind] = rl;
  return rl;
}

export interface AskRateLimitInput {
  tier: "anon" | "profile";
  sessionKey: string;           // anon cookie or `profile:<id>`
  ipHash?: string | null;       // fallback key for anon if cookie missing
}

export interface AskRateLimitResult {
  success: boolean;
  kind?: LimiterKind;
  remaining?: number;
  retryAfterSeconds?: number;
}

export async function checkAskRateLimit(
  input: AskRateLimitInput,
): Promise<AskRateLimitResult> {
  if (!redisAvailable()) {
    // Dev-mode fallback: never block.
    return { success: true };
  }

  const anonKey = input.sessionKey || input.ipHash || "unknown";

  const checks: Array<{ kind: LimiterKind; key: string }> =
    input.tier === "profile"
      ? [{ kind: "profile_hourly", key: input.sessionKey }]
      : [
          { kind: "anon_short", key: anonKey },
          { kind: "anon_daily", key: anonKey },
        ];

  for (const c of checks) {
    const res = await limiterFor(c.kind).limit(c.key);
    if (!res.success) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((res.reset - Date.now()) / 1000),
      );
      return { success: false, kind: c.kind, remaining: res.remaining, retryAfterSeconds };
    }
  }
  return { success: true };
}
