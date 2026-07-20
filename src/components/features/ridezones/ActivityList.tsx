"use client";

import { useState } from "react";
import { PURPOSE_LABELS } from "@/lib/ridezones/classify";
import type { AnalyzedActivity, SessionPurpose } from "@/lib/ridezones/types";

const PURPOSE_STYLES: Record<SessionPurpose, string> = {
  recovery: "bg-white/10 text-foreground-muted",
  endurance: "bg-[#1FA396]/15 text-[#5FD4C8]",
  "long-ride": "bg-[#1FA396]/15 text-[#5FD4C8]",
  "grey-zone": "bg-[#8A8A92]/20 text-[#C9C9CE]",
  tempo: "bg-[#D99A2B]/15 text-[#EFC272]",
  "sweet-spot": "bg-[#D99A2B]/15 text-[#EFC272]",
  threshold: "bg-coral/15 text-coral",
  vo2: "bg-[#9C7BE8]/20 text-[#B9A3FC]",
  unknown: "bg-white/10 text-foreground-muted",
};

const VERDICT_STYLES: Record<string, string> = {
  nailed: "text-[#5FD4C8]",
  solid: "text-off-white",
  drifted: "text-[#EFC272]",
  missed: "text-[#F58F8F]",
};

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function ActivityList({
  activities,
  limit = 20,
}: {
  activities: AnalyzedActivity[];
  limit?: number;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [shown, setShown] = useState(limit);
  const recent = [...activities].reverse().slice(0, shown);

  if (activities.length === 0) {
    return <p className="text-sm text-foreground-muted">No rides imported yet.</p>;
  }

  return (
    <div>
      <ul className="divide-y divide-white/5">
        {recent.map((ride) => {
          const isOpen = expanded === ride.id;
          return (
            <li key={ride.id}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : ride.id)}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 py-3 text-left transition-colors hover:bg-white/[0.03]"
                aria-expanded={isOpen}
              >
                <span className="w-24 shrink-0 text-sm text-foreground-muted">
                  {formatDate(ride.date)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-off-white">{ride.name}</span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${PURPOSE_STYLES[ride.purpose]}`}
                >
                  {PURPOSE_LABELS[ride.purpose]}
                </span>
                <span className="w-16 shrink-0 text-right text-sm text-foreground-muted">
                  {formatDuration(ride.durationSec)}
                </span>
                <span className="w-16 shrink-0 text-right text-sm text-foreground-muted">
                  {Math.round(ride.tss)} TSS
                </span>
                <span className="w-14 shrink-0 text-right text-sm font-semibold">
                  {ride.execution ? (
                    <span className={VERDICT_STYLES[ride.execution.verdict]}>
                      {ride.execution.score.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-foreground-subtle">—</span>
                  )}
                </span>
              </button>
              {isOpen && ride.execution ? (
                <div className="mb-3 rounded-md border-l-2 border-coral/60 bg-white/[0.03] px-4 py-3">
                  <p className="text-sm leading-relaxed text-foreground-muted">
                    <span className={`mr-2 font-semibold uppercase ${VERDICT_STYLES[ride.execution.verdict]}`}>
                      {ride.execution.verdict}
                    </span>
                    {ride.execution.note}
                  </p>
                  <p className="mt-1.5 text-xs text-foreground-subtle">
                    {ride.intensityFactor !== null
                      ? `IF ${ride.intensityFactor.toFixed(2)} · `
                      : ""}
                    load from {ride.loadSource === "power" ? "power data" : ride.loadSource === "hr" ? "heart rate" : "duration estimate"}
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {activities.length > shown ? (
        <button
          type="button"
          onClick={() => setShown(shown + 20)}
          className="mt-3 text-sm font-semibold text-coral hover:text-coral-hover"
        >
          Show more rides
        </button>
      ) : null}
    </div>
  );
}
