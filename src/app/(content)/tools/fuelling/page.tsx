"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";

type Intensity = "easy" | "moderate" | "hard" | "race";

function calculateFuelling(
  durationMin: number,
  intensity: Intensity,
  weightKg: number
): {
  carbsPerHour: string;
  totalCarbs: number;
  fluidPerHour: string;
  totalFluid: number;
  sodiumPerHour: number;
  strategy: string;
} {
  const hours = durationMin / 60;

  // Carbs per hour based on duration and intensity
  let carbsPerHourMin: number;
  let carbsPerHourMax: number;

  if (durationMin < 60) {
    carbsPerHourMin = 0;
    carbsPerHourMax = 30;
  } else if (durationMin < 90) {
    carbsPerHourMin = 30;
    carbsPerHourMax = 60;
  } else if (durationMin < 180) {
    carbsPerHourMin = 60;
    carbsPerHourMax = 90;
  } else {
    carbsPerHourMin = 80;
    carbsPerHourMax = 120;
  }

  // Intensity modifier
  const intensityMod: Record<Intensity, number> = {
    easy: 0.7,
    moderate: 0.85,
    hard: 1.0,
    race: 1.1,
  };

  carbsPerHourMin = Math.round(carbsPerHourMin * intensityMod[intensity]);
  carbsPerHourMax = Math.round(carbsPerHourMax * intensityMod[intensity]);
  const totalCarbs = Math.round(((carbsPerHourMin + carbsPerHourMax) / 2) * hours);

  // Fluid: body-weight-based estimate (6-10ml/kg/hr depending on intensity)
  const fluidPerKgHr = intensity === "race" ? 10 : intensity === "hard" ? 9 : intensity === "moderate" ? 7.5 : 6;
  const fluidBase = Math.max(400, Math.min(1000, Math.round(weightKg * fluidPerKgHr)));
  const totalFluid = Math.round((fluidBase * hours) / 100) / 10;

  // Sodium: ~500-700mg per hour
  const sodiumPerHour = intensity === "race" || intensity === "hard" ? 700 : 500;

  // Strategy
  let strategy = "";
  if (durationMin < 60) {
    strategy = "Under 60 minutes: water is enough. Maybe a gel in the last 15 minutes if it's a race effort. Don't overthink this one.";
  } else if (durationMin < 90) {
    strategy = "60-90 minutes: start fuelling from the 30-minute mark. A gel or a few swigs of energy drink every 20 minutes. Sip, don't gulp.";
  } else if (durationMin < 180) {
    strategy = "90 minutes to 3 hours: this is where fuelling becomes critical. Start early (within first 20 minutes), aim for a mix of gels, bars, and energy drink. Set a timer if you need to — most people underfuel because they forget.";
  } else {
    strategy = "3+ hours: you need a fuelling plan, not just good intentions. Use dual-source carbs — glucose and fructose at a 1:0.8 ratio — to absorb up to 120g per hour. Alternate between gels, drinks, and real food. Front-load your fuelling — it's much harder to catch up than to stay on top.";
  }

  return {
    carbsPerHour: carbsPerHourMax > 0 ? `${carbsPerHourMin}–${carbsPerHourMax}g` : "0–30g",
    totalCarbs,
    fluidPerHour: `${fluidBase}ml`,
    totalFluid,
    sodiumPerHour,
    strategy,
  };
}

