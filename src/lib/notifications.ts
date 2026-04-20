/**
 * Email Notification System
 *
 * Centralised email sending via Resend for all sponsor-related notifications.
 * All emails come from: Roadman Cycling <noreply@roadmancycling.com>
 */

const FROM_ADDRESS = "Roadman Cycling <noreply@roadmancycling.com>";

const RECIPIENTS = {
  anthony: "anthony@roadmancycling.com",
  sarah: "sarah@roadmancycling.com",
} as const;

// ---------------------------------------------------------------------------
// Low-level send helper
// ---------------------------------------------------------------------------

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[notifications] RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[notifications] Resend error:", errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[notifications] Send failed:", message);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Shared email wrapper (Roadman brand style)
// ---------------------------------------------------------------------------

function emailWrapper(title: string, subtitle: string, body: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #210140; color: #FAFAFA; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="font-family: 'Bebas Neue', sans-serif; font-size: 28px; margin: 0; letter-spacing: 0.05em;">
          ${title}
        </h1>
        <p style="color: #F16363; margin: 8px 0 0 0; font-size: 14px;">
          ${subtitle}
        </p>
      </div>
      <div style="background: #2E2E30; color: #FAFAFA; padding: 24px; border-radius: 0 0 8px 8px;">
        ${body}
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="color: #545559; font-size: 12px; margin: 0;">
            Sent by Roadman Cycling Sponsor System
          </p>
        </div>
      </div>
    </div>
  `;
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: #B0B0B5; font-size: 13px; width: 40%;">${label}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 600;">${escapeHtml(value)}</td>
    </tr>
  `;
}

