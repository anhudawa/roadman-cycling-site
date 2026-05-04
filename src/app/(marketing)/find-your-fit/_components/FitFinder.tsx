"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

type TierId = "clubhouse" | "notDoneYet" | "innerCircle" | "oneOnOne";

type Scores = Record<TierId, number>;

interface Option {
  id: string;
  label: string;
  blurb: string;
  scores: Partial<Scores>;
}

interface Question {
  id: "goal" | "hours" | "frustration" | "style" | "investment";
  kicker: string;
  heading: string;
  hint?: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: "goal",
    kicker: "Question 1 of 5",
    heading: "What's the main thing you want from cycling right now?",
    hint: "Pick the one closest to the truth — even if more than one fits.",
    options: [
      {
        id: "explore",
        label: "Get smarter — listen, learn, hang out with serious riders",
        blurb: "You're in the room for the conversation, not the course.",
        scores: { clubhouse: 3 },
      },
      {
        id: "structured",
        label: "Get faster on a structured plan with a real community",
        blurb: "You want a system you can trust, with people pulling alongside you.",
        scores: { notDoneYet: 3, innerCircle: 1 },
      },
      {
        id: "peak",
        label: "Hit a peak event with daily coach support",
        blurb: "There's a date on the calendar and you don't want to wing it.",
        scores: { innerCircle: 3, notDoneYet: 1 },
      },
      {
        id: "transform",
        label: "Total transformation — full custom programming, all-in",
        blurb: "You want a coach who knows your training, life, and ambitions cold.",
        scores: { oneOnOne: 3, innerCircle: 1 },
      },
    ],
  },
  {
    id: "hours",
    kicker: "Question 2 of 5",
    heading: "Roughly how many hours a week can you ride?",
    hint: "Honest weekly average — not your best week of the year.",
    options: [
      {
        id: "under-5",
        label: "Under 5 hours",
        blurb: "Time-crunched. Every session has to count.",
        scores: { clubhouse: 2, notDoneYet: 1 },
      },
      {
        id: "5-8",
        label: "5 to 8 hours",
        blurb: "Most serious amateurs live here.",
        scores: { notDoneYet: 3, innerCircle: 1 },
      },
      {
        id: "9-12",
        label: "9 to 12 hours",
        blurb: "Real volume. Worth real coaching.",
        scores: { innerCircle: 3, oneOnOne: 1 },
      },
      {
        id: "13-plus",
        label: "13 or more hours",
        blurb: "You're training like the goal is genuine performance.",
        scores: { oneOnOne: 3, innerCircle: 2 },
      },
    ],
  },
  {
    id: "frustration",
    kicker: "Question 3 of 5",
    heading: "What's the biggest thing getting in your way?",
    options: [
      {
        id: "none",
        label: "Honestly nothing — I just want quality cycling chat",
        blurb: "You're here for the conversation and the people.",
        scores: { clubhouse: 3 },
      },
      {
        id: "noise",
        label: "Conflicting advice. No clear plan I trust",
        blurb: "Everyone has a hot take. You want one system that actually works.",
        scores: { notDoneYet: 3, innerCircle: 1 },
      },
      {
        id: "plateau",
        label: "Stuck on a plateau — I need someone reading my data",
        blurb: "You've trained hard. The numbers haven't moved. You want eyes on it.",
        scores: { innerCircle: 3, oneOnOne: 1 },
      },
      {
        id: "high-stakes",
        label: "I'm chasing a serious goal and can't afford to get it wrong",
        blurb: "The window matters. You want a coach fully bought into your result.",
        scores: { oneOnOne: 3, innerCircle: 1 },
      },
    ],
  },
  {
    id: "style",
    kicker: "Question 4 of 5",
    heading: "How do you actually like to learn?",
    options: [
      {
        id: "self-directed",
        label: "Self-directed — podcasts, threads, dig till I find it",
        blurb: "You'll do the work. You just want quality signal.",
        scores: { clubhouse: 3 },
      },
      {
        id: "structure-community",
        label: "Structure plus a community to keep me honest",
        blurb: "A plan you didn't have to build, around people who train.",
        scores: { notDoneYet: 3 },
      },
      {
        id: "weekly-coach",
        label: "A coach guiding me weekly with personal feedback",
        blurb: "You want someone reviewing the work and adjusting it.",
        scores: { innerCircle: 3, oneOnOne: 1 },
      },
      {
        id: "full-1to1",
        label: "Full 1:1 — programming everything around me",
        blurb: "Calls, custom plans, a coach who knows your life.",
        scores: { oneOnOne: 3 },
      },
    ],
  },
  {
    id: "investment",
    kicker: "Question 5 of 5",
    heading: "What level of investment makes sense right now?",
    hint: "Pick what's honestly comfortable — there's a fit at every level.",
    options: [
      {
        id: "free",
        label: "Free for now",
        blurb: "Start in the room. Upgrade if and when it makes sense.",
        scores: { clubhouse: 5 },
      },
      {
        id: "under-100",
        label: "Up to about $100 a month",
        blurb: "A real system without a 1:1 price tag.",
        scores: { notDoneYet: 4 },
      },
      {
        id: "300-600",
        label: "$300 to $600 a month for a real coach",
        blurb: "Daily coach feedback territory.",
        scores: { innerCircle: 4, oneOnOne: 1 },
      },
      {
        id: "premium",
        label: "Whatever it takes — premium 1:1",
        blurb: "Top-end coaching, fully bespoke.",
        scores: { oneOnOne: 4, innerCircle: 1 },
      },
    ],
  },
];

