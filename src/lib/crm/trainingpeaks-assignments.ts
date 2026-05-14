import { db } from "@/lib/db";
import { trainingPeaksAssignments } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { PLAN_BY_CODE } from "@/lib/method/onboarding/plan-matrix";
import { addActivity } from "./contacts";

export type TrainingPeaksAssignment = typeof trainingPeaksAssignments.$inferSelect;

export type TrainingPeaksAssignmentStatus =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

export const TRAININGPEAKS_ASSIGNMENT_STATUSES: TrainingPeaksAssignmentStatus[] = [
  "pending",
  "active",
  "completed",
  "cancelled",
];

export interface TrainingPeaksAssignmentRow {
  id: number;
  contactId: number;
  planCode: string;
  planName: string;
  planStartDate: string | null;
  status: TrainingPeaksAssignmentStatus;
  tpAthleteId: string | null;
  tpPlanId: string | null;
  notes: string | null;
  assignedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapRow(r: TrainingPeaksAssignment): TrainingPeaksAssignmentRow {
  return {
    id: r.id,
    contactId: r.contactId,
    planCode: r.planCode,
    planName: r.planName,
    planStartDate: r.planStartDate ?? null,
    status: r.status as TrainingPeaksAssignmentStatus,
    tpAthleteId: r.tpAthleteId,
    tpPlanId: r.tpPlanId,
    notes: r.notes,
    assignedBy: r.assignedBy,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function listAssignmentsForContact(
  contactId: number
): Promise<TrainingPeaksAssignmentRow[]> {
  const rows = await db
    .select()
    .from(trainingPeaksAssignments)
    .where(eq(trainingPeaksAssignments.contactId, contactId))
    .orderBy(desc(trainingPeaksAssignments.createdAt));
  return rows.map(mapRow);
}

export async function getAssignmentById(
  id: number
): Promise<TrainingPeaksAssignmentRow | null> {
  const rows = await db
    .select()
    .from(trainingPeaksAssignments)
    .where(eq(trainingPeaksAssignments.id, id))
    .limit(1);
  return rows[0] ? mapRow(rows[0]) : null;
}

export interface RecordAssignmentParams {
  contactId: number;
  planCode: string;
  planName?: string;
  planStartDate?: string | null;
  assignedBy: string;
  authorName?: string | null;
  /** When true, do nothing if a pending row for the same plan already exists. */
  skipIfPendingDuplicate?: boolean;
}

/**
 * Record a new plan assignment for a contact and drop an activity onto
 * their timeline. Idempotent on the "same pending plan" case so that
 * re-submitting the onboarding quiz doesn't create duplicate rows.
 *
 * Does NOT call the TrainingPeaks API — the stub client throws today.
 * Once partner credentials land, swap the manual ops flow here for a
 * real `assignPlan()` call inside `src/lib/integrations/trainingpeaks.ts`.
 */
export async function recordAssignment(
  params: RecordAssignmentParams
): Promise<TrainingPeaksAssignmentRow> {
  const planEntry = PLAN_BY_CODE.get(params.planCode);
  const planName = params.planName ?? planEntry?.name ?? params.planCode;

  if (params.skipIfPendingDuplicate) {
    const existing = await db
      .select()
      .from(trainingPeaksAssignments)
      .where(
        and(
          eq(trainingPeaksAssignments.contactId, params.contactId),
          eq(trainingPeaksAssignments.planCode, params.planCode),
          eq(trainingPeaksAssignments.status, "pending")
        )
      )
      .limit(1);
    if (existing[0]) return mapRow(existing[0]);
  }

  const inserted = await db
    .insert(trainingPeaksAssignments)
    .values({
      contactId: params.contactId,
      planCode: params.planCode,
      planName,
      planStartDate: params.planStartDate ?? null,
      status: "pending",
      assignedBy: params.assignedBy,
    })
    .returning();

  const row = inserted[0];

  await addActivity(params.contactId, {
    type: "trainingpeaks_plan_assigned",
    title: `TrainingPeaks plan assigned: ${planName}`,
    body: params.planStartDate ? `Start date: ${params.planStartDate}.` : null,
    meta: {
      assignmentId: row.id,
      planCode: params.planCode,
      planName,
      planStartDate: params.planStartDate ?? null,
      status: "pending",
    },
    authorName: params.authorName ?? null,
    authorSlug: params.assignedBy,
  });

  return mapRow(row);
}

export interface UpdateAssignmentParams {
  status?: TrainingPeaksAssignmentStatus;
  tpAthleteId?: string | null;
  tpPlanId?: string | null;
  planStartDate?: string | null;
  notes?: string | null;
}

export async function updateAssignment(
  id: number,
  patch: UpdateAssignmentParams
): Promise<TrainingPeaksAssignmentRow | null> {
  const updates: Partial<typeof trainingPeaksAssignments.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.tpAthleteId !== undefined) updates.tpAthleteId = patch.tpAthleteId;
  if (patch.tpPlanId !== undefined) updates.tpPlanId = patch.tpPlanId;
  if (patch.planStartDate !== undefined) updates.planStartDate = patch.planStartDate;
  if (patch.notes !== undefined) updates.notes = patch.notes;

  const updated = await db
    .update(trainingPeaksAssignments)
    .set(updates)
    .where(eq(trainingPeaksAssignments.id, id))
    .returning();

  return updated[0] ? mapRow(updated[0]) : null;
}
