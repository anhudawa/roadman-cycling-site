export type WeightUnit = "kg" | "lb";
export type TrainingTool = "zwift" | "trainerroad" | "outside" | "garmin" | "wahoo" | "other" | null;
export type CoachingStatus = "self_coached" | "coached" | "unsure" | null;
export type BodyCompositionGoal = "lose" | "maintain" | "gain" | null;
export type PreferredSupportLevel = "self_guided" | "community" | "coached" | null;

/** Multi-select training-tool slugs the rider already uses. */
export const KNOWN_RIDER_TOOLS = [
  "strava",
  "garmin",
  "wahoo",
  "zwift",
  "trainingpeaks",
  "trainerroad",
  "other",
] as const;
export type KnownRiderTool = (typeof KNOWN_RIDER_TOOLS)[number];

export interface RiderProfile {
  id: number;
  contactId: number | null;
  email: string;
  firstName: string | null;
  ageRange: string | null;
  discipline: string | null;
  weeklyTrainingHours: number | null;
  currentFtp: number | null;
  currentWeight: number | null;
  weightUnit: WeightUnit | null;
  heightCm: number | null;
  trainingTool: TrainingTool;
  currentTools: string[];
  targetEvent: string | null;
  targetEventDate: Date | null;
  coachingStatus: CoachingStatus;
  coachingInterestLevel: number | null;
  leadScore: number | null;
  mainGoal: string | null;
  biggestLimiter: string | null;
  coachingInterest: string | null;
  selfCoachedOrCoached: string | null;
  bodyCompositionGoal: BodyCompositionGoal;
  preferredSupportLevel: PreferredSupportLevel;
  injuryHistory: string | null;
  accessTier: "free" | "plus" | "vip";
  consentSaveProfile: boolean;
  consentEmailFollowup: boolean;
  marketingConsent: boolean;
  dataStorageConsent: boolean;
  researchConsent: boolean;
  consentRecordedAt: Date | null;
  lastLeadScoreAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Power-to-weight derived from currentFtp and currentWeight (kg). */
export function deriveWattsPerKg(profile: Pick<RiderProfile, "currentFtp" | "currentWeight" | "weightUnit">): number | null {
  if (!profile.currentFtp || !profile.currentWeight) return null;
  const weightKg = profile.weightUnit === "lb"
    ? profile.currentWeight * 0.45359237
    : profile.currentWeight;
  if (weightKg <= 0) return null;
  return Math.round((profile.currentFtp / weightKg) * 100) / 100;
}

export interface UpsertRiderProfileInput {
  email: string;
  firstName?: string | null;
  ageRange?: string | null;
  discipline?: string | null;
  weeklyTrainingHours?: number | null;
  currentFtp?: number | null;
  currentWeight?: number | null;
  weightUnit?: WeightUnit | null;
  heightCm?: number | null;
  trainingTool?: TrainingTool;
  currentTools?: string[];
  targetEvent?: string | null;
  targetEventDate?: Date | string | null;
  coachingStatus?: CoachingStatus;
  coachingInterestLevel?: number | null;
  mainGoal?: string | null;
  biggestLimiter?: string | null;
  coachingInterest?: string | null;
  selfCoachedOrCoached?: string | null;
  bodyCompositionGoal?: BodyCompositionGoal;
  preferredSupportLevel?: PreferredSupportLevel;
  injuryHistory?: string | null;
  consentSaveProfile?: boolean;
  consentEmailFollowup?: boolean;
  marketingConsent?: boolean;
  dataStorageConsent?: boolean;
  researchConsent?: boolean;
}
