"use client";

import { useEffect, useRef, useState } from "react";
import type { ResolvedOption } from "@/lib/racing-iq/engine";
import type { Scenario } from "@/lib/racing-iq/types";

/**
 * The frozen-moment decision UI. Slides in like a broadcast graphics
 * package over the desaturated world. Keyboard: 1–3 select, arrows
 * move, Enter confirms. Disabled options stay visible — showing the
 * door that just closed is half the coaching.
 */
export function DecisionPanel({
  scenario,
  setup,
  notice,
  options,
  onDecide,
  onFocusOption,
}: {
  scenario: Scenario;
  setup: string;
  /** Deferred-consequence copy (e.g. the bonk arriving). */
  notice?: string;
  options: ResolvedOption[];
  onDecide: (optionId: string) => void;
  onFocusOption?: () => void;
}) {
  const [focusIdx, setFocusIdx] = useState(() =>
    options.findIndex((o) => o.availability.available)
  );
  const listRef = useRef<HTMLDivElement>(null);
  const decidedRef = useRef(false);

  const decide = (id: string) => {
    if (decidedRef.current) return;
    decidedRef.current = true;
    onDecide(id);
  };

  useEffect(() => {
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-option]");
    buttons?.[focusIdx]?.focus({ preventScroll: true });
  }, [focusIdx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const idx = Number.parseInt(e.key, 10);
      if (idx >= 1 && idx <= options.length) {
        const opt = options[idx - 1];
        if (opt.availability.available) decide(opt.option.id);
        else setFocusIdx(idx - 1);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setFocusIdx((i) => (i + 1) % options.length);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusIdx((i) => (i - 1 + options.length) % options.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 mx-auto max-h-full w-full max-w-2xl overflow-y-auto px-4 pb-14 pt-2 sm:pb-16">
      <div className="riq-lower-third-in">
        {/* Scenario slate */}
        <div className="border-l-[3px] border-coral bg-charcoal/85 p-4 backdrop-blur-md sm:p-5">
          <p className="font-heading text-xs tracking-[0.3em] text-coral">
            {scenario.kicker}
          </p>
          <h2 className="mt-1 font-heading text-2xl uppercase leading-none tracking-wide text-off-white sm:text-3xl">
            {scenario.title}
          </h2>
          {notice && (
            <p className="mt-3 border-l-2 border-coral/60 pl-3 text-sm italic leading-relaxed text-coral/90">
              {notice}
            </p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-off-white/85 sm:text-[15px]">
            {setup}
          </p>
        </div>

        {/* Options */}
        <div
          ref={listRef}
          role="group"
          aria-label="Your decision"
          className="mt-2 space-y-1.5"
        >
          {options.map(({ option, availability }, i) => {
            const disabled = !availability.available;
            return (
              <button
                key={option.id}
                type="button"
                data-option={option.id}
                disabled={disabled}
                onClick={() => decide(option.id)}
                onFocus={() => {
                  setFocusIdx(i);
                  onFocusOption?.();
                }}
                className={`group block w-full text-left transition-transform duration-150 ${
                  disabled
                    ? "cursor-not-allowed"
                    : "hover:translate-x-1 focus-visible:translate-x-1"
                }`}
              >
                <div
                  className={`flex items-start gap-3 border bg-deep-purple/80 p-3 backdrop-blur-md sm:p-3.5 ${
                    disabled
                      ? "border-off-white/10 opacity-60"
                      : "border-off-white/15 group-hover:border-coral group-focus-visible:border-coral"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center font-heading text-sm ${
                      disabled
                        ? "bg-off-white/10 text-off-white/40"
                        : "bg-coral text-off-white"
                    }`}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block font-heading text-lg uppercase leading-tight tracking-wide sm:text-xl ${
                        disabled ? "text-off-white/45 line-through decoration-off-white/30" : "text-off-white"
                      }`}
                    >
                      {option.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-[13px] leading-snug ${
                        disabled ? "text-off-white/35" : "text-off-white/65"
                      }`}
                    >
                      {disabled && !availability.available
                        ? availability.reason
                        : option.detail}
                    </span>
                  </span>
                  {option.cost > 0 && (
                    <span
                      className={`mt-0.5 shrink-0 font-heading text-xs tracking-[0.18em] ${
                        disabled ? "text-off-white/30" : "text-coral/90"
                      }`}
                    >
                      {option.cost} {option.cost === 1 ? "MATCH" : "MATCHES"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[11px] tracking-wide text-off-white/40">
          1–3 to choose · arrows to move · Enter to commit
        </p>
      </div>
    </div>
  );
}
