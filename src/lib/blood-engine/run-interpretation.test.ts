import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it, vi } from "vitest";
import { PROMPT_VERSION } from "./interpretation-prompt";
import { runInterpretation } from "./run-interpretation";
import type { RawMarkerValue, ReportContext } from "./schemas";

/** Build a fake Anthropic client whose .messages.create returns `responseText`. */
function fakeClient(responseText: string): Anthropic {
  return {
    messages: {
      create: vi.fn(async () => ({
        content: [{ type: "text", text: responseText }],
      })),
    },
  } as unknown as Anthropic;
}

const baseContext: ReportContext = {
  age: 45,
  sex: "m",
  trainingHoursPerWeek: 12,
  trainingPhase: "build",
  symptoms: ["fatigue"],
  drawDate: "2026-04-01",
};

const baseResults: RawMarkerValue[] = [
  { markerId: "ferritin", value: 42, unit: "ng/mL" },
  { markerId: "hs_crp", value: 0.5, unit: "mg/L" },
];

const goodInterpretation = {
  overall_status: "suboptimal",
  summary: "Iron stores are well below athlete-optimal.",
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
    { name: "Iron deficiency", description: "Ferritin low.", severity: "address" },
  ],
  action_plan: [
    { priority: 1, action: "Get iron panel at next test.", timeframe: "this week" },
  ],
  retest_recommendation: { timeframe: "12 weeks", focus_markers: ["Ferritin"] },
  medical_disclaimer:
    "Blood Engine is an educational tool for cyclists, not a medical device.",
};

describe("blood-engine/runInterpretation", () => {
  it("happy path: returns parsed interpretation + normalized values + retest date", async () => {
    const client = fakeClient(JSON.stringify(goodInterpretation));
    const result = await runInterpretation(baseContext, baseResults, { client });

    expect(result.promptVersion).toBe(PROMPT_VERSION);
    expect(result.interpretation.overall_status).toBe("suboptimal");
    expect(result.interpretation.detected_patterns).toHaveLength(1);
    // 12 weeks = 84 days from 2026-04-01 → 2026-06-24
    expect(result.retestDueAt.toISOString().slice(0, 10)).toBe("2026-06-24");
    expect(result.normalized).toHaveLength(2);
    expect(result.normalized[0].markerId).toBe("ferritin");
    expect(result.normalized[0].canonicalValue).toBe(42);
  });

  it("strips ```json fences if the model wraps its output", async () => {
    const wrapped = "```json\n" + JSON.stringify(goodInterpretation) + "\n```";
    const client = fakeClient(wrapped);
    await expect(runInterpretation(baseContext, baseResults, { client })).resolves.toMatchObject(
      { promptVersion: PROMPT_VERSION }
    );
  });

  it("strips ``` (no language tag) too", async () => {
    const wrapped = "```\n" + JSON.stringify(goodInterpretation) + "\n```";
    const client = fakeClient(wrapped);
    await expect(runInterpretation(baseContext, baseResults, { client })).resolves.toMatchObject(
      { promptVersion: PROMPT_VERSION }
    );
  });

  it("normalizes input units server-side before sending to the model", async () => {
    const create = vi.fn(async () => ({
      content: [{ type: "text", text: JSON.stringify(goodInterpretation) }],
    }));
    const client = { messages: { create } } as unknown as Anthropic;
    await runInterpretation(
      baseContext,
      [{ markerId: "vitamin_d", value: 125, unit: "nmol/L" }],
      { client }
    );
    const calledWith = (create.mock.calls[0]?.[0] as { messages: { content: string }[] })
      .messages[0].content;
    // 125 nmol/L should normalize to ~50 ng/mL (canonical) and the value
    // shipped to the model should be ng/mL, not nmol/L.
    expect(calledWith).toContain('"unit": "ng/mL"');
    expect(calledWith).toContain('"value": 50');
  });

  it("rejects empty result arrays before calling the model", async () => {
    const create = vi.fn();
    const client = { messages: { create } } as unknown as Anthropic;
    await expect(runInterpretation(baseContext, [], { client })).rejects.toThrow(/at least one marker/i);
    expect(create).not.toHaveBeenCalled();
  });

  it("throws on non-JSON model output", async () => {
    const client = fakeClient("Sorry, I can't help with that.");
    await expect(runInterpretation(baseContext, baseResults, { client })).rejects.toThrow(/invalid JSON/i);
  });

  it("throws on JSON that fails schema validation", async () => {
    const bad = JSON.stringify({ ...goodInterpretation, overall_status: "weird" });
    const client = fakeClient(bad);
    await expect(runInterpretation(baseContext, baseResults, { client })).rejects.toThrow(
      /overall_status/
    );
  });

  it("computes retestDueAt from drawDate + 8 weeks when timeframe is 8 weeks", async () => {
    const eightWeek = JSON.stringify({
      ...goodInterpretation,
      retest_recommendation: { timeframe: "8 weeks", focus_markers: [] },
    });
    const client = fakeClient(eightWeek);
    const r = await runInterpretation(baseContext, baseResults, { client });
    // 2026-04-01 + 56 days = 2026-05-27
    expect(r.retestDueAt.toISOString().slice(0, 10)).toBe("2026-05-27");
  });

  it("preserves originalValue + originalUnit in normalized output", async () => {
    const client = fakeClient(JSON.stringify(goodInterpretation));
    const r = await runInterpretation(
      baseContext,
      [{ markerId: "vitamin_d", value: 125, unit: "nmol/L" }],
      { client }
    );
    expect(r.normalized[0].originalValue).toBe(125);
    expect(r.normalized[0].originalUnit).toBe("nmol/L");
  });
});
