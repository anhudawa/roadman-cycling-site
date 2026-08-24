import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for POST /api/diagnostic/submit. Every collaborator
 * is mocked — we're verifying the orchestration, not the underlying
 * scoring / Claude / DB / Beehiiv code (each has its own unit tests).
 *
 * Coverage: request-body validation, rate-limit short-circuit, the
 * deferred side-effects group (scheduled via Next's `after()` so they
 * don't block the response), and the 500 fallback when the DB insert
 * itself throws.
 */

// Hoisted so the vi.mock factories can close over them safely.
const mocks = vi.hoisted(() => ({
  scoreDiagnostic: vi.fn(),
  generateBreakdown: vi.fn(),
  insertSubmission: vi.fn(),
  countPriorSubmissions: vi.fn(),
  listSubmissionsByEmail: vi.fn(),
  attachBeehiivId: vi.fn(),
  attachRiderProfileId: vi.fn(),
  recordEvent: vi.fn(),
  upsertOnSignup: vi.fn(),
  subscribeToBeehiiv: vi.fn(),
  sendDiagnosisConfirmation: vi.fn(),
  checkRateLimit: vi.fn(),
  renderDiagnosticPdf: vi.fn(),
  upsertRiderProfile: vi.fn(),
  // Captures tasks scheduled with next/server `after()` so tests can
  // await them before asserting on background side-effects.
  afterTasks: [] as Array<Promise<unknown>>,
}));

vi.mock("@/lib/diagnostic/scoring", () => ({
  scoreDiagnostic: mocks.scoreDiagnostic,
}));
vi.mock("@/lib/diagnostic/generator", () => ({
  generateBreakdown: mocks.generateBreakdown,
}));
vi.mock("@/lib/diagnostic/store", () => ({
  insertSubmission: mocks.insertSubmission,
  countPriorSubmissions: mocks.countPriorSubmissions,
  listSubmissionsByEmail: mocks.listSubmissionsByEmail,
  attachBeehiivId: mocks.attachBeehiivId,
  attachRiderProfileId: mocks.attachRiderProfileId,
}));
vi.mock("@/lib/admin/events-store", () => ({
  recordEvent: mocks.recordEvent,
}));
vi.mock("@/lib/admin/subscribers-store", () => ({
  upsertOnSignup: mocks.upsertOnSignup,
}));
vi.mock("@/lib/integrations/beehiiv", () => ({
  subscribeToBeehiiv: mocks.subscribeToBeehiiv,
}));
vi.mock("@/lib/diagnostic/email", () => ({
  sendDiagnosisConfirmation: mocks.sendDiagnosisConfirmation,
}));
vi.mock("@/lib/diagnostic/pdf", () => ({
  renderDiagnosticPdf: mocks.renderDiagnosticPdf,
  diagnosticPdfFilename: () => "diagnosis.pdf",
}));
vi.mock("@/lib/rider-profile/store", () => ({
  upsertByEmail: mocks.upsertRiderProfile,
}));
vi.mock("@/lib/diagnostic/rider-profile-patch", () => ({
  riderProfilePatchFromDiagnostic: () => ({}),
}));
vi.mock("@/lib/diagnostic/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
}));

// `after()` runs callbacks outside the request lifecycle. In unit tests
// there's no Next.js runtime to drive that, so we capture the scheduled
// task on `mocks.afterTasks` and await it explicitly per test.
vi.mock("next/server", async () => {
  const actual =
    await vi.importActual<typeof import("next/server")>("next/server");
  return {
    ...actual,
    after: (task: Promise<unknown> | (() => unknown)) => {
      const promise =
        typeof task === "function"
          ? Promise.resolve().then(() => task())
          : Promise.resolve(task);
      mocks.afterTasks.push(promise);
    },
  };
});

