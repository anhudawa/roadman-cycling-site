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
  category: string;
  options: { text: string; score: number }[];
  recommendation: string;
}

const QUESTIONS: Question[] = [
  {
    id: "pre-ride-fuelling",
    label: "What do you typically eat before a ride?",
    category: "Pre/During/Post Ride",
    options: [
      { text: "Nothing", score: 0 },
      { text: "Coffee only", score: 1 },
      { text: "Small snack", score: 2 },
      { text: "Full meal 2–3 hours before", score: 3 },
    ],
    recommendation:
      "Eat a proper meal 2–3 hours before riding. Aim for 1–4g of carbs per kilogram of body weight — porridge, toast with banana, or rice with eggs all work. Skipping pre-ride fuel means you start the session in a glycogen hole you never climb out of.",
  },
  {
    id: "in-ride-carbs",
    label: "How many grams of carbs per hour do you aim for on rides over 90 minutes?",
    category: "Pre/During/Post Ride",
    options: [
      { text: "I don't track", score: 0 },
      { text: "Less than 30g", score: 1 },
      { text: "30–60g", score: 2 },
      { text: "60–90g", score: 3 },
    ],
    recommendation:
      "For rides over 90 minutes, aim for 60–90g of carbs per hour. Start at 60g and build up across training blocks. Mix glucose and fructose sources (2:1 ratio) to maximise absorption. This is the single biggest performance lever most amateur cyclists ignore.",
  },
  {
    id: "gut-training",
    label: "Have you practised eating at race intensity?",
    category: "Pre/During/Post Ride",
    options: [
      { text: "Never", score: 0 },
      { text: "A few times", score: 1 },
      { text: "Regularly in training", score: 2 },
      { text: "Systematic gut training programme", score: 3 },
    ],
    recommendation:
      "Your gut is trainable. Practise eating your race nutrition at race intensity during training — at least once a week during key sessions. Start with smaller amounts and build tolerance over 4–6 weeks. Race day is not the time to discover your stomach rejects gels at threshold.",
  },
  {
    id: "post-ride-recovery",
    label: "How quickly do you eat protein and carbs after hard sessions?",
    category: "Pre/During/Post Ride",
    options: [
      { text: "More than 3 hours, or skip entirely", score: 0 },
      { text: "1–3 hours", score: 1 },
      { text: "30–60 minutes", score: 2 },
      { text: "Within 30 minutes", score: 3 },
    ],
    recommendation:
      "Eat within 30 minutes of finishing hard sessions. Target 0.3–0.4g/kg of protein and 1–1.2g/kg of carbs — a recovery shake, yoghurt with granola, or chicken and rice all hit the mark. The glycogen replenishment window is real, and the earlier you eat, the faster you recover for tomorrow's session.",
  },
  {
    id: "daily-protein",
    label: "How much protein do you eat daily?",
    category: "Daily Nutrition",
    options: [
      { text: "No idea", score: 0 },
      { text: "Less than 1g per kg of body weight", score: 1 },
      { text: "1–1.5g per kg", score: 2 },
      { text: "1.6–2.2g per kg", score: 3 },
    ],
    recommendation:
      "Target 1.6–2.2g of protein per kilogram of body weight daily. Spread intake across 4–5 meals with 0.3–0.4g/kg per sitting. After 40, anabolic resistance means you need more protein per meal to trigger the same muscle protein synthesis response — this is non-negotiable for masters cyclists.",
  },
  {
    id: "hydration",
    label: "How do you manage fluid intake on rides?",
    category: "Daily Nutrition",
    options: [
      { text: "Just drink when thirsty", score: 0 },
      { text: "Carry a bottle, drink randomly", score: 1 },
      { text: "Aim for a target amount", score: 2 },
      { text: "Know my sweat rate and replace accordingly", score: 3 },
    ],
    recommendation:
      "Do a sweat rate test: weigh yourself before and after a 60-minute ride (no drinking). Each kilogram lost equals roughly one litre of sweat. Aim to replace 80% of losses during riding. In hot conditions, add 500–700mg of sodium per litre. Dehydration of just 2% body weight measurably impairs power output.",
  },
  {
    id: "race-nutrition-plan",
    label: "Do you have a specific nutrition plan for events?",
    category: "Race Preparation",
    options: [
      { text: "Wing it", score: 0 },
      { text: "Rough idea", score: 1 },
      { text: "Written plan", score: 2 },
      { text: "Tested and refined plan", score: 3 },
    ],
    recommendation:
      "Build a written race nutrition plan: pre-race meal timing and composition, hourly carb targets, fluid targets, caffeine timing, and backup options if your stomach turns. Test it in at least three hard training sessions before race day. The plan should be so specific you could hand it to someone else and they could execute it.",
  },
  {
    id: "energy-availability",
    label: "In the last month, have you restricted calories while training hard?",
    category: "Daily Nutrition",
    options: [
      { text: "Significant restriction", score: 0 },
      { text: "Moderate restriction", score: 1 },
      { text: "Slight deficit", score: 2 },
      { text: "Eating to support training", score: 3 },
    ],
    recommendation:
      "Chronic energy restriction while training hard leads to Relative Energy Deficiency in Sport (RED-S) — impaired recovery, hormonal disruption, bone density loss, and declining performance. If you need to lose weight, do it in a controlled off-season block with a small deficit (250–500 kcal/day), not while pushing training volume.",
  },
  {
    id: "caffeine-strategy",
    label: "How do you use caffeine around training?",
    category: "Race Preparation",
    options: [
      { text: "Don't use it", score: 0 },
      { text: "Coffee before every ride", score: 1 },
      { text: "Strategic use for key sessions", score: 2 },
      { text: "Periodised with tolerance management", score: 3 },
    ],
    recommendation:
      "Caffeine is the most evidence-backed legal ergogenic aid in endurance sport. Use 3–6mg per kilogram of body weight, 30–60 minutes before key sessions and races. Daily habitual use blunts the performance effect — consider reducing intake in the week before target events to resensitise, then dose on race morning.",
  },
  {
    id: "supplement-basics",
    label: "Which of these do you take consistently: Vitamin D, Iron, Omega-3?",
    category: "Daily Nutrition",
    options: [
      { text: "None", score: 0 },
      { text: "1 of these", score: 1 },
      { text: "2 of these", score: 2 },
      { text: "All 3, guided by blood work", score: 3 },
    ],
    recommendation:
      "Get annual blood work done and supplement based on results, not guesswork. Vitamin D (especially in northern latitudes), iron (particularly for female athletes), and Omega-3 are the three supplements with the strongest evidence base for endurance athletes. Everything else is a distant fourth.",
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
      label: "Major Fuelling Gaps",
      colour: "#EF4444",
      summary:
        "Significant fuelling gaps across multiple areas. You are almost certainly leaving performance on the table — and potentially compromising your health. Start with the top recommendation below.",
    };
  if (total <= 18)
    return {
      label: "Some Gaps to Address",
      colour: "#EAB308",
      summary:
        "Some clear gaps in your fuelling practices. Targeted improvements in your weakest areas will yield noticeable performance gains within weeks.",
    };
  if (total <= 24)
    return {
      label: "Solid Foundation",
      colour: "#22C55E",
      summary:
        "Solid fuelling practices overall. You have the fundamentals in place — fine-tuning in one or two areas could unlock the next level.",
    };
  return {
    label: "Race-Ready Fuelling",
    colour: "#3B82F6",
    summary:
      "Strong fuelling practices across the board. You are doing what the evidence supports. Maintain your systems and look for marginal optimisations.",
  };
}

