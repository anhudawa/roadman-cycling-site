/**
 * Definition-of-Done fixture (Section 12): a simulated full Tour —
 * 21 synthetic stages including an abandon wave, a result correction,
 * and a jury relegation — must produce correct, recomputable standings.
 *
 * Two fantasy teams play the whole Tour:
 *  - Team A captains rider 1 every stage and makes one transfer
 *    (rider 8 out, rider 9 in) effective from Stage 10.
 *  - Team B never transfers and loses rider 16 to the Stage 9
 *    abandon wave.
 */

import { describe, it, expect } from "vitest";
import { LAUNCH_DEFAULTS } from "../config";
import {
  computeScoringEvents,
  computeTeamStageScore,
  computeTeamTotals,
  type ScoringEvent,
  type StageContext,
  type StageResultData,
} from "../scoring";

const config = LAUNCH_DEFAULTS;

/** 20 riders, 5 per pro team (101–104). */
const ABANDONS_AFTER_STAGE_9 = [7, 16];
function stageContext(stageType: StageContext["stageType"]): StageContext {
  return {
    stageType,
    riders: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      proTeamId: 101 + Math.floor(i / 5),
      abandonedAfterStage: ABANDONS_AFTER_STAGE_9.includes(i + 1) ? 9 : null,
    })),
  };
}

const STAGE_TYPES: StageContext["stageType"][] = [
  "ttt", "hilly", "mountain", "hilly", "flat", "mountain", "flat", "flat", "hilly",
  "mountain", "flat", "flat", "hilly", "mountain", "mountain",
  "itt", "flat", "mountain", "mountain", "mountain", "flat",
];

/**
 * Deterministic synthetic results: stage winner rotates through riders
 * 1–6, the next five places follow in id order (skipping abandoned
 * riders), rider 1 holds yellow throughout.
 */
function syntheticResult(stageNumber: number): StageResultData {
  const active = (id: number) =>
    !ABANDONS_AFTER_STAGE_9.includes(id) || stageNumber <= 9;
  const order: number[] = [];
  let candidate = ((stageNumber - 1) % 6) + 1;
  while (order.length < 6) {
    if (active(candidate) && !order.includes(candidate)) order.push(candidate);
    candidate = (candidate % 20) + 1;
  }
  const result: StageResultData = {
    stageNumber,
    finishers: order.map((riderId, idx) => ({ position: idx + 1, riderId })),
    jerseys: { yellow: 1 },
  };
  if (stageNumber === 9) {
    result.abandons = ABANDONS_AFTER_STAGE_9.map((riderId) => ({ riderId, reason: "DNF" as const }));
  }
  if (stageNumber === 21) {
    result.final = { gc: [1, 2, 3, 4, 5], green: [2, 3, 4], polkaDot: [3, 4, 5], white: [5] };
  }
  return result;
}

function scoreTour(resultForStage: (n: number) => StageResultData) {
  const eventsByStage = new Map<number, ScoringEvent[]>();
  for (let stage = 1; stage <= 21; stage++) {
    eventsByStage.set(
      stage,
      computeScoringEvents(resultForStage(stage), stageContext(STAGE_TYPES[stage - 1]), config),
    );
  }

  // Team A: riders 1–6, 8, 11; transfer 8 → 9 effective Stage 10.
  const teamASquad = (stage: number) =>
    stage < 10 ? [1, 2, 3, 4, 5, 6, 8, 11] : [1, 2, 3, 4, 5, 6, 9, 11];
  // Team B: static squad including rider 16 (abandons after Stage 9).
  const teamBSquad = () => [2, 3, 4, 5, 6, 10, 12, 16];

  const teamAScores = [];
  const teamBScores = [];
  for (let stage = 1; stage <= 21; stage++) {
    const events = eventsByStage.get(stage)!;
    teamAScores.push(computeTeamStageScore(stage, teamASquad(stage), 1, events, config));
    teamBScores.push(computeTeamStageScore(stage, teamBSquad(), null, events, config));
  }
  return { eventsByStage, teamAScores, teamBScores };
}

describe("simulated full Tour", () => {
  const { teamAScores, teamBScores } = scoreTour(syntheticResult);

  it("scores all 21 stages for both teams", () => {
    expect(teamAScores).toHaveLength(21);
    expect(teamBScores).toHaveLength(21);
    for (const score of [...teamAScores, ...teamBScores]) {
      expect(score.points).toBeGreaterThan(0);
    }
  });

  it("Stage 1 TTT scores at half value (winner 25, not 50, plus doubled captain)", () => {
    const stage1 = teamAScores[0];
    const winnerRow = stage1.perRider.find((r) => r.riderId === 1)!;
    expect(winnerRow.basePoints).toBe(25 + 10); // half-value win + yellow
    expect(winnerRow.totalPoints).toBe(70); // captained
  });

  it("transfer effective-dating: rider 9 scores for Team A only from Stage 10", () => {
    // Rider 9 wins Stage 3 (rotation) — before the transfer, no credit.
    const stage3 = teamAScores[2];
    expect(stage3.perRider.some((r) => r.riderId === 9)).toBe(false);
    // Rider 8 is out of the squad from Stage 10 even though still racing.
    const stage10 = teamAScores[9];
    expect(stage10.perRider.some((r) => r.riderId === 8)).toBe(false);
    expect(stage10.perRider.some((r) => r.riderId === 9)).toBe(true);
  });

  it("abandon handling: rider 16 scores nothing for Team B after Stage 9, with no free replacement", () => {
    for (let stage = 10; stage <= 21; stage++) {
      const row = teamBScores[stage - 1].perRider.find((r) => r.riderId === 16)!;
      // Still in the squad (transfers are the resource), but scoring zero.
      expect(row.totalPoints).toBe(0);
    }
  });

  it("totals are internally consistent and the weeks partition the Tour", () => {
    const totals = computeTeamTotals(
      teamAScores.map((s) => ({ stageNumber: s.stageNumber, points: s.points })),
      config,
    );
    expect(totals.week1Points + totals.week2Points + totals.week3Points).toBe(totals.totalPoints);
    expect(totals.bestStagePoints).toBe(Math.max(...teamAScores.map((s) => s.points)));
  });

  it("correction recompute: re-running one corrected stage changes only that stage", () => {
    // Jury relegates the Stage 14 winner to last place after publication;
    // everyone else moves up one. Rider 8 (owned by neither team on
    // Stage 14) inherits a points position, so both team totals shift.
    const correctedResult = (stage: number): StageResultData => {
      const base = syntheticResult(stage);
      if (stage !== 14 || !base.finishers) return base;
      const [first, ...rest] = base.finishers;
      return {
        ...base,
        finishers: [
          ...rest.map(({ riderId }, idx) => ({ position: idx + 1, riderId })),
          { position: base.finishers.length, riderId: first.riderId },
        ],
      };
    };
    const rerun = scoreTour(correctedResult);
    for (let stage = 1; stage <= 21; stage++) {
      if (stage === 14) continue;
      expect(rerun.teamAScores[stage - 1].points).toBe(teamAScores[stage - 1].points);
      expect(rerun.teamBScores[stage - 1].points).toBe(teamBScores[stage - 1].points);
    }
    expect(rerun.teamAScores[13].points).not.toBe(teamAScores[13].points);
  });

  it("full recompute from raw results reproduces identical standings (idempotent)", () => {
    const rerun = scoreTour(syntheticResult);
    expect(rerun.teamAScores).toEqual(teamAScores);
    expect(rerun.teamBScores).toEqual(teamBScores);
  });
});
