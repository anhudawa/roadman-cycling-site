"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GOALS = [
  { value: "Race or event with a date", emoji: "🏁" },
  { value: "Hit a specific power number", emoji: "⚡" },
  { value: "Stop getting dropped on group rides", emoji: "💨" },
  { value: "Lose weight without losing power", emoji: "⚖️" },
  { value: "Get structured after years of winging it", emoji: "📋" },
];

const HOURS = [
  { value: "Under 4 hours", label: "<4h" },
  { value: "4-6 hours", label: "4-6h" },
  { value: "6-9 hours", label: "6-9h" },
  { value: "9-12 hours", label: "9-12h" },
  { value: "12+ hours", label: "12+" },
];

const FRUSTRATIONS = [
  { value: "Plateaued — stuck at a number I can't shift", emoji: "📉" },
  { value: "No structure — making it up as I go", emoji: "🎲" },
  { value: "Lost motivation — can't stay consistent", emoji: "😩" },
  { value: "Injury or comeback — trying to get back", emoji: "🩹" },
  { value: "Training hard but not seeing results", emoji: "😤" },
];

type Step = "goal" | "hours" | "frustration" | "details" | "submitted";

export function CohortApplicationForm() {
  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState("");
  const [hours, setHours] = useState("");
  const [frustration, setFrustration] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ftp, setFtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const stepIndex = ["goal", "hours", "frustration", "details", "submitted"].indexOf(step);

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/cohort/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, goal, hours, ftp, frustration }),
      });

      if (!res.ok) throw new Error("Failed to submit");
      setStep("submitted");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const slideVariants = {
    enter: { opacity: 0, x: 40, filter: "blur(4px)" },
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -40, filter: "blur(4px)" },
  };

  return (
    <div className="relative">
      {/* Progress dots */}
      {step !== "submitted" && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {["goal", "hours", "frustration", "details"].map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= stepIndex
                  ? "bg-coral w-8"
                  : "bg-white/10 w-4"
              }`}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "goal" && (
          <motion.div
            key="goal"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2">
              WHAT&apos;S YOUR #1 GOAL?
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              Pick the one that resonates most
            </p>
            <div className="grid gap-3 max-w-md mx-auto">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => {
                    setGoal(g.value);
                    setStep("hours");
                  }}
                  className="flex items-center gap-3 w-full text-left px-5 py-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-coral/40 hover:bg-coral/5 transition-all duration-200 group"
                >
                  <span className="text-xl">{g.emoji}</span>
                  <span className="text-off-white text-sm font-medium group-hover:text-coral transition-colors">
                    {g.value}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "hours" && (
          <motion.div
            key="hours"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2">
              HOURS PER WEEK?
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              Your real number, not your fantasy number
            </p>
            <div className="flex gap-3 justify-center flex-wrap max-w-md mx-auto">
              {HOURS.map((h) => (
                <button
                  key={h.value}
                  onClick={() => {
                    setHours(h.value);
                    setStep("frustration");
                  }}
                  className="px-6 py-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-coral/40 hover:bg-coral/5 transition-all duration-200 group min-w-[72px]"
                >
                  <span className="text-off-white font-heading text-lg group-hover:text-coral transition-colors">
                    {h.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "frustration" && (
          <motion.div
            key="frustration"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2">
              WHAT&apos;S ACTUALLY DOING YOUR HEAD IN?
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              The thing that made you click this page
            </p>
            <div className="grid gap-3 max-w-md mx-auto">
              {FRUSTRATIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setFrustration(f.value);
                    setStep("details");
                  }}
                  className="flex items-center gap-3 w-full text-left px-5 py-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-coral/40 hover:bg-coral/5 transition-all duration-200 group"
                >
                  <span className="text-xl">{f.emoji}</span>
                  <span className="text-off-white text-sm font-medium group-hover:text-coral transition-colors">
                    {f.value}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "details" && (
          <motion.div
            key="details"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2">
              LAST STEP
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              So we can review your application
            </p>
            <div className="max-w-sm mx-auto space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-off-white caret-coral placeholder:text-foreground-subtle focus:border-coral/50 focus:outline-none focus:ring-1 focus:ring-coral/20 transition-colors"
                autoFocus
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-off-white caret-coral placeholder:text-foreground-subtle focus:border-coral/50 focus:outline-none focus:ring-1 focus:ring-coral/20 transition-colors"
              />
              <input
                type="text"
                placeholder="Current FTP (optional)"
                value={ftp}
                onChange={(e) => setFtp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-off-white caret-coral placeholder:text-foreground-subtle focus:border-coral/50 focus:outline-none focus:ring-1 focus:ring-coral/20 transition-colors"
              />
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-coral text-off-white font-heading text-lg tracking-wider hover:bg-coral/90 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-coral/20"
              >
                {submitting ? "SUBMITTING..." : "APPLY FOR YOUR SPOT"}
              </button>
              <p className="text-foreground-subtle text-xs text-center">
                We review every application. You&apos;ll hear back within 24 hours.
              </p>
            </div>
          </motion.div>
        )}

        {step === "submitted" && (
          <motion.div
            key="submitted"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="text-center py-8"
          >
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="font-heading text-off-white text-3xl mb-3">
              APPLICATION RECEIVED
            </h3>
            <p className="text-foreground-muted max-w-sm mx-auto mb-6">
              We&apos;ll review your application and get back to you within 24 hours.
              Check your inbox at <span className="text-coral">{email}</span>.
            </p>
            <p className="text-foreground-subtle text-sm">
              Only 30 spots for Cohort 2. Applications close Friday.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
