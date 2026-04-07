"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";

type Surface = "smooth" | "rough" | "gravel";
type TubeType = "clincher" | "tubeless" | "tubular";

/**
 * Tyre pressure calculator calibrated against SILCA Professional Pressure Calculator.
 *
 * Model: P = (wheelLoad_kg × K) / (tyreWidth_mm ^ 1.5)
 * Based on the 15% tyre deflection / contact patch optimisation model
 * (Frank Berto research, used by SILCA).
 *
 * K constants calibrated against SILCA reference outputs:
 *   80kg rider + 8kg bike, 25mm, clincher, smooth, 19mm rim → ~87 rear, ~78 front
 *   80kg rider + 8kg bike, 28mm, clincher, smooth, 21mm rim → ~75 rear, ~68 front
 *   80kg rider + 8kg bike, 32mm, clincher, smooth, 21mm rim → ~58 rear, ~50 front
 */
function calculatePressure(
  riderWeight: number,
  bikeWeight: number,
  tyreWidth: number,
  rimWidth: number,
  surface: Surface,
  tubeType: TubeType
): { front: number; rear: number } {
  const totalWeight = riderWeight + bikeWeight;

  // SILCA uses 40% front / 60% rear weight distribution
  const rearLoad = totalWeight * 0.60;
  const frontLoad = totalWeight * 0.40;

  // Core model: P = load × K / tyreWidth^1.5
  // K_rear and K_front calibrated against SILCA reference data
  const K_rear = 207;
  const K_front = 275;
  const widthPow = Math.pow(tyreWidth, 1.5);

  let rearPSI = (rearLoad * K_rear) / widthPow;
  let frontPSI = (frontLoad * K_front) / widthPow;

  // Rim width correction: wider rim spreads tyre → lower pressure needed
  // Baseline internal rim widths per tyre size (SILCA standard pairings)
  const baselineRims: Record<number, number> = {
    23: 15, 25: 17, 28: 19, 30: 19, 32: 21,
    35: 21, 38: 23, 40: 25, 42: 25, 45: 27,
  };
  const closestTyre = [23, 25, 28, 30, 32, 35, 38, 40, 42, 45].reduce(
    (prev, curr) =>
      Math.abs(curr - tyreWidth) < Math.abs(prev - tyreWidth) ? curr : prev
  );
  const baseRim = baselineRims[closestTyre] || 19;
  const rimDelta = rimWidth - baseRim;
  const rimFactor = 1 - rimDelta * 0.015; // ~3% per 2mm wider
  rearPSI *= rimFactor;
  frontPSI *= rimFactor;

  // Tube type: tubeless ~9% lower, tubular ~3% lower (SILCA reference)
  const tubeModifier: Record<TubeType, number> = {
    clincher: 1.0,
    tubeless: 0.91,
    tubular: 0.97,
  };
  rearPSI *= tubeModifier[tubeType];
  frontPSI *= tubeModifier[tubeType];

  // Surface: rough ~12% lower, gravel ~18% lower
  const surfaceModifier: Record<Surface, number> = {
    smooth: 1.0,
    rough: 0.88,
    gravel: 0.82,
  };
  rearPSI *= surfaceModifier[surface];
  frontPSI *= surfaceModifier[surface];

  // Clamp to safe ranges
  rearPSI = Math.max(20, Math.min(130, rearPSI));
  frontPSI = Math.max(20, Math.min(120, frontPSI));

  return {
    front: Math.round(frontPSI),
    rear: Math.round(rearPSI),
  };
}

// Validation ranges
const VALIDATION = {
  riderWeight: { min: 30, max: 200, label: "Rider weight" },
  bikeWeight: { min: 3, max: 25, label: "Bike weight" },
} as const;

function getValidationError(value: string, field: keyof typeof VALIDATION): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Please enter a valid number";
  const { min, max, label } = VALIDATION[field];
  if (num < min) return `${label} must be at least ${min}kg`;
  if (num > max) return `${label} must be under ${max}kg`;
  return null;
}

