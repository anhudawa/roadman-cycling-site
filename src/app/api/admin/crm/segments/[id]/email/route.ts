import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { countSegmentMembers, getSegment, listSegmentMembers } from "@/lib/crm/segments";
import { buildContactVars, getTemplate, renderTemplate, sendEmailToContact } from "@/lib/crm/email";

const HARD_CAP = 500;
const BATCH_SIZE = 25;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const templateSlug = typeof body.templateSlug === "string" ? body.templateSlug.trim() : "";
  if (!templateSlug) return NextResponse.json({ error: "templateSlug required" }, { status: 400 });

  const segment = await getSegment(id);
  if (!segment) return NextResponse.json({ error: "Segment not found" }, { status: 404 });

  const template = await getTemplate(templateSlug);
  if (!template) return NextResponse.json({ error: `Template not found: ${templateSlug}` }, { status: 404 });

  const count = await countSegmentMembers(id);
  if (count > HARD_CAP) {
    return NextResponse.json(
      { error: `Segment has ${count} members, exceeds hard cap of ${HARD_CAP}` },
      { status: 400 }
    );
  }

  const members = await listSegmentMembers(id, { limit: HARD_CAP, offset: 0 });

  let sent = 0;
  let failed = 0;
  const errors: Array<{ contactId: number; email: string; error: string }> = [];

  for (let i = 0; i < members.length; i += BATCH_SIZE) {
    const batch = members.slice(i, i + BATCH_SIZE);
    for (const contact of batch) {
      try {
        const vars = buildContactVars(contact, user);
        const subject = renderTemplate(template.subject, vars);
        const rendered = renderTemplate(template.body, vars);
        const res = await sendEmailToContact({
          contactId: contact.id,
          user,
          subject,
          body: rendered,
          templateId: template.id,
        });
        if (res.status === "sent") {
          sent += 1;
        } else {
          failed += 1;
          errors.push({
            contactId: contact.id,
            email: contact.email,
            error: res.errorMessage ?? "unknown send error",
          });
        }
      } catch (err) {
        failed += 1;
        errors.push({
          contactId: contact.id,
          email: contact.email,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    if (i + BATCH_SIZE < members.length) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  return NextResponse.json({
    sent,
    failed,
    total: members.length,
    segmentId: id,
    templateSlug,
    errors: errors.slice(0, 50),
  });
}
