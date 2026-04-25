import crypto from "crypto";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { diagnosticSubmissions } from "@/lib/db/schema";
import {
  isGenerationSource,
  type Answers,
  type Breakdown,
  type GenerationSource,
  type Profile,
  type ScoringResult,
} from "./types";
import type { GenerationResult } from "./generator";

/**
 * DB helpers for diagnostic submissions. Keeps Drizzle details out of
 * the route handler so the route can focus on request validation +
 * orchestration.
 */

const SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const SLUG_LEN = 10;

/**
 * Collisions at 36^10 $‰ˆ 3.6e15 are astronomically unlikely, but a
 * unique-constraint retry is cheap insurance against pathological
 * RNG. Three attempts is plenty $€” if it fails three times in a row
 * the crypto source is broken.
 */
const SLUG_RETRY_ATTEMPTS = 3;

/**
 * URL-friendly short id. Collisions are astronomically unlikely at
 * 36^10 $‰ˆ 3.6e15, but we still tolerate a unique-constraint retry in
 * insertSubmission.
 */
function generateSlug(): string {
  const bytes = crypto.randomBytes(SLUG_LEN);
  let out = "";
  for (let i = 0; i < SLUG_LEN; i++) {
    out += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  }
  return out;
}

export interface UtmFields {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}

export interface InsertSubmissionInput {
  email: string;
  answers: Answers;
  scoring: ScoringResult;
  generation: GenerationResult;
  utm?: UtmFields;
  userAgent?: string | null;
  referrer?: string | null;
  /** 1 on first submission for this email, 2 on second, etc. */
  retakeNumber: number;
}

export interface StoredSubmission {
  id: number;
  slug: string;
  email: string;
  primaryProfile: Profile;
  secondaryProfile: Profile | null;
  severeMultiSystem: boolean;
  closeToBreakthrough: boolean;
  breakdown: Breakdown;
  generationSource: GenerationSource;
  createdAt: Date;
  answers: Answers;
  retakeNumber: number;
}

function rowToSubmission(
  row: typeof diagnosticSubmissions.$inferSelect
): StoredSubmission {
  return {
    id: row.id,
    slug: row.slug,
    email: row.email,
    primaryProfile: row.primaryProfile as Profile,
    secondaryProfile: row.secondaryProfile as Profile | null,
    severeMultiSystem: row.severeMultiSystem,
    closeToBreakthrough: row.closeToBreakthrough,
    breakdown: row.breakdown as unknown as Breakdown,
    // DB stores the source as plain text; coerce back to the union
    // type with a guard. Any unexpected value is treated as a
    // fallback so downstream rendering stays safe.
    generationSource: isGenerationSource(row.generationSource)
      ? row.generationSource
      : "fallback",
    createdAt: row.createdAt,
    answers: row.answers as unknown as Answers,
    retakeNumber: row.retakeNumber,
  };
}

/**
 * Counts prior submissions for the given email so the caller can
 * stamp the retake_number. Normalises the email the same way
 * normaliseEmail does (lowercase + trim) so a mix of "Anthony@..." and
 * "anthony@..." submissions are recognised as the same person.
 */
export async function countPriorSubmissions(email: string): Promise<number> {
  const normalised = email.trim().toLowerCase();
  const [row] = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(diagnosticSubmissions)
    .where(eq(diagnosticSubmissions.email, normalised));
  return Number(row?.cnt ?? 0);
}

