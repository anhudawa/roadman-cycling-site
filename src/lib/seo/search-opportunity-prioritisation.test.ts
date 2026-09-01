import { describe, expect, it } from "vitest";
import {
  inferCommercialRelevance,
  prioritiseSearchOpportunities,
  prioritiseSearchOpportunity,
  renderSearchOpportunityReport,
  type RollingPageOpportunity,
} from "./search-opportunity-prioritisation";

const baseRow: RollingPageOpportunity = {
  path: "/blog/cycling-training-plan-guide",
  currentClicks: 40,
  currentImpressions: 4_000,
  previousClicks: 80,
  previousImpressions: 5_000,
  currentCtr: 0.01,
  currentPosition: 6,
};

describe("weekly search opportunity prioritisation", () => {
  it("protects recent work, measures days 7–13 and acts from day 14", () => {
    const context = {
      sourceFile: "content/blog/cycling-training-plan-guide.mdx",
      lastChangedAt: "2026-08-20",
    };

    expect(
      prioritiseSearchOpportunity(baseRow, context, "2026-08-26").state,
    ).toBe("hold");
    expect(
      prioritiseSearchOpportunity(baseRow, context, "2026-08-27").state,
    ).toBe("measure");
    expect(
      prioritiseSearchOpportunity(baseRow, context, "2026-09-03").state,
    ).toBe("act");
  });

  it("requires manual freshness resolution when no source history is available", () => {
    const opportunity = prioritiseSearchOpportunity(
      baseRow,
      { sourceFile: null, lastChangedAt: null },
      "2026-09-01",
    );

    expect(opportunity.state).toBe("measure");
    expect(opportunity.recommendation).toMatch(/missing freshness data/i);
  });

  it("ranks a mature high-demand loss above a smaller stable page", () => {
    const smaller: RollingPageOpportunity = {
      ...baseRow,
      path: "/blog/cycling-history",
      currentClicks: 9,
      currentImpressions: 400,
      previousClicks: 10,
      previousImpressions: 410,
      currentCtr: 0.0225,
      currentPosition: 12,
    };
    const contexts = new Map([
      [
        baseRow.path,
        { sourceFile: "content/blog/a.mdx", lastChangedAt: "2026-07-01" },
      ],
      [
        smaller.path,
        { sourceFile: "content/blog/b.mdx", lastChangedAt: "2026-07-01" },
      ],
    ]);

    const queue = prioritiseSearchOpportunities(
      [smaller, baseRow],
      contexts,
      "2026-09-01",
    );

    expect(queue[0].path).toBe(baseRow.path);
    expect(queue[0].score).toBeGreaterThan(queue[1].score);
  });

  it("recommends a snippet audit for a strong position with a material CTR gap", () => {
    const opportunity = prioritiseSearchOpportunity(
      {
        ...baseRow,
        currentPosition: 4.4,
        currentCtr: 0.001,
      },
      { sourceFile: "content/blog/a.mdx", lastChangedAt: "2026-07-01" },
      "2026-09-01",
    );

    expect(opportunity.recommendation).toMatch(/query-to-snippet audit/i);
    expect(opportunity.scoreReasons).toContain("14.8 CTR gap");
  });

  it("makes commercial relevance explicit and bounded", () => {
    expect(inferCommercialRelevance("/coaching")).toBe(15);
    expect(inferCommercialRelevance("/blog/wahoo-vs-garmin")).toBe(10);
    expect(inferCommercialRelevance("/blog/cycling-history")).toBe(5);
  });

  it("renders an auditable queue with the freshness guardrail", () => {
    const opportunity = prioritiseSearchOpportunity(
      baseRow,
      { sourceFile: "content/blog/a.mdx", lastChangedAt: "2026-08-28" },
      "2026-09-01",
    );
    const report = renderSearchOpportunityReport({
      property: "sc-domain:roadmancycling.com",
      capturedAt: "2026-09-01",
      dataThrough: "2026-08-29",
      asOf: "2026-09-01",
      opportunities: [opportunity],
      queryInvestigations: [],
    });

    expect(report).toContain("0 act now · 0 measure · 1 protected");
    expect(report).toContain("Protected — do not rewrite");
    expect(report).toContain("become eligible on day 14");
  });
});
