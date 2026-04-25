import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export interface TagUsage {
  tag: string;
  count: number;
}

/** List every distinct tag across contacts with usage counts. */
export async function listAllTags(): Promise<TagUsage[]> {
  const rows = (await db.execute(sql`
    SELECT jsonb_array_elements_text(tags) AS tag, COUNT(*)::int AS count
    FROM contacts
    GROUP BY jsonb_array_elements_text(tags)
    ORDER BY COUNT(*) DESC, jsonb_array_elements_text(tags) ASC
  `)) as unknown as Array<{ tag: string; count: number }>;

  return rows.map((r) => ({ tag: r.tag, count: Number(r.count) }));
}

/**
 * Rename a tag on every contact that currently has it. Returns count touched.
 * Uses a JS fallback $€” building a jsonb_agg subquery against a LATERAL
 * jsonb_array_elements_text isn't reliable when the array may be empty or null.
 */
export async function renameTag(oldName: string, newName: string): Promise<number> {
  const trimmedOld = oldName.trim();
  const trimmedNew = newName.trim();
  if (!trimmedOld || !trimmedNew) return 0;
  if (trimmedOld === trimmedNew) return 0;

  const rows = (await db.execute(sql`
    SELECT id, tags FROM contacts WHERE tags ? ${trimmedOld}
  `)) as unknown as Array<{ id: number; tags: string[] | null }>;

  let touched = 0;
  for (const row of rows) {
    const existing = Array.isArray(row.tags) ? row.tags : [];
    const next = Array.from(
      new Set(existing.map((t) => (t === trimmedOld ? trimmedNew : t)))
    );
    await db
      .update(contacts)
      .set({ tags: next, updatedAt: new Date() })
      .where(sql`${contacts.id} = ${row.id}`);
    touched++;
  }
  return touched;
}

/** Merge many source tag names into one target tag. Returns count touched. */
export async function mergeTags(
  sourceNames: string[],
  targetName: string
): Promise<number> {
  const target = targetName.trim();
  const sources = sourceNames.map((s) => s.trim()).filter(Boolean);
  if (!target || sources.length === 0) return 0;

  const sourceSet = new Set(sources);
  // Build param list
  const values = sources.map((s) => sql`${s}`);
  const rows = (await db.execute(sql`
    SELECT id, tags FROM contacts WHERE tags ?| ARRAY[${sql.join(values, sql`, `)}]::text[]
  `)) as unknown as Array<{ id: number; tags: string[] | null }>;

  let touched = 0;
  for (const row of rows) {
    const existing = Array.isArray(row.tags) ? row.tags : [];
    const next = Array.from(
      new Set(existing.map((t) => (sourceSet.has(t) ? target : t)))
    );
    await db
      .update(contacts)
      .set({ tags: next, updatedAt: new Date() })
      .where(sql`${contacts.id} = ${row.id}`);
    touched++;
  }
  return touched;
}

/** Remove a tag from every contact. Returns count touched. */
export async function deleteTag(name: string): Promise<number> {
  const trimmed = name.trim();
  if (!trimmed) return 0;

  const rows = (await db.execute(sql`
    SELECT id, tags FROM contacts WHERE tags ? ${trimmed}
  `)) as unknown as Array<{ id: number; tags: string[] | null }>;

  let touched = 0;
  for (const row of rows) {
    const existing = Array.isArray(row.tags) ? row.tags : [];
    const next = existing.filter((t) => t !== trimmed);
    await db
      .update(contacts)
      .set({ tags: next, updatedAt: new Date() })
      .where(sql`${contacts.id} = ${row.id}`);
    touched++;
  }
  return touched;
}
