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
/* Tyre Pressure report                                         */
/* ============================================================ */

interface TyrePressureInputs {
  riderWeight: number; // kg
  bikeWeight: number;  // kg
  tyreWidth: number;   // mm
  rimWidth: number;    // mm
  surface: "smooth" | "rough" | "gravel";
  tubeType: "clincher" | "tubeless" | "tubular";
  front: number;       // psi — precomputed
  rear: number;        // psi — precomputed
  name?: string;
}

function generateTyrePressureReport(i: TyrePressureInputs): ReportOutput {
  const nameLine = i.name ? `<p style="color:#FAFAFA;font-size:15px;margin:0 0 16px;">${escapeHtml(i.name.split(" ")[0])} —</p>` : "";

  // Adjustment table — same PSI shifted by condition. +10% rough, +5% wet, -8% gravel vs baseline.
  const dryFront = i.front;
  const dryRear = i.rear;
  const wetFront = Math.round(i.front * 0.95);
  const wetRear = Math.round(i.rear * 0.95);
  const gravelFront = Math.round(i.front * 0.88);
  const gravelRear = Math.round(i.rear * 0.88);
  const winterFront = Math.round(i.front * 0.9);
  const winterRear = Math.round(i.rear * 0.9);

  const tubelessNote = i.tubeType === "tubeless"
    ? `<p style="color:#9ca3af;font-size:14px;margin:0 0 16px;">You're running tubeless — these numbers assume you're 4-6 psi below what a clincher tyre of the same width would need. If you start burping air, add 3 psi and recheck.</p>`
    : `<p style="color:#9ca3af;font-size:14px;margin:0 0 16px;">You're running clinchers. Going tubeless lets you drop 4-6 psi safely and gain significant grip + comfort. It's the biggest free performance upgrade most cyclists are still sitting on.</p>`;

  const body = `
    ${nameLine}
    <p style="color:#FAFAFA;font-size:15px;margin:0 0 6px;">Setup: ${i.riderWeight} kg rider, ${i.tyreWidth}mm ${i.tubeType} tyres, ${i.rimWidth}mm rims</p>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 24px;">Your baseline (${i.surface} roads): front <strong style="color:#F16363;">${i.front} psi</strong> / rear <strong style="color:#F16363;">${i.rear} psi</strong></p>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Adjust by condition</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;background:rgba(255,255,255,0.03);border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <thead><tr style="background:rgba(255,255,255,0.05);">
        <th style="padding:10px 12px;text-align:left;color:#9ca3af;font-weight:500;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Conditions</th>
        <th style="padding:10px 12px;text-align:right;color:#9ca3af;font-weight:500;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Front</th>
        <th style="padding:10px 12px;text-align:right;color:#9ca3af;font-weight:500;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Rear</th>
      </tr></thead>
      <tbody>
        <tr><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#FAFAFA;">Dry road, smooth tarmac</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;">${dryFront} psi</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;">${dryRear} psi</td></tr>
        <tr><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#FAFAFA;">Wet road</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;">${wetFront} psi</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;">${wetRear} psi</td></tr>
        <tr><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#FAFAFA;">Gravel / broken tarmac</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;">${gravelFront} psi</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;">${gravelRear} psi</td></tr>
        <tr><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#FAFAFA;">Winter / cold + grit</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;">${winterFront} psi</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;">${winterRear} psi</td></tr>
      </tbody>
    </table>

    ${tubelessNote}

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">How to tune by feel</h2>
    <ol style="padding-left:20px;margin:0 0 24px;color:#FAFAFA;">
      <li style="margin-bottom:8px;line-height:1.55;">Start at the number above. Ride your usual route.</li>
      <li style="margin-bottom:8px;line-height:1.55;">Bike skittish in corners? Drop 2 psi.</li>
      <li style="margin-bottom:8px;line-height:1.55;">Feeling every pebble through the bars? Drop 3-4 psi.</li>
      <li style="margin-bottom:8px;line-height:1.55;">Tyre bottoming out on potholes (rim strikes)? Add 3 psi.</li>
      <li style="line-height:1.55;">Every real-world change &gt; 5°C changes pressure by ~1 psi. Check before hard rides.</li>
    </ol>

    ${softCoachingCta()}
  `;
  return {
    subject: `Your tyre pressure setup: ${dryFront}/${dryRear} psi`,
    html: wrap(`Your tyre setup, ${i.tyreWidth}mm`, "Pressure for dry, wet, gravel, winter — plus a quick tuning guide.", body),
    beehiivTag: "tool-tyre-pressure-report",
    beehiivFields: { tool: "tyre-pressure", tyre_width_mm: i.tyreWidth, front_psi: i.front, rear_psi: i.rear },
  };
}

