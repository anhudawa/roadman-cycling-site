import { describe, expect, it } from "vitest";
import type { BloodReport } from "./db";
import { computeTrends } from "./trends";

function report(
  id: number,
  drawDate: string,
  results: Array<{ markerId: string; canonicalValue: number }>,
  markerStatuses: Record<string, "optimal" | "suboptimal" | "flag"> = {}
): BloodReport {
  return {
    id,
    userId: 1,
    drawDate,
    context: { sex: "m" } as never,
    results: results.map((r) => ({
      markerId: r.markerId,
      canonicalValue: r.canonicalValue,
      originalValue: r.canonicalValue,
      originalUnit: "ng/mL",
    })) as never,
    interpretation: {
      markers: Object.entries(markerStatuses).map(([mid, status]) => ({
        markerId: mid,
        name: mid,
        value: 0,
        unit: "",
        athlete_optimal_range: "",
        status,
        interpretation: "",
        action: "",
      })),
      overall_status: "suboptimal",
      summary: "",
      detected_patterns: [],
      action_plan: [],
      retest_recommendation: { timeframe: "12 weeks", focus_markers: [] },
      medical_disclaimer: "",
    } as never,
    promptVersion: "v1-test",
    retestDueAt: null,
    retestNudgeSentAt: null,
    createdAt: new Date(drawDate),
  };
}

describe("blood-engine/trends", () => {
  it("returns no trends when fewer than 2 reports", () => {
    expect(computeTrends([], "m")).toEqual([]);
    expect(
      computeTrends([report(1, "2026-01-01", [{ markerId: "ferritin", canonicalValue: 50 }])], "m")
    ).toEqual([]);
  });

  it("returns one trend per marker that has ≥2 datapoints, sorted by drawDate", () => {
    const trends = computeTrends(
      [
        // intentionally out of order
        report(2, "2026-04-01", [{ markerId: "ferritin", canonicalValue: 100 }]),
        report(1, "2026-01-01", [{ markerId: "ferritin", canonicalValue: 50 }]),
      ],
      "m"
    );
    expect(trends).toHaveLength(1);
    expect(trends[0].markerId).toBe("ferritin");
    expect(trends[0].points.map((p) => p.value)).toEqual([50, 100]);
    expect(trends[0].direction).toBe("up");
  });

  it("classifies direction as flat for <5% change", () => {
    const trends = computeTrends(
      [
        report(1, "2026-01-01", [{ markerId: "ferritin", canonicalValue: 100 }]),
        report(2, "2026-04-01", [{ markerId: "ferritin", canonicalValue: 102 }]),
      ],
      "m"
    );
    expect(trends[0].direction).toBe("flat");
  });

  it("propagates the latest report's status onto the trend", () => {
    const trends = computeTrends(
      [
        report(1, "2026-01-01", [{ markerId: "ferritin", canonicalValue: 50 }], {
          ferritin: "flag",
        }),
        report(2, "2026-04-01", [{ markerId: "ferritin", canonicalValue: 100 }], {
          ferritin: "optimal",
        }),
      ],
      "m"
    );
    expect(trends[0].latestStatus).toBe("optimal");
  });

  it("uses sex-specific optimal range bounds", () => {
    const trendsM = computeTrends(
      [
        report(1, "2026-01-01", [{ markerId: "haematocrit", canonicalValue: 44 }]),
        report(2, "2026-04-01", [{ markerId: "haematocrit", canonicalValue: 45 }]),
      ],
      "m"
    );
    const trendsF = computeTrends(
      [
        report(1, "2026-01-01", [{ markerId: "haematocrit", canonicalValue: 44 }]),
        report(2, "2026-04-01", [{ markerId: "haematocrit", canonicalValue: 45 }]),
      ],
      "f"
    );
    // M optimal: 42-48, F optimal: 37-44
    expect(trendsM[0].optimalLow).toBe(42);
    expect(trendsF[0].optimalHigh).toBe(44);
  });
});
