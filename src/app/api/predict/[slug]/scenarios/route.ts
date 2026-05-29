import { NextResponse } from "next/server";
import { simulateCourse } from "@/lib/race-predictor/engine";
import {
  composePacingMultiplier,
  scalePowerProfileForFtp,
} from "@/lib/race-predictor/scenarios";
import {
  getCourseById,
  getPredictionBySlug,
} from "@/lib/race-predictor/store";
import type {
  Course,
  Environment,
  RiderProfile,
} from "@/lib/race-predictor/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ScenarioBody {
  // Rider deltas
  ftpDeltaW?: number;
  bodyMassDeltaKg?: number;
  // Environment overrides (absolute, not deltas)
  windSpeedMs?: number;
  airTemperatureC?: number;
  // Pacing scaling
  pacingMultiplier?: number;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/**
 * POST /api/predict/[slug]/scenarios
 *
 * Run a what-if scenario against a saved prediction. Reuses the saved
 * course geometry, rider profile, and environment as the baseline; applies
 * the requested deltas; returns the new total time so the result-page
 * sliders can show "this change saves N min" without leaving the page.
 *
 * Pure compute — does not persist the scenario.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const prediction = await getPredictionBySlug(slug);
  if (!prediction)
    return NextResponse.json({ error: "Prediction not found." }, { status: 404 });

  let body: ScenarioBody = {};
  try {
    body = (await request.json()) as ScenarioBody;
  } catch {
    // Empty body = recompute baseline. Useful for cache-warming.
  }

  // Resolve the course geometry: prefer the inlined snapshot, otherwise
  // fetch from the catalog by id.
  let course: Course | null = prediction.courseData;
  if (!course && prediction.courseId) {
    const row = await getCourseById(prediction.courseId);
    course = row?.courseData ?? null;
  }
  if (!course)
    return NextResponse.json(
      { error: "Course geometry unavailable." },
      { status: 500 },
    );

  const baselineRider = prediction.riderInputs as RiderProfile;
  const baselineEnv = prediction.environmentInputs as Environment;

  // Apply deltas. Clamp aggressively — the engine is robust but extreme
  // inputs are useless to the user and waste cycles.
  const ftpDelta = clamp(body.ftpDeltaW ?? 0, -80, 80);
  const massDelta = clamp(body.bodyMassDeltaKg ?? 0, -10, 10);
  const baselineFtp = baselineRider.powerProfile.p60min;

  // FTP-delta scaling: a change in FTP is a change in *threshold* fitness, so
  // only the threshold anchors (p20min, p60min) move with it; the
  // neuromuscular/anaerobic anchors (p5s, p1min, p5min) reflect a separate
  // physiological system and are left untouched. (The old code shifted every
  // anchor by ftpDelta times the FTP-*synthesis* multipliers — 3.6, 1.85, ...
  // — which only make sense as ×FTP absolute estimates for an FTP-only rider,
  // never as per-watt deltas: it turned a +30 W FTP gain into a nonsensical
  // +108 W sprint gain.) See scalePowerProfileForFtp.
  const scaledProfile = scalePowerProfileForFtp(
    baselineRider.powerProfile,
    ftpDelta,
  );
  const newFtp = scaledProfile.p60min;
  const rider: RiderProfile = {
    ...baselineRider,
    bodyMass: clamp(baselineRider.bodyMass + massDelta, 35, 140),
    powerProfile: scaledProfile,
  };

  const environment: Environment = {
    ...baselineEnv,
    airTemperature:
      typeof body.airTemperatureC === "number"
        ? clamp(body.airTemperatureC, -10, 45)
        : baselineEnv.airTemperature,
    windSpeed:
      typeof body.windSpeedMs === "number"
        ? clamp(body.windSpeedMs, 0, 20)
        : baselineEnv.windSpeed,
  };

  // Pacing composition.
  //
  // An FTP change *re-anchors* the sustainable pacing target to the new
  // threshold; the user's pacing slider then biases *around* that re-anchored
  // target. These are two conceptually different moves, so they must NOT
  // compound multiplicatively (the old code used
  // `clamp(slider) * ftpScale`, so e.g. +10% FTP and a 1.10 slider became
  // 1.21 — a 21% jump the user never asked for).
  //
  // Composition chosen — additive in fractional terms (see
  // composePacingMultiplier):
  //   ftpScale   = newFtp / baselineFtp            (re-anchor, e.g. 1.10)
  //   sliderBias = clamp(slider, 0.7, 1.15) − 1    (bias *around* anchor)
  //   multiplier = ftpScale + sliderBias
  // So +10% FTP with a +10% slider gives 1.10 + 0.10 = 1.20, i.e. the two
  // effects add rather than multiply (1.21). With the slider at its neutral
  // 1.0, multiplier === ftpScale (pure re-anchor); with FTP unchanged,
  // multiplier === clamp(slider) (pure slider).
  const baselinePacing = prediction.pacingPlan ?? course.segments.map(() => baselineFtp * 0.85);
  const multiplier = composePacingMultiplier(
    baselineFtp,
    newFtp,
    body.pacingMultiplier ?? 1,
  );
  const pacing = baselinePacing.map((p) => p * multiplier);

  const result = simulateCourse({ course, rider, environment, pacing });

  return NextResponse.json({
    totalTimeS: Math.round(result.totalTime),
    totalTimeDeltaS: Math.round(result.totalTime - prediction.predictedTimeS),
    averageSpeedKmh: Math.round(result.averageSpeed * 36) / 10,
    averagePowerW: Math.round(result.averagePower),
    normalizedPowerW: Math.round(result.normalizedPower),
    variabilityIndex: Math.round(result.variabilityIndex * 100) / 100,
  });
}
