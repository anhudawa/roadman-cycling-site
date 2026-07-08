"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

/* ------------------------------------------------------------------ */
/*  Physics constants & types                                         */
/* ------------------------------------------------------------------ */

const G = 9.8067;
const DEFAULT_ETA = 0.97; // drivetrain efficiency

interface Position {
  label: string;
  cda: number;
}

interface Surface {
  label: string;
  crr: number;
}

const POSITIONS: Position[] = [
  { label: "Tops", cda: 0.40 },
  { label: "Hoods", cda: 0.35 },
  { label: "Drops", cda: 0.32 },
  { label: "Aero bars", cda: 0.27 },
  { label: "TT position", cda: 0.24 },
];

const SURFACES: Surface[] = [
  { label: "Smooth tarmac", crr: 0.004 },
  { label: "Rough road", crr: 0.005 },
  { label: "Wet road", crr: 0.006 },
  { label: "Gravel", crr: 0.008 },
];

interface Preset {
  label: string;
  gradient: string;
  positionIdx: number;
  surfaceIdx: number;
  wind: string;
  altitude: string;
  note: string;
}

const PRESETS: Preset[] = [
  {
    label: "Flat TT",
    gradient: "0",
    positionIdx: 4, // TT position
    surfaceIdx: 0, // Smooth tarmac
    wind: "0",
    altitude: "0",
    note: "Flat time trial, aero position, smooth road",
  },
  {
    label: "Alpe d'Huez",
    gradient: "8.1",
    positionIdx: 1, // Hoods
    surfaceIdx: 0, // Smooth tarmac
    wind: "0",
    altitude: "1100",
    note: "13.8 km at 8.1% average, start altitude ~1,100 m",
  },
  {
    label: "Mont Ventoux",
    gradient: "7.5",
    positionIdx: 1, // Hoods
    surfaceIdx: 0, // Smooth tarmac
    wind: "0",
    altitude: "900",
    note: "21.5 km at 7.5% from Bedoin, start ~900 m",
  },
  {
    label: "Rolling sportive",
    gradient: "1.5",
    positionIdx: 1, // Hoods
    surfaceIdx: 1, // Rough road
    wind: "0",
    altitude: "0",
    note: "Typical undulating sportive roads",
  },
];

/* ------------------------------------------------------------------ */
/*  Physics engine                                                    */
/* ------------------------------------------------------------------ */

/** Air density from altitude using barometric formula. */
function airDensityFromAltitude(altitudeM: number): number {
  // International Standard Atmosphere approximation
  const T0 = 288.15; // sea-level temp (K)
  const L = 0.0065; // lapse rate (K/m)
  const P0 = 101325; // sea-level pressure (Pa)
  const R = 287.058; // specific gas constant for air
  const gR = G / (R * L);
  const T = T0 - L * altitudeM;
  const P = P0 * Math.pow(T / T0, gR);
  return P / (R * T);
}

/** Gradient angle from percentage. */
function gradientAngle(pct: number): number {
  return Math.atan(pct / 100);
}

/**
 * Effective wind speed relative to rider.
 * headwind > 0 means extra resistance; tailwind < 0.
 */
function effectiveAirSpeed(riderSpeed: number, windKmh: number): number {
  const windMs = windKmh / 3.6;
  return riderSpeed + windMs;
}

interface ForceBreakdown {
  gravity: number;
  rolling: number;
  aero: number;
}

/** Power required at a given speed (m/s). Returns breakdown. */
function powerAtSpeed(
  v: number,
  totalMass: number,
  gradient: number,
  crr: number,
  rho: number,
  cda: number,
  windKmh: number,
): { power: number; forces: ForceBreakdown } {
  const theta = gradientAngle(gradient);
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);
  const vAir = effectiveAirSpeed(v, windKmh);
  // For aero drag, use max(vAir, 0) to avoid negative drag if tailwind > speed
  const vAirEff = Math.max(vAir, 0);

  const fGravity = totalMass * G * sinT;
  const fRolling = crr * totalMass * G * cosT;
  const fAero = 0.5 * rho * cda * vAirEff * vAirEff;

  const totalForce = fGravity + fRolling + fAero;
  const power = (totalForce * v) / DEFAULT_ETA;

  return {
    power: Math.max(power, 0),
    forces: {
      gravity: Math.abs(fGravity * v),
      rolling: Math.abs(fRolling * v),
      aero: Math.abs(fAero * v),
    },
  };
}

