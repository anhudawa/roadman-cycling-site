import { describe, expect, it } from "vitest";
import type { BloodReport } from "./db";
import { renderReportMarkdown } from "./report-markdown";

function makeReport(overrides: Partial<BloodReport> = {}): BloodReport {
  return {
    id: 42,
    userId: 1,
    drawDate: "2026-03-15",
    context: {
      age: 45,
      sex: "m",
      trainingHoursPerWeek: 12,
      trainingPhase: "build",
      symptoms: ["fatigue"],
      drawDate: "2026-03-15",
    } as never,
    results: [] as never,
    interpretation: {
      overall_status: "suboptimal",
      summary: "Ferritin low.",
      markers: [
        {
          markerId: "ferritin",
          name: "Ferritin",
          value: 42,
          unit: "ng/mL",
          athlete_optimal_range: "80–150 ng/mL",
          status: "suboptimal",
          interpretation: "Below athlete-optimal.",
          action: "Discuss with your GP or sports medicine doctor.",
        },
      ],
      detected_patterns: [
        { name: "Iron deficiency", description: "Low stores.", severity: "address" },
      ],
      action_plan: [
        { priority: 1, action: "Get iron panel.", timeframe: "this week" },
      ],
      retest_recommendation: { timeframe: "12 weeks", focus_markers: ["Ferritin"] },
      medical_disclaimer: "disclaimer text",
    } as never,
    promptVersion: "v1-test",
    retestDueAt: null,
    retestNudgeSentAt: null,
    createdAt: new Date("2026-04-14T00:00:00Z"),
    ...overrides,
  } as BloodReport;
}

describe("blood-engine/report-markdown", () => {
  it("emits the canonical disclaimer verbatim", () => {
    const md = renderReportMarkdown(makeReport());
    expect(md).toContain("Blood Engine is an educational tool for cyclists");
  });

  it("includes the report id in the title", () => {
    expect(renderReportMarkdown(makeReport({ id: 123 }))).toContain(
      "# Blood Engine report #123"
    );
  });

  it("renders the full marker table + per-marker sections", () => {
    const md = renderReportMarkdown(makeReport());
    expect(md).toContain("| Marker | Value | Athlete-optimal | Status |");
    expect(md).toContain("| Ferritin | 42 ng/mL | 80–150 ng/mL | suboptimal |");
    expect(md).toContain("### Ferritin");
    expect(md).toContain("Discuss with your GP or sports medicine doctor");
  });

  it("includes detected patterns and action plan sections", () => {
    const md = renderReportMarkdown(makeReport());
    expect(md).toContain("### Iron deficiency _(severity: address)_");
    expect(md).toContain("1. **Get iron panel.** _(this week)_");
  });

  it("renders context bullets with readable symptom labels", () => {
    const md = renderReportMarkdown(makeReport());
    expect(md).toContain("- **Age:** 45");
    expect(md).toContain("- **Sex:** Male");
    expect(md).toContain("- **Symptoms:** fatigue");
  });

  it("falls back gracefully when interpretation is null", () => {
    const md = renderReportMarkdown(
      makeReport({
        interpretation: null,
        results: [
          {
            markerId: "ferritin",
            canonicalValue: 42,
            originalValue: 42,
            originalUnit: "ng/mL",
          },
        ] as never,
      })
    );
    expect(md).toContain("## Interpretation unavailable");
    expect(md).toContain("| ferritin | 42 (42 ng/mL) |");
  });

  it("includes prompt version for provenance", () => {
    expect(renderReportMarkdown(makeReport())).toContain("**Prompt version:** v1-test");
  });
});
