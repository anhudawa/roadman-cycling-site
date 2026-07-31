import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rateLimitOr429: vi.fn(),
  insert: vi.fn(),
  insertValues: vi.fn(),
  onConflictDoNothing: vi.fn(),
  returning: vi.fn(),
  update: vi.fn(),
  updateSet: vi.fn(),
  where: vi.fn(),
  updateReturning: vi.fn(),
  notifyCohortApplication: vi.fn(),
  sendApplicantConfirmation: vi.fn(),
  upsertContact: vi.fn(),
  addActivity: vi.fn(),
}));

vi.mock("@/lib/rate-limit/ip-rate-limit", () => ({
  rateLimitOr429: mocks.rateLimitOr429,
}));

vi.mock("@/lib/db", () => ({
  db: {
    insert: mocks.insert,
    update: mocks.update,
  },
}));

vi.mock("@/lib/db/schema", () => ({
  cohortApplications: {
    id: "id",
    email: "email",
    cohort: "cohort",
    submissionKey: "submissionKey",
    status: "status",
    readAt: "readAt",
    createdAt: "createdAt",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  ne: vi.fn((field, value) => ({ field, value, operator: "ne" })),
  isNull: vi.fn((field) => ({ field, operator: "isNull" })),
  or: vi.fn((...conditions) => conditions),
  and: vi.fn((...conditions) => conditions),
}));

vi.mock("@/lib/notifications", () => ({
  notifyCohortApplication: mocks.notifyCohortApplication,
  sendApplicantConfirmation: mocks.sendApplicantConfirmation,
}));

vi.mock("@/lib/crm/contacts", () => ({
  upsertContact: mocks.upsertContact,
  addActivity: mocks.addActivity,
}));

vi.mock("@/lib/cohort", () => ({
  getCohortState: () => ({
    phase: "evergreen",
  }),
}));

const VALID_BODY = {
  name: "  Sam Murphy  ",
  email: "  SAM@EXAMPLE.COM ",
  goal: "Race or event with a date",
  hours: "6-9 hours",
  ftp: "245W",
  frustration: "Plateaued and stuck",
  submissionId: "submission-key-123",
};

function request(body: unknown, raw = false): Request {
  return new Request("https://roadmancycling.com/api/cohort/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ? String(body) : JSON.stringify(body),
  });
}

