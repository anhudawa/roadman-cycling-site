import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { methodProgress } from "./schema";
import {
  METHOD_MODULES,
  METHOD_MODULE_BY_SLUG,
  METHOD_TOTAL_MODULES,
} from "./modules";

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

export interface ProgressCompletion {
  slug: string;
  completedAt: Date;
}

export interface ProgressSummary {
  completedSlugs: Set<string>;
  completedCount: number;
  totalCount: number;
  percentComplete: number;
  /** Most-recent-first list of completions. */
  completions: ProgressCompletion[];
  /**
   * Longest in-order prefix of completed weeks. If the user finished
   * weeks 1, 2, 3 in order, streak = 3. If they skipped week 2 and
   * did 1, 3, streak = 1. Resets on first gap.
   */
  inOrderStreak: number;
  /** Total estimated minutes invested in completed modules. */
  totalMinutesInvested: number;
}

export async function getProgressSummary(
  enrollmentId: number,
): Promise<ProgressSummary> {
  const rows = await db
    .select({
      slug: methodProgress.moduleSlug,
      completedAt: methodProgress.completedAt,
    })
    .from(methodProgress)
    .where(eq(methodProgress.enrollmentId, enrollmentId))
    .orderBy(desc(methodProgress.completedAt));

  const completedSlugs = new Set(rows.map((r) => r.slug));
  const completedCount = completedSlugs.size;
  const totalCount = METHOD_TOTAL_MODULES;
  const percentComplete = Math.round((completedCount / totalCount) * 100);

  let inOrderStreak = 0;
  for (const module of METHOD_MODULES) {
    if (completedSlugs.has(module.slug)) {
      inOrderStreak += 1;
    } else {
      break;
    }
  }

  let totalMinutesInvested = 0;
  for (const slug of completedSlugs) {
    const module = METHOD_MODULE_BY_SLUG.get(slug);
    if (module) totalMinutesInvested += module.estimatedReadMinutes;
  }

  return {
    completedSlugs,
    completedCount,
    totalCount,
    percentComplete,
    completions: rows.map((r) => ({ slug: r.slug, completedAt: r.completedAt })),
    inOrderStreak,
    totalMinutesInvested,
  };
}
