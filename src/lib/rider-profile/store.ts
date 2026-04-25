import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { riderProfiles, contacts } from "@/lib/db/schema";
import type {
  CoachingStatus,
  RiderProfile,
  TrainingTool,
  UpsertRiderProfileInput,
  WeightUnit,
} from "./types";

type RiderProfileRow = typeof riderProfiles.$inferSelect;

function parseNumeric(x: string | null): number | null {
  if (x == null) return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function toDomain(row: RiderProfileRow): RiderProfile {
  return {
    id: row.id,
    contactId: row.contactId,
    email: row.email,
    firstName: row.firstName,
    ageRange: row.ageRange,
    discipline: row.discipline,
    weeklyTrainingHours: row.weeklyTrainingHours,
    currentFtp: row.currentFtp,
    currentWeight: parseNumeric(row.currentWeight),
    weightUnit: (row.weightUnit as WeightUnit | null) ?? null,
    trainingTool: (row.trainingTool as TrainingTool) ?? null,
    targetEvent: row.targetEvent,
    coachingStatus: (row.coachingStatus as CoachingStatus) ?? null,
    coachingInterestLevel: row.coachingInterestLevel,
    leadScore: row.leadScore ?? null,
    mainGoal: row.mainGoal,
    biggestLimiter: row.biggestLimiter,
    coachingInterest: row.coachingInterest,
    selfCoachedOrCoached: row.selfCoachedOrCoached,
    accessTier: ((row.accessTier as RiderProfile["accessTier"]) ?? "free"),
    consentSaveProfile: row.consentSaveProfile,
    consentEmailFollowup: row.consentEmailFollowup,
    marketingConsent: row.marketingConsent ?? false,
    dataStorageConsent: row.dataStorageConsent ?? false,
    researchConsent: row.researchConsent ?? false,
    consentRecordedAt: row.consentRecordedAt,
    lastLeadScoreAt: row.lastLeadScoreAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function loadByEmail(email: string): Promise<RiderProfile | null> {
  const [row] = await db
    .select()
    .from(riderProfiles)
    .where(eq(riderProfiles.email, email))
    .limit(1);
  return row ? toDomain(row) : null;
}

export async function loadById(id: number): Promise<RiderProfile | null> {
  const [row] = await db
    .select()
    .from(riderProfiles)
    .where(eq(riderProfiles.id, id))
    .limit(1);
  return row ? toDomain(row) : null;
}

export async function upsertByEmail(
  input: UpsertRiderProfileInput,
): Promise<RiderProfile> {
  const consentBeingSet =
    input.consentSaveProfile === true ||
    input.consentEmailFollowup === true ||
    input.marketingConsent === true ||
    input.dataStorageConsent === true ||
    input.researchConsent === true;
  const now = new Date();

  // Ensure a contact row exists for this email $€” FK target for rider_profiles.contact_id.
  const [contact] = await db
    .insert(contacts)
    .values({ email: input.email, name: input.firstName ?? undefined })
    .onConflictDoUpdate({
      target: contacts.email,
      set: { updatedAt: now },
    })
    .returning();

  // numeric columns want strings in Drizzle
  const currentWeightStr =
    input.currentWeight !== undefined
      ? input.currentWeight === null
        ? null
        : input.currentWeight.toFixed(2)
      : undefined;

  // Only patch fields explicitly provided $€” `undefined` preserves existing values.
  const patch: Record<string, unknown> = { updatedAt: now };
  if (input.firstName !== undefined) patch.firstName = input.firstName;
  if (input.ageRange !== undefined) patch.ageRange = input.ageRange;
  if (input.discipline !== undefined) patch.discipline = input.discipline;
  if (input.weeklyTrainingHours !== undefined) patch.weeklyTrainingHours = input.weeklyTrainingHours;
  if (input.currentFtp !== undefined) patch.currentFtp = input.currentFtp;
  if (currentWeightStr !== undefined) patch.currentWeight = currentWeightStr;
  if (input.weightUnit !== undefined) patch.weightUnit = input.weightUnit;
  if (input.trainingTool !== undefined) patch.trainingTool = input.trainingTool;
  if (input.targetEvent !== undefined) patch.targetEvent = input.targetEvent;
  if (input.coachingStatus !== undefined) patch.coachingStatus = input.coachingStatus;
  if (input.coachingInterestLevel !== undefined) patch.coachingInterestLevel = input.coachingInterestLevel;
  if (input.mainGoal !== undefined) patch.mainGoal = input.mainGoal;
  if (input.biggestLimiter !== undefined) patch.biggestLimiter = input.biggestLimiter;
  if (input.coachingInterest !== undefined) patch.coachingInterest = input.coachingInterest;
  if (input.selfCoachedOrCoached !== undefined) patch.selfCoachedOrCoached = input.selfCoachedOrCoached;
  if (input.consentSaveProfile !== undefined) patch.consentSaveProfile = input.consentSaveProfile;
  if (input.consentEmailFollowup !== undefined) patch.consentEmailFollowup = input.consentEmailFollowup;
  if (input.marketingConsent !== undefined) patch.marketingConsent = input.marketingConsent;
  if (input.dataStorageConsent !== undefined) patch.dataStorageConsent = input.dataStorageConsent;
  if (input.researchConsent !== undefined) patch.researchConsent = input.researchConsent;
  if (consentBeingSet) patch.consentRecordedAt = now;

  const [row] = await db
    .insert(riderProfiles)
    .values({
      email: input.email,
      contactId: contact.id,
      firstName: input.firstName ?? null,
      ageRange: input.ageRange ?? null,
      discipline: input.discipline ?? null,
      weeklyTrainingHours: input.weeklyTrainingHours ?? null,
      currentFtp: input.currentFtp ?? null,
      currentWeight: currentWeightStr ?? null,
      weightUnit: input.weightUnit ?? null,
      trainingTool: input.trainingTool ?? null,
      targetEvent: input.targetEvent ?? null,
      coachingStatus: input.coachingStatus ?? null,
      coachingInterestLevel: input.coachingInterestLevel ?? null,
      mainGoal: input.mainGoal ?? null,
      biggestLimiter: input.biggestLimiter ?? null,
      coachingInterest: input.coachingInterest ?? null,
      selfCoachedOrCoached: input.selfCoachedOrCoached ?? null,
      consentSaveProfile: input.consentSaveProfile ?? false,
      consentEmailFollowup: input.consentEmailFollowup ?? false,
      marketingConsent: input.marketingConsent ?? false,
      dataStorageConsent: input.dataStorageConsent ?? false,
      researchConsent: input.researchConsent ?? false,
      consentRecordedAt: consentBeingSet ? now : null,
    })
    .onConflictDoUpdate({
      target: riderProfiles.email,
      set: patch,
    })
    .returning();

  return toDomain(row);
}

export async function updateLeadScore(
  id: number,
  score: number,
): Promise<void> {
  await db
    .update(riderProfiles)
    .set({ leadScore: score, lastLeadScoreAt: new Date() })
    .where(eq(riderProfiles.id, id));
}
