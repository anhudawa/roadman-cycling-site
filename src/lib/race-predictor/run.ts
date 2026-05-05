// Orchestrator: turn UI inputs into a saved Prediction row.
// Pulls together engine + pacing + insights + persistence.

import {
  CDA_BY_POSITION,
  CRR_BY_SURFACE,
  DEFAULT_DRIVETRAIN_EFFICIENCY,
} from "./constants";
import { simulateCourse } from "./engine";
import { optimizePacing } from "./pacing";
import { fitCpModel, sustainablePower } from "./rider";
import {
  confidenceBracket,
  pickKeyInsight,
  type KeyInsight,
  type Precision,
} from "./insights";
import type {
  Course,
  CourseResult,
  Environment,
  PowerProfile,
  RiderProfile,
  RidingPosition,
  SurfaceType,
} from "./types";

export interface RiderInputDTO {
  bodyMass: number;
  bikeMass: number;
  heightCm?: number;
  position: RidingPosition;
  drafting?: DraftingAssumption;
  eventType?: RaceEventType;
  cda?: number;            // optional override; otherwise from position
  crr?: number;            // optional override; otherwise from surface
  surface?: SurfaceType;
  drivetrainEfficiency?: number;
  /** Either supply a full PD curve, or just FTP (we'll synthesise a curve). */
  powerProfile?: Partial<PowerProfile> & { ftp?: number };
}

export interface EnvironmentInputDTO {
  airTemperatureC?: number;
  relativeHumidity?: number;
  airPressurePa?: number;
  windSpeedMs?: number;
  windDirectionRad?: number;
}

export type PredictMode = "can_i_make_it" | "plan_my_race";
export type DraftingAssumption = "solo" | "small_group" | "large_group";
export type RaceEventType =
  | "sportive"
  | "gran_fondo"
  | "road_race"
  | "time_trial"
  | "gravel"
  | "triathlon";

const DRAFTING_CDA_MULTIPLIER: Record<DraftingAssumption, number> = {
  solo: 1,
  small_group: 0.88,
  large_group: 0.78,
};

function heightCdaMultiplier(heightCm?: number): number {
  if (typeof heightCm !== "number" || !Number.isFinite(heightCm)) return 1;
  const ratio = (heightCm - 175) / 100;
  return Math.min(1.08, Math.max(0.93, 1 + ratio * 0.35));
}

const EVENT_TARGET_IF: Record<RaceEventType, { plan: number; finish: number }> = {
  sportive: { plan: 0.84, finish: 0.78 },
  gran_fondo: { plan: 0.85, finish: 0.79 },
  road_race: { plan: 0.87, finish: 0.80 },
  time_trial: { plan: 0.88, finish: 0.82 },
  gravel: { plan: 0.82, finish: 0.76 },
  triathlon: { plan: 0.78, finish: 0.72 },
};

export interface RunPredictArgs {
  course: Course;
  rider: RiderInputDTO;
  environment?: EnvironmentInputDTO;
  mode: PredictMode;
}

export interface PredictionRunResult {
  rider: RiderProfile;
  environment: Environment;
  result: CourseResult;
  pacing: number[];
  insight: KeyInsight;
  confidence: { low: number; high: number };
}

/** Default PD curve given just FTP. Conservative — better data improves it. */
export function synthesizePowerProfile(ftp: number): PowerProfile {
  return {
    p5s: ftp * 3.6,
    p1min: ftp * 1.85,
    p5min: ftp * 1.15,
    p20min: ftp * 1.05,
    p60min: ftp * 0.95,
    durabilityFactor: 0.05,
  };
}

export function buildRiderProfile(input: RiderInputDTO): RiderProfile {
  const baseCda = input.cda ?? CDA_BY_POSITION[input.position];
  const drafting = input.drafting ?? "solo";
  const sizeMultiplier = input.cda ? 1 : heightCdaMultiplier(input.heightCm);
  const cda = baseCda * sizeMultiplier * DRAFTING_CDA_MULTIPLIER[drafting];
  const crr =
    input.crr ?? (input.surface ? CRR_BY_SURFACE[input.surface] : 0.0034);
  // FTP precedence: explicit ftp → derive from p20min (×0.95) → 250 default.
  const ftp =
    input.powerProfile?.ftp ??
    (input.powerProfile?.p20min
      ? Math.round(input.powerProfile.p20min * 0.95)
      : 250);
  const fallback = synthesizePowerProfile(ftp);
  const powerProfile: PowerProfile = {
    p5s: input.powerProfile?.p5s ?? fallback.p5s,
    p1min: input.powerProfile?.p1min ?? fallback.p1min,
    p5min: input.powerProfile?.p5min ?? fallback.p5min,
    p20min: input.powerProfile?.p20min ?? fallback.p20min,
    p60min: input.powerProfile?.p60min ?? fallback.p60min,
    durabilityFactor: input.powerProfile?.durabilityFactor ?? 0.05,
  };
  return {
    bodyMass: input.bodyMass,
    bikeMass: input.bikeMass,
    position: input.position,
    cda,
    crr,
    drivetrainEfficiency:
      input.drivetrainEfficiency ?? DEFAULT_DRIVETRAIN_EFFICIENCY,
    powerProfile,
  };
}

