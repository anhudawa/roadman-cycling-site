"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

const TSS_BENCHMARKS = [
  { min: 0, max: 100, label: "Low", desc: "Recovery or easy endurance ride", color: "#22C55E" },
  { min: 100, max: 200, label: "Medium", desc: "Solid training session", color: "#3B82F6" },
  { min: 200, max: 300, label: "High", desc: "Hard day — expect fatigue tomorrow", color: "#EAB308" },
  { min: 300, max: 400, label: "Very High", desc: "Stage race / epic day — needs 2+ days recovery", color: "#F97316" },
  { min: 400, max: 1000, label: "Ultra", desc: "Ironman or multi-day event territory", color: "#EF4444" },
];

function getTssBenchmark(tss: number) {
  return TSS_BENCHMARKS.find((b) => tss >= b.min && tss < b.max) || TSS_BENCHMARKS[TSS_BENCHMARKS.length - 1];
}

function getFtpError(value: string): string | null {
  if (!value) return null;
  const num = parseInt(value);
  if (isNaN(num)) return "Enter a valid number";
  if (num < 50) return "FTP must be at least 50W";
  if (num > 600) return "FTP must be under 600W";
  return null;
}

function getPowerError(value: string): string | null {
  if (!value) return null;
  const num = parseInt(value);
  if (isNaN(num)) return "Enter a valid number";
  if (num < 30) return "Power must be at least 30W";
  if (num > 600) return "Power must be under 600W";
  return null;
}

function getDurationError(hours: string, minutes: string): string | null {
  const h = parseInt(hours) || 0;
  const m = parseInt(minutes) || 0;
  if (hours && isNaN(parseInt(hours))) return "Enter a valid number for hours";
  if (minutes && isNaN(parseInt(minutes))) return "Enter a valid number for minutes";
  if (h === 0 && m === 0) return null;
  if (m > 59) return "Minutes must be 0-59";
  if (h > 24) return "Hours must be 0-24";
  if (h === 0 && m < 5) return "Duration must be at least 5 minutes";
  return null;
}

