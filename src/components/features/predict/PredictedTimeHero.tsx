"use client";

import { useEffect, useState } from "react";

interface PredictedTimeHeroProps {
  /** Final predicted time in seconds. */
  predictedTimeS: number;
  /** Confidence-low (faster bound) in seconds. */
  confidenceLowS: number;
  /** Confidence-high (slower bound) in seconds. */
  confidenceHighS: number;
  averageSpeedKmh: number;
  averagePower?: number | null;
  normalizedPower?: number | null;
  variabilityIndex?: number | null;
  mode: "plan_my_race" | "can_i_make_it";
}

function formatHMS(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return { h, m, s };
}

export function PredictedTimeHero({
  predictedTimeS,
  confidenceLowS,
  confidenceHighS,
  averageSpeedKmh,
  averagePower,
  normalizedPower,
  variabilityIndex,
  mode,
}: PredictedTimeHeroProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(predictedTimeS * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [predictedTimeS]);

  const { h, m, s } = formatHMS(animated);
  const lowDelta = Math.abs(predictedTimeS - confidenceLowS);
  const highDelta = Math.abs(confidenceHighS - predictedTimeS);
  const tolerance = ((Math.max(lowDelta, highDelta) / predictedTimeS) * 100).toFixed(1);
  const lowH = Math.floor(confidenceLowS / 3600);
  const lowM = Math.floor((confidenceLowS % 3600) / 60);
  const highH = Math.floor(confidenceHighS / 3600);
  const highM = Math.floor((confidenceHighS % 3600) / 60);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-coral/30 bg-gradient-to-br from-deep-purple via-charcoal to-charcoal p-6 md:p-10">
      {/* Aurora wash */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div
          className="absolute -top-24 -left-12 w-[480px] h-[480px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(241,99,99,0.35), transparent 65%)" }}
        />
        <div
          className="absolute -bottom-24 -right-12 w-[420px] h-[420px] rounded-full blur-[110px]"
          style={{ background: "radial-gradient(circle, rgba(76,18,115,0.55), transparent 65%)" }}
        />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <p
            className="text-[0.65rem] tracking-[0.25em] uppercase text-coral"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            {mode === "can_i_make_it" ? "GAP ANALYSIS" : "RACE PLAN"} · PREDICTED FINISH
          </p>
          <span
            className="text-[0.6rem] tracking-[0.2em] uppercase text-foreground-subtle px-2 py-1 rounded-full border border-white/10"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            ±{tolerance}%
          </span>
        </div>

        {/* The big time */}
        <div className="flex items-baseline gap-3 mb-3 flex-wrap">
          <TimeBlock value={h} label="H" big />
          <TimeBlock value={m} label="M" big pad />
          <TimeBlock value={s} label="S" pad muted />
        </div>

        <div
          className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 pt-4 border-t border-white/8"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          <ConfBracket
            lowLabel={`${lowH}h ${lowM.toString().padStart(2, "0")}m`}
            highLabel={`${highH}h ${highM.toString().padStart(2, "0")}m`}
          />
          <Stat label="AVG SPEED" value={`${averageSpeedKmh.toFixed(1)} km/h`} />
          {averagePower != null && (
            <Stat label="AVG PWR" value={`${Math.round(averagePower)} W`} />
          )}
          {normalizedPower != null && (
            <Stat label="NORM PWR" value={`${Math.round(normalizedPower)} W`} />
          )}
          {variabilityIndex != null && (
            <Stat label="VI" value={variabilityIndex.toFixed(2)} />
          )}
        </div>
      </div>
    </div>
  );
}

function TimeBlock({
  value,
  label,
  big,
  pad,
  muted,
}: {
  value: number;
  label: string;
  big?: boolean;
  pad?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className={`font-heading tabular-nums leading-none uppercase tracking-tight ${
          big ? "text-[clamp(4rem,12vw,9rem)]" : "text-[clamp(2rem,5vw,3.5rem)]"
        } ${muted ? "text-off-white/55" : "text-off-white"}`}
      >
        {pad ? value.toString().padStart(2, "0") : value}
      </span>
      <span
        className={`uppercase tracking-[0.2em] ${
          big ? "text-base md:text-lg" : "text-xs"
        } ${muted ? "text-coral/55" : "text-coral"}`}
        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
      >
        {label}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.55rem] tracking-[0.2em] uppercase text-foreground-subtle">
        {label}
      </p>
      <p className="text-off-white text-sm mt-0.5">{value}</p>
    </div>
  );
}

function ConfBracket({ lowLabel, highLabel }: { lowLabel: string; highLabel: string }) {
  return (
    <div>
      <p className="text-[0.55rem] tracking-[0.2em] uppercase text-foreground-subtle">
        CONFIDENCE
      </p>
      <p className="text-off-white text-sm mt-0.5 whitespace-nowrap">
        {lowLabel} <span className="text-coral mx-1">←→</span> {highLabel}
      </p>
    </div>
  );
}
