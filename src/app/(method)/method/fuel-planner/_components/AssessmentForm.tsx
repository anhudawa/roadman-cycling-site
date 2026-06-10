"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  defaultProfile,
  defaultState,
  loadState,
  saveState,
} from "@/lib/fuel-planner/storage";
import type {
  ActivityLevel,
  BodyCompGoal,
  Sex,
  UserProfile,
} from "@/lib/fuel-planner/types";

interface AssessmentFormProps {
  redirectAfter?: string;
  /** Pre-fill seeded from the server-side rider profile when present.
   *  Browser localStorage still wins if the rider has used the planner
   *  before — the server values are only a first-paint default. */
  initialProfile?: Partial<UserProfile> | null;
}

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; hint: string }[] = [
  { value: "sedentary", label: "Sedentary", hint: "Desk job, low movement" },
  { value: "light", label: "Light", hint: "Some walking / light activity" },
  { value: "moderate", label: "Moderate", hint: "Active job or moves a lot off the bike" },
  { value: "active", label: "Active", hint: "Manual job, on feet most of the day" },
];

const GOAL_OPTIONS: { value: BodyCompGoal; label: string; hint: string }[] = [
  { value: "lose", label: "Lose mass", hint: "Daily deficit applied" },
  { value: "maintain", label: "Maintain", hint: "Match expenditure" },
  { value: "gain", label: "Build", hint: "Daily surplus applied" },
];

export function AssessmentForm({
  redirectAfter = "/method/fuel-planner/week",
  initialProfile,
}: AssessmentFormProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(() => ({
    ...defaultProfile(),
    ...(initialProfile ?? {}),
  }));
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Hydrate from storage if present. localStorage trumps the seeded
  // server values because the rider may have tuned them locally.
  useEffect(() => {
    const existing = loadState();
    if (existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage on mount
      setProfile(existing.profile);
      setSavedAt(existing.updatedAt);
    }
    setHydrated(true);
  }, []);

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  async function persistToRiderProfile(p: UserProfile): Promise<void> {
    // Best-effort: failures don't block the local save / redirect.
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentFtp: p.ftp,
          currentWeight: p.weightKg,
          weightUnit: "kg",
          heightCm: p.heightCm,
          bodyCompositionGoal: p.bodyCompGoal,
        }),
      });
    } catch (err) {
      console.error("[fuel-planner/assessment] rider-profile sync failed:", err);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const existing = loadState() ?? defaultState();
    saveState({
      profile,
      pattern: existing.pattern,
      meals: existing.meals,
      startDate: existing.startDate,
    });
    // Fire the rider-profile sync alongside — non-blocking.
    void persistToRiderProfile(profile);
    // Brief tick so the user sees the saving state before navigating.
    setTimeout(() => router.push(redirectAfter), 200);
  }

  if (!hydrated) {
    return (
      <div className="rounded-xl border border-white/10 bg-charcoal/60 p-6">
        <p className="text-foreground-muted">Loading…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <FieldGroup
        title="The basics"
        hint="Used for resting metabolic rate (Mifflin-St Jeor)."
      >
        <Row>
          <SelectField
            label="Sex"
            value={profile.sex}
            onChange={(v) => update("sex", v as Sex)}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />
          <NumberField
            label="Age"
            unit="yrs"
            min={16}
            max={90}
            value={profile.age}
            onChange={(v) => update("age", v)}
          />
        </Row>
        <Row>
          <NumberField
            label="Height"
            unit="cm"
            min={140}
            max={220}
            value={profile.heightCm}
            onChange={(v) => update("heightCm", v)}
          />
          <NumberField
            label="Weight"
            unit="kg"
            min={40}
            max={150}
            step={0.1}
            value={profile.weightKg}
            onChange={(v) => update("weightKg", v)}
          />
        </Row>
      </FieldGroup>

      <FieldGroup
        title="Training"
        hint="FTP drives kJ → kcal conversion at GME 21.7%. Activity level scales NEAT."
      >
        <Row>
          <NumberField
            label="FTP"
            unit="W"
            min={50}
            max={500}
            value={profile.ftp}
            onChange={(v) => update("ftp", v)}
          />
          <SelectField
            label="Off-bike activity"
            value={profile.activityLevel}
            onChange={(v) => update("activityLevel", v as ActivityLevel)}
            options={ACTIVITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            hint={ACTIVITY_OPTIONS.find((o) => o.value === profile.activityLevel)?.hint}
          />
        </Row>
      </FieldGroup>

      <FieldGroup
        title="Body composition goal"
        hint="Drives the daily deficit/surplus on top of TDEE."
      >
        <div className="grid sm:grid-cols-3 gap-2">
          {GOAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("bodyCompGoal", opt.value)}
              className={[
                "text-left rounded-lg border p-4 transition-colors",
                profile.bodyCompGoal === opt.value
                  ? "border-coral bg-coral/10"
                  : "border-white/10 bg-charcoal/40 hover:border-white/30",
              ].join(" ")}
            >
              <p className="font-heading uppercase text-sm tracking-wider mb-1">
                {opt.label}
              </p>
              <p className="text-xs text-foreground-muted">{opt.hint}</p>
            </button>
          ))}
        </div>
        {profile.bodyCompGoal === "lose" && (
          <div className="mt-4">
            <NumberField
              label="Deficit"
              unit="%"
              min={5}
              max={25}
              value={profile.deficitPct}
              onChange={(v) => update("deficitPct", v)}
              hint="10–15% is sustainable mid-build. >20% kills training quality."
            />
          </div>
        )}
        {profile.bodyCompGoal === "gain" && (
          <div className="mt-4">
            <NumberField
              label="Surplus"
              unit="%"
              min={5}
              max={20}
              value={profile.surplusPct}
              onChange={(v) => update("surplusPct", v)}
              hint="5–10% drives muscle without much fat carry."
            />
          </div>
        )}
      </FieldGroup>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-xs text-foreground-muted">
          {savedAt
            ? `Last saved ${new Date(savedAt).toLocaleString()}`
            : "Saved locally and to your Roadman rider profile."}
        </p>
        <button
          type="submit"
          disabled={saving}
          className="font-heading uppercase tracking-wider text-sm bg-coral text-charcoal hover:bg-coral-hover disabled:opacity-50 px-5 py-3 rounded-sm transition-colors"
        >
          {saving ? "Saving…" : "Save & continue →"}
        </button>
      </div>
    </form>
  );
}

/* ─── Field primitives ──────────────────────────────────────── */

function FieldGroup({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-heading uppercase text-sm tracking-[0.2em] text-coral mb-1">
        {title}
      </legend>
      {hint && <p className="text-xs text-foreground-muted -mt-2">{hint}</p>}
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-3">{children}</div>;
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step = 1,
  hint,
}: {
  label: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block font-heading uppercase tracking-wider text-xs text-foreground-muted mb-1">
        {label}
        {unit && <span className="text-coral/80 ml-2">{unit}</span>}
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = e.target.valueAsNumber;
          if (!Number.isNaN(v)) onChange(v);
        }}
        className="w-full rounded-md border border-white/10 bg-charcoal/60 px-3 py-2.5 text-off-white focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
      />
      {hint && <span className="block text-xs text-foreground-muted mt-1">{hint}</span>}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block font-heading uppercase tracking-wider text-xs text-foreground-muted mb-1">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-charcoal/60 px-3 py-2.5 text-off-white focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <span className="block text-xs text-foreground-muted mt-1">{hint}</span>}
    </label>
  );
}