function table(rows: string): string {
  return `<table style="width: 100%; border-collapse: collapse;">${rows}</table>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------------------------------------------------------------------------
// 1. Spotlight Purchase
// ---------------------------------------------------------------------------

export async function notifySpotlightPurchase(
  sponsorName: string,
  slotType: string,
  week: string,
  amount: number,
) {
  const slotLabels: Record<string, string> = {
    podcast_endroll: "Podcast End-Roll",
    podcast_midroll: "Podcast Mid-Roll",
    newsletter_classified: "Newsletter Classified",
  };

  const html = emailWrapper(
    "SPOTLIGHT PURCHASE",
    new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    table(
      row("Brand", sponsorName) +
      row("Slot Type", slotLabels[slotType] ?? slotType) +
      row("Week", week) +
      row("Amount", `£${amount.toLocaleString("en-GB")}`)
    ),
  );

  return sendEmail({
    to: [RECIPIENTS.anthony, RECIPIENTS.sarah],
    subject: `Spotlight Purchase: ${sponsorName} — ${slotLabels[slotType] ?? slotType}`,
    html,
  });
}

// ---------------------------------------------------------------------------
// 2. Quarter Enquiry (pre-screener)
// ---------------------------------------------------------------------------

export async function notifyQuarterEnquiry(
  brandName: string,
  budget: string,
  launchMonth: string,
) {
  const budgetLabels: Record<string, string> = {
    "6k_12k": "£6k – £12k/quarter",
    "12k_plus": "£12k+/quarter",
  };

  const html = emailWrapper(
    "QUARTER ENQUIRY",
    new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    table(
      row("Brand", brandName) +
      row("Budget Range", budgetLabels[budget] ?? budget) +
      row("Target Launch", launchMonth)
    ) +
    `<p style="color: #B0B0B5; margin-top: 16px; font-size: 13px;">
      This brand passed the pre-screener and was shown the Calendly booking link.
    </p>`,
  );

  return sendEmail({
    to: [RECIPIENTS.anthony, RECIPIENTS.sarah],
    subject: `Quarter Enquiry: ${brandName}`,
    html,
  });
}

// ---------------------------------------------------------------------------
// 3. Annual Application
// ---------------------------------------------------------------------------

export interface AnnualApplicationData {
  brandName: string;
  website: string;
  contactNameTitle: string;
  contactEmail: string;
  brandDescription: string;
  targetCustomer: string;
  outcome: string;
  budgetRange: string;
  previousExperience: string;
  categoryNotes?: string;
}

const BUDGET_LABELS: Record<string, string> = {
  "96k": "£96k/yr (£8k/mo)",
  "120k_180k": "£120k – £180k/yr",
  "180k_plus": "£180k+/yr",
  discuss: "Let's discuss",
};

export async function notifyAnnualApplication(formData: AnnualApplicationData) {
  const html = emailWrapper(
    "NEW ANNUAL PARTNER APPLICATION",
    new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    table(
      row("Brand", formData.brandName) +
      row("Website", formData.website) +
      row("Contact", formData.contactNameTitle) +
      row("Email", formData.contactEmail) +
      row("Budget", BUDGET_LABELS[formData.budgetRange] ?? formData.budgetRange)
    ) +
    `<div style="margin-top: 24px;">
      <h3 style="color: #F16363; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Brand Description</h3>
      <p style="color: #B0B0B5; line-height: 1.6; margin: 0;">${escapeHtml(formData.brandDescription)}</p>
    </div>` +
    `<div style="margin-top: 20px;">
      <h3 style="color: #F16363; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Target Customer / Audience Overlap</h3>
      <p style="color: #B0B0B5; line-height: 1.6; margin: 0;">${escapeHtml(formData.targetCustomer)}</p>
    </div>` +
    `<div style="margin-top: 20px;">
      <h3 style="color: #F16363; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Desired Outcome</h3>
      <p style="color: #B0B0B5; line-height: 1.6; margin: 0;">${escapeHtml(formData.outcome)}</p>
    </div>` +
    `<div style="margin-top: 20px;">
      <h3 style="color: #F16363; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Previous Sponsorship Experience</h3>
      <p style="color: #B0B0B5; line-height: 1.6; margin: 0;">${escapeHtml(formData.previousExperience)}</p>
    </div>` +
    (formData.categoryNotes?.trim()
      ? `<div style="margin-top: 20px;">
          <h3 style="color: #F16363; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Category Notes</h3>
          <p style="color: #B0B0B5; line-height: 1.6; margin: 0;">${escapeHtml(formData.categoryNotes)}</p>
        </div>`
      : ""),
  );

  return sendEmail({
    to: RECIPIENTS.anthony,
    subject: `Annual Partner Application: ${formData.brandName}`,
    html,
    replyTo: formData.contactEmail,
  });
}

// ---------------------------------------------------------------------------
// 4. Renewal Approaching
// ---------------------------------------------------------------------------

export async function notifyRenewalApproaching(
  sponsorName: string,
  renewalDate: string,
  contractValue: number,
) {
  const daysUntil = Math.ceil(
    (new Date(renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  const html = emailWrapper(
    "RENEWAL APPROACHING",
    `${daysUntil} days until renewal`,
    table(
      row("Sponsor", sponsorName) +
      row("Renewal Date", new Date(renewalDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })) +
      row("Contract Value", `£${contractValue.toLocaleString("en-GB")}`) +
      row("Days Remaining", String(daysUntil))
    ) +
    `<p style="color: #B0B0B5; margin-top: 16px; font-size: 13px;">
      Time to start the renewal conversation if you haven't already.
    </p>`,
  );

  return sendEmail({
    to: RECIPIENTS.sarah,
    subject: `Renewal in ${daysUntil} days: ${sponsorName} (£${contractValue.toLocaleString("en-GB")})`,
    html,
  });
}

// ---------------------------------------------------------------------------
// 5. Stale Sponsor (no contact in 30+ days)
// ---------------------------------------------------------------------------

export async function notifyStaleSponsor(
  sponsorName: string,
  lastContactDate: string,
) {
  const daysSince = Math.ceil(
    (Date.now() - new Date(lastContactDate).getTime()) / (1000 * 60 * 60 * 24),
  );

  const html = emailWrapper(
    "STALE SPONSOR ALERT",
    `${daysSince} days since last contact`,
    table(
      row("Sponsor", sponsorName) +
      row("Last Contact", new Date(lastContactDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })) +
      row("Days Since Contact", String(daysSince))
    ) +
    `<p style="color: #B0B0B5; margin-top: 16px; font-size: 13px;">
      This sponsor hasn't been contacted in over 30 days. Worth a check-in.
    </p>`,
  );

  return sendEmail({
    to: RECIPIENTS.sarah,
    subject: `Stale sponsor: ${sponsorName} — ${daysSince} days since contact`,
    html,
  });
}

// ---------------------------------------------------------------------------
// 6. Cohort Application
// ---------------------------------------------------------------------------

export async function notifyCohortApplication(data: {
  name: string;
  email: string;
  goal: string;
  hours: string;
  ftp: string | null;
  frustration: string;
  persona: string;
}) {
  // Lazy import to avoid a circular dep between notifications.ts and
  // src/lib/cohort.ts (both imported from several API routes).
  const { getCohortState } = await import("@/lib/cohort");
  const state = getCohortState();
  const isWaitlist = state.phase === "waitlist";
  const cohortLabel = `Cohort ${state.targetCohort}`;
  const typeLabel = isWaitlist ? "WAITLIST SIGNUP" : "APPLICATION";

  const personaLabels: Record<string, string> = {
    plateau: "Plateau",
    "event-prep": "Event Prep",
    comeback: "Comeback",
    listener: "Listener / New",
  };

  const html = emailWrapper(
    `NEW ${cohortLabel.toUpperCase()} ${typeLabel}`,
    new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    table(
      row("Name", data.name) +
      row("Email", data.email) +
      row("Goal", data.goal) +
      row("Hours/week", data.hours) +
      row("FTP", data.ftp || "Not provided") +
      row("Frustration", data.frustration) +
      row("Persona", personaLabels[data.persona] ?? data.persona) +
      row("Phase", state.phase)
    ) +
    `<p style="margin-top: 16px;">
      <a href="https://roadmancycling.com/admin/applications" style="color: #F16363; text-decoration: underline;">
        View in admin panel →
      </a>
    </p>`,
  );

  const subjectPrefix = isWaitlist
    ? `${cohortLabel} Waitlist`
    : `${cohortLabel} Application`;

  return sendEmail({
    to: RECIPIENTS.anthony,
    subject: `${subjectPrefix}: ${data.name}`,
    html,
    replyTo: data.email,
  });
}
