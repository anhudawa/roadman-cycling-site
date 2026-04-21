import { describe, expect, it } from "vitest";
import { scoreDiagnostic } from "./scoring";
import type { Answers } from "./types";

/**
 * Appendix A fixtures, verbatim from the spec. Each one verifies one
 * corner of the scoring engine:
 *  1. Pure single-profile win (Under-recovered) with cross-score bumps
 *  2. Pure single-profile win (Polarisation), no bumps
 *  3. Strength Gap with a distant Under-recovered runner-up
 *  4. Fueling Deficit with runner-up outside the 1-point window
 *  5. Severe multi-system — tie-break selects UR, severeMultiSystem fires
 */

describe("scoreDiagnostic — Appendix A fixtures", () => {
  it("Fixture 1: classic Under-recovered", () => {
    const answers: Answers = {
      age: "45-54",
      hoursPerWeek: "9-12",
      ftp: 285,
      goal: "Etape du Tour 2026",
      Q1: 3, Q2: 3, Q3: 3,
      Q4: 1, Q5: 1, Q6: 1,
      Q7: 1, Q8: 3, Q9: 1,
      Q10: 1, Q11: 1, Q12: 3,
      Q13: "Legs just feel heavy all the time. Used to bounce back in a day.",
    };
    const result = scoreDiagnostic(answers);
    // Direct UR sum = 9, plus +1 from Q8 (significantly down sprint) and
    // +1 from Q12 (wrecked next day) = 11.
    expect(result.scores.underRecovered).toBe(11);
    expect(result.primary).toBe("underRecovered");
    expect(result.secondary).toBeNull();
    expect(result.severeMultiSystem).toBe(false);
    expect(result.closeToBreakthrough).toBe(false);
  });

  it("Fixture 2: pure Polarisation Failure", () => {
    const answers: Answers = {
      age: "35-44",
      hoursPerWeek: "9-12",
      ftp: 310,
      goal: "Cat 2 upgrade",
      Q1: 1, Q2: 1, Q3: 1,
      Q4: 3, Q5: 3, Q6: 3,
      Q7: 2, Q8: 1, Q9: 1,
      Q10: 0, Q11: 0, Q12: 1,
      Q13: "Every ride turns into a race. Can't seem to go easy.",
    };
    const result = scoreDiagnostic(answers);
    expect(result.scores.polarisation).toBe(9);
    expect(result.primary).toBe("polarisation");
    expect(result.secondary).toBeNull();
    expect(result.severeMultiSystem).toBe(false);
  });

  it("Fixture 3: Strength Gap with distant Under-recovered", () => {
    const answers: Answers = {
      age: "55-64",
      hoursPerWeek: "5-8",
      ftp: 240,
      goal: "Not getting dropped on the Saturday group ride",
      Q1: 1, Q2: 2, Q3: 1,
      Q4: 0, Q5: 0, Q6: 1,
      Q7: 3, Q8: 3, Q9: 3,
      Q10: 1, Q11: 1, Q12: 1,
      Q13: "",
    };
    const result = scoreDiagnostic(answers);
    expect(result.scores.strengthGap).toBe(9);
    expect(result.primary).toBe("strengthGap");
    // UR sits at 5 (direct 4 from Q1+Q2+Q3, +1 cross from Q8). More
    // than 1 off SG, so no secondary note.
    expect(result.secondary).toBeNull();
  });

  it("Fixture 4: Fueling Deficit, secondary outside window", () => {
    const answers: Answers = {
      age: "45-54",
      hoursPerWeek: "9-12",
      ftp: 265,
      goal: "General fitness + drop 4kg",
      Q1: 1, Q2: 2, Q3: 2,
      Q4: 1, Q5: 1, Q6: 1,
      Q7: 1, Q8: 1, Q9: 1,
      Q10: 3, Q11: 3, Q12: 3,
    };
    const result = scoreDiagnostic(answers);
    // F = 9 direct + 1 cross from Q2 = 10.
    expect(result.scores.fuelingDeficit).toBe(10);
    expect(result.primary).toBe("fuelingDeficit");
    // UR = 5 direct (1+2+2) + 1 cross from Q12 = 6. 10-6 = 4, outside
    // the 1-point window — so secondary must be null.
    expect(result.scores.underRecovered).toBe(6);
    expect(result.secondary).toBeNull();
  });

  it("Fixture 5: severe multi-system — tie-break selects Under-recovered", () => {
    const answers: Answers = {
      age: "45-54",
      hoursPerWeek: "5-8",
      ftp: 230,
      goal: "Just want to feel good again",
      Q1: 2, Q2: 3, Q3: 3,
      Q4: 2, Q5: 2, Q6: 2,
      Q7: 2, Q8: 2, Q9: 2,
      Q10: 2, Q11: 2, Q12: 2,
      Q13: "Honestly I don't know what's wrong. Everything feels off.",
    };
    const result = scoreDiagnostic(answers);
    // UR = 8 direct + 1 cross from Q12 = 9 (the highest).
    expect(result.scores.underRecovered).toBe(9);
    expect(result.primary).toBe("underRecovered");
    // Every profile is at 6 or above — flip the severeMultiSystem
    // switch so downstream CTA routing forces a direct call booking.
    expect(result.severeMultiSystem).toBe(true);
  });
});

