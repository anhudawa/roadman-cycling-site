import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ selectRows: [] as unknown[][], returningRows: [] as unknown[][],
  select: vi.fn(), update: vi.fn(), insert: vi.fn(), set: vi.fn(), values: vi.fn(), transaction: vi.fn(), enroll: vi.fn(), fetch: vi.fn() }));

vi.mock("@/lib/db", () => ({ db: { select: mocks.select, update: mocks.update, insert: mocks.insert, transaction: mocks.transaction } }));
vi.mock("@/lib/ndy/application-beehiiv", () => ({ enrollNdyApplicant: mocks.enroll }));
vi.mock("@/lib/crm/contacts", () => ({ upsertContact: vi.fn(), addActivity: vi.fn() }));
vi.mock("@/lib/notifications", () => ({ notifyCohortApplication: vi.fn() }));

const app = { id: 42, email: "rider@example.com", name: "Rider", submissionKey: "submit-1", signedUpAt: null, status: "awaiting_response", goal: "Race or event with a date", hours: "6-9 hours", frustration: "No structure" };
const job = { id: "job-1", applicationId: 42, submissionKey: "submit-1", accessToken: "b".repeat(64), questionReceivedAt: null, checkoutStartedAt: null };

beforeEach(() => {
  for (const name of ["select", "update", "insert", "set", "values", "transaction", "enroll", "fetch"] as const) mocks[name].mockReset();
  mocks.selectRows.length = 0; mocks.returningRows.length = 0;
  mocks.select.mockImplementation(() => ({ from: () => ({ where: () => {
    const rows = mocks.selectRows.shift() ?? [];
    return { then: (resolve: (rows: unknown[]) => unknown) => Promise.resolve(rows).then(resolve), for: async () => rows };
  } }) }));
  mocks.set.mockImplementation(() => ({ where: () => ({
    returning: async () => mocks.returningRows.shift() ?? [],
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(undefined).then(resolve),
  }) }));
  mocks.update.mockReturnValue({ set: mocks.set });
  mocks.values.mockResolvedValue(undefined); mocks.insert.mockReturnValue({ values: mocks.values });
  mocks.transaction.mockImplementation(async (work) => work({ select: mocks.select, update: mocks.update, insert: mocks.insert }));
});

describe("application decision persistence", () => {
  it("does not change the database when a question is already saved", async () => {
    const existing = { ...job, questionReceivedAt: new Date() };
    mocks.selectRows.push([existing], [app], [existing]);
    const { recordApplicantAction } = await import("./application-workflow");
    expect(await recordApplicantAction(job.accessToken, "questions", "Second question")).toEqual({ id: job.id, duplicate: true });
    expect(mocks.set).not.toHaveBeenCalled(); expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("saves a question and its Sarah queue state within one transaction", async () => {
    mocks.selectRows.push([job], [app], [job], [{ id: 7 }]);
    const { recordApplicantAction } = await import("./application-workflow");
    await recordApplicantAction(job.accessToken, "questions", "Can I use my existing plan?");
    expect(mocks.transaction).toHaveBeenCalledTimes(1);
    expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ question: "Can I use my existing plan?", sarahStatus: "pending" }));
    expect(mocks.set).toHaveBeenCalledWith({ status: "questions_requested", readAt: null });
    expect(mocks.set).toHaveBeenCalledWith({ owner: "sarah" });
    expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({ contactId: 7, body: "Can I use my existing plan?" }));
  });
  it("preserves a confirmed signup when that applicant asks a question", async () => {
    mocks.selectRows.push([job], [{ ...app, signedUpAt: new Date(), status: "signed_up" }], [job], []);
    const { recordApplicantAction } = await import("./application-workflow");
    await recordApplicantAction(job.accessToken, "questions", "Where do I start?");
    expect(mocks.set).toHaveBeenCalledWith({ status: "signed_up", readAt: null });
  });
  it("records checkout interest without changing application status", async () => {
    mocks.selectRows.push([job], [app], [job]);
    const { recordApplicantAction } = await import("./application-workflow");
    const result = await recordApplicantAction(job.accessToken, "join");
    expect(result?.checkoutUrl).toContain("skool.com/roadmancycling/plans");
    expect(mocks.set).toHaveBeenCalledTimes(1);
    expect(mocks.set).toHaveBeenCalledWith({ checkoutStartedAt: expect.any(Date) });
  });
  it("rejects a replaced application before any write", async () => {
    mocks.selectRows.push([job], [{ ...app, submissionKey: "new-submission" }]);
    const { recordApplicantAction } = await import("./application-workflow");
    expect(await recordApplicantAction(job.accessToken, "questions", "My question")).toBeNull();
    expect(mocks.set).not.toHaveBeenCalled();
  });
});

describe("outbox delivery boundaries", () => {
  it("cannot send when another request already holds the atomic claim", async () => {
    mocks.returningRows.push([]);
    const { deliverApplicationEmail } = await import("./application-workflow");
    await deliverApplicationEmail(job.id);
    expect(mocks.enroll).not.toHaveBeenCalled();
  });
  it("suppresses an older email after a replacement application", async () => {
    mocks.returningRows.push([job]); mocks.selectRows.push([{ ...app, submissionKey: "new-submission" }]);
    const { deliverApplicationEmail } = await import("./application-workflow");
    await deliverApplicationEmail(job.id);
    expect(mocks.enroll).not.toHaveBeenCalled();
    expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ emailStatus: "suppressed" }));
  });
  it("persists uncertainty instead of claiming an email was sent", async () => {
    mocks.returningRows.push([job]); mocks.selectRows.push([app]);
    mocks.enroll.mockImplementation(async (_input, mark) => { await mark("sub_123"); return { status: "uncertain", subscriberId: "sub_123", error: "Timeout" }; });
    const { deliverApplicationEmail } = await import("./application-workflow");
    await deliverApplicationEmail(job.id);
    expect(mocks.set).toHaveBeenCalledWith({ emailStatus: "enrolling", subscriberId: "sub_123" });
    expect(mocks.set).toHaveBeenLastCalledWith(expect.objectContaining({ emailStatus: "uncertain", emailError: "Timeout" }));
    expect(mocks.set.mock.lastCall?.[0]).not.toHaveProperty("enrolledAt");
  });
});
