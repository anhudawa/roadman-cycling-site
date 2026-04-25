import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Rate-limit tests. The DB-backed email throttle is mocked so we
 * verify the layering + the IP bucket's token-refill behaviour
 * without running a real query.
 */

// Hoist the fakeCount mock so the vi.mock factory can close over it.
const { fakeCount } = vi.hoisted(() => ({ fakeCount: vi.fn() }));

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: (..._args: unknown[]) =>
          Promise.resolve([{ cnt: fakeCount() }]),
      }),
    }),
  },
}));

// Minimal drizzle schema stub $€” only the bits the rate-limit module
// reads (column references inside the sql template).
vi.mock("@/lib/db/schema", () => ({
  diagnosticSubmissions: {
    email: { name: "email" },
    createdAt: { name: "created_at" },
  },
}));

// drizzle-orm's `sql` tag is used inside the module; pass through a
// no-op so the test never actually runs a real SQL query.
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    sql: Object.assign(
      (..._args: unknown[]) => ({ __sql: true }),
      { raw: (s: string) => ({ __sqlraw: s }) }
    ),
  };
});

function mockRequest(ip: string | null): Request {
  const headers = new Headers();
  if (ip) headers.set("x-forwarded-for", ip);
  return new Request("https://example.test/api/diagnostic/submit", {
    method: "POST",
    headers,
  });
}

describe("rate-limit", () => {
  beforeEach(async () => {
    fakeCount.mockReset();
    fakeCount.mockReturnValue(0);
    const mod = await import("./rate-limit");
    mod.__resetRateLimit();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first few requests from a fresh IP", async () => {
    const { checkRateLimit } = await import("./rate-limit");
    for (let i = 0; i < 5; i++) {
      const v = await checkRateLimit(mockRequest("1.2.3.4"), "a@b.com");
      expect(v.ok).toBe(true);
    }
  });

  it("blocks a 6th request from the same IP inside the window", async () => {
    const { checkRateLimit } = await import("./rate-limit");
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(mockRequest("10.0.0.1"), "a@b.com");
    }
    const v = await checkRateLimit(mockRequest("10.0.0.1"), "a@b.com");
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.reason).toBe("ip");
      expect(v.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("keys the bucket per IP", async () => {
    const { checkRateLimit } = await import("./rate-limit");
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(mockRequest("10.0.0.1"), "a@b.com");
    }
    // Different IP, same email $€” should still be allowed.
    const v = await checkRateLimit(mockRequest("10.0.0.2"), "a@b.com");
    expect(v.ok).toBe(true);
  });

  it("refills the token bucket after the window elapses", async () => {
    vi.useFakeTimers({ now: new Date("2026-04-22T12:00:00Z") });
    const { checkRateLimit } = await import("./rate-limit");

    for (let i = 0; i < 5; i++) {
      await checkRateLimit(mockRequest("10.0.0.3"), "a@b.com");
    }
    // Fast-forward past the IP window (60s).
    vi.advanceTimersByTime(61_000);

    const v = await checkRateLimit(mockRequest("10.0.0.3"), "a@b.com");
    expect(v.ok).toBe(true);
  });

  it("uses the DB email throttle when the IP bucket passes", async () => {
    fakeCount.mockReturnValue(3); // exactly at the limit (EMAIL_MAX_HITS = 3)
    const { checkRateLimit } = await import("./rate-limit");
    const v = await checkRateLimit(mockRequest("99.99.99.99"), "a@b.com");
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toBe("email");
  });

  it("extractIp pulls the first entry from a comma-joined x-forwarded-for", async () => {
    const { extractIp } = await import("./rate-limit");
    const req = new Request("https://example.test/", {
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1, 192.168.1.1" },
    });
    expect(extractIp(req)).toBe("1.2.3.4");
  });

  it("extractIp falls back to x-real-ip when x-forwarded-for is absent", async () => {
    const { extractIp } = await import("./rate-limit");
    const req = new Request("https://example.test/", {
      headers: { "x-real-ip": "10.20.30.40" },
    });
    expect(extractIp(req)).toBe("10.20.30.40");
  });
});