export async function insertSubmission(
  input: InsertSubmissionInput
): Promise<StoredSubmission> {
  const generationMeta = {
    attempts: input.generation.attempts,
    errors: input.generation.errors,
    validation: input.generation.validation,
  };

  for (let i = 0; i < SLUG_RETRY_ATTEMPTS; i++) {
    const slug = generateSlug();
    try {
      const [row] = await db
        .insert(diagnosticSubmissions)
        .values({
          slug,
          email: input.email,
          age: input.answers.age,
          hoursPerWeek: input.answers.hoursPerWeek,
          ftp: input.answers.ftp ?? null,
          goal: input.answers.goal?.trim() || null,
          answers: input.answers as unknown as Record<string, unknown>,
          scores: input.scoring.scores as unknown as Record<string, number>,
          primaryProfile: input.scoring.primary,
          secondaryProfile: input.scoring.secondary,
          severeMultiSystem: input.scoring.severeMultiSystem,
          closeToBreakthrough: input.scoring.closeToBreakthrough,
          breakdown: input.generation.breakdown as unknown as Record<string, unknown>,
          generationSource: input.generation.source,
          rawModelOutput: input.generation.rawModelOutput,
          generationMeta: generationMeta as unknown as Record<string, unknown>,
          utmSource: input.utm?.utmSource ?? null,
          utmMedium: input.utm?.utmMedium ?? null,
          utmCampaign: input.utm?.utmCampaign ?? null,
          utmContent: input.utm?.utmContent ?? null,
          utmTerm: input.utm?.utmTerm ?? null,
          userAgent: input.userAgent ?? null,
          referrer: input.referrer ?? null,
          retakeNumber: input.retakeNumber,
        })
        .returning();
      return rowToSubmission(row);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (i < SLUG_RETRY_ATTEMPTS - 1 && /unique|duplicate/i.test(msg)) continue;
      throw err;
    }
  }
  throw new Error(
    `Failed to allocate a unique diagnostic slug after ${SLUG_RETRY_ATTEMPTS} attempts`
  );
}

/**
 * History-page view: compact summary rows for a given email, newest
 * first. Used by /results to render a unified timeline alongside
 * tool_result rows.
 */
export interface DiagnosticHistoryItem {
  slug: string;
  primaryProfile: Profile;
  secondaryProfile: Profile | null;
  severeMultiSystem: boolean;
  closeToBreakthrough: boolean;
  createdAt: Date;
  retakeNumber: number;
}

export async function listSubmissionsByEmail(
  email: string,
  limit = 50,
): Promise<DiagnosticHistoryItem[]> {
  const normalised = email.trim().toLowerCase();
  const rows = await db
    .select({
      slug: diagnosticSubmissions.slug,
      primaryProfile: diagnosticSubmissions.primaryProfile,
      secondaryProfile: diagnosticSubmissions.secondaryProfile,
      severeMultiSystem: diagnosticSubmissions.severeMultiSystem,
      closeToBreakthrough: diagnosticSubmissions.closeToBreakthrough,
      createdAt: diagnosticSubmissions.createdAt,
      retakeNumber: diagnosticSubmissions.retakeNumber,
    })
    .from(diagnosticSubmissions)
    .where(eq(diagnosticSubmissions.email, normalised))
    .orderBy(desc(diagnosticSubmissions.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    slug: r.slug,
    primaryProfile: r.primaryProfile as Profile,
    secondaryProfile: r.secondaryProfile as Profile | null,
    severeMultiSystem: r.severeMultiSystem,
    closeToBreakthrough: r.closeToBreakthrough,
    createdAt: r.createdAt,
    retakeNumber: r.retakeNumber,
  }));
}

export async function getSubmissionBySlug(
  slug: string
): Promise<StoredSubmission | null> {
  const rows = await db
    .select()
    .from(diagnosticSubmissions)
    .where(eq(diagnosticSubmissions.slug, slug))
    .limit(1);
  const row = rows[0];
  return row ? rowToSubmission(row) : null;
}

/**
 * Admin-side detail for the QA dashboard. Returns the full row,
 * including raw model output and generation_meta $€” never returned
 * over the public read endpoint. Caller must already be auth-gated.
 */
export interface SubmissionDetail extends StoredSubmission {
  scores: { underRecovered: number; polarisation: number; strengthGap: number; fuelingDeficit: number };
  rawModelOutput: string | null;
  generationMeta: Record<string, unknown> | null;
  utm: {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    content: string | null;
    term: string | null;
  };
  ftp: number | null;
  goal: string | null;
  beehiivSubscriberId: string | null;
  userAgent: string | null;
  referrer: string | null;
  updatedAt: Date;
}