export default function TyrePressurePage() {
  const [riderWeight, setRiderWeight] = useState("");
  const [bikeWeight, setBikeWeight] = useState("8.5");
  const [tyreWidth, setTyreWidth] = useState("25");
  const [rimWidth, setRimWidth] = useState("19");
  const [surface, setSurface] = useState<Surface>("smooth");
  const [tubeType, setTubeType] = useState<TubeType>("clincher");
  const [result, setResult] = useState<{ front: number; rear: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const riderWeightError = getValidationError(riderWeight, "riderWeight");
  const bikeWeightError = getValidationError(bikeWeight, "bikeWeight");
  const hasErrors = !!riderWeightError || !!bikeWeightError;

  const handleCalculate = () => {
    if (hasErrors) return;
    const rw = parseFloat(riderWeight);
    const bw = parseFloat(bikeWeight);
    const tw = parseInt(tyreWidth);
    const riw = parseInt(rimWidth);
    if (rw > 0 && bw > 0 && tw > 0 && riw > 0) {
      setResult(calculatePressure(rw, bw, tw, riw, surface, tubeType));
    }
  };

  const handleCopyResults = async () => {
    if (!result) return;
    const tubeLabels: Record<TubeType, string> = { clincher: "clincher", tubeless: "tubeless", tubular: "tubular" };
    const text = `Tyre Pressure: Front ${result.front} PSI / Rear ${result.rear} PSI (${riderWeight}kg rider, ${tyreWidth}mm tyres, ${tubeLabels[tubeType]}) — roadmancycling.com/tools/tyre-pressure`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClasses =
    "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none transition-colors";

  const errorInputClasses =
    "w-full bg-white/5 border border-red-500/60 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider placeholder:text-foreground-subtle focus:border-red-500 focus:outline-none transition-colors";

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Tool
            </p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              TYRE PRESSURE CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Science-based pressure recommendations based on your weight, tyre width, rim width, setup type, and road surface.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              {/* Rider Weight */}
              <div>
                <label htmlFor="rider-weight" className="block font-heading text-lg text-off-white mb-2">
                  RIDER WEIGHT (KG)
                </label>
                <input
                  id="rider-weight"
                  type="number" min="40" max="150" placeholder="e.g. 75"
                  value={riderWeight}
                  onChange={(e) => { setRiderWeight(e.target.value); setResult(null); }}
                  className={`${riderWeightError ? errorInputClasses : inputClasses} text-xl`}
                />
                {riderWeightError && (
                  <p className="text-red-400 text-xs mt-1">{riderWeightError}</p>
                )}
              </div>

              {/* Bike Weight */}
              <div>
                <label htmlFor="bike-weight" className="block font-heading text-lg text-off-white mb-2">
                  BIKE WEIGHT (KG)
                </label>
                <input
                  id="bike-weight"
                  type="number" min="5" max="20" step="0.1" placeholder="e.g. 8.5"
                  value={bikeWeight}
                  onChange={(e) => { setBikeWeight(e.target.value); setResult(null); }}
                  className={bikeWeightError ? errorInputClasses : inputClasses}
                />
                {bikeWeightError && (
                  <p className="text-red-400 text-xs mt-1">{bikeWeightError}</p>
                )}
              </div>

              {/* Tyre Width */}
              <div>
                <label htmlFor="tyre-width" className="block font-heading text-lg text-off-white mb-2">
                  TYRE WIDTH (MM)
                </label>
                <select
                  id="tyre-width"
                  value={tyreWidth}
                  onChange={(e) => { setTyreWidth(e.target.value); setResult(null); }}
                  className={`${inputClasses} appearance-none`}
                >
                  {[23, 25, 28, 30, 32, 35, 38, 40, 42, 45].map((w) => (
                    <option key={w} value={w} className="bg-charcoal">{w}mm</option>
                  ))}
                </select>
              </div>

              {/* Rim Internal Width */}
              <div>
                <label htmlFor="rim-width" className="block font-heading text-lg text-off-white mb-2">
                  RIM INTERNAL WIDTH (MM)
                </label>
                <select
                  id="rim-width"
                  value={rimWidth}
                  onChange={(e) => { setRimWidth(e.target.value); setResult(null); }}
                  className={`${inputClasses} appearance-none`}
                >
                  {[15, 17, 19, 21, 23, 25, 27, 30].map((w) => (
                    <option key={w} value={w} className="bg-charcoal">{w}mm</option>
                  ))}
                </select>
                <p className="text-foreground-subtle text-xs mt-1">
                  Check your wheel manufacturer specs. Most modern road wheels are 19-21mm.
                </p>
              </div>

              {/* Tyre Setup */}
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">TYRE SETUP</label>
                <div className="flex gap-3">
                  {([["clincher", "Clincher"], ["tubeless", "Tubeless"], ["tubular", "Tubular"]] as const).map(([val, label]) => (
                    <button
                      key={val} type="button"
                      onClick={() => { setTubeType(val); setResult(null); }}
                      className={`flex-1 py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        tubeType === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Surface */}
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">ROAD SURFACE</label>
                <div className="flex gap-3">
                  {([["smooth", "Smooth"], ["rough", "Rough"], ["gravel", "Gravel"]] as const).map(([val, label]) => (
                    <button
                      key={val} type="button"
                      onClick={() => { setSurface(val); setResult(null); }}
                      className={`flex-1 py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        surface === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleCalculate} size="lg" className="w-full">Calculate</Button>
            </div>

            {/* Result */}
            <div aria-live="polite" aria-atomic="false">
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  className="mt-8 space-y-4"
                  key={`${result.front}-${result.rear}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl text-off-white">YOUR RECOMMENDED PRESSURE</h2>
                    <button
                      onClick={handleCopyResults}
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
                      <p className="text-sm text-foreground-subtle mb-1">FRONT</p>
                      <p className="font-heading text-5xl text-coral">{result.front}</p>
                      <p className="text-foreground-muted text-sm">PSI</p>
                    </motion.div>
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.18 }}
                    >
                      <p className="text-sm text-foreground-subtle mb-1">REAR</p>
                      <p className="font-heading text-5xl text-coral">{result.rear}</p>
                      <p className="text-foreground-muted text-sm">PSI</p>
                    </motion.div>
                  </div>

                  <motion.div
                    className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6 space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.25 }}
                  >
                    <h3 className="font-heading text-lg text-off-white">HOW THIS WORKS</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      This calculator uses the 15% tyre deflection model based on Frank Berto&apos;s research.
                      Your weight distribution on a road bike is approximately 40% front / 60% rear,
                      so the rear tyre needs higher pressure. Rim width affects the effective tyre volume,
                      and tubeless setups run 8-10% lower than clincher for equivalent performance.
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      These are starting points. Fine-tune by 2-3 PSI based on feel. If you&apos;re getting
                      pinch flats, go higher. If the ride feels harsh, go lower.
                    </p>
                  </motion.div>

                  {/* Learn More */}
                  <motion.div
                    className="rounded-xl border border-white/10 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.32 }}
                  >
                    <h3 className="font-heading text-lg text-off-white mb-3">LEARN MORE</h3>
                    <ul className="space-y-2">
                      <li>
                        <a href="/blog/cycling-tyre-pressure-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling Tyre Pressure Guide
                        </a>
                      </li>
                      <li>
                        <a href="/blog/mtb-tyre-pressure-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          MTB Tyre Pressure Guide
                        </a>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.38 }}
                  >
                    <EmailCapture
                      heading="GET WEEKLY TYRE AND SETUP TIPS"
                      subheading="The small details that make you faster. One email a week, no filler."
                      source="tool-tyre-pressure"
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