describe("POST /api/cohort/apply", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();

    mocks.rateLimitOr429.mockResolvedValue(null);
    mocks.insert.mockReturnValue({ values: mocks.insertValues });
    mocks.insertValues.mockReturnValue({
      onConflictDoNothing: mocks.onConflictDoNothing,
    });
    mocks.onConflictDoNothing.mockReturnValue({
      returning: mocks.returning,
    });
    mocks.returning.mockResolvedValue([{ id: 1 }]);
    mocks.update.mockReturnValue({ set: mocks.updateSet });
    mocks.updateSet.mockReturnValue({ where: mocks.where });
    mocks.where.mockReturnValue({ returning: mocks.updateReturning });
    mocks.updateReturning.mockResolvedValue([]);
    mocks.upsertContact.mockResolvedValue({ id: "contact-1" });
    mocks.addActivity.mockResolvedValue(undefined);
    mocks.notifyCohortApplication.mockResolvedValue({ success: true });
    mocks.sendApplicantConfirmation.mockResolvedValue({ success: true });
  });

  it("short-circuits before parsing or writing when rate limited", async () => {
    mocks.rateLimitOr429.mockResolvedValue(
      new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
      }),
    );

    const { POST } = await import("./route");
    const response = await POST(request(VALID_BODY));

    expect(response.status).toBe(429);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed or non-object JSON", async () => {
    const { POST } = await import("./route");

    const malformed = await POST(request("{", true));
    const nonObject = await POST(request("not-an-object"));

    expect(malformed.status).toBe(400);
    expect(nonObject.status).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("quietly absorbs honeypot submissions without side effects", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      request({ ...VALID_BODY, website: "https://spam.example" }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      discarded: true,
    });
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.upsertContact).not.toHaveBeenCalled();
    expect(mocks.notifyCohortApplication).not.toHaveBeenCalled();
  });

  it("normalises the application and completes the success side effects", async () => {
    const { POST } = await import("./route");
    const response = await POST(request(VALID_BODY));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      persona: "plateau",
      cohort: "ndy",
    });
    expect(mocks.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Sam Murphy",
        email: "sam@example.com",
        cohort: "ndy",
        persona: "plateau",
        submissionKey: "submission-key-123",
      }),
    );
    expect(mocks.upsertContact).toHaveBeenCalledTimes(1);
    expect(mocks.addActivity).toHaveBeenCalledTimes(1);
    expect(mocks.notifyCohortApplication).toHaveBeenCalledTimes(1);
    expect(mocks.sendApplicantConfirmation).toHaveBeenCalledTimes(1);
  });

  it("stores sanitised first-touch attribution with the application", async () => {
    const attribution = {
      landingPath: "/",
      referrer: "https://www.google.com/search",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "summer",
      gclid: "click-1",
      gbraid: "braid-1",
      wbraid: "braid-2",
      lastLandingPath: "/apply",
      lastUtmSource: "facebook",
      lastUtmMedium: "paid_social",
      lastUtmCampaign: "retargeting",
      lastFbclid: "meta-1",
      lastCapturedAt: "2026-07-30T19:30:00.000Z",
    };
    const { POST } = await import("./route");
    const response = await POST(request({ ...VALID_BODY, attribution }));

    expect(response.status).toBe(200);
    expect(mocks.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ attribution }),
    );
    expect(mocks.notifyCohortApplication).toHaveBeenCalledWith(
      expect.objectContaining({ attribution }),
    );
  });

  it("rejects malformed or unknown attribution fields", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      request({
        ...VALID_BODY,
        attribution: {
          landingPath: "/",
          untrusted: "do-not-store",
        },
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("logs fulfilled email delivery failures without failing the saved application", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.notifyCohortApplication.mockResolvedValue({
      success: false,
      error: "Admin email rejected",
    });
    mocks.sendApplicantConfirmation.mockResolvedValue({
      success: false,
      error: "Applicant email rejected",
    });

    const { POST } = await import("./route");
    const response = await POST(request(VALID_BODY));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      cohort: "ndy",
    });
    expect(consoleError).toHaveBeenCalledWith(
      "[Cohort Apply] Admin notification failed:",
      "Admin email rejected",
    );
    expect(consoleError).toHaveBeenCalledWith(
      "[Cohort Apply] Applicant confirmation failed:",
      "Applicant email rejected",
    );

    consoleError.mockRestore();
  });

  it("updates a duplicate without repeating CRM or email side effects", async () => {
    mocks.returning.mockResolvedValue([]);
    const { POST } = await import("./route");
    const response = await POST(request(VALID_BODY));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      duplicate: true,
      cohort: "ndy",
    });
    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(mocks.where).toHaveBeenCalledTimes(1);
    expect(mocks.upsertContact).not.toHaveBeenCalled();
    expect(mocks.notifyCohortApplication).not.toHaveBeenCalled();
    expect(mocks.sendApplicantConfirmation).not.toHaveBeenCalled();
  });

  it("requeues and notifies a genuinely new application from the same rider", async () => {
    mocks.returning.mockResolvedValue([]);
    mocks.updateReturning.mockResolvedValue([{ id: 1 }]);
    const { POST } = await import("./route");
    const response = await POST(request(VALID_BODY));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      reapplication: true,
      cohort: "ndy",
    });
    expect(mocks.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "awaiting_response",
        readAt: null,
        submissionKey: "submission-key-123",
      }),
    );
    expect(mocks.upsertContact).toHaveBeenCalledTimes(1);
    expect(mocks.notifyCohortApplication).toHaveBeenCalledTimes(1);
    expect(mocks.sendApplicantConfirmation).toHaveBeenCalledTimes(1);
  });

  it("rejects missing or invalid required fields before writing", async () => {
    const { POST } = await import("./route");
    const missingName = await POST(request({ ...VALID_BODY, name: null }));
    const invalidEmail = await POST(
      request({ ...VALID_BODY, email: "not-an-email" }),
    );

    expect(missingName.status).toBe(400);
    expect(invalidEmail.status).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
