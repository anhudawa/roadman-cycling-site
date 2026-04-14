import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import {
  contacts,
  tasks,
  emailTemplates,
  emailMessages,
  contactActivities,
  cohortApplications,
} from "@/lib/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

export interface SearchContactResult {
  id: number;
  name: string | null;
  email: string;
  owner: string | null;
}
export interface SearchTaskResult {
  id: number;
  title: string;
  contactName: string | null;
  contactId: number | null;
  dueAt: string | null;
  completedAt: string | null;
}
export interface SearchTemplateResult {
  id: number;
  slug: string;
  name: string;
  subject: string;
}
export interface SearchEmailResult {
  id: number;
  subject: string;
  contactName: string | null;
  contactId: number;
  sentAt: string | null;
}
export interface SearchActivityResult {
  id: number;
  title: string;
  contactName: string | null;
  contactId: number;
  createdAt: string;
  type: string;
}
export interface SearchApplicationResult {
  id: number;
  name: string;
  email: string;
  status: string;
  contactId: number | null;
}

export interface SearchResponse {
  contacts: SearchContactResult[];
  tasks: SearchTaskResult[];
  templates: SearchTemplateResult[];
  emails: SearchEmailResult[];
  activities: SearchActivityResult[];
  applications: SearchApplicationResult[];
}

function empty(): SearchResponse {
  return {
    contacts: [],
    tasks: [],
    templates: [],
    emails: [],
    activities: [],
    applications: [],
  };
}

export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "10", 10) || 10, 1),
    20
  );

  if (q.length < 2) return NextResponse.json(empty());

  const pattern = `%${q}%`;

  try {
    const [contactRows, taskRows, templateRows, emailRows, activityRows, applicationRows] =
      await Promise.all([
        db
          .select({
            id: contacts.id,
            name: contacts.name,
            email: contacts.email,
            owner: contacts.owner,
          })
          .from(contacts)
          .where(or(ilike(contacts.email, pattern), ilike(contacts.name, pattern)))
          .orderBy(desc(contacts.lastActivityAt))
          .limit(limit),

        db
          .select({
            id: tasks.id,
            title: tasks.title,
            dueAt: tasks.dueAt,
            completedAt: tasks.completedAt,
            contactId: tasks.contactId,
            contactName: contacts.name,
          })
          .from(tasks)
          .leftJoin(contacts, eq(tasks.contactId, contacts.id))
          .where(ilike(tasks.title, pattern))
          .orderBy(desc(tasks.createdAt))
          .limit(limit),

        db
          .select({
            id: emailTemplates.id,
            slug: emailTemplates.slug,
            name: emailTemplates.name,
            subject: emailTemplates.subject,
          })
          .from(emailTemplates)
          .where(
            or(ilike(emailTemplates.name, pattern), ilike(emailTemplates.subject, pattern))
          )
          .orderBy(desc(emailTemplates.updatedAt))
          .limit(limit),

        db
          .select({
            id: emailMessages.id,
            subject: emailMessages.subject,
            contactId: emailMessages.contactId,
            sentAt: emailMessages.sentAt,
            contactName: contacts.name,
          })
          .from(emailMessages)
          .leftJoin(contacts, eq(emailMessages.contactId, contacts.id))
          .where(ilike(emailMessages.subject, pattern))
          .orderBy(sql`${emailMessages.sentAt} DESC NULLS LAST`)
          .limit(limit),

        db
          .select({
            id: contactActivities.id,
            title: contactActivities.title,
            contactId: contactActivities.contactId,
            createdAt: contactActivities.createdAt,
            type: contactActivities.type,
            contactName: contacts.name,
          })
          .from(contactActivities)
          .leftJoin(contacts, eq(contactActivities.contactId, contacts.id))
          .where(
            and(
              or(
                ilike(contactActivities.title, pattern),
                ilike(contactActivities.body, pattern)
              )!
            )
          )
          .orderBy(desc(contactActivities.createdAt))
          .limit(limit),

        db
          .select({
            id: cohortApplications.id,
            name: cohortApplications.name,
            email: cohortApplications.email,
            status: cohortApplications.status,
            contactId: contacts.id,
          })
          .from(cohortApplications)
          .leftJoin(
            contacts,
            eq(sql`lower(${cohortApplications.email})`, contacts.email)
          )
          .where(
            or(
              ilike(cohortApplications.name, pattern),
              ilike(cohortApplications.email, pattern),
              ilike(cohortApplications.goal, pattern)
            )
          )
          .orderBy(desc(cohortApplications.createdAt))
          .limit(limit),
      ]);

    const response: SearchResponse = {
      contacts: contactRows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        owner: r.owner,
      })),
      tasks: taskRows.map((r) => ({
        id: r.id,
        title: r.title,
        contactId: r.contactId,
        contactName: r.contactName,
        dueAt: r.dueAt ? r.dueAt.toISOString() : null,
        completedAt: r.completedAt ? r.completedAt.toISOString() : null,
      })),
      templates: templateRows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        subject: r.subject,
      })),
      emails: emailRows.map((r) => ({
        id: r.id,
        subject: r.subject,
        contactId: r.contactId,
        contactName: r.contactName,
        sentAt: r.sentAt ? r.sentAt.toISOString() : null,
      })),
      activities: activityRows.map((r) => ({
        id: r.id,
        title: r.title,
        contactId: r.contactId,
        contactName: r.contactName,
        createdAt: r.createdAt.toISOString(),
        type: r.type,
      })),
      applications: applicationRows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        status: r.status,
        contactId: r.contactId,
      })),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[crm search] failed", err);
    return NextResponse.json(empty());
  }
}
