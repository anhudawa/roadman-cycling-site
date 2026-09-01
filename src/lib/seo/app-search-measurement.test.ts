import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  compareAppSearchSnapshots,
  renderAppSearchComparisonMarkdown,
  type AppSearchSnapshot,
} from "./app-search-measurement";

const read = (name: string) =>
  JSON.parse(
    readFileSync(resolve(process.cwd(), `docs/seo/data/${name}`), "utf8"),
  ) as AppSearchSnapshot;

function currentFrom(baseline: AppSearchSnapshot): AppSearchSnapshot {
  const current = structuredClone(baseline);
  const sevenDays = baseline.period.days === 7;
  current.capturedAt = sevenDays
    ? "2026-09-11T08:00:00Z"
    : "2026-10-02T08:00:00Z";
  current.period = sevenDays
    ? { start: "2026-09-02", end: "2026-09-08", days: 7 }
    : { start: "2026-09-02", end: "2026-09-29", days: 28 };
  current.pages[0] = {
    path: "/app",
    clicks: 3,
    impressions: 120,
    ctr: 0.025,
    position: 8.2,
  };
  current.lanes[0].aggregate = {
    clicks: 2,
    impressions: 80,
    ctr: 0.025,
    position: 9,
  };
  current.lanes[0].reportedUrlCount = 1;
  current.lanes[0].pageRows = [
    { path: "/app", clicks: 2, impressions: 72 },
  ];
  current.lanes[0].queryRows = [
    { query: "cycling recovery app", clicks: 2, impressions: 80 },
  ];
  current.ai.pages[0].impressions = 30;
  current.waitlist = {
    trackingStartedAt: "2026-09-01T00:00:00Z",
    submissions: 18,
    attributedSubmissions: 15,
    bySource: [{ source: "app", submissions: 15 }],
  };
  return current;
}

describe("app search measurement", () => {
  it.each([
    "gsc-app-search-7d-2026-08-29.json",
    "gsc-app-search-28d-2026-08-29.json",
  ])("accepts the frozen %s baseline contract", (name) => {
    const baseline = read(name);
    const comparison = compareAppSearchSnapshots(
      baseline,
      currentFrom(baseline),
    );

    expect(comparison.pages[0].path).toBe("/app");
    expect(comparison.pages[0].impressions.after).toBe(120);
    expect(comparison.lanes[0].expectedOwner).toBe("/app");
    expect(comparison.lanes[0].visibleOwnerShareAfter).toBe(1);
    expect(comparison.aiPages[0].impressions.absolute).toBe(29);
    expect(comparison.waitlist.baselineAvailable).toBe(false);
  });

  it("preserves the captured 28-day demand and partial-row boundary", () => {
    const baseline = read("gsc-app-search-28d-2026-08-29.json");
    const lane = baseline.lanes.find(
      (candidate) => candidate.id === "cycling-training-app-discovery",
    )!;

    expect(baseline.pages[0]).toMatchObject({ impressions: 9, position: 5.7 });
    expect(baseline.ai.pages[0].impressions).toBe(1);
    expect(lane.aggregate).toMatchObject({ clicks: 1, impressions: 27 });
    expect(lane.pageRows.reduce((sum, row) => sum + row.impressions, 0)).toBe(
      56,
    );
  });

  it("rejects changed routes, regexes, release windows and early captures", () => {
    const baseline = read("gsc-app-search-7d-2026-08-29.json");

    const changedPage = currentFrom(baseline);
    changedPage.pages[0].path = "/pocket-coach";
    expect(() => compareAppSearchSnapshots(baseline, changedPage)).toThrow(
      /monitored pages must stay fixed/,
    );

    const changedRegex = currentFrom(baseline);
    changedRegex.lanes[0].regex = ".*app.*";
    expect(() => compareAppSearchSnapshots(baseline, changedRegex)).toThrow(
      /changed its filter or owner/,
    );

    const includesRelease = currentFrom(baseline);
    includesRelease.period = {
      start: "2026-09-01",
      end: "2026-09-07",
      days: 7,
    };
    expect(() => compareAppSearchSnapshots(baseline, includesRelease)).toThrow(
      /exclude and bracket the release day/,
    );

    const tooEarly = currentFrom(baseline);
    tooEarly.capturedAt = "2026-09-09T23:59:00Z";
    expect(() => compareAppSearchSnapshots(baseline, tooEarly)).toThrow(
      /too early/,
    );
  });

  it("renders page, ownership, AI and honest waitlist sections", () => {
    const baseline = read("gsc-app-search-7d-2026-08-29.json");
    const markdown = renderAppSearchComparisonMarkdown(
      compareAppSearchSnapshots(baseline, currentFrom(baseline)),
    );

    expect(markdown).toContain("## Monitored pages");
    expect(markdown).toContain("## Query ownership lanes");
    expect(markdown).toContain("## Google AI visibility");
    expect(markdown).toContain("No comparable baseline waitlist capture");
  });
});
