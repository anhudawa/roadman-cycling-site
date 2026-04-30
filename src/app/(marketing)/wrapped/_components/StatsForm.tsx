"use client";

import { useState } from "react";
import type {
  RidingPersonality,
  WrappedData,
  WrappedFormInput,
} from "@/lib/season-wrapped/types";

interface Props {
  defaults?: Partial<WrappedFormInput>;
  onComputed: (data: WrappedData, input: WrappedFormInput) => void;
}

const ARCHETYPES: { value: RidingPersonality; label: string }[] = [
  { value: "climber", label: "Climber" },
  { value: "sprinter", label: "Sprinter" },
  { value: "diesel", label: "Diesel" },
  { value: "all_rounder", label: "All-rounder" },
];

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

/**
 * Manual stats entry — used until the Strava integration ships.
 * Posts to /api/wrapped which validates + builds the WrappedData payload.
 */
export function StatsForm({ defaults, onComputed }: Props) {
  const [firstName, setFirstName] = useState(defaults?.firstName ?? "");
  const [year, setYear] = useState<number>(defaults?.year ?? new Date().getFullYear());
  const [totalDistanceKm, setTotalDistanceKm] = useState<string>(
    defaults?.totalDistanceKm?.toString() ?? "",
  );
  const [totalElevationM, setTotalElevationM] = useState<string>(
    defaults?.totalElevationM?.toString() ?? "",
  );
  const [totalRides, setTotalRides] = useState<string>(
    defaults?.totalRides?.toString() ?? "",
  );
  const [totalTimeHours, setTotalTimeHours] = useState<string>(
    defaults?.totalTimeHours?.toString() ?? "",
  );
  const [longestRideKm, setLongestRideKm] = useState<string>(
    defaults?.longestRideKm?.toString() ?? "",
  );
  const [longestRideElevationM, setLongestRideElevationM] = useState<string>(
    defaults?.longestRideElevationM?.toString() ?? "",
  );
  const [longestRideName, setLongestRideName] = useState<string>(
    defaults?.longestRideName ?? "",
  );
  const [biggestMonth, setBiggestMonth] = useState<string>(
    defaults?.biggestMonth?.toString() ?? "",
  );
  const [ftpStart, setFtpStart] = useState<string>(
    defaults?.ftpStart?.toString() ?? "",
  );
  const [ftpEnd, setFtpEnd] = useState<string>(
    defaults?.ftpEnd?.toString() ?? "",
  );
  const [weeklyStreak, setWeeklyStreak] = useState<string>(
    defaults?.weeklyStreak?.toString() ?? "",
  );
  const [personality, setPersonality] = useState<RidingPersonality | "">(
    defaults?.personality ?? "",
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: WrappedFormInput = {
      firstName: firstName.trim() || "You",
      email: "", // captured at the gate, not here
      year,
      totalDistanceKm: Number(totalDistanceKm),
      totalElevationM: Number(totalElevationM),
      totalRides: Number(totalRides),
      totalTimeHours: Number(totalTimeHours),
      longestRideKm: Number(longestRideKm),
      longestRideElevationM: longestRideElevationM
        ? Number(longestRideElevationM)
        : undefined,
      longestRideName: longestRideName.trim() || undefined,
      biggestMonth: biggestMonth ? Number(biggestMonth) : undefined,
      ftpStart: ftpStart ? Number(ftpStart) : undefined,
      ftpEnd: ftpEnd ? Number(ftpEnd) : undefined,
      weeklyStreak: weeklyStreak ? Number(weeklyStreak) : undefined,
      personality: personality || undefined,
    };

    if (
      !payload.totalDistanceKm ||
      !payload.totalElevationM ||
      !payload.totalRides ||
      !payload.totalTimeHours ||
      !payload.longestRideKm
    ) {
      setError("Fill in distance, elevation, rides, hours, and longest ride to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wrapped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Couldn't build your wrapped.");
        return;
      }
      onComputed(data.wrapped as WrappedData, payload);
    } catch {
      setError("Network issue — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identity */}
      <div className="grid sm:grid-cols-[1fr_140px] gap-3">
        <Field
          label="First name"
          value={firstName}
          onChange={setFirstName}
          placeholder="What should we call you on the cards?"
          maxLength={40}
        />
        <Field
          label="Season"
          value={String(year)}
          onChange={(v) => setYear(Number(v))}
          type="number"
          min={2000}
          max={2100}
          step={1}
        />
      </div>

      {/* Core totals */}
      <FieldGroup title="The big numbers" eyebrow="Required">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field
            label="Total distance (km)"
            value={totalDistanceKm}
            onChange={setTotalDistanceKm}
            type="number"
            min={1}
            step={1}
            placeholder="e.g. 8400"
          />
          <Field
            label="Total elevation (m)"
            value={totalElevationM}
            onChange={setTotalElevationM}
            type="number"
            min={0}
            step={50}
            placeholder="e.g. 96000"
          />
          <Field
            label="Total rides"
            value={totalRides}
            onChange={setTotalRides}
            type="number"
            min={1}
            step={1}
            placeholder="e.g. 168"
          />
          <Field
            label="Total time (hours)"
            value={totalTimeHours}
            onChange={setTotalTimeHours}
            type="number"
            min={1}
            step={1}
            placeholder="e.g. 320"
          />
        </div>
      </FieldGroup>

      {/* Highlight ride */}
      <FieldGroup title="The long one" eyebrow="One ride to remember">
        <div className="grid sm:grid-cols-[1fr_180px_180px] gap-3">
          <Field
            label="Event or ride name"
            value={longestRideName}
            onChange={setLongestRideName}
            placeholder="e.g. Mallorca 312 (optional)"
            maxLength={80}
          />
          <Field
            label="Distance (km)"
            value={longestRideKm}
            onChange={setLongestRideKm}
            type="number"
            min={1}
            step={1}
          />
          <Field
            label="Elevation (m)"
            value={longestRideElevationM}
            onChange={setLongestRideElevationM}
            type="number"
            min={0}
            step={50}
            placeholder="optional"
          />
        </div>
      </FieldGroup>

      {/* Power + month */}
      <FieldGroup title="The story behind the numbers" eyebrow="Optional but adds depth">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Field
            label="FTP start of year"
            value={ftpStart}
            onChange={setFtpStart}
            type="number"
            min={50}
            max={500}
            step={5}
            placeholder="W"
          />
          <Field
            label="FTP now"
            value={ftpEnd}
            onChange={setFtpEnd}
            type="number"
            min={50}
            max={500}
            step={5}
            placeholder="W"
          />
          <SelectField
            label="Biggest month"
            value={biggestMonth}
            onChange={setBiggestMonth}
            options={[
              { value: "", label: "Auto-detect" },
              ...MONTHS.map((m, i) => ({ value: String(i + 1), label: m })),
            ]}
          />
          <Field
            label="Weekly streak"
            value={weeklyStreak}
            onChange={setWeeklyStreak}
            type="number"
            min={0}
            max={52}
            step={1}
            placeholder="weeks unbroken"
          />
        </div>
      </FieldGroup>

      {/* Personality */}
      <FieldGroup title="Riding personality" eyebrow="Or let us guess">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPersonality("")}
            aria-pressed={personality === ""}
            className={chipClass(personality === "")}
          >
            Auto-detect
          </button>
          {ARCHETYPES.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setPersonality(a.value)}
              aria-pressed={personality === a.value}
              className={chipClass(personality === a.value)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </FieldGroup>

      {error && (
        <p className="text-coral text-sm" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-coral px-7 py-3 font-display text-base uppercase tracking-[0.18em] text-charcoal hover:bg-coral-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-8px_rgba(241,99,99,0.65)]"
        >
          {submitting ? "Building…" : "Wrap my season →"}
        </button>
        <p className="text-off-white/45 text-xs">
          Free · Takes 30 seconds · Numbers stay on this page
        </p>
      </div>
    </form>
  );
}

function chipClass(active: boolean): string {
  return `rounded-full px-3 py-1.5 font-display text-[11px] uppercase tracking-[0.16em] border transition-all ${
    active
      ? "border-coral bg-coral/15 text-coral"
      : "border-white/10 bg-white/[0.02] text-off-white/65 hover:text-off-white hover:border-white/30"
  }`;
}

function FieldGroup({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      {eyebrow && (
        <p className="font-display text-[11px] uppercase tracking-[0.24em] text-coral/80 mb-1">
          {eyebrow}
        </p>
      )}
      <legend className="font-display text-xl uppercase tracking-wide text-off-white mb-3">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  step,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="font-display text-[11px] uppercase tracking-[0.2em] text-off-white/55 block mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        maxLength={maxLength}
        className="w-full bg-white/[0.04] border border-white/10 rounded-md px-3 py-2.5 text-off-white text-base placeholder:text-off-white/60 focus:outline-none focus:border-coral/60 focus:bg-white/[0.06] transition-colors"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="font-display text-[11px] uppercase tracking-[0.2em] text-off-white/55 block mb-1">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/10 rounded-md px-3 py-2.5 text-off-white text-base focus:outline-none focus:border-coral/60"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-charcoal">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
