"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Event diagnostic — three questions, one phase-specific prescription.
 *
 * Used inside /you/event. Output tells the rider which phase they
 * should be in right now based on their event date, and what one
 * weekly session defines that phase. Plus a link to a detailed plan.
 */

type WeeksOut = "12plus" | "8to12" | "4to8" | "under4";
type EventType = "sportive" | "race" | "fondo" | "ultra";
type Volume = "low" | "mid" | "high";

interface DiagnosticResult {
  phase: string;
  summary: string;
  anchorSession: string;
  anchorDetail: string;
  articleHref: string;
  articleLabel: string;
}

function diagnose(
  weeksOut: WeeksOut,
  eventType: EventType,
  volume: Volume,
): DiagnosticResult {
  if (weeksOut === "under4") {
    return {
      phase: "TAPER",
      summary: `With less than 4 weeks out, you're in taper territory. The fitness you have is the fitness you'll bring. Job now is showing up fresh, not fitter.`,
      anchorSession: "One hard, short, sharp session",
      anchorDetail:
        "4-5 days out: one 45-minute ride with 3x3 min at event pace intensity. Reduces freshness, keeps the legs sharp. Nothing heavier than that.",
      articleHref: "/blog/cycling-tapering-guide",
      articleLabel: "Full tapering guide",
    };
  }

  if (weeksOut === "4to8") {
    return {
      phase: "PEAK",
      summary: `4-8 weeks out is the peak phase. You're converting general fitness into event-specific form. Volume drops, intensity stays specific, rest increases.`,
      anchorSession:
        eventType === "race"
          ? "Race-simulation intervals"
          : eventType === "ultra"
            ? "Long sub-threshold sustained efforts"
            : "Event-pace sustained blocks",
      anchorDetail:
        eventType === "race"
          ? "2-3 sessions/week of 6x3 min at VO2 max with 2-min recoveries. Practice race pacing. Nothing longer than needed."
          : eventType === "ultra"
            ? "Long ride 4-5 hours at sub-threshold with 3x20 min at event pace. Fueling practice is as important as the effort."
            : "1-2 sessions/week of 3x20 min at your target event pace. Full nutrition practice. Equipment practice.",
      articleHref: "/blog/cycling-periodisation-plan-guide",
      articleLabel: "Periodisation for target events",
    };
  }

  if (weeksOut === "8to12") {
    return {
      phase: "BUILD",
      summary: `8-12 weeks out is the build phase. Structured intensity enters the programme. Threshold and VO2 max work on top of your base.`,
      anchorSession: "Weekly threshold anchor",
      anchorDetail:
        "Once a week: 2x20 min at 91-105% FTP with 5-min recovery. Progress to 3x15 min, then 4x12 min over 3 weeks. Base rides continue unchanged.",
      articleHref: "/blog/cycling-periodisation-plan-guide",
      articleLabel: "Build phase framework",
    };
  }

  // 12+ weeks out
  if (volume === "low") {
    return {
      phase: "BASE — ADD VOLUME",
      summary: `12+ weeks out with under 6 hours/week is the window to add volume. Every hour you can add to your base now pays back compound interest for the event.`,
      anchorSession: "The added Z2 ride",
      anchorDetail:
        "Add one 90-minute easy ride to your current week. Goal: 6-8 hours/week. Easy means easy — you can hold conversation the whole time.",
      articleHref: "/blog/cycling-base-training-guide",
      articleLabel: "Base training complete guide",
    };
  }

  return {
    phase: "BASE",
    summary: `12+ weeks out is base territory. Build the aerobic engine. Keep intensity minimal. This is the phase most amateurs skip — and then wonder why the build phase doesn't work.`,
    anchorSession: "The long ride",
    anchorDetail:
      "One 3-4 hour ride/week at true Zone 2 (nose-breathing pace). The rest is medium duration Z2 rides plus one mild tempo session.",
    articleHref: "/blog/cycling-base-training-guide",
    articleLabel: "Base training complete guide",
  };
}

type Step = "weeks" | "event" | "volume" | "result";

