"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { useTrack } from "@/hooks/useTrack";
import {
  calculateMastersFtpBenchmark,
  MASTERS_AGE_GROUPS,
  type MastersFtpGender,
  type MastersFtpResult,
} from "@/lib/tools/calculators";

const VALIDATION = {
  age: { min: 40, max: 80, label: "Age", unit: "" },
  ftp: { min: 50, max: 600, label: "FTP", unit: "W" },
  weight: { min: 40, max: 150, label: "Weight", unit: "kg" },
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

const PERCENTILE_BANDS = [
  { min: 0, max: 20, label: "Early masters", color: "#94A3B8" },
  { min: 20, max: 40, label: "Building base", color: "#3B82F6" },
  { min: 40, max: 60, label: "Average masters", color: "#22C55E" },
  { min: 60, max: 80, label: "Above average", color: "#EAB308" },
  { min: 80, max: 95, label: "Strong masters", color: "#F97316" },
  { min: 95, max: 101, label: "Elite masters", color: "#EF4444" },
];

export default function MastersFtpBenchmarkPage() {
  const [age, setAge] = useState("");
  const [ftp, setFtp] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<MastersFtpGender>("male");
  const [result, setResult] = useState<MastersFtpResult | null>(null);
  const [copied, setCopied] = useState(false);
  const track = useTrack();
  const startedRef = useRef(false);

  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    track("prediction_started", { tool: "masters-ftp-benchmark" });
  };

  useEffect(() => {
    track("race_page_viewed", { race: "masters-ftp-benchmark" });
  }, [track]);

  const ageError = getValidationError(age, "age");
  const ftpError = getValidationError(ftp, "ftp");
  const weightError = getValidationError(weight, "weight");
  const hasErrors = !!ageError || !!ftpError || !!weightError;
  const ready = !!age && !!ftp && !!weight && !hasErrors;

  const handleCalculate = () => {
    if (!ready) return;
    markStarted();
    setResult(
      calculateMastersFtpBenchmark({
        age: parseFloat(age),
        ftp: parseFloat(ftp),
        weightKg: parseFloat(weight),
        gender,
      }),
    );
    track("prediction_completed", { tool: "masters-ftp-benchmark" });
  };

  const handleCopyResults = async () => {
    if (!result) return;
    const text = `Masters FTP benchmark — ${result.wkg.toFixed(2)} W/kg, ${result.percentile}th percentile (${result.bandLabel}) for ${result.cohortLabel}. Calculated at roadmancycling.com/tools/masters-ftp-benchmark`;
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
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Tool · Masters Cyclists
            </p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              FTP BENCHMARK FOR MASTERS
            </h1>
            <p className="text-foreground-muted text-lg">
              Where you actually sit among trained amateur masters cyclists in your age group —
              not against 25-year-olds with no kids.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              <div>
                <label id="ftpb-gender-label" className="block font-heading text-lg text-off-white mb-2">
                  GENDER
                </label>
                <div className="flex gap-3" role="group" aria-labelledby="ftpb-gender-label">
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
                        setResult(null);
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

              <div>
                <label htmlFor="ftpb-age" className="block font-heading text-lg text-off-white mb-2">
                  AGE
                </label>
                <input
                  id="ftpb-age"
                  type="number"
                  min="40"
                  max="80"
                  placeholder="e.g. 47"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    setResult(null);
                  }}
                  className={ageError ? errorInputClasses : inputClasses}
                />
                {ageError && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {ageError}
                  </p>
                )}
                <p className="text-xs text-foreground-subtle mt-2">
                  Age groups: 40-44, 45-49, 50-54, 55-59, 60+. Under 40? Try the{" "}
                  <Link href="/tools/wkg" className="text-coral hover:text-coral/80">
                    open W/kg calculator
                  </Link>
                  .
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ftpb-ftp" className="block font-heading text-lg text-off-white mb-2">
                    FTP (WATTS)
                  </label>
                  <input
                    id="ftpb-ftp"
                    type="number"
                    min="50"
                    max="600"
                    placeholder="e.g. 250"
                    value={ftp}
                    onChange={(e) => {
                      setFtp(e.target.value);
                      setResult(null);
                    }}
                    className={ftpError ? errorInputClasses : inputClasses}
                  />
                  {ftpError && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {ftpError}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="ftpb-weight" className="block font-heading text-lg text-off-white mb-2">
                    WEIGHT (KG)
                  </label>
                  <input
                    id="ftpb-weight"
                    type="number"
                    min="40"
                    max="150"
                    step="0.1"
                    placeholder="e.g. 76"
                    value={weight}
                    onChange={(e) => {
                      setWeight(e.target.value);
                      setResult(null);
                    }}
                    className={weightError ? errorInputClasses : inputClasses}
                  />
                  {weightError && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {weightError}
                    </p>
                  )}
                </div>
              </div>

              <Button onClick={handleCalculate} size="lg" className="w-full" disabled={!ready}>
                See My Benchmark
              </Button>
            </div>

            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {result && (
                  <motion.div
                    className="mt-8 space-y-4"
                    key={`${result.wkg}-${result.percentile}-${result.ageGroup}-${gender}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-heading text-2xl text-off-white">YOUR BENCHMARK</h2>
                      <button
                        onClick={handleCopyResults}
                        aria-label={copied ? "Results copied to clipboard" : "Copy results to clipboard"}
                        className="text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                      >
                        {copied ? "Copied!" : "Copy Results"}
                      </button>
                    </div>

                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-8 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    >
                      <p className="font-heading text-7xl md:text-8xl text-coral mb-1">
                        {result.percentile}
                        <span className="text-3xl md:text-4xl text-foreground-muted align-top ml-1">
                          th
                        </span>
                      </p>
                      <p className="font-heading text-lg text-off-white tracking-widest mb-3">
                        PERCENTILE
                      </p>
                      <p className="text-foreground-muted text-sm leading-relaxed max-w-md mx-auto">
                        {result.headline}
                      </p>
                    </motion.div>

                    <motion.div
                      className="grid grid-cols-3 gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.18 }}
                    >
                      <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                        <p className="text-xs text-foreground-subtle mb-1">YOUR W/KG</p>
                        <p className="font-heading text-3xl text-coral">{result.wkg.toFixed(2)}</p>
                      </div>
                      <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                        <p className="text-xs text-foreground-subtle mb-1">GROUP MEDIAN</p>
                        <p className="font-heading text-3xl text-off-white">
                          {result.groupMedianWkg.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                        <p className="text-xs text-foreground-subtle mb-1">GROUP P90</p>
                        <p className="font-heading text-3xl text-off-white">
                          {result.groupP90Wkg.toFixed(2)}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.25 }}
                    >
                      <p className="text-xs text-foreground-subtle mb-3">
                        COHORT: {result.cohortLabel.toUpperCase()}
                      </p>
                      <div className="space-y-2">
                        {PERCENTILE_BANDS.map((b) => {
                          const isActive =
                            result.percentile >= b.min && result.percentile < b.max;
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

                    <motion.div
                      className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.32 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-3">
                        WHAT THIS MEANS
                      </h3>
                      <p className="text-foreground-muted text-sm leading-relaxed">
                        {result.interpretation}
                      </p>
                    </motion.div>

                    {result.watssToNextBand !== null && (
                      <motion.div
                        className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.4 }}
                      >
                        <h3 className="font-heading text-lg text-off-white mb-3">
                          NEXT TARGET
                        </h3>
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          You&apos;re roughly{" "}
                          <strong className="text-coral">
                            {result.watssToNextBand} watts
                          </strong>{" "}
                          off the next anchor in your cohort. For trained masters cyclists
                          that is typically 8–16 weeks of structured work — polarised
                          intensity discipline plus heavy strength twice a week.
                        </p>
                      </motion.div>
                    )}

                    <motion.div
                      className="rounded-xl border border-white/10 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.46 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-3">LEARN MORE</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/coaching/masters"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Coaching for masters cyclists
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
                            href="/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Heavy strength beats more miles after 40
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
                            href="/blog/best-roadman-episodes-masters"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Best podcast episodes for masters cyclists →
                          </Link>
                        </li>
                      </ul>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        <Section background="charcoal" className="!pt-0 !pb-12">
          <Container width="narrow">
            <motion.div
              className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.7 }}
            >
              <p className="font-heading text-coral text-xs tracking-widest mb-2">
                MOVE UP A BAND
              </p>
              <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                Coaching built around how masters cyclists actually adapt.
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Polarised volume, sharper intensity, strength that protects, and recovery
                treated as a session. 7-day free trial. $195/month.
              </p>
              <a
                href="/apply"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="tool_mastersftp_apply"
              >
                Apply for Coaching →
              </a>
            </motion.div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              METHODOLOGY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">Formula:</strong> W/kg = FTP (watts) ÷ body
                weight (kg). FTP should be determined from a 20-minute all-out test (×0.95) or
                ramp test, not estimated.
              </p>
              <p>
                <strong className="text-off-white">Cohort model:</strong> The percentile bands
                are heuristic distributions of trained amateur masters cyclists by gender and
                five-year age group ({MASTERS_AGE_GROUPS.join(", ")}). Built from Coggan power
                profiling adjusted for amateur (non-professional) populations and the masters
                decline observed across published age-graded results. Treat as directional —
                the goal is a fair sense of where you sit among trained masters peers, not a
                federation ranking.
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> W/kg predicts climbing
                speed but not flat-terrain performance (where absolute watts matter more).
                Body weight should be measured consistently (morning, before eating). FTP
                accuracy is the biggest variable in the result — if your last test was over
                three months ago, retest first.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: April 2026 · Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
