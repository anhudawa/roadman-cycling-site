// Persistence layer for the race predictor.
// Pure DB I/O — no engine math, no AI, no HTTP.

import crypto from "node:crypto";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, predictions, predictionResults } from "@/lib/db/schema";
import type { Course, RiderProfile, Environment, TrackPoint } from "./types";
import { generateSlug } from "./slug";
import {
  getFixtureCourseBySlug,
  getFixtureCourses,
  shouldUseFixtures,
} from "./fixtures";

export interface CourseRow {
  id: number;
  slug: string;
  name: string;
  country: string | null;
  region: string | null;
  discipline: string;
  distanceM: number;
  elevationGainM: number;
  elevationLossM: number;
  surfaceSummary: string | null;
  gpxData: TrackPoint[];
  courseData: Course;
  eventDates: string[] | null;
  verified: boolean;
  source: string | null;
  uploaderEmail: string | null;
}

function rowToCourse(row: typeof courses.$inferSelect): CourseRow {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    country: row.country,
    region: row.region,
    discipline: row.discipline,
    distanceM: row.distanceM,
    elevationGainM: row.elevationGainM,
    elevationLossM: row.elevationLossM,
    surfaceSummary: row.surfaceSummary,
    gpxData: row.gpxData as TrackPoint[],
    courseData: row.courseData as Course,
    eventDates: row.eventDates,
    verified: row.verified,
    source: row.source,
    uploaderEmail: row.uploaderEmail,
  };
}

function canUseFixtureFallback(err: unknown): boolean {
  const rawCause =
    err instanceof Error && "cause" in err
      ? (err as Error & { cause?: unknown }).cause
      : null;
  const cause =
    rawCause instanceof Error ? rawCause.message : rawCause ? String(rawCause) : "";
  const message = `${err instanceof Error ? err.message : String(err)} ${cause}`;
  return (
    message.includes("does not exist") ||
    message.includes("relation") ||
    message.includes("schema") ||
    message.includes("connect") ||
    message.includes("ECONN")
  );
}

/** List all verified curated courses, newest first. */
export async function listVerifiedCourses(): Promise<CourseRow[]> {
  if (shouldUseFixtures()) return getFixtureCourses() as CourseRow[];
  try {
    const rows = await db
      .select()
      .from(courses)
      .where(eq(courses.verified, true))
      .orderBy(desc(courses.createdAt));
    return rows.map(rowToCourse);
  } catch (err) {
    if (canUseFixtureFallback(err)) return getFixtureCourses() as CourseRow[];
    throw err;
  }
}

export async function getCourseBySlug(slug: string): Promise<CourseRow | null> {
  if (shouldUseFixtures()) return getFixtureCourseBySlug(slug) as CourseRow | null;
  try {
    const [row] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1);
    return row ? rowToCourse(row) : null;
  } catch (err) {
    if (canUseFixtureFallback(err)) return getFixtureCourseBySlug(slug) as CourseRow | null;
    throw err;
  }
}

export async function getCourseById(id: number): Promise<CourseRow | null> {
  if (shouldUseFixtures()) {
    return (getFixtureCourses().find((c) => c.id === id) ?? null) as CourseRow | null;
  }
  try {
    const [row] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    return row ? rowToCourse(row) : null;
  } catch (err) {
    if (canUseFixtureFallback(err)) {
      return (getFixtureCourses().find((c) => c.id === id) ?? null) as CourseRow | null;
    }
    throw err;
  }
}

interface UpsertCourseInput {
  slug?: string;
  name: string;
  country?: string | null;
  region?: string | null;
  discipline?: string;
  distanceM: number;
  elevationGainM: number;
  elevationLossM?: number;
  surfaceSummary?: string | null;
  gpxData: TrackPoint[];
  courseData: Course;
  eventDates?: string[];
  verified?: boolean;
  source?: string;
  uploaderEmail?: string | null;
  uploaderRiderId?: number | null;
}

