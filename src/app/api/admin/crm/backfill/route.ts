import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  contactSubmissions,
  cohortApplications,
  subscribers,
  contactActivities,
} from "@/lib/db/schema";
import { requireAuth } from "@/lib/admin/auth";
import { upsertContact, addActivity } from "@/lib/crm/contacts";
import { and, eq, sql } from "drizzle-orm";

async function hasActivity(contactId: number, type: string, sourceId: number): Promise<boolean> {
  const rows = await db
    .select({ id: contactActivities.id })
    .from(contactActivities)
    .where(
      and(
        eq(contactActivities.contactId, contactId),
        eq(contactActivities.type, type),
        sql`(${contactActivities.meta}->>'sourceId')::int = ${sourceId}`
      )
    )
    .limit(1);
  return rows.length > 0;
}

export async function POST() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Backfill activities are always authored as "system" regardless of user.

  let contactsProcessed = 0;
  let activitiesAdded = 0;

  // contactSubmissions
  const submissions = await db.select().from(contactSubmissions);
  for (const s of submissions) {
    if (!s.email) continue;
    try {
      const contact = await upsertContact({
        email: s.email,
        name: s.name,
        source: "contact_form",
        ownerHint: s.assignedTo ?? null,
        firstSeenAt: s.createdAt,
      });
      contactsProcessed++;
      const already = await hasActivity(contact.id, "contact_submission", s.id);
      if (!already) {
        await addActivity(contact.id, {
          type: "contact_submission",
          title: s.subject,
          body: s.message,
          meta: { sourceId: s.id, source: "contact_submissions" },
          authorName: "system",
        });
        activitiesAdded++;
      }
    } catch (err) {
      console.error("[CRM Backfill] contactSubmissions row failed", s.id, err);
    }
  }

  // cohortApplications
  const apps = await db.select().from(cohortApplications);
  for (const a of apps) {
    if (!a.email) continue;
    try {
      const contact = await upsertContact({
        email: a.email,
        name: a.name,
        source: "cohort_application",
        firstSeenAt: a.createdAt,
        customFields: {
          goal: a.goal,
          hours: a.hours,
          ftp: a.ftp,
          frustration: a.frustration,
          cohort: a.cohort,
          persona: a.persona,
        },
      });
      contactsProcessed++;
      const already = await hasActivity(contact.id, "cohort_application", a.id);
      if (!already) {
        await addActivity(contact.id, {
          type: "cohort_application",
          title: `Applied to ${a.persona ?? "cohort"} (${a.cohort})`,
          body: `Goal: ${a.goal}\n\nHours/week: ${a.hours}\n\nFTP: ${a.ftp ?? "n/a"}\n\nFrustration: ${a.frustration}`,
          meta: {
            sourceId: a.id,
            source: "cohort_applications",
            goal: a.goal,
            hours: a.hours,
            ftp: a.ftp,
            frustration: a.frustration,
            cohort: a.cohort,
            persona: a.persona,
          },
          authorName: "system",
        });
        activitiesAdded++;
      }
    } catch (err) {
      console.error("[CRM Backfill] cohortApplications row failed", a.id, err);
    }
  }

  // subscribers
  const subs = await db.select().from(subscribers);
  for (const sub of subs) {
    if (!sub.email) continue;
    try {
      await upsertContact({
        email: sub.email,
        source: "subscribers",
        firstSeenAt: sub.signedUpAt ?? undefined,
      });
      contactsProcessed++;
    } catch (err) {
      console.error("[CRM Backfill] subscribers row failed", sub.id, err);
    }
  }

  return NextResponse.json({
    ok: true,
    contactsProcessed,
    activitiesAdded,
    submissions: submissions.length,
    applications: apps.length,
    subscribers: subs.length,
  });
}
