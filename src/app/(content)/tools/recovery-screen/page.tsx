"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Question {
  id: string;
  label: string;
  options: { text: string; score: number }[];
  recommendation: string;
}

const QUESTIONS: Question[] = [
  {
    id: "sleep-duration",
    label: "How many hours do you typically sleep?",
    options: [
      { text: "Less than 6 hours", score: 0 },
      { text: "6–7 hours", score: 1 },
      { text: "7–8 hours", score: 2 },
      { text: "8+ hours", score: 3 },
    ],
    recommendation:
      "Aim for 7–8 hours of sleep. Research consistently shows this is the minimum for adequate recovery from training. Set a non-negotiable bedtime and work backwards from your alarm.",
  },
  {
    id: "sleep-quality",
    label: "How would you rate your sleep quality?",
    options: [
      { text: "Poor — wake frequently", score: 0 },
      { text: "Fair", score: 1 },
      { text: "Good", score: 2 },
      { text: "Excellent — deep, unbroken", score: 3 },
    ],
    recommendation:
      "Improve sleep hygiene: consistent wake time, cool dark room (16–18°C), no screens 60 minutes before bed, and limit caffeine after midday.",
  },
  {
    id: "training-frequency",
    label: "How many days per week do you train?",
    options: [
      { text: "6–7 days", score: 0 },
      { text: "5 days", score: 1 },
      { text: "3–4 days", score: 2 },
      { text: "1–2 days", score: 3 },
    ],
    recommendation:
      "You may be training too frequently for your current recovery capacity. Consider consolidating sessions — three quality days often beats six mediocre ones.",
  },
  {
    id: "rest-days",
    label: "How many complete rest days do you take per week?",
    options: [
      { text: "0 rest days", score: 0 },
      { text: "1 rest day", score: 1 },
      { text: "2 rest days", score: 2 },
      { text: "3+ rest days", score: 3 },
    ],
    recommendation:
      "Schedule at least two complete rest days per week. Rest is when adaptation happens. Without it, you are accumulating fatigue without banking fitness.",
  },
  {
    id: "post-ride-nutrition",
    label: "How quickly do you eat after hard sessions?",
    options: [
      { text: "More than 2 hours", score: 0 },
      { text: "1–2 hours", score: 1 },
      { text: "30–60 minutes", score: 2 },
      { text: "Under 30 minutes", score: 3 },
    ],
    recommendation:
      "Eat within 30 minutes of finishing hard sessions. A 3:1 carb-to-protein ratio (e.g. 60g carbs, 20g protein) accelerates glycogen replenishment and muscle repair.",
  },
  {
    id: "stress-level",
    label: "How would you rate your current life stress?",
    options: [
      { text: "Very high", score: 0 },
      { text: "High", score: 1 },
      { text: "Moderate", score: 2 },
      { text: "Low", score: 3 },
    ],
    recommendation:
      "High life stress and training stress are additive — your body does not distinguish between them. During high-stress periods, reduce training volume by 20–30% or replace intensity with endurance work.",
  },
  {
    id: "morning-hr",
    label: "Do you track morning resting heart rate?",
    options: [
      { text: "No", score: 0 },
      { text: "Yes, it varies a lot", score: 1 },
      { text: "Yes, fairly stable", score: 2 },
      { text: "Yes, very consistent", score: 3 },
    ],
    recommendation:
      "Start tracking morning resting heart rate. A consistent reading indicates good recovery; a jump of 5+ bpm suggests accumulated fatigue. Takes 30 seconds with any wrist-based tracker.",
  },
  {
    id: "fatigue-pattern",
    label: "How do you feel most mornings?",
    options: [
      { text: "Exhausted", score: 0 },
      { text: "Tired", score: 1 },
      { text: "OK", score: 2 },
      { text: "Fresh", score: 3 },
    ],
    recommendation:
      "Persistent morning fatigue is one of the earliest overtraining markers. If this has lasted more than two weeks, consider a structured recovery week: 40–50% of normal volume, all Zone 1–2.",
  },
  {
    id: "performance-trend",
    label: "Over the last 4 weeks, your performance has…",
    options: [
      { text: "Declined noticeably", score: 0 },
      { text: "Stagnated", score: 1 },
      { text: "Held steady", score: 2 },
      { text: "Improved", score: 3 },
    ],
    recommendation:
      "Declining performance despite consistent training is a classic sign of under-recovery, not under-training. The fix is almost always more rest, not more work.",
  },
  {
    id: "motivation",
    label: "How motivated do you feel to train?",
    options: [
      { text: "Dreading it", score: 0 },
      { text: "Going through the motions", score: 1 },
      { text: "Generally keen", score: 2 },
      { text: "Can't wait", score: 3 },
    ],
    recommendation:
      "Loss of training motivation is a psychological marker of overreaching. Take three to five days completely off the bike. Most riders return stronger and more enthusiastic.",
  },
];

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

