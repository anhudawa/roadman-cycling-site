import { NextResponse } from "next/server";
import { buildCourse, parseGpx } from "@/lib/race-predictor/gpx";

export const runtime = "nodejs";

/**
 * POST /api/predict/parse-gpx
 *
 * Body: raw GPX XML (text/xml or application/gpx+xml). Returns the parsed
 * track points plus a downsampled elevation profile for the dropzone preview.
 * The full point array is also returned so the client can submit it back
 * unchanged to /api/predict.
 */
export async function POST(request: Request) {
  let xml: string;
  try {
    xml = await request.text();
  } catch {
    return NextResponse.json({ error: "Could not read request body." }, { status: 400 });
  }
  if (!xml.trim()) {
    return NextResponse.json({ error: "Empty GPX." }, { status: 400 });
  }
  if (xml.length > 8_000_000) {
    return NextResponse.json({ error: "GPX too large (8MB max)." }, { status: 413 });
  }

  let parsed;
  try {
    parsed = parseGpx(xml);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not parse GPX.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (parsed.points.length < 50) {
    return NextResponse.json(
      { error: "Track has fewer than 50 points — too sparse to predict on." },
      { status: 400 },
    );
  }

  const course = buildCourse(parsed.points, { name: parsed.name });

  // Compact profile pairs for the thumbnail
  const SAMPLES = 120;
  const profile: number[][] = [];
  let segIdx = 0;
  let acc = 0;
  for (let i = 0; i <= SAMPLES; i++) {
    const target = (i / SAMPLES) * course.totalDistance;
    while (segIdx < course.segments.length - 1 && acc + course.segments[segIdx].distance < target) {
      acc += course.segments[segIdx].distance;
      segIdx++;
    }
    const seg = course.segments[segIdx];
    const localT = seg.distance > 0 ? (target - acc) / seg.distance : 0;
    const elev = seg.startElevation + (seg.endElevation - seg.startElevation) * localT;
    profile.push([Math.round(target), Math.round(elev)]);
  }

  return NextResponse.json({
    name: parsed.name ?? "Custom course",
    points: parsed.points,
    profile,
    distanceM: course.totalDistance,
    elevationGainM: Math.round(course.totalElevationGain),
    climbCount: course.climbs.length,
    climbs: course.climbs.map((c) => ({
      startDistance: c.startDistance,
      endDistance: c.endDistance,
      length: c.length,
      averageGradient: c.averageGradient,
      elevationGain: c.elevationGain,
      category: c.category,
    })),
  });
}