/** Insert a new course. Generates slug if missing. */
export async function insertCourse(input: UpsertCourseInput): Promise<CourseRow> {
  const slug = input.slug ?? generateSlug("course-");
  const [row] = await db
    .insert(courses)
    .values({
      slug,
      name: input.name,
      country: input.country ?? null,
      region: input.region ?? null,
      discipline: input.discipline ?? "road",
      distanceM: input.distanceM,
      elevationGainM: input.elevationGainM,
      elevationLossM: input.elevationLossM ?? 0,
      surfaceSummary: input.surfaceSummary ?? null,
      gpxData: input.gpxData,
      courseData: input.courseData,
      eventDates: input.eventDates ?? [],
      verified: input.verified ?? false,
      source: input.source ?? "user_upload",
      uploaderEmail: input.uploaderEmail ?? null,
      uploaderRiderId: input.uploaderRiderId ?? null,
    })
    .returning();
  return rowToCourse(row);
}

/**
 * Upsert by slug — used by the seed script so re-running it doesn't error
 * on the unique constraint and so course updates take effect on deploy.
 */
export async function upsertCourseBySlug(
  slug: string,
  input: UpsertCourseInput,
): Promise<CourseRow> {
  const existing = await getCourseBySlug(slug);
  if (!existing) {
    return insertCourse({ ...input, slug });
  }
  const [row] = await db
    .update(courses)
    .set({
      name: input.name,
      country: input.country ?? null,
      region: input.region ?? null,
      discipline: input.discipline ?? "road",
      distanceM: input.distanceM,
      elevationGainM: input.elevationGainM,
      elevationLossM: input.elevationLossM ?? 0,
      surfaceSummary: input.surfaceSummary ?? null,
      gpxData: input.gpxData,
      courseData: input.courseData,
      eventDates: input.eventDates ?? [],
      verified: input.verified ?? false,
      source: input.source ?? existing.source ?? "seed",
      updatedAt: new Date(),
    })
    .where(eq(courses.id, existing.id))
    .returning();
  return rowToCourse(row);
}

export function gpxHash(points: TrackPoint[]): string {
  const summary = points.map((p) => `${p.lat.toFixed(5)},${p.lon.toFixed(5)},${p.elevation.toFixed(1)}`).join("|");
  return crypto.createHash("sha256").update(summary).digest("hex").slice(0, 16);
}

// ---------------- Predictions ----------------

export interface PredictionRow {
  id: number;
  slug: string;
  riderProfileId: number | null;
  courseId: number | null;
  courseGpxHash: string | null;
  courseData: Course | null;
  mode: "can_i_make_it" | "plan_my_race";
  predictedTimeS: number;
  confidenceLowS: number;
  confidenceHighS: number;
  averagePower: number | null;
  normalizedPower: number | null;
  variabilityIndex: number | null;
  riderInputs: RiderProfile;
  environmentInputs: Environment;
  pacingPlan: number[] | null;
  resultSummary: Record<string, unknown> | null;
  weatherData: Record<string, unknown> | null;
  aiTranslation: Record<string, unknown> | null;
  email: string | null;
  isPaid: boolean;
  paidReportId: number | null;
  engineVersion: string;
  createdAt: Date;
}

function rowToPrediction(row: typeof predictions.$inferSelect): PredictionRow {
  return {
    id: row.id,
    slug: row.slug,
    riderProfileId: row.riderProfileId,
    courseId: row.courseId,
    courseGpxHash: row.courseGpxHash,
    courseData: row.courseData as Course | null,
    mode: (row.mode === "can_i_make_it" ? "can_i_make_it" : "plan_my_race"),
    predictedTimeS: row.predictedTimeS,
    confidenceLowS: row.confidenceLowS,
    confidenceHighS: row.confidenceHighS,
    averagePower: row.averagePower,
    normalizedPower: row.normalizedPower,
    variabilityIndex: row.variabilityIndex,
    riderInputs: row.riderInputs as unknown as RiderProfile,
    environmentInputs: row.environmentInputs as unknown as Environment,
    pacingPlan: row.pacingPlan,
    resultSummary: row.resultSummary,
    weatherData: row.weatherData,
    aiTranslation: row.aiTranslation,
    email: row.email,
    isPaid: row.isPaid,
    paidReportId: row.paidReportId,
    engineVersion: row.engineVersion,
    createdAt: row.createdAt,
  };
}

