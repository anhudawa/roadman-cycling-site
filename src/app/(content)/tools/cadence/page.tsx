"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

const WHEEL_PRESETS = [
  { label: "700x23", circumference: 2096 },
  { label: "700x25", circumference: 2105 },
  { label: "700x28", circumference: 2136 },
  { label: "700x32", circumference: 2155 },
  { label: "650b x47", circumference: 2116 },
];

const CHAINRING_PRESETS = [
  { label: "50/34 Compact", values: [50, 34] },
  { label: "52/36 Standard", values: [52, 36] },
  { label: "53/39 Pro", values: [53, 39] },
];

const COG_PRESETS = [11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 28, 32];

const CADENCE_ZONES = [
  { min: 0, max: 60, label: "Grinding", desc: "High torque, joint stress. Only useful in very short efforts.", color: "#EF4444" },
  { min: 60, max: 75, label: "Low", desc: "Strength-biased. Common in time trials and muscular riders.", color: "#F97316" },
  { min: 75, max: 85, label: "Moderate", desc: "General riding and endurance. Comfortable for most.", color: "#EAB308" },
  { min: 85, max: 95, label: "Optimal", desc: "The sweet spot for most cyclists. Efficient pedalling.", color: "#22C55E" },
  { min: 95, max: 110, label: "High", desc: "Pro road racing zone. Requires good pedalling technique.", color: "#3B82F6" },
  { min: 110, max: 999, label: "Very High", desc: "Sprinting and track. Demands exceptional neuromuscular control.", color: "#A855F7" },
];

function getCadenceZone(cadence: number) {
  return CADENCE_ZONES.find((z) => cadence >= z.min && cadence < z.max) || CADENCE_ZONES[CADENCE_ZONES.length - 1];
}

function getSpeedError(value: string, unit: "kmh" | "mph"): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Enter a valid number";
  if (unit === "mph") {
    if (num < 1) return "Speed must be at least 1 mph";
    if (num > 75) return "Speed must be under 75 mph";
  } else {
    if (num < 1) return "Speed must be at least 1 km/h";
    if (num > 120) return "Speed must be under 120 km/h";
  }
  return null;
}

function getCadenceError(value: string): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Enter a valid number";
  if (num < 20) return "Cadence must be at least 20 RPM";
  if (num > 200) return "Cadence must be under 200 RPM";
  return null;
}

function getChainringError(value: string): string | null {
  if (!value) return null;
  const num = parseInt(value);
  if (isNaN(num)) return "Enter a valid number";
  if (num < 24) return "Chainring must be at least 24 teeth";
  if (num > 60) return "Chainring must be under 60 teeth";
  return null;
}

function getCogError(value: string): string | null {
  if (!value) return null;
  const num = parseInt(value);
  if (isNaN(num)) return "Enter a valid number";
  if (num < 9) return "Cog must be at least 9 teeth";
  if (num > 52) return "Cog must be under 52 teeth";
  return null;
}

