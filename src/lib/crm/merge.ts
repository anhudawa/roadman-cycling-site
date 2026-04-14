import { db } from "@/lib/db";
import {
  contacts,
  contactActivities,
  tasks,
  deals,
  attachments,
  emailMessages,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface MergeSummary {
  primaryId: number;
  secondaryId: number;
  secondaryEmail: string;
  moved: {
    activities: number;
    tasks: number;
    deals: number;
    attachments: number;
    emailMessages: number;
  };
  fieldsCopied: string[];
  tagsAdded: string[];
}

export async function mergeContacts(
  primaryId: number,
  secondaryId: number,
  userSlug: string
): Promise<MergeSummary> {
  if (primaryId === secondaryId) {
    throw new Error("Cannot merge a contact into itself");
  }

  return db.transaction(async (tx) => {
    const primaryRows = await tx
      .select()
      .from(contacts)
      .where(eq(contacts.id, primaryId))
      .limit(1);
    const secondaryRows = await tx
      .select()
      .from(contacts)
      .where(eq(contacts.id, secondaryId))
      .limit(1);

    const primary = primaryRows[0];
    const secondary = secondaryRows[0];
    if (!primary) throw new Error(`Primary contact ${primaryId} not found`);
    if (!secondary) throw new Error(`Secondary contact ${secondaryId} not found`);

    // Repoint FKs
    const movedActivities = await tx
      .update(contactActivities)
      .set({ contactId: primaryId })
      .where(eq(contactActivities.contactId, secondaryId))
      .returning({ id: contactActivities.id });

    const movedTasks = await tx
      .update(tasks)
      .set({ contactId: primaryId })
      .where(eq(tasks.contactId, secondaryId))
      .returning({ id: tasks.id });

    const movedDeals = await tx
      .update(deals)
      .set({ contactId: primaryId })
      .where(eq(deals.contactId, secondaryId))
      .returning({ id: deals.id });

    const movedAttachments = await tx
      .update(attachments)
      .set({ contactId: primaryId })
      .where(eq(attachments.contactId, secondaryId))
      .returning({ id: attachments.id });

    const movedEmails = await tx
      .update(emailMessages)
      .set({ contactId: primaryId })
      .where(eq(emailMessages.contactId, secondaryId))
      .returning({ id: emailMessages.id });

    // Merge fields
    const fieldsCopied: string[] = [];
    const updates: Partial<typeof contacts.$inferInsert> = {
      updatedAt: new Date(),
    };

    function isEmpty(v: unknown): boolean {
      return v === null || v === undefined || v === "";
    }

    if (isEmpty(primary.name) && !isEmpty(secondary.name)) {
      updates.name = secondary.name;
      fieldsCopied.push("name");
    }
    if (isEmpty(primary.phone) && !isEmpty(secondary.phone)) {
      updates.phone = secondary.phone;
      fieldsCopied.push("phone");
    }
    if (isEmpty(primary.owner) && !isEmpty(secondary.owner)) {
      updates.owner = secondary.owner;
      fieldsCopied.push("owner");
    }
    if (isEmpty(primary.source) && !isEmpty(secondary.source)) {
      updates.source = secondary.source;
      fieldsCopied.push("source");
    }

    // Merge tags (union)
    const primaryTags = Array.isArray(primary.tags) ? primary.tags : [];
    const secondaryTags = Array.isArray(secondary.tags) ? secondary.tags : [];
    const mergedTagSet = new Set<string>([...primaryTags, ...secondaryTags]);
    const mergedTags = Array.from(mergedTagSet);
    const tagsAdded = secondaryTags.filter((t) => !primaryTags.includes(t));
    if (tagsAdded.length > 0) {
      updates.tags = mergedTags;
    }

    // Merge custom_fields shallow (primary wins conflicts)
    const primaryCF = (primary.customFields ?? {}) as Record<string, unknown>;
    const secondaryCF = (secondary.customFields ?? {}) as Record<string, unknown>;
    const mergedCF: Record<string, unknown> = { ...secondaryCF, ...primaryCF };
    const cfChanged =
      JSON.stringify(mergedCF) !== JSON.stringify(primaryCF);
    if (cfChanged) {
      updates.customFields = mergedCF;
      fieldsCopied.push("customFields");
    }

    // firstSeenAt = earlier of the two
    if (
      secondary.firstSeenAt &&
      (!primary.firstSeenAt || secondary.firstSeenAt < primary.firstSeenAt)
    ) {
      updates.firstSeenAt = secondary.firstSeenAt;
      fieldsCopied.push("firstSeenAt");
    }
    // lastActivityAt = later of the two
    if (
      secondary.lastActivityAt &&
      (!primary.lastActivityAt || secondary.lastActivityAt > primary.lastActivityAt)
    ) {
      updates.lastActivityAt = secondary.lastActivityAt;
    }

    await tx.update(contacts).set(updates).where(eq(contacts.id, primaryId));

    // Delete secondary
    await tx.delete(contacts).where(eq(contacts.id, secondaryId));

    const summary: MergeSummary = {
      primaryId,
      secondaryId,
      secondaryEmail: secondary.email,
      moved: {
        activities: movedActivities.length,
        tasks: movedTasks.length,
        deals: movedDeals.length,
        attachments: movedAttachments.length,
        emailMessages: movedEmails.length,
      },
      fieldsCopied,
      tagsAdded,
    };

    // Log merge activity on primary
    const bodyLines = [
      `Merged ${secondary.email} into this contact.`,
      `Moved: ${summary.moved.activities} activities, ${summary.moved.tasks} tasks, ${summary.moved.deals} deals, ${summary.moved.attachments} attachments, ${summary.moved.emailMessages} emails.`,
    ];
    if (fieldsCopied.length > 0) {
      bodyLines.push(`Fields copied from secondary: ${fieldsCopied.join(", ")}.`);
    }
    if (tagsAdded.length > 0) {
      bodyLines.push(`Tags added: ${tagsAdded.join(", ")}.`);
    }

    await tx.insert(contactActivities).values({
      contactId: primaryId,
      type: "contact_merged",
      title: `Merged with ${secondary.email}`,
      body: bodyLines.join("\n"),
      meta: {
        secondaryId,
        secondaryEmail: secondary.email,
        summary: summary.moved,
        fieldsCopied,
        tagsAdded,
      },
      authorSlug: userSlug,
    });

    return summary;
  });
}
