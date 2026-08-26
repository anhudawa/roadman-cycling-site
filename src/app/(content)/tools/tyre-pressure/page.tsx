"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ReportRequestForm } from "@/components/features/tools/ReportRequestForm";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import {
  calculateTyrePressure,
  type RimProfile,
  type TyrePressureResult,
  type TyreSetup,
  type TyreSurface,
} from "@/lib/tools/tyre-pressure-calculator";

// Validation ranges
const VALIDATION = {
  riderWeight: { min: 30, max: 200, label: "Rider weight" },
  bikeWeight: { min: 3, max: 60, label: "Bike and gear weight" },
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
  const [surface, setSurface] = useState<TyreSurface>("smooth");
  const [tyreSetup, setTyreSetup] = useState<TyreSetup>("tubed");
  const [rimProfile, setRimProfile] = useState<RimProfile>("unsure");
  const [systemMinimumPsi, setSystemMinimumPsi] = useState("");
  const [systemMaximumPsi, setSystemMaximumPsi] = useState("");
  const [result, setResult] = useState<TyrePressureResult | null>(null);
  const [copied, setCopied] = useState(false);

  const riderWeightError = getValidationError(riderWeight, "riderWeight");
  const bikeWeightError = getValidationError(bikeWeight, "bikeWeight");
  const hasErrors = !!riderWeightError || !!bikeWeightError;

  const handleCalculate = () => {
    if (hasErrors) return;
    const rw = parseFloat(riderWeight);
    const bw = parseFloat(bikeWeight);
    const tw = parseInt(tyreWidth);
    if (rw > 0 && bw > 0 && tw > 0) {
      setResult(calculateTyrePressure({
        riderWeightKg: rw,
        bikeAndGearWeightKg: bw,
        measuredTyreWidthMm: tw,
        surface,
        setup: tyreSetup,
        rimProfile,
        systemMinimumPsi: systemMinimumPsi
          ? parseFloat(systemMinimumPsi)
          : undefined,
        systemMaximumPsi: systemMaximumPsi
          ? parseFloat(systemMaximumPsi)
          : undefined,
      }));
    }
  };

  const handleCopyResults = async () => {
    if (!result) return;
    const setupLabels: Record<TyreSetup, string> = {
      tubed: "tubed",
      tubeless: "tubeless",
      tubular: "tubular",
    };
    const text = `Road bike tyre-pressure starting point: front ${result.frontPsi} PSI (${result.frontBar} bar) / rear ${result.rearPsi} PSI (${result.rearBar} bar), ${riderWeight}kg rider, ${tyreWidth}mm measured tyres, ${setupLabels[tyreSetup]}. Verify the tyre and rim pressure range before riding — roadmancycling.com/tools/tyre-pressure`;
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
              ROAD BIKE TYRE PRESSURE CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Get front and rear starting pressure in PSI and bar from total
              system weight, measured tyre width and surface—with explicit
              hookless and manufacturer safety checks.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              {/* Rider Weight */}
              <div>
                <label htmlFor="rider-weight" className="block font-heading text-lg text-off-white mb-2">
                  RIDER WEIGHT IN KIT (KG)
                </label>
                <input
                  id="rider-weight"
                  type="number" min="30" max="200" step="0.1" placeholder="e.g. 75"
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
                  BIKE + BOTTLES + LUGGAGE (KG)
                </label>
                <input
                  id="bike-weight"
                  type="number" min="3" max="60" step="0.1" placeholder="e.g. 9.5"
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
                  MEASURED MOUNTED TYRE WIDTH (MM)
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
                <p className="text-foreground-subtle text-xs mt-1">
                  Measure the inflated tyre at its widest point if possible.
                  The number on the sidewall can differ from its width on your rim.
                </p>
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
                  Used for your compatibility record, not as a hidden pressure
                  modifier. Check the tyre maker&apos;s approved rim-width range.
                </p>
              </div>

              {/* Tyre Setup */}
              <div>
                <label id="tyre-setup-label" className="block font-heading text-lg text-off-white mb-2">TYRE SETUP</label>
                <div className="flex gap-3" role="group" aria-labelledby="tyre-setup-label">
                  {([["tubed", "Tyre + tube"], ["tubeless", "Tubeless"], ["tubular", "Tubular"]] as const).map(([val, label]) => (
                    <button
                      key={val} type="button"
                      onClick={() => { setTyreSetup(val); setResult(null); }}
                      aria-pressed={tyreSetup === val}
                      className={`flex-1 py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        tyreSetup === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rim profile */}
              <div>
                <label id="rim-profile-label" className="block font-heading text-lg text-off-white mb-2">
                  RIM PROFILE
                </label>
                <div className="flex gap-3" role="group" aria-labelledby="rim-profile-label">
                  {([["hooked", "Hooked"], ["hookless", "Hookless"], ["unsure", "Not sure"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setRimProfile(val); setResult(null); }}
                      aria-pressed={rimProfile === val}
                      className={`flex-1 py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        rimProfile === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-foreground-subtle text-xs mt-1">
                  Hookless rims require an explicitly compatible tyre and often
                  have a lower pressure limit than hooked rims.
                </p>
              </div>

              {/* Manufacturer limits */}
              <fieldset>
                <legend className="block font-heading text-lg text-off-white mb-2">
                  PRINTED SYSTEM LIMITS (OPTIONAL, PSI)
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="system-minimum" className="block text-foreground-subtle text-xs mb-1">
                      Highest minimum
                    </label>
                    <input
                      id="system-minimum"
                      type="number"
                      min="1"
                      max="130"
                      step="0.5"
                      placeholder="e.g. 55"
                      value={systemMinimumPsi}
                      onChange={(e) => { setSystemMinimumPsi(e.target.value); setResult(null); }}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="system-maximum" className="block text-foreground-subtle text-xs mb-1">
                      Lowest maximum
                    </label>
                    <input
                      id="system-maximum"
                      type="number"
                      min="1"
                      max="160"
                      step="0.5"
                      placeholder="e.g. 72"
                      value={systemMaximumPsi}
                      onChange={(e) => { setSystemMaximumPsi(e.target.value); setResult(null); }}
                      className={inputClasses}
                    />
                  </div>
                </div>
                <p className="text-foreground-subtle text-xs mt-1">
                  Use the strictest tyre and rim limits. If either maker gives
                  a higher minimum or lower maximum, that controls.
                </p>
              </fieldset>

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
                  key={`${result.frontPsi}-${result.rearPsi}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl text-off-white">YOUR STARTING PRESSURE</h2>
                    {!result.outsideEnteredLimits && (
                      <button
                        onClick={handleCopyResults}
                        aria-label={copied ? "Results copied to clipboard" : "Copy results to clipboard"}
                        className="text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                      >
                        {copied ? "Copied!" : "Copy Results"}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    >
                      <p className="text-sm text-foreground-subtle mb-1">FRONT</p>
                      <p className="font-heading text-5xl text-coral">{result.frontPsi}</p>
                      <p className="text-foreground-muted text-sm">
                        PSI · {result.frontBar} bar
                      </p>
                    </motion.div>
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.18 }}
                    >
                      <p className="text-sm text-foreground-subtle mb-1">REAR</p>
                      <p className="font-heading text-5xl text-coral">{result.rearPsi}</p>
                      <p className="text-foreground-muted text-sm">
                        PSI · {result.rearBar} bar
                      </p>
                    </motion.div>
                  </div>

                  <div
                    className={`rounded-xl border p-5 ${
                      result.outsideEnteredLimits
                        ? "border-red-500/50 bg-red-500/10"
                        : "border-amber-400/30 bg-amber-400/5"
                    }`}
                    role={result.outsideEnteredLimits ? "alert" : "note"}
                  >
                    <p className="font-heading text-off-white text-sm mb-2">
                      {result.outsideEnteredLimits
                        ? "DO NOT USE THIS ESTIMATE"
                        : "COMPATIBILITY CHECK REQUIRED"}
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      {result.outsideEnteredLimits
                        ? `The model output sits outside the limits you entered${result.effectiveMaximumPsi ? ` (effective maximum ${result.effectiveMaximumPsi} PSI)` : ""}. Use a compatible wider tyre or follow the tyre and rim makers' setup table; do not clamp the estimate and ride it.`
                        : "Before riding, confirm the tyre is approved for the rim and that both values sit inside the pressure ranges from both manufacturers. The lower maximum and higher minimum always win."}
                    </p>
                    {result.hooklessCeilingApplied && (
                      <p className="text-foreground-muted text-sm leading-relaxed mt-2">
                        For this hookless selection, the calculator applied a
                        72 PSI (5 bar) ceiling. Your wheel or tyre may specify a
                        lower value.
                      </p>
                    )}
                  </div>

                  <motion.div
                    className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6 space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.25 }}
                  >
                    <h3 className="font-heading text-lg text-off-white">HOW THIS WORKS</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      Roadman model v1 scales pressure with total system weight
                      and measured mounted tyre width, then returns the front at
                      93% of the rear baseline. It applies explicit surface
                      factors of 1.00 for smooth tarmac, 0.90 for rough roads and
                      0.80 for gravel. The exact method is published below so the
                      result is reproducible.
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      Setup type and internal rim width do not silently alter
                      the number. Tyre casing, actual axle load, rim geometry and
                      manufacturer compatibility differ too much for one honest
                      universal modifier. They remain visible in your setup so
                      you can check the correct maker table.
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      Treat the output as a starting point. Change one wheel by
                      1-2 PSI at a time on a repeatable route, while staying
                      inside the permitted range. Stop lowering pressure if the
                      tyre squirms, bottoms on the rim, burps, or loses support.
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
                        <Link href="/blog/cycling-tyre-pressure-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling Tyre Pressure Guide
                        </Link>
                      </li>
                      <li>
                        <Link href="/blog/mtb-tyre-pressure-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          MTB Tyre Pressure Guide
                        </Link>
                      </li>
                      <li>
                        <Link href="/topics/mountain-biking" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Mountain Biking topic hub →
                        </Link>
                      </li>
                      <li>
                        <Link href="/podcast/ep-2057-your-tyres-are-slowing-you-down-here-s-why" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Podcast: Your tyres are slowing you down — here&apos;s why
                        </Link>
                      </li>
                    </ul>
                  </motion.div>

                  {!result.outsideEnteredLimits ? (
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
                          tubeType: tyreSetup,
                          rimProfile,
                          systemMinimumPsi: systemMinimumPsi
                            ? parseFloat(systemMinimumPsi)
                            : undefined,
                          systemMaximumPsi: systemMaximumPsi
                            ? parseFloat(systemMaximumPsi)
                            : undefined,
                          front: result.frontPsi,
                          rear: result.rearPsi,
                        }}
                        heading={`Save your ${tyreWidth}mm starting setup`}
                        subheading="Get the front/rear PSI and bar, compatibility reminder and controlled field-test steps in one email."
                        bullets={[
                          `Front ${result.frontPsi} / rear ${result.rearPsi} psi baseline`,
                          "Tubed, tubeless and hookless safety checks",
                          "How to test 1-2 PSI changes on a repeatable route",
                          "The tyre/rim limits that always override the model",
                        ]}
                      />
                    </motion.div>
                  ) : (
                    <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/5 p-5">
                      <p className="font-heading text-off-white text-sm mb-1">
                        REPORT AND COPY DISABLED
                      </p>
                      <p className="text-foreground-muted text-sm leading-relaxed">
                        Choose a compatible setup whose calculated start sits
                        inside the tyre and rim limits before saving or sharing
                        a pressure result.
                      </p>
                    </div>
                  )}
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
                DIALLED IN YOUR PRESSURE?
              </p>
              <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                Coaching gets the rest of your setup right too.
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Personalised TrainingPeaks plan, weekly calls, five pillars.
                7-day free trial. $195/month.
              </p>
              <a
                href="/apply"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="tool_tyre_apply"
              >
                Apply for Coaching →
              </a>
            </motion.div>
          </Container>
        </Section>

        <ToolLanding slug="tyre-pressure" />
      </main>
      <Footer />
    </>
  );
}