/* ============================================================ */
/* Race Weight report                                           */
/* ============================================================ */

interface RaceWeightInputs {
  currentWeight: number;
  bodyFat: number;
  height: number;
  gender: "male" | "female";
  eventType: string;
  targetWeightMin: number;
  targetWeightMax: number;
  targetBfMin: number;
  targetBfMax: number;
  weeksToTarget: number;
  approach: string;
  name?: string;
}

function generateRaceWeightReport(i: RaceWeightInputs): ReportOutput {
  const nameLine = i.name ? `<p style="color:#FAFAFA;font-size:15px;margin:0 0 16px;">${escapeHtml(i.name.split(" ")[0])} —</p>` : "";
  const weeklyLossKg = Math.round(i.currentWeight * 0.005 * 10) / 10;
  const proteinLow = Math.round(i.currentWeight * 1.6);
  const proteinHigh = Math.round(i.currentWeight * 2.2);
  const timelineText = i.weeksToTarget === 0
    ? `You're already in your target range — hold position while you build power.`
    : `${i.weeksToTarget} weeks at a safe ${weeklyLossKg} kg/week pace. That's ${Math.round(i.currentWeight * 0.005 * 100) / 100}% of body weight — the limit before you start losing training quality.`;

  const body = `
    ${nameLine}
    <p style="color:#FAFAFA;font-size:15px;margin:0 0 6px;">Currently: ${i.currentWeight} kg @ ${i.bodyFat}% body fat</p>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 24px;">Target: <strong style="color:#F16363;">${i.targetWeightMin}–${i.targetWeightMax} kg</strong> (${i.targetBfMin}–${i.targetBfMax}% body fat)</p>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Your timeline</h2>
    <p style="color:#FAFAFA;font-size:15px;margin:0 0 16px;line-height:1.5;">${timelineText}</p>

    <div style="padding:16px 18px;background:rgba(255,255,255,0.03);border-left:3px solid #F16363;border-radius:4px;margin:0 0 28px;">
      <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;font-weight:600;">THE APPROACH</p>
      <p style="color:#FAFAFA;font-size:14px;margin:0;line-height:1.5;">${escapeHtml(i.approach)}</p>
    </div>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Non-negotiables</h2>
    <ul style="padding-left:20px;margin:0 0 24px;color:#FAFAFA;">
      <li style="margin-bottom:10px;line-height:1.55;"><strong>Protein: ${proteinLow}–${proteinHigh}g per day.</strong> Cycling is a muscle-losing sport. Protein protects lean mass while you lose fat.</li>
      <li style="margin-bottom:10px;line-height:1.55;"><strong>Fuel your hard sessions.</strong> Never under-eat on training days. The deficit sits on rest days and easy-ride days only. "Fuel for the work required."</li>
      <li style="margin-bottom:10px;line-height:1.55;"><strong>Weigh in weekly, same day + time.</strong> Daily weigh-ins are noise; weekly trend is signal. Track it on a Sunday morning.</li>
      <li style="line-height:1.55;"><strong>Stop if training quality drops.</strong> Power numbers falling, getting sick, disordered thinking about food — these are STOP signals. Not "push through" signals.</li>
    </ul>

    <p style="color:#FAFAFA;font-size:14px;margin:0 0 8px;">Further reading:</p>
    <ul style="padding-left:20px;margin:0 0 28px;color:#F16363;font-size:14px;">
      <li style="margin-bottom:4px;"><a href="https://roadmancycling.com/blog/cycling-weight-loss-fuel-for-the-work-required" style="color:#F16363;">Fuel for the work required</a></li>
      <li style="margin-bottom:4px;"><a href="https://roadmancycling.com/blog/cycling-power-to-weight-ratio-guide" style="color:#F16363;">Power-to-weight ratio: the honest version</a></li>
    </ul>

    ${softCoachingCta()}
  `;
  return {
    subject: `Your race weight plan: ${i.targetWeightMin}–${i.targetWeightMax} kg in ${i.weeksToTarget || 0} wks`,
    html: wrap(`Your race weight target`, `${i.targetWeightMin}–${i.targetWeightMax} kg range, ${i.weeksToTarget || 0} weeks at safe pace, protein + fuelling rules.`, body),
    beehiivTag: "tool-race-weight-report",
    beehiivFields: {
      tool: "race-weight",
      target_min_kg: i.targetWeightMin,
      target_max_kg: i.targetWeightMax,
      weeks_to_target: i.weeksToTarget,
      event_type: i.eventType,
    },
  };
}

