import { NextResponse } from "next/server";
import { normaliseEmail } from "@/lib/validation";
import {
  buildEnvironment,
  buildRiderProfile,
  runPrediction,
  type EnvironmentInputDTO,
  type PredictMode,
  type RiderInputDTO,
} from "@/lib/race-predictor/run";
import { buildCourse } from "@/lib/race-predictor/gpx";
import { createPrediction, getCourseBySlug, gpxHash } from "@/lib/race-predictor/store";
import type { Course, TrackPoint } from "@/lib/race-predictor/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PredictBody {
  courseSlug?: string;
  gpxPoints?: TrackPoint[];
  rider?: RiderInputDTO;
  environment?: EnvironmentInputDTO;
  mode?: PredictMode;
  email?: string;
}

const VALID_POSITIONS = new Set([
  "tt_bars",
  "aero_drops",
  "aero_hoods",
  "endurance_hoods",
  "standard_hoods",
  "climbing",
]);

function validateRider(rider: RiderInputDTO | undefined): string | null {
  if (!rider) return "Missing rider profile.";
  if (typeof rider.bodyMass !== "number" || rider.bodyMass < 30 || rider.bodyMass > 150) {
    return "Body mass must be between 30 and 150 kg.";
  }
  if (typeof rider.bikeMass !== "number" || rider.bikeMass < 5 || rider.bikeMass > 30) {
    return "Bike mass must be between 5 and 30 kg.";
  }
  if (typeof rider.position !== "string" || !VALID_POSITIONS.has(rider.position)) {
    return "Riding position is required.";
  }
  return null;
}

/**
 * POST /api/predict
 *
 * Body: { courseSlug? | gpxPoints?, rider, environment?, mode, email? }
 *
 * Either a curated course slug or an uploaded GPX point set must be provided.
 * Returns the saved prediction's slug + summary so the client can redirect to
 * /predict/[slug] for the result page.
 */
export async function POST(request: Request) {
  let body: PredictBody;
  try {
    body = (await request.json()) as PredictBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const riderError = validateRider(body.rider);
  if (riderError) return NextResponse.json({ error: riderError }, { status: 400 });

  const mode: PredictMode = body.mode === "can_i_make_it" ? "can_i_make_it" : "plan_my_race";
  const email = normaliseEmail(body.email) ?? null;

  let course: Course | null = null;
  let courseId: number | null = null;
  let courseGpxHashStr: string | null = null;

  if (body.courseSlug) {
    const row = await getCourseBySlug(body.courseSlug);
    if (!row) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }
    course = row.courseData;
    courseId = row.id;
  } else if (Array.isArray(body.gpxPoints) && body.gpxPoints.length >= 50) {
    try {
      course = buildCourse(body.gpxPoints);
      courseGpxHashStr = gpxHash(body.gpxPoints);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid GPX data.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  } else {
    return NextResponse.json(
      { error: "Provide either courseSlug or at least 50 gpxPoints." },
      { status: 400 },
    );
  }

  if (!course) {
    return NextResponse.json({ error: "Course unavailable." }, { status: 500 });
  }

  const run = runPrediction({
    course,
    rider: body.rider as RiderInputDTO,
    environment: body.environment,
    mode,
  });

  const prediction = await createPrediction({
    courseId,
    courseGpxHash: courseGpxHashStr,
    courseData: courseId ? null : course, // only snapshot if not in catalog
    mode,
    predictedTimeS: Math.round(run.result.totalTime),
    confidenceLowS: run.confidence.low,
    confidenceHighS: run.confidence.high,
    averagePower: Math.round(run.result.averagePower),
    normalizedPower: Math.round(run.result.normalizedPower),
    variabilityIndex: run.result.variabilityIndex,
    riderInputs: run.rider,
    environmentInputs: run.environment,
    pacingPlan: run.pacing,
    resultSummary: {
      insight: run.insight,
      averageSpeedKmh: run.result.averageSpeed * 3.6,
      totalDistanceKm: run.result.totalDistance / 1000,
      climbCount: course.climbs.length,
    },
    email,
  });

  return NextResponse.json({
    slug: prediction.slug,
    predictedTimeS: prediction.predictedTimeS,
    confidenceLowS: prediction.confidenceLowS,
    confidenceHighS: prediction.confidenceHighS,
    insight: run.insight,
    summary: {
      distanceKm: course.totalDistance / 1000,
      elevationGainM: course.totalElevationGain,
      climbs: course.climbs.length,
      averagePower: Math.round(run.result.averagePower),
      averageSpeedKmh: run.result.averageSpeed * 3.6,
    },
  });
}
