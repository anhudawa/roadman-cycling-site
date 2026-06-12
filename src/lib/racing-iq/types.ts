/**
 * Racing IQ — core types.
 *
 * The engine is generic and data-driven: scenarios are typed config
 * (see scenarios.ts) and the engine (engine.ts) only knows how to
 * resolve options against state and apply outcomes. Weekly "stage
 * packs" can swap the scenario array without touching engine code.
 */

/** Where the player sits in the race at any given moment. */
export type Position = "bunch" | "break" | "chasing" | "dropped";

/** Placement inside the player's current group. */
export type Slot = "front" | "mid" | "back";

/** The three scored axes. Values accumulate as raw points and are
 * normalised to 0–100 at the end (see scoring.ts). */
export interface AxisDeltas {
  /** Did you read the race? */
  nous: number;
  /** Did you spend energy where it bought something? */
  match: number;
  /** Did you ride your race or someone else's? */
  self: number;
}

/** Behavioural traits tallied for archetype mapping. */
export interface TraitDeltas {
  /** Out-of-the-saddle aggression: bridges, attacks, launches. */
  attack?: number;
  /** Honest work on the front: chases, pulls, turns taken. */
  work?: number;
  /** Cost-zero, shelter-first choices. */
  conserve?: number;
  /** Followed the plan: fueling, threshold discipline. */
  discipline?: number;
}

export interface GameState {
  /** Matches remaining, 0–5. The core resource. */
  matches: number;
  position: Position;
  slot: Slot;
  /** Did the player fuel at scenario 4? Read by scenario 6. */
  fuel: boolean;
  /** Cooperation credit with the group, -2..+2. Read by later outcome text. */
  groupTrust: number;
  /** Index of the scenario the player is currently on (0-based). */
  scenarioIndex: number;
  decisions: DecisionRecord[];
  axes: AxisDeltas;
  traits: Required<TraitDeltas>;
  /** Set true when the deferred bonk has been applied (scenario 6 entry). */
  bonked: boolean;
}

export interface DecisionRecord {
  scenarioId: string;
  optionId: string;
  matchesBefore: number;
  matchesAfter: number;
}

/** Mutation an outcome applies to hidden state. */
export interface StateDelta {
  /** Matches to burn (positive number = spent). Clamped at 0. */
  burn?: number;
  position?: Position;
  slot?: Slot;
  fuel?: boolean;
  groupTrust?: number; // additive
}

export interface Outcome {
  /** Resolution copy shown after the decision lands. */
  text: string;
  delta: StateDelta;
  /** Extra axis adjustment on top of the option's static axes —
   * used for state-dependent consequences (e.g. bonk penalties).
   * Never raises the per-scenario maximum, only the earned total. */
  axesBonus?: Partial<AxisDeltas>;
}

/** Availability verdict for an option under current state. */
export type Availability =
  | { available: true }
  | { available: false; reason: string };

export interface DecisionOption {
  id: string;
  /** Short imperative label, e.g. "Bridge across now". */
  label: string;
  /** One supporting sentence under the label. */
  detail: string;
  /** Matches this option burns. Shown on the option chip. */
  cost: number;
  /** Static axis points used for both earned score and per-axis maxima. */
  axes: AxisDeltas;
  traits?: TraitDeltas;
  /** State-dependent availability. Default: available when matches >= cost. */
  availability?: (s: GameState) => Availability;
  outcome: (s: GameState) => Outcome;
}

export type Environment = "valley" | "plain" | "forest" | "town";

export interface ExpertSlot {
  /** Lead-in line, e.g. "We put this exact situation to …". */
  prompt: string;
  /** Placeholder until Anthony supplies real archive quotes. */
  quote: string;
  attribution: string;
}

export interface Scenario {
  id: string;
  /** 1-based act number, drives world environment + lighting. */
  act: number;
  km: number;
  title: string;
  /** Broadcast strapline above the title. */
  kicker: string;
  environment: Environment;
  /** 0 = cold morning, 1 = golden-hour finale. */
  timeOfDay: number;
  /** Narrative setup. Receives state so copy can react to the chain. */
  setup: (s: GameState) => string;
  /** Race-radio captions shown during the riding interlude before the
   * decision freezes — broadcast commentary register, 2–3 lines. */
  radio: string[];
  options: DecisionOption[];
  /** The tactical principle, shown with the expert card. */
  teaches: string;
  expert: ExpertSlot;
  /** Optional hook run when the scenario starts (deferred consequences,
   * e.g. the bonk arriving at scenario 6 if fuel was skipped). */
  onEnter?: (s: GameState) => { state: GameState; notice?: string };
}

export interface ArchetypeDef {
  id: string;
  name: string;
  /** One-line roast. */
  roast: string;
  strength: string;
  weakness: string;
}

export interface GameResult {
  axes: { nous: number; match: number; self: number }; // 0–100
  archetype: ArchetypeDef;
}
