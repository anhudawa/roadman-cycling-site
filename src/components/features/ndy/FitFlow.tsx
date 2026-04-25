"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";
import {
  Q1_OPTIONS,
  Q2_OPTIONS,
  Q3_OPTIONS,
  Q4_OPTIONS,
  Q5_OPTIONS,
  Q7_OPTIONS,
  QUESTION_HEADINGS,
  STEP_ORDER,
  TOTAL_QUESTIONS,
  type StepId,
} from "@/lib/ndy/questions";
import type { ProspectAnswers, RoutingDecision } from "@/lib/ndy/types";
import type { RenderedResponse, TierRecommendation } from "@/lib/ndy/templates";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FitFlowProps {
  className?: string;
}

interface ApiResponse {
  decision: RoutingDecision;
  computedWpkg: number | null;
  budgetFlag: boolean;
  injuryFlag: boolean;
  response: RenderedResponse;
}

// ---------------------------------------------------------------------------
// Animation variants — horizontal directional crossfade
// ---------------------------------------------------------------------------

const questionVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 60 : -60,
    scale: 0.98,
    filter: "blur(4px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -60 : 60,
    scale: 0.98,
    filter: "blur(4px)",
  }),
};

const questionTransition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

// ---------------------------------------------------------------------------
// Segmented progress bar
// ---------------------------------------------------------------------------

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="px-5 pt-5 pb-2">
      <div className="max-w-md mx-auto flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < current;
          const isActive = stepNum === current;

          return (
            <motion.div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
                isCompleted
                  ? "bg-coral"
                  : isActive
                  ? "bg-coral/60"
                  : "bg-white/10"
              }`}
              role="progressbar"
              aria-valuenow={isCompleted ? 100 : isActive ? 50 : 0}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          );
        })}
      </div>
      <p className="text-center text-white/30 text-xs font-body mt-2 tracking-wider">
        {current} OF {total}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Option button grid
// ---------------------------------------------------------------------------

function OptionGrid({
  options,
  questionLabel,
  onSelect,
}: {
  options: { value: string; label: string }[];
  questionLabel: string;
  onSelect: (value: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelected(value);
    setTimeout(() => onSelect(value), 300);
  };

  return (
    <div
      role="radiogroup"
      aria-label={questionLabel}
      className={`grid gap-3 w-full ${
        options.length >= 5 ? "md:grid-cols-2" : "grid-cols-1"
      }`}
    >
      {options.map((opt) => (
        <motion.button
          key={opt.value}
          onClick={() => handleSelect(opt.value)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          role="radio"
          aria-checked={selected === opt.value}
          className={`
            w-full text-left px-5 py-5 rounded-xl
            font-body text-base md:text-lg
            border transition-all cursor-pointer
            min-h-[56px]
            ${
              selected === opt.value
                ? "bg-coral/15 border-coral text-off-white shadow-[var(--shadow-glow-coral)]"
                : "bg-white/[0.03] border-white/10 text-off-white hover:bg-white/[0.06] hover:border-white/20"
            }
          `}
        >
          <span className="flex items-center gap-3">
            <span
              className={`
                shrink-0 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center
                ${
                  selected === opt.value
                    ? "border-coral bg-coral"
                    : "border-white/20"
                }
              `}
            >
              {selected === opt.value && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="w-2 h-2 rounded-full bg-off-white"
                />
              )}
            </span>
            {opt.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Weight input (Q6)
// ---------------------------------------------------------------------------

function WeightInput({
  onSubmit,
  onSkip,
}: {
  onSubmit: (kg: number) => void;
  onSkip: () => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 40 || num > 160) {
      setError("Enter a weight between 40 and 160 kg");
      return;
    }
    setError("");
    onSubmit(Math.round(num * 10) / 10);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      <label htmlFor="weight-input" className="sr-only">
        Your weight in kilograms
      </label>
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          id="weight-input"
          type="number"
          inputMode="decimal"
          placeholder="72"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="
            w-full px-6 py-4 rounded-xl
            bg-white/[0.03] border border-white/10
            text-off-white text-lg font-body
            placeholder:text-white/20
            focus:outline-none focus:border-coral focus:shadow-[0_0_0_3px_rgba(241,99,99,0.1)]
            transition-all duration-200
          "
          min={40}
          max={160}
          step={0.1}
          aria-invalid={!!error}
          aria-describedby={error ? "weight-error" : undefined}
        />
        <span className="text-white/30 text-lg font-body">kg</span>
      </div>
      {error && (
        <p id="weight-error" role="alert" className="text-coral text-sm font-body">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3">
        <Button onClick={handleSubmit} variant="primary" size="lg" className="w-full">
          Continue
        </Button>
        <button
          onClick={onSkip}
          className="text-white/30 hover:text-coral/60 text-sm font-body transition-colors cursor-pointer"
        >
          Skip this one
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Freetext input (Q8)
// ---------------------------------------------------------------------------

function FreetextInput({
  onSubmit,
  onSkip,
}: {
  onSubmit: (text: string) => void;
  onSkip: () => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <label htmlFor="freetext-input" className="sr-only">
        Anything else we should know
      </label>
      <textarea
        ref={textareaRef}
        id="freetext-input"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, 500))}
        placeholder="Budget concerns, injuries, specific goals, anything at all..."
        rows={4}
        className="
          w-full px-6 py-4 rounded-xl resize-none
          bg-white/[0.03] border border-white/10
          text-off-white text-base font-body
          placeholder:text-white/20
          focus:outline-none focus:border-coral focus:shadow-[0_0_0_3px_rgba(241,99,99,0.1)]
          transition-all duration-200
        "
      />
      <p
        className={`text-xs font-body text-right transition-colors ${
          value.length > 450 ? "text-coral" : "text-white/20"
        }`}
      >
        {value.length}/500
      </p>
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => onSubmit(value)}
          variant="primary"
          size="lg"
          className="w-full"
          disabled={value.length === 0}
        >
          Continue
        </Button>
        <button
          onClick={onSkip}
          className="text-white/30 hover:text-coral/60 text-sm font-body transition-colors cursor-pointer"
        >
          Skip this one
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading screen — concentric pulsing rings
// ---------------------------------------------------------------------------

const LOADING_MESSAGES = [
  "Crunching your numbers...",
  "Finding the right fit...",
  "Almost there...",
];

function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8" role="status" aria-live="polite">
      {/* Concentric pulsing rings */}
      <div className="relative w-24 h-24">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-coral/30"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.3], opacity: [0.6, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}
        <motion.div
          className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="text-off-white font-heading tracking-wider uppercase text-center"
          style={{ fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}
        >
          {LOADING_MESSAGES[msgIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result screen — dramatic reveal with staggered animations
// ---------------------------------------------------------------------------

function ResultScreen({
  response,
  onEmailSubmit,
}: {
  response: RenderedResponse;
  onEmailSubmit?: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const isNotAFit = response.decision === "not_a_fit";

  const handleEmailSubmit = () => {
    if (!email || !email.includes("@")) return;
    onEmailSubmit?.(email);
    setEmailSent(true);
  };

  const navigateTo = (url: string) => {
    if (url.startsWith("http")) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (url !== "#email-capture" && url !== "#free-resources") {
      window.location.href = url;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="font-heading tracking-wider uppercase text-off-white"
        style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
      >
        {response.headline}
      </motion.h2>

      {/* Body paragraphs — staggered fade-in */}
      <div className="space-y-4">
        {response.body.split("\n\n").map((para, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.4 + i * 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-white/70 font-body text-base md:text-lg leading-relaxed"
          >
            {para}
          </motion.p>
        ))}
      </div>

      {/* Recommendation card */}
      {response.recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-coral/30 bg-coral/[0.04] p-6 md:p-8"
        >
          <div className="flex items-baseline justify-between mb-1">
            <p className="text-coral font-heading text-sm tracking-widest uppercase">
              {response.recommendation.tierName}
            </p>
          </div>
          <p className="text-white/50 font-body text-sm mb-4">
            {response.recommendation.tagline}
          </p>
          <div className="mb-5">
            <span className="font-heading text-off-white" style={{ fontSize: "2.5rem" }}>
              {response.recommendation.price}
            </span>
            <span className="text-white/40 font-body text-sm ml-1">
              {response.recommendation.period}
            </span>
          </div>
          <ul className="space-y-2.5">
            {response.recommendation.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-sm text-white/60 font-body"
              >
                <span className="text-coral mt-0.5 shrink-0">&#10003;</span>
                {feature}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Email capture for not_a_fit */}
      {isNotAFit && !emailSent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="space-y-3"
        >
          <label htmlFor="nurture-email" className="sr-only">
            Your email address
          </label>
          <div className="flex gap-2">
            <input
              id="nurture-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              placeholder="Your email"
              className="
                flex-1 px-4 py-3 rounded-xl
                bg-white/[0.03] border border-white/10
                text-off-white font-body
                placeholder:text-white/20
                focus:outline-none focus:border-coral focus:shadow-[0_0_0_3px_rgba(241,99,99,0.1)]
                transition-all duration-200
              "
            />
            <Button onClick={handleEmailSubmit} variant="primary" size="md">
              Send
            </Button>
          </div>
          <p className="text-white/20 text-xs font-body">
            We'll send the free resources and nothing else.
          </p>
        </motion.div>
      )}

      {isNotAFit && emailSent && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-coral font-body text-sm"
        >
          Sent. Check your inbox.
        </motion.p>
      )}

      {/* CTAs — staggered entrance */}
      <motion.div
        className="flex flex-col gap-3 pt-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12, delayChildren: 0.9 } },
        }}
      >
        {/* Primary CTA — always the real action, whether overlay or standalone */}
        {(!isNotAFit || emailSent) && (
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Button
              onClick={() => navigateTo(response.primaryCta.url)}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {response.primaryCta.label}
            </Button>
          </motion.div>
        )}

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Button
            onClick={() => navigateTo(response.secondaryCta.url)}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            {response.secondaryCta.label}
          </Button>
        </motion.div>

        {response.tertiaryCta && (
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <button
              onClick={() => navigateTo(response.tertiaryCta!.url)}
              className="w-full text-white/30 hover:text-coral/60 text-sm font-body transition-colors cursor-pointer pt-1"
            >
              {response.tertiaryCta.label}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Question heading
// ---------------------------------------------------------------------------

function QuestionHeading({ text }: { text: string }) {
  return (
    <h1
      className="font-heading tracking-wider uppercase text-off-white text-center w-full"
      style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
    >
      {text}
    </h1>
  );
}

// ---------------------------------------------------------------------------
// Main FitFlow component
// ---------------------------------------------------------------------------

export function FitFlow(_props: FitFlowProps = {}) {
  const [step, setStep] = useState<StepId>("q1");
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Partial<ProspectAnswers>>({});
  const [result, setResult] = useState<ApiResponse | null>(null);

  const currentStepIndex = STEP_ORDER.indexOf(step);
  const questionNumber = Math.min(currentStepIndex + 1, TOTAL_QUESTIONS);

  const advance = useCallback(
    (nextStep?: StepId) => {
      setDirection(1);
      const idx = STEP_ORDER.indexOf(step);
      const next = nextStep || STEP_ORDER[idx + 1];
      if (next) setStep(next);
    },
    [step]
  );

  const goBack = useCallback(() => {
    setDirection(-1);
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) {
      const prev =
        STEP_ORDER[idx - 1] === "loading"
          ? STEP_ORDER[idx - 2]
          : STEP_ORDER[idx - 1];
      if (prev) setStep(prev);
    }
  }, [step]);

  const handleSelect = useCallback(
    (field: keyof ProspectAnswers, value: string) => {
      setAnswers((prev) => ({ ...prev, [field]: value }));

      if (field === "q3FtpRange" && value === "not_sure") {
        setAnswers((prev) => ({
          ...prev,
          q3FtpRange: value,
          q4PlateauDuration: "no_idea",
        }));
        setDirection(1);
        setStep("q5");
        return;
      }

      advance();
    },
    [advance]
  );

  const handleWeight = useCallback(
    (kg: number) => {
      setAnswers((prev) => ({ ...prev, q6WeightKg: kg }));
      advance();
    },
    [advance]
  );

  const submitAnswers = useCallback(
    async (finalAnswers: Partial<ProspectAnswers>) => {
      setDirection(1);
      setStep("loading");

      const body: ProspectAnswers = {
        q1TrainingFor: finalAnswers.q1TrainingFor || "general_fitness",
        q2HoursPerWeek: finalAnswers.q2HoursPerWeek || "4_to_6",
        q3FtpRange: finalAnswers.q3FtpRange || "not_sure",
        q4PlateauDuration: finalAnswers.q4PlateauDuration || "no_idea",
        q5Frustration: finalAnswers.q5Frustration || "no_structure",
        q6WeightKg: finalAnswers.q6WeightKg ?? null,
        q7CoachingHistory: finalAnswers.q7CoachingHistory || "never",
        q8Freetext: finalAnswers.q8Freetext ?? null,
      };

      try {
        const res = await fetch("/api/ndy/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data: ApiResponse = await res.json();
        await new Promise((r) => setTimeout(r, 1800));
        setResult(data);
        setStep("result");
      } catch {
        await new Promise((r) => setTimeout(r, 1800));
        setStep("result");
      }
    },
    []
  );

  const handleFreetext = useCallback(
    (text: string) => {
      const updated = { ...answers, q8Freetext: text };
      setAnswers(updated);
      submitAnswers(updated);
    },
    [answers, submitAnswers]
  );

  const handleFreetextSkip = useCallback(() => {
    const updated = { ...answers, q8Freetext: null };
    setAnswers(updated);
    submitAnswers(updated);
  }, [answers, submitAnswers]);

  const showBackButton =
    currentStepIndex > 0 && step !== "loading" && step !== "result";

  // Step label for back button
  const prevStepLabel = showBackButton
    ? STEP_ORDER[currentStepIndex - 1]?.replace("q", "Q")
    : "";

  return (
    <div className="relative min-h-dvh overflow-hidden flex flex-col">
      {/* Ambient background gradients */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 600px 400px at 80% 10%, rgba(241,99,99,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 800px 600px at 20% 90%, rgba(76,18,115,0.1) 0%, transparent 70%)
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-0 grain-overlay" />

      {/* Progress bar */}
      <div className="relative z-10">
        {step !== "result" && step !== "loading" && (
          <ProgressBar current={questionNumber} total={TOTAL_QUESTIONS} />
        )}
      </div>

      {/* Back button */}
      {showBackButton && (
        <button
          onClick={goBack}
          aria-label="Go to previous question"
          className="
            fixed top-5 left-5 z-50
            text-white/30 hover:text-white/60
            text-sm font-body
            transition-colors cursor-pointer
            flex items-center gap-1.5
          "
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back{prevStepLabel ? ` to ${prevStepLabel}` : ""}
        </button>
      )}

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-5 md:px-8 py-16">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={questionVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={questionTransition}
              className="flex flex-col items-center gap-8"
            >
              {step === "q1" && (
                <>
                  <QuestionHeading text={QUESTION_HEADINGS.q1} />
                  <OptionGrid
                    options={Q1_OPTIONS}
                    questionLabel={QUESTION_HEADINGS.q1}
                    onSelect={(v) => handleSelect("q1TrainingFor", v)}
                  />
                </>
              )}

              {step === "q2" && (
                <>
                  <QuestionHeading text={QUESTION_HEADINGS.q2} />
                  <OptionGrid
                    options={Q2_OPTIONS}
                    questionLabel={QUESTION_HEADINGS.q2}
                    onSelect={(v) => handleSelect("q2HoursPerWeek", v)}
                  />
                </>
              )}

              {step === "q3" && (
                <>
                  <QuestionHeading text={QUESTION_HEADINGS.q3} />
                  <OptionGrid
                    options={Q3_OPTIONS}
                    questionLabel={QUESTION_HEADINGS.q3}
                    onSelect={(v) => handleSelect("q3FtpRange", v)}
                  />
                </>
              )}

              {step === "q4" && (
                <>
                  <QuestionHeading text={QUESTION_HEADINGS.q4} />
                  <OptionGrid
                    options={Q4_OPTIONS}
                    questionLabel={QUESTION_HEADINGS.q4}
                    onSelect={(v) => handleSelect("q4PlateauDuration", v)}
                  />
                </>
              )}

              {step === "q5" && (
                <>
                  <QuestionHeading text={QUESTION_HEADINGS.q5} />
                  <OptionGrid
                    options={Q5_OPTIONS}
                    questionLabel={QUESTION_HEADINGS.q5}
                    onSelect={(v) => handleSelect("q5Frustration", v)}
                  />
                </>
              )}

              {step === "q6" && (
                <>
                  <QuestionHeading text={QUESTION_HEADINGS.q6} />
                  <WeightInput
                    onSubmit={handleWeight}
                    onSkip={() => {
                      setAnswers((prev) => ({ ...prev, q6WeightKg: null }));
                      advance();
                    }}
                  />
                </>
              )}

              {step === "q7" && (
                <>
                  <QuestionHeading text={QUESTION_HEADINGS.q7} />
                  <OptionGrid
                    options={Q7_OPTIONS}
                    questionLabel={QUESTION_HEADINGS.q7}
                    onSelect={(v) => handleSelect("q7CoachingHistory", v)}
                  />
                </>
              )}

              {step === "q8" && (
                <>
                  <QuestionHeading text={QUESTION_HEADINGS.q8} />
                  <FreetextInput
                    onSubmit={handleFreetext}
                    onSkip={handleFreetextSkip}
                  />
                </>
              )}

              {step === "loading" && <LoadingScreen />}

              {step === "result" && result?.response && (
                <ResultScreen
                  response={result.response}
                  onEmailSubmit={async (email) => {
                    try {
                      await fetch("/api/newsletter", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email,
                          source: "ndy_fit_not_a_fit",
                        }),
                      });
                    } catch {
                      // Non-critical
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
