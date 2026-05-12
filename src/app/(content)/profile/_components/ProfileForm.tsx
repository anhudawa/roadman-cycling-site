"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { RiderProfile } from "@/lib/rider-profile/types";
import { KNOWN_RIDER_TOOLS } from "@/lib/rider-profile/types";

interface Props {
  initialProfile: RiderProfile;
}

type Status = "idle" | "saving" | "saved" | "error";

const DISCIPLINES = ["road", "gravel", "sportive", "track", "general", "tt", "xc-mtb"] as const;
const AGE_RANGES = ["under-35", "35-44", "45-54", "55-64", "65-plus"] as const;
const LIMITERS = [
  { value: "fuelling", label: "Fuelling deficit" },
  { value: "strength", label: "Strength gap" },
  { value: "intensity-distribution", label: "Polarisation / intensity distribution" },
  { value: "recovery", label: "Under-recovered" },
] as const;
const BODY_GOALS = [
  { value: "lose", label: "Lose mass" },
  { value: "maintain", label: "Maintain" },
  { value: "gain", label: "Build" },
] as const;
const SUPPORT_LEVELS = [
  { value: "self_guided", label: "Self-guided — give me the tools" },
  { value: "community", label: "Community — accountability + structure" },
  { value: "coached", label: "Coached — bespoke 1:1" },
] as const;
const TOOL_OPTIONS: { value: (typeof KNOWN_RIDER_TOOLS)[number]; label: string }[] = [
  { value: "strava", label: "Strava" },
  { value: "garmin", label: "Garmin" },
  { value: "wahoo", label: "Wahoo" },
  { value: "zwift", label: "Zwift" },
  { value: "trainingpeaks", label: "TrainingPeaks" },
  { value: "trainerroad", label: "TrainerRoad" },
  { value: "other", label: "Other" },
];