const TIERS: Record<
  TierId,
  {
    name: string;
    price: string;
    href: string;
    tagline: string;
    bullets: string[];
    cta: string;
    track: string;
    pixelValue: number;
  }
> = {
  clubhouse: {
    name: "Free Clubhouse",
    price: "Free",
    href: "/community/clubhouse",
    tagline:
      "The room. No card. No pressure. Real cyclists trading real notes.",
    bullets: [
      "Free community of riders training around real lives",
      "Weekly live Q&A with Anthony",
      "Threads on training, nutrition, recovery, racing",
      "Start here — upgrade later if and when you want to",
    ],
    cta: "Join the Clubhouse",
    track: "find_your_fit_result_clubhouse",
    pixelValue: 0,
  },
  notDoneYet: {
    name: "Not Done Yet",
    price: "$95 / month",
    href: "/community/not-done-yet",
    tagline:
      "The system that ends the guessing. A real plan, a real community, a coach in the room.",
    bullets: [
      "Personalised training plan built around your week",
      "Weekly live coaching call with Anthony",
      "Five-pillar framework: training, nutrition, strength, recovery, community",
      "Private community of serious cyclists training to the same standard",
    ],
    cta: "Explore Not Done Yet",
    track: "find_your_fit_result_ndy",
    pixelValue: 95,
  },
  innerCircle: {
    name: "Inner Circle",
    price: "$525 / month",
    href: "/inner-circle",
    tagline:
      "A coach reading your data daily. Six pillars including Performance Health.",
    bullets: [
      "Daily session review and same-day written feedback",
      "Personalised plan adjusted as your week changes",
      "Performance Health: bloods, biomarkers, hormones, inflammation",
      "Limited intake — only as many riders as can be coached well",
    ],
    cta: "See the Inner Circle",
    track: "find_your_fit_result_inner_circle",
    pixelValue: 525,
  },
  oneOnOne: {
    name: "1:1 Coaching",
    price: "By application",
    href: "/apply",
    tagline:
      "Premium private coaching. Custom programming around your life and your goal.",
    bullets: [
      "Application-only — small cohorts, real fit conversations",
      "Custom training, nutrition, and strength programming",
      "Direct line to your coach for the work that actually matters",
      "Built for riders chasing a specific, time-bound result",
    ],
    cta: "Start your application",
    track: "find_your_fit_result_one_on_one",
    pixelValue: 525,
  },
};

const EMPTY_SCORES: Scores = {
  clubhouse: 0,
  notDoneYet: 0,
  innerCircle: 0,
  oneOnOne: 0,
};

type Answers = Partial<Record<Question["id"], string>>;

