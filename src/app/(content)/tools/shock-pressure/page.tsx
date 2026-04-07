"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";

type RidingStyle = "xc" | "trail" | "enduro" | "dh";
type TubeType = "tubeless" | "tubed";

/* ------------------------------------------------------------------ */
/*  SUSPENSION CALCULATOR                                              */
/*  Rear shock: Fox standard — PSI ≈ rider weight in lbs (kg × 2.205) */
/*  Fork: calibrated against Fox 36/34/38/40 published setup charts    */
/* ------------------------------------------------------------------ */

function calculateShockPressure(
  riderWeightKg: number,
  ridingStyle: RidingStyle
): {
  rearPSI: number;
  frontPSI: number;
  sagTarget: string;
  description: string;
} {
  // Rear shock: Fox standard is PSI = body weight in lbs = kg × 2.205
  // XC runs ~10% firmer, enduro ~5% softer, DH ~10% softer
  // Fork: calibrated against Fox 36 (trail baseline): PSI ≈ kg × 1.04 - 9
  // XC (Fox 32/34): +8%, Enduro (Fox 38): -7%, DH (Fox 40): -12%
  const styleConfig: Record<
    RidingStyle,
    { sagPercent: [number, number]; rearMult: number; forkMult: number; forkOffset: number }
  > = {
    xc:    { sagPercent: [20, 25], rearMult: 2.43,  forkMult: 1.12,  forkOffset: -9 },
    trail: { sagPercent: [25, 30], rearMult: 2.205, forkMult: 1.04,  forkOffset: -9 },
    enduro:{ sagPercent: [28, 33], rearMult: 2.09,  forkMult: 0.967, forkOffset: -9 },
    dh:    { sagPercent: [30, 35], rearMult: 1.98,  forkMult: 0.915, forkOffset: -9 },
  };

  const config = styleConfig[ridingStyle];
  const rearPSI = Math.round(riderWeightKg * config.rearMult);
  const frontPSI = Math.round(riderWeightKg * config.forkMult + config.forkOffset);

  const descriptions: Record<RidingStyle, string> = {
    xc: "Cross-country: firmer setup for efficiency on climbs. Less sag = more pedalling platform. Use lockout on smooth climbs.",
    trail: "Trail riding: balanced setup for climbing and descending. The all-rounder. Adjust rebound to match trail conditions.",
    enduro: "Enduro: softer setup to absorb big hits on descents. Slightly more sag for better small-bump sensitivity and grip.",
    dh: "Downhill: maximum plushness for high-speed impacts. Run more sag and slower rebound. Climbing efficiency doesn't matter here.",
  };

  return {
    rearPSI,
    frontPSI,
    sagTarget: `${config.sagPercent[0]}–${config.sagPercent[1]}%`,
    description: descriptions[ridingStyle],
  };
}

/* ------------------------------------------------------------------ */
/*  MTB TYRE PRESSURE CALCULATOR                                       */
/*  Lookup table with linear interpolation — calibrated against        */
/*  Bike Faff, CushCore, and Enve published reference charts.          */
/*  Reference conditions: 2.4" tyres, tubeless, 14kg bike.            */
/* ------------------------------------------------------------------ */

/**
 * Reference lookup tables by riding style.
 * Values taken directly from Bike Faff MTB tyre pressure chart
 * (bikefaff.com/mountain-bike-tyre-pressure-calculator).
 * Each entry is the midpoint of a 10kg weight band.
 * Reference: 2.4" tyres, tubeless, ~14kg bike weight.
 */
const TYRE_PRESSURE_TABLE: Record<
  RidingStyle,
  Array<{ kg: number; front: number; rear: number }>
> = {
  xc: [
    { kg: 45, front: 17, rear: 21 },
    { kg: 55, front: 18, rear: 22 },
    { kg: 65, front: 20, rear: 23 },
    { kg: 75, front: 22, rear: 24 },
    { kg: 85, front: 25, rear: 26 },
    { kg: 95, front: 26, rear: 28 },
    { kg: 105, front: 28, rear: 30 },
  ],
  trail: [
    { kg: 45, front: 16, rear: 20 },
    { kg: 55, front: 17, rear: 21 },
    { kg: 65, front: 19, rear: 22 },
    { kg: 75, front: 21, rear: 23 },
    { kg: 85, front: 24, rear: 25 },
    { kg: 95, front: 25, rear: 27 },
    { kg: 105, front: 27, rear: 29 },
  ],
  enduro: [
    { kg: 45, front: 15, rear: 19 },
    { kg: 55, front: 16, rear: 20 },
    { kg: 65, front: 18, rear: 21 },
    { kg: 75, front: 20, rear: 22 },
    { kg: 85, front: 23, rear: 24 },
    { kg: 95, front: 24, rear: 26 },
    { kg: 105, front: 26, rear: 28 },
  ],
  dh: [
    { kg: 45, front: 14, rear: 18 },
    { kg: 55, front: 15, rear: 19 },
    { kg: 65, front: 17, rear: 20 },
    { kg: 75, front: 19, rear: 21 },
    { kg: 85, front: 22, rear: 23 },
    { kg: 95, front: 23, rear: 25 },
    { kg: 105, front: 25, rear: 27 },
  ],
};

