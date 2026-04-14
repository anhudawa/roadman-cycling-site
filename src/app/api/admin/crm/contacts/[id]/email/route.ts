import { NextResponse } from "next/server";
import { requireAuth, type TeamUser } from "@/lib/admin/auth";
import { getContactById } from "@/lib/crm/contacts";
import {
  buildContactVars,
  getTemplateById,
  renderTemplate,
  sendEmailToContact,
} from "@/lib/crm/email";

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

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const contact = await getContactById(id);
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const body = raw as {
    subject?: unknown;
    body?: unknown;
    templateId?: unknown;
    replyTo?: unknown;
  };

  let subject = typeof body.subject === "string" ? body.subject : "";
  let renderedBody = typeof body.body === "string" ? body.body : "";
  const templateId =
    typeof body.templateId === "number" ? body.templateId : undefined;
  const replyTo = typeof body.replyTo === "string" ? body.replyTo : undefined;

  const vars = buildContactVars(contact, user);

  if (templateId) {
    const tpl = await getTemplateById(templateId);
    if (!tpl) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    if (!subject.trim()) subject = renderTemplate(tpl.subject, vars);
    if (!renderedBody.trim()) renderedBody = renderTemplate(tpl.body, vars);
  } else {
    // Still render placeholders in an explicitly provided body.
    subject = renderTemplate(subject, vars);
    renderedBody = renderTemplate(renderedBody, vars);
  }

  if (!subject.trim() || !renderedBody.trim()) {
    return NextResponse.json({ error: "Subject and body required" }, { status: 400 });
  }

  try {
    const result = await sendEmailToContact({
      contactId: id,
      user,
      subject,
      body: renderedBody,
      templateId,
      replyTo,
    });
    if (result.status === "failed") {
      return NextResponse.json(
        {
          error: result.errorMessage ?? "Send failed",
          messageId: result.messageId,
          status: result.status,
        },
        { status: 502 }
      );
    }
    return NextResponse.json({
      messageId: result.messageId,
      status: result.status,
      resendId: result.resendId ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Send failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
