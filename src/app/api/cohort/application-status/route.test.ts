import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ decide: vi.fn(), rateLimit: vi.fn() }));
vi.mock("@/lib/ndy/application-workflow", () => ({ getApplicationDecision: mocks.decide }));
vi.mock("@/lib/rate-limit/ip-rate-limit", () => ({ rateLimitOr429: mocks.rateLimit }));
const token = "b".repeat(64);
const request = (body: unknown, origin = "https://www.roadmancycling.com") => new Request("https://www.roadmancycling.com/api/cohort/application-status", {
  method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body),
});
const state = async (response: Response) => (await response.json() as { state: string }).state;

describe("the application decision endpoint", () => {
  beforeEach(() => {
    vi.stubEnv("NDY_APPLICATION_FLOW_ENABLED", "true");
    mocks.decide.mockReset().mockResolvedValue("pending");
    mocks.rateLimit.mockReset().mockResolvedValue(null);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("exposes no GET action for email scanners and link previews", async () => {
    expect(await import("./route")).not.toHaveProperty("GET");
  });

  it("reports an approval only when the server resolves one", async () => {
    mocks.decide.mockResolvedValue("approved");
    const { POST } = await import("./route");
    const response = await POST(request({ token }));
    expect(response.status).toBe(200);
    expect(await state(response)).toBe("approved");
    expect(mocks.decide).toHaveBeenCalledWith(token);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("holds an unapproved application at pending", async () => {
    const { POST } = await import("./route");
    expect(await state(await POST(request({ token })))).toBe("pending");
  });

  it("never approves a request with no usable token", async () => {
    const { POST } = await import("./route");
    for (const body of [null, [], {}, { token: 42 }, { token: null }]) {
      const response = await POST(request(body));
      expect(await state(response)).not.toBe("approved");
    }
  });

  it("blocks forged origins without looking the token up", async () => {
    const { POST } = await import("./route");
    const response = await POST(request({ token }, "https://attacker.example"));
    expect(response.status).toBe(403);
    expect(await state(response)).toBe("pending");
    expect(mocks.decide).not.toHaveBeenCalled();
  });

  it("fails closed when the flow is switched off", async () => {
    vi.stubEnv("NDY_APPLICATION_FLOW_ENABLED", "false");
    const { POST } = await import("./route");
    const response = await POST(request({ token }));
    expect(response.status).toBe(503);
    expect(await state(response)).toBe("pending");
    expect(mocks.decide).not.toHaveBeenCalled();
  });

  it("fails closed when the lookup throws", async () => {
    mocks.decide.mockRejectedValue(new Error("database unreachable"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await import("./route");
    const response = await POST(request({ token }));
    expect(response.status).toBe(503);
    expect(await state(response)).toBe("pending");
  });

  it("honours the rate limiter before touching the database", async () => {
    mocks.rateLimit.mockResolvedValue(new Response("slow down", { status: 429 }));
    const { POST } = await import("./route");
    expect((await POST(request({ token }))).status).toBe(429);
    expect(mocks.decide).not.toHaveBeenCalled();
  });
});
