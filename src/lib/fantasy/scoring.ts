/**
 * Roadman Fantasy Tour — scoring engine.
 *
 * Pure functions only: raw stage results in, scoring events out. No DB,
 * no clock, no I/O — which is what makes scores fully recomputable. When
 * a jury decision corrects a result, the admin re-opens the stage, fixes
 * the raw payload, and re-runs this engine; every team and league
 * standing falls out of the new events deterministically.
 *
 * Every event records the rule applied and a source reference so any
 * points total can be audited line by line (Section 4.4 hard requirement).
 */

import type { FantasyGameConfig } from "./config";
import { weekOfStage } from "./config";

export type ScoringRule =
  | "stage_finish"
  | "ttt_individual"
  | "ttt_team"
  | "jersey_yellow"
  | "jersey_green"
  | "jersey_polka_dot"
  | "jersey_white"
  | "intermediate_sprint"
  | "kom_summit"
  | "combativity"
  | "breakaway_bonus"
  | "final_gc"
  | "final_green"
  | "final_polka_dot"
  | "final_white";

export interface ScoringEvent {
  stageNumber: number;
  riderId: number;
  rule: ScoringRule;
  points: number;
  sourceRef: string;
}

/**
 * Raw result payload for one stage, as entered/ingested from official
 * results (Section 6.3). Rider ids are fantasy_riders.id values — the
 * validation gates in the admin panel guarantee they exist and are
 * active before this engine ever sees them, but the engine re-checks
 * abandons defensively.
 */
export interface StageResultData {
  stageNumber: number;
  /** Top 20 finishers in order. For the Stage 1 TTT with individual times,
   *  this is each rider's individual recorded position at the line. */
  finishers?: { position: number; riderId: number }[];
  /** TTT fallback: team finishing order when only per-team results publish. */
  tttTeams?: { position: number; proTeamId: number }[];
  /** Jersey holders after the stage. */
  jerseys?: { yellow?: number; green?: number; polkaDot?: number; white?: number };
  /** Top 3 rider ids per intermediate sprint, in order. */
  intermediateSprints?: { name?: string; top3: number[] }[];
  /** Top 3 rider ids per scored HC/Cat-1 summit, in order. */
  komSummits?: { name?: string; top3: number[] }[];
  combativityRiderId?: number | null;
  /** Riders finishing top 10 from the breakaway that stayed away. */
  breakawayBonusRiderIds?: number[];
  /** Riders leaving the race on this stage. They keep points already
   *  scored (including this stage's, e.g. HD after the time cut) but
   *  score nothing afterwards. */
  abandons?: { riderId: number; reason: "DNS" | "DNF" | "HD" | "DSQ" }[];
  /** Stage 21 only: final classifications, rider ids in order. */
  final?: { gc: number[]; green: number[]; polkaDot: number[]; white: number[] };
}

export interface RiderContext {
  id: number;
  proTeamId: number;
  /** Stage after which the rider is out of the race, if any. */
  abandonedAfterStage?: number | null;
}

export interface StageContext {
  stageType: "ttt" | "itt" | "flat" | "hilly" | "mountain";
  riders: RiderContext[];
}

/** Round half up — 0.5 credits become 1 point, matching the published rules. */
function roundHalfUp(n: number): number {
  return Math.floor(n + 0.5);
}

function pointsAt(table: number[], position: number): number {
  return table[position - 1] ?? 0;
}

/**
 * Compute every scoring event for one stage from its raw result.
 * Deterministic: same inputs → same events, in a stable order.
 */
