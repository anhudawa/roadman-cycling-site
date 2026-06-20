"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import { CDA_BY_POSITION, CRR_BY_SURFACE } from "@/lib/race-predictor/constants";
import {
  quickEstimate,
  formatDuration,
  type QuickEstimateResult,
} from "@/lib/race-predictor/quick-estimate";
import type { RidingPosition, SurfaceType } from "@/lib/race-predictor/types";

const SKOOL_URL = "https://www.skool.com/roadmancycling";

const SURFACES: { value: SurfaceType; label: string }[] = [
  { value: "tarmac_smooth", label: "Smooth tarmac" },
  { value: "tarmac_mixed", label: "Mixed tarmac" },
  { value: "tarmac_rough", label: "Rough tarmac" },
  { value: "chip_seal", label: "Chip seal" },
  { value: "gravel_smooth", label: "Smooth gravel" },
  { value: "gravel_rough", label: "Rough gravel" },
  { value: "cobbles", label: "Cobbles" },
];

const POSITIONS: { value: RidingPosition; label: string }[] = [
  { value: "tt_bars", label: "TT / aero bars" },
  { value: "aero_drops", label: "Aero, in the drops" },
  { value: "aero_hoods", label: "Aero, on the hoods" },
  { value: "endurance_hoods", label: "Endurance, on the hoods" },
  { value: "standard_hoods", label: "Upright, on the hoods" },
  { value: "climbing", label: "Climbing / sitting up" },
];

const inputClass =
  "w-full bg-white/5 border border-white/10 focus:border-coral rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors";
const selectClass =
  "w-full bg-white/5 border border-white/10 focus:border-coral rounded-lg px-4 py-3 text-off-white text-base focus:outline-none transition-colors appearance-none";
const labelClass = "block font-heading text-sm text-off-white mb-2";

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

