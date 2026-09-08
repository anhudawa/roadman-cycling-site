"use client";

import { useMemo } from "react";
import { runPrediction, type PredictMode, type RaceEventType } from "@/lib/race-predictor/run";
import type { Course, RidingPosition, SurfaceType } from "@/lib/race-predictor/types";

type Drafting = "solo" | "small_group" | "large_group";

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
  /** Lightweight course profile used for the live physics simulation. */
  course: Course;
  mode: PredictMode;
  position: RidingPosition;
  surface: SurfaceType;
  drafting: Drafting;
  eventType: RaceEventType;
  drivetrainEfficiency: number;
  airTempC: number;
  windDirectionDeg: number;
}

function fmt(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function signedMinutes(seconds: number): string {
  const rounded = Math.round(seconds / 60);
  if (rounded === 0) return "±0 min";
  return `${rounded > 0 ? "+" : ""}${rounded} min`;
}

export function WhatIfSliders(props: WhatIfSlidersProps) {
  const est = useMemo(() => {
    const run = runPrediction({
      course: props.course,
      mode: props.mode,
      rider: {
        bodyMass: props.bodyMass,
        bikeMass: props.bikeMass,
        position: props.position,
        surface: props.surface,
        drafting: props.drafting,
        eventType: props.eventType,
        drivetrainEfficiency: props.drivetrainEfficiency,
        powerProfile: { ftp: props.ftp },
      },
      environment: {
        airTemperatureC: props.airTempC,
        windSpeedMs: props.windSpeed,
        windDirectionRad: (props.windDirectionDeg * Math.PI) / 180,
      },
    });

    return {
      timeS: run.result.totalTime,
      speedKmh: run.result.averageSpeed * 3.6,
      wkg: props.ftp / Math.max(40, props.bodyMass),
      averagePower: run.result.averagePower,
      normalizedPower: run.result.normalizedPower,
      confidenceLowS: run.confidence.low,
      confidenceHighS: run.confidence.high,
    };
  }, [
    props.airTempC,
    props.bikeMass,
    props.bodyMass,
    props.course,
    props.drafting,
    props.drivetrainEfficiency,
    props.eventType,
    props.ftp,
    props.mode,
    props.position,
    props.surface,
    props.windDirectionDeg,
    props.windSpeed,
  ]);

  const confidenceMinus = est.timeS - est.confidenceLowS;
  const confidencePlus = est.confidenceHighS - est.timeS;

  return (
    <div className="rounded-2xl border border-coral/25 bg-gradient-to-br from-deep-purple/45 via-charcoal to-charcoal p-5 shadow-[0_18px_70px_-35px_rgba(241,99,99,0.75)]">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <p
            className="text-[0.62rem] tracking-[0.22em] uppercase text-coral"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            LIVE PHYSICS MODEL
          </p>
          <p className="font-heading text-4xl md:text-5xl uppercase tracking-tight text-off-white leading-none mt-1 tabular-nums">
            {fmt(est.timeS)}
          </p>
          <p className="mt-2 text-xs text-foreground-muted">
            Confidence: {signedMinutes(-confidenceMinus)} / {signedMinutes(confidencePlus)} from the same engine used at submit.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
          <p
            className="text-[0.62rem] tracking-[0.18em] uppercase text-foreground-subtle"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            AVG SPEED
          </p>
          <p className="font-heading text-2xl text-off-white tabular-nums">
            {est.speedKmh.toFixed(1)}<span className="text-foreground-subtle text-base"> km/h</span>
          </p>
          <p className="text-[0.62rem] tracking-[0.15em] uppercase text-foreground-subtle mt-1">
            {est.wkg.toFixed(2)} W/kg
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <MiniStat label="Avg power" value={`${Math.round(est.averagePower)}W`} />
        <MiniStat label="Norm power" value={`${Math.round(est.normalizedPower)}W`} />
        <MiniStat label="Route" value={`${props.distanceKm.toFixed(0)}km`} />
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
          label="Wind speed"
          unit="m/s"
          value={props.windSpeed}
          min={0}
          max={12}
          step={0.5}
          onChange={props.onWindSpeed}
        />
      </div>

      <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.03] p-3">
        <p
          className="text-[0.62rem] tracking-[0.15em] uppercase text-coral mb-2"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Accuracy inputs still missing?
        </p>
        <ul className="space-y-1.5 text-xs text-foreground-muted leading-relaxed">
          <li>• Use real body/bike mass and choose the closest surface.</li>
          <li>• Open conditions for wind direction — a tailwind-only estimate is usually wrong.</li>
          <li>• Submit to save the full segment-by-segment pacing plan.</li>
        </ul>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
      <p
        className="text-[0.56rem] tracking-[0.16em] uppercase text-foreground-subtle"
        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
      >
        {label}
      </p>
      <p className="font-heading text-lg text-off-white tabular-nums">{value}</p>
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
        <span className="font-heading text-base text-off-white tabular-nums">
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
