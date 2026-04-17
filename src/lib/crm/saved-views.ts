import { db } from "@/lib/db";
import { savedViews } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";

export type SavedView = typeof savedViews.$inferSelect;

export interface SavedViewRow {
  id: number;
  name: string;
  entity: string;
  filters: Record<string, unknown>;
  createdBySlug: string;
  createdAt: string;
}

function serialize(v: SavedView): SavedViewRow {
  return {
    id: v.id,
    name: v.name,
    entity: v.entity,
    filters: (v.filters ?? {}) as Record<string, unknown>,
    createdBySlug: v.createdBySlug,
    createdAt: v.createdAt.toISOString(),
  };
}

export async function listSavedViews(entity: string): Promise<SavedViewRow[]> {
  const rows = await db
    .select()
    .from(savedViews)
    .where(eq(savedViews.entity, entity))
    .orderBy(asc(savedViews.name));
  return rows.map(serialize);
}

export async function createSavedView(params: {
  name: string;
  entity: string;
  filters: Record<string, unknown>;
  createdBySlug: string;
}): Promise<SavedViewRow> {
  const inserted = await db
    .insert(savedViews)
    .values({
      name: params.name,
      entity: params.entity,
      filters: params.filters,
      createdBySlug: params.createdBySlug,
    })
    .returning();
  return serialize(inserted[0]);
}

export async function deleteSavedView(id: number, userSlug: string): Promise<boolean> {
  const deleted = await db
    .delete(savedViews)
    .where(and(eq(savedViews.id, id), eq(savedViews.createdBySlug, userSlug)))
    .returning({ id: savedViews.id });
  return deleted.length > 0;
}
