import { db } from "@/lib/db";
import {
  contacts,
  cohortApplications,
  deals,
  emailMessages,
  tasks,
} from "@/lib/db/schema";
import { and, gte, isNotNull, sql, desc } from "drizzle-orm";

const BASE_URL = "https://roadmancycling.com";
const ACCENT = "#f5532e";

export interface WeeklyDigestData {
  rangeStart: Date;
  rangeEnd: Date;
  newContacts: { total: number; topSources: Array<{ source: string; count: number }> };
  newApplications: { total: number; byStatus: Array<{ status: string; count: number }> };
  deals: {
    created: number;
    won: number;
    wonValueCents: number;
    lost: number;
  };
  email: { sent: number; opened: number; clicked: number };
  tasksCompleted: number;
  topScored: Array<{ id: number; name: string | null; email: string; score: number }>;
}

function startOfLast7Days(): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7);
  return d;
}

export async function buildWeeklyDigestData(): Promise<WeeklyDigestData> {
  const rangeStart = startOfLast7Days();
  const rangeEnd = new Date();

  // New contacts
  const newContactRows = (await db.execute(sql`
    SELECT COALESCE(source, '_unknown') AS source, COUNT(*)::int AS count
    FROM contacts
    WHERE created_at >= ${rangeStart}
    GROUP BY COALESCE(source, '_unknown')
    ORDER BY COUNT(*) DESC
  `)) as unknown as Array<{ source: string; count: number }>;
  const newContactsTotal = newContactRows.reduce((s, r) => s + Number(r.count), 0);
  const topSources = newContactRows.slice(0, 5).map((r) => ({
    source: r.source,
    count: Number(r.count),
  }));

  // New applications
  const appRows = await db
    .select({
      status: cohortApplications.status,
      count: sql<number>`count(*)::int`,
    })
    .from(cohortApplications)
    .where(gte(cohortApplications.createdAt, rangeStart))
    .groupBy(cohortApplications.status);
  const newAppsTotal = appRows.reduce((s, r) => s + Number(r.count), 0);
  const byStatus = appRows.map((r) => ({
    status: r.status,
    count: Number(r.count),
  }));

  // Deals
  const createdRow = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(deals)
    .where(gte(deals.createdAt, rangeStart));
  const wonRow = await db
    .select({
      count: sql<number>`count(*)::int`,
      total: sql<number>`coalesce(sum(${deals.valueCents}),0)::bigint`,
    })
    .from(deals)
    .where(
      and(
        sql`${deals.stage} = 'won'`,
        isNotNull(deals.closedAt),
        gte(deals.closedAt, rangeStart)
      )
    );
  const lostRow = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(deals)
    .where(
      and(
        sql`${deals.stage} = 'lost'`,
        isNotNull(deals.closedAt),
        gte(deals.closedAt, rangeStart)
      )
    );

  // Email metrics
  const emailRow = await db
    .select({
      sent: sql<number>`count(*) FILTER (WHERE ${emailMessages.sentAt} IS NOT NULL)::int`,
      opened: sql<number>`count(*) FILTER (WHERE ${emailMessages.openedAt} IS NOT NULL)::int`,
      clicked: sql<number>`count(*) FILTER (WHERE ${emailMessages.clickedAt} IS NOT NULL)::int`,
    })
    .from(emailMessages)
    .where(gte(emailMessages.createdAt, rangeStart));

  // Tasks completed
  const tasksRow = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasks)
    .where(and(isNotNull(tasks.completedAt), gte(tasks.completedAt, rangeStart)));

  // Top 5 scored contacts created in last 7d (fallback $€” no score delta tracked)
  const topScoredRows = await db
    .select({
      id: contacts.id,
      name: contacts.name,
      email: contacts.email,
      score: sql<number>`coalesce((${contacts.customFields}->'system'->>'lead_score')::int, 0)`,
    })
    .from(contacts)
    .where(gte(contacts.createdAt, rangeStart))
    .orderBy(
      desc(sql`coalesce((${contacts.customFields}->'system'->>'lead_score')::int, 0)`)
    )
    .limit(5);

  return {
    rangeStart,
    rangeEnd,
    newContacts: { total: newContactsTotal, topSources },
    newApplications: { total: newAppsTotal, byStatus },
    deals: {
      created: Number(createdRow[0]?.count ?? 0),
      won: Number(wonRow[0]?.count ?? 0),
      wonValueCents: Number(wonRow[0]?.total ?? 0),
      lost: Number(lostRow[0]?.count ?? 0),
    },
    email: {
      sent: Number(emailRow[0]?.sent ?? 0),
      opened: Number(emailRow[0]?.opened ?? 0),
      clicked: Number(emailRow[0]?.clicked ?? 0),
    },
    tasksCompleted: Number(tasksRow[0]?.count ?? 0),
    topScored: topScoredRows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      score: Number(r.score ?? 0),
    })),
  };
}

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtShort(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function fmtMoney(cents: number, currency = "EUR"): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(0)}`;
  }
}

export interface RenderedWeekly {
  subject: string;
  html: string;
  text: string;
}

export function renderWeeklyDigest(data: WeeklyDigestData): RenderedWeekly {
  const start = fmtShort(data.rangeStart);
  const end = fmtShort(data.rangeEnd);
  const subject = `Weekly CRM rollup $€” ${start}$€“${end}`;

  const contactsUrl = `${BASE_URL}/admin/contacts`;
  const appsUrl = `${BASE_URL}/admin/applications`;
  const dealsUrl = `${BASE_URL}/admin/deals`;
  const reportsUrl = `${BASE_URL}/admin/reports`;

  const statCell = (label: string, value: string, accent = false) => `
    <td style="padding:12px;background:#fafafa;border:1px solid #eee;border-radius:6px;text-align:center;width:25%;">
      <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#888;">${esc(label)}</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px;color:${accent ? ACCENT : "#222"};">${esc(value)}</div>
    </td>`;

  const sourceRows =
    data.newContacts.topSources
      .map(
        (s) =>
          `<tr><td style="padding:6px 0;font-size:13px;color:#333;">${esc(s.source)}</td><td style="padding:6px 0;text-align:right;font-size:13px;color:#666;">${s.count}</td></tr>`
      )
      .join("") || `<tr><td style="padding:6px 0;color:#888;font-size:13px;">No new contacts this week.</td></tr>`;

  const appStatusRows =
    data.newApplications.byStatus
      .map(
        (s) =>
          `<tr><td style="padding:6px 0;font-size:13px;color:#333;">${esc(s.status.replace(/_/g, " "))}</td><td style="padding:6px 0;text-align:right;font-size:13px;color:#666;">${s.count}</td></tr>`
      )
      .join("") || `<tr><td style="padding:6px 0;color:#888;font-size:13px;">No new applications.</td></tr>`;

  const scoredRows =
    data.topScored
      .map(
        (c) =>
          `<tr><td style="padding:6px 0;font-size:13px;color:#333;">${esc(c.name ?? c.email)}</td><td style="padding:6px 0;text-align:right;font-size:13px;color:${ACCENT};font-weight:600;">${c.score}</td></tr>`
      )
      .join("") || `<tr><td style="padding:6px 0;color:#888;font-size:13px;">No scored contacts.</td></tr>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #eee;border-radius:8px;padding:32px;">
