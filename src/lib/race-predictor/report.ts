// Race Report generator: turns a saved prediction into the paid HTML report.
// Dispatched from the paid-reports generator when productSlug === "report_race".

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { predictions } from "@/lib/db/schema";
import {
  generateSecureToken,
  getPaidReportById,
  markDelivered,
  markFailed,
  markGenerated,
  markGenerating,
} from "@/lib/paid-reports/reports";
import { getOrderById } from "@/lib/paid-reports/orders";
import { getProductBySlug } from "@/lib/paid-reports/products";
import { logCrmSync } from "@/lib/paid-reports/crm-sync-log";
import { sendReportEmail } from "@/lib/paid-reports/delivery";
import { loadById as loadRiderById } from "@/lib/rider-profile/store";
import {
  PAID_REPORT_EVENTS,
  recordPaidReportServerEvent,
} from "@/lib/analytics/paid-report-events";
import { getCourseById, getPredictionById } from "./store";
import { runScenarioComparison } from "./scenarios";
import type { Climb, Course, Environment, RiderProfile } from "./types";

const GENERATOR_VERSION = "race-v1.0.0";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  "https://roadmancycling.com";

const PURPLE = "#4C1273";
const CORAL = "#F16363";
const CHARCOAL = "#252526";
const OFFWHITE = "#FAFAFA";
const MID_GREY = "#545559";

interface PredictionForReport {
  id: number;
  slug: string;
  riderProfileId: number | null;
  courseId: number | null;
  rider: RiderProfile;
  environment: Environment;
  predictedTimeS: number;
  confidenceLowS: number;
  confidenceHighS: number;
  averagePower: number | null;
  normalizedPower: number | null;
  variabilityIndex: number | null;
  pacingPlan: number[] | null;
  resultSummary: Record<string, unknown> | null;
  course: Course | null;
}

/**
 * End-to-end race report generation + delivery. Mirrors the diagnostic
 * report pipeline (generating → generated → delivered) but renders an
 * HTML report from the saved prediction rather than from a tool_result.
 *
 * No PDF in v1 — the email links to the secure web view. Adding a
 * react-pdf template later is a drop-in replacement for `webReportHtml`.
 */
