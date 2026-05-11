import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { methodProgress } from "./schema";
import { METHOD_MODULE_BY_SLUG, METHOD_TOTAL_MODULES } from "./modules";

/**
 * Mark a module complete for an enrollment. Idempotent: re-marking is a
 * silent no-op via the `(enrollment_id, module_slug)` unique index.
 *
 * Returns whether a new row was inserted (useful for analytics).
 */
export async function markModuleComplete(
  enrollmentId: number,
  moduleSlug: string,
): Promise<{ inserted: boolean }> {
  if (!METHOD_MODULE_BY_SLUG.has(moduleSlug)) {
    throw new Error(`Unknown module slug: ${moduleSlug}`);
  }
  const result = await db
    .insert(methodProgress)
    .values({ enrollmentId, moduleSlug })
    .onConflictDoNothing({
      target: [methodProgress.enrollmentId, methodProgress.moduleSlug],
    })
    .returning({ id: methodProgress.id });
  return { inserted: result.length > 0 };
}

/** Remove a completion mark (rare; provided for parity in the API). */
export async function unmarkModuleComplete(
  enrollmentId: number,
  moduleSlug: string,
): Promise<void> {
  await db
    .delete(methodProgress)
    .where(
      and(
        eq(methodProgress.enrollmentId, enrollmentId),
        eq(methodProgress.moduleSlug, moduleSlug),
      ),
    );
}

export interface ProgressSummary {
  completedSlugs: Set<string>;
  completedCount: number;
  totalCount: number;
  percentComplete: number;
}

export async function getProgressSummary(
  enrollmentId: number,
): Promise<ProgressSummary> {
  const rows = await db
    .select({ slug: methodProgress.moduleSlug })
    .from(methodProgress)
    .where(eq(methodProgress.enrollmentId, enrollmentId));
  const completedSlugs = new Set(rows.map((r) => r.slug));
  const completedCount = completedSlugs.size;
  const totalCount = METHOD_TOTAL_MODULES;
  const percentComplete = Math.round((completedCount / totalCount) * 100);
  return { completedSlugs, completedCount, totalCount, percentComplete };
}
