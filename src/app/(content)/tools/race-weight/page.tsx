"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";

type EventType = "road-race" | "gran-fondo" | "hill-climb" | "time-trial" | "gravel";
type Gender = "male" | "female";

function calculateRaceWeight(
  heightCm: number,
  currentWeightKg: number,
  bodyFatPercent: number,
  eventType: EventType,
  gender: Gender
): {
  targetWeightMin: number;
  targetWeightMax: number;
  targetBfMin: number;
  targetBfMax: number;
  weeksToTarget: number;
  approach: string;
} {
  // Gender-specific target body fat ranges by event type (competitive amateur)
  // Male ranges from sports science literature (Jeukendrup & Gleeson)
  // Female ranges account for ~8-10% higher essential fat (Lohman 1992)
  const targetBf: Record<EventType, Record<Gender, [number, number]>> = {
    "road-race": { male: [8, 12], female: [16, 22] },
    "gran-fondo": { male: [10, 14], female: [18, 24] },
    "hill-climb": { male: [7, 10], female: [14, 19] },
    "time-trial": { male: [10, 14], female: [18, 24] },
    "gravel": { male: [10, 15], female: [18, 25] },
  };

  const [bfMin, bfMax] = targetBf[eventType][gender];
  const leanMass = currentWeightKg * (1 - bodyFatPercent / 100);

  // targetMin = lightest healthy target (at lowest BF%)
  // targetMax = upper target (at highest BF%)
  const targetMin = leanMass / (1 - bfMin / 100);
  const targetMax = leanMass / (1 - bfMax / 100);

  // Height-based minimum floor (don't recommend below healthy weight)
  // Miller formula for minimum healthy weight
  const heightFloor = gender === "male"
    ? 56.2 + 1.41 * ((heightCm - 152.4) / 2.54)
    : 53.1 + 1.36 * ((heightCm - 152.4) / 2.54);
  const safeMin = Math.max(targetMin, heightFloor);

  // Estimate weeks at safe rate (0.5% body weight per week)
  const midTarget = (safeMin + targetMax) / 2;
  const weightToLose = Math.max(0, currentWeightKg - midTarget);
  const weeklyLoss = currentWeightKg * 0.005;
  const weeks = weeklyLoss > 0 ? Math.ceil(weightToLose / weeklyLoss) : 0;

  let approach = "";
  if (weeks === 0) {
    approach = "You're already within your target race weight range. Focus on maintaining body composition while building power.";
  } else if (weeks <= 8) {
    approach = "A moderate deficit through better food quality and fuelling timing. No need to restrict calories — just eat smarter around your training.";
  } else if (weeks <= 16) {
    approach = "A structured body composition phase. Focus on protein adequacy (1.6-2.2g/kg), fuelling your key sessions, and creating a small deficit on easy days.";
  } else {
    approach = "A longer-term approach is needed. Prioritise slow, sustainable change — 0.5% body weight per week maximum. Faster than that and you risk losing power, getting sick, or developing an unhealthy relationship with food.";
  }

  return {
    targetWeightMin: Math.round(safeMin * 10) / 10,
    targetWeightMax: Math.round(targetMax * 10) / 10,
    targetBfMin: bfMin,
    targetBfMax: bfMax,
    weeksToTarget: weeks,
    approach,
  };
}

