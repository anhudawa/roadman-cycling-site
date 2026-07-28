"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { readApplicationAttribution } from "@/lib/analytics/application-attribution";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import { readClientConsent } from "@/lib/analytics/consent-client";
import {
  trackConsentedGoogleEvent,
  trackConsentedMetaEvent,
} from "@/lib/analytics/third-party-tags";
import { getCohortState } from "@/lib/cohort";

/** RFC-5322 lite — rejects `foo@`, `@bar`, and other common fat-finger failures. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** localStorage key for persisting in-progress application answers. */
const DRAFT_KEY = "roadman-cohort-draft-v2";
const LEGACY_DRAFT_KEY = "roadman-cohort-draft-v1";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
const NDY_GOOGLE_ADS_SEND_TO =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_NDY_APPLICATION_SEND_TO?.trim();

interface DraftState {
  step: Step;
  goal: string;
  hours: string;
  frustration: string;
  name: string;
  email: string;
  ftp: string;
  submissionId?: string;
}

function loadDraft(): Partial<DraftState> | null {
  if (typeof window === "undefined") return null;
  try {
    localStorage.removeItem(LEGACY_DRAFT_KEY);
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DraftState> & {
      savedAt?: unknown;
    };
    if (
      typeof parsed.savedAt !== "number" ||
      Date.now() - parsed.savedAt > DRAFT_TTL_MS
    ) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(state: DraftState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...state, savedAt: Date.now() }),
    );
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
 */
function trackLead(
  persona: string | undefined,
  submissionId: string | null,
) {
  if (typeof window === "undefined") return;
  const consent = readClientConsent();
  if (consent.marketing) {
    try {
      trackConsentedMetaEvent("Lead", {
        content_name: "NDY Application",
        content_category: "coaching",
        ...(persona ? { content_type: persona } : {}),
      });
    } catch {
      /* pixel failure never blocks UX */
    }
  }

  if (consent.analytics) {
    try {
      trackConsentedGoogleEvent(
        "ndy_application_submit",
        {
          event_category: "coaching",
          persona,
        },
        "analytics",
      );
    } catch {
      /* ignore */
    }
  }

  if (consent.marketing) {
    try {
      if (
        NDY_GOOGLE_ADS_SEND_TO &&
        /^AW-\d+\/[A-Za-z0-9_-]+$/.test(NDY_GOOGLE_ADS_SEND_TO)
      ) {
        trackConsentedGoogleEvent(
          "conversion",
          {
            send_to: NDY_GOOGLE_ADS_SEND_TO,
            value: 1,
            currency: "USD",
            transaction_id: submissionId ?? undefined,
          },
          "marketing",
        );
      }
    } catch {
      /* ignore */
    }
  }
}

function trackFunnel(
  event: string,
  meta: Record<string, string | number | boolean | undefined> = {},
) {
  if (typeof window === "undefined") return;
  try {
    const track = (
      window as unknown as {
        __roadmanTrack?: (
          eventName: string,
          eventMeta?: Record<string, unknown>,
        ) => void;
      }
    ).__roadmanTrack;
    if (typeof track === "function") {
      track(event, meta);
      return;
    }
    trackAnalyticsEvent({
      type: event,
      page: window.location.pathname,
      meta: Object.fromEntries(
        Object.entries(meta)
          .filter((entry): entry is [string, string | number | boolean] =>
            entry[1] !== undefined,
          )
          .map(([key, value]) => [key, String(value)]),
      ),
    });
  } catch {
    // Analytics must never interrupt the application.
  }
}

const GOALS = [
  "Race or event with a date",
  "Hit a specific power number",
  "Stop getting dropped on group rides",
  "Lose weight without losing power",
  "Get structured after years of winging it",
];

const HOURS = [
  { value: "Under 4 hours", label: "<4h" },
  { value: "4-6 hours", label: "4-6h" },
  { value: "6-9 hours", label: "6-9h" },
  { value: "9-12 hours", label: "9-12h" },
  { value: "12+ hours", label: "12+" },
];

