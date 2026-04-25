import { NextResponse } from "next/server";
import { listVerifiedCourses } from "@/lib/race-predictor/store";

export const runtime = "nodejs";

/**
 * GET /api/courses
 * Public catalog of curated event courses (Etape, Marmotte, etc).
 * Returns a slim summary suitable for the dropdown / picker UI;
 * full course geometry is loaded by the predict endpoint.
 */
export async function GET() {
  const courses = await listVerifiedCourses();
  return NextResponse.json({
    courses: courses.map((c) => ({
      slug: c.slug,
      name: c.name,
      country: c.country,
      region: c.region,
      discipline: c.discipline,
      distanceKm: Math.round(c.distanceM / 100) / 10,
      elevationGainM: c.elevationGainM,
      surfaceSummary: c.surfaceSummary,
      eventDates: c.eventDates ?? [],
    })),
  });
}
