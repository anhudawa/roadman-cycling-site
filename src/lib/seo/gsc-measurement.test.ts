import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  compareGscSnapshots,
  renderGscComparisonMarkdown,
  type GscSnapshot,
} from "./gsc-measurement";

function snapshot(overrides: Partial<GscSnapshot> = {}): GscSnapshot {
  return {
    schemaVersion: 2,
    property: "sc-domain:roadmancycling.com",
    capturedAt: "2026-08-24T12:00:00.000Z",
    deploymentDate: "2026-08-24",
    period: { start: "2026-07-26", end: "2026-08-22", days: 28 },
    site: { clicks: 100, impressions: 1_000, ctr: 0.1, position: 10 },
    ownerPages: [
      { path: "/podcast", clicks: 2, impressions: 50, ctr: 0.04, position: 6 },
      { path: "/coaching", clicks: 1, impressions: 10, ctr: 0.1, position: 30 },
      { path: "/masters", clicks: 0, impressions: 5, ctr: 0, position: 20 },
      {
        path: "/training-plans",
        clicks: 0,
        impressions: 2,
        ctr: 0,
        position: 10,
      },
      {
        path: "/training-camps",
        clicks: 0,
        impressions: 4,
        ctr: 0,
        position: 15,
      },
    ],
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
    videoIndex: {
      lastUpdated: "2026-08-24",
      indexed: 1,
      notIndexed: 352,
      issues: [
        {
          reason: "Video isn't on a watch page",
          videos: 352,
          validation: "Not Started",
        },
      ],
    },
    ownerLinkClicks: null,
    ...overrides,
  };
}

function currentSnapshot(overrides: Partial<GscSnapshot> = {}): GscSnapshot {
  return snapshot({
    capturedAt: "2026-09-22T12:00:00.000Z",
    period: { start: "2026-08-25", end: "2026-09-21", days: 28 },
    ...overrides,
  });
}

