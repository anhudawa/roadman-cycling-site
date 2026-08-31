"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";

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
    label:
      "Compared with your own sleep need, how much sleep opportunity do you usually get?",
    options: [
      { text: "Well short most nights", score: 0 },
      { text: "Short on several nights", score: 1 },
      { text: "Usually close to enough", score: 2 },
      { text: "Consistently enough to wake restored", score: 3 },
    ],
    recommendation:
      "Protect a consistent sleep opportunity and compare it with your own perceived need. Athlete sleep guidance supports an individual approach rather than one universal nightly number.",
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
      "Start with a consistent schedule and reduce the disruptions you can control. Persistent sleep difficulty, loud snoring or daytime sleepiness deserve qualified assessment rather than another generic sleep-hygiene rule.",
  },
  {
    id: "recent-load-change",
    label: "How has your total bike, strength and life load changed recently?",
    options: [
      { text: "Large rise I am not absorbing", score: 0 },
      { text: "Noticeable rise with accumulating fatigue", score: 1 },
      { text: "Similar to my usual load", score: 2 },
      { text: "Planned change and recovering well", score: 3 },
    ],
    recommendation:
      "Review recent load relative to your own baseline and response. Training-day count alone does not reveal whether a week is excessive; duration, intensity, strength work, life stress and training history all matter.",
  },
  {
    id: "recovery-opportunity",
    label: "Have easier days matched the demanding work in your recent week?",
    options: [
      { text: "No — demanding days keep stacking", score: 0 },
      { text: "Not consistently", score: 1 },
      { text: "Mostly", score: 2 },
      { text: "Yes — and key sessions stay productive", score: 3 },
    ],
    recommendation:
      "Create enough recovery opportunity for the work you are doing. There is no universal number of complete rest days that fits every cyclist, so judge the pattern by completed quality, symptoms and recovery.",
  },
  {
    id: "post-ride-nutrition",
    label:
      "After demanding rides, especially with another session soon, how well do you replace fuel and fluid?",
    options: [
      { text: "I often miss both", score: 0 },
      { text: "It is inconsistent", score: 1 },
      { text: "I usually cover them", score: 2 },
      { text: "It is planned to the session and turnaround", score: 3 },
    ],
    recommendation:
      "Prioritise adequate total energy, carbohydrate, protein and fluid. Rapid refuelling matters most when recovery time is short; one fixed 30-minute window or carb-to-protein ratio does not fit every session.",
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
      "Treat high life stress as part of the week's context. Adjust training only when the combined pattern and session quality warrant it; this screen cannot justify one fixed percentage reduction.",
  },
  {
    id: "morning-hr",
    label:
      "Compared with your own baseline, what do your morning signals show?",
    options: [
      { text: "Several unusual changes with symptoms", score: 0 },
      { text: "A persistent unfavourable trend", score: 1 },
      { text: "Near usual, or I have no reliable baseline", score: 2 },
      { text: "Stable and I feel normal", score: 3 },
    ],
    recommendation:
      "Use resting heart rate or wearable data as a trend alongside symptoms and self-report. No single beats-per-minute change diagnoses fatigue, and not tracking should not count as a recovery failure.",
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
      "Compare persistent fatigue with your baseline, recent load, sleep, illness and fuelling. If it worsens, disrupts daily life or comes with concerning symptoms, seek qualified healthcare advice rather than relying on this score.",
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
      "A performance decline can reflect load, poor recovery, illness, low energy availability, measurement noise or a mismatched plan. Review the pattern before assuming either more work or more rest is the answer.",
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
      "One low-motivation day is common. A persistent change alongside other unfavourable signals deserves a wider review; it does not prove overreaching or prescribe a fixed number of days off.",
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
      label: "Multiple Constraints",
      colour: "#EF4444",
      summary:
        "Several answers are unfavourable. Review the pattern conservatively; this result does not diagnose under-recovery or overtraining.",
    };
  if (total <= 18)
    return {
      label: "Constraints to Review",
      colour: "#EAB308",
      summary:
        "Some recovery supports or response signals deserve attention before more load is added.",
    };
  if (total <= 24)
    return {
      label: "Mostly Supported",
      colour: "#22C55E",
      summary:
        "Most answers are favourable, with a small number of constraints to review in context.",
    };
  return {
    label: "Favourable Signals",
    colour: "#3B82F6",
    summary:
      "Your current self-reported pattern is broadly favourable. It is not a guarantee of readiness or performance.",
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
    { label: "Load & Recovery", score: answers[2] + answers[3], max: 6 },
    { label: "Fuelling", score: answers[4], max: 3 },
    {
      label: "Stress & Response",
      score: answers[5] + answers[6] + answers[7] + answers[8] + answers[9],
      max: 15,
    },
  ];
}