export default function TssPage() {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [power, setPower] = useState("");
  const [ftp, setFtp] = useState("");
  const [useNP, setUseNP] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const hoursVal = parseInt(hours) || 0;
  const minutesVal = parseInt(minutes) || 0;
  const totalSeconds = (hoursVal * 60 + minutesVal) * 60;
  const powerVal = parseInt(power) || 0;
  const ftpVal = parseInt(ftp) || 0;

  const intensityFactor = ftpVal > 0 ? powerVal / ftpVal : 0;
  const tss = ftpVal > 0 && totalSeconds > 0
    ? (totalSeconds * powerVal * intensityFactor) / (ftpVal * 3600) * 100
    : 0;

  const benchmark = getTssBenchmark(tss);
  const ftpError = getFtpError(ftp);
  const powerError = getPowerError(power);
  const durationError = getDurationError(hours, minutes);

  const hasDuration = hoursVal > 0 || minutesVal > 0;
  const canCalculate =
    hasDuration &&
    powerVal > 0 &&
    ftpVal > 0 &&
    !ftpError &&
    !powerError &&
    !durationError;

  const resetCalc = () => setCalculated(false);

  // Bar width for visual — cap at 500 TSS for scale
  const barPercent = Math.min((tss / 500) * 100, 100);

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              TSS CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Ride duration, power, and FTP in. Training Stress Score out.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
              {/* Duration */}
              <div className="mb-6">
                <label className="block font-heading text-sm text-off-white mb-2">RIDE DURATION</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      id="hours-input"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="24"
                      placeholder="Hours"
                      aria-label="Ride duration in hours"
                      value={hours}
                      onChange={(e) => { setHours(e.target.value); resetCalc(); }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none focus:border-coral transition-colors"
                    />
                    <span className="text-foreground-subtle text-xs mt-1 block">hours</span>
                  </div>
                  <div>
                    <input
                      id="minutes-input"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="59"
                      placeholder="Minutes"
                      aria-label="Ride duration in minutes"
                      value={minutes}
                      onChange={(e) => { setMinutes(e.target.value); resetCalc(); }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none focus:border-coral transition-colors"
                    />
                    <span className="text-foreground-subtle text-xs mt-1 block">minutes</span>
                  </div>
                </div>
                {durationError && <p className="text-red-400 text-xs mt-1" role="alert">{durationError}</p>}
              </div>

              {/* Power input with NP toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="power-input" className="font-heading text-sm text-off-white">
                    {useNP ? "NORMALISED POWER (NP)" : "AVERAGE POWER"}
                  </label>
                  <button
                    type="button"
                    onClick={() => { setUseNP(!useNP); resetCalc(); }}
                    className="text-coral text-xs font-body hover:text-coral/80 transition-colors"
                  >
                    Switch to {useNP ? "Average Power" : "Normalised Power"}
                  </button>
                </div>
                <input
                  id="power-input"
                  type="number"
                  inputMode="numeric"
                  min="30"
                  max="600"
                  placeholder={useNP ? "e.g. 220" : "e.g. 200"}
                  aria-label={useNP ? "Normalised power in watts" : "Average power in watts"}
                  aria-invalid={!!powerError}
                  value={power}
                  onChange={(e) => { setPower(e.target.value); resetCalc(); }}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${powerError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                />
                {powerError && <p className="text-red-400 text-xs mt-1" role="alert">{powerError}</p>}
                <p className="text-foreground-subtle text-xs mt-1.5">
                  {useNP
                    ? "NP accounts for variability and gives a more accurate TSS for surgy rides."
                    : "Average power works fine for steady efforts. For variable rides, NP is more accurate."}
                </p>
              </div>

              {/* FTP */}
              <div className="mb-6">
                <label htmlFor="ftp-input" className="block font-heading text-sm text-off-white mb-2">FTP (WATTS)</label>
                <input
                  id="ftp-input"
                  type="number"
                  inputMode="numeric"
                  min="50"
                  max="600"
                  placeholder="e.g. 250"
                  aria-label="Your Functional Threshold Power in watts"
                  aria-invalid={!!ftpError}
                  value={ftp}
                  onChange={(e) => { setFtp(e.target.value); resetCalc(); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && canCalculate) setCalculated(true); }}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${ftpError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                />
                {ftpError && <p className="text-red-400 text-xs mt-1" role="alert">{ftpError}</p>}
              </div>

              <Button onClick={() => canCalculate && setCalculated(true)} size="lg" className="w-full">
                Calculate TSS
              </Button>
            </div>

            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && tss > 0 && (
                  <motion.div
                    key={`${totalSeconds}-${powerVal}-${ftpVal}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Big TSS number */}
                    <div className="text-center mb-8">
                      <p className="font-heading text-6xl md:text-8xl text-coral mb-2">{Math.round(tss)}</p>
                      <p className="font-heading text-xl text-off-white">TRAINING STRESS SCORE</p>
                      <p className="text-foreground-muted mt-2" style={{ color: benchmark.color }}>
                        {benchmark.label} — {benchmark.desc}
                      </p>
                    </div>

                    {/* IF value */}
                    <div className="flex items-center justify-center gap-8 mb-8 text-center">
                      <div>
                        <p className="font-heading text-3xl text-off-white">{intensityFactor.toFixed(2)}</p>
                        <p className="text-foreground-subtle text-sm">Intensity Factor (IF)</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl text-off-white">{hoursVal}h {minutesVal.toString().padStart(2, "0")}m</p>
                        <p className="text-foreground-subtle text-sm">Duration</p>
                      </div>
                    </div>

                    {/* Visual bar */}
                    <div className="mb-8">
                      <div className="relative h-6 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <motion.div
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{ backgroundColor: benchmark.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${barPercent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex justify-between text-foreground-subtle text-xs mt-1">
                        <span>0</span>
                        <span>100</span>
                        <span>200</span>
                        <span>300</span>
                        <span>400</span>
                        <span>500+</span>
                      </div>
                    </div>

                    {/* Benchmark scale */}
                    <div className="space-y-2 mb-8">
                      {TSS_BENCHMARKS.map((b) => {
                        const isActive = tss >= b.min && tss < b.max;
                        return (
                          <div
                            key={b.label}
                            className={`flex items-center gap-4 rounded-lg p-3 transition-all ${isActive ? "bg-white/[0.08] border border-white/15" : ""}`}
                          >
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                            <span className="text-off-white text-sm flex-1">{b.label}</span>
                            <span className="text-foreground-subtle text-xs">
                              {b.max < 1000 ? `${b.min}-${b.max}` : `${b.min}+`} TSS
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* What Next */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT?</h3>
                      <ul className="space-y-2">
                        <li><Link href="/tools/ftp-zones" className="text-coral hover:text-coral/80 text-sm transition-colors">Calculate Your Power Zones</Link></li>
                        <li><Link href="/blog/cycling-metrics-explained" className="text-coral hover:text-coral/80 text-sm transition-colors">Cycling Metrics Explained (TSS, IF, NP, CTL)</Link></li>
                        <li><Link href="/tools/hr-zones" className="text-coral hover:text-coral/80 text-sm transition-colors">Heart Rate Zone Calculator</Link></li>
                        <li><Link href="/topics/ftp-training" className="text-coral hover:text-coral/80 text-sm transition-colors">FTP Training topic hub</Link></li>
                      </ul>
                    </div>

                    {/* CTA box */}
                    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">WANT TO STRUCTURE YOUR TRAINING LOAD?</p>
                      <p className="text-off-white font-heading text-lg mb-2">Knowing your TSS is step one.</p>
                      <p className="text-foreground-muted text-sm mb-4">
                        A coach interprets the pattern across weeks — when to push, when to back off, when you&apos;re ready to race.
                      </p>
                      <a href="/apply" className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all" data-track="tool_tss_apply">
                        Apply for Coaching
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              METHODOLOGY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">Formula:</strong> TSS = (Duration in seconds x NP x IF) / (FTP x 3600) x 100,
                where IF (Intensity Factor) = NP / FTP. One hour at FTP equals exactly 100 TSS — that&apos;s the anchor point.
              </p>
              <p>
                <strong className="text-off-white">Origin:</strong> TSS was developed by Dr. Andrew Coggan and Hunter Allen
                as part of the performance-management framework built into TrainingPeaks and WKO software. It quantifies the
                physiological cost of a ride in a single number you can track over time.
              </p>
              <p>
                <strong className="text-off-white">NP vs Average Power:</strong> Normalised Power accounts for the
                variability of effort — hard surges cost more metabolically than the same average watts held steady.
                If your ride had significant variation (crits, group rides, hilly routes), NP gives a more accurate TSS.
                For steady-state efforts (time trials, indoor sessions), average power and NP are nearly identical.
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> TSS treats all stress below threshold equally and
                doesn&apos;t capture the disproportionate metabolic cost of time spent above threshold. It doesn&apos;t factor in
                environmental load — heat, altitude, and humidity add physiological stress that TSS ignores. And it
                requires accurate power data; heart-rate-derived TSS (hrTSS) is a rougher estimate.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 &middot; Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="tss" />
      </main>
      <Footer />
    </>
  );
}
