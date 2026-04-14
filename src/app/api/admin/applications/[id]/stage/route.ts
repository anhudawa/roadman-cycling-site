import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cohortApplications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import type { TeamUser } from "@/lib/admin/auth";
import {
  APPLICATION_STAGES,
  STAGE_LABELS,
  isApplicationStage,
} from "@/lib/crm/pipeline";
import { addActivity, getOrCreateContactForApplication, getContactById } from "@/lib/crm/contacts";
import { createNotification } from "@/lib/crm/notifications";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user: TeamUser;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = body as { stage?: unknown; reason?: unknown };
  if (!isApplicationStage(parsed.stage)) {
    return NextResponse.json(
      {
        error: "Invalid stage",
        allowed: APPLICATION_STAGES,
      },
      { status: 400 }
    );
  }
  const nextStage = parsed.stage;
  const reason =
    typeof parsed.reason === "string" && parsed.reason.trim()
      ? parsed.reason.trim()
      : null;

  const existingRows = await db
    .select()
    .from(cohortApplications)
    .where(eq(cohortApplications.id, id))
    .limit(1);
  const existing = existingRows[0];
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fromStage = existing.status;
  const updated = await db
    .update(cohortApplications)
    .set({ status: nextStage, readAt: existing.readAt ?? new Date() })
    .where(eq(cohortApplications.id, id))
    .returning();

  // Mirror pipeline move onto the corresponding contact timeline.
  try {
    const contactId = await getOrCreateContactForApplication({
      email: existing.email,
      name: existing.name,
      goal: existing.goal,
      hours: existing.hours,
      ftp: existing.ftp,
      cohort: existing.cohort,
      persona: existing.persona,
      createdAt: existing.createdAt,
    });
    // Notify the contact's owner if someone else moved the stage
    try {
      const contact = await getContactById(contactId);
      if (contact?.owner && contact.owner !== user.slug) {
        await createNotification({
          recipientSlug: contact.owner,
          type: "stage_change",
          title: `${user.name} moved ${contact.name ?? contact.email} to ${STAGE_LABELS[nextStage]}`,
          body: reason,
          link: `/admin/contacts/${contactId}`,
        });
      }
    } catch (err) {
      console.error("[applications/stage] notification failed", err);
    }
    await addActivity(contactId, {
      type: "stage_change",
      title: `Application moved to ${STAGE_LABELS[nextStage]}`,
      body: reason,
      meta: {
        from: fromStage,
        to: nextStage,
        applicationId: id,
      },
      authorName: user.name,
      authorSlug: user.slug,
    });
  } catch (err) {
    console.error("[applications/stage] contact mirror failed", err);
  }

  return NextResponse.json({ application: updated[0] });
}
