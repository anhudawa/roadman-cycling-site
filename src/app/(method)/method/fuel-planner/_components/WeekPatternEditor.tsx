"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DAY_LABELS_LONG,
  SESSION_TEMPLATES,
  type DayIndex,
  type WeekPattern,
  type WeekPatternEntry,
} from "@/lib/fuel-planner";
import {
  defaultState,
  loadState,
  saveState,
} from "@/lib/fuel-planner/storage";
import { getSessionTemplate } from "@/lib/fuel-planner/sessions";

const FUEL_CATEGORY_LABEL: Record<string, string> = {
  REST: "Rest",
  LOW: "Low",
  LOW_MODERATE: "Low-Mod",
  MODERATE: "Moderate",
  MODERATE_HIGH: "Mod-High",
  HIGH: "High",
  VERY_HIGH: "V.High",
};

const FUEL_CATEGORY_COLOUR: Record<string, string> = {
  REST: "text-foreground-muted",
  LOW: "text-sky-300",
  LOW_MODERATE: "text-emerald-300",
  MODERATE: "text-yellow-300",
  MODERATE_HIGH: "text-orange-300",
  HIGH: "text-coral",
  VERY_HIGH: "text-fuchsia-300",
};

export function WeekPatternEditor() {
  const router = useRouter();
  const [pattern, setPattern] = useState<WeekPattern | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const existing = loadState() ?? defaultState();
    setPattern(existing.pattern);
    setStartDate(existing.startDate);
    setHydrated(true);
  }, []);

  function setDay(day: DayIndex, entry: WeekPatternEntry) {
    if (!pattern) return;
    const next = [...pattern] as unknown as WeekPattern;
    (next as unknown as WeekPatternEntry[])[day] = entry;
    setPattern(next);
  }

  function onSave() {
    if (!pattern) return;
    setSaving(true);
    const existing = loadState() ?? defaultState();
    saveState({
      profile: existing.profile,
      pattern,
      meals: existing.meals,
      startDate,
    });
    setTimeout(() => router.push("/method/fuel-planner"), 200);
  }

  if (!hydrated || !pattern) {
    return <p className="text-foreground-muted">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-charcoal/60 p-5">
        <label className="block">
          <span className="block font-heading uppercase tracking-wider text-xs text-foreground-muted mb-1">
            Plan start date <span className="text-coral/80 ml-2">Monday</span>
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border border-white/10 bg-charcoal/60 px-3 py-2.5 text-off-white focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
          />
          <span className="block text-xs text-foreground-muted mt-1">
            Week 1 starts on the Monday on or before this date.
          </span>
        </label>
      </div>

      <ol className="space-y-3">
        {DAY_LABELS_LONG.map((label, i) => (
          <li key={label}>
            <DayRow
              day={i as DayIndex}
              label={label}
              entry={pattern[i as DayIndex]}
              onChange={(entry) => setDay(i as DayIndex, entry)}
            />
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-xs text-foreground-muted">
          Pick one session per training day. Rest = full off-bike day.
        </p>
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="font-heading uppercase tracking-wider text-sm bg-coral text-charcoal hover:bg-coral-hover disabled:opacity-50 px-5 py-3 rounded-sm transition-colors"
        >
          {saving ? "Saving…" : "Save pattern →"}
        </button>
      </div>
    </div>
  );
}

function DayRow({
  day,
  label,
  entry,
  onChange,
}: {
  day: DayIndex;
  label: string;
  entry: WeekPatternEntry;
  onChange: (entry: WeekPatternEntry) => void;
}) {
  const tpl = entry.templateId ? getSessionTemplate(entry.templateId) : null;
  const isRest = !tpl;

  return (
    <div className="rounded-lg border border-white/10 bg-charcoal/40 p-4">
      <div className="grid md:grid-cols-[120px_1fr] gap-3 items-start">
        <p className="font-heading uppercase tracking-wider text-sm text-off-white pt-2">
          {label}
        </p>
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2 items-start">
          <select
            aria-label={`${label} session`}
            value={entry.templateId ?? ""}
            onChange={(e) =>
              onChange({
                ...entry,
                templateId: e.target.value === "" ? null : e.target.value,
              })
            }
            className="rounded-md border border-white/10 bg-charcoal/60 px-3 py-2.5 text-off-white focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
          >
            <option value="">Rest day</option>
            {SESSION_TEMPLATES.filter((t) => t.id !== "recovery_day").map(
              (t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {FUEL_CATEGORY_LABEL[t.fuelCategory]}
                </option>
              ),
            )}
          </select>

          <input
            type="time"
            aria-label={`${label} start time`}
            disabled={isRest}
            value={entry.startTime ?? (day >= 5 ? "09:00" : "17:30")}
            onChange={(e) =>
              onChange({ ...entry, startTime: e.target.value })
            }
            className="rounded-md border border-white/10 bg-charcoal/60 px-3 py-2.5 text-off-white disabled:opacity-40 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
          />

          <label
            className={[
              "flex items-center gap-2 rounded-md border px-3 py-2.5 text-xs font-heading uppercase tracking-wider",
              isRest
                ? "border-white/5 text-foreground-muted/40"
                : entry.isCompetition
                  ? "border-coral bg-coral/10 text-coral"
                  : "border-white/10 text-foreground-muted",
            ].join(" ")}
          >
            <input
              type="checkbox"
              disabled={isRest}
              checked={entry.isCompetition ?? false}
              onChange={(e) =>
                onChange({ ...entry, isCompetition: e.target.checked })
              }
              className="accent-coral"
            />
            Race
          </label>
        </div>
      </div>

      {tpl && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-foreground-muted">
          <Stat label="Duration" value={`${tpl.baseDurationMin} min`} />
          <Stat label="IF" value={tpl.typicalIF.toFixed(2)} />
          <Stat
            label="Fuel"
            value={FUEL_CATEGORY_LABEL[tpl.fuelCategory]}
            valueClass={FUEL_CATEGORY_COLOUR[tpl.fuelCategory]}
          />
          <Stat
            label="In-ride"
            value={
              tpl.suggestedInRideCarbsGPerHr
                ? `${tpl.suggestedInRideCarbsGPerHr} g/hr`
                : "—"
            }
          />
          <p className="col-span-full mt-1">{tpl.description}</p>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <p>
      <span className="text-foreground-muted/60 mr-1.5">{label}</span>
      <span className={valueClass ?? "text-off-white"}>{value}</span>
    </p>
  );
}
