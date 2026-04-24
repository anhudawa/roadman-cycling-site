import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadSession: vi.fn(),
  loadSessionByAnonKey: vi.fn(),
  listSessionMessages: vi.fn(),
  readAnonSessionKey: vi.fn(),
  loadProfileById: vi.fn(),
}));

vi.mock("@/lib/ask/store", () => ({
  loadSession: mocks.loadSession,
  loadSessionByAnonKey: mocks.loadSessionByAnonKey,
  listSessionMessages: mocks.listSessionMessages,
}));
vi.mock("@/lib/rider-profile/anon-session", () => ({
  readAnonSessionKey: mocks.readAnonSessionKey,
}));
vi.mock("@/lib/rider-profile/store", () => ({
  loadById: mocks.loadProfileById,
}));

const SESSION_ID = "66666666-6666-4666-8666-666666666666";

describe("GET /api/ask/session", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.listSessionMessages.mockResolvedValue([]);
    mocks.loadProfileById.mockResolvedValue(null);
    mocks.readAnonSessionKey.mockResolvedValue(null);
  });

  it("returns null session when neither id nor anon cookie is present", async () => {
    const { GET } = await import("@/app/api/ask/session/route");
    const res = await GET(new Request("https://example.test/api/ask/session"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ session: null, messages: [], profile: null });
  });

  it("loads session by sessionId query param", async () => {
    mocks.loadSession.mockResolvedValue({
      id: SESSION_ID,
      riderProfileId: null,
      startedAt: new Date("2026-01-01"),
      lastActivityAt: new Date("2026-01-02"),
      messageCount: 3,
    });
    mocks.listSessionMessages.mockResolvedValue([
      {
        id: "m-1",
        role: "user",
        content: "Q",
        citations: null,
        ctaRecommended: null,
        safetyFlags: null,
        createdAt: new Date(),
      },
    ]);
    const { GET } = await import("@/app/api/ask/session/route");
    const res = await GET(
      new Request(`https://example.test/api/ask/session?sessionId=${SESSION_ID}`),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.session.id).toBe(SESSION_ID);
    expect(body.session.messageCount).toBe(3);
    expect(body.messages).toHaveLength(1);
    expect(mocks.loadSession).toHaveBeenCalledWith(SESSION_ID);
  });

  it("falls back to anon key when no sessionId is supplied", async () => {
    mocks.readAnonSessionKey.mockResolvedValue("anon-xyz");
    mocks.loadSessionByAnonKey.mockResolvedValue({
      id: SESSION_ID,
      riderProfileId: null,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      messageCount: 0,
    });
    const { GET } = await import("@/app/api/ask/session/route");
    const res = await GET(new Request("https://example.test/api/ask/session"));
    expect(res.status).toBe(200);
    expect(mocks.loadSessionByAnonKey).toHaveBeenCalledWith("anon-xyz");
  });

  it("returns 500 when storage throws", async () => {
    mocks.loadSession.mockRejectedValue(new Error("db down"));
    const { GET } = await import("@/app/api/ask/session/route");
    const res = await GET(
      new Request(`https://example.test/api/ask/session?sessionId=${SESSION_ID}`),
    );
    expect(res.status).toBe(500);
  });

  it("returns rider profile when session has riderProfileId", async () => {
    mocks.loadSession.mockResolvedValue({
      id: SESSION_ID,
      riderProfileId: 9,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      messageCount: 0,
    });
    mocks.loadProfileById.mockResolvedValue({
      id: 9,
      firstName: "Tom",
      ageRange: "45-54",
      discipline: "road",
      mainGoal: "Etape",
      coachingInterest: "premium",
    });
    const { GET } = await import("@/app/api/ask/session/route");
    const res = await GET(
      new Request(`https://example.test/api/ask/session?sessionId=${SESSION_ID}`),
    );
    const body = await res.json();
    expect(body.profile.id).toBe(9);
    expect(body.profile.firstName).toBe("Tom");
  });
});
