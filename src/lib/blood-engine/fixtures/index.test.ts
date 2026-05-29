import { describe, expect, it } from "vitest";
import { isValidMarkerId } from "../markers";
import { validateContext, validateRawResults } from "../schemas";
import { FIXTURES, getFixture } from "./index";

/**
 * Lightweight guards: every fixture must be a valid input to runInterpretation,
 * and every expectation must reference real marker ids.
 *
 * This does NOT call the LLM — those checks live in
 * `scripts/blood-engine/replay-fixtures.ts` so we don't burn API credits in CI.
 */
describe("blood-engine/fixtures", () => {
  it("ships at least 6 fixtures covering the prototypical patterns", () => {
    expect(FIXTURES.length).toBeGreaterThanOrEqual(6);
  });

  it("every fixture has a unique id", () => {
    const ids = new Set(FIXTURES.map((f) => f.id));
    expect(ids.size).toBe(FIXTURES.length);
  });

  it.each(FIXTURES.map((f) => [f.id, f]))(
    "fixture %s passes validateContext + validateRawResults",
    (_id, fixture) => {
      expect(() => validateContext(fixture.context)).not.toThrow();
      expect(() => validateRawResults(fixture.results)).not.toThrow();
      expect(fixture.results.length).toBeGreaterThan(0);
    }
  );

  it.each(FIXTURES.map((f) => [f.id, f]))(
    "fixture %s expectation marker ids reference real markers",
    (_id, fixture) => {
      for (const m of fixture.expectations.suboptimalOrFlaggedMarkers ?? []) {
        expect(isValidMarkerId(m), `${fixture.id}: ${m}`).toBe(true);
      }
      for (const m of fixture.expectations.optimalMarkers ?? []) {
        expect(isValidMarkerId(m), `${fixture.id}: ${m}`).toBe(true);
      }
    }
  );

  it("getFixture throws on unknown id", () => {
    expect(() => getFixture("does-not-exist")).toThrow();
  });
});
