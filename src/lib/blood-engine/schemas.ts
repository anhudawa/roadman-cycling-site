/**
 * Hand-rolled validators + TypeScript types for Blood Engine payloads.
 *
 * We avoid a runtime schema library (zod, valibot) to keep bundle size down
 * and because the shapes here are small and stable. All validators throw on
 * invalid input with a specific error message.
 */

import { isValidMarkerId, type MarkerId, type Sex } from "./markers";

// ── Context ──────────────────────────────────────────────────────────────

export type TrainingPhase = "base" | "build" | "peak" | "recovery" | "off-season";

export const TRAINING_PHASES: TrainingPhase[] = [
  "base",
  "build",
  "peak",
  "recovery",
  "off-season",
];

export type Symptom =
  | "fatigue"
  | "plateau"
  | "poor_recovery"
  | "frequent_illness"
  | "low_motivation"
  | "stalled_ftp"
  | "weight_gain"
  | "sleep_issues"
  | "none";

export const SYMPTOMS: { id: Symptom; label: string }[] = [
  { id: "fatigue", label: "Persistent fatigue" },
  { id: "plateau", label: "Performance plateau" },
  { id: "poor_recovery", label: "Poor recovery between sessions" },
  { id: "frequent_illness", label: "Frequent illness" },
  { id: "low_motivation", label: "Low motivation" },
  { id: "stalled_ftp", label: "Stalled FTP" },
  { id: "weight_gain", label: "Unexplained weight gain" },
  { id: "sleep_issues", label: "Sleep issues" },
  { id: "none", label: "None of the above" },
];

export interface ReportContext {
  age: number;
  sex: Sex;
  trainingHoursPerWeek: number;
  trainingPhase: TrainingPhase;
  symptoms: Symptom[];
  drawDate: string; // ISO yyyy-mm-dd
}

export function validateContext(raw: unknown): ReportContext {
  if (!raw || typeof raw !== "object") throw new Error("context must be an object");
  const c = raw as Record<string, unknown>;
  const age = Number(c.age);
  if (!Number.isFinite(age) || age < 16 || age > 100) {
    throw new Error("context.age must be between 16 and 100");
  }
  if (c.sex !== "m" && c.sex !== "f") {
    throw new Error("context.sex must be 'm' or 'f'");
  }
  const hours = Number(c.trainingHoursPerWeek);
  if (!Number.isFinite(hours) || hours < 0 || hours > 40) {
    throw new Error("context.trainingHoursPerWeek must be between 0 and 40");
  }
  if (typeof c.trainingPhase !== "string" || !TRAINING_PHASES.includes(c.trainingPhase as TrainingPhase)) {
    throw new Error(`context.trainingPhase must be one of: ${TRAINING_PHASES.join(", ")}`);
  }
  if (!Array.isArray(c.symptoms)) {
    throw new Error("context.symptoms must be an array");
  }
  const validSymptomIds = new Set(SYMPTOMS.map((s) => s.id));
  for (const s of c.symptoms) {
    if (typeof s !== "string" || !validSymptomIds.has(s as Symptom)) {
      throw new Error(`context.symptoms contains invalid id "${String(s)}"`);
    }
  }
  if (typeof c.drawDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(c.drawDate)) {
    throw new Error("context.drawDate must be ISO yyyy-mm-dd");
  }
  return {
    age,
    sex: c.sex,
    trainingHoursPerWeek: hours,
    trainingPhase: c.trainingPhase as TrainingPhase,
    symptoms: c.symptoms as Symptom[],
    drawDate: c.drawDate,
  };
}

// ── Raw + Normalized marker results ──────────────────────────────────────

export interface RawMarkerValue {
  markerId: MarkerId;
  value: number;
  unit: string;
}

export interface NormalizedMarkerValue {
  markerId: MarkerId;
  /** Value in the marker's canonical unit (see markers.ts). */
  canonicalValue: number;
  /** What the user originally entered — preserved for audit + display. */
  originalValue: number;
  originalUnit: string;
}

