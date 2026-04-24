export type WeightUnit = "kg" | "lb";
export type TrainingTool = "zwift" | "trainerroad" | "outside" | "garmin" | "wahoo" | "other" | null;
export type CoachingStatus = "self_coached" | "coached" | "unsure" | null;

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
  trainingTool: TrainingTool;
  targetEvent: string | null;
  coachingStatus: CoachingStatus;
  coachingInterestLevel: number | null;
  leadScore: number | null;
  mainGoal: string | null;
  biggestLimiter: string | null;
  coachingInterest: string | null;
  selfCoachedOrCoached: string | null;
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

export interface UpsertRiderProfileInput {
  email: string;
  firstName?: string | null;
  ageRange?: string | null;
  discipline?: string | null;
  weeklyTrainingHours?: number | null;
  currentFtp?: number | null;
  currentWeight?: number | null;
  weightUnit?: WeightUnit | null;
  trainingTool?: TrainingTool;
  targetEvent?: string | null;
  coachingStatus?: CoachingStatus;
  coachingInterestLevel?: number | null;
  mainGoal?: string | null;
  biggestLimiter?: string | null;
  coachingInterest?: string | null;
  selfCoachedOrCoached?: string | null;
  consentSaveProfile?: boolean;
  consentEmailFollowup?: boolean;
  marketingConsent?: boolean;
  dataStorageConsent?: boolean;
  researchConsent?: boolean;
}
