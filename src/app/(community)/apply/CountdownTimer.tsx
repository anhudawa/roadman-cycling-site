"use client";

import { useEffect, useState } from "react";
import { getCohortState } from "@/lib/cohort";

/**
 * Live countdown to the current cohort's application deadline.
 *
 * Reads the deadline from src/lib/cohort.ts so it rolls from cohort to
 * cohort automatically $— no hardcoded dates. Renders "APPLICATIONS
 * CLOSED" once the deadline is in the past (at which point the whole
 * page flips to waitlist mode via getCohortState and this component
 * stops being rendered by its parent anyway).
 */
function getTimeLeft(deadline: Date | null) {
  if (!deadline) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const diff = deadline.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

export function CountdownTimer() {
  const deadline = getCohortState().deadline;
  const [time, setTime] = useState(() => getTimeLeft(deadline));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (time.expired) {
    return (
      <p className="text-coral font-heading text-lg tracking-widest">
        APPLICATIONS CLOSED
      </p>
    );
  }

  const units = [
    { value: time.days, label: "DAYS" },
    { value: time.hours, label: "HRS" },
    { value: time.minutes, label: "MIN" },
    { value: time.seconds, label: "SEC" },
  ];

  return (
    <div className="flex items-center justify-center gap-3 md:gap-4">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-3 md:gap-4">
          <div className="text-center">
            <p className="font-heading text-coral text-2xl md:text-4xl leading-none tabular-nums">
              {String(u.value).padStart(2, "0")}
            </p>
            <p className="text-foreground-subtle text-[10px] tracking-widest mt-1">
              {u.label}
            </p>
          </div>
          {i < units.length - 1 && (
            <span className="text-coral/40 font-heading text-xl md:text-2xl -mt-3">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
