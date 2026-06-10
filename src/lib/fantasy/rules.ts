/**
 * Roadman Fantasy Tour — team-selection and transfer rules.
 *
 * Pure validation: the same functions run client-side in the builder
 * (instant feedback) and server-side on every save/transfer (the only
 * enforcement that counts). Error codes are stable identifiers the UI
 * maps to friendly copy.
 */

import type { FantasyGameConfig } from "./config";
import { restDayBonusesUnlocked } from "./config";

export interface SelectableRider {
  id: number;
  price: number;
  proTeamId: number;
  status: "provisional" | "confirmed" | "removed" | "dns" | "abandoned";
}

export type RuleErrorCode =
  | "SQUAD_SIZE"
  | "BUDGET_EXCEEDED"
  | "TEAM_CAP"
  | "MIN_CHEAP_RIDERS"
  | "DUPLICATE_RIDER"
  | "RIDER_UNAVAILABLE"
  | "TRANSFERS_EXHAUSTED"
  | "STAGE_CAP"
  | "RIDER_NOT_IN_SQUAD"
  | "RIDER_ALREADY_IN_SQUAD"
  | "DEADLINE_PASSED"
  | "CAPTAIN_NOT_IN_SQUAD";

export interface RuleError {
  code: RuleErrorCode;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: RuleError[];
}

