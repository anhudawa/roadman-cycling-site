"use client";

import { motion, useReducedMotion } from "framer-motion";

interface ProgressRingProps {
  percent: number;
  size?: number;
  stroke?: number;
}

/**
 * Animated SVG progress ring. Uses framer-motion to draw the arc from
 * 0 → percent on mount. Coral on charcoal — matches the brand glow.
 */
export function ProgressRing({
  percent,
  size = 140,
  stroke = 10,
}: ProgressRingProps) {
  const safe = Math.max(0, Math.min(100, Math.round(percent)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safe / 100) * circumference;
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${safe}% complete`}
      aria-label="Course progress"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--color-coral)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduceMotion ? offset : circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduceMotion ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            filter: "drop-shadow(0 0 12px rgba(241,99,99,0.45))",
          }}
        />
      </svg>
      <div
        aria-hidden
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="font-heading text-4xl tracking-wide">{safe}%</span>
        <span className="text-xs uppercase tracking-[0.3em] text-foreground-muted mt-1">
          Complete
        </span>
      </div>
    </div>
  );
}
