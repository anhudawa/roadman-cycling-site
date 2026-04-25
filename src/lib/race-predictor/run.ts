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
  position: RidingPosition;
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
  const cda = input.cda ?? CDA_BY_POSITION[input.position];
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
  const hasExplicitCda = typeof rider.cda === "number";
  const hasExplicitCrr = typeof rider.crr === "number";
  const hasFullPdCurve =
    rider.powerProfile?.p20min !== undefined &&
    rider.powerProfile?.p60min !== undefined;
  if (hasExplicitCda && hasExplicitCrr && hasFullPdCurve) return "high";
  if (hasFullPdCurve || (hasExplicitCda && hasExplicitCrr)) return "default";
  return "low";
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
  const targetIF = args.mode === "can_i_make_it" ? 0.80 : 0.85;

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
