"use client";

import { useEffect, useState } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import { AGE_BRACKETS } from "@/lib/diagnostic/types";

/**
 * Embedded age-picker in the hero. Tap an age and we:
 *  1. Persist it into the diagnostic sessionStorage key
 *  2. Dispatch a window event so a mounted DiagnosticFlow jumps
 *     straight to the hours step
 *  3. Smooth-scroll to #start
 *
 * Conversion bet: removing "click Start → scroll → read intro → answer Q1"
 * collapses to a single tap. Sunk-cost carries them through the rest of
 * the flow — people who've answered 1 question answer 12.
 */

const AGE_LABELS: Record<string, { short: string; long: string }> = {
  "35-44": { short: "35-44", long: "Thirty-five to forty-four" },
  "45-54": { short: "45-54", long: "Forty-five to fifty-four" },
  "55-64": { short: "55-64", long: "Fifty-five to sixty-four" },
  "65+": { short: "65+", long: "Sixty-five and over" },
};

const STORAGE_KEY = "plateau-diagnostic-v1";

export function HeroAgePicker() {
  const [picked, setPicked] = useState<string | null>(null);
  // Session id — shared with the DiagnosticFlow so the start event
  // threads through the same session as the rest of the funnel.
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    try {
      const existing = sessionStorage.getItem("plateau-session-id");
      if (existing) {
        setSessionId(existing);
        return;
      }
      const sid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `s-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
      sessionStorage.setItem("plateau-session-id", sid);
      setSessionId(sid);
    } catch {
      setSessionId(`s-${Date.now()}`);
    }
  }, []);

  const onPick = (age: string) => {
    setPicked(age);
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...existing, age })
      );
    } catch {
      // non-fatal — DiagnosticFlow re-asks age if storage is blocked
    }

    trackAnalyticsEvent({
      type: "diagnostic_start",
      page: "/plateau",
      sessionId,
      meta: { entry: "hero-age-picker", age },
    });

    // DiagnosticFlow listens for this and jumps to the hours step.
    window.dispatchEvent(
      new CustomEvent("plateau:prefill-age", { detail: { age } })
    );

    // Smooth-scroll to the diagnostic. If the element isn't in the
    // DOM yet (Suspense not resolved), retry once after a tick.
    const scroll = () => {
      const el = document.getElementById("start");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }
      return false;
    };
    if (!scroll()) setTimeout(scroll, 100);
  };

  return (
    <div className="mt-8" role="radiogroup" aria-label="Which age bracket are you in?">
      <p className="text-foreground-muted mb-4 text-sm tracking-wide uppercase font-heading">
        Tap your age to start
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl mx-auto">
        {AGE_BRACKETS.map((age) => {
          const meta = AGE_LABELS[age];
          const isPicked = picked === age;
          return (
            <button
              key={age}
              type="button"
              role="radio"
              aria-checked={isPicked}
              aria-label={meta.long}
              onClick={() => onPick(age)}
              className={`
                py-5 px-4 rounded-xl border-2 font-heading text-xl
                cursor-pointer transition-all duration-200
                ${
                  isPicked
                    ? "border-coral bg-coral text-off-white shadow-lg shadow-coral/30"
                    : "border-white/20 bg-white/5 text-off-white hover:border-coral hover:bg-coral/10 hover:-translate-y-0.5"
                }
              `}
            >
              {meta.short}
            </button>
          );
        })}
      </div>
      <p className="text-foreground-subtle text-xs text-center mt-4">
        No email needed until the end · 4 minutes · Free
      </p>
    </div>
  );
}
