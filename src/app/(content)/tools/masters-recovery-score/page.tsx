"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { useTrack } from "@/hooks/useTrack";
import {
  calculateMastersRecoveryScore,
  type MastersRecoveryResult,
  type RecoverySleep,
  type RecoveryStress,
} from "@/lib/tools/calculators";

const VALIDATION = {
  age: { min: 35, max: 80, label: "Age", unit: "" },
  hours: { min: 0, max: 25, label: "Training hours", unit: "h/wk" },
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

const SLEEP_OPTIONS: { value: RecoverySleep; label: string; sub: string }[] = [
  { value: 1, label: "Very poor", sub: "<5h or broken" },
  { value: 2, label: "Poor", sub: "5–6h" },
  { value: 3, label: "Average", sub: "6–7h" },
  { value: 4, label: "Good", sub: "7–8h" },
  { value: 5, label: "Excellent", sub: "8h+ consistent" },
];

const STRESS_OPTIONS: { value: RecoveryStress; label: string; sub: string }[] = [
  { value: 1, label: "Minimal", sub: "Calm, balanced" },
  { value: 2, label: "Low", sub: "Manageable" },
  { value: 3, label: "Moderate", sub: "Noticeable" },
  { value: 4, label: "High", sub: "Heavy week" },
  { value: 5, label: "Very high", sub: "Burnt out" },
];

const BAND_COLORS: Record<MastersRecoveryResult["band"], string> = {
  optimal: "#22C55E",
  good: "#84CC16",
  compromised: "#EAB308",
  low: "#F97316",
  critical: "#EF4444",
};

export default function MastersRecoveryScorePage() {
  const [age, setAge] = useState("");
  const [hours, setHours] = useState("");
  const [sleep, setSleep] = useState<RecoverySleep | null>(null);
  const [stress, setStress] = useState<RecoveryStress | null>(null);
  const [result, setResult] = useState<MastersRecoveryResult | null>(null);
  const [copied, setCopied] = useState(false);
  const track = useTrack();
  const startedRef = useRef(false);

  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    track("prediction_started", { tool: "masters-recovery-score" });
  };

  useEffect(() => {
    track("race_page_viewed", { race: "masters-recovery-score" });
  }, [track]);

  const ageError = getValidationError(age, "age");
  const hoursError = getValidationError(hours, "hours");
  const hasErrors = !!ageError || !!hoursError;
  const ready =
    !!age && !!hours && sleep !== null && stress !== null && !hasErrors;

  const handleCalculate = () => {
    if (!ready) return;
    markStarted();
    const result = calculateMastersRecoveryScore({
      age: parseFloat(age),
      trainingHoursPerWeek: parseFloat(hours),
      sleepQuality: sleep!,
      stressLevel: stress!,
    });
    setResult(result);
    track("prediction_completed", { tool: "masters-recovery-score" });
  };

  const handleCopyResults = async () => {
    if (!result) return;
    const text = `Masters Recovery Score: ${result.score}/100 (${result.bandLabel}) — top lever: ${result.topLeverLabel}. Calculated at roadmancycling.com/tools/masters-recovery-score`;
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
              MASTERS RECOVERY SCORE
            </h1>
            <p className="text-foreground-muted text-lg">
              Four inputs. One number. The honest read on how much hard training your body
              can absorb this week.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mr-age" className="block font-heading text-lg text-off-white mb-2">
                    AGE
                  </label>
                  <input
                    id="mr-age"
                    type="number"
                    min="35"
                    max="80"
                    placeholder="e.g. 48"
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
                </div>

                <div>
                  <label htmlFor="mr-hours" className="block font-heading text-lg text-off-white mb-2">
                    TRAINING (H/WEEK)
                  </label>
                  <input
                    id="mr-hours"
                    type="number"
                    min="0"
                    max="25"
                    step="0.5"
                    placeholder="e.g. 9"
                    value={hours}
                    onChange={(e) => {
                      setHours(e.target.value);
                      setResult(null);
                    }}
                    className={hoursError ? errorInputClasses : inputClasses}
                  />
                  {hoursError && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {hoursError}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label id="mr-sleep-label" className="block font-heading text-lg text-off-white mb-2">
                  SLEEP QUALITY (LAST 7 NIGHTS)
                </label>
                <div
                  className="grid grid-cols-2 sm:grid-cols-5 gap-2"
                  role="group"
                  aria-labelledby="mr-sleep-label"
                >
                  {SLEEP_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSleep(opt.value);
                        setResult(null);
                      }}
                      aria-pressed={sleep === opt.value}
                      className={`py-3 px-2 rounded-lg font-heading text-xs tracking-wider transition-colors cursor-pointer flex flex-col items-center gap-1 ${
                        sleep === opt.value
                          ? "bg-coral text-off-white"
                          : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      <span>{opt.label.toUpperCase()}</span>
                      <span className="text-[10px] opacity-70 normal-case tracking-normal">
                        {opt.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label id="mr-stress-label" className="block font-heading text-lg text-off-white mb-2">
                  LIFE STRESS (LAST 7 DAYS)
                </label>
                <div
                  className="grid grid-cols-2 sm:grid-cols-5 gap-2"
                  role="group"
                  aria-labelledby="mr-stress-label"
                >
                  {STRESS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStress(opt.value);
                        setResult(null);
                      }}
                      aria-pressed={stress === opt.value}
                      className={`py-3 px-2 rounded-lg font-heading text-xs tracking-wider transition-colors cursor-pointer flex flex-col items-center gap-1 ${
                        stress === opt.value
                          ? "bg-coral text-off-white"
                          : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      <span>{opt.label.toUpperCase()}</span>
                      <span className="text-[10px] opacity-70 normal-case tracking-normal">
                        {opt.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleCalculate} size="lg" className="w-full" disabled={!ready}>
                Calculate Recovery Score
              </Button>
            </div>

            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {result && (
                  <motion.div
                    className="mt-8 space-y-4"
                    key={`${result.score}-${result.band}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-heading text-2xl text-off-white">YOUR RECOVERY SCORE</h2>
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
                      <p
                        className="font-heading text-7xl md:text-8xl mb-2"
                        style={{ color: BAND_COLORS[result.band] }}
                      >
                        {result.score}
                      </p>
                      <p className="font-heading text-lg text-off-white tracking-widest">
                        {result.bandLabel.toUpperCase()}
                      </p>
                      <p className="text-foreground-muted mt-3 max-w-md mx-auto leading-relaxed">
                        {result.headline}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.18 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-3">RECOMMENDATION</h3>
                      <p className="text-foreground-muted text-sm leading-relaxed">
                        {result.recommendation}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.25 }}
                    >
                      <p className="text-coral font-heading text-xs tracking-widest mb-2">
                        TOP FIXABLE LEVER
                      </p>
                      <h3 className="font-heading text-xl text-off-white mb-3">
                        {result.topLeverLabel.toUpperCase()}
                      </h3>
                      <p className="text-foreground-muted text-sm leading-relaxed">
                        {result.topLeverAction}
                      </p>
                    </motion.div>

                    <motion.div
                      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.32 }}
                    >
                      {[
                        { label: "Age", value: result.components.age },
                        { label: "Load", value: result.components.load },
                        { label: "Sleep", value: result.components.sleep },
                        { label: "Stress", value: result.components.stress },
                      ].map((c) => (
                        <div
                          key={c.label}
                          className="bg-background-elevated rounded-lg border border-white/5 p-4 text-center"
                        >
                          <p className="text-xs text-foreground-subtle mb-1">{c.label.toUpperCase()}</p>
                          <p className="font-heading text-2xl text-off-white">−{c.value}</p>
                        </div>
                      ))}
                    </motion.div>
                    <p className="text-xs text-foreground-subtle text-center">
                      Penalty contribution from each variable. Lower is better.
                    </p>

                    <motion.div
                      className="rounded-xl border border-white/10 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.4 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-3">LEARN MORE</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/question/recovery-for-cyclists-over-50"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            How should cyclists over 50 recover?
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/blog/cycling-hrv-training-guide"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            HRV training guide for cyclists
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/blog/cycling-active-recovery-rides-guide"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Active recovery rides — how to do them properly
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
                RECOVERY IS THE LIMITING INPUT AFTER 40
              </p>
              <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                Coaching builds the recovery architecture into the plan.
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Personalised TrainingPeaks plan, weekly check-ins, HRV-informed adjustments.
                7-day free trial. $195/month.
              </p>
              <a
                href="/apply"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="tool_mastersrecovery_apply"
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
                <strong className="text-off-white">Inputs:</strong> Age, weekly training hours,
                7-day sleep quality (1–5), and 7-day life stress (1–5). The score is a heuristic
                combining four penalty components into a 0–100 result.
              </p>
              <p>
                <strong className="text-off-white">Sustainable load model:</strong> Sustainable
                weekly hours are modelled as a soft decline from 14h at age 40 to 9h at 65+,
                consistent with masters periodisation literature (Friel) and the practice-based
                positions of coaches interviewed across the Roadman archive.
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> This is a directional
                tool, not a clinical readiness score. It does not replace HRV trends, resting
                heart rate, or how you actually feel. Use it as a weekly self-audit. If symptoms
                of overreaching persist (low mood, broken sleep, stalled training response) for
                more than two weeks, see your GP.
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