/**
 * Pick the precision tier for the confidence band based on what the rider
 * actually supplied. Explicit CdA + Crr + a real PD curve → ±1.5 %. FTP-only
 * with default position → ±3 %. The defaults must under-promise: riders
 * forgive a prediction they beat far more readily than one they miss.
 */
function inferPrecision(rider: RiderInputDTO): Precision {
  if (rider.drafting && rider.drafting !== "solo") return "low";
  if (rider.eventType === "road_race" || rider.eventType === "gravel") {
    return "low";
  }
  const hasExplicitCda = typeof rider.cda === "number";
  const hasExplicitCrr = typeof rider.crr === "number";
  const hasFullPdCurve =
    rider.powerProfile?.p20min !== undefined &&
    rider.powerProfile?.p60min !== undefined;
  if (hasExplicitCda && hasExplicitCrr && hasFullPdCurve) return "high";
  if (hasFullPdCurve || (hasExplicitCda && hasExplicitCrr)) return "default";
  return "low";
}

function targetIntensityFactor(mode: PredictMode, eventType: RaceEventType): number {
  const target = EVENT_TARGET_IF[eventType];
  return mode === "can_i_make_it" ? target.finish : target.plan;
}

export function buildEnvironment(input?: EnvironmentInputDTO): Environment {
  return {
    airTemperature: input?.airTemperatureC ?? 15,
    relativeHumidity: input?.relativeHumidity ?? 0.6,
    airPressure: input?.airPressurePa ?? 101325,
    windSpeed: input?.windSpeedMs ?? 0,
    windDirection: input?.windDirectionRad ?? 0,
  };
}

/**
 * Run the prediction end to end. Pure compute — no DB, no HTTP.
 *
 * Mode shapes the pacing strategy:
 *   - plan_my_race: durability-aware variable-power optimisation.
 *   - can_i_make_it: hold an "honest" 0.80 IF baseline so the time we report
 *     is what the rider can actually deliver, not what an optimiser delivers.
 */
export function runPrediction(args: RunPredictArgs): PredictionRunResult {
  const rider = buildRiderProfile(args.rider);
  const environment = buildEnvironment(args.environment);

  const cpModel = fitCpModel(rider.powerProfile);
  const eventType = args.rider.eventType ?? "sportive";
  const targetIF = targetIntensityFactor(args.mode, eventType);

  const pacing =
    args.mode === "can_i_make_it"
      ? args.course.segments.map(() => cpModel.cp * targetIF)
      : optimizePacing({
          course: args.course,
          rider,
          environment,
          targetIF,
        });

  // Apply durability scaling for predicted-events past 1 h: cap mean power at
  // sustainable level so we don't promise the rider a time their PD curve
  // can't hold. This is the core differentiator vs BBS.
  const baseline = simulateCourse({
    course: args.course,
    rider,
    environment,
    pacing,
  });
  const sustainable = sustainablePower(
    { ...cpModel, durabilityFactor: rider.powerProfile.durabilityFactor },
    baseline.totalTime,
  );
  const meanCurrent =
    pacing.reduce((s, p) => s + p, 0) / Math.max(1, pacing.length);
  const adjustedPacing =
    meanCurrent > sustainable && sustainable > 0
      ? pacing.map((p) => p * (sustainable / meanCurrent))
      : pacing;

  const result =
    adjustedPacing === pacing
      ? baseline
      : simulateCourse({
          course: args.course,
          rider,
          environment,
          pacing: adjustedPacing,
        });

  const precision = inferPrecision(args.rider);
  const confidence = confidenceBracket(result.totalTime, { precision });
  const insight = pickKeyInsight({ course: args.course, result, rider });

  return {
    rider,
    environment,
    result,
    pacing: adjustedPacing,
    insight,
    confidence,
  };
}
