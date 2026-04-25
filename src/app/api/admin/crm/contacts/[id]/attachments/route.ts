import { NextResponse } from "next/server";
import { requireAuth, type TeamUser } from "@/lib/admin/auth";
import { getContactById } from "@/lib/crm/contacts";
import {
  createAttachment,
  listAttachments,
  type Attachment,
} from "@/lib/crm/attachments";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const BLOCKED_EXTS = new Set(["exe", "bat", "sh", "cmd", "com", "msi", "scr", "ps1"]);

function slugifyName(name: string): string {
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
  const safeStem = stem
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "file";
  return ext ? `${safeStem}.${ext.replace(/[^a-z0-9]+/g, "")}` : safeStem;
}

function serialize(a: Attachment) {
  return {
    id: a.id,
    contactId: a.contactId,
    filename: a.filename,
    contentType: a.contentType,
    sizeBytes: a.sizeBytes,
    blobUrl: a.blobUrl,
    blobPathname: a.blobPathname,
    uploadedBySlug: a.uploadedBySlug,
    createdAt: a.createdAt.toISOString(),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const contactId = parseInt(idStr, 10);
  if (Number.isNaN(contactId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const rows = await listAttachments(contactId);
  return NextResponse.json({ attachments: rows.map(serialize) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user: TeamUser;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN not configured $— run `vercel blob` to provision Blob storage",
      },
      { status: 503 }
    );
  }

  const { id: idStr } = await params;
  const contactId = parseInt(idStr, 10);
  if (Number.isNaN(contactId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const contact = await getContactById(contactId);
  if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'file' field" }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Max ${MAX_BYTES / (1024 * 1024)}MB.` },
      { status: 413 }
    );
  }

  const originalName = file.name || "upload";
  const lastDot = originalName.lastIndexOf(".");
  const ext = lastDot >= 0 ? originalName.slice(lastDot + 1).toLowerCase() : "";
  if (ext && BLOCKED_EXTS.has(ext)) {
    return NextResponse.json(
      { error: `File type .${ext} is not allowed` },
      { status: 415 }
    );
  }

  const safeName = slugifyName(originalName);
  const pathname = `contacts/${contactId}/${Date.now()}-${safeName}`;

  let blobUrl: string;
  try {
    const { put } = await import("@vercel/blob");
    const result = await put(pathname, file, {
      access: "public",
      token,
      contentType: file.type || undefined,
    });
    blobUrl = result.url;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[attachments POST] blob put failed", err);
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 502 });
  }

  const row = await createAttachment({
    contactId,
    filename: originalName,
    contentType: file.type || null,
    sizeBytes: file.size,
    blobUrl,
    blobPathname: pathname,
    uploadedBySlug: user.slug,
    uploadedByName: user.name,
  });

  return NextResponse.json({ attachment: serialize(row) }, { status: 201 });
}
