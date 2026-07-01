import { describe, it, expect } from "vitest";
import { LAUNCH_DEFAULTS } from "../config";
import {
  computeScoringEvents,
  computeTeamStageScore,
  computeTeamTotals,
  compareTeamsForRank,
  type StageContext,
  type StageResultData,
  type ScoringEvent,
} from "../scoring";

const config = LAUNCH_DEFAULTS;

/** 16 synthetic riders across 4 pro teams (ids 1–16, teams 101–104). */
function riders(overrides: Record<number, { abandonedAfterStage?: number }> = {}) {
  return Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    proTeamId: 101 + Math.floor(i / 4),
    abandonedAfterStage: overrides[i + 1]?.abandonedAfterStage ?? null,
  }));
}

function roadStage(overrides: Partial<StageContext> = {}): StageContext {
  return { stageType: "flat", riders: riders(), ...overrides };
}

describe("computeScoringEvents — stage finish", () => {
  it("maps the published finish table exactly (1st 50 … 20th 1, 21st nothing)", () => {
    const result: StageResultData = {
      stageNumber: 5,
      finishers: [
        { position: 1, riderId: 1 },
        { position: 2, riderId: 2 },
        { position: 10, riderId: 3 },
        { position: 11, riderId: 4 },
        { position: 15, riderId: 5 },
        { position: 16, riderId: 6 },
        { position: 20, riderId: 7 },
        { position: 21, riderId: 8 },
      ],
    };
    const events = computeScoringEvents(result, roadStage(), config);
    const points = Object.fromEntries(events.map((e) => [e.riderId, e.points]));
    expect(points[1]).toBe(50);
    expect(points[2]).toBe(44);
    expect(points[3]).toBe(22);
    expect(points[4]).toBe(18);
    expect(points[5]).toBe(10);
    expect(points[6]).toBe(8);
    expect(points[7]).toBe(1);
    expect(points[8]).toBeUndefined();
  });

  it("records the rule and an auditable source ref on every event", () => {
    const events = computeScoringEvents(
      { stageNumber: 5, finishers: [{ position: 3, riderId: 1 }] },
      roadStage(),
      config,
    );
    expect(events).toEqual([
      {
        stageNumber: 5,
        riderId: 1,
        rule: "stage_finish",
        points: 40,
        sourceRef: "finish-position-3",
      },
    ]);
  });
});

describe("computeScoringEvents — Stage 1 TTT", () => {
  it("scores individual positions at 50% value, rounding half up", () => {
    const result: StageResultData = {
      stageNumber: 1,
      finishers: [
        { position: 1, riderId: 1 }, // 50 → 25
        { position: 6, riderId: 2 }, // 30 → 15
        { position: 20, riderId: 3 }, // 1 → 0.5 → 1
      ],
    };
    const events = computeScoringEvents(result, roadStage({ stageType: "ttt" }), config);
    const points = Object.fromEntries(events.map((e) => [e.riderId, e.points]));
    expect(points[1]).toBe(25);
    expect(points[2]).toBe(15);
    expect(points[3]).toBe(1);
    expect(events.every((e) => e.rule === "ttt_individual")).toBe(true);
  });

  it("falls back to per-team points when only team results publish", () => {
    const fallbackConfig = { ...config, tttIndividualTimes: false };
    const result: StageResultData = {
      stageNumber: 1,
      tttTeams: [
        { position: 1, proTeamId: 101 },
        { position: 2, proTeamId: 102 },
        { position: 4, proTeamId: 103 },
        { position: 11, proTeamId: 104 },
      ],
    };
    const events = computeScoringEvents(result, roadStage({ stageType: "ttt" }), fallbackConfig);
    const points = Object.fromEntries(events.map((e) => [e.riderId, e.points]));
    // Team 101 = riders 1–4 (winning team, 20 each); team 102 = 5–8 (16);
    // team 103 = 9–12 (4th, 8); team 104 = 13–16 (11th, 2).
    expect(points[1]).toBe(20);
    expect(points[4]).toBe(20);
    expect(points[5]).toBe(16);
    expect(points[9]).toBe(8);
    expect(points[13]).toBe(2);
    expect(events.every((e) => e.rule === "ttt_team")).toBe(true);
  });
});