interface CreatePredictionInput {
  riderProfileId?: number | null;
  courseId?: number | null;
  courseGpxHash?: string | null;
  courseData?: Course | null;
  mode: "can_i_make_it" | "plan_my_race";
  predictedTimeS: number;
  confidenceLowS: number;
  confidenceHighS: number;
  averagePower?: number | null;
  normalizedPower?: number | null;
  variabilityIndex?: number | null;
  riderInputs: RiderProfile;
  environmentInputs: Environment;
  pacingPlan?: number[];
  resultSummary?: Record<string, unknown>;
  weatherData?: Record<string, unknown>;
  aiTranslation?: Record<string, unknown>;
  email?: string | null;
}

// Dev-mode predictions store, used only when no DB is configured. Backed by a
// JSON file under the OS temp directory so the API route handler and the page
// render path (which Next.js may instantiate in separate module contexts) read
// and write the same data.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const FIXTURE_STORE_PATH = path.join(os.tmpdir(), "roadman-predictions.json");

interface FixtureFile {
  predictions: Record<string, PredictionRow>;
  nextId: number;
}

function readFixtureFile(): FixtureFile {
  try {
    const raw = fs.readFileSync(FIXTURE_STORE_PATH, "utf8");
    const data = JSON.parse(raw) as FixtureFile;
    // Re-hydrate Date fields lost in JSON.
    for (const key of Object.keys(data.predictions)) {
      const row = data.predictions[key];
      if (typeof row.createdAt === "string") {
        row.createdAt = new Date(row.createdAt);
      }
    }
    return data;
  } catch {
    return { predictions: {}, nextId: 0 };
  }
}
function writeFixtureFile(data: FixtureFile): void {
  try {
    fs.writeFileSync(FIXTURE_STORE_PATH, JSON.stringify(data), "utf8");
  } catch {
    // best-effort — dev preview only
  }
}

function createFixturePrediction(
  slug: string,
  input: CreatePredictionInput,
): PredictionRow {
  const file = readFixtureFile();
  file.nextId += 1;
  const row: PredictionRow = {
    id: file.nextId,
    slug,
    riderProfileId: input.riderProfileId ?? null,
    courseId: input.courseId ?? null,
    courseGpxHash: input.courseGpxHash ?? null,
    courseData: input.courseData ?? null,
    mode: input.mode,
    predictedTimeS: input.predictedTimeS,
    confidenceLowS: input.confidenceLowS,
    confidenceHighS: input.confidenceHighS,
    averagePower: input.averagePower ?? null,
    normalizedPower: input.normalizedPower ?? null,
    variabilityIndex: input.variabilityIndex ?? null,
    riderInputs: input.riderInputs,
    environmentInputs: input.environmentInputs,
    pacingPlan: input.pacingPlan ?? null,
    resultSummary: input.resultSummary ?? null,
    weatherData: input.weatherData ?? null,
    aiTranslation: input.aiTranslation ?? null,
    email: input.email ?? null,
    isPaid: false,
    paidReportId: null,
    engineVersion: "v1.0",
    createdAt: new Date(),
  };
  file.predictions[slug] = row;
  writeFixtureFile(file);
  return row;
}

export async function createPrediction(
  input: CreatePredictionInput,
): Promise<PredictionRow> {
  const slug = generateSlug();
  if (shouldUseFixtures()) {
    return createFixturePrediction(slug, input);
  }
  try {
    const [row] = await db
      .insert(predictions)
      .values({
        slug,
        riderProfileId: input.riderProfileId ?? null,
        courseId: input.courseId ?? null,
        courseGpxHash: input.courseGpxHash ?? null,
        courseData: input.courseData ?? null,
        mode: input.mode,
        predictedTimeS: input.predictedTimeS,
        confidenceLowS: input.confidenceLowS,
        confidenceHighS: input.confidenceHighS,
        averagePower: input.averagePower ?? null,
        normalizedPower: input.normalizedPower ?? null,
        variabilityIndex: input.variabilityIndex ?? null,
        riderInputs: input.riderInputs as unknown as Record<string, unknown>,
        environmentInputs: input.environmentInputs as unknown as Record<string, unknown>,
        pacingPlan: input.pacingPlan ?? null,
        resultSummary: input.resultSummary ?? null,
        weatherData: input.weatherData ?? null,
        aiTranslation: input.aiTranslation ?? null,
        email: input.email ?? null,
      })
      .returning();
    return rowToPrediction(row);
  } catch (err) {
    if (canUseFixtureFallback(err)) return createFixturePrediction(slug, input);
    throw err;
  }
}

