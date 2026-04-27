import { NextResponse } from "next/server";
import { normaliseEmail, clampString, LIMITS } from "@/lib/validation";
import { parseGpx, buildCourse } from "@/lib/race-predictor/gpx";
import { insertCourse } from "@/lib/race-predictor/store";
import { checkUploadRateLimit } from "@/lib/race-predictor/upload-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB GPX cap — larger files almost always have superfluous detail

interface UploadBody {
  gpxXml?: string;
  name?: string;
  email?: string;
  country?: string;
}

/**
 * POST /api/courses/upload
 * Body: { gpxXml, name, email?, country? }
 *
 * Parses GPX, builds the Course (smoothed), inserts as unverified.
 * Returns the slug so the client can predict against it immediately.
 *
 * Curated courses (Etape, Marmotte, etc.) are inserted via the seed script
 * with verified=true. User uploads start as verified=false until an admin
 * promotes them.
 */
export async function POST(request: Request) {
  // Anonymous endpoint that parses 5 MB bodies and writes to the DB — gate
  // behind a per-IP throttle so casual abuse doesn't get free DB inserts.
  const verdict = checkUploadRateLimit(request);
  if (!verdict.ok) {
    return NextResponse.json(
      { error: "Too many uploads from this address. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(verdict.retryAfterSeconds) },
      },
    );
  }

  let body: UploadBody;
  try {
    body = (await request.json()) as UploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.gpxXml || typeof body.gpxXml !== "string") {
    return NextResponse.json({ error: "Missing GPX content." }, { status: 400 });
  }
  if (body.gpxXml.length > MAX_BYTES) {
    return NextResponse.json({ error: "GPX is too large (>5 MB)." }, { status: 413 });
  }

  const name = clampString(body.name, LIMITS.shortText) ?? "Untitled course";
  const email = normaliseEmail(body.email);
  const country = clampString(body.country, 80) ?? null;

  let parsed;
  try {
    parsed = parseGpx(body.gpxXml);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid GPX file.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (parsed.points.length < 50) {
    return NextResponse.json(
      { error: "GPX must contain at least 50 track points." },
      { status: 400 },
    );
  }

  let course;
  try {
    course = buildCourse(parsed.points, { name });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not build course.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (course.totalElevationGain < 50 && course.totalDistance < 10_000) {
    return NextResponse.json(
      { error: "Course looks too small to predict — need at least 10 km or 50 m gain." },
      { status: 400 },
    );
  }

  const inserted = await insertCourse({
    name: parsed.name ?? name,
    country,
    distanceM: Math.round(course.totalDistance),
    elevationGainM: Math.round(course.totalElevationGain),
    elevationLossM: Math.round(course.totalElevationLoss),
    gpxData: parsed.points,
    courseData: course,
    verified: false,
    source: "user_upload",
    uploaderEmail: email ?? null,
  });

  return NextResponse.json({
    slug: inserted.slug,
    name: inserted.name,
    distanceKm: inserted.distanceM / 1000,
    elevationGainM: inserted.elevationGainM,
    climbs: course.climbs.length,
  });
}
