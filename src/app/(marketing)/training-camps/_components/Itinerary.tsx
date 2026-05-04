"use client";

import { useState } from "react";
import type { ItineraryDay } from "@/lib/camps/itineraries";

export function Itinerary({ days }: { days: ItineraryDay[] }) {
  const [open, setOpen] = useState<number | null>(1);

  return (
    <div className="divide-y divide-white/10 border-y border-white/10 bg-white/[0.015]">
      {days.map((day) => {
        const isOpen = open === day.day;
        return (
          <div key={day.day}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : day.day)}
              aria-expanded={isOpen}
              className="w-full text-left px-5 py-5 md:px-6 md:py-6 flex items-start gap-4 md:gap-6 hover:bg-white/[0.03] transition-colors"
            >
              <span className="font-heading text-coral text-xs tracking-[0.3em] uppercase shrink-0 mt-1 w-12">
                Day {day.day}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-heading text-off-white text-xl md:text-2xl tracking-wide leading-tight">
                  {day.title.toUpperCase()}
                </span>
                <span className="block text-foreground-muted text-sm mt-1">
                  {day.ride} &middot; {day.distance} &middot; {day.elevation}
                </span>
              </span>
              <span
                aria-hidden
                className={`shrink-0 mt-2 transition-transform text-foreground-muted ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-6 md:px-6 md:pb-8 md:pl-[88px]">
                <p className="text-foreground-muted leading-relaxed mb-4">
                  {day.description}
                </p>
                <ul className="space-y-1.5">
                  {day.highlights.map((h) => (
                    <li
                      key={h}
                      className="text-foreground-muted text-sm flex items-start gap-2"
                    >
                      <span className="text-coral mt-0.5" aria-hidden>
                        ›
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
