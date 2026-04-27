import { db } from "@/lib/db";
import { brandPrompts, brandCitationRuns } from "@/lib/db/schema";
import { desc, eq, gte, sql } from "drizzle-orm";

export interface BrandPrompt {
  id: number;
  prompt: string;
  category: string;
  enabled: boolean;
  createdAt: Date;
}

export async function listEnabledPrompts(): Promise<BrandPrompt[]> {
  return db.select().from(brandPrompts).where(eq(brandPrompts.enabled, true));
}

export async function listAllPrompts(): Promise<BrandPrompt[]> {
  return db.select().from(brandPrompts).orderBy(desc(brandPrompts.createdAt));
}

export async function addPrompt(prompt: string, category: string) {
  await db.insert(brandPrompts).values({ prompt, category });
}

export async function setPromptEnabled(id: number, enabled: boolean) {
  await db.update(brandPrompts).set({ enabled }).where(eq(brandPrompts.id, id));
}

export async function deletePrompt(id: number) {
  await db.delete(brandPrompts).where(eq(brandPrompts.id, id));
}

export interface NewRunRow {
  promptId: number;
  model: string;
  response: string | null;
  mentioned: boolean;
  matchedTerms: string[];
  matchedUrls: string[];
  citations: string[];
  error: string | null;
}

export async function recordRun(row: NewRunRow): Promise<void> {
  await db.insert(brandCitationRuns).values({
    promptId: row.promptId,
    model: row.model,
    response: row.response,
    mentioned: row.mentioned,
    matchedTerms: row.matchedTerms,
    matchedUrls: row.matchedUrls,
    citations: row.citations,
    error: row.error,
  });
}

export interface LatestRun {
  promptId: number;
  prompt: string;
  category: string;
  model: string;
  mentioned: boolean;
  ranAt: Date;
  error: string | null;
}

/**
 * Most-recent run for each (prompt, model) pair. Used by the citations
 * admin page to render the per-prompt status matrix.
 */
export async function getLatestRunMatrix(): Promise<LatestRun[]> {
  const result = await db.execute(sql`
    SELECT DISTINCT ON (r.prompt_id, r.model)
      r.prompt_id, p.prompt, p.category, r.model, r.mentioned, r.ran_at, r.error
    FROM brand_citation_runs r
    JOIN brand_prompts p ON p.id = r.prompt_id
    ORDER BY r.prompt_id, r.model, r.ran_at DESC
  `);
  return (result.rows as Record<string, unknown>[]).map((r) => ({
    promptId: Number(r.prompt_id),
    prompt: String(r.prompt),
    category: String(r.category),
    model: String(r.model),
    mentioned: r.mentioned === true,
    ranAt: new Date(r.ran_at as string),
    error: (r.error as string | null) ?? null,
  }));
}

export interface MentionRatePoint {
  date: string;
  total: number;
  mentioned: number;
  rate: number; // 0..1
}

/**
 * Weekly-bucketed mention rate over the last `weeks` weeks. Powers the
 * citations panel sparkline on the measurement dashboard.
 */
export async function getMentionRateOverTime(
  weeks = 12,
): Promise<MentionRatePoint[]> {
  const since = new Date(Date.now() - weeks * 7 * 86_400_000);
  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('week', ${brandCitationRuns.ranAt}), 'YYYY-MM-DD')`,
      total: sql<number>`count(*)::int`,
      mentioned: sql<number>`count(*) filter (where ${brandCitationRuns.mentioned})::int`,
    })
    .from(brandCitationRuns)
    .where(gte(brandCitationRuns.ranAt, since))
    .groupBy(sql`date_trunc('week', ${brandCitationRuns.ranAt})`)
    .orderBy(sql`date_trunc('week', ${brandCitationRuns.ranAt})`);

  return rows.map((r) => ({
    date: r.date,
    total: Number(r.total),
    mentioned: Number(r.mentioned),
    rate: Number(r.total) > 0 ? Number(r.mentioned) / Number(r.total) : 0,
  }));
}
