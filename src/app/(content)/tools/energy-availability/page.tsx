"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ReportRequestForm } from "@/components/features/tools/ReportRequestForm";

function calculateEA(
  weightKg: number,
  bodyFatPercent: number,
  dailyCalories: number,
  trainingHoursPerWeek: number,
  avgIntensity: "low" | "moderate" | "high"
): {
  ea: number;
  risk: "optimal" | "concern" | "high-risk";
  fatFreeMass: number;
  exerciseExpenditure: number;
  interpretation: string;
} {
  const fatFreeMass = weightKg * (1 - bodyFatPercent / 100);
  const calPerHour: Record<string, number> = {
    low: weightKg * 6,
    moderate: weightKg * 9,
    high: weightKg * 12,
  };
  const dailyTrainingHours = trainingHoursPerWeek / 7;
  const exerciseExpenditure = calPerHour[avgIntensity] * dailyTrainingHours;
  const ea = (dailyCalories - exerciseExpenditure) / fatFreeMass;

  let risk: "optimal" | "concern" | "high-risk";
  let interpretation: string;

  if (ea >= 45) {
    risk = "optimal";
    interpretation = "Your energy availability is in a healthy range. You're fuelling your training adequately. Keep doing what you're doing.";
  } else if (ea >= 30) {
    risk = "concern";
    interpretation = "Your energy availability is below optimal but above the danger zone. You may be able to lose body fat at this level, but monitor fatigue, mood, and performance closely. Don't stay here long-term.";
  } else {
    risk = "high-risk";
    interpretation = "Your energy availability is dangerously low. This puts you at risk of Relative Energy Deficiency in Sport (RED-S) — which can cause hormonal disruption, bone density loss, immune suppression, and performance decline. Increase your caloric intake immediately.";
  }

  return {
    ea: Math.round(ea * 10) / 10,
    risk,
    fatFreeMass: Math.round(fatFreeMass * 10) / 10,
    exerciseExpenditure: Math.round(exerciseExpenditure),
    interpretation,
  };
}

