import { describe, it, expect } from "vitest";
import { LAUNCH_DEFAULTS, restDayBonusesUnlocked } from "../config";
import {
  validateSquad,
  validateTransfer,
  validateCaptainPick,
  transferBudget,
  type SelectableRider,
  type PriorTransfer,
  type TransferRequest,
} from "../rules";

const config = LAUNCH_DEFAULTS;

function rider(
  id: number,
  price: number,
  proTeamId = 100 + id,
  status: SelectableRider["status"] = "confirmed",
): SelectableRider {
  return { id, price, proTeamId, status };
}

/** Legal default squad: 8 riders, 97 credits, one ≤6 pick, all different teams. */
function legalSquad(): SelectableRider[] {
  return [
    rider(1, 24),
    rider(2, 18),
    rider(3, 14),
    rider(4, 12),
    rider(5, 10),
    rider(6, 8),
    rider(7, 6),
    rider(8, 5),
  ];
}

describe("validateSquad", () => {
  it("accepts a legal squad", () => {
    expect(validateSquad(legalSquad(), config)).toEqual({ valid: true, errors: [] });
  });

  it("rejects more or fewer than 8 riders", () => {
    const short = legalSquad().slice(0, 7);
    expect(validateSquad(short, config).errors.map((e) => e.code)).toContain("SQUAD_SIZE");
  });

  it("rejects squads over 100 credits", () => {
    const squad = legalSquad();
    squad[7] = rider(8, 9); // 97 → 101
    expect(validateSquad(squad, config).errors.map((e) => e.code)).toContain("BUDGET_EXCEEDED");
  });

  it("allows exactly 100 credits", () => {
    const squad = legalSquad();
    squad[7] = rider(8, 8); // → 100, but now no ≤6 pick except rider 7
    expect(validateSquad(squad, config).valid).toBe(true);
  });

  it("rejects a 4th rider from the same pro team", () => {
    const squad = legalSquad().map((r, i) => (i < 4 ? { ...r, proTeamId: 500 } : r));
    expect(validateSquad(squad, config).errors.map((e) => e.code)).toContain("TEAM_CAP");
  });

  it("allows exactly 3 riders from one pro team", () => {
    const squad = legalSquad().map((r, i) => (i < 3 ? { ...r, proTeamId: 500 } : r));
    expect(validateSquad(squad, config).valid).toBe(true);
  });

  it("requires at least one rider priced ≤ 6", () => {
    const squad = legalSquad().map((r) => (r.price <= 6 ? { ...r, price: 7 } : r));
    expect(validateSquad(squad, config).errors.map((e) => e.code)).toContain("MIN_CHEAP_RIDERS");
  });

  it("rejects duplicate riders and unavailable riders", () => {
    const squad = legalSquad();
    squad[1] = { ...squad[0] };
    squad[7] = { ...squad[7], status: "abandoned" };
    const codes = validateSquad(squad, config).errors.map((e) => e.code);
    expect(codes).toContain("DUPLICATE_RIDER");
    expect(codes).toContain("RIDER_UNAVAILABLE");
  });
});

describe("rest-day bonus unlocks", () => {
  it("unlocks one bonus after each rest day (stages 9 and 15)", () => {
    expect(restDayBonusesUnlocked(9, config)).toBe(0);
    expect(restDayBonusesUnlocked(10, config)).toBe(1);
    expect(restDayBonusesUnlocked(15, config)).toBe(1);
    expect(restDayBonusesUnlocked(16, config)).toBe(2);
    expect(restDayBonusesUnlocked(21, config)).toBe(2);
  });
});

function transferRequest(overrides: Partial<TransferRequest> = {}): TransferRequest {
  return {
    riderOutId: 8,
    riderInId: 99,
    currentSquad: legalSquad(),
    riderIn: rider(99, 5, 999),
    effectiveFromStage: 10,
    priorTransfers: [],
    stageStartTime: new Date("2026-07-14T13:10:00+02:00"),
    now: new Date("2026-07-14T08:00:00+02:00"),
    isPreTour: false,
    ...overrides,
  };
}

