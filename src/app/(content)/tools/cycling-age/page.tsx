"use client";

import { useEffect, useRef, useState, useCallback, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { useTrack } from "@/hooks/useTrack";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

/* ── Percentile benchmarks for trained masters cyclists ─────────
 *
 * [p10, p25, p50, p75, p90] W/kg by age group.
 * Derived from Coggan power profiling adjusted for non-professional
 * populations + Roadman's 250-rider benchmark dataset.
 * ────────────────────────────────────────────────────────────── */

const MALE_WKG_PERCENTILES: Record<string, number[]> = {
  "20-29": [2.4, 2.8, 3.3, 3.8, 4.4],
  "30-34": [2.3, 2.7, 3.2, 3.7, 4.3],
  "35-39": [2.2, 2.6, 3.1, 3.6, 4.2],
  "40-44": [2.1, 2.5, 3.1, 3.5, 4.0],
  "45-49": [2.0, 2.4, 2.9, 3.4, 3.8],
  "50-54": [1.8, 2.2, 2.7, 3.2, 3.5],
  "55-59": [1.7, 2.1, 2.5, 3.0, 3.3],
  "60-64": [1.5, 1.9, 2.3, 2.8, 3.0],
  "65+": [1.3, 1.7, 2.1, 2.5, 2.8],
};

const FEMALE_WKG_PERCENTILES: Record<string, number[]> = {
  "20-29": [1.9, 2.3, 2.8, 3.3, 3.8],
  "30-34": [1.8, 2.2, 2.7, 3.2, 3.7],
  "35-39": [1.7, 2.1, 2.6, 3.1, 3.6],
  "40-44": [1.6, 2.0, 2.5, 3.0, 3.4],
  "45-49": [1.5, 1.9, 2.4, 2.8, 3.2],
  "50-54": [1.4, 1.8, 2.2, 2.6, 3.0],
  "55-59": [1.3, 1.6, 2.0, 2.4, 2.7],
  "60-64": [1.1, 1.5, 1.8, 2.2, 2.5],
  "65+": [1.0, 1.3, 1.6, 2.0, 2.3],
};

/* ── Age group helpers ────────────────────────────────────────── */

const AGE_GROUP_KEYS = [
  "20-29",
  "30-34",
  "35-39",
  "40-44",
  "45-49",
  "50-54",
  "55-59",
  "60-64",
  "65+",
] as const;

/** Midpoint age for each bucket — used for interpolation. */
const AGE_GROUP_MID: Record<string, number> = {
  "20-29": 25,
  "30-34": 32,
  "35-39": 37,
  "40-44": 42,
  "45-49": 47,
  "50-54": 52,
  "55-59": 57,
  "60-64": 62,
  "65+": 68,
};

function getAgeGroup(age: number): string {
  if (age < 30) return "20-29";
  if (age < 35) return "30-34";
  if (age < 40) return "35-39";
  if (age < 45) return "40-44";
  if (age < 50) return "45-49";
  if (age < 55) return "50-54";
  if (age < 60) return "55-59";
  if (age < 65) return "60-64";
  return "65+";
}

/* ── Percentile calculation ───────────────────────────────────── */

function getPercentile(wkg: number, age: number, sex: "male" | "female"): number {
  const group = getAgeGroup(age);
  const table = sex === "male" ? MALE_WKG_PERCENTILES : FEMALE_WKG_PERCENTILES;
  const t = table[group]; // [p10, p25, p50, p75, p90]
  if (wkg < t[0]) return Math.max(1, Math.round((wkg / t[0]) * 10));
  if (wkg < t[1]) return 10 + Math.round(((wkg - t[0]) / (t[1] - t[0])) * 15);
  if (wkg < t[2]) return 25 + Math.round(((wkg - t[1]) / (t[2] - t[1])) * 25);
  if (wkg < t[3]) return 50 + Math.round(((wkg - t[2]) / (t[3] - t[2])) * 25);
  if (wkg < t[4]) return 75 + Math.round(((wkg - t[3]) / (t[4] - t[3])) * 15);
  return Math.min(99, 90 + Math.round(((wkg - t[4]) / (t[4] * 0.15)) * 9));
}

function getPercentileLabel(p: number): string {
  if (p >= 90) return "Top 10%";
  if (p >= 75) return "Top 25%";
  if (p >= 50) return "Top half";
  if (p >= 25) return "Solid base";
  return "Building";
}

/* ── Cycling age calculation ──────────────────────────────────── *
 *
 * The Cycling Age = the chronological age at which the user's
 * current W/kg would be the median (p50) performance for a
 * trained cyclist of that age.
 *
 * We interpolate between the p50 midpoints of each age bracket
 * to find the exact age match, then apply training adjustments.
 *
 * Research basis:
 * - Pino et al. (2021) masters cycling performance decline curves
 * - Norwegian HUNT Study (Nes et al., 2011) — VO2max fitness age
 * - Pollock & Lazarus et al. (King's College London) masters data
 * - Tanaka & Seals (2008) — trained vs sedentary decline rates
 * - Allen & Coggan power profiling categories
 * ─────────────────────────────────────────────────────────────── */

function calculateCyclingAge(
  wkg: number,
  sex: "male" | "female",
  trainingHours: number,
  yearsRiding: number,
): number {
  const table = sex === "male" ? MALE_WKG_PERCENTILES : FEMALE_WKG_PERCENTILES;

  // Build a list of (age, p50) pairs for interpolation
  const points: { age: number; p50: number }[] = AGE_GROUP_KEYS.map((k) => ({
    age: AGE_GROUP_MID[k],
    p50: table[k][2],
  }));

  // If W/kg is above the youngest group's p50, extrapolate down to 18
  if (wkg >= points[0].p50) {
    // Base age is the youngest midpoint or lower
    const baseCyclingAge = 18 + ((points[0].p50 - wkg) / points[0].p50) * (points[0].age - 18);
    return applyAdjustments(Math.max(18, baseCyclingAge), trainingHours, yearsRiding);
  }

  // If W/kg is below the oldest group's p50, extrapolate up to 75
  if (wkg <= points[points.length - 1].p50) {
    const lastPt = points[points.length - 1];
    const prevPt = points[points.length - 2];
    const slope = (lastPt.age - prevPt.age) / (prevPt.p50 - lastPt.p50);
    const extraAge = lastPt.age + (lastPt.p50 - wkg) * slope;
    return applyAdjustments(Math.min(75, extraAge), trainingHours, yearsRiding);
  }

  // Interpolate between bracket midpoints
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    // p50 decreases as age increases, so a.p50 > b.p50
    if (wkg <= a.p50 && wkg >= b.p50) {
      const fraction = (a.p50 - wkg) / (a.p50 - b.p50);
      const interpolatedAge = a.age + fraction * (b.age - a.age);
      return applyAdjustments(interpolatedAge, trainingHours, yearsRiding);
    }
  }

  // Fallback — shouldn't reach here
  return applyAdjustments(points[0].age, trainingHours, yearsRiding);
}

