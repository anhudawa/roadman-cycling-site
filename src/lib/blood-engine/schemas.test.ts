import { describe, expect, it } from "vitest";
import {
  retestTimeframeToDays,
  validateContext,
  validateInterpretation,
  validateRawResults,
} from "./schemas";

const goodCtx = {
  age: 45,
  sex: "m",
  trainingHoursPerWeek: 12,
  trainingPhase: "build",
  symptoms: ["fatigue"],
  drawDate: "2026-04-01",
};

describe("blood-engine/schemas — validateContext", () => {
  it("accepts a valid context", () => {
    expect(validateContext(goodCtx)).toMatchObject({ age: 45, sex: "m" });
  });

  it.each([
    [{ ...goodCtx, age: 15 }, /age/],
    [{ ...goodCtx, age: 101 }, /age/],
    [{ ...goodCtx, age: "not-a-number" }, /age/],
    [{ ...goodCtx, sex: "x" }, /sex/],
    [{ ...goodCtx, trainingHoursPerWeek: -1 }, /trainingHours/],
    [{ ...goodCtx, trainingHoursPerWeek: 41 }, /trainingHours/],
    [{ ...goodCtx, trainingPhase: "weird" }, /trainingPhase/],
    [{ ...goodCtx, symptoms: "fatigue" }, /symptoms/],
    [{ ...goodCtx, symptoms: ["nope"] }, /symptoms/],
    [{ ...goodCtx, drawDate: "April 1" }, /drawDate/],
    [{ ...goodCtx, drawDate: "2026-4-1" }, /drawDate/],
  ])("rejects %j with /%s/", (input, pattern) => {
    expect(() => validateContext(input)).toThrow(pattern);
  });

  it("rejects null + non-objects up front", () => {
    expect(() => validateContext(null)).toThrow();
    expect(() => validateContext("string")).toThrow();
    expect(() => validateContext(42)).toThrow();
  });
});

describe("blood-engine/schemas — validateRawResults", () => {
  it("accepts a valid array", () => {
    const r = validateRawResults([{ markerId: "ferritin", value: 80, unit: "ng/mL" }]);
    expect(r).toHaveLength(1);
    expect(r[0].markerId).toBe("ferritin");
  });

  it("rejects non-arrays", () => {
    expect(() => validateRawResults({})).toThrow();
    expect(() => validateRawResults(null)).toThrow();
  });

  it("rejects entries with unknown markerId", () => {
    expect(() =>
      validateRawResults([{ markerId: "kryptonite", value: 1, unit: "x" }])
    ).toThrow(/markerId/);
  });

  it("rejects entries with non-numeric value", () => {
    expect(() =>
      validateRawResults([{ markerId: "ferritin", value: "high", unit: "ng/mL" }])
    ).toThrow(/value/);
  });

  it("coerces string values to numbers", () => {
    const r = validateRawResults([{ markerId: "ferritin", value: "80", unit: "ng/mL" }]);
    expect(r[0].value).toBe(80);
  });
});

describe("blood-engine/schemas — validateInterpretation", () => {
  const good = {
    overall_status: "optimal",
    summary: "Looks good.",
    markers: [],
    detected_patterns: [],
    action_plan: [],
    retest_recommendation: { timeframe: "12 weeks", focus_markers: [] },
    medical_disclaimer: "...",
  };

  it("accepts a valid interpretation", () => {
    expect(validateInterpretation(good)).toMatchObject({ overall_status: "optimal" });
  });

  it.each([
    [{ ...good, overall_status: "questionable" }, /overall_status/],
    [{ ...good, summary: 123 }, /summary/],
    [{ ...good, markers: "ferritin" }, /markers/],
    [{ ...good, detected_patterns: null }, /detected_patterns/],
    [{ ...good, action_plan: {} }, /action_plan/],
    [{ ...good, retest_recommendation: { timeframe: "next year", focus_markers: [] } }, /timeframe/],
    [{ ...good, medical_disclaimer: 0 }, /medical_disclaimer/],
  ])("rejects %j with /%s/", (input, pattern) => {
    expect(() => validateInterpretation(input)).toThrow(pattern);
  });
});

describe("blood-engine/schemas — retestTimeframeToDays", () => {
  it("maps 8 weeks → 56", () => expect(retestTimeframeToDays("8 weeks")).toBe(56));
  it("maps 12 weeks → 84", () => expect(retestTimeframeToDays("12 weeks")).toBe(84));
  it("maps 6 months → 182", () => expect(retestTimeframeToDays("6 months")).toBe(182));
});
