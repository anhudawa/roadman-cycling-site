"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

/* ------------------------------------------------------------------ */
/*  Physics constants                                                  */
/* ------------------------------------------------------------------ */

const G = 9.8067;
const DEFAULT_CDA = 0.35; // climbing position
const DEFAULT_CRR = 0.005;
const DEFAULT_ETA = 0.97; // drivetrain efficiency

/* ------------------------------------------------------------------ */
/*  Famous climb presets                                               */
/* ------------------------------------------------------------------ */

interface ClimbPreset {
  name: string;
  distanceKm: number;
  gradientPct: number;
  elevationM: number;
}

const CLIMB_PRESETS: ClimbPreset[] = [
  { name: "Alpe d'Huez", distanceKm: 13.8, gradientPct: 8.1, elevationM: 1071 },
  { name: "Mont Ventoux (Bédoin)", distanceKm: 21.5, gradientPct: 7.5, elevationM: 1617 },
  { name: "Col du Galibier (south)", distanceKm: 18.1, gradientPct: 6.9, elevationM: 1245 },
  { name: "Stelvio (Prato)", distanceKm: 24.3, gradientPct: 7.4, elevationM: 1808 },
  { name: "Sa Calobra", distanceKm: 9.4, gradientPct: 7.1, elevationM: 682 },
  { name: "Col du Tourmalet", distanceKm: 17.1, gradientPct: 7.4, elevationM: 1268 },
];

/* ------------------------------------------------------------------ */
/*  Physics engine                                                    */
/* ------------------------------------------------------------------ */

/** Air density adjusted for altitude using barometric formula. */
function airDensity(altitudeM: number): number {
  const T0 = 288.15;
  const L = 0.0065;
  const P0 = 101325;
  const R = 287.058;
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
 * Total power required at a given speed (m/s).
 * P = (F_gravity + F_rolling + F_aero) * v / eta
 */
function powerAtSpeed(
  v: number,
  totalMass: number,
  gradientPct: number,
  crr: number,
  rho: number,
  cda: number,
  windMs: number,
): number {
  const theta = gradientAngle(gradientPct);
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);

  const vAir = Math.max(v + windMs, 0);

  const fGravity = totalMass * G * sinT;
  const fRolling = crr * totalMass * G * cosT;
  const fAero = 0.5 * rho * cda * vAir * vAir;

  const totalForce = fGravity + fRolling + fAero;
  return Math.max((totalForce * v) / DEFAULT_ETA, 0);
}

/**
 * Newton-Raphson solver: find speed (m/s) for a given power output.
 */
function solveSpeedFromPower(
  targetPower: number,
  totalMass: number,
  gradientPct: number,
  crr: number,
  rho: number,
  cda: number,
  windMs: number,
): number {
  // Initial guess — lower for steep gradients
  let v = gradientPct > 5 ? 3 : gradientPct > 2 ? 5 : 8;
  const epsilon = 1e-6;

  for (let i = 0; i < 100; i++) {
    const p = powerAtSpeed(v, totalMass, gradientPct, crr, rho, cda, windMs);
    const residual = p - targetPower;

    // Numerical derivative
    const dv = 0.001;
    const p2 = powerAtSpeed(v + dv, totalMass, gradientPct, crr, rho, cda, windMs);
    const derivative = (p2 - p) / dv;

    if (Math.abs(derivative) < epsilon) break;

    const step = residual / derivative;
    v = v - step;

    if (v < 0.05) v = 0.05;
    if (v > 30) v = 30;

    if (Math.abs(residual) < 0.01) break;
  }

  return v;
}

/* ------------------------------------------------------------------ */
/*  Result interface                                                   */
/* ------------------------------------------------------------------ */

interface ClimbResult {
  timeSeconds: number;
  speedKmh: number;
  vam: number;
  wkg: number;
  comparisons: { name: string; timeSeconds: number; distanceKm: number; gradientPct: number; elevationM: number }[];
}

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

function formatClimbTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

/* ------------------------------------------------------------------ */
/*  Shared CSS                                                         */
/* ------------------------------------------------------------------ */

const inputClass =
  "w-full bg-white/5 border border-white/10 focus:border-coral rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors";

