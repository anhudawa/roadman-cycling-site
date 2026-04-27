import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
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
import { getOrCreateAnonSessionKey } from "@/lib/rider-profile/anon-session";
import { checkPredictRateLimit } from "@/lib/race-predictor/rate-limit";

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
  if (typeof rider.bodyMass !== "number" || !Number.isFinite(rider.bodyMass)) {
    return "Body mass is required.";
  }
  if (rider.bodyMass < 40 || rider.bodyMass > 150) {
    return "Body mass should be between 40 and 150 kg — double-check that number.";
  }
  if (typeof rider.bikeMass !== "number" || !Number.isFinite(rider.bikeMass)) {
    return "Bike mass is required.";
  }
  if (rider.bikeMass < 5 || rider.bikeMass > 30) {
    return "Bike mass should be between 5 and 30 kg.";
  }
  if (typeof rider.position !== "string" || !VALID_POSITIONS.has(rider.position)) {
    return "Riding position is required.";
  }
  // FTP / power profile sanity check. The engine accepts a partial profile
  // (just FTP), but if a value is supplied it has to be plausible.
  const ftp = rider.powerProfile?.ftp;
  if (ftp !== undefined) {
    if (typeof ftp !== "number" || !Number.isFinite(ftp)) {
      return "FTP must be a number.";
    }
    if (ftp < 50 || ftp > 500) {
      return "FTP should be between 50 and 500 W. That's the realistic range — anything outside it points to a typo.";
    }
  }
  // CdA / Crr from the AI translator: clamp to sensible physics ranges.
  if (rider.cda !== undefined) {
    if (typeof rider.cda !== "number" || rider.cda < 0.15 || rider.cda > 0.55) {
      return "CdA must be between 0.15 and 0.55 m².";
    }
  }
  if (rider.crr !== undefined) {
    if (typeof rider.crr !== "number" || rider.crr < 0.001 || rider.crr > 0.05) {
      return "Crr must be between 0.001 and 0.05.";
    }
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
function ipHashFromRequest(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(request: Request) {
  let body: PredictBody;
  try {
    body = (await request.json()) as PredictBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const riderError = validateRider(body.rider);
  if (riderError) return NextResponse.json({ error: riderError }, { status: 400 });

  // Free-tier rate limit. Capped at PREDICT_FREE_DAILY (default 3) per
  // anon session per 24h. Returns 429 with a clear nudge toward the
  // Race Report when exhausted.
  const sessionKey = await getOrCreateAnonSessionKey();
  const rl = await checkPredictRateLimit({
    sessionKey,
    ipHash: ipHashFromRequest(request),
  });
  if (!rl.success) {
    const hours = Math.max(1, Math.round((rl.retryAfterSeconds ?? 0) / 3600));
    return NextResponse.json(
      {
        error: `You've used your ${rl.limit} free predictions for today. Reset in ~${hours}h — or grab a Race Report for the full pacing plan now.`,
        rateLimited: true,
        retryAfterSeconds: rl.retryAfterSeconds,
        limit: rl.limit,
      },
      { status: 429 },
    );
  }

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
