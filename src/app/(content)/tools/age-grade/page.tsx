"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { useTrack } from "@/hooks/useTrack";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

/* ── Age decline model ─────────────────────────────────────────
 *
 * Based on published research:
 * - Pino et al. (2021) masters cycling performance decline
 * - Allen & Coggan power profiling
 * - Hawkins & Wiswell VO2max decline (~7-10% per decade after 30)
 * - Pollock et al. — trained athletes decline ~5% per decade vs ~10% sedentary
 *
 * Model: peak window 25-35, then progressive decline.
 * Trained athlete curve (slower than sedentary).
 * ─────────────────────────────────────────────────────────── */

/** Age factor: fraction of peak performance expected at a given age (trained athlete). */
function getAgeFactor(age: number): number {
  if (age <= 25) return 0.97 + (age - 20) * 0.006; // ramp up to peak
  if (age <= 35) return 1.0; // peak window
  // Trained decline: ~0.5% per year 35-50, ~0.8% per year 50-60, ~1.0% per year 60+
  if (age <= 50) return 1.0 - (age - 35) * 0.005;
  if (age <= 60) return 1.0 - 15 * 0.005 - (age - 50) * 0.008;
  return 1.0 - 15 * 0.005 - 10 * 0.008 - (age - 60) * 0.01;
}

/** Sedentary decline factor for comparison (~10% per decade from 30). */
function getSedentaryFactor(age: number): number {
  if (age <= 30) return 1.0;
  return Math.max(0.4, 1.0 - (age - 30) * 0.01);
}

/* ── Percentile benchmarks for trained masters cyclists ─────── */
// [p10, p25, p50, p75, p90] W/kg by age group
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

function getPercentile(wkg: number, age: number, gender: "male" | "female"): number {
  const group = getAgeGroup(age);
  const table = gender === "male" ? MALE_WKG_PERCENTILES : FEMALE_WKG_PERCENTILES;
  const t = table[group];
  // t = [p10, p25, p50, p75, p90]
  if (wkg < t[0]) return Math.max(1, Math.round((wkg / t[0]) * 10));
  if (wkg < t[1]) return 10 + Math.round(((wkg - t[0]) / (t[1] - t[0])) * 15);
  if (wkg < t[2]) return 25 + Math.round(((wkg - t[1]) / (t[2] - t[1])) * 25);
  if (wkg < t[3]) return 50 + Math.round(((wkg - t[2]) / (t[3] - t[2])) * 25);
  if (wkg < t[4]) return 75 + Math.round(((wkg - t[3]) / (t[4] - t[3])) * 15);
  return Math.min(99, 90 + Math.round(((wkg - t[4]) / (t[4] * 0.15)) * 9));
}

function getPercentileLabel(p: number): string {
  if (p >= 90) return "Elite masters";
  if (p >= 75) return "Strong masters";
  if (p >= 50) return "Above average";
  if (p >= 25) return "Solid base";
  return "Building";
}

/* ── Decade comparison ages ────────────────────────────────── */
const DECADE_AGES = [25, 30, 35, 40, 45, 50, 55, 60, 65];

/* ── Input validation ──────────────────────────────────────── */
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
function getPeakFtpError(v: string): string | null {
  if (!v) return null;
  const n = parseInt(v);
  if (isNaN(n)) return "Please enter a valid number";
  if (n < 50) return "Peak FTP must be at least 50W";
  if (n > 600) return "Peak FTP must be under 600W";
  return null;
}

/* ── PERCENTILE BANDS (for visual) ─────────────────────────── */
const PERCENTILE_BANDS = [
  { min: 0, max: 25, label: "Building", color: "#94A3B8" },
  { min: 25, max: 50, label: "Solid base", color: "#3B82F6" },
  { min: 50, max: 75, label: "Above average", color: "#22C55E" },
  { min: 75, max: 90, label: "Strong masters", color: "#F97316" },
  { min: 90, max: 100, label: "Elite masters", color: "#EF4444" },
];

