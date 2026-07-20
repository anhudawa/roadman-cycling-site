"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import type { Activity } from "@/lib/ridezones/types";

interface ManualRideFormProps {
  onAdd: (activity: Activity) => void;
  onCancel?: () => void;
}

const inputClass =
  "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none";

export function ManualRideForm({ onAdd, onCancel }: ManualRideFormProps) {
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [avgPower, setAvgPower] = useState("");
  const [np, setNp] = useState("");
  const [avgHr, setAvgHr] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError("Pick a date for the ride.");
      return;
    }
    const minutes = Number(durationMin);
    if (!Number.isFinite(minutes) || minutes < 10 || minutes > 900) {
      setError("Duration needs to be between 10 and 900 minutes.");
      return;
    }
    const parsedPower = Number(avgPower);
    const parsedNp = Number(np);
    const parsedHr = Number(avgHr);
    const parsedKm = Number(distanceKm);

    onAdd({
      id: `manual-${date}-${Math.round(minutes)}-${name.length}-${parsedPower || 0}`,
      date,
      name: name.trim() || "Ride",
      durationSec: Math.round(minutes * 60),
      avgPower: Number.isFinite(parsedPower) && parsedPower > 0 ? Math.round(parsedPower) : undefined,
      normalizedPower: Number.isFinite(parsedNp) && parsedNp > 0 ? Math.round(parsedNp) : undefined,
      avgHr: Number.isFinite(parsedHr) && parsedHr > 0 ? Math.round(parsedHr) : undefined,
      distanceKm: Number.isFinite(parsedKm) && parsedKm > 0 ? Math.round(parsedKm * 10) / 10 : undefined,
      source: "manual",
    });

    setName("");
    setDurationMin("");
    setAvgPower("");
    setNp("");
    setAvgHr("");
    setDistanceKm("");
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
      <p className="mb-4 font-heading text-lg uppercase tracking-wide text-off-white">
        Add a ride manually
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="mr-date" className="mb-1 block text-xs font-semibold text-foreground-muted">
            Date
          </label>
          <input
            id="mr-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="mr-name" className="mb-1 block text-xs font-semibold text-foreground-muted">
            Name (optional)
          </label>
          <input
            id="mr-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sunday club run"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="mr-duration" className="mb-1 block text-xs font-semibold text-foreground-muted">
            Duration (minutes)
          </label>
          <input
            id="mr-duration"
            type="number"
            inputMode="numeric"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            placeholder="90"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="mr-power" className="mb-1 block text-xs font-semibold text-foreground-muted">
            Avg power (W, optional)
          </label>
          <input
            id="mr-power"
            type="number"
            inputMode="numeric"
            value={avgPower}
            onChange={(e) => setAvgPower(e.target.value)}
            placeholder="185"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="mr-np" className="mb-1 block text-xs font-semibold text-foreground-muted">
            Normalized power (W, optional)
          </label>
          <input
            id="mr-np"
            type="number"
            inputMode="numeric"
            value={np}
            onChange={(e) => setNp(e.target.value)}
            placeholder="198"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="mr-hr" className="mb-1 block text-xs font-semibold text-foreground-muted">
            Avg heart rate (bpm, optional)
          </label>
          <input
            id="mr-hr"
            type="number"
            inputMode="numeric"
            value={avgHr}
            onChange={(e) => setAvgHr(e.target.value)}
            placeholder="145"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="mr-km" className="mb-1 block text-xs font-semibold text-foreground-muted">
            Distance (km, optional)
          </label>
          <input
            id="mr-km"
            type="number"
            inputMode="numeric"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            placeholder="65"
            className={inputClass}
          />
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
      <div className="mt-4 flex gap-3">
        <Button onClick={handleSubmit} size="sm" dataTrack="ridezones_manual_add">
          Add ride
        </Button>
        {onCancel ? (
          <Button onClick={onCancel} variant="ghost" size="sm">
            Done
          </Button>
        ) : null}
      </div>
    </div>
  );
}
