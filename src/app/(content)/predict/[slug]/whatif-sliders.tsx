"use client";

import { useMemo, useState, useTransition } from "react";
import { simulateCourse } from "@/lib/race-predictor/engine";
import type {
  Course,
  Environment,
  RiderProfile,
} from "@/lib/race-predictor/types";

interface Props {
  course: Course;
  rider: RiderProfile;
  environment: Environment;
  /** The original predicted time (s). Shown as the top reference. */
  baselineTimeS: number;
  /** Constant power (W) used to drive the constant-pacing simulation. */
  baselinePower: number;
}

interface SliderSpec {
  key: SliderKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  /** How many decimals to show in the readout. */
  decimals: number;
  /** Format the delta value (e.g. "+5W", "-0.005 m²"). */
  formatDelta: (delta: number) => string;
}

type SliderKey = "power" | "mass" | "cda" | "crr" | "wind";

const SLIDER_SPECS: SliderSpec[] = [
  {
    key: "power",
    label: "Power",
    unit: "W",
    min: -25,
    max: 25,
    step: 1,
    decimals: 0,
    formatDelta: (d) => `${d > 0 ? "+" : ""}${d.toFixed(0)} W`,
  },
  {
    key: "mass",
    label: "Body mass",
    unit: "kg",
    min: -5,
    max: 5,
    step: 0.5,
    decimals: 1,
    formatDelta: (d) => `${d > 0 ? "+" : ""}${d.toFixed(1)} kg`,
  },
  {
    key: "cda",
    label: "CdA",
    unit: "m²",
    min: -0.05,
    max: 0.05,
    step: 0.005,
    decimals: 3,
    formatDelta: (d) => `${d > 0 ? "+" : ""}${d.toFixed(3)} m²`,
  },
  {
    key: "crr",
    label: "Crr",
    unit: "",
    min: -0.001,
    max: 0.001,
    step: 0.0001,
    decimals: 4,
    formatDelta: (d) => `${d > 0 ? "+" : ""}${d.toFixed(4)}`,
  },
  {
    key: "wind",
    label: "Wind speed",
    unit: "m/s",
    min: -8,
    max: 8,
    step: 0.5,
    decimals: 1,
    formatDelta: (d) => `${d > 0 ? "+" : ""}${d.toFixed(1)} m/s`,
  },
];

type DeltaState = Record<SliderKey, number>;