/* ============================================================ */
/* Energy Availability report                                   */
/* ============================================================ */

interface EnergyAvailabilityInputs {
  weight: number;
  bodyFat: number;
  calories: number;
  hours: number;
  intensity: "low" | "moderate" | "high";
  ea: number;
  risk: "optimal" | "concern" | "high-risk";
  fatFreeMass: number;
  exerciseExpenditure: number;
  interpretation: string;
  name?: string;
}

function generateEnergyAvailabilityReport(i: EnergyAvailabilityInputs): ReportOutput {
  const nameLine = i.name ? `<p style="color:#FAFAFA;font-size:15px;margin:0 0 16px;">${escapeHtml(i.name.split(" ")[0])} —</p>` : "";
  const riskColor = i.risk === "optimal" ? "#22C55E" : i.risk === "concern" ? "#F59E0B" : "#EF4444";
  const riskLabel = i.risk === "optimal" ? "OPTIMAL" : i.risk === "concern" ? "AT RISK" : "HIGH RISK";

  // Calorie targets — EA = (intake - exercise) / FFM
  const targetOptimal = Math.round(i.fatFreeMass * 45 + i.exerciseExpenditure);
  const targetCurrent = Math.round(i.calories);
  const gapCals = targetOptimal - targetCurrent;
  const gapLine = gapCals > 0
    ? `You're running a ${gapCals} kcal/day shortfall vs the optimal target. Add this back in — ideally around training.`
    : gapCals < -300
      ? `You're eating ${Math.abs(gapCals)} kcal/day above the optimal EA target. Not harmful; just means you're in a slight surplus.`
      : `You're close to optimal. No major shift needed.`;

  const body = `
    ${nameLine}
    <div style="text-align:center;padding:20px 0 24px;">
      <p style="color:#9ca3af;font-size:12px;letter-spacing:2px;margin:0 0 8px;">YOUR EA SCORE</p>
      <p style="font-size:48px;color:${riskColor};font-weight:700;margin:0;line-height:1;">${i.ea.toFixed(0)}</p>
      <p style="color:#9ca3af;font-size:13px;margin:6px 0 12px;">kcal / kg fat-free mass / day</p>
      <span style="display:inline-block;padding:4px 12px;background:${riskColor}26;color:${riskColor};border-radius:999px;font-size:11px;letter-spacing:1.5px;font-weight:600;">${riskLabel}</span>
    </div>

    <div style="padding:16px 18px;background:rgba(255,255,255,0.03);border-left:3px solid ${riskColor};border-radius:4px;margin:0 0 24px;">
      <p style="color:#FAFAFA;font-size:14px;margin:0;line-height:1.55;">${escapeHtml(i.interpretation)}</p>
    </div>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">The numbers</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;background:rgba(255,255,255,0.03);border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        <tr><td style="padding:10px 12px;color:#9ca3af;">Current intake</td><td style="padding:10px 12px;text-align:right;color:#FAFAFA;">${targetCurrent} kcal/day</td></tr>
        <tr><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#9ca3af;">Exercise expenditure</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;">${Math.round(i.exerciseExpenditure)} kcal/day avg</td></tr>
        <tr><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#9ca3af;">Fat-free mass</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;">${i.fatFreeMass.toFixed(1)} kg</td></tr>
        <tr><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#9ca3af;">Optimal target</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#F16363;font-weight:600;">${targetOptimal} kcal/day</td></tr>
      </tbody>
    </table>

    <p style="color:#FAFAFA;font-size:14px;margin:0 0 20px;line-height:1.55;">${gapLine}</p>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">What to watch</h2>
    <ul style="padding-left:20px;margin:0 0 24px;color:#FAFAFA;">
      <li style="margin-bottom:8px;line-height:1.55;">Chronic low EA affects hormones (testosterone, thyroid, bone density) in men AND women. It's not a female-only issue.</li>
      <li style="margin-bottom:8px;line-height:1.55;">Classic signs: lost libido, disturbed sleep, unexplained fatigue, frequent illness, loss of menstrual cycle. Any combination &gt; 2 weeks = see a sports physician.</li>
      <li style="line-height:1.55;">Fuel AROUND training — 30 min pre, during (after 60 min), and within 2 hours post. Carbs + protein.</li>
    </ul>

    ${softCoachingCta()}
  `;
  return {
    subject: `Your energy availability score: ${i.ea.toFixed(0)} kcal/kg FFM`,
    html: wrap(`Your EA score: ${i.ea.toFixed(0)}`, `${riskLabel}. Target ${targetOptimal} kcal/day.`, body),
    beehiivTag: "tool-energy-availability-report",
    beehiivFields: {
      tool: "energy-availability",
      ea_score: Math.round(i.ea),
      ea_risk: i.risk,
      target_calories: targetOptimal,
    },
  };
}