<tr><td>
  <h1 style="margin:0;font-size:22px;color:#222;">Weekly CRM rollup</h1>
  <p style="margin:4px 0 0 0;color:#888;font-size:13px;">${esc(start)} $€“ ${esc(end)}</p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="4" style="margin-top:24px;border-collapse:separate;">
    <tr>
      ${statCell("New contacts", String(data.newContacts.total))}
      ${statCell("Apps", String(data.newApplications.total))}
      ${statCell("Deals won", String(data.deals.won), data.deals.won > 0)}
      ${statCell("Won value", fmtMoney(data.deals.wonValueCents), data.deals.wonValueCents > 0)}
    </tr>
    <tr>
      ${statCell("Deals created", String(data.deals.created))}
      ${statCell("Deals lost", String(data.deals.lost))}
      ${statCell("Tasks done", String(data.tasksCompleted))}
      ${statCell("Emails sent", String(data.email.sent))}
    </tr>
  </table>

  <div style="margin-top:28px;">
    <div style="display:flex;justify-content:space-between;align-items:baseline;">
      <h2 style="margin:0;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#222;">Top contact sources</h2>
      <a href="${contactsUrl}" style="font-size:12px;color:${ACCENT};text-decoration:none;">View $†’</a>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;border-collapse:collapse;">
      ${sourceRows}
    </table>
  </div>

  <div style="margin-top:24px;">
    <div style="display:flex;justify-content:space-between;align-items:baseline;">
      <h2 style="margin:0;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#222;">New applications by status</h2>
      <a href="${appsUrl}" style="font-size:12px;color:${ACCENT};text-decoration:none;">View $†’</a>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;border-collapse:collapse;">
      ${appStatusRows}
    </table>
  </div>

  <div style="margin-top:24px;">
    <div style="display:flex;justify-content:space-between;align-items:baseline;">
      <h2 style="margin:0;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#222;">Email engagement</h2>
      <a href="${reportsUrl}" style="font-size:12px;color:${ACCENT};text-decoration:none;">View $†’</a>
    </div>
    <p style="margin:8px 0 0 0;color:#333;font-size:13px;">
      ${data.email.sent} sent $· ${data.email.opened} opened $· ${data.email.clicked} clicked
    </p>
  </div>

  <div style="margin-top:24px;">
    <div style="display:flex;justify-content:space-between;align-items:baseline;">
      <h2 style="margin:0;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#222;">Top 5 new scored contacts</h2>
      <a href="${contactsUrl}" style="font-size:12px;color:${ACCENT};text-decoration:none;">View $†’</a>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;border-collapse:collapse;">
      ${scoredRows}
    </table>
  </div>

  <div style="margin-top:36px;padding-top:20px;border-top:1px solid #eee;text-align:center;">
    <a href="${reportsUrl}" style="color:${ACCENT};text-decoration:none;font-size:14px;font-weight:600;">Open reports $†’</a>
    <span style="color:#ccc;"> $· </span>
    <a href="${dealsUrl}" style="color:${ACCENT};text-decoration:none;font-size:14px;font-weight:600;">Deals board $†’</a>
  </div>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  const lines: string[] = [];
  lines.push(`Weekly CRM rollup $€” ${start}$€“${end}`);
  lines.push("");
  lines.push(`New contacts: ${data.newContacts.total}`);
  for (const s of data.newContacts.topSources) lines.push(`  - ${s.source}: ${s.count}`);
  lines.push("");
  lines.push(`New applications: ${data.newApplications.total}`);
  for (const s of data.newApplications.byStatus) lines.push(`  - ${s.status}: ${s.count}`);
  lines.push("");
  lines.push(
    `Deals: created ${data.deals.created} $· won ${data.deals.won} (${fmtMoney(data.deals.wonValueCents)}) $· lost ${data.deals.lost}`
  );
  lines.push(
    `Email: ${data.email.sent} sent $· ${data.email.opened} opened $· ${data.email.clicked} clicked`
  );
  lines.push(`Tasks completed: ${data.tasksCompleted}`);
  lines.push("");
  lines.push("Top 5 new scored contacts:");
  for (const c of data.topScored) lines.push(`  - ${c.name ?? c.email} (${c.score})`);
  lines.push("");
  lines.push(`Reports: ${reportsUrl}`);

  return { subject, html, text: lines.join("\n") };
}

export interface SendWeeklyResult {
  status: "sent" | "failed";
  resendId?: string;
  errorMessage?: string;
}

/** Send rendered weekly digest to a specific email via Resend. */
export async function sendWeeklyDigestEmail(
  to: string,
  rendered: RenderedWeekly
): Promise<SendWeeklyResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { status: "failed", errorMessage: "RESEND_API_KEY not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Roadman Ops <noreply@roadmancycling.com>",
        to: [to],
        reply_to: to,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        status: "failed",
        errorMessage: `Resend error (${res.status}): ${body.slice(0, 200)}`,
      };
    }

    const data = (await res.json()) as { id?: string };
    return { status: "sent", resendId: data.id };
  } catch (err) {
    return {
      status: "failed",
      errorMessage: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