function applyAdjustments(
  baseAge: number,
  trainingHours: number,
  yearsRiding: number,
): number {
  let adj = baseAge;

  // Training volume adjustment
  if (trainingHours >= 15) adj -= 2;
  else if (trainingHours >= 10) adj -= 1;
  else if (trainingHours <= 3) adj += 2;
  else if (trainingHours <= 5) adj += 1;

  // Experience adjustment
  if (yearsRiding >= 10) adj -= 1;
  else if (yearsRiding <= 2) adj += 1;

  return Math.round(Math.max(18, Math.min(75, adj)));
}

/* ── Age decline model (for SVG chart) ────────────────────────── */

function getAgeFactor(age: number): number {
  if (age <= 25) return 0.97 + (age - 20) * 0.006;
  if (age <= 35) return 1.0;
  if (age <= 50) return 1.0 - (age - 35) * 0.005;
  if (age <= 60) return 1.0 - 15 * 0.005 - (age - 50) * 0.008;
  return 1.0 - 15 * 0.005 - 10 * 0.008 - (age - 60) * 0.01;
}

function getSedentaryFactor(age: number): number {
  if (age <= 30) return 1.0;
  return Math.max(0.4, 1.0 - (age - 30) * 0.01);
}

/* ── Input validation ─────────────────────────────────────────── */

function getAgeError(v: string): string | null {
  if (!v) return null;
  const n = parseInt(v);
  if (isNaN(n)) return "Please enter a valid number";
  if (n < 18) return "Age must be at least 18";
  if (n > 85) return "Age must be under 86";
  return null;
}
function getFtpError(v: string): string | null {
  if (!v) return null;
  const n = parseInt(v);
  if (isNaN(n)) return "Please enter a valid number";
  if (n < 50) return "FTP must be at least 50W";
  if (n > 600) return "FTP must be under 600W";
  return null;
}
function getWeightError(v: string): string | null {
  if (!v) return null;
  const n = parseFloat(v);
  if (isNaN(n)) return "Please enter a valid number";
  if (n < 40) return "Weight must be at least 40kg";
  if (n > 150) return "Weight must be under 150kg";
  return null;
}
function getTrainingHoursError(v: string): string | null {
  if (!v) return null;
  const n = parseFloat(v);
  if (isNaN(n)) return "Please enter a valid number";
  if (n < 1) return "Must be at least 1 hour";
  if (n > 30) return "Must be under 30 hours";
  return null;
}
function getYearsError(v: string): string | null {
  if (!v) return null;
  const n = parseInt(v);
  if (isNaN(n)) return "Please enter a valid number";
  if (n < 0) return "Must be 0 or more";
  if (n > 50) return "Must be under 50 years";
  return null;
}

/* ── SVG age decline chart ────────────────────────────────────── */

