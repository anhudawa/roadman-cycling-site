"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { buildAnalysis } from "@/lib/ridezones/engine";
import { isoDate } from "@/lib/ridezones/load";
import { SYSTEM_LABELS } from "@/lib/ridezones/profile";
import {
  clearStoredState,
  loadStoredState,
  saveStoredState,
} from "@/lib/ridezones/storage";
import type { Activity, RiderSettings } from "@/lib/ridezones/types";
import { ActivityList } from "./ActivityList";
import { FormChart } from "./FormChart";
import { OnboardingWizard } from "./OnboardingWizard";
import { RecipeCompare } from "./RecipeCompare";
import { SystemBars } from "./SystemBars";
import { WeekPlanView } from "./WeekPlanView";
import { ZonesCard } from "./ZonesCard";

type Tab = "overview" | "profile" | "rides" | "recipe" | "plan";

const TABS: Array<{ key: Tab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "profile", label: "Fitness profile" },
  { key: "rides", label: "Rides" },
  { key: "recipe", label: "Race recipe" },
  { key: "plan", label: "This week" },
];

interface AppState {
  settings: RiderSettings;
  activities: Activity[];
}

export function RideZonesApp() {
  // null = still hydrating from localStorage; undefined = no saved state.
  const [state, setState] = useState<AppState | null | undefined>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot localStorage hydration after mount (SSR renders the loading state)
    setToday(isoDate(new Date()));
    const stored = loadStoredState();
    setState(stored ? { settings: stored.settings, activities: stored.activities } : undefined);
  }, []);

  const analysis = useMemo(() => {
    if (!state || !today) return null;
    return buildAnalysis(state.activities, state.settings, today);
  }, [state, today]);

  const handleComplete = (settings: RiderSettings, activities: Activity[]) => {
    saveStoredState(settings, activities);
    setState({ settings, activities });
    setTab("overview");
  };

  const handleReset = () => {
    clearStoredState();
    setState(undefined);
  };

  if (state === null) {
    return (
      <div className="py-24 text-center text-sm text-foreground-muted" aria-busy="true">
        Loading…
      </div>
    );
  }

  if (state === undefined || !analysis) {
    return <OnboardingWizard onComplete={handleComplete} />;
  }

  const lastPoint = analysis.load[analysis.load.length - 1];
  const { profile, recipe, plan } = analysis;

  return (
    <div>
      {/* Focus banner — the missing ingredient, named */}
      <div className="mb-8 rounded-lg border border-coral/30 bg-coral/[0.07] px-5 py-4">
        <p
          className="text-xs font-semibold uppercase tracking-widest text-coral"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Your focus
        </p>
        <h2 className="mt-1 font-heading text-2xl uppercase tracking-wide text-off-white md:text-3xl">
          {profile.focus.headline}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground-muted">
          {profile.focus.coachNote}
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-8 flex flex-wrap gap-1 border-b border-white/10" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 font-heading text-lg uppercase tracking-wider transition-colors ${
              tab === t.key
                ? "border-b-2 border-coral text-off-white"
                : "text-foreground-muted hover:text-off-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Fitness (CTL)"
              value={lastPoint ? Math.round(lastPoint.ctl).toString() : "—"}
              detail="42-day training load"
            />
            <StatTile
              label="Fatigue (ATL)"
              value={lastPoint ? Math.round(lastPoint.atl).toString() : "—"}
              detail="7-day training load"
            />
            <StatTile
              label="Form (TSB)"
              value={lastPoint ? formatSigned(lastPoint.tsb) : "—"}
              detail={
                lastPoint
                  ? lastPoint.tsb < -20
                    ? "Deep fatigue — absorb before you add"
                    : lastPoint.tsb > 10
                      ? "Fresh — a good day to go hard"
                      : "Productive training range"
                  : ""
              }
            />
            <StatTile
              label="Rides analysed"
              value={analysis.activities.length.toString()}
              detail={`Focus: ${SYSTEM_LABELS[profile.focus.system]}`}
            />
          </div>

          <div>
            <h3 className="mb-3 font-heading text-2xl uppercase tracking-wide text-off-white">
              Fitness, fatigue &amp; form
            </h3>
            <FormChart load={analysis.load} />
          </div>

          <div>
            <h3 className="mb-3 font-heading text-2xl uppercase tracking-wide text-off-white">
              Your zones
            </h3>
            <p className="mb-4 text-sm text-foreground-muted">
              Built from FTP {analysis.settings.ftp}W
              {analysis.settings.lthr ? ` and LTHR ${analysis.settings.lthr} bpm` : ""}. Every
              session target in your plan is computed from these.
            </p>
            <ZonesCard ftp={analysis.settings.ftp} lthr={analysis.settings.lthr} />
          </div>
        </div>
      ) : null}

      {tab === "profile" ? (
        <div className="max-w-3xl">
          <p className="mb-6 text-sm leading-relaxed text-foreground-muted">
            Eight systems, read from your last 12 weeks of riding. The profile updates every time
            you import — it follows what you did, not what you meant to do.
          </p>
          <SystemBars profile={profile} />
        </div>
      ) : null}

      {tab === "rides" ? (
        <div>
          <p className="mb-4 text-sm text-foreground-muted">
            Every ride classified by what it actually was, and scored on how well it did that job.
            Tap a ride for the coach&apos;s note.
          </p>
          <ActivityList activities={analysis.activities} />
        </div>
      ) : null}

      {tab === "recipe" ? <RecipeCompare recipe={recipe} /> : null}

      {tab === "plan" ? <WeekPlanView plan={plan} /> : null}

      <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
        <p className="flex-1 text-xs text-foreground-subtle">
          Your data lives in this browser only. Analysis last run {analysis.asOf}.
        </p>
        <Button onClick={handleReset} variant="ghost" size="sm" dataTrack="ridezones_reset">
          Start over
        </Button>
      </div>
    </div>
  );
}

function StatTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
        {label}
      </p>
      <p className="mt-1 font-heading text-4xl text-off-white">{value}</p>
      <p className="mt-1 text-xs text-foreground-muted">{detail}</p>
    </div>
  );
}

function formatSigned(value: number): string {
  const rounded = Math.round(value);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}
