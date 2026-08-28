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
}

const QUESTIONS: Question[] = [
  {
    id: "sleep-hours",
    label: "How many hours did you sleep last night?",
    options: [
      { text: "Less than 5 hours", score: 0 },
      { text: "5–6 hours", score: 1 },
      { text: "6–7.5 hours", score: 2 },
      { text: "7.5+ hours", score: 3 },
    ],
  },
  {
    id: "sleep-quality",
    label: "How was your sleep quality?",
    options: [
      { text: "Terrible — woke constantly", score: 0 },
      { text: "Poor", score: 1 },
      { text: "OK", score: 2 },
      { text: "Slept well", score: 3 },
    ],
  },
  {
    id: "muscle-soreness",
    label: "How sore are your muscles right now?",
    options: [
      { text: "Very sore — can feel it walking", score: 0 },
      { text: "Moderate soreness", score: 1 },
      { text: "Mild", score: 2 },
      { text: "None", score: 3 },
    ],
  },
  {
    id: "energy-level",
    label: "What is your energy level right now?",
    options: [
      { text: "Exhausted", score: 0 },
      { text: "Low", score: 1 },
      { text: "Normal", score: 2 },
      { text: "High", score: 3 },
    ],
  },
  {
    id: "mood-motivation",
    label: "How do you feel about training today?",
    options: [
      { text: "Dreading it", score: 0 },
      { text: "Flat", score: 1 },
      { text: "Willing", score: 2 },
      { text: "Eager", score: 3 },
    ],
  },
  {
    id: "resting-hr",
    label: "Where is your resting heart rate this morning?",
    options: [
      { text: "10+ bpm above normal", score: 0 },
      { text: "5–10 bpm above normal", score: 1 },
      { text: "2–5 bpm above normal", score: 2 },
      { text: "Normal or below", score: 3 },
    ],
  },
  {
    id: "stress-level",
    label: "What is your stress level today?",
    options: [
      { text: "Very high", score: 0 },
      { text: "High", score: 1 },
      { text: "Moderate", score: 2 },
      { text: "Low", score: 3 },
    ],
  },
  {
    id: "yesterday-training",
    label: "What did you do yesterday?",
    options: [
      { text: "Hard session", score: 0 },
      { text: "Moderate session", score: 1 },
      { text: "Easy ride", score: 2 },
      { text: "Rest day", score: 3 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

interface ReadinessBand {
  verdict: string;
  colour: string;
  summary: string;
  suggestion: string;
}

function getBand(total: number): ReadinessBand {
  if (total <= 8)
    return {
      verdict: "REASSESS TODAY",
      colour: "#EF4444",
      summary:
        "Several readiness signals are unfavourable. Treat that as a prompt to review the day, not a diagnosis.",
      suggestion:
        "Check for illness, pain and unusual symptoms first. If those are absent, rest, easy movement or a reduced session may be sensible. Protect the next important ride and seek qualified advice when symptoms or an unexplained decline persist.",
    };
  if (total <= 14)
    return {
      verdict: "REDUCE THE ASK",
      colour: "#EAB308",
      summary:
        "The day contains enough unfavourable signals to justify a more conservative starting point.",
      suggestion:
        "Consider reducing duration or choosing easy work, then reassess during the warm-up. Do not use this score alone to diagnose fatigue or automatically cancel a priority session.",
    };
  if (total <= 19)
    return {
      verdict: "START, THEN VERIFY",
      colour: "#22C55E",
      summary:
        "Most signals are workable, with some reasons to monitor how the planned session begins.",
      suggestion:
        "Begin the planned warm-up and compare the response with your normal pattern. Hold or reduce the demand if several signals remain poor; do not add work because the score looks acceptable.",
    };
  return {
    verdict: "PLAN LOOKS VIABLE",
    colour: "#3B82F6",
    summary: "Today's self-reported signals are broadly favourable.",
    suggestion:
      "The planned session is a reasonable starting point if the warm-up and your normal health checks agree. A high score is not permission to add intensity, volume or load beyond the plan.",
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TrainingReadinessPage() {
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
      }, 200);
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
              Free Daily Context Check
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              TRAINING READINESS CHECK
            </h1>
            <p className="text-foreground-muted text-lg">
              Eight questions. Under a minute. Organise today&apos;s signals
              before you decide whether the plan should hold or reduce.
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
                    transition={{ duration: 0.2, ease: "easeOut" }}
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
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-heading text-2xl text-off-white">
                        YOUR CONTEXT BAND
                      </h2>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                      >
                        Retake
                      </button>
                    </div>

                    {/* Score hero — big, decisive */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-8 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                    >
                      <p
                        className="font-heading text-7xl md:text-8xl mb-2"
                        style={{ color: band.colour }}
                      >
                        {totalScore}
                      </p>
                      <p
                        className="font-heading text-xl md:text-2xl tracking-widest mb-3"
                        style={{ color: band.colour }}
                      >
                        {band.verdict}
                      </p>
                      <p className="text-foreground-muted text-lg max-w-md mx-auto leading-relaxed">
                        {band.summary}
                      </p>
                      <p className="text-foreground-subtle text-xs mt-3">
                        Score: {totalScore} / 24
                      </p>
                    </motion.div>

                    {/* Today's suggestion */}
                    <motion.div
                      className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-2">
                        WHAT TO DO TODAY
                      </h3>
                      <p className="text-foreground-muted text-sm leading-relaxed">
                        {band.suggestion}
                      </p>
                    </motion.div>

                    {/* Persistent pattern warning */}
                    {totalScore < 12 && (
                      <motion.div
                        className="bg-red-500/10 rounded-xl border border-red-500/20 p-5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.15 }}
                      >
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          <strong className="text-red-400">
                            Look for a pattern:
                          </strong>{" "}
                          One low score can be noise. Repeated or worsening
                          fatigue, soreness, sleep disruption or performance
                          decline deserves a wider review. Use the{" "}
                          <Link
                            href="/tools/recovery-screen"
                            className="text-coral hover:text-coral/80 transition-colors"
                          >
                            Recovery Readiness Screen
                          </Link>{" "}
                          to organise that context. It still cannot diagnose
                          illness, injury, REDs or overtraining syndrome.
                        </p>
                      </motion.div>
                    )}

                    {/* Related tools */}
                    <motion.div
                      className="rounded-xl border border-white/10 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.2 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-3">
                        RELATED TOOLS
                      </h3>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/tools/recovery-screen"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Recovery Readiness Screen &mdash; deeper 10-question
                            recovery assessment
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
                        <li>
                          <Link
                            href="/tools/training-load"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Training Load Calculator &mdash; CTL/ATL/TSB
                            analysis
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
              transition={{ duration: 0.2, delay: 0.4 }}
            >
              <p className="font-heading text-off-white text-lg md:text-xl mb-2">
                PUT READINESS BESIDE YOUR STRENGTH PLAN
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Roadman&apos;s upcoming iPhone app will use sleep, energy,
                soreness and bike context to hold or reduce strength
                volume&mdash;never to invent extra work or silently rewrite your
                riding plan.
              </p>
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="tool_training_readiness_app"
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
                <strong className="text-off-white">How it works:</strong> Eight
                questions scored 0&ndash;3 produce a total between 0 and 24.
                Each question captures a different readiness signal: sleep
                quantity, sleep quality, muscle soreness, energy, mood, resting
                heart rate, stress, and prior-day training load.
              </p>
              <p>
                <strong className="text-off-white">
                  What the score means:
                </strong>{" "}
                The four bands are a Roadman coaching heuristic for organising
                context. They are not clinically validated cut-offs, and no
                score by itself proves readiness, predicts injury or tells every
                cyclist to train or rest.
              </p>
              <p>
                <strong className="text-off-white">Evidence boundary:</strong>{" "}
                Subjective wellbeing measures can be useful for monitoring
                change, but commonly used single-item athlete measures have
                important validation limits. Compare your answers with your own
                baseline, planned session and symptoms rather than treating the
                total as an automatic instruction. See the{" "}
                <a
                  className="text-coral hover:text-coral/80"
                  href="https://pubmed.ncbi.nlm.nih.gov/26423706/"
                >
                  athlete-monitoring systematic review
                </a>{" "}
                and the{" "}
                <a
                  className="text-coral hover:text-coral/80"
                  href="https://pubmed.ncbi.nlm.nih.gov/32957081/"
                >
                  measurement-quality review
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
