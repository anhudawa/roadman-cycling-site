"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";

type Intensity = "easy" | "moderate" | "hard" | "race";
type GutTraining = "none" | "some" | "trained";

/**
 * Evidence-based fuelling calculator.
 *
 * Sources:
 * - James Morton (Liverpool John Moores / Team Sky nutritionist):
 *   "Fuel for the work required" model, glucose:fructose 1:0.8 ratio
 * - Sam Impey (Hexis co-founder): gut-training protocols, periodised fuelling
 * - David Dunne (Hexis): individualised carb periodisation research
 * - Asker Jeukendrup: dual-transporter carbohydrate absorption model
 */

interface FuellingResult {
  carbsPerHour: number;
  carbsPerHourRange: [number, number];
  totalCarbs: number;
  fluidPerHour: number;
  fluidPerHourRange: [number, number];
  totalFluid: number;
  sodiumPerHour: number;
  glucosePerHour: number;
  fructosePerHour: number;
  strategy: string[];
  feedingInterval: number; // minutes
  startFuellingAt: number; // minutes into ride
  dualSource: boolean;
}

function calculateFuelling(
  durationMin: number,
  intensity: Intensity,
  weightKg: number,
  gutTraining: GutTraining
): FuellingResult {
  const hours = durationMin / 60;

  // --- CARBOHYDRATE CALCULATION ---
  // Based on Jeukendrup (2014) & Morton's applied work with Team Sky.
  // Continuous scaling rather than discrete brackets.

  // Base carb rate by intensity (g/hr at steady state for a trained cyclist)
  const intensityBase: Record<Intensity, number> = {
    easy: 30,      // Z2 — "fuel for the work required" (Morton): low demand
    moderate: 55,   // Z3 — tempo/sweetspot, moderate glycolytic demand
    hard: 80,       // Z4-5 — threshold+, high glycolytic flux
    race: 95,       // Race — maximal sustainable effort, highest demand
  };

  // Duration scaling: longer rides need higher rates to prevent glycogen depletion
  // Morton's principle: the longer the event, the more critical fuelling becomes
  let durationMultiplier: number;
  if (durationMin <= 60) {
    durationMultiplier = 0.6;  // Short — minimal fuelling needed
  } else if (durationMin <= 90) {
    durationMultiplier = 0.8;
  } else if (durationMin <= 150) {
    durationMultiplier = 1.0;  // Sweet spot — standard recommendations apply
  } else if (durationMin <= 240) {
    durationMultiplier = 1.1;  // Longer — increased rate to delay depletion
  } else {
    durationMultiplier = 1.15; // Ultra — sustained high intake critical
  }

  // Gut training modifier (Impey & Dunne, Hexis research)
  // Trained guts can absorb significantly more carbohydrate per hour
  const gutModifier: Record<GutTraining, number> = {
    none: 0.8,    // Conservative — untrained gut, risk of GI distress
    some: 1.0,    // Standard — some practice with race nutrition
    trained: 1.15, // Aggressive — systematically trained gut, can push 100-120g/hr
  };

  const baseCarbRate = intensityBase[intensity] * durationMultiplier * gutModifier[gutTraining];

  // Clamp to physiological limits
  // Jeukendrup: single-source max ~60g/hr, dual-source (gluc:fruc) up to ~120g/hr
  const maxAbsorption = gutTraining === "trained" ? 120 : gutTraining === "some" ? 100 : 90;
  const minRate = intensity === "easy" ? 15 : 30;
  const carbsPerHour = Math.round(Math.min(maxAbsorption, Math.max(minRate, baseCarbRate)));

  // Range: ±10g/hr to account for individual variation
  const carbsLow = Math.max(0, carbsPerHour - 10);
  const carbsHigh = Math.min(maxAbsorption, carbsPerHour + 10);

  const totalCarbs = Math.round(carbsPerHour * hours);

  // --- GLUCOSE:FRUCTOSE SPLIT ---
  // Morton & Jeukendrup: 1:0.8 ratio maximises absorption via dual transporters (SGLT1 + GLUT5)
  // Below 60g/hr, single source (glucose) is sufficient
  const dualSource = carbsPerHour > 60;
  let glucosePerHour: number;
  let fructosePerHour: number;

  if (dualSource) {
    // 1:0.8 glucose:fructose ratio
    glucosePerHour = Math.round(carbsPerHour / 1.8);
    fructosePerHour = Math.round(carbsPerHour - glucosePerHour);
  } else {
    glucosePerHour = carbsPerHour;
    fructosePerHour = 0;
  }

  // --- FLUID CALCULATION ---
  // Based on ACSM position stand & Hexis applied recommendations
  // Aim to replace 50-80% of sweat losses, not 100% (Noakes/Morton consensus)
  const fluidRatePerKg: Record<Intensity, number> = {
    easy: 6,
    moderate: 8,
    hard: 9,
    race: 10,
  };

  const rawFluid = Math.round(weightKg * fluidRatePerKg[intensity]);
  const fluidPerHour = Math.max(400, Math.min(1000, rawFluid));
  const fluidLow = Math.max(400, fluidPerHour - 100);
  const fluidHigh = Math.min(1000, fluidPerHour + 100);
  const totalFluid = Math.round((fluidPerHour * hours) / 100) / 10;

  // --- SODIUM ---
  // Sweat sodium varies 200-2000mg/L. Moderate estimate scaled by intensity.
  // Baker et al. (2016): average ~900mg/L, ~0.8-1.4L/hr sweat rate
  const sodiumBase: Record<Intensity, number> = {
    easy: 400,
    moderate: 600,
    hard: 800,
    race: 900,
  };
  const sodiumPerHour = sodiumBase[intensity];

  // --- TIMING & STRATEGY ---
  const startFuellingAt = durationMin <= 60 ? 30 : durationMin <= 90 ? 20 : 15;
  const feedingInterval = carbsPerHour >= 80 ? 15 : carbsPerHour >= 60 ? 20 : 20;

  const strategy: string[] = [];

  if (durationMin <= 45) {
    strategy.push(
      "Under 45 minutes: water is sufficient. A mouth rinse with carbohydrate drink can boost performance without needing to digest anything (Chambers et al. 2009)."
    );
  } else if (durationMin <= 75) {
    strategy.push(
      `Start fuelling at ${startFuellingAt} minutes. A single gel or a few sips of energy drink every 20 minutes is enough. Focus on carbohydrate, not hydration — most short rides don't create a meaningful fluid deficit.`
    );
  } else if (durationMin <= 150) {
    strategy.push(
      `Start fuelling within the first ${startFuellingAt} minutes — don't wait until you feel hungry. Aim for ${carbsPerHour}g/hr using a mix of gels, chews, or energy drink. Set a timer every ${feedingInterval} minutes as a reminder.`
    );
    if (dualSource) {
      strategy.push(
        "At this carb rate, use dual-source products (glucose + fructose). Morton's 1:0.8 ratio enables absorption above 60g/hr by using two separate intestinal transporters."
      );
    }
  } else {
    strategy.push(
      `Start fuelling at ${startFuellingAt} minutes. You need ${carbsPerHour}g/hr — that's roughly ${Math.round(carbsPerHour / (60 / feedingInterval))}g every ${feedingInterval} minutes. Front-load your fuelling. It's far easier to maintain glycogen than to recover from depletion.`
    );
    strategy.push(
      `Use dual-source carbohydrates (glucose:fructose at 1:0.8). This is non-negotiable at ${carbsPerHour}g/hr — single-source glucose maxes out at ~60g/hr (Jeukendrup). Most commercial gels and drinks now use this ratio.`
    );
    strategy.push(
      "Mix your fuelling sources: gels for quick hits, energy drink for sustained intake, and real food (rice cakes, bars) for variety on longer rides. Variety reduces flavour fatigue — a real issue after 3+ hours."
    );
  }

  // Gut training advice if relevant
  if (gutTraining === "none" && carbsPerHour > 50) {
    strategy.push(
      `Your target is ${carbsPerHour}g/hr but without gut training, start at 40-50g/hr and build up by 5-10g per week over 4-6 weeks. Impey's research at Hexis shows the gut adapts — trained athletes can double their carb tolerance.`
    );
  }

  return {
    carbsPerHour,
    carbsPerHourRange: [carbsLow, carbsHigh],
    totalCarbs,
    fluidPerHour,
    fluidPerHourRange: [fluidLow, fluidHigh],
    totalFluid,
    sodiumPerHour,
    glucosePerHour,
    fructosePerHour,
    strategy,
    feedingInterval,
    startFuellingAt,
    dualSource,
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
  const [gutTraining, setGutTraining] = useState<GutTraining>("some");
  const [result, setResult] = useState<FuellingResult | null>(null);
  const [copied, setCopied] = useState(false);

  const durationError = getValidationError(duration, "duration");
  const weightError = getValidationError(weight, "weight");
  const hasErrors = !!durationError || !!weightError;

  const handleCalculate = () => {
    if (hasErrors) return;
    const d = parseInt(duration);
    const w = parseFloat(weight);
    if (d > 0 && w > 0) {
      setResult(calculateFuelling(d, intensity, w, gutTraining));
    }
  };

  const handleCopyResults = async () => {
    if (!result) return;
    const text = `Fuelling Plan: ${result.carbsPerHourRange[0]}–${result.carbsPerHourRange[1]}g carbs/hr (${result.dualSource ? `${result.glucosePerHour}g glucose + ${result.fructosePerHour}g fructose` : "single source"}), ${result.fluidPerHour}ml fluid/hr, ${result.sodiumPerHour}mg sodium/hr, ${result.totalCarbs}g total carbs (${duration}min ${intensity} ride, ${weight}kg) — roadmancycling.com/tools/fuelling`;
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
              Personalised carb, fluid, and sodium targets based on the latest sports science from Morton, Jeukendrup, and Hexis.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              {/* Duration */}
              <div>
                <label htmlFor="fuel-duration" className="block font-heading text-lg text-off-white mb-2">RIDE DURATION (MINUTES)</label>
                <input id="fuel-duration" type="number" min="15" max="600" placeholder="e.g. 180"
                  value={duration} onChange={(e) => { setDuration(e.target.value); setResult(null); }}
                  className={`${durationError ? errorInputClasses : inputClasses} text-xl`}
                />
                {durationError && <p className="text-red-400 text-xs mt-1">{durationError}</p>}
              </div>

              {/* Intensity */}
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

              {/* Body Weight */}
              <div>
                <label htmlFor="fuel-weight" className="block font-heading text-lg text-off-white mb-2">BODY WEIGHT (KG)</label>
                <input id="fuel-weight" type="number" min="40" max="150" step="0.1" placeholder="e.g. 75"
                  value={weight} onChange={(e) => { setWeight(e.target.value); setResult(null); }}
                  className={weightError ? errorInputClasses : inputClasses}
                />
                {weightError && <p className="text-red-400 text-xs mt-1">{weightError}</p>}
              </div>

              {/* Gut Training */}
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">GUT TRAINING</label>
                <p className="text-foreground-subtle text-xs mb-3">
                  How practiced is your gut at absorbing carbs during exercise? (Impey et al., Hexis)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ["none", "Beginner", "Never practised race nutrition"],
                    ["some", "Moderate", "Some experience fuelling on rides"],
                    ["trained", "Trained", "Systematically practised high-carb intake"],
                  ] as const).map(([val, label, desc]) => (
                    <button key={val} type="button"
                      onClick={() => { setGutTraining(val); setResult(null); }}
                      className={`py-3 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                        gutTraining === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      <span className="font-heading text-xs tracking-wider block">{label}</span>
                      <span className="text-[10px] opacity-70 block mt-0.5">{desc}</span>
                    </button>
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
                  key={`${result.carbsPerHour}-${result.totalCarbs}-${result.glucosePerHour}`}
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

                  {/* Primary metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    >
                      <p className="text-[10px] text-foreground-subtle mb-1 tracking-wider">CARBS/HOUR</p>
                      <p className="font-heading text-2xl text-coral">{result.carbsPerHourRange[0]}–{result.carbsPerHourRange[1]}g</p>
                      <p className="text-[10px] text-foreground-subtle mt-1">target: {result.carbsPerHour}g</p>
                    </motion.div>
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.15 }}
                    >
                      <p className="text-[10px] text-foreground-subtle mb-1 tracking-wider">FLUID/HOUR</p>
                      <p className="font-heading text-2xl text-coral">{result.fluidPerHourRange[0]}–{result.fluidPerHourRange[1]}ml</p>
                      <p className="text-[10px] text-foreground-subtle mt-1">~{result.totalFluid}L total</p>
                    </motion.div>
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.2 }}
                    >
                      <p className="text-[10px] text-foreground-subtle mb-1 tracking-wider">SODIUM/HOUR</p>
                      <p className="font-heading text-2xl text-coral">{result.sodiumPerHour}mg</p>
                      <p className="text-[10px] text-foreground-subtle mt-1">electrolytes</p>
                    </motion.div>
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.25 }}
                    >
                      <p className="text-[10px] text-foreground-subtle mb-1 tracking-wider">TOTAL CARBS</p>
                      <p className="font-heading text-2xl text-coral">{result.totalCarbs}g</p>
                      <p className="text-[10px] text-foreground-subtle mt-1">for entire ride</p>
                    </motion.div>
                  </div>

                  {/* Glucose:Fructose split — only show when dual-source */}
                  {result.dualSource && (
                    <motion.div
                      className="bg-coral/10 rounded-xl border border-coral/20 p-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.28 }}
                    >
                      <h3 className="font-heading text-sm text-coral mb-2 tracking-wider">GLUCOSE : FRUCTOSE SPLIT (1:0.8)</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-foreground-muted mb-1">
                            <span>Glucose</span>
                            <span>{result.glucosePerHour}g/hr</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-coral rounded-full" style={{ width: `${(result.glucosePerHour / result.carbsPerHour) * 100}%` }} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-foreground-muted mb-1">
                            <span>Fructose</span>
                            <span>{result.fructosePerHour}g/hr</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple rounded-full" style={{ width: `${(result.fructosePerHour / result.carbsPerHour) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-foreground-subtle mt-2">
                        Above 60g/hr, you need dual-source carbohydrates. Glucose uses the SGLT1 transporter (maxes at ~60g/hr). Fructose uses the GLUT5 transporter independently. Combined, absorption can reach 90-120g/hr (Jeukendrup, 2014).
                      </p>
                    </motion.div>
                  )}

                  {/* Timing */}
                  <motion.div
                    className="bg-background-elevated rounded-xl border border-white/5 p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.32 }}
                  >
                    <h3 className="font-heading text-sm text-off-white mb-3 tracking-wider">TIMING</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-foreground-subtle text-[10px] tracking-wider mb-0.5">START FUELLING</p>
                        <p className="font-heading text-lg text-off-white">{result.startFuellingAt} min</p>
                      </div>
                      <div>
                        <p className="text-foreground-subtle text-[10px] tracking-wider mb-0.5">FEED EVERY</p>
                        <p className="font-heading text-lg text-off-white">{result.feedingInterval} min</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Strategy */}
                  <motion.div
                    className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.36 }}
                  >
                    <h3 className="font-heading text-sm text-off-white mb-3 tracking-wider">STRATEGY</h3>
                    <div className="space-y-3">
                      {result.strategy.map((paragraph, i) => (
                        <p key={i} className="text-foreground-muted text-sm leading-relaxed">{paragraph}</p>
                      ))}
                    </div>
                  </motion.div>

                  {/* Learn More */}
                  <motion.div
                    className="rounded-xl border border-white/10 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.42 }}
                  >
                    <h3 className="font-heading text-sm text-off-white mb-3 tracking-wider">LEARN MORE</h3>
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
                    transition={{ duration: 0.35, delay: 0.48 }}
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
