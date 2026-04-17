"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Plateau diagnostic — 3 questions, one recommendation.
 *
 * Used inside /you/plateau. Not gated (no email capture before the
 * recommendation) because the first job here is earning trust. The
 * recommendation ends with a soft /apply CTA + an email capture for
 * readers who want the full weekly prescription.
 *
 * Questions cascade: volume → duration-stuck → distribution. The
 * recommendation is a specific session + blog link, not generic
 * "train more polarised" advice.
 */

type Volume = "low" | "mid" | "high";
type Duration = "recent" | "months" | "year";
type Distribution = "grey" | "mostly-easy" | "varied";

interface DiagnosticResult {
  summary: string;
  prescription: string;
  sessionName: string;
  sessionDetail: string;
  articleHref: string;
  articleLabel: string;
}

function diagnose(
  volume: Volume,
  duration: Duration,
  distribution: Distribution,
): DiagnosticResult {
  // The grey-zone trap is the dominant pattern. Surface it aggressively.
  if (distribution === "grey") {
    return {
      summary:
        "The grey zone. You're riding too hard to recover, too easy to stimulate adaptation. Classic plateau pattern.",
      prescription:
        "Cut the mid-intensity entirely for 4 weeks. 80% of rides genuinely easy (nose-breathing pace), 20% genuinely hard (4x8 min at VO2max).",
      sessionName: "The Norwegian 4x8",
      sessionDetail:
        "Warm up 15 min. 4x8 min at the highest sustainable intensity, 2-min spin between. Cool down. Once a week. Ride everything else easy.",
      articleHref: "/blog/polarised-training-cycling-guide",
      articleLabel: "Why polarised training works",
    };
  }

  if (volume === "low") {
    return {
      summary:
        "You're undertrained. Volume is the biggest single predictor of aerobic fitness — and you're not hitting enough of it.",
      prescription:
        "Before fixing distribution or intensity, add an extra ride. Even a 90-min easy spin. Get to 6-8 hours/week for at least 8 weeks.",
      sessionName: "The extra Z2 ride",
      sessionDetail:
        "90 minutes at true Zone 2 — you can hold a conversation the whole time. Fasted is fine if you've trained that. Goal: one additional session/week.",
      articleHref: "/blog/zone-2-training-complete-guide",
      articleLabel: "Complete Zone 2 guide",
    };
  }

  if (duration === "year") {
    return {
      summary:
        "Year-long plateau with decent volume means the stimulus is stale. Your body has adapted to the current load. Time to shock it.",
      prescription:
        "Block periodisation. 4 weeks of pure VO2 max focus (twice-weekly 4x4), then 4 weeks of threshold (2x20), then a recovery week. You need a new stress.",
      sessionName: "The VO2 max reset block",
      sessionDetail:
        "Weeks 1-4: twice-weekly 4x4 at 106-120% FTP with 4-min recoveries. Every other ride easy. Weeks 5-8 pivot to threshold.",
      articleHref: "/blog/cycling-vo2max-intervals",
      articleLabel: "VO2 max interval protocols",
    };
  }

  if (volume === "high" && distribution === "mostly-easy") {
    return {
      summary:
        "High volume, mostly easy — you have the base, but you're missing the ceiling work. Adding a small, precise dose of genuinely hard intensity will unlock the next step.",
      prescription:
        "Keep the volume. Add one weekly VO2 max session. That's it. Don't overthink the rest.",
      sessionName: "4x4 VO2 max",
      sessionDetail:
        "Once a week, not on your long day. 4 x 4 min at 106-120% FTP, 4-min recovery between. Rate yourself 9/10 on the final rep — if it's easier, the intensity is too low.",
      articleHref: "/blog/cycling-vo2max-intervals",
      articleLabel: "VO2 max interval protocols",
    };
  }

  return {
    summary:
      "Your training is close to right but not quite dialled. The most common fix at this stage is tightening intensity discipline and adding structure around a weekly key session.",
    prescription:
      "Pick one key session/week (threshold or VO2 max). Every other ride stays under first ventilatory threshold. Log it, review weekly.",
    sessionName: "The anchor session",
    sessionDetail:
      "Tuesday or Thursday (whichever fits): 2x20 min at threshold (91-105% FTP) or 4x4 at VO2 max. Non-negotiable. Everything else subordinates to it.",
    articleHref: "/blog/how-to-improve-ftp-cycling",
    articleLabel: "How to improve your FTP",
  };
}

