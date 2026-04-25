"use client";

import { useState } from "react";
import Link from "next/link";

const QUESTIONS = [
  {
    id: "training-years",
    question: "How long have you been training with structure?",
    options: [
      { label: "Less than 1 year", score: 0 },
      { label: "1-2 years", score: 1 },
      { label: "2-5 years", score: 2 },
      { label: "5+ years", score: 3 },
    ],
  },
  {
    id: "plateau",
    question: "Has your FTP or performance plateaued in the last 6 months?",
    options: [
      { label: "No, still improving", score: 0 },
      { label: "Slightly stalled", score: 1 },
      { label: "Yes, stuck for 6+ months", score: 3 },
      { label: "Going backwards", score: 3 },
    ],
  },
  {
    id: "hours",
    question: "How many hours per week can you train?",
    options: [
      { label: "Under 4 hours", score: 1 },
      { label: "4-8 hours", score: 3 },
      { label: "8-12 hours", score: 2 },
      { label: "12+ hours", score: 1 },
    ],
  },
  {
    id: "goal",
    question: "Do you have a specific event or goal in the next 12 months?",
    options: [
      { label: "No specific goal", score: 0 },
      { label: "General fitness", score: 1 },
      { label: "Yes, a sportive or gran fondo", score: 3 },
      { label: "Yes, racing or a time target", score: 3 },
    ],
  },
  {
    id: "accountability",
    question: "What's your biggest training challenge?",
    options: [
      { label: "Motivation and consistency", score: 2 },
      { label: "Knowing what to do", score: 3 },
      { label: "Balancing training with life", score: 3 },
      { label: "Nutrition and recovery", score: 2 },
    ],
  },
];

type Result = "ready" | "almost" | "wait";

function getResult(score: number): Result {
  if (score >= 10) return "ready";
  if (score >= 6) return "almost";
  return "wait";
}

const RESULTS: Record<Result, { headline: string; body: string; cta: string; ctaHref: string }> = {
  ready: {
    headline: "YOU'RE READY FOR COACHING.",
    body: "Your training history, goals, and current plateau make you an ideal candidate for structured coaching. You've outgrown what apps and self-coaching can deliver. A coach is the next step — not another app.",
    cta: "Apply for Not Done Yet",
    ctaHref: "/apply",
  },
  almost: {
    headline: "COACHING WOULD HELP — BUT TIMING MATTERS.",
    body: "You're in the zone where coaching starts to earn its keep. Consider whether you have a specific 12-month goal and the consistency to follow a plan. If yes, it's time. If not, start with our free tools and revisit when you're ready.",
    cta: "Explore Coaching",
    ctaHref: "/coaching",
  },
  wait: {
    headline: "NOT YET — AND THAT'S FINE.",
    body: "You're still in the early gains phase where structured apps and free content will deliver most of what you need. Build consistency first, learn your zones, and come back when you've hit a genuine plateau.",
    cta: "Free Training Tools",
    ctaHref: "/tools",
  },
};

export function CoachingAssessment() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUESTIONS.length;
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const result = getResult(totalScore);

  return (
    <div className="space-y-8">
      {QUESTIONS.map((q, i) => (
        <div
          key={q.id}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
        >
          <p className="font-heading text-coral text-xs tracking-widest mb-2">
            QUESTION {i + 1} OF {QUESTIONS.length}
          </p>
          <h3 className="font-heading text-off-white text-lg mb-4">
            {q.question}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt.score && answers[q.id] !== undefined;
              return (
                <button
                  key={opt.label}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: opt.score }))
                  }
                  className={`text-left px-4 py-3 rounded-lg border text-sm transition-all cursor-pointer ${
                    selected
                      ? "border-coral bg-coral/10 text-off-white"
                      : "border-white/10 hover:border-coral/30 text-foreground-muted hover:text-off-white"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {allAnswered && !showResult && (
        <div className="text-center">
          <button
            onClick={() => setShowResult(true)}
            className="font-heading tracking-wider uppercase bg-coral text-off-white hover:bg-coral/90 rounded-md px-8 py-4 text-lg transition-all cursor-pointer"
            data-track="assessment_submit"
          >
            See My Result
          </button>
        </div>
      )}

      {showResult && (
        <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-8 md:p-10 text-center">
          <h2
            className="font-heading text-off-white mb-4"
            style={{ fontSize: "var(--text-section)" }}
          >
            {RESULTS[result].headline}
          </h2>
          <p className="text-foreground-muted text-base md:text-lg mb-6 max-w-lg mx-auto leading-relaxed">
            {RESULTS[result].body}
          </p>
          <Link
            href={RESULTS[result].ctaHref}
            className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-8 py-4 text-base transition-all"
            data-track={`assessment_result_${result}`}
          >
            {RESULTS[result].cta} →
          </Link>
        </div>
      )}
    </div>
  );
}
