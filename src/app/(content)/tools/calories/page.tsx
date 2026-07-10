"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

/* ── Effort level presets (Compendium of Physical Activities) ── */
const EFFORT_LEVELS = [
  { label: "Light (12-14 km/h)", met: 6.8, vo2Pct: 0.45 },
  { label: "Moderate (16-19 km/h)", met: 8.0, vo2Pct: 0.60 },
  { label: "Vigorous (20-25 km/h)", met: 10.0, vo2Pct: 0.75 },
  { label: "Racing (26-30 km/h)", met: 12.0, vo2Pct: 0.85 },
  { label: "Sprint / very hard (>30 km/h)", met: 15.8, vo2Pct: 0.95 },
];

const GROSS_EFFICIENCY = 0.24;

/* ── Food equivalents ── */
const FOOD_EQUIVALENTS = [
  { name: "bananas", kcal: 105 },
  { name: "energy gels", kcal: 100 },
  { name: "pints of beer", kcal: 180 },
];

/* ── Fuel split by VO2max percentage ── */
function getFuelSplit(vo2Pct: number): { fatPct: number; carbPct: number; label: string } {
  if (vo2Pct < 0.65) return { fatPct: 60, carbPct: 40, label: "Below 65% VO2max" };
  if (vo2Pct <= 0.80) return { fatPct: 40, carbPct: 60, label: "65-80% VO2max" };
  return { fatPct: 20, carbPct: 80, label: "Above 80% VO2max" };
}

/* ── Map watts to approximate VO2max fraction ── */
function wattsToVo2Pct(watts: number, weightKg: number): number {
  // Rough linear model: VO2 (ml/kg/min) ~ (watts × 10.8 / weightKg) + 7
  // VO2max for trained cyclist ~ 50-60 ml/kg/min, scale accordingly
  const vo2 = (watts * 10.8) / weightKg + 7;
  const estimatedMax = 55; // reasonable assumption for recreational-competitive cyclist
  return Math.min(vo2 / estimatedMax, 1.0);
}

/* ── Validation helpers ── */
function getWeightError(value: string, isLbs: boolean): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Enter a valid number";
  if (isLbs) {
    if (num < 88) return "Weight must be at least 88 lb";
    if (num > 330) return "Weight must be under 330 lb";
  } else {
    if (num < 40) return "Weight must be at least 40 kg";
    if (num > 150) return "Weight must be under 150 kg";
  }
  return null;
}

function getDurationError(hours: string, minutes: string): string | null {
  const h = parseInt(hours) || 0;
  const m = parseInt(minutes) || 0;
  if (hours && isNaN(parseInt(hours))) return "Enter a valid number for hours";
  if (minutes && isNaN(parseInt(minutes))) return "Enter a valid number for minutes";
  if (h === 0 && m === 0) return null;
  if (m > 59) return "Minutes must be 0-59";
  if (h > 12) return "Hours must be 0-12";
  if (h === 0 && m < 5) return "Duration must be at least 5 minutes";
  return null;
}

function getWattsError(value: string): string | null {
  if (!value) return null;
  const num = parseInt(value);
  if (isNaN(num)) return "Enter a valid number";
  if (num < 30) return "Power must be at least 30W";
  if (num > 600) return "Power must be under 600W";
  return null;
}

