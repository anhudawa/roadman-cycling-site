import { NextResponse } from "next/server";
import { normaliseEmail } from "@/lib/validation";
import {
  getPredictionBySlug,
  recordActualResult,
} from "@/lib/race-predictor/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ActualResultBody {
  actualTimeS?: number;
  averagePower?: number;
  rideFileUrl?: string;
  email?: string;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * POST /api/predict/[slug]/actual
 *
 * Captures a rider's real finish time after race day. This is the calibration
 * loop that lets Roadman measure real model error by course and tighten the
 * physics over time instead of relying on generic benchmark claims.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!slug || !/^[a-z0-9-]{4,40}$/.test(slug)) {
    return NextResponse.json({ error: "Invalid prediction." }, { status: 400 });
  }

  let body: ActualResultBody;
  try {
    body = (await request.json()) as ActualResultBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const prediction = await getPredictionBySlug(slug);
  if (!prediction) {
    return NextResponse.json({ error: "Prediction not found." }, { status: 404 });
  }

  const actualTimeS = finiteNumber(body.actualTimeS);
  if (!actualTimeS || actualTimeS < 10 * 60 || actualTimeS > 48 * 3600) {
    return NextResponse.json(
      { error: "Enter a real finish time between 10 minutes and 48 hours." },
      { status: 400 },
    );
  }

  const averagePower = finiteNumber(body.averagePower);
  if (averagePower != null && (averagePower < 50 || averagePower > 700)) {
    return NextResponse.json(
      { error: "Average power should be between 50 W and 700 W." },
      { status: 400 },
    );
  }

  const email = normaliseEmail(body.email);
  const rideFileUrl =
    typeof body.rideFileUrl === "string" && body.rideFileUrl.trim()
      ? body.rideFileUrl.trim().slice(0, 500)
      : undefined;

  const modelErrorPct =
    ((prediction.predictedTimeS - actualTimeS) / actualTimeS) * 100;
  const absoluteErrorS = Math.abs(prediction.predictedTimeS - actualTimeS);

  await recordActualResult({
    predictionId: prediction.id,
    actualTimeS: Math.round(actualTimeS),
    averagePower: averagePower != null ? Math.round(averagePower) : undefined,
    rideFileUrl,
    modelErrorPct,
    submittedEmail: email ?? prediction.email ?? undefined,
    analysis: {
      predictedTimeS: prediction.predictedTimeS,
      absoluteErrorS: Math.round(absoluteErrorS),
      signedErrorS: Math.round(prediction.predictedTimeS - actualTimeS),
      mode: prediction.mode,
      engineVersion: prediction.engineVersion,
    },
  });

  return NextResponse.json({
    saved: true,
    predictedTimeS: prediction.predictedTimeS,
    actualTimeS: Math.round(actualTimeS),
    signedErrorS: Math.round(prediction.predictedTimeS - actualTimeS),
    absoluteErrorS: Math.round(absoluteErrorS),
    modelErrorPct: Math.round(modelErrorPct * 100) / 100,
  });
}
