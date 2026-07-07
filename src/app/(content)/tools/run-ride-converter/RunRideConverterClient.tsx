"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import { ToolNextSteps, type ToolNextStepsPost } from "@/components/features/tools/ToolNextSteps";

// ============================================
// Run <-> Ride Equivalence Converter
// ============================================
//
// Bridges running and cycling performance using VO2max as the common
// currency. Running side uses Jack Daniels' VDOT model. Cycling side
// uses a standard FTP-to-VO2max regression. The two are connected with
// a fixed correction factor because cycling VO2max tests typically run
// 5-8% lower than running VO2max tests (less total muscle mass involved).
//
// This is a coaching estimation tool, not a lab test. Expect +/- error
// on any individual athlete — running economy and cycling efficiency
// both vary independently of VO2max.

type Direction = "run-to-ride" | "ride-to-run";
type WeightUnit = "kg" | "lbs";
type PaceUnit = "km" | "mile";
type RunInputMode = "pace" | "race";
type RaceDistance = "5k" | "10k" | "half" | "marathon";

const RACE_DISTANCES: Record<RaceDistance, { label: string; meters: number }> = {
  "5k": { label: "5K", meters: 5000 },
  "10k": { label: "10K", meters: 10000 },
  half: { label: "Half Marathon", meters: 21097.5 },
  marathon: { label: "Marathon", meters: 42195 },
};

// Cycling VO2max tests run ~5-8% lower than running VO2max tests due to
// less total muscle mass recruited. We use the midpoint of that range.
const CYCLING_VO2_CORRECTION = 0.92;

// Easy-effort duration scaling: cycling is lower-impact and more
// mechanically efficient at low intensity than running, so an easy
// ride sustains meaningfully longer than an easy run for the same
// physiological cost. 1.65x is a coaching approximation, not a derived
// constant — treat it as a rough guide, not physiology.
const EASY_DURATION_SCALE = 1.65;

// ---- Running math (Jack Daniels' VDOT model) ----

/** VO2 cost (ml/kg/min) of running at velocity v (meters/min). */
function vo2FromVelocity(v: number): number {
  return -4.6 + 0.182258 * v + 0.000104 * v * v;
}

/** Fraction of VO2max sustainable for t minutes. */
function percentVO2Max(t: number): number {
  return 0.8 + 0.1894393 * Math.exp(-0.012778 * t) + 0.2989558 * Math.exp(-0.1932605 * t);
}

/** VDOT (~running VO2max) from a velocity (m/min) held for t minutes. */
function vdotFromVelocityAndTime(v: number, t: number): number {
  return vo2FromVelocity(v) / percentVO2Max(t);
}

/**
 * Solve for race time (minutes) at a given distance that matches a
 * target VDOT, via binary search. Daniels' model has no closed-form
 * inverse, so we search over plausible race times and check how close
 * the implied VDOT is to the target.
 */
