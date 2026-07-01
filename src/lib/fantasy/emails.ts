/**
 * Roadman Fantasy Tour — transactional email rendering + sending.
 *
 * Same construction rules as the Ask Roadman magic-link email: plain
 * HTML tables, inline styles, brand tokens hardcoded (inbox clients
 * strip webfonts and stylesheets), renders identically in Gmail /
 * Apple Mail / Outlook mobile.
 *
 * The daily stage email is the product's heartbeat (Section 5.2):
 * position first (the open driver), stage + the Roadman take, fantasy
 * angle, deadline, ONE coral CTA that deep-links straight into the
 * logged-in team page. Stage copy passes the content guard before it
 * can be sent — a blocked take falls back to the factual stage line
 * rather than shipping slop or a forbidden attribution.
 */

import { getResendClient } from "@/lib/integrations/resend";
import { escapeHtml } from "@/lib/validation";
import { checkContent } from "./content-guard";

const FROM = "Roadman Fantasy Tour <hello@roadmancycling.com>";
const REPLY_TO = "anthony@roadmancycling.com";

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://roadmancycling.com";
}

/* ─── Shared shell ──────────────────────────────────────────── */

function emailShell(eyebrow: string, heading: string, bodyRows: string): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#252526;color:#FAFAFA;font-family:'Work Sans',Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#252526;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;">
        <tr><td style="padding:0 0 24px 0;">
          <p style="margin:0 0 10px 0;color:#F16363;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;font-family:'Bebas Neue',Arial Black,sans-serif;font-weight:700;">${escapeHtml(eyebrow)}</p>
          <h1 style="margin:0;font-size:32px;line-height:1.05;letter-spacing:0.01em;text-transform:uppercase;color:#FAFAFA;font-family:'Bebas Neue',Arial Black,sans-serif;font-weight:700;">${escapeHtml(heading)}</h1>
        </td></tr>
        ${bodyRows}
        <tr><td style="padding:20px 0 0 0;border-top:1px solid #3A3A3D;color:#64748B;font-size:11px;line-height:1.55;letter-spacing:0.04em;">
          Roadman Fantasy Tour — free to play. You're getting this because you saved a team and asked for the daily stage email. Unsubscribe any time from the link below.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function ctaButton(url: string, label: string): string {
  const safeUrl = escapeHtml(url);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr><td bgcolor="#F16363" style="background:#F16363;border-radius:6px;">
      <a href="${safeUrl}" style="display:inline-block;padding:16px 28px;color:#252526;text-decoration:none;font-family:'Bebas Neue',Arial Black,sans-serif;font-weight:700;font-size:16px;letter-spacing:0.16em;text-transform:uppercase;">${escapeHtml(label)} →</a>
    </td></tr>
  </table>`;
}

/* ─── Magic link (save-your-team / sign-in) ─────────────────── */

export async function sendFantasyMagicLinkEmail(input: {
  to: string;
  firstName: string;
  rawToken: string;
  teamName: string;
}): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[fantasy] RESEND_API_KEY not configured — magic link skipped");
    return;
  }
  const url = `${getSiteUrl()}/api/fantasy/auth/verify?token=${encodeURIComponent(input.rawToken)}`;
  const body = `
    <tr><td style="padding:0 0 24px 0;color:#CBD5E1;font-size:16px;line-height:1.6;">
      ${escapeHtml(input.firstName)}, your team <strong style="color:#FAFAFA;">${escapeHtml(input.teamName)}</strong> is built. One tap locks it in and confirms you want the daily stage email for the three weeks of the Tour.
    </td></tr>
    <tr><td style="padding:0 0 28px 0;">${ctaButton(url, "Lock in my team")}</td></tr>
    <tr><td style="padding:0 0 8px 0;color:#94A3B8;font-size:13px;line-height:1.5;">
      The link works once and expires in 24 hours. You can edit your team as often as you like until noon on race day, 4 July.
    </td></tr>
    <tr><td style="padding:0 0 24px 0;color:#94A3B8;font-size:12px;line-height:1.55;word-break:break-all;">
      Or paste this into your browser:<br>
      <a href="${escapeHtml(url)}" style="color:#F16363;text-decoration:underline;">${escapeHtml(url)}</a>
    </td></tr>`;

  await resend.emails.send({
    from: FROM,
    to: input.to,
    replyTo: REPLY_TO,
    subject: "Lock in your Fantasy Tour team",
    text: [
      `${input.firstName}, your team "${input.teamName}" is built.`,
      "",
      "Tap to lock it in and confirm the daily stage email:",
      url,
      "",
      "The link works once and expires in 24 hours.",
      "",
      "— Roadman Cycling",
    ].join("\n"),
    html: emailShell("Roadman Fantasy Tour", "One tap and you're in the race.", body),
    tags: [{ name: "campaign", value: "fantasy-tour-magic-link" }],
  });
}

/* ─── Daily stage email ─────────────────────────────────────── */

export interface DailyStageEmailInput {
  to: string;
  firstName: string;
  teamName: string;
  globalRank: number | null;
  totalPlayers: number;
  lastStagePoints: number | null;
  lastStageNumber: number | null;
  miniLeagues: { name: string; rank: number; size: number }[];
  stage: {
    stageNumber: number;
    startTown: string;
    finishTown: string;
    distanceKm: string;
    stageType: "ttt" | "itt" | "flat" | "hilly" | "mountain";
    summitFinish: boolean;
  };
  /** Anthony-voice stage note, already human-approved. Guard re-checks at send. */
  roadmanTake: string | null;
  deadline: Date;
  /** 7-day multi-use deep-link token (play scope). */
  deepLinkToken: string;
}

/** Shared "stage suits" copy — daily email + the stage detail page. */
export const STAGE_ANGLE: Record<DailyStageEmailInput["stage"]["stageType"], string> = {
  flat: "Stage suits: sprinters. Captain a fast man and pray nobody crashes him out of the lead-out.",
  hilly: "Stage suits: the break and the puncheurs. A well-priced baroudeur can out-score your GC stars today.",
  mountain: "Stage suits: GC riders and climbers. Big points at the summit, and the polka dot battle pays too.",
  itt: "Stage suits: the TT specialists and GC riders. No hiding places, no teammates.",
  ttt: "Stage suits: strong collective teams. Every rider's individual time at the line counts at half value.",
};

function formatStageDistance(km: string): string {
  return `${Number(km).toLocaleString("en-IE", { maximumFractionDigits: 1 })} km`;
}

function formatDeadline(deadline: Date): { irish: string; cest: string } {
  const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false };
  return {
    irish: deadline.toLocaleTimeString("en-IE", { ...opts, timeZone: "Europe/Dublin" }),
    cest: deadline.toLocaleTimeString("en-IE", { ...opts, timeZone: "Europe/Paris" }),
  };
}

export function renderDailyStageEmail(input: DailyStageEmailInput): { subject: string; html: string; text: string } {
  const { stage } = input;
  const deepLink = `${getSiteUrl()}/api/fantasy/auth/verify?token=${encodeURIComponent(input.deepLinkToken)}&next=/fantasy/team`;
  const deadline = formatDeadline(input.deadline);

  // The take only ships if it passes the fact blocklist + slop filters.
  let take = input.roadmanTake?.trim() ?? "";
  if (take && !checkContent(take).ok) {
    console.error(`[fantasy] stage ${stage.stageNumber} take blocked by content guard — sending factual fallback`);
    take = "";
  }

  const positionLine =
    input.globalRank != null
      ? `You're <strong style="color:#FAFAFA;">#${input.globalRank.toLocaleString("en-IE")}</strong> of ${input.totalPlayers.toLocaleString("en-IE")} worldwide` +
        (input.lastStagePoints != null && input.lastStageNumber != null
          ? `, after <strong style="color:#F16363;">${input.lastStagePoints} pts</strong> on Stage ${input.lastStageNumber}.`
          : ".")
      : "Your first points land tonight.";

  const leagueRows = input.miniLeagues
    .map(
      (l) =>
        `<tr><td style="padding:2px 0;color:#CBD5E1;font-size:14px;">${escapeHtml(l.name)}</td><td align="right" style="color:#FAFAFA;font-size:14px;font-weight:600;">${l.rank}/${l.size}</td></tr>`,
    )
    .join("");

  const body = `
    <tr><td style="padding:0 0 20px 0;color:#CBD5E1;font-size:16px;line-height:1.6;">
      ${escapeHtml(input.firstName)} — ${positionLine}
    </td></tr>
    ${
      leagueRows
        ? `<tr><td style="padding:0 0 20px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#210140;border-radius:8px;padding:14px 16px;">${leagueRows}</table></td></tr>`
        : ""
    }
    <tr><td style="padding:0 0 6px 0;color:#F16363;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;font-family:'Bebas Neue',Arial Black,sans-serif;">Today's stage</td></tr>
    <tr><td style="padding:0 0 12px 0;color:#FAFAFA;font-size:20px;line-height:1.3;font-weight:600;">
      Stage ${stage.stageNumber}: ${escapeHtml(stage.startTown)} → ${escapeHtml(stage.finishTown)}, ${formatStageDistance(stage.distanceKm)}${stage.summitFinish ? " — summit finish" : ""}
    </td></tr>
    ${
      take
        ? `<tr><td style="padding:0 0 16px 0;color:#CBD5E1;font-size:15px;line-height:1.6;">${escapeHtml(take)}</td></tr>`
        : ""
    }
    <tr><td style="padding:0 0 24px 0;color:#94A3B8;font-size:14px;line-height:1.6;">
      ${escapeHtml(STAGE_ANGLE[stage.stageType])}
    </td></tr>
    <tr><td style="padding:0 0 8px 0;color:#FAFAFA;font-size:14px;line-height:1.5;">
      Transfers and captain lock at <strong style="color:#F16363;">${deadline.irish} Irish time</strong> (${deadline.cest} CEST).
    </td></tr>
    <tr><td style="padding:12px 0 28px 0;">${ctaButton(deepLink, "Make your changes")}</td></tr>`;

  const subject = `Stage ${stage.stageNumber}: ${stage.startTown} → ${stage.finishTown}${
    input.lastStagePoints != null ? ` (you scored ${input.lastStagePoints})` : ""
  }`;

  const text = [
    `${input.firstName} — ${input.globalRank != null ? `you're #${input.globalRank} of ${input.totalPlayers}` : "your first points land tonight"}.`,
    "",
    `Stage ${stage.stageNumber}: ${stage.startTown} → ${stage.finishTown}, ${formatStageDistance(stage.distanceKm)}${stage.summitFinish ? " — summit finish" : ""}`,
    take,
    STAGE_ANGLE[stage.stageType],
    "",
    `Transfers lock at ${deadline.irish} Irish time (${deadline.cest} CEST).`,
    `Make your changes: ${deepLink}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html: emailShell("Roadman Fantasy Tour", `Stage ${stage.stageNumber} day.`, body), text };
}

/* ─── Rest-day email ────────────────────────────────────────── */

export function renderRestDayEmail(input: {
  firstName: string;
  globalRank: number | null;
  totalPlayers: number;
  deepLinkToken: string;
  weekLabel: string;
}): { subject: string; html: string; text: string } {
  const deepLink = `${getSiteUrl()}/api/fantasy/auth/verify?token=${encodeURIComponent(input.deepLinkToken)}&next=/fantasy/team`;
  const body = `
    <tr><td style="padding:0 0 20px 0;color:#CBD5E1;font-size:16px;line-height:1.6;">
      ${escapeHtml(input.firstName)} — no racing today, but the game moves anyway: your <strong style="color:#F16363;">bonus transfer is unlocked</strong>. ${
        input.globalRank != null
          ? `You're #${input.globalRank.toLocaleString("en-IE")} of ${input.totalPlayers.toLocaleString("en-IE")} going into ${escapeHtml(input.weekLabel)}.`
          : ""
      }
    </td></tr>
    <tr><td style="padding:0 0 24px 0;color:#94A3B8;font-size:14px;line-height:1.6;">
      Rest days are where Tours are won in this game. Abandons don't give you free swaps, but this does: one extra transfer, on top of whatever you have left, usable from tomorrow's stage.
    </td></tr>
    <tr><td style="padding:0 0 28px 0;">${ctaButton(deepLink, "Use my bonus transfer")}</td></tr>`;
  const subject = "Rest day: your bonus transfer is unlocked";
  return {
    subject,
    html: emailShell("Roadman Fantasy Tour", "Rest day rundown.", body),
    text: `${input.firstName} — your rest-day bonus transfer is unlocked. Use it: ${deepLink}`,
  };
}

/* ─── Mini-league nudge (48h, no league — Section 5.3) ──────── */

export function renderLeagueNudgeEmail(input: {
  firstName: string;
  teamName: string;
  deepLinkToken: string;
  clubhouseCode: string;
}): { subject: string; html: string; text: string } {
  const deepLink = `${getSiteUrl()}/api/fantasy/auth/verify?token=${encodeURIComponent(input.deepLinkToken)}&next=/fantasy/team`;
  const body = `
    <tr><td style="padding:0 0 20px 0;color:#CBD5E1;font-size:16px;line-height:1.6;">
      ${escapeHtml(input.firstName)} — <strong style="color:#FAFAFA;">${escapeHtml(input.teamName)}</strong> is in the global league, but the global league doesn't slag you at the coffee stop. Mini-leagues are where this game gets personal.
    </td></tr>
    <tr><td style="padding:0 0 20px 0;color:#94A3B8;font-size:14px;line-height:1.6;">
      Create one in ten seconds and send the code to the group chat, or join the official Roadman Clubhouse with code <strong style="color:#F16363;letter-spacing:0.15em;">${escapeHtml(input.clubhouseCode)}</strong>.
    </td></tr>
    <tr><td style="padding:0 0 28px 0;">${ctaButton(deepLink, "Set up my league")}</td></tr>`;
  const subject = "Your team needs a rivalry";
  return {
    subject,
    html: emailShell("Roadman Fantasy Tour", "No league, no bragging rights.", body),
    text: [
      `${input.firstName} — "${input.teamName}" is in the global league, but mini-leagues are where this game gets personal.`,
      `Create one in ten seconds, or join the Roadman Clubhouse with code ${input.clubhouseCode}.`,
      deepLink,
    ].join("\n\n"),
  };
}

export async function sendRenderedEmail(
  to: string,
  rendered: { subject: string; html: string; text: string },
  campaign: string,
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    tags: [{ name: "campaign", value: campaign }],
  });
  return !error;
}
