import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rateLimitOr429: vi.fn(),
  recordEvent: vi.fn(),
  upsertOnSignup: vi.fn(),
  readAnonSessionKey: vi.fn(),
}));

vi.mock("@/lib/rate-limit/ip-rate-limit", () => ({
  rateLimitOr429: mocks.rateLimitOr429,
}));
vi.mock("@/lib/admin/events-store", () => ({
  recordEvent: mocks.recordEvent,
}));
vi.mock("@/lib/admin/subscribers-store", () => ({
  upsertOnSignup: mocks.upsertOnSignup,
}));
vi.mock("@/lib/rider-profile/anon-session", () => ({
  readAnonSessionKey: mocks.readAnonSessionKey,
}));
vi.mock("@/lib/analytics/ai-referrer-server", () => ({
  detectAIReferrerFromRequest: () => undefined,
}));

function request(body: unknown, headers?: HeadersInit): Request {
  return new Request("https://roadmancycling.com/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/events", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.rateLimitOr429.mockResolvedValue(null);
    mocks.recordEvent.mockResolvedValue({ id: "event-1" });
    mocks.readAnonSessionKey.mockResolvedValue("anon-session");
    mocks.upsertOnSignup.mockResolvedValue(undefined);
  });

  it("rate limits before writing", async () => {
    mocks.rateLimitOr429.mockResolvedValue(
      new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
      }),
    );
    const { POST } = await import("./route");
    const response = await POST(request({ type: "pageview", page: "/" }));

    expect(response.status).toBe(429);
    expect(mocks.recordEvent).not.toHaveBeenCalled();
  });

  it("rejects a different Origin before rate limiting or writing", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      request(
        { type: "pageview", page: "/" },
        { Origin: "https://malicious.example" },
      ),
    );

    expect(response.status).toBe(403);
    expect(mocks.rateLimitOr429).not.toHaveBeenCalled();
    expect(mocks.recordEvent).not.toHaveBeenCalled();
  });

  it("rejects malformed and oversized payloads", async () => {
    const { POST } = await import("./route");
    const malformed = await POST(request("{"));
    const oversized = await POST(
      request(
        { type: "pageview", page: "/" },
        { "Content-Length": "20000" },
      ),
    );

    expect(malformed.status).toBe(400);
    expect(oversized.status).toBe(413);
    expect(mocks.recordEvent).not.toHaveBeenCalled();
  });

  it("enforces the byte limit when Content-Length is absent or spoofed", async () => {
    const { POST } = await import("./route");
    const oversizedBody = JSON.stringify({
      type: "pageview",
      page: "/",
      meta: { note: "🚴".repeat(4_100) },
    });

    expect(oversizedBody.length).toBeLessThan(16_384);
    expect(new TextEncoder().encode(oversizedBody).byteLength).toBeGreaterThan(
      16_384,
    );

    const withoutLength = request(oversizedBody);
    expect(withoutLength.headers.get("content-length")).toBeNull();
    const absentLengthResponse = await POST(withoutLength);
    const spoofedLengthResponse = await POST(
      request(oversizedBody, { "Content-Length": "64" }),
    );

    expect(absentLengthResponse.status).toBe(413);
    expect(spoofedLengthResponse.status).toBe(413);
    expect(mocks.recordEvent).not.toHaveBeenCalled();
  });

  it("rejects unknown types and unsafe metadata shapes", async () => {
    const { POST } = await import("./route");
    const unknown = await POST(request({ type: "made_up", page: "/" }));
    const nestedMeta = await POST(
      request({
        type: "pageview",
        page: "/",
        meta: { nested: { unsafe: true } },
      }),
    );

    expect(unknown.status).toBe(400);
    expect(nestedMeta.status).toBe(400);
    expect(mocks.recordEvent).not.toHaveBeenCalled();
  });

  it("normalises valid fields and stores bounded scalar metadata", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      request(
        {
          type: "apply_step_completed",
          page: "/apply",
          email: " SAM@EXAMPLE.COM ",
          source: "ndy-application",
          meta: { step: "details", completed: true, index: 4 },
        },
        { Origin: "https://roadmancycling.com" },
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.recordEvent).toHaveBeenCalledWith(
      "apply_step_completed",
      "/apply",
      expect.objectContaining({
        email: "sam@example.com",
        source: "ndy-application",
        meta: {
          step: "details",
          completed: "true",
          index: "4",
        },
        sessionId: "anon-session",
      }),
    );
  });
});
