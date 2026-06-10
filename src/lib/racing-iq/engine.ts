import type {
  Availability,
  DecisionOption,
  GameState,
  Outcome,
  Scenario,
  TraitDeltas,
} from "./types";

/**
 * Racing IQ — chaining engine.
 *
 * Pure functions only: state in, state out. The React layer owns
 * sequencing and presentation; this module owns the rules. Scenario
 * packs are injected, never imported, so weekly stages can swap
 * content without touching this file.
 */

export const STARTING_MATCHES = 5;

export function createInitialState(): GameState {
  return {
    matches: STARTING_MATCHES,
    position: "bunch",
    slot: "mid",
    fuel: false,
    groupTrust: 0,
    scenarioIndex: 0,
    decisions: [],
    axes: { nous: 0, match: 0, self: 0 },
    traits: { attack: 0, work: 0, conserve: 0, discipline: 0 },
    bonked: false,
  };
}

/**
 * Run a scenario's entry hook (deferred consequences like the bonk).
 * Returns the possibly-mutated state plus an optional notice to show
 * before the setup copy.
 */
export function enterScenario(
  scenario: Scenario,
  state: GameState
): { state: GameState; notice?: string } {
  if (!scenario.onEnter) return { state };
  return scenario.onEnter(state);
}

export interface ResolvedOption {
  option: DecisionOption;
  availability: Availability;
}

/** Default availability: you can't spend matches you don't have. */
function defaultAvailability(option: DecisionOption, state: GameState): Availability {
  if (option.cost > state.matches) {
    return {
      available: false,
      reason:
        option.cost === 1
          ? "That needs a match. The box is empty."
          : `That needs ${option.cost} matches. You have ${state.matches}.`,
    };
  }
  return { available: true };
}

export function resolveOptions(
  scenario: Scenario,
  state: GameState
): ResolvedOption[] {
  return scenario.options.map((option) => ({
    option,
    availability: option.availability
      ? option.availability(state)
      : defaultAvailability(option, state),
  }));
}

function addTraits(
  base: Required<TraitDeltas>,
  extra: TraitDeltas | undefined
): Required<TraitDeltas> {
  if (!extra) return base;
  return {
    attack: base.attack + (extra.attack ?? 0),
    work: base.work + (extra.work ?? 0),
    conserve: base.conserve + (extra.conserve ?? 0),
    discipline: base.discipline + (extra.discipline ?? 0),
  };
}

export interface DecisionResolution {
  state: GameState;
  outcome: Outcome;
  /** Matches burned by this decision (after clamping). */
  burned: number;
}

/**
 * Apply a chosen option to state. Caller must only pass options that
 * resolved as available; this still clamps defensively.
 */
export function applyDecision(
  scenario: Scenario,
  optionId: string,
  state: GameState
): DecisionResolution {
  const option = scenario.options.find((o) => o.id === optionId);
  if (!option) {
    throw new Error(`Unknown option "${optionId}" in scenario "${scenario.id}"`);
  }

  const outcome = option.outcome(state);
  const burn = Math.max(0, outcome.delta.burn ?? 0);
  const matchesAfter = Math.max(0, state.matches - burn);
  const bonus = outcome.axesBonus ?? {};

  const next: GameState = {
    ...state,
    matches: matchesAfter,
    position: outcome.delta.position ?? state.position,
    slot: outcome.delta.slot ?? state.slot,
    fuel: outcome.delta.fuel ?? state.fuel,
    groupTrust: Math.max(
      -2,
      Math.min(2, state.groupTrust + (outcome.delta.groupTrust ?? 0))
    ),
    axes: {
      nous: state.axes.nous + option.axes.nous + (bonus.nous ?? 0),
      match: state.axes.match + option.axes.match + (bonus.match ?? 0),
      self: state.axes.self + option.axes.self + (bonus.self ?? 0),
    },
    traits: addTraits(state.traits, option.traits),
    decisions: [
      ...state.decisions,
      {
        scenarioId: scenario.id,
        optionId,
        matchesBefore: state.matches,
        matchesAfter,
      },
    ],
  };

  return { state: next, outcome, burned: state.matches - matchesAfter };
}

export function advance(state: GameState): GameState {
  return { ...state, scenarioIndex: state.scenarioIndex + 1 };
}
