/**
 * Persistence for the Method onboarding recommendation.
 *
 * One row per enrollment (unique enrollmentId, upserted on retake). The
 * onboarding API writes here so the rider's saved plan survives a refresh
 * and the dashboard/account can surface it; the CRM/TrainingPeaks-assignment
 * write remains separate (that's the ops fulfilment side).
 */

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { methodOnboarding, type MethodOnboardingRow } from "../schema";

export interface SaveOnboardingInput {
  enrollmentId: number;
  planCode: string;
  planName: string;
  goal: string;
  hours: number;
  level: string;
  ftp: number | null;
  eventDate: string | null;
  weeksToEvent: number | null;
}

export async function saveOnboarding(
  input: SaveOnboardingInput,
): Promise<MethodOnboardingRow> {
  const now = new Date();
  const rows = await db
    .insert(methodOnboarding)
    .values({
      enrollmentId: input.enrollmentId,
      planCode: input.planCode,
      planName: input.planName,
      goal: input.goal,
      hours: input.hours,
      level: input.level,
      ftp: input.ftp,
      eventDate: input.eventDate,
      weeksToEvent: input.weeksToEvent,
    })
    .onConflictDoUpdate({
      target: methodOnboarding.enrollmentId,
      set: {
        planCode: input.planCode,
        planName: input.planName,
        goal: input.goal,
        hours: input.hours,
        level: input.level,
        ftp: input.ftp,
        eventDate: input.eventDate,
        weeksToEvent: input.weeksToEvent,
        updatedAt: now,
      },
    })
    .returning();
  return rows[0];
}

export async function getOnboardingByEnrollment(
  enrollmentId: number,
): Promise<MethodOnboardingRow | null> {
  const rows = await db
    .select()
    .from(methodOnboarding)
    .where(eq(methodOnboarding.enrollmentId, enrollmentId))
    .limit(1);
  return rows[0] ?? null;
}
