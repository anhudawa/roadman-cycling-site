import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { riderProfiles, contacts } from "@/lib/db/schema";
import type { RiderProfile, UpsertRiderProfileInput } from "./types";

type RiderProfileRow = typeof riderProfiles.$inferSelect;

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
    mainGoal: row.mainGoal,
    biggestLimiter: row.biggestLimiter,
    coachingInterest: row.coachingInterest,
    selfCoachedOrCoached: row.selfCoachedOrCoached,
    accessTier: ((row.accessTier as RiderProfile["accessTier"]) ?? "free"),
    consentSaveProfile: row.consentSaveProfile,
    consentEmailFollowup: row.consentEmailFollowup,
    consentRecordedAt: row.consentRecordedAt,
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
    input.consentSaveProfile === true || input.consentEmailFollowup === true;
  const now = new Date();

  // Ensure a contact row exists for this email — FK target for rider_profiles.contact_id.
  const [contact] = await db
    .insert(contacts)
    .values({ email: input.email, name: input.firstName ?? undefined })
    .onConflictDoUpdate({
      target: contacts.email,
      set: { updatedAt: now },
    })
    .returning();

  // Only patch fields explicitly provided — `undefined` preserves existing values.
  const patch: Record<string, unknown> = { updatedAt: now };
  if (input.firstName !== undefined) patch.firstName = input.firstName;
  if (input.ageRange !== undefined) patch.ageRange = input.ageRange;
  if (input.discipline !== undefined) patch.discipline = input.discipline;
  if (input.weeklyTrainingHours !== undefined) patch.weeklyTrainingHours = input.weeklyTrainingHours;
  if (input.currentFtp !== undefined) patch.currentFtp = input.currentFtp;
  if (input.mainGoal !== undefined) patch.mainGoal = input.mainGoal;
  if (input.biggestLimiter !== undefined) patch.biggestLimiter = input.biggestLimiter;
  if (input.coachingInterest !== undefined) patch.coachingInterest = input.coachingInterest;
  if (input.selfCoachedOrCoached !== undefined) patch.selfCoachedOrCoached = input.selfCoachedOrCoached;
  if (input.consentSaveProfile !== undefined) patch.consentSaveProfile = input.consentSaveProfile;
  if (input.consentEmailFollowup !== undefined) patch.consentEmailFollowup = input.consentEmailFollowup;
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
      mainGoal: input.mainGoal ?? null,
      biggestLimiter: input.biggestLimiter ?? null,
      coachingInterest: input.coachingInterest ?? null,
      selfCoachedOrCoached: input.selfCoachedOrCoached ?? null,
      consentSaveProfile: input.consentSaveProfile ?? false,
      consentEmailFollowup: input.consentEmailFollowup ?? false,
      consentRecordedAt: consentBeingSet ? now : null,
    })
    .onConflictDoUpdate({
      target: riderProfiles.email,
      set: patch,
    })
    .returning();

  return toDomain(row);
}
