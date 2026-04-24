import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  recordEvent: vi.fn(),
}));

vi.mock("@/lib/admin/events-store", () => ({ recordEvent: mocks.recordEvent }));

const SID = "44444444-4444-4444-8444-444444444444";
const MID = "55555555-5555-4555-8555-555555555555";

function req(body: unknown): Request {
  return new Request("https://example.test/api/ask/cta-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/ask/cta-click", () => {
  beforeEach(() => {
    mocks.recordEvent.mockReset();
    mocks.recordEvent.mockResolvedValue(undefined);
  });

  it("rejects empty ctaKey with 400", async () => {
    const { POST } = await import("@/app/api/ask/cta-click/route");
    const res = await POST(req({ ctaKey: "", href: "/coaching" }));
    expect(res.status).toBe(400);
  });

  it("rejects href that exceeds the 512 char ceiling", async () => {
    const { POST } = await import("@/app/api/ask/cta-click/route");
    const res = await POST(
      req({ ctaKey: "coaching", href: "/" + "a".repeat(600) }),
    );
    expect(res.status).toBe(400);
  });

  it("records ask_cta_clicked with ctaKey + href in meta", async () => {
    const { POST } = await import("@/app/api/ask/cta-click/route");
    const res = await POST(
      req({ sessionId: SID, ctaKey: "book_call", href: "/coaching" }),
    );
    expect(res.status).toBe(200);
    expect(mocks.recordEvent).toHaveBeenCalledWith(
      "ask_cta_clicked",
      "/ask",
      expect.objectContaining({
        sessionId: SID,
        meta: expect.objectContaining({
          ctaKey: "book_call",
          href: "/coaching",
        }),
      }),
    );
  });

  it("includes messageId in meta when provided", async () => {
    const { POST } = await import("@/app/api/ask/cta-click/route");
    await POST(
      req({ sessionId: SID, messageId: MID, ctaKey: "x", href: "/y" }),
    );
    const meta = mocks.recordEvent.mock.calls[0]?.[2]?.meta;
    expect(meta.messageId).toBe(MID);
  });

  it("omits messageId from meta when not provided", async () => {
    const { POST } = await import("@/app/api/ask/cta-click/route");
    await POST(req({ ctaKey: "x", href: "/y" }));
    const meta = mocks.recordEvent.mock.calls[0]?.[2]?.meta;
    expect(meta.messageId).toBeUndefined();
  });
});
