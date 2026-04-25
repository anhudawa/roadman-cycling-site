import { db } from "@/lib/db";
import { emailTemplates, emailMessages } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { addActivity, getContactById } from "@/lib/crm/contacts";
import type { TeamUser } from "@/lib/admin/auth";

export const TEMPLATE_VARS = ["first_name", "name", "email", "agent_name"] as const;
export type TemplateVar = (typeof TEMPLATE_VARS)[number];

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type EmailMessage = typeof emailMessages.$inferSelect;

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM_DOMAIN = "noreply@roadmancycling.com";

/** Replace {{var}} (whitespace tolerated) in `body` with values from `vars`. */
export function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) return vars[key];
    return match;
  });
}

/** Build the vars dict for a given contact + team user. */
export function buildContactVars(
  contact: { name: string | null; email: string },
  user: Pick<TeamUser, "name">
): Record<string, string> {
  const name = contact.name?.trim() ?? "";
  const firstName = name ? name.split(/\s+/)[0] : "there";
  return {
    first_name: firstName,
    name: name || contact.email,
    email: contact.email,
    agent_name: user.name,
  };
}

function bodyToHtml(body: string): string {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const paragraphs = escaped.split(/\n{2,}/).map((p) => {
    return `<p style="margin: 0 0 16px 0; line-height: 1.6;">${p.replace(/\n/g, "<br/>")}</p>`;
  });
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #222; max-width: 600px;">${paragraphs.join("")}</div>`;
}

interface ResendSuccess {
  id: string;
}

interface ResendError {
  name?: string;
  message?: string;
  statusCode?: number;
}

export interface SendEmailResult {
  messageId: number;
  status: "sent" | "failed";
  errorMessage?: string;
  resendId?: string;
}

export interface SendEmailParams {
  contactId: number;
  user: TeamUser;
  subject: string;
  body: string;
  templateId?: number;
  replyTo?: string;
}

/** Send an email from the CRM. Logs to email_messages and adds a contact activity. */
export async function sendEmailToContact(params: SendEmailParams): Promise<SendEmailResult> {
  const contact = await getContactById(params.contactId);
  if (!contact) throw new Error("Contact not found");
  if (!contact.email) throw new Error("Contact has no email");

  const subject = params.subject.trim();
  const body = params.body;
  if (!subject) throw new Error("Subject required");
  if (!body.trim()) throw new Error("Body required");

  const fromAddress = `${params.user.name} <${DEFAULT_FROM_DOMAIN}>`;
  const replyTo = params.replyTo ?? params.user.email;
  const apiKey = process.env.RESEND_API_KEY;

  let status: "sent" | "failed" = "failed";
  let errorMessage: string | undefined;
  let resendId: string | undefined;
  let sentAt: Date | null = null;

  if (!apiKey) {
    errorMessage = "RESEND_API_KEY not configured";
  } else {
    try {
      const res = await fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [contact.email],
          subject,
          text: body,
          html: bodyToHtml(body),
          reply_to: replyTo,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as ResendSuccess;
        resendId = data.id;
        status = "sent";
        sentAt = new Date();
      } else {
        const text = await res.text();
        let parsed: ResendError | null = null;
        try {
          parsed = JSON.parse(text) as ResendError;
        } catch {
          parsed = null;
        }
        if (res.status === 429) {
          errorMessage = "Rate limited by Resend — try again shortly.";
        } else {
          errorMessage = parsed?.message ?? `Resend error (${res.status}): ${text.slice(0, 200)}`;
        }
      }
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "Unknown send error";
    }
  }

  const inserted = await db
    .insert(emailMessages)
    .values({
      contactId: contact.id,
      templateId: params.templateId ?? null,
      fromUser: params.user.slug,
      fromAddress,
      toAddress: contact.email,
      subject,
      body,
      resendMessageId: resendId ?? null,
      status,
      errorMessage: errorMessage ?? null,
      sentAt,
    })
    .returning();

  const messageRow = inserted[0];

  await addActivity(contact.id, {
    type: "email_sent",
    title: subject,
    body: body.slice(0, 500),
    meta: {
      templateId: params.templateId ?? null,
      messageId: messageRow.id,
      status,
      resendId: resendId ?? null,
      errorMessage: errorMessage ?? null,
    },
    authorName: params.user.name,
    authorSlug: params.user.slug,
  });

  return {
    messageId: messageRow.id,
    status,
    errorMessage,
    resendId,
  };
}

// ── Template CRUD ─────────────────────────────────────────

export async function listTemplates(): Promise<EmailTemplate[]> {
  return db.select().from(emailTemplates).orderBy(desc(emailTemplates.updatedAt));
}

export async function getTemplate(slug: string): Promise<EmailTemplate | null> {
  const rows = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getTemplateById(id: number): Promise<EmailTemplate | null> {
  const rows = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export interface CreateTemplateParams {
  name: string;
  slug: string;
  subject: string;
  body: string;
  createdBy?: string | null;
}

export async function createTemplate(params: CreateTemplateParams): Promise<EmailTemplate> {
  const inserted = await db
    .insert(emailTemplates)
    .values({
      name: params.name,
      slug: params.slug,
      subject: params.subject,
      body: params.body,
      createdBy: params.createdBy ?? null,
    })
    .returning();
  return inserted[0];
}

export interface UpdateTemplateParams {
  name?: string;
  slug?: string;
  subject?: string;
  body?: string;
}

export async function updateTemplate(
  id: number,
  params: UpdateTemplateParams
): Promise<EmailTemplate | null> {
  const updates: Partial<typeof emailTemplates.$inferInsert> = { updatedAt: new Date() };
  if (params.name !== undefined) updates.name = params.name;
  if (params.slug !== undefined) updates.slug = params.slug;
  if (params.subject !== undefined) updates.subject = params.subject;
  if (params.body !== undefined) updates.body = params.body;

  const updated = await db
    .update(emailTemplates)
    .set(updates)
    .where(eq(emailTemplates.id, id))
    .returning();
  return updated[0] ?? null;
}

/** Recent email_messages for a contact, newest first. */
export async function listEmailsForContact(
  contactId: number,
  limit = 20
): Promise<EmailMessage[]> {
  return db
    .select()
    .from(emailMessages)
    .where(eq(emailMessages.contactId, contactId))
    .orderBy(desc(emailMessages.createdAt))
    .limit(limit);
}

export async function deleteTemplate(id: number): Promise<boolean> {
  const deleted = await db
    .delete(emailTemplates)
    .where(eq(emailTemplates.id, id))
    .returning();
  return deleted.length > 0;
}