describe("GSC measurement", () => {
  it("keeps both frozen baselines valid for their fixed post windows", () => {
    const fixtures = [
      {
        path: "docs/seo/data/gsc-priority-7d-2026-08-23.json",
        period: { start: "2026-08-25", end: "2026-08-31", days: 7 },
      },
      {
        path: "docs/seo/data/gsc-priority-28d-2026-08-22.json",
        period: { start: "2026-08-25", end: "2026-09-21", days: 28 },
      },
    ] as const;

    for (const fixture of fixtures) {
      const baseline = JSON.parse(
        readFileSync(resolve(process.cwd(), fixture.path), "utf8"),
      ) as GscSnapshot;
      const current: GscSnapshot = {
        ...baseline,
        capturedAt: "2026-09-24T12:00:00.000Z",
        period: fixture.period,
      };

      expect(() => compareGscSnapshots(baseline, current)).not.toThrow();
    }
  });

  it("compares site, query, ownership and AI signals", () => {
    const baseline = snapshot();
    const current = currentSnapshot({
      site: { clicks: 120, impressions: 1_100, ctr: 0.109, position: 9 },
      ownerPages: snapshot().ownerPages.map((row) =>
        row.path === "/coaching"
          ? {
              ...row,
              clicks: 6,
              impressions: 48,
              ctr: 0.125,
              position: 12,
            }
          : row,
      ),
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
        pages: [
          { path: "https://roadmancycling.com/coaching", impressions: 50 },
        ],
      },
      videoIndex: {
        lastUpdated: "2026-09-21",
        indexed: 100,
        notIndexed: 253,
        issues: [
          {
            reason: "Video isn't on a watch page",
            videos: 253,
            validation: "Started",
          },
        ],
      },
      ownerLinkClicks: {
        trackingStartedAt: "2026-08-24T15:00:00.000Z",
        total: 12,
        byOwner: [{ ownerId: "cycling-coaching", clicks: 12 }],
        bySource: [
          {
            ownerId: "cycling-coaching",
            path: "/blog/best-online-cycling-coach-how-to-choose",
            clicks: 12,
          },
        ],
      },
    });

    const result = compareGscSnapshots(baseline, current);

    expect(result.site.clicks.absolute).toBe(20);
    expect(result.site.clicks.relative).toBeCloseTo(0.2);
    const coachingOwner = result.ownerPages.find(
      (row) => row.path === "/coaching",
    );
    expect(coachingOwner).toEqual(
      expect.objectContaining({
        ownerId: "cycling-coaching",
        positionGain: 18,
      }),
    );
    expect(coachingOwner?.ctrPoints).toBeCloseTo(2.5);
    expect(result.queries[0].positionGain).toBe(4);
    expect(result.urlSplits[0].reportedUrlCountDelta).toBe(-2);
    expect(result.urlSplits[0].ownerImpressionShareBefore).toBeCloseTo(0.1);
    expect(result.urlSplits[0].ownerImpressionShareAfter).toBeCloseTo(0.4);
    expect(result.ai.impressions.absolute).toBe(500);
    expect(result.ai.pages[0].impressions.absolute).toBe(30);
    expect(result.videoIndex.indexed.absolute).toBe(99);
    expect(result.videoIndex.notIndexed.absolute).toBe(-99);
    expect(result.videoIndex.issues[0]).toEqual({
      reason: "Video isn't on a watch page",
      videos: {
        before: 352,
        after: 253,
        absolute: -99,
        relative: -99 / 352,
      },
      currentValidation: "Started",
    });
    expect(result.ownerLinkClicks.baselineAvailable).toBe(false);
    expect(result.ownerLinkClicks.currentTotal).toBe(12);
    expect(result.ownerLinkClicks.owners).toContainEqual({
      ownerId: "cycling-coaching",
      baselineClicks: null,
      currentClicks: 12,
      delta: null,
    });
    expect(result.ownerLinkClicks.currentSources).toEqual([
      {
        ownerId: "cycling-coaching",
        path: "/blog/best-online-cycling-coach-how-to-choose",
        clicks: 12,
      },
    ]);
  });

  it("renders an audit-ready Markdown scorecard", () => {
    const baseline = snapshot();
    const current = currentSnapshot();

    const markdown = renderGscComparisonMarkdown(
      compareGscSnapshots(baseline, current),
    );

    expect(markdown).toContain("# Roadman search comparison");
    expect(markdown).toContain("## Canonical owner pages");
    expect(markdown).toContain("[Online Cycling Coaching](/coaching)");
    expect(markdown).toContain("## URL ownership");
    expect(markdown).toContain("## Video indexing");
    expect(markdown).toContain("Video isn't on a watch page");
    expect(markdown).toContain("Tracking did not exist in the baseline window");
    expect(markdown).toContain("### Current assisted source pages");
  });

  it("records a disappeared video issue as zero rather than dropping it", () => {
    const result = compareGscSnapshots(
      snapshot(),
      currentSnapshot({
        videoIndex: {
          lastUpdated: "2026-09-21",
          indexed: 353,
          notIndexed: 0,
          issues: [],
        },
      }),
    );

    expect(result.videoIndex.issues).toEqual([
      {
        reason: "Video isn't on a watch page",
        videos: {
          before: 352,
          after: 0,
          absolute: -352,
          relative: -1,
        },
        currentValidation: "Not present",
      },
    ]);
  });

  it("refuses comparisons with mismatched periods or query scopes", () => {
    expect(() =>
      compareGscSnapshots(
        snapshot(),
        snapshot({
          period: { start: "2026-08-01", end: "2026-08-07", days: 7 },
        }),
      ),
    ).toThrow("same length");

    expect(() =>
      compareGscSnapshots(snapshot(), currentSnapshot({ queries: [] })),
    ).toThrow("has no matching priority query");

    const baseline = snapshot();
    const containsQuery = {
      ...baseline.queries[0],
      match: "contains" as const,
    };
    expect(() =>
      compareGscSnapshots(
        baseline,
        currentSnapshot({
          queries: [containsQuery],
          urlSplits: [
            {
              ...baseline.urlSplits[0],
              match: "contains",
            },
          ],
        }),
      ),
    ).toThrow("same priority query filters");
  });

  it("refuses extra, duplicate or changed measurement filters", () => {
    const baseline = snapshot();

    expect(() =>
      compareGscSnapshots(
        baseline,
        currentSnapshot({
          ownerPages: baseline.ownerPages.slice(1),
        }),
      ),
    ).toThrow("same canonical owner pages");

    expect(() =>
      compareGscSnapshots(
        baseline,
        currentSnapshot({
          queries: [
            ...baseline.queries,
            { ...baseline.queries[0], query: "online cycling coach" },
          ],
        }),
      ),
    ).toThrow("same priority query filters");

    expect(() =>
      compareGscSnapshots(
        baseline,
        currentSnapshot({
          queries: [...baseline.queries, { ...baseline.queries[0] }],
        }),
      ),
    ).toThrow("duplicate key");

    expect(() =>
      compareGscSnapshots(
        baseline,
        currentSnapshot({
          urlSplits: [
            {
              ...baseline.urlSplits[0],
              expectedOwner: "/blog/best-online-cycling-coach-how-to-choose",
            },
          ],
        }),
      ),
    ).toThrow("same expected owner");

    expect(() =>
      compareGscSnapshots(
        baseline,
        currentSnapshot({
          urlSplits: [
            ...baseline.urlSplits,
            { ...baseline.urlSplits[0], id: "cycling-coach-secondary" },
          ],
        }),
      ),
    ).toThrow("same URL split IDs");

    expect(() =>
      compareGscSnapshots(
        baseline,
        currentSnapshot({
          ai: {
            impressions: 1_000,
            pages: [
              ...baseline.ai.pages,
              { path: "/training-plans", impressions: 1 },
            ],
          },
        }),
      ),
    ).toThrow("same AI page filters");
  });

  it("refuses invalid, overlapping or deployment-misaligned windows", () => {
    expect(() =>
      compareGscSnapshots(
        snapshot(),
        currentSnapshot({
          period: { start: "2026-08-25", end: "2026-09-20", days: 28 },
        }),
      ),
    ).toThrow("dates span 27");

    expect(() =>
      compareGscSnapshots(
        snapshot(),
        currentSnapshot({
          period: { start: "2026-08-20", end: "2026-09-16", days: 28 },
        }),
      ),
    ).toThrow("must not overlap");

    expect(() =>
      compareGscSnapshots(
        snapshot(),
        currentSnapshot({ deploymentDate: "2026-08-25" }),
      ),
    ).toThrow("same deployment date");

    expect(() =>
      compareGscSnapshots(
        snapshot(),
        currentSnapshot({
          videoIndex: {
            lastUpdated: "2026-09-21",
            indexed: -1,
            notIndexed: 352,
            issues: [],
          },
        }),
      ),
    ).toThrow("video index indexed must be a non-negative integer");
  });
});
