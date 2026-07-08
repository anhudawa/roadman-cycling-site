"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

/* ── Classification bands ─────────────────────────────────── */
const CLASSIFICATIONS = [
  { min: 0, max: 30, label: "Below average", color: "#94A3B8" },
  { min: 30, max: 40, label: "Average", color: "#3B82F6" },
  { min: 40, max: 50, label: "Good", color: "#22C55E" },
  { min: 50, max: 60, label: "Very good / competitive cyclist", color: "#EAB308" },
  { min: 60, max: 70, label: "Excellent / elite amateur", color: "#F97316" },
  { min: 70, max: 80, label: "Near-professional", color: "#EF4444" },
  { min: 80, max: 100, label: "World-class (Tour-level)", color: "#9333EA" },
];

function getClassification(vo2: number) {
  return (
    CLASSIFICATIONS.find((c) => vo2 >= c.min && vo2 < c.max) ||
    CLASSIFICATIONS[CLASSIFICATIONS.length - 1]
  );
}

/* ── Age-adjusted percentile tables (ACSM-based, simplified) ── */
// Each row: [p10, p25, p50, p75, p90] for that decade
const MALE_PERCENTILES: Record<string, number[]> = {
  "20-29": [33, 36, 42, 48, 55],
  "30-39": [31, 34, 39, 45, 52],
  "40-49": [28, 32, 36, 42, 49],
  "50-59": [25, 29, 33, 39, 45],
  "60-69": [22, 26, 30, 35, 41],
  "70+":   [19, 23, 27, 32, 37],
};

const FEMALE_PERCENTILES: Record<string, number[]> = {
  "20-29": [27, 31, 36, 41, 47],
  "30-39": [25, 29, 33, 38, 44],
  "40-49": [23, 27, 31, 35, 41],
  "50-59": [21, 25, 28, 33, 38],
  "60-69": [18, 22, 25, 30, 34],
  "70+":   [16, 20, 23, 27, 31],
};

function getAgeDecade(age: number): string {
  if (age < 30) return "20-29";
  if (age < 40) return "30-39";
  if (age < 50) return "40-49";
  if (age < 60) return "50-59";
  if (age < 70) return "60-69";
  return "70+";
}

function getPercentile(vo2: number, age: number, gender: "male" | "female"): number {
  const decade = getAgeDecade(age);
  const table = gender === "male" ? MALE_PERCENTILES : FEMALE_PERCENTILES;
  const thresholds = table[decade];
  // thresholds = [p10, p25, p50, p75, p90]
  if (vo2 < thresholds[0]) return 5;
  if (vo2 < thresholds[1]) return 15;
  if (vo2 < thresholds[2]) return 35;
  if (vo2 < thresholds[3]) return 62;
  if (vo2 < thresholds[4]) return 82;
  return 95;
}

/* ── Input validation ─────────────────────────────────────── */
function getPowerError(value: string, method: "map" | "ftp"): string | null {
  if (!value) return null;
  const num = parseInt(value);
  if (isNaN(num)) return "Please enter a valid number";
  if (num < 50) return "Power must be at least 50W";
  if (num > 700) return "Power must be under 700W";
  if (method === "ftp" && num > 500) return "FTP must be under 500W";
  return null;
}

function getWeightError(value: string, unit: "kg" | "lb"): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Please enter a valid number";
  if (unit === "kg") {
    if (num < 40) return "Weight must be at least 40kg";
    if (num > 150) return "Weight must be under 150kg";
  } else {
    if (num < 88) return "Weight must be at least 88lb";
    if (num > 330) return "Weight must be under 330lb";
  }
  return null;
}

function getAgeError(value: string): string | null {
  if (!value) return null;
  const num = parseInt(value);
  if (isNaN(num)) return "Please enter a valid number";
  if (num < 16) return "Age must be at least 16";
  if (num > 99) return "Age must be under 100";
  return null;
}