export async function generateAndDeliverRaceReport(
  paidReportId: number,
): Promise<void> {
  try {
    const report = await getPaidReportById(paidReportId);
    if (!report) {
      console.error(`[race-report/generator] report ${paidReportId} not found`);
      return;
    }
    if (report.status === "delivered" || report.status === "generated") {
      return;
    }
    const order = await getOrderById(report.orderId);
    if (!order) {
      await markFailed(paidReportId, "order_missing");
      return;
    }
    if (order.status !== "paid") {
      await markFailed(paidReportId, `order_not_paid:${order.status}`);
      return;
    }
    const product = await getProductBySlug(report.productSlug);
    if (!product) {
      await markFailed(paidReportId, "product_inactive");
      return;
    }

    // Find the prediction by reverse FK paid_report_id → predictions.
    const [predictionRow] = await db
      .select()
      .from(predictions)
      .where(eq(predictions.paidReportId, paidReportId))
      .limit(1);
    if (!predictionRow) {
      await markFailed(paidReportId, "prediction_missing");
      return;
    }

    const prediction = await getPredictionById(predictionRow.id);
    if (!prediction) {
      await markFailed(paidReportId, "prediction_load_failed");
      return;
    }

    const course =
      prediction.courseData ??
      (prediction.courseId ? (await getCourseById(prediction.courseId))?.courseData ?? null : null);

    const rider = prediction.riderProfileId
      ? await loadRiderById(prediction.riderProfileId)
      : null;

    await markGenerating(paidReportId, GENERATOR_VERSION);

    const html = renderRaceReportHtml({
      id: prediction.id,
      slug: prediction.slug,
      riderProfileId: prediction.riderProfileId,
      courseId: prediction.courseId,
      rider: prediction.riderInputs,
      environment: prediction.environmentInputs,
      predictedTimeS: prediction.predictedTimeS,
      confidenceLowS: prediction.confidenceLowS,
      confidenceHighS: prediction.confidenceHighS,
      averagePower: prediction.averagePower,
      normalizedPower: prediction.normalizedPower,
      variabilityIndex: prediction.variabilityIndex,
      pacingPlan: prediction.pacingPlan,
      resultSummary: prediction.resultSummary,
      course,
    });

    const { token, hash } = generateSecureToken();

    await markGenerated({
      reportId: paidReportId,
      pdfUrl: null,
      webReportHtml: html,
      pageCount: product.pageCountTarget ?? 16,
      tokenHash: hash,
    });

    // Mark the prediction itself as paid now that the report is on the way.
    await db
      .update(predictions)
      .set({ isPaid: true })
      .where(eq(predictions.id, predictionRow.id));

    await recordPaidReportServerEvent({
      name: PAID_REPORT_EVENTS.GENERATED,
      page: `/predict/${prediction.slug}`,
      email: report.email,
      productSlug: product.slug,
      reportId: paidReportId,
      orderId: report.orderId,
    });

    const viewHref = `${BASE_URL}/reports/${product.slug}/view/${token}`;
    const emailHtml = renderRaceDeliveryEmailHtml({
      firstName: rider?.firstName ?? null,
      viewHref,
      predictedTimeS: prediction.predictedTimeS,
      confidenceLowS: prediction.confidenceLowS,
      confidenceHighS: prediction.confidenceHighS,
      averagePower: prediction.averagePower,
      courseName: course?.name ?? "your course",
    });

    const send = await sendReportEmail({
      to: report.email,
      subject: `Your Race Report for ${course?.name ?? "your course"} is ready`,
      html: emailHtml,
    });
    await markDelivered(paidReportId);
    await recordPaidReportServerEvent({
      name: PAID_REPORT_EVENTS.DELIVERED,
      page: `/predict/${prediction.slug}`,
      email: report.email,
      productSlug: product.slug,
      reportId: paidReportId,
      orderId: report.orderId,
    });
    await logCrmSync({
      email: report.email,
      target: "resend",
      operation: "race_report_delivered",
      payload: { paidReportId, predictionSlug: prediction.slug, resendId: send.id },
      status: "success",
      relatedTable: "paid_reports",
      relatedId: paidReportId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[race-report/generator] failed for report ${paidReportId}:`, message);
    await markFailed(paidReportId, message.slice(0, 255));
    await recordPaidReportServerEvent({
      name: PAID_REPORT_EVENTS.FAILED,
      page: `/reports/`,
      reportId: paidReportId,
      meta: { message: message.slice(0, 200) },
    });
    await logCrmSync({
      email: "",
      target: "resend",
      operation: "race_report_failed",
      payload: { paidReportId, message },
      status: "failed",
      error: message,
      relatedTable: "paid_reports",
      relatedId: paidReportId,
    }).catch(() => {});
  }
}

// ---------------- HTML rendering ----------------

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function climbCategoryLabel(c: Climb): string {
  const label = {
    cat4: "Cat 4",
    cat3: "Cat 3",
    cat2: "Cat 2",
    cat1: "Cat 1",
    hc: "HC",
  }[c.category];
  return label ?? "Climb";
}

function formatSignedDuration(seconds: number): string {
  const sign = seconds < 0 ? "-" : "+";
  return `${sign}${formatDuration(Math.abs(seconds))}`;
}

function formatPower(watts: number | null | undefined): string {
  return typeof watts === "number" && Number.isFinite(watts)
    ? `${Math.round(watts)} W`
    : "—";
}

function powerZone(watts: number, ftp: number): string {
  const pct = watts / Math.max(1, ftp);
  if (pct < 0.56) return "Z1";
  if (pct < 0.76) return "Z2";
  if (pct < 0.91) return "Tempo";
  if (pct < 1.06) return "Threshold";
  return "Over target";
}

function deriveFtp(rider: RiderProfile): number {
  return Math.round(rider.powerProfile.p20min / 1.05);
}

function surfaceLabel(surface: string | undefined): string {
  if (!surface) return "mixed road";
  return surface.replace(/_/g, " ");
}

interface CourseSlice {
  name: string;
  startKm: number;
  endKm: number;
  avgPower: number;
  avgGradientPct: number;
  note: string;
}

function buildCourseSlices(
  course: Course,
  pacingPlan: number[] | null,
  ftp: number,
): CourseSlice[] {
  if (!pacingPlan || pacingPlan.length === 0) return [];
  const total = course.totalDistance;
  const cuts = [0, 0.2, 0.45, 0.7, 0.9, 1].map((x) => x * total);
  const labels = ["Settle in", "First selection", "Middle third", "Make it count", "Finish"];
  let distanceBefore = 0;

  return labels
    .map((name, i) => {
      const start = cuts[i];
      const end = cuts[i + 1];
      let dist = 0;
      let weightedPower = 0;
      let weightedGradient = 0;

      for (const [idx, seg] of course.segments.entries()) {
        const segStart = distanceBefore;
        const segEnd = distanceBefore + seg.distance;
        distanceBefore = segEnd;
        const overlap = Math.max(0, Math.min(segEnd, end) - Math.max(segStart, start));
        if (overlap <= 0) continue;
        dist += overlap;
        weightedPower += (pacingPlan[idx] ?? pacingPlan[pacingPlan.length - 1]) * overlap;
        weightedGradient += Math.tan(seg.gradient) * 100 * overlap;
      }
      distanceBefore = 0;
      if (dist <= 0) return null;
      const avgPower = weightedPower / dist;
      const avgGradientPct = weightedGradient / dist;
      const note =
        avgGradientPct > 3
          ? "Climbing work. Keep it smooth, no hero spikes."
          : avgGradientPct < -2
            ? "Free speed. Eat, drink, and keep the pressure light."
            : avgPower > ftp * 0.86
              ? "High-value riding. Stay aero and keep pressure steady."
              : "Controlled endurance. Save matches for later.";
      return {
        name,
        startKm: start / 1000,
        endKm: end / 1000,
        avgPower,
        avgGradientPct,
        note,
      };
    })
    .filter((x): x is CourseSlice => Boolean(x));
}

interface ClimbPlan {
  climb: Climb;
  avgPower: number | null;
  advice: string;
}

function buildClimbPlans(
  course: Course,
  pacingPlan: number[] | null,
  ftp: number,
): ClimbPlan[] {
  return course.climbs.slice(0, 8).map((climb) => {
    const slice = pacingPlan?.slice(climb.startSegmentIndex, climb.endSegmentIndex + 1) ?? [];
    const avgPower =
      slice.length > 0 ? slice.reduce((sum, watts) => sum + watts, 0) / slice.length : null;
    const gradePct = Math.tan(climb.averageGradient) * 100;
    const advice =
      gradePct >= 7
        ? "Stay seated, cap the surges, and let riders come back after the steepest ramps."
        : climb.length > 10_000
          ? "Ride the first half like it is too easy. This is where over-pacing gets expensive."
          : avgPower && avgPower > ftp
            ? "Short enough to lift, but only if you can settle immediately over the top."
            : "Keep it under control and carry speed over the crest.";
    return { climb, avgPower, advice };
  });
}

function buildSurfaceSummary(course: Course): string {
  const counts = new Map<string, number>();
  for (const segment of course.segments) {
    counts.set(segment.surface ?? "mixed road", (counts.get(segment.surface ?? "mixed road") ?? 0) + segment.distance);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([surface, metres]) => `${surfaceLabel(surface)} ${((metres / course.totalDistance) * 100).toFixed(0)}%`)
    .join(" · ");
}

function buildScenarioRows(
  course: Course,
  rider: RiderProfile,
  environment: Environment,
  pacingPlan: number[] | null,
): string {
  if (!pacingPlan || pacingPlan.length === 0) return "";
  const scenarios = runScenarioComparison({
    course,
    rider,
    environment,
    pacing: pacingPlan,
    scenarios: [
      { name: "+10 W sustainable", pacingPatch: { multiplier: 1.04 } },
      { name: "-1 kg system mass", riderPatch: { bodyMass: Math.max(40, rider.bodyMass - 1) } },
      { name: "Cleaner aero position", riderPatch: { cda: Math.max(0.18, rider.cda - 0.015) } },
      { name: "Faster tyres / better surface setup", riderPatch: { crr: Math.max(0.0022, rider.crr - 0.0005) } },
      { name: "+3 m/s headwind", environmentPatch: { windSpeed: environment.windSpeed + 3, windDirection: Math.PI / 2 } },
    ],
  });
  return scenarios
    .map((s) => {
      const faster = s.totalTimeDelta < 0;
      return `<tr><td>${escape(s.name)}</td><td class="${faster ? "gain" : "loss"}">${formatSignedDuration(s.totalTimeDelta)}</td><td>${faster ? "Faster" : "Slower"}</td></tr>`;
    })
    .join("");
}

interface RenderHtmlArgs extends PredictionForReport {
  course: Course | null;
}

export function renderRaceReportHtml(p: RenderHtmlArgs): string {
  const course = p.course;
  const totalDistanceKm = course ? (course.totalDistance / 1000).toFixed(1) : "—";
  const totalGain = course ? Math.round(course.totalElevationGain) : "—";
  const insight = (p.resultSummary?.insight ?? null) as
    | { headline: string; body: string }
    | null;
  const ftp = deriveFtp(p.rider);
  const avgSpeed = course ? ((course.totalDistance / p.predictedTimeS) * 3.6).toFixed(1) : "—";
  const slices = course ? buildCourseSlices(course, p.pacingPlan, ftp) : [];
  const climbPlans = course ? buildClimbPlans(course, p.pacingPlan, ftp) : [];
  const scenarioRows = course
    ? buildScenarioRows(course, p.rider, p.environment, p.pacingPlan)
    : "";
  const fuellingNote = formatFuelling(p.predictedTimeS, p.averagePower ?? 0);
  const surfaceSummary = course ? buildSurfaceSummary(course) : "Course surface not supplied";

  const pacingRows = slices
    .map(
      (s) =>
        `<tr><td><strong>${escape(s.name)}</strong><br><span>${s.startKm.toFixed(0)}-${s.endKm.toFixed(0)} km</span></td><td>${Math.round(s.avgPower)} W<br><span>${powerZone(s.avgPower, ftp)}</span></td><td>${s.avgGradientPct.toFixed(1)}%</td><td>${escape(s.note)}</td></tr>`,
    )
    .join("");

  const climbRows = climbPlans
    .map(({ climb: c, avgPower, advice }) => {
      const grade = (Math.tan(c.averageGradient) * 100).toFixed(1);
      const length = (c.length / 1000).toFixed(1);
      const gain = Math.round(c.elevationGain);
      return `<tr><td>${climbCategoryLabel(c)}</td><td>${length} km<br><span>${gain} m gain</span></td><td>${grade}%</td><td>${formatPower(avgPower)}<br><span>${avgPower ? powerZone(avgPower, ftp) : "—"}</span></td><td>${escape(advice)}</td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Race Report — ${escape(course?.name ?? "your course")}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Work Sans", "Helvetica Neue", Arial, sans-serif; background: ${OFFWHITE}; color: ${CHARCOAL}; margin: 0; padding: 0; }
  .wrap { max-width: 860px; margin: 0 auto; padding: 34px 22px 72px; }
  h1 { font-family: "Bebas Neue", Impact, sans-serif; font-size: 52px; letter-spacing: 0.02em; line-height: .95; color: ${OFFWHITE}; margin: 0 0 8px; text-transform: uppercase; }
  h2 { font-size: 23px; color: ${PURPLE}; margin: 34px 0 12px; }
  h3 { font-size: 16px; margin: 22px 0 8px; }
  p { line-height: 1.55; }
  .kicker { color: ${CORAL}; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; font-weight: 700; }
  .lede { color: rgba(255,255,255,.78); font-size: 15px; margin: 0; }
  .hero { background: linear-gradient(135deg, ${PURPLE}, #210140); color: ${OFFWHITE}; padding: 30px; border-radius: 8px; margin: 0 0 24px; }
  .hero strong { font-size: 42px; display: block; margin-bottom: 4px; }
  .hero-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 22px; }
  .hero-stat { border: 1px solid rgba(255,255,255,.16); border-radius: 6px; padding: 12px; }
  .hero-stat span { display:block; color: rgba(255,255,255,.62); font-size: 11px; text-transform: uppercase; letter-spacing:.12em; }
  .hero-stat b { display:block; margin-top: 4px; font-size: 18px; }
  .insight { border-left: 4px solid ${CORAL}; padding: 14px 18px; background: white; margin: 22px 0; }
  .insight .headline { font-weight: 700; color: ${PURPLE}; margin: 0 0 6px; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th, td { padding: 10px 11px; text-align: left; border-bottom: 1px solid #ddd; vertical-align: top; }
  th { background: ${OFFWHITE}; color: ${MID_GREY}; font-weight: 600; }
  td span { color: ${MID_GREY}; font-size: 12px; }
  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
  .stat { background: white; padding: 12px; border-radius: 6px; }
  .stat-label { color: ${MID_GREY}; font-size: 12px; text-transform: uppercase; }
  .stat-value { font-size: 22px; font-weight: 700; color: ${CHARCOAL}; }
  .block { background: white; border-radius: 8px; padding: 18px; margin: 16px 0; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .gain { color: #0f7a45; font-weight: 700; }
  .loss { color: ${CORAL}; font-weight: 700; }
  .premium { background: #210140; color: ${OFFWHITE}; border-radius: 8px; padding: 22px; margin-top: 28px; }
  .premium h2 { color: ${OFFWHITE}; margin-top: 0; }
  .premium p { color: rgba(255,255,255,.78); }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #ddd; font-size: 13px; color: ${MID_GREY}; }
  .cta { background: ${CORAL}; color: white; padding: 14px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; margin-top: 16px; }
  @media (max-width: 700px) { .hero-grid, .two-col, .stat-grid { grid-template-columns: 1fr 1fr; } h1 { font-size: 42px; } }
</style>
</head>
<body>
<div class="wrap">
  <div class="hero">
    <div class="kicker">Roadman Race Report</div>
    <h1>${escape(course?.name ?? "Your course")}</h1>
    <p class="lede">The free prediction gave you the headline. This is the race-day plan: pacing, climbs, fuelling, surface cost, and the changes that actually move the finish time.</p>
    <div class="hero-grid">
      <div class="hero-stat"><span>Predicted finish</span><b>${formatDuration(p.predictedTimeS)}</b></div>
      <div class="hero-stat"><span>Confidence range</span><b>${formatDuration(p.confidenceLowS)}-${formatDuration(p.confidenceHighS)}</b></div>
      <div class="hero-stat"><span>Distance</span><b>${totalDistanceKm} km</b></div>
      <div class="hero-stat"><span>Elevation</span><b>${totalGain} m</b></div>
    </div>
  </div>

  ${
    insight
      ? `<div class="insight">
           <p class="headline">${escape(insight.headline)}</p>
           <p>${escape(insight.body)}</p>
         </div>`
      : ""
  }

  <h2>Race-day dashboard</h2>
  <div class="stat-grid">
    <div class="stat"><div class="stat-label">Average power</div><div class="stat-value">${p.averagePower ?? "—"} W</div></div>
    <div class="stat"><div class="stat-label">Normalised power</div><div class="stat-value">${p.normalizedPower ?? "—"} W</div></div>
    <div class="stat"><div class="stat-label">Variability index</div><div class="stat-value">${p.variabilityIndex ? p.variabilityIndex.toFixed(2) : "—"}</div></div>
    <div class="stat"><div class="stat-label">Avg speed</div><div class="stat-value">${avgSpeed} km/h</div></div>
  </div>

  ${
    pacingRows
      ? `<h2>Pacing plan</h2>
         <table>
           <thead><tr><th>Section</th><th>Target</th><th>Avg grade</th><th>Instruction</th></tr></thead>
           <tbody>${pacingRows}</tbody>
         </table>`
      : ""
  }

  ${
    climbRows
      ? `<h2>Climb execution plan</h2>
         <table>
           <thead><tr><th>Climb</th><th>Length</th><th>Grade</th><th>Target</th><th>How to ride it</th></tr></thead>
           <tbody>${climbRows}</tbody>
         </table>`
      : ""
  }

  <h2>Fuelling target</h2>
  <div class="block">
    <p>${escape(fuellingNote)}</p>
    <p><strong>Rule for the day:</strong> start eating in the first 20 minutes, then keep the drip feed going. If you wait until you feel low, you are already paying interest.</p>
  </div>

  <h2>Equipment and course levers</h2>
  <div class="two-col">
    <div class="block">
      <h3>Surface read</h3>
      <p>${escape(surfaceSummary)}. Rolling resistance matters more than riders think, especially on gravel, chip seal, and broken tarmac.</p>
    </div>
    <div class="block">
      <h3>Setup note</h3>
      <p>Current model uses CdA ${p.rider.cda.toFixed(3)} and Crr ${p.rider.crr.toFixed(4)}. If those are guessed, the fastest accuracy gain is a real ride file or CdA test.</p>
    </div>
  </div>
  ${
    scenarioRows
      ? `<table>
           <thead><tr><th>Change</th><th>Time impact</th><th>Direction</th></tr></thead>
           <tbody>${scenarioRows}</tbody>
         </table>`
      : ""
  }

  <h2>What this report bakes in</h2>
  <ul>
    <li>Power-balance physics solved per segment: gravity, rolling resistance, aerodynamic drag, drivetrain loss, and rider mass.</li>
    <li>Per-segment air density adjusted for altitude on every climb.</li>
    <li>Wind resolved into headwind / tailwind / yaw against the road heading.</li>
    <li>Durability decay past the 1-hour mark, so the model does not pretend threshold is available all day.</li>
    <li>Variable-power pacing biased uphill and into headwinds, eased on descents and lower-value sections.</li>
  </ul>

  <div class="premium">
    <h2>The next step is the Finish Line</h2>
    <p>The report tells you what the course demands. The Roadman <strong>Not Done Yet</strong> coaching community is where we turn that into training: TrainingPeaks delivery, weekly live calls with Anthony, coach feedback, and a group of serious amateur cyclists who still have big days ahead of them.</p>
    <a class="cta" href="${BASE_URL}/not-done-yet">Join Not Done Yet</a>
  </div>

  <div class="footer">
    Generated ${new Date().toISOString().slice(0, 10)} · Roadman Race Predictor v1 · physics-first, data-honest
  </div>
</div>
</body>
</html>`;
}

function formatFuelling(seconds: number, avgPower: number): string {
  const hours = seconds / 3600;
  // Carb need: 60-90 g/h on rides >2h; 30-60 g/h shorter. Scale with effort.
  const carbsPerHour = hours > 2 ? Math.min(90, 60 + (avgPower - 200) * 0.1) : 50;
  const totalCarbs = Math.round(carbsPerHour * hours);
  const fluidPerHour = 600;
  const sodiumPerHour = avgPower > 250 ? 1000 : 700;
  return `Aim for ~${Math.round(carbsPerHour)} g carbs/hour (≈${totalCarbs} g total), ~${fluidPerHour} ml fluid/hour, ${sodiumPerHour} mg sodium/hour. Scale up by 10–15 % in heat or above 250 W average.`;
}

interface DeliveryEmailArgs {
  firstName: string | null;
  viewHref: string;
  predictedTimeS: number;
  confidenceLowS: number;
  confidenceHighS: number;
  averagePower: number | null;
  courseName: string;
}

export function renderRaceDeliveryEmailHtml(args: DeliveryEmailArgs): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;background:${OFFWHITE};font-family:-apple-system,BlinkMacSystemFont,'Work Sans','Helvetica Neue',Arial,sans-serif;color:${CHARCOAL};">
  <div style="max-width:620px;margin:0 auto;padding:28px 18px 44px;">
    <div style="background:#210140;color:${OFFWHITE};border-radius:8px;padding:28px 24px;">
      <div style="color:${CORAL};font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;">Roadman Race Predictor</div>
      <h1 style="font-family:Impact,'Bebas Neue',Arial,sans-serif;text-transform:uppercase;font-size:42px;line-height:.95;margin:10px 0 8px;">Your Race Report is ready</h1>
      <p style="color:rgba(255,255,255,.78);font-size:15px;line-height:1.55;margin:0;">${args.firstName ? `Hey ${escape(args.firstName)},` : "Hey,"} ${escape(args.courseName)} is now broken down properly.</p>
    </div>

    <div style="background:white;border-radius:8px;padding:22px;margin-top:16px;">
      <p style="font-size:16px;line-height:1.55;margin:0 0 16px;">The free prediction gave you the headline. This report gives you the useful bit: how to pace the course, where the climbs bite, what to eat, and which setup changes are worth time.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:18px 0;">
        <div style="border:1px solid #eee;border-radius:6px;padding:12px;">
          <div style="font-size:11px;color:${MID_GREY};text-transform:uppercase;letter-spacing:.1em;">Predicted</div>
          <div style="font-size:20px;font-weight:800;margin-top:3px;">${formatDuration(args.predictedTimeS)}</div>
        </div>
        <div style="border:1px solid #eee;border-radius:6px;padding:12px;">
          <div style="font-size:11px;color:${MID_GREY};text-transform:uppercase;letter-spacing:.1em;">Range</div>
          <div style="font-size:20px;font-weight:800;margin-top:3px;">${formatDuration(args.confidenceLowS)}-${formatDuration(args.confidenceHighS)}</div>
        </div>
        <div style="border:1px solid #eee;border-radius:6px;padding:12px;">
          <div style="font-size:11px;color:${MID_GREY};text-transform:uppercase;letter-spacing:.1em;">Avg power</div>
          <div style="font-size:20px;font-weight:800;margin-top:3px;">${formatPower(args.averagePower)}</div>
        </div>
      </div>
      <p style="margin:24px 0;"><a href="${args.viewHref}" style="background:${CORAL};color:white;padding:14px 20px;border-radius:6px;text-decoration:none;font-weight:800;display:inline-block;">Open the Race Report</a></p>
      <p style="color:${MID_GREY};font-size:13px;line-height:1.5;margin:0;">Bookmark the link. It is your private report page and the cleanest place to come back to before race week.</p>
    </div>

    <p style="font-size:14px;line-height:1.55;color:${MID_GREY};margin:22px 4px 0;">Not done yet,<br><strong style="color:${CHARCOAL};">Anthony · Roadman Cycling</strong></p>
  </div>
</body>
</html>`;
}
