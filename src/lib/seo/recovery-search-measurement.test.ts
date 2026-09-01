import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  compareRecoverySearchSnapshots,
  renderRecoverySearchComparisonMarkdown,
  type RecoverySearchSnapshot,
} from "./recovery-search-measurement";

const read = (name: string) =>
  JSON.parse(
    readFileSync(resolve(process.cwd(), `docs/seo/data/${name}`), "utf8"),
  ) as RecoverySearchSnapshot;

function currentFrom(baseline: RecoverySearchSnapshot): RecoverySearchSnapshot {
  const current = structuredClone(baseline);
  const sevenDays = baseline.period.days === 7;
  current.capturedAt = sevenDays
    ? "2026-09-11T08:00:00Z"
    : "2026-10-02T08:00:00Z";
  current.period = sevenDays
    ? { start: "2026-09-02", end: "2026-09-08", days: 7 }
    : { start: "2026-09-02", end: "2026-09-29", days: 28 };
  current.lanes[0].aggregate = {
    clicks: 4,
    impressions: 100,
    ctr: 0.04,
    position: 12.5,
  };
  current.lanes[0].reportedPageCount = 2;
  current.lanes[0].reportedQueryCount = 2;
  current.lanes[0].pageRows = [
    {
      path: "/blog/cycling-recovery-tips",
      clicks: 4,
      impressions: 90,
    },
    { path: "/topics/cycling-recovery", clicks: 0, impressions: 10 },
  ];
  current.lanes[0].queryRows = [
    { query: "cycling recovery", clicks: 3, impressions: 80 },
    { query: "recovery after cycling", clicks: 1, impressions: 20 },
  ];
  return current;
}

describe("cycling recovery search measurement", () => {
  it.each([
    "gsc-recovery-search-7d-2026-08-29.json",
    "gsc-recovery-search-28d-2026-08-29.json",
  ])("accepts the frozen %s contract", (name) => {
    const baseline = read(name);
    const comparison = compareRecoverySearchSnapshots(
      baseline,
      currentFrom(baseline),
    );

    expect(comparison.lanes).toHaveLength(3);
    expect(comparison.lanes[0].expectedOwner).toBe(
      "/blog/cycling-recovery-tips",
    );
    expect(comparison.lanes[0].visibleOwnerShareAfter).toBe(0.9);
    expect(comparison.lanes[2].expectedOwner).toBe("/app");
  });

  it("preserves the clean-head and confounded broad baselines", () => {
    const baseline = read("gsc-recovery-search-28d-2026-08-29.json");
    const head = baseline.lanes[0];
    const broad = baseline.lanes[1];

    expect(head.aggregate).toEqual({
      clicks: 2,
      impressions: 67,
      ctr: 0.03,
      position: 21.3,
    });
    expect(head.pageRows[0]).toMatchObject({
      path: "/blog/cycling-recovery-tips",
      impressions: 73,
    });
    expect(broad.aggregate).toMatchObject({
      clicks: 10,
      impressions: 2404,
    });
    expect(
      broad.queryRows.find(
        (row) =>
          row.query ===
          "masters cyclists lower back pain recovery tips questions",
      )?.impressions,
    ).toBe(1245);
  });

  it("rejects contract drift, overlapping windows and early captures", () => {
    const baseline = read("gsc-recovery-search-7d-2026-08-29.json");

    const changedRegex = currentFrom(baseline);
    changedRegex.lanes[0].regex = ".*recovery.*";
    expect(() =>
      compareRecoverySearchSnapshots(baseline, changedRegex),
    ).toThrow(/changed its measurement contract/);

    const includesRelease = currentFrom(baseline);
    includesRelease.period = {
      start: "2026-09-01",
      end: "2026-09-07",
      days: 7,
    };
    expect(() =>
      compareRecoverySearchSnapshots(baseline, includesRelease),
    ).toThrow(/exclude and bracket the release day/);

    const tooEarly = currentFrom(baseline);
    tooEarly.capturedAt = "2026-09-09T23:59:00Z";
    expect(() => compareRecoverySearchSnapshots(baseline, tooEarly)).toThrow(
      /too early/,
    );
  });

  it("renders lane ownership and the confounder warning", () => {
    const baseline = read("gsc-recovery-search-7d-2026-08-29.json");
    const markdown = renderRecoverySearchComparisonMarkdown(
      compareRecoverySearchSnapshots(baseline, currentFrom(baseline)),
    );

    expect(markdown).toContain("Clean cycling recovery head terms");
    expect(markdown).toContain("portfolio-fragmentation");
    expect(markdown).toContain("## Broad-lane confounder");
    expect(markdown).toContain(
      "not a target for forcing every narrow recovery query",
    );
  });
});
