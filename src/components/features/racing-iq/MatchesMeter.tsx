"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The matches meter — the signature element. Five physical matchsticks;
 * spending energy burns them down with a flame and a curl of smoke.
 * This is the coaching metaphor of the whole brand, so it gets the
 * disproportionate polish the brief asks for.
 */

type MatchVisual = "lit" | "burning" | "burned";

const BURN_MS = 1500;

function Match({ state }: { state: MatchVisual }) {
  return (
    <svg
      viewBox="0 0 24 64"
      className="h-10 w-[15px] sm:h-12 sm:w-[18px]"
      aria-hidden="true"
    >
      {state === "burned" ? (
        <>
          {/* Charred, slightly bowed stick with a dead ember tip */}
          <path
            d="M 11 58 C 9.5 44 10 30 12.5 17"
            stroke="#3a3a3c"
            strokeWidth="3.6"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="12.8" cy="14" r="3" fill="#4a3134" opacity="0.9" />
        </>
      ) : (
        <>
          <rect
            x="10"
            y="16"
            width="4"
            height="42"
            rx="1.6"
            fill="#d9b38c"
            className={state === "burning" ? "riq-burning-stick" : undefined}
          />
          {state === "lit" && (
            <ellipse
              cx="12"
              cy="11.5"
              rx="5"
              ry="7.5"
              fill="#F16363"
              className="riq-match-head-lit"
            />
          )}
          {state === "burning" && (
            <>
              <ellipse cx="12" cy="11.5" rx="5" ry="7.5" fill="#8a4038" />
              <path
                className="riq-flame"
                d="M 12 -6 C 17 0 19 6 16.5 11 C 15 14 9 14 7.5 11 C 5 6 7 0 12 -6 Z"
                fill="#F16363"
                opacity="0.9"
              />
              <path
                className="riq-flame-inner"
                d="M 12 0 C 15 4 15.5 8 14 10.5 C 13 12.3 11 12.3 10 10.5 C 8.5 8 9 4 12 0 Z"
                fill="#ffd9a0"
              />
              <circle className="riq-smoke" cx="12" cy="2" r="4" fill="#9a9aa2" />
            </>
          )}
        </>
      )}
    </svg>
  );
}

export function MatchesMeter({
  matches,
  total = 5,
  onBurn,
}: {
  matches: number;
  total?: number;
  /** Called once per match as its burn animation starts (for sound). */
  onBurn?: () => void;
}) {
  const prevRef = useRef(matches);
  const [burning, setBurning] = useState<Set<number>>(new Set());
  const onBurnRef = useRef(onBurn);
  useEffect(() => {
    onBurnRef.current = onBurn;
  }, [onBurn]);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = matches;
    if (matches >= prev) return;
    // Burn from the right: indices [matches, prev)
    const indices: number[] = [];
    for (let i = matches; i < prev; i++) indices.push(i);
    const timers: ReturnType<typeof setTimeout>[] = [];
    indices
      .sort((a, b) => b - a)
      .forEach((idx, order) => {
        timers.push(
          setTimeout(() => {
            onBurnRef.current?.();
            setBurning((s) => new Set(s).add(idx));
            timers.push(
              setTimeout(() => {
                setBurning((s) => {
                  const next = new Set(s);
                  next.delete(idx);
                  return next;
                });
              }, BURN_MS)
            );
          }, order * 450)
        );
      });
    return () => timers.forEach(clearTimeout);
  }, [matches]);

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={matches}
      aria-label={`Matches remaining: ${matches} of ${total}`}
      className="flex items-end gap-0.5 sm:gap-1"
    >
      {Array.from({ length: total }, (_, i) => {
        const state: MatchVisual = burning.has(i)
          ? "burning"
          : i < matches
            ? "lit"
            : "burned";
        return <Match key={i} state={state} />;
      })}
    </div>
  );
}
