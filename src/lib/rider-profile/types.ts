export interface RiderProfile {
  id: number;
  contactId: number | null;
  email: string;
  firstName: string | null;
  ageRange: string | null;
  discipline: string | null;
  weeklyTrainingHours: number | null;
  currentFtp: number | null;
  mainGoal: string | null;
  biggestLimiter: string | null;
  coachingInterest: string | null;
  accessTier: "free" | "plus" | "vip";
  consentSaveProfile: boolean;
  consentEmailFollowup: boolean;
  consentRecordedAt: Date | null;
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
  mainGoal?: string | null;
  biggestLimiter?: string | null;
  coachingInterest?: string | null;
  consentSaveProfile?: boolean;
  consentEmailFollowup?: boolean;
}
