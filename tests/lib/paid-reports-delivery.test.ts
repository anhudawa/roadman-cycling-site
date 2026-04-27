import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Resend wrapper retry semantics.
 *
 * The wrapper retries up to 2 times on 5xx / network errors with
 * exponential backoff, but does not retry 4xx (auth, validation,
 * attachment too big) — those are permanent and would burn through
 * our budget for nothing.
 */

const ENV_KEY = "RESEND_API_KEY";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("sendReportEmail", () => {
  const original = process.env[ENV_KEY];
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env[ENV_KEY] = "re_test";
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
  });

  afterEach(() => {
    if (original === undefined) delete process.env[ENV_KEY];
    else process.env[ENV_KEY] = original;
    vi.restoreAllMocks();
  });

  it("throws when RESEND_API_KEY is missing", async () => {
    delete process.env[ENV_KEY];
    const { sendReportEmail } = await import("@/lib/paid-reports/delivery");
    await expect(
      sendReportEmail({ to: "x@y.co", subject: "s", html: "<p>h</p>" }),
    ).rejects.toThrow(/RESEND_API_KEY/);
  });

  it("returns id on first success without retrying", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(200, { id: "em_1" }));
    const { sendReportEmail } = await import("@/lib/paid-reports/delivery");
    const result = await sendReportEmail(
      { to: "x@y.co", subject: "s", html: "<p>h</p>" },
      { sleep: vi.fn().mockResolvedValue(undefined) },
    );
    expect(result.id).toBe("em_1");
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("retries on 5xx and succeeds on the second attempt", async () => {
    fetchSpy
      .mockResolvedValueOnce(jsonResponse(503, { error: "down" }))
      .mockResolvedValueOnce(jsonResponse(200, { id: "em_2" }));
    const sleep = vi.fn().mockResolvedValue(undefined);
    const { sendReportEmail } = await import("@/lib/paid-reports/delivery");
    const result = await sendReportEmail(
      { to: "x@y.co", subject: "s", html: "<p>h</p>" },
      { maxRetries: 2, initialBackoffMs: 10, sleep },
    );
    expect(result.id).toBe("em_2");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(10);
  });

  it("does NOT retry on permanent 4xx (e.g. attachment too big)", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(413, { error: "too big" }));
    const sleep = vi.fn();
    const { sendReportEmail } = await import("@/lib/paid-reports/delivery");
    await expect(
      sendReportEmail(
        { to: "x@y.co", subject: "s", html: "<p>h</p>" },
        { maxRetries: 2, initialBackoffMs: 10, sleep },
      ),
    ).rejects.toThrow(/413/);
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(sleep).not.toHaveBeenCalled();
  });

  it("retries on 429 (rate limit) — treated as transient", async () => {
    fetchSpy
      .mockResolvedValueOnce(jsonResponse(429, { error: "rate" }))
      .mockResolvedValueOnce(jsonResponse(200, { id: "em_3" }));
    const sleep = vi.fn().mockResolvedValue(undefined);
    const { sendReportEmail } = await import("@/lib/paid-reports/delivery");
    const result = await sendReportEmail(
      { to: "x@y.co", subject: "s", html: "<p>h</p>" },
      { maxRetries: 2, initialBackoffMs: 5, sleep },
    );
    expect(result.id).toBe("em_3");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("retries on network errors and throws after exhausting attempts", async () => {
    fetchSpy.mockRejectedValue(new Error("ECONNRESET"));
    const sleep = vi.fn().mockResolvedValue(undefined);
    const { sendReportEmail } = await import("@/lib/paid-reports/delivery");
    await expect(
      sendReportEmail(
        { to: "x@y.co", subject: "s", html: "<p>h</p>" },
        { maxRetries: 2, initialBackoffMs: 5, sleep },
      ),
    ).rejects.toThrow(/ECONNRESET/);
    // 1 original + 2 retries = 3 attempts; 2 sleeps between them.
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it("backoff grows by 3x on each retry", async () => {
    fetchSpy
      .mockResolvedValueOnce(jsonResponse(500, {}))
      .mockResolvedValueOnce(jsonResponse(500, {}))
      .mockResolvedValueOnce(jsonResponse(200, { id: "em_4" }));
    const sleep = vi.fn().mockResolvedValue(undefined);
    const { sendReportEmail } = await import("@/lib/paid-reports/delivery");
    await sendReportEmail(
      { to: "x@y.co", subject: "s", html: "<p>h</p>" },
      { maxRetries: 2, initialBackoffMs: 100, sleep },
    );
    expect(sleep).toHaveBeenNthCalledWith(1, 100);
    expect(sleep).toHaveBeenNthCalledWith(2, 300);
  });
});