/* ── Main component ───────────────────────────────────────── */
export default function Vo2maxPage() {
  const [method, setMethod] = useState<"map" | "ftp">("ftp");
  const [power, setPower] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [calculated, setCalculated] = useState(false);

  const powerVal = parseInt(power) || 0;
  const weightRaw = parseFloat(weight) || 0;
  const weightKg = weightUnit === "lb" ? weightRaw * 0.453592 : weightRaw;
  const ageVal = parseInt(age) || 0;

  // Hawley & Noakes (1992): VO2max = (10.8 x MAP / weight) + 7
  const mapWatts = method === "ftp" ? powerVal * 1.2 : powerVal;
  const vo2max = weightKg > 0 ? (10.8 * mapWatts) / weightKg + 7 : 0;
  const classification = getClassification(vo2max);
  const percentile = ageVal > 0 ? getPercentile(vo2max, ageVal, gender) : null;

  const powerError = getPowerError(power, method);
  const weightError = getWeightError(weight, weightUnit);
  const ageError = getAgeError(age);
  const canCalculate =
    powerVal > 0 && weightRaw > 0 && ageVal > 0 && !powerError && !weightError && !ageError;

  const reset = () => setCalculated(false);

  return (
    <>
      <Header />
      <main id="main-content">
        {/* ── Hero ───────────────────────────────────────── */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Tool
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              VO2MAX ESTIMATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Estimate your aerobic ceiling from a ramp test or FTP — with age-adjusted percentiles
              and classification benchmarks.
            </p>
          </Container>
        </Section>

        {/* ── Calculator ────────────────────────────────── */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
              {/* Method toggle */}
              <div className="mb-6">
                <label className="block font-heading text-sm text-off-white mb-2">
                  ESTIMATION METHOD
                </label>
                <div className="flex rounded-lg overflow-hidden border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setMethod("map");
                      reset();
                    }}
                    className={`flex-1 py-3 text-sm font-heading tracking-wider transition-colors ${
                      method === "map"
                        ? "bg-coral text-off-white"
                        : "bg-white/5 text-foreground-muted hover:text-off-white"
                    }`}
                  >
                    I KNOW MY MAP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMethod("ftp");
                      reset();
                    }}
                    className={`flex-1 py-3 text-sm font-heading tracking-wider transition-colors ${
                      method === "ftp"
                        ? "bg-coral text-off-white"
                        : "bg-white/5 text-foreground-muted hover:text-off-white"
                    }`}
                  >
                    I KNOW MY FTP
                  </button>
                </div>
                {method === "ftp" && (
                  <p className="text-foreground-subtle text-xs mt-2">
                    FTP-based estimates carry an additional ~5% margin of error. MAP from a ramp
                    test is more accurate.
                  </p>
                )}
              </div>

              {/* Inputs grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Power */}
                <div>
                  <label htmlFor="power-input" className="block font-heading text-sm text-off-white mb-2">
                    {method === "map" ? "MAP (WATTS)" : "FTP (WATTS)"}
                  </label>
                  <input
                    id="power-input"
                    type="number"
                    inputMode="numeric"
                    min="50"
                    max={method === "ftp" ? "500" : "700"}
                    placeholder={method === "map" ? "e.g. 320" : "e.g. 260"}
                    aria-label={
                      method === "map"
                        ? "Maximum Aerobic Power from ramp test in watts"
                        : "Functional Threshold Power in watts"
                    }
                    aria-invalid={!!powerError}
                    value={power}
                    onChange={(e) => {
                      setPower(e.target.value);
                      reset();
                    }}
                    className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${
                      powerError
                        ? "border-red-500/60 focus:border-red-500"
                        : "border-white/10 focus:border-coral"
                    }`}
                  />
                  {powerError && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {powerError}
                    </p>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="weight-input" className="block font-heading text-sm text-off-white">
                      WEIGHT ({weightUnit.toUpperCase()})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setWeightUnit((u) => (u === "kg" ? "lb" : "kg"));
                        setWeight("");
                        reset();
                      }}
                      className="text-coral text-xs font-heading hover:text-coral/80 transition-colors"
                    >
                      Switch to {weightUnit === "kg" ? "lb" : "kg"}
                    </button>
                  </div>
                  <input
                    id="weight-input"
                    type="number"
                    inputMode="decimal"
                    min={weightUnit === "kg" ? "40" : "88"}
                    max={weightUnit === "kg" ? "150" : "330"}
                    step="0.1"
                    placeholder={weightUnit === "kg" ? "e.g. 75" : "e.g. 165"}
                    aria-label={`Your body weight in ${weightUnit === "kg" ? "kilograms" : "pounds"}`}
                    aria-invalid={!!weightError}
                    value={weight}
                    onChange={(e) => {
                      setWeight(e.target.value);
                      reset();
                    }}
                    className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${
                      weightError
                        ? "border-red-500/60 focus:border-red-500"
                        : "border-white/10 focus:border-coral"
                    }`}
                  />
                  {weightError && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {weightError}
                    </p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label htmlFor="age-input" className="block font-heading text-sm text-off-white mb-2">
                    AGE
                  </label>
                  <input
                    id="age-input"
                    type="number"
                    inputMode="numeric"
                    min="16"
                    max="99"
                    placeholder="e.g. 45"
                    aria-label="Your age in years"
                    aria-invalid={!!ageError}
                    value={age}
                    onChange={(e) => {
                      setAge(e.target.value);
                      reset();
                    }}
                    className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${
                      ageError
                        ? "border-red-500/60 focus:border-red-500"
                        : "border-white/10 focus:border-coral"
                    }`}
                  />
                  {ageError && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {ageError}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block font-heading text-sm text-off-white mb-2">GENDER</label>
                  <div className="flex rounded-lg overflow-hidden border border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setGender("male");
                        reset();
                      }}
                      className={`flex-1 py-3 text-sm font-heading tracking-wider transition-colors ${
                        gender === "male"
                          ? "bg-coral text-off-white"
                          : "bg-white/5 text-foreground-muted hover:text-off-white"
                      }`}
                    >
                      MALE
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGender("female");
                        reset();
                      }}
                      className={`flex-1 py-3 text-sm font-heading tracking-wider transition-colors ${
                        gender === "female"
                          ? "bg-coral text-off-white"
                          : "bg-white/5 text-foreground-muted hover:text-off-white"
                      }`}
                    >
                      FEMALE
                    </button>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => canCalculate && setCalculated(true)}
                size="lg"
                className="w-full"
              >
                Estimate VO2max
              </Button>
            </div>

            {/* ── Results ─────────────────────────────────── */}
            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && vo2max > 0 && (
                  <motion.div
                    key={`${powerVal}-${weightRaw}-${ageVal}-${gender}-${method}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Big number */}
                    <div className="text-center mb-8">
                      <p className="font-heading text-6xl md:text-8xl text-coral mb-2">
                        {vo2max.toFixed(1)}
                      </p>
                      <p className="font-heading text-xl text-off-white">
                        ml/kg/min (estimated)
                      </p>
                      <p className="mt-2" style={{ color: classification.color }}>
                        {classification.label}
                      </p>
                      {method === "ftp" && (
                        <p className="text-foreground-subtle text-xs mt-1">
                          Based on estimated MAP of {mapWatts}W (FTP x 1.20)
                        </p>
                      )}
                    </div>

                    {/* Age percentile */}
                    {percentile !== null && (
                      <div className="bg-background-elevated rounded-xl border border-white/5 p-6 mb-8">
                        <h3 className="font-heading text-lg text-off-white mb-3">
                          AGE-ADJUSTED PERCENTILE
                        </h3>
                        <div className="flex items-center gap-4 mb-3">
                          <span className="font-heading text-3xl text-coral">
                            Top {100 - percentile}%
                          </span>
                          <span className="text-foreground-muted text-sm">
                            for {gender === "male" ? "men" : "women"} aged {getAgeDecade(ageVal)}
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
                        <div className="flex justify-between text-xs text-foreground-subtle">
                          <span>0th</span>
                          <span>50th</span>
                          <span>100th</span>
                        </div>
                        <p className="text-foreground-muted text-sm mt-4">
                          VO2max typically declines 5-10% per decade after 30, but structured
                          training can halve that rate. Masters athletes who maintain consistent
                          training show roughly 50% less decline than sedentary peers.
                        </p>
                      </div>
                    )}

                    {/* Classification bands */}
                    <div className="space-y-2 mb-8">
                      {CLASSIFICATIONS.map((c) => {
                        const isActive = vo2max >= c.min && vo2max < c.max;
                        return (
                          <div
                            key={c.label}
                            className={`flex items-center gap-4 rounded-lg p-3 transition-all ${
                              isActive ? "bg-white/[0.08] border border-white/15" : ""
                            }`}
                          >
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: c.color }}
                            />
                            <span className="text-off-white text-sm flex-1">{c.label}</span>
                            <span className="text-foreground-subtle text-xs">
                              {c.min}-{c.max} ml/kg/min
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* What next */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT?</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/masters/vo2max"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            VO2max for Masters Cyclists
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/ftp-zones"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Calculate Your Power Zones
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/wkg"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            W/kg Calculator
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/topics/cycling-training-plans"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Training Plans hub
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">
                        WANT TO PUSH YOUR CEILING HIGHER?
                      </p>
                      <p className="text-off-white font-heading text-lg mb-2">
                        VO2max is trainable at any age.
                      </p>
                      <p className="text-foreground-muted text-sm mb-4">
                        The question is which sessions work for your physiology — and how to fit
                        them around everything else.
                      </p>
                      <a
                        href="/apply"
                        className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                        data-track="tool_vo2max_apply"
                      >
                        Apply for Coaching
                      </a>
                    </div>
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
                <strong className="text-off-white">Formula:</strong> VO2max (ml/kg/min) = (10.8 x
                MAP / body weight in kg) + 7. This is the Hawley &amp; Noakes (1992) equation,
                validated across trained and untrained populations and widely used in exercise
                physiology labs as a field estimate when gas exchange testing is unavailable.
              </p>
              <p>
                <strong className="text-off-white">MAP vs FTP:</strong> Maximum Aerobic Power is
                the final completed stage in a ramp test — a direct measure of peak aerobic output.
                When you select FTP, the tool estimates MAP as FTP x 1.20, a conservative ratio
                supported by published data (typically 1.18-1.25 depending on fibre-type
                distribution). This adds an extra layer of approximation — roughly +-5%.
              </p>
              <p>
                <strong className="text-off-white">Gold standard:</strong> Lab-based VO2max testing
                with expired gas analysis remains the definitive measure. This estimator gets you
                within the right range, but a result of 52 here could be 49 or 55 in the lab.
                Treat it as a benchmark for tracking change, not an absolute value.
              </p>
              <p>
                <strong className="text-off-white">Age and decline:</strong> VO2max drops roughly
                5-10% per decade from age 30 in sedentary populations. But Pollock et al.
                demonstrated that masters athletes who maintain structured training show
                approximately 50% less decline — roughly 5% per decade instead of 10%. Your
                training history matters more than your birth certificate.
              </p>
              <p>
                <strong className="text-off-white">Percentiles:</strong> Age-adjusted percentiles
                are based on simplified ACSM (American College of Sports Medicine) normative data,
                grouped by decade. These represent general population fitness — active cyclists will
                typically sit in the upper quartiles.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 &middot; Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="vo2max" />
      </main>
      <Footer />
    </>
  );
}
