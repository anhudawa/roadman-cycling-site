import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { toolResults } from "@/lib/db/schema";
import { generateToolResultSlug } from "./slug";
import type {
  SaveToolResultInput,
  ToolResult,
  ToolResultSummary,
  ToolResultUtm,
  ToolSlug,
} from "./types";
import { isToolSlug } from "./types";

type Row = typeof toolResults.$inferSelect;

function rowToDomain(row: Row): ToolResult {
  const slug = isToolSlug(row.toolSlug) ? row.toolSlug : ("plateau" as ToolSlug);
  return {
    id: row.id,
    slug: row.slug,
    riderProfileId: row.riderProfileId,
    email: row.email,
    toolSlug: slug,
    inputs: (row.inputs ?? {}) as Record<string, unknown>,
    outputs: (row.outputs ?? {}) as Record<string, unknown>,
    summary: row.summary,
    primaryResult: row.primaryResult,
    tags: (row.tags ?? []) as string[],
    utm: (row.utm ?? null) as ToolResultUtm | null,
    sourcePage: row.sourcePage,
    emailSentAt: row.emailSentAt,
    askHandoffAt: row.askHandoffAt,
    createdAt: row.createdAt,
  };
}

const SLUG_RETRY_ATTEMPTS = 3;

export async function saveToolResult(
  input: SaveToolResultInput,
): Promise<ToolResult> {
  for (let attempt = 0; attempt < SLUG_RETRY_ATTEMPTS; attempt++) {
    const slug = generateToolResultSlug();
    try {
      const [row] = await db
        .insert(toolResults)
        .values({
          slug,
          riderProfileId: input.riderProfileId,
          email: input.email,
          toolSlug: input.toolSlug,
          inputs: input.inputs,
          outputs: input.outputs,
          summary: input.summary,
          primaryResult: input.primaryResult,
          tags: input.tags,
          utm: (input.utm ?? null) as Record<string, string | null | undefined> | null,
          sourcePage: input.sourcePage ?? null,
        })
        .returning();
      return rowToDomain(row);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < SLUG_RETRY_ATTEMPTS - 1 && /unique|duplicate/i.test(msg)) continue;
      throw err;
    }
  }
  throw new Error(
    `Failed to allocate a unique tool_results slug after ${SLUG_RETRY_ATTEMPTS} attempts`,
  );
}

export async function getToolResultBySlug(
  slug: string,
): Promise<ToolResult | null> {
  const [row] = await db
    .select()
    .from(toolResults)
    .where(eq(toolResults.slug, slug))
    .limit(1);
  return row ? rowToDomain(row) : null;
}

/**
 * History for a given email (used by /results history page). Capped at
 * 50 $€” if a rider has run more than that we cross that bridge later.
 */
export async function listToolResultsByEmail(
  email: string,
  limit = 50,
): Promise<ToolResultSummary[]> {
  const rows = await db
    .select({
      slug: toolResults.slug,
      toolSlug: toolResults.toolSlug,
      summary: toolResults.summary,
      primaryResult: toolResults.primaryResult,
      createdAt: toolResults.createdAt,
    })
    .from(toolResults)
    .where(eq(toolResults.email, email))
    .orderBy(desc(toolResults.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    slug: r.slug,
    toolSlug: isToolSlug(r.toolSlug) ? r.toolSlug : ("plateau" as ToolSlug),
    summary: r.summary,
    primaryResult: r.primaryResult,
    createdAt: r.createdAt,
  }));
}

export async function listToolResultsByRiderProfile(
  riderProfileId: number,
  limit = 50,
): Promise<ToolResultSummary[]> {
  const rows = await db
    .select({
      slug: toolResults.slug,
      toolSlug: toolResults.toolSlug,
      summary: toolResults.summary,
      primaryResult: toolResults.primaryResult,
      createdAt: toolResults.createdAt,
    })
    .from(toolResults)
    .where(eq(toolResults.riderProfileId, riderProfileId))
    .orderBy(desc(toolResults.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    slug: r.slug,
    toolSlug: isToolSlug(r.toolSlug) ? r.toolSlug : ("plateau" as ToolSlug),
    summary: r.summary,
    primaryResult: r.primaryResult,
    createdAt: r.createdAt,
  }));
}

export async function markEmailSent(slug: string): Promise<void> {
  await db
    .update(toolResults)
    .set({ emailSentAt: new Date() })
    .where(eq(toolResults.slug, slug));
}

/**
 * First hand-off click wins; subsequent clicks re-read the existing
 * timestamp so the analytics funnel counts unique conversions, not
 * repeated navigation.
 */
export async function markAskHandoff(slug: string): Promise<Date> {
  const existing = await db
    .select({ askHandoffAt: toolResults.askHandoffAt })
    .from(toolResults)
    .where(eq(toolResults.slug, slug))
    .limit(1);
  if (existing[0]?.askHandoffAt) return existing[0].askHandoffAt;

  const now = new Date();
  await db
    .update(toolResults)
    .set({ askHandoffAt: now })
    .where(and(eq(toolResults.slug, slug), sql`${toolResults.askHandoffAt} IS NULL`));
  return now;
}
