import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cohortApplications, contacts } from "@/lib/db/schema";
import { and, desc, isNull, eq, inArray, sql, type SQL } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { isApplicationMonth } from "@/lib/crm/application-month";
import {
  APPLICATION_STAGES,
  type ApplicationStage,
  normalizeApplicationStage,
} from "@/lib/crm/pipeline";
import { getOrCreateContactForApplication } from "@/lib/crm/contacts";

type ApplicationRow = typeof cohortApplications.$inferSelect;

function getApplicationFilters(
  cohort: string | null,
  month: string | null,
): SQL[] {
  const filters: SQL[] = [];
  if (cohort && cohort !== "all") {
    filters.push(eq(cohortApplications.cohort, cohort));
  }
  if (isApplicationMonth(month)) {
    filters.push(
      sql`to_char(${cohortApplications.createdAt} AT TIME ZONE 'Europe/Dublin', 'YYYY-MM') = ${month}`,
    );
  }
  return filters;
}

// GET /api/admin/applications — list applications + unread count
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
  const month = searchParams.get("month");
  const filters = getApplicationFilters(cohort, month);

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
    const rows =
      filters.length > 0
        ? await rowsQuery.where(and(...filters))
        : await rowsQuery;

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
      contacted_once: [],
      contacted_twice: [],
      final_outreach: [],
      signed_up: [],
      rejected: [],
    };
    for (const r of rows) {
      const stage: ApplicationStage = normalizeApplicationStage(r.status);
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

  const applicationsQuery = db
    .select()
    .from(cohortApplications)
    .orderBy(desc(cohortApplications.createdAt));
  const applications =
    filters.length > 0
      ? await applicationsQuery.where(and(...filters))
      : await applicationsQuery;

  return NextResponse.json({ applications });
}

// PATCH /api/admin/applications — mark as read and/or update status
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
    // Accept stale clients, but only persist the current workflow values.
    const legacyStatuses = [
      "contacted",
      "responded",
      "offered",
      "follow_up",
      "accepted",
    ];
    const validStatuses = new Set<string>([...legacyStatuses, ...APPLICATION_STAGES]);
    if (!validStatuses.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = normalizeApplicationStage(status);
  }

  // Always mark as read when patching
  updates.readAt = new Date();

  await db
    .update(cohortApplications)
    .set(updates)
    .where(eq(cohortApplications.id, id));

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/applications — permanently remove an application row.
// Does NOT touch the linked contact, deals, timeline, or notes — deleting the
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