// Validation
const VALIDATION = {
  height: { min: 120, max: 230, label: "Height", unit: "cm" },
  weight: { min: 30, max: 200, label: "Weight", unit: "kg" },
  bodyFat: { min: 3, max: 50, label: "Body fat", unit: "%" },
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

export default function RaceWeightPage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [eventType, setEventType] = useState<EventType>("road-race");
  const [result, setResult] = useState<ReturnType<typeof calculateRaceWeight> | null>(null);
  const [copied, setCopied] = useState(false);

  const heightError = getValidationError(height, "height");
  const weightError = getValidationError(weight, "weight");
  const bodyFatError = getValidationError(bodyFat, "bodyFat");
  const hasErrors = !!heightError || !!weightError || !!bodyFatError;

  const handleCalculate = () => {
    if (hasErrors) return;
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const bf = parseFloat(bodyFat);
    if (h > 0 && w > 0 && bf > 0 && bf < 50) {
      setResult(calculateRaceWeight(h, w, bf, eventType, gender));
    }
  };

  const handleCopyResults = async () => {
    if (!result) return;
    const eventLabels: Record<EventType, string> = {
      "road-race": "Road Race", "gran-fondo": "Gran Fondo", "hill-climb": "Hill Climb",
      "time-trial": "Time Trial", "gravel": "Gravel",
    };
    const text = `Race Weight: ${result.targetWeightMin}-${result.targetWeightMax}kg (target BF ${result.targetBfMin}-${result.targetBfMax}%, ${eventLabels[eventType]}, ${gender})${result.weeksToTarget > 0 ? ` — est. ${result.weeksToTarget} weeks` : ""} — roadmancycling.com/tools/race-weight`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none transition-colors";
  const errorInputClasses = "w-full bg-white/5 border border-red-500/60 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-red-500 focus:outline-none transition-colors";

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              RACE WEIGHT CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Your target weight range for peak cycling performance. Based on body composition, not BMI.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              {/* Gender */}
              <div>
                <label id="rw-gender-label" className="block font-heading text-lg text-off-white mb-2">GENDER</label>
                <div className="flex gap-3" role="group" aria-labelledby="rw-gender-label">
                  {([["male", "Male"], ["female", "Female"]] as const).map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => { setGender(val); setResult(null); }}
                      aria-pressed={gender === val}
                      className={`flex-1 py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        gender === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="rw-height" className="block font-heading text-lg text-off-white mb-2">HEIGHT (CM)</label>
                <input id="rw-height" type="number" min="140" max="210" placeholder="e.g. 178"
                  value={height} onChange={(e) => { setHeight(e.target.value); setResult(null); }}
                  className={heightError ? errorInputClasses : inputClasses}
                />
                {heightError && <p className="text-red-400 text-xs mt-1" role="alert">{heightError}</p>}
              </div>
              <div>
                <label htmlFor="rw-weight" className="block font-heading text-lg text-off-white mb-2">CURRENT WEIGHT (KG)</label>
                <input id="rw-weight" type="number" min="40" max="150" step="0.1" placeholder="e.g. 82"
                  value={weight} onChange={(e) => { setWeight(e.target.value); setResult(null); }}
                  className={weightError ? errorInputClasses : inputClasses}
                />
                {weightError && <p className="text-red-400 text-xs mt-1" role="alert">{weightError}</p>}
              </div>
              <div>
                <label htmlFor="rw-bodyfat" className="block font-heading text-lg text-off-white mb-2">BODY FAT %</label>
                <p className="text-xs text-foreground-subtle mb-2">Estimate is fine. Most {gender === "male" ? "male cyclists are 12-25%" : "female cyclists are 18-32%"}. Use a smart scale or caliper test for accuracy.</p>
                <input id="rw-bodyfat" type="number" min="4" max="45" step="0.5" placeholder="e.g. 18"
                  value={bodyFat} onChange={(e) => { setBodyFat(e.target.value); setResult(null); }}
                  className={bodyFatError ? errorInputClasses : inputClasses}
                />
                {bodyFatError && <p className="text-red-400 text-xs mt-1" role="alert">{bodyFatError}</p>}
              </div>
              <div>
                <label id="rw-event-label" className="block font-heading text-lg text-off-white mb-2">TARGET EVENT</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-labelledby="rw-event-label">
                  {([
                    ["road-race", "Road Race"],
                    ["gran-fondo", "Gran Fondo"],
                    ["hill-climb", "Hill Climb"],
                    ["time-trial", "Time Trial"],
                    ["gravel", "Gravel"],
                  ] as const).map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => { setEventType(val); setResult(null); }}
                      aria-pressed={eventType === val}
                      className={`py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        eventType === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
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
                  key={`${result.targetWeightMin}-${result.targetWeightMax}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl text-off-white">YOUR RACE WEIGHT RANGE</h2>
                    <button
                      onClick={handleCopyResults}
                      aria-label={copied ? "Results copied to clipboard" : "Copy results to clipboard"}
                      className="text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy Results"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    >
                      <p className="text-sm text-foreground-subtle mb-1">TARGET RANGE</p>
                      <p className="font-heading text-3xl text-coral">
                        {result.targetWeightMin}–{result.targetWeightMax}
                      </p>
                      <p className="text-foreground-muted text-sm">kg</p>
                    </motion.div>
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.18 }}
                    >
                      <p className="text-sm text-foreground-subtle mb-1">TARGET BODY FAT</p>
                      <p className="font-heading text-3xl text-coral">
                        {result.targetBfMin}–{result.targetBfMax}
                      </p>
                      <p className="text-foreground-muted text-sm">%</p>
                    </motion.div>
                  </div>

                  {result.weeksToTarget > 0 && (
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.25 }}
                    >
                      <p className="text-sm text-foreground-subtle mb-1">ESTIMATED TIMELINE</p>
                      <p className="font-heading text-3xl text-coral">{result.weeksToTarget}</p>
                      <p className="text-foreground-muted text-sm">weeks (at safe rate)</p>
                    </motion.div>
                  )}

                  <motion.div
                    className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.32 }}
                  >
                    <h3 className="font-heading text-lg text-off-white mb-3">RECOMMENDED APPROACH</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">{result.approach}</p>
                  </motion.div>

                  <motion.div
                    className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.38 }}
                  >
                    <h3 className="font-heading text-lg text-off-white mb-3">IMPORTANT</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      Race weight is about body composition, not the number on the scale.
                      Anthony lost 7kg in 12 weeks while eating <em>more</em> food — by focusing on food quality,
                      protein timing, and properly fuelling rides. Crash diets destroy power and health.
                      If you&apos;re unsure about your approach, the Not Done Yet community includes
                      nutrition guidance from the same principles discussed on the podcast.
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
                        <a href="/blog/cycling-body-composition-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling Body Composition Guide
                        </a>
                      </li>
                      <li>
                        <a href="/blog/cycling-weight-loss-fuel-for-the-work-required" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Fuel for the Work Required: Weight Loss in Cycling
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
                      heading="GET THE NUTRITION FRAMEWORK THAT ACTUALLY WORKS"
                      subheading="Body composition, fuelling, and recovery — evidence-based, once a week."
                      source="tool-race-weight"
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
