"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCohortState } from "@/lib/cohort";

/** RFC-5322 lite — rejects `foo@`, `@bar`, and other common fat-finger failures. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** localStorage key for persisting in-progress application answers. */
const DRAFT_KEY = "roadman-cohort-draft-v1";

interface DraftState {
  step: Step;
  goal: string;
  hours: string;
  frustration: string;
  name: string;
  email: string;
  ftp: string;
}

function loadDraft(): Partial<DraftState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<DraftState>;
  } catch {
    return null;
  }
}

function saveDraft(state: DraftState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded or storage unavailable — ignore */
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Fire a Meta Pixel `Lead` event when a user submits successfully.
 * Consent-gated: only fires if the user accepted marketing cookies.
 * Silently no-ops if fbq isn't loaded yet (ad blocker, consent denied,
 * DNT etc.).
 *
 * Phase-aware: when on a waitlist the content_name reflects that, so
 * we can segment ad audiences by "applied while open" vs "waitlisted"
 * in Meta's reporting.
 */
function trackLead(
  email: string,
  persona: string | undefined,
  phase: "open" | "closing-today" | "waitlist",
  cohortNumber: number,
) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq !== "function") return;
  const contentName =
    phase === "waitlist"
      ? `Cohort ${cohortNumber} Waitlist`
      : `Cohort ${cohortNumber} Application`;
  try {
    fbq("track", "Lead", {
      content_name: contentName,
      content_category: "coaching",
      ...(persona ? { content_type: persona } : {}),
      value: 195,
      currency: "USD",
    });
  } catch {
    /* pixel failure never blocks UX */
  }
  // Additionally: a plausible/GA-compatible custom event if either is loaded.
  try {
    const gtag = (window as unknown as {
      gtag?: (...args: unknown[]) => void;
    }).gtag;
    if (typeof gtag === "function") {
      gtag("event", "cohort_application_submit", {
        event_category: "coaching",
        value: 195,
        persona,
        phase,
        cohort: cohortNumber,
        email_hash: email.length, // privacy-safe signal; swap for sha256 later
      });
    }
  } catch {
    /* ignore */
  }
}

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

  const cohortState = getCohortState();
  const isWaitlist = cohortState.phase === "waitlist";
  const cohortCopy = cohortState.form;

  // Restore in-progress draft on mount so a failed submit or
  // accidental tab-close doesn't lose 4 steps of answers.
  useEffect(() => {
    const draft = loadDraft();
    if (!draft) return;
    // Don't restore to the submitted step — force user back into flow
    if (draft.step && draft.step !== "submitted") setStep(draft.step);
    if (draft.goal) setGoal(draft.goal);
    if (draft.hours) setHours(draft.hours);
    if (draft.frustration) setFrustration(draft.frustration);
    if (draft.name) setName(draft.name);
    if (draft.email) setEmail(draft.email);
    if (draft.ftp) setFtp(draft.ftp);
  }, []);

  // Persist answers as the user moves through the form.
  useEffect(() => {
    if (step === "submitted") return;
    saveDraft({ step, goal, hours, frustration, name, email, ftp });
  }, [step, goal, hours, frustration, name, email, ftp]);

  const stepIndex = ["goal", "hours", "frustration", "details", "submitted"].indexOf(step);

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!name.trim() || !trimmedEmail) {
      setError("Name and email are required.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/cohort/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: trimmedEmail,
          goal,
          hours,
          ftp: ftp.trim(),
          frustration,
        }),
      });

      if (!res.ok) {
        // Keep the user's answers so they can retry without starting over.
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to submit");
      }
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        persona?: string;
      };
      // Lead event (FB Pixel + GA) — attribution for ad spend
      trackLead(
        trimmedEmail,
        data.persona,
        cohortState.phase,
        cohortState.targetCohort,
      );
      // Internal funnel event (DEV-DATA-01): terminal step of the
      // content -> coaching funnel on the measurement dashboard.
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const track = (window as any).__roadmanTrack;
        if (typeof track === "function") {
          track("coaching_apply_submitted", { source: "cohort-apply" });
        }
      } catch {
        // analytics never breaks UX
      }
      // Success — wipe the draft so next visit starts fresh
      clearDraft();
      setStep("submitted");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
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
                {submitting ? "SUBMITTING..." : cohortCopy.buttonText}
              </button>
              <p className="text-foreground-subtle text-xs text-center">
                {isWaitlist
                  ? `Cohort ${cohortState.targetCohort} is coming soon. Waitlist members get 24-hour early access.`
                  : "We review every application. You'll hear back within 24 hours."}
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
            <div className="text-5xl mb-4">{isWaitlist ? "✅" : "🎯"}</div>
            <h3 className="font-heading text-off-white text-3xl mb-3">
              {cohortCopy.submittedHeadline}
            </h3>
            <p className="text-foreground-muted max-w-sm mx-auto mb-6">
              {cohortCopy.submittedBody}
              {" "}Confirmation at <span className="text-coral">{email}</span>.
            </p>
            <p className="text-foreground-subtle text-sm">
              {isWaitlist
                ? `Cohort ${cohortState.targetCohort} is coming soon. You'll get 24-hour early access before public launch.`
                : `Only 30 spots for Cohort ${cohortState.currentCohort}. Apply now.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
