/**
 * Roadman Fantasy Tour — game configuration.
 *
 * Every numeric rule in the game lives here as a launch default and is
 * overridable per-key from the fantasy_game_config table (admin panel →
 * no deploy needed to tune). Scoring and validation NEVER hardcode a
 * number — they read this object, which is also what makes the scoring
 * engine recomputable: re-running a stage with the same config and the
 * same raw results always produces the same events.
 */

export interface FantasyGameConfig {
  /** Total credits to spend on 8 riders. */
  budget: number;
  squadSize: number;
  /** Max riders from any one real pro team. */
  maxPerProTeam: number;
  /** Forces depth picks: at least `count` riders priced ≤ `maxPrice`. */
  minCheapRiders: { count: number; maxPrice: number };

  /** Transfers across the whole Tour (grace + rest-day bonuses excluded). */
  transfersTotal: number;
  /** Max transfers between any two stages. */
  transfersPerStage: number;
  /** Extra free transfers unlocked on each rest day. */
  restDayBonusTransfers: number;
  /**
   * Rest-day bonus transfers don't count against the per-stage cap —
   * the unlock IS the allowance. Toggleable in case Anthony disagrees.
   */
  restDayBonusExemptFromStageCap: boolean;

  /** Stage-finish points, index 0 = 1st place. 20 entries. */
  stageFinishPoints: number[];
  /**
   * Stage 1 TTT: when official results publish individual rider times,
   * score each rider on his individual position at `tttFactor` of the
   * stage-finish table. When false, fall back to per-team points.
   */
  tttIndividualTimes: boolean;
  tttFactor: number;
  /** Fallback: points per rider by his team's TTT position, index 0 = winning team. */
  tttTeamFallbackPoints: number[];

  /** Daily points to each jersey holder after the stage. */
  jerseyDailyPoints: { yellow: number; green: number; polkaDot: number; white: number };

  /** Final classification after Stage 21, index 0 = 1st. */
  finalGcPoints: number[];
  finalGreenPoints: number[];
  finalPolkaDotPoints: number[];
  finalWhitePoints: number[];

  /** In-stage events, index 0 = 1st. */
  intermediateSprintPoints: number[];
  komSummitPoints: number[];
  combativityPoints: number;
  /** Bonus for finishing top 10 from the day's winning breakaway. */
  breakawayBonusPoints: number;

  captainMultiplier: number;

  /** Weekly podium boundaries (inclusive stage ranges). */
  weeks: { week1: [number, number]; week2: [number, number]; week3: [number, number] };

  /** Stages followed by a rest day (unlock bonus transfers from the next stage). */
  restDaysAfterStages: number[];

  /**
   * Demo mode: players who sign up are tagged is_demo (swept by the
   * pre-Tour reset), and the game surfaces show a "demo data" banner.
   * Toggle from admin → Fantasy → Config; MUST be false before launch.
   */
  demoMode: boolean;
}

export const LAUNCH_DEFAULTS: FantasyGameConfig = {
  budget: 100,
  squadSize: 8,
  maxPerProTeam: 3,
  minCheapRiders: { count: 1, maxPrice: 6 },

  transfersTotal: 8,
  transfersPerStage: 2,
  restDayBonusTransfers: 1,
  restDayBonusExemptFromStageCap: true,

  // 1st–10th, then 11th–15th, then 16th–20th (Section 4.4).
  stageFinishPoints: [50, 44, 40, 36, 32, 30, 28, 26, 24, 22, 18, 16, 14, 12, 10, 8, 6, 4, 2, 1],
  tttIndividualTimes: true,
  tttFactor: 0.5,
  // Winning team 20, 2nd 16, 3rd 12, 4th–10th 8, 11th–23rd 2.
  tttTeamFallbackPoints: [20, 16, 12, 8, 8, 8, 8, 8, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],

  jerseyDailyPoints: { yellow: 10, green: 6, polkaDot: 6, white: 4 },

  // 1st 200 … 10th 40, 11th–20th 20.
  finalGcPoints: [200, 150, 120, 100, 90, 80, 70, 60, 50, 40, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
  finalGreenPoints: [80, 50, 30],
  finalPolkaDotPoints: [80, 50, 30],
  finalWhitePoints: [50],

  intermediateSprintPoints: [8, 5, 2],
  komSummitPoints: [8, 5, 2],
  combativityPoints: 12,
  breakawayBonusPoints: 10,

  captainMultiplier: 2,

  weeks: { week1: [1, 9], week2: [10, 15], week3: [16, 21] },
  restDaysAfterStages: [9, 15],

  demoMode: false,
};

/**
 * Merge stored fantasy_game_config rows over the launch defaults.
 * Unknown keys are ignored; partial objects (e.g. jerseyDailyPoints)
 * are shallow-merged so an admin can tweak one jersey value.
 */
export function mergeConfig(
  overrides: Record<string, unknown>,
): FantasyGameConfig {
  const merged: FantasyGameConfig = structuredClone(LAUNCH_DEFAULTS);
  for (const [key, value] of Object.entries(overrides)) {
    if (!(key in merged) || value == null) continue;
    const base = merged[key as keyof FantasyGameConfig];
    if (
      typeof base === "object" &&
      !Array.isArray(base) &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      Object.assign(base as Record<string, unknown>, value);
    } else {
      (merged as unknown as Record<string, unknown>)[key] = value;
    }
  }
  return merged;
}

/** Bonus transfers unlocked for moves effective from `stageNumber`. */
export function restDayBonusesUnlocked(
  stageNumber: number,
  config: FantasyGameConfig,
): number {
  return (
    config.restDaysAfterStages.filter((rest) => stageNumber > rest).length *
    config.restDayBonusTransfers
  );
}

/** Which Tour week (1–3) a stage belongs to, for the weekly podium. */
export function weekOfStage(stageNumber: number, config: FantasyGameConfig): 1 | 2 | 3 {
  if (stageNumber <= config.weeks.week1[1]) return 1;
  if (stageNumber <= config.weeks.week2[1]) return 2;
  return 3;
}
