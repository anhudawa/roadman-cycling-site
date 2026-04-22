import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Store helper tests. The DB layer is mocked so we run offline; the
 * tests verify the type-coercion + null-handling of rowToSubmission
 * via the public read helpers, plus the count helper's normalisation.
 */

const { selectMock, whereResolver } = vi.hoisted(() => ({
  selectMock: vi.fn(),
  whereResolver: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: (...args: unknown[]) => {
          whereResolver(...args);
          return {
            limit: () => Promise.resolve(selectMock()),
            then: (cb: (v: unknown) => unknown) => Promise.resolve(selectMock()).then(cb),
          };
        },
      }),
    }),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  diagnosticSubmissions: {
    email: { name: "email" },
    slug: { name: "slug" },
  },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: (col: unknown, val: unknown) => ({ __op: "eq", col, val }),
    sql: Object.assign((..._a: unknown[]) => ({ __sql: true }), {
      raw: (s: string) => ({ __sqlraw: s }),
    }),
  };
});

const HAPPY_ROW = {
  id: 1,
  slug: "abc1234567",
  email: "test@example.com",
  age: "45-54",
  hoursPerWeek: "9-12",
  ftp: 285,
  goal: null,
  answers: { age: "45-54", hoursPerWeek: "9-12", Q1: 3 },
  scores: {
    underRecovered: 11,
    polarisation: 3,
    strengthGap: 5,
    fuelingDeficit: 6,
  },
  primaryProfile: "underRecovered",
  secondaryProfile: null,
  severeMultiSystem: false,
  closeToBreakthrough: false,
  breakdown: { headline: "x", fix: [] },
  generationSource: "llm",
  rawModelOutput: '{"headline":"x"}',
  generationMeta: { attempts: 1 },
  utmSource: "facebook",
  utmMedium: "cpc",
  utmCampaign: "plateau",
  utmContent: null,
  utmTerm: null,
  userAgent: "Mozilla/5.0",
  referrer: null,
  beehiivSubscriberId: "sub_123",
  retakeNumber: 1,
  createdAt: new Date("2026-04-22T12:00:00Z"),
  updatedAt: new Date("2026-04-22T12:00:00Z"),
};

describe("store: getSubmissionBySlug", () => {
  beforeEach(() => {
    selectMock.mockReset();
    whereResolver.mockReset();
  });
  afterEach(() => {
    vi.resetModules();
  });

  it("returns a fully-mapped submission when the row exists", async () => {
    selectMock.mockReturnValue([HAPPY_ROW]);
    const { getSubmissionBySlug } = await import("./store");
    const result = await getSubmissionBySlug("abc1234567");
    expect(result).not.toBeNull();
    expect(result!.slug).toBe("abc1234567");
    expect(result!.primaryProfile).toBe("underRecovered");
    expect(result!.generationSource).toBe("llm");
    expect(result!.retakeNumber).toBe(1);
  });

  it("returns null when no row matches the slug", async () => {
    selectMock.mockReturnValue([]);
    const { getSubmissionBySlug } = await import("./store");
    const result = await getSubmissionBySlug("missing");
    expect(result).toBeNull();
  });

  it("coerces an unexpected generationSource value to 'fallback'", async () => {
    // DB integrity should prevent this, but the type guard is here so
    // a future schema-drift bug doesn't ship a "weird" string into
    // downstream rendering. Verify the safe-coercion path.
    selectMock.mockReturnValue([
      { ...HAPPY_ROW, generationSource: "totally-not-llm" },
    ]);
    const { getSubmissionBySlug } = await import("./store");
    const result = await getSubmissionBySlug("abc1234567");
    expect(result!.generationSource).toBe("fallback");
  });
});

describe("store: getSubmissionDetail", () => {
  beforeEach(() => {
    selectMock.mockReset();
    whereResolver.mockReset();
  });
  afterEach(() => {
    vi.resetModules();
  });

  it("includes raw model output + UTMs (admin-only fields)", async () => {
    selectMock.mockReturnValue([HAPPY_ROW]);
    const { getSubmissionDetail } = await import("./store");
    const result = await getSubmissionDetail("abc1234567");
    expect(result).not.toBeNull();
    expect(result!.rawModelOutput).toBe('{"headline":"x"}');
    expect(result!.generationMeta).toEqual({ attempts: 1 });
    expect(result!.utm.source).toBe("facebook");
    expect(result!.utm.campaign).toBe("plateau");
    expect(result!.beehiivSubscriberId).toBe("sub_123");
    expect(result!.userAgent).toBe("Mozilla/5.0");
  });

  it("returns null when the slug doesn't exist", async () => {
    selectMock.mockReturnValue([]);
    const { getSubmissionDetail } = await import("./store");
    const result = await getSubmissionDetail("missing");
    expect(result).toBeNull();
  });
});

describe("store: countPriorSubmissions", () => {
  beforeEach(() => {
    selectMock.mockReset();
    whereResolver.mockReset();
  });
  afterEach(() => {
    vi.resetModules();
  });

  it("returns the integer count from the DB row", async () => {
    selectMock.mockReturnValue([{ cnt: 3 }]);
    const { countPriorSubmissions } = await import("./store");
    const n = await countPriorSubmissions("test@example.com");
    expect(n).toBe(3);
  });

  it("normalises the email to lowercase before querying", async () => {
    selectMock.mockReturnValue([{ cnt: 0 }]);
    const { countPriorSubmissions } = await import("./store");
    await countPriorSubmissions("  TEST@EXAMPLE.COM  ");
    // The eq() mock records its second argument as `val`; verify it
    // arrives normalised.
    const call = whereResolver.mock.calls[0][0] as { val?: string };
    expect(call.val).toBe("test@example.com");
  });

  it("returns 0 when the count row is missing", async () => {
    selectMock.mockReturnValue([]);
    const { countPriorSubmissions } = await import("./store");
    const n = await countPriorSubmissions("test@example.com");
    expect(n).toBe(0);
  });
});
