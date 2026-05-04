"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DRAFT_KEY = "roadman-inner-circle-draft-v1";

type Step =
  | "intro"
  | "name"
  | "email"
  | "ftp"
  | "hours"
  | "goal"
  | "tried"
  | "why"
  | "submitted";

const STEP_ORDER: Step[] = [
  "intro",
  "name",
  "email",
  "ftp",
  "hours",
  "goal",
  "tried",
  "why",
];

interface DraftState {
  step: Step;
  name: string;
  email: string;
  ftp: string;
  hours: string;
  goal: string;
  triedBefore: string;
  whyInnerCircle: string;
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
    /* quota / privacy mode — fail silently */
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

function trackLead(email: string) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === "function") {
    try {
      fbq("track", "Lead", {
        content_name: "Inner Circle Application",
        content_category: "premium-coaching",
        value: 525,
        currency: "USD",
      });
    } catch {
      /* pixel never blocks UX */
    }
  }
  try {
    const gtag = (window as unknown as {
      gtag?: (...args: unknown[]) => void;
    }).gtag;
    if (typeof gtag === "function") {
      gtag("event", "inner_circle_application_submit", {
        event_category: "premium-coaching",
        value: 525,
        email_hash: email.length,
      });
    }
  } catch {
    /* ignore */
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const internal = (window as any).__roadmanTrack;
    if (typeof internal === "function") {
      internal("inner_circle_application_submitted", { source: "inner-circle-apply" });
    }
  } catch {
    /* ignore */
  }
}

const HOURS = [
  { value: "Under 6 hours", label: "<6h" },
  { value: "6-9 hours", label: "6-9h" },
  { value: "9-12 hours", label: "9-12h" },
  { value: "12-15 hours", label: "12-15h" },
  { value: "15+ hours", label: "15+" },
];

