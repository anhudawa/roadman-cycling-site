"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

/* ------------------------------------------------------------------ */
/*  Benchmarks & reference data                                        */
/* ------------------------------------------------------------------ */

const VAM_TIERS = [
  { min: 0, max: 600, label: "Recreational", desc: "Easy pace — enjoying the view", color: "#94A3B8" },
  { min: 600, max: 800, label: "Club cyclist", desc: "Steady amateur climbing", color: "#22C55E" },
  { min: 800, max: 1000, label: "Trained amateur", desc: "Regular structured training showing", color: "#3B82F6" },
  { min: 1000, max: 1200, label: "Strong amateur", desc: "Cat 3-4 race pace on climbs", color: "#8B5CF6" },
  { min: 1200, max: 1400, label: "Very strong", desc: "Cat 1-2 — competitive on HC cols", color: "#EAB308" },
  { min: 1400, max: 1600, label: "Elite", desc: "Domestic professional territory", color: "#F97316" },
  { min: 1600, max: 1800, label: "World Tour", desc: "Grand Tour peloton climbing pace", color: "#EF4444" },
  { min: 1800, max: 9999, label: "Grand Tour attack", desc: "Winning move on an HC summit finish", color: "#DC2626" },
];

interface ClimbPreset {
  name: string;
  elevation: number;
  gradient: number;
  note: string;
}

