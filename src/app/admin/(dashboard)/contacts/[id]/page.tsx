import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/admin/auth";
import { getContactById, getTimeline } from "@/lib/crm/contacts";
import { db } from "@/lib/db";
import { tasks as tasksTable } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { ContactDetail } from "../_components/ContactDetail";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) notFound();

  const contact = await getContactById(id);
  if (!contact) notFound();

  const [activities, taskRows] = await Promise.all([
    getTimeline(id, { limit: 200 }),
    db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.contactId, id))
      .orderBy(desc(tasksTable.createdAt)),
  ]);

  return (
    <ContactDetail
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
