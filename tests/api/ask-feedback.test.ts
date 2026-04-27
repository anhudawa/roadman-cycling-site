import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  flagMessage: vi.fn(),
  recordEvent: vi.fn(),
}));

vi.mock("@/lib/ask/store", () => ({ flagMessage: mocks.flagMessage }));
vi.mock("@/lib/admin/events-store", () => ({ recordEvent: mocks.recordEvent }));

const MID = "22222222-2222-4222-8222-222222222222";
const SID = "33333333-3333-4333-8333-333333333333";

function req(body: unknown): Request {
  return new Request("https://example.test/api/ask/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/ask/feedback", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.flagMessage.mockResolvedValue(undefined);
    mocks.recordEvent.mockResolvedValue(undefined);
  });

  it("rejects malformed JSON with 400", async () => {
    const { POST } = await import("@/app/api/ask/feedback/route");
    const r = new Request("https://example.test/api/ask/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not json",
    });
    const res = await POST(r);
    expect(res.status).toBe(400);
  });

  it("rejects schema-invalid body with 400", async () => {
    const { POST } = await import("@/app/api/ask/feedback/route");
    const res = await POST(req({ messageId: "not-a-uuid", rating: "up" }));
    expect(res.status).toBe(400);
  });

  it("thumbs up does NOT call flagMessage and records ask_feedback_submitted", async () => {
    const { POST } = await import("@/app/api/ask/feedback/route");
    const res = await POST(req({ messageId: MID, sessionId: SID, rating: "up" }));
    expect(res.status).toBe(200);
    expect(mocks.flagMessage).not.toHaveBeenCalled();
    expect(mocks.recordEvent).toHaveBeenCalledWith(
      "ask_feedback_submitted",
      "/ask",
      expect.objectContaining({ sessionId: SID, meta: expect.objectContaining({ messageId: MID, rating: "up" }) }),
    );
  });

  it("thumbs down calls flagMessage AND emits both flagged + submitted events", async () => {
    const { POST } = await import("@/app/api/ask/feedback/route");
    const res = await POST(
      req({ messageId: MID, sessionId: SID, rating: "down", reason: "not-helpful" }),
    );
    expect(res.status).toBe(200);
    expect(mocks.flagMessage).toHaveBeenCalledWith(MID, "not-helpful");
    const eventNames = mocks.recordEvent.mock.calls.map((c) => c[0]);
    expect(eventNames).toContain("ask_message_flagged");
    expect(eventNames).toContain("ask_feedback_submitted");
  });

  it("thumbs down without reason defaults to 'user_downvote'", async () => {
    const { POST } = await import("@/app/api/ask/feedback/route");
    const res = await POST(req({ messageId: MID, rating: "down" }));
    expect(res.status).toBe(200);
    expect(mocks.flagMessage).toHaveBeenCalledWith(MID, "user_downvote");
  });

  it("returns 200 ok when recordEvent throws — best-effort, non-fatal", async () => {
    mocks.recordEvent.mockRejectedValueOnce(new Error("db down"));
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await import("@/app/api/ask/feedback/route");
    const res = await POST(req({ messageId: MID, rating: "up" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
