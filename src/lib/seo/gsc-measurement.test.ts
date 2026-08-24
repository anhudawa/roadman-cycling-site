import { describe, expect, it } from "vitest";
import {
  compareGscSnapshots,
  renderGscComparisonMarkdown,
  type GscSnapshot,
} from "./gsc-measurement";

function snapshot(overrides: Partial<GscSnapshot> = {}): GscSnapshot {
  return {
    schemaVersion: 1,
    property: "sc-domain:roadmancycling.com",
    capturedAt: "2026-08-24T12:00:00.000Z",
    deploymentDate: "2026-08-24",
    period: { start: "2026-07-26", end: "2026-08-22", days: 28 },
    site: { clicks: 100, impressions: 1_000, ctr: 0.1, position: 10 },
    queries: [
      {
        query: "cycling coach",
        match: "exact",
        clicks: 10,
        impressions: 100,
        ctr: 0.1,
        position: 20,
      },
    ],
    urlSplits: [
      {
        id: "cycling-coach",
        label: "Cycling coach",
        query: "cycling coach",
        match: "exact",
        expectedOwner: "/coaching",
        reportedUrlCount: 5,
        aggregate: { clicks: 10, impressions: 100, ctr: 0.1, position: 20 },
        rows: [
          {
            path: "https://roadmancycling.com/coaching",
            clicks: 1,
            impressions: 10,
            ctr: 0.1,
            position: 30,
          },
        ],
      },
    ],
    ai: {
      impressions: 1_000,
      pages: [{ path: "/coaching", impressions: 20 }],
    },
    ownerLinkClicks: null,
    ...overrides,
  };
}

describe("GSC measurement", () => {
  it("compares site, query, ownership and AI signals", () => {
    const baseline = snapshot();
    const current = snapshot({
      capturedAt: "2026-09-22T12:00:00.000Z",
      period: { start: "2026-08-25", end: "2026-09-21", days: 28 },
      site: { clicks: 120, impressions: 1_100, ctr: 0.109, position: 9 },
      queries: [
        {
          query: "cycling coach",
          match: "exact",
          clicks: 15,
          impressions: 120,
          ctr: 0.125,
          position: 16,
        },
      ],
      urlSplits: [
        {
          id: "cycling-coach",
          label: "Cycling coach",
          query: "cycling coach",
          match: "exact",
          expectedOwner: "/coaching",
          reportedUrlCount: 3,
          aggregate: {
            clicks: 15,
            impressions: 120,
            ctr: 0.125,
            position: 16,
          },
          rows: [
            {
              path: "/coaching/",
              clicks: 6,
              impressions: 48,
              ctr: 0.125,
              position: 12,
            },
          ],
        },
      ],
      ai: {
        impressions: 1_500,
        pages: [{ path: "https://roadmancycling.com/coaching", impressions: 50 }],
      },
      ownerLinkClicks: {
        trackingStartedAt: "2026-08-24T15:00:00.000Z",
        total: 12,
        byOwner: [{ ownerId: "cycling-coaching", clicks: 12 }],
      },
    });

    const result = compareGscSnapshots(baseline, current);

    expect(result.site.clicks.absolute).toBe(20);
    expect(result.site.clicks.relative).toBeCloseTo(0.2);
    expect(result.queries[0].positionGain).toBe(4);
    expect(result.urlSplits[0].reportedUrlCountDelta).toBe(-2);
    expect(result.urlSplits[0].ownerImpressionShareBefore).toBeCloseTo(0.1);
    expect(result.urlSplits[0].ownerImpressionShareAfter).toBeCloseTo(0.4);
    expect(result.ai.impressions.absolute).toBe(500);
    expect(result.ai.pages[0].impressions.absolute).toBe(30);
    expect(result.ownerLinkClicks.baselineAvailable).toBe(false);
    expect(result.ownerLinkClicks.currentTotal).toBe(12);
  });

  it("renders an audit-ready Markdown scorecard", () => {
    const baseline = snapshot();
    const current = snapshot({
      period: { start: "2026-08-25", end: "2026-09-21", days: 28 },
    });

    const markdown = renderGscComparisonMarkdown(
      compareGscSnapshots(baseline, current),
    );

    expect(markdown).toContain("# Roadman search comparison");
    expect(markdown).toContain("## URL ownership");
    expect(markdown).toContain(
      "Tracking did not exist in the baseline window",
    );
  });

  it("refuses comparisons with mismatched periods or missing queries", () => {
    expect(() =>
      compareGscSnapshots(
        snapshot(),
        snapshot({ period: { start: "2026-08-01", end: "2026-08-07", days: 7 } }),
      ),
    ).toThrow("same length");

    expect(() =>
      compareGscSnapshots(snapshot(), snapshot({ queries: [] })),
    ).toThrow("missing exact query: cycling coach");
  });
});
