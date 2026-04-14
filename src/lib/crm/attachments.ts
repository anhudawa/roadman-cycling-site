import { db } from "@/lib/db";
import { attachments } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { addActivity } from "./contacts";

export type Attachment = typeof attachments.$inferSelect;

export async function listAttachments(contactId: number): Promise<Attachment[]> {
  return db
    .select()
    .from(attachments)
    .where(eq(attachments.contactId, contactId))
    .orderBy(desc(attachments.createdAt));
}

export interface CreateAttachmentParams {
  contactId: number;
  filename: string;
  contentType: string | null;
  sizeBytes: number | null;
  blobUrl: string;
  blobPathname: string;
  uploadedBySlug: string | null;
  uploadedByName?: string | null;
}

export async function createAttachment(
  params: CreateAttachmentParams
): Promise<Attachment> {
  const inserted = await db
    .insert(attachments)
    .values({
      contactId: params.contactId,
      filename: params.filename,
      contentType: params.contentType,
      sizeBytes: params.sizeBytes,
      blobUrl: params.blobUrl,
      blobPathname: params.blobPathname,
      uploadedBySlug: params.uploadedBySlug,
    })
    .returning();

  const row = inserted[0];

  try {
    await addActivity(params.contactId, {
      type: "file_uploaded",
      title: `Uploaded ${params.filename}`,
      meta: {
        attachmentId: row.id,
        filename: params.filename,
        contentType: params.contentType,
        sizeBytes: params.sizeBytes,
        blobUrl: params.blobUrl,
      },
      authorName: params.uploadedByName ?? null,
      authorSlug: params.uploadedBySlug,
    });
  } catch (err) {
    console.error("[attachments] activity log failed", err);
  }

  return row;
}

export interface DeleteAttachmentResult {
  ok: boolean;
  status: number;
  error?: string;
  attachment?: Attachment;
}

export async function deleteAttachment(
  id: number,
  user: { slug: string; name: string; role: "admin" | "member" }
): Promise<DeleteAttachmentResult> {
  const rows = await db.select().from(attachments).where(eq(attachments.id, id)).limit(1);
  const row = rows[0];
  if (!row) return { ok: false, status: 404, error: "Attachment not found" };

  const isOwner = row.uploadedBySlug === user.slug;
  if (!isOwner && user.role !== "admin") {
    return { ok: false, status: 403, error: "Only the uploader or an admin can delete this file" };
  }

  // Try blob deletion. Don't block on token errors — but log.
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { del } = await import("@vercel/blob");
      await del(row.blobPathname, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } else {
      console.warn("[attachments] BLOB_READ_WRITE_TOKEN missing — skipping blob delete");
    }
  } catch (err) {
    console.error("[attachments] blob delete failed", err);
  }

  await db.delete(attachments).where(eq(attachments.id, id));

  if (row.contactId != null) {
    try {
      await addActivity(row.contactId, {
        type: "file_removed",
        title: `Removed ${row.filename}`,
        meta: {
          attachmentId: row.id,
          filename: row.filename,
        },
        authorName: user.name,
        authorSlug: user.slug,
      });
    } catch (err) {
      console.error("[attachments] activity log (remove) failed", err);
    }
  }

  return { ok: true, status: 200, attachment: row };
}

export async function getAttachment(id: number): Promise<Attachment | null> {
  const rows = await db.select().from(attachments).where(eq(attachments.id, id)).limit(1);
  return rows[0] ?? null;
}

// kept for symmetry with other modules
export async function listAttachmentsByOwner(
  contactId: number,
  uploadedBySlug: string
): Promise<Attachment[]> {
  return db
    .select()
    .from(attachments)
    .where(and(eq(attachments.contactId, contactId), eq(attachments.uploadedBySlug, uploadedBySlug)))
    .orderBy(desc(attachments.createdAt));
}
