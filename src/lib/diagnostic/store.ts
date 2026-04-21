import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { diagnosticSubmissions } from "@/lib/db/schema";
import type { Breakdown, Profile, ScoringResult } from "./types";
import type { GenerationResult } from "./generator";
import type { Answers } from "./types";

/**
 * DB helpers for diagnostic submissions. Keeps Drizzle details out of
 * the route handler so the route can focus on request validation +
 * orchestration.
 */

const SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const SLUG_LEN = 10;

/**
 * URL-friendly short id. Collisions are astronomically unlikely at
 * 36^10 ≈ 3.6e15, but we still tolerate a unique-constraint retry in
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
  generationSource: "llm" | "fallback";
  createdAt: Date;
  answers: Answers;
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
    generationSource: row.generationSource as "llm" | "fallback",
    createdAt: row.createdAt,
    answers: row.answers as unknown as Answers,
  };
}

export async function insertSubmission(
  input: InsertSubmissionInput
): Promise<StoredSubmission> {
  const generationMeta = {
    attempts: input.generation.attempts,
    errors: input.generation.errors,
    validation: input.generation.validation,
  };

  // Up to 3 slug retries if the 10-char random collides. We can go
  // bigger if we ever actually see collisions, but at 36^10 the
  // expected waiting time is measured in universes.
  for (let i = 0; i < 3; i++) {
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
        })
        .returning();
      return rowToSubmission(row);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (i < 2 && /unique|duplicate/i.test(msg)) continue;
      throw err;
    }
  }
  throw new Error("Failed to allocate a unique diagnostic slug after 3 attempts");
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

export async function attachBeehiivId(slug: string, subscriberId: string): Promise<void> {
  await db
    .update(diagnosticSubmissions)
    .set({ beehiivSubscriberId: subscriberId, updatedAt: new Date() })
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