async function flushAfter(): Promise<void> {
  // Drain the queue, including any tasks scheduled by other tasks.
  while (mocks.afterTasks.length > 0) {
    const batch = mocks.afterTasks.splice(0, mocks.afterTasks.length);
    await Promise.allSettled(batch);
  }
}

const VALID_BODY = {
  email: "TEST@EXAMPLE.COM",
  consent: true,
  age: "45-54",
  hoursPerWeek: "9-12",
  ftp: 285,
  goal: "Etape",
  Q1: 3, Q2: 3, Q3: 3,
  Q4: 1, Q5: 1, Q6: 1,
  Q7: 1, Q8: 3, Q9: 1,
  Q10: 1, Q11: 1, Q12: 3,
  Q13: "Feels heavy",
  utm: { source: "facebook", campaign: "plateau-diagnostic" },
};

function req(body: unknown): Request {
  return new Request("https://example.test/api/diagnostic/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/diagnostic/submit", () => {
  beforeEach(() => {
    for (const value of Object.values(mocks)) {
      if (typeof value === "function" && "mockReset" in value) {
        (value as ReturnType<typeof vi.fn>).mockReset();
      }
    }
    mocks.afterTasks.length = 0;

    mocks.checkRateLimit.mockResolvedValue({ ok: true });
    mocks.scoreDiagnostic.mockReturnValue({
      primary: "underRecovered",
      secondary: null,
      scores: {
        underRecovered: 11,
        polarisation: 3,
        strengthGap: 5,
        fuelingDeficit: 6,
      },
      severeMultiSystem: false,
      closeToBreakthrough: false,
    });
    mocks.generateBreakdown.mockResolvedValue({
      breakdown: {
        headline: "Test",
        diagnosis: "Test",
        whyThisIsHappening: "Test",
        whatItsCosting: "Test",
        fix: [
          { step: 1, title: "a", detail: "a" },
          { step: 2, title: "b", detail: "b" },
          { step: 3, title: "c", detail: "c" },
        ],
        whyAlone: "Test",
        nextMove: "Test",
        secondaryNote: null,
      },
      source: "llm",
      rawModelOutput: null,
      validation: null,
      attempts: 1,
      errors: [],
    });
    mocks.countPriorSubmissions.mockResolvedValue(0);
    mocks.listSubmissionsByEmail.mockResolvedValue([]);
    mocks.insertSubmission.mockResolvedValue({
      id: 1,
      slug: "abc1234567",
      email: "test@example.com",
      primaryProfile: "underRecovered",
      secondaryProfile: null,
      severeMultiSystem: false,
      closeToBreakthrough: false,
      breakdown: {},
      generationSource: "llm",
      createdAt: new Date(),
      answers: {},
      retakeNumber: 1,
    });
    mocks.recordEvent.mockResolvedValue({});
    mocks.upsertOnSignup.mockResolvedValue(undefined);
    mocks.subscribeToBeehiiv.mockResolvedValue({
      subscriberId: "sub_123",
      created: true,
    });
    mocks.attachBeehiivId.mockResolvedValue(undefined);
    mocks.attachRiderProfileId.mockResolvedValue(undefined);
    mocks.renderDiagnosticPdf.mockResolvedValue(Buffer.from(""));
    mocks.upsertRiderProfile.mockResolvedValue({ id: "rp_1" });
    mocks.sendDiagnosisConfirmation.mockResolvedValue({
      sent: true,
      messageId: "msg_123",
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 with the slug on the happy path", async () => {
    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.success).toBe(true);
    expect(data.slug).toBe("abc1234567");
    expect(data.profile).toBe("underRecovered");
  });

  it("normalises the email to lowercase before hitting the store", async () => {
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    // countPriorSubmissions and insertSubmission should see the
    // normalised lowercase email, not the SHOUTY input.
    expect(mocks.countPriorSubmissions).toHaveBeenCalledWith(
      "test@example.com"
    );
    const call = mocks.insertSubmission.mock.calls[0][0];
    expect(call.email).toBe("test@example.com");
  });

  it("rejects an invalid email with 400", async () => {
    const { POST } = await import("./route");
    const res = await POST(req({ ...VALID_BODY, email: "not-an-email" }));
    expect(res.status).toBe(400);
    expect(mocks.scoreDiagnostic).not.toHaveBeenCalled();
  });

  it("rejects missing consent with 400", async () => {
    const { POST } = await import("./route");
    const res = await POST(req({ ...VALID_BODY, consent: false }));
    expect(res.status).toBe(400);
    expect(mocks.scoreDiagnostic).not.toHaveBeenCalled();
  });

  it("rejects malformed answers with 400", async () => {
    const { POST } = await import("./route");
    const res = await POST(req({ ...VALID_BODY, Q5: 9 }));
    expect(res.status).toBe(400);
  });

  it("rejects non-JSON bodies with 400", async () => {
    const { POST } = await import("./route");
    const res = await POST(req("not json"));
    expect(res.status).toBe(400);
  });

  it("returns 429 with Retry-After when rate-limited", async () => {
    mocks.checkRateLimit.mockResolvedValue({
      ok: false,
      reason: "email",
      retryAfterSeconds: 300,
    });
    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("300");
    expect(mocks.scoreDiagnostic).not.toHaveBeenCalled();
  });

  it("stamps the right retakeNumber when the email has submitted before", async () => {
    mocks.countPriorSubmissions.mockResolvedValue(2);
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    expect(mocks.insertSubmission.mock.calls[0][0].retakeNumber).toBe(3);
    await flushAfter();
    const tags = mocks.subscribeToBeehiiv.mock.calls[0][0].tags as string[];
    expect(tags).toContain("retake");
    expect(tags).toContain("retake-3");
  });

  it("enrols a first standard result in its matching Add-by-API journey", async () => {
    vi.stubEnv("BEEHIIV_AUTOMATION_UNDER_RECOVERED_ID", "aut_under");
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    await flushAfter();
    expect(mocks.subscribeToBeehiiv).toHaveBeenCalledWith(
      expect.objectContaining({ automationIds: ["aut_under"] }),
    );
  });

  it("does not enrol excluded close-to-breakthrough or multi-system results", async () => {
    vi.stubEnv("BEEHIIV_AUTOMATION_UNDER_RECOVERED_ID", "aut_under");
    mocks.scoreDiagnostic.mockReturnValue({
      primary: "underRecovered",
      secondary: null,
      scores: {
        underRecovered: 5,
        polarisation: 4,
        strengthGap: 4,
        fuelingDeficit: 3,
      },
      severeMultiSystem: false,
      closeToBreakthrough: true,
    });
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    await flushAfter();
    expect(mocks.subscribeToBeehiiv).toHaveBeenCalledWith(
      expect.objectContaining({ automationIds: undefined }),
    );

    mocks.scoreDiagnostic.mockReturnValue({
      primary: "underRecovered",
      secondary: null,
      scores: {
        underRecovered: 9,
        polarisation: 7,
        strengthGap: 6,
        fuelingDeficit: 6,
      },
      severeMultiSystem: true,
      closeToBreakthrough: false,
    });
    await POST(req({ ...VALID_BODY, email: "second@example.com" }));
    await flushAfter();
    expect(mocks.subscribeToBeehiiv).toHaveBeenLastCalledWith(
      expect.objectContaining({ automationIds: undefined }),
    );
  });

  it("suppresses overlapping retakes until the Day-10 journey has finished", async () => {
    vi.stubEnv("BEEHIIV_AUTOMATION_UNDER_RECOVERED_ID", "aut_under");
    mocks.countPriorSubmissions.mockResolvedValue(1);
    mocks.listSubmissionsByEmail.mockResolvedValue([
      {
        closeToBreakthrough: false,
        severeMultiSystem: false,
        createdAt: new Date(),
      },
    ]);
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    await flushAfter();
    expect(mocks.subscribeToBeehiiv).toHaveBeenCalledWith(
      expect.objectContaining({ automationIds: undefined }),
    );
  });

  it("allows a standard retake after the ten-day journey window", async () => {
    vi.stubEnv("BEEHIIV_AUTOMATION_UNDER_RECOVERED_ID", "aut_under");
    mocks.countPriorSubmissions.mockResolvedValue(1);
    mocks.listSubmissionsByEmail.mockResolvedValue([
      {
        closeToBreakthrough: false,
        severeMultiSystem: false,
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1_000),
      },
    ]);
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    await flushAfter();
    expect(mocks.subscribeToBeehiiv).toHaveBeenCalledWith(
      expect.objectContaining({ automationIds: ["aut_under"] }),
    );
  });

  it("tags Beehiiv with multi-system when severeMultiSystem is true", async () => {
    mocks.scoreDiagnostic.mockReturnValue({
      primary: "underRecovered",
      secondary: null,
      scores: {
        underRecovered: 9, polarisation: 6, strengthGap: 6, fuelingDeficit: 7,
      },
      severeMultiSystem: true,
      closeToBreakthrough: false,
    });
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    await flushAfter();
    const tags = mocks.subscribeToBeehiiv.mock.calls[0][0].tags as string[];
    expect(tags).toContain("multi-system");
  });

  it("returns 500 when the DB insert fails", async () => {
    mocks.insertSubmission.mockRejectedValue(new Error("pg down"));
    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(500);
  });

  it("still returns 200 when a side-effect (Beehiiv) rejects", async () => {
    mocks.subscribeToBeehiiv.mockRejectedValue(new Error("beehiiv down"));
    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(200);
    await flushAfter();
  });

  it("still returns 200 when the confirmation email fails", async () => {
    mocks.sendDiagnosisConfirmation.mockRejectedValue(new Error("resend down"));
    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(200);
    await flushAfter();
  });

  it("returns 200 before the background side-effects finish", async () => {
    // Hold the Beehiiv call open so we can prove the response resolves
    // first. If the route ever re-awaits these in the request lifecycle,
    // this test will hang on the response.
    let releaseBeehiiv: () => void = () => {};
    mocks.subscribeToBeehiiv.mockImplementation(
      () =>
        new Promise((resolve) => {
          releaseBeehiiv = () =>
            resolve({ subscriberId: "sub_123", created: true });
        }),
    );

    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(200);

    // Confirmation email shouldn't have settled — it's downstream of
    // the held Beehiiv call. Release and drain so the test exits clean.
    releaseBeehiiv();
    await flushAfter();
  });

  it("schedules analytics, CRM, Beehiiv, and confirmation as background work", async () => {
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    // Tasks are queued via `after()` and only run once the response is
    // out. Drain the queue, then verify each side-effect fired.
    await flushAfter();
    expect(mocks.recordEvent).toHaveBeenCalled();
    expect(mocks.upsertOnSignup).toHaveBeenCalled();
    expect(mocks.subscribeToBeehiiv).toHaveBeenCalled();
    expect(mocks.sendDiagnosisConfirmation).toHaveBeenCalled();
    expect(mocks.renderDiagnosticPdf).toHaveBeenCalled();
    expect(mocks.upsertRiderProfile).toHaveBeenCalled();
  });

  it("fires both diagnostic_complete and signup events so plateau captures show up in the admin email-signups metric", async () => {
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    await flushAfter();
    const eventTypes = mocks.recordEvent.mock.calls.map((c) => c[0]);
    expect(eventTypes).toContain("diagnostic_complete");
    expect(eventTypes).toContain("signup");
    const signupCall = mocks.recordEvent.mock.calls.find(
      (c) => c[0] === "signup",
    );
    expect(signupCall?.[1]).toBe("/plateau");
    expect(signupCall?.[2]?.email).toBe("test@example.com");
  });
});