describe("computeScoringEvents — jerseys, in-stage events, finals", () => {
  it("awards daily jersey points to each holder", () => {
    const events = computeScoringEvents(
      { stageNumber: 7, jerseys: { yellow: 1, green: 2, polkaDot: 3, white: 4 } },
      roadStage(),
      config,
    );
    const byRule = Object.fromEntries(events.map((e) => [e.rule, e]));
    expect(byRule.jersey_yellow).toMatchObject({ riderId: 1, points: 10 });
    expect(byRule.jersey_green).toMatchObject({ riderId: 2, points: 6 });
    expect(byRule.jersey_polka_dot).toMatchObject({ riderId: 3, points: 6 });
    expect(byRule.jersey_white).toMatchObject({ riderId: 4, points: 4 });
  });

  it("scores sprints, KOMs, combativity, and breakaway bonus", () => {
    const events = computeScoringEvents(
      {
        stageNumber: 9,
        intermediateSprints: [{ name: "Ussel", top3: [1, 2, 3] }],
        komSummits: [
          { name: "Col A", top3: [4, 5, 6] },
          { name: "Col B", top3: [4, 7, 8] },
        ],
        combativityRiderId: 9,
        breakawayBonusRiderIds: [4, 9],
      },
      roadStage({ stageType: "mountain" }),
      config,
    );
    const sum = (riderId: number) =>
      events.filter((e) => e.riderId === riderId).reduce((s, e) => s + e.points, 0);
    expect(sum(1)).toBe(8);
    expect(sum(3)).toBe(2);
    expect(sum(4)).toBe(8 + 8 + 10); // two KOM wins + breakaway bonus
    expect(sum(9)).toBe(12 + 10); // combativity + breakaway bonus
  });

  it("scores final classifications after Stage 21", () => {
    const events = computeScoringEvents(
      {
        stageNumber: 21,
        final: {
          gc: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          green: [2, 5, 6],
          polkaDot: [3, 4, 7],
          white: [8],
        },
      },
      roadStage(),
      config,
    );
    const byRiderRule = (riderId: number, rule: string) =>
      events.find((e) => e.riderId === riderId && e.rule === rule)?.points;
    expect(byRiderRule(1, "final_gc")).toBe(200);
    expect(byRiderRule(10, "final_gc")).toBe(40);
    expect(byRiderRule(11, "final_gc")).toBe(20);
    expect(byRiderRule(2, "final_green")).toBe(80);
    expect(byRiderRule(7, "final_polka_dot")).toBe(30);
    expect(byRiderRule(8, "final_white")).toBe(50);
  });
});

describe("computeScoringEvents — abandons", () => {
  it("a rider who left the race scores nothing on later stages", () => {
    const ctx = roadStage({ riders: riders({ 1: { abandonedAfterStage: 8 } }) });
    const events = computeScoringEvents(
      { stageNumber: 9, finishers: [{ position: 1, riderId: 1 }], jerseys: { yellow: 1 } },
      ctx,
      config,
    );
    expect(events).toHaveLength(0);
  });

  it("still scores the stage the rider abandoned on (e.g. HD after the time cut)", () => {
    const ctx = roadStage({ riders: riders({ 1: { abandonedAfterStage: 9 } }) });
    const events = computeScoringEvents(
      { stageNumber: 9, finishers: [{ position: 5, riderId: 1 }] },
      ctx,
      config,
    );
    expect(events).toHaveLength(1);
    expect(events[0].points).toBe(32);
  });
});

