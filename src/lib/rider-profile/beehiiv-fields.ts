import type { RiderProfile } from "./types";
import { deriveWattsPerKg } from "./types";

/**
 * Map a rider profile onto the flat Beehiiv custom-field shape used
 * for newsletter segmentation. All values are scalars (string|number)
 * — Beehiiv doesn't support arrays here.
 *
 * Keep this list deliberately small and segmentable. Fields that are
 * personal narrative (injury history, main goal) are NOT synced —
 * they're stored locally in Postgres and surfaced inside /profile.
 */
export function riderProfileBeehiivFields(
  profile: RiderProfile,
): Record<string, string | number | null | undefined> {
  const wkg = deriveWattsPerKg(profile);
  return {
    age_range: profile.ageRange ?? undefined,
    discipline: profile.discipline ?? undefined,
    weekly_training_hours: profile.weeklyTrainingHours ?? undefined,
    current_ftp: profile.currentFtp ?? undefined,
    weight_kg:
      profile.currentWeight != null
        ? profile.weightUnit === "lb"
          ? Math.round(profile.currentWeight * 0.45359237 * 10) / 10
          : profile.currentWeight
        : undefined,
    watts_per_kg: wkg ?? undefined,
    biggest_limiter: profile.biggestLimiter ?? undefined,
    target_event: profile.targetEvent ?? undefined,
    target_event_date: profile.targetEventDate
      ? profile.targetEventDate.toISOString().slice(0, 10)
      : undefined,
    body_composition_goal: profile.bodyCompositionGoal ?? undefined,
    preferred_support_level: profile.preferredSupportLevel ?? undefined,
    coaching_status: profile.coachingStatus ?? undefined,
    access_tier: profile.accessTier,
    current_tools: profile.currentTools.length
      ? profile.currentTools.join(",")
      : undefined,
  };
}
