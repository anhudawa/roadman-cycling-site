"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ReportRequestForm } from "@/components/features/tools/ReportRequestForm";

type Surface = "smooth" | "rough" | "gravel";
type TubeType = "clincher" | "tubeless" | "tubular";

/**
 * Tyre pressure calculator based on Frank Berto's 15% tyre deflection research
 * and calibrated against SILCA Professional Pressure Calculator outputs.
 *
 * Model overview:
 *   1. Look up base rear pressure from a table interpolated by tyre width
 *      (table values calibrated for an 83.5kg system weight — 75kg + 8.5kg)
 *   2. Scale linearly by actual total weight vs reference weight
 *   3. Derive front pressure as ~93% of rear (matching the ~5-7% front/rear
 *      split seen in SILCA and Berto's 45/55 weight distribution research)
 *   4. Adjust for rim width, tube type, and surface condition
 *
 * Calibration targets (75kg rider + 8.5kg bike, clincher, smooth, standard rim):
 *   25mm → front ~85, rear ~90
 *   28mm → front ~70, rear ~75
 *   32mm → front ~55, rear ~60
 *   40mm → front ~35, rear ~38
 *   45mm → front ~28, rear ~31
 */

// Reference REAR pressures (PSI) at 83.5kg system weight (75kg rider + 8.5kg bike).
// Derived from SILCA calculator outputs, Berto deflection charts, and BRR test data.
const BASE_REAR_PRESSURE_TABLE: [number, number][] = [
  // [tyreWidth_mm, rearPSI_at_83.5kg_system]
  [23, 105],
  [25, 90],
  [28, 75],
  [30, 67],
  [32, 60],
  [35, 50],
  [38, 43],
  [40, 38],
  [42, 35],
  [45, 31],
  [50, 26],
  [55, 22],
  [60, 19],
];

/** Linear interpolation between lookup table entries */
function interpolateBasePressure(tyreWidth: number): number {
  const table = BASE_REAR_PRESSURE_TABLE;
  if (tyreWidth <= table[0][0]) return table[0][1];
  if (tyreWidth >= table[table.length - 1][0]) return table[table.length - 1][1];
  for (let i = 0; i < table.length - 1; i++) {
    const [w0, p0] = table[i];
    const [w1, p1] = table[i + 1];
    if (tyreWidth >= w0 && tyreWidth <= w1) {
      const t = (tyreWidth - w0) / (w1 - w0);
      return p0 + t * (p1 - p0);
    }
  }
  return table[0][1];
}