const CLIMB_PRESETS: ClimbPreset[] = [
  { name: "Alpe d’Huez", elevation: 1071, gradient: 8.1, note: "21 bends, Tour de France icon" },
  { name: "Mont Ventoux (Bédoin)", elevation: 1617, gradient: 7.5, note: "The Beast of Provence" },
  { name: "Stelvio (Prato)", elevation: 1808, gradient: 7.4, note: "48 hairpins, Giro classic" },
  { name: "Col du Galibier", elevation: 1245, gradient: 6.9, note: "Highest paved pass in the Alps" },
  { name: "Sa Calobra (Mallorca)", elevation: 682, gradient: 7.1, note: "Camp-season benchmark in Mallorca" },
  { name: "Angliru", elevation: 1266, gradient: 9.8, note: "Vuelta’s steepest summit finish" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getVamTier(vam: number) {
  return VAM_TIERS.find((t) => vam >= t.min && vam < t.max) || VAM_TIERS[VAM_TIERS.length - 1];
}

/**
 * Estimate climbing W/kg from VAM.
 * On gradients > ~5 %, gravity dominates and aero is negligible.
 * W/kg_system ≈ VAM / 367  (derived from P = m·g·v_vertical, g = 9.81).
 * We then adjust for bike weight to give rider W/kg.
 */
function estimateWkg(vam: number, riderKg: number, bikeKg: number): number {
  const systemWkg = vam / 367;
  const totalKg = riderKg + bikeKg;
  return (systemWkg * totalKg) / riderKg;
}

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.floor(totalMinutes % 60);
  const s = Math.round((totalMinutes % 1) * 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function VamPage() {
  const [elevation, setElevation] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [timeSeconds, setTimeSeconds] = useState("");
  const [timeHours, setTimeHours] = useState("");
  const [gradient, setGradient] = useState("");
  const [weight, setWeight] = useState("");
  const [bikeWeight, setBikeWeight] = useState("8.5");
  const [useLb, setUseLb] = useState(false);
  const [calculated, setCalculated] = useState(false);

  /* Parse inputs */
  const elevationVal = parseFloat(elevation) || 0;
  const hVal = parseInt(timeHours) || 0;
  const mVal = parseInt(timeMinutes) || 0;
  const sVal = parseInt(timeSeconds) || 0;
  const totalMinutes = hVal * 60 + mVal + sVal / 60;
  const totalHours = totalMinutes / 60;
  const gradientVal = parseFloat(gradient) || 0;
  const rawWeight = parseFloat(weight) || 0;
  const riderKg = useLb ? rawWeight * 0.4536 : rawWeight;
  const bikeKg = parseFloat(bikeWeight) || 8.5;

  /* VAM */
  const vam = totalHours > 0 ? elevationVal / totalHours : 0;
  const tier = getVamTier(vam);

  /* W/kg estimate (only meaningful above ~5 % gradient) */
  const showWkg = riderKg > 30 && gradientVal >= 4;
  const wkg = showWkg ? estimateWkg(vam, riderKg, bikeKg) : 0;

  /* Implied road distance from elevation and gradient */
  const impliedDistanceKm = gradientVal > 0 ? (elevationVal / (gradientVal / 100)) / 1000 : 0;
  const avgSpeedKmh = totalHours > 0 && impliedDistanceKm > 0 ? impliedDistanceKm / totalHours : 0;

  /* Validation */
  const elevError = elevation && (elevationVal <= 0 || elevationVal > 6000) ? "Enter a climb between 1 m and 6,000 m" : null;
  const timeError = (timeMinutes || timeHours || timeSeconds) && totalMinutes < 1 ? "Time must be at least 1 minute" : null;
  const gradError = gradient && (gradientVal < 0 || gradientVal > 30) ? "Gradient must be 0-30 %" : null;
  const weightError = weight && (rawWeight < 30 || rawWeight > 400) ? `Weight must be 30-${useLb ? "400 lb" : "180 kg"}` : null;

  const canCalculate = elevationVal > 0 && totalMinutes >= 1 && !elevError && !timeError;

  const resetCalc = () => setCalculated(false);

  /* Bar width — cap at 2000 VAM for scale */
  const barPercent = Math.min((vam / 2000) * 100, 100);

  /* Apply preset */
  function applyPreset(p: ClimbPreset) {
    setElevation(String(p.elevation));
    setGradient(String(p.gradient));
    setTimeHours("");
    setTimeMinutes("");
    setTimeSeconds("");
    setCalculated(false);
  }

  return (
    <>
      <Header />
      <main id="main-content">
        {/* ---- Hero ---- */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              CLIMBING CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Elevation and time in. VAM, climbing W/kg, and benchmark tier out.
            </p>
          </Container>
        </Section>

        {/* ---- Calculator ---- */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
              {/* Preset climbs */}
              <div className="mb-6">
                <p className="font-heading text-sm text-off-white mb-3">FAMOUS CLIMBS</p>
                <div className="flex flex-wrap gap-2">
                  {CLIMB_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="text-xs font-body bg-white/5 hover:bg-coral/20 border border-white/10 hover:border-coral/40 rounded-full px-3 py-1.5 text-foreground-muted hover:text-coral transition-all"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Elevation gain */}
              <div className="mb-6">
                <label htmlFor="elev-input" className="block font-heading text-sm text-off-white mb-2">ELEVATION GAIN (METRES)</label>
                <input
                  id="elev-input"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="6000"
                  placeholder="e.g. 1071"
                  aria-label="Elevation gain in metres"
                  value={elevation}
                  onChange={(e) => { setElevation(e.target.value); resetCalc(); }}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${elevError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                />
                {elevError && <p className="text-red-400 text-xs mt-1" role="alert">{elevError}</p>}
              </div>

              {/* Time */}
              <div className="mb-6">
                <label className="block font-heading text-sm text-off-white mb-2">CLIMBING TIME</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="24"
                      placeholder="0"
                      aria-label="Hours"
                      value={timeHours}
                      onChange={(e) => { setTimeHours(e.target.value); resetCalc(); }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none focus:border-coral transition-colors"
                    />
                    <span className="text-foreground-subtle text-xs mt-1 block">hours</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="59"
                      placeholder="45"
                      aria-label="Minutes"
                      value={timeMinutes}
                      onChange={(e) => { setTimeMinutes(e.target.value); resetCalc(); }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none focus:border-coral transition-colors"
                    />
                    <span className="text-foreground-subtle text-xs mt-1 block">minutes</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="59"
                      placeholder="0"
                      aria-label="Seconds"
                      value={timeSeconds}
                      onChange={(e) => { setTimeSeconds(e.target.value); resetCalc(); }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none focus:border-coral transition-colors"
                    />
                    <span className="text-foreground-subtle text-xs mt-1 block">seconds</span>
                  </div>
                </div>
                {timeError && <p className="text-red-400 text-xs mt-1" role="alert">{timeError}</p>}
              </div>

              {/* Gradient */}
              <div className="mb-6">
                <label htmlFor="grad-input" className="block font-heading text-sm text-off-white mb-2">
                  AVERAGE GRADIENT (%) <span className="text-foreground-subtle font-body text-xs font-normal">— optional, for W/kg estimate</span>
                </label>
                <input
                  id="grad-input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="30"
                  step="0.1"
                  placeholder="e.g. 8.1"
                  aria-label="Average gradient in percent"
                  value={gradient}
                  onChange={(e) => { setGradient(e.target.value); resetCalc(); }}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${gradError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                />
                {gradError && <p className="text-red-400 text-xs mt-1" role="alert">{gradError}</p>}
              </div>

              {/* Weight (optional) */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="weight-input" className="font-heading text-sm text-off-white">
                    RIDER WEIGHT ({useLb ? "LB" : "KG"}) <span className="text-foreground-subtle font-body text-xs font-normal">— optional</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setUseLb(!useLb); resetCalc(); }}
                    className="text-coral text-xs font-body hover:text-coral/80 transition-colors"
                  >
                    {useLb ? "KG" : "LB"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    id="weight-input"
                    type="number"
                    inputMode="decimal"
                    placeholder={useLb ? "e.g. 165" : "e.g. 75"}
                    aria-label={`Rider weight in ${useLb ? "pounds" : "kilograms"}`}
                    value={weight}
                    onChange={(e) => { setWeight(e.target.value); resetCalc(); }}
                    className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${weightError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                  />
                  <div>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="8.5"
                      aria-label="Bike weight in kilograms"
                      value={bikeWeight}
                      onChange={(e) => { setBikeWeight(e.target.value); resetCalc(); }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none focus:border-coral transition-colors"
                    />
                    <span className="text-foreground-subtle text-xs mt-1 block">bike + kit (kg)</span>
                  </div>
                </div>
                {weightError && <p className="text-red-400 text-xs mt-1" role="alert">{weightError}</p>}
              </div>

              <Button onClick={() => canCalculate && setCalculated(true)} size="lg" className="w-full">
                Calculate VAM
              </Button>
            </div>

            {/* ---- Results ---- */}
            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && vam > 0 && (
                  <motion.div
                    key={`${elevationVal}-${totalMinutes}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Big VAM number */}
                    <div className="text-center mb-8">
                      <p className="font-heading text-6xl md:text-8xl text-coral mb-2">{Math.round(vam)}</p>
                      <p className="font-heading text-xl text-off-white">METRES PER HOUR (VAM)</p>
                      <p className="mt-2" style={{ color: tier.color }}>
                        {tier.label} — {tier.desc}
                      </p>
                    </div>

                    {/* Secondary metrics */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-center">
                      <div>
                        <p className="font-heading text-3xl text-off-white">{elevationVal.toLocaleString()} m</p>
                        <p className="text-foreground-subtle text-sm">Elevation gain</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl text-off-white">{formatTime(totalMinutes)}</p>
                        <p className="text-foreground-subtle text-sm">Climbing time</p>
                      </div>
                      {showWkg && (
                        <div>
                          <p className="font-heading text-3xl text-off-white">{wkg.toFixed(2)}</p>
                          <p className="text-foreground-subtle text-sm">Estimated W/kg</p>
                        </div>
                      )}
                      {avgSpeedKmh > 0 && (
                        <div>
                          <p className="font-heading text-3xl text-off-white">{avgSpeedKmh.toFixed(1)}</p>
                          <p className="text-foreground-subtle text-sm">Avg speed (km/h)</p>
                        </div>
                      )}
                    </div>

                    {/* Visual bar */}
                    <div className="mb-8">
                      <div className="relative h-6 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <motion.div
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{ backgroundColor: tier.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${barPercent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex justify-between text-foreground-subtle text-xs mt-1">
                        <span>0</span>
                        <span>500</span>
                        <span>1000</span>
                        <span>1500</span>
                        <span>2000+</span>
                      </div>
                    </div>

                    {/* Tier scale */}
                    <div className="space-y-2 mb-8">
                      {VAM_TIERS.map((t) => {
                        const isActive = vam >= t.min && vam < t.max;
                        return (
                          <div
                            key={t.label}
                            className={`flex items-center gap-4 rounded-lg p-3 transition-all ${isActive ? "bg-white/[0.08] border border-white/15" : ""}`}
                          >
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                            <span className="text-off-white text-sm flex-1">{t.label}</span>
                            <span className="text-foreground-subtle text-xs">
                              {t.max < 9999 ? `${t.min}–${t.max}` : `${t.min}+`} m/hr
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Famous climb comparison */}
                    {vam > 0 && (
                      <div className="rounded-xl border border-white/10 p-6 mb-8">
                        <h3 className="font-heading text-lg text-off-white mb-4">YOUR VAM ON FAMOUS CLIMBS</h3>
                        <p className="text-foreground-subtle text-sm mb-4">
                          At {Math.round(vam)} m/hr, here&apos;s how long each climb would take you:
                        </p>
                        <div className="space-y-3">
                          {CLIMB_PRESETS.map((c) => {
                            const estMinutes = (c.elevation / vam) * 60;
                            return (
                              <div key={c.name} className="flex items-center justify-between">
                                <div>
                                  <span className="text-off-white text-sm">{c.name}</span>
                                  <span className="text-foreground-subtle text-xs ml-2">({c.elevation} m, {c.gradient}%)</span>
                                </div>
                                <span className="font-heading text-coral text-sm">{formatTime(estMinutes)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* W/kg note when gradient too shallow */}
                    {riderKg > 30 && gradientVal > 0 && gradientVal < 4 && (
                      <div className="rounded-lg bg-white/5 border border-white/10 p-4 mb-8">
                        <p className="text-foreground-muted text-sm">
                          <strong className="text-off-white">W/kg estimate not shown.</strong> On gradients below 4 %, aerodynamic drag plays a much larger role than gravity,
                          so the VAM-to-W/kg approximation loses accuracy. Use the{" "}
                          <Link href="/tools/power-speed" className="text-coral hover:text-coral/80">Power&harr;Speed Calculator</Link>{" "}
                          for shallow gradients instead.
                        </p>
                      </div>
                    )}

                    {/* What Next */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT?</h3>
                      <ul className="space-y-2">
                        <li><Link href="/tools/power-speed" className="text-coral hover:text-coral/80 text-sm transition-colors">Power&harr;Speed Calculator — model a climb from watts</Link></li>
                        <li><Link href="/tools/wkg" className="text-coral hover:text-coral/80 text-sm transition-colors">W/kg Calculator — benchmark your power-to-weight</Link></li>
                        <li><Link href="/tools/race-predictor" className="text-coral hover:text-coral/80 text-sm transition-colors">Race Time Predictor — estimate your finish time</Link></li>
                        <li><Link href="/topics/ftp-training" className="text-coral hover:text-coral/80 text-sm transition-colors">FTP Training topic hub</Link></li>
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">WANT TO CLIMB FASTER?</p>
                      <p className="text-off-white font-heading text-lg mb-2">VAM tells you where you are. A coach gets you higher.</p>
                      <p className="text-foreground-muted text-sm mb-4">
                        Structured intensity, targeted weight management, and pacing strategy
                        that moves the number — not just measures it.
                      </p>
                      <a href="/apply" className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all" data-track="tool_vam_apply">
                        Apply for Coaching
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* ---- Methodology ---- */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              METHODOLOGY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">Formula:</strong> VAM = elevation gain (m) / time (hours).
                The Italian acronym stands for <em>Velocit&agrave; Ascensionale Media</em> — average ascent speed.
                It was popularised by Dr. Michele Ferrari in the 1990s as a way to compare climbing performances
                across different cols without needing power-meter data.
              </p>
              <p>
                <strong className="text-off-white">W/kg estimate:</strong> On climbs steeper than about 5 %, gravity
                is the dominant resistance. The simplified physics: Power = mass &times; g &times; vertical velocity.
                Rearranging gives W/kg<sub>system</sub> &asymp; VAM / 367 (where 367 = 3600 / 9.81). We then adjust
                for bike weight to give rider W/kg. Below 4-5 % gradient, aero drag and rolling resistance become
                significant and this estimate loses accuracy.
              </p>
              <p>
                <strong className="text-off-white">Pro benchmarks:</strong> Grand Tour climbers sustain
                1,600-1,800 m/hr on HC summit finishes. The fastest individual efforts (breakaway riders on
                Alpe d&apos;Huez, for example) have exceeded 1,800 m/hr. For context, a well-trained amateur on a
                45-minute col typically sits between 900 and 1,200 m/hr.
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> VAM compares apples to apples only on
                similar gradients. A 5 % climb produces lower VAM than a 10 % climb at the same W/kg because
                more of your power goes into overcoming air resistance on the shallower gradient. Altitude, heat,
                drafting, and road surface all affect the number too.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 &middot; Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="vam" />
      </main>
      <Footer />
    </>
  );
}