/** Solve for speed given power using Newton-Raphson. */
function speedFromPower(
  targetPower: number,
  totalMass: number,
  gradient: number,
  crr: number,
  rho: number,
  cda: number,
  windKmh: number,
): { speedMs: number; forces: ForceBreakdown } {
  // Initial guess — 10 m/s for flat, lower for steep
  let v = gradient > 3 ? 3 : gradient > 0 ? 6 : 10;
  const epsilon = 1e-6;

  for (let i = 0; i < 100; i++) {
    const { power } = powerAtSpeed(v, totalMass, gradient, crr, rho, cda, windKmh);
    const residual = power - targetPower;

    // Numerical derivative
    const dv = 0.001;
    const { power: p2 } = powerAtSpeed(v + dv, totalMass, gradient, crr, rho, cda, windKmh);
    const derivative = (p2 - power) / dv;

    if (Math.abs(derivative) < epsilon) break;

    const step = residual / derivative;
    v = v - step;

    // Clamp to reasonable range
    if (v < 0.1) v = 0.1;
    if (v > 50) v = 50;

    if (Math.abs(residual) < 0.01) break;
  }

  const { forces } = powerAtSpeed(v, totalMass, gradient, crr, rho, cda, windKmh);
  return { speedMs: v, forces };
}

/* ------------------------------------------------------------------ */
/*  Result types                                                      */
/* ------------------------------------------------------------------ */

interface CalcResult {
  speedKmh: number;
  speedMph: number;
  power: number;
  forces: ForceBreakdown;
  totalMass: number;
  gradient: number;
}

/* ------------------------------------------------------------------ */
/*  Speed comparisons                                                 */
/* ------------------------------------------------------------------ */

function getSpeedComparison(kmh: number): string | null {
  if (kmh >= 55) return "That is above a professional team time trial pace (~54 km/h).";
  if (kmh >= 45) return "That is above the speed of a professional TT rider on a flat course (~45 km/h).";
  if (kmh >= 42) return "That matches the average Tour de France peloton speed on flat stages (~42 km/h).";
  if (kmh >= 38) return "Close to a strong amateur crit speed (~38-40 km/h).";
  if (kmh >= 33) return "Solid club-ride pace on the flat (~33-35 km/h).";
  if (kmh >= 28) return "Comfortable endurance pace for a fit amateur.";
  if (kmh >= 20) return "Steady touring or easy-spin territory.";
  if (kmh >= 10) return "Grinding climbing pace. The scenery is free.";
  if (kmh >= 5) return "Walking pace on two wheels. The gradient is doing the talking.";
  return null;
}

/* ------------------------------------------------------------------ */
/*  Shared CSS classes                                                */
/* ------------------------------------------------------------------ */

const inputClass =
  "w-full bg-white/5 border border-white/10 focus:border-coral rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors";
const selectClass =
  "w-full bg-white/5 border border-white/10 focus:border-coral rounded-lg px-4 py-3 text-off-white text-base focus:outline-none transition-colors appearance-none";
const labelClass = "block font-heading text-sm text-off-white mb-2";

/* ------------------------------------------------------------------ */
/*  Field helper                                                      */
/* ------------------------------------------------------------------ */

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && <p className="text-foreground-subtle text-xs mt-1.5">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Force breakdown bar                                               */
/* ------------------------------------------------------------------ */

