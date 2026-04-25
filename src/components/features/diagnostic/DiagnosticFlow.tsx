"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import { AGE_BRACKETS, HOURS_BRACKETS } from "@/lib/diagnostic/types";
import { QUESTIONS } from "@/lib/diagnostic/questions";

/**
 * The full diagnostic experience — demographics → 12 scored
 * questions → optional Q13 → email gate → processing → route to
 * /diagnostic/[slug]. One component so the state machine stays in one
 * place and session persistence doesn't have to thread through a
 * dozen pages.
 *
 * Key UX rules from the spec (§5):
 *  - One question per screen, no long scrolling forms
 *  - Progress bar always visible
 *  - Back button always available
 *  - sessionStorage save-as-you-go so a reload doesn't lose progress
 */

const STORAGE_KEY = "plateau-diagnostic-v1";
const AGE_LABELS: Record<string, string> = {
  "35-44": "35 to 44",
  "45-54": "45 to 54",
  "55-64": "55 to 64",
  "65+": "65 or over",
};
const HOURS_LABELS: Record<string, string> = {
  "under-5": "Under 5 hours",
  "5-8": "5 to 8 hours",
  "9-12": "9 to 12 hours",
  "13+": "13 or more hours",
};

type Step =
  | { kind: "age" }
  | { kind: "hours" }
  | { kind: "ftp" }
  | { kind: "goal" }
  | { kind: "question"; index: number } // 0..11 → Q1..Q12
  | { kind: "q13" }
  | { kind: "email" }
  | { kind: "processing" }
  | { kind: "error"; message: string };

interface State {
  age: string | null;
  hoursPerWeek: string | null;
  ftp: string; // kept as string so the optional field is trivially empty
  goal: string;
  answers: Partial<Record<(typeof QUESTIONS)[number]["key"], 0 | 1 | 2 | 3>>;
  q13: string;
}

const EMPTY_STATE: State = {
  age: null,
  hoursPerWeek: null,
  ftp: "",
  goal: "",
  answers: {},
  q13: "",
};

function loadPersisted(): State {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<State>;
    return { ...EMPTY_STATE, ...parsed, answers: parsed.answers ?? {} };
  } catch {
    return EMPTY_STATE;
  }
}

function persist(state: State): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage full / disabled — non-fatal, we just lose the
    // save-as-you-go benefit.
  }
}