const FRUSTRATIONS = [
  "Plateaued — stuck at a number I can't shift",
  "No structure — making it up as I go",
  "Lost motivation — can't stay consistent",
  "Injury or comeback — trying to get back",
  "Training hard but not seeing results",
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
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState<"name" | "email" | null>(null);
  const formRootRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const submissionIdRef = useRef<string | null>(null);
  const previousStepRef = useRef<Step>("goal");
  const formStartedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const cohortState = getCohortState();
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
    if (
      draft.submissionId &&
      /^[A-Za-z0-9_-]{8,100}$/.test(draft.submissionId)
    ) {
      submissionIdRef.current = draft.submissionId;
    }
  }, []);

  // Persist answers as the user moves through the form.
  useEffect(() => {
    if (step === "submitted") return;
    saveDraft({
      step,
      goal,
      hours,
      frustration,
      name,
      email,
      ftp,
      submissionId: submissionIdRef.current ?? undefined,
    });
  }, [step, goal, hours, frustration, name, email, ftp]);

  const stepIndex = ["goal", "hours", "frustration", "details", "submitted"].indexOf(step);

  useEffect(() => {
    if (previousStepRef.current === step) return;
    previousStepRef.current = step;

    const focusDelay = prefersReducedMotion ? 0 : 340;
    const timer = window.setTimeout(() => {
      const target =
        step === "details"
          ? formRootRef.current?.querySelector<HTMLElement>(
              "#application-name",
            )
          : formRootRef.current?.querySelector<HTMLElement>(
              `[data-application-step="${step}"]`,
            );
      target?.focus();
    }, focusDelay);

    return () => window.clearTimeout(timer);
  }, [step, prefersReducedMotion]);

  function trackFormStartOnce() {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    trackFunnel("apply_form_start", {
      source: "ndy-application",
    });
  }

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!name.trim() || !trimmedEmail) {
      const missingField = !name.trim() ? "name" : "email";
      setError("Name and email are required.");
      setErrorField(missingField);
      window.setTimeout(() => {
        formRootRef.current
          ?.querySelector<HTMLInputElement>(`#application-${missingField}`)
          ?.focus();
      }, 0);
      trackFunnel("apply_submit_error", {
        source: "ndy-application",
        reason: "missing_details",
      });
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      setErrorField("email");
      window.setTimeout(() => {
        formRootRef.current
          ?.querySelector<HTMLInputElement>("#application-email")
          ?.focus();
      }, 0);
      trackFunnel("apply_submit_error", {
        source: "ndy-application",
        reason: "invalid_email",
      });
      return;
    }

    trackFunnel("apply_step_completed", {
      source: "ndy-application",
      step: "details",
    });
    setSubmitting(true);
    setError("");
    setErrorField(null);
    if (!submissionIdRef.current) {
      submissionIdRef.current = crypto.randomUUID();
      saveDraft({
        step,
        goal,
        hours,
        frustration,
        name,
        email,
        ftp,
        submissionId: submissionIdRef.current,
      });
    }

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
          website,
          submissionId: submissionIdRef.current,
          attribution: readApplicationAttribution(),
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
        duplicate?: boolean;
        discarded?: boolean;
      };
      if (data.discarded) {
        setWebsite("");
        setError(
          "We couldn't send that application. Please try once more — your answers are still saved.",
        );
        window.setTimeout(() => errorRef.current?.focus(), 0);
        return;
      }
      if (!data.duplicate && !data.discarded) {
        // Lead event (Meta + Google Ads) — attribution for ad spend.
        trackLead(data.persona, submissionIdRef.current);
        trackFunnel("apply_submit_success", {
          source: "ndy-application",
          persona: data.persona,
        });
        trackFunnel("coaching_apply_submitted", { source: "cohort-apply" });
      }
      // Success — wipe the draft so next visit starts fresh
      clearDraft();
      submissionIdRef.current = null;
      setStep("submitted");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      setErrorField(null);
      window.setTimeout(() => errorRef.current?.focus(), 0);
      trackFunnel("apply_submit_error", {
        source: "ndy-application",
        reason: "request_failed",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const slideVariants = prefersReducedMotion
    ? {
        enter: { opacity: 1, x: 0, filter: "blur(0px)" },
        center: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 1, x: 0, filter: "blur(0px)" },
      }
    : {
        enter: { opacity: 0, x: 40, filter: "blur(4px)" },
        center: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: -40, filter: "blur(4px)" },
      };
  const slideTransition = { duration: prefersReducedMotion ? 0 : 0.3 };

  return (
    <div ref={formRootRef} className="relative">
      {/* Progress dots */}
      {step !== "submitted" && (
        <div
          className="mb-8"
          role="progressbar"
          aria-label="Application progress"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={stepIndex + 1}
          aria-valuetext={`Step ${stepIndex + 1} of 4`}
        >
          <div
            className="flex items-center justify-center gap-2"
            aria-hidden="true"
          >
            {["goal", "hours", "frustration", "details"].map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                  i <= stepIndex ? "bg-coral w-8" : "bg-white/10 w-4"
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-subtle">
            Step {stepIndex + 1} of 4
          </p>
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
            transition={slideTransition}
          >
            <h3
              id="goal-question"
              data-application-step="goal"
              tabIndex={-1}
              className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2"
            >
              WHAT&apos;S YOUR #1 GOAL?
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              Pick the one that resonates most
            </p>
            <div
              className="grid gap-3 max-w-md mx-auto"
              role="group"
              aria-labelledby="goal-question"
            >
              {GOALS.map((goalOption, index) => (
                <button
                  type="button"
                  key={goalOption}
                  onClick={() => {
                    setGoal(goalOption);
                    trackFormStartOnce();
                    trackFunnel("apply_step_completed", {
                      source: "ndy-application",
                      step: "goal",
                    });
                    setStep("hours");
                  }}
                  className="flex items-center gap-3 w-full text-left px-5 py-4 rounded-md border border-white/10 bg-white/[0.03] hover:border-coral/40 hover:bg-coral/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-deep-purple transition-all duration-200 group"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-[10px] font-semibold text-coral"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-off-white text-sm font-medium group-hover:text-coral transition-colors">
                    {goalOption}
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
            transition={slideTransition}
          >
            <h3
              id="hours-question"
              data-application-step="hours"
              tabIndex={-1}
              className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2"
            >
              HOURS PER WEEK?
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              Your real number, not your fantasy number
            </p>
            <div
              className="flex gap-3 justify-center flex-wrap max-w-md mx-auto"
              role="group"
              aria-labelledby="hours-question"
            >
              {HOURS.map((h) => (
                <button
                  type="button"
                  key={h.value}
                  onClick={() => {
                    trackFormStartOnce();
                    setHours(h.value);
                    trackFunnel("apply_step_completed", {
                      source: "ndy-application",
                      step: "hours",
                    });
                    setStep("frustration");
                  }}
                  className="px-6 py-4 rounded-md border border-white/10 bg-white/[0.03] hover:border-coral/40 hover:bg-coral/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-deep-purple transition-all duration-200 group min-w-[72px]"
                >
                  <span className="text-off-white font-heading text-lg group-hover:text-coral transition-colors">
                    {h.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep("goal")}
              className="mx-auto mt-7 block min-h-11 px-3 text-xs font-semibold uppercase tracking-widest text-foreground-muted transition-colors hover:text-off-white"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {step === "frustration" && (
          <motion.div
            key="frustration"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            <h3
              id="frustration-question"
              data-application-step="frustration"
              tabIndex={-1}
              className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2"
            >
              WHAT&apos;S ACTUALLY DOING YOUR HEAD IN?
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              The thing that made you click this page
            </p>
            <div
              className="grid gap-3 max-w-md mx-auto"
              role="group"
              aria-labelledby="frustration-question"
            >
              {FRUSTRATIONS.map((frustrationOption, index) => (
                <button
                  type="button"
                  key={frustrationOption}
                  onClick={() => {
                    trackFormStartOnce();
                    setFrustration(frustrationOption);
                    trackFunnel("apply_step_completed", {
                      source: "ndy-application",
                      step: "frustration",
                    });
                    setStep("details");
                  }}
                  className="flex items-center gap-3 w-full text-left px-5 py-4 rounded-md border border-white/10 bg-white/[0.03] hover:border-coral/40 hover:bg-coral/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-deep-purple transition-all duration-200 group"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-[10px] font-semibold text-coral"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-off-white text-sm font-medium group-hover:text-coral transition-colors">
                    {frustrationOption}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep("hours")}
              className="mx-auto mt-7 block min-h-11 px-3 text-xs font-semibold uppercase tracking-widest text-foreground-muted transition-colors hover:text-off-white"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {step === "details" && (
          <motion.div
            key="details"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            <h3
              data-application-step="details"
              tabIndex={-1}
              className="font-heading text-off-white text-2xl md:text-3xl text-center mb-2"
            >
              LAST STEP
            </h3>
            <p className="text-foreground-muted text-center mb-8 text-sm">
              So we can review your application
            </p>
            <form
              className="max-w-sm mx-auto space-y-4"
              onFocusCapture={trackFormStartOnce}
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit();
              }}
              noValidate
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
              >
                <label htmlFor="application-website">Website</label>
                <input
                  id="application-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                  data-bwignore
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="application-name"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground-muted"
                >
                  Your name
                </label>
                <input
                  id="application-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="e.g. Sam Murphy"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorField === "name") setErrorField(null);
                  }}
                  aria-invalid={errorField === "name"}
                  aria-describedby={
                    errorField === "name" ? "application-error" : undefined
                  }
                  className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/15 text-off-white caret-coral placeholder:text-foreground-subtle focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 focus:ring-offset-deep-purple transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label
                  htmlFor="application-email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground-muted"
                >
                  Email address
                </label>
                <input
                  id="application-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorField === "email") setErrorField(null);
                  }}
                  aria-invalid={errorField === "email"}
                  aria-describedby={
                    errorField === "email" ? "application-error" : undefined
                  }
                  className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/15 text-off-white caret-coral placeholder:text-foreground-subtle focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 focus:ring-offset-deep-purple transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="application-ftp"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground-muted"
                >
                  Current FTP <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  id="application-ftp"
                  name="ftp"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 245W"
                  value={ftp}
                  onChange={(e) => setFtp(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/15 text-off-white caret-coral placeholder:text-foreground-subtle focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 focus:ring-offset-deep-purple transition-colors"
                />
              </div>
              {error && (
                <p
                  id="application-error"
                  ref={errorRef}
                  role="alert"
                  tabIndex={-1}
                  className="text-red-300 text-sm text-center focus:outline-none"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-md bg-coral text-deep-purple font-heading text-lg tracking-wider hover:bg-coral/90 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-coral/20"
              >
                {submitting ? "SUBMITTING..." : cohortCopy.buttonText}
              </button>
              <p className="text-foreground-subtle text-xs text-center">
                Anthony reviews every application. You&apos;ll hear back within
                48 hours.
              </p>
              <button
                type="button"
                onClick={() => setStep("frustration")}
                className="mx-auto block min-h-11 px-3 text-xs font-semibold uppercase tracking-widest text-foreground-muted transition-colors hover:text-off-white"
              >
                ← Back
              </button>
            </form>
          </motion.div>
        )}

        {step === "submitted" && (
          <motion.div
            key="submitted"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="text-center py-8"
          >
            <div
              aria-hidden="true"
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-coral/35 bg-coral/10 text-2xl text-coral"
            >
              ✓
            </div>
            <h3
              data-application-step="submitted"
              tabIndex={-1}
              className="font-heading text-off-white text-3xl mb-3"
            >
              {cohortCopy.submittedHeadline}
            </h3>
            <p className="text-foreground-muted max-w-sm mx-auto mb-6">
              {cohortCopy.submittedBody}
              {" "}We&apos;ll reply to{" "}
              <span className="text-coral">{email}</span>.
            </p>
            <p className="text-foreground-subtle text-sm">
              Nothing else to do right now.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