describe("validateTransfer", () => {
  it("books a standard transfer when allowance remains", () => {
    const decision = validateTransfer(transferRequest(), config);
    expect(decision.valid).toBe(true);
    expect(decision.kind).toBe("standard");
  });

  it("pre-Tour edits are unlimited and consume nothing", () => {
    const prior: PriorTransfer[] = Array.from({ length: 30 }, () => ({
      effectiveFromStage: 1,
      kind: "standard" as const,
    }));
    const decision = validateTransfer(
      transferRequest({ isPreTour: true, priorTransfers: prior, effectiveFromStage: 1 }),
      config,
    );
    expect(decision.valid).toBe(true);
    expect(decision.kind).toBe("pre_tour");
  });

  it("enforces the per-stage cap of 2", () => {
    const prior: PriorTransfer[] = [
      { effectiveFromStage: 10, kind: "standard" },
      { effectiveFromStage: 10, kind: "standard" },
    ];
    const decision = validateTransfer(transferRequest({ priorTransfers: prior }), config);
    expect(decision.valid).toBe(false);
    expect(decision.errors.map((e) => e.code)).toContain("STAGE_CAP");
  });

  it("falls over to a rest-day bonus when the 8 standard transfers are gone", () => {
    const prior: PriorTransfer[] = Array.from({ length: 8 }, (_, i) => ({
      effectiveFromStage: 2 + i,
      kind: "standard" as const,
    }));
    const decision = validateTransfer(transferRequest({ priorTransfers: prior }), config);
    expect(decision.valid).toBe(true);
    expect(decision.kind).toBe("rest_day_bonus");
  });

  it("rejects when standard and bonus allowances are both exhausted", () => {
    const prior: PriorTransfer[] = [
      ...Array.from({ length: 8 }, (_, i) => ({
        effectiveFromStage: 2 + i,
        kind: "standard" as const,
      })),
      { effectiveFromStage: 10, kind: "rest_day_bonus" as const },
    ];
    // Stage 11: only one bonus unlocked so far, and it's spent.
    const decision = validateTransfer(
      transferRequest({ priorTransfers: prior, effectiveFromStage: 11 }),
      config,
    );
    expect(decision.valid).toBe(false);
    expect(decision.errors.map((e) => e.code)).toContain("TRANSFERS_EXHAUSTED");
  });

  it("locks at the official stage start time", () => {
    const decision = validateTransfer(
      transferRequest({ now: new Date("2026-07-14T13:10:00+02:00") }),
      config,
    );
    expect(decision.valid).toBe(false);
    expect(decision.errors.map((e) => e.code)).toContain("DEADLINE_PASSED");
  });

  it("grace swaps for Stage-1 DNS riders are free", () => {
    const decision = validateTransfer(transferRequest({ isGrace: true, effectiveFromStage: 1 }), config);
    expect(decision.valid).toBe(true);
    expect(decision.kind).toBe("grace");
  });

  it("the resulting squad must still pass composition rules", () => {
    // Swapping in a 25-credit rider blows the budget (97 - 5 + 25 = 117).
    const decision = validateTransfer(
      transferRequest({ riderIn: rider(99, 25, 999), riderInId: 99 }),
      config,
    );
    expect(decision.valid).toBe(false);
    expect(decision.errors.map((e) => e.code)).toContain("BUDGET_EXCEEDED");
  });

  it("rejects swapping out a rider you don't own or in a rider you already own", () => {
    const codes = validateTransfer(
      transferRequest({ riderOutId: 77, riderInId: 1, riderIn: rider(1, 24, 101) }),
      config,
    ).errors.map((e) => e.code);
    expect(codes).toContain("RIDER_NOT_IN_SQUAD");
    expect(codes).toContain("RIDER_ALREADY_IN_SQUAD");
  });
});

describe("transferBudget", () => {
  it("reports the full picture for the transfer panel UI", () => {
    const prior: PriorTransfer[] = [
      { effectiveFromStage: 5, kind: "standard" },
      { effectiveFromStage: 16, kind: "standard" },
      { effectiveFromStage: 16, kind: "rest_day_bonus" },
      { effectiveFromStage: 1, kind: "grace" },
    ];
    const budget = transferBudget(prior, 16, config);
    expect(budget.standardUsed).toBe(2);
    expect(budget.standardRemaining).toBe(6);
    expect(budget.bonusesUnlocked).toBe(2);
    expect(budget.bonusesUsed).toBe(1);
    expect(budget.bonusesRemaining).toBe(1);
    // Grace and (exempt) bonus transfers don't count against the stage cap.
    expect(budget.usedThisStage).toBe(1);
  });
});

describe("validateCaptainPick", () => {
  it("accepts a squad member before the deadline", () => {
    const result = validateCaptainPick(3, [1, 2, 3], new Date("2026-07-14T13:10:00+02:00"), new Date("2026-07-14T08:00:00+02:00"));
    expect(result.valid).toBe(true);
  });

  it("rejects non-members and post-deadline changes", () => {
    const late = validateCaptainPick(9, [1, 2, 3], new Date("2026-07-14T13:10:00+02:00"), new Date("2026-07-14T14:00:00+02:00"));
    expect(late.errors.map((e) => e.code)).toEqual(
      expect.arrayContaining(["CAPTAIN_NOT_IN_SQUAD", "DEADLINE_PASSED"]),
    );
  });
});
