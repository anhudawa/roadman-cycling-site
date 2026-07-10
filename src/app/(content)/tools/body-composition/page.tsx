"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import { TOOL_EVENTS, trackTool } from "@/lib/analytics/tool-events";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Gender = "male" | "female";

interface BodyCompResult {
  bodyFatPct: number;
  fatMassKg: number;
  leanMassKg: number;
  category: string;
  categoryColor: string;
  minSafeWeightKg: number;
  essentialFatPct: number;
  redsRisk: boolean;
  wkgCurrent: number | null;
  wkgProjections: { lossKg: number; newWeight: number; wkg: number; secondsSavedPerKm: number }[];
  seasonalTargets: { phase: string; bfMin: number; bfMax: number; note: string }[];
}

/* ------------------------------------------------------------------ */
/*  Body fat categories — cycling-specific, not generic health         */
/* ------------------------------------------------------------------ */

interface BfCategory {
  label: string;
  color: string;
  male: [number, number];
  female: [number, number];
}

const BF_CATEGORIES: BfCategory[] = [
  { label: "Essential fat", color: "#EF4444", male: [0, 5], female: [0, 12] },
  { label: "Race lean", color: "#F97316", male: [5, 8], female: [12, 16] },
  { label: "Athletic", color: "#22C55E", male: [8, 13], female: [16, 22] },
  { label: "Fit", color: "#3B82F6", male: [13, 18], female: [22, 28] },
  { label: "Average", color: "#8B5CF6", male: [18, 25], female: [28, 35] },
  { label: "Above average", color: "#6B7280", male: [25, 100], female: [35, 100] },
];

function getCategory(bf: number, gender: Gender): { label: string; color: string } {
  const key = gender === "male" ? "male" : "female";
  for (const cat of BF_CATEGORIES) {
    const [min, max] = cat[key];
    if (bf >= min && bf < max) return { label: cat.label, color: cat.color };
  }
  return { label: "Above average", color: "#6B7280" };
}

/* ------------------------------------------------------------------ */
/*  US Navy body fat formula                                           */
/* ------------------------------------------------------------------ */

function calcBodyFatNavy(
  gender: Gender,
  waistCm: number,
  neckCm: number,
  heightCm: number,
  hipCm: number,
): number {
  if (gender === "male") {
    return 86.010 * Math.log10(waistCm - neckCm) - 70.041 * Math.log10(heightCm) + 36.76;
  }
  return 163.205 * Math.log10(waistCm + hipCm - neckCm) - 97.684 * Math.log10(heightCm) - 78.387;
}

/* ------------------------------------------------------------------ */
/*  Climb time cost per kg — 10% gradient, 1km                        */
/*  Power saved = mass_reduction * g * sin(atan(0.10))                 */
/*  At a reference power, time = distance / speed                      */
/*  seconds_saved = (old_time - new_time)                              */
/* ------------------------------------------------------------------ */

function secondsSavedPerKmAt10Pct(massReductionKg: number, totalMassKg: number, ftpWatts: number): number {
  const gradient = 0.10;
  const g = 9.81;
  const sinGrad = Math.sin(Math.atan(gradient));
  const distance = 1000; // 1km
  const climbPower = ftpWatts * 0.85; // sustained climbing effort

  const oldSpeed = climbPower / (totalMassKg * g * sinGrad);
  const newSpeed = climbPower / ((totalMassKg - massReductionKg) * g * sinGrad);

  const oldTime = distance / oldSpeed;
  const newTime = distance / newSpeed;

  return oldTime - newTime;
}

/* ------------------------------------------------------------------ */
/*  Seasonal body composition targets                                  */
/* ------------------------------------------------------------------ */

function getSeasonalTargets(gender: Gender): { phase: string; bfMin: number; bfMax: number; note: string }[] {
  if (gender === "male") {
    return [
      { phase: "Off-season", bfMin: 12, bfMax: 18, note: "Recovery and adaptation. Do not chase leanness here." },
      { phase: "Base / Build", bfMin: 10, bfMax: 15, note: "Gradual composition shift through training and nutrition quality." },
      { phase: "Race season", bfMin: 7, bfMax: 12, note: "Peak performance window. Lower end only for climbers and short-stage racing." },
    ];
  }
  return [
    { phase: "Off-season", bfMin: 20, bfMax: 28, note: "Recovery and adaptation. Do not chase leanness here." },
    { phase: "Base / Build", bfMin: 18, bfMax: 24, note: "Gradual composition shift through training and nutrition quality." },
    { phase: "Race season", bfMin: 14, bfMax: 20, note: "Peak performance window. Lower end only for climbers and short-stage racing." },
  ];
}

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

