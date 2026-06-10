import { describe, expect, it } from "vitest";
import {
  advance,
  applyDecision,
  createInitialState,
  enterScenario,
  resolveOptions,
} from "./engine";
import { GATE_AFTER_INDEX, SCENARIOS } from "./scenarios";
import { scoreGame } from "./scoring";
import type { GameState } from "./types";

function scenario(id: string) {
  const s = SCENARIOS.find((s) => s.id === id);
  if (!s) throw new Error(`missing scenario ${id}`);
  return s;
}

/** Play through the race choosing by option id (falls back to first available). */
function playThrough(choices: Record<string, string>): GameState {
  let state = createInitialState();
  for (const s of SCENARIOS) {
    state = enterScenario(s, state).state;
    const resolved = resolveOptions(s, state);
    const wanted = choices[s.id];
    const pick =
      resolved.find((r) => r.option.id === wanted && r.availability.available) ??
      resolved.find((r) => r.availability.available);
    if (!pick) throw new Error(`no available option in ${s.id}`);
    state = advance(applyDecision(s, pick.option.id, state).state);
  }
  return state;
}

describe("racing-iq scenario pack", () => {
  it("ships seven scenarios with the gate after the third", () => {
    expect(SCENARIOS).toHaveLength(7);
    expect(GATE_AFTER_INDEX).toBe(2);
  });

  it("never lets matches go negative and always leaves an available option", () => {
    // Burn maximally at every decision.
    let state = createInitialState();
    for (const s of SCENARIOS) {
      state = enterScenario(s, state).state;
      const available = resolveOptions(s, state).filter((r) => r.availability.available);
      expect(available.length).toBeGreaterThan(0);
      const priciest = available.sort((a, b) => b.option.cost - a.option.cost)[0];
      state = advance(applyDecision(s, priciest.option.id, state).state);
      expect(state.matches).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("the fuel chain (scenario 4 → scenario 6)", () => {
  it("skipping the gel triggers the bonk: surge greyed out, a match gone, different copy", () => {
    let state = createInitialState();
    // Conservative opening so matches aren't the limiting factor.
    state = advance(applyDecision(scenario("early-break"), "wait", state).state);
    state = advance(applyDecision(scenario("pull-through"), "confront", state).state);
    state = advance(applyDecision(scenario("crosswind"), "fight-position", state).state);
    const skipped = advance(applyDecision(scenario("fuel-call"), "skip-gel", state).state);
    const fuelled = advance(applyDecision(scenario("fuel-call"), "eat-now", state).state);

    const climb = scenario("final-climb");

    // Skipped: bonk notice fires, match deducted, surge unavailable.
    const afterDescentSkipped = advance(
      applyDecision(scenario("descent"), "smooth", skipped).state
    );
    const bonkEntry = enterScenario(climb, afterDescentSkipped);
    expect(bonkEntry.notice).toBeTruthy();
    expect(bonkEntry.state.bonked).toBe(true);
    expect(bonkEntry.state.matches).toBe(afterDescentSkipped.matches - 1);
    const surge = resolveOptions(climb, bonkEntry.state).find(
      (r) => r.option.id === "follow-surge"
    )!;
    expect(surge.availability.available).toBe(false);

    // Fuelled: no notice, surge on the table.
    const afterDescentFuelled = advance(
      applyDecision(scenario("descent"), "smooth", fuelled).state
    );
    const cleanEntry = enterScenario(climb, afterDescentFuelled);
    expect(cleanEntry.notice).toBeUndefined();
    expect(cleanEntry.state.bonked).toBe(false);
    const surgeClean = resolveOptions(climb, cleanEntry.state).find(
      (r) => r.option.id === "follow-surge"
    )!;
    expect(surgeClean.availability.available).toBe(true);

    // Outcome copy differs on the same option.
    const bonkedOutcome = applyDecision(climb, "threshold", bonkEntry.state).outcome.text;
    const cleanOutcome = applyDecision(climb, "threshold", cleanEntry.state).outcome.text;
    expect(bonkedOutcome).not.toEqual(cleanOutcome);
  });
});

describe("position and trust chains", () => {
  it("losing the echelon sets up the descent as a chase, and smooth riding closes it", () => {
    let state = createInitialState();
    state = advance(applyDecision(scenario("early-break"), "wait", state).state);
    state = advance(applyDecision(scenario("pull-through"), "accept", state).state);
    state = advance(applyDecision(scenario("crosswind"), "wait-regroup", state).state);
    expect(state.position).toBe("chasing");
    expect(scenario("descent").setup(state)).toMatch(/way back/i);
    state = advance(applyDecision(scenario("fuel-call"), "eat-now", state).state);
    state = applyDecision(scenario("descent"), "smooth", state).state;
    expect(state.position).toBe("bunch");
  });

  it("groupTrust earned at the rotation pays out in the finale copy", () => {
    const trusted = playThrough({
      "early-break": "wait",
      "pull-through": "confront",
      "crosswind": "fight-position",
      "fuel-call": "eat-now",
      "descent": "smooth",
      "final-climb": "threshold",
      "finale": "lead-out-surf",
    });
    expect(trusted.groupTrust).toBe(1);
    const finale = scenario("finale");
    const setupTrusted = finale.setup({ ...trusted, groupTrust: 1 });
    const setupBurned = finale.setup({ ...trusted, groupTrust: -1 });
    expect(setupTrusted).not.toEqual(setupBurned);
  });
});

describe("scoring", () => {
  it("scores the disciplined line high and maps it to a sensible archetype", () => {
    const state = playThrough({
      "early-break": "wait",
      "pull-through": "confront",
      "crosswind": "fight-position",
      "fuel-call": "eat-now",
      "descent": "smooth",
      "final-climb": "threshold",
      "finale": "long-attack",
    });
    const result = scoreGame(state, SCENARIOS);
    expect(result.axes.nous).toBeGreaterThanOrEqual(85);
    expect(result.axes.match).toBeGreaterThanOrEqual(80);
    expect(result.axes.self).toBeGreaterThanOrEqual(80);
    expect(result.archetype.id).toBeTruthy();
  });

  it("an all-attack ride lands on The Kamikaze", () => {
    const state = playThrough({
      "early-break": "bridge",
      "pull-through": "attack-group",
      "crosswind": "gutter-grind",
      "fuel-call": "skip-gel",
      "descent": "send-it",
      "final-climb": "follow-surge",
      "finale": "long-attack",
    });
    const result = scoreGame(state, SCENARIOS);
    expect(result.archetype.id).toBe("kamikaze");
  });

  it("axes always land within 0–100 for arbitrary play", () => {
    const state = playThrough({});
    const { axes } = scoreGame(state, SCENARIOS);
    for (const v of [axes.nous, axes.match, axes.self]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });
});