export function ProfileForm({ initialProfile }: Props) {
  const [profile, setProfile] = useState({
    firstName: initialProfile.firstName ?? "",
    ageRange: initialProfile.ageRange ?? "",
    discipline: initialProfile.discipline ?? "",
    weeklyTrainingHours: initialProfile.weeklyTrainingHours ?? "",
    currentFtp: initialProfile.currentFtp ?? "",
    currentWeight: initialProfile.currentWeight ?? "",
    weightUnit: initialProfile.weightUnit ?? "kg",
    heightCm: initialProfile.heightCm ?? "",
    targetEvent: initialProfile.targetEvent ?? "",
    targetEventDate: initialProfile.targetEventDate
      ? initialProfile.targetEventDate.toISOString().slice(0, 10)
      : "",
    mainGoal: initialProfile.mainGoal ?? "",
    biggestLimiter: initialProfile.biggestLimiter ?? "",
    bodyCompositionGoal: initialProfile.bodyCompositionGoal ?? "",
    preferredSupportLevel: initialProfile.preferredSupportLevel ?? "",
    injuryHistory: initialProfile.injuryHistory ?? "",
    currentTools: new Set<string>(initialProfile.currentTools ?? []),
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wkg = useMemo(() => {
    const ftp = Number(profile.currentFtp);
    const w = Number(profile.currentWeight);
    if (!ftp || !w) return null;
    const kg = profile.weightUnit === "lb" ? w * 0.45359237 : w;
    if (kg <= 0) return null;
    return (ftp / kg).toFixed(2);
  }, [profile.currentFtp, profile.currentWeight, profile.weightUnit]);

  function toggleTool(slug: string) {
    setProfile((p) => {
      const next = new Set(p.currentTools);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return { ...p, currentTools: next };
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg(null);

    const numOrNull = (v: string | number) => {
      if (v === "" || v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const strOrNull = (v: string) => (v.trim() === "" ? null : v.trim());

    const payload: Record<string, unknown> = {
      firstName: strOrNull(profile.firstName),
      ageRange: strOrNull(profile.ageRange),
      discipline: strOrNull(profile.discipline),
      weeklyTrainingHours: numOrNull(profile.weeklyTrainingHours),
      currentFtp: numOrNull(profile.currentFtp),
      currentWeight: numOrNull(profile.currentWeight),
      weightUnit: profile.weightUnit,
      heightCm: numOrNull(profile.heightCm),
      targetEvent: strOrNull(profile.targetEvent),
      targetEventDate: strOrNull(profile.targetEventDate),
      mainGoal: strOrNull(profile.mainGoal),
      biggestLimiter: strOrNull(profile.biggestLimiter),
      bodyCompositionGoal: strOrNull(profile.bodyCompositionGoal),
      preferredSupportLevel: strOrNull(profile.preferredSupportLevel),
      injuryHistory: strOrNull(profile.injuryHistory),
      currentTools: Array.from(profile.currentTools),
    };

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? `Save failed (${res.status})`);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <FieldGroup title="You">
        <Field label="First name">
          <input
            type="text"
            value={profile.firstName}
            maxLength={80}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Age range">
          <select
            value={profile.ageRange}
            onChange={(e) => setProfile({ ...profile, ageRange: e.target.value })}
            className={inputCls}
          >
            <option value="">—</option>
            {AGE_RANGES.map((a) => (
              <option key={a} value={a}>
                {a.replace("-", "–").replace("plus", "+")}
              </option>
            ))}
          </select>
        </Field>
      </FieldGroup>

      <FieldGroup title="Body composition">
        <Field label="Weight">
          <div className="flex gap-2">
            <input
              type="number"
              min={30}
              max={200}
              step="0.1"
              value={profile.currentWeight}
              onChange={(e) =>
                setProfile({ ...profile, currentWeight: e.target.value })
              }
              className={inputCls}
              placeholder="75"
            />
            <select
              value={profile.weightUnit}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  weightUnit: e.target.value as "kg" | "lb",
                })
              }
              className={`${inputCls} max-w-[5rem]`}
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </div>
        </Field>
        <Field label="Height (cm)">
          <input
            type="number"
            min={120}
            max={230}
            value={profile.heightCm}
            onChange={(e) => setProfile({ ...profile, heightCm: e.target.value })}
            className={inputCls}
            placeholder="178"
          />
        </Field>
        <Field label="Body comp goal">
          <select
            value={profile.bodyCompositionGoal}
            onChange={(e) =>
              setProfile({ ...profile, bodyCompositionGoal: e.target.value })
            }
            className={inputCls}
          >
            <option value="">—</option>
            {BODY_GOALS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
      </FieldGroup>

      <FieldGroup title="Training">
        <Field label="FTP (W)">
          <input
            type="number"
            min={50}
            max={600}
            value={profile.currentFtp}
            onChange={(e) =>
              setProfile({ ...profile, currentFtp: e.target.value })
            }
            className={inputCls}
            placeholder="250"
          />
        </Field>
        <Field label="W/kg (derived)">
          <input
            type="text"
            value={wkg ?? "—"}
            disabled
            className={`${inputCls} opacity-70`}
          />
        </Field>
        <Field label="Training hours / week">
          <input
            type="number"
            min={0}
            max={50}
            value={profile.weeklyTrainingHours}
            onChange={(e) =>
              setProfile({ ...profile, weeklyTrainingHours: e.target.value })
            }
            className={inputCls}
            placeholder="8"
          />
        </Field>
        <Field label="Discipline">
          <select
            value={profile.discipline}
            onChange={(e) =>
              setProfile({ ...profile, discipline: e.target.value })
            }
            className={inputCls}
          >
            <option value="">—</option>
            {DISCIPLINES.map((d) => (
              <option key={d} value={d}>
                {d.toUpperCase()}
              </option>
            ))}
          </select>
        </Field>
      </FieldGroup>

      <FieldGroup title="Goal">
        <Field label="Goal event" wide>
          <input
            type="text"
            value={profile.targetEvent}
            maxLength={200}
            onChange={(e) =>
              setProfile({ ...profile, targetEvent: e.target.value })
            }
            className={inputCls}
            placeholder="Marmotte Granfondo, Etape du Tour…"
          />
        </Field>
        <Field label="Event date">
          <input
            type="date"
            value={profile.targetEventDate}
            onChange={(e) =>
              setProfile({ ...profile, targetEventDate: e.target.value })
            }
            className={inputCls}
          />
        </Field>
        <Field label="Biggest limiter" wide>
          <select
            value={profile.biggestLimiter}
            onChange={(e) =>
              setProfile({ ...profile, biggestLimiter: e.target.value })
            }
            className={inputCls}
          >
            <option value="">—</option>
            {LIMITERS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </Field>
      </FieldGroup>

      <FieldGroup title="Context">
        <Field label="Preferred support level" wide>
          <select
            value={profile.preferredSupportLevel}
            onChange={(e) =>
              setProfile({ ...profile, preferredSupportLevel: e.target.value })
            }
            className={inputCls}
          >
            <option value="">—</option>
            {SUPPORT_LEVELS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tools you use" wide>
          <div className="flex flex-wrap gap-2">
            {TOOL_OPTIONS.map((t) => {
              const active = profile.currentTools.has(t.value);
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => toggleTool(t.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-heading uppercase tracking-[0.15em] transition ${
                    active
                      ? "bg-coral text-charcoal border-coral"
                      : "border-white/15 text-foreground hover:border-coral/50"
                  }`}
                  aria-pressed={active}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Injury history (optional)" wide>
          <textarea
            value={profile.injuryHistory}
            maxLength={2000}
            rows={3}
            onChange={(e) =>
              setProfile({ ...profile, injuryHistory: e.target.value })
            }
            className={`${inputCls} resize-y`}
            placeholder="Anything we should know — recurring niggles, off-bike injuries, recent surgery…"
          />
        </Field>
        <Field label="Main goal (free text)" wide>
          <textarea
            value={profile.mainGoal}
            maxLength={500}
            rows={3}
            onChange={(e) => setProfile({ ...profile, mainGoal: e.target.value })}
            className={`${inputCls} resize-y`}
            placeholder="e.g. Top 25% at Marmotte, ride 10,000km this year, drop 4 kg before race season."
          />
        </Field>
      </FieldGroup>

      <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
        <p className="text-xs text-foreground-muted">
          We only use this to personalise your tools, emails, and recommendations.
          You can edit or delete anything at any time.
        </p>
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-md bg-coral px-5 py-3 font-heading uppercase tracking-[0.15em] text-sm text-charcoal disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Save profile"}
        </button>
      </div>
      {errorMsg && (
        <p role="alert" className="text-sm text-coral">
          {errorMsg}
        </p>
      )}
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-white/15 bg-charcoal/80 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/60 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral";

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-xl border border-white/10 bg-charcoal/40 p-5">
      <legend className="font-heading uppercase text-xs tracking-[0.3em] text-coral px-2">
        {title}
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${wide ? "md:col-span-2" : ""}`}>
      <span className="font-heading uppercase text-[10px] tracking-[0.25em] text-foreground-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