/** Linear interpolation (with extrapolation beyond table bounds) */
function interpolateTable(
  table: Array<{ kg: number; front: number; rear: number }>,
  riderKg: number
): { front: number; rear: number } {
  // Clamp below
  if (riderKg <= table[0].kg) return { front: table[0].front, rear: table[0].rear };

  // Extrapolate above using slope of last two entries
  const n = table.length;
  if (riderKg >= table[n - 1].kg) {
    const dKg = table[n - 1].kg - table[n - 2].kg;
    const slopeF = (table[n - 1].front - table[n - 2].front) / dKg;
    const slopeR = (table[n - 1].rear - table[n - 2].rear) / dKg;
    const extra = riderKg - table[n - 1].kg;
    return {
      front: table[n - 1].front + slopeF * extra,
      rear: table[n - 1].rear + slopeR * extra,
    };
  }

  // Interpolate between bracketing entries
  for (let i = 0; i < n - 1; i++) {
    if (riderKg >= table[i].kg && riderKg <= table[i + 1].kg) {
      const t = (riderKg - table[i].kg) / (table[i + 1].kg - table[i].kg);
      return {
        front: table[i].front + t * (table[i + 1].front - table[i].front),
        rear: table[i].rear + t * (table[i + 1].rear - table[i].rear),
      };
    }
  }

  return { front: table[n - 1].front, rear: table[n - 1].rear };
}

function calculateMtbTyrePressure(
  riderWeightKg: number,
  bikeWeightKg: number,
  tyreWidth: number, // in inches (e.g., 2.4)
  ridingStyle: RidingStyle,
  tubeType: TubeType
): { front: number; rear: number } {
  // 1. Get base pressure from lookup table (style already accounted for)
  const table = TYRE_PRESSURE_TABLE[ridingStyle];
  let { front, rear } = interpolateTable(table, riderWeightKg);

  // 2. Scale for bike weight (reference table assumes ~14kg bike)
  const bikeAdj = (riderWeightKg + bikeWeightKg) / (riderWeightKg + 14);
  front *= bikeAdj;
  rear *= bikeAdj;

  // 3. Tyre width adjustment (reference table calibrated at 2.4")
  //    Bike Faff: ≈ -8 PSI per inch of additional tyre width
  const widthDelta = -8 * (tyreWidth - 2.4);
  front += widthDelta;
  rear += widthDelta;

  // 4. Tube type: tubes need +4 PSI for pinch flat protection (Bike Faff)
  if (tubeType === "tubed") {
    front += 4;
    rear += 4;
  }

  // 5. Clamp to safe MTB ranges
  front = Math.max(14, Math.min(45, front));
  rear = Math.max(15, Math.min(50, rear));

  return {
    front: Math.round(front * 2) / 2, // round to nearest 0.5
    rear: Math.round(rear * 2) / 2,
  };
}

/* ------------------------------------------------------------------ */
/*  VALIDATION                                                         */
/* ------------------------------------------------------------------ */

