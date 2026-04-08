"use client";

import { useState, useCallback } from "react";
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
import type { ProspectAnswers } from "@/lib/ndy/types";
import type { RenderedResponse } from "@/lib/ndy/templates";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiResponse {
  decision: string;
  computedWpkg: number | null;
  budgetFlag: boolean;
  injuryFlag: boolean;
  response: RenderedResponse;
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const slideVariants = {
  enter: { opacity: 0, y: 40 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
};

const transition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min((current / total) * 100, 100);
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
      <motion.div
        className="h-full bg-coral"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Option button grid
// ---------------------------------------------------------------------------

function OptionGrid({
  options,
  onSelect,
}: {
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelected(value);
    setTimeout(() => onSelect(value), 300);
  };

  return (
    <div
      className={`grid gap-3 w-full ${
        options.length >= 5 ? "md:grid-cols-2" : "grid-cols-1"
      }`}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleSelect(opt.value)}
          className={`
            w-full text-left px-6 py-4 rounded-lg
            font-body text-base md:text-lg
            border transition-all duration-150 cursor-pointer
            min-h-[48px]
            ${
              selected === opt.value
                ? "bg-coral border-coral text-off-white"
                : "bg-white/5 border-white/10 text-off-white hover:bg-white/10 hover:border-white/20"
            }
          `}
        >
          {opt.label}
        </button>
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
      <div className="flex items-center gap-3">
        <input
          type="number"
          inputMode="decimal"
          placeholder="kg"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="
            w-full px-6 py-4 rounded-lg
            bg-white/5 border border-white/10
            text-off-white text-lg font-body
            placeholder:text-white/30
            focus:outline-none focus:border-coral
            transition-colors
          "
          min={40}
          max={160}
          step={0.1}
          autoFocus
        />
        <span className="text-white/40 text-lg font-body">kg</span>
      </div>
      {error && <p className="text-coral text-sm font-body">{error}</p>}
      <div className="flex flex-col gap-2">
        <Button onClick={handleSubmit} variant="primary" size="lg" className="w-full">
          Continue
        </Button>
        <button
          onClick={onSkip}
          className="text-white/40 hover:text-white/60 text-sm font-body transition-colors cursor-pointer"
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

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, 500))}
        placeholder="Budget concerns, injuries, specific goals, anything at all..."
        rows={4}
        className="
          w-full px-6 py-4 rounded-lg resize-none
          bg-white/5 border border-white/10
          text-off-white text-base font-body
          placeholder:text-white/30
          focus:outline-none focus:border-coral
          transition-colors
        "
        autoFocus
      />
      <p className="text-white/30 text-xs font-body text-right">
        {value.length}/500
      </p>
      <div className="flex flex-col gap-2">
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
          className="text-white/40 hover:text-white/60 text-sm font-body transition-colors cursor-pointer"
        >
          Skip this one
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading screen
// ---------------------------------------------------------------------------

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.div
        className="w-12 h-12 rounded-full border-2 border-white/10 border-t-coral"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p
        className="text-off-white font-heading tracking-wider uppercase"
        style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)" }}
      >
        Finding the right fit...
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result screen
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

  const handlePrimaryCta = () => {
    if (isNotAFit && !emailSent) {
      // For not_a_fit, primary CTA triggers email capture, not a link
      return;
    }
    if (response.primaryCta.url.startsWith("http")) {
      window.open(response.primaryCta.url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = response.primaryCta.url;
    }
  };

  const handleSecondaryCta = () => {
    if (response.secondaryCta.url.startsWith("http")) {
      window.open(response.secondaryCta.url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = response.secondaryCta.url;
    }
  };

  const handleTertiaryCta = () => {
    if (!response.tertiaryCta) return;
    if (response.tertiaryCta.url.startsWith("http")) {
      window.open(response.tertiaryCta.url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = response.tertiaryCta.url;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      <h2
        className="font-heading tracking-wider uppercase text-off-white"
        style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
      >
        {response.headline}
      </h2>

      <div className="space-y-4">
        {response.body.split("\n\n").map((para, i) => (
          <p
            key={i}
            className="text-white/80 font-body text-base md:text-lg leading-relaxed"
          >
            {para}
          </p>
        ))}
      </div>

      {/* Email capture for not_a_fit */}
      {isNotAFit && !emailSent && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              placeholder="Your email"
              className="
                flex-1 px-4 py-3 rounded-lg
                bg-white/5 border border-white/10
                text-off-white font-body
                placeholder:text-white/30
                focus:outline-none focus:border-coral
                transition-colors
              "
            />
            <Button onClick={handleEmailSubmit} variant="primary" size="md">
              Send
            </Button>
          </div>
          <p className="text-white/30 text-xs font-body">
            We'll send the free resources and nothing else.
          </p>
        </div>
      )}

      {isNotAFit && emailSent && (
        <p className="text-coral font-body text-sm">
          Sent. Check your inbox.
        </p>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-3 pt-4">
        {(!isNotAFit || emailSent) && (
          <Button
            onClick={handlePrimaryCta}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {response.primaryCta.label}
          </Button>
        )}

        <Button
          onClick={handleSecondaryCta}
          variant="outline"
          size="lg"
          className="w-full"
        >
          {response.secondaryCta.label}
        </Button>

        {response.tertiaryCta && (
          <button
            onClick={handleTertiaryCta}
            className="text-white/40 hover:text-white/60 text-sm font-body transition-colors cursor-pointer pt-2"
          >
            {response.tertiaryCta.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function NdyFitPage() {
  const [step, setStep] = useState<StepId>("q1");
  const [answers, setAnswers] = useState<Partial<ProspectAnswers>>({});
  const [result, setResult] = useState<ApiResponse | null>(null);

  const currentStepIndex = STEP_ORDER.indexOf(step);
  const questionNumber = Math.min(currentStepIndex + 1, TOTAL_QUESTIONS);

  const advance = useCallback(
    (nextStep?: StepId) => {
      const idx = STEP_ORDER.indexOf(step);
      const next = nextStep || STEP_ORDER[idx + 1];
      if (next) setStep(next);
    },
    [step]
  );

  const goBack = useCallback(() => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) {
      // Skip back over loading screen
      const prev = STEP_ORDER[idx - 1] === "loading" ? STEP_ORDER[idx - 2] : STEP_ORDER[idx - 1];
      if (prev) setStep(prev);
    }
  }, [step]);

  const handleSelect = useCallback(
    (field: keyof ProspectAnswers, value: string) => {
      setAnswers((prev) => ({ ...prev, [field]: value }));

      // Auto-skip Q4 if FTP is not_sure
      if (field === "q3FtpRange" && value === "not_sure") {
        setAnswers((prev) => ({ ...prev, q3FtpRange: value, q4PlateauDuration: "no_idea" }));
        // Skip Q4, go straight to Q5
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

  const handleFreetext = useCallback(
    (text: string) => {
      setAnswers((prev) => ({ ...prev, q8Freetext: text }));
      submitAnswers({ ...answers, q8Freetext: text });
    },
    [answers]
  );

  const handleFreetextSkip = useCallback(() => {
    setAnswers((prev) => ({ ...prev, q8Freetext: null }));
    submitAnswers({ ...answers, q8Freetext: null });
  }, [answers]);

  const submitAnswers = async (finalAnswers: Partial<ProspectAnswers>) => {
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

      // Brief pause so loading screen feels intentional
      await new Promise((r) => setTimeout(r, 1500));

      setResult(data);
      setStep("result");
    } catch {
      // Fallback — show standard if API fails
      await new Promise((r) => setTimeout(r, 1500));
      setStep("result");
    }
  };

  const showBackButton = currentStepIndex > 0 && step !== "loading" && step !== "result";

  return (
    <div className="min-h-dvh bg-charcoal flex flex-col">
      {step !== "result" && (
        <ProgressBar current={questionNumber} total={TOTAL_QUESTIONS} />
      )}

      {/* Back button */}
      {showBackButton && (
        <button
          onClick={goBack}
          className="
            fixed top-6 left-6 z-50
            text-white/40 hover:text-white/60
            text-sm font-body
            transition-colors cursor-pointer
            flex items-center gap-1
          "
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="inline"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
      )}

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center px-5 md:px-8 py-20">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="flex flex-col items-center gap-8"
            >
              {/* Questions */}
              {step === "q1" && (
                <>
                  <QuestionHeading text={QUESTION_HEADINGS.q1} />
                  <OptionGrid
                    options={Q1_OPTIONS}
                    onSelect={(v) => handleSelect("q1TrainingFor", v)}
                  />
                </>
              )}

              {step === "q2" && (
                <>
                  <QuestionHeading text={QUESTION_HEADINGS.q2} />
                  <OptionGrid
                    options={Q2_OPTIONS}
                    onSelect={(v) => handleSelect("q2HoursPerWeek", v)}
                  />
                </>
              )}

              {step === "q3" && (
                <>
                  <QuestionHeading text={QUESTION_HEADINGS.q3} />
                  <OptionGrid
                    options={Q3_OPTIONS}
                    onSelect={(v) => handleSelect("q3FtpRange", v)}
                  />
                </>
              )}

              {step === "q4" && (
                <>
                  <QuestionHeading text={QUESTION_HEADINGS.q4} />
                  <OptionGrid
                    options={Q4_OPTIONS}
                    onSelect={(v) => handleSelect("q4PlateauDuration", v)}
                  />
                </>
              )}

              {step === "q5" && (
                <>
                  <QuestionHeading text={QUESTION_HEADINGS.q5} />
                  <OptionGrid
                    options={Q5_OPTIONS}
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
                <ResultScreen response={result.response} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared heading component
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
