/**
 * Tool report generator — one function per calculator produces a
 * rich HTML email with the user's personalised results, practical
 * application, and soft CTAs back to the site.
 *
 * Used by /api/tools/report. Keep report text bandwidth here
 * (the email template wrapper lives in src/lib/notifications.ts).
 *
 * Every generator returns `{ subject, html, beehiivTag, beehiivFields }`
 * so the route can fire all three side-effects (email send, Beehiiv
 * upsert with correct tag, response to client) from one call.
 */

export type ToolSlug =
  | "ftp-zones"
  | "tyre-pressure"
  | "race-weight"
  | "energy-availability"
  | "fuelling"
  | "shock-pressure";

export interface ReportOutput {
  subject: string;
  html: string;
  beehiivTag: string;
  /** Extra custom fields captured for segmentation. */
  beehiivFields: Record<string, string | number>;
}

/* ============================================================ */
/* Shared email wrapper                                         */
/* ============================================================ */

function wrap(title: string, subtitle: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#1a1a1c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#FAFAFA;">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px;">
    <div style="background:#210140;color:#FAFAFA;padding:32px 28px;border-radius:12px 12px 0 0;">
      <p style="color:#F16363;margin:0 0 8px;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Roadman Cycling · Your Report</p>
      <h1 style="font-size:32px;margin:0;line-height:1.1;letter-spacing:-0.02em;">${escapeHtml(title)}</h1>
      <p style="color:#e0d0ff;margin:14px 0 0;font-size:15px;line-height:1.5;">${escapeHtml(subtitle)}</p>
    </div>
    <div style="background:#252526;color:#FAFAFA;padding:32px 28px;border-radius:0 0 12px 12px;line-height:1.6;">
      ${body}
      <div style="margin-top:40px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);">
        <p style="color:#9ca3af;font-size:13px;margin:0 0 4px;">Anthony Walsh</p>
        <p style="color:#6b7280;font-size:12px;margin:0;">Host, Roadman Cycling Podcast · <a href="https://roadmancycling.com" style="color:#F16363;text-decoration:none;">roadmancycling.com</a></p>
      </div>
    </div>
    <p style="text-align:center;color:#6b7280;font-size:11px;margin:16px 0 0;">
      You asked for this report from roadmancycling.com. One-off send.
      We'll also add you to the Saturday Spin — <a href="{{RESEND_UNSUBSCRIBE_URL}}" style="color:#9ca3af;">unsubscribe anytime</a>.
    </p>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function softCoachingCta(): string {
  return `<div style="margin-top:32px;padding:20px;background:rgba(241,99,99,0.06);border:1px solid rgba(241,99,99,0.2);border-radius:12px;">
    <p style="color:#F16363;font-size:11px;letter-spacing:2px;margin:0 0 6px;text-transform:uppercase;">When you're ready</p>
    <p style="color:#FAFAFA;font-size:16px;margin:0 0 4px;font-weight:600;">Want this applied to your whole training week?</p>
    <p style="color:#9ca3af;font-size:13px;margin:0 0 14px;">Not Done Yet is the coached five-pillar system. Personalised plan, weekly calls, expert masterclasses. 7-day free trial, $195/mo.</p>
    <a href="https://roadmancycling.com/apply" style="display:inline-block;padding:10px 18px;background:#F16363;color:#FAFAFA;text-decoration:none;border-radius:6px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">Apply · 7-day free trial →</a>
  </div>`;
}

/* ============================================================ */
/* FTP Zones report                                             */
/* ============================================================ */

interface FtpZonesInputs {
  ftp: number;
  name?: string;
}

function generateFtpZonesReport(inputs: FtpZonesInputs): ReportOutput {
  const ftp = inputs.ftp;
  const name = inputs.name?.split(" ")[0] ?? "";

  // Zone boundaries — keep identical to the on-page calculator
  const zones = [
    { n: 1, label: "Active Recovery", minPct: 0, maxPct: 55 },
    { n: 2, label: "Endurance", minPct: 56, maxPct: 75 },
    { n: 3, label: "Tempo", minPct: 76, maxPct: 90 },
    { n: 4, label: "Threshold", minPct: 91, maxPct: 105 },
    { n: 5, label: "VO2 Max", minPct: 106, maxPct: 120 },
    { n: 6, label: "Anaerobic", minPct: 121, maxPct: 150 },
    { n: 7, label: "Neuromuscular", minPct: 151, maxPct: null as number | null },
  ];

  const zoneRows = zones
    .map((z) => {
      const min = Math.round((z.minPct / 100) * ftp);
      const max = z.maxPct === null ? null : Math.round((z.maxPct / 100) * ftp);
      const range = max === null ? `${min}w+` : `${min}–${max}w`;
      return `<tr>
        <td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#F16363;font-weight:600;">Z${z.n}</td>
        <td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#FAFAFA;">${z.label}</td>
        <td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;font-variant-numeric:tabular-nums;">${range}</td>
      </tr>`;
    })
    .join("");

  // Personalised session targets derived from the user's FTP
  const z2Low = Math.round(0.56 * ftp);
  const z2High = Math.round(0.75 * ftp);
  const thresholdLow = Math.round(0.91 * ftp);
  const thresholdHigh = Math.round(1.05 * ftp);
  const vo2Low = Math.round(1.06 * ftp);
  const vo2High = Math.round(1.2 * ftp);

  const body = `
    ${name ? `<p style="color:#FAFAFA;font-size:15px;margin:0 0 16px;">${escapeHtml(name)} —</p>` : ""}

    <p style="color:#FAFAFA;font-size:15px;margin:0 0 8px;">Your FTP: <strong style="color:#F16363;font-size:22px;">${ftp}w</strong></p>
    <p style="color:#9ca3af;font-size:13px;margin:0 0 24px;">Below is your complete 7-zone breakdown. Save this email — these are the numbers every session on the bike lives inside.</p>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Your zones</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;background:rgba(255,255,255,0.03);border-radius:8px;overflow:hidden;margin:0 0 28px;">
      <thead>
        <tr style="background:rgba(255,255,255,0.05);">
          <th style="padding:10px 12px;text-align:left;color:#9ca3af;font-weight:500;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Zone</th>
          <th style="padding:10px 12px;text-align:left;color:#9ca3af;font-weight:500;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Name</th>
          <th style="padding:10px 12px;text-align:right;color:#9ca3af;font-weight:500;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Watts</th>
        </tr>
      </thead>
      <tbody>${zoneRows}</tbody>
    </table>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Your polarised week</h2>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 16px;">Built around your ${ftp}w FTP. The 80/20 split Seiler&apos;s research shows the world&apos;s best athletes converge on.</p>

    <ul style="list-style:none;padding:0;margin:0 0 28px;">
      <li style="padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:8px;">
        <strong style="color:#FAFAFA;display:block;margin-bottom:2px;">Monday · Rest or easy spin</strong>
        <span style="color:#9ca3af;font-size:13px;">45 min Zone 1 if you need the movement. Legs up is also training.</span>
      </li>
      <li style="padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:8px;">
        <strong style="color:#FAFAFA;display:block;margin-bottom:2px;">Tuesday · Threshold · <span style="color:#F16363;">${thresholdLow}–${thresholdHigh}w</span></strong>
        <span style="color:#9ca3af;font-size:13px;">Warm up 15 min. 2×20 min at threshold with 5 min recovery between. Cool down. This is your anchor session.</span>
      </li>
      <li style="padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:8px;">
        <strong style="color:#FAFAFA;display:block;margin-bottom:2px;">Wednesday · Zone 2 · <span style="color:#F16363;">${z2Low}–${z2High}w</span></strong>
        <span style="color:#9ca3af;font-size:13px;">75–90 min steady. Conversational pace. If you can&apos;t talk in sentences you&apos;re too hard.</span>
      </li>
      <li style="padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:8px;">
        <strong style="color:#FAFAFA;display:block;margin-bottom:2px;">Thursday · VO2 max · <span style="color:#F16363;">${vo2Low}–${vo2High}w</span></strong>
        <span style="color:#9ca3af;font-size:13px;">Warm up. 4×4 min at VO2 max with 4 min easy recovery. The 4th rep should be the hardest — if it&apos;s easy, push harder next week.</span>
      </li>
      <li style="padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:8px;">
        <strong style="color:#FAFAFA;display:block;margin-bottom:2px;">Friday · Rest</strong>
        <span style="color:#9ca3af;font-size:13px;">Genuine rest. Or a 30 min coffee spin in Zone 1. Nothing spicy.</span>
      </li>
      <li style="padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:8px;">
        <strong style="color:#FAFAFA;display:block;margin-bottom:2px;">Saturday · Long Zone 2 · <span style="color:#F16363;">${z2Low}–${z2High}w</span></strong>
        <span style="color:#9ca3af;font-size:13px;">3–4 hours. Fueled. The long ride is where your aerobic engine actually grows. Don&apos;t let it drift into Zone 3.</span>
      </li>
      <li style="padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:8px;">
        <strong style="color:#FAFAFA;display:block;margin-bottom:2px;">Sunday · Group ride or Zone 2</strong>
        <span style="color:#9ca3af;font-size:13px;">Group ride counts. If you&apos;ve done the quality work this week, Sunday is social + steady.</span>
      </li>
    </ul>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Three rules that unlock this</h2>
    <ol style="padding-left:20px;margin:0 0 28px;color:#FAFAFA;">
      <li style="margin-bottom:10px;line-height:1.55;"><strong>Keep Zone 2 easy.</strong> If your average heart rate or power drifts into Zone 3, the day stops being Zone 2. Most amateurs fail here.</li>
      <li style="margin-bottom:10px;line-height:1.55;"><strong>Protect your hard days.</strong> One threshold, one VO2 max. If life says otherwise, drop VO2 max first — it needs freshness.</li>
      <li style="line-height:1.55;"><strong>8 weeks before you judge it.</strong> The Norwegian 4×8 research consistently shows 6–8 weeks of this pattern before a testable FTP bump.</li>
    </ol>

    <div style="padding:18px 20px;background:rgba(255,255,255,0.03);border-left:3px solid #F16363;border-radius:4px;margin:0 0 28px;">
      <p style="color:#9ca3af;font-size:13px;margin:0 0 6px;font-style:italic;">From the podcast:</p>
      <p style="color:#FAFAFA;font-size:15px;margin:0 0 10px;line-height:1.5;">&ldquo;The best endurance athletes don&apos;t have some secret. They do the obvious things consistently, for years.&rdquo;</p>
      <p style="color:#9ca3af;font-size:13px;margin:0 0 10px;">— Professor Stephen Seiler, Roadman Podcast ep. 2148</p>
      <a href="https://roadmancycling.com/podcast/ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler" style="color:#F16363;font-size:13px;text-decoration:none;">Listen to the full conversation →</a>
    </div>

    <p style="color:#FAFAFA;font-size:14px;margin:0 0 8px;">Further reading on the site:</p>
    <ul style="padding-left:20px;margin:0 0 28px;color:#F16363;font-size:14px;">
      <li style="margin-bottom:4px;"><a href="https://roadmancycling.com/blog/polarised-training-cycling-guide" style="color:#F16363;">Polarised training: the 80/20 approach</a></li>
      <li style="margin-bottom:4px;"><a href="https://roadmancycling.com/blog/how-to-improve-ftp-cycling" style="color:#F16363;">How to improve your FTP</a></li>
      <li><a href="https://roadmancycling.com/blog/zone-2-training-complete-guide" style="color:#F16363;">Zone 2 training — complete guide</a></li>
    </ul>

    ${softCoachingCta()}
  `;

  return {
    subject: `Your ${ftp}w FTP zones + training week`,
    html: wrap(`Your FTP Zones, ${ftp}w`, "The 7-zone breakdown plus a polarised training week built around your numbers.", body),
    beehiivTag: "tool-ftp-zones-report",
    beehiivFields: {
      ftp_watts: ftp,
      tool: "ftp-zones",
    },
  };
}

/* ============================================================ */
/* Entry point — dispatch by tool slug                          */
/* ============================================================ */

export function generateToolReport(
  tool: ToolSlug,
  inputs: Record<string, unknown>,
): ReportOutput | null {
  switch (tool) {
    case "ftp-zones": {
      const ftp = Number(inputs.ftp);
      if (!ftp || ftp < 50 || ftp > 600) return null;
      const name = typeof inputs.name === "string" ? inputs.name : undefined;
      return generateFtpZonesReport({ ftp, name });
    }
    // Additional tools to follow — tyre-pressure, race-weight, etc.
    default:
      return null;
  }
}