const VALIDATION = {
  riderWeight: { min: 30, max: 200, label: "Rider weight", unit: "kg" },
  bikeWeight: { min: 5, max: 30, label: "Bike weight", unit: "kg" },
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

/* ------------------------------------------------------------------ */
/*  PAGE COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export default function MtbSetupPage() {
  // Shared inputs
  const [weight, setWeight] = useState("");
  const [bikeWeight, setBikeWeight] = useState("14");
  const [style, setStyle] = useState<RidingStyle>("trail");

  // Suspension result
  const [shockResult, setShockResult] = useState<ReturnType<
    typeof calculateShockPressure
  > | null>(null);

  // Tyre inputs & result
  const [tyreWidth, setTyreWidth] = useState("2.4");
  const [tubeType, setTubeType] = useState<TubeType>("tubeless");
  const [tyreResult, setTyreResult] = useState<{
    front: number;
    rear: number;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const weightError = getValidationError(weight, "riderWeight");
  const bikeWeightError = getValidationError(bikeWeight, "bikeWeight");
  const hasErrors = !!weightError || !!bikeWeightError;

  const handleCalculateAll = () => {
    if (hasErrors) return;
    const w = parseFloat(weight);
    const bw = parseFloat(bikeWeight);
    const tw = parseFloat(tyreWidth);
    if (w > 0) {
      setShockResult(calculateShockPressure(w, style));
      if (bw > 0 && tw > 0) {
        setTyreResult(calculateMtbTyrePressure(w, bw, tw, style, tubeType));
      }
    }
  };

  const handleCopyResults = async () => {
    if (!shockResult && !tyreResult) return;
    const styleLabels: Record<RidingStyle, string> = { xc: "XC", trail: "Trail", enduro: "Enduro", dh: "DH" };
    let text = `MTB Setup (${weight}kg, ${styleLabels[style]})`;
    if (shockResult) {
      text += `\nSuspension: Rear ${shockResult.rearPSI} PSI / Fork ${shockResult.frontPSI} PSI (target sag ${shockResult.sagTarget})`;
    }
    if (tyreResult) {
      text += `\nTyres: Front ${tyreResult.front} PSI / Rear ${tyreResult.rear} PSI (${tyreWidth}", ${tubeType})`;
    }
    text += `\n— roadmancycling.com/tools/shock-pressure`;
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
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              MTB SETUP CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Suspension pressure, sag targets, and tyre pressure for your mountain bike.
              One form, complete setup.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              {/* Rider Weight */}
              <div>
                <label htmlFor="mtb-rider-weight" className="block font-heading text-lg text-off-white mb-2">
                  RIDER WEIGHT (KG)
                </label>
                <p className="text-xs text-foreground-subtle mb-2">
                  Include riding gear (add ~3-5kg to body weight).
                </p>
                <input
                  id="mtb-rider-weight"
                  type="number" min="40" max="150" placeholder="e.g. 80"
                  value={weight}
                  onChange={(e) => { setWeight(e.target.value); setShockResult(null); setTyreResult(null); }}
                  className={`${weightError ? errorInputClasses : inputClasses} text-xl`}
                />
                {weightError && <p className="text-red-400 text-xs mt-1">{weightError}</p>}
              </div>

              {/* Bike Weight */}
              <div>
                <label htmlFor="mtb-bike-weight" className="block font-heading text-lg text-off-white mb-2">
                  BIKE WEIGHT (KG)
                </label>
                <input
                  id="mtb-bike-weight"
                  type="number" min="8" max="25" step="0.5" placeholder="e.g. 14"
                  value={bikeWeight}
                  onChange={(e) => { setBikeWeight(e.target.value); setTyreResult(null); }}
                  className={bikeWeightError ? errorInputClasses : inputClasses}
                />
                {bikeWeightError && <p className="text-red-400 text-xs mt-1">{bikeWeightError}</p>}
              </div>

              {/* Riding Style */}
              <div>
                <label id="riding-style-label" className="block font-heading text-lg text-off-white mb-2">
                  RIDING STYLE
                </label>
                <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="riding-style-label">
                  {(
                    [
                      ["xc", "Cross-Country"],
                      ["trail", "Trail"],
                      ["enduro", "Enduro"],
                      ["dh", "Downhill"],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setStyle(val); setShockResult(null); setTyreResult(null); }}
                      aria-pressed={style === val}
                      className={`py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        style === val
                          ? "bg-coral text-off-white"
                          : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tyre Width */}
              <div>
                <label htmlFor="mtb-tyre-width" className="block font-heading text-lg text-off-white mb-2">
                  TYRE WIDTH (INCHES)
                </label>
                <select
                  id="mtb-tyre-width"
                  value={tyreWidth}
                  onChange={(e) => { setTyreWidth(e.target.value); setTyreResult(null); }}
                  className={`${inputClasses} appearance-none`}
                >
                  {["2.0", "2.1", "2.2", "2.25", "2.3", "2.35", "2.4", "2.5", "2.6", "2.8", "3.0"].map((w) => (
                    <option key={w} value={w} className="bg-charcoal">
                      {w}&quot;
                    </option>
                  ))}
                </select>
              </div>

              {/* Tyre Setup */}
              <div>
                <label id="mtb-tyre-setup-label" className="block font-heading text-lg text-off-white mb-2">
                  TYRE SETUP
                </label>
                <div className="flex gap-3" role="group" aria-labelledby="mtb-tyre-setup-label">
                  {(
                    [
                      ["tubeless", "Tubeless"],
                      ["tubed", "Tubed"],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setTubeType(val); setTyreResult(null); }}
                      aria-pressed={tubeType === val}
                      className={`flex-1 py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        tubeType === val
                          ? "bg-coral text-off-white"
                          : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleCalculateAll} size="lg" className="w-full">
                Calculate Setup
              </Button>
            </div>

            {/* Results */}
            <div aria-live="polite" aria-atomic="false">
            <AnimatePresence mode="wait">
              {(shockResult || tyreResult) && (
                <motion.div
                  className="mt-8 space-y-8"
                  key={`${shockResult?.rearPSI}-${tyreResult?.front}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Copy button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleCopyResults}
                      className="text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy Results"}
                    </button>
                  </div>

                  {/* Suspension */}
                  {shockResult && (
                    <div className="space-y-4">
                      <h2 className="font-heading text-2xl text-off-white">
                        SUSPENSION SETUP
                      </h2>
                      <div className="grid grid-cols-3 gap-4">
                        <motion.div
                          className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.1 }}
                        >
                          <p className="text-xs text-foreground-subtle mb-1">REAR SHOCK</p>
                          <p className="font-heading text-3xl text-coral">{shockResult.rearPSI}</p>
                          <p className="text-foreground-muted text-sm">PSI</p>
                        </motion.div>
                        <motion.div
                          className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.18 }}
                        >
                          <p className="text-xs text-foreground-subtle mb-1">FRONT FORK</p>
                          <p className="font-heading text-3xl text-coral">{shockResult.frontPSI}</p>
                          <p className="text-foreground-muted text-sm">PSI</p>
                        </motion.div>
                        <motion.div
                          className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.25 }}
                        >
                          <p className="text-xs text-foreground-subtle mb-1">TARGET SAG</p>
                          <p className="font-heading text-3xl text-coral">{shockResult.sagTarget}</p>
                        </motion.div>
                      </div>
                      <motion.div
                        className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.32 }}
                      >
                        <h3 className="font-heading text-lg text-off-white mb-3">SUSPENSION NOTES</h3>
                        <p className="text-foreground-muted text-sm leading-relaxed mb-3">
                          {shockResult.description}
                        </p>
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          <strong className="text-off-white">Important:</strong> These are
                          starting points. Set the pressure, then measure sag with a buddy
                          holding you upright in riding position. Adjust in 5 PSI increments
                          until you hit the target sag percentage. Your shock
                          manufacturer&apos;s chart should be consulted as the primary
                          reference.
                        </p>
                      </motion.div>
                    </div>
                  )}

                  {/* MTB Tyre Pressure */}
                  {tyreResult && (
                    <div className="space-y-4">
                      <h2 className="font-heading text-2xl text-off-white">
                        TYRE PRESSURE
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div
                          className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.38 }}
                        >
                          <p className="text-xs text-foreground-subtle mb-1">FRONT</p>
                          <p className="font-heading text-4xl text-coral">{tyreResult.front}</p>
                          <p className="text-foreground-muted text-sm">PSI</p>
                        </motion.div>
                        <motion.div
                          className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.44 }}
                        >
                          <p className="text-xs text-foreground-subtle mb-1">REAR</p>
                          <p className="font-heading text-4xl text-coral">{tyreResult.rear}</p>
                          <p className="text-foreground-muted text-sm">PSI</p>
                        </motion.div>
                      </div>
                      <motion.div
                        className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.5 }}
                      >
                        <h3 className="font-heading text-lg text-off-white mb-3">TYRE NOTES</h3>
                        <p className="text-foreground-muted text-sm leading-relaxed mb-3">
                          MTB tyre pressure is highly terrain-dependent. These recommendations
                          optimise the balance between grip, rolling resistance, and flat protection
                          for your riding style. Run the front ~2 PSI lower than the rear for
                          better cornering grip.
                        </p>
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          {tubeType === "tubeless"
                            ? "Tubeless setup allows lower pressures without pinch flat risk. If you're getting tyre burps on hard hits, add 1-2 PSI or consider a tyre insert."
                            : "Running tubes means higher minimum pressure to avoid pinch flats. Consider going tubeless to unlock lower pressures and better grip."}
                        </p>
                      </motion.div>
                    </div>
                  )}

                  {/* Learn More */}
                  <motion.div
                    className="rounded-xl border border-white/10 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.56 }}
                  >
                    <h3 className="font-heading text-lg text-off-white mb-3">LEARN MORE</h3>
                    <ul className="space-y-2">
                      <li>
                        <a href="/blog/mtb-suspension-setup-complete-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          MTB Suspension Setup: The Complete Guide
                        </a>
                      </li>
                      <li>
                        <a href="/blog/mtb-tyre-pressure-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          MTB Tyre Pressure Guide
                        </a>
                      </li>
                      <li>
                        <a href="/blog/mtb-fork-setup-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          MTB Fork Setup Guide
                        </a>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.62 }}
                  >
                    <EmailCapture
                      heading="GET MTB SETUP SECRETS STRAIGHT TO YOUR INBOX"
                      subheading="Suspension, tyres, fit, and the details that make you faster on dirt. Once a week."
                      source="tool-mtb-setup"
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