/* ============================================================ */
/* In-ride Fuelling report                                      */
/* ============================================================ */

interface FuellingInputs {
  duration: number;           // minutes
  sessionType: string;
  watts: number;
  weight: number;
  gutTraining: string;
  carbsPerHour: number;
  totalCarbs: number;
  fluidPerHour: number;
  totalFluid: number;
  sodiumPerHour: number;
  glucosePerHour: number;
  fructosePerHour: number;
  strategy: string[];
  feedingInterval: number;
  startFuellingAt: number;
  heatCategory: "cool" | "mild" | "warm" | "hot";
  intensityLabel: string;
  name?: string;
}

function generateFuellingReport(i: FuellingInputs): ReportOutput {
  const nameLine = i.name ? `<p style="color:#FAFAFA;font-size:15px;margin:0 0 16px;">${escapeHtml(i.name.split(" ")[0])} —</p>` : "";
  const hours = i.duration / 60;

  const strategyList = i.strategy.map((s) => `<li style="margin-bottom:8px;line-height:1.5;color:#FAFAFA;">${escapeHtml(s)}</li>`).join("");

  // Generate an hour-by-hour schedule
  const timeline: string[] = [];
  if (i.startFuellingAt > 0) {
    timeline.push(`<strong>0–${i.startFuellingAt} min:</strong> ride in, water as needed, no carbs.`);
  }
  const carbsPerFeed = Math.round(i.carbsPerHour / (60 / i.feedingInterval));
  const feedsPerHour = Math.round(60 / i.feedingInterval);
  for (let hr = Math.max(1, Math.ceil(i.startFuellingAt / 60)); hr <= Math.ceil(hours); hr++) {
    const endMin = Math.min(hr * 60, i.duration);
    const startMin = Math.max(i.startFuellingAt, (hr - 1) * 60);
    if (endMin <= startMin) continue;
    timeline.push(
      `<strong>${startMin}–${endMin} min:</strong> ${feedsPerHour}× feeds of ~${carbsPerFeed}g carbs every ${i.feedingInterval} min. Sip ~${Math.round(i.fluidPerHour / 4)}ml fluid every 15 min.`,
    );
  }

  const body = `
    ${nameLine}
    <p style="color:#FAFAFA;font-size:15px;margin:0 0 6px;">Session: ${hours.toFixed(1)} hr ${escapeHtml(i.intensityLabel)} @ ${i.watts}w · ${escapeHtml(i.heatCategory)} conditions</p>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 24px;">Target: <strong style="color:#F16363;">${i.carbsPerHour}g carbs/hr</strong> · <strong style="color:#F16363;">${i.fluidPerHour}ml fluid/hr</strong> · <strong style="color:#F16363;">${i.sodiumPerHour}mg sodium/hr</strong></p>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Hour-by-hour plan</h2>
    <ul style="padding-left:0;list-style:none;margin:0 0 24px;">
      ${timeline.map(t => `<li style="padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:6px;margin-bottom:6px;color:#9ca3af;font-size:14px;line-height:1.5;">${t}</li>`).join("")}
    </ul>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Totals to pack</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;background:rgba(255,255,255,0.03);border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        <tr><td style="padding:10px 12px;color:#9ca3af;">Carbohydrate</td><td style="padding:10px 12px;text-align:right;color:#FAFAFA;font-weight:600;">${i.totalCarbs}g total</td></tr>
        <tr><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#9ca3af;">Fluid</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;font-weight:600;">${(i.totalFluid / 1000).toFixed(1)} L total</td></tr>
        <tr><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#9ca3af;">Glucose / Fructose split</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;">${i.glucosePerHour}g / ${i.fructosePerHour}g per hour</td></tr>
      </tbody>
    </table>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Strategy notes</h2>
    <ul style="padding-left:20px;margin:0 0 24px;">${strategyList}</ul>

    <p style="color:#FAFAFA;font-size:14px;margin:0 0 8px;">Go deeper:</p>
    <ul style="padding-left:20px;margin:0 0 28px;color:#F16363;font-size:14px;">
      <li style="margin-bottom:4px;"><a href="https://roadmancycling.com/blog/cycling-in-ride-nutrition-guide" style="color:#F16363;">In-ride nutrition complete guide</a></li>
      <li><a href="https://roadmancycling.com/blog/cycling-hydration-guide" style="color:#F16363;">Hydration: how much, when, what</a></li>
    </ul>

    ${softCoachingCta()}
  `;
  return {
    subject: `Your ${hours.toFixed(1)}hr fuelling plan: ${i.carbsPerHour}g/hr`,
    html: wrap(`Your ${hours.toFixed(1)}hr fuelling plan`, `${i.totalCarbs}g carbs · ${(i.totalFluid / 1000).toFixed(1)}L fluid · ${i.sodiumPerHour}mg sodium/hr.`, body),
    beehiivTag: "tool-fuelling-report",
    beehiivFields: {
      tool: "fuelling",
      duration_min: i.duration,
      carbs_per_hour: i.carbsPerHour,
      total_carbs_g: i.totalCarbs,
      heat_category: i.heatCategory,
    },
  };
}

