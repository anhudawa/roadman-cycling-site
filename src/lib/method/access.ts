import type { MethodEnrollment } from "./schema";
import type { MethodModule } from "./modules";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Drip mode.
 *
 * TEMPORARY: defaulted to `all-at-once` so Anthony can review every module
 * end-to-end without waiting on the weekly drip. To restore the original
 * weekly drip, set `METHOD_DRIP_MODE=weekly` (or revert this function to
 * default to `"weekly"`).
 */
export function methodDripMode(): "weekly" | "all-at-once" {
  return process.env.METHOD_DRIP_MODE === "weekly" ? "weekly" : "all-at-once";
}

export interface ModuleAvailability {
  unlocked: boolean;
  unlocksAt: Date | null;
  daysUntilUnlock: number;
}

/**
 * Whether a module is available to a given enrollment right now.
 *
 * Availability is computed from `dripStartAt + module.unlocksOnDayOffset`.
 * `dripStartAt` is set to `paid_at` by the Stripe webhook; admin can
 * advance it to gift VIPs early access without flipping the global env.
 *
 * If env `METHOD_DRIP_MODE=all-at-once`, every module is unlocked
 * immediately for any active enrollment.
 */
export function isModuleUnlocked(
  enrollment: Pick<MethodEnrollment, "status" | "dripStartAt">,
  module: Pick<MethodModule, "unlocksOnDayOffset">,
  now: Date = new Date(),
): ModuleAvailability {
  if (enrollment.status !== "active") {
    return { unlocked: false, unlocksAt: null, daysUntilUnlock: Infinity };
  }
  if (methodDripMode() === "all-at-once") {
    return { unlocked: true, unlocksAt: null, daysUntilUnlock: 0 };
  }
  const start = enrollment.dripStartAt ?? new Date();
  const unlocksAt = new Date(start.getTime() + module.unlocksOnDayOffset * DAY_MS);
  const unlocked = now >= unlocksAt;
  const daysUntilUnlock = unlocked
    ? 0
    : Math.ceil((unlocksAt.getTime() - now.getTime()) / DAY_MS);
  return { unlocked, unlocksAt, daysUntilUnlock };
}
