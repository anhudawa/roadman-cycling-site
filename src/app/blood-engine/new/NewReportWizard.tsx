"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { MARKERS, type MarkerId, type Sex } from "@/lib/blood-engine/markers";
import {
  SYMPTOMS,
  TRAINING_PHASES,
  type Symptom,
  type TrainingPhase,
} from "@/lib/blood-engine/schemas";
import { BLOOD_ENGINE_DISCLAIMER } from "../../../../content/blood-engine/disclaimer";

type Step = "context" | "results" | "submit";

interface ContextState {
  age: string;
  sex: Sex;
  trainingHoursPerWeek: string;
  trainingPhase: TrainingPhase;
  symptoms: Symptom[];
  drawDate: string;
}

export interface InitialContext {
  age: number;
  sex: Sex;
  trainingHoursPerWeek: number;
  trainingPhase: TrainingPhase;
}

interface ResultRow {
  value: string;
  unit: string;
  include: boolean;
}

type ResultsState = Record<MarkerId, ResultRow>;

function defaultResults(): ResultsState {
  const out = {} as ResultsState;
  for (const m of MARKERS) {
    out[m.id] = { value: "", unit: m.canonicalUnit, include: true };
  }
  return out;
}

function todayIso(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

interface Props {
  tosAlreadyAccepted: boolean;
  initialContext?: InitialContext | null;
  hasPreviousReports?: boolean;
}

export function NewReportWizard({
  tosAlreadyAccepted,
  initialContext = null,
  hasPreviousReports = false,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("context");
  const [context, setContext] = useState<ContextState>({
    age: initialContext?.age ? String(initialContext.age) : "",
    sex: initialContext?.sex ?? "m",
    trainingHoursPerWeek: initialContext?.trainingHoursPerWeek
      ? String(initialContext.trainingHoursPerWeek)
      : "",
    trainingPhase: initialContext?.trainingPhase ?? "base",
    symptoms: [],
    drawDate: todayIso(),
  });
  const [results, setResults] = useState<ResultsState>(defaultResults);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [tosChecked, setTosChecked] = useState(tosAlreadyAccepted);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── STEP: CONTEXT ─────────────────────────────────────────
  if (step === "context") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setStep("results");
        }}
        className="space-y-6"
      >
        <StepHeader current={1} />

        {hasPreviousReports && initialContext ? (
          <p className="text-xs text-foreground-subtle bg-background-elevated border border-white/5 rounded-md px-3 py-2">
            Pre-filled from your last report. Update anything that&apos;s changed.
          </p>
        ) : null}

        <Field label="Age">
          <input
            type="number"
            min={16}
            max={100}
            required
            value={context.age}
            onChange={(e) => setContext({ ...context, age: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field label="Sex">
          <div className="flex gap-3">
            {(["m", "f"] as const).map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setContext({ ...context, sex: s })}
                className={chipClass(context.sex === s)}
              >
                {s === "m" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Weekly training hours">
          <input
            type="number"
            min={0}
            max={40}
            step={0.5}
            required
            value={context.trainingHoursPerWeek}
            onChange={(e) => setContext({ ...context, trainingHoursPerWeek: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field label="Training phase">
          <div className="flex flex-wrap gap-2">
            {TRAINING_PHASES.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setContext({ ...context, trainingPhase: p })}
                className={chipClass(context.trainingPhase === p)}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Symptoms (tap all that apply)">
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map((s) => {
              const on = context.symptoms.includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => {
                    setContext((prev) => {
                      const next = on
                        ? prev.symptoms.filter((x) => x !== s.id)
                        : [...prev.symptoms.filter((x) => x !== "none" || s.id === "none"), s.id];
                      // "none" is exclusive
                      return {
                        ...prev,
                        symptoms: s.id === "none" ? ["none"] : next.filter((x) => x !== "none"),
                      };
                    });
                  }}
                  className={chipClass(on)}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Date of blood draw">
          <input
            type="date"
            required
            value={context.drawDate}
            onChange={(e) => setContext({ ...context, drawDate: e.target.value })}
            className={inputClass}
          />
        </Field>

        <div className="pt-4">
          <Button type="submit" size="lg" className="w-full">
            Continue to results →
          </Button>
        </div>
      </form>
    );
  }

  // ── STEP: RESULTS ─────────────────────────────────────────
  if (step === "results") {
    async function onPdfSelected(file: File) {
      setPdfLoading(true);
      setPdfStatus(null);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/blood-engine/parse-pdf", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "PDF extraction failed");
        const extracted: Array<{ markerId: MarkerId; originalValue: number; originalUnit: string }> =
          data.extracted || [];
        setResults((prev) => {
          const next = { ...prev };
          for (const e of extracted) {
            next[e.markerId] = {
              include: true,
              value: String(e.originalValue),
              unit: e.originalUnit,
            };
          }
          return next;
        });
        setPdfStatus(
          extracted.length
            ? `Pulled ${extracted.length} value${extracted.length === 1 ? "" : "s"} from the PDF. Review below before submitting.`
            : "Couldn't find any recognised markers in that PDF. Type them in manually below."
        );
      } catch (err) {
        setPdfStatus(err instanceof Error ? err.message : "PDF extraction failed");
      } finally {
        setPdfLoading(false);
      }
    }

    const canContinue = MARKERS.some(
      (m) => results[m.id].include && results[m.id].value.trim() !== ""
    );

    return (
      <div className="space-y-6">
        <StepHeader current={2} />

        <div className="rounded-lg border border-white/10 bg-background-elevated p-6">
          <h3 className="font-heading uppercase text-off-white text-xl mb-3">Upload a PDF (optional)</h3>
          <p className="text-sm text-foreground-muted mb-4">
            We&apos;ll use the extractor to pre-fill the form. Review every value before you submit — PDF
            formats vary.
          </p>
          <input
            type="file"
            accept="application/pdf"
            disabled={pdfLoading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPdfSelected(f);
            }}
            className="block text-sm text-foreground-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-coral file:text-off-white file:font-heading file:uppercase file:tracking-wider"
          />
          {pdfLoading ? <p className="mt-3 text-sm text-foreground-muted">Extracting…</p> : null}
          {pdfStatus ? <p className="mt-3 text-sm text-coral">{pdfStatus}</p> : null}
        </div>

        <div className="rounded-lg border border-white/10 bg-background-elevated overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="font-heading uppercase text-off-white text-xl">Marker values</h3>
            <p className="text-sm text-foreground-muted mt-2">
              Uncheck markers you didn&apos;t test. Values you leave blank are skipped.
            </p>
          </div>
          <div className="divide-y divide-white/5">
            {MARKERS.map((m) => {
              const row = results[m.id];
              return (
                <div key={m.id} className="p-4 grid grid-cols-12 gap-3 items-center">
                  <label className="col-span-12 sm:col-span-5 flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={row.include}
                      onChange={(e) =>
                        setResults((prev) => ({
                          ...prev,
                          [m.id]: { ...prev[m.id], include: e.target.checked },
                        }))
                      }
                      className="accent-coral w-4 h-4"
                    />
                    <span className="font-heading uppercase text-off-white">{m.displayName}</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="value"
                    disabled={!row.include}
                    value={row.value}
                    onChange={(e) =>
                      setResults((prev) => ({
                        ...prev,
                        [m.id]: { ...prev[m.id], value: e.target.value },
                      }))
                    }
                    className={`col-span-7 sm:col-span-4 ${inputClass} disabled:opacity-50`}
                  />
                  <select
                    disabled={!row.include}
                    value={row.unit}
                    onChange={(e) =>
                      setResults((prev) => ({
                        ...prev,
                        [m.id]: { ...prev[m.id], unit: e.target.value },
                      }))
                    }
                    className={`col-span-5 sm:col-span-3 ${inputClass} disabled:opacity-50`}
                  >
                    {m.allowedUnits.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={() => setStep("context")}>
            ← Back
          </Button>
          <Button
            onClick={() => {
              if (!canContinue) {
                setError("Enter at least one marker value before continuing.");
                return;
              }
              setError(null);
              setStep("submit");
            }}
            size="lg"
            className="flex-1"
          >
            Continue →
          </Button>
        </div>
        {error ? <p className="text-sm text-coral">{error}</p> : null}
      </div>
    );
  }

  // ── STEP: SUBMIT ──────────────────────────────────────────
  const tosNeeded = !tosAlreadyAccepted;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const payloadResults = MARKERS.flatMap((m) => {
        const row = results[m.id];
        if (!row.include) return [];
        const v = row.value.trim();
        if (v === "") return [];
        const n = Number(v);
        if (!Number.isFinite(n)) return [];
        return [{ markerId: m.id, value: n, unit: row.unit }];
      });

      const body = {
        context: {
          age: Number(context.age),
          sex: context.sex,
          trainingHoursPerWeek: Number(context.trainingHoursPerWeek),
          trainingPhase: context.trainingPhase,
          symptoms: context.symptoms,
          drawDate: context.drawDate,
        },
        results: payloadResults,
        acceptedTos: tosChecked,
      };

      const res = await fetch("/api/blood-engine/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.reportId) {
        throw new Error(data.error || "Interpretation failed");
      }
      router.push(`/blood-engine/report/${data.reportId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <StepHeader current={3} />
      <div className="rounded-lg border border-white/10 bg-background-elevated p-6">
        <h3 className="font-heading uppercase text-off-white text-xl mb-3">Ready to run</h3>
        <p className="text-foreground-muted">
          We&apos;ll send your context and values to the interpretation engine. Takes 20–40 seconds. You
          can&apos;t edit a report after it&apos;s generated — you can always run another one.
        </p>
      </div>

      {tosNeeded ? (
        <label className="flex items-start gap-3 rounded-lg border border-coral/30 bg-coral-muted p-5 text-sm text-off-white cursor-pointer">
          <input
            type="checkbox"
            checked={tosChecked}
            onChange={(e) => setTosChecked(e.target.checked)}
            className="accent-coral w-4 h-4 mt-1"
          />
          <span>
            <span className="block font-heading uppercase tracking-wider text-coral mb-2">
              Please confirm
            </span>
            {BLOOD_ENGINE_DISCLAIMER} I understand Blood Engine is educational and not a substitute
            for medical advice.
          </span>
        </label>
      ) : null}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => setStep("results")}>
          ← Back
        </Button>
        <Button
          onClick={submit}
          disabled={submitting || (tosNeeded && !tosChecked)}
          size="lg"
          className="flex-1"
        >
          {submitting ? "Interpreting…" : "Decode my bloodwork"}
        </Button>
      </div>
      {error ? <p className="text-sm text-coral">{error}</p> : null}
    </div>
  );
}

// ── small helpers / presentational pieces ──────────────────

function StepHeader({ current }: { current: 1 | 2 | 3 }) {
  const steps: Array<{ n: 1 | 2 | 3; label: string }> = [
    { n: 1, label: "Context" },
    { n: 2, label: "Results" },
    { n: 3, label: "Submit" },
  ];
  return (
    <ol className="flex items-center gap-3 text-sm mb-4">
      {steps.map((s) => (
        <li
          key={s.n}
          className={`flex items-center gap-2 ${s.n === current ? "text-coral" : "text-foreground-subtle"}`}
        >
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${s.n === current ? "border-coral bg-coral text-off-white" : "border-foreground-subtle"}`}
          >
            {s.n}
          </span>
          <span className="font-heading uppercase tracking-wider">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-heading tracking-wider uppercase text-sm text-off-white block mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-md bg-background-elevated border border-white/10 text-off-white focus:border-coral focus:outline-none";

function chipClass(active: boolean) {
  return [
    "px-4 py-2 rounded-full border text-sm font-heading uppercase tracking-wider cursor-pointer transition-colors",
    active
      ? "bg-coral text-off-white border-coral"
      : "bg-transparent text-foreground-muted border-white/15 hover:border-white/30",
  ].join(" ");
}
