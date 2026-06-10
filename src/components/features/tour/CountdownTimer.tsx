"use client";

import { useEffect, useState } from "react";
import { msUntilStart } from "@/lib/tour";

/**
 * Live ticking countdown to the Grand Départ. Pure client island — the
 * surrounding hero/banner is server-rendered for SEO and LCP; this only
 * handles the second-by-second updates.
 *
 * SSR renders the first frame from the same `msUntilStart()` the client
 * computes on mount, so there's no hydration flash. We then tick every
 * second with setInterval (matching the EventsClient pattern).
 */

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="font-heading tabular-nums leading-none text-jersey-yellow"
        style={{ fontSize: "clamp(2.75rem, 9vw, 6rem)" }}
      >
        {value.toString().padStart(2, "0")}
      </span>
      <span className="font-heading tracking-[0.3em] text-foreground-muted text-[10px] sm:text-xs mt-2">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer() {
  // Initialiser + interval only (mirrors EventsClient) — no synchronous
  // setState in the effect body. The interval corrects any sub-second
  // drift on the next tick.
  const [ms, setMs] = useState(() => msUntilStart());

  useEffect(() => {
    const id = setInterval(() => setMs(msUntilStart()), 1000);
    return () => clearInterval(id);
  }, []);

  const { days, hours, minutes, seconds } = split(ms);

  return (
    <div
      className="flex items-start justify-center gap-3 sm:gap-6"
      role="timer"
      aria-label="Time until the Grand Départ"
    >
      <Unit value={days} label="DAYS" />
      <span className="font-heading text-jersey-yellow/40 leading-none" style={{ fontSize: "clamp(2.75rem, 9vw, 6rem)" }}>
        :
      </span>
      <Unit value={hours} label="HOURS" />
      <span className="font-heading text-jersey-yellow/40 leading-none" style={{ fontSize: "clamp(2.75rem, 9vw, 6rem)" }}>
        :
      </span>
      <Unit value={minutes} label="MINS" />
      <span className="font-heading text-jersey-yellow/40 leading-none hidden sm:inline" style={{ fontSize: "clamp(2.75rem, 9vw, 6rem)" }}>
        :
      </span>
      <div className="hidden sm:flex">
        <Unit value={seconds} label="SECS" />
      </div>
    </div>
  );
}
