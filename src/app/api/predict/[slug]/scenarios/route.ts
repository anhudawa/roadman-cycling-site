import { NextResponse } from "next/server";
import { simulateCourse } from "@/lib/race-predictor/engine";
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

  const rider: RiderProfile = {
    ...baselineRider,
    bodyMass: clamp(baselineRider.bodyMass + massDelta, 35, 140),
    powerProfile: {
      ...baselineRider.powerProfile,
      p5s: baselineRider.powerProfile.p5s + ftpDelta * 3.6,
      p1min: baselineRider.powerProfile.p1min + ftpDelta * 1.85,
      p5min: baselineRider.powerProfile.p5min + ftpDelta * 1.15,
      p20min: baselineRider.powerProfile.p20min + ftpDelta * 1.05,
      p60min: Math.max(80, baselineFtp + ftpDelta),
    },
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

  // Pacing: scale baseline plan; if power changed, anchor target to the
  // new FTP so the pacing target moves with the rider.
  const baselinePacing = prediction.pacingPlan ?? course.segments.map(() => baselineFtp * 0.85);
  const ftpScale = baselineFtp > 0 ? rider.powerProfile.p60min / baselineFtp : 1;
  const multiplier = clamp(body.pacingMultiplier ?? 1, 0.7, 1.15) * ftpScale;
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