// Validation
const VALIDATION = {
  weight: { min: 30, max: 200, label: "Body weight", unit: "kg" },
  bodyFat: { min: 3, max: 50, label: "Body fat", unit: "%" },
  calories: { min: 500, max: 8000, label: "Calorie intake", unit: "kcal" },
  hours: { min: 0.5, max: 40, label: "Training hours", unit: "hrs/week" },
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

export default function EnergyAvailabilityPage() {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [calories, setCalories] = useState("");
  const [hours, setHours] = useState("");
  const [intensity, setIntensity] = useState<"low" | "moderate" | "high">("moderate");
  const [result, setResult] = useState<ReturnType<typeof calculateEA> | null>(null);
  const [copied, setCopied] = useState(false);

  const weightError = getValidationError(weight, "weight");
  const bodyFatError = getValidationError(bodyFat, "bodyFat");
  const caloriesError = getValidationError(calories, "calories");
  const hoursError = getValidationError(hours, "hours");
  const hasErrors = !!weightError || !!bodyFatError || !!caloriesError || !!hoursError;

  const handleCalculate = () => {
    if (hasErrors) return;
    const w = parseFloat(weight);
    const bf = parseFloat(bodyFat);
    const cal = parseInt(calories);
    const h = parseFloat(hours);
    if (w > 0 && bf > 0 && bf < 50 && cal > 0 && h > 0) {
      setResult(calculateEA(w, bf, cal, h, intensity));
    }
  };

  const handleCopyResults = async () => {
    if (!result) return;
    const riskLabelsText = { optimal: "Optimal", concern: "Low — Monitor Closely", "high-risk": "Dangerously Low" };
    const text = `Energy Availability: ${result.ea} kcal/kg FFM/day (${riskLabelsText[result.risk]}) — ${weight}kg, ${bodyFat}% BF, ${calories}kcal/day, ${hours}hrs/week training — roadmancycling.com/tools/energy-availability`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const riskColors = { optimal: "#22C55E", concern: "#EAB308", "high-risk": "#EF4444" };
  const riskLabels = { optimal: "OPTIMAL", concern: "LOW — MONITOR CLOSELY", "high-risk": "DANGEROUSLY LOW" };

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
              ENERGY AVAILABILITY CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Are you eating enough to support your training? Check your EA score and RED-S risk.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              <div>
                <label htmlFor="ea-weight" className="block font-heading text-lg text-off-white mb-2">BODY WEIGHT (KG)</label>
                <input id="ea-weight" type="number" min="40" max="150" step="0.1" placeholder="e.g. 75"
                  value={weight} onChange={(e) => { setWeight(e.target.value); setResult(null); }}
                  className={`${weightError ? errorInputClasses : inputClasses} text-xl`}
                />
                {weightError && <p className="text-red-400 text-xs mt-1" role="alert">{weightError}</p>}
              </div>
              <div>
                <label htmlFor="ea-bodyfat" className="block font-heading text-lg text-off-white mb-2">BODY FAT %</label>
                <input id="ea-bodyfat" type="number" min="4" max="45" step="0.5" placeholder="e.g. 15"
                  value={bodyFat} onChange={(e) => { setBodyFat(e.target.value); setResult(null); }}
                  className={bodyFatError ? errorInputClasses : inputClasses}
                />
                {bodyFatError && <p className="text-red-400 text-xs mt-1" role="alert">{bodyFatError}</p>}
              </div>
              <div>
                <label htmlFor="ea-calories" className="block font-heading text-lg text-off-white mb-2">DAILY CALORIE INTAKE</label>
                <p className="text-xs text-foreground-subtle mb-2">Average across the week. Estimate is fine.</p>
                <input id="ea-calories" type="number" min="1000" max="6000" step="50" placeholder="e.g. 2500"
                  value={calories} onChange={(e) => { setCalories(e.target.value); setResult(null); }}
                  className={caloriesError ? errorInputClasses : inputClasses}
                />
                {caloriesError && <p className="text-red-400 text-xs mt-1" role="alert">{caloriesError}</p>}
              </div>
              <div>
                <label htmlFor="ea-hours" className="block font-heading text-lg text-off-white mb-2">TRAINING HOURS PER WEEK</label>
                <input id="ea-hours" type="number" min="1" max="30" step="0.5" placeholder="e.g. 10"
                  value={hours} onChange={(e) => { setHours(e.target.value); setResult(null); }}
                  className={hoursError ? errorInputClasses : inputClasses}
                />
                {hoursError && <p className="text-red-400 text-xs mt-1" role="alert">{hoursError}</p>}
              </div>
              <div>
                <label id="ea-intensity-label" className="block font-heading text-lg text-off-white mb-2">AVERAGE TRAINING INTENSITY</label>
                <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="ea-intensity-label">
                  {([["low", "Low (Z1-2)"], ["moderate", "Moderate (Z2-3)"], ["high", "High (Z4+)"]] as const).map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => { setIntensity(val); setResult(null); }}
                      aria-pressed={intensity === val}
                      className={`py-3 rounded-lg font-heading text-xs tracking-wider transition-colors cursor-pointer ${
                        intensity === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <Button onClick={handleCalculate} size="lg" className="w-full">Calculate</Button>
            </div>

            <div aria-live="polite" aria-atomic="false">
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  className="mt-8 space-y-4"
                  key={`${result.ea}-${result.risk}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl text-off-white">YOUR ENERGY AVAILABILITY</h2>
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
                    <p className="font-heading text-6xl mb-2" style={{ color: riskColors[result.risk] }}>
                      {result.ea}
                    </p>
                    <p className="text-foreground-muted text-sm">kcal/kg FFM/day</p>
                    <p className="font-heading text-lg mt-3" style={{ color: riskColors[result.risk] }}>
                      {riskLabels[result.risk]}
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.18 }}
                    >
                      <p className="text-xs text-foreground-subtle mb-1">FAT-FREE MASS</p>
                      <p className="font-heading text-2xl text-off-white">{result.fatFreeMass}kg</p>
                    </motion.div>
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.25 }}
                    >
                      <p className="text-xs text-foreground-subtle mb-1">EST. DAILY EXERCISE BURN</p>
                      <p className="font-heading text-2xl text-off-white">{result.exerciseExpenditure}kcal</p>
                    </motion.div>
                  </div>

                  <motion.div
                    className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.32 }}
                  >
                    <h3 className="font-heading text-lg text-off-white mb-3">WHAT THIS MEANS</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">{result.interpretation}</p>
                  </motion.div>

                  <motion.div
                    className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.38 }}
                  >
                    <h3 className="font-heading text-lg text-off-white mb-3">THE SCALE</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-foreground-muted"><span style={{ color: "#22C55E" }}>45+ kcal/kg FFM/day</span> — Optimal. Full adaptation, full recovery.</p>
                      <p className="text-foreground-muted"><span style={{ color: "#EAB308" }}>30-45 kcal/kg FFM/day</span> — Low. May impair adaptation. Monitor closely.</p>
                      <p className="text-foreground-muted"><span style={{ color: "#EF4444" }}>&lt;30 kcal/kg FFM/day</span> — Dangerously low. RED-S risk. Increase intake.</p>
                    </div>
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
                        <a href="/blog/cycling-body-composition-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling Body Composition Guide
                        </a>
                      </li>
                      <li>
                        <a href="/blog/cycling-weight-loss-fuel-for-the-work-required" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Fuel for the Work Required: Weight Loss in Cycling
                        </a>
                      </li>
                      <li>
                        <a href="/topics/cycling-nutrition" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling Nutrition topic hub →
                        </a>
                      </li>
                      <li>
                        <a href="/podcast/ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Podcast: Under-, over-, and optimal fuelling
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
                    <ReportRequestForm
                      tool="energy-availability"
                      inputs={{
                        weight: parseFloat(weight),
                        bodyFat: parseFloat(bodyFat),
                        calories: parseFloat(calories),
                        hours: parseFloat(hours),
                        intensity,
                        ea: result.ea,
                        risk: result.risk,
                        fatFreeMass: result.fatFreeMass,
                        exerciseExpenditure: result.exerciseExpenditure,
                        interpretation: result.interpretation,
                      }}
                      heading={`Your EA score: ${result.ea.toFixed(0)} — what to do next`}
                      subheading="The full interpretation of your number, what to adjust, and the warning signs every endurance athlete should know. Applies to both men and women."
                      bullets={[
                        `Personalised calorie target based on your FFM`,
                        "Risk assessment + what each category actually means",
                        "Signs of chronic low EA (not just missed periods)",
                        "Fueling around training vs deficit on rest days",
                        "When to see a sports physician",
                      ]}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* Coaching CTA */}
        <Section background="charcoal" className="!pt-0 !pb-12">
          <Container width="narrow">
            <motion.div
              className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.7 }}
            >
              <p className="font-heading text-coral text-xs tracking-widest mb-2">
                CHECKED YOUR ENERGY AVAILABILITY?
              </p>
              <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                Coaching ensures you&apos;re fuelling enough to perform and stay healthy.
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Personalised TrainingPeaks plan, weekly calls, five pillars.
                7-day free trial. $195/month.
              </p>
              <a
                href="/apply"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="tool_ea_apply"
              >
                Apply for Coaching →
              </a>
            </motion.div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
