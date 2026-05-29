import { describe, expect, it } from "vitest";
import {
  INTERPRETATION_SYSTEM_PROMPT,
  PROMPT_VERSION,
} from "./interpretation-prompt";

/**
 * The interpretation prompt IS the product. Any edit should be intentional and
 * should come with a PROMPT_VERSION bump so old reports keep their history.
 *
 * These are lightweight structural guards — not a full snapshot — so trivial
 * copy tweaks don't force a version bump, but changes to the JSON contract or
 * ranges table DO.
 */
describe("blood-engine/interpretation-prompt", () => {
  it("has a versioned date string", () => {
    expect(PROMPT_VERSION).toMatch(/^v\d+-\d{4}-\d{2}-\d{2}$/);
  });

  it("mentions every one of the 8 interpretation rule anchors", () => {
    const anchors = [
      "ferritin", // rule 1
      "Under-fuelling signature", // rule 2
      "Exercise-Hypogonadal", // rule 3
      "CK elevated in isolation", // rule 4
      "plasma volume expansion", // rule 5
      "NEVER suggest iron supplementation", // rule 6
      "Overtraining triad", // rule 7
      "age, sex, training hours", // rule 8
    ];
    for (const a of anchors) {
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain(a);
    }
  });

  it("specifies the exact JSON output schema top-level keys", () => {
    const requiredKeys = [
      '"overall_status"',
      '"summary"',
      '"markers"',
      '"detected_patterns"',
      '"action_plan"',
      '"retest_recommendation"',
      '"medical_disclaimer"',
    ];
    for (const k of requiredKeys) {
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain(k);
    }
  });

  it("embeds the canonical disclaimer verbatim", () => {
    expect(INTERPRETATION_SYSTEM_PROMPT).toContain(
      "Blood Engine is an educational tool for cyclists"
    );
  });

  it("instructs: return only JSON, no markdown fences", () => {
    expect(INTERPRETATION_SYSTEM_PROMPT).toMatch(/no markdown/i);
    expect(INTERPRETATION_SYSTEM_PROMPT).toMatch(/Output JSON only/i);
  });
});