interface CategoryScore {
  label: string;
  score: number;
  max: number;
}

function getCategories(answers: number[]): CategoryScore[] {
  return [
    {
      label: "Pre/During/Post Ride",
      score: answers[0] + answers[1] + answers[2] + answers[3],
      max: 12,
    },
    {
      label: "Daily Nutrition",
      score: answers[4] + answers[5] + answers[7] + answers[9],
      max: 12,
    },
    {
      label: "Race Preparation",
      score: answers[6] + answers[8],
      max: 6,
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

export default function FuellingScreenPage() {
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
              FUELLING SELF-ASSESSMENT
            </h1>
            <p className="text-foreground-muted text-lg">
              Ten questions. Two minutes. A clear picture of whether your nutrition
              is supporting your training — or holding it back.
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
                            href="/tools/fuel-planner"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Cycling Fuel Planner &mdash; daily calorie target, macro split, and in-ride carbs
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/calories"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Calories Burned Calculator &mdash; fuel split and post-ride refuelling guidance
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/hydration"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Hydration Calculator &mdash; sweat rate, sodium, and per-ride fluid plan
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/energy-availability"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Energy Availability Calculator &mdash; RED-S risk screening
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
                FUELLING IS THE FOURTH DISCIPLINE
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Join 1,000+ cyclists who have stopped leaving watts on the table.
                Nutrition protocols, race-day fuelling plans, and a community that
                gets it.
              </p>
              <a
                href="https://www.skool.com/roadmancycling"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="tool_fuelling_screen_skool"
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
                0&ndash;3 produce a total between 0 and 30. Questions are grouped into three
                categories: Pre/During/Post Ride (questions 1&ndash;4, max 12), Daily Nutrition
                (questions 5, 6, 8, 10, max 12), and Race Preparation (questions 7 and 9, max 6).
              </p>
              <p>
                <strong className="text-off-white">Scoring bands:</strong> 0&ndash;10 Major
                Fuelling Gaps (red), 11&ndash;18 Some Gaps to Address (amber), 19&ndash;24
                Solid Foundation (green), 25&ndash;30 Race-Ready Fuelling (blue). The top three
                lowest-scoring questions generate personalised recommendations.
              </p>
              <p>
                <strong className="text-off-white">Disclaimer:</strong> This is a
                self-assessment tool for informational purposes only. It is not medical or
                dietary advice and does not replace consultation with a registered dietitian,
                sports nutritionist, or your GP. If you have a diagnosed eating disorder,
                suspected RED-S, or any medical condition affecting nutrition, seek professional
                guidance before making changes.
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