/* ============================================================ */
/* Shock Pressure (MTB) report                                  */
/* ============================================================ */

interface ShockPressureInputs {
  weight: number;         // kg
  bikeWeight: number;     // kg
  ridingStyle: string;    // xc / trail / enduro / dh
  terrain: string;
  tyreCasing: string;
  forkBrand: string;
  forkModel: string;
  shockBrand: string;
  shockModel: string;
  forkPsi?: number;
  shockPsi?: number;
  forkRebound?: number;
  shockRebound?: number;
  tyreFrontPsi?: number;
  tyreRearPsi?: number;
  name?: string;
}

function generateShockPressureReport(i: ShockPressureInputs): ReportOutput {
  const nameLine = i.name ? `<p style="color:#FAFAFA;font-size:15px;margin:0 0 16px;">${escapeHtml(i.name.split(" ")[0])} —</p>` : "";
  const hasFork = typeof i.forkPsi === "number" && i.forkPsi > 0;
  const hasShock = typeof i.shockPsi === "number" && i.shockPsi > 0;
  const hasTyres = typeof i.tyreFrontPsi === "number";

  const rows: string[] = [];
  if (hasFork) {
    rows.push(`<tr><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#9ca3af;">Fork (${escapeHtml(i.forkBrand)} ${escapeHtml(i.forkModel)})</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;font-variant-numeric:tabular-nums;"><strong style="color:#F16363;">${i.forkPsi} psi</strong>${i.forkRebound !== undefined ? ` · rebound ${i.forkRebound}` : ""}</td></tr>`);
  }
  if (hasShock) {
    rows.push(`<tr><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#9ca3af;">Shock (${escapeHtml(i.shockBrand)} ${escapeHtml(i.shockModel)})</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;font-variant-numeric:tabular-nums;"><strong style="color:#F16363;">${i.shockPsi} psi</strong>${i.shockRebound !== undefined ? ` · rebound ${i.shockRebound}` : ""}</td></tr>`);
  }
  if (hasTyres) {
    rows.push(`<tr><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);color:#9ca3af;">Tyres</td><td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;color:#FAFAFA;font-variant-numeric:tabular-nums;">front <strong style="color:#F16363;">${i.tyreFrontPsi} psi</strong> · rear <strong style="color:#F16363;">${i.tyreRearPsi} psi</strong></td></tr>`);
  }

  const body = `
    ${nameLine}
    <p style="color:#FAFAFA;font-size:15px;margin:0 0 6px;">Setup: ${i.weight} kg rider · ${escapeHtml(i.ridingStyle)} · ${escapeHtml(i.terrain)} terrain · ${escapeHtml(i.tyreCasing)} casing</p>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 24px;">Your baseline setup — dial from here.</p>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Your setup</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;background:rgba(255,255,255,0.03);border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>${rows.join("")}</tbody>
    </table>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">How to tune</h2>
    <ol style="padding-left:20px;margin:0 0 24px;color:#FAFAFA;">
      <li style="margin-bottom:10px;line-height:1.55;"><strong>Set sag first.</strong> Gear up, bounce, sit on the bike centred. Fork 15–25% sag (XC lower, enduro higher). Shock 25–30%.</li>
      <li style="margin-bottom:10px;line-height:1.55;"><strong>Rebound: control the return.</strong> Start in the middle of the range. Too fast = bouncy. Too slow = packing down on repeated hits.</li>
      <li style="margin-bottom:10px;line-height:1.55;"><strong>Compression: for big hits only.</strong> Leave LSC/HSC in the middle and only adjust after you've established air pressure and rebound on real terrain.</li>
      <li style="line-height:1.55;"><strong>Re-check every 4 weeks.</strong> Seals wear, air migrates, and seasonal temp shifts change feel. A 5-minute sag check beats guessing.</li>
    </ol>

    <h2 style="color:#F16363;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Seasonal notes</h2>
    <ul style="padding-left:20px;margin:0 0 24px;color:#FAFAFA;">
      <li style="margin-bottom:8px;line-height:1.5;">Winter / wet: drop 1–2 psi front tyre for traction; fork/shock can go slightly firmer for energy return.</li>
      <li style="margin-bottom:8px;line-height:1.5;">Summer / dry hardpack: a psi firmer fork helps cornering precision.</li>
      <li style="line-height:1.5;">Bike park / shuttle days: +5–10% pressure front AND rear, faster rebound. You're hitting stuff hard.</li>
    </ul>

    ${softCoachingCta()}
  `;
  return {
    subject: `Your MTB setup: ${hasFork ? `${i.forkPsi} psi fork` : "suspension"}${hasShock ? ` / ${i.shockPsi} psi shock` : ""}`,
    html: wrap(`Your MTB suspension setup`, `${escapeHtml(i.ridingStyle)} · ${escapeHtml(i.terrain)} · ${i.weight} kg rider.`, body),
    beehiivTag: "tool-shock-pressure-report",
    beehiivFields: {
      tool: "shock-pressure",
      riding_style: i.ridingStyle,
      terrain: i.terrain,
      ...(hasFork && i.forkPsi !== undefined ? { fork_psi: i.forkPsi } : {}),
      ...(hasShock && i.shockPsi !== undefined ? { shock_psi: i.shockPsi } : {}),
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
  const name = typeof inputs.name === "string" ? inputs.name : undefined;

  switch (tool) {
    case "ftp-zones": {
      const ftp = Number(inputs.ftp);
      if (!ftp || ftp < 50 || ftp > 600) return null;
      return generateFtpZonesReport({ ftp, name });
    }
    case "tyre-pressure": {
      const riderWeight = Number(inputs.riderWeight);
      const tyreWidth = Number(inputs.tyreWidth);
      const front = Number(inputs.front);
      const rear = Number(inputs.rear);
      if (!riderWeight || !tyreWidth || !front || !rear) return null;
      return generateTyrePressureReport({
        riderWeight,
        bikeWeight: Number(inputs.bikeWeight) || 8,
        tyreWidth,
        rimWidth: Number(inputs.rimWidth) || 19,
        surface: (inputs.surface as TyrePressureInputs["surface"]) || "smooth",
        tubeType: (inputs.tubeType as TyrePressureInputs["tubeType"]) || "tubeless",
        front,
        rear,
        name,
      });
    }
    case "race-weight": {
      const currentWeight = Number(inputs.currentWeight);
      const targetWeightMin = Number(inputs.targetWeightMin);
      const targetWeightMax = Number(inputs.targetWeightMax);
      if (!currentWeight || !targetWeightMin || !targetWeightMax) return null;
      return generateRaceWeightReport({
        currentWeight,
        bodyFat: Number(inputs.bodyFat) || 0,
        height: Number(inputs.height) || 0,
        gender: (inputs.gender as "male" | "female") || "male",
        eventType: String(inputs.eventType || "road-race"),
        targetWeightMin,
        targetWeightMax,
        targetBfMin: Number(inputs.targetBfMin) || 0,
        targetBfMax: Number(inputs.targetBfMax) || 0,
        weeksToTarget: Number(inputs.weeksToTarget) || 0,
        approach: String(inputs.approach || ""),
        name,
      });
    }
    case "energy-availability": {
      const ea = Number(inputs.ea);
      const fatFreeMass = Number(inputs.fatFreeMass);
      if (!ea || !fatFreeMass) return null;
      return generateEnergyAvailabilityReport({
        weight: Number(inputs.weight) || 0,
        bodyFat: Number(inputs.bodyFat) || 0,
        calories: Number(inputs.calories) || 0,
        hours: Number(inputs.hours) || 0,
        intensity: (inputs.intensity as EnergyAvailabilityInputs["intensity"]) || "moderate",
        ea,
        risk: (inputs.risk as EnergyAvailabilityInputs["risk"]) || "optimal",
        fatFreeMass,
        exerciseExpenditure: Number(inputs.exerciseExpenditure) || 0,
        interpretation: String(inputs.interpretation || ""),
        name,
      });
    }
    case "fuelling": {
      const duration = Number(inputs.duration);
      const carbsPerHour = Number(inputs.carbsPerHour);
      if (!duration || !carbsPerHour) return null;
      return generateFuellingReport({
        duration,
        sessionType: String(inputs.sessionType || "endurance"),
        watts: Number(inputs.watts) || 0,
        weight: Number(inputs.weight) || 0,
        gutTraining: String(inputs.gutTraining || "some"),
        carbsPerHour,
        totalCarbs: Number(inputs.totalCarbs) || carbsPerHour * (duration / 60),
        fluidPerHour: Number(inputs.fluidPerHour) || 0,
        totalFluid: Number(inputs.totalFluid) || 0,
        sodiumPerHour: Number(inputs.sodiumPerHour) || 0,
        glucosePerHour: Number(inputs.glucosePerHour) || 0,
        fructosePerHour: Number(inputs.fructosePerHour) || 0,
        strategy: Array.isArray(inputs.strategy) ? (inputs.strategy as string[]) : [],
        feedingInterval: Number(inputs.feedingInterval) || 20,
        startFuellingAt: Number(inputs.startFuellingAt) || 45,
        heatCategory: (inputs.heatCategory as FuellingInputs["heatCategory"]) || "mild",
        intensityLabel: String(inputs.intensityLabel || "Endurance"),
        name,
      });
    }
    case "shock-pressure": {
      const weight = Number(inputs.weight);
      if (!weight) return null;
      return generateShockPressureReport({
        weight,
        bikeWeight: Number(inputs.bikeWeight) || 14,
        ridingStyle: String(inputs.ridingStyle || "trail"),
        terrain: String(inputs.terrain || "mixed"),
        tyreCasing: String(inputs.tyreCasing || "trail_casing"),
        forkBrand: String(inputs.forkBrand || ""),
        forkModel: String(inputs.forkModel || ""),
        shockBrand: String(inputs.shockBrand || ""),
        shockModel: String(inputs.shockModel || ""),
        forkPsi: typeof inputs.forkPsi === "number" ? inputs.forkPsi : undefined,
        shockPsi: typeof inputs.shockPsi === "number" ? inputs.shockPsi : undefined,
        forkRebound: typeof inputs.forkRebound === "number" ? inputs.forkRebound : undefined,
        shockRebound: typeof inputs.shockRebound === "number" ? inputs.shockRebound : undefined,
        tyreFrontPsi: typeof inputs.tyreFrontPsi === "number" ? inputs.tyreFrontPsi : undefined,
        tyreRearPsi: typeof inputs.tyreRearPsi === "number" ? inputs.tyreRearPsi : undefined,
        name,
      });
    }
    default:
      return null;
  }
}
