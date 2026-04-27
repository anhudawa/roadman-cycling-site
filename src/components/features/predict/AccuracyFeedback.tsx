"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

interface AccuracyFeedbackProps {
  slug: string;
  predictedTimeS: number;
  defaultEmail?: string | null;
}

interface SubmitResult {
  absoluteErrorS: number;
  signedErrorS: number;
  modelErrorPct: number;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h <= 0) return `${m} min`;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function errorSentence(result: SubmitResult): string {
  const delta = formatDuration(Math.abs(result.signedErrorS));
  if (result.signedErrorS > 0) {
    return `Prediction was ${delta} slower than your actual ride. That points to conservative inputs or better conditions.`;
  }
  if (result.signedErrorS < 0) {
    return `Prediction was ${delta} quicker than your actual ride. That is useful calibration data.`;
  }
  return "Prediction matched your actual ride. That is the benchmark.";
}

export function AccuracyFeedback({
  slug,
  predictedTimeS,
  defaultEmail,
}: AccuracyFeedbackProps) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [averagePower, setAveragePower] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [rideFileUrl, setRideFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  async function handleSubmit() {
    setError(null);
    setResult(null);

    const h = Number(hours);
    const m = Number(minutes);
    if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || m < 0 || m > 59) {
      setError("Enter your finish time as hours and minutes.");
      return;
    }

    const actualTimeS = Math.round(h * 3600 + m * 60);
    if (actualTimeS < 10 * 60) {
      setError("Finish time looks too short.");
      return;
    }

    const power = averagePower.trim() ? Number(averagePower) : undefined;
    if (power != null && (!Number.isFinite(power) || power < 50 || power > 700)) {
      setError("Average power should be between 50 W and 700 W.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/predict/${slug}/actual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actualTimeS,
          averagePower: power,
          email: email.trim() || undefined,
          rideFileUrl: rideFileUrl.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not save that result.");
        return;
      }
      setResult({
        absoluteErrorS: data.absoluteErrorS,
        signedErrorS: data.signedErrorS,
        modelErrorPct: data.modelErrorPct,
      });
    } catch {
      setError("Network issue - try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.04] via-deep-purple/20 to-charcoal p-5 md:p-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div>
          <p
            className="mb-2 text-[0.62rem] uppercase tracking-[0.22em] text-coral"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            ACCURACY LOOP
          </p>
          <h2 className="font-heading text-3xl uppercase tracking-tight text-off-white">
            Feed the model after race day
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-off-white/75">
            Accuracy has to be earned course by course. After you ride, add
            your actual finish time here so we can compare the prediction with
            real rider results and tighten the model for the next rider.
          </p>
          <div
            className="mt-4 grid grid-cols-3 gap-2 text-[0.62rem] uppercase tracking-[0.14em]"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            <MiniStat label="Predicted" value={formatDuration(predictedTimeS)} />
            <MiniStat label="Goal" value="<2% error" />
            <MiniStat label="Use" value="Model QA" />
          </div>
        </div>

        <div className="rounded-xl border border-white/8 bg-charcoal/60 p-4">
          {result ? (
            <div className="space-y-3">
              <p
                className="text-[0.62rem] uppercase tracking-[0.22em] text-coral"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                SAVED
              </p>
              <p className="font-heading text-2xl uppercase tracking-tight text-off-white">
                {errorSentence(result)}
              </p>
              <p className="text-sm text-off-white/70">
                Absolute error: {formatDuration(result.absoluteErrorS)} (
                {Math.abs(result.modelErrorPct).toFixed(2)}%). That is exactly
                the data we need to tighten the engine.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResult(null)}
              >
                Add another result
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <NumberInput
                  label="Hours"
                  value={hours}
                  onChange={setHours}
                  placeholder="8"
                  min={0}
                  max={48}
                />
                <NumberInput
                  label="Minutes"
                  value={minutes}
                  onChange={setMinutes}
                  placeholder="42"
                  min={0}
                  max={59}
                />
              </div>
              <NumberInput
                label="Average power"
                value={averagePower}
                onChange={setAveragePower}
                placeholder="Optional, e.g. 214"
                min={50}
                max={700}
              />
              <TextInput
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="Optional, for follow-up"
              />
              <TextInput
                label="Ride file link"
                value={rideFileUrl}
                onChange={setRideFileUrl}
                placeholder="Optional Strava, Garmin, or file URL"
              />
              {error && (
                <p
                  role="alert"
                  className="text-xs text-coral"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  {error}
                </p>
              )}
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
                dataTrack="predict_actual_result_submit"
              >
                {submitting ? "Saving result..." : "Submit actual result"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
      <p className="text-foreground-subtle">{label}</p>
      <p className="mt-1 text-off-white">{value}</p>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  min: number;
  max: number;
}) {
  return (
    <label className="block">
      <span
        className="mb-1 block text-[0.6rem] uppercase tracking-[0.18em] text-foreground-subtle"
        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
      >
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
      />
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span
        className="mb-1 block text-[0.6rem] uppercase tracking-[0.18em] text-foreground-subtle"
        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
      >
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
      />
    </label>
  );
}
