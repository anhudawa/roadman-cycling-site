"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

/* ── Intensity presets (sweat rate baselines, L/hr) ── */
const INTENSITY_LEVELS = [
  { label: "Easy / Zone 2", sweatRate: 0.5, id: "easy" },
  { label: "Moderate / Tempo", sweatRate: 0.7, id: "moderate" },
  { label: "Hard / Threshold+", sweatRate: 1.0, id: "hard" },
  { label: "Race pace", sweatRate: 1.2, id: "race" },
];

/* ── Temperature multipliers ── */
const TEMP_LEVELS = [
  { label: "Cool (<15°C)", multiplier: 0.8, id: "cool" },
  { label: "Mild (15–25°C)", multiplier: 1.0, id: "mild" },
  { label: "Hot (25–35°C)", multiplier: 1.3, id: "hot" },
  { label: "Extreme (>35°C)", multiplier: 1.6, id: "extreme" },
];

/* ── Hydration zones ── */
const HYDRATION_ZONES = [
  { min: 0, max: 1, label: "Low risk", desc: "Sip to thirst — no structured plan needed", color: "#22C55E" },
  { min: 1, max: 2, label: "Moderate", desc: "Set a reminder every 15–20 min", color: "#3B82F6" },
  { min: 2, max: 3, label: "High", desc: "Pre-load and drink to plan", color: "#EAB308" },
  { min: 3, max: 100, label: "Extreme", desc: "Sodium tablets, pre-ride loading, in-ride plan essential", color: "#EF4444" },
];

function getHydrationZone(litres: number) {
  return HYDRATION_ZONES.find((z) => litres >= z.min && litres < z.max) || HYDRATION_ZONES[HYDRATION_ZONES.length - 1];
}

/* ── Body weight adjustment factor ── */
function getWeightMultiplier(weightKg: number): number {
  // 75 kg as reference. Heavier riders sweat more, lighter riders less.
  // ~1% per 5 kg deviation from reference (conservative).
  if (weightKg <= 0) return 1.0;
  return 0.8 + (weightKg / 75) * 0.2;
}

/* ── Validation ── */
function getDurationError(hours: string, minutes: string): string | null {
  const h = parseInt(hours) || 0;
  const m = parseInt(minutes) || 0;
  if (hours && isNaN(parseInt(hours))) return "Enter a valid number for hours";
  if (minutes && isNaN(parseInt(minutes))) return "Enter a valid number for minutes";
  if (h === 0 && m === 0) return null;
  if (m > 59) return "Minutes must be 0–59";
  if (h > 12) return "Hours must be 0–12";
  if (h === 0 && m < 15) return "Duration must be at least 15 minutes";
  return null;
}

function getWeightError(value: string): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Enter a valid number";
  if (num < 40) return "Weight must be at least 40 kg";
  if (num > 200) return "Weight must be under 200 kg";
  return null;
}

function getSweatRateError(value: string): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Enter a valid number";
  if (num < 100) return "Sweat rate must be at least 100 ml/hr";
  if (num > 3000) return "Sweat rate must be under 3000 ml/hr";
  return null;
}

