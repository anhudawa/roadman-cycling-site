"use client";

import { useState } from "react";
import Link from "next/link";
import { PROGRAMME, type Phase } from "@/lib/sc-programme";

/* ------------------------------------------------------------------ */
/*  Phase colour + label mapping                                       */
/* ------------------------------------------------------------------ */

const PHASE_META: Record<Phase, { bg: string; label: string }> = {
  gpp: { bg: "bg-[#4C1273]", label: "GPP" },
  strength: { bg: "bg-[#F16363]", label: "STRENGTH" },
  power: { bg: "bg-[#4AAE8C]", label: "POWER" },
  deload: { bg: "bg-[#545559]", label: "DELOAD" },
};

const FILTER_OPTIONS: { value: Phase | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "gpp", label: "GPP" },
  { value: "strength", label: "Strength" },
  { value: "power", label: "Power" },
  { value: "deload", label: "Deload" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ProgrammeDashboard() {
  const [activePhase, setActivePhase] = useState<Phase | "all">("all");

  const filtered =
    activePhase === "all"
      ? PROGRAMME
      : PROGRAMME.filter((w) => w.phase === activePhase);

  return (
    <div className="bg-[#210140] min-h-screen font-body">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* ── Heading ──────────────────────────────────────────────── */}
        <h1
          className="font-heading text-off-white"
          style={{ fontSize: "var(--text-section)" }}
        >
          12-WEEK PROGRAMME
        </h1>
        <p className="mt-3 text-foreground-muted text-lg max-w-2xl">
          Your complete training plan laid out week by week. Filter by phase or
          pick a week to see the full session detail.
        </p>

        <div className="mt-8 max-w-3xl rounded-xl border border-white/10 bg-[#2E2E30] p-5 text-sm leading-relaxed text-foreground-muted">
          <p>
            This is Roadman&apos;s public two-session-per-week example, not an
            individual prescription. The sets and repetitions show the exact
            programme structure; adjust only with appropriate coaching and
            health context.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href="/blog/cycling-strength-training-12-week-beginner-plan"
              className="font-heading text-xs tracking-wide text-coral hover:text-off-white"
            >
              READ THE 12-WEEK GUIDE →
            </Link>
            <Link
              href="/feeds/cycling-strength-programme.json"
              className="font-heading text-xs tracking-wide text-coral hover:text-off-white"
            >
              VIEW SOURCE DATA →
            </Link>
          </div>
        </div>

        {/* ── Phase filter tabs ────────────────────────────────────── */}
        <div className="mt-10 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activePhase === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setActivePhase(opt.value)}
                className={`
                  font-heading text-sm tracking-wide px-5 py-2 rounded-full
                  transition-colors border
                  ${
                    isActive
                      ? "bg-coral text-off-white border-coral"
                      : "bg-transparent text-foreground-muted border-white/10 hover:border-white/30 hover:text-off-white"
                  }
                `}
              >
                {opt.label.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* ── Week cards grid ──────────────────────────────────────── */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((week) => {
            const meta = PHASE_META[week.phase];
            const day1 = week.days[0];
            const day2 = week.days[1];
            const day1A1 = day1.workout.find((e) => e.supersetGroup === "A");
            const day2A1 = day2.workout.find((e) => e.supersetGroup === "A");

            return (
              <Link
                key={week.weekNumber}
                href={`/sc/programme/week/${week.weekNumber}`}
                className="group block rounded-xl bg-[#2E2E30] border border-white/10 hover:border-coral/50 transition-colors p-6"
              >
                {/* Week number + badges */}
                <div className="flex items-start justify-between">
                  <span className="font-heading text-off-white text-4xl leading-none">
                    {String(week.weekNumber).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`${meta.bg} text-off-white font-heading text-[11px] tracking-wider px-3 py-1 rounded-full`}
                    >
                      {meta.label}
                    </span>
                    {week.isDeload && (
                      <span className="bg-mid-grey text-off-white font-heading text-[11px] tracking-wider px-3 py-1 rounded-full">
                        DELOAD
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-foreground-muted text-sm font-body">
                  {week.phaseLabel}
                </p>

                {/* Day summaries */}
                <div className="mt-5 space-y-3">
                  {/* Day 1 */}
                  <div className="rounded-lg bg-charcoal/60 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-off-white text-sm">
                        DAY 1 &mdash; {day1.type.toUpperCase()}
                      </span>
                      <span className="text-foreground-muted text-xs font-body">
                        {day1.workout.length} exercise
                        {day1.workout.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {day1A1 && (
                      <p className="mt-1 text-foreground-muted text-xs truncate">
                        A1: {day1A1.name}
                      </p>
                    )}
                  </div>

                  {/* Day 2 */}
                  <div className="rounded-lg bg-charcoal/60 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-off-white text-sm">
                        DAY 2 &mdash; {day2.type.toUpperCase()}
                      </span>
                      <span className="text-foreground-muted text-xs font-body">
                        {day2.workout.length} exercise
                        {day2.workout.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {day2A1 && (
                      <p className="mt-1 text-foreground-muted text-xs truncate">
                        A1: {day2A1.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="mt-5 flex items-center gap-1 text-coral opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-heading text-xs tracking-wide">
                    VIEW WEEK
                  </span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <p className="mt-16 text-center text-foreground-muted text-lg">
            No weeks match this filter.
          </p>
        )}
      </div>
    </div>
  );
}
