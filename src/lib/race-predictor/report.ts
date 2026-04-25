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
      courseName: course?.name ?? "your course",
    });

    const send = await sendReportEmail({
      to: report.email,
      subject: "Your Race Report is ready",
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

interface RenderHtmlArgs extends PredictionForReport {
  course: Course | null;
}

export function renderRaceReportHtml(p: RenderHtmlArgs): string {
  const course = p.course;
  const totalDistanceKm = course
    ? (course.totalDistance / 1000).toFixed(1)
    : "—";
  const totalGain = course ? Math.round(course.totalElevationGain) : "—";
  const climbs = course?.climbs ?? [];
  const insight = (p.resultSummary?.insight ?? null) as
    | { headline: string; body: string }
    | null;

  // Pacing summary by quartile of the course.
  let pacingSummaryHtml = "";
  if (p.pacingPlan && p.pacingPlan.length > 0 && course) {
    const segs = course.segments;
    const total = course.totalDistance;
    const buckets = [0.25, 0.5, 0.75, 1.0];
    const cumDist: number[] = [0];
    for (const s of segs) cumDist.push(cumDist[cumDist.length - 1] + s.distance);
    const rows: string[] = [];
    let prevCut = 0;
    for (const b of buckets) {
      const cutDist = total * b;
      const cutIdx = cumDist.findIndex((d) => d >= cutDist);
      const startIdx = prevCut;
      const endIdx = cutIdx > 0 ? cutIdx - 1 : segs.length - 1;
      const slice = p.pacingPlan.slice(startIdx, endIdx + 1);
      if (slice.length > 0) {
        const avgW = Math.round(slice.reduce((s, x) => s + x, 0) / slice.length);
        const start = (cumDist[startIdx] / 1000).toFixed(1);
        const end = (cumDist[endIdx + 1] / 1000).toFixed(1);
        rows.push(
          `<tr><td>${start}–${end} km</td><td>${avgW} W</td></tr>`,
        );
      }
      prevCut = endIdx + 1;
    }
    pacingSummaryHtml = `
      <h3>Pacing plan by quarter</h3>
      <table>
        <thead><tr><th>Section</th><th>Target avg power</th></tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    `;
  }

  const climbRows = climbs
    .map((c) => {
      const grade = (Math.tan(c.averageGradient) * 100).toFixed(1);
      const length = (c.length / 1000).toFixed(1);
      const gain = Math.round(c.elevationGain);
      return `<tr><td>${climbCategoryLabel(c)}</td><td>${length} km</td><td>${grade}%</td><td>${gain} m</td></tr>`;
    })
    .join("");

  const climbsHtml =
    climbRows.length > 0
      ? `<h3>Climbs on this course</h3>
         <table>
           <thead><tr><th>Cat</th><th>Length</th><th>Avg gradient</th><th>Gain</th></tr></thead>
           <tbody>${climbRows}</tbody>
         </table>`
      : "";

  const fuellingNote = `${formatFuelling(p.predictedTimeS, p.averagePower ?? 0)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Race Report — ${escape(course?.name ?? "your course")}</title>
<style>
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; background: ${OFFWHITE}; color: ${CHARCOAL}; margin: 0; padding: 0; }
  .wrap { max-width: 720px; margin: 0 auto; padding: 32px 24px 64px; }
  h1 { font-family: "Bebas Neue", Impact, sans-serif; font-size: 40px; letter-spacing: 0.02em; color: ${PURPLE}; margin: 0 0 8px; text-transform: uppercase; }
  h2 { font-size: 22px; color: ${PURPLE}; margin: 32px 0 12px; }
  h3 { font-size: 16px; margin: 24px 0 8px; }
  .lede { color: ${MID_GREY}; font-size: 14px; }
  .hero { background: ${PURPLE}; color: ${OFFWHITE}; padding: 24px; border-radius: 8px; margin: 24px 0; }
  .hero strong { font-size: 32px; display: block; margin-bottom: 4px; }
  .insight { border-left: 4px solid ${CORAL}; padding: 12px 16px; background: white; margin: 24px 0; }
  .insight .headline { font-weight: 600; color: ${PURPLE}; margin: 0 0 6px; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #ddd; }
  th { background: ${OFFWHITE}; color: ${MID_GREY}; font-weight: 600; }
  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
  .stat { background: white; padding: 12px; border-radius: 6px; }
  .stat-label { color: ${MID_GREY}; font-size: 12px; text-transform: uppercase; }
  .stat-value { font-size: 22px; font-weight: 700; color: ${CHARCOAL}; }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #ddd; font-size: 13px; color: ${MID_GREY}; }
  .cta { background: ${CORAL}; color: white; padding: 14px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; margin-top: 16px; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Race Report</h1>
  <p class="lede">${escape(course?.name ?? "Your uploaded course")} · ${totalDistanceKm} km · ${totalGain} m elevation</p>

  <div class="hero">
    <strong>${formatDuration(p.predictedTimeS)}</strong>
    Predicted finish (${formatDuration(p.confidenceLowS)} – ${formatDuration(p.confidenceHighS)} confidence range)
  </div>

  ${
    insight
      ? `<div class="insight">
           <p class="headline">${escape(insight.headline)}</p>
           <p>${escape(insight.body)}</p>
         </div>`
      : ""
  }

  <h2>Effort summary</h2>
  <div class="stat-grid">
    <div class="stat"><div class="stat-label">Average power</div><div class="stat-value">${p.averagePower ?? "—"} W</div></div>
    <div class="stat"><div class="stat-label">Normalised power</div><div class="stat-value">${p.normalizedPower ?? "—"} W</div></div>
    <div class="stat"><div class="stat-label">Variability index</div><div class="stat-value">${p.variabilityIndex ? p.variabilityIndex.toFixed(2) : "—"}</div></div>
    <div class="stat"><div class="stat-label">Avg speed</div><div class="stat-value">${course ? ((course.totalDistance / p.predictedTimeS) * 3.6).toFixed(1) : "—"} km/h</div></div>
  </div>

  ${climbsHtml}
  ${pacingSummaryHtml}

  <h2>Fuelling target</h2>
  <p>${escape(fuellingNote)}</p>

  <h2>What this report bakes in</h2>
  <ul>
    <li>Power-balance physics solved per segment (gravity + rolling + aero + drivetrain) — the same model BBS uses, plus durability decay your power profile shows past the 1-hour mark.</li>
    <li>Per-segment air density adjusted for altitude on every climb.</li>
    <li>Wind resolved into headwind / tailwind / yaw against the road heading.</li>
    <li>Variable-power pacing biased into headwinds and false-flats, eased on steep ramps and tailwind descents.</li>
  </ul>

  <h2>What's next</h2>
  <p>You're not done yet. The Roadman <strong>Not Done Yet</strong> community runs weekly live calls with Anthony, Vekta-driven training plans, and the same access to coaches and sports scientists this report draws on. If your A-race is the next thing you train for, that's where the rest of the prep lives.</p>
  <a class="cta" href="${BASE_URL}/community">See the community</a>

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
  courseName: string;
}

export function renderRaceDeliveryEmailHtml(args: DeliveryEmailArgs): string {
  return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,Arial,sans-serif;color:${CHARCOAL};max-width:560px;margin:0 auto;padding:24px;">
<h2 style="color:${PURPLE};margin:0 0 8px;">Your Race Report is ready</h2>
<p>${args.firstName ? `Hey ${escape(args.firstName)},` : "Hey,"} the prediction for ${escape(args.courseName)} is in: <strong>${formatDuration(args.predictedTimeS)}</strong>.</p>
<p>The full report — pacing plan, climb-by-climb breakdown, fuelling targets, and the equipment trade-offs that move the needle most — is here:</p>
<p style="margin:24px 0;"><a href="${args.viewHref}" style="background:${CORAL};color:white;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Open Race Report</a></p>
<p style="color:${MID_GREY};font-size:13px;">Bookmark the link — it's secure and only valid for your purchase.</p>
<p style="margin-top:32px;">Anthony · Roadman Cycling</p>
</body></html>`;
}