interface ScoringBand {
  label: string;
  colour: string;
  summary: string;
}

function getBand(total: number): ScoringBand {
  if (total <= 10)
    return {
      label: "Recovery Deficit",
      colour: "#EF4444",
      summary:
        "Recovery deficit likely. Major changes needed across multiple areas to avoid overtraining.",
    };
  if (total <= 18)
    return {
      label: "Recovery Gaps",
      colour: "#EAB308",
      summary:
        "Some recovery gaps present. Targeted fixes in your weakest areas will make a measurable difference.",
    };
  if (total <= 24)
    return {
      label: "Reasonable Recovery",
      colour: "#22C55E",
      summary:
        "Reasonable recovery practices overall. Fine-tuning in one or two areas could still unlock gains.",
    };
  return {
    label: "Strong Recovery",
    colour: "#3B82F6",
    summary:
      "Strong recovery practices. Maintain what you are doing and look for marginal optimisations.",
  };
}

interface CategoryScore {
  label: string;
  score: number;
  max: number;
}

function getCategories(answers: number[]): CategoryScore[] {
  return [
    { label: "Sleep", score: answers[0] + answers[1], max: 6 },
    { label: "Training Load", score: answers[2] + answers[3], max: 6 },
    { label: "Nutrition", score: answers[4], max: 3 },
    {
      label: "Stress & Wellbeing",
      score: answers[5] + answers[6] + answers[7] + answers[8] + answers[9],
      max: 15,
    },
  ];
}

