"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

function calculateEA(
  weightKg: number,
  bodyFatPercent: number,
  dailyCalories: number,
  dailyExerciseCalories: number,
): {
  ea: number;
  fatFreeMass: number;
  exerciseExpenditure: number;
  interpretation: string;
} {
  const fatFreeMass = weightKg * (1 - bodyFatPercent / 100);
  const exerciseExpenditure = dailyExerciseCalories;
  const ea = (dailyCalories - dailyExerciseCalories) / fatFreeMass;
  const interpretation =
    "This is an educational estimate, not a RED-S screen or a fuelling prescription. Food logs, exercise expenditure and body-fat estimates can each be substantially wrong. Use the number to improve the questions you ask; symptoms, health history and qualified clinical assessment determine whether there is a problem.";

  return {
    ea: Math.round(ea * 10) / 10,
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
  exercise: { min: 0, max: 6000, label: "Daily exercise expenditure", unit: "kcal" },
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
  const [exerciseCalories, setExerciseCalories] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateEA> | null>(null);
  const [copied, setCopied] = useState(false);

  const weightError = getValidationError(weight, "weight");
  const bodyFatError = getValidationError(bodyFat, "bodyFat");
  const caloriesError = getValidationError(calories, "calories");
  const exerciseError = getValidationError(exerciseCalories, "exercise");
  const hasErrors = !!weightError || !!bodyFatError || !!caloriesError || !!exerciseError;

  const handleCalculate = () => {
    if (hasErrors) return;
    const w = parseFloat(weight);
    const bf = parseFloat(bodyFat);
    const cal = parseInt(calories);
    const exercise = parseFloat(exerciseCalories);
    if (w > 0 && bf > 0 && bf < 50 && cal > 0 && exercise >= 0) {
      setResult(calculateEA(w, bf, cal, exercise));
    }
  };

  const handleCopyResults = async () => {
    if (!result) return;
    const text = `Estimated energy availability: ${result.ea} kcal/kg FFM/day (educational estimate, not a RED-S screen) — ${weight}kg, ${bodyFat}% body fat, ${calories}kcal/day intake, ${exerciseCalories}kcal/day exercise — roadmancycling.com/tools/energy-availability`;
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
              ENERGY AVAILABILITY ESTIMATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Explore the energy-availability formula without turning one estimate into a RED-S diagnosis.
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
                <p className="text-xs text-foreground-subtle mb-2">Average intake for the period you are comparing. Food logs commonly under-report.</p>
                <input id="ea-calories" type="number" min="1000" max="6000" step="50" placeholder="e.g. 2500"
                  value={calories} onChange={(e) => { setCalories(e.target.value); setResult(null); }}
                  className={caloriesError ? errorInputClasses : inputClasses}
                />
                {caloriesError && <p className="text-red-400 text-xs mt-1" role="alert">{caloriesError}</p>}
              </div>
              <div>
                <label htmlFor="ea-exercise" className="block font-heading text-lg text-off-white mb-2">DAILY EXERCISE ENERGY EXPENDITURE</label>
                <p className="text-xs text-foreground-subtle mb-2">Exercise only—not resting metabolism or normal daily activity. Use a comparable daily average.</p>
                <input id="ea-exercise" type="number" min="0" max="6000" step="25" placeholder="e.g. 700"
                  value={exerciseCalories} onChange={(e) => { setExerciseCalories(e.target.value); setResult(null); }}
                  className={exerciseError ? errorInputClasses : inputClasses}
                />
                {exerciseError && <p className="text-red-400 text-xs mt-1" role="alert">{exerciseError}</p>}
              </div>
              <Button onClick={handleCalculate} size="lg" className="w-full">Estimate</Button>
            </div>

            <div aria-live="polite" aria-atomic="false">
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  className="mt-8 space-y-4"
                  key={result.ea}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl text-off-white">YOUR ESTIMATED ENERGY AVAILABILITY</h2>
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
                    <p className="font-heading text-6xl text-coral mb-2">
                      {result.ea}
                    </p>
                    <p className="text-foreground-muted text-sm">kcal/kg FFM/day</p>
                    <p className="font-heading text-sm text-foreground-muted mt-3">
                      ESTIMATE ONLY — NOT A RED-S TEST
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
                    <h3 className="font-heading text-lg text-off-white mb-3">HOW TO READ THE NUMBER</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      Values around 30 and 45 kcal/kg FFM/day are widely cited from controlled research, much of it in young women. The IOC does not treat them as universal clinical cut-offs for every sex, sport or individual. Duration, symptoms, health history and measurement error matter.
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
                        <Link href="/blog/cycling-body-composition-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling Body Composition Guide
                        </Link>
                      </li>
                      <li>
                        <Link href="/blog/cycling-weight-loss-fuel-for-the-work-required" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Fuel for the Work Required: Weight Loss in Cycling
                        </Link>
                      </li>
                      <li>
                        <Link href="/topics/cycling-nutrition" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling Nutrition topic hub →
                        </Link>
                      </li>
                      <li>
                        <Link href="/podcast/ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Podcast: Under-, over-, and optimal fuelling
                        </Link>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.5 }}
                  >
                    <div className="rounded-xl border border-coral/30 bg-coral/5 p-6 text-center">
                      <h3 className="font-heading text-xl text-off-white mb-2">TRACK THE CONTEXT, NOT JUST THE CALORIES</h3>
                      <p className="text-foreground-muted text-sm leading-relaxed mb-5">
                        The Roadman app will bring strength, recovery, symptoms and training context together. It will not diagnose RED-S or prescribe a diet.
                      </p>
                      <Link
                        href="/app?source=energy-availability-estimate"
                        className="inline-flex items-center justify-center font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                        data-track="tool_ea_app_waitlist"
                      >
                        Join the app waiting list →
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* Safety CTA */}
        <Section background="charcoal" className="!pt-0 !pb-12">
          <Container width="narrow">
            <motion.div
              className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.7 }}
            >
              <p className="font-heading text-coral text-xs tracking-widest mb-2">
                CONCERNED ABOUT UNDER-FUELLING?
              </p>
              <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                A calculator cannot diagnose RED-S.
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Persistent symptoms, menstrual disturbance, low libido, recurrent illness or a bone stress injury need qualified medical and sports-dietetic assessment.
              </p>
              <Link
                 href="/blog/energy-availability-red-s-cyclists-guide"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="tool_ea_reds_guide"
              >
                Read the evidence-based RED-S guide →
              </Link>
            </motion.div>
          </Container>
        </Section>

        <ToolLanding slug="energy-availability" />
      </main>
      <Footer />
    </>
  );
}