function calculatePressure(
  riderWeight: number,
  bikeWeight: number,
  tyreWidth: number,
  rimWidth: number,
  surface: Surface,
  tubeType: TubeType
): { front: number; rear: number } {
  const totalWeight = riderWeight + bikeWeight;
  const refWeight = 83.5; // reference system weight the table is calibrated for

  // Look up base rear pressure and scale linearly by weight.
  // Pressure is proportional to load at constant deflection (Berto).
  const baseRearPSI = interpolateBasePressure(tyreWidth);
  let rearPSI = baseRearPSI * (totalWeight / refWeight);

  // Front tyre runs ~7% lower than rear.
  // This corresponds to ~45/55 weight distribution (Berto) and matches
  // the 5-10 PSI front/rear gap seen in SILCA outputs across all widths.
  let frontPSI = rearPSI * 0.93;

  // Rim width correction: wider rims spread the tyre casing, increasing
  // effective air volume → lower pressure needed for the same deflection.
  // Baseline internal rim widths per tyre size (modern standard pairings).
  const baselineRims: Record<number, number> = {
    23: 15, 25: 17, 28: 19, 30: 19, 32: 21,
    35: 21, 38: 23, 40: 25, 42: 25, 45: 27,
    50: 29, 55: 30, 60: 30,
  };
  const tyreSizes = [23, 25, 28, 30, 32, 35, 38, 40, 42, 45, 50, 55, 60];
  const closestTyre = tyreSizes.reduce(
    (prev, curr) =>
      Math.abs(curr - tyreWidth) < Math.abs(prev - tyreWidth) ? curr : prev
  );
  const baseRim = baselineRims[closestTyre] || 19;
  const rimDelta = rimWidth - baseRim;
  // ~1.5% pressure reduction per mm of extra rim width (SILCA methodology)
  const rimFactor = 1 - rimDelta * 0.015;
  rearPSI *= rimFactor;
  frontPSI *= rimFactor;

  // Tube type adjustment (SILCA / BRR data):
  //   Tubeless: 8-10% lower — eliminates pinch-flat risk so lower pressure
  //   is safe, and reduces hysteresis from inner tube friction.
  //   Tubular: ~3% lower — supple casing, lower hysteresis.
  const tubeModifier: Record<TubeType, number> = {
    clincher: 1.0,
    tubeless: 0.91,
    tubular: 0.97,
  };
  rearPSI *= tubeModifier[tubeType];
  frontPSI *= tubeModifier[tubeType];

  // Surface condition (SILCA K-factor approach simplified):
  //   Rough roads: ~10% lower — tyre needs to absorb vibration, lower
  //   pressure reduces impedance losses from surface roughness.
  //   Gravel: ~20% lower — maximise contact patch and comfort,
  //   prevent bouncing over loose surfaces.
  const surfaceModifier: Record<Surface, number> = {
    smooth: 1.0,
    rough: 0.90,
    gravel: 0.80,
  };
  rearPSI *= surfaceModifier[surface];
  frontPSI *= surfaceModifier[surface];

  // Clamp to safe ranges
  rearPSI = Math.max(18, Math.min(130, rearPSI));
  frontPSI = Math.max(18, Math.min(120, frontPSI));

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
                  <p className="text-red-400 text-xs mt-1" role="alert">{riderWeightError}</p>
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
                  <p className="text-red-400 text-xs mt-1" role="alert">{bikeWeightError}</p>
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
                  {[23, 25, 28, 30, 32, 35, 38, 40, 42, 45, 50, 55, 60].map((w) => (
                    <option key={w} value={w} className="bg-charcoal">{w}mm{w >= 38 && w <= 45 ? " (gravel)" : w > 45 ? " (MTB)" : ""}</option>
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
                  {[15, 17, 19, 21, 23, 25, 27, 30, 35].map((w) => (
                    <option key={w} value={w} className="bg-charcoal">{w}mm</option>
                  ))}
                </select>
                <p className="text-foreground-subtle text-xs mt-1">
                  Check your wheel manufacturer specs. Most modern road wheels are 19-21mm.
                </p>
              </div>

              {/* Tyre Setup */}
              <div>
                <label id="tyre-setup-label" className="block font-heading text-lg text-off-white mb-2">TYRE SETUP</label>
                <div className="flex gap-3" role="group" aria-labelledby="tyre-setup-label">
                  {([["clincher", "Clincher"], ["tubeless", "Tubeless"], ["tubular", "Tubular"]] as const).map(([val, label]) => (
                    <button
                      key={val} type="button"
                      onClick={() => { setTubeType(val); setResult(null); }}
                      aria-pressed={tubeType === val}
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
                <label id="road-surface-label" className="block font-heading text-lg text-off-white mb-2">ROAD SURFACE</label>
                <div className="flex gap-3" role="group" aria-labelledby="road-surface-label">
                  {([["smooth", "Smooth"], ["rough", "Rough"], ["gravel", "Gravel"]] as const).map(([val, label]) => (
                    <button
                      key={val} type="button"
                      onClick={() => { setSurface(val); setResult(null); }}
                      aria-pressed={surface === val}
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
                      This calculator uses Frank Berto&apos;s 15% tyre deflection model, calibrated against
                      SILCA&apos;s professional pressure calculator and Bicycle Rolling Resistance test data.
                      Weight distribution on a road bike is roughly 45% front / 55% rear, so the rear
                      tyre always needs slightly higher pressure. Wider rims spread the tyre casing,
                      increasing air volume and reducing the pressure needed for the same support.
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      Tubeless setups run 8-10% lower than clincher because there&apos;s no inner tube to
                      pinch flat and less hysteresis in the casing. Rough roads and gravel benefit from
                      lower pressure to reduce vibration losses and improve grip.
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      These are starting points. Fine-tune by 2-3 PSI based on feel. If you&apos;re getting
                      pinch flats, go higher. If the ride feels harsh or you&apos;re losing grip in corners,
                      go lower.
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
                    <ReportRequestForm
                      tool="tyre-pressure"
                      inputs={{
                        riderWeight: parseFloat(riderWeight),
                        bikeWeight: parseFloat(bikeWeight),
                        tyreWidth: parseFloat(tyreWidth),
                        rimWidth: parseFloat(rimWidth),
                        surface,
                        tubeType,
                        front: result.front,
                        rear: result.rear,
                      }}
                      heading={`Your ${tyreWidth}mm tyre setup for every condition`}
                      subheading="A setup table covering dry, wet, gravel, and winter — plus how to tune by feel on real rides. One email, save it in the bookmarks."
                      bullets={[
                        `Front ${result.front} / rear ${result.rear} psi baseline`,
                        "Adjustments for wet, gravel, and winter conditions",
                        "Tubeless vs clincher pressure deltas",
                        "How to fine-tune by feel on real rides",
                        "Temperature + altitude corrections",
                      ]}
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