export default function CaloriesPage() {
  const [weight, setWeight] = useState("");
  const [isLbs, setIsLbs] = useState(false);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [method, setMethod] = useState<"effort" | "power">("effort");
  const [effortIndex, setEffortIndex] = useState(1); // default: Moderate
  const [watts, setWatts] = useState("");
  const [calculated, setCalculated] = useState(false);

  /* ── Derived values ── */
  const weightVal = parseFloat(weight) || 0;
  const weightKg = isLbs ? weightVal * 0.45359237 : weightVal;
  const hoursVal = parseInt(hours) || 0;
  const minutesVal = parseInt(minutes) || 0;
  const totalSeconds = (hoursVal * 60 + minutesVal) * 60;
  const totalHours = totalSeconds / 3600;
  const wattsVal = parseInt(watts) || 0;

  /* ── Calorie calculation ── */
  let totalCalories = 0;
  let vo2Pct = 0;

  if (method === "effort") {
    const level = EFFORT_LEVELS[effortIndex];
    totalCalories = level.met * weightKg * totalHours;
    vo2Pct = level.vo2Pct;
  } else {
    const kj = (wattsVal * totalSeconds) / 1000;
    totalCalories = kj / GROSS_EFFICIENCY;
    vo2Pct = wattsToVo2Pct(wattsVal, weightKg);
  }

  const calPerHour = totalHours > 0 ? totalCalories / totalHours : 0;
  const fuelSplit = getFuelSplit(vo2Pct);
  const fatCalories = totalCalories * (fuelSplit.fatPct / 100);
  const carbCalories = totalCalories * (fuelSplit.carbPct / 100);

  /* ── Post-ride refuelling (rides > 90 min) ── */
  const isLongRide = totalSeconds > 5400; // > 90 min
  const carbsToReplenish = isLongRide ? { min: Math.round(weightKg * 0.8), max: Math.round(weightKg * 1.2) } : null;
  const proteinTarget = Math.round(weightKg * 0.3);

  /* ── Validation ── */
  const weightError = getWeightError(weight, isLbs);
  const durationError = getDurationError(hours, minutes);
  const wattsError = method === "power" ? getWattsError(watts) : null;
  const hasDuration = hoursVal > 0 || minutesVal > 0;
  const canCalculate =
    weightVal > 0 &&
    hasDuration &&
    !weightError &&
    !durationError &&
    (method === "effort" || (wattsVal > 0 && !wattsError));

  const resetCalc = () => setCalculated(false);

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              CALORIES BURNED CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              What a ride actually costs you in energy. From effort level or average power.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">

              {/* Weight input with unit toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="weight-input" className="font-heading text-sm text-off-white">
                    BODY WEIGHT ({isLbs ? "LB" : "KG"})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (weightVal > 0) {
                        const converted = isLbs
                          ? (weightVal * 0.45359237).toFixed(1)
                          : (weightVal / 0.45359237).toFixed(0);
                        setWeight(converted);
                      }
                      setIsLbs(!isLbs);
                      resetCalc();
                    }}
                    className="text-coral text-xs font-body hover:text-coral/80 transition-colors"
                  >
                    Switch to {isLbs ? "kg" : "lb"}
                  </button>
                </div>
                <input
                  id="weight-input"
                  type="number"
                  inputMode="decimal"
                  min={isLbs ? "88" : "40"}
                  max={isLbs ? "330" : "150"}
                  step={isLbs ? "1" : "0.1"}
                  placeholder={isLbs ? "e.g. 165" : "e.g. 75"}
                  aria-label={`Your body weight in ${isLbs ? "pounds" : "kilograms"}`}
                  aria-invalid={!!weightError}
                  value={weight}
                  onChange={(e) => { setWeight(e.target.value); resetCalc(); }}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${weightError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                />
                {weightError && <p className="text-red-400 text-xs mt-1" role="alert">{weightError}</p>}
              </div>

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
                      max="12"
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

              {/* Intensity method toggle */}
              <div className="mb-6">
                <label className="block font-heading text-sm text-off-white mb-2">INTENSITY METHOD</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setMethod("effort"); resetCalc(); }}
                    className={`rounded-lg px-4 py-3 text-sm font-heading tracking-wider transition-all border ${
                      method === "effort"
                        ? "bg-coral/20 border-coral text-coral"
                        : "bg-white/5 border-white/10 text-foreground-subtle hover:border-white/20"
                    }`}
                  >
                    BY EFFORT LEVEL
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMethod("power"); resetCalc(); }}
                    className={`rounded-lg px-4 py-3 text-sm font-heading tracking-wider transition-all border ${
                      method === "power"
                        ? "bg-coral/20 border-coral text-coral"
                        : "bg-white/5 border-white/10 text-foreground-subtle hover:border-white/20"
                    }`}
                  >
                    BY AVERAGE POWER
                  </button>
                </div>
              </div>

              {/* Effort level dropdown OR power input */}
              {method === "effort" ? (
                <div className="mb-6">
                  <label htmlFor="effort-select" className="block font-heading text-sm text-off-white mb-2">EFFORT LEVEL</label>
                  <select
                    id="effort-select"
                    value={effortIndex}
                    onChange={(e) => { setEffortIndex(parseInt(e.target.value)); resetCalc(); }}
                    aria-label="Select your riding effort level"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-lg font-heading tracking-wider focus:outline-none focus:border-coral transition-colors appearance-none cursor-pointer"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f87171' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                  >
                    {EFFORT_LEVELS.map((level, i) => (
                      <option key={level.label} value={i}>{level.label}</option>
                    ))}
                  </select>
                  <p className="text-foreground-subtle text-xs mt-1.5">
                    MET {EFFORT_LEVELS[effortIndex].met} — based on the Compendium of Physical Activities.
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <label htmlFor="watts-input" className="block font-heading text-sm text-off-white mb-2">AVERAGE POWER (WATTS)</label>
                  <input
                    id="watts-input"
                    type="number"
                    inputMode="numeric"
                    min="30"
                    max="600"
                    placeholder="e.g. 180"
                    aria-label="Average power in watts"
                    aria-invalid={!!wattsError}
                    value={watts}
                    onChange={(e) => { setWatts(e.target.value); resetCalc(); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && canCalculate) setCalculated(true); }}
                    className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${wattsError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                  />
                  {wattsError && <p className="text-red-400 text-xs mt-1" role="alert">{wattsError}</p>}
                  <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-foreground-muted text-xs leading-relaxed">
                      Power-based calculation is more accurate than MET estimates. Your bike computer records
                      kilojoules — divide by ~0.24 (human efficiency) to get calories. This calculator does that
                      math for you.
                    </p>
                  </div>
                </div>
              )}

              <Button onClick={() => canCalculate && setCalculated(true)} size="lg" className="w-full">
                Calculate Calories
              </Button>
            </div>

            {/* ── Results ── */}
            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && totalCalories > 0 && (
                  <motion.div
                    key={`${weightKg}-${totalSeconds}-${method}-${method === "effort" ? effortIndex : wattsVal}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Big calorie number */}
                    <div className="text-center mb-8">
                      <p className="font-heading text-6xl md:text-8xl text-coral mb-2">
                        {Math.round(totalCalories).toLocaleString()}
                      </p>
                      <p className="font-heading text-xl text-off-white">CALORIES BURNED</p>
                      <p className="text-foreground-muted mt-2">
                        {Math.round(calPerHour).toLocaleString()} kcal/hour over {hoursVal > 0 ? `${hoursVal}h ` : ""}{minutesVal > 0 ? `${minutesVal}m` : ""}
                      </p>
                    </div>

                    {/* Fat vs Carb fuel split */}
                    <div className="rounded-xl border border-white/10 bg-background-elevated p-6 mb-6">
                      <h3 className="font-heading text-sm text-off-white mb-1">FUEL SOURCE SPLIT</h3>
                      <p className="text-foreground-subtle text-xs mb-4">{fuelSplit.label} — estimated from intensity</p>

                      <div className="flex gap-2 mb-3 h-6 rounded-full overflow-hidden">
                        <motion.div
                          className="rounded-l-full bg-amber-500/80"
                          initial={{ width: 0 }}
                          animate={{ width: `${fuelSplit.fatPct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                        <motion.div
                          className="rounded-r-full bg-coral"
                          initial={{ width: 0 }}
                          animate={{ width: `${fuelSplit.carbPct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="font-heading text-2xl text-amber-400">{Math.round(fatCalories)}</p>
                          <p className="text-foreground-subtle text-xs">kcal from fat ({fuelSplit.fatPct}%)</p>
                        </div>
                        <div>
                          <p className="font-heading text-2xl text-coral">{Math.round(carbCalories)}</p>
                          <p className="text-foreground-subtle text-xs">kcal from carbs ({fuelSplit.carbPct}%)</p>
                        </div>
                      </div>
                    </div>

                    {/* Food equivalents */}
                    <div className="rounded-xl border border-white/10 bg-background-elevated p-6 mb-6">
                      <h3 className="font-heading text-sm text-off-white mb-4">IN REAL TERMS</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        {FOOD_EQUIVALENTS.map((food) => {
                          const count = Math.round(totalCalories / food.kcal * 10) / 10;
                          return (
                            <div key={food.name}>
                              <p className="font-heading text-2xl text-off-white">{count}</p>
                              <p className="text-foreground-subtle text-xs">{food.name}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Post-ride refuelling */}
                    <div className="rounded-xl border border-white/10 bg-background-elevated p-6 mb-8">
                      <h3 className="font-heading text-sm text-off-white mb-4">POST-RIDE REFUELLING</h3>
                      <div className="space-y-3">
                        {carbsToReplenish ? (
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-coral mt-1.5 shrink-0" />
                            <div>
                              <p className="text-off-white text-sm">
                                {carbsToReplenish.min}-{carbsToReplenish.max}g carbs within 30 minutes
                              </p>
                              <p className="text-foreground-subtle text-xs">
                                0.8-1.2 g/kg — the glycogen replenishment window matters most after rides over 90 minutes.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            <div>
                              <p className="text-off-white text-sm">
                                Normal meal timing is fine for rides under 90 minutes
                              </p>
                              <p className="text-foreground-subtle text-xs">
                                No need to rush post-ride carbs. Eat a balanced meal when it suits you.
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-off-white text-sm">
                              ~{proteinTarget}g protein for muscle repair
                            </p>
                            <p className="text-foreground-subtle text-xs">
                              0.3 g/kg — spread across your post-ride meal. Whey, eggs, or Greek yoghurt all work.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* What Next */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT?</h3>
                      <ul className="space-y-2">
                        <li><Link href="/tools/fuelling" className="text-coral hover:text-coral/80 text-sm transition-colors">In-Ride Fuelling Calculator</Link></li>
                        <li><Link href="/tools/fuel-planner" className="text-coral hover:text-coral/80 text-sm transition-colors">Cycling Fuel Planner</Link></li>
                        <li><Link href="/tools/energy-availability" className="text-coral hover:text-coral/80 text-sm transition-colors">Energy Availability Calculator</Link></li>
                        <li><Link href="/topics/cycling-nutrition" className="text-coral hover:text-coral/80 text-sm transition-colors">Nutrition topic hub</Link></li>
                      </ul>
                    </div>

                    {/* CTA box */}
                    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">WANT A FUELLING PLAN THAT MATCHES YOUR TRAINING?</p>
                      <p className="text-off-white font-heading text-lg mb-2">Calories in vs out is the start.</p>
                      <p className="text-foreground-muted text-sm mb-4">
                        Timing, composition, and periodising your nutrition around training blocks is where the real gains hide.
                      </p>
                      <a href="/apply" className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all" data-track="tool_calories_apply">
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
                <strong className="text-off-white">MET-based formula:</strong> Calories = MET x body weight (kg) x duration (hours).
                MET values sourced from the Compendium of Physical Activities (Ainsworth et al., 2011). A MET of 8.0 means the activity
                costs eight times your resting metabolic rate.
              </p>
              <p>
                <strong className="text-off-white">Power-based formula:</strong> kJ = watts x seconds / 1000.
                Kilocalories = kJ / gross mechanical efficiency (default 0.24, meaning ~24% of metabolic energy reaches the pedals).
                This is the same conversion your bike computer uses when it reports kilojoules — kJ and kcal are close to 1:1 precisely
                because human efficiency sits near 0.24.
              </p>
              <p>
                <strong className="text-off-white">Fuel split model:</strong> Fat and carbohydrate contribution estimated from
                exercise intensity relative to VO2max. Below ~65% VO2max, fat oxidation dominates. Above ~80% VO2max,
                carbohydrate becomes the primary fuel. Individual variation depends on training status, diet, and glycogen stores.
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> MET values are population averages and do not
                account for wind, gradient, road surface, drafting, or individual metabolic variation. Power-based
                calculation is significantly more accurate because it measures actual mechanical work. Gross efficiency
                ranges from 0.20 to 0.28 across individuals — 0.24 is the accepted mid-range default.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 &middot; Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="calories" />
      </main>
      <Footer />
    </>
  );
}
