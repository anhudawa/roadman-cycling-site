"use client";

import { useRef } from "react";
import type { Course } from "@/lib/race-predictor/types";
import { CourseElevationMini } from "./CourseElevationMini";

interface ShareCardProps {
  courseName: string;
  predictedTimeS: number;
  averageSpeedKmh: number;
  averagePower: number | null;
  distanceKm: number;
  elevationGainM: number;
  course: Course;
  insightHeadline: string;
}

function fmt(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

/**
 * Square (1080×1080) IG/WhatsApp share card. Renders inline so users see what
 * they're about to share — copy / right-click-save action. The card is
 * styled with the brand dark + coral palette and large enough to read on a
 * phone feed.
 */
export function ShareCard({
  courseName,
  predictedTimeS,
  averageSpeedKmh,
  averagePower,
  distanceKm,
  elevationGainM,
  course,
  insightHeadline,
}: ShareCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p
          className="text-[0.65rem] tracking-[0.22em] uppercase text-coral"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          SHAREABLE PREDICTION CARD
        </p>
        <button
          type="button"
          onClick={() => {
            // Copy the prediction summary to clipboard for the lazy share.
            const text = `${courseName} — predicted ${fmt(predictedTimeS)} (${averageSpeedKmh.toFixed(1)} km/h${averagePower ? `, ${Math.round(averagePower)}W avg` : ""}). via roadmancycling.com/predict`;
            if (navigator.clipboard) {
              navigator.clipboard.writeText(text);
            }
          }}
          className="text-[0.65rem] tracking-[0.18em] uppercase text-foreground-muted hover:text-coral transition-colors"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Copy caption
        </button>
      </div>

      {/* The square card itself — sized for IG (max 480px, scales down on mobile) */}
      <div className="mx-auto w-full max-w-[480px]">
        <div
          ref={ref}
          className="relative aspect-square rounded-xl overflow-hidden bg-deep-purple"
        >
          {/* Aurora */}
          <div
            className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full blur-[120px] opacity-70"
            style={{ background: "radial-gradient(circle, rgba(241,99,99,0.45), transparent 65%)" }}
          />
          <div
            className="absolute -bottom-32 -right-24 w-[340px] h-[340px] rounded-full blur-[100px] opacity-70"
            style={{ background: "radial-gradient(circle, rgba(76,18,115,0.7), transparent 65%)" }}
          />

          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-coral/15 border border-coral/30 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F16363" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="15" r="4" />
                    <circle cx="18" cy="15" r="4" />
                    <path d="M6 15 L11 6 L13 6 M11 6 L18 15" />
                  </svg>
                </div>
                <p
                  className="text-[0.6rem] tracking-[0.25em] uppercase text-off-white/80"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  ROADMAN · RACE PREDICTOR
                </p>
              </div>
            </div>

            <p
              className="text-[0.6rem] tracking-[0.25em] uppercase text-coral mb-1"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              PREDICTED FINISH
            </p>
            <p className="font-heading text-[clamp(3rem,11vw,5.5rem)] uppercase tracking-tighter text-off-white leading-[0.9] mb-3">
              {fmt(predictedTimeS)}
            </p>

            <p className="font-heading text-lg uppercase tracking-tight text-off-white/90 mb-1">
              {courseName}
            </p>
            <p
              className="text-[0.7rem] tracking-[0.18em] uppercase text-off-white/60"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              {distanceKm.toFixed(0)}KM · {elevationGainM.toLocaleString()}M · {averageSpeedKmh.toFixed(1)}KM/H
              {averagePower ? ` · ${Math.round(averagePower)}W AVG` : ""}
            </p>

            <div className="mt-auto">
              <CourseElevationMini
                course={course}
                width={420}
                height={50}
                className="w-full mb-4 opacity-90"
              />

              <p className="text-off-white/85 text-sm leading-snug border-t border-white/10 pt-3">
                {insightHeadline}
              </p>

              <p
                className="mt-3 text-[0.55rem] tracking-[0.25em] uppercase text-off-white/45"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                ROADMANCYCLING.COM/PREDICT
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-foreground-subtle text-center mt-4">
        Screenshot to share to Stories · Caption copied via the button above
      </p>
    </div>
  );
}
