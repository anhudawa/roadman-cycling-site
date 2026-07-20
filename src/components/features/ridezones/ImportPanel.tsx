"use client";

import { useRef, useState } from "react";
import { parseStravaActivitiesCsv } from "@/lib/ridezones/strava";
import { parseTrainingPeaksCsv } from "@/lib/ridezones/trainingpeaks";
import type { Activity } from "@/lib/ridezones/types";

type Platform = "strava" | "trainingpeaks";

interface ImportPanelProps {
  onImport: (activities: Activity[], summary: string) => void;
  /** Compact layout for use inside the dashboard. */
  compact?: boolean;
}

const PLATFORM_COPY: Record<
  Platform,
  { title: string; hint: string; track: string }
> = {
  strava: {
    title: "Strava export",
    hint: "Upload activities.csv from your Strava archive (Settings → My Account → Download or Delete Your Account → Request Your Archive).",
    track: "ridezones_import_strava",
  },
  trainingpeaks: {
    title: "TrainingPeaks export",
    hint: "Upload the workouts CSV from TrainingPeaks (Account Settings → Export Data, or export a date range from the calendar).",
    track: "ridezones_import_tp",
  },
};

export function ImportPanel({ onImport, compact = false }: ImportPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Platform | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!pending) return;
    setError(null);
    const text = await file.text();
    const result =
      pending === "strava"
        ? parseStravaActivitiesCsv(text)
        : parseTrainingPeaksCsv(text);

    if (result.activities.length === 0) {
      setError(result.errors[0] ?? "No rides found in that file.");
      return;
    }
    const label = pending === "strava" ? "Strava" : "TrainingPeaks";
    onImport(
      result.activities,
      `${result.activities.length} rides imported from ${label}${
        result.skipped > 0 ? `, ${result.skipped} non-ride entries skipped` : ""
      }.`
    );
  };

  const pick = (platform: Platform) => {
    setPending(platform);
    // Reset so re-selecting the same file still fires onChange.
    if (fileRef.current) fileRef.current.value = "";
    fileRef.current?.click();
  };

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {(Object.keys(PLATFORM_COPY) as Platform[]).map((platform) => {
        const copy = PLATFORM_COPY[platform];
        return (
          <button
            key={platform}
            type="button"
            onClick={() => pick(platform)}
            data-track={copy.track}
            className={`w-full rounded-lg border border-dashed border-white/25 bg-white/[0.03] px-5 text-left transition-colors hover:border-coral/60 ${
              compact ? "py-4" : "py-6"
            }`}
          >
            <span
              className={`block font-heading uppercase tracking-wide text-off-white ${
                compact ? "text-lg" : "text-xl"
              }`}
            >
              Import your {copy.title}
            </span>
            <span className="mt-1 block text-sm text-foreground-muted">{copy.hint}</span>
          </button>
        );
      })}
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      {error ? <p className="text-sm text-coral">{error}</p> : null}
    </div>
  );
}