type Step = "volume" | "duration" | "distribution" | "result";

export function PlateauDiagnostic() {
  const [step, setStep] = useState<Step>("volume");
  const [volume, setVolume] = useState<Volume | null>(null);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [distribution, setDistribution] = useState<Distribution | null>(null);

  const result =
    volume && duration && distribution
      ? diagnose(volume, duration, distribution)
      : null;

  return (
    <div className="rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/5 via-deep-purple/40 to-charcoal p-6 md:p-10">
      <p className="font-heading text-coral text-xs tracking-widest mb-3">
        QUICK DIAGNOSTIC · 3 QUESTIONS
      </p>
      <h3 className="font-heading text-off-white text-2xl md:text-3xl mb-8 leading-tight">
        WHAT'S ACTUALLY KEEPING YOU STUCK?
      </h3>

      {/* Step 1 — volume */}
      {step === "volume" && (
        <DiagnosticQuestion
          question="How many hours a week are you currently riding?"
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
            setStep("duration");
          }}
        />
      )}

      {/* Step 2 — how long stuck */}
      {step === "duration" && (
        <DiagnosticQuestion
          question="How long have your numbers been flat?"
          options={[
            { value: "recent", label: "Under 3 months", detail: "Recent" },
            {
              value: "months",
              label: "3-12 months",
              detail: "Established plateau",
            },
            { value: "year", label: "Over a year", detail: "Long-term stall" },
          ]}
          onSelect={(v) => {
            setDuration(v as Duration);
            setStep("distribution");
          }}
        />
      )}

      {/* Step 3 — distribution */}
      {step === "distribution" && (
        <DiagnosticQuestion
          question="How would you describe your intensity mix?"
          options={[
            {
              value: "grey",
              label: "Most rides feel moderate-hard",
              detail: "Grey zone",
            },
            {
              value: "mostly-easy",
              label: "Mostly easy, rare hard rides",
              detail: "Base-heavy",
            },
            {
              value: "varied",
              label: "Varied — easy, hard, and everything between",
              detail: "Unstructured mix",
            },
          ]}
          onSelect={(v) => {
            setDistribution(v as Distribution);
            setStep("result");
          }}
        />
      )}

      {/* Result */}
      {step === "result" && result && (
        <div>
          <p className="font-heading text-coral text-xs tracking-widest mb-3">
            YOUR DIAGNOSIS
          </p>
          <p className="text-off-white text-lg md:text-xl leading-relaxed mb-6">
            {result.summary}
          </p>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6 mb-6">
            <p className="font-heading text-off-white text-sm tracking-widest mb-2">
              PRESCRIPTION
            </p>
            <p className="text-foreground-muted text-sm leading-relaxed mb-5">
              {result.prescription}
            </p>

            <div className="border-t border-white/10 pt-5">
              <p className="font-heading text-coral text-lg mb-1">
                {result.sessionName.toUpperCase()}
              </p>
              <p className="text-foreground-muted text-sm leading-relaxed">
                {result.sessionDetail}
              </p>
            </div>
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
              OR GET THIS COACHED &rarr;
            </Link>
            <button
              type="button"
              onClick={() => {
                setVolume(null);
                setDuration(null);
                setDistribution(null);
                setStep("volume");
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

interface DiagnosticQuestionProps {
  question: string;
  options: { value: string; label: string; detail: string }[];
  onSelect: (value: string) => void;
}

function DiagnosticQuestion({
  question,
  options,
  onSelect,
}: DiagnosticQuestionProps) {
  return (
    <div>
      <p className="text-off-white text-lg md:text-xl mb-5">{question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
