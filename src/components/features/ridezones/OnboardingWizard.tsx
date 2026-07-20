"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { DEMO_SETTINGS, generateDemoHistory } from "@/lib/ridezones/demo";
import { isoDate } from "@/lib/ridezones/load";
import type { Activity, GoalKey, RiderSettings } from "@/lib/ridezones/types";
import { ImportPanel } from "./ImportPanel";

const GOALS: Array<{ value: GoalKey; label: string; detail: string }> = [
  { value: "gran-fondo", label: "Gran fondo / sportive", detail: "Perform on the big day, not just survive it" },
  { value: "road-race", label: "Road racing", detail: "Crits, road races, the chaingang that matters" },
  { value: "ftp-breakthrough", label: "FTP breakthrough", detail: "The number has been stuck. Unstick it." },
  { value: "base-season", label: "Base season", detail: "Build the engine properly this winter" },
];

interface OnboardingWizardProps {
  onComplete: (settings: RiderSettings, activities: Activity[]) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [ftp, setFtp] = useState("");
  const [lthr, setLthr] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("8");
  const [goal, setGoal] = useState<GoalKey>("gran-fondo");
  const [error, setError] = useState<string | null>(null);

  const settings = (): RiderSettings | null => {
    const ftpNum = Number(ftp);
    const hoursNum = Number(weeklyHours);
    if (!Number.isFinite(ftpNum) || ftpNum < 80 || ftpNum > 550) {
      setError("FTP needs to be a realistic number of watts (80–550). If you don't know it, take your best 20-minute power and multiply by 0.95.");
      return null;
    }
    if (!Number.isFinite(hoursNum) || hoursNum < 2 || hoursNum > 30) {
      setError("Weekly hours should be between 2 and 30.");
      return null;
    }
    const lthrNum = Number(lthr);
    return {
      ftp: Math.round(ftpNum),
      lthr: lthr && Number.isFinite(lthrNum) && lthrNum > 100 ? Math.round(lthrNum) : undefined,
      weeklyHours: hoursNum,
      goal,
    };
  };

  const handleNext = () => {
    setError(null);
    if (settings()) setStep(2);
  };

  const handleDemo = () => {
    const s = settings();
    if (!s) return;
    onComplete(
      { ...DEMO_SETTINGS, goal: s.goal },
      generateDemoHistory(isoDate(new Date()))
    );
  };

  const handleImport = (activities: Activity[]) => {
    const s = settings();
    if (!s) return;
    onComplete(s, activities);
  };

  const handleManualStart = () => {
    const s = settings();
    if (!s) return;
    onComplete(s, []);
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
        <span className={step === 1 ? "text-coral" : ""}>1 · Your numbers</span>
        <span aria-hidden>—</span>
        <span className={step === 2 ? "text-coral" : ""}>2 · Your history</span>
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <div>
            <label htmlFor="rz-ftp" className="mb-1.5 block text-sm font-semibold text-off-white">
              FTP (watts)
            </label>
            <input
              id="rz-ftp"
              type="number"
              inputMode="numeric"
              value={ftp}
              onChange={(e) => setFtp(e.target.value)}
              placeholder="e.g. 250"
              className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-3 text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-foreground-subtle">
              Don&apos;t know it? Best 20-minute power × 0.95 gets you close enough to start.
            </p>
          </div>
          <div>
            <label htmlFor="rz-lthr" className="mb-1.5 block text-sm font-semibold text-off-white">
              Threshold heart rate (optional)
            </label>
            <input
              id="rz-lthr"
              type="number"
              inputMode="numeric"
              value={lthr}
              onChange={(e) => setLthr(e.target.value)}
              placeholder="e.g. 168 bpm"
              className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-3 text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-foreground-subtle">
              Lets RideZones read rides that have heart rate but no power.
            </p>
          </div>
          <div>
            <label htmlFor="rz-hours" className="mb-1.5 block text-sm font-semibold text-off-white">
              Hours you can train per week
            </label>
            <input
              id="rz-hours"
              type="number"
              inputMode="numeric"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-3 text-off-white focus:border-coral focus:outline-none"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-off-white">What are you training for?</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGoal(g.value)}
                  className={`rounded-md border px-4 py-3 text-left transition-colors ${
                    goal === g.value
                      ? "border-coral bg-coral/10"
                      : "border-white/15 bg-white/5 hover:border-white/30"
                  }`}
                  aria-pressed={goal === g.value}
                >
                  <span className="block font-heading text-lg uppercase tracking-wide text-off-white">
                    {g.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-foreground-muted">{g.detail}</span>
                </button>
              ))}
            </div>
          </div>
          {error ? <p className="text-sm text-coral">{error}</p> : null}
          <Button onClick={handleNext} size="lg" className="w-full" dataTrack="ridezones_onboarding_next">
            Next: your riding history
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground-muted">
            RideZones reads your history to build the profile. Everything runs in your
            browser — your data never leaves this device.
          </p>

          <ImportPanel onImport={handleImport} />

          <button
            type="button"
            onClick={handleDemo}
            data-track="ridezones_demo_start"
            className="w-full rounded-lg border border-white/15 bg-white/[0.03] px-5 py-6 text-left transition-colors hover:border-white/30"
          >
            <span className="block font-heading text-xl uppercase tracking-wide text-off-white">
              Explore with demo data
            </span>
            <span className="mt-1 block text-sm text-foreground-muted">
              A realistic 18-week history — a strong spring block, a gran fondo, then the classic
              summer drift. See what the analysis catches.
            </span>
          </button>

          {error ? <p className="text-sm text-coral">{error}</p> : null}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-foreground-muted hover:text-off-white"
            >
              ← Back to your numbers
            </button>
            <button
              type="button"
              onClick={handleManualStart}
              className="text-sm text-foreground-muted underline-offset-2 hover:text-off-white hover:underline"
            >
              Skip — I&apos;ll add rides manually
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