/** Validate a full 8-rider squad against budget and composition rules. */
export function validateSquad(
  selection: SelectableRider[],
  config: FantasyGameConfig,
): ValidationResult {
  const errors: RuleError[] = [];

  if (selection.length !== config.squadSize) {
    errors.push({
      code: "SQUAD_SIZE",
      message: `Pick exactly ${config.squadSize} riders (you have ${selection.length}).`,
    });
  }

  const ids = new Set(selection.map((r) => r.id));
  if (ids.size !== selection.length) {
    errors.push({ code: "DUPLICATE_RIDER", message: "The same rider is in your squad twice." });
  }

  const spent = selection.reduce((sum, r) => sum + r.price, 0);
  if (spent > config.budget) {
    errors.push({
      code: "BUDGET_EXCEEDED",
      message: `Squad costs ${spent} credits — the budget is ${config.budget}.`,
    });
  }

  const perTeam = new Map<number, number>();
  for (const rider of selection) {
    perTeam.set(rider.proTeamId, (perTeam.get(rider.proTeamId) ?? 0) + 1);
  }
  for (const [, count] of perTeam) {
    if (count > config.maxPerProTeam) {
      errors.push({
        code: "TEAM_CAP",
        message: `Max ${config.maxPerProTeam} riders from any one pro team.`,
      });
      break;
    }
  }

  const cheapCount = selection.filter((r) => r.price <= config.minCheapRiders.maxPrice).length;
  if (selection.length === config.squadSize && cheapCount < config.minCheapRiders.count) {
    errors.push({
      code: "MIN_CHEAP_RIDERS",
      message: `At least ${config.minCheapRiders.count} rider${config.minCheapRiders.count > 1 ? "s" : ""} must cost ${config.minCheapRiders.maxPrice} credits or less.`,
    });
  }

  for (const rider of selection) {
    if (rider.status === "removed" || rider.status === "dns" || rider.status === "abandoned") {
      errors.push({
        code: "RIDER_UNAVAILABLE",
        message: "A rider in your squad is no longer in the race. Swap him out.",
      });
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}

export interface PriorTransfer {
  effectiveFromStage: number;
  kind: "standard" | "rest_day_bonus" | "grace";
}

export interface TransferBudget {
  /** Standard transfers used so far. */
  standardUsed: number;
  /** Standard transfers remaining out of transfersTotal. */
  standardRemaining: number;
  /** Rest-day bonus transfers unlocked for moves effective from this stage. */
  bonusesUnlocked: number;
  bonusesUsed: number;
  bonusesRemaining: number;
  /** Non-grace transfers already effective from this stage (per-stage cap). */
  usedThisStage: number;
}

export function transferBudget(
  priorTransfers: PriorTransfer[],
  effectiveFromStage: number,
  config: FantasyGameConfig,
): TransferBudget {
  const standardUsed = priorTransfers.filter((t) => t.kind === "standard").length;
  const bonusesUsed = priorTransfers.filter((t) => t.kind === "rest_day_bonus").length;
  const bonusesUnlocked = restDayBonusesUnlocked(effectiveFromStage, config);
  const usedThisStage = priorTransfers.filter(
    (t) =>
      t.effectiveFromStage === effectiveFromStage &&
      (t.kind === "standard" ||
        (t.kind === "rest_day_bonus" && !config.restDayBonusExemptFromStageCap)),
  ).length;
  return {
    standardUsed,
    standardRemaining: Math.max(0, config.transfersTotal - standardUsed),
    bonusesUnlocked,
    bonusesUsed,
    bonusesRemaining: Math.max(0, bonusesUnlocked - bonusesUsed),
    usedThisStage,
  };
}

export interface TransferRequest {
  riderOutId: number;
  riderInId: number;
  /** Squad as of the transfer's effective stage. */
  currentSquad: SelectableRider[];
  riderIn: SelectableRider;
  effectiveFromStage: number;
  priorTransfers: PriorTransfer[];
  /** Official start time of the effective stage (the lock), if known. */
  stageStartTime: Date | null;
  now: Date;
  /** Pre-Tour (before the Stage 1 deadline) edits are unlimited and free. */
  isPreTour: boolean;
  /** Grace swap for a rider flagged DNS before Stage 1. */
  isGrace?: boolean;
}

export interface TransferDecision extends ValidationResult {
  /** How the transfer will be booked if valid. */
  kind: "standard" | "rest_day_bonus" | "grace" | "pre_tour";
}

/**
 * Validate one in-Tour transfer (or a pre-Tour/grace edit) and decide
 * which allowance it consumes. Standard allowance is consumed before
 * rest-day bonuses so the bonus stays in hand as long as possible.
 */
export function validateTransfer(
  request: TransferRequest,
  config: FantasyGameConfig,
): TransferDecision {
  const errors: RuleError[] = [];
  const squadIds = new Set(request.currentSquad.map((r) => r.id));

  if (!squadIds.has(request.riderOutId)) {
    errors.push({ code: "RIDER_NOT_IN_SQUAD", message: "The rider you're replacing isn't in your squad." });
  }
  if (squadIds.has(request.riderInId)) {
    errors.push({ code: "RIDER_ALREADY_IN_SQUAD", message: "That rider is already in your squad." });
  }
  if (
    request.riderIn.status === "removed" ||
    request.riderIn.status === "dns" ||
    request.riderIn.status === "abandoned"
  ) {
    errors.push({ code: "RIDER_UNAVAILABLE", message: "That rider is out of the race." });
  }

  if (request.stageStartTime && request.now >= request.stageStartTime) {
    errors.push({
      code: "DEADLINE_PASSED",
      message: "Transfers locked when the stage rolled out. They reopen for the next stage.",
    });
  }

  // The resulting squad must still satisfy every composition rule.
  const newSquad = request.currentSquad
    .filter((r) => r.id !== request.riderOutId)
    .concat(request.riderIn);
  errors.push(...validateSquad(newSquad, config).errors);

  if (request.isPreTour) {
    return { valid: errors.length === 0, errors, kind: "pre_tour" };
  }
  if (request.isGrace) {
    return { valid: errors.length === 0, errors, kind: "grace" };
  }

  const budget = transferBudget(request.priorTransfers, request.effectiveFromStage, config);

  if (budget.usedThisStage >= config.transfersPerStage) {
    errors.push({
      code: "STAGE_CAP",
      message: `Max ${config.transfersPerStage} transfers before any one stage.`,
    });
  }

  let kind: TransferDecision["kind"] = "standard";
  if (budget.standardRemaining <= 0) {
    if (budget.bonusesRemaining > 0) {
      kind = "rest_day_bonus";
    } else {
      errors.push({
        code: "TRANSFERS_EXHAUSTED",
        message: "No transfers left. Rest days unlock one bonus transfer each.",
      });
    }
  }

  return { valid: errors.length === 0, errors, kind };
}

/** Captain must be in the squad as of the stage being captained. */
export function validateCaptainPick(
  riderId: number,
  squadRiderIds: number[],
  stageStartTime: Date | null,
  now: Date,
): ValidationResult {
  const errors: RuleError[] = [];
  if (!squadRiderIds.includes(riderId)) {
    errors.push({ code: "CAPTAIN_NOT_IN_SQUAD", message: "Your captain must be in your squad." });
  }
  if (stageStartTime && now >= stageStartTime) {
    errors.push({
      code: "DEADLINE_PASSED",
      message: "Captain picks locked when the stage rolled out.",
    });
  }
  return { valid: errors.length === 0, errors };
}
