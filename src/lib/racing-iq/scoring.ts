import { ARCHETYPES } from "./archetypes";
import type { ArchetypeDef, GameState, GameResult, Scenario } from "./types";

/**
 * Racing IQ — scoring and archetype mapping.
 *
 * Axis scores normalise the player's accumulated points against the
 * best obtainable line through the supplied scenario pack, so swapping
 * packs never breaks the 0–100 scale. There are no right/wrong grades —
 * the floor keeps even a chaotic ride off zero.
 */

const FLOOR = 18; // nobody who finished the race scores below this

function maxPerAxis(scenarios: Scenario[]): { nous: number; match: number; self: number } {
  const max = { nous: 0, match: 0, self: 0 };
  for (const scenario of scenarios) {
    max.nous += Math.max(...scenario.options.map((o) => o.axes.nous));
    max.match += Math.max(...scenario.options.map((o) => o.axes.match));
    max.self += Math.max(...scenario.options.map((o) => o.axes.self));
  }
  return max;
}

function normalise(earned: number, max: number): number {
  if (max <= 0) return FLOOR;
  const pct = Math.round((earned / max) * 100);
  return Math.max(FLOOR, Math.min(100, pct));
}

export function scoreAxes(
  state: GameState,
  scenarios: Scenario[]
): GameResult["axes"] {
  const max = maxPerAxis(scenarios);
  return {
    nous: normalise(state.axes.nous, max.nous),
    match: normalise(state.axes.match, max.match),
    self: normalise(state.axes.self, max.self),
  };
}

function chose(state: GameState, optionId: string): boolean {
  return state.decisions.some((d) => d.optionId === optionId);
}

/**
 * Archetype selection: signature behaviour patterns first (they make
 * the result feel seen), axis-dominance fallback second (guarantees a
 * verdict for every line through the race).
 */
export function pickArchetype(
  state: GameState,
  axes: GameResult["axes"]
): ArchetypeDef {
  const { traits } = state;

  // Struck everything, early and often.
  if (traits.attack >= 3 || (state.matches === 0 && traits.attack >= 2)) {
    return ARCHETYPES.kamikaze;
  }

  // Never hit the wind, never spent, let the freeloader slide.
  if (
    traits.work === 0 &&
    traits.attack === 0 &&
    traits.conserve >= 3 &&
    chose(state, "accept")
  ) {
    return ARCHETYPES.wheelsucker;
  }

  // Followed the climb surge, then waited for a 200m sprint.
  if (chose(state, "follow-surge") && chose(state, "wheels-200")) {
    return ARCHETYPES.puncheur;
  }

  // Disciplined spender: plan-driven, efficient, allergic to flyers.
  if (axes.match >= 75 && axes.self >= 70 && traits.attack <= 1 && traits.discipline >= 3) {
    return ARCHETYPES.calculator;
  }

  // Race-reader who polices the group and rides the front honestly.
  if (axes.nous >= 70 && (traits.work >= 1 || chose(state, "confront"))) {
    return ARCHETYPES.captain;
  }

  // Steady-state engine: threshold over surges, sustained over snap.
  if (chose(state, "threshold") && traits.attack <= 1) {
    return ARCHETYPES.diesel;
  }

  // Fallback by dominant axis.
  const top = Math.max(axes.nous, axes.match, axes.self);
  if (top === axes.nous) return ARCHETYPES.captain;
  if (top === axes.match) return ARCHETYPES.calculator;
  return ARCHETYPES.diesel;
}

export function scoreGame(state: GameState, scenarios: Scenario[]): GameResult {
  const axes = scoreAxes(state, scenarios);
  return { axes, archetype: pickArchetype(state, axes) };
}