function AgeCurveChart({
  currentAge,
  currentWkg,
  cyclingAge,
  sex,
}: {
  currentAge: number;
  currentWkg: number;
  cyclingAge: number;
  sex: "male" | "female";
}) {
  const W = 600;
  const H = 260;
  const PAD = { top: 30, right: 20, bottom: 40, left: 50 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const peakWkg = currentWkg / getAgeFactor(currentAge);
  const ages = Array.from({ length: 53 }, (_, i) => i + 20);
  const maxWkg = peakWkg * 1.15;

  const toX = (age: number) => PAD.left + ((age - 20) / 52) * plotW;
  const toY = (w: number) => PAD.top + plotH - (w / maxWkg) * plotH;

  const trainedPoints = ages.map((a) => ({
    age: a,
    wkg: peakWkg * getAgeFactor(a),
  }));
  const trainedPath = trainedPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.age).toFixed(1)} ${toY(p.wkg).toFixed(1)}`)
    .join(" ");

  const sedentaryPoints = ages.map((a) => ({
    age: a,
    wkg: peakWkg * getSedentaryFactor(a),
  }));
  const sedentaryPath = sedentaryPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.age).toFixed(1)} ${toY(p.wkg).toFixed(1)}`)
    .join(" ");

  const cx = toX(currentAge);
  const cy = toY(currentWkg);

  const yTicks = [0, 1, 2, 3, 4, 5].filter((v) => v <= maxWkg);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Age vs W/kg decline curve showing your position">
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PAD.left} x2={W - PAD.right} y1={toY(v)} y2={toY(v)} stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
          <text x={PAD.left - 8} y={toY(v) + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="11">{v}</text>
        </g>
      ))}
      {[20, 30, 40, 50, 60, 70].map((a) => (
        <text key={a} x={toX(a)} y={H - 8} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">{a}</text>
      ))}
      <text x={W / 2} y={H} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="10">Age</text>
      <text x={12} y={H / 2} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="10" transform={`rotate(-90, 12, ${H / 2})`}>W/kg</text>

      {/* Peak window */}
      <rect x={toX(25)} y={PAD.top} width={toX(35) - toX(25)} height={plotH} fill="rgba(233,89,80,0.06)" rx="4" />
      <text x={toX(30)} y={PAD.top + 14} textAnchor="middle" fill="rgba(233,89,80,0.5)" fontSize="9" fontWeight="600">PEAK WINDOW</text>

      {/* Sedentary curve */}
      <path d={sedentaryPath} fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth="2" strokeDasharray="6 4" />
      {/* Trained curve */}
      <path d={trainedPath} fill="none" stroke="#F16363" strokeWidth="2.5" />

      {/* Cycling age marker (vertical dashed line) */}
      {cyclingAge !== currentAge && (
        <g>
          <line x1={toX(cyclingAge)} x2={toX(cyclingAge)} y1={PAD.top} y2={PAD.top + plotH} stroke="#F16363" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          <text x={toX(cyclingAge)} y={PAD.top - 6} textAnchor="middle" fill="#F16363" fontSize="9" fontWeight="600" opacity="0.7">CYCLING AGE</text>
        </g>
      )}

      {/* You marker */}
      <motion.circle
        cx={cx} cy={cy} r="7" fill="#F16363" stroke="#1a1a2e" strokeWidth="3"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      />
      <text x={cx} y={cy - 14} textAnchor="middle" fill="#F16363" fontSize="11" fontWeight="700">You</text>

      {/* Legend */}
      <g transform={`translate(${W - PAD.right - 140}, ${PAD.top + 8})`}>
        <line x1="0" y1="0" x2="18" y2="0" stroke="#F16363" strokeWidth="2.5" />
        <text x="24" y="4" fill="rgba(255,255,255,0.6)" fontSize="10">Trained decline</text>
        <line x1="0" y1="16" x2="18" y2="16" stroke="rgba(148,163,184,0.5)" strokeWidth="2" strokeDasharray="4 3" />
        <text x="24" y="20" fill="rgba(255,255,255,0.4)" fontSize="10">Sedentary decline</text>
      </g>
    </svg>
  );
}

/* ── Personalised insights generator ──────────────────────────── */

function generateInsights(
  wkg: number,
  percentile: number,
  trainingHours: number,
  yearsRiding: number,
  cyclingAge: number,
  chronoAge: number,
): string[] {
  const insights: string[] = [];
  const diff = chronoAge - cyclingAge;

  // Percentile insight
  if (percentile >= 75) {
    insights.push(
      `Your W/kg puts you in the top ${100 - percentile}% for your age group. That&rsquo;s not luck — that&rsquo;s consistency compounding over time.`,
    );
  } else if (percentile >= 50) {
    insights.push(
      `You&rsquo;re above the median for trained cyclists your age. With targeted intensity work, moving into the top quarter is within reach.`,
    );
  } else {
    insights.push(
      `You&rsquo;re building a solid foundation. Structured training — specifically polarised intensity distribution — is the fastest lever to shift this number.`,
    );
  }

  // Training volume insight
  if (trainingHours < 6) {
    insights.push(
      `At ${trainingHours} hours per week, adding just 1–2 more hours of low-intensity volume could shift your cycling age by 1–2 years. The research consistently shows that volume at easy intensity is the single biggest performance driver for time-crunched masters cyclists.`,
    );
  } else if (trainingHours >= 10) {
    insights.push(
      `Your training volume is a significant asset. At ${trainingHours} hours per week, your consistency advantage is worth roughly 2–3 years of decline resistance compared to someone riding half that.`,
    );
  } else {
    insights.push(
      `${trainingHours} hours per week is a workable volume. The key at this level is intensity distribution — roughly 80% easy, 20% hard. Most cyclists invert this and spend too long in the middle.`,
    );
  }

  // Experience insight
  if (yearsRiding >= 10 && diff > 0) {
    insights.push(
      `${yearsRiding} years of cycling experience shows in your numbers. Long-term consistent riders develop neuromuscular efficiency and metabolic adaptations that newer cyclists simply haven&rsquo;t built yet — and those adaptations are protective against age-related decline.`,
    );
  } else if (yearsRiding < 3) {
    insights.push(
      `With ${yearsRiding} years of serious riding, you&rsquo;ve got significant headroom. Newer cyclists typically see the steepest gains in years 2–5 as the body adapts to the specific demands of cycling. Your ceiling is higher than your current numbers suggest.`,
    );
  } else {
    insights.push(
      `${yearsRiding} years of riding gives you a strong aerobic base. The next performance step for cyclists in your experience range is usually periodisation — structuring training into blocks rather than riding the same way year-round.`,
    );
  }

  return insights;
}

/* ── Share card generator (canvas) ────────────────────────────── */

