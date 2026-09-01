import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  compareStrengthSearchSnapshots,
  renderStrengthSearchComparisonMarkdown,
  type StrengthSearchSnapshot,
} from "./strength-search-measurement";

const read = (name: string) =>
  JSON.parse(
    readFileSync(resolve(process.cwd(), `docs/seo/data/${name}`), "utf8"),
  ) as StrengthSearchSnapshot;

function currentFrom(baseline: StrengthSearchSnapshot): StrengthSearchSnapshot {
  const current = structuredClone(baseline);
  const sevenDays = baseline.period.days === 7;
  current.capturedAt = sevenDays
    ? "2026-09-11T08:00:00Z"
    : "2026-10-02T08:00:00Z";
  current.period = sevenDays
    ? { start: "2026-09-02", end: "2026-09-08", days: 7 }
    : { start: "2026-09-02", end: "2026-09-29", days: 28 };
  current.lanes[0].aggregate = {
    clicks: 5,
    impressions: 120,
    ctr: 0.042,
    position: 5.8,
  };
  current.lanes[0].reportedPageCount = 2;
  current.lanes[0].pageRows = [
    {
      path: "/blog/cycling-strength-training-guide",
      clicks: 5,
      impressions: 110,
    },
    {
      path: "/topics/cycling-strength-conditioning",
      clicks: 0,
      impressions: 10,
    },
  ];
  return current;
}

describe("cycling strength search measurement", () => {
  it.each([
    "gsc-strength-search-7d-2026-08-29.json",
    "gsc-strength-search-28d-2026-08-29.json",
  ])("accepts the frozen %s contract", (name) => {
    const baseline = read(name);
    const comparison = compareStrengthSearchSnapshots(
      baseline,
      currentFrom(baseline),
    );

    expect(comparison.lanes).toHaveLength(2);
    expect(comparison.lanes[0].expectedOwner).toBe(
      "/blog/cycling-strength-training-guide",
    );
    expect(comparison.lanes[0].visibleOwnerShareAfter).toBeCloseTo(110 / 120);
    expect(comparison.lanes[1].expectedOwner).toBe(
      "/blog/cycling-gym-exercises-best",
    );
  });

  it("preserves the 28-day S&C and cycling-gym opportunities", () => {
    const baseline = read("gsc-strength-search-28d-2026-08-29.json");

    expect(baseline.lanes[0].aggregate).toEqual({
      clicks: 0,
      impressions: 91,
      ctr: 0,
      position: 7.6,
    });
    expect(baseline.lanes[0].pageRows[0]).toMatchObject({
      path: "/blog/cycling-strength-training-guide",
      impressions: 78,
    });
    expect(baseline.lanes[1].aggregate).toEqual({
      clicks: 0,
      impressions: 121,
      ctr: 0,
      position: 8.9,
    });
    expect(baseline.lanes[1].pageRows[0]).toMatchObject({
      path: "/blog/cycling-gym-exercises-best",
      impressions: 119,
    });
  });

  it("rejects changed filters, owners, release windows and early captures", () => {
    const baseline = read("gsc-strength-search-7d-2026-08-29.json");

    const changedRegex = currentFrom(baseline);
    changedRegex.lanes[1].regex = ".*gym.*";
    expect(() =>
      compareStrengthSearchSnapshots(baseline, changedRegex),
    ).toThrow(/changed its measurement contract/);

    const changedOwner = currentFrom(baseline);
    changedOwner.lanes[1].expectedOwner = "/app";
    expect(() =>
      compareStrengthSearchSnapshots(baseline, changedOwner),
    ).toThrow(/changed its measurement contract/);

    const includesRelease = currentFrom(baseline);
    includesRelease.period = {
      start: "2026-09-01",
      end: "2026-09-07",
      days: 7,
    };
    expect(() =>
      compareStrengthSearchSnapshots(baseline, includesRelease),
    ).toThrow(/exclude and bracket the release day/);

    const tooEarly = currentFrom(baseline);
    tooEarly.capturedAt = "2026-09-09T23:59:00Z";
    expect(() => compareStrengthSearchSnapshots(baseline, tooEarly)).toThrow(
      /too early/,
    );
  });

  it("renders both intent owners and the partial-data warning", () => {
    const baseline = read("gsc-strength-search-7d-2026-08-29.json");
    const markdown = renderStrengthSearchComparisonMarkdown(
      compareStrengthSearchSnapshots(baseline, currentFrom(baseline)),
    );

    expect(markdown).toContain(
      "Cycling strength and conditioning synonym intent",
    );
    expect(markdown).toContain("Cycling gym head term");
    expect(markdown).toContain("must not be added together");
  });
});
