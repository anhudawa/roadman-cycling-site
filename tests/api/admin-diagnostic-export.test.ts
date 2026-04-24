import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  dbOrderBy: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        orderBy: (..._args: unknown[]) => mocks.dbOrderBy(),
      }),
    }),
  },
}));
vi.mock("@/lib/db/schema", () => ({
  diagnosticSubmissions: { createdAt: {} },
}));

const sampleRow = {
  slug: "abc1234567",
  createdAt: new Date("2026-04-20T10:00:00Z"),
  email: "rider@example.com",
  primaryProfile: "underRecovered",
  secondaryProfile: "polarisation",
  retakeNumber: 0,
  generationSource: "claude",
  severeMultiSystem: false,
  closeToBreakthrough: true,
  scores: {
    underRecovered: 9,
    polarisation: 6,
    strengthGap: 2,
    fuelingDeficit: 4,
  },
  age: 47,
  hoursPerWeek: 10,
  ftp: 280,
  goal: "Etape",
  utmSource: "podcast",
  utmMedium: "audio",
  utmCampaign: null,
  utmContent: null,
  utmTerm: null,
};

describe("GET /api/admin/diagnostic/export", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.requireAuth.mockResolvedValue(undefined);
    mocks.dbOrderBy.mockResolvedValue([sampleRow]);
  });

  it("requires auth before any DB read", async () => {
    mocks.requireAuth.mockRejectedValueOnce(new Error("not authed"));
    const { GET } = await import("@/app/api/admin/diagnostic/export/route");
    await expect(GET()).rejects.toThrow("not authed");
    expect(mocks.dbOrderBy).not.toHaveBeenCalled();
  });

  it("returns 200 CSV with the right headers and filename", async () => {
    const { GET } = await import("@/app/api/admin/diagnostic/export/route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/csv/);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const disposition = res.headers.get("Content-Disposition") ?? "";
    expect(disposition).toMatch(/attachment;.*\.csv"/);
  });

  it("emits a header row with the documented column set", async () => {
    const { GET } = await import("@/app/api/admin/diagnostic/export/route");
    const res = await GET();
    const csv = await res.text();
    const header = csv.split("\n")[0];
    for (const col of [
      "slug", "created_at", "email", "primary_profile", "secondary_profile",
      "retake_number", "generation_source", "severe_multi_system",
      "close_to_breakthrough", "score_under_recovered", "score_polarisation",
      "score_strength_gap", "score_fueling_deficit", "age", "hours_per_week",
      "ftp", "goal", "utm_source", "utm_medium", "utm_campaign",
      "utm_content", "utm_term",
    ]) {
      expect(header).toContain(col);
    }
  });

  it("RFC 4180 quotes every cell and escapes internal quotes", async () => {
    mocks.dbOrderBy.mockResolvedValue([
      { ...sampleRow, goal: 'Etape "2026" — sub-9' },
    ]);
    const { GET } = await import("@/app/api/admin/diagnostic/export/route");
    const csv = await (await GET()).text();
    // Doubled internal quotes
    expect(csv).toContain('"Etape ""2026"" — sub-9"');
  });

  it("populates score columns from the JSON scores blob", async () => {
    const { GET } = await import("@/app/api/admin/diagnostic/export/route");
    const csv = await (await GET()).text();
    // The data row should contain the four score values from sampleRow.
    const rows = csv.split("\n");
    expect(rows[1]).toContain('"9"');
    expect(rows[1]).toContain('"6"');
    expect(rows[1]).toContain('"2"');
    expect(rows[1]).toContain('"4"');
  });

  it("emits an empty data section when there are no submissions", async () => {
    mocks.dbOrderBy.mockResolvedValue([]);
    const { GET } = await import("@/app/api/admin/diagnostic/export/route");
    const csv = await (await GET()).text();
    // header only
    expect(csv.split("\n").length).toBe(1);
  });
});
