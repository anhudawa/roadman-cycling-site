import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cohortApplications, contacts } from "@/lib/db/schema";
import { desc, isNull, eq, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import {
  APPLICATION_STAGES,
  type ApplicationStage,
  isApplicationStage,
} from "@/lib/crm/pipeline";
import { getOrCreateContactForApplication } from "@/lib/crm/contacts";

type ApplicationRow = typeof cohortApplications.$inferSelect;

// GET /api/admin/applications $— list applications + unread count
export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const countOnly = searchParams.get("count") === "1";
  const view = searchParams.get("view");
  const cohort = searchParams.get("cohort");

  if (countOnly) {
    const [unread, awaiting] = await Promise.all([
      db
        .select({ id: cohortApplications.id })
        .from(cohortApplications)
        .where(isNull(cohortApplications.readAt)),
      db
        .select({ id: cohortApplications.id })
        .from(cohortApplications)
        .where(eq(cohortApplications.status, "awaiting_response")),
    ]);
    return NextResponse.json({
      unread: unread.length,
      awaiting: awaiting.length,
    });
  }

  if (view === "kanban") {
    const rowsQuery = db
      .select()
      .from(cohortApplications)
      .orderBy(desc(cohortApplications.createdAt));
    const rows = await (cohort && cohort !== "all"
      ? rowsQuery.where(eq(cohortApplications.cohort, cohort))
      : rowsQuery);

    // Build contact ids for each email (one upsert per distinct email).
    const emailToContactId = new Map<string, number>();
    for (const r of rows) {
      const key = r.email.toLowerCase();
      if (emailToContactId.has(key)) continue;
      try {
        const cid = await getOrCreateContactForApplication({
          email: r.email,
          name: r.name,
          goal: r.goal,
          hours: r.hours,
          ftp: r.ftp,
          cohort: r.cohort,
          persona: r.persona,
          createdAt: r.createdAt,
        });
        emailToContactId.set(key, cid);
      } catch (err) {
        console.error("[applications/kanban] contact upsert failed", err);
      }
    }

    const contactIds = Array.from(new Set(emailToContactId.values()));
    const ownerById = new Map<number, string | null>();
    if (contactIds.length > 0) {
      const ownerRows = await db
        .select({ id: contacts.id, owner: contacts.owner })
        .from(contacts)
        .where(inArray(contacts.id, contactIds));
      for (const o of ownerRows) ownerById.set(o.id, o.owner);
    }

    const stages: Record<
      ApplicationStage,
      (ApplicationRow & { contactId: number | null; owner: string | null })[]
    > = {
      awaiting_response: [],
      contacted: [],
      offered: [],
      accepted: [],
      rejected: [],
    };
    for (const r of rows) {
      const stage: ApplicationStage = isApplicationStage(r.status)
        ? r.status
        : "awaiting_response";
      const cid = emailToContactId.get(r.email.toLowerCase()) ?? null;
      stages[stage].push({
        ...r,
        contactId: cid,
        owner: cid !== null ? ownerById.get(cid) ?? null : null,
      });
    }

    const cohortsRows = await db
      .selectDistinct({ cohort: cohortApplications.cohort })
      .from(cohortApplications);
    const cohorts = cohortsRows.map((c) => c.cohort).filter(Boolean);

    return NextResponse.json({
      stages,
      stageOrder: APPLICATION_STAGES,
      cohorts,
    });
  }

  const applications = await db
    .select()
    .from(cohortApplications)
    .orderBy(desc(cohortApplications.createdAt))
    .limit(100);

  return NextResponse.json({ applications });
}

// PATCH /api/admin/applications $— mark as read and/or update status
export async function PATCH(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (status) {
    // Accept both legacy statuses and the new pipeline stages.
    const legacyStatuses = ["awaiting_response", "responded", "follow_up", "signed_up"];
    const validStatuses = new Set<string>([...legacyStatuses, ...APPLICATION_STAGES]);
    if (!validStatuses.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = status;
  }

  // Always mark as read when patching
  updates.readAt = new Date();

  await db
    .update(cohortApplications)
    .set(updates)
    .where(eq(cohortApplications.id, id));

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/applications $— permanently remove an application row.
// Does NOT touch the linked contact, deals, timeline, or notes $— deleting the
// application is treated as "we reject this submission" rather than "nuke
// this person from the CRM". Use /admin/contacts if you need to remove the
// human record entirely.
export async function DELETE(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id || typeof id !== "number") {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await db.delete(cohortApplications).where(eq(cohortApplications.id, id));
  return NextResponse.json({ success: true });
}