async function generateShareCard(
  cyclingAge: number,
  chronoAge: number,
  percentile: number,
  format: "story" | "square",
): Promise<Blob | null> {
  const w = 1080;
  const h = format === "story" ? 1920 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Load fonts — Bebas Neue and Work Sans via CSS
  try {
    await document.fonts.load("700 80px 'Bebas Neue'");
    await document.fonts.load("400 32px 'Work Sans'");
  } catch {
    // Fonts may already be loaded; continue
  }

  // Background: radial gradient purple
  const grad = ctx.createRadialGradient(w / 2, h * 0.25, 0, w / 2, h * 0.5, h * 0.7);
  grad.addColorStop(0, "#4C1273");
  grad.addColorStop(1, "#210140");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle noise texture
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 12;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);

  // Bottom gradient fade
  const bottomGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
  bottomGrad.addColorStop(0, "rgba(33, 1, 64, 0)");
  bottomGrad.addColorStop(1, "rgba(33, 1, 64, 0.6)");
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, h * 0.75, w, h * 0.25);

  const centerX = w / 2;
  const diff = chronoAge - cyclingAge;

  // Layout calculations
  const logoY = format === "story" ? 140 : 60;
  const titleY = format === "story" ? 340 : 200;
  const bigNumberY = format === "story" ? 620 : 420;
  const chronoY = format === "story" ? 730 : 510;
  const divider1Y = format === "story" ? 800 : 560;
  const diffTextY = format === "story" ? 920 : 640;
  const divider2Y = format === "story" ? 1040 : 720;
  const percentileY = format === "story" ? 1140 : 790;
  const divider3Y = format === "story" ? 1230 : 850;
  const ctaTitleY = format === "story" ? 1380 : 920;
  const ctaSubY = format === "story" ? 1460 : 970;
  const urlY = format === "story" ? 1580 : 1030;

  // Load and draw logo
  try {
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      logo.onload = () => resolve();
      logo.onerror = () => reject(new Error("Logo load failed"));
      logo.src = "/images/logo-white.png";
    });
    const logoH = format === "story" ? 80 : 50;
    const logoW = (logo.width / logo.height) * logoH;
    ctx.drawImage(logo, centerX - logoW / 2, logoY - logoH / 2, logoW, logoH);
  } catch {
    // If logo fails to load, skip it
  }

  // "YOUR CYCLING AGE" title
  ctx.textAlign = "center";
  ctx.fillStyle = "#F16363";
  ctx.font = `700 ${format === "story" ? 56 : 40}px 'Bebas Neue', sans-serif`;
  ctx.letterSpacing = "4px";
  ctx.fillText("YOUR CYCLING AGE", centerX, titleY);

  // Big cycling age number with glow
  ctx.shadowColor = "#F16363";
  ctx.shadowBlur = 40;
  ctx.fillStyle = "#F16363";
  ctx.font = `700 ${format === "story" ? 220 : 160}px 'Bebas Neue', sans-serif`;
  ctx.fillText(String(cyclingAge), centerX, bigNumberY);
  ctx.shadowBlur = 0;

  // Chronological age subtitle
  ctx.fillStyle = "#FAFAFA";
  ctx.font = `400 ${format === "story" ? 32 : 24}px 'Work Sans', sans-serif`;
  ctx.letterSpacing = "3px";
  ctx.fillText(`CHRONOLOGICAL AGE: ${chronoAge}`, centerX, chronoY);

  // Divider 1
  ctx.strokeStyle = "rgba(250, 250, 250, 0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - 200, divider1Y);
  ctx.lineTo(centerX + 200, divider1Y);
  ctx.stroke();

  // Diff text
  ctx.fillStyle = "#FAFAFA";
  ctx.font = `700 ${format === "story" ? 52 : 38}px 'Bebas Neue', sans-serif`;
  ctx.letterSpacing = "3px";
  if (diff > 0) {
    ctx.fillText(`${diff} YEAR${diff !== 1 ? "S" : ""} YOUNGER`, centerX, diffTextY);
    ctx.font = `700 ${format === "story" ? 36 : 26}px 'Bebas Neue', sans-serif`;
    ctx.fillText("THAN YOUR BIRTH CERTIFICATE", centerX, diffTextY + (format === "story" ? 55 : 40));
  } else if (diff < 0) {
    const absDiff = Math.abs(diff);
    ctx.fillText(`${absDiff} YEAR${absDiff !== 1 ? "S" : ""} OLDER`, centerX, diffTextY);
    ctx.font = `700 ${format === "story" ? 36 : 26}px 'Bebas Neue', sans-serif`;
    ctx.fillText("THAN YOUR BIRTH CERTIFICATE", centerX, diffTextY + (format === "story" ? 55 : 40));
  } else {
    ctx.fillText("MATCHES YOUR AGE", centerX, diffTextY);
    ctx.font = `700 ${format === "story" ? 36 : 26}px 'Bebas Neue', sans-serif`;
    ctx.fillText("RIGHT ON THE MARK", centerX, diffTextY + (format === "story" ? 55 : 40));
  }

  // Divider 2
  ctx.beginPath();
  ctx.moveTo(centerX - 200, divider2Y);
  ctx.lineTo(centerX + 200, divider2Y);
  ctx.stroke();

  // Percentile
  ctx.fillStyle = "#F16363";
  ctx.font = `700 ${format === "story" ? 44 : 32}px 'Bebas Neue', sans-serif`;
  ctx.letterSpacing = "3px";
  ctx.fillText(`TOP ${100 - percentile}% FOR AGE GROUP`, centerX, percentileY);

  // Divider 3
  ctx.beginPath();
  ctx.moveTo(centerX - 200, divider3Y);
  ctx.lineTo(centerX + 200, divider3Y);
  ctx.stroke();

  // CTA
  ctx.fillStyle = "#FAFAFA";
  ctx.font = `700 ${format === "story" ? 48 : 34}px 'Bebas Neue', sans-serif`;
  ctx.letterSpacing = "3px";
  ctx.fillText("WHAT'S YOUR", centerX, ctaTitleY);
  ctx.fillText("CYCLING AGE?", centerX, ctaSubY);

  // URL
  ctx.fillStyle = "rgba(250, 250, 250, 0.5)";
  ctx.font = `400 ${format === "story" ? 24 : 18}px 'Work Sans', sans-serif`;
  ctx.letterSpacing = "1px";
  ctx.fillText("roadmancycling.com/tools/cycling-age", centerX, urlY);

  // Reset letterSpacing
  ctx.letterSpacing = "0px";

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
  });
}

/* ── Main component ───────────────────────────────────────────── */

