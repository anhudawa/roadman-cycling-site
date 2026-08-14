import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";
import { buildCourse, parseGpx } from "../src/lib/race-predictor/gpx";
import { encodeVerifiedRouteSource } from "../src/lib/race-predictor/route-provenance";
import { upsertCourseBySlug } from "../src/lib/race-predictor/store";
import type { SurfaceType } from "../src/lib/race-predictor/types";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const ALLOWED_SURFACES = new Set<SurfaceType>([
  "tarmac_smooth",
  "tarmac_mixed",
  "tarmac_rough",
  "chip_seal",
  "gravel_smooth",
  "gravel_rough",
  "cobbles",
]);

function flags(argv: string[]): Map<string, string | true> {
  const parsed = new Map<string, string | true>();
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [key, ...value] = arg.slice(2).split("=");
    parsed.set(key, value.length ? value.join("=") : true);
  }
  return parsed;
}

function required(args: Map<string, string | true>, key: string): string {
  const value = args.get(key);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required --${key}=... argument.`);
  }
  return value.trim();
}

async function main() {
  const args = flags(process.argv.slice(2));
  const file = required(args, "file");
  const slug = required(args, "slug");
  const name = required(args, "name");
  const country = required(args, "country");
  const sourceUrl = required(args, "source-url");
  const region = typeof args.get("region") === "string" ? String(args.get("region")) : null;
  const eventDate =
    typeof args.get("event-date") === "string" ? String(args.get("event-date")) : null;
  const surfaceValue =
    typeof args.get("surface") === "string"
      ? String(args.get("surface"))
      : "tarmac_mixed";
  if (!ALLOWED_SURFACES.has(surfaceValue as SurfaceType)) {
    throw new Error(`Unsupported --surface=${surfaceValue}.`);
  }
  if (!/^https:\/\//i.test(sourceUrl)) {
    throw new Error("--source-url must be an https URL recording route provenance.");
  }
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) {
    throw new Error("--slug must contain only lowercase letters, numbers, and hyphens.");
  }

  const xml = await readFile(file, "utf8");
  const parsed = parseGpx(xml);
  const surfaces = Array.from(
    { length: Math.max(0, parsed.points.length - 1) },
    () => surfaceValue as SurfaceType,
  );
  const course = buildCourse(parsed.points, { name, surfaces });
  const sourceHash = createHash("sha256").update(xml).digest("hex");
  const summary = {
    mode: args.has("commit") ? "commit" : "dry_run",
    slug,
    name,
    file,
    sourceUrl,
    sourceHash,
    distanceKm: Math.round((course.totalDistance / 1000) * 10) / 10,
    elevationGainM: Math.round(course.totalElevationGain),
    elevationLossM: Math.round(course.totalElevationLoss),
    pointCount: parsed.points.length,
    climbCount: course.climbs.length,
    quality: parsed.quality,
  };

  if (!args.has("commit")) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    return;
  }
  if (!process.env.POSTGRES_URL && !process.env.POSTGRES_URL_NON_POOLING) {
    throw new Error("POSTGRES_URL is required with --commit.");
  }

  await upsertCourseBySlug(slug, {
    slug,
    name,
    country,
    region,
    discipline: surfaceValue.startsWith("gravel") ? "gravel" : "road",
    distanceM: Math.round(course.totalDistance),
    elevationGainM: Math.round(course.totalElevationGain),
    elevationLossM: Math.round(course.totalElevationLoss),
    surfaceSummary: surfaceValue,
    gpxData: parsed.points,
    courseData: course,
    eventDates: eventDate ? [eventDate] : [],
    verified: true,
    source: encodeVerifiedRouteSource(sourceHash, sourceUrl),
  });
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main().catch((error) => {
  console.error(
    `[routes:import] ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