describe("scoreDiagnostic — edge cases from §8", () => {
  it("flags closeToBreakthrough when every profile scores under 3", () => {
    const answers: Answers = {
      age: "45-54",
      hoursPerWeek: "5-8",
      Q1: 0, Q2: 0, Q3: 1,
      Q4: 1, Q5: 0, Q6: 0,
      Q7: 0, Q8: 0, Q9: 1,
      Q10: 0, Q11: 1, Q12: 0,
    };
    const result = scoreDiagnostic(answers);
    expect(result.closeToBreakthrough).toBe(true);
    expect(result.severeMultiSystem).toBe(false);
    // With no profile reaching 3, the tie-break chain still puts
    // Under-recovered on top — that's deliberate. Callers swap the
    // rendered content, not the profile assignment.
    expect(result.primary).toBe("underRecovered");
  });

  it("tie-breaks in documented order when two profiles tie", () => {
    // Construct a case where Polarisation and Strength Gap both end
    // at the highest score. Per TIE_BREAK_ORDER, Polarisation wins
    // because it sits higher in the priority list (polarisation is
    // index 2, strengthGap is index 3).
    const answers: Answers = {
      age: "35-44",
      hoursPerWeek: "9-12",
      Q1: 0, Q2: 0, Q3: 0,
      Q4: 3, Q5: 2, Q6: 1,   // POL = 6
      Q7: 3, Q8: 2, Q9: 1,   // SG = 6 (Q8=2 has no cross to UR)
      Q10: 0, Q11: 0, Q12: 0,
    };
    const result = scoreDiagnostic(answers);
    expect(result.scores.polarisation).toBe(6);
    expect(result.scores.strengthGap).toBe(6);
    expect(result.primary).toBe("polarisation");
    expect(result.secondary).toBe("strengthGap");
  });

  it("flags secondary when runner-up is exactly 1 point behind", () => {
    const answers: Answers = {
      age: "45-54",
      hoursPerWeek: "9-12",
      // UR direct 6, no crosses because Q2=0. POL direct 5.
      Q1: 3, Q2: 0, Q3: 3,
      Q4: 2, Q5: 2, Q6: 1,
      Q7: 0, Q8: 0, Q9: 0,
      Q10: 0, Q11: 0, Q12: 0,
    };
    const result = scoreDiagnostic(answers);
    expect(result.scores.underRecovered).toBe(6);
    expect(result.scores.polarisation).toBe(5);
    expect(result.primary).toBe("underRecovered");
    expect(result.secondary).toBe("polarisation");
  });
});