export default function CyclingAgePage() {
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState("");
  const [ftp, setFtp] = useState("");
  const [trainingHours, setTrainingHours] = useState("");
  const [yearsRiding, setYearsRiding] = useState("");

  const [calculated, setCalculated] = useState(false);
  const [showFullResults, setShowFullResults] = useState(false);

  // Email capture
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [emailMessage, setEmailMessage] = useState("");

  // Share
  const [shareFormat, setShareFormat] = useState<"story" | "square">("story");
  const [generating, setGenerating] = useState(false);

  const track = useTrack();
  const startedRef = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Check cookie on mount — if they've already submitted, show full results
  useEffect(() => {
    if (typeof document !== "undefined") {
      const hasCookie = document.cookie.includes("roadman_cycling_age_email=1");
      if (hasCookie) setShowFullResults(true);
    }
  }, []);

  useEffect(() => {
    track("race_page_viewed", { tool: "cycling-age" });
  }, [track]);

  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    track("prediction_started", { tool: "cycling-age" });
  };

  // Parsed values
  const ageVal = parseInt(age) || 0;
  const ftpVal = parseInt(ftp) || 0;
  const weightVal = parseFloat(weight) || 0;
  const trainingHoursVal = parseFloat(trainingHours) || 0;
  const yearsRidingVal = parseInt(yearsRiding) || 0;

  // Validation
  const ageError = getAgeError(age);
  const ftpError = getFtpError(ftp);
  const weightError = getWeightError(weight);
  const hoursError = getTrainingHoursError(trainingHours);
  const yearsError = getYearsError(yearsRiding);

  const ready =
    ageVal > 0 &&
    ftpVal > 0 &&
    weightVal > 0 &&
    trainingHoursVal > 0 &&
    yearsRiding !== "" &&
    !ageError &&
    !ftpError &&
    !weightError &&
    !hoursError &&
    !yearsError;

  const reset = () => setCalculated(false);

  // Computed results
  const wkg = weightVal > 0 ? ftpVal / weightVal : 0;
  const cyclingAge = calculateCyclingAge(wkg, sex, trainingHoursVal, yearsRidingVal);
  const percentile = getPercentile(wkg, ageVal, sex);
  const percentileLabel = getPercentileLabel(percentile);
  const ageDiff = ageVal - cyclingAge;
  const insights = generateInsights(wkg, percentile, trainingHoursVal, yearsRidingVal, cyclingAge, ageVal);

  const handleCalculate = () => {
    if (!ready) return;
    markStarted();
    setCalculated(true);
    track("prediction_completed", { tool: "cycling-age", cycling_age: cyclingAge, chrono_age: ageVal, wkg: wkg.toFixed(2) });

    // Scroll to results after a tick
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setEmailStatus("error");
      setEmailMessage("Please enter a valid email address.");
      return;
    }
    if (!consent) {
      setEmailStatus("error");
      setEmailMessage("Please tick the box to confirm.");
      return;
    }
    setEmailStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "cycling-age-tool",
          consent: true,
        }),
      });

      if (res.ok) {
        track("email_captured", { source: "cycling-age-tool", cycling_age: cyclingAge });
        setEmailStatus("success");
        setEmailMessage("Done. Your full Cycling Age report is loading below.");
        setShowFullResults(true);
        // Set cookie for return visits (30 days)
        document.cookie = "roadman_cycling_age_email=1; max-age=2592000; path=/; SameSite=Lax";
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setEmailStatus("error");
        setEmailMessage(data.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setEmailStatus("error");
      setEmailMessage("Something went wrong. Try again.");
    }
  };

  const handleShare = useCallback(async () => {
    setGenerating(true);
    try {
      const blob = await generateShareCard(cyclingAge, ageVal, percentile, shareFormat);
      if (!blob) return;

      // Try Web Share API first (mobile)
      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare) {
        const file = new File([blob], `cycling-age-${cyclingAge}.png`, { type: "image/png" });
        const shareData = { files: [file] };
        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            track("share_clicked", { tool: "cycling-age", method: "native", format: shareFormat });
            return;
          } catch {
            // User cancelled or share failed — fall through to download
          }
        }
      }

      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cycling-age-${cyclingAge}-${shareFormat}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      track("share_clicked", { tool: "cycling-age", method: "download", format: shareFormat });
    } finally {
      setGenerating(false);
    }
  }, [cyclingAge, ageVal, percentile, shareFormat, track]);

  const inputClasses =
    "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none transition-colors";
  const errorInputClasses =
    "w-full bg-white/5 border border-red-500/60 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-red-500 focus:outline-none transition-colors";

  return (
    <>
      <Header />
      <main id="main-content">
        {/* ── Hero ───────────────────────────────────────────── */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Tool &middot; Masters Cyclists
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              YOUR CYCLING AGE
            </h1>
            <p className="text-foreground-muted text-lg">
              How old is your cycling body? Your birth certificate says one thing. Your power
              numbers say something else. Enter your data and find out whether you&apos;re
              riding younger — or older — than your real age.
            </p>
          </Container>
        </Section>

        {/* ── Calculator ────────────────────────────────────── */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              {/* Sex */}
              <div>
                <label id="ca-sex-label" className="block font-heading text-sm text-off-white mb-2">
                  SEX
                </label>
                <div className="flex rounded-lg overflow-hidden border border-white/10" role="group" aria-labelledby="ca-sex-label">
                  {([["male", "Male"], ["female", "Female"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setSex(val); reset(); }}
                      aria-pressed={sex === val}
                      className={`flex-1 py-3 text-sm font-heading tracking-wider transition-colors cursor-pointer ${
                        sex === val
                          ? "bg-coral text-off-white"
                          : "bg-white/5 text-foreground-muted hover:text-off-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age */}
                <div>
                  <label htmlFor="ca-age" className="block font-heading text-sm text-off-white mb-2">AGE</label>
                  <input
                    id="ca-age" type="number" inputMode="numeric" min="18" max="85"
                    placeholder="e.g. 48" aria-label="Your age in years" aria-invalid={!!ageError}
                    value={age}
                    onChange={(e) => { setAge(e.target.value); reset(); }}
                    className={ageError ? errorInputClasses : inputClasses}
                  />
                  {ageError && <p className="text-red-400 text-xs mt-1" role="alert">{ageError}</p>}
                </div>

                {/* Weight */}
                <div>
                  <label htmlFor="ca-weight" className="block font-heading text-sm text-off-white mb-2">WEIGHT (KG)</label>
                  <input
                    id="ca-weight" type="number" inputMode="decimal" min="40" max="150" step="0.1"
                    placeholder="e.g. 76" aria-label="Your body weight in kilograms" aria-invalid={!!weightError}
                    value={weight}
                    onChange={(e) => { setWeight(e.target.value); reset(); }}
                    className={weightError ? errorInputClasses : inputClasses}
                  />
                  {weightError && <p className="text-red-400 text-xs mt-1" role="alert">{weightError}</p>}
                </div>

                {/* FTP */}
                <div>
                  <label htmlFor="ca-ftp" className="block font-heading text-sm text-off-white mb-2">CURRENT FTP (WATTS)</label>
                  <input
                    id="ca-ftp" type="number" inputMode="numeric" min="50" max="600"
                    placeholder="e.g. 240" aria-label="Functional Threshold Power in watts" aria-invalid={!!ftpError}
                    value={ftp}
                    onChange={(e) => { setFtp(e.target.value); reset(); }}
                    className={ftpError ? errorInputClasses : inputClasses}
                  />
                  {ftpError && <p className="text-red-400 text-xs mt-1" role="alert">{ftpError}</p>}
                </div>

                {/* Training hours */}
                <div>
                  <label htmlFor="ca-hours" className="block font-heading text-sm text-off-white mb-2">WEEKLY TRAINING HOURS</label>
                  <input
                    id="ca-hours" type="number" inputMode="decimal" min="1" max="30" step="0.5"
                    placeholder="e.g. 8" aria-label="Hours per week spent training" aria-invalid={!!hoursError}
                    value={trainingHours}
                    onChange={(e) => { setTrainingHours(e.target.value); reset(); }}
                    className={hoursError ? errorInputClasses : inputClasses}
                  />
                  {hoursError && <p className="text-red-400 text-xs mt-1" role="alert">{hoursError}</p>}
                </div>

                {/* Years cycling */}
                <div className="sm:col-span-2">
                  <label htmlFor="ca-years" className="block font-heading text-sm text-off-white mb-2">YEARS CYCLING SERIOUSLY</label>
                  <input
                    id="ca-years" type="number" inputMode="numeric" min="0" max="50"
                    placeholder="e.g. 6" aria-label="How many years you've been cycling seriously" aria-invalid={!!yearsError}
                    value={yearsRiding}
                    onChange={(e) => { setYearsRiding(e.target.value); reset(); }}
                    className={yearsError ? errorInputClasses : inputClasses}
                  />
                  {yearsError && <p className="text-red-400 text-xs mt-1" role="alert">{yearsError}</p>}
                  <p className="text-xs text-foreground-subtle mt-2">
                    Structured training or racing — not just riding around. Zero is fine if
                    you&apos;re new to it.
                  </p>
                </div>
              </div>

              <Button onClick={handleCalculate} size="lg" className="w-full" disabled={!ready}>
                Calculate My Cycling Age
              </Button>
            </div>

            {/* ── Results ─────────────────────────────────────── */}
            <div aria-live="polite" aria-atomic="false" ref={resultsRef}>
              <AnimatePresence mode="wait">
                {calculated && wkg > 0 && (
                  <motion.div
                    className="mt-8 space-y-4"
                    key={`${ftpVal}-${weightVal}-${ageVal}-${sex}-${trainingHoursVal}-${yearsRidingVal}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* ─── PHASE 1: Free Results ─────────────── */}

                    {/* Big cycling age number */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-8 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    >
                      <p className="text-foreground-subtle text-xs mb-3 tracking-widest">
                        YOUR CYCLING AGE
                      </p>
                      <motion.p
                        className="font-heading text-coral mb-2"
                        style={{ fontSize: "clamp(80px, 15vw, 140px)", lineHeight: 1, textShadow: "0 0 40px rgba(241, 99, 99, 0.4)" }}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 150 }}
                      >
                        {cyclingAge}
                      </motion.p>
                      <p className="font-heading text-lg text-foreground-muted tracking-widest mb-4">
                        VS CHRONOLOGICAL AGE {ageVal}
                      </p>
                      <motion.p
                        className="font-heading text-2xl md:text-3xl text-off-white"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        {ageDiff > 0
                          ? `YOU'RE CYCLING ${ageDiff} YEAR${ageDiff !== 1 ? "S" : ""} YOUNGER`
                          : ageDiff < 0
                            ? `YOUR CYCLING AGE IS ${Math.abs(ageDiff)} YEAR${Math.abs(ageDiff) !== 1 ? "S" : ""} OLDER`
                            : "YOUR CYCLING AGE MATCHES YOUR AGE"}
                      </motion.p>
                    </motion.div>

                    {/* Percentile bar */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.25 }}
                    >
                      <p className="text-xs text-foreground-subtle mb-2">
                        AMONG TRAINED {sex.toUpperCase()} CYCLISTS AGED {getAgeGroup(ageVal).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-4 mb-3">
                        <span className="font-heading text-2xl text-coral">{percentileLabel}</span>
                        <span className="text-foreground-muted text-sm">{percentile}th percentile</span>
                      </div>
                      <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-2">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-coral/60 to-coral"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentile}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-foreground-subtle">
                        <span>0th</span>
                        <span>50th</span>
                        <span>100th</span>
                      </div>
                    </motion.div>

                    {/* Key metrics */}
                    <motion.div
                      className="grid grid-cols-3 gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.3 }}
                    >
                      <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                        <p className="text-xs text-foreground-subtle mb-1">W/KG</p>
                        <p className="font-heading text-3xl text-coral">{wkg.toFixed(2)}</p>
                      </div>
                      <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                        <p className="text-xs text-foreground-subtle mb-1">FTP</p>
                        <p className="font-heading text-3xl text-off-white">{ftpVal}W</p>
                      </div>
                      <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                        <p className="text-xs text-foreground-subtle mb-1">PERCENTILE</p>
                        <p className="font-heading text-3xl text-off-white">{percentile}th</p>
                      </div>
                    </motion.div>

                    {/* Share card */}
                    <motion.div
                      className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.35 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-3">
                        SHARE YOUR RESULT
                      </h3>
                      <p className="text-foreground-muted text-sm mb-4">
                        Download your result card and post it. See how your mates compare.
                      </p>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex rounded-lg overflow-hidden border border-white/10">
                          {([["story", "Story (9:16)"], ["square", "Square (1:1)"]] as const).map(([val, label]) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setShareFormat(val)}
                              className={`px-4 py-2 text-xs font-heading tracking-wider transition-colors cursor-pointer ${
                                shareFormat === val
                                  ? "bg-coral text-off-white"
                                  : "bg-white/5 text-foreground-muted hover:text-off-white"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={handleShare}
                        disabled={generating}
                        className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 disabled:opacity-50 px-6 py-3 text-sm transition-all cursor-pointer shadow-[0_10px_30px_rgba(241,99,99,0.35)] hover:shadow-[0_14px_40px_rgba(241,99,99,0.55)]"
                      >
                        {generating ? "GENERATING..." : "DOWNLOAD & SHARE"}
                      </button>
                    </motion.div>

                    {/* ─── EMAIL GATE ─────────────────────────── */}
                    {!showFullResults && (
                      <motion.div
                        className="rounded-2xl bg-white/[0.04] border border-coral/40 px-5 py-6 md:px-7 md:py-8"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.4 }}
                      >
                        <p className="font-heading text-coral text-xs tracking-[0.25em] mb-2 text-center">
                          FULL REPORT
                        </p>
                        <h3 className="font-heading text-xl md:text-2xl text-off-white text-center mb-2">
                          WANT THE FULL BREAKDOWN?
                        </h3>
                        <p className="text-foreground-muted text-sm text-center mb-6 max-w-md mx-auto">
                          Your percentile analysis, age-adjusted performance targets, decline curve
                          position, and where to focus next — based on your numbers.
                        </p>

                        {emailStatus === "success" ? (
                          <div className="text-center" role="status">
                            <p className="text-off-white text-base leading-snug">{emailMessage}</p>
                          </div>
                        ) : (
                          <form onSubmit={handleEmailSubmit} className="w-full max-w-md mx-auto">
                            <div className="flex flex-col sm:flex-row gap-3">
                              <input
                                type="email"
                                required
                                aria-label="Email address"
                                placeholder="you@example.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => {
                                  setEmail(e.target.value);
                                  if (emailStatus !== "idle") setEmailStatus("idle");
                                }}
                                disabled={emailStatus === "loading"}
                                className="flex-1 bg-white/5 border border-white/15 rounded-md px-4 py-3 text-base text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none transition-colors"
                              />
                              <button
                                type="submit"
                                disabled={emailStatus === "loading"}
                                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider text-base bg-coral hover:bg-coral/90 disabled:opacity-50 text-off-white px-6 py-3 rounded-md shadow-[0_10px_30px_rgba(241,99,99,0.35)] hover:shadow-[0_14px_40px_rgba(241,99,99,0.55)] transition-all shrink-0 cursor-pointer"
                              >
                                {emailStatus === "loading" ? "SENDING..." : "SHOW MY REPORT"}
                              </button>
                            </div>
                            <label className="flex items-start gap-2 mt-3 cursor-pointer text-left">
                              <input
                                type="checkbox"
                                checked={consent}
                                onChange={(e) => {
                                  setConsent(e.target.checked);
                                  if (emailStatus === "error") setEmailStatus("idle");
                                }}
                                className="accent-coral mt-1 w-4 h-4 shrink-0 cursor-pointer"
                              />
                              <span className="text-xs text-foreground-muted leading-snug">
                                Send me the report and the Saturday Spin newsletter. One-click
                                unsubscribe.{" "}
                                <a href="/privacy" className="text-coral hover:underline" target="_blank" rel="noopener noreferrer">
                                  Privacy
                                </a>
                                .
                              </span>
                            </label>
                            {emailStatus === "error" && (
                              <p className="text-coral text-sm mt-2 text-left" role="alert">{emailMessage}</p>
                            )}
                          </form>
                        )}
                      </motion.div>
                    )}

                    {/* ─── PHASE 2: Full Results (email-gated) ── */}
                    <AnimatePresence>
                      {showFullResults && (
                        <motion.div
                          className="space-y-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {/* Age decline chart */}
                          <div className="bg-background-elevated rounded-xl border border-white/5 p-6">
                            <h3 className="font-heading text-lg text-off-white mb-4">
                              YOUR POSITION ON THE DECLINE CURVE
                            </h3>
                            <AgeCurveChart
                              currentAge={ageVal}
                              currentWkg={wkg}
                              cyclingAge={cyclingAge}
                              sex={sex}
                            />
                            <p className="text-foreground-subtle text-xs mt-3">
                              Solid line = trained athlete decline (~5% per decade). Dashed = sedentary
                              decline (~10% per decade). The gap is what consistent training protects.
                            </p>
                          </div>

                          {/* Personalised insights */}
                          <div className="bg-background-elevated rounded-xl border border-white/5 p-6">
                            <h3 className="font-heading text-lg text-off-white mb-4">
                              YOUR NUMBERS, DECODED
                            </h3>
                            <div className="space-y-4">
                              {insights.map((insight, i) => (
                                <motion.div
                                  key={i}
                                  className="flex gap-3"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 * i }}
                                >
                                  <span className="font-heading text-coral text-lg shrink-0 mt-0.5">{i + 1}</span>
                                  <p
                                    className="text-foreground-muted text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: insight }}
                                  />
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Percentile deep dive */}
                          <div className="bg-background-elevated rounded-xl border border-white/5 p-6">
                            <h3 className="font-heading text-lg text-off-white mb-4">
                              PERCENTILE BREAKDOWN
                            </h3>
                            <p className="text-foreground-muted text-sm mb-4">
                              Where your {wkg.toFixed(2)} W/kg sits against trained {sex} cyclists
                              aged {getAgeGroup(ageVal)}. These aren&apos;t general-population numbers —
                              this is against people who train consistently.
                            </p>
                            <div className="space-y-2">
                              {[
                                { label: "p10 — Building", val: (sex === "male" ? MALE_WKG_PERCENTILES : FEMALE_WKG_PERCENTILES)[getAgeGroup(ageVal)][0] },
                                { label: "p25 — Solid base", val: (sex === "male" ? MALE_WKG_PERCENTILES : FEMALE_WKG_PERCENTILES)[getAgeGroup(ageVal)][1] },
                                { label: "p50 — Median", val: (sex === "male" ? MALE_WKG_PERCENTILES : FEMALE_WKG_PERCENTILES)[getAgeGroup(ageVal)][2] },
                                { label: "p75 — Strong", val: (sex === "male" ? MALE_WKG_PERCENTILES : FEMALE_WKG_PERCENTILES)[getAgeGroup(ageVal)][3] },
                                { label: "p90 — Elite masters", val: (sex === "male" ? MALE_WKG_PERCENTILES : FEMALE_WKG_PERCENTILES)[getAgeGroup(ageVal)][4] },
                              ].map((row) => {
                                const isYou = wkg >= row.val - 0.15 && wkg <= row.val + 0.15;
                                return (
                                  <div
                                    key={row.label}
                                    className={`flex items-center justify-between rounded-lg p-3 ${
                                      isYou ? "bg-coral/10 border border-coral/30" : "bg-white/[0.03]"
                                    }`}
                                  >
                                    <span className={`text-sm ${isYou ? "text-coral font-heading" : "text-foreground-muted"}`}>
                                      {row.label}
                                      {isYou && " ← You"}
                                    </span>
                                    <span className={`font-heading text-lg ${isYou ? "text-coral" : "text-off-white"}`}>
                                      {row.val.toFixed(1)} W/kg
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* What next + CTAs */}
                          <div className="rounded-xl border border-white/10 p-6">
                            <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT</h3>
                            <ul className="space-y-2">
                              <li>
                                <Link href="/tools/age-grade" className="text-coral hover:text-coral/80 text-sm transition-colors">
                                  Age-grade your power — see your peak-equivalent W/kg
                                </Link>
                              </li>
                              <li>
                                <Link href="/tools/masters-ftp-benchmark" className="text-coral hover:text-coral/80 text-sm transition-colors">
                                  Masters FTP benchmark — detailed percentile in your age group
                                </Link>
                              </li>
                              <li>
                                <Link href="/tools/vo2max" className="text-coral hover:text-coral/80 text-sm transition-colors">
                                  VO2max estimator with age-adjusted percentiles
                                </Link>
                              </li>
                              <li>
                                <Link href="/tools/masters-recovery-score" className="text-coral hover:text-coral/80 text-sm transition-colors">
                                  Masters recovery score — are you recovering enough?
                                </Link>
                              </li>
                            </ul>
                          </div>

                          {/* Not Done Yet CTA */}
                          <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                            <p className="font-heading text-coral text-xs tracking-widest mb-2">NOT DONE YET</p>
                            <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                              Your cycling age is a starting point, not a ceiling.
                            </p>
                            <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                              The right structure — polarised intensity, targeted strength work,
                              recovery treated as a session — can offset 10–15 years of age-related
                              decline. That&apos;s what the Not Done Yet community is built around.
                            </p>
                            <a
                              href="https://www.skool.com/roadmancycling"
                              className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                              target="_blank"
                              rel="noopener noreferrer"
                              data-track="tool_cyclingage_community"
                            >
                              Join the Community
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* ── Methodology ─────────────────────────────────────── */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              HOW WE CALCULATE YOUR CYCLING AGE
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                Your Cycling Age is the chronological age at which your current
                watts-per-kilogram would be the median performance for a trained cyclist of
                that age. We compare your W/kg against percentile tables built from
                Roadman&apos;s 250-rider benchmark dataset and published power-profiling data
                (Allen &amp; Coggan), then interpolate across age brackets to find the match.
                Training volume and experience adjustments are applied on top — because a
                15-hour-per-week rider and a 4-hour rider with the same W/kg are in different
                places physiologically.
              </p>
              <p>
                <strong className="text-off-white">The research behind it:</strong> The
                fitness-age concept comes from the Norwegian HUNT Study (Nes et al., 2011),
                which used VO2max data from over 55,000 participants to estimate biological
                fitness age. We&apos;ve adapted this approach for cycling-specific power output.
                The decline model draws on Tanaka &amp; Seals (2008), who showed that trained
                athletes decline at roughly 5% per decade versus 10% for sedentary populations —
                meaning consistent training effectively halves the rate of physiological ageing.
              </p>
              <p>
                <strong className="text-off-white">Masters-specific evidence:</strong> Pollock
                &amp; Lazarus et al. at King&apos;s College London studied masters cyclists who
                maintained regular training and found they preserved immune function, muscle
                mass, and body composition at levels comparable to much younger adults. Pino
                et al. (2021) mapped masters cycling performance decline curves specifically,
                providing the age-group benchmarks that underpin this calculator.
              </p>
              <p>
                <strong className="text-off-white">What it doesn&apos;t capture:</strong> This
                is a population-level model. Individual variation in ageing rate is significant —
                genetics, injury history, stress load, sleep quality, and nutrition all modulate
                decline. W/kg is the best single-number predictor of climbing performance but
                doesn&apos;t tell the full story for flat terrain (where absolute watts matter
                more) or for anaerobic capacity. If your FTP test is more than three months old,
                retest before putting too much weight on these numbers.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 &middot; Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="cycling-age" />
      </main>
      <Footer />
    </>
  );
}