const TIER_CEILING_BY_INVESTMENT: Record<string, TierId> = {
  free: "clubhouse",
  "under-100": "notDoneYet",
  "300-600": "innerCircle",
  premium: "oneOnOne",
};

const TIER_RANK: TierId[] = [
  "clubhouse",
  "notDoneYet",
  "innerCircle",
  "oneOnOne",
];

function computeWinner(answers: Answers): TierId {
  const scores: Scores = { ...EMPTY_SCORES };
  for (const q of QUESTIONS) {
    const choice = answers[q.id];
    if (!choice) continue;
    const opt = q.options.find((o) => o.id === choice);
    if (!opt) continue;
    for (const [tier, value] of Object.entries(opt.scores) as [TierId, number][]) {
      scores[tier] += value;
    }
  }

  const investmentChoice = answers.investment;
  const ceiling = investmentChoice
    ? TIER_CEILING_BY_INVESTMENT[investmentChoice]
    : null;

  // The investment answer is a real budget signal. Even if a rider
  // scores high on Inner Circle but says "free", routing them to a
  // $525/mo product is a bad fit — start them in the room and let
  // ascension do the work.
  let candidates = TIER_RANK;
  if (ceiling) {
    const ceilingIndex = TIER_RANK.indexOf(ceiling);
    candidates = TIER_RANK.slice(0, ceilingIndex + 1);
  }

  let winner: TierId = candidates[0];
  let best = -Infinity;
  for (const tier of candidates) {
    if (scores[tier] > best) {
      best = scores[tier];
      winner = tier;
    }
  }
  return winner;
}

function fireLeadPixel(tier: TierId): void {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (!fbq) return;
  const t = TIERS[tier];
  fbq("track", "Lead", {
    content_name: t.name,
    content_category: "find-your-fit",
    value: t.pixelValue,
    currency: "USD",
  });
}

