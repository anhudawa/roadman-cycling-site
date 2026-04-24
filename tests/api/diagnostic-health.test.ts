import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dbSelect: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        limit: (_n: number) => mocks.dbSelect(),
      }),
    }),
  },
}));
vi.mock("@/lib/db/schema", () => ({
  diagnosticSubmissions: {},
}));

const ENV_KEYS = [
  "ANTHROPIC_API_KEY",
  "RESEND_API_KEY",
  "BEEHIIV_API_KEY",
  "NEXT_PUBLIC_CAL_BOOKING_URL",
  "NEXT_PUBLIC_META_PIXEL_ID",
];

describe("GET /api/diagnostic/health", () => {
  const originalEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of ENV_KEYS) {
      originalEnv[k] = process.env[k];
      delete process.env[k];
    }
    mocks.dbSelect.mockReset();
    mocks.dbSelect.mockResolvedValue([{ cnt: 0 }]);
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (originalEnv[k] === undefined) delete process.env[k];
      else process.env[k] = originalEnv[k];
    }
  });

  it("returns 200 with ok:true and all env keys missing when nothing is set", async () => {
    const { GET } = await import("@/app/api/diagnostic/health/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.checks.db).toBe("ok");
    expect(body.checks.anthropicKey).toBe("missing");
    expect(body.checks.resendKey).toBe("missing");
    expect(body.checks.beehiivKey).toBe("missing");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("reports keys as set when env vars are populated", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test";
    process.env.RESEND_API_KEY = "re-test";
    process.env.BEEHIIV_API_KEY = "bh-test";
    const { GET } = await import("@/app/api/diagnostic/health/route");
    const res = await GET();
    const body = await res.json();
    expect(body.checks.anthropicKey).toBe("set");
    expect(body.checks.resendKey).toBe("set");
    expect(body.checks.beehiivKey).toBe("set");
  });

  it("returns 503 with ok:false and error message when DB throws", async () => {
    mocks.dbSelect.mockRejectedValue(new Error("ECONNREFUSED"));
    const { GET } = await import("@/app/api/diagnostic/health/route");
    const res = await GET();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.checks.db).toBe("error");
    expect(body.checks.table).toBe("error");
    expect(body.error).toContain("ECONNREFUSED");
  });

  it("treats whitespace-only env value as missing", async () => {
    process.env.ANTHROPIC_API_KEY = "   ";
    const { GET } = await import("@/app/api/diagnostic/health/route");
    const res = await GET();
    const body = await res.json();
    expect(body.checks.anthropicKey).toBe("missing");
  });
});
