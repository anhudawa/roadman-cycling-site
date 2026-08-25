import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const limit = vi.hoisted(() => vi.fn());

vi.mock("@upstash/ratelimit", () => {
  class MockRatelimit {
    static slidingWindow = vi.fn(() => ({ type: "sliding-window" }));
    limit = limit;
  }

  return { Ratelimit: MockRatelimit };
});

vi.mock("@upstash/redis", () => ({
  Redis: class MockRedis {},
}));

describe("MCP rate limiter", () => {
  const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  beforeEach(() => {
    vi.resetModules();
    limit.mockReset();
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.test";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  });

  afterEach(() => {
    if (originalUrl === undefined) {
      delete process.env.UPSTASH_REDIS_REST_URL;
    } else {
      process.env.UPSTASH_REDIS_REST_URL = originalUrl;
    }

    if (originalToken === undefined) {
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    } else {
      process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    }

    vi.restoreAllMocks();
  });

  it("enforces a healthy Upstash response", async () => {
    limit.mockResolvedValue({ success: false, remaining: 0 });
    const { checkRateLimit } = await import("@/lib/mcp/rate-limiter");

    await expect(checkRateLimit("203.0.113.1")).resolves.toEqual({
      success: false,
      remaining: 0,
    });
  });

  it("fails open when the Upstash provider rejects the request", async () => {
    const error = new Error("ERR max requests limit exceeded");
    limit.mockRejectedValue(error);
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { checkRateLimit } = await import("@/lib/mcp/rate-limiter");

    await expect(checkRateLimit("203.0.113.2")).resolves.toEqual({
      success: true,
    });
    expect(log).toHaveBeenCalledWith(
      "[mcp] Rate limiter unavailable; allowing request",
      error,
    );
  });

  it("fails open when either Redis credential is missing", async () => {
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const { checkRateLimit } = await import("@/lib/mcp/rate-limiter");

    await expect(checkRateLimit("203.0.113.3")).resolves.toEqual({
      success: true,
    });
    expect(limit).not.toHaveBeenCalled();
  });
});