export default function HydrationPage() {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [intensity, setIntensity] = useState("moderate");
  const [temp, setTemp] = useState("mild");
  const [weight, setWeight] = useState("");
  const [customSweatRate, setCustomSweatRate] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bottleSize, setBottleSize] = useState<500 | 750>(500);
  const [calculated, setCalculated] = useState(false);

  const hoursVal = parseInt(hours) || 0;
  const minutesVal = parseInt(minutes) || 0;
  const totalMinutes = hoursVal * 60 + minutesVal;
  const totalHours = totalMinutes / 60;
  const weightVal = parseFloat(weight) || 0;
  const customSweatVal = parseFloat(customSweatRate) || 0;

  const durationError = getDurationError(hours, minutes);
  const weightError = getWeightError(weight);
  const sweatRateError = getSweatRateError(customSweatRate);

  const hasDuration = hoursVal > 0 || minutesVal > 0;
  const canCalculate = hasDuration && !durationError && !weightError && !sweatRateError;

  const resetCalc = () => setCalculated(false);

  // ── Calculation ──
  const intensityPreset = INTENSITY_LEVELS.find((i) => i.id === intensity)!;
  const tempPreset = TEMP_LEVELS.find((t) => t.id === temp)!;

  // Base sweat rate: use custom override if provided, otherwise use preset
  const baseSweatRate = customSweatVal > 0 ? customSweatVal / 1000 : intensityPreset.sweatRate;

  // Apply temperature multiplier (skip if custom sweat rate already accounts for conditions)
  const tempAdjustedRate = customSweatVal > 0 ? baseSweatRate : baseSweatRate * tempPreset.multiplier;

  // Apply body weight adjustment if provided
  const weightMultiplier = weightVal > 0 ? getWeightMultiplier(weightVal) : 1.0;
  const finalSweatRate = tempAdjustedRate * weightMultiplier;

  // Total fluid loss
  const totalFluidLoss = finalSweatRate * totalHours;

  // Recommended intake: replace 70–80% (midpoint 75%)
  const replacementTarget = totalFluidLoss * 0.75;

  // Bottles needed
  const bottleSizeLitres = bottleSize / 1000;
  const bottlesNeeded = Math.ceil(replacementTarget / bottleSizeLitres);

  // Sodium estimate (500–1000 mg/L of sweat, midpoint 700)
  const sodiumPerLitre = 700;
  const totalSodium = Math.round(totalFluidLoss * sodiumPerLitre);

  // Hydration plan: ml per 15-min interval
  const intervalsPerHour = 3; // every 20 min
  const totalIntervals = Math.max(1, Math.round(totalHours * intervalsPerHour));
  const mlPerInterval = Math.round((replacementTarget * 1000) / totalIntervals);

  // Zone
  const zone = getHydrationZone(replacementTarget);

  // Bar width for visual — cap at 4L for scale
  const barPercent = Math.min((replacementTarget / 4) * 100, 100);

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              HYDRATION CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Duration, intensity, and conditions in. Fluid target, sodium, and a per-ride plan out.
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

              {/* Intensity */}
              <div className="mb-6">
                <label className="block font-heading text-sm text-off-white mb-2">INTENSITY</label>
                <div className="grid grid-cols-2 gap-2">
                  {INTENSITY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => { setIntensity(level.id); resetCalc(); }}
                      className={`rounded-lg px-3 py-3 text-sm font-body transition-all text-left ${
                        intensity === level.id
                          ? "bg-coral/20 border border-coral/50 text-off-white"
                          : "bg-white/5 border border-white/10 text-foreground-muted hover:border-white/20"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
                <p className="text-foreground-subtle text-xs mt-1.5">
                  Baseline sweat rate: ~{intensityPreset.sweatRate} L/hr at mild temperature
                </p>
              </div>

              {/* Temperature */}
              <div className="mb-6">
                <label className="block font-heading text-sm text-off-white mb-2">TEMPERATURE</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMP_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => { setTemp(level.id); resetCalc(); }}
                      className={`rounded-lg px-3 py-3 text-sm font-body transition-all text-left ${
                        temp === level.id
                          ? "bg-coral/20 border border-coral/50 text-off-white"
                          : "bg-white/5 border border-white/10 text-foreground-muted hover:border-white/20"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body weight (optional) */}
              <div className="mb-6">
                <label htmlFor="weight-input" className="block font-heading text-sm text-off-white mb-2">
                  BODY WEIGHT <span className="text-foreground-subtle font-body text-xs">(optional — for personalised estimate)</span>
                </label>
                <input
                  id="weight-input"
                  type="number"
                  inputMode="decimal"
                  min="40"
                  max="200"
                  placeholder="e.g. 75"
                  aria-label="Body weight in kilograms"
                  aria-invalid={!!weightError}
                  value={weight}
                  onChange={(e) => { setWeight(e.target.value); resetCalc(); }}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${weightError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                />
                {weightError && <p className="text-red-400 text-xs mt-1" role="alert">{weightError}</p>}
                <p className="text-foreground-subtle text-xs mt-1.5">kg — heavier riders lose more fluid per hour</p>
              </div>

              {/* Advanced: Custom sweat rate */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-coral text-xs font-body hover:text-coral/80 transition-colors"
                >
                  {showAdvanced ? "Hide advanced" : "Known your sweat rate? Advanced options"}
                </button>
                {showAdvanced && (
                  <div className="mt-3">
                    <label htmlFor="sweat-rate-input" className="block font-heading text-sm text-off-white mb-2">
                      KNOWN SWEAT RATE <span className="text-foreground-subtle font-body text-xs">(overrides intensity + temp estimate)</span>
                    </label>
                    <input
                      id="sweat-rate-input"
                      type="number"
                      inputMode="numeric"
                      min="100"
                      max="3000"
                      placeholder="e.g. 900"
                      aria-label="Known sweat rate in millilitres per hour"
                      aria-invalid={!!sweatRateError}
                      value={customSweatRate}
                      onChange={(e) => { setCustomSweatRate(e.target.value); resetCalc(); }}
                      onKeyDown={(e) => { if (e.key === "Enter" && canCalculate) setCalculated(true); }}
                      className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${sweatRateError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                    />
                    {sweatRateError && <p className="text-red-400 text-xs mt-1" role="alert">{sweatRateError}</p>}
                    <p className="text-foreground-subtle text-xs mt-1.5">
                      ml/hr — measured from a sweat test (weigh pre/post ride, subtract fluid consumed)
                    </p>
                  </div>
                )}
              </div>

              <Button onClick={() => canCalculate && setCalculated(true)} size="lg" className="w-full">
                Calculate Hydration Plan
              </Button>
            </div>

            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && replacementTarget > 0 && (
                  <motion.div
                    key={`${totalMinutes}-${intensity}-${temp}-${weight}-${customSweatRate}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Big fluid target */}
                    <div className="text-center mb-8">
                      <p className="font-heading text-6xl md:text-8xl text-coral mb-2">{replacementTarget.toFixed(1)}L</p>
                      <p className="font-heading text-xl text-off-white">FLUID TARGET</p>
                      <p className="text-foreground-muted mt-2" style={{ color: zone.color }}>
                        {zone.label} — {zone.desc}
                      </p>
                    </div>

                    {/* Key stats row */}
                    <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                      <div>
                        <p className="font-heading text-3xl text-off-white">{totalFluidLoss.toFixed(1)}L</p>
                        <p className="text-foreground-subtle text-sm">Est. sweat loss</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl text-off-white">{bottlesNeeded}</p>
                        <p className="text-foreground-subtle text-sm">{bottleSize}ml bottles</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl text-off-white">{totalSodium}</p>
                        <p className="text-foreground-subtle text-sm">mg sodium</p>
                      </div>
                    </div>

                    {/* Bottle size toggle */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                      <span className="text-foreground-subtle text-xs">Bottle size:</span>
                      <button
                        type="button"
                        onClick={() => { setBottleSize(500); }}
                        className={`rounded-md px-3 py-1 text-xs transition-all ${bottleSize === 500 ? "bg-coral/20 text-coral border border-coral/50" : "bg-white/5 text-foreground-muted border border-white/10"}`}
                      >
                        500ml
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBottleSize(750); }}
                        className={`rounded-md px-3 py-1 text-xs transition-all ${bottleSize === 750 ? "bg-coral/20 text-coral border border-coral/50" : "bg-white/5 text-foreground-muted border border-white/10"}`}
                      >
                        750ml
                      </button>
                    </div>

                    {/* Visual bar */}
                    <div className="mb-8">
                      <div className="relative h-6 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <motion.div
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{ backgroundColor: zone.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${barPercent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex justify-between text-foreground-subtle text-xs mt-1">
                        <span>0L</span>
                        <span>1L</span>
                        <span>2L</span>
                        <span>3L</span>
                        <span>4L+</span>
                      </div>
                    </div>

                    {/* Zone scale */}
                    <div className="space-y-2 mb-8">
                      {HYDRATION_ZONES.map((z) => {
                        const isActive = replacementTarget >= z.min && replacementTarget < z.max;
                        return (
                          <div
                            key={z.label}
                            className={`flex items-center gap-4 rounded-lg p-3 transition-all ${isActive ? "bg-white/[0.08] border border-white/15" : ""}`}
                          >
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                            <span className="text-off-white text-sm flex-1">{z.label}</span>
                            <span className="text-foreground-subtle text-xs">
                              {z.max < 100 ? `${z.min}–${z.max}L` : `${z.min}L+`}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Hydration plan */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">YOUR HYDRATION PLAN</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-foreground-muted">Every 20 minutes</span>
                          <span className="font-heading text-off-white">{mlPerInterval} ml</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-foreground-muted">Per hour</span>
                          <span className="font-heading text-off-white">{Math.round(replacementTarget / totalHours * 1000)} ml</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-foreground-muted">Total fluid target</span>
                          <span className="font-heading text-off-white">{(replacementTarget * 1000).toFixed(0)} ml</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-foreground-muted">Replacing</span>
                          <span className="font-heading text-off-white">75% of estimated loss</span>
                        </div>
                      </div>
                    </div>

                    {/* Electrolyte guidance */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">ELECTROLYTE GUIDANCE</h3>
                      <div className="text-sm text-foreground-muted space-y-2">
                        <p>
                          <strong className="text-off-white">Sodium target:</strong> ~{totalSodium} mg across the ride
                          ({sodiumPerLitre} mg/L of estimated sweat loss).
                        </p>
                        {totalHours >= 3 && (
                          <p className="text-yellow-400">
                            Rides over 3 hours need deliberate electrolyte replacement — plain water is not enough.
                            Use sodium-containing drink mix or supplement with salt tablets (200–400 mg sodium per tablet).
                          </p>
                        )}
                        {temp === "hot" || temp === "extreme" ? (
                          <p className="text-yellow-400">
                            Hot conditions significantly increase sodium losses. Consider a higher-sodium drink mix
                            (700–1000 mg/L) and start sipping 500 ml of electrolyte drink 2 hours before the ride.
                          </p>
                        ) : (
                          <p>
                            A standard electrolyte drink mix (300–500 mg sodium/L) covers most rides in these conditions.
                          </p>
                        )}
                        {replacementTarget >= 3 && (
                          <p className="text-yellow-400">
                            At this fluid volume, pre-ride loading matters. Drink 500 ml of sodium-containing fluid
                            90–120 minutes before you start. This is not about topping up — it primes your body to
                            retain the fluid you drink on the bike.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* What Next */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT?</h3>
                      <ul className="space-y-2">
                        <li><Link href="/tools/fuelling" className="text-coral hover:text-coral/80 text-sm transition-colors">In-Ride Fuelling Calculator — carbs and calories per hour</Link></li>
                        <li><Link href="/tools/calories" className="text-coral hover:text-coral/80 text-sm transition-colors">Calories Burned Calculator — total energy cost of the ride</Link></li>
                        <li><Link href="/tools/fuel-planner" className="text-coral hover:text-coral/80 text-sm transition-colors">Fuel Planner — full daily nutrition plan for training days</Link></li>
                        <li><Link href="/topics/cycling-nutrition" className="text-coral hover:text-coral/80 text-sm transition-colors">Cycling Nutrition topic hub</Link></li>
                      </ul>
                    </div>

                    {/* CTA box */}
                    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">HYDRATION IS ONLY ONE PIECE</p>
                      <p className="text-off-white font-heading text-lg mb-2">Fluid, fuel, pacing, and recovery work as a system.</p>
                      <p className="text-foreground-muted text-sm mb-4">
                        A coach builds the full race-day nutrition strategy — what to drink, what to eat, and when — so you arrive at the finish line with nothing left to give.
                      </p>
                      <a href="/apply" className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all" data-track="tool_hydration_apply">
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
                <strong className="text-off-white">Sweat rate range:</strong> Published sweat rates in exercising
                athletes run from 0.3 to 2.5 L/hr (Baker, 2017; Maughan &amp; Shirreffs, 2007). The
                variation is enormous — genetics, acclimatisation, fitness, body size, and clothing
                all contribute. The presets here represent population midpoints for each intensity band.
              </p>
              <p>
                <strong className="text-off-white">Why 75%, not 100%:</strong> Attempting to replace 100% of
                sweat loss during exercise frequently causes gastrointestinal distress. Current evidence
                (Noakes, 2012; ACSM position stand) recommends replacing 70–80% of losses, allowing
                mild dehydration (1–2% body mass) that does not impair performance in most conditions.
              </p>
              <p>
                <strong className="text-off-white">Sodium losses:</strong> Sweat sodium concentration varies
                from 200 to 2,000 mg/L between individuals (Baker et al., 2016). This calculator uses
                700 mg/L as a population midpoint. If you are a visibly salty sweater (white residue on
                kit), your true value likely sits above 1,000 mg/L and you should increase sodium
                supplementation accordingly.
              </p>
              <p>
                <strong className="text-off-white">Body weight scaling:</strong> Larger riders have more
                surface area and typically lose more fluid per hour. The weight adjustment here is
                conservative — a rough 0.5–1.5% body mass loss per hour in hot conditions is consistent
                with field data (Sawka et al., 2007).
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> Individual variation in sweat rate
                and composition is the single largest source of error. This calculator produces a
                reasonable starting point — not a prescription. The gold standard is a supervised sweat
                test: weigh yourself nude before and after a timed ride, subtract fluid consumed, and
                divide by duration. Do this in the conditions you race in. Once you know your number,
                use the advanced override to personalise the output.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 &middot; Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="hydration" />
      </main>
      <Footer />
    </>
  );
}