export function EventDiagnostic() {
  const [step, setStep] = useState<Step>("weeks");
  const [weeks, setWeeks] = useState<WeeksOut | null>(null);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [volume, setVolume] = useState<Volume | null>(null);

  const result =
    weeks && eventType && volume
      ? diagnose(weeks, eventType, volume)
      : null;

  return (
    <div className="rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/5 via-deep-purple/40 to-charcoal p-6 md:p-10">
      <p className="font-heading text-coral text-xs tracking-widest mb-3">
        QUICK DIAGNOSTIC · 3 QUESTIONS
      </p>
      <h3 className="font-heading text-off-white text-2xl md:text-3xl mb-8 leading-tight">
        WHICH PHASE SHOULD YOU BE IN RIGHT NOW?
      </h3>

      {step === "weeks" && (
        <Q
          question="How many weeks until your event?"
          options={[
            { value: "12plus", label: "12+ weeks", detail: "Base phase" },
            { value: "8to12", label: "8-12 weeks", detail: "Build phase" },
            { value: "4to8", label: "4-8 weeks", detail: "Peak phase" },
            { value: "under4", label: "Under 4 weeks", detail: "Taper" },
          ]}
          onSelect={(v) => {
            setWeeks(v as WeeksOut);
            setStep("event");
          }}
        />
      )}

      {step === "event" && (
        <Q
          question="What's the event?"
          options={[
            {
              value: "sportive",
              label: "Sportive",
              detail: "Gran fondo, charity ride",
            },
            {
              value: "race",
              label: "Road race",
              detail: "Cat / crit / stage race",
            },
            {
              value: "fondo",
              label: "Timed ride",
              detail: "Century PR, TT series",
            },
            {
              value: "ultra",
              label: "Ultra / gravel",
              detail: "200km+, multi-day",
            },
          ]}
          onSelect={(v) => {
            setEventType(v as EventType);
            setStep("volume");
          }}
        />
      )}

      {step === "volume" && (
        <Q
          question="Current weekly volume?"
          options={[
            { value: "low", label: "Under 6 hours", detail: "Opportunistic" },
            { value: "mid", label: "6-10 hours", detail: "Serious amateur" },
            {
              value: "high",
              label: "10+ hours",
              detail: "High volume, structured",
            },
          ]}
          onSelect={(v) => {
            setVolume(v as Volume);
            setStep("result");
          }}
        />
      )}

      {step === "result" && result && (
        <div>
          <p className="font-heading text-coral text-xs tracking-widest mb-2">
            YOU&apos;RE IN THE
          </p>
          <p className="font-heading text-off-white text-3xl md:text-4xl mb-4 leading-none">
            {result.phase}
          </p>
          <p className="text-off-white text-base md:text-lg leading-relaxed mb-6">
            {result.summary}
          </p>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6 mb-6">
            <p className="font-heading text-coral text-sm tracking-widest mb-2">
              THIS WEEK&apos;S ANCHOR SESSION
            </p>
            <p className="font-heading text-off-white text-lg mb-2 leading-tight">
              {result.anchorSession.toUpperCase()}
            </p>
            <p className="text-foreground-muted text-sm leading-relaxed">
              {result.anchorDetail}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <Link
              href={result.articleHref}
              className="
                inline-flex items-center justify-center px-5 py-3
                rounded-md bg-white/5 hover:bg-white/10
                border border-white/10 hover:border-coral/30
                text-off-white text-sm font-body
                transition-colors
              "
            >
              Read: {result.articleLabel} <span aria-hidden="true" className="ml-1">&rarr;</span>
            </Link>
            <Link
              href="/apply"
              className="
                inline-flex items-center justify-center px-5 py-3
                rounded-md bg-coral hover:bg-coral-hover
                text-off-white text-sm font-heading tracking-wider
                transition-colors
              "
            >
              BUILD THE FULL PLAN &rarr;
            </Link>
            <button
              type="button"
              onClick={() => {
                setWeeks(null);
                setEventType(null);
                setVolume(null);
                setStep("weeks");
              }}
              className="text-foreground-subtle text-sm hover:text-foreground-muted underline underline-offset-4 shrink-0 sm:ml-auto"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface QProps {
  question: string;
  options: { value: string; label: string; detail: string }[];
  onSelect: (value: string) => void;
}

function Q({ question, options, onSelect }: QProps) {
  return (
    <div>
      <p className="text-off-white text-lg md:text-xl mb-5">{question}</p>
      <div
        className={`grid grid-cols-1 ${options.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-3`}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className="
              group text-left p-4 md:p-5 rounded-xl
              border border-white/10 hover:border-coral/40
              bg-white/[0.02] hover:bg-white/[0.05]
              transition-all hover:-translate-y-0.5
            "
          >
            <p className="font-heading text-off-white text-base leading-tight mb-1 group-hover:text-coral transition-colors">
              {opt.label.toUpperCase()}
            </p>
            <p className="text-foreground-subtle text-xs">{opt.detail}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