/* ── SVG age curve chart ───────────────────────────────────── */
function AgeCurveChart({
  currentAge,
  currentWkg,
  peakWkg,
  gender,
}: {
  currentAge: number;
  currentWkg: number;
  peakWkg: number;
  gender: "male" | "female";
}) {
  const W = 600;
  const H = 260;
  const PAD = { top: 30, right: 20, bottom: 40, left: 50 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const ages = Array.from({ length: 53 }, (_, i) => i + 20); // 20-72
  const maxWkg = peakWkg * 1.15;

  const toX = (age: number) => PAD.left + ((age - 20) / 52) * plotW;
  const toY = (w: number) => PAD.top + plotH - (w / maxWkg) * plotH;

  // Trained curve
  const trainedPoints = ages.map((a) => {
    const f = getAgeFactor(a);
    return { age: a, wkg: peakWkg * f };
  });
  const trainedPath = trainedPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.age).toFixed(1)} ${toY(p.wkg).toFixed(1)}`)
    .join(" ");

  // Sedentary curve
  const sedentaryPoints = ages.map((a) => {
    const f = getSedentaryFactor(a);
    return { age: a, wkg: peakWkg * f };
  });
  const sedentaryPath = sedentaryPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.age).toFixed(1)} ${toY(p.wkg).toFixed(1)}`)
    .join(" ");

  // Current position
  const cx = toX(currentAge);
  const cy = toY(currentWkg);

  // Y-axis labels
  const yTicks = [0, 1, 2, 3, 4, 5].filter((v) => v <= maxWkg);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Age vs W/kg decline curve">
      {/* Grid lines */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={toY(v)}
            y2={toY(v)}
            stroke="rgba(255,255,255,0.07)"
            strokeDasharray="4 4"
          />
          <text x={PAD.left - 8} y={toY(v) + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="11">
            {v}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {[20, 30, 40, 50, 60, 70].map((a) => (
        <text key={a} x={toX(a)} y={H - 8} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">
          {a}
        </text>
      ))}

      {/* Axis labels */}
      <text x={W / 2} y={H} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="10">
        Age
      </text>
      <text
        x={12}
        y={H / 2}
        textAnchor="middle"
        fill="rgba(255,255,255,0.35)"
        fontSize="10"
        transform={`rotate(-90, 12, ${H / 2})`}
      >
        W/kg
      </text>

      {/* Peak window shading */}
      <rect
        x={toX(25)}
        y={PAD.top}
        width={toX(35) - toX(25)}
        height={plotH}
        fill="rgba(233,89,80,0.06)"
        rx="4"
      />
      <text
        x={toX(30)}
        y={PAD.top + 14}
        textAnchor="middle"
        fill="rgba(233,89,80,0.5)"
        fontSize="9"
        fontWeight="600"
      >
        PEAK WINDOW
      </text>

      {/* Sedentary curve */}
      <path d={sedentaryPath} fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth="2" strokeDasharray="6 4" />

      {/* Trained curve */}
      <path d={trainedPath} fill="none" stroke="#E95950" strokeWidth="2.5" />

      {/* Current position */}
      <motion.circle
        cx={cx}
        cy={cy}
        r="7"
        fill="#E95950"
        stroke="#1a1a2e"
        strokeWidth="3"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      />
      <text x={cx} y={cy - 14} textAnchor="middle" fill="#E95950" fontSize="11" fontWeight="700">
        You
      </text>

      {/* Legend */}
      <g transform={`translate(${W - PAD.right - 140}, ${PAD.top + 8})`}>
        <line x1="0" y1="0" x2="18" y2="0" stroke="#E95950" strokeWidth="2.5" />
        <text x="24" y="4" fill="rgba(255,255,255,0.6)" fontSize="10">
          Trained decline
        </text>
        <line x1="0" y1="16" x2="18" y2="16" stroke="rgba(148,163,184,0.5)" strokeWidth="2" strokeDasharray="4 3" />
        <text x="24" y="20" fill="rgba(255,255,255,0.4)" fontSize="10">
          Sedentary decline
        </text>
      </g>
    </svg>
  );
}