function clearPersisted(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function useSessionId(): string {
  const [sessionId, setSessionId] = useState("");
  useEffect(() => {
    // Generated on mount rather than during render so the impure
    // crypto.randomUUID / Date.now calls don't run on the server or
    // get flagged as render-time impurity.
    try {
      const existing = sessionStorage.getItem("plateau-session-id");
      if (existing) {
        setSessionId(existing);
        return;
      }
      const sid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `s-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
      sessionStorage.setItem("plateau-session-id", sid);
      setSessionId(sid);
    } catch {
      setSessionId(`s-${Date.now()}`);
    }
  }, []);
  return sessionId;
}

export function DiagnosticFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = useSessionId();

  const [state, setState] = useState<State>(EMPTY_STATE);
  // Land paid traffic on the first question rather than a redundant
  // "Start" button. The CTA on the landing page already counts as
  // start-intent; making them click again loses 5–10% of clicks.
  const [step, setStep] = useState<Step>({ kind: "age" });
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Hydrate sessionStorage on mount. SSR-safe.
  useEffect(() => {
    setState(loadPersisted());
    setHydrated(true);
  }, []);

  // Fire `diagnostic_start` once the session id is hydrated. Used to
  // be tied to the intro-screen button click — that step is gone, so
  // mount IS start.
  useEffect(() => {
    if (!sessionId) return;
    trackAnalyticsEvent({
      type: "diagnostic_start",
      page: "/plateau",
      sessionId,
      meta: {
        utm_source: searchParams.get("utm_source") ?? "",
        utm_campaign: searchParams.get("utm_campaign") ?? "",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Persist on state change. Debounced so text inputs (goal, q13)
  // don't hammer sessionStorage on every keystroke — radio clicks
  // still feel instant because they advance the step and settle long
  // before the 200ms window expires.
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => persist(state), 200);
    return () => clearTimeout(t);
  }, [state, hydrated]);

  const utm = useMemo(() => {
    return {
      source: searchParams.get("utm_source") ?? undefined,
      medium: searchParams.get("utm_medium") ?? undefined,
      campaign: searchParams.get("utm_campaign") ?? undefined,
      content: searchParams.get("utm_content") ?? undefined,
      term: searchParams.get("utm_term") ?? undefined,
    };
  }, [searchParams]);

  // ── Step math ──────────────────────────────────────────
  // Demographics is 4 pre-questions (age, hours, ftp, goal). The 12
  // scored questions are the weight. Q13 is optional. Email gate is
  // the final step. We use this to drive the progress bar.
  const totalSteps = 4 + 12 + 1 + 1; // 18
  const stepNumber = (() => {
    switch (step.kind) {
      case "age":
        return 1;
      case "hours":
        return 2;
      case "ftp":
        return 3;
      case "goal":
        return 4;
      case "question":
        return 5 + step.index;
      case "q13":
        return 5 + 12;
      case "email":
        return 5 + 12 + 1;
      case "processing":
      case "error":
        return totalSteps;
    }
  })();
  const progress = Math.min(100, Math.round((stepNumber / totalSteps) * 100));

  // ── Navigation helpers ─────────────────────────────────
  const goBack = useCallback(() => {
    setStep((prev) => {
      switch (prev.kind) {
        case "age":
          // Already at the first step — back is a no-op rather than
          // resurrecting the dead intro screen.
          return prev;
        case "hours":
          return { kind: "age" };
        case "ftp":
          return { kind: "hours" };
        case "goal":
          return { kind: "ftp" };
        case "question":
          if (prev.index === 0) return { kind: "goal" };
          return { kind: "question", index: prev.index - 1 };
        case "q13":
          return { kind: "question", index: 11 };
        case "email":
          return { kind: "q13" };
        default:
          return prev;
      }
    });
  }, []);

  const advanceFromDemographics = useCallback(
    (next: Step) => {
      setStep(next);
    },
    []
  );

  const answerQuestion = useCallback(
    (index: number, value: 0 | 1 | 2 | 3) => {
      const q = QUESTIONS[index];
      setState((s) => ({
        ...s,
        answers: { ...s.answers, [q.key]: value },
      }));
      trackAnalyticsEvent({
        type: "diagnostic_progress",
        page: "/plateau",
        sessionId,
        meta: { question: q.key, value: String(value) },
      });
      if (index < 11) {
        setStep({ kind: "question", index: index + 1 });
      } else {
        setStep({ kind: "q13" });
      }
    },
    [sessionId]
  );

  const submit = useCallback(
    async (email: string, consent: boolean) => {
      if (submitting) return;
      setSubmitting(true);
      setStep({ kind: "processing" });

      try {
        const res = await fetch("/api/diagnostic/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            consent,
            age: state.age,
            hoursPerWeek: state.hoursPerWeek,
            ftp: state.ftp ? Number(state.ftp) : null,
            goal: state.goal || null,
            Q13: state.q13 || null,
            sessionId,
            utm,
            referrer:
              typeof document !== "undefined" ? document.referrer || null : null,
            ...state.answers,
          }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          setStep({
            kind: "error",
            message: data.error ?? "Something went wrong. Please try again.",
          });
          setSubmitting(false);
          return;
        }

        const data = (await res.json()) as { slug: string };
        clearPersisted();
        // ?fresh=1 flags the first visit so the results page can show
        // the "Sent. Check your inbox." banner. SuccessBanner strips
        // it from the address bar after mount.
        router.push(`/diagnostic/${data.slug}?fresh=1`);
      } catch (err) {
        console.error("[Diagnostic] submit failed", err);
        setStep({
          kind: "error",
          message: "Something went wrong. Please try again.",
        });
        setSubmitting(false);
      }
    },
    [router, sessionId, state, submitting, utm]
  );

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <ProgressBar percent={progress} stepNumber={stepNumber} total={totalSteps} />

      <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6 md:p-10">

        {step.kind === "age" && (
          <ChoiceStep
            kicker="Step 1 of 4"
            heading="First — which age bracket are you in?"
            hint="Training recommendations shift meaningfully over 40, and again over 50."
            options={AGE_BRACKETS.map((b) => ({ id: b, label: AGE_LABELS[b] }))}
            selectedId={state.age}
            onSelect={(id) => {
              setState((s) => ({ ...s, age: id }));
              advanceFromDemographics({ kind: "hours" });
            }}
            onBack={goBack}
          />
        )}

        {step.kind === "hours" && (
          <ChoiceStep
            kicker="Step 2 of 4"
            heading="Roughly how many hours a week do you ride?"
            hint="An honest weekly average. Not your best week."
            options={HOURS_BRACKETS.map((b) => ({ id: b, label: HOURS_LABELS[b] }))}
            selectedId={state.hoursPerWeek}
            onSelect={(id) => {
              setState((s) => ({ ...s, hoursPerWeek: id }));
              advanceFromDemographics({ kind: "ftp" });
            }}
            onBack={goBack}
          />
        )}

        {step.kind === "ftp" && (
          <NumberStep
            kicker="Step 3 of 4 · Optional"
            heading="Your current FTP, if you've tested recently."
            hint="In watts. Sharing it makes the diagnosis far more specific — but skip freely if you don't know or don't want to."
            value={state.ftp}
            onChange={(v) => setState((s) => ({ ...s, ftp: v }))}
            onSkip={() => advanceFromDemographics({ kind: "goal" })}
            onContinue={() => advanceFromDemographics({ kind: "goal" })}
            onBack={goBack}
            placeholder="e.g. 285"
          />
        )}

        {step.kind === "goal" && (
          <TextStep
            kicker="Step 4 of 4 · Optional"
            heading="What's your main goal this year?"
            hint="One line — race name, event, or the outcome you want. We use it to tailor the breakdown to what you're actually training for."
            value={state.goal}
            onChange={(v) => setState((s) => ({ ...s, goal: v.slice(0, 500) }))}
            onSkip={() => advanceFromDemographics({ kind: "question", index: 0 })}
            onContinue={() =>
              advanceFromDemographics({ kind: "question", index: 0 })
            }
            onBack={goBack}
            placeholder="e.g. Etape du Tour, sub-4h 100 miler, or just 'stop getting dropped'"
          />
        )}

        {step.kind === "question" && (
          <QuestionStep
            index={step.index}
            onAnswer={(value) => answerQuestion(step.index, value)}
            selectedValue={state.answers[QUESTIONS[step.index].key] ?? null}
            onBack={goBack}
          />
        )}

        {step.kind === "q13" && (
          <TextStep
            kicker="Last question · Optional"
            heading="Anything else you want us to know?"
            hint="What's your best guess at why you're stuck? Takes the diagnosis from good to precise."
            value={state.q13}
            onChange={(v) => setState((s) => ({ ...s, q13: v.slice(0, 500) }))}
            onSkip={() => setStep({ kind: "email" })}
            onContinue={() => setStep({ kind: "email" })}
            onBack={goBack}
            textarea
            placeholder="500 character max. Keep it specific if you can."
          />
        )}

        {step.kind === "email" && (
          <EmailStep
            onSubmit={submit}
            onBack={goBack}
            submitting={submitting}
          />
        )}

        {step.kind === "processing" && <ProcessingStep />}

        {step.kind === "error" && (
          <div className="text-center space-y-6 py-8" role="alert">
            <h2 className="font-heading text-2xl text-off-white">
              That didn&rsquo;t work.
            </h2>
            <p className="text-foreground-muted">{step.message}</p>
            <button
              type="button"
              onClick={() => setStep({ kind: "email" })}
              className="font-heading tracking-wider bg-coral hover:bg-coral-hover text-off-white px-8 py-3 rounded-md transition-colors cursor-pointer"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step components ──────────────────────────────────────

function ProgressBar({
  percent,
  stepNumber,
  total,
}: {
  percent: number;
  stepNumber: number;
  total: number;
}) {
  return (
    <div
      aria-label="Diagnostic progress"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`Step ${Math.min(stepNumber, total)} of ${total}`}
    >
      <div className="flex justify-between items-baseline mb-2 text-xs font-heading tracking-widest text-foreground-subtle">
        <span>
          STEP {Math.min(stepNumber, total)} OF {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-coral transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

interface ChoiceStepProps {
  kicker: string;
  heading: string;
  hint?: string;
  options: Array<{ id: string; label: string }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
}

function ChoiceStep({
  kicker,
  heading,
  hint,
  options,
  selectedId,
  onSelect,
  onBack,
}: ChoiceStepProps) {
  return (
    <div className="space-y-6">
      <StepHeader kicker={kicker} heading={heading} hint={hint} />
      <div className="space-y-3" role="radiogroup" aria-label={heading}>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selectedId === opt.id}
            onClick={() => onSelect(opt.id)}
            className={`
              block w-full text-left rounded-lg border px-5 py-4 cursor-pointer
              transition-colors font-medium
              ${
                selectedId === opt.id
                  ? "border-coral bg-coral/10 text-off-white"
                  : "border-white/10 bg-white/[0.03] text-foreground-muted hover:border-white/25 hover:bg-white/[0.07] hover:text-off-white"
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <BackLink onBack={onBack} />
    </div>
  );
}

function QuestionStep({
  index,
  selectedValue,
  onAnswer,
  onBack,
}: {
  index: number;
  selectedValue: 0 | 1 | 2 | 3 | null;
  onAnswer: (value: 0 | 1 | 2 | 3) => void;
  onBack: () => void;
}) {
  const q = QUESTIONS[index];
  return (
    <div className="space-y-6">
      <StepHeader kicker={`Question ${index + 1} of 12`} heading={q.prompt} />
      <div className="space-y-3" role="radiogroup" aria-label={q.prompt}>
        {q.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selectedValue === opt.value}
            onClick={() => onAnswer(opt.value)}
            className={`
              block w-full text-left rounded-lg border px-5 py-4 cursor-pointer
              transition-colors
              ${
                selectedValue === opt.value
                  ? "border-coral bg-coral/10 text-off-white"
                  : "border-white/10 bg-white/[0.03] text-foreground-muted hover:border-white/25 hover:bg-white/[0.07] hover:text-off-white"
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <BackLink onBack={onBack} />
    </div>
  );
}

function NumberStep({
  kicker,
  heading,
  hint,
  value,
  onChange,
  onSkip,
  onContinue,
  onBack,
  placeholder,
}: {
  kicker: string;
  heading: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  onSkip: () => void;
  onContinue: () => void;
  onBack: () => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-6">
      <StepHeader kicker={kicker} heading={heading} hint={hint} />
      <input
        type="number"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        className="
          w-full bg-white/5 border border-white/10 rounded-md px-4 py-3
          text-off-white placeholder:text-foreground-subtle
          focus:border-coral focus:outline-none transition-colors
        "
      />
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-foreground-subtle hover:text-off-white cursor-pointer py-2 px-2 rounded"
        >
          Skip this
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="font-heading tracking-wider bg-coral hover:bg-coral-hover text-off-white px-6 py-3 rounded-md transition-colors cursor-pointer"
        >
          CONTINUE
        </button>
      </div>
      <BackLink onBack={onBack} />
    </div>
  );
}

function TextStep({
  kicker,
  heading,
  hint,
  value,
  onChange,
  onSkip,
  onContinue,
  onBack,
  placeholder,
  textarea = false,
}: {
  kicker: string;
  heading: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  onSkip: () => void;
  onContinue: () => void;
  onBack: () => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-6">
      <StepHeader kicker={kicker} heading={heading} hint={hint} />
      {textarea ? (
        <textarea
          rows={4}
          maxLength={500}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full bg-white/5 border border-white/10 rounded-md px-4 py-3
            text-off-white placeholder:text-foreground-subtle
            focus:border-coral focus:outline-none transition-colors resize-none
          "
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={500}
          className="
            w-full bg-white/5 border border-white/10 rounded-md px-4 py-3
            text-off-white placeholder:text-foreground-subtle
            focus:border-coral focus:outline-none transition-colors
          "
        />
      )}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-foreground-subtle hover:text-off-white cursor-pointer py-2 px-2 rounded"
        >
          Skip this
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="font-heading tracking-wider bg-coral hover:bg-coral-hover text-off-white px-6 py-3 rounded-md transition-colors cursor-pointer"
        >
          CONTINUE
        </button>
      </div>
      <BackLink onBack={onBack} />
    </div>
  );
}

function EmailStep({
  onSubmit,
  onBack,
  submitting,
}: {
  onSubmit: (email: string, consent: boolean) => void;
  onBack: () => void;
  submitting: boolean;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email.");
      return;
    }
    if (!consent) {
      setError("We need consent to email your diagnosis.");
      return;
    }
    setError(null);
    onSubmit(email.trim(), consent);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <StepHeader
        kicker="Last step"
        heading="Where should we send your diagnosis?"
        hint="So you can come back to it, and so the breakdown lands in your inbox in case you close the tab."
      />
      <input
        type="email"
        required
        autoComplete="email"
        autoFocus
        inputMode="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError(null);
        }}
        placeholder="your@email.com"
        className="
          w-full bg-white/5 border border-white/10 rounded-md px-4 py-3
          text-off-white placeholder:text-foreground-subtle
          focus:border-coral focus:outline-none transition-colors
        "
        disabled={submitting}
      />
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (error) setError(null);
          }}
          className="accent-coral mt-0.5 w-4 h-4 shrink-0 cursor-pointer"
        />
        <span className="text-sm text-foreground-muted leading-relaxed group-hover:text-off-white transition-colors">
          Send me my diagnosis and the Saturday Spin newsletter. I agree
          to the{" "}
          <a href="/privacy" className="text-coral hover:underline">
            Privacy Policy
          </a>
          .
        </span>
      </label>
      {/* Trust micro-copy. Three short reassurances right at the
          gate — this is the highest-friction moment of the flow and
          the hardest to recover from if the user bails. */}
      <ul className="text-xs text-foreground-subtle space-y-1.5">
        <li className="flex items-baseline gap-2">
          <span className="text-coral" aria-hidden="true">✓</span>
          One email with your diagnosis. No daily spam.
        </li>
        <li className="flex items-baseline gap-2">
          <span className="text-coral" aria-hidden="true">✓</span>
          Unsubscribe in one click. We honour it within the hour.
        </li>
        <li className="flex items-baseline gap-2">
          <span className="text-coral" aria-hidden="true">✓</span>
          We never sell your email. Ever.
        </li>
      </ul>
      {error && (
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="
          w-full font-heading tracking-wider bg-coral hover:bg-coral-hover
          disabled:opacity-60 text-off-white px-6 py-4 rounded-md
          transition-colors cursor-pointer text-lg
        "
      >
        {submitting ? "ANALYSING…" : "SEE MY DIAGNOSIS"}
      </button>
      <BackLink onBack={onBack} />
    </form>
  );
}

function ProcessingStep() {
  // Matches the spec's "3-4 second loader with real-time 'Analysing
  // your answers…' messaging". We rotate phases on a timer so the
  // wait feels deliberate rather than broken.
  const phases = useMemo(
    () => [
      "Scoring your answers across four profiles…",
      "Applying the cross-score bumps…",
      "Checking for multi-system patterns…",
      "Writing your personalised breakdown…",
    ],
    []
  );
  const [phaseIndex, setPhaseIndex] = useState(0);
  useEffect(() => {
    if (phaseIndex >= phases.length - 1) return;
    const t = setTimeout(() => setPhaseIndex((i) => i + 1), 900);
    return () => clearTimeout(t);
  }, [phaseIndex, phases.length]);

  return (
    <div
      className="text-center space-y-6 py-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex justify-center">
        <div
          className="h-12 w-12 rounded-full border-2 border-white/10 border-t-coral animate-spin"
          aria-hidden="true"
        />
      </div>
      <p className="font-heading text-xl text-off-white">ANALYSING</p>
      <p className="text-foreground-muted min-h-[1.5em]">
        {phases[phaseIndex]}
      </p>
    </div>
  );
}

function StepHeader({
  kicker,
  heading,
  hint,
}: {
  kicker: string;
  heading: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-coral font-heading text-xs tracking-widest mb-3">
        {kicker.toUpperCase()}
      </p>
      <h2 className="font-heading text-off-white text-2xl md:text-3xl leading-snug">
        {heading}
      </h2>
      {hint && <p className="text-foreground-muted mt-2 text-sm leading-relaxed">{hint}</p>}
    </div>
  );
}

function BackLink({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      // py-2 + the text gives a ~40px hit area, comfortable on mobile
      // without expanding the visible chrome.
      className="text-sm text-foreground-subtle hover:text-off-white cursor-pointer py-2 -ml-2 pl-2 pr-3 rounded"
    >
      ← Back
    </button>
  );
}
