import { NextResponse } from "next/server";
import { buildCourse, parseGpx } from "@/lib/race-predictor/gpx";

export const runtime = "nodejs";

function qualityWarnings(quality: {
  invalidCoordinateCount: number;
  missingElevationCount: number;
  invalidElevationCount: number;
  gpsSpikeCount: number;
  elevationSpikeCount: number;
}): string[] {
  const warnings: string[] = [];
  if (quality.invalidCoordinateCount > 0) {
    warnings.push(
      `${quality.invalidCoordinateCount} bad GPS point${quality.invalidCoordinateCount === 1 ? " was" : "s were"} ignored.`,
    );
  }
  if (quality.gpsSpikeCount > 0) {
    warnings.push(
      `${quality.gpsSpikeCount} GPS spike${quality.gpsSpikeCount === 1 ? " was" : "s were"} removed from the route.`,
    );
  }
  if (quality.elevationSpikeCount > 0) {
    warnings.push(
      `${quality.elevationSpikeCount} elevation spike${quality.elevationSpikeCount === 1 ? " was" : "s were"} smoothed.`,
    );
  }
  if (quality.invalidElevationCount > 0) {
    warnings.push(
      `${quality.invalidElevationCount} invalid elevation value${quality.invalidElevationCount === 1 ? " was" : "s were"} treated as 0 m.`,
    );
  }
  if (quality.missingElevationCount > 0) {
    warnings.push(
      `${quality.missingElevationCount} point${quality.missingElevationCount === 1 ? " is" : "s are"} missing elevation, so the climbing estimate is less certain.`,
    );
  }
  return warnings;
}

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
  const warnings = qualityWarnings(parsed.quality);

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
    quality: parsed.quality,
    warnings,
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