export async function getPredictionBySlug(
  slug: string,
): Promise<PredictionRow | null> {
  if (shouldUseFixtures()) return readFixtureFile().predictions[slug] ?? null;
  try {
    const [row] = await db
      .select()
      .from(predictions)
      .where(eq(predictions.slug, slug))
      .limit(1);
    return row ? rowToPrediction(row) : null;
  } catch (err) {
    if (canUseFixtureFallback(err)) return readFixtureFile().predictions[slug] ?? null;
    throw err;
  }
}

export async function getPredictionById(
  id: number,
): Promise<PredictionRow | null> {
  if (shouldUseFixtures()) {
    return Object.values(readFixtureFile().predictions).find((p) => p.id === id) ?? null;
  }
  try {
    const [row] = await db.select().from(predictions).where(eq(predictions.id, id)).limit(1);
    return row ? rowToPrediction(row) : null;
  } catch (err) {
    if (canUseFixtureFallback(err)) {
      return Object.values(readFixtureFile().predictions).find((p) => p.id === id) ?? null;
    }
    throw err;
  }
}

/**
 * Attach an email to a prediction. Used by the free-tier gate so we capture
 * the lead before unlocking the full breakdown. Idempotent — overwrites any
 * existing email since the most recent capture is the most useful one for
 * marketing follow-up.
 */
export async function setPredictionEmail(
  slug: string,
  email: string,
): Promise<boolean> {
  if (shouldUseFixtures()) {
    const file = readFixtureFile();
    const row = file.predictions[slug];
    if (!row) return false;
    row.email = email;
    file.predictions[slug] = row;
    writeFixtureFile(file);
    return true;
  }
  try {
    const result = await db
      .update(predictions)
      .set({ email })
      .where(eq(predictions.slug, slug))
      .returning({ id: predictions.id });
    return result.length > 0;
  } catch (err) {
    if (!canUseFixtureFallback(err)) throw err;
    const file = readFixtureFile();
    const row = file.predictions[slug];
    if (!row) return false;
    row.email = email;
    file.predictions[slug] = row;
    writeFixtureFile(file);
    return true;
  }
}

export async function markPredictionPaid(
  predictionId: number,
  paidReportId: number,
): Promise<void> {
  await db
    .update(predictions)
    .set({ isPaid: true, paidReportId })
    .where(eq(predictions.id, predictionId));
}

export async function recordActualResult(args: {
  predictionId: number;
  actualTimeS: number;
  averagePower?: number;
  rideFileUrl?: string;
  segmentActuals?: Record<string, unknown>;
  analysis?: Record<string, unknown>;
  modelErrorPct?: number;
  submittedEmail?: string;
}): Promise<void> {
  await db.insert(predictionResults).values({
    predictionId: args.predictionId,
    actualTimeS: args.actualTimeS,
    averagePower: args.averagePower ?? null,
    rideFileUrl: args.rideFileUrl ?? null,
    segmentActuals: args.segmentActuals ?? null,
    analysis: args.analysis ?? null,
    modelErrorPct: args.modelErrorPct ?? null,
    submittedEmail: args.submittedEmail ?? null,
  });
}

/** Aggregate model accuracy for a course — drives the "validated against N actual rides" badge. */
export async function modelAccuracyForCourse(courseId: number): Promise<{
  count: number;
  meanAbsErrorPct: number | null;
}> {
  const rows = await db
    .select({
      modelErrorPct: predictionResults.modelErrorPct,
    })
    .from(predictionResults)
    .innerJoin(predictions, eq(predictions.id, predictionResults.predictionId))
    .where(and(eq(predictions.courseId, courseId), isNotNull(predictionResults.modelErrorPct)));
  if (rows.length === 0) return { count: 0, meanAbsErrorPct: null };
  const mae =
    rows.reduce((s, r) => s + Math.abs(r.modelErrorPct ?? 0), 0) / rows.length;
  return { count: rows.length, meanAbsErrorPct: mae };
}
