"use client";

import { useMemo } from "react";

interface WhatIfSlidersProps {
  ftp: number;
  bodyMass: number;
  bikeMass: number;
  windSpeed: number;
  onFtp: (v: number) => void;
  onBodyMass: (v: number) => void;
  onBikeMass: (v: number) => void;
  onWindSpeed: (v: number) => void;
  /** Course distance in km. */
  distanceKm: number;
  /** Course elevation gain in metres. */
  elevationGainM: number;
}

/**
 * Quick client-side speed/time estimator based on a steady-state W/kg
 * approximation. Not the physics engine — purely directional feedback so
 * users see the effect of their inputs in real time before they submit.
 */
function quickEstimate(args: {
  ftp: number;
  bodyMass: number;
  bikeMass: number;
  windSpeed: number;
  distanceKm: number;
  elevationGainM: number;
}): { timeS: number; speedKmh: number; wkg: number } {
  const { ftp, bodyMass, bikeMass, windSpeed, distanceKm, elevationGainM } = args;
  const totalMass = Math.max(40, bodyMass + bikeMass);
  const wkg = ftp / Math.max(40, bodyMass);
  const sustained = ftp * 0.78;

  // Crude flat-equivalent speed from sustained power. Empirical curve fitted
  // to give ~32 km/h at 200 W on a 75 kg system.
  const flatBaseKmh = 17 + (sustained / totalMass) * 5.6;

  // Climbing penalty: every 1000m of gain at 5% reduces avg speed by ~3 km/h.
  const climbPerKm = elevationGainM / Math.max(1, distanceKm);
  const climbPenalty = climbPerKm * 0.18;

  // Headwind penalty.
  const windPenalty = Math.max(0, windSpeed) * 0.7;

  const speedKmh = Math.max(10, flatBaseKmh - climbPenalty - windPenalty);
  const timeS = (distanceKm / speedKmh) * 3600;
  return { timeS, speedKmh, wkg };
}

function fmt(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function WhatIfSliders(props: WhatIfSlidersProps) {
  const est = useMemo(
    () =>
      quickEstimate({
        ftp: props.ftp,
        bodyMass: props.bodyMass,
        bikeMass: props.bikeMass,
        windSpeed: props.windSpeed,
        distanceKm: props.distanceKm,
        elevationGainM: props.elevationGainM,
      }),
    [props.ftp, props.bodyMass, props.bikeMass, props.windSpeed, props.distanceKm, props.elevationGainM],
  );

  return (
    <div className="rounded-xl border border-white/8 bg-gradient-to-br from-deep-purple/30 to-charcoal p-5">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <p
            className="text-[0.62rem] tracking-[0.22em] uppercase text-coral"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            LIVE ESTIMATE — WHAT-IF
          </p>
          <p className="font-heading text-3xl md:text-4xl uppercase tracking-tight text-off-white leading-none mt-1">
            {fmt(est.timeS)}
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-[0.62rem] tracking-[0.18em] uppercase text-foreground-subtle"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            AVG SPEED
          </p>
          <p className="font-heading text-2xl text-off-white">
            {est.speedKmh.toFixed(1)}<span className="text-foreground-subtle text-base"> km/h</span>
          </p>
          <p className="text-[0.62rem] tracking-[0.15em] uppercase text-foreground-subtle mt-1">
            {est.wkg.toFixed(2)} W/kg
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Slider
          label="FTP"
          unit="W"
          value={props.ftp}
          min={120}
          max={420}
          step={5}
          onChange={props.onFtp}
        />
        <Slider
          label="Rider mass"
          unit="kg"
          value={props.bodyMass}
          min={45}
          max={120}
          step={0.5}
          onChange={props.onBodyMass}
        />
        <Slider
          label="Bike mass"
          unit="kg"
          value={props.bikeMass}
          min={5.5}
          max={15}
          step={0.1}
          onChange={props.onBikeMass}
        />
        <Slider
          label="Headwind"
          unit="m/s"
          value={props.windSpeed}
          min={0}
          max={12}
          step={0.5}
          onChange={props.onWindSpeed}
        />
      </div>

      <p
        className="mt-4 pt-3 border-t border-white/5 text-[0.62rem] tracking-[0.15em] uppercase text-foreground-subtle"
        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
      >
        Directional only · Submit for the full physics-grade prediction
      </p>
    </div>
  );
}

interface SliderProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

function Slider({ label, unit, value, min, max, step, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const id = `slider-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label
          htmlFor={id}
          className="text-[0.65rem] tracking-[0.18em] uppercase text-foreground-muted"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {label}
        </label>
        <span
          className="font-heading text-base text-off-white tabular-nums"
        >
          {Number.isInteger(step) ? Math.round(value) : value.toFixed(1)}
          <span className="text-foreground-subtle text-xs ml-1">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 appearance-none cursor-pointer rounded-full bg-white/10 focus:outline-none focus:ring-2 focus:ring-coral/40"
        style={{
          background: `linear-gradient(to right, #F16363 0%, #F16363 ${pct}%, rgba(255,255,255,0.10) ${pct}%, rgba(255,255,255,0.10) 100%)`,
        }}
      />
    </div>
  );
}
