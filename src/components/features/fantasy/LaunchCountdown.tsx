"use client";

import { useEffect, useState } from "react";

/**
 * Launch-urgency countdown to team picking going live.
 *
 * Target is a fixed instant (midnight CEST, 26 June 2026). Rendered as a
 * static shell so the server markup is stable; the live figures fill in
 * after hydration. Once the target passes it flips to a "live" state.
 *
 * Pure presentation — no data, no scoring. The date is a single constant
 * so it is trivial to change if the launch slips.
 */
const LAUNCH_ISO = "2026-06-26T00:00:00+02:00";
const LAUNCH_LABEL = "26 June";

function parts(msLeft: number) {
  const s = Math.max(0, Math.floor(msLeft / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
  };
}

export function LaunchCountdown({ className }: { className?: string }) {
  const target = new Date(LAUNCH_ISO).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const msLeft = now == null ? null : target - now;
  const live = msLeft != null && msLeft <= 0;
  const { days, hours, mins } = parts(msLeft ?? 0);

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-jersey-yellow/40 bg-jersey-yellow/10 px-4 py-2.5 ${className ?? ""}`}
    >
      {live ? (
        <span className="font-heading text-sm tracking-[0.2em] text-jersey-yellow">
          TEAM PICKING IS LIVE — BUILD YOUR EIGHT
        </span>
      ) : (
        <>
          <span className="font-heading text-sm tracking-[0.2em] text-jersey-yellow">
            TEAM PICKING GOES LIVE {LAUNCH_LABEL}
          </span>
          <span
            className="font-heading text-sm tabular-nums text-off-white/90"
            aria-live="off"
            suppressHydrationWarning
          >
            {now == null ? (
              <span className="text-off-white/50">soon</span>
            ) : (
              <>
                {days}d {hours}h {mins}m to go
              </>
            )}
          </span>
        </>
      )}
    </div>
  );
}