const ZERO_DELTAS: DeltaState = {
  power: 0,
  mass: 0,
  cda: 0,
  crr: 0,
  wind: 0,
};

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTimeDelta(deltaS: number): string {
  if (!Number.isFinite(deltaS)) return "—";
  const sign = deltaS < 0 ? "-" : deltaS > 0 ? "+" : "±";
  const abs = Math.abs(deltaS);
  const m = Math.floor(abs / 60);
  const s = Math.floor(abs % 60);
  return `${sign}${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Run a single what-if simulation given current delta state. Builds an
 * adjusted rider/environment and runs the engine with constant pacing at
 * (baselinePower + powerDelta). Returns the new totalTime in seconds.
 *
 * Caller is responsible for catching any thrown errors (e.g. unrealistic
 * inputs that cause the bisection to stall).
 */
function simulateWithDeltas(
  course: Course,
  rider: RiderProfile,
  environment: Environment,
  baselinePower: number,
  deltas: DeltaState,
): number {
  const adjustedRider: RiderProfile = {
    ...rider,
    bodyMass: Math.max(30, rider.bodyMass + deltas.mass),
    cda: Math.max(0.15, rider.cda + deltas.cda),
    crr: Math.max(0.001, rider.crr + deltas.crr),
  };
  // Wind slider semantics:
  //   - At delta = 0 the original environment is left untouched (so the
  //     reference simulation matches the conditions the prediction was
  //     actually run against).
  //   - Non-zero delta REPLACES the wind: positive = headwind (direction
  //     pointing opposite to course's average heading is approximated by
  //     using the existing windDirection), negative = tailwind (flip 180°).
  //   This is a simplification — true headwind/tailwind depends on segment
  //   bearing — but it matches the user's mental model for a what-if knob.
  const adjustedEnv: Environment =
    deltas.wind === 0
      ? environment
      : {
          ...environment,
          windSpeed: Math.abs(deltas.wind),
          windDirection:
            deltas.wind < 0
              ? environment.windDirection + Math.PI
              : environment.windDirection,
        };
  const power = Math.max(50, baselinePower + deltas.power);
  const pacing = course.segments.map(() => power);
  const result = simulateCourse({
    course,
    rider: adjustedRider,
    environment: adjustedEnv,
    pacing,
  });
  return result.totalTime;
}

export function WhatIfSliders({
  course,
  rider,
  environment,
  baselineTimeS,
  baselinePower,
}: Props) {
  const [deltas, setDeltas] = useState<DeltaState>(ZERO_DELTAS);
  const [, startTransition] = useTransition();

  // Reference simulation: zero deltas, constant pacing. We compare against
  // THIS rather than the original predicted time so deltas are mathematically
  // consistent (the original prediction may have used optimized variable
  // pacing; mixing them would make "+0 W = +1:23" appear as a non-zero
  // change, which is confusing).
  const referenceTimeS = useMemo(() => {
    try {
      return simulateWithDeltas(
        course,
        rider,
        environment,
        baselinePower,
        ZERO_DELTAS,
      );
    } catch {
      return baselineTimeS;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, rider, environment, baselinePower]);

  const liveTimeS = useMemo(() => {
    try {
      return simulateWithDeltas(
        course,
        rider,
        environment,
        baselinePower,
        deltas,
      );
    } catch {
      return referenceTimeS;
    }
  }, [course, rider, environment, baselinePower, deltas, referenceTimeS]);

  // Per-slider delta: time impact if ONLY this slider were moved. Cheaper to
  // compute on demand than to maintain five sims; recomputed once per render.
  const perSliderDeltas = useMemo(() => {
    const out: Record<SliderKey, number> = {
      power: 0,
      mass: 0,
      cda: 0,
      crr: 0,
      wind: 0,
    };
    for (const spec of SLIDER_SPECS) {
      if (deltas[spec.key] === 0) {
        out[spec.key] = 0;
        continue;
      }
      const isolated: DeltaState = { ...ZERO_DELTAS, [spec.key]: deltas[spec.key] };
      try {
        const t = simulateWithDeltas(
          course,
          rider,
          environment,
          baselinePower,
          isolated,
        );
        out[spec.key] = t - referenceTimeS;
      } catch {
        out[spec.key] = 0;
      }
    }
    return out;
  }, [course, rider, environment, baselinePower, deltas, referenceTimeS]);

  const totalDelta = liveTimeS - referenceTimeS;
  const isFaster = totalDelta < -0.5;
  const isSlower = totalDelta > 0.5;

  const onSlide = (key: SliderKey, value: number) => {
    startTransition(() => {
      setDeltas((d) => ({ ...d, [key]: value }));
    });
  };

  const reset = () => {
    setDeltas(ZERO_DELTAS);
  };

  const anyChanged = SLIDER_SPECS.some((s) => deltas[s.key] !== 0);

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-5 mb-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-coral text-xs uppercase tracking-wide">
          What if? — explore scenarios
        </p>
        <button
          type="button"
          onClick={reset}
          disabled={!anyChanged}
          className="text-xs uppercase tracking-wide text-off-white/60 hover:text-coral disabled:opacity-30 disabled:hover:text-off-white/60 transition-colors px-2 py-1"
        >
          Reset
        </button>
      </div>

      {/* Top time displays: original baseline + live what-if */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-charcoal/60 border border-white/5 rounded-md p-4">
          <p className="text-off-white/50 text-[10px] uppercase tracking-wider mb-1">
            Original prediction
          </p>
          <p className="font-display text-2xl md:text-3xl text-off-white tabular-nums">
            {formatDuration(baselineTimeS)}
          </p>
        </div>
        <div
          className={`rounded-md p-4 border transition-colors duration-300 ${
            isFaster
              ? "bg-coral/10 border-coral/40"
              : isSlower
                ? "bg-charcoal/60 border-white/10"
                : "bg-charcoal/60 border-white/5"
          }`}
        >
          <p className="text-off-white/50 text-[10px] uppercase tracking-wider mb-1">
            What if
          </p>
          <p
            className={`font-display text-2xl md:text-3xl tabular-nums transition-colors duration-300 ${
              isFaster ? "text-coral" : isSlower ? "text-off-white/60" : "text-off-white"
            }`}
            style={{ transition: "color 300ms ease, opacity 300ms ease" }}
          >
            {formatDuration(liveTimeS)}
          </p>
          <p
            className={`text-xs mt-1 tabular-nums transition-colors duration-300 ${
              isFaster
                ? "text-coral"
                : isSlower
                  ? "text-off-white/40"
                  : "text-off-white/40"
            }`}
          >
            {anyChanged ? formatTimeDelta(totalDelta) : "no change"}
          </p>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid gap-5 md:grid-cols-2">
        {SLIDER_SPECS.map((spec) => {
          const value = deltas[spec.key];
          const sliderDelta = perSliderDeltas[spec.key];
          const sliderFaster = sliderDelta < -0.5;
          const sliderSlower = sliderDelta > 0.5;
          // Position 0-100 for the gradient track fill.
          const pct = ((value - spec.min) / (spec.max - spec.min)) * 100;
          return (
            <div key={spec.key}>
              <div className="flex items-baseline justify-between mb-1.5">
                <label
                  htmlFor={`whatif-${spec.key}`}
                  className="text-off-white text-sm font-medium"
                >
                  {spec.label}
                </label>
                <span className="text-off-white/70 text-xs tabular-nums">
                  {spec.formatDelta(value)}
                </span>
              </div>
              <input
                id={`whatif-${spec.key}`}
                type="range"
                min={spec.min}
                max={spec.max}
                step={spec.step}
                value={value}
                onChange={(e) => onSlide(spec.key, parseFloat(e.target.value))}
                className="whatif-slider w-full"
                style={
                  {
                    "--whatif-pct": `${pct}%`,
                  } as React.CSSProperties
                }
              />
              <p
                className={`text-xs mt-1 tabular-nums transition-colors duration-300 ${
                  sliderFaster
                    ? "text-coral"
                    : sliderSlower
                      ? "text-off-white/40"
                      : "text-off-white/50"
                }`}
              >
                {value === 0
                  ? "—"
                  : `${spec.formatDelta(value)} = ${formatTimeDelta(sliderDelta)}`}
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-off-white/40 text-[11px] mt-5 leading-relaxed">
        Drag the sliders to see how each variable changes your finish time.
        Coral = faster than baseline; dimmed = slower. Wind slider replaces the
        forecast wind — negative = tailwind.
      </p>

      {/* Slider styling — coral thumb, dark track, gradient fill from min to current value. */}
      <style jsx>{`
        .whatif-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 9999px;
          background: linear-gradient(
            to right,
            #f16363 0%,
            #f16363 var(--whatif-pct, 50%),
            rgba(255, 255, 255, 0.08) var(--whatif-pct, 50%),
            rgba(255, 255, 255, 0.08) 100%
          );
          outline: none;
          cursor: pointer;
          transition: background 80ms linear;
        }

        .whatif-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #f16363;
          border: 2px solid #fafafa;
          box-shadow: 0 0 0 4px rgba(241, 99, 99, 0.15),
            0 2px 6px rgba(0, 0, 0, 0.4);
          cursor: grab;
          transition: transform 120ms ease, box-shadow 120ms ease;
        }

        .whatif-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 6px rgba(241, 99, 99, 0.2),
            0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .whatif-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.05);
        }

        .whatif-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #f16363;
          border: 2px solid #fafafa;
          box-shadow: 0 0 0 4px rgba(241, 99, 99, 0.15),
            0 2px 6px rgba(0, 0, 0, 0.4);
          cursor: grab;
          transition: transform 120ms ease, box-shadow 120ms ease;
        }

        .whatif-slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }

        .whatif-slider::-moz-range-track {
          height: 6px;
          border-radius: 9999px;
          background: transparent;
        }

        .whatif-slider:focus-visible {
          outline: 2px solid #f16363;
          outline-offset: 6px;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}