export function InnerCircleApplicationForm() {
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ftp, setFtp] = useState("");
  const [hours, setHours] = useState("");
  const [goal, setGoal] = useState("");
  const [triedBefore, setTriedBefore] = useState("");
  const [whyInnerCircle, setWhyInnerCircle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Restore in-progress draft on mount.
  useEffect(() => {
    const draft = loadDraft();
    if (!draft) return;
    if (draft.step && draft.step !== "submitted") setStep(draft.step);
    if (draft.name) setName(draft.name);
    if (draft.email) setEmail(draft.email);
    if (draft.ftp) setFtp(draft.ftp);
    if (draft.hours) setHours(draft.hours);
    if (draft.goal) setGoal(draft.goal);
    if (draft.triedBefore) setTriedBefore(draft.triedBefore);
    if (draft.whyInnerCircle) setWhyInnerCircle(draft.whyInnerCircle);
  }, []);

  // Persist as the user fills the form.
  useEffect(() => {
    if (step === "submitted") return;
    saveDraft({ step, name, email, ftp, hours, goal, triedBefore, whyInnerCircle });
  }, [step, name, email, ftp, hours, goal, triedBefore, whyInnerCircle]);

  const stepIndex = STEP_ORDER.indexOf(step);
  const totalSteps = STEP_ORDER.length - 1; // exclude intro from progress

  function go(next: Step) {
    setError("");
    setStep(next);
  }

  function back() {
    const i = STEP_ORDER.indexOf(step);
    if (i > 0) go(STEP_ORDER[i - 1]);
  }

  async function handleSubmit() {
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedFtp = ftp.trim();
    const trimmedGoal = goal.trim();
    const trimmedTried = triedBefore.trim();
    const trimmedWhy = whyInnerCircle.trim();

    if (!trimmedName || !trimmedEmail) {
      setError("Name and email are required.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!hours) {
      setError("Tell us your weekly hours so we can match the coaching to your week.");
      return;
    }
    if (!trimmedGoal) {
      setError("Your biggest goal helps us decide if this is the right fit.");
      return;
    }
    if (trimmedWhy.length < 12) {
      setError("Tell us a little more about why Inner Circle specifically.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/cohort/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          ftp: trimmedFtp,
          hours,
          goal: trimmedGoal,
          frustration: trimmedWhy,
          triedBefore: trimmedTried,
          whyInnerCircle: trimmedWhy,
          cohort: "inner-circle",
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to submit");
      }
      trackLead(trimmedEmail);
      clearDraft();
      setStep("submitted");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const slide = {
    enter: { opacity: 0, x: 36, filter: "blur(4px)" },
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -36, filter: "blur(4px)" },
  };

  const fieldClass =
    "w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-off-white caret-amber-300 placeholder:text-foreground-subtle focus:border-amber-300/60 focus:outline-none focus:ring-1 focus:ring-amber-300/30 transition-colors";

  const primaryBtn =
    "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-heading tracking-[0.15em] uppercase text-[#1a0535] bg-gradient-to-r from-amber-300 via-amber-300 to-amber-500 hover:brightness-105 disabled:opacity-50 transition-all shadow-[0_10px_30px_-12px_rgba(251,191,36,0.55)]";

  const secondaryBtn =
    "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-heading tracking-[0.15em] uppercase text-foreground-muted bg-white/[0.03] border border-white/10 hover:text-off-white hover:border-white/20 transition-colors";

  return (
    <div className="relative">
      {step !== "intro" && step !== "submitted" && (
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {STEP_ORDER.slice(1).map((s, i) => {
            const filled = i < stepIndex;
            const current = STEP_ORDER[stepIndex] === s;
            return (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  current
                    ? "bg-gradient-to-r from-amber-300 to-amber-500 w-10"
                    : filled
                      ? "bg-amber-300/70 w-6"
                      : "bg-white/10 w-4"
                }`}
              />
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div
            key="intro"
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <p className="font-heading text-amber-300 text-xs tracking-[0.4em] mb-5">
              ★ APPLICATION
            </p>
            <h3 className="font-heading text-off-white text-3xl md:text-4xl leading-tight mb-4">
              EIGHT QUESTIONS.
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                FOUR MINUTES.
              </span>
            </h3>
            <p className="text-foreground-muted max-w-md mx-auto mb-8 leading-relaxed">
              Answer honestly. Anthony reads every application personally and
              replies within 48 hours. No autoresponders, no boilerplate.
            </p>
            <button
              type="button"
              onClick={() => go("name")}
              className={primaryBtn}
            >
              Begin Application
            </button>
            <p className="text-foreground-subtle text-xs mt-6 tracking-[0.2em] uppercase">
              $525 / month &middot; Limited intake &middot; Cancel any time
            </p>
          </motion.div>
        )}

        {step === "name" && (
          <motion.div key="name" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
            <h3 className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2">
              FIRST — YOUR NAME?
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              The name a coach should call you.
            </p>
            <div className="max-w-sm mx-auto space-y-4">
              <input
                type="text"
                placeholder="First and last name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) go("email");
                }}
                className={fieldClass}
                autoFocus
              />
              <div className="flex items-center justify-between">
                <button type="button" onClick={back} className={secondaryBtn}>
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => name.trim() && go("email")}
                  disabled={!name.trim()}
                  className={primaryBtn}
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "email" && (
          <motion.div key="email" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
            <h3 className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2">
              WHERE DO WE REPLY?
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              Anthony writes back within 48 hours.
            </p>
            <div className="max-w-sm mx-auto space-y-4">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    EMAIL_REGEX.test(email.trim())
                  ) {
                    go("ftp");
                  }
                }}
                className={fieldClass}
                autoFocus
              />
              <div className="flex items-center justify-between">
                <button type="button" onClick={back} className={secondaryBtn}>
                  Back
                </button>
                <button
                  type="button"
                  onClick={() =>
                    EMAIL_REGEX.test(email.trim()) && go("ftp")
                  }
                  disabled={!EMAIL_REGEX.test(email.trim())}
                  className={primaryBtn}
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "ftp" && (
          <motion.div key="ftp" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
            <h3 className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2">
              CURRENT FTP?
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              In watts. Or skip if you&apos;re not sure — we&apos;ll work it out together.
            </p>
            <div className="max-w-sm mx-auto space-y-4">
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 265"
                value={ftp}
                onChange={(e) => setFtp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") go("hours");
                }}
                className={fieldClass}
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setFtp("Not sure");
                  go("hours");
                }}
                className="w-full text-center text-foreground-subtle text-sm hover:text-amber-200 transition-colors py-2"
              >
                I&apos;m not sure &rarr;
              </button>
              <div className="flex items-center justify-between">
                <button type="button" onClick={back} className={secondaryBtn}>
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => go("hours")}
                  className={primaryBtn}
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "hours" && (
          <motion.div key="hours" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
            <h3 className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2">
              HOURS PER WEEK?
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              Your real number, averaged across the year.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
              {HOURS.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => {
                    setHours(h.value);
                    go("goal");
                  }}
                  className={`px-4 py-4 rounded-xl border transition-all duration-200 ${
                    hours === h.value
                      ? "border-amber-300/70 bg-amber-300/10 shadow-[0_0_20px_rgba(251,191,36,0.18)]"
                      : "border-white/10 bg-white/[0.03] hover:border-amber-300/40 hover:bg-amber-300/[0.06]"
                  }`}
                >
                  <span
                    className={`font-heading text-lg ${
                      hours === h.value ? "text-amber-200" : "text-off-white"
                    }`}
                  >
                    {h.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-6 max-w-md mx-auto">
              <button type="button" onClick={back} className={secondaryBtn}>
                Back
              </button>
            </div>
          </motion.div>
        )}

        {step === "goal" && (
          <motion.div key="goal" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
            <h3 className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2">
              WHAT&apos;S YOUR BIGGEST GOAL?
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              The race, the number, or the version of yourself you&apos;re chasing.
            </p>
            <div className="max-w-md mx-auto space-y-4">
              <textarea
                placeholder="e.g. Etape du Tour 2027 inside 9 hours, or jump from Cat 3 to Cat 1, or get back to the FTP I had at 35..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={4}
                className={fieldClass + " resize-none"}
                autoFocus
              />
              <div className="flex items-center justify-between">
                <button type="button" onClick={back} className={secondaryBtn}>
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => goal.trim() && go("tried")}
                  disabled={!goal.trim()}
                  className={primaryBtn}
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "tried" && (
          <motion.div key="tried" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
            <h3 className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2">
              WHAT HAVE YOU TRIED BEFORE?
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              Apps, plans, coaches, podcasts — and where each one fell short.
            </p>
            <div className="max-w-md mx-auto space-y-4">
              <textarea
                placeholder="e.g. Two years on TrainerRoad. Six months with a part-time coach. Lots of podcasts. Power gains stalled in winter and never came back..."
                value={triedBefore}
                onChange={(e) => setTriedBefore(e.target.value)}
                rows={5}
                className={fieldClass + " resize-none"}
                autoFocus
              />
              <div className="flex items-center justify-between">
                <button type="button" onClick={back} className={secondaryBtn}>
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => go("why")}
                  className={primaryBtn}
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "why" && (
          <motion.div key="why" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
            <h3 className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2">
              WHY INNER CIRCLE?
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              What pulled you to this page, this tier, this price.
            </p>
            <div className="max-w-md mx-auto space-y-4">
              <textarea
                placeholder="e.g. I want a coach reading my data daily, not every fortnight. I&apos;m turning 50 next year and want bloods worked into the plan. I&apos;m done guessing..."
                value={whyInnerCircle}
                onChange={(e) => setWhyInnerCircle(e.target.value)}
                rows={5}
                className={fieldClass + " resize-none"}
                autoFocus
              />
              {error && (
                <p className="text-amber-300 text-sm text-center">{error}</p>
              )}
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={back} className={secondaryBtn}>
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={primaryBtn}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
              <p className="text-foreground-subtle text-xs text-center">
                Anthony reviews every application personally. You&apos;ll hear back within 48 hours.
              </p>
            </div>
          </motion.div>
        )}

        {step === "submitted" && (
          <motion.div
            key="submitted"
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="text-center py-6"
          >
            <div className="text-5xl mb-5" aria-hidden>
              ★
            </div>
            <h3 className="font-heading text-off-white text-3xl md:text-4xl mb-4 leading-tight">
              APPLICATION RECEIVED.
            </h3>
            <p className="text-foreground-muted max-w-md mx-auto mb-3 leading-relaxed">
              Thanks, {name.split(" ")[0] || "rider"}. Anthony reviews every
              Inner Circle application personally — you&apos;ll hear back
              within 48 hours.
            </p>
            <p className="text-foreground-muted max-w-md mx-auto mb-8 leading-relaxed">
              Confirmation copy is on its way to{" "}
              <span className="text-amber-200">{email}</span>.
            </p>
            <p className="text-foreground-subtle text-xs tracking-[0.2em] uppercase">
              ★ Inner Circle &middot; $525 / month
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
