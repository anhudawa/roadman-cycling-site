import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  streamAnswer: vi.fn(),
  checkAskRateLimit: vi.fn(),
  getOrCreateAnonSessionKey: vi.fn(),
  createSession: vi.fn(),
  loadSession: vi.fn(),
  loadSessionByAnonKey: vi.fn(),
  loadSessionByRiderProfile: vi.fn(),
  touchSession: vi.fn(),
}));

vi.mock("@/lib/ask/orchestrator", () => ({
  streamAnswer: mocks.streamAnswer,
}));
vi.mock("@/lib/ask/rate-limit", () => ({
  checkAskRateLimit: mocks.checkAskRateLimit,
}));
vi.mock("@/lib/rider-profile/anon-session", () => ({
  getOrCreateAnonSessionKey: mocks.getOrCreateAnonSessionKey,
}));
vi.mock("@/lib/ask/store", () => ({
  createSession: mocks.createSession,
  loadSession: mocks.loadSession,
  loadSessionByAnonKey: mocks.loadSessionByAnonKey,
  loadSessionByRiderProfile: mocks.loadSessionByRiderProfile,
  touchSession: mocks.touchSession,
}));

const SESSION_ID = "11111111-1111-4111-8111-111111111111";

function req(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://example.test/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function consumeStream(stream: ReadableStream<Uint8Array> | null): Promise<string> {
  if (!stream) return "";
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let acc = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    acc += decoder.decode(value, { stream: true });
  }
  acc += decoder.decode();
  return acc;
}

describe("POST /api/ask", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.checkAskRateLimit.mockResolvedValue({ success: true });
    mocks.getOrCreateAnonSessionKey.mockResolvedValue("anon-abc");
    mocks.loadSession.mockResolvedValue(null);
    mocks.loadSessionByAnonKey.mockResolvedValue(null);
    mocks.loadSessionByRiderProfile.mockResolvedValue(null);
    mocks.touchSession.mockResolvedValue(undefined);
    mocks.createSession.mockResolvedValue({
      id: SESSION_ID,
      riderProfileId: null,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      messageCount: 0,
    });
    mocks.streamAnswer.mockImplementation(async (_args, ctrl) => {
      ctrl.close();
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("returns 405 on GET", async () => {
    const { GET } = await import("@/app/api/ask/route");
    const res = await GET();
    expect(res.status).toBe(405);
  });

  it("rejects malformed JSON with 400 invalid_json", async () => {
    const { POST } = await import("@/app/api/ask/route");
    const r = new Request("https://example.test/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not json",
    });
    const res = await POST(r);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("invalid_json");
  });

  it("rejects schema-invalid body with 400 bad_request", async () => {
    const { POST } = await import("@/app/api/ask/route");
    const res = await POST(req({ query: "x" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("bad_request");
  });

  it("returns 429 rate_limited when limiter denies", async () => {
    mocks.checkAskRateLimit.mockResolvedValue({ success: false, retryAfterSeconds: 42 });
    const { POST } = await import("@/app/api/ask/route");
    const res = await POST(req({ query: "How should I structure zone 2?" }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error.code).toBe("rate_limited");
    expect(body.error.retryAfterSeconds).toBe(42);
  });

  it("uses anon tier when no riderProfileId", async () => {
    const { POST } = await import("@/app/api/ask/route");
    await POST(req({ query: "How should I train?" }));
    const args = mocks.checkAskRateLimit.mock.calls[0]?.[0];
    expect(args.tier).toBe("anon");
    expect(args.sessionKey).toBe("anon-abc");
  });

  it("uses profile tier when riderProfileId is set", async () => {
    const { POST } = await import("@/app/api/ask/route");
    await POST(req({ query: "How should I train?", riderProfileId: 7 }));
    const args = mocks.checkAskRateLimit.mock.calls[0]?.[0];
    expect(args.tier).toBe("profile");
    expect(args.sessionKey).toBe("profile:7");
  });

  it("creates a new session when none exists for the anon key", async () => {
    const { POST } = await import("@/app/api/ask/route");
    const res = await POST(req({ query: "Tell me about FTP." }));
    expect(res.status).toBe(200);
    expect(mocks.createSession).toHaveBeenCalledOnce();
    expect(mocks.touchSession).not.toHaveBeenCalled();
  });

  it("touches an existing session and skips createSession", async () => {
    mocks.loadSessionByAnonKey.mockResolvedValue({
      id: SESSION_ID,
      riderProfileId: null,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      messageCount: 1,
    });
    const { POST } = await import("@/app/api/ask/route");
    const res = await POST(req({ query: "Follow-up question." }));
    expect(res.status).toBe(200);
    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.touchSession).toHaveBeenCalledWith(SESSION_ID);
  });

  it("returns SSE stream that opens with a session_ack meta event", async () => {
    const { POST } = await import("@/app/api/ask/route");
    const res = await POST(req({ query: "Tell me about zone 2 cycling." }));
    expect(res.status).toBe(200);
    const text = await consumeStream(res.body);
    expect(text).toContain("event: meta");
    expect(text).toContain('"kind":"session_ack"');
    expect(text).toContain(SESSION_ID);
  });

  it("falls back to an ephemeral session when createSession throws (graceful DB-down)", async () => {
    mocks.createSession.mockRejectedValue(new Error("db down"));
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await import("@/app/api/ask/route");
    const res = await POST(req({ query: "Will you still respond?" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    const text = await consumeStream(res.body);
    expect(text).toContain("event: meta");
    expect(text).toContain('"kind":"session_ack"');
    // Ephemeral session id is a fresh UUID, not the mocked SESSION_ID
    expect(text).toMatch(
      /"sessionId":"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"/,
    );
    expect(text).not.toContain(SESSION_ID);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it("derives ip hash from x-forwarded-for", async () => {
    const { POST } = await import("@/app/api/ask/route");
    await POST(req({ query: "Trace the IP path." }, { "x-forwarded-for": "203.0.113.7, 10.0.0.1" }));
    const rlArgs = mocks.checkAskRateLimit.mock.calls[0]?.[0];
    expect(rlArgs.ipHash).toMatch(/^[0-9a-f]{16}$/);
    await POST(req({ query: "Run the IP again." }, { "x-forwarded-for": "203.0.113.7, 10.0.0.1" }));
    const rlArgs2 = mocks.checkAskRateLimit.mock.calls[1]?.[0];
    expect(rlArgs2.ipHash).toBe(rlArgs.ipHash);
  });
});