const VALIDATION = {
  weight: { min: 30, max: 200, label: "Weight", unit: "kg" },
  height: { min: 120, max: 230, label: "Height", unit: "cm" },
  age: { min: 16, max: 85, label: "Age", unit: "" },
  waist: { min: 40, max: 180, label: "Waist", unit: "cm" },
  neck: { min: 20, max: 60, label: "Neck", unit: "cm" },
  hip: { min: 50, max: 180, label: "Hip", unit: "cm" },
  ftp: { min: 50, max: 600, label: "FTP", unit: "W" },
} as const;

function getValidationError(value: string, field: keyof typeof VALIDATION): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Please enter a valid number";
  const { min, max, label, unit } = VALIDATION[field];
  if (num < min) return `${label} must be at least ${min}${unit}`;
  if (num > max) return `${label} must be under ${max}${unit}`;
  return null;
}

/* ------------------------------------------------------------------ */
/*  Compute result                                                     */
/* ------------------------------------------------------------------ */

function computeResult(
  weight: number,
  height: number,
  gender: Gender,
  waist: number,
  neck: number,
  hip: number,
  ftp: number | null,
): BodyCompResult {
  const bf = calcBodyFatNavy(gender, waist, neck, height, hip);
  const clampedBf = Math.max(2, Math.min(bf, 55));
  const fatMass = weight * (clampedBf / 100);
  const leanMass = weight - fatMass;

  const cat = getCategory(clampedBf, gender);

  const essentialFatPct = gender === "male" ? 5 : 12;
  const minSafeWeight = leanMass / (1 - essentialFatPct / 100);

  const redsRisk = gender === "male" ? clampedBf < 5 : clampedBf < 12;

  const wkgCurrent = ftp ? ftp / weight : null;

  const wkgProjections: BodyCompResult["wkgProjections"] = [];
  if (ftp) {
    for (const loss of [2, 4, 6]) {
      const newWeight = weight - loss;
      if (newWeight < minSafeWeight) break;
      wkgProjections.push({
        lossKg: loss,
        newWeight: Math.round(newWeight * 10) / 10,
        wkg: Math.round((ftp / newWeight) * 100) / 100,
        secondsSavedPerKm: Math.round(secondsSavedPerKmAt10Pct(loss, weight, ftp) * 10) / 10,
      });
    }
  }

  return {
    bodyFatPct: Math.round(clampedBf * 10) / 10,
    fatMassKg: Math.round(fatMass * 10) / 10,
    leanMassKg: Math.round(leanMass * 10) / 10,
    category: cat.label,
    categoryColor: cat.color,
    minSafeWeightKg: Math.round(minSafeWeight * 10) / 10,
    essentialFatPct,
    redsRisk,
    wkgCurrent,
    wkgProjections,
    seasonalTargets: getSeasonalTargets(gender),
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BodyCompositionPage() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("");
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [hip, setHip] = useState("");
  const [ftp, setFtp] = useState("");
  const [result, setResult] = useState<BodyCompResult | null>(null);
  const [copied, setCopied] = useState(false);

  const weightError = getValidationError(weight, "weight");
  const heightError = getValidationError(height, "height");
  const ageError = getValidationError(age, "age");
  const waistError = getValidationError(waist, "waist");
  const neckError = getValidationError(neck, "neck");
  const hipError = getValidationError(hip, "hip");
  const ftpError = getValidationError(ftp, "ftp");

  const hasErrors = !!weightError || !!heightError || !!ageError || !!waistError || !!neckError || !!ftpError || (gender === "female" && !!hipError);

  const canCalculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    const wa = parseFloat(waist);
    const n = parseFloat(neck);
    if (!w || !h || !a || !wa || !n) return false;
    if (gender === "female" && !parseFloat(hip)) return false;
    if (wa <= n) return false;
    return !hasErrors;
  };

  const handleCalculate = () => {
    if (!canCalculate()) return;
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const wa = parseFloat(waist);
    const n = parseFloat(neck);
    const hi = parseFloat(hip) || 0;
    const f = parseFloat(ftp) || null;

    const r = computeResult(w, h, gender, wa, n, hi, f);
    setResult(r);

    trackTool({
      name: TOOL_EVENTS.COMPLETED,
      tool: "body_composition",
      meta: { gender, bodyFatPct: r.bodyFatPct, category: r.category },
    });
  };

  const handleCopyResults = async () => {
    if (!result) return;
    const lines = [
      `Body Composition (US Navy method)`,
      ``,
      `Body fat: ${result.bodyFatPct}%`,
      `Lean mass: ${result.leanMassKg} kg | Fat mass: ${result.fatMassKg} kg`,
      `Category: ${result.category}`,
      `Min safe racing weight: ${result.minSafeWeightKg} kg`,
    ];
    if (result.wkgCurrent) {
      lines.push(`Current W/kg: ${result.wkgCurrent.toFixed(2)}`);
    }
    lines.push(``, `-- roadmancycling.com/tools/body-composition`);
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetResult = () => setResult(null);

  const inputClasses =
    "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none transition-colors";
  const errorInputClasses =
    "w-full bg-white/5 border border-red-500/60 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-red-500 focus:outline-none transition-colors";

  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Tool
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              BODY COMPOSITION CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Body fat, lean mass, and fat mass via the US Navy method. No
              calipers, no lab visit. Cycling-specific context: W/kg impact,
              minimum safe racing weight, and seasonal targets for your frame.
            </p>
          </Container>
        </Section>

        {/* Calculator */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              {/* Gender */}
              <div>
                <label
                  id="bc-gender-label"
                  className="block font-heading text-lg text-off-white mb-2"
                >
                  GENDER
                </label>
                <div
                  className="flex gap-3"
                  role="group"
                  aria-labelledby="bc-gender-label"
                >
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
                        resetResult();
                      }}
                      aria-pressed={gender === val}
                      className={`flex-1 py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        gender === val
                          ? "bg-coral text-off-white"
                          : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight */}
              <div>
                <label
                  htmlFor="bc-weight"
                  className="block font-heading text-lg text-off-white mb-2"
                >
                  WEIGHT (KG)
                </label>
                <input
                  id="bc-weight"
                  type="number"
                  inputMode="decimal"
                  min="30"
                  max="200"
                  step="0.1"
                  placeholder="e.g. 78"
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    resetResult();
                  }}
                  className={weightError ? errorInputClasses : inputClasses}
                />
                {weightError && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {weightError}
                  </p>
                )}
              </div>

              {/* Height */}
              <div>
                <label
                  htmlFor="bc-height"
                  className="block font-heading text-lg text-off-white mb-2"
                >
                  HEIGHT (CM)
                </label>
                <input
                  id="bc-height"
                  type="number"
                  inputMode="numeric"
                  min="120"
                  max="230"
                  placeholder="e.g. 178"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    resetResult();
                  }}
                  className={heightError ? errorInputClasses : inputClasses}
                />
                {heightError && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {heightError}
                  </p>
                )}
              </div>

              {/* Age */}
              <div>
                <label
                  htmlFor="bc-age"
                  className="block font-heading text-lg text-off-white mb-2"
                >
                  AGE
                </label>
                <input
                  id="bc-age"
                  type="number"
                  inputMode="numeric"
                  min="16"
                  max="85"
                  placeholder="e.g. 44"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    resetResult();
                  }}
                  className={ageError ? errorInputClasses : inputClasses}
                />
                {ageError && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {ageError}
                  </p>
                )}
              </div>

              {/* Waist */}
              <div>
                <label
                  htmlFor="bc-waist"
                  className="block font-heading text-lg text-off-white mb-2"
                >
                  WAIST CIRCUMFERENCE (CM)
                </label>
                <p className="text-xs text-foreground-subtle mb-2">
                  Measure at the navel, relaxed. Do not suck in.
                </p>
                <input
                  id="bc-waist"
                  type="number"
                  inputMode="decimal"
                  min="40"
                  max="180"
                  step="0.5"
                  placeholder="e.g. 84"
                  value={waist}
                  onChange={(e) => {
                    setWaist(e.target.value);
                    resetResult();
                  }}
                  className={waistError ? errorInputClasses : inputClasses}
                />
                {waistError && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {waistError}
                  </p>
                )}
              </div>

              {/* Neck */}
              <div>
                <label
                  htmlFor="bc-neck"
                  className="block font-heading text-lg text-off-white mb-2"
                >
                  NECK CIRCUMFERENCE (CM)
                </label>
                <p className="text-xs text-foreground-subtle mb-2">
                  Measure just below the larynx (Adam&apos;s apple), tape
                  sloping slightly downward at the front.
                </p>
                <input
                  id="bc-neck"
                  type="number"
                  inputMode="decimal"
                  min="20"
                  max="60"
                  step="0.5"
                  placeholder="e.g. 38"
                  value={neck}
                  onChange={(e) => {
                    setNeck(e.target.value);
                    resetResult();
                  }}
                  className={neckError ? errorInputClasses : inputClasses}
                />
                {neckError && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {neckError}
                  </p>
                )}
              </div>

              {/* Hip (females only) */}
              <AnimatePresence>
                {gender === "female" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <label
                      htmlFor="bc-hip"
                      className="block font-heading text-lg text-off-white mb-2"
                    >
                      HIP CIRCUMFERENCE (CM)
                    </label>
                    <p className="text-xs text-foreground-subtle mb-2">
                      Measure at the widest point of the hips/buttocks.
                    </p>
                    <input
                      id="bc-hip"
                      type="number"
                      inputMode="decimal"
                      min="50"
                      max="180"
                      step="0.5"
                      placeholder="e.g. 98"
                      value={hip}
                      onChange={(e) => {
                        setHip(e.target.value);
                        resetResult();
                      }}
                      className={hipError ? errorInputClasses : inputClasses}
                    />
                    {hipError && (
                      <p className="text-red-400 text-xs mt-1" role="alert">
                        {hipError}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* FTP (optional) */}
              <div>
                <label
                  htmlFor="bc-ftp"
                  className="block font-heading text-lg text-off-white mb-2"
                >
                  FTP (WATTS) — OPTIONAL
                </label>
                <p className="text-xs text-foreground-subtle mb-2">
                  If you know your FTP, enter it to see W/kg projections at
                  different body compositions. Don&apos;t know it?{" "}
                  <Link
                    href="/tools/ftp-test"
                    className="text-coral hover:text-coral/80 transition-colors"
                  >
                    FTP Test Calculator
                  </Link>
                  .
                </p>
                <input
                  id="bc-ftp"
                  type="number"
                  inputMode="numeric"
                  min="50"
                  max="600"
                  placeholder="e.g. 260"
                  value={ftp}
                  onChange={(e) => {
                    setFtp(e.target.value);
                    resetResult();
                  }}
                  className={ftpError ? errorInputClasses : inputClasses}
                />
                {ftpError && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {ftpError}
                  </p>
                )}
              </div>

              {/* Waist > Neck validation */}
              {waist && neck && parseFloat(waist) <= parseFloat(neck) && (
                <p className="text-red-400 text-xs" role="alert">
                  Waist must be larger than neck circumference.
                </p>
              )}

              <Button
                onClick={handleCalculate}
                size="lg"
                className="w-full"
              >
                Calculate
              </Button>
            </div>

            {/* -------------------------------------------------------- */}
            {/*  Results                                                  */}
            {/* -------------------------------------------------------- */}
            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {result && (
                  <motion.div
                    className="mt-8 space-y-4"
                    key={`${result.bodyFatPct}-${result.leanMassKg}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Header + Copy */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h2 className="font-heading text-xl sm:text-2xl text-off-white">
                        YOUR BODY COMPOSITION
                      </h2>
                      <button
                        onClick={handleCopyResults}
                        aria-label={
                          copied
                            ? "Results copied to clipboard"
                            : "Copy results to clipboard"
                        }
                        className="self-start sm:self-auto shrink-0 inline-flex items-center min-h-[44px] px-3 -ml-3 sm:ml-0 text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                      >
                        {copied ? "Copied!" : "Copy Results"}
                      </button>
                    </div>

                    {/* RED-S Warning */}
                    {result.redsRisk && (
                      <motion.div
                        className="rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-6"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, delay: 0.08 }}
                      >
                        <h3 className="font-heading text-lg text-amber-400 mb-2">
                          RED-S RISK FLAG
                        </h3>
                        <p className="text-foreground-muted text-sm leading-relaxed mb-3">
                          Your estimated body fat ({result.bodyFatPct}%) is at or
                          below the essential fat threshold for{" "}
                          {gender === "male" ? "men" : "women"} (
                          {result.essentialFatPct}%). Body fat this low is
                          associated with Relative Energy Deficiency in Sport
                          (RED-S), which impairs bone density, hormonal function,
                          immune response, and long-term performance.
                        </p>
                        <p className="text-foreground-muted text-sm leading-relaxed mb-3">
                          This is not a target. If your training or nutrition
                          strategy is driving body fat below this threshold,
                          consult a sports physician or registered dietitian.
                        </p>
                        <Link
                          href="/tools/energy-availability"
                          className="text-coral hover:text-coral/80 text-sm font-heading tracking-wider transition-colors"
                        >
                          Check your energy availability
                        </Link>
                      </motion.div>
                    )}

                    {/* Key metrics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <motion.div
                        className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, delay: 0.1 }}
                      >
                        <p className="text-sm text-foreground-subtle mb-1">
                          BODY FAT
                        </p>
                        <p className="font-heading text-3xl text-coral stat-glow">
                          {result.bodyFatPct}%
                        </p>
                        <p
                          className="text-sm font-heading mt-1"
                          style={{ color: result.categoryColor }}
                        >
                          {result.category}
                        </p>
                      </motion.div>
                      <motion.div
                        className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, delay: 0.16 }}
                      >
                        <p className="text-sm text-foreground-subtle mb-1">
                          LEAN MASS
                        </p>
                        <p className="font-heading text-3xl text-off-white">
                          {result.leanMassKg}
                        </p>
                        <p className="text-foreground-muted text-sm">kg</p>
                      </motion.div>
                      <motion.div
                        className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, delay: 0.22 }}
                      >
                        <p className="text-sm text-foreground-subtle mb-1">
                          FAT MASS
                        </p>
                        <p className="font-heading text-3xl text-off-white">
                          {result.fatMassKg}
                        </p>
                        <p className="text-foreground-muted text-sm">kg</p>
                      </motion.div>
                      {result.wkgCurrent && (
                        <motion.div
                          className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.28 }}
                        >
                          <p className="text-sm text-foreground-subtle mb-1">
                            CURRENT W/KG
                          </p>
                          <p className="font-heading text-3xl text-coral stat-glow">
                            {result.wkgCurrent.toFixed(2)}
                          </p>
                          <p className="text-foreground-muted text-sm">W/kg</p>
                        </motion.div>
                      )}
                      <motion.div
                        className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, delay: 0.34 }}
                      >
                        <p className="text-sm text-foreground-subtle mb-1">
                          MIN SAFE WEIGHT
                        </p>
                        <p className="font-heading text-3xl text-off-white">
                          {result.minSafeWeightKg}
                        </p>
                        <p className="text-foreground-muted text-sm">
                          kg ({result.essentialFatPct}% BF floor)
                        </p>
                      </motion.div>
                    </div>

                    {/* Visual composition bar */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-4">
                        COMPOSITION BREAKDOWN
                      </h3>
                      <div className="relative h-10 rounded-lg overflow-hidden bg-white/5">
                        <motion.div
                          className="absolute left-0 top-0 h-full rounded-l-lg bg-gradient-to-r from-blue-500 to-blue-400"
                          style={{ width: `${100 - result.bodyFatPct}%` }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            duration: 0.7,
                            delay: 0.35,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        />
                        <motion.div
                          className="absolute right-0 top-0 h-full rounded-r-lg bg-gradient-to-r from-amber-500 to-amber-400"
                          style={{ width: `${result.bodyFatPct}%` }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            duration: 0.7,
                            delay: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <span className="text-blue-400 font-heading">
                          LEAN {(100 - result.bodyFatPct).toFixed(1)}% (
                          {result.leanMassKg} kg)
                        </span>
                        <span className="text-amber-400 font-heading">
                          FAT {result.bodyFatPct}% ({result.fatMassKg} kg)
                        </span>
                      </div>
                    </motion.div>

                    {/* Body fat category scale */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-4">
                        WHERE YOU SIT — CYCLING RANGES
                      </h3>
                      <div className="space-y-2">
                        {BF_CATEGORIES.filter(
                          (c) => c.label !== "Above average",
                        ).map((cat, i) => {
                          const [min, max] =
                            gender === "male" ? cat.male : cat.female;
                          const isActive =
                            result.bodyFatPct >= min && result.bodyFatPct < max;
                          return (
                            <motion.div
                              key={cat.label}
                              className={`flex items-center justify-between rounded-lg px-4 py-2 ${
                                isActive
                                  ? "bg-white/10 border border-white/20"
                                  : "bg-white/[0.02]"
                              }`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: 0.38 + i * 0.05,
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: cat.color }}
                                />
                                <span
                                  className={`font-heading text-sm ${isActive ? "text-off-white" : "text-foreground-muted"}`}
                                >
                                  {cat.label.toUpperCase()}
                                </span>
                              </div>
                              <span
                                className={`font-heading text-sm ${isActive ? "text-coral" : "text-foreground-subtle"}`}
                              >
                                {min}-{max === 100 ? "+" : max}%
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-foreground-subtle mt-3">
                        These are cycling-specific ranges, not generic health
                        guidelines. &quot;Race lean&quot; is a peak state
                        sustained for weeks, not a year-round target.
                      </p>
                    </motion.div>

                    {/* W/kg projections — only if FTP provided */}
                    {result.wkgCurrent &&
                      result.wkgProjections.length > 0 && (
                        <motion.div
                          className="bg-background-elevated rounded-xl border border-white/5 p-6"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.4 }}
                        >
                          <h3 className="font-heading text-lg text-off-white mb-2">
                            W/KG IMPACT OF FAT LOSS
                          </h3>
                          <p className="text-sm text-foreground-muted mb-4">
                            What happens to your power-to-weight if you drop
                            body fat while holding FTP constant. Each row also
                            shows time saved per km on a 10% climb.
                          </p>

                          {/* Desktop table */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-white/10">
                                  <th className="text-left font-heading text-foreground-muted py-3 pr-4">
                                    FAT LOST
                                  </th>
                                  <th className="text-left font-heading text-foreground-muted py-3 pr-4">
                                    NEW WEIGHT
                                  </th>
                                  <th className="text-left font-heading text-foreground-muted py-3 pr-4">
                                    W/KG
                                  </th>
                                  <th className="text-left font-heading text-foreground-muted py-3">
                                    TIME SAVED / KM @ 10%
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-white/5">
                                  <td className="py-3 pr-4 text-foreground-subtle">
                                    Current
                                  </td>
                                  <td className="py-3 pr-4 text-foreground-muted">
                                    {parseFloat(weight)} kg
                                  </td>
                                  <td className="py-3 pr-4 text-off-white font-heading">
                                    {result.wkgCurrent!.toFixed(2)}
                                  </td>
                                  <td className="py-3 text-foreground-subtle">
                                    --
                                  </td>
                                </tr>
                                {result.wkgProjections.map((proj, i) => (
                                  <tr
                                    key={proj.lossKg}
                                    className={
                                      i < result.wkgProjections.length - 1
                                        ? "border-b border-white/5"
                                        : ""
                                    }
                                  >
                                    <td className="py-3 pr-4 text-off-white">
                                      -{proj.lossKg} kg
                                    </td>
                                    <td className="py-3 pr-4 text-foreground-muted">
                                      {proj.newWeight} kg
                                    </td>
                                    <td className="py-3 pr-4 text-coral font-heading">
                                      {proj.wkg.toFixed(2)}
                                    </td>
                                    <td className="py-3 text-green-400 font-heading">
                                      -{proj.secondsSavedPerKm}s
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile cards */}
                          <div className="md:hidden space-y-3">
                            <div className="bg-white/5 rounded-lg p-4">
                              <p className="font-heading text-xs text-foreground-subtle mb-1">
                                CURRENT
                              </p>
                              <div className="flex justify-between text-sm">
                                <span className="text-foreground-muted">
                                  {parseFloat(weight)} kg
                                </span>
                                <span className="text-off-white font-heading">
                                  {result.wkgCurrent!.toFixed(2)} W/kg
                                </span>
                              </div>
                            </div>
                            {result.wkgProjections.map((proj) => (
                              <div
                                key={proj.lossKg}
                                className="bg-white/5 rounded-lg p-4"
                              >
                                <p className="font-heading text-xs text-coral mb-1">
                                  -{proj.lossKg} KG FAT LOSS
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-foreground-subtle">
                                      Weight:{" "}
                                    </span>
                                    <span className="text-foreground-muted">
                                      {proj.newWeight} kg
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-foreground-subtle">
                                      W/kg:{" "}
                                    </span>
                                    <span className="text-coral font-heading">
                                      {proj.wkg.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-foreground-subtle">
                                      Saves:{" "}
                                    </span>
                                    <span className="text-green-400 font-heading">
                                      {proj.secondsSavedPerKm}s per km @ 10%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <p className="text-xs text-foreground-subtle mt-4">
                            Assumes FTP stays constant — which it will if the
                            deficit is moderate (250-500 kcal/day) and protein
                            intake stays above 1.6 g/kg. Aggressive dieting
                            drops FTP faster than weight. These numbers are the
                            ceiling, not a guarantee.
                          </p>
                        </motion.div>
                      )}

                    {/* Seasonal targets */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.45 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-2">
                        SEASONAL BODY COMPOSITION TARGETS
                      </h3>
                      <p className="text-sm text-foreground-muted mb-4">
                        Body composition should change with the training
                        calendar. Chasing race-lean body fat year-round is how
                        riders break down. These are sustainable ranges for{" "}
                        {gender === "male" ? "male" : "female"} cyclists.
                      </p>
                      <div className="space-y-3">
                        {result.seasonalTargets.map((target, i) => {
                          const isCurrentPhaseRange =
                            result.bodyFatPct >= target.bfMin &&
                            result.bodyFatPct <= target.bfMax;
                          return (
                            <motion.div
                              key={target.phase}
                              className={`rounded-lg border p-4 ${
                                isCurrentPhaseRange
                                  ? "border-coral/30 bg-coral/5"
                                  : "border-white/5 bg-white/[0.02]"
                              }`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: 0.48 + i * 0.06,
                              }}
                            >
                              <div className="flex items-baseline justify-between mb-1">
                                <span className="font-heading text-sm text-off-white">
                                  {target.phase.toUpperCase()}
                                </span>
                                <span
                                  className={`font-heading text-sm ${isCurrentPhaseRange ? "text-coral" : "text-foreground-muted"}`}
                                >
                                  {target.bfMin}-{target.bfMax}% BF
                                </span>
                              </div>
                              <p className="text-xs text-foreground-subtle">
                                {target.note}
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Safe composition change guidance */}
                    <motion.div
                      className="bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal rounded-xl border border-coral/20 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-3">
                        THE NON-NEGOTIABLES
                      </h3>
                      <ul className="space-y-2 text-sm text-foreground-muted leading-relaxed">
                        <li>
                          <strong className="text-off-white">
                            Timeline:{" "}
                          </strong>
                          Body composition changes should happen over 12-16
                          weeks minimum. Faster than that and you lose power,
                          not just fat.
                        </li>
                        <li>
                          <strong className="text-off-white">
                            Deficit:{" "}
                          </strong>
                          250-500 kcal/day maximum. Fuel your training days
                          fully and take the deficit on rest days.
                        </li>
                        <li>
                          <strong className="text-off-white">
                            Protein:{" "}
                          </strong>
                          1.6-2.2 g/kg/day to protect lean mass during a
                          deficit. This is not optional.
                        </li>
                        <li>
                          <strong className="text-off-white">
                            Stop signals:{" "}
                          </strong>
                          Persistent fatigue, poor sleep, recurring illness,
                          loss of libido, or FTP dropping more than 3-5%. Any of
                          these means the deficit is too aggressive.
                        </li>
                      </ul>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* Methodology */}
        <Section background="deep-purple" grain className="!py-12">
          <Container width="narrow">
            <h2 className="font-heading text-xl text-off-white mb-6">
              METHODOLOGY AND LIMITATIONS
            </h2>
            <div className="space-y-4 text-foreground-muted text-sm leading-relaxed">
              <div>
                <h3 className="text-off-white font-heading text-base mb-1">
                  THE US NAVY METHOD
                </h3>
                <p>
                  This calculator uses the US Navy circumference method,
                  developed by Hodgdon and Beckett (1984). It estimates body
                  fat from height, waist, neck, and (for women) hip
                  measurements. Validation studies show it correlates within
                  3-4% of DEXA scans for most populations. It is the most
                  widely-tested field method that does not require callipers or
                  lab equipment.
                </p>
              </div>
              <div>
                <h3 className="text-off-white font-heading text-base mb-1">
                  WHERE IT IS LESS ACCURATE
                </h3>
                <p>
                  The Navy method can underestimate body fat in lean,
                  muscular athletes and overestimate it at very high body fat
                  levels. It relies on circumference ratios, so individuals
                  with unusual fat distribution patterns (visceral vs
                  subcutaneous) may see larger errors. It does not
                  distinguish between different types of lean tissue.
                </p>
              </div>
              <div>
                <h3 className="text-off-white font-heading text-base mb-1">
                  WHEN TO GET A DEXA SCAN
                </h3>
                <p>
                  If body composition is central to your performance
                  strategy, invest in a DEXA scan. It is the gold standard
                  for body composition analysis — it gives you precise lean
                  mass, fat mass, and bone mineral density, segmented by body
                  region. One scan establishes your baseline. A second scan
                  8-12 weeks later measures real change. Most sports
                  performance clinics offer DEXA for $50-150 per scan.
                </p>
              </div>
              <div>
                <h3 className="text-off-white font-heading text-base mb-1">
                  BODY COMPOSITION AND CYCLING PERFORMANCE
                </h3>
                <p>
                  Cycling is a gravity sport on climbs and a drag sport on
                  flat terrain. On gradients above 5%, body mass is the
                  dominant variable — which is why the power-to-weight ratio
                  (W/kg) matters more than raw watts for any rider who sees
                  hills. But chasing low body fat without protecting lean
                  mass is a net negative: you lose the muscle that produces
                  power.
                </p>
                <p className="mt-2">
                  Dr. Asker Jeukendrup&apos;s work on body composition in
                  endurance athletes emphasises that performance-driven
                  composition changes should be periodised, moderate, and
                  supported by adequate energy intake. The goal is losing fat
                  mass while protecting (or building) lean mass — and the
                  only way to do that is through structured nutrition and
                  training, not restriction.
                </p>
              </div>
              <div>
                <h3 className="text-off-white font-heading text-base mb-1">
                  A NOTE ON ESTIMATION
                </h3>
                <p>
                  This tool gives you a directional estimate, not a clinical
                  measurement. Use it for tracking trends over time (measure
                  consistently, same time of day, same conditions) rather
                  than treating any single reading as absolute truth. For
                  precision, get a DEXA scan.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        {/* Learn More + CTA */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <motion.div
              className="rounded-xl border border-white/10 p-6 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <h3 className="font-heading text-lg text-off-white mb-3">
                RELATED TOOLS
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/tools/race-weight"
                    className="text-coral hover:text-coral/80 text-sm transition-colors"
                  >
                    Race Weight Calculator — target weight range for your event
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/energy-availability"
                    className="text-coral hover:text-coral/80 text-sm transition-colors"
                  >
                    Energy Availability Calculator — are you eating enough to
                    train?
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/wkg"
                    className="text-coral hover:text-coral/80 text-sm transition-colors"
                  >
                    W/kg Calculator — power-to-weight with benchmarks
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/fuelling"
                    className="text-coral hover:text-coral/80 text-sm transition-colors"
                  >
                    In-Ride Fuelling Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/topics/cycling-weight-loss"
                    className="text-coral hover:text-coral/80 text-sm transition-colors"
                  >
                    Cycling Weight Loss topic hub
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Coaching CTA */}
            <motion.div
              className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
            >
              <p className="font-heading text-coral text-xs tracking-widest mb-2">
                KNOW YOUR NUMBERS?
              </p>
              <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                Coaching builds the nutrition plan that moves composition
                without killing power.
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Personalised TrainingPeaks plan, weekly calls, five pillars.
                7-day free trial. $195/month.
              </p>
              <a
                href="/apply"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="tool_body_composition_apply"
              >
                Apply for Coaching
              </a>
            </motion.div>
          </Container>
        </Section>

        <ToolLanding slug="body-composition" />
      </main>
      <Footer />
    </>
  );
}