export async function getSubmissionDetail(
  slug: string
): Promise<SubmissionDetail | null> {
  const rows = await db
    .select()
    .from(diagnosticSubmissions)
    .where(eq(diagnosticSubmissions.slug, slug))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const base = rowToSubmission(row);
  return {
    ...base,
    scores: row.scores as SubmissionDetail["scores"],
    rawModelOutput: row.rawModelOutput,
    generationMeta: row.generationMeta as Record<string, unknown> | null,
    utm: {
      source: row.utmSource,
      medium: row.utmMedium,
      campaign: row.utmCampaign,
      content: row.utmContent,
      term: row.utmTerm,
    },
    ftp: row.ftp,
    goal: row.goal,
    beehiivSubscriberId: row.beehiivSubscriberId,
    userAgent: row.userAgent,
    referrer: row.referrer,
    updatedAt: row.updatedAt,
  };
}

export async function attachBeehiivId(slug: string, subscriberId: string): Promise<void> {
  await db
    .update(diagnosticSubmissions)
    .set({ beehiivSubscriberId: subscriberId, updatedAt: new Date() })
    .where(eq(diagnosticSubmissions.slug, slug));
}

/**
 * Phase 2: link a submission to the rider profile after the insert so
 * the request path stays fast. Best-effort $€” the submission row is
 * already persisted, this is purely a denormalised join for dashboards
 * and /results history.
 */
export async function attachRiderProfileId(
  slug: string,
  riderProfileId: number
): Promise<void> {
  await db
    .update(diagnosticSubmissions)
    .set({ riderProfileId, updatedAt: new Date() })
    .where(eq(diagnosticSubmissions.slug, slug));
}

export async function replaceBreakdown(
  slug: string,
  generation: GenerationResult
): Promise<StoredSubmission | null> {
  const generationMeta = {
    attempts: generation.attempts,
    errors: generation.errors,
    validation: generation.validation,
  };
  const [row] = await db
    .update(diagnosticSubmissions)
    .set({
      breakdown: generation.breakdown as unknown as Record<string, unknown>,
      generationSource: generation.source,
      rawModelOutput: generation.rawModelOutput,
      generationMeta: generationMeta as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .where(eq(diagnosticSubmissions.slug, slug))
    .returning();
  return row ? rowToSubmission(row) : null;
}

export interface DiagnosticStats {
  total: number;
  last7d: number;
  last24h: number;
  byProfile: Record<Profile, number>;
  llmSuccessRate: number;
  avgTtlSeconds: number | null;
}

export async function getDiagnosticStats(): Promise<DiagnosticStats> {
  const totalRow = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(diagnosticSubmissions);
  const total = Number(totalRow[0]?.cnt ?? 0);

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [last24hRow] = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(diagnosticSubmissions)
    .where(sql`${diagnosticSubmissions.createdAt} >= ${since24h}`);

  const [last7dRow] = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(diagnosticSubmissions)
    .where(sql`${diagnosticSubmissions.createdAt} >= ${since7d}`);

  const profileRows = await db
    .select({
      profile: diagnosticSubmissions.primaryProfile,
      cnt: sql<number>`count(*)`,
    })
    .from(diagnosticSubmissions)
    .groupBy(diagnosticSubmissions.primaryProfile);

  const byProfile: Record<Profile, number> = {
    underRecovered: 0,
    polarisation: 0,
    strengthGap: 0,
    fuelingDeficit: 0,
  };
  for (const r of profileRows) {
    const p = r.profile as Profile;
    if (p in byProfile) byProfile[p] = Number(r.cnt);
  }

  const [llmRow] = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(diagnosticSubmissions)
    .where(eq(diagnosticSubmissions.generationSource, "llm"));
  const llmCount = Number(llmRow?.cnt ?? 0);

  return {
    total,
    last7d: Number(last7dRow?.cnt ?? 0),
    last24h: Number(last24hRow?.cnt ?? 0),
    byProfile,
    llmSuccessRate: total > 0 ? (llmCount / total) * 100 : 0,
    avgTtlSeconds: null,
  };
}
