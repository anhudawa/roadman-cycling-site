import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rateLimitOr429: vi.fn(),
  insert: vi.fn(),
  insertValues: vi.fn(),
  upsertContact: vi.fn(),
  addActivity: vi.fn(),
  subscribeToBeehiiv: vi.fn(),
  sendEmail: vi.fn(),
  getResendClient: vi.fn(),
}));

vi.mock("@/lib/rate-limit/ip-rate-limit", () => ({
  rateLimitOr429: mocks.rateLimitOr429,
}));

vi.mock("@/lib/db", () => ({
  db: { insert: mocks.insert },
}));

vi.mock("@/lib/db/schema", () => ({
  contactSubmissions: {},
}));

vi.mock("@/lib/crm/contacts", () => ({
  upsertContact: mocks.upsertContact,
  addActivity: mocks.addActivity,
}));

vi.mock("@/lib/integrations/beehiiv", () => ({
  subscribeToBeehiiv: mocks.subscribeToBeehiiv,
}));

vi.mock("@/lib/integrations/resend", () => ({
  getResendClient: mocks.getResendClient,
}));

const VALID_BODY = {
  name: "Morgan Taylor",
  email: "partnerships@example.com",
  subject: "sponsorship",
  message:
    "Hi Anthony and team, our cycling brand would love to discuss a podcast sponsorship for the spring campaign.",
  website: "",
};

function request(body: unknown): Request {
  return new Request("https://roadmancycling.com/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();

    mocks.rateLimitOr429.mockResolvedValue(null);
    mocks.insert.mockReturnValue({ values: mocks.insertValues });
    mocks.insertValues.mockResolvedValue(undefined);
    mocks.upsertContact.mockResolvedValue({ id: 42 });
    mocks.addActivity.mockResolvedValue(undefined);
    mocks.subscribeToBeehiiv.mockResolvedValue(undefined);
    mocks.sendEmail.mockResolvedValue({ id: "email-1" });
    mocks.getResendClient.mockReturnValue({
      emails: { send: mocks.sendEmail },
    });
  });

  it("silently discards the observed sponsorship spam before side effects", async () => {
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});
    const { POST } = await import("./route");
    const response = await POST(
      request({
        name: "Zqvpx Rtmkqzvn",
        email: "bot@example.com",
        subject: "sponsorship",
        message: "vftfAisJcOPuficIvrzOVKUz",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.upsertContact).not.toHaveBeenCalled();
    expect(mocks.addActivity).not.toHaveBeenCalled();
    expect(mocks.subscribeToBeehiiv).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(consoleInfo).toHaveBeenCalledWith(
      "[Contact Form] Discarded likely spam: synthetic_payload",
    );
    consoleInfo.mockRestore();
  });

  it("silently discards honeypot submissions before side effects", async () => {
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});
    const { POST } = await import("./route");
    const response = await POST(
      request({ ...VALID_BODY, website: "https://spam.example" }),
    );

    expect(response.status).toBe(200);
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.subscribeToBeehiiv).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    consoleInfo.mockRestore();
  });

  it("preserves valid submissions and all existing side effects", async () => {
    const { POST } = await import("./route");
    const response = await POST(request(VALID_BODY));

    expect(response.status).toBe(200);
    expect(mocks.insertValues).toHaveBeenCalledWith({
      name: VALID_BODY.name,
      email: VALID_BODY.email,
      subject: VALID_BODY.subject,
      message: VALID_BODY.message,
    });
    expect(mocks.upsertContact).toHaveBeenCalledTimes(1);
    expect(mocks.addActivity).toHaveBeenCalledTimes(1);
    expect(mocks.subscribeToBeehiiv).toHaveBeenCalledTimes(1);
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
  });
});
