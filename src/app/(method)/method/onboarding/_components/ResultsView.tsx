"use client";

import { useState } from "react";
import {
  GOAL_LABEL,
  LEVEL_LABEL,
} from "@/lib/method/onboarding/plan-matrix";
import type { Recommendation } from "@/lib/method/onboarding/types";

interface ResultsViewProps {
  recommendation: Recommendation;
  onRestart: () => void;
}

/**
 * Final state of the onboarding quiz — displays the recommended plan,
 * calibration notes, and the "apply to TrainingPeaks" CTA. Submission
 * is fire-and-forget: it tells the team which plan to assign in TP, but
 * doesn't block the rider from seeing their recommendation.
 */
export function ResultsView({ recommendation, onRestart }: ResultsViewProps) {
  const { plan, answers, notes, weeksToEvent } = recommendation;
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onApply() {
    setApplying(true);
    setError(null);
    try {
      const res = await fetch("/api/method/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: plan.code,
          planName: plan.name,
          answers,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      setApplied(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not register your plan. Try again, or email sarah@roadmancycling.com.",
      );
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Eyebrow + plan name */}
      <header>
        <p className="font-heading text-xs tracking-[0.3em] text-coral mb-4">
          YOUR PLAN
        </p>
        <h1 className="font-heading uppercase leading-[0.95] text-4xl md:text-5xl lg:text-6xl">
          {plan.name}
        </h1>
        <p className="mt-5 max-w-2xl text-base md:text-lg text-foreground-muted leading-relaxed">
          {plan.summary}
        </p>
      </header>

      {/* Stats grid */}
      <section
        aria-label="Plan structure"
        className="grid gap-4 sm:grid-cols-3 rounded-xl border border-white/10 bg-charcoal/60 p-5 md:p-6"
      >
        <Stat label="Goal" value={GOAL_LABEL[plan.goal]} />
        <Stat label="Weekly hours" value={`${plan.hours} h`} />
        <Stat label="Experience" value={LEVEL_LABEL[plan.level]} />
        <Stat label="Structure" value={plan.structure} />
        <Stat label="Intensity" value={plan.intensity} />
        <Stat
          label="Event runway"
          value={
            weeksToEvent === null
              ? "Open-ended"
              : `${weeksToEvent} ${weeksToEvent === 1 ? "week" : "weeks"} out`
          }
        />
      </section>

      {/* Highlights */}
      <section aria-label="What's inside" className="space-y-3">
        <p className="font-heading text-xs tracking-[0.3em] text-coral">
          WHAT&apos;S INSIDE
        </p>
        <ul className="space-y-2.5">
          {plan.highlights.map((h, i) => (
            <li
              key={i}
              className="flex items-baseline gap-3 text-sm md:text-base text-off-white/90"
            >
              <span className="text-coral text-xs leading-relaxed">▸</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Calibration notes */}
      {notes.length > 0 && (
        <section
          aria-label="Calibration notes"
          className="rounded-lg border border-white/10 bg-charcoal/40 p-5 md:p-6"
        >
          <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">
            TUNING NOTES
          </p>
          <ul className="space-y-3 text-sm text-foreground-muted leading-relaxed">
            {notes.map((n, i) => (
              <li key={i} className="flex items-baseline gap-3">
                <span aria-hidden className="text-coral/70 text-xs">·</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Apply CTA */}
      <section
        aria-label="Apply this plan"
        className="relative overflow-hidden rounded-xl border border-coral/30 bg-gradient-to-br from-charcoal via-charcoal/90 to-deep-purple/40 p-6 md:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-coral/15 blur-3xl"
        />
        <div className="relative">
          <p className="font-heading text-[11px] tracking-[0.3em] text-coral mb-2">
            NEXT · TRAININGPEAKS
          </p>
          <h2 className="font-heading uppercase tracking-wider text-xl md:text-2xl mb-3">
            Send this plan to your calendar
          </h2>
          <p className="text-sm md:text-base text-foreground-muted mb-5 max-w-xl">
            We&apos;ll assign{" "}
            <span className="text-off-white">{plan.name}</span>{" "}
            to your TrainingPeaks account
            {answers.ftp ? ` with zones seeded from FTP ${answers.ftp} W` : ""}
            {weeksToEvent !== null && weeksToEvent > 0
              ? `, anchored to your event ${weeksToEvent} weeks out`
              : ""}
            . You&apos;ll get an email when it&apos;s live — usually within a working day.
          </p>

          {applied ? (
            <div className="rounded-md border border-coral/30 bg-coral/10 p-4">
              <p className="font-heading uppercase tracking-wider text-sm text-coral mb-1">
                Request received
              </p>
              <p className="text-sm text-foreground-muted">
                We&apos;ve got it. Watch your inbox — link to TrainingPeaks lands when the plan&apos;s been applied.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onApply}
                disabled={applying}
                className="inline-flex items-center gap-2 rounded-md bg-coral hover:bg-coral-hover px-5 py-2.5 font-heading uppercase tracking-wider text-off-white text-sm shadow-[var(--shadow-glow-coral)] transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? "Sending…" : "Apply this plan →"}
              </button>
              <button
                type="button"
                onClick={onRestart}
                className="font-heading uppercase tracking-wider text-xs text-foreground-muted hover:text-off-white transition-colors"
              >
                Start over
              </button>
            </div>
          )}
          {error && (
            <p className="mt-3 text-xs text-coral" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-heading text-[10px] tracking-[0.3em] text-foreground-muted mb-1">
        {label.toUpperCase()}
      </p>
      <p className="text-sm md:text-base text-off-white">{value}</p>
    </div>
  );
}