// Validation
const VALIDATION = {
  duration: { min: 10, max: 720, label: "Duration", unit: " minutes" },
  weight: { min: 30, max: 200, label: "Body weight", unit: "kg" },
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

export default function FuellingPage() {
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<Intensity>("moderate");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateFuelling> | null>(null);
  const [copied, setCopied] = useState(false);

  const durationError = getValidationError(duration, "duration");
  const weightError = getValidationError(weight, "weight");
  const hasErrors = !!durationError || !!weightError;

  const handleCalculate = () => {
    if (hasErrors) return;
    const d = parseInt(duration);
    const w = parseFloat(weight);
    if (d > 0 && w > 0) {
      setResult(calculateFuelling(d, intensity, w));
    }
  };

  const handleCopyResults = async () => {
    if (!result) return;
    const intensityLabels: Record<Intensity, string> = { easy: "easy", moderate: "moderate", hard: "hard", race: "race" };
    const text = `Fuelling Plan: ${result.carbsPerHour} carbs/hr, ${result.fluidPerHour} fluid/hr, ${result.totalCarbs}g total carbs (${duration}min ${intensityLabels[intensity]} ride, ${weight}kg) — roadmancycling.com/tools/fuelling`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none transition-colors";
  const errorInputClasses = "w-full bg-white/5 border border-red-500/60 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider placeholder:text-foreground-subtle focus:border-red-500 focus:outline-none transition-colors";

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              IN-RIDE FUELLING CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Exactly how many carbs and how much fluid you need per hour. Stop bonking. Start fuelling properly.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              <div>
                <label htmlFor="fuel-duration" className="block font-heading text-lg text-off-white mb-2">RIDE DURATION (MINUTES)</label>
                <input id="fuel-duration" type="number" min="15" max="600" placeholder="e.g. 180"
                  value={duration} onChange={(e) => { setDuration(e.target.value); setResult(null); }}
                  className={`${durationError ? errorInputClasses : inputClasses} text-xl`}
                />
                {durationError && <p className="text-red-400 text-xs mt-1">{durationError}</p>}
              </div>
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">INTENSITY</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    ["easy", "Easy (Z2)"],
                    ["moderate", "Moderate (Z3)"],
                    ["hard", "Hard (Z4-5)"],
                    ["race", "Race"],
                  ] as const).map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => { setIntensity(val); setResult(null); }}
                      className={`py-3 rounded-lg font-heading text-xs tracking-wider transition-colors cursor-pointer ${
                        intensity === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="fuel-weight" className="block font-heading text-lg text-off-white mb-2">BODY WEIGHT (KG)</label>
                <input id="fuel-weight" type="number" min="40" max="150" step="0.1" placeholder="e.g. 75"
                  value={weight} onChange={(e) => { setWeight(e.target.value); setResult(null); }}
                  className={weightError ? errorInputClasses : inputClasses}
                />
                {weightError && <p className="text-red-400 text-xs mt-1">{weightError}</p>}
              </div>
              <Button onClick={handleCalculate} size="lg" className="w-full">Calculate</Button>
            </div>

            <div aria-live="polite" aria-atomic="false">
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  className="mt-8 space-y-4"
                  key={`${result.carbsPerHour}-${result.totalCarbs}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl text-off-white">YOUR FUELLING PLAN</h2>
                    <button
                      onClick={handleCopyResults}
                      className="text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy Results"}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    >
                      <p className="text-xs text-foreground-subtle mb-1">CARBS/HOUR</p>
                      <p className="font-heading text-2xl text-coral">{result.carbsPerHour}</p>
                    </motion.div>
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.18 }}
                    >
                      <p className="text-xs text-foreground-subtle mb-1">FLUID/HOUR</p>
                      <p className="font-heading text-2xl text-coral">{result.fluidPerHour}</p>
                    </motion.div>
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.25 }}
                    >
                      <p className="text-xs text-foreground-subtle mb-1">TOTAL CARBS</p>
                      <p className="font-heading text-2xl text-coral">{result.totalCarbs}g</p>
                    </motion.div>
                  </div>

                  <motion.div
                    className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.32 }}
                  >
                    <h3 className="font-heading text-lg text-off-white mb-3">STRATEGY</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">{result.strategy}</p>
                  </motion.div>

                  <motion.div
                    className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.38 }}
                  >
                    <h3 className="font-heading text-lg text-off-white mb-3">SODIUM</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      Aim for ~{result.sodiumPerHour}mg sodium per hour, especially in hot conditions or rides over 2 hours.
                      Electrolyte tablets in one bottle, energy drink or plain water in the other.
                    </p>
                  </motion.div>

                  {/* Learn More */}
                  <motion.div
                    className="rounded-xl border border-white/10 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.44 }}
                  >
                    <h3 className="font-heading text-lg text-off-white mb-3">LEARN MORE</h3>
                    <ul className="space-y-2">
                      <li>
                        <a href="/blog/cycling-in-ride-nutrition-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling In-Ride Nutrition Guide
                        </a>
                      </li>
                      <li>
                        <a href="/blog/cycling-energy-gels-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling Energy Gels Guide
                        </a>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.5 }}
                  >
                    <EmailCapture
                      heading="NEVER BONK AGAIN"
                      subheading="Weekly fuelling tips backed by sports science. One email, every week."
                      source="tool-fuelling"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