describe("computeTeamStageScore — captain doubling", () => {
  const stageEvents: ScoringEvent[] = [
    { stageNumber: 14, riderId: 1, rule: "stage_finish", points: 32, sourceRef: "finish-position-5" },
    { stageNumber: 14, riderId: 2, rule: "stage_finish", points: 22, sourceRef: "finish-position-10" },
    { stageNumber: 14, riderId: 99, rule: "stage_finish", points: 50, sourceRef: "finish-position-1" },
  ];

  it("doubles the captain and shows it explicitly in the breakdown", () => {
    const score = computeTeamStageScore(14, [1, 2, 3], 1, stageEvents, config);
    const captainRow = score.perRider.find((r) => r.riderId === 1)!;
    expect(captainRow.basePoints).toBe(32);
    expect(captainRow.isCaptain).toBe(true);
    expect(captainRow.totalPoints).toBe(64); // 32 → C × 2 = 64
    expect(score.points).toBe(64 + 22);
  });

  it("ignores events for riders outside the squad-as-of-stage", () => {
    const score = computeTeamStageScore(14, [1, 2], null, stageEvents, config);
    expect(score.points).toBe(32 + 22); // rider 99's 50 never counts
  });

  it("a captain not in the squad-as-of-stage is not doubled", () => {
    const score = computeTeamStageScore(14, [1, 2], 99, stageEvents, config);
    expect(score.captainRiderId).toBeNull();
    expect(score.points).toBe(54);
  });
});

describe("computeTeamTotals + ranking", () => {
  it("splits points into the three Tour weeks and tracks the best stage", () => {
    const totals = computeTeamTotals(
      [
        { stageNumber: 1, points: 40 },
        { stageNumber: 9, points: 60 },
        { stageNumber: 10, points: 80 },
        { stageNumber: 15, points: 20 },
        { stageNumber: 16, points: 90 },
        { stageNumber: 21, points: 10 },
      ],
      config,
    );
    expect(totals.totalPoints).toBe(300);
    expect(totals.week1Points).toBe(100);
    expect(totals.week2Points).toBe(100);
    expect(totals.week3Points).toBe(100);
    expect(totals.bestStagePoints).toBe(90);
  });

  it("tie-breaks on best single stage, then earliest creation", () => {
    const base = { totalPoints: 500, week1Points: 0, week2Points: 0, week3Points: 0 };
    const a = { ...base, bestStagePoints: 120, createdAt: new Date("2026-06-28") };
    const b = { ...base, bestStagePoints: 90, createdAt: new Date("2026-06-20") };
    const c = { ...base, bestStagePoints: 120, createdAt: new Date("2026-06-27") };
    expect([a, b, c].sort(compareTeamsForRank).map((t) => t.createdAt.getDate())).toEqual([27, 28, 20]);
  });
});

describe("recomputability — corrections and relegations", () => {
  it("is deterministic: identical input produces identical events", () => {
    const result: StageResultData = {
      stageNumber: 14,
      finishers: [
        { position: 1, riderId: 1 },
        { position: 2, riderId: 2 },
        { position: 3, riderId: 3 },
      ],
      jerseys: { yellow: 1 },
      combativityRiderId: 3,
    };
    const first = computeScoringEvents(result, roadStage(), config);
    const second = computeScoringEvents(result, roadStage(), config);
    expect(second).toEqual(first);
  });

  it("a jury relegation re-run corrects every affected score", () => {
    // Original: rider 1 wins, rider 2 second. Jury relegates rider 1 to 3rd.
    const original: StageResultData = {
      stageNumber: 14,
      finishers: [
        { position: 1, riderId: 1 },
        { position: 2, riderId: 2 },
        { position: 3, riderId: 3 },
      ],
    };
    const corrected: StageResultData = {
      stageNumber: 14,
      finishers: [
        { position: 1, riderId: 2 },
        { position: 2, riderId: 3 },
        { position: 3, riderId: 1 },
      ],
    };
    const squad = [1, 2];
    const before = computeTeamStageScore(
      14, squad, 1, computeScoringEvents(original, roadStage(), config), config,
    );
    const after = computeTeamStageScore(
      14, squad, 1, computeScoringEvents(corrected, roadStage(), config), config,
    );
    expect(before.points).toBe(50 * 2 + 44); // captained winner + 2nd
    expect(after.points).toBe(40 * 2 + 50); // captain relegated to 3rd, rider 2 wins
  });
});
