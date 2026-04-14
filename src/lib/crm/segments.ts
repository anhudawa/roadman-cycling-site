import { db } from "@/lib/db";
import { contacts, segments, type SegmentFilters } from "@/lib/db/schema";
import { asc, desc, eq, sql, type SQL } from "drizzle-orm";

export type { SegmentFilters };
export type Segment = typeof segments.$inferSelect;
export type Contact = typeof contacts.$inferSelect;

export interface SegmentRow {
  id: number;
  name: string;
  description: string | null;
  filters: SegmentFilters;
  createdBySlug: string | null;
  createdAt: string;
  updatedAt: string;
}

function serialize(s: Segment): SegmentRow {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    filters: (s.filters ?? {}) as SegmentFilters,
    createdBySlug: s.createdBySlug,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

// ── CRUD ──────────────────────────────────────────────────

export async function listSegments(): Promise<SegmentRow[]> {
  const rows = await db.select().from(segments).orderBy(asc(segments.name));
  return rows.map(serialize);
}

export async function getSegment(id: number): Promise<SegmentRow | null> {
  const rows = await db.select().from(segments).where(eq(segments.id, id)).limit(1);
  return rows[0] ? serialize(rows[0]) : null;
}

export interface CreateSegmentParams {
  name: string;
  description?: string | null;
  filters: SegmentFilters;
  createdBySlug?: string | null;
}

export async function createSegment(params: CreateSegmentParams): Promise<SegmentRow> {
  const inserted = await db
    .insert(segments)
    .values({
      name: params.name.trim(),
      description: params.description ?? null,
      filters: params.filters ?? {},
      createdBySlug: params.createdBySlug ?? null,
    })
    .returning();
  return serialize(inserted[0]);
}

export interface UpdateSegmentPatch {
  name?: string;
  description?: string | null;
  filters?: SegmentFilters;
}

export async function updateSegment(
  id: number,
  patch: UpdateSegmentPatch
): Promise<SegmentRow | null> {
  const updates: Partial<typeof segments.$inferInsert> = { updatedAt: new Date() };
  if (patch.name !== undefined) updates.name = patch.name.trim();
  if (patch.description !== undefined) updates.description = patch.description;
  if (patch.filters !== undefined) updates.filters = patch.filters;
  const updated = await db
    .update(segments)
    .set(updates)
    .where(eq(segments.id, id))
    .returning();
  return updated[0] ? serialize(updated[0]) : null;
}

export async function deleteSegment(id: number): Promise<boolean> {
  const deleted = await db
    .delete(segments)
    .where(eq(segments.id, id))
    .returning({ id: segments.id });
  return deleted.length > 0;
}

// ── Filter SQL construction ───────────────────────────────

/**
 * Build a SQL WHERE fragment from segment filters.
 * Returns a SQL fragment suitable for passing into .where(), or undefined if no filters.
 */
export function buildWhere(filters: SegmentFilters): SQL | undefined {
  const parts: SQL[] = [];
  const f = filters ?? {};

  if (Array.isArray(f.tagsAny) && f.tagsAny.length > 0) {
    // contact.tags is a jsonb array; use ?| operator for "contains any key"
    const arr = sql.raw(
      `ARRAY[${f.tagsAny.map((t) => `'${t.replace(/'/g, "''")}'`).join(",")}]::text[]`
    );
    parts.push(sql`${contacts.tags} ?| ${arr}`);
  }

  if (Array.isArray(f.lifecycleStageIn) && f.lifecycleStageIn.length > 0) {
    const values = f.lifecycleStageIn.map((v) => sql`${v}`);
    parts.push(sql`${contacts.lifecycleStage} IN (${sql.join(values, sql`, `)})`);
  }

  if (Array.isArray(f.ownerIn) && f.ownerIn.length > 0) {
    const values = f.ownerIn.map((v) => sql`${v}`);
    parts.push(sql`${contacts.owner} IN (${sql.join(values, sql`, `)})`);
  }

  if (Array.isArray(f.sourceIn) && f.sourceIn.length > 0) {
    const values = f.sourceIn.map((v) => sql`${v}`);
    parts.push(sql`${contacts.source} IN (${sql.join(values, sql`, `)})`);
  }

  if (f.isSubscriber === true) {
    parts.push(
      sql`${contacts.customFields}->'enrichment'->'beehiiv'->>'isSubscriber' = 'true'`
    );
  } else if (f.isSubscriber === false) {
    parts.push(
      sql`(${contacts.customFields}->'enrichment'->'beehiiv'->>'isSubscriber' IS DISTINCT FROM 'true')`
    );
  }

  if (f.isCustomer === true) {
    parts.push(
      sql`${contacts.customFields}->'enrichment'->'stripe'->>'isCustomer' = 'true'`
    );
  } else if (f.isCustomer === false) {
    parts.push(
      sql`(${contacts.customFields}->'enrichment'->'stripe'->>'isCustomer' IS DISTINCT FROM 'true')`
    );
  }

  if (f.lastActivityBefore) {
    parts.push(sql`${contacts.lastActivityAt} < ${new Date(f.lastActivityBefore)}`);
  }
  if (f.lastActivityAfter) {
    parts.push(sql`${contacts.lastActivityAt} >= ${new Date(f.lastActivityAfter)}`);
  }
  if (f.createdAfter) {
    parts.push(sql`${contacts.createdAt} >= ${new Date(f.createdAfter)}`);
  }
  if (f.createdBefore) {
    parts.push(sql`${contacts.createdAt} < ${new Date(f.createdBefore)}`);
  }

  if (f.search && f.search.trim()) {
    const needle = `%${f.search.trim()}%`;
    parts.push(sql`(${contacts.email} ILIKE ${needle} OR COALESCE(${contacts.name}, '') ILIKE ${needle})`);
  }

  if (parts.length === 0) return undefined;
  return sql.join(parts, sql` AND `);
}

