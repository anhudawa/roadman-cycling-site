import type { TeamUser } from "@/lib/admin/auth";
import type { MyDayData, MyDayTaskRow, MyDayApplicationRow, MyDayStaleContactRow } from "@/lib/crm/dashboard";
import type { BookingRow } from "@/lib/crm/bookings";

const BASE_URL = "https://roadmancycling.com";
const ACCENT = "#f5532e";
const MAX_ROWS = 10;

export interface RenderedDigest {
  subject: string;
  html: string;
  text: string;
}

export interface DigestTotals {
  overdueTasks: number;
  todayTasks: number;
  applicationsWaiting: number;
  staleContacts: number;
}

export function digestTotals(data: MyDayData): DigestTotals {
  return {
    overdueTasks: data.overdueTasks.length,
    todayTasks: data.todaysTasks.length,
    applicationsWaiting: data.applicationsWaiting.length,
    staleContacts: data.staleContacts.length,
  };
}

export function hasActionable(data: MyDayData): boolean {
  const t = digestTotals(data);
  return t.overdueTasks + t.todayTasks + t.applicationsWaiting + t.staleContacts > 0;
}

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatDueDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function daysSince(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function taskRowHtml(t: MyDayTaskRow): string {
  const contactLine = t.contactEmail
    ? `<div style="font-size:12px;color:#666;margin-top:2px;">${esc(t.contactName ?? t.contactEmail)}</div>`
    : "";
  const dueLabel = t.dueAt ? formatDueDate(t.dueAt) : "";
  return `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">
    <div style="font-size:14px;color:#222;"><strong>${esc(t.title)}</strong>${dueLabel ? ` <span style="color:#888;font-weight:normal;">$· ${dueLabel}</span>` : ""}</div>
    ${contactLine}
  </td></tr>`;
}

function appRowHtml(a: MyDayApplicationRow): string {
  return `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">
    <div style="font-size:14px;color:#222;"><strong>${esc(a.name)}</strong> <span style="color:#888;font-weight:normal;">$· ${esc(a.status.replace(/_/g, " "))}</span></div>
    <div style="font-size:12px;color:#666;margin-top:2px;">${esc(a.email)}</div>
  </td></tr>`;
}

function bookingRowHtml(b: BookingRow): string {
  const d = new Date(b.scheduledAt);
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const contactLine = b.contactEmail
    ? `<div style="font-size:12px;color:#666;margin-top:2px;">${esc(b.contactName ?? b.contactEmail)}</div>`
    : "";
  return `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">
    <div style="font-size:14px;color:#222;"><strong>${esc(time)}</strong> <span style="color:#888;font-weight:normal;">$· ${esc(b.title)} $· ${b.durationMinutes}m</span></div>
    ${contactLine}
  </td></tr>`;
}

function staleRowHtml(c: MyDayStaleContactRow): string {
  return `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">
    <div style="font-size:14px;color:#222;">${esc(c.name ?? c.email)}</div>
    <div style="font-size:12px;color:#666;margin-top:2px;">Last activity ${daysSince(c.lastActivityAt)}</div>
  </td></tr>`;
}

function sectionHtml(title: string, href: string, rowsHtml: string, empty: string): string {
  const inner = rowsHtml.trim()
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:8px;">${rowsHtml}</table>`
    : `<p style="margin:8px 0 0 0;color:#888;font-size:14px;">${esc(empty)}</p>`;
  return `<div style="margin-top:28px;">
    <div style="display:flex;justify-content:space-between;align-items:baseline;">
      <h2 style="margin:0;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#222;">${esc(title)}</h2>
      <a href="${href}" style="font-size:12px;color:${ACCENT};text-decoration:none;">View $†’</a>
    </div>
    ${inner}
  </div>`;
}

export function renderDailyDigest(user: TeamUser, data: MyDayData): RenderedDigest {
  const totals = digestTotals(data);
  const subject = `Your day $€” ${totals.todayTasks} task${totals.todayTasks === 1 ? "" : "s"}, ${totals.overdueTasks} overdue`;

  const todayScheduledBookings = data.todayBookings.filter((b) => b.status === "scheduled");
  const bookingRows = todayScheduledBookings.slice(0, MAX_ROWS).map(bookingRowHtml).join("");
  const overdueRows = data.overdueTasks.slice(0, MAX_ROWS).map(taskRowHtml).join("");
  const todayRows = data.todaysTasks.slice(0, MAX_ROWS).map(taskRowHtml).join("");
  const appRows = data.applicationsWaiting.slice(0, MAX_ROWS).map(appRowHtml).join("");
  const staleRows = data.staleContacts.slice(0, MAX_ROWS).map(staleRowHtml).join("");

  const today = formatDate(new Date());
  const tasksUrl = `${BASE_URL}/admin/tasks`;
  const bookingsUrl = `${BASE_URL}/admin/bookings`;
  const appsUrl = `${BASE_URL}/admin/applications`;
  const contactsUrl = `${BASE_URL}/admin/contacts?owner=${encodeURIComponent(user.slug)}&stale=1`;
  const myDayUrl = `${BASE_URL}/admin/my-day`;

  const summaryCell = (label: string, value: number, accent: boolean) => `
    <td style="padding:12px;background:#fafafa;border:1px solid #eee;border-radius:6px;text-align:center;width:25%;">
      <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#888;">${esc(label)}</div>
      <div style="font-size:24px;font-weight:700;margin-top:4px;color:${accent ? ACCENT : "#222"};">${value}</div>
    </td>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #eee;border-radius:8px;padding:32px;">
<tr><td>
  <h1 style="margin:0;font-size:22px;color:#222;">Good morning, ${esc(user.name)}</h1>
  <p style="margin:4px 0 0 0;color:#888;font-size:13px;">${esc(today)}</p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="4" style="margin-top:24px;border-collapse:separate;">
    <tr>
      ${summaryCell("Overdue", totals.overdueTasks, totals.overdueTasks > 0)}
      ${summaryCell("Due today", totals.todayTasks, false)}
      ${summaryCell("Apps waiting", totals.applicationsWaiting, false)}
      ${summaryCell("Stale", totals.staleContacts, totals.staleContacts > 0)}
    </tr>
  </table>

  ${todayScheduledBookings.length > 0 ? sectionHtml("Today's bookings", bookingsUrl, bookingRows, "Nothing scheduled today.") : ""}
  ${sectionHtml("Overdue tasks", tasksUrl, overdueRows, "Nothing overdue. Solid.")}
  ${sectionHtml("Due today", tasksUrl, todayRows, "No tasks due today.")}
  ${sectionHtml("Applications waiting", appsUrl, appRows, "No applications waiting on you.")}
  ${sectionHtml("Stale contacts (>7d)", contactsUrl, staleRows, "All current.")}

  <div style="margin-top:36px;padding-top:20px;border-top:1px solid #eee;text-align:center;">
    <a href="${myDayUrl}" style="color:${ACCENT};text-decoration:none;font-size:14px;font-weight:600;">View full dashboard $†’</a>
  </div>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  const textLines: string[] = [];
  textLines.push(`Good morning, ${user.name}`);
  textLines.push(today);
  textLines.push("");
  textLines.push(`Overdue: ${totals.overdueTasks}  |  Due today: ${totals.todayTasks}  |  Apps waiting: ${totals.applicationsWaiting}  |  Stale: ${totals.staleContacts}`);
  textLines.push("");

  if (todayScheduledBookings.length) {
    textLines.push("TODAY'S BOOKINGS");
    for (const b of todayScheduledBookings.slice(0, MAX_ROWS)) {
      const d = new Date(b.scheduledAt);
      const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      textLines.push(`  - ${time} $· ${b.title} (${b.durationMinutes}m)${b.contactEmail ? ` $€” ${b.contactName ?? b.contactEmail}` : ""}`);
    }
    textLines.push("");
  }
  if (data.overdueTasks.length) {
    textLines.push("OVERDUE TASKS");
    for (const t of data.overdueTasks.slice(0, MAX_ROWS)) {
      textLines.push(`  - ${t.title}${t.dueAt ? ` (${formatDueDate(t.dueAt)})` : ""}${t.contactEmail ? ` $€” ${t.contactName ?? t.contactEmail}` : ""}`);
    }
    textLines.push("");
  }
  if (data.todaysTasks.length) {
    textLines.push("DUE TODAY");
    for (const t of data.todaysTasks.slice(0, MAX_ROWS)) {
      textLines.push(`  - ${t.title}${t.contactEmail ? ` $€” ${t.contactName ?? t.contactEmail}` : ""}`);
    }
    textLines.push("");
  }
  if (data.applicationsWaiting.length) {
    textLines.push("APPLICATIONS WAITING");
    for (const a of data.applicationsWaiting.slice(0, MAX_ROWS)) {
      textLines.push(`  - ${a.name} <${a.email}> $€” ${a.status}`);
    }
    textLines.push("");
  }
  if (data.staleContacts.length) {
    textLines.push("STALE CONTACTS");
    for (const c of data.staleContacts.slice(0, MAX_ROWS)) {
      textLines.push(`  - ${c.name ?? c.email} (last ${daysSince(c.lastActivityAt)})`);
    }
    textLines.push("");
  }

  textLines.push(`Full dashboard: ${myDayUrl}`);

  return { subject, html, text: textLines.join("\n") };
}

export interface SendDigestResult {
  status: "sent" | "failed";
  resendId?: string;
  errorMessage?: string;
}

/** Send a rendered digest to a team user via Resend. */
export async function sendDigestEmail(
  user: TeamUser,
  rendered: RenderedDigest
): Promise<SendDigestResult> {
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
        to: [user.email],
        reply_to: user.email,
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
