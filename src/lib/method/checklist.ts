/**
 * Server-side persistence for per-module week-checklist tick state.
 *
 * One row per (enrollment, module), upserted on every change. We store the
 * set of ticked item indexes; the caller reconstructs a boolean[] against
 * the current checklist length, so a content edit that changes item order
 * degrades gracefully (out-of-range indexes are ignored) rather than
 * corrupting state.
 */

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { methodChecklistState } from "./schema";

/** Returns the ticked item indexes for a module, or [] if none saved. */
export async function getChecklistState(
  enrollmentId: number,
  moduleSlug: string,
): Promise<number[]> {
  const rows = await db
    .select({ checkedIndexes: methodChecklistState.checkedIndexes })
    .from(methodChecklistState)
    .where(
      and(
        eq(methodChecklistState.enrollmentId, enrollmentId),
        eq(methodChecklistState.moduleSlug, moduleSlug),
      ),
    )
    .limit(1);
  return rows[0]?.checkedIndexes ?? [];
}

/** Reconstruct a boolean[] of `length` from saved ticked indexes. */
export function checkedBooleans(indexes: number[], length: number): boolean[] {
  const set = new Set(indexes);
  return Array.from({ length }, (_, i) => set.has(i));
}

export async function saveChecklistState(input: {
  enrollmentId: number;
  moduleSlug: string;
  checkedIndexes: number[];
}): Promise<void> {
  // Normalise: unique, sorted, non-negative integers only.
  const clean = Array.from(
    new Set(
      input.checkedIndexes.filter(
        (n) => Number.isInteger(n) && n >= 0 && n < 1000,
      ),
    ),
  ).sort((a, b) => a - b);

  await db
    .insert(methodChecklistState)
    .values({
      enrollmentId: input.enrollmentId,
      moduleSlug: input.moduleSlug,
      checkedIndexes: clean,
    })
    .onConflictDoUpdate({
      target: [
        methodChecklistState.enrollmentId,
        methodChecklistState.moduleSlug,
      ],
      set: {
        checkedIndexes: clean,
        updatedAt: new Date(),
      },
    });
}