const labelClass = "block font-heading text-sm text-off-white mb-2";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ClimbTimePage() {
  /* -- Input state -- */
  const [riderWeight, setRiderWeight] = useState("75");
  const [bikeWeight, setBikeWeight] = useState("9");
  const [powerMode, setPowerMode] = useState<"watts" | "ftp">("watts");
  const [watts, setWatts] = useState("");
  const [ftp, setFtp] = useState("");
  const [ftpPct, setFtpPct] = useState("85");
  const [distance, setDistance] = useState("");
  const [gradient, setGradient] = useState("");
  const [elevationDirect, setElevationDirect] = useState("");
  const [wind, setWind] = useState("0");
  const [useLb, setUseLb] = useState(false);
  const [calculated, setCalculated] = useState(false);

  /* -- Parse inputs -- */
  const rawWeight = parseFloat(riderWeight) || 0;
  const riderKg = useLb ? rawWeight * 0.4536 : rawWeight;
  const bikeKg = parseFloat(bikeWeight) || 9;
  const totalMass = riderKg + bikeKg;

  const effectiveWatts = powerMode === "ftp"
    ? ((parseFloat(ftp) || 0) * (parseFloat(ftpPct) || 85)) / 100
    : parseFloat(watts) || 0;

  const distanceKm = parseFloat(distance) || 0;
  const gradientPct = parseFloat(gradient) || 0;
  const windKmh = parseFloat(wind) || 0;
  const windMs = windKmh / 3.6;

  // Elevation: auto-calculated from distance + gradient, or entered directly
  const autoElevation = distanceKm > 0 && gradientPct > 0
    ? distanceKm * 1000 * (gradientPct / 100)
    : 0;
  const elevationM = elevationDirect
    ? parseFloat(elevationDirect) || 0
    : autoElevation;

  /* -- Validation -- */
  const weightError = riderWeight && (rawWeight < 30 || rawWeight > 400)
    ? `Weight must be 30-${useLb ? "400 lb" : "180 kg"}`
    : null;
  const powerError = (() => {
    if (powerMode === "watts" && watts && (effectiveWatts < 50 || effectiveWatts > 800))
      return "Power typically ranges from 50 to 800 W";
    if (powerMode === "ftp" && ftp && ((parseFloat(ftp) || 0) < 50 || (parseFloat(ftp) || 0) > 600))
      return "FTP typically ranges from 50 to 600 W";
    return null;
  })();
  const distError = distance && (distanceKm <= 0 || distanceKm > 100)
    ? "Distance must be between 0.1 and 100 km"
    : null;
  const gradError = gradient && (gradientPct < 0 || gradientPct > 30)
    ? "Gradient must be 0-30%"
    : null;

  const canCalculate =
    effectiveWatts >= 50 &&
    riderKg > 30 &&
    distanceKm > 0 &&
    gradientPct > 0 &&
    !weightError &&
    !powerError &&
    !distError &&
    !gradError;

  /* -- Calculate result -- */
  const result = useMemo<ClimbResult | null>(() => {
    if (!calculated || !canCalculate) return null;

    // Average altitude for air density — estimate mid-climb altitude
    const avgAltitude = elevationM / 2;
    const rho = airDensity(avgAltitude);

    const speedMs = solveSpeedFromPower(
      effectiveWatts,
      totalMass,
      gradientPct,
      DEFAULT_CRR,
      rho,
      DEFAULT_CDA,
      windMs,
    );

    const distanceM = distanceKm * 1000;
    const timeSeconds = distanceM / speedMs;
    const speedKmh = speedMs * 3.6;
    const timeHours = timeSeconds / 3600;
    const vam = timeHours > 0 ? elevationM / timeHours : 0;
    const wkg = riderKg > 0 ? effectiveWatts / riderKg : 0;

    // Famous climb comparisons at the same power
    const comparisons = CLIMB_PRESETS.map((c) => {
      const cAvgAlt = c.elevationM / 2;
      const cRho = airDensity(cAvgAlt);
      const cSpeedMs = solveSpeedFromPower(
        effectiveWatts,
        totalMass,
        c.gradientPct,
        DEFAULT_CRR,
        cRho,
        DEFAULT_CDA,
        0, // no wind for comparisons
      );
      const cTime = (c.distanceKm * 1000) / cSpeedMs;
      return {
        name: c.name,
        timeSeconds: cTime,
        distanceKm: c.distanceKm,
        gradientPct: c.gradientPct,
        elevationM: c.elevationM,
      };
    });

    return { timeSeconds, speedKmh, vam, wkg, comparisons };
  }, [calculated, canCalculate, effectiveWatts, totalMass, gradientPct, distanceKm, elevationM, windMs, riderKg]);

  const resetCalc = () => setCalculated(false);

  /* Apply preset */
  function applyPreset(p: ClimbPreset) {
    setDistance(String(p.distanceKm));
    setGradient(String(p.gradientPct));
    setElevationDirect(String(p.elevationM));
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
              CLIMBING TIME ESTIMATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Power, weight, gradient, and distance in. Estimated climbing time, average speed, and VAM out.
            </p>
          </Container>
        </Section>

        {/* ---- Calculator ---- */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
              {/* Preset climbs */}
              <div className="mb-6">
                <p className="font-heading text-sm text-off-white mb-3">FAMOUS CLIMBS — QUICK FILL</p>
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

              {/* Rider weight */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="rider-weight" className={labelClass}>
                    RIDER WEIGHT ({useLb ? "LB" : "KG"})
                  </label>
                  <button
                    type="button"
                    onClick={() => { setUseLb(!useLb); resetCalc(); }}
                    className="text-coral text-xs font-body hover:text-coral/80 transition-colors"
                  >
                    {useLb ? "Switch to KG" : "Switch to LB"}
                  </button>
                </div>
                <input
                  id="rider-weight"
                  type="number"
                  inputMode="decimal"
                  placeholder={useLb ? "e.g. 165" : "e.g. 75"}
                  value={riderWeight}
                  onChange={(e) => { setRiderWeight(e.target.value); resetCalc(); }}
                  className={`${inputClass} ${weightError ? "!border-red-500/60 focus:!border-red-500" : ""}`}
                />
                {weightError && <p className="text-red-400 text-xs mt-1" role="alert">{weightError}</p>}
              </div>

              {/* Bike + gear weight */}
              <div className="mb-6">
                <label htmlFor="bike-weight" className={labelClass}>
                  BIKE + GEAR WEIGHT (KG)
                </label>
                <input
                  id="bike-weight"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 9"
                  value={bikeWeight}
                  onChange={(e) => { setBikeWeight(e.target.value); resetCalc(); }}
                  className={inputClass}
                />
                <p className="text-foreground-subtle text-xs mt-1">Bike, shoes, bottles, kit — everything except you</p>
              </div>

              {/* Power input — toggle between direct watts and FTP mode */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>POWER OUTPUT</label>
                  <button
                    type="button"
                    onClick={() => { setPowerMode(powerMode === "watts" ? "ftp" : "watts"); resetCalc(); }}
                    className="text-coral text-xs font-body hover:text-coral/80 transition-colors"
                  >
                    {powerMode === "watts" ? "Use FTP + %" : "Use direct watts"}
                  </button>
                </div>
                {powerMode === "watts" ? (
                  <input
                    id="power-watts"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 250"
                    value={watts}
                    onChange={(e) => { setWatts(e.target.value); resetCalc(); }}
                    className={`${inputClass} ${powerError ? "!border-red-500/60 focus:!border-red-500" : ""}`}
                    aria-label="Average power in watts"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        id="power-ftp"
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g. 280"
                        value={ftp}
                        onChange={(e) => { setFtp(e.target.value); resetCalc(); }}
                        className={`${inputClass} ${powerError ? "!border-red-500/60 focus:!border-red-500" : ""}`}
                        aria-label="FTP in watts"
                      />
                      <span className="text-foreground-subtle text-xs mt-1 block">FTP (watts)</span>
                    </div>
                    <div>
                      <input
                        id="power-ftp-pct"
                        type="number"
                        inputMode="numeric"
                        min="50"
                        max="120"
                        placeholder="85"
                        value={ftpPct}
                        onChange={(e) => { setFtpPct(e.target.value); resetCalc(); }}
                        className={inputClass}
                        aria-label="Percentage of FTP"
                      />
                      <span className="text-foreground-subtle text-xs mt-1 block">% of FTP</span>
                    </div>
                  </div>
                )}
                {powerError && <p className="text-red-400 text-xs mt-1" role="alert">{powerError}</p>}
                {powerMode === "ftp" && effectiveWatts > 0 && (
                  <p className="text-foreground-subtle text-xs mt-1">
                    = {Math.round(effectiveWatts)} W average climbing power
                  </p>
                )}
              </div>

              {/* Climb distance */}
              <div className="mb-6">
                <label htmlFor="climb-distance" className={labelClass}>CLIMB DISTANCE (KM)</label>
                <input
                  id="climb-distance"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder="e.g. 13.8"
                  value={distance}
                  onChange={(e) => { setDistance(e.target.value); resetCalc(); }}
                  className={`${inputClass} ${distError ? "!border-red-500/60 focus:!border-red-500" : ""}`}
                />
                {distError && <p className="text-red-400 text-xs mt-1" role="alert">{distError}</p>}
              </div>

              {/* Average gradient */}
              <div className="mb-6">
                <label htmlFor="climb-gradient" className={labelClass}>AVERAGE GRADIENT (%)</label>
                <input
                  id="climb-gradient"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder="e.g. 8.1"
                  value={gradient}
                  onChange={(e) => { setGradient(e.target.value); resetCalc(); }}
                  className={`${inputClass} ${gradError ? "!border-red-500/60 focus:!border-red-500" : ""}`}
                />
                {gradError && <p className="text-red-400 text-xs mt-1" role="alert">{gradError}</p>}
              </div>

              {/* Elevation gain — auto-calculated or direct entry */}
              <div className="mb-6">
                <label htmlFor="climb-elevation" className={labelClass}>
                  ELEVATION GAIN (M){" "}
                  <span className="text-foreground-subtle font-body text-xs font-normal">
                    — auto-calculated, or enter manually
                  </span>
                </label>
                <input
                  id="climb-elevation"
                  type="number"
                  inputMode="numeric"
                  placeholder={autoElevation > 0 ? Math.round(autoElevation).toString() : "e.g. 1071"}
                  value={elevationDirect}
                  onChange={(e) => { setElevationDirect(e.target.value); resetCalc(); }}
                  className={inputClass}
                />
                {!elevationDirect && autoElevation > 0 && (
                  <p className="text-foreground-subtle text-xs mt-1">
                    Auto-calculated: {Math.round(autoElevation)} m from {distanceKm} km at {gradientPct}%
                  </p>
                )}
              </div>

              {/* Headwind / tailwind */}
              <div className="mb-6">
                <label htmlFor="climb-wind" className={labelClass}>
                  HEADWIND / TAILWIND (KM/H){" "}
                  <span className="text-foreground-subtle font-body text-xs font-normal">
                    — positive = headwind, negative = tailwind
                  </span>
                </label>
                <input
                  id="climb-wind"
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={wind}
                  onChange={(e) => { setWind(e.target.value); resetCalc(); }}
                  className={inputClass}
                />
              </div>

              <Button onClick={() => canCalculate && setCalculated(true)} size="lg" className="w-full">
                Estimate Climbing Time
              </Button>
            </div>

            {/* ---- Results ---- */}
            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {result && (
                  <motion.div
                    key={`${result.timeSeconds}-${result.speedKmh}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Big climbing time */}
                    <div className="text-center mb-8">
                      <p className="font-heading text-6xl md:text-8xl text-coral mb-2">
                        {formatClimbTime(result.timeSeconds)}
                      </p>
                      <p className="font-heading text-xl text-off-white">ESTIMATED CLIMBING TIME</p>
                    </div>

                    {/* Secondary metrics */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-center">
                      <div>
                        <p className="font-heading text-3xl text-off-white">{result.speedKmh.toFixed(1)}</p>
                        <p className="text-foreground-subtle text-sm">Avg speed (km/h)</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl text-off-white">{Math.round(result.vam)}</p>
                        <p className="text-foreground-subtle text-sm">VAM (m/hr)</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl text-off-white">{result.wkg.toFixed(2)}</p>
                        <p className="text-foreground-subtle text-sm">W/kg</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl text-off-white">{Math.round(effectiveWatts)}</p>
                        <p className="text-foreground-subtle text-sm">Watts</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl text-off-white">{Math.round(elevationM).toLocaleString()}</p>
                        <p className="text-foreground-subtle text-sm">Elevation (m)</p>
                      </div>
                    </div>

                    {/* VAM context bar */}
                    <div className="mb-8">
                      <p className="font-heading text-xs text-foreground-muted uppercase tracking-widest mb-3">
                        VAM benchmark
                      </p>
                      <div className="relative h-6 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <motion.div
                          className="absolute left-0 top-0 h-full rounded-full bg-coral"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((result.vam / 2000) * 100, 100)}%` }}
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
                      <p className="text-foreground-muted text-xs mt-2">
                        {result.vam < 600 && "Recreational climbing pace — taking in the views."}
                        {result.vam >= 600 && result.vam < 800 && "Solid club-rider pace uphill."}
                        {result.vam >= 800 && result.vam < 1000 && "Trained amateur — structured training is showing."}
                        {result.vam >= 1000 && result.vam < 1200 && "Strong amateur — competitive on HC cols."}
                        {result.vam >= 1200 && result.vam < 1400 && "Very strong — Cat 1-2 territory on climbs."}
                        {result.vam >= 1400 && result.vam < 1600 && "Elite climbing pace — domestic pro level."}
                        {result.vam >= 1600 && result.vam < 1800 && "World Tour climbing pace — Grand Tour peloton territory."}
                        {result.vam >= 1800 && "Grand Tour attack pace — winning moves on summit finishes."}
                      </p>
                    </div>

                    {/* Famous climb comparison */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-4">YOUR POWER ON FAMOUS CLIMBS</h3>
                      <p className="text-foreground-subtle text-sm mb-4">
                        At {Math.round(effectiveWatts)} W ({result.wkg.toFixed(2)} W/kg), here&apos;s how long each climb would take:
                      </p>
                      <div className="space-y-3">
                        {result.comparisons.map((c) => (
                          <div key={c.name} className="flex items-center justify-between">
                            <div>
                              <span className="text-off-white text-sm">{c.name}</span>
                              <span className="text-foreground-subtle text-xs ml-2">
                                ({c.distanceKm} km, {c.gradientPct}%, {c.elevationM.toLocaleString()} m)
                              </span>
                            </div>
                            <span className="font-heading text-coral text-sm">{formatClimbTime(c.timeSeconds)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* What Next */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT?</h3>
                      <ul className="space-y-2">
                        <li><Link href="/tools/vam" className="text-coral hover:text-coral/80 text-sm transition-colors">Climbing Calculator (VAM) — benchmark your vertical ascent rate</Link></li>
                        <li><Link href="/tools/wkg" className="text-coral hover:text-coral/80 text-sm transition-colors">W/kg Calculator — check your power-to-weight ratio</Link></li>
                        <li><Link href="/tools/power-speed" className="text-coral hover:text-coral/80 text-sm transition-colors">Power&harr;Speed Calculator — model any gradient from watts</Link></li>
                        <li><Link href="/blog/vam-climbing-speed-explained-cyclists" className="text-coral hover:text-coral/80 text-sm transition-colors">VAM and climbing speed — the full explainer</Link></li>
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">WANT TO CLIMB FASTER?</p>
                      <p className="text-off-white font-heading text-lg mb-2">
                        A number tells you where you are. A coach gets you up the col quicker.
                      </p>
                      <p className="text-foreground-muted text-sm mb-4">
                        Targeted power-to-weight work, pacing strategy, and the structured intensity
                        that moves your W/kg — not just measures it.
                      </p>
                      <a
                        href="https://www.skool.com/roadmancycling"
                        className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                        data-track="tool_climb-time_skool"
                      >
                        Join the Community
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
                <strong className="text-off-white">Physics model:</strong> The estimator solves the standard cycling
                power equation — the same model used by Best Bike Split and race-simulation tools.
                Total power equals the sum of gravity, aerodynamic drag, and rolling resistance, all
                multiplied by speed and divided by drivetrain efficiency:
              </p>
              <p className="font-mono text-xs bg-white/5 rounded-lg p-3 border border-white/10">
                P = (m&middot;g&middot;sin&theta;&middot;v + &frac12;&middot;&rho;&middot;CdA&middot;v<sub>air</sub>&sup2;&middot;v + C<sub>rr</sub>&middot;m&middot;g&middot;cos&theta;&middot;v) / &eta;
              </p>
              <p>
                <strong className="text-off-white">Solving for speed:</strong> Given your power output, the calculator
                uses Newton-Raphson iteration to find the speed that satisfies the power equation. This converges
                in a handful of steps and gives the same result as the analytic solution on steep gradients where
                gravity dominates.
              </p>
              <p>
                <strong className="text-off-white">Default assumptions:</strong> CdA = 0.35 m&sup2; (climbing position
                on the hoods), C<sub>rr</sub> = 0.005 (standard road surface), drivetrain efficiency = 97%.
                Air density starts at 1.225 kg/m&sup3; at sea level and is adjusted for altitude using the
                International Standard Atmosphere barometric formula — roughly 12% less dense per 1,000 m of
                elevation.
              </p>
              <p>
                <strong className="text-off-white">Wind:</strong> Headwind is added to the rider&apos;s ground speed
                when calculating aerodynamic drag. On steep climbs where speeds are low, wind has a
                disproportionately large effect — a 15 km/h headwind at 12 km/h climbing speed nearly
                doubles your aero drag.
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> The model assumes constant gradient and
                steady-state power. Real climbs have variable gradient, switchbacks, and micro-descents
                that make actual times differ by 2-5% from the estimate. Temperature, road surface, tyre choice,
                and drafting are not modelled. Treat the output as a planning estimate, not a prediction.
              </p>
              <p>
                For a deeper look at VAM and how vertical speed relates to climbing ability, see the{" "}
                <Link href="/blog/vam-climbing-speed-explained-cyclists" className="text-coral hover:text-coral/80">
                  VAM and climbing speed explainer
                </Link>.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 &middot; Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="climb-time" />
      </main>
      <Footer />
    </>
  );
}
