"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  slug: string;
  baselineFtpW: number;
  baselineBodyMassKg: number;
  baselineWindMs: number;
  baselineTempC: number;
  baselinePredictedTimeS: number;
}

interface ScenarioState {
  ftpDeltaW: number;
  bodyMassDeltaKg: number;
  windSpeedMs: number;
  airTemperatureC: number;
}

interface ScenarioResp {
  totalTimeS: number;
  totalTimeDeltaS: number;
  averageSpeedKmh: number;
  averagePowerW: number;
  normalizedPowerW: number;
}

const DEFAULT_DEBOUNCE_MS = 220;

/**
 * Real-time what-if sliders. Each change debounces 220 ms then hits
 * /api/predict/[slug]/scenarios with the cumulative state. Aborts in-
 * flight requests so the user always sees the last result they asked for.
 */
export function WhatIfSliders({
  slug,
  baselineFtpW,
  baselineBodyMassKg,
  baselineWindMs,
  baselineTempC,
  baselinePredictedTimeS,
}: Props) {
  const [state, setState] = useState<ScenarioState>({
    ftpDeltaW: 0,
    bodyMassDeltaKg: 0,
    windSpeedMs: baselineWindMs,
    airTemperatureC: baselineTempC,
  });
  const [scenario, setScenario] = useState<ScenarioResp | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();
    timerRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const res = await fetch(`/api/predict/${slug}/scenarios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state),
          signal: ctrl.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as ScenarioResp;
        setScenario(data);
      } catch {
        // aborted or network — ignore
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, DEFAULT_DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, slug]);

  const isBaseline =
    state.ftpDeltaW === 0 &&
    state.bodyMassDeltaKg === 0 &&
    state.windSpeedMs === baselineWindMs &&
    state.airTemperatureC === baselineTempC;

  const deltaSeconds = scenario?.totalTimeDeltaS ?? 0;
  const deltaAbs = Math.abs(deltaSeconds);
  const deltaSign = deltaSeconds < 0 ? "−" : deltaSeconds > 0 ? "+" : "";
  const deltaColor =
    deltaSeconds < 0
      ? "text-[#3FB67A]"
      : deltaSeconds > 0
        ? "text-coral"
        : "text-off-white/70";

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <p className="text-coral text-xs uppercase tracking-[0.2em] mb-1">
            Time analysis
          </p>
          <p className="font-display text-3xl text-off-white uppercase tracking-wide leading-none">
            What if?
          </p>
        </div>
        <div className="text-right">
          <p className="text-off-white/55 text-[11px] uppercase tracking-wide mb-0.5">
            New finish
          </p>
          <div className="flex items-baseline gap-2 justify-end">
            <span
              className={`font-display text-2xl tracking-wide ${
                loading ? "opacity-60" : ""
              }`}
            >
              {scenario
                ? formatDuration(scenario.totalTimeS)
                : formatDuration(baselinePredictedTimeS)}
            </span>
            {!isBaseline && scenario && (
              <span className={`text-sm font-display tracking-wide ${deltaColor}`}>
                {deltaSign}
                {formatDelta(deltaAbs)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="Power"
          unit="W"
          baseLabel={`FTP ${baselineFtpW} W`}
          min={-60}
          max={60}
          step={5}
          value={state.ftpDeltaW}
          format={(v) => `${v >= 0 ? "+" : ""}${v} W`}
          onChange={(v) => setState((s) => ({ ...s, ftpDeltaW: v }))}
        />
        <Slider
          label="Body mass"
          unit="kg"
          baseLabel={`current ${baselineBodyMassKg.toFixed(1)} kg`}
          min={-8}
          max={8}
          step={0.5}
          value={state.bodyMassDeltaKg}
          format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)} kg`}
          onChange={(v) => setState((s) => ({ ...s, bodyMassDeltaKg: v }))}
        />
        <Slider
          label="Headwind"
          unit="m/s"
          baseLabel={`predicted ${baselineWindMs.toFixed(1)} m/s`}
          min={0}
          max={12}
          step={0.5}
          value={state.windSpeedMs}
          format={(v) => `${v.toFixed(1)} m/s`}
          onChange={(v) => setState((s) => ({ ...s, windSpeedMs: v }))}
        />
        <Slider
          label="Temperature"
          unit="°C"
          baseLabel={`predicted ${baselineTempC.toFixed(0)}°C`}
          min={-5}
          max={40}
          step={1}
          value={state.airTemperatureC}
          format={(v) => `${v.toFixed(0)}°C`}
          onChange={(v) => setState((s) => ({ ...s, airTemperatureC: v }))}
        />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-off-white/45 text-[11px]">
          Live recompute via the same physics engine that ran your prediction.
        </p>
        {!isBaseline && (
          <button
            type="button"
            onClick={() =>
              setState({
                ftpDeltaW: 0,
                bodyMassDeltaKg: 0,
                windSpeedMs: baselineWindMs,
                airTemperatureC: baselineTempC,
              })
            }
            className="text-coral text-xs uppercase tracking-wide hover:text-coral-hover transition"
          >
            Reset to baseline
          </button>
        )}
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  unit: string;
  baseLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

function Slider({
  label,
  baseLabel,
  min,
  max,
  step,
  value,
  format,
  onChange,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-off-white/70 text-xs uppercase tracking-[0.15em]">
          {label}
        </span>
        <span className="font-display text-lg text-coral leading-none">
          {format(value)}
        </span>
      </div>
      <div
        className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple via-coral to-coral-hover"
          style={{ width: `${pct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full -mt-2 appearance-none bg-transparent cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-off-white
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-coral
          [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(241,99,99,0.55)]
          [&::-webkit-slider-thumb]:cursor-grab
          [&::-webkit-slider-thumb]:active:cursor-grabbing
          [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-off-white
          [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-coral
          [&::-moz-range-thumb]:shadow-[0_0_12px_rgba(241,99,99,0.55)]
          [&::-moz-range-thumb]:cursor-grab"
      />
      <p className="text-off-white/40 text-[10px] uppercase tracking-wider mt-1.5">
        baseline · {baseLabel}
      </p>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDelta(absSeconds: number): string {
  if (absSeconds < 60) return `${Math.round(absSeconds)}s`;
  const m = Math.floor(absSeconds / 60);
  const s = Math.round(absSeconds % 60);
  if (m < 60) {
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm > 0 ? `${h}h ${mm}m` : `${h}h`;
}