function ForceBreakdown({ forces }: { forces: ForceBreakdown }) {
  const total = forces.gravity + forces.rolling + forces.aero;
  if (total === 0) return null;

  const gravPct = (forces.gravity / total) * 100;
  const rollPct = (forces.rolling / total) * 100;
  const aeroPct = (forces.aero / total) * 100;

  const items = [
    { label: "Gravity", pct: gravPct, color: "#EF4444" },
    { label: "Rolling", pct: rollPct, color: "#EAB308" },
    { label: "Aero", pct: aeroPct, color: "#3B82F6" },
  ].filter((d) => d.pct > 0.5);

  return (
    <div className="mb-8">
      <p className="font-heading text-xs text-foreground-muted uppercase tracking-widest mb-3">
        Where your watts go
      </p>
      <div className="flex rounded-lg overflow-hidden h-5 mb-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="h-full transition-all duration-500"
            style={{ width: `${item.pct}%`, backgroundColor: item.color }}
            title={`${item.label}: ${item.pct.toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-foreground-muted text-sm">
              {item.label} {item.pct.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

type CalcMode = "power-to-speed" | "speed-to-power";
type WeightUnit = "kg" | "lb";
type SpeedUnit = "kmh" | "mph";

export default function PowerSpeedPage() {
  // Mode
  const [mode, setMode] = useState<CalcMode>("power-to-speed");

  // Basic inputs
  const [power, setPower] = useState("");
  const [targetSpeed, setTargetSpeed] = useState("");
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>("kmh");
  const [riderWeight, setRiderWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [bikeWeight, setBikeWeight] = useState("8.0");
  const [gradient, setGradient] = useState("0");

  // Advanced inputs
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [positionIdx, setPositionIdx] = useState(1); // Hoods
  const [surfaceIdx, setSurfaceIdx] = useState(0); // Smooth tarmac
  const [wind, setWind] = useState("0");
  const [altitude, setAltitude] = useState("0");

  // Result
  const [result, setResult] = useState<CalcResult | null>(null);

  // Derived values
  const riderKg = weightUnit === "lb" ? (parseFloat(riderWeight) || 0) * 0.453592 : (parseFloat(riderWeight) || 0);
  const bikeKg = parseFloat(bikeWeight) || 0;
  const totalMass = riderKg + bikeKg;
  const gradientVal = parseFloat(gradient) || 0;
  const powerVal = parseFloat(power) || 0;
  const windVal = parseFloat(wind) || 0;
  const altitudeVal = parseFloat(altitude) || 0;
  const targetSpeedVal = parseFloat(targetSpeed) || 0;

  const cda = POSITIONS[positionIdx].cda;
  const crr = SURFACES[surfaceIdx].crr;

  const rho = useMemo(() => airDensityFromAltitude(altitudeVal), [altitudeVal]);

  const canCalculate =
    mode === "power-to-speed"
      ? powerVal > 0 && riderKg > 30 && bikeKg > 0
      : targetSpeedVal > 0 && riderKg > 30 && bikeKg > 0;

  function calculate() {
    if (!canCalculate) return;

    if (mode === "power-to-speed") {
      const { speedMs, forces } = speedFromPower(powerVal, totalMass, gradientVal, crr, rho, cda, windVal);
      const kmh = speedMs * 3.6;
      setResult({
        speedKmh: kmh,
        speedMph: kmh * 0.621371,
        power: powerVal,
        forces,
        totalMass,
        gradient: gradientVal,
      });
    } else {
      // Speed → Power
      const speedKmh = speedUnit === "mph" ? targetSpeedVal / 0.621371 : targetSpeedVal;
      const speedMs = speedKmh / 3.6;
      const { power: reqPower, forces } = powerAtSpeed(speedMs, totalMass, gradientVal, crr, rho, cda, windVal);
      setResult({
        speedKmh,
        speedMph: speedKmh * 0.621371,
        power: reqPower,
        forces,
        totalMass,
        gradient: gradientVal,
      });
    }
  }

  function reset() {
    setResult(null);
  }

  function applyPreset(preset: Preset) {
    setGradient(preset.gradient);
    setPositionIdx(preset.positionIdx);
    setSurfaceIdx(preset.surfaceIdx);
    setWind(preset.wind);
    setAltitude(preset.altitude);
    setShowAdvanced(true);
    reset();
  }

  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Tool
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              POWER-TO-SPEED CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Real physics. Enter watts and get speed, or enter speed and get the
              watts required. Gradient, wind, position, and rolling resistance
              all modelled.
            </p>
          </Container>
        </Section>

        {/* Calculator */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-6 md:p-8 mb-8">
              {/* Mode toggle */}
              <div className="flex rounded-lg border border-white/10 mb-6 overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setMode("power-to-speed"); reset(); }}
                  className={`flex-1 py-3 text-sm font-heading tracking-wider uppercase transition-colors ${
                    mode === "power-to-speed"
                      ? "bg-coral text-off-white"
                      : "bg-white/5 text-foreground-muted hover:text-off-white"
                  }`}
                >
                  Power → Speed
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("speed-to-power"); reset(); }}
                  className={`flex-1 py-3 text-sm font-heading tracking-wider uppercase transition-colors ${
                    mode === "speed-to-power"
                      ? "bg-coral text-off-white"
                      : "bg-white/5 text-foreground-muted hover:text-off-white"
                  }`}
                >
                  Speed → Power
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Primary input */}
                {mode === "power-to-speed" ? (
                  <Field id="power-input" label="POWER (WATTS)">
                    <input
                      id="power-input"
                      type="number"
                      inputMode="numeric"
                      min="30"
                      max="2000"
                      aria-label="Power output in watts"
                      placeholder="e.g. 250"
                      value={power}
                      onChange={(e) => { setPower(e.target.value); reset(); }}
                      className={inputClass}
                    />
                  </Field>
                ) : (
                  <Field id="speed-input" label={`TARGET SPEED (${speedUnit === "kmh" ? "KM/H" : "MPH"})`}>
                    <div className="flex gap-2">
                      <input
                        id="speed-input"
                        type="number"
                        inputMode="decimal"
                        min="1"
                        max="200"
                        step="0.1"
                        aria-label={`Target speed in ${speedUnit === "kmh" ? "kilometres per hour" : "miles per hour"}`}
                        placeholder={speedUnit === "kmh" ? "e.g. 35" : "e.g. 22"}
                        value={targetSpeed}
                        onChange={(e) => { setTargetSpeed(e.target.value); reset(); }}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setSpeedUnit(speedUnit === "kmh" ? "mph" : "kmh")}
                        className="shrink-0 bg-white/5 border border-white/10 rounded-lg px-3 text-foreground-muted text-xs font-heading uppercase hover:text-off-white transition-colors"
                        aria-label="Toggle speed unit"
                      >
                        {speedUnit === "kmh" ? "mph" : "km/h"}
                      </button>
                    </div>
                  </Field>
                )}

                {/* Rider weight */}
                <Field id="rider-weight" label={`RIDER WEIGHT (${weightUnit.toUpperCase()})`}>
                  <div className="flex gap-2">
                    <input
                      id="rider-weight"
                      type="number"
                      inputMode="decimal"
                      min={weightUnit === "kg" ? "35" : "77"}
                      max={weightUnit === "kg" ? "160" : "353"}
                      step="0.1"
                      aria-label={`Rider weight in ${weightUnit === "kg" ? "kilograms" : "pounds"}`}
                      placeholder={weightUnit === "kg" ? "e.g. 75" : "e.g. 165"}
                      value={riderWeight}
                      onChange={(e) => { setRiderWeight(e.target.value); reset(); }}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setWeightUnit(weightUnit === "kg" ? "lb" : "kg")}
                      className="shrink-0 bg-white/5 border border-white/10 rounded-lg px-3 text-foreground-muted text-xs font-heading uppercase hover:text-off-white transition-colors"
                      aria-label="Toggle weight unit"
                    >
                      {weightUnit === "kg" ? "lb" : "kg"}
                    </button>
                  </div>
                </Field>

                {/* Bike weight */}
                <Field id="bike-weight" label="BIKE WEIGHT (KG)" hint="Bike + kit + bottles">
                  <input
                    id="bike-weight"
                    type="number"
                    inputMode="decimal"
                    min="4"
                    max="25"
                    step="0.1"
                    aria-label="Bike weight in kilograms"
                    value={bikeWeight}
                    onChange={(e) => { setBikeWeight(e.target.value); reset(); }}
                    className={inputClass}
                  />
                </Field>

                {/* Gradient */}
                <Field id="gradient" label="GRADIENT (%)" hint="Negative for descents">
                  <input
                    id="gradient"
                    type="number"
                    inputMode="decimal"
                    min="-20"
                    max="25"
                    step="0.1"
                    aria-label="Road gradient as a percentage"
                    value={gradient}
                    onChange={(e) => { setGradient(e.target.value); reset(); }}
                    className={inputClass}
                  />
                </Field>
              </div>

              {/* Advanced section */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-foreground-muted text-sm font-heading uppercase tracking-wider hover:text-off-white transition-colors mb-4"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}
                  aria-hidden="true"
                >
                  <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Advanced settings
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pt-2 border-t border-white/5">
                      <Field id="position" label="RIDING POSITION" hint={`CdA ${cda.toFixed(2)} m²`}>
                        <select
                          id="position"
                          aria-label="Riding position, sets aerodynamic drag area"
                          value={positionIdx}
                          onChange={(e) => { setPositionIdx(parseInt(e.target.value)); reset(); }}
                          className={selectClass}
                        >
                          {POSITIONS.map((p, i) => (
                            <option key={p.label} value={i} className="bg-charcoal">
                              {p.label} ({p.cda} m²)
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field id="surface" label="ROLLING RESISTANCE" hint={`Crr ${crr.toFixed(4)}`}>
                        <select
                          id="surface"
                          aria-label="Road surface, sets rolling resistance"
                          value={surfaceIdx}
                          onChange={(e) => { setSurfaceIdx(parseInt(e.target.value)); reset(); }}
                          className={selectClass}
                        >
                          {SURFACES.map((s, i) => (
                            <option key={s.label} value={i} className="bg-charcoal">
                              {s.label} ({s.crr})
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field id="wind" label="WIND SPEED (KM/H)" hint="Negative = tailwind">
                        <input
                          id="wind"
                          type="number"
                          inputMode="decimal"
                          min="-60"
                          max="60"
                          step="1"
                          aria-label="Wind speed in kilometres per hour, negative for tailwind"
                          value={wind}
                          onChange={(e) => { setWind(e.target.value); reset(); }}
                          className={inputClass}
                        />
                      </Field>

                      <Field id="altitude" label="ALTITUDE (M)" hint={`Air density ${rho.toFixed(3)} kg/m³`}>
                        <input
                          id="altitude"
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="5000"
                          step="50"
                          aria-label="Altitude in metres, adjusts air density"
                          value={altitude}
                          onChange={(e) => { setAltitude(e.target.value); reset(); }}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Preset scenarios */}
              <div className="mb-6">
                <p className="font-heading text-xs text-foreground-muted uppercase tracking-widest mb-3">
                  Preset scenarios
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground-muted text-xs font-heading uppercase tracking-wider hover:text-off-white hover:border-coral/40 transition-colors"
                      title={p.note}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={calculate} size="lg" className="w-full" disabled={!canCalculate}>
                {mode === "power-to-speed" ? "Calculate Speed" : "Calculate Power"}
              </Button>
              {!canCalculate && !result && (
                <p className="text-foreground-subtle text-xs text-center mt-3">
                  {mode === "power-to-speed"
                    ? "Enter your power and rider weight to see your speed."
                    : "Enter your target speed and rider weight to see required watts."}
                </p>
              )}
            </div>

            {/* Results */}
            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {result && (
                  <motion.div
                    key={`${mode}-${result.power}-${result.speedKmh}-${result.gradient}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Primary result */}
                    <div className="text-center mb-8">
                      {mode === "power-to-speed" ? (
                        <>
                          <p className="text-coral text-xs font-body font-medium uppercase tracking-widest mb-3">
                            Estimated speed
                          </p>
                          <p className="font-heading text-6xl md:text-8xl text-coral mb-1 tabular-nums">
                            {result.speedKmh.toFixed(1)}
                          </p>
                          <p className="font-heading text-xl text-off-white">
                            KM/H
                          </p>
                          <p className="text-foreground-muted text-sm mt-1">
                            {result.speedMph.toFixed(1)} mph
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-coral text-xs font-body font-medium uppercase tracking-widest mb-3">
                            Power required
                          </p>
                          <p className="font-heading text-6xl md:text-8xl text-coral mb-1 tabular-nums">
                            {Math.round(result.power)}
                          </p>
                          <p className="font-heading text-xl text-off-white">
                            WATTS
                          </p>
                          <p className="text-foreground-muted text-sm mt-1">
                            {(result.power / riderKg).toFixed(2)} W/kg
                          </p>
                        </>
                      )}
                    </div>

                    {/* Secondary stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
                        <p className="font-heading text-3xl md:text-4xl text-off-white tabular-nums">
                          {mode === "power-to-speed" ? Math.round(result.power) : result.speedKmh.toFixed(1)}
                        </p>
                        <p className="text-foreground-muted text-sm mt-1">
                          {mode === "power-to-speed" ? "watts" : "km/h"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
                        <p className="font-heading text-3xl md:text-4xl text-off-white tabular-nums">
                          {(result.power / riderKg).toFixed(2)}
                        </p>
                        <p className="text-foreground-muted text-sm mt-1">W/kg</p>
                      </div>
                    </div>

                    {/* Force breakdown */}
                    <ForceBreakdown forces={result.forces} />

                    {/* Contextual note */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 mb-8 space-y-2">
                      {result.gradient === 0 ? (
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          On a flat road at sea level, {Math.round(result.power)}W moves a{" "}
                          {Math.round(riderKg)}kg rider at {result.speedKmh.toFixed(1)} km/h.
                        </p>
                      ) : result.gradient > 0 ? (
                        <>
                          <p className="text-foreground-muted text-sm leading-relaxed">
                            On this {result.gradient}% climb, {Math.round(result.power)}W sustains{" "}
                            {result.speedKmh.toFixed(1)} km/h.
                          </p>
                          <p className="text-foreground-muted text-sm leading-relaxed">
                            That is about{" "}
                            {result.speedKmh > 0
                              ? `${Math.floor(60 / result.speedKmh)}:${String(
                                  Math.round((60 / result.speedKmh - Math.floor(60 / result.speedKmh)) * 60),
                                ).padStart(2, "0")}`
                              : "--:--"}{" "}
                            per kilometre.
                          </p>
                        </>
                      ) : (
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          On this {Math.abs(result.gradient)}% descent, {Math.round(result.power)}W pushes
                          you to {result.speedKmh.toFixed(1)} km/h. Gravity is helping.
                        </p>
                      )}
                      {getSpeedComparison(result.speedKmh) && (
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          {getSpeedComparison(result.speedKmh)}
                        </p>
                      )}
                    </div>

                    {/* What next */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT?</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link href="/tools/race-predictor" className="text-coral hover:text-coral/80 text-sm transition-colors">
                            Race Time Predictor
                          </Link>
                        </li>
                        <li>
                          <Link href="/tools/wkg" className="text-coral hover:text-coral/80 text-sm transition-colors">
                            W/kg Calculator
                          </Link>
                        </li>
                        <li>
                          <Link href="/tools/ftp-zones" className="text-coral hover:text-coral/80 text-sm transition-colors">
                            Power Zone Calculator
                          </Link>
                        </li>
                        <li>
                          <Link href="/topics/ftp-training" className="text-coral hover:text-coral/80 text-sm transition-colors">
                            FTP Training topic hub
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">
                        WANT TO GO FASTER?
                      </p>
                      <p className="text-off-white font-heading text-lg mb-4">
                        Power is one side. Position, pacing, and knowing when to push are the other.
                      </p>
                      <a
                        href="/apply"
                        className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                        data-track="tool_power_speed_apply"
                      >
                        Apply for Coaching →
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* Methodology */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              METHODOLOGY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">The physics:</strong> This tool
                solves the standard cycling power equation: P = v × (m·g·sin(θ) +
                m·g·Crr·cos(θ) + 0.5·ρ·CdA·v²) / η. Power is split into three
                resistive forces — gravity, rolling resistance, and aerodynamic
                drag — then divided through the drivetrain (η&nbsp;=&nbsp;0.97).
              </p>
              <p>
                <strong className="text-off-white">Solving for speed:</strong> Given
                power, the equation is cubic in velocity and solved iteratively using
                Newton-Raphson. Given speed, the power is calculated directly. Wind
                speed is added to rider velocity for the aerodynamic term.
              </p>
              <p>
                <strong className="text-off-white">CdA values:</strong> The drag
                areas listed are representative estimates. Hoods (0.35&nbsp;m²)
                vs drops (0.32&nbsp;m²) can mean 2-3&nbsp;km/h at race speeds.
                A wind tunnel or velodrome aero test gives precise numbers — these
                are a sensible starting point.
              </p>
              <p>
                <strong className="text-off-white">Air density:</strong> Defaults
                to 1.225&nbsp;kg/m³ at sea level and adjusts with altitude using
                the International Standard Atmosphere barometric formula. At
                1,500&nbsp;m, air density drops to ~1.06&nbsp;kg/m³ — roughly
                a 13% reduction in aero drag.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 · Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="power-speed" />
      </main>
      <Footer />
    </>
  );
}
