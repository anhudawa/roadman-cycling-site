import { describe, it, expect } from "vitest";
import { LAUNCH_DEFAULTS } from "../config";
import { computeTeamStageScore, dreamTeam, type ScoringEvent } from "../scoring";
import { transferBudget, validateTransfer, type PriorTransfer, type TransferRequest } from "../rules";

const config = LAUNCH_DEFAULTS;

const events: ScoringEvent[] = [
  { stageNumber: 19, riderId: 1, rule: "stage_finish", points: 50, sourceRef: "finish-position-1" },
  { stageNumber: 19, riderId: 1, rule: "jersey_polka_dot", points: 6, sourceRef: "jersey-polka-dot" },
  { stageNumber: 19, riderId: 2, rule: "stage_finish", points: 44, sourceRef: "finish-position-2" },
  { stageNumber: 19, riderId: 3, rule: "stage_finish", points: 40, sourceRef: "finish-position-3" },
];

describe("Triple Captain chip", () => {
  it("multiplies the captain by the chip multiplier instead of ×2", () => {
    const normal = computeTeamStageScore(19, [1, 2], 1, events, config);
    const tripled = computeTeamStageScore(
      19, [1, 2], 1, events, config, config.chips.tripleCaptainMultiplier,
    );
    expect(normal.points).toBe(56 * 2 + 44);
    expect(tripled.points).toBe(56 * 3 + 44);
    const captainRow = tripled.perRider.find((r) => r.riderId === 1)!;
    expect(captainRow.basePoints).toBe(56);
    expect(captainRow.totalPoints).toBe(168);
  });

  it("does nothing without a captain in the squad — the chip can't triple nobody", () => {
    const tripled = computeTeamStageScore(19, [2, 3], 99, events, config, 3);
    expect(tripled.points).toBe(44 + 40);
  });
});

function wildcardRequest(overrides: Partial<TransferRequest> = {}): TransferRequest {
  const squad = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    price: [24, 18, 14, 12, 10, 8, 6, 5][i],
    proTeamId: 100 + i,
    status: "confirmed" as const,
  }));
  return {
    riderOutId: 8,
    riderInId: 99,
    currentSquad: squad,
    riderIn: { id: 99, price: 5, proTeamId: 999, status: "confirmed" },
    effectiveFromStage: 12,
    priorTransfers: [],
    stageStartTime: new Date("2026-07-16T13:00:00+02:00"),
    now: new Date("2026-07-16T08:00:00+02:00"),
    isPreTour: false,
    wildcardActive: true,
    ...overrides,
  };
}

describe("Wildcard chip", () => {
  it("books transfers as wildcard — free and uncounted", () => {
    const decision = validateTransfer(wildcardRequest(), config);
    expect(decision.valid).toBe(true);
    expect(decision.kind).toBe("wildcard");
  });

  it("ignores the per-stage cap and exhausted allowances while active", () => {
    const prior: PriorTransfer[] = [
      ...Array.from({ length: 8 }, (_, i) => ({
        effectiveFromStage: 2 + i,
        kind: "standard" as const,
      })),
      { effectiveFromStage: 12, kind: "wildcard" },
      { effectiveFromStage: 12, kind: "wildcard" },
      { effectiveFromStage: 12, kind: "wildcard" },
    ];
    const decision = validateTransfer(wildcardRequest({ priorTransfers: prior }), config);
    expect(decision.valid).toBe(true);
    expect(decision.kind).toBe("wildcard");
  });

  it("wildcard transfers never count against the standard budget afterwards", () => {
    const prior: PriorTransfer[] = [
      { effectiveFromStage: 12, kind: "wildcard" },
      { effectiveFromStage: 12, kind: "wildcard" },
      { effectiveFromStage: 5, kind: "standard" },
    ];
    const budget = transferBudget(prior, 13, config);
    expect(budget.standardUsed).toBe(1);
    expect(budget.standardRemaining).toBe(7);
    expect(budget.usedThisStage).toBe(0);
  });

  it("still enforces squad composition — a wildcard isn't a budget cheat", () => {
    const decision = validateTransfer(
      wildcardRequest({ riderIn: { id: 99, price: 25, proTeamId: 999, status: "confirmed" }, riderInId: 99 }),
      config,
    );
    expect(decision.valid).toBe(false);
    expect(decision.errors.map((e) => e.code)).toContain("BUDGET_EXCEEDED");
  });

  it("still respects the deadline", () => {
    const decision = validateTransfer(
      wildcardRequest({ now: new Date("2026-07-16T14:00:00+02:00") }),
      config,
    );
    expect(decision.valid).toBe(false);
    expect(decision.errors.map((e) => e.code)).toContain("DEADLINE_PASSED");
  });
});

describe("dreamTeam", () => {
  it("returns the highest-scoring riders, summed across events, in order", () => {
    const team = dreamTeam(events, 2);
    expect(team).toEqual([
      { riderId: 1, points: 56 },
      { riderId: 2, points: 44 },
    ]);
  });

  it("breaks point ties on rider id for deterministic output", () => {
    const tied = dreamTeam(
      [
        { riderId: 7, points: 10 },
        { riderId: 3, points: 10 },
      ],
      2,
    );
    expect(tied.map((t) => t.riderId)).toEqual([3, 7]);
  });

  it("handles fewer scorers than the requested size", () => {
    expect(dreamTeam([{ riderId: 1, points: 5 }], 8)).toHaveLength(1);
  });
});
