import type { Answers, HoursBracket, Profile } from "./types";

/**
 * Convert a plateau-diagnostic submission into a rider_profile patch.
 *
 * Keeps the mapping in one place so the submit route and any retake
 * flow both derive fields identically. Every field is optional $—
 * downstream upsert treats `undefined` as "don't overwrite existing",
 * which is what we want for progressive profile building across tools.
 */

const HOURS_MIDPOINT: Record<HoursBracket, number> = {
  "under-5": 4,
  "5-8": 7,
  "9-12": 10,
  "13+": 14,
};

// Maps the diagnostic's four profiles onto the rider_profile's
// biggest_limiter field. The values are deliberately short, lower-case,
// and stable so Ask Roadman + dashboards can key on them.
const LIMITER_FROM_PROFILE: Record<Profile, string> = {
  underRecovered: "recovery",
  polarisation: "intensity-distribution",
  strengthGap: "strength",
  fuelingDeficit: "fuelling",
};

export interface PlateauProfilePatch {
  firstName?: string | null;
  ageRange?: string | null;
  weeklyTrainingHours?: number | null;
  currentFtp?: number | null;
  mainGoal?: string | null;
  biggestLimiter?: string | null;
  consentSaveProfile?: boolean;
  consentEmailFollowup?: boolean;
}

export function riderProfilePatchFromDiagnostic(args: {
  answers: Answers;
  primary: Profile;
  consent: boolean;
}): PlateauProfilePatch {
  const { answers, primary, consent } = args;
  return {
    ageRange: answers.age,
    weeklyTrainingHours: HOURS_MIDPOINT[answers.hoursPerWeek],
    currentFtp: answers.ftp ?? null,
    mainGoal: answers.goal?.trim() || null,
    biggestLimiter: LIMITER_FROM_PROFILE[primary],
    consentSaveProfile: consent,
    consentEmailFollowup: consent,
  };
}
