/**
 * Per-user, per-action rate limiting for Blood Engine's paid Anthropic calls.
 *
 * DB-backed (no Redis in this project). Each call appends a row to
 * blood_engine_api_calls; enforceRateLimit() counts rows in the configured
 * sliding windows and throws RateLimitError when any window is exceeded.
 *
 * Insert AFTER a successful upstream call, not before, so a user whose LLM
 * call fails (timeout, validation, upstream 5xx) doesn't burn a slot.
 */

import { and, eq, gte } from "drizzle-orm";
import { db } from "../db";
import { bloodEngineApiCalls } from "../db/schema";

export type RateLimitedAction = "interpret" | "parse-pdf";

export interface RateWindow {
  /** Window length in seconds. */
  windowSeconds: number;
  /** Maximum allowed calls inside the window. */
  max: number;
  /** Human label used in error messages. */
  label: string;
}

export const RATE_LIMITS: Record<RateLimitedAction, RateWindow[]> = {
  // interpret: paid LLM call, slow, expensive — tight cap
  interpret: [
    { windowSeconds: 60 * 60, max: 5, label: "hour" },
    { windowSeconds: 24 * 60 * 60, max: 20, label: "day" },
  ],
  // parse-pdf: cheaper but users may upload, edit, re-upload
  "parse-pdf": [
    { windowSeconds: 60 * 60, max: 15, label: "hour" },
    { windowSeconds: 24 * 60 * 60, max: 50, label: "day" },
  ],
};

export class RateLimitError extends Error {
  /** Seconds until the user can try again (max across exceeded windows). */
  retryAfterSeconds: number;
  windowLabel: string;

  constructor(message: string, retryAfterSeconds: number, windowLabel: string) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
    this.windowLabel = windowLabel;
  }
}

/**
 * Pure decision function — given the configured windows, the current time, and
 * a sorted-ascending list of call timestamps, return null if the caller has
 * headroom or a RateLimitError if any window is over cap.
 *
 * Extracted so the rate-limit logic is unit-testable without a real database.
 */
export function decideRateLimit(
  action: RateLimitedAction,
  callTimes: Date[],
  now: Date = new Date()
): RateLimitError | null {
  const windows = RATE_LIMITS[action];
  for (const w of windows) {
    const since = now.getTime() - w.windowSeconds * 1000;
    const inside = callTimes.filter((t) => t.getTime() >= since);
    if (inside.length >= w.max) {
      // Oldest call inside the window — when it falls out, a slot frees.
      const oldest = inside.reduce((a, b) => (a.getTime() < b.getTime() ? a : b));
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldest.getTime() + w.windowSeconds * 1000 - now.getTime()) / 1000)
      );
      return new RateLimitError(
        `Rate limit exceeded for "${action}": ${w.max} calls per ${w.label}. Try again in ${formatRetry(retryAfterSeconds)}.`,
        retryAfterSeconds,
        w.label
      );
    }
  }
  return null;
}

/**
 * Throws RateLimitError if the user has exceeded any configured window.
 * Returns silently if all windows have headroom.
 */
export async function enforceRateLimit(
  userId: number,
  action: RateLimitedAction,
  now: Date = new Date()
): Promise<void> {
  // Look back over the longest configured window — anything older than that
  // can't influence any decision.
  const longest = Math.max(...RATE_LIMITS[action].map((w) => w.windowSeconds));
  const since = new Date(now.getTime() - longest * 1000);
  const callTimes = await loadCallTimes(userId, action, since);
  const error = decideRateLimit(action, callTimes, now);
  if (error) throw error;
}

/** Append a successful call to the log. */
export async function recordApiCall(
  userId: number,
  action: RateLimitedAction
): Promise<void> {
  await db.insert(bloodEngineApiCalls).values({ userId, action });
}

async function loadCallTimes(
  userId: number,
  action: RateLimitedAction,
  since: Date
): Promise<Date[]> {
  const rows = await db
    .select({ createdAt: bloodEngineApiCalls.createdAt })
    .from(bloodEngineApiCalls)
    .where(
      and(
        eq(bloodEngineApiCalls.userId, userId),
        eq(bloodEngineApiCalls.action, action),
        gte(bloodEngineApiCalls.createdAt, since)
      )
    )
    .orderBy(bloodEngineApiCalls.createdAt);
  return rows.map((r) => r.createdAt);
}

function formatRetry(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 60 * 60) return `${Math.ceil(seconds / 60)} minutes`;
  return `${Math.ceil(seconds / (60 * 60))} hours`;
}