/* ── Main component ────────────────────────────────────────── */
export default function AgeGradePage() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [ftp, setFtp] = useState("");
  const [weight, setWeight] = useState("");
  const [peakFtp, setPeakFtp] = useState("");
  const [calculated, setCalculated] = useState(false);
  const [copied, setCopied] = useState(false);
  const track = useTrack();
  const startedRef = useRef(false);

  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    track("prediction_started", { tool: "age-grade" });
  };

  useEffect(() => {
    track("race_page_viewed", { race: "age-grade" });
  }, [track]);

  const ageVal = parseInt(age) || 0;
  const ftpVal = parseInt(ftp) || 0;
  const weightVal = parseFloat(weight) || 0;
  const peakFtpVal = parseInt(peakFtp) || 0;

  const ageError = getAgeError(age);
  const ftpError = getFtpError(ftp);
  const weightError = getWeightError(weight);
  const peakFtpError = getPeakFtpError(peakFtp);

  const ready =
    ageVal > 0 && ftpVal > 0 && weightVal > 0 && !ageError && !ftpError && !weightError && !peakFtpError;

  const reset = () => setCalculated(false);

  // Calculated values
  const currentWkg = weightVal > 0 ? ftpVal / weightVal : 0;
  const ageFactor = getAgeFactor(ageVal);

  // Age-graded W/kg: adjust current W/kg upward to show peak-equivalent
  const peakEquivWkg = ageFactor > 0 ? currentWkg / ageFactor : 0;

  // If user provided a peak FTP, use that to calculate actual personal peak W/kg
  const personalPeakWkg = peakFtpVal > 0 && weightVal > 0 ? peakFtpVal / weightVal : null;

  // Peak-equivalent power in watts
  const peakEquivWatts = peakEquivWkg * weightVal;

  // Percentile among trained masters cyclists of same age/gender
  const percentile = getPercentile(currentWkg, ageVal, gender);
  const percentileLabel = getPercentileLabel(percentile);

  // Decade comparison: expected W/kg at each age assuming same relative fitness
  const decadeComparison = DECADE_AGES.map((a) => {
    const factor = getAgeFactor(a);
    // Use peak-equivalent as the baseline, then scale by age factor
    return {
      age: a,
      wkg: peakEquivWkg * factor,
      isCurrent: a === Math.round(ageVal / 5) * 5, // nearest 5
    };
  });

  // "Years of performance left" — how many years until a sedentary person
  // would reach the rider's current W/kg, vs a trained person
  const yearsTrainedOffset = (() => {
    if (ageVal <= 35) return null; // not relevant for young riders
    // Find the age at which the sedentary curve would produce the current W/kg
    const peakW = peakEquivWkg;
    let sedentaryAge = ageVal;
    for (let a = 35; a <= 80; a++) {
      if (peakW * getSedentaryFactor(a) <= currentWkg && a < ageVal) {
        sedentaryAge = a;
        break;
      }
    }
    const offset = ageVal - sedentaryAge;
    return offset > 0 ? offset : null;
  })();

  const handleCalculate = () => {
    if (!ready) return;
    markStarted();
    setCalculated(true);
    track("prediction_completed", { tool: "age-grade" });
  };

  const handleCopy = async () => {
    const text = `Age-graded cycling power — ${currentWkg.toFixed(2)} W/kg at age ${ageVal} = ${peakEquivWkg.toFixed(2)} W/kg peak-equivalent (${(ageFactor * 100).toFixed(1)}% age factor). ${percentile}th percentile among trained ${gender} masters cyclists. Calculated at roadmancycling.com/tools/age-grade`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClasses =
    "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none transition-colors";
  const errorInputClasses =
    "w-full bg-white/5 border border-red-500/60 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-red-500 focus:outline-none transition-colors";

  return (
    <>
      <Header />
      <main id="main-content">
        {/* ── Hero ───────────────────────────────────────── */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Tool &middot; Masters Cyclists
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              CYCLING AGE GRADE CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Your power doesn&apos;t tell the full story. This calculator adjusts for age-related
              decline and shows what your current fitness would have been worth at your peak —
              because comparing yourself to 28-year-olds isn&apos;t the right yardstick.
            </p>
          </Container>
        </Section>

        {/* ── Calculator ────────────────────────────────── */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              {/* Gender */}
              <div>
                <label id="ag-gender-label" className="block font-heading text-sm text-off-white mb-2">
                  GENDER
                </label>
                <div className="flex rounded-lg overflow-hidden border border-white/10" role="group" aria-labelledby="ag-gender-label">
                  {(
                    [
                      ["male", "Male"],
                      ["female", "Female"],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setGender(val);
                        reset();
                      }}
                      aria-pressed={gender === val}
                      className={`flex-1 py-3 text-sm font-heading tracking-wider transition-colors cursor-pointer ${
                        gender === val
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
                  <label htmlFor="ag-age" className="block font-heading text-sm text-off-white mb-2">
                    AGE
                  </label>
                  <input
                    id="ag-age"
                    type="number"
                    inputMode="numeric"
                    min="18"
                    max="85"
                    placeholder="e.g. 48"
                    aria-label="Your age in years"
                    aria-invalid={!!ageError}
                    value={age}
                    onChange={(e) => {
                      setAge(e.target.value);
                      reset();
                    }}
                    className={ageError ? errorInputClasses : inputClasses}
                  />
                  {ageError && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {ageError}
                    </p>
                  )}
                </div>

                {/* FTP */}
                <div>
                  <label htmlFor="ag-ftp" className="block font-heading text-sm text-off-white mb-2">
                    FTP (WATTS)
                  </label>
                  <input
                    id="ag-ftp"
                    type="number"
                    inputMode="numeric"
                    min="50"
                    max="600"
                    placeholder="e.g. 240"
                    aria-label="Functional Threshold Power in watts"
                    aria-invalid={!!ftpError}
                    value={ftp}
                    onChange={(e) => {
                      setFtp(e.target.value);
                      reset();
                    }}
                    className={ftpError ? errorInputClasses : inputClasses}
                  />
                  {ftpError && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {ftpError}
                    </p>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <label htmlFor="ag-weight" className="block font-heading text-sm text-off-white mb-2">
                    WEIGHT (KG)
                  </label>
                  <input
                    id="ag-weight"
                    type="number"
                    inputMode="decimal"
                    min="40"
                    max="150"
                    step="0.1"
                    placeholder="e.g. 76"
                    aria-label="Your body weight in kilograms"
                    aria-invalid={!!weightError}
                    value={weight}
                    onChange={(e) => {
                      setWeight(e.target.value);
                      reset();
                    }}
                    className={weightError ? errorInputClasses : inputClasses}
                  />
                  {weightError && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {weightError}
                    </p>
                  )}
                </div>

                {/* Peak FTP (optional) */}
                <div>
                  <label htmlFor="ag-peak-ftp" className="block font-heading text-sm text-off-white mb-2">
                    PEAK FTP (OPTIONAL)
                  </label>
                  <input
                    id="ag-peak-ftp"
                    type="number"
                    inputMode="numeric"
                    min="50"
                    max="600"
                    placeholder="e.g. 300"
                    aria-label="Your best-ever FTP in watts, if known"
                    aria-invalid={!!peakFtpError}
                    value={peakFtp}
                    onChange={(e) => {
                      setPeakFtp(e.target.value);
                      reset();
                    }}
                    className={peakFtpError ? errorInputClasses : inputClasses}
                  />
                  {peakFtpError && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {peakFtpError}
                    </p>
                  )}
                  <p className="text-xs text-foreground-subtle mt-2">
                    If you know your best-ever FTP, enter it here. We&apos;ll show how your
                    current output compares to your personal peak.
                  </p>
                </div>
              </div>

              <Button onClick={handleCalculate} size="lg" className="w-full" disabled={!ready}>
                Age-Grade My Power
              </Button>
            </div>

            {/* ── Results ─────────────────────────────────── */}
            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && currentWkg > 0 && (
                  <motion.div
                    className="mt-8 space-y-4"
                    key={`${ftpVal}-${weightVal}-${ageVal}-${gender}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Header + copy */}
                    <div className="flex items-center justify-between">
                      <h2 className="font-heading text-2xl text-off-white">YOUR AGE-GRADED RESULT</h2>
                      <button
                        onClick={handleCopy}
                        aria-label={copied ? "Results copied to clipboard" : "Copy results to clipboard"}
                        className="text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                      >
                        {copied ? "Copied!" : "Copy Results"}
                      </button>
                    </div>

                    {/* Big number: peak-equivalent W/kg */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-8 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    >
                      <p className="text-foreground-subtle text-xs mb-2 tracking-widest">
                        PEAK-EQUIVALENT POWER
                      </p>
                      <p className="font-heading text-6xl md:text-8xl text-coral mb-1">
                        {peakEquivWkg.toFixed(2)}
                      </p>
                      <p className="font-heading text-lg text-off-white tracking-widest mb-3">
                        W/KG
                      </p>
                      <p className="text-foreground-muted text-sm leading-relaxed max-w-lg mx-auto">
                        Your {currentWkg.toFixed(2)} W/kg at age {ageVal} is equivalent to{" "}
                        <strong className="text-coral">{peakEquivWkg.toFixed(2)} W/kg at peak age</strong>.
                        That&apos;s {peakEquivWatts.toFixed(0)}W at your current weight.
                      </p>
                    </motion.div>

                    {/* Key metrics row */}
                    <motion.div
                      className="grid grid-cols-3 gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.18 }}
                    >
                      <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                        <p className="text-xs text-foreground-subtle mb-1">CURRENT W/KG</p>
                        <p className="font-heading text-3xl text-coral">{currentWkg.toFixed(2)}</p>
                      </div>
                      <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                        <p className="text-xs text-foreground-subtle mb-1">AGE FACTOR</p>
                        <p className="font-heading text-3xl text-off-white">
                          {(ageFactor * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                        <p className="text-xs text-foreground-subtle mb-1">PERCENTILE</p>
                        <p className="font-heading text-3xl text-off-white">{percentile}th</p>
                      </div>
                    </motion.div>

                    {/* Personal peak comparison (if provided) */}
                    {personalPeakWkg !== null && (
                      <motion.div
                        className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.24 }}
                      >
                        <h3 className="font-heading text-lg text-off-white mb-3">
                          VS YOUR PERSONAL PEAK
                        </h3>
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          Your best-ever FTP of {peakFtpVal}W gave you{" "}
                          <strong className="text-off-white">{personalPeakWkg.toFixed(2)} W/kg</strong>.
                          You&apos;re currently at{" "}
                          <strong className="text-coral">{((currentWkg / personalPeakWkg) * 100).toFixed(1)}%</strong> of
                          that personal best. Based on the trained-athlete decline curve, the expected retention
                          at age {ageVal} is {(ageFactor * 100).toFixed(1)}% —{" "}
                          {currentWkg / personalPeakWkg >= ageFactor ? (
                            <span>
                              you&apos;re <strong className="text-coral">outperforming</strong> the expected
                              decline. Your training is working.
                            </span>
                          ) : (
                            <span>
                              there&apos;s room to close the gap. Structured training can recover some of
                              that difference.
                            </span>
                          )}
                        </p>
                      </motion.div>
                    )}

                    {/* Percentile ranking */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.3 }}
                    >
                      <p className="text-xs text-foreground-subtle mb-3">
                        AMONG TRAINED {gender.toUpperCase()} CYCLISTS AGED {getAgeGroup(ageVal).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="font-heading text-3xl text-coral">
                          {percentileLabel}
                        </span>
                        <span className="text-foreground-muted text-sm">
                          {percentile}th percentile
                        </span>
                      </div>

                      {/* Percentile bar */}
                      <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-3">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-coral/60 to-coral"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentile}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-foreground-subtle mb-4">
                        <span>0th</span>
                        <span>50th</span>
                        <span>100th</span>
                      </div>

                      {/* Band indicators */}
                      <div className="space-y-2">
                        {PERCENTILE_BANDS.map((b) => {
                          const isActive = percentile >= b.min && percentile < b.max;
                          return (
                            <div
                              key={b.label}
                              className={`flex items-center gap-4 rounded-lg p-3 transition-all ${
                                isActive ? "bg-white/[0.08] border border-white/15" : ""
                              }`}
                            >
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: b.color }}
                              />
                              <span className="text-off-white text-sm flex-1">{b.label}</span>
                              <span className="text-foreground-subtle text-xs">
                                {b.min}–{Math.min(99, b.max)}th
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Age curve chart */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.36 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-4">
                        YOUR POSITION ON THE CURVE
                      </h3>
                      <AgeCurveChart
                        currentAge={ageVal}
                        currentWkg={currentWkg}
                        peakWkg={peakEquivWkg}
                        gender={gender}
                      />
                      <p className="text-foreground-subtle text-xs mt-3">
                        Solid line = trained athlete decline. Dashed = sedentary decline.
                        The gap between curves is what consistent training protects.
                      </p>
                    </motion.div>

                    {/* Decade comparison table */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.42 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-4">
                        DECADE COMPARISON
                      </h3>
                      <p className="text-foreground-subtle text-xs mb-4">
                        Expected W/kg at each age, assuming the same relative fitness level you have
                        right now.
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left font-heading text-foreground-subtle py-2 pr-4">
                                AGE
                              </th>
                              <th className="text-right font-heading text-foreground-subtle py-2 pr-4">
                                W/KG
                              </th>
                              <th className="text-right font-heading text-foreground-subtle py-2">
                                WATTS
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {decadeComparison.map((row) => {
                              const isNearCurrent = Math.abs(row.age - ageVal) <= 2;
                              return (
                                <tr
                                  key={row.age}
                                  className={`border-b border-white/5 ${
                                    isNearCurrent ? "bg-coral/10" : ""
                                  }`}
                                >
                                  <td className="py-2 pr-4">
                                    <span
                                      className={`${isNearCurrent ? "text-coral font-heading" : "text-off-white"}`}
                                    >
                                      {row.age}
                                      {isNearCurrent && " ←"}
                                    </span>
                                  </td>
                                  <td
                                    className={`text-right py-2 pr-4 font-heading ${
                                      isNearCurrent ? "text-coral" : "text-off-white"
                                    }`}
                                  >
                                    {row.wkg.toFixed(2)}
                                  </td>
                                  <td
                                    className={`text-right py-2 ${
                                      isNearCurrent ? "text-coral" : "text-foreground-muted"
                                    }`}
                                  >
                                    {(row.wkg * weightVal).toFixed(0)}W
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>

                    {/* Training offsets age — the motivational section */}
                    <motion.div
                      className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.48 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-3">
                        WHAT TRAINING PROTECTS
                      </h3>
                      <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
                        <p>
                          The research is clear: structured training doesn&apos;t stop age-related
                          decline, but it halves the rate. Trained masters athletes lose roughly
                          5% per decade where sedentary peers lose 10%.
                        </p>
                        {yearsTrainedOffset !== null && yearsTrainedOffset >= 3 && (
                          <p>
                            At your current output, a sedentary person your height and weight would have
                            needed to be roughly{" "}
                            <strong className="text-coral">{yearsTrainedOffset} years younger</strong> to
                            match you. Your training has effectively bought you those years back.
                          </p>
                        )}
                        <p>
                          The biggest levers for masters cyclists: polarised intensity distribution
                          (80/20 easy/hard), targeted strength work twice a week, and treating
                          recovery as a session — not an afterthought.
                        </p>
                      </div>
                    </motion.div>

                    {/* What next */}
                    <motion.div
                      className="rounded-xl border border-white/10 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.54 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-3">LEARN MORE</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/tools/masters-ftp-benchmark"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Masters FTP benchmark — percentile in your age group
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/vo2max"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            VO2max estimator with age-adjusted percentiles
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/blog/masters-cyclist-guide-getting-faster-after-40"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Masters cyclist guide — getting faster after 40
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/masters-recovery-score"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Masters recovery score calculator
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/ftp-zones"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Calculate your power zones
                          </Link>
                        </li>
                      </ul>
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                      className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.6 }}
                    >
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">
                        NOT DONE YET
                      </p>
                      <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                        Your age factor is a floor, not a ceiling.
                      </p>
                      <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                        The right training structure can offset 10-15 years of age-related decline.
                        Polarised intensity, strength work, and recovery treated as a session —
                        built around how your body actually responds now, not at 28.
                      </p>
                      <a
                        href="/apply"
                        className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                        data-track="tool_agegrade_apply"
                      >
                        Apply for Coaching
                      </a>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* ── Methodology ─────────────────────────────────── */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              METHODOLOGY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">Age decline model:</strong> The age factor is
                built from published research on cycling performance and ageing. Peak performance
                occurs in a window of roughly 25-35. After 35, trained athletes show a decline of
                approximately 0.5% per year to age 50, accelerating to ~0.8% per year from 50-60
                and ~1.0% per year beyond 60. This is the <em>trained athlete</em> curve — sedentary
                individuals decline roughly twice as fast (~10% per decade vs ~5%). Key references:
                Pino et al. (2021), Allen &amp; Coggan power profiling, Hawkins &amp; Wiswell VO2max
                decline data, and Pollock et al. on masters athlete adaptation.
              </p>
              <p>
                <strong className="text-off-white">Peak-equivalent power:</strong> Your current W/kg
                is divided by the age factor to produce a peak-equivalent figure. This answers:
                &quot;If I were in the 25-35 peak window with the same relative fitness, what would
                my W/kg be?&quot; It is an estimate, not a lab result — individual variation in
                ageing rate is significant.
              </p>
              <p>
                <strong className="text-off-white">Percentile benchmarks:</strong> The percentile
                tables are heuristic distributions of trained amateur cyclists by age group and
                gender, derived from Coggan power profiling adjusted for non-professional
                populations. They represent <em>trained</em> riders — not the general population.
                A 50th percentile here means you&apos;re in the middle of people who train consistently,
                which is already well above the general cycling population.
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> Age-related decline is
                individual. Genetics, training history, injury history, stress, sleep, and nutrition
                all modulate the rate. This model uses population-level curves that may not match
                your specific trajectory. W/kg predicts climbing performance but not flat-terrain
                output (where absolute watts dominate). FTP accuracy is the biggest variable — if
                your last test was more than three months ago, retest first.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 &middot; Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="age-grade" />
      </main>
      <Footer />
    </>
  );
}