export function computeScoringEvents(
  result: StageResultData,
  ctx: StageContext,
  config: FantasyGameConfig,
): ScoringEvent[] {
  const events: ScoringEvent[] = [];
  const stage = result.stageNumber;
  const riderById = new Map(ctx.riders.map((r) => [r.id, r]));

  /** A rider who left the race on an EARLIER stage can score nothing. */
  const isActive = (riderId: number): boolean => {
    const rider = riderById.get(riderId);
    if (!rider) return false;
    const out = rider.abandonedAfterStage;
    return out == null || out >= stage;
  };

  const push = (riderId: number, rule: ScoringRule, points: number, sourceRef: string) => {
    if (points === 0 || !isActive(riderId)) return;
    events.push({ stageNumber: stage, riderId, rule, points, sourceRef });
  };

  // --- Stage finish ---
  const isTtt = ctx.stageType === "ttt";
  if (isTtt && config.tttIndividualTimes && result.finishers?.length) {
    for (const { position, riderId } of result.finishers) {
      push(
        riderId,
        "ttt_individual",
        roundHalfUp(pointsAt(config.stageFinishPoints, position) * config.tttFactor),
        `ttt-individual-position-${position}`,
      );
    }
  } else if (isTtt && result.tttTeams?.length) {
    for (const { position, proTeamId } of result.tttTeams) {
      const points = pointsAt(config.tttTeamFallbackPoints, position);
      if (points === 0) continue;
      for (const rider of ctx.riders) {
        if (rider.proTeamId !== proTeamId) continue;
        push(rider.id, "ttt_team", points, `ttt-team-position-${position}`);
      }
    }
  } else if (result.finishers?.length) {
    for (const { position, riderId } of result.finishers) {
      push(riderId, "stage_finish", pointsAt(config.stageFinishPoints, position), `finish-position-${position}`);
    }
  }

  // --- Jerseys (daily, to the holder after the stage) ---
  const jerseys = result.jerseys ?? {};
  if (jerseys.yellow) push(jerseys.yellow, "jersey_yellow", config.jerseyDailyPoints.yellow, "jersey-yellow");
  if (jerseys.green) push(jerseys.green, "jersey_green", config.jerseyDailyPoints.green, "jersey-green");
  if (jerseys.polkaDot) push(jerseys.polkaDot, "jersey_polka_dot", config.jerseyDailyPoints.polkaDot, "jersey-polka-dot");
  if (jerseys.white) push(jerseys.white, "jersey_white", config.jerseyDailyPoints.white, "jersey-white");

  // --- In-stage events ---
  (result.intermediateSprints ?? []).forEach((sprint, sprintIdx) => {
    sprint.top3.forEach((riderId, idx) => {
      push(
        riderId,
        "intermediate_sprint",
        pointsAt(config.intermediateSprintPoints, idx + 1),
        `sprint-${sprint.name ?? sprintIdx + 1}-position-${idx + 1}`,
      );
    });
  });
  (result.komSummits ?? []).forEach((summit, summitIdx) => {
    summit.top3.forEach((riderId, idx) => {
      push(
        riderId,
        "kom_summit",
        pointsAt(config.komSummitPoints, idx + 1),
        `kom-${summit.name ?? summitIdx + 1}-position-${idx + 1}`,
      );
    });
  });
  if (result.combativityRiderId) {
    push(result.combativityRiderId, "combativity", config.combativityPoints, "combativity");
  }
  for (const riderId of result.breakawayBonusRiderIds ?? []) {
    push(riderId, "breakaway_bonus", config.breakawayBonusPoints, "breakaway-top10");
  }

  // --- Final classifications (Stage 21 only) ---
  if (result.final) {
    result.final.gc.forEach((riderId, idx) =>
      push(riderId, "final_gc", pointsAt(config.finalGcPoints, idx + 1), `final-gc-${idx + 1}`),
    );
    result.final.green.forEach((riderId, idx) =>
      push(riderId, "final_green", pointsAt(config.finalGreenPoints, idx + 1), `final-green-${idx + 1}`),
    );
    result.final.polkaDot.forEach((riderId, idx) =>
      push(riderId, "final_polka_dot", pointsAt(config.finalPolkaDotPoints, idx + 1), `final-polka-dot-${idx + 1}`),
    );
    result.final.white.forEach((riderId, idx) =>
      push(riderId, "final_white", pointsAt(config.finalWhitePoints, idx + 1), `final-white-${idx + 1}`),
    );
  }

  return events;
}

export interface RiderStagePoints {
  riderId: number;
  basePoints: number;
  isCaptain: boolean;
  /** basePoints × captain multiplier where applicable. */
  totalPoints: number;
  events: ScoringEvent[];
}

export interface TeamStageScore {
  stageNumber: number;
  points: number;
  captainRiderId: number | null;
  perRider: RiderStagePoints[];
}

/**
 * Score one fantasy team for one stage. `squadRiderIds` must be the
 * team AS OF that stage (effective-dated rows), never the current team.
 * A captain who is not in the squad-as-of-stage is ignored rather than
 * doubled — the validation layer prevents that state, this is defence.
 */
export function computeTeamStageScore(
  stageNumber: number,
  squadRiderIds: number[],
  captainRiderId: number | null,
  stageEvents: ScoringEvent[],
  config: FantasyGameConfig,
): TeamStageScore {
  const squad = new Set(squadRiderIds);
  const effectiveCaptain = captainRiderId != null && squad.has(captainRiderId) ? captainRiderId : null;

  const byRider = new Map<number, ScoringEvent[]>();
  for (const event of stageEvents) {
    if (event.stageNumber !== stageNumber || !squad.has(event.riderId)) continue;
    const list = byRider.get(event.riderId) ?? [];
    list.push(event);
    byRider.set(event.riderId, list);
  }

  const perRider: RiderStagePoints[] = squadRiderIds.map((riderId) => {
    const events = byRider.get(riderId) ?? [];
    const basePoints = events.reduce((sum, e) => sum + e.points, 0);
    const isCaptain = riderId === effectiveCaptain;
    return {
      riderId,
      basePoints,
      isCaptain,
      totalPoints: isCaptain ? basePoints * config.captainMultiplier : basePoints,
      events,
    };
  });

  return {
    stageNumber,
    points: perRider.reduce((sum, r) => sum + r.totalPoints, 0),
    captainRiderId: effectiveCaptain,
    perRider,
  };
}

export interface TeamTotals {
  totalPoints: number;
  week1Points: number;
  week2Points: number;
  week3Points: number;
  bestStagePoints: number;
}

/** Roll per-stage scores into the totals row the leaderboard reads. */
export function computeTeamTotals(
  stageScores: { stageNumber: number; points: number }[],
  config: FantasyGameConfig,
): TeamTotals {
  const totals: TeamTotals = {
    totalPoints: 0,
    week1Points: 0,
    week2Points: 0,
    week3Points: 0,
    bestStagePoints: 0,
  };
  for (const { stageNumber, points } of stageScores) {
    totals.totalPoints += points;
    const week = weekOfStage(stageNumber, config);
    if (week === 1) totals.week1Points += points;
    else if (week === 2) totals.week2Points += points;
    else totals.week3Points += points;
    if (points > totals.bestStagePoints) totals.bestStagePoints = points;
  }
  return totals;
}

/**
 * Global-league ordering: total points, then highest single-stage score,
 * then earliest team creation (Section 4.5 tie-break).
 */
export function compareTeamsForRank(
  a: TeamTotals & { createdAt: Date },
  b: TeamTotals & { createdAt: Date },
): number {
  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
  if (b.bestStagePoints !== a.bestStagePoints) return b.bestStagePoints - a.bestStagePoints;
  return a.createdAt.getTime() - b.createdAt.getTime();
}