export default function RacePredictorPage() {
  const [riderWeight, setRiderWeight] = useState("75");
  const [bikeWeight, setBikeWeight] = useState("8");
  const [power, setPower] = useState("");
  const [distance, setDistance] = useState("");
  const [elevation, setElevation] = useState("");
  const [surface, setSurface] = useState<SurfaceType>("tarmac_smooth");
  const [position, setPosition] = useState<RidingPosition>("aero_hoods");
  const [result, setResult] = useState<QuickEstimateResult | null>(null);

  const riderVal = parseFloat(riderWeight) || 0;
  const bikeVal = parseFloat(bikeWeight) || 0;
  const powerVal = parseFloat(power) || 0;
  const distVal = parseFloat(distance) || 0;
  const elevVal = parseFloat(elevation) || 0;
  const crr = CRR_BY_SURFACE[surface];
  const cda = CDA_BY_POSITION[position];

  const canCalculate = riderVal > 0 && bikeVal > 0 && powerVal > 0 && distVal > 0;

  function calculate() {
    if (!canCalculate) return;
    setResult(
      quickEstimate({
        riderMass: riderVal,
        bikeMass: bikeVal,
        power: powerVal,
        distanceKm: distVal,
        elevationGainM: elevVal,
        crr,
        cda,
      }),
    );
  }

  function reset() {
    setResult(null);
  }

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
              RACE TIME PREDICTOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Real physics — gravity, rolling resistance, aero drag, drivetrain
              loss. Enter your numbers and the course. See your finish time.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-6 md:p-8 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Field id="rider-weight" label="RIDER WEIGHT (KG)">
                  <input
                    id="rider-weight"
                    type="number"
                    inputMode="decimal"
                    min="35"
                    max="160"
                    step="0.1"
                    aria-label="Rider body weight in kilograms"
                    value={riderWeight}
                    onChange={(e) => {
                      setRiderWeight(e.target.value);
                      reset();
                    }}
                    className={inputClass}
                  />
                </Field>
                <Field id="bike-weight" label="BIKE + KIT (KG)">
                  <input
                    id="bike-weight"
                    type="number"
                    inputMode="decimal"
                    min="4"
                    max="25"
                    step="0.1"
                    aria-label="Bike and kit weight in kilograms"
                    value={bikeWeight}
                    onChange={(e) => {
                      setBikeWeight(e.target.value);
                      reset();
                    }}
                    className={inputClass}
                  />
                </Field>
                <Field id="power" label="POWER / FTP (WATTS)" hint="Average power you can hold for the effort.">
                  <input
                    id="power"
                    type="number"
                    inputMode="numeric"
                    min="60"
                    max="600"
                    aria-label="Average power or FTP in watts"
                    placeholder="e.g. 250"
                    value={power}
                    onChange={(e) => {
                      setPower(e.target.value);
                      reset();
                    }}
                    className={inputClass}
                  />
                </Field>
                <Field id="distance" label="DISTANCE (KM)">
                  <input
                    id="distance"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    max="1200"
                    step="0.1"
                    aria-label="Course distance in kilometres"
                    placeholder="e.g. 120"
                    value={distance}
                    onChange={(e) => {
                      setDistance(e.target.value);
                      reset();
                    }}
                    className={inputClass}
                  />
                </Field>
                <Field id="elevation" label="ELEVATION GAIN (M)">
                  <input
                    id="elevation"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="30000"
                    aria-label="Total elevation gain in metres"
                    placeholder="e.g. 2000"
                    value={elevation}
                    onChange={(e) => {
                      setElevation(e.target.value);
                      reset();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canCalculate) calculate();
                    }}
                    className={inputClass}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field id="surface" label="SURFACE" hint={`Crr ${crr.toFixed(4)}`}>
                    <select
                      id="surface"
                      aria-label="Road surface, sets rolling resistance"
                      value={surface}
                      onChange={(e) => {
                        setSurface(e.target.value as SurfaceType);
                        reset();
                      }}
                      className={selectClass}
                    >
                      {SURFACES.map((s) => (
                        <option key={s.value} value={s.value} className="bg-charcoal">
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="position" label="POSITION" hint={`CdA ${cda.toFixed(2)} m²`}>
                    <select
                      id="position"
                      aria-label="Riding position, sets aerodynamic drag area"
                      value={position}
                      onChange={(e) => {
                        setPosition(e.target.value as RidingPosition);
                        reset();
                      }}
                      className={selectClass}
                    >
                      {POSITIONS.map((p) => (
                        <option key={p.value} value={p.value} className="bg-charcoal">
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
              <Button onClick={calculate} size="lg" className="w-full" disabled={!canCalculate}>
                Predict My Time
              </Button>
              {!canCalculate && !result && (
                <p className="text-foreground-subtle text-xs text-center mt-3">
                  Enter your power and distance to see your finish time.
                </p>
              )}
            </div>

            <div aria-live="polite" aria-atomic="false">
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key={`${riderVal}-${bikeVal}-${powerVal}-${distVal}-${elevVal}-${surface}-${position}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Free preview */}
                  <div className="text-center mb-8">
                    <p className="text-coral text-xs font-body font-medium uppercase tracking-widest mb-3">
                      Estimated finish time
                    </p>
                    <p className="font-heading text-6xl md:text-8xl text-coral mb-2 tabular-nums">
                      {formatDuration(result.totalTimeSec)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
                      <p className="font-heading text-4xl md:text-5xl text-off-white tabular-nums">
                        {result.avgSpeedKmh.toFixed(1)}
                      </p>
                      <p className="text-foreground-muted text-sm mt-1">km/h average</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
                      <p className="font-heading text-4xl md:text-5xl text-off-white tabular-nums">
                        {Math.round(result.avgPowerW)}
                      </p>
                      <p className="text-foreground-muted text-sm mt-1">watts average</p>
                    </div>
                  </div>

                  {/* Gated detail */}
                  <div className="relative rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 overflow-hidden">
                    <div className="flex items-center gap-2 mb-5">
                      <LockIcon />
                      <p className="font-heading text-coral text-xs tracking-widest">
                        YOUR FULL RACE PLAN
                      </p>
                    </div>

                    <ul className="space-y-4 mb-7" aria-hidden="true">
                      <LockedRow
                        title="Per-segment analysis"
                        teaser={`Climb-and-descent split on your modelled ${result.climbGradientPct.toFixed(1)}% average gradient — speed, time, and watts for each.`}
                      />
                      <LockedRow
                        title="Pacing strategy"
                        teaser="The exact climb / flat / descent power targets that take time off this number without raising your average."
                      />
                      <LockedRow
                        title="Fuelling timing"
                        teaser="Carbs per hour, bottles, and gels mapped to your predicted duration — so you don't blow up at the worst moment."
                      />
                    </ul>

                    <p className="text-off-white font-heading text-lg mb-5 leading-snug">
                      Get the full breakdown — plus coaching, training plans, and a
                      community of serious riders — inside Roadman.
                    </p>
                    <a
                      href={SKOOL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track="tool_race_predictor_skool"
                      className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                    >
                      Get the Full Plan →
                    </a>
                    <p className="text-foreground-subtle text-xs mt-4">
                      Free preview above is yours to keep. Pacing, fuelling, and
                      per-segment detail open in the community.
                    </p>
                  </div>

                  <p className="text-foreground-subtle text-xs text-center mt-6">
                    Modelled with still air at sea-level density and a constant
                    power output. For profile-level precision,{" "}
                    <Link href="/predict" className="text-coral hover:text-coral/80 transition-colors">
                      upload your GPX to the full predictor
                    </Link>
                    .
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </Container>
        </Section>

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
                <strong className="text-off-white">The physics:</strong> The tool
                solves the cycling power-balance equation for steady-state speed{" "}
                <em>v</em>: P·η = (m·g·sinθ + Crr·m·g·cosθ + ½·ρ·CdA·v²)·v. That is
                the power lost to gravity, rolling resistance, and aerodynamic drag,
                divided back through the drivetrain (η = 0.97). The same solver runs
                the full GPX predictor at <Link href="/predict" className="text-coral hover:text-coral/80 transition-colors">/predict</Link>.
              </p>
              <p>
                <strong className="text-off-white">The course model:</strong> With
                only distance and total ascent, the route is modelled as half climbing
                and half descending at an average gradient of 2 × (ascent ÷ distance).
                This captures the asymmetry that matters — aero and rolling losses mean
                climbing costs more time than descending gives back, so a hilly route
                is slower than a flat one of equal distance.
              </p>
              <p>
                <strong className="text-off-white">Assumptions:</strong> still air,
                sea-level air density (1.225 kg/m³), and a constant power output. Wind,
                altitude, drafting, and fatigue are not modelled, so treat the result
                as a strong estimate rather than a guarantee.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: June 2026 · Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="race-predictor" />
      </main>
      <Footer />
    </>
  );
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-coral"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LockedRow({ title, teaser }: { title: string; teaser: string }) {
  return (
    <li className="flex gap-3">
      <span className="text-coral shrink-0 mt-1">
        <LockIcon />
      </span>
      <div>
        <p className="font-heading text-off-white text-sm uppercase tracking-wide">
          {title}
        </p>
        <p className="text-foreground-muted text-sm leading-relaxed select-none blur-[1.5px]">
          {teaser}
        </p>
      </div>
    </li>
  );
}
