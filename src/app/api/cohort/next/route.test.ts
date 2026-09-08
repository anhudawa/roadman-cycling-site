import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ record: vi.fn(), notify: vi.fn(), rateLimit: vi.fn() }));
vi.mock("@/lib/ndy/application-workflow", () => ({ recordApplicantAction: mocks.record, deliverSarahNotification: mocks.notify }));
vi.mock("@/lib/rate-limit/ip-rate-limit", () => ({ rateLimitOr429: mocks.rateLimit }));
const token = "b".repeat(64);
const request = (body: unknown, origin = "https://www.roadmancycling.com") => new Request("https://www.roadmancycling.com/api/cohort/next", {
  method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body),
});

describe("the applicant decision endpoint", () => {
  beforeEach(() => {
    vi.stubEnv("NDY_APPLICATION_FLOW_ENABLED", "true");
    mocks.record.mockReset().mockResolvedValue({ id: "job-1", duplicate: false });
    mocks.notify.mockReset().mockResolvedValue(undefined); mocks.rateLimit.mockReset().mockResolvedValue(null);
  });
  afterEach(() => vi.unstubAllEnvs());
  it("exposes no GET action for email scanners", async () => {
    expect(await import("./route")).not.toHaveProperty("GET");
  });
  it("saves a question before notifying Sarah", async () => {
    const order: string[] = [];
    mocks.record.mockImplementation(async () => { order.push("save"); return { id: "job-1" }; });
    mocks.notify.mockImplementation(async () => { order.push("notify"); });
    const { POST } = await import("./route");
    const response = await POST(request({ token, action: "questions", question: "  Is this right for my event?  " }));
    expect(response.status).toBe(200); expect(order).toEqual(["save", "notify"]);
    expect(mocks.record).toHaveBeenCalledWith(token, "questions", "Is this right for my event?");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("does not lose a saved question if notification delivery fails", async () => {
    mocks.notify.mockRejectedValue(new Error("Email down"));
    const { POST } = await import("./route");
    expect((await POST(request({ token, action: "questions", question: "What does coaching include?" }))).status).toBe(200);
  });
  it("rejects expired or replaced links without sending anything", async () => {
    mocks.record.mockResolvedValue(null);
    const { POST } = await import("./route");
    expect((await POST(request({ token, action: "questions", question: "Hello Sarah" }))).status).toBe(410);
    expect(mocks.notify).not.toHaveBeenCalled();
  });
  it("blocks forged origins", async () => {
    const { POST } = await import("./route");
    expect((await POST(request({ token, action: "join" }, "https://attacker.example"))).status).toBe(403);
    expect(mocks.record).not.toHaveBeenCalled();
  });
  it.each([null, [], { token: "123", action: "join" }, { token, action: "signed_up" }, { token, action: "questions", question: "" }, { token, action: "questions", question: "a".repeat(2001) }])("rejects malformed decisions", async (body) => {
    const { POST } = await import("./route"); expect((await POST(request(body))).status).toBe(400); expect(mocks.record).not.toHaveBeenCalled();
  });
  it("returns a checkout destination without notifying Sarah", async () => {
    mocks.record.mockResolvedValue({ id: "job-1", checkoutUrl: "https://www.skool.com/roadmancycling/plans?src=join" });
    const { POST } = await import("./route");
    const response = await POST(request({ token, action: "join" })); expect(response.status).toBe(200);
    expect(mocks.record).toHaveBeenCalledWith(token, "join", undefined); expect(mocks.notify).not.toHaveBeenCalled();
  });
});