function getTopRecommendations(answers: number[], count = 3): string[] {
  const indexed = answers.map((score, i) => ({ score, index: i }));
  indexed.sort((a, b) => a.score - b.score);
  return indexed
    .slice(0, count)
    .map((item) => QUESTIONS[item.index].recommendation);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function RecoveryScreenPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    new Array(QUESTIONS.length).fill(null),
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
    [answers, currentQ],
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
    : ((currentQ + (answers[currentQ] !== null ? 1 : 0)) / QUESTIONS.length) *
      100;

  const question = QUESTIONS[currentQ];

  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Recovery Context Tool
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              RECOVERY READINESS SCREEN
            </h1>
            <p className="text-foreground-muted text-lg">
              Ten questions. Two minutes. Organise the sleep, load, fuelling,
              stress and response signals that shape recovery.
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
                            aria-pressed={
                              answers[currentQ] === opt.score &&
                              selectedIndex === i
                            }
                            className={`py-4 px-5 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer text-left ${
                              selectedIndex === i
                                ? "bg-coral text-off-white"
                                : answers[currentQ] === opt.score &&
                                    selectedIndex === null
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
                      <h2 className="font-heading text-2xl text-off-white">
                        YOUR RESULTS
                      </h2>
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
                      <h3 className="font-heading text-lg text-off-white">
                        CATEGORY BREAKDOWN
                      </h3>
                      {categories.map((cat) => {
                        const pct = (cat.score / cat.max) * 100;
                        return (
                          <div key={cat.label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-foreground-muted text-sm">
                                {cat.label}
                              </span>
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
                                transition={{
                                  duration: 0.5,
                                  delay: 0.25,
                                  ease: "easeOut",
                                }}
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
                        PRIORITIES TO REVIEW
                      </h3>
                      {recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-3">
                          <span
                            className="font-heading text-lg shrink-0 mt-0.5"
                            style={{ color: "#F16363" }}
                          >
                            {i + 1}.
                          </span>
                          <p className="text-foreground-muted text-sm leading-relaxed">
                            {rec}
                          </p>
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
                      <h3 className="font-heading text-lg text-off-white mb-3">
                        RELATED TOOLS
                      </h3>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/tools/masters-recovery-score"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Masters Recovery Score &mdash; age-calibrated
                            recovery audit
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/training-load"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Training Load Calculator &mdash; CTL/ATL/TSB
                            analysis
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/hr-zones"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Heart Rate Zone Calculator &mdash; set your training
                            zones
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
                GIVE EVERY RECOVERY ACTION A JOB
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Roadman&apos;s upcoming iPhone app will place sleep opportunity,
                downshift, mobility and optional modalities only when your
                cycling and strength week gives them a reason.
              </p>
              <Link
                href="/app?source=recovery-screen"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="tool_recovery_screen_app"
              >
                Join App Early Access
              </Link>
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
                <strong className="text-off-white">How it works:</strong> Ten
                questions scored 0&ndash;3 produce a total between 0 and 30.
                Questions are grouped into four categories: Sleep (questions
                1&ndash;2, max 6), Load &amp; Recovery (questions 3&ndash;4, max
                6), Fuelling (question 5, max 3), and Stress &amp; Response
                (questions 6&ndash;10, max 15).
              </p>
              <p>
                <strong className="text-off-white">
                  What the score means:
                </strong>{" "}
                The four bands and top three priorities are Roadman heuristics
                for organising a conversation. They are not clinically validated
                cut-offs, diagnoses or proof that one intervention will improve
                performance.
              </p>
              <p>
                <strong className="text-off-white">Evidence boundary:</strong>{" "}
                Athlete self-report can help monitor change, but the validity of
                many common single-item measures remains limited. Sleep needs
                are also individual, and fuelling urgency depends on the work
                completed and time to the next session. Read the{" "}
                <a
                  className="text-coral hover:text-coral/80"
                  href="https://pubmed.ncbi.nlm.nih.gov/32957081/"
                >
                  athlete-report measurement review
                </a>
                ,{" "}
                <a
                  className="text-coral hover:text-coral/80"
                  href="https://pubmed.ncbi.nlm.nih.gov/33144349/"
                >
                  athlete sleep consensus
                </a>{" "}
                and{" "}
                <a
                  className="text-coral hover:text-coral/80"
                  href="https://pubmed.ncbi.nlm.nih.gov/26891166/"
                >
                  sports-nutrition position statement
                </a>
                .
              </p>
              <p>
                <strong className="text-off-white">Disclaimer:</strong> This is
                a self-assessment tool for informational purposes only. It is
                not a medical diagnostic and does not replace professional
                advice. If you are experiencing persistent fatigue, unexplained
                performance decline, or symptoms of overtraining syndrome,
                consult your GP or a sports medicine professional.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: August 2026 &middot; Tool version 1.1
              </p>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
