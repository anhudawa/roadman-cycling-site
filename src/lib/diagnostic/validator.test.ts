import { describe, expect, it } from "vitest";
import { validateBreakdown } from "./validator";
import type { Breakdown } from "./types";
import { PROFILE_BREAKDOWNS } from "./profiles";

function pad(text: string, target: number): string {
  // Pad to a target word count by appending filler so we can isolate
  // each validator rule. Filler uses plain words so it never itself
  // trips a banned-phrase match.
  const current = text.trim().split(/\s+/).length;
  if (current >= target) return text;
  const filler = Array(target - current).fill("cycling").join(" ");
  return `${text} ${filler}`;
}

function baseBreakdown(overrides: Partial<Breakdown> = {}): Breakdown {
  const base: Breakdown = {
    headline: "Short punchy headline",
    diagnosis: "A short diagnosis paragraph that commits to the profile.",
    whyThisIsHappening: "Two paragraphs of explanation.",
    whatItsCosting: "One paragraph on the cost.",
    fix: [
      { step: 1, title: "Step one", detail: "Do this specific thing first." },
      { step: 2, title: "Step two", detail: "Then this concrete action." },
      { step: 3, title: "Step three", detail: "Finally, track HRV trends." },
    ],
    whyAlone: "A short paragraph explaining why this is hard to do alone.",
    nextMove: "Book a 15-minute call.",
    secondaryNote: null,
    ...overrides,
  };
  // Pad the long body paragraph so we hit the 500-word floor without
  // also tripping any banned-phrase checks.
  base.whyThisIsHappening = pad(base.whyThisIsHappening, 480);
  return base;
}

describe("validateBreakdown", () => {
  it("passes a well-formed breakdown", () => {
    const result = validateBreakdown(baseBreakdown());
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it("flags banned phrases from Appendix B", () => {
    const result = validateBreakdown(
      baseBreakdown({
        nextMove: "Unlock your potential and crush it. Your journey starts today.",
      })
    );
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain("banned_phrase");
    // Three separate banned phrases in that sentence.
    expect(result.failures.filter((f) => f.code === "banned_phrase").length).toBeGreaterThanOrEqual(3);
  });

  it("rejects headlines longer than 10 words", () => {
    const result = validateBreakdown(
      baseBreakdown({
        headline: "This headline is deliberately far too long to pass the ten word limit easily",
      })
    );
    expect(result.failures.some((f) => f.code === "headline_too_long")).toBe(true);
  });

  it("rejects a fix array with the wrong number of items", () => {
    const result = validateBreakdown(
      baseBreakdown({
        fix: [
          { step: 1, title: "Only", detail: "One step here." },
          { step: 2, title: "Two", detail: "Two steps." },
        ] as unknown as Breakdown["fix"],
      })
    );
    expect(result.failures.some((f) => f.code === "wrong_fix_count")).toBe(true);
  });

  it("rejects short outputs under the 500 word floor", () => {
    const result = validateBreakdown({
      headline: "Too short",
      diagnosis: "tiny",
      whyThisIsHappening: "tiny",
      whatItsCosting: "tiny",
      fix: [
        { step: 1, title: "A", detail: "a" },
        { step: 2, title: "B", detail: "b" },
        { step: 3, title: "C", detail: "c" },
      ],
      whyAlone: "tiny",
      nextMove: "tiny",
      secondaryNote: null,
    });
    expect(result.failures.some((f) => f.code === "word_count")).toBe(true);
  });

  it("allows 'optimise' when paired with a specific noun in the same sentence", () => {
    const result = validateBreakdown(
      baseBreakdown({
        whatItsCosting:
          "You've failed to optimise your zone 2 work for months on end.",
      })
    );
    expect(result.failures.some((f) => f.code === "banned_phrase")).toBe(false);
  });

  it("blocks 'optimise' when used generically", () => {
    const result = validateBreakdown(
      baseBreakdown({
        whatItsCosting:
          "You need to optimise your training properly over the coming weeks.",
      })
    );
    expect(
      result.failures.some(
        (f) => f.code === "banned_phrase" && f.detail.includes("optimise")
      )
    ).toBe(true);
  });

  it("passes every static §9 fallback breakdown", () => {
    // These ship to users when Claude fails — they must always pass
    // validation themselves. Note: because the static templates are
    // intentionally tight, they land under the 500-word floor. The
    // fallback path bypasses validation, but we still want structural
    // checks (headline length, fix count, banned phrases) to be clean.
    for (const [profile, breakdown] of Object.entries(PROFILE_BREAKDOWNS)) {
      const result = validateBreakdown(breakdown);
      const nonWordCountFailures = result.failures.filter(
        (f) => f.code !== "word_count"
      );
      expect(
        nonWordCountFailures,
        `${profile}: ${JSON.stringify(nonWordCountFailures)}`
      ).toEqual([]);
    }
  });
});
