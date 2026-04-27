"use client";

import { useCallback, useRef, useState } from "react";
import type { TrackPoint } from "@/lib/race-predictor/types";
import { CourseElevationMini } from "./CourseElevationMini";

export interface GpxUploadResult {
  name: string;
  /** Full track points to submit to /api/predict. */
  points: TrackPoint[];
  /** Compact `[[distM, elevM], ...]` thumbnail profile. */
  profile: number[][];
  distanceM: number;
  elevationGainM: number;
  climbCount: number;
  climbs: {
    startDistance: number;
    endDistance: number;
    length: number;
    averageGradient: number;
    elevationGain: number;
    category: "cat4" | "cat3" | "cat2" | "cat1" | "hc";
  }[];
}

interface GpxDropzoneProps {
  value: GpxUploadResult | null;
  onChange: (result: GpxUploadResult | null) => void;
}

export function GpxDropzone({ value, onChange }: GpxDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.name.toLowerCase().endsWith(".gpx")) {
        setError("That's not a .gpx file. Export the route from Strava, Komoot, Garmin, or RideWithGPS.");
        return;
      }
      if (file.size === 0) {
        setError("That GPX is empty — re-export from your platform.");
        return;
      }
      if (file.size > 8_000_000) {
        setError("File is over 8 MB. Try simplifying the track in Strava (Edit → Lower track resolution).");
        return;
      }
      setParsing(true);
      try {
        const text = await file.text();
        // Cheap pre-flight: catches truncated downloads + non-XML files dressed up as .gpx.
        if (!text.includes("<gpx") && !text.includes("<trk")) {
          setError("We couldn't read that GPX file — it doesn't look like a valid GPX. Try exporting it again from Strava or Garmin.");
          setParsing(false);
          return;
        }
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 10_000);
        const res = await fetch("/api/predict/parse-gpx", {
          method: "POST",
          headers: { "Content-Type": "application/gpx+xml" },
          body: text,
          signal: ctrl.signal,
        }).finally(() => clearTimeout(timer));
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(
            data?.error ??
              "We couldn't read that GPX file — try exporting it again from Strava or Garmin.",
          );
          return;
        }
        onChange({
          name: data.name ?? file.name.replace(/\.gpx$/i, ""),
          points: data.points,
          profile: data.profile,
          distanceM: data.distanceM,
          elevationGainM: data.elevationGainM,
          climbCount: data.climbCount,
          climbs: data.climbs,
        });
      } catch (e) {
        const aborted = e instanceof DOMException && e.name === "AbortError";
        setError(
          aborted
            ? "Parsing timed out. Try a smaller file or check your connection."
            : "Network error parsing GPX. Try again.",
        );
      } finally {
        setParsing(false);
      }
    },
    [onChange],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (value) {
    const distKm = value.distanceM / 1000;
    return (
      <div className="rounded-xl border border-coral/40 bg-gradient-to-br from-coral/8 via-deep-purple/30 to-charcoal p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <p
              className="text-[0.65rem] tracking-[0.22em] uppercase text-coral mb-1"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              CUSTOM TRACK
            </p>
            <p className="font-heading text-lg uppercase tracking-tight text-off-white truncate">
              {value.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center min-h-[44px] -my-2 px-3 -mr-2 rounded-md text-foreground-muted hover:text-coral focus-visible:text-coral hover:bg-white/5 transition-colors text-xs uppercase tracking-wider"
            aria-label="Remove uploaded GPX"
          >
            Remove
          </button>
        </div>

        <CourseElevationMini
          profile={value.profile}
          width={400}
          height={60}
          className="w-full mb-3"
        />

        <div
          className="grid grid-cols-3 gap-3 text-xs"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          <Mini label="Distance" value={`${distKm.toFixed(1)} km`} />
          <Mini label="Climb" value={`${value.elevationGainM.toLocaleString()} m`} />
          <Mini label="Climbs" value={`${value.climbCount}`} />
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer p-6 text-center ${
        dragging
          ? "border-coral bg-coral/10 scale-[1.01]"
          : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".gpx,application/gpx+xml,application/xml,text/xml"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <div className="flex justify-center mb-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            dragging ? "bg-coral text-charcoal scale-110" : "bg-white/5 text-coral"
          }`}
        >
          {parsing ? (
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
              <path d="M12 2 a 10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>
      </div>

      <p className="font-heading text-base uppercase tracking-wider text-off-white mb-1">
        {parsing ? "Parsing track…" : "Upload your own GPX"}
      </p>
      <p className="text-xs text-foreground-muted">
        Drop a .gpx file here, or click to browse. Export the route from
        Strava, Komoot, Garmin or RideWithGPS, then upload it here.
      </p>

      {error && (
        <p
          className="mt-3 text-xs text-coral"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.6rem] tracking-[0.18em] uppercase text-foreground-subtle">
        {label}
      </p>
      <p className="text-off-white">{value}</p>
    </div>
  );
}
