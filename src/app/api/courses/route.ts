import { NextResponse } from "next/server";
import { listVerifiedCourses } from "@/lib/race-predictor/store";
import type { Climb, Segment } from "@/lib/race-predictor/types";

export const runtime = "nodejs";

/**
 * Downsample a segment list to a fixed sample count, returned as a compact
 * pair-array of [distanceM, elevationM] points. Used by the course picker so
 * the client can render elevation thumbnails without shipping the full
 * segment array.
 */
function compactProfile(segments: Segment[], targetSamples = 120): number[][] {
  if (segments.length === 0) return [];
  let total = 0;
  for (const s of segments) total += s.distance;
  if (total <= 0) return [];
  const out: number[][] = [];
  let segIdx = 0;
  let distAcc = 0;
  for (let i = 0; i <= targetSamples; i++) {
    const target = (i / targetSamples) * total;
    while (segIdx < segments.length - 1 && distAcc + segments[segIdx].distance < target) {
      distAcc += segments[segIdx].distance;
      segIdx++;
    }
    const seg = segments[segIdx];
    const localT = seg.distance > 0 ? (target - distAcc) / seg.distance : 0;
    const elev = seg.startElevation + (seg.endElevation - seg.startElevation) * localT;
    out.push([Math.round(target), Math.round(elev)]);
  }
  return out;
}

/**
 * GET /api/courses
 * Public catalog of curated event courses (Etape, Marmotte, etc).
 * Returns the slim summary plus a compact elevation profile suitable for the
 * course-picker thumbnails. Full course geometry is loaded by the predict
 * endpoint when a prediction is run.
 */
export async function GET() {
  const courses = await listVerifiedCourses();
  return NextResponse.json({
    courses: courses.map((c) => {
      const climbs = c.courseData.climbs as Climb[];
      const hcCount = climbs.filter((cl) => cl.category === "hc").length;
      return {
        slug: c.slug,
        name: c.name,
        country: c.country,
        region: c.region,
        discipline: c.discipline,
        distanceKm: Math.round(c.distanceM / 100) / 10,
        elevationGainM: c.elevationGainM,
        surfaceSummary: c.surfaceSummary,
        eventDates: c.eventDates ?? [],
        climbCount: climbs.length,
        hcCount,
        profile: compactProfile(c.courseData.segments),
        climbs: climbs.map((cl) => ({
          startDistance: cl.startDistance,
          endDistance: cl.endDistance,
          length: cl.length,
          averageGradient: cl.averageGradient,
          elevationGain: cl.elevationGain,
          category: cl.category,
        })),
      };
    }),
  });
}