function getTopRecommendations(answers: number[], count = 3): string[] {
  const indexed = answers.map((score, i) => ({ score, index: i }));
  indexed.sort((a, b) => a.score - b.score);
  return indexed.slice(0, count).map((item) => QUESTIONS[item.index].recommendation);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function RecoveryScreenPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(QUESTIONS.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Clean up timer on unmount */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSelect = useCallback(
    (score: number, optionIndex: number) => {
      setSelectedIndex(optionIndex);

      const updated = [...answers];
      updated[currentQ] = score;
      setAnswers(updated);

      timerRef.current = setTimeout(() => {
        setSelectedIndex(null);
        if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ((prev) => prev + 1);
        } else {
          setShowResults(true);
        }
      }, 400);
    },
    [answers, currentQ]
  );

  const handleBack = useCallback(() => {
    if (showResults) {
      setShowResults(false);
      return;
    }
    if (currentQ > 0) {
      setSelectedIndex(null);
      setCurrentQ((prev) => prev - 1);
    }
  }, [currentQ, showResults]);

  const handleReset = useCallback(() => {
    setAnswers(new Array(QUESTIONS.length).fill(null));
    setCurrentQ(0);
    setShowResults(false);
    setSelectedIndex(null);
  }, []);

  const totalScore = answers.reduce<number>((sum, a) => sum + (a ?? 0), 0);
  const band = getBand(totalScore);
  const categories = getCategories(answers as number[]);
  const recommendations = getTopRecommendations(answers as number[]);

  const progress = showResults
    ? 100
    : ((currentQ + (answers[currentQ] !== null ? 1 : 0)) / QUESTIONS.length) * 100;

  const question = QUESTIONS[currentQ];

  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Diagnostic Tool
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              RECOVERY READINESS SCREEN
            </h1>
            <p className="text-foreground-muted text-lg">
              Ten questions. Two minutes. A clear read on whether your recovery is keeping
              pace with your training.
            </p>
          </Container>
        </Section>

        {/* Diagnostic / Results */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            {/* Progress bar */}
            {!showResults && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground-muted text-sm font-heading tracking-wider">
                    QUESTION {currentQ + 1} OF {QUESTIONS.length}
                  </span>
                  <span className="text-foreground-subtle text-sm">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "#F16363" }}
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {!showResults ? (
                  /* ---- Question view ---- */
                  <motion.div
                    key={`q-${currentQ}`}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="bg-background-elevated rounded-xl border border-white/5 p-8">
                      <h2 className="font-heading text-2xl text-off-white mb-6">
                        {question.label.toUpperCase()}
                      </h2>

                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        role="group"
                        aria-label={question.label}
                      >
                        {question.options.map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelect(opt.score, i)}
                            aria-pressed={answers[currentQ] === opt.score && selectedIndex === i}
                            className={`py-4 px-5 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer text-left ${
                              selectedIndex === i
                                ? "bg-coral text-off-white"
                                : answers[currentQ] === opt.score && selectedIndex === null
                                  ? "bg-white/10 text-off-white border border-coral/40"
                                  : "bg-white/5 text-foreground-muted hover:bg-white/10"
                            }`}
                          >
                            {opt.text}
                          </button>
                        ))}
                      </div>

                      {currentQ > 0 && (
                        <button
                          type="button"
                          onClick={handleBack}
                          className="mt-6 text-sm text-foreground-muted hover:text-off-white font-heading tracking-wider transition-colors cursor-pointer"
                        >
                          &larr; BACK
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  /* ---- Results view ---- */
                  <motion.div
                    key="results"
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-heading text-2xl text-off-white">YOUR RESULTS</h2>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                      >
                        Retake
                      </button>
                    </div>

                    {/* Score hero */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-8 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    >
                      <p
                        className="font-heading text-7xl md:text-8xl mb-2"
                        style={{ color: band.colour }}
                      >
                        {totalScore}
                      </p>
                      <p
                        className="font-heading text-lg tracking-widest"
                        style={{ color: band.colour }}
                      >
                        {band.label.toUpperCase()}
                      </p>
                      <p className="text-foreground-muted mt-3 max-w-md mx-auto leading-relaxed">
                        {band.summary}
                      </p>
                      <p className="text-foreground-subtle text-xs mt-2">
                        Score: {totalScore} / 30
                      </p>
                    </motion.div>

                    {/* Category breakdown */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.18 }}
                    >
                      <h3 className="font-heading text-lg text-off-white">CATEGORY BREAKDOWN</h3>
                      {categories.map((cat) => {
                        const pct = (cat.score / cat.max) * 100;
                        return (
                          <div key={cat.label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-foreground-muted text-sm">{cat.label}</span>
                              <span className="text-off-white font-heading text-sm tracking-wider">
                                {cat.score} / {cat.max}
                              </span>
                            </div>
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor:
                                    pct >= 70
                                      ? "#22C55E"
                                      : pct >= 40
                                        ? "#EAB308"
                                        : "#EF4444",
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>

                    {/* Recommendations */}
                    <motion.div
                      className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6 space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.28 }}
                    >
                      <h3 className="font-heading text-lg text-off-white">
                        TOP RECOMMENDATIONS
                      </h3>
                      {recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-3">
                          <span
                            className="font-heading text-lg shrink-0 mt-0.5"
                            style={{ color: "#F16363" }}
                          >
                            {i + 1}.
                          </span>
                          <p className="text-foreground-muted text-sm leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </motion.div>

                    {/* Related tools */}
                    <motion.div
                      className="rounded-xl border border-white/10 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.36 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-3">RELATED TOOLS</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/tools/masters-recovery-score"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Masters Recovery Score &mdash; age-calibrated recovery audit
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/training-load"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Training Load Calculator &mdash; CTL/ATL/TSB analysis
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/hr-zones"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Heart Rate Zone Calculator &mdash; set your training zones
                          </Link>
                        </li>
                      </ul>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section background="charcoal" className="!pt-0 !pb-12">
          <Container width="narrow">
            <motion.div
              className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.7 }}
            >
              <p className="font-heading text-off-white text-lg md:text-xl mb-2">
                RECOVERY IS WHERE THE GAINS HAPPEN
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Join 1,000+ cyclists who train smarter, not just harder. Weekly recovery
                protocols, training advice, and a community that gets it.
              </p>
              <a
                href="https://www.skool.com/roadmancycling"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="tool_recovery_screen_skool"
              >
                Join the Community
              </a>
            </motion.div>
          </Container>
        </Section>

        {/* Methodology */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              METHODOLOGY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">How it works:</strong> Ten questions scored
                0&ndash;3 produce a total between 0 and 30. Questions are grouped into four
                categories: Sleep (questions 1&ndash;2, max 6), Training Load (questions
                3&ndash;4, max 6), Nutrition (question 5, max 3), and Stress &amp; Wellbeing
                (questions 6&ndash;10, max 15).
              </p>
              <p>
                <strong className="text-off-white">Scoring bands:</strong> 0&ndash;10 Recovery
                Deficit (red), 11&ndash;18 Recovery Gaps (amber), 19&ndash;24 Reasonable
                Recovery (green), 25&ndash;30 Strong Recovery (blue). The top three
                lowest-scoring questions generate personalised recommendations.
              </p>
              <p>
                <strong className="text-off-white">Disclaimer:</strong> This is a
                self-assessment tool for informational purposes only. It is not a medical
                diagnostic and does not replace professional advice. If you are experiencing
                persistent fatigue, unexplained performance decline, or symptoms of
                overtraining syndrome, consult your GP or a sports medicine professional.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 &middot; Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