export default function CadencePage() {
  const [mode, setMode] = useState<"speed-to-cadence" | "cadence-to-speed">("speed-to-cadence");
  const [speed, setSpeed] = useState("");
  const [speedUnit, setSpeedUnit] = useState<"kmh" | "mph">("kmh");
  const [cadenceInput, setCadenceInput] = useState("");
  const [wheelIndex, setWheelIndex] = useState(1); // default 700x25
  const [chainring, setChainring] = useState("");
  const [cog, setCog] = useState("");
  const [calculated, setCalculated] = useState(false);

  const wheelCirc = WHEEL_PRESETS[wheelIndex].circumference;
  const chainringVal = parseInt(chainring) || 0;
  const cogVal = parseInt(cog) || 0;
  const gearRatio = cogVal > 0 ? chainringVal / cogVal : 0;

  const speedError = mode === "speed-to-cadence" ? getSpeedError(speed, speedUnit) : null;
  const cadenceError = mode === "cadence-to-speed" ? getCadenceError(cadenceInput) : null;
  const chainringError = getChainringError(chainring);
  const cogError = getCogError(cog);

  // Calculations
  let resultCadence = 0;
  let resultSpeedKmh = 0;
  let resultSpeedDisplay = 0;

  if (mode === "speed-to-cadence") {
    const speedVal = parseFloat(speed) || 0;
    const speedKmh = speedUnit === "mph" ? speedVal * 1.60934 : speedVal;
    const speedMmPerMin = (speedKmh * 1_000_000) / 60;
    resultCadence = gearRatio > 0 ? speedMmPerMin / (wheelCirc * gearRatio) : 0;
  } else {
    const cadVal = parseFloat(cadenceInput) || 0;
    const speedMmPerMin = cadVal * wheelCirc * gearRatio;
    resultSpeedKmh = (speedMmPerMin * 60) / 1_000_000;
    resultSpeedDisplay = speedUnit === "mph" ? resultSpeedKmh / 1.60934 : resultSpeedKmh;
  }

  const displayCadence = mode === "speed-to-cadence" ? resultCadence : parseFloat(cadenceInput) || 0;
  const zone = getCadenceZone(displayCadence);

  const canCalculate = mode === "speed-to-cadence"
    ? (parseFloat(speed) || 0) > 0 && chainringVal > 0 && cogVal > 0 && !speedError && !chainringError && !cogError
    : (parseFloat(cadenceInput) || 0) > 0 && chainringVal > 0 && cogVal > 0 && !cadenceError && !chainringError && !cogError;

  const resetCalc = () => setCalculated(false);

  // Gear comparison table data
  const comparisonCogs = [11, 13, 15, 19, 23, 28].filter((c) => c !== cogVal);
  const allComparisonCogs = cogVal > 0 ? [cogVal, ...comparisonCogs].sort((a, b) => a - b).slice(0, 6) : comparisonCogs.slice(0, 6);

  function getComparisonValue(compCog: number): number {
    const compGearRatio = chainringVal / compCog;
    if (mode === "speed-to-cadence") {
      const speedVal = parseFloat(speed) || 0;
      const speedKmh = speedUnit === "mph" ? speedVal * 1.60934 : speedVal;
      const speedMmPerMin = (speedKmh * 1_000_000) / 60;
      return compGearRatio > 0 ? speedMmPerMin / (wheelCirc * compGearRatio) : 0;
    } else {
      const cadVal = parseFloat(cadenceInput) || 0;
      const speedMmPerMin = cadVal * wheelCirc * compGearRatio;
      const compSpeedKmh = (speedMmPerMin * 60) / 1_000_000;
      return speedUnit === "mph" ? compSpeedKmh / 1.60934 : compSpeedKmh;
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none focus:border-coral transition-colors";
  const inputErrorClass = "w-full bg-white/5 border border-red-500/60 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none focus:border-red-500 transition-colors";
  const pillClass = "text-xs rounded-full px-2 py-1 bg-white/5 border border-white/10 text-foreground-muted hover:border-coral hover:text-coral transition-colors cursor-pointer";
  const pillActiveClass = "text-xs rounded-full px-2 py-1 bg-coral/20 border border-coral text-coral transition-colors cursor-pointer";

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              CADENCE CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Speed, gearing, and wheel size in. Cadence out. Or work backwards from RPM to speed.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
              {/* Mode toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-heading text-sm text-off-white">
                    {mode === "speed-to-cadence" ? "SPEED TO CADENCE" : "CADENCE TO SPEED"}
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode(mode === "speed-to-cadence" ? "cadence-to-speed" : "speed-to-cadence"); resetCalc(); }}
                    className="text-coral text-xs font-body hover:text-coral/80 transition-colors"
                  >
                    Switch to {mode === "speed-to-cadence" ? "Cadence to Speed" : "Speed to Cadence"}
                  </button>
                </div>
              </div>

              {/* Speed or Cadence input depending on mode */}
              {mode === "speed-to-cadence" ? (
                <div className="mb-6">
                  <label htmlFor="speed-input" className="block font-heading text-sm text-off-white mb-2">SPEED</label>
                  <div className="flex gap-3">
                    <input
                      id="speed-input"
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="1"
                      max={speedUnit === "mph" ? "75" : "120"}
                      placeholder={speedUnit === "mph" ? "e.g. 20" : "e.g. 32"}
                      aria-label={`Speed in ${speedUnit === "mph" ? "miles per hour" : "kilometres per hour"}`}
                      aria-invalid={!!speedError}
                      value={speed}
                      onChange={(e) => { setSpeed(e.target.value); resetCalc(); }}
                      className={speedError ? inputErrorClass : inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => { setSpeedUnit(speedUnit === "kmh" ? "mph" : "kmh"); resetCalc(); }}
                      className="shrink-0 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-sm font-heading tracking-wider hover:border-coral transition-colors min-w-[72px]"
                    >
                      {speedUnit === "kmh" ? "km/h" : "mph"}
                    </button>
                  </div>
                  {speedError && <p className="text-red-400 text-xs mt-1" role="alert">{speedError}</p>}
                </div>
              ) : (
                <div className="mb-6">
                  <label htmlFor="cadence-input" className="block font-heading text-sm text-off-white mb-2">CADENCE (RPM)</label>
                  <input
                    id="cadence-input"
                    type="number"
                    inputMode="numeric"
                    min="20"
                    max="200"
                    placeholder="e.g. 90"
                    aria-label="Cadence in revolutions per minute"
                    aria-invalid={!!cadenceError}
                    value={cadenceInput}
                    onChange={(e) => { setCadenceInput(e.target.value); resetCalc(); }}
                    className={cadenceError ? inputErrorClass : inputClass}
                  />
                  {cadenceError && <p className="text-red-400 text-xs mt-1" role="alert">{cadenceError}</p>}
                  <span className="text-foreground-subtle text-xs mt-1 block">revolutions per minute</span>
                </div>
              )}

              {/* Speed unit toggle in cadence-to-speed mode */}
              {mode === "cadence-to-speed" && (
                <div className="mb-6">
                  <label className="block font-heading text-sm text-off-white mb-2">OUTPUT SPEED UNIT</label>
                  <button
                    type="button"
                    onClick={() => { setSpeedUnit(speedUnit === "kmh" ? "mph" : "kmh"); resetCalc(); }}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-sm font-heading tracking-wider hover:border-coral transition-colors"
                  >
                    {speedUnit === "kmh" ? "km/h" : "mph"} — tap to switch
                  </button>
                </div>
              )}

              {/* Wheel size */}
              <div className="mb-6">
                <label htmlFor="wheel-select" className="block font-heading text-sm text-off-white mb-2">WHEEL SIZE</label>
                <select
                  id="wheel-select"
                  value={wheelIndex}
                  onChange={(e) => { setWheelIndex(parseInt(e.target.value)); resetCalc(); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider focus:outline-none focus:border-coral transition-colors appearance-none"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                >
                  {WHEEL_PRESETS.map((w, i) => (
                    <option key={w.label} value={i}>
                      {w.label} ({w.circumference}mm)
                    </option>
                  ))}
                </select>
                <span className="text-foreground-subtle text-xs mt-1 block">circumference in millimetres</span>
              </div>

              {/* Chainring */}
              <div className="mb-6">
                <label htmlFor="chainring-input" className="block font-heading text-sm text-off-white mb-2">CHAINRING TEETH</label>
                <input
                  id="chainring-input"
                  type="number"
                  inputMode="numeric"
                  min="24"
                  max="60"
                  placeholder="e.g. 52"
                  aria-label="Number of teeth on the chainring"
                  aria-invalid={!!chainringError}
                  value={chainring}
                  onChange={(e) => { setChainring(e.target.value); resetCalc(); }}
                  className={chainringError ? inputErrorClass : inputClass}
                />
                {chainringError && <p className="text-red-400 text-xs mt-1" role="alert">{chainringError}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {CHAINRING_PRESETS.map((preset) => (
                    <span key={preset.label} className="flex gap-1">
                      {preset.values.map((v) => (
                        <button
                          key={`${preset.label}-${v}`}
                          type="button"
                          onClick={() => { setChainring(String(v)); resetCalc(); }}
                          className={parseInt(chainring) === v ? pillActiveClass : pillClass}
                        >
                          {v}T
                        </button>
                      ))}
                      <span className="text-foreground-subtle text-xs self-center ml-0.5 mr-2">{preset.label}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Cassette cog */}
              <div className="mb-6">
                <label htmlFor="cog-input" className="block font-heading text-sm text-off-white mb-2">CASSETTE COG TEETH</label>
                <input
                  id="cog-input"
                  type="number"
                  inputMode="numeric"
                  min="9"
                  max="52"
                  placeholder="e.g. 15"
                  aria-label="Number of teeth on the cassette cog"
                  aria-invalid={!!cogError}
                  value={cog}
                  onChange={(e) => { setCog(e.target.value); resetCalc(); }}
                  className={cogError ? inputErrorClass : inputClass}
                />
                {cogError && <p className="text-red-400 text-xs mt-1" role="alert">{cogError}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {COG_PRESETS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => { setCog(String(v)); resetCalc(); }}
                      className={parseInt(cog) === v ? pillActiveClass : pillClass}
                    >
                      {v}T
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => canCalculate && setCalculated(true)}
                size="lg"
                className="w-full"
              >
                {mode === "speed-to-cadence" ? "Calculate Cadence" : "Calculate Speed"}
              </Button>
            </div>

            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && canCalculate && (
                  <motion.div
                    key={`${mode}-${speed}-${cadenceInput}-${chainring}-${cog}-${wheelIndex}-${speedUnit}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Big result number */}
                    <div className="text-center mb-8">
                      {mode === "speed-to-cadence" ? (
                        <>
                          <p className="font-heading text-6xl md:text-8xl text-coral mb-2">{Math.round(resultCadence)}</p>
                          <p className="font-heading text-xl text-off-white">REVOLUTIONS PER MINUTE</p>
                        </>
                      ) : (
                        <>
                          <p className="font-heading text-6xl md:text-8xl text-coral mb-2">{resultSpeedDisplay.toFixed(1)}</p>
                          <p className="font-heading text-xl text-off-white">{speedUnit === "kmh" ? "KM/H" : "MPH"}</p>
                        </>
                      )}
                    </div>

                    {/* Gear ratio */}
                    <div className="flex items-center justify-center gap-8 mb-8 text-center">
                      <div>
                        <p className="font-heading text-3xl text-off-white">{gearRatio.toFixed(2)} : 1</p>
                        <p className="text-foreground-subtle text-sm">Gear Ratio ({chainringVal}T / {cogVal}T)</p>
                      </div>
                    </div>

                    {/* Cadence zone indicator */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 mb-8">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0 mt-1" style={{ backgroundColor: zone.color }} />
                        <div>
                          <p className="text-off-white font-heading text-sm mb-1" style={{ color: zone.color }}>
                            {zone.label.toUpperCase()} CADENCE ({zone.min}{zone.max < 999 ? `–${zone.max}` : "+"} RPM)
                          </p>
                          <p className="text-foreground-muted text-sm">{zone.desc}</p>
                        </div>
                      </div>
                    </div>

                    {/* Cadence zone scale */}
                    <div className="space-y-2 mb-8">
                      {CADENCE_ZONES.map((z) => {
                        const isActive = displayCadence >= z.min && displayCadence < z.max;
                        return (
                          <div
                            key={z.label}
                            className={`flex items-center gap-4 rounded-lg p-3 transition-all ${isActive ? "bg-white/[0.08] border border-white/15" : ""}`}
                          >
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                            <span className="text-off-white text-sm flex-1">{z.label}</span>
                            <span className="text-foreground-subtle text-xs">
                              {z.max < 999 ? `${z.min}–${z.max}` : `${z.min}+`} RPM
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Gear comparison table */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-1">GEAR COMPARISON</h3>
                      <p className="text-foreground-subtle text-xs mb-4">
                        {mode === "speed-to-cadence"
                          ? `Cadence at different cogs with ${chainringVal}T chainring at your entered speed`
                          : `Speed at different cogs with ${chainringVal}T chainring at your entered cadence`}
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {allComparisonCogs.map((compCog) => {
                          const val = getComparisonValue(compCog);
                          const isCurrentCog = compCog === cogVal;
                          const compCadence = mode === "speed-to-cadence" ? val : displayCadence;
                          const compZone = getCadenceZone(compCadence);
                          return (
                            <div
                              key={compCog}
                              className={`rounded-lg p-3 text-center ${isCurrentCog ? "bg-coral/15 border border-coral/40" : "bg-white/[0.04] border border-white/10"}`}
                            >
                              <p className="text-foreground-subtle text-xs mb-1">{chainringVal}/{compCog}</p>
                              <p className={`font-heading text-lg ${isCurrentCog ? "text-coral" : "text-off-white"}`}>
                                {mode === "speed-to-cadence" ? Math.round(val) : val.toFixed(1)}
                              </p>
                              <p className="text-xs mt-0.5" style={{ color: compZone.color }}>
                                {mode === "speed-to-cadence" ? "RPM" : (speedUnit === "kmh" ? "km/h" : "mph")}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Research note box */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">WHAT THE RESEARCH SAYS</h3>
                      <ul className="space-y-3 text-foreground-muted text-sm">
                        <li className="flex gap-2">
                          <span className="text-coral shrink-0">&bull;</span>
                          <span><strong className="text-off-white">Lucia et al. (2004):</strong> Self-selected cadence is usually the most metabolically efficient. Trying to force a cadence outside your natural preference typically costs more oxygen, not less.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-coral shrink-0">&bull;</span>
                          <span><strong className="text-off-white">Pro peloton trend:</strong> Elite riders gravitate toward 90&ndash;100 RPM because their high aerobic capacity handles the cardiovascular cost of faster spinning. That doesn&apos;t mean amateurs should copy the number.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-coral shrink-0">&bull;</span>
                          <span><strong className="text-off-white">Terrain effect:</strong> Cadence typically drops 5&ndash;10 RPM on climbs compared to flat terrain at the same power output, partly due to lower speeds and partly because higher torque per stroke is mechanically unavoidable on gradients.</span>
                        </li>
                      </ul>
                    </div>

                    {/* What Next */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT?</h3>
                      <ul className="space-y-2">
                        <li><Link href="/tools/gear-ratio" className="text-coral hover:text-coral/80 text-sm transition-colors">Gear Ratio Calculator</Link></li>
                        <li><Link href="/tools/power-speed" className="text-coral hover:text-coral/80 text-sm transition-colors">Power and Speed Calculator</Link></li>
                        <li><Link href="/blog/cycling-cadence-optimal-rpm-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">Cycling Cadence: What RPM Should You Actually Pedal At?</Link></li>
                        <li><Link href="/blog/low-cadence-training-cycling-torque-intervals" className="text-coral hover:text-coral/80 text-sm transition-colors">Low Cadence Training: Torque Intervals</Link></li>
                      </ul>
                    </div>

                    {/* CTA box */}
                    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">WANT TO OPTIMISE YOUR PEDALLING EFFICIENCY?</p>
                      <p className="text-off-white font-heading text-lg mb-2">Cadence is one variable.</p>
                      <p className="text-foreground-muted text-sm mb-4">
                        A coach looks at the full picture &mdash; power, position, gearing, and the terrain you race on &mdash; to find the RPM range where you produce the most watts for the least cost.
                      </p>
                      <a href="/apply" className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all" data-track="tool_cadence_apply">
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
                <strong className="text-off-white">Formula:</strong> Gear Ratio = Chainring Teeth / Cog Teeth.
                Speed (mm/min) = Cadence &times; Wheel Circumference (mm) &times; Gear Ratio.
                Convert mm/min to km/h by multiplying by 60 and dividing by 1,000,000. To reverse &mdash; from speed to
                cadence &mdash; divide speed in mm/min by the product of circumference and gear ratio.
              </p>
              <p>
                <strong className="text-off-white">Cadence biomechanics:</strong> A slow cadence means high torque
                per pedal stroke, which recruits more Type II (fast-twitch) muscle fibres and generates greater
                muscular fatigue per revolution. A fast cadence reduces torque per stroke but shifts the metabolic
                burden toward the cardiovascular system &mdash; the heart and lungs work harder to service rapid, lighter
                contractions. The trade-off between muscular and cardiovascular cost is why cadence preference is
                so individual: it depends on your fibre-type distribution, aerobic capacity, and the duration and
                intensity of the effort.
              </p>
              <p>
                <strong className="text-off-white">The Armstrong effect:</strong> Lance Armstrong popularised
                high-cadence riding in the early 2000s, spinning at 100&ndash;110 RPM in the mountains when
                his rivals were grinding at 70&ndash;80. The cycling world took notice, and higher cadences became
                fashionable across the amateur peloton. But the research published since then &mdash; including work
                by Lucia, Marsh, and Foss &mdash; shows that self-selected cadence typically approximates the
                metabolically optimal rate for a given individual. The trend toward higher cadence among professionals
                reflects their exceptional aerobic capacity (enabling them to absorb the cardiovascular cost of fast
                spinning), not a universal prescription. Copying a pro&apos;s cadence without their engine is
                borrowing a solution to someone else&apos;s problem.
              </p>
              <p>
                <strong className="text-off-white">Optimal cadence varies:</strong> Fitness level, effort type,
                terrain, bike fit, and individual physiology all influence where your most efficient cadence falls.
                A time triallist holding threshold might sit at 85&ndash;95 RPM. A sprinter winding up for the
                line might hit 120+. A climber on a steep gradient might drop to 70. There is no single correct
                number &mdash; only ranges that are more or less appropriate for the context. The calculator gives
                you the mechanical relationship between your gearing, speed, and cadence; the interpretation
                depends on you, your fitness, and the ride.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 &middot; Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="cadence" />
      </main>
      <Footer />
    </>
  );
}
