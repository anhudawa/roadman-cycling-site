"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GOAL_OPTIONS,
  HOURS_OPTIONS,
  LEVEL_OPTIONS,
  STEP_COPY,
  STEP_ORDER,
  type StepKey,
} from "@/lib/method/onboarding/questions";
import { recommend } from "@/lib/method/onboarding/recommend";
import type {
  Goal,
  Level,
  QuizAnswers,
  Recommendation,
  WeeklyHours,
} from "@/lib/method/onboarding/types";
import { OptionCard } from "./OptionCard";
import { QuizProgress } from "./QuizProgress";
import { ResultsView } from "./ResultsView";

const STORAGE_KEY = "method:onboarding:answers";

interface DraftAnswers {
  goal: Goal | null;
  hours: WeeklyHours | null;
  level: Level | null;
  ftp: string;
  eventDate: string;
}

const EMPTY: DraftAnswers = {
  goal: null,
  hours: null,
  level: null,
  ftp: "",
  eventDate: "",
};

function loadDraft(): DraftAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DraftAnswers>;
    return { ...EMPTY, ...parsed };
  } catch {
    return null;
  }
}

function saveDraft(d: DraftAnswers): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {
    // Quota or private-mode — fine, the form still works in-memory.
  }
}

function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignored.
  }
}

/**
 * Multi-step onboarding quiz. State machine lives in `stepIdx`; answers
 * persist to localStorage on every change so a refresh doesn't dump the
 * rider back to step 1. On completion, we compute the recommendation
 * client-side (no round-trip) and render <ResultsView>.
 */
export function OnboardingQuiz() {
  const [stepIdx, setStepIdx] = useState(0);
  const [draft, setDraft] = useState<DraftAnswers>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);

  // Hydrate from localStorage on mount. setState-in-effect is the
  // hydration-safe idiom used elsewhere in the Method tree (see
  // fuel-planner AssessmentForm) — the alternative (lazy init) would
  // diverge between SSR and client render.
  useEffect(() => {
    const existing = loadDraft();
    if (existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(existing);
    }
    setHydrated(true);
  }, []);

  // Persist every change.
  useEffect(() => {
    if (!hydrated) return;
    saveDraft(draft);
  }, [draft, hydrated]);

  const stepKey: StepKey = STEP_ORDER[stepIdx];
  const copy = STEP_COPY[stepKey];

  const canAdvance = useMemo(() => {
    switch (stepKey) {
      case "goal":
        return draft.goal !== null;
      case "hours":
        return draft.hours !== null;
      case "level":
        return draft.level !== null;
      case "ftp":
      case "event":
        return true; // Optional steps always advanceable.
    }
  }, [stepKey, draft]);

  function update<K extends keyof DraftAnswers>(key: K, value: DraftAnswers[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function back() {
    setStepIdx((i) => Math.max(0, i - 1));
  }

  function next() {
    if (stepIdx < STEP_ORDER.length - 1) {
      setStepIdx((i) => i + 1);
      return;
    }
    // Final step — compute recommendation.
    const ftpNum = draft.ftp.trim() ? Number(draft.ftp) : null;
    const ftp = ftpNum && Number.isFinite(ftpNum) && ftpNum > 0 ? ftpNum : null;
    const answers: QuizAnswers = {
      goal: draft.goal as Goal,
      hours: draft.hours as WeeklyHours,
      level: draft.level as Level,
      ftp,
      eventDate: draft.eventDate.trim() ? draft.eventDate : null,
    };
    setResult(recommend(answers));
  }

  function restart() {
    setResult(null);
    setDraft(EMPTY);
    setStepIdx(0);
    clearDraft();
  }

  if (!hydrated) {
    return (
      <div className="rounded-xl border border-white/10 bg-charcoal/60 p-6">
        <p className="text-foreground-muted">Loading…</p>
      </div>
    );
  }

  if (result) {
    return <ResultsView recommendation={result} onRestart={restart} />;
  }

  return (
    <div>
      <QuizProgress current={stepIdx + 1} total={STEP_ORDER.length} />

      <header className="mb-8">
        <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">
          {copy.eyebrow}
        </p>
        <h1
          id={`step-${stepKey}-title`}
          className="font-heading uppercase leading-[0.95] text-3xl md:text-4xl lg:text-5xl"
        >
          {copy.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm md:text-base text-foreground-muted leading-relaxed">
          {copy.helper}
        </p>
      </header>

      <fieldset
        className="space-y-3 mb-10"
        aria-labelledby={`step-${stepKey}-title`}
      >
        <legend className="sr-only">{copy.title}</legend>
        {stepKey === "goal" &&
          GOAL_OPTIONS.map((opt, i) => (
            <OptionCard
              key={opt.value}
              index={String(i + 1).padStart(2, "0")}
              label={opt.label}
              blurb={opt.blurb}
              selected={draft.goal === opt.value}
              onSelect={() => update("goal", opt.value)}
            />
          ))}

        {stepKey === "hours" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {HOURS_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                blurb={opt.blurb}
                selected={draft.hours === opt.value}
                onSelect={() => update("hours", opt.value)}
              />
            ))}
          </div>
        )}

        {stepKey === "level" &&
          LEVEL_OPTIONS.map((opt, i) => (
            <OptionCard
              key={opt.value}
              index={String(i + 1).padStart(2, "0")}
              label={opt.label}
              blurb={opt.blurb}
              selected={draft.level === opt.value}
              onSelect={() => update("level", opt.value)}
            />
          ))}

        {stepKey === "ftp" && (
          <FtpField
            value={draft.ftp}
            onChange={(v) => update("ftp", v)}
          />
        )}

        {stepKey === "event" && (
          <EventDateField
            value={draft.eventDate}
            onChange={(v) => update("eventDate", v)}
          />
        )}
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={stepIdx === 0}
          className="font-heading uppercase tracking-wider text-sm text-foreground-muted hover:text-off-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-center gap-4">
          {copy.optional && (
            <button
              type="button"
              onClick={next}
              className="font-heading uppercase tracking-wider text-xs text-foreground-muted hover:text-off-white transition-colors"
            >
              Skip
            </button>
          )}
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance}
            className="inline-flex items-center gap-2 rounded-md bg-coral hover:bg-coral-hover px-6 py-3 font-heading uppercase tracking-wider text-off-white text-sm shadow-[var(--shadow-glow-coral)] transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {stepIdx === STEP_ORDER.length - 1 ? "See my plan →" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Optional-step field primitives ─────────────────────────── */

function FtpField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block max-w-sm">
      <span className="block font-heading uppercase tracking-wider text-xs text-foreground-muted mb-2">
        Current FTP <span className="text-coral/80 ml-1">watts</span>
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={50}
        max={500}
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 245"
        className="w-full rounded-md border border-white/10 bg-charcoal/60 px-4 py-3 text-off-white text-lg focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
      />
      <span className="block text-xs text-foreground-muted mt-2">
        Used to seed your TrainingPeaks zones. Skip if you don&apos;t have a recent number — we test honestly in Module 01.
      </span>
    </label>
  );
}

function EventDateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  // Set min to today so the picker steers riders away from past dates.
  const today = new Date().toISOString().slice(0, 10);
  return (
    <label className="block max-w-sm">
      <span className="block font-heading uppercase tracking-wider text-xs text-foreground-muted mb-2">
        Event date
      </span>
      <input
        type="date"
        min={today}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-charcoal/60 px-4 py-3 text-off-white text-lg focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
      />
      <span className="block text-xs text-foreground-muted mt-2">
        Optional. A specific date anchors the periodisation — base, build and peak land where they need to.
      </span>
    </label>
  );
}