function timeForDistanceAtVDOT(distanceMeters: number, targetVDOT: number): number {
  let lo = 3; // 3 minutes - fast enough for any distance we use here
  let hi = 300; // 5 hours - slow enough for any distance we use here

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const v = distanceMeters / mid;
    const impliedVDOT = vdotFromVelocityAndTime(v, mid);
    // Slower time (higher mid) -> lower velocity -> lower implied VDOT.
    if (impliedVDOT > targetVDOT) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

function formatMinutesAsTime(totalMinutes: number): string {
  const totalSeconds = Math.round(totalMinutes * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function paceSecondsToLabel(secondsPerUnit: number): string {
  const m = Math.floor(secondsPerUnit / 60);
  const s = Math.round(secondsPerUnit % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ---- Cycling math ----

/** VO2max estimate from FTP and body weight (Storer/ACSM-style regression). */
function vo2maxFromFTP(ftpWatts: number, weightKg: number): number {
  return (10.8 * ftpWatts) / weightKg + 7;
}

/** Invert the FTP -> VO2max formula to get FTP from VO2max. */
function ftpFromVO2max(vo2max: number, weightKg: number): number {
  return (weightKg * (vo2max - 7)) / 10.8;
}

// ---- Unit helpers ----

function toKg(weight: number, unit: WeightUnit): number {
  return unit === "lbs" ? weight * 0.453592 : weight;
}

function kmToMiles(km: number): number {
  return km * 0.621371;
}

// ---- Input parsing/validation ----

function parsePaceToSecondsPerKm(paceStr: string, unit: PaceUnit): number | null {
  const match = paceStr.trim().match(/^(\d{1,2}):([0-5]?\d)$/);
  if (!match) return null;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  const totalSeconds = minutes * 60 + seconds;
  if (totalSeconds <= 0) return null;
  return unit === "mile" ? totalSeconds / 1.609344 : totalSeconds;
}

function parseRaceTimeToMinutes(timeStr: string): number | null {
  const trimmed = timeStr.trim();
  const hms = trimmed.match(/^(\d{1,2}):([0-5]?\d):([0-5]?\d)$/);
  if (hms) {
    const h = parseInt(hms[1], 10);
    const m = parseInt(hms[2], 10);
    const s = parseInt(hms[3], 10);
    return h * 60 + m + s / 60;
  }
  const ms = trimmed.match(/^(\d{1,3}):([0-5]?\d)$/);
  if (ms) {
    const m = parseInt(ms[1], 10);
    const s = parseInt(ms[2], 10);
    return m + s / 60;
  }
  return null;
}

function getWeightError(value: string, unit: WeightUnit): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Please enter a valid number";
  const kg = toKg(num, unit);
  if (kg < 35) return `Weight must be at least ${unit === "kg" ? "35kg" : "77lbs"}`;
  if (kg > 160) return `Weight must be under ${unit === "kg" ? "160kg" : "353lbs"}`;
  return null;
}

function getFtpError(value: string): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Please enter a valid number";
  if (num < 50) return "FTP must be at least 50W";
  if (num > 600) return "FTP must be under 600W";
  return null;
}

// ---- Result types ----

interface RunToRideResult {
  ftpWatts: number;
  wPerKg: number;
  runningVO2max: number;
  cyclingVO2max: number;
  easyEffortDescription: string;
  loadNote: string;
  assumptionNote: string | null;
}

interface RideToRunResult {
  cyclingVO2max: number;
  runningVO2max: number;
  vdot: number;
  raceTimes: Record<RaceDistance, number>;
  easyPaceSecondsPerKm: number;
  loadNote: string;
}

// Guard rails so a wild input can't produce a nonsense headline number.
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

interface RunRideConverterClientProps {
  /** Resolved next-step reading for each direction, supplied by the server page. */
  runToRidePosts: ToolNextStepsPost[];
  rideToRunPosts: ToolNextStepsPost[];
}

export default function RunRideConverterClient({
  runToRidePosts,
  rideToRunPosts,
}: RunRideConverterClientProps) {
  const [direction, setDirection] = useState<Direction>("run-to-ride");

  // Shared weight input
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");

  // Run -> Ride inputs
  const [runInputMode, setRunInputMode] = useState<RunInputMode>("pace");
  const [pace, setPace] = useState("");
  const [paceUnit, setPaceUnit] = useState<PaceUnit>("km");
  const [raceDistance, setRaceDistance] = useState<RaceDistance>("10k");
  const [raceTime, setRaceTime] = useState("");

  // Ride -> Run inputs
  const [ftp, setFtp] = useState("");

  const [calculated, setCalculated] = useState(false);

  const weightError = getWeightError(weight, weightUnit);
  const ftpError = getFtpError(ftp);
  const weightVal = parseFloat(weight) || 0;
  const weightKg = toKg(weightVal, weightUnit);

  const paceSecondsPerKm = runInputMode === "pace" ? parsePaceToSecondsPerKm(pace, paceUnit) : null;
  const raceTimeMinutes = runInputMode === "race" ? parseRaceTimeToMinutes(raceTime) : null;

  const canCalculateRunToRide =
    weightKg > 0 &&
    !weightError &&
    ((runInputMode === "pace" && paceSecondsPerKm !== null) ||
      (runInputMode === "race" && raceTimeMinutes !== null && raceTimeMinutes > 0));

  const ftpVal = parseFloat(ftp) || 0;
  const canCalculateRideToRun = weightKg > 0 && !weightError && ftpVal > 0 && !ftpError;

  const canCalculate = direction === "run-to-ride" ? canCalculateRunToRide : canCalculateRideToRun;

  let runToRideResult: RunToRideResult | null = null;
  let rideToRunResult: RideToRunResult | null = null;

  if (calculated && canCalculate) {
    if (direction === "run-to-ride") {
      let runningVO2max: number;
      let assumptionNote: string | null = null;

      if (runInputMode === "race" && raceTimeMinutes) {
        const distanceMeters = RACE_DISTANCES[raceDistance].meters;
        const v = distanceMeters / raceTimeMinutes; // m/min
        runningVO2max = vdotFromVelocityAndTime(v, raceTimeMinutes);
      } else if (paceSecondsPerKm) {
        const vMetersPerMin = 1000 / (paceSecondsPerKm / 60);
        // A standalone pace isn't necessarily run at VO2max effort, so we
        // assume it reflects a ~30-minute threshold/tempo effort for the
        // purpose of estimating %VO2max.
        runningVO2max = vdotFromVelocityAndTime(vMetersPerMin, 30);
        assumptionNote = "Assuming this pace reflects roughly a 30-minute threshold effort.";
      } else {
        runningVO2max = 0;
      }

      runningVO2max = clamp(runningVO2max, 25, 90);
      const cyclingVO2max = runningVO2max * CYCLING_VO2_CORRECTION;
      let ftpWatts = ftpFromVO2max(cyclingVO2max, weightKg);
      ftpWatts = clamp(ftpWatts, 40, 500);
      const wPerKg = ftpWatts / weightKg;

      let easyEffortDescription: string;
      if (wPerKg < 2.0) {
        easyEffortDescription = "Conversational Zone 2 spin — easy gear, easy breathing, could hold a chat the whole way.";
      } else if (wPerKg < 3.0) {
        easyEffortDescription = "Solid Zone 2 endurance pace — steady, all-day effort, nose breathing mostly manageable.";
      } else if (wPerKg < 4.0) {
        easyEffortDescription = "Strong Zone 2/low Zone 3 — this is a well-trained aerobic engine at an easy effort.";
      } else {
        easyEffortDescription = "High-end Zone 2 — near tempo for most riders, reflecting a very well-developed aerobic base.";
      }

      const runMinutes = 45;
      const rideMinutes = runMinutes * EASY_DURATION_SCALE;

      runToRideResult = {
        ftpWatts: Math.round(ftpWatts),
        wPerKg,
        runningVO2max,
        cyclingVO2max,
        easyEffortDescription,
        loadNote: `A ${runMinutes}-min easy run ≈ ${Math.round(rideMinutes)}-min easy ride, aerobically.`,
        assumptionNote,
      };
    } else {
      let cyclingVO2max = vo2maxFromFTP(ftpVal, weightKg);
      cyclingVO2max = clamp(cyclingVO2max, 20, 85);
      const runningVO2max = cyclingVO2max / CYCLING_VO2_CORRECTION;
      const vdot = clamp(runningVO2max, 25, 90);

      const raceTimes = {} as Record<RaceDistance, number>;
      (Object.keys(RACE_DISTANCES) as RaceDistance[]).forEach((key) => {
        raceTimes[key] = timeForDistanceAtVDOT(RACE_DISTANCES[key].meters, vdot);
      });

      // Easy pace heuristic: roughly marathon pace + 75 sec/km (midpoint
      // of the commonly used 60-90 sec/km "easy" offset).
      const marathonMinutes = raceTimes.marathon;
      const marathonSecondsPerKm = (marathonMinutes * 60) / (RACE_DISTANCES.marathon.meters / 1000);
      const easyPaceSecondsPerKm = marathonSecondsPerKm + 75;

      const rideMinutes = 60;
      const runMinutes = rideMinutes / EASY_DURATION_SCALE;

      rideToRunResult = {
        cyclingVO2max,
        runningVO2max,
        vdot,
        raceTimes,
        easyPaceSecondsPerKm,
        loadNote: `A ${rideMinutes}-min easy ride ≈ ${Math.round(runMinutes)}-min easy run, aerobically.`,
      };
    }
  }

  const handleDirectionChange = (d: Direction) => {
    setDirection(d);
    setCalculated(false);
  };

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              RUN↔RIDE EQUIVALENCE CONVERTER
            </h1>
            <p className="text-foreground-muted text-lg">
              Convert a running pace or race time into an equivalent cycling FTP — or a bike FTP into an
              equivalent running performance. VO2max is the bridge.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
              {/* Direction toggle */}
              <div className="flex gap-3 mb-6" role="tablist" aria-label="Conversion direction">
                <button
                  role="tab"
                  aria-selected={direction === "run-to-ride"}
                  aria-label="Convert running performance to cycling FTP"
                  onClick={() => handleDirectionChange("run-to-ride")}
                  className={`flex-1 min-h-[44px] py-2.5 rounded-lg font-heading text-sm tracking-wider transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-coral ${direction === "run-to-ride" ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                >
                  RUN → RIDE
                </button>
                <button
                  role="tab"
                  aria-selected={direction === "ride-to-run"}
                  aria-label="Convert cycling FTP to running performance"
                  onClick={() => handleDirectionChange("ride-to-run")}
                  className={`flex-1 min-h-[44px] py-2.5 rounded-lg font-heading text-sm tracking-wider transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-coral ${direction === "ride-to-run" ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                >
                  RIDE → RUN
                </button>
              </div>

              {/* Weight input (shared) */}
              <div className="mb-6">
                <label htmlFor="weight-input" className="block font-heading text-sm text-off-white mb-2">
                  BODY WEIGHT
                </label>
                <div className="flex gap-3">
                  <input
                    id="weight-input"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    aria-label="Your body weight"
                    aria-invalid={!!weightError}
                    placeholder={weightUnit === "kg" ? "e.g. 72" : "e.g. 159"}
                    value={weight}
                    onChange={(e) => { setWeight(e.target.value); setCalculated(false); }}
                    className={`flex-1 bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${weightError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                  />
                  <div className="flex rounded-lg border border-white/10 overflow-hidden shrink-0">
                    <button
                      type="button"
                      aria-pressed={weightUnit === "kg"}
                      onClick={() => { setWeightUnit("kg"); setCalculated(false); }}
                      className={`px-4 min-h-[44px] font-heading text-sm transition-colors cursor-pointer ${weightUnit === "kg" ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                    >
                      KG
                    </button>
                    <button
                      type="button"
                      aria-pressed={weightUnit === "lbs"}
                      onClick={() => { setWeightUnit("lbs"); setCalculated(false); }}
                      className={`px-4 min-h-[44px] font-heading text-sm transition-colors cursor-pointer ${weightUnit === "lbs" ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                    >
                      LBS
                    </button>
                  </div>
                </div>
                {weightError && <p className="text-red-400 text-xs mt-2" role="alert">{weightError}</p>}
              </div>

              {direction === "run-to-ride" ? (
                <>
                  {/* Run input mode sub-toggle */}
                  <div className="flex gap-3 mb-4" role="tablist" aria-label="Running input type">
                    <button
                      role="tab"
                      aria-selected={runInputMode === "pace"}
                      onClick={() => { setRunInputMode("pace"); setCalculated(false); }}
                      className={`flex-1 min-h-[40px] py-2 rounded-lg font-heading text-xs tracking-wider transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-coral ${runInputMode === "pace" ? "bg-white/15 text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                    >
                      USE A PACE
                    </button>
                    <button
                      role="tab"
                      aria-selected={runInputMode === "race"}
                      onClick={() => { setRunInputMode("race"); setCalculated(false); }}
                      className={`flex-1 min-h-[40px] py-2 rounded-lg font-heading text-xs tracking-wider transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-coral ${runInputMode === "race" ? "bg-white/15 text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                    >
                      USE A RACE TIME
                    </button>
                  </div>

                  {runInputMode === "pace" ? (
                    <div className="mb-6">
                      <label htmlFor="pace-input" className="block font-heading text-sm text-off-white mb-2">
                        RUNNING PACE (MM:SS)
                      </label>
                      <div className="flex gap-3">
                        <input
                          id="pace-input"
                          type="text"
                          inputMode="numeric"
                          aria-label="Your running pace, minutes and seconds"
                          placeholder={paceUnit === "km" ? "e.g. 5:00" : "e.g. 8:03"}
                          value={pace}
                          onChange={(e) => { setPace(e.target.value); setCalculated(false); }}
                          onKeyDown={(e) => { if (e.key === "Enter" && canCalculate) setCalculated(true); }}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none focus:border-coral transition-colors"
                        />
                        <div className="flex rounded-lg border border-white/10 overflow-hidden shrink-0">
                          <button
                            type="button"
                            aria-pressed={paceUnit === "km"}
                            onClick={() => { setPaceUnit("km"); setCalculated(false); }}
                            className={`px-4 min-h-[44px] font-heading text-sm transition-colors cursor-pointer ${paceUnit === "km" ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                          >
                            /KM
                          </button>
                          <button
                            type="button"
                            aria-pressed={paceUnit === "mile"}
                            onClick={() => { setPaceUnit("mile"); setCalculated(false); }}
                            className={`px-4 min-h-[44px] font-heading text-sm transition-colors cursor-pointer ${paceUnit === "mile" ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                          >
                            /MI
                          </button>
                        </div>
                      </div>
                      {pace && paceSecondsPerKm === null && (
                        <p className="text-red-400 text-xs mt-2" role="alert">Enter pace as MM:SS, e.g. 5:00</p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="block font-heading text-sm text-off-white mb-2">RACE DISTANCE &amp; TIME</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          aria-label="Race distance"
                          value={raceDistance}
                          onChange={(e) => { setRaceDistance(e.target.value as RaceDistance); setCalculated(false); }}
                          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider focus:outline-none focus:border-coral transition-colors sm:w-48"
                        >
                          {(Object.keys(RACE_DISTANCES) as RaceDistance[]).map((key) => (
                            <option key={key} value={key} className="bg-charcoal">
                              {RACE_DISTANCES[key].label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          inputMode="numeric"
                          aria-label="Race finish time"
                          placeholder="e.g. 45:00 or 3:45:00"
                          value={raceTime}
                          onChange={(e) => { setRaceTime(e.target.value); setCalculated(false); }}
                          onKeyDown={(e) => { if (e.key === "Enter" && canCalculate) setCalculated(true); }}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none focus:border-coral transition-colors"
                        />
                      </div>
                      {raceTime && raceTimeMinutes === null && (
                        <p className="text-red-400 text-xs mt-2" role="alert">Enter time as MM:SS or HH:MM:SS</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="mb-6">
                  <label htmlFor="ftp-input" className="block font-heading text-sm text-off-white mb-2">
                    FTP (WATTS)
                  </label>
                  <input
                    id="ftp-input"
                    type="number"
                    inputMode="numeric"
                    min="50"
                    max="600"
                    aria-label="Your Functional Threshold Power in watts"
                    aria-invalid={!!ftpError}
                    placeholder="e.g. 250"
                    value={ftp}
                    onChange={(e) => { setFtp(e.target.value); setCalculated(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && canCalculate) setCalculated(true); }}
                    className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${ftpError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                  />
                  {ftpError && <p className="text-red-400 text-xs mt-2" role="alert">{ftpError}</p>}
                </div>
              )}

              <Button onClick={() => canCalculate && setCalculated(true)} size="lg" className="w-full sm:w-auto">
                Calculate
              </Button>
            </div>

            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && runToRideResult && direction === "run-to-ride" && (
                  <motion.div
                    key="run-to-ride-result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-3"
                  >
                    <h2 className="font-heading text-xl sm:text-2xl text-off-white mb-4">
                      YOUR EQUIVALENT CYCLING NUMBERS
                    </h2>

                    <div className="bg-background-elevated rounded-lg border border-white/5 p-6 text-center mb-4">
                      <p className="font-heading text-5xl md:text-6xl text-coral mb-1">{runToRideResult.ftpWatts}W</p>
                      <p className="text-foreground-muted text-sm">
                        Estimated FTP — {runToRideResult.wPerKg.toFixed(2)} W/kg
                      </p>
                    </div>

                    <div className="bg-background-elevated rounded-lg border border-white/5 p-4">
                      <p className="font-heading text-off-white text-sm mb-1">EQUIVALENT EASY EFFORT</p>
                      <p className="text-foreground-muted text-sm">{runToRideResult.easyEffortDescription}</p>
                    </div>

                    <div className="bg-background-elevated rounded-lg border border-white/5 p-4">
                      <p className="font-heading text-off-white text-sm mb-1">TRAINING LOAD EQUIVALENCE</p>
                      <p className="text-foreground-muted text-sm">{runToRideResult.loadNote}</p>
                      <p className="text-foreground-subtle text-xs mt-1">
                        Approximation — cycling is lower-impact, so an easy ride can run longer than an easy run for
                        similar aerobic cost.
                      </p>
                    </div>

                    <div className="bg-background-elevated rounded-lg border border-white/5 p-4">
                      <p className="font-heading text-off-white text-sm mb-1">HEART RATE NOTE</p>
                      <p className="text-foreground-muted text-sm">
                        Cycling heart rate typically runs 5-10 bpm lower than running heart rate at an equivalent
                        effort — less total muscle mass and no impact loading. Don&apos;t use your running zones
                        directly on the bike.
                      </p>
                    </div>

                    {runToRideResult.assumptionNote && (
                      <div className="bg-background-elevated rounded-lg border border-white/5 p-4">
                        <p className="font-heading text-off-white text-sm mb-1">ASSUMPTION USED</p>
                        <p className="text-foreground-muted text-sm">{runToRideResult.assumptionNote}</p>
                      </div>
                    )}

                    <CaveatsList />

                    <LearnMoreBlock direction="run-to-ride" />
                    <CoachingCTA />
                    <ToolNextSteps
                      posts={runToRidePosts}
                      dataTrack="tool_run_ride_next_steps_run_to_ride"
                    />
                  </motion.div>
                )}

                {calculated && rideToRunResult && direction === "ride-to-run" && (
                  <motion.div
                    key="ride-to-run-result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-3"
                  >
                    <h2 className="font-heading text-xl sm:text-2xl text-off-white mb-4">
                      YOUR EQUIVALENT RUNNING NUMBERS
                    </h2>

                    <div className="bg-background-elevated rounded-lg border border-white/5 p-6 text-center mb-4">
                      <p className="font-heading text-5xl md:text-6xl text-coral mb-1">
                        {rideToRunResult.vdot.toFixed(1)}
                      </p>
                      <p className="text-foreground-muted text-sm">Estimated VDOT (running VO2max proxy)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {(Object.keys(RACE_DISTANCES) as RaceDistance[]).map((key) => (
                        <div key={key} className="bg-background-elevated rounded-lg border border-white/5 p-4 text-center">
                          <p className="font-heading text-off-white text-sm mb-1">{RACE_DISTANCES[key].label}</p>
                          <p className="font-heading text-coral text-lg tracking-wider">
                            {formatMinutesAsTime(rideToRunResult.raceTimes[key])}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-background-elevated rounded-lg border border-white/5 p-4">
                      <p className="font-heading text-off-white text-sm mb-1">EQUIVALENT EASY RUNNING PACE</p>
                      <p className="text-foreground-muted text-sm">
                        {paceSecondsToLabel(rideToRunResult.easyPaceSecondsPerKm)} /km ({paceSecondsToLabel(rideToRunResult.easyPaceSecondsPerKm * 1.609344)} /mile)
                      </p>
                    </div>

                    <div className="bg-background-elevated rounded-lg border border-white/5 p-4">
                      <p className="font-heading text-off-white text-sm mb-1">TRAINING LOAD EQUIVALENCE</p>
                      <p className="text-foreground-muted text-sm">{rideToRunResult.loadNote}</p>
                      <p className="text-foreground-subtle text-xs mt-1">
                        Approximation — running carries more impact stress, so match durations conservatively at first.
                      </p>
                    </div>

                    <div className="bg-background-elevated rounded-lg border border-white/5 p-4">
                      <p className="font-heading text-off-white text-sm mb-1">HEART RATE NOTE</p>
                      <p className="text-foreground-muted text-sm">
                        Running heart rate typically runs 5-10 bpm higher than cycling heart rate at an equivalent
                        effort. Don&apos;t use your cycling zones directly for running.
                      </p>
                    </div>

                    <CaveatsList />

                    <LearnMoreBlock direction="ride-to-run" />
                    <CoachingCTA />
                    <ToolNextSteps
                      posts={rideToRunPosts}
                      dataTrack="tool_run_ride_next_steps_ride_to_run"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* Methodology */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              METHODOLOGY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">Running side:</strong> Uses Jack Daniels&apos; VDOT model. Running
                velocity is converted to an oxygen cost (VO2), then adjusted for how long that pace can be held to
                estimate VDOT — a proxy for running VO2max.
              </p>
              <p>
                <strong className="text-off-white">Cycling side:</strong> FTP and VO2max are linked with a standard
                regression: VO2max ≈ (10.8 × FTP ÷ weight) + 7. We invert this formula to go from VO2max to FTP.
              </p>
              <p>
                <strong className="text-off-white">The bridge:</strong> Cycling VO2max tests typically read 5-8%
                lower than running VO2max tests for the same athlete, because cycling recruits less total muscle
                mass. We use a 0.92 correction factor to convert between the two.
              </p>
              <p>
                <strong className="text-off-white">Training load:</strong> Easy-effort duration is scaled by 1.65x
                between the sports — a coaching approximation reflecting lower impact stress and different economy
                at low intensity on the bike versus on foot.
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> This tool estimates aerobic-capacity
                transfer. It does not — and cannot — account for running economy, cycling efficiency, bike fit,
                terrain, or sport-specific neuromuscular skill. Use it to set a starting point, not a target.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 · Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="run-ride-converter" />
      </main>
      <Footer />
    </>
  );
}

function CaveatsList() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 mt-2">
      <ul className="space-y-1.5 text-foreground-subtle text-xs leading-relaxed">
        <li>These are estimates based on aerobic capacity transfer. Individual variation is significant.</li>
        <li>
          Running economy and cycling efficiency vary widely — two athletes with the same VO2max can have very
          different race times.
        </li>
        <li>Use these as rough guides, not precise predictions.</li>
      </ul>
    </div>
  );
}

function LearnMoreBlock({ direction }: { direction: Direction }) {
  return (
    <motion.div
      className="mt-8 rounded-xl border border-white/10 p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.4 }}
    >
      <h3 className="font-heading text-lg text-off-white mb-3">LEARN MORE</h3>
      <ul className="space-y-2">
        <li><Link href="/tools/ftp-zones" className="text-coral hover:text-coral/80 text-sm transition-colors">FTP Zone Calculator</Link></li>
        <li><Link href="/tools/hr-zones" className="text-coral hover:text-coral/80 text-sm transition-colors">Heart Rate Zone Calculator</Link></li>
        <li><Link href="/tools/wkg" className="text-coral hover:text-coral/80 text-sm transition-colors">W/kg Calculator</Link></li>
        {direction === "ride-to-run" ? (
          <li><Link href="/tools/race-predictor" className="text-coral hover:text-coral/80 text-sm transition-colors">Race Time Predictor (cycling)</Link></li>
        ) : (
          <li><Link href="/topics/ftp-training" className="text-coral hover:text-coral/80 text-sm transition-colors">FTP Training topic hub →</Link></li>
        )}
      </ul>
    </motion.div>
  );
}

function CoachingCTA() {
  return (
    <motion.div
      className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.5 }}
    >
      <p className="font-heading text-coral text-xs tracking-widest mb-2">WANT A PLAN BUILT AROUND THESE NUMBERS?</p>
      <p className="text-off-white font-heading text-lg md:text-xl mb-2">Coaching builds your week around your real numbers, not estimates.</p>
      <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">$195/month. 7-day free trial.</p>
      <a href="/apply" className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all" data-track="tool_run_ride_apply">
        Apply for Coaching →
      </a>
    </motion.div>
  );
}
