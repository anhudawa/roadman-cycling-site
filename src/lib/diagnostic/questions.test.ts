import { describe, expect, it } from "vitest";
import { QUESTIONS } from "./questions";
import { PROFILES } from "./types";

/**
 * Invariants the question bank has to hold. If any of these fail
 * the diagnostic either scores wrong, renders wrong, or can't be
 * edited without breaking downstream code. Cheap to verify, worth
 * running every test cycle.
 */

describe("QUESTIONS", () => {
  it("has exactly 12 scored questions", () => {
    expect(QUESTIONS).toHaveLength(12);
  });

  it("uses unique Q-keys", () => {
    const keys = QUESTIONS.map((q) => q.key);
    const uniq = new Set(keys);
    expect(uniq.size).toBe(keys.length);
    expect(keys).toEqual([
      "Q1",
      "Q2",
      "Q3",
      "Q4",
      "Q5",
      "Q6",
      "Q7",
      "Q8",
      "Q9",
      "Q10",
      "Q11",
      "Q12",
    ]);
  });

  it("assigns exactly 3 questions to each profile", () => {
    const perProfile: Record<string, number> = {};
    for (const q of QUESTIONS) {
      perProfile[q.primary] = (perProfile[q.primary] ?? 0) + 1;
    }
    for (const profile of PROFILES) {
      expect(perProfile[profile], profile).toBe(3);
    }
  });

  it("gives every question exactly 4 options", () => {
    for (const q of QUESTIONS) {
      expect(q.options, q.key).toHaveLength(4);
    }
  });

  it("keeps option ids unique inside each question", () => {
    for (const q of QUESTIONS) {
      const ids = q.options.map((o) => o.id);
      const uniq = new Set(ids);
      expect(uniq.size, q.key).toBe(ids.length);
    }
  });

  it("restricts option values to 0, 1, 2, 3", () => {
    for (const q of QUESTIONS) {
      for (const opt of q.options) {
        expect([0, 1, 2, 3], `${q.key}:${opt.id}`).toContain(opt.value);
      }
    }
  });

  it("includes at least one option per value on each question", () => {
    // Every question should offer a 0 (best case) and a 3 (worst
    // case) $€” otherwise the scoring collapses.
    for (const q of QUESTIONS) {
      const values = new Set(q.options.map((o) => o.value));
      expect(values.has(0), `${q.key} missing a 0 option`).toBe(true);
      expect(values.has(3), `${q.key} missing a 3 option`).toBe(true);
    }
  });

  it("only references valid profiles in crossScores", () => {
    const profileSet = new Set<string>(PROFILES);
    for (const q of QUESTIONS) {
      for (const opt of q.options) {
        if (!opt.crossScores) continue;
        for (const [key, bump] of Object.entries(opt.crossScores)) {
          expect(profileSet.has(key), `${q.key}:${opt.id} cross ${key}`).toBe(true);
          expect(typeof bump, `${q.key}:${opt.id} bump type`).toBe("number");
        }
      }
    }
  });

  it("does not apply a crossScore to a question's own primary profile", () => {
    // A crossScore onto the primary would just amount to a stealth
    // score bump on top of the declared value. Forbid so the primary
    // score stays transparent and equal to the option's value.
    for (const q of QUESTIONS) {
      for (const opt of q.options) {
        if (!opt.crossScores) continue;
        expect(
          q.primary in opt.crossScores,
          `${q.key}:${opt.id} cross-scored its own primary ${q.primary}`
        ).toBe(false);
      }
    }
  });
});
