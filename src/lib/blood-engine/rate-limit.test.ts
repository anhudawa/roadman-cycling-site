import { describe, expect, it } from "vitest";
import { decideRateLimit, RateLimitError, RATE_LIMITS } from "./rate-limit";

const NOW = new Date("2026-04-14T12:00:00Z");
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60 * 1000);
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 60 * 60 * 1000);

describe("blood-engine/rate-limit", () => {
  it("declares both an hourly and a daily window for each action", () => {
    for (const action of ["interpret", "parse-pdf"] as const) {
      const labels = RATE_LIMITS[action].map((w) => w.label);
      expect(labels).toContain("hour");
      expect(labels).toContain("day");
    }
  });

  it("returns null when no calls have been made", () => {
    expect(decideRateLimit("interpret", [], NOW)).toBeNull();
  });

  it("returns null when calls are below every cap", () => {
    // 4 calls in the last hour (cap is 5 for interpret)
    const calls = [55, 40, 25, 10].map(minutesAgo);
    expect(decideRateLimit("interpret", calls, NOW)).toBeNull();
  });

  it("trips the hourly cap on the 6th interpret call inside the hour", () => {
    const calls = [55, 50, 40, 30, 20, 10].map(minutesAgo);
    const err = decideRateLimit("interpret", calls, NOW);
    expect(err).toBeInstanceOf(RateLimitError);
    expect(err?.windowLabel).toBe("hour");
    // Oldest in-window call was 55 min ago; next slot opens in 5 min = 300s
    expect(err?.retryAfterSeconds).toBeGreaterThan(280);
    expect(err?.retryAfterSeconds).toBeLessThanOrEqual(300);
  });

  it("does NOT trip the hourly cap when older calls have aged out", () => {
    // 5 calls more than an hour ago + 4 inside the hour → still under hourly cap
    const calls = [
      ...[120, 119, 118, 117, 116].map(minutesAgo),
      ...[55, 40, 25, 10].map(minutesAgo),
    ];
    expect(decideRateLimit("interpret", calls, NOW)).toBeNull();
  });

  it("trips the daily cap on the 21st interpret call inside 24h", () => {
    // 21 calls spread across the last 23 hours
    const calls: Date[] = [];
    for (let i = 0; i < 21; i++) {
      calls.push(hoursAgo(23 - i * 0.5));
    }
    const err = decideRateLimit("interpret", calls, NOW);
    expect(err).toBeInstanceOf(RateLimitError);
    // Could be either window — but with 21 calls at this spacing, daily trips
    expect(err?.windowLabel).toBe("day");
  });

  it("uses parse-pdf-specific limits (15/hour) — 14 inside hour OK", () => {
    const calls: Date[] = [];
    for (let i = 0; i < 14; i++) calls.push(minutesAgo(50 - i * 3));
    expect(decideRateLimit("parse-pdf", calls, NOW)).toBeNull();
  });

  it("uses parse-pdf-specific limits (15/hour) — 15 inside hour trips", () => {
    const calls: Date[] = [];
    for (let i = 0; i < 15; i++) calls.push(minutesAgo(58 - i * 3));
    const err = decideRateLimit("parse-pdf", calls, NOW);
    expect(err).toBeInstanceOf(RateLimitError);
    expect(err?.windowLabel).toBe("hour");
  });

  it("RateLimitError carries human-readable retry text", () => {
    const calls = [58, 50, 40, 30, 20, 10].map(minutesAgo);
    const err = decideRateLimit("interpret", calls, NOW);
    expect(err?.message).toMatch(/Try again in/);
    expect(err?.message).toMatch(/per hour/);
  });

  it("retryAfterSeconds is at least 1 second even at boundary conditions", () => {
    // All 5 calls happened exactly an hour ago
    const calls = Array.from({ length: 5 }, () => hoursAgo(1));
    const err = decideRateLimit("interpret", calls, NOW);
    if (err) {
      expect(err.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    }
  });
});
