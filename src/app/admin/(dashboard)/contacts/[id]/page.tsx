import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/admin/auth";
import { getContactById, getTimeline } from "@/lib/crm/contacts";
import { db } from "@/lib/db";
import { tasks as tasksTable } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { listTemplates } from "@/lib/crm/email";
import { listAttachments } from "@/lib/crm/attachments";
import { getPotentialDuplicatesFor } from "@/lib/crm/dedup";
import { listFieldDefs, getContactCustomValues } from "@/lib/crm/custom-fields";
import { ContactDetail } from "../_components/ContactDetail";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const user = await requireAuth();
  const { id: idStr } = await params;
  const sp = await searchParams;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) notFound();

  const contact = await getContactById(id);
  if (!contact) notFound();

  const [activities, taskRows, templateRows, attachmentRows, duplicateCandidates, customFieldDefsList, customValues] =
    await Promise.all([
      getTimeline(id, { limit: 200 }),
      db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.contactId, id))
        .orderBy(desc(tasksTable.createdAt)),
      listTemplates(),
      listAttachments(id),
      getPotentialDuplicatesFor(id).catch(() => []),
      listFieldDefs(),
      getContactCustomValues(id),
    ]);

  return (
    <ContactDetail
      currentUser={{ slug: user.slug, name: user.name, email: user.email, role: user.role }}
      initialEmailTemplateSlug={sp.email ?? null}
      potentialDuplicates={duplicateCandidates}
      customFieldDefs={customFieldDefsList}
      initialCustomValues={customValues}
      initialAttachments={attachmentRows.map((a) => ({
        id: a.id,
        contactId: a.contactId,
        filename: a.filename,
        contentType: a.contentType,
        sizeBytes: a.sizeBytes,
        blobUrl: a.blobUrl,
        blobPathname: a.blobPathname,
        uploadedBySlug: a.uploadedBySlug,
        createdAt: a.createdAt.toISOString(),
      }))}
      templates={templateRows.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        subject: t.subject,
        body: t.body,
      }))}
      contact={{
        ...contact,
        tags: Array.isArray(contact.tags) ? contact.tags : [],
        customFields: (contact.customFields ?? {}) as Record<string, unknown>,
        firstSeenAt: contact.firstSeenAt ? contact.firstSeenAt.toISOString() : null,
        lastActivityAt: contact.lastActivityAt ? contact.lastActivityAt.toISOString() : null,
        createdAt: contact.createdAt.toISOString(),
      }}
      activities={activities.map((a) => ({
        ...a,
        meta: (a.meta ?? null) as Record<string, unknown> | null,
        createdAt: a.createdAt.toISOString(),
      }))}
      tasks={taskRows.map((t) => ({
        ...t,
        dueAt: t.dueAt ? t.dueAt.toISOString() : null,
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
        createdAt: t.createdAt.toISOString(),
      }))}
    />
  );
}
