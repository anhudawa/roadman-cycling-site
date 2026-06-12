"use client";

import { useEffect, useState } from "react";

/**
 * Race-radio captions during the riding interludes — broadcast
 * commentary lines that fade through while the world rolls. Killing
 * dead air is half of what makes the interludes feel directed.
 *
 * Mount with key={scenario.id} — a new scenario remounts the ticker,
 * which is what resets the line index.
 */
export function RaceRadio({ lines, intervalMs }: { lines: string[]; intervalMs: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (lines.length <= 1) return;
    const t = setInterval(
      () => setIndex((i) => Math.min(i + 1, lines.length - 1)),
      intervalMs
    );
    return () => clearInterval(t);
  }, [lines, intervalMs]);

  if (!lines.length) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-20 flex justify-center px-4 sm:bottom-24">
      <p
        key={index}
        aria-live="polite"
        className="riq-fade-in max-w-xl border-l-2 border-coral bg-charcoal/75 px-4 py-2.5 text-center text-sm leading-snug text-off-white/90 backdrop-blur-sm sm:text-[15px]"
      >
        <span className="mr-2 font-heading text-[10px] tracking-[0.3em] text-coral align-middle">
          RACE RADIO
        </span>
        {lines[index]}
      </p>
    </div>
  );
}
