import { NextResponse } from "next/server";
import { getPredictionBySlug, getCourseById } from "@/lib/race-predictor/store";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/predict/[slug]
 * Public retrieval — used by the result page to render the prediction.
 * Returns shape suitable for direct UI consumption.
 */
export async function GET(_request: Request, ctx: RouteContext) {
  const { slug } = await ctx.params;
  if (!slug || !/^[a-z0-9-]{6,40}$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug." }, { status: 400 });
  }
  const prediction = await getPredictionBySlug(slug);
  if (!prediction) {
    return NextResponse.json({ error: "Prediction not found." }, { status: 404 });
  }
  const course = prediction.courseId
    ? await getCourseById(prediction.courseId)
    : null;

  return NextResponse.json({
    slug: prediction.slug,
    mode: prediction.mode,
    predictedTimeS: prediction.predictedTimeS,
    confidenceLowS: prediction.confidenceLowS,
    confidenceHighS: prediction.confidenceHighS,
    averagePower: prediction.averagePower,
    normalizedPower: prediction.normalizedPower,
    variabilityIndex: prediction.variabilityIndex,
    rider: prediction.riderInputs,
    environment: prediction.environmentInputs,
    pacingPlan: prediction.pacingPlan,
    resultSummary: prediction.resultSummary,
    isPaid: prediction.isPaid,
    course: course
      ? {
          slug: course.slug,
          name: course.name,
          country: course.country,
          region: course.region,
          discipline: course.discipline,
          distanceM: course.distanceM,
          elevationGainM: course.elevationGainM,
        }
      : null,
    courseDataAvailable: Boolean(prediction.courseData || course),
    createdAt: prediction.createdAt.toISOString(),
  });
}