export function validateRawResults(raw: unknown): RawMarkerValue[] {
  if (!Array.isArray(raw)) throw new Error("results must be an array");
  const out: RawMarkerValue[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") throw new Error("each result must be an object");
    const rec = r as Record<string, unknown>;
    if (typeof rec.markerId !== "string" || !isValidMarkerId(rec.markerId)) {
      throw new Error(`invalid markerId "${String(rec.markerId)}"`);
    }
    const v = Number(rec.value);
    if (!Number.isFinite(v)) throw new Error(`result.value for ${rec.markerId} must be a number`);
    if (typeof rec.unit !== "string") throw new Error(`result.unit for ${rec.markerId} must be a string`);
    out.push({ markerId: rec.markerId, value: v, unit: rec.unit });
  }
  return out;
}

// ── Interpretation response shape (what Claude returns) ──────────────────

export type OverallStatus = "optimal" | "suboptimal" | "flag";

export interface InterpretationMarker {
  markerId: MarkerId;
  name: string;
  value: number;
  unit: string;
  athlete_optimal_range: string;
  status: OverallStatus;
  interpretation: string;
  action: string;
}

export type DetectedPatternSeverity = "monitor" | "address" | "urgent";

export interface DetectedPattern {
  name: string;
  description: string;
  severity: DetectedPatternSeverity;
}

export interface ActionPlanItem {
  priority: number;
  action: string;
  timeframe: string;
}

export type RetestTimeframe = "8 weeks" | "12 weeks" | "6 months";

export interface RetestRecommendation {
  timeframe: RetestTimeframe;
  focus_markers: string[];
}

export interface InterpretationJSON {
  overall_status: OverallStatus;
  summary: string;
  markers: InterpretationMarker[];
  detected_patterns: DetectedPattern[];
  action_plan: ActionPlanItem[];
  retest_recommendation: RetestRecommendation;
  medical_disclaimer: string;
}

/** Throws if the shape is wrong. Fields we don't strictly need are coerced leniently. */
export function validateInterpretation(raw: unknown): InterpretationJSON {
  if (!raw || typeof raw !== "object") throw new Error("interpretation must be an object");
  const i = raw as Record<string, unknown>;
  const overall = i.overall_status;
  if (overall !== "optimal" && overall !== "suboptimal" && overall !== "flag") {
    throw new Error(`interpretation.overall_status invalid: ${String(overall)}`);
  }
  if (typeof i.summary !== "string") throw new Error("interpretation.summary must be a string");
  if (!Array.isArray(i.markers)) throw new Error("interpretation.markers must be an array");
  if (!Array.isArray(i.detected_patterns)) throw new Error("interpretation.detected_patterns must be an array");
  if (!Array.isArray(i.action_plan)) throw new Error("interpretation.action_plan must be an array");
  const retest = i.retest_recommendation as Record<string, unknown> | undefined;
  if (!retest || typeof retest !== "object") {
    throw new Error("interpretation.retest_recommendation required");
  }
  if (
    retest.timeframe !== "8 weeks" &&
    retest.timeframe !== "12 weeks" &&
    retest.timeframe !== "6 months"
  ) {
    throw new Error(`interpretation.retest_recommendation.timeframe invalid: ${String(retest.timeframe)}`);
  }
  if (typeof i.medical_disclaimer !== "string") {
    throw new Error("interpretation.medical_disclaimer must be a string");
  }
  return i as unknown as InterpretationJSON;
}

/** Convert retest timeframe string to days for scheduling nudges. */
export function retestTimeframeToDays(tf: RetestTimeframe): number {
  switch (tf) {
    case "8 weeks":
      return 8 * 7;
    case "12 weeks":
      return 12 * 7;
    case "6 months":
      return 182; // ~6 months, keep it simple
  }
}