/** Sanitize arbitrary input into a SegmentFilters object. */
export function sanitizeFilters(input: unknown): SegmentFilters {
  if (!input || typeof input !== "object") return {};
  const r = input as Record<string, unknown>;
  const out: SegmentFilters = {};

  const strArr = (v: unknown): string[] | undefined => {
    if (!Array.isArray(v)) return undefined;
    const arr = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((s) => s.trim());
    return arr.length > 0 ? arr : undefined;
  };

  const tagsAny = strArr(r.tagsAny);
  if (tagsAny) out.tagsAny = tagsAny;
  const lifecycleStageIn = strArr(r.lifecycleStageIn);
  if (lifecycleStageIn) out.lifecycleStageIn = lifecycleStageIn;
  const ownerIn = strArr(r.ownerIn);
  if (ownerIn) out.ownerIn = ownerIn;
  const sourceIn = strArr(r.sourceIn);
  if (sourceIn) out.sourceIn = sourceIn;

  if (typeof r.isSubscriber === "boolean") out.isSubscriber = r.isSubscriber;
  if (typeof r.isCustomer === "boolean") out.isCustomer = r.isCustomer;

  const iso = (v: unknown): string | undefined => {
    if (typeof v !== "string" || !v.trim()) return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  };
  const lab = iso(r.lastActivityBefore); if (lab) out.lastActivityBefore = lab;
  const laa = iso(r.lastActivityAfter); if (laa) out.lastActivityAfter = laa;
  const ca = iso(r.createdAfter); if (ca) out.createdAfter = ca;
  const cb = iso(r.createdBefore); if (cb) out.createdBefore = cb;

  if (typeof r.search === "string" && r.search.trim()) out.search = r.search.trim();

  return out;
}

// ── Evaluation ────────────────────────────────────────────

export async function countSegmentMembers(id: number): Promise<number> {
  const seg = await getSegment(id);
  if (!seg) return 0;
  return countByFilters(seg.filters);
}

export async function countByFilters(filters: SegmentFilters): Promise<number> {
  const where = buildWhere(filters);
  const q = db.select({ count: sql<number>`count(*)::int` }).from(contacts);
  const rows = where ? await q.where(where) : await q;
  return rows[0]?.count ?? 0;
}

export async function listSegmentMembers(
  id: number,
  opts: { limit?: number; offset?: number } = {}
): Promise<Contact[]> {
  const seg = await getSegment(id);
  if (!seg) return [];
  return listByFilters(seg.filters, opts);
}

export async function listByFilters(
  filters: SegmentFilters,
  opts: { limit?: number; offset?: number } = {}
): Promise<Contact[]> {
  const limit = opts.limit ?? 100;
  const offset = opts.offset ?? 0;
  const where = buildWhere(filters);
  const base = db.select().from(contacts);
  const q = where ? base.where(where) : base;
  return q.orderBy(desc(contacts.lastActivityAt), desc(contacts.createdAt)).limit(limit).offset(offset);
}

export interface EvaluateResult {
  count: number;
  preview: Contact[];
}

export async function evaluateFilters(
  filters: SegmentFilters,
  opts: { previewLimit?: number } = {}
): Promise<EvaluateResult> {
  const previewLimit = opts.previewLimit ?? 20;
  const [count, preview] = await Promise.all([
    countByFilters(filters),
    listByFilters(filters, { limit: previewLimit, offset: 0 }),
  ]);
  return { count, preview };
}