export function FitFinder() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [completed, setCompleted] = useState(false);

  const totalSteps = QUESTIONS.length;
  const isResults = completed;
  const progressPct = isResults
    ? 100
    : Math.round(((stepIndex + 1) / (totalSteps + 1)) * 100);

  const winner = useMemo(() => (isResults ? computeWinner(answers) : null), [isResults, answers]);

  useEffect(() => {
    if (!winner) return;
    fireLeadPixel(winner);
    trackAnalyticsEvent({
      type: "find_your_fit_result",
      page: "/find-your-fit",
      meta: { tier: winner, ...sanitizeAnswers(answers) },
    });
  }, [winner, answers]);

  const handleSelect = (questionId: Question["id"], optionId: string) => {
    const next: Answers = { ...answers, [questionId]: optionId };
    setAnswers(next);
    trackAnalyticsEvent({
      type: "find_your_fit_progress",
      page: "/find-your-fit",
      meta: { question: questionId, value: optionId, step: String(stepIndex + 1) },
    });
    if (stepIndex < totalSteps - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (isResults) {
      setCompleted(false);
      setStepIndex(totalSteps - 1);
      return;
    }
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleRestart = () => {
    setAnswers({});
    setStepIndex(0);
    setCompleted(false);
  };

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <ProgressBar
        percent={progressPct}
        stepLabel={
          isResults
            ? "Your fit"
            : `Step ${stepIndex + 1} of ${totalSteps}`
        }
      />

      <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6 md:p-10">
        {!isResults && (
          <QuestionStep
            question={QUESTIONS[stepIndex]}
            selectedId={answers[QUESTIONS[stepIndex].id] ?? null}
            onSelect={(optionId) =>
              handleSelect(QUESTIONS[stepIndex].id, optionId)
            }
            onBack={stepIndex > 0 ? handleBack : null}
          />
        )}

        {isResults && winner && (
          <ResultStep
            tier={winner}
            answers={answers}
            onBack={handleBack}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}

function ProgressBar({
  percent,
  stepLabel,
}: {
  percent: number;
  stepLabel: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-foreground-muted mb-2">
        <span>{stepLabel}</span>
        <span>{percent}%</span>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full bg-coral transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function QuestionStep({
  question,
  selectedId,
  onSelect,
  onBack,
}: {
  question: Question;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: (() => void) | null;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-coral font-heading">
        {question.kicker}
      </p>
      <h2 className="mt-3 font-heading text-3xl md:text-4xl text-off-white leading-tight">
        {question.heading}
      </h2>
      {question.hint && (
        <p className="mt-3 text-foreground-muted text-base">{question.hint}</p>
      )}

      <div className="mt-7 space-y-3" role="radiogroup" aria-label={question.heading}>
        {question.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(opt.id)}
              className={`w-full text-left rounded-xl border p-4 md:p-5 transition-all cursor-pointer
                ${
                  isSelected
                    ? "border-coral bg-coral/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
                }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 inline-block h-4 w-4 rounded-full border-2 flex-shrink-0 transition-colors
                    ${
                      isSelected
                        ? "border-coral bg-coral"
                        : "border-white/30"
                    }`}
                  aria-hidden
                />
                <div>
                  <div className="font-heading tracking-wide text-off-white text-lg md:text-xl uppercase">
                    {opt.label}
                  </div>
                  <div className="mt-1 text-foreground-muted text-sm md:text-base leading-snug">
                    {opt.blurb}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-foreground-muted hover:text-off-white text-sm uppercase tracking-[0.2em] font-heading cursor-pointer"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        <span className="text-xs text-foreground-subtle">
          Pick one to continue
        </span>
      </div>
    </div>
  );
}

function ResultStep({
  tier,
  answers,
  onBack,
  onRestart,
}: {
  tier: TierId;
  answers: Answers;
  onBack: () => void;
  onRestart: () => void;
}) {
  const t = TIERS[tier];
  const reasons = buildReasons(tier, answers);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-coral font-heading">
        Your fit
      </p>
      <h2 className="mt-3 font-heading text-4xl md:text-5xl text-off-white leading-[0.95] uppercase">
        {t.name}
      </h2>
      <p className="mt-2 font-heading tracking-wide text-coral text-2xl">
        {t.price}
      </p>
      <p className="mt-5 text-foreground-muted text-lg leading-relaxed">
        {t.tagline}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-heading tracking-[0.2em] text-off-white uppercase text-sm">
            Why this fits you
          </h3>
          <ul className="mt-3 space-y-2 text-foreground-muted text-base">
            {reasons.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="text-coral mt-1 flex-shrink-0">▸</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading tracking-[0.2em] text-off-white uppercase text-sm">
            What you get
          </h3>
          <ul className="mt-3 space-y-2 text-foreground-muted text-base">
            {t.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-coral mt-1 flex-shrink-0">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:items-center">
        <Link
          href={t.href}
          data-track={t.track}
          className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral hover:bg-coral-hover text-off-white px-8 py-4 text-base shadow-[var(--shadow-glow-coral)] hover:shadow-[0_0_30px_rgba(241,99,99,0.4)] transition-all active:scale-[0.97]"
        >
          {t.cta} →
        </Link>
        <Link
          href="/community"
          className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md border border-white/20 hover:border-white/40 text-off-white px-8 py-4 text-base transition-all"
        >
          See all options
        </Link>
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-foreground-muted hover:text-off-white text-sm uppercase tracking-[0.2em] font-heading cursor-pointer"
        >
          ← Tweak my answers
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="text-foreground-muted hover:text-off-white text-sm uppercase tracking-[0.2em] font-heading cursor-pointer"
        >
          Start over
        </button>
      </div>
    </div>
  );
}

// ── Reason logic ──────────────────────────────────────────
// Pull the strongest "why" lines out of the user's actual answers so
// the result feels written for them, not generic. Each reason maps a
// (question, answer) pair into a sentence — only the ones that
// reinforce the recommended tier are surfaced.
function buildReasons(tier: TierId, answers: Answers): string[] {
  const reasons: string[] = [];

  const goal = answers.goal;
  if (tier === "clubhouse" && goal === "explore")
    reasons.push("You said you want to learn and hang out — the room comes first, the rest is optional.");
  if (tier === "notDoneYet" && goal === "structured")
    reasons.push("You want a structured plan with people pulling alongside you — that's exactly the Not Done Yet model.");
  if (tier === "innerCircle" && goal === "peak")
    reasons.push("You've got a peak event on the calendar. Daily coach feedback is what gets you to the start line ready.");
  if (tier === "oneOnOne" && goal === "transform")
    reasons.push("You're after total transformation — that needs a coach who knows your training, life, and ambitions cold.");

  const hours = answers.hours;
  if (hours === "under-5" && tier === "clubhouse")
    reasons.push("Under 5 hours a week — start in the room, build the habits, then upgrade when the time's right.");
  if (hours === "5-8" && tier === "notDoneYet")
    reasons.push("Five to eight hours is the sweet spot for a structured plan you can actually follow.");
  if (hours === "9-12" && tier === "innerCircle")
    reasons.push("Nine to twelve hours of training a week deserves a coach reading every session.");
  if (hours === "13-plus" && (tier === "oneOnOne" || tier === "innerCircle"))
    reasons.push("At thirteen-plus hours a week you're training like a serious athlete — coaching should match.");

  const frustration = answers.frustration;
  if (frustration === "noise" && tier === "notDoneYet")
    reasons.push("You're tired of conflicting advice. One trusted system beats ten half-followed ones.");
  if (frustration === "plateau" && tier === "innerCircle")
    reasons.push("If you're stuck on a plateau, the fix usually isn't more effort — it's another set of eyes on your data.");
  if (frustration === "high-stakes" && tier === "oneOnOne")
    reasons.push("You said you can't afford to get this wrong — that's exactly when 1:1 coaching earns its keep.");
  if (frustration === "none" && tier === "clubhouse")
    reasons.push("Nothing's broken — you just want quality cycling chat. The Clubhouse is the room for that.");

  const style = answers.style;
  if (style === "self-directed" && tier === "clubhouse")
    reasons.push("You like to dig — the Clubhouse plus the podcast back-catalogue is the deepest free signal you'll find.");
  if (style === "structure-community" && tier === "notDoneYet")
    reasons.push("Structure plus community — Not Done Yet is built around exactly that combination.");
  if (style === "weekly-coach" && tier === "innerCircle")
    reasons.push("You want weekly personal feedback — Inner Circle gives you that, and same-day reviews on top.");
  if (style === "full-1to1" && tier === "oneOnOne")
    reasons.push("Full 1:1 is the only setup that gives you a coach building everything around you.");

  const investment = answers.investment;
  if (investment === "free" && tier === "clubhouse")
    reasons.push("Free for now — start here, prove the system to yourself, and ascend when you're ready.");
  if (investment === "under-100" && tier === "notDoneYet")
    reasons.push("At $95 a month, Not Done Yet is the most leverage you can buy under a hundred bucks.");
  if (investment === "300-600" && tier === "innerCircle")
    reasons.push("Inner Circle sits in your investment range and gives you daily coach feedback for it.");
  if (investment === "premium" && tier === "oneOnOne")
    reasons.push("You're willing to invest in premium — 1:1 coaching is the highest-leverage seat we offer.");

  // Always include at least two reasons so the result never feels
  // empty. If the answers don't all line up cleanly with the
  // recommended tier (e.g. budget capped a high-scoring one), fall
  // back to a tier-specific default.
  if (reasons.length < 2) {
    const fallback: Record<TierId, string> = {
      clubhouse:
        "Right now, the room is the best place to start — no card, no pressure, real cyclists.",
      notDoneYet:
        "It's the sweet spot — a real coaching system, a real community, without a 1:1 price tag.",
      innerCircle:
        "Inner Circle gives you everything Not Done Yet does, with a coach reading your data daily.",
      oneOnOne:
        "1:1 coaching is the right call when the goal is specific, time-bound, and you want full ownership of the plan.",
    };
    reasons.push(fallback[tier]);
  }
  return reasons.slice(0, 3);
}

function sanitizeAnswers(a: Answers): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(a)) {
    const v = a[k as keyof Answers];
    if (typeof v === "string") out[`q_${k}`] = v;
  }
  return out;
}
