"use client";

import type { FitnessProfile, SystemState } from "@/lib/ridezones/types";

// Status colors (good / caution / attention) — always paired with the
// state word, never color alone.
const STATE_STYLES: Record<SystemState, { bar: string; chip: string; label: string }> = {
  strong: { bar: "#1FA396", chip: "text-[#5FD4C8]", label: "Strong" },
  developing: { bar: "#D99A2B", chip: "text-[#EFC272]", label: "Developing" },
  underdeveloped: { bar: "#EF5D5D", chip: "text-[#F58F8F]", label: "Needs work" },
  unknown: { bar: "#545559", chip: "text-foreground-muted", label: "No data" },
};

export function SystemBars({ profile }: { profile: FitnessProfile }) {
  return (
    <div className="space-y-4">
      {profile.systems.map((system) => {
        const style = STATE_STYLES[system.state];
        return (
          <div key={system.key}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="font-heading text-lg uppercase tracking-wide text-off-white">
                {system.label}
              </span>
              <span className="whitespace-nowrap text-sm text-foreground-muted">
                <span className={`mr-2 font-semibold ${style.chip}`}>{style.label}</span>
                {system.score}/100
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${system.score}%`, backgroundColor: style.bar }}
              />
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">{system.note}</p>
          </div>
        );
      })}
    </div>
  );
}
