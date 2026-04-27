"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

/**
 * Parse a display value like "61K+", "2,100+", "100M+", "$65", "114"
 * into { number, prefix, suffix } where number is just the digits.
 */
function parseValue(value: string): { number: number; prefix: string; suffix: string } {
  const match = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!match) return { number: 0, prefix: "", suffix: value };

  return {
    prefix: match[1],
    number: parseFloat(match[2].replace(/,/g, "")),
    suffix: match[3],
  };
}

function formatNumber(num: number, hasCommas: boolean): string {
  const rounded = Math.round(num);
  if (hasCommas) {
    return rounded.toLocaleString("en-US");
  }
  return rounded.toString();
}

/**
 * SSR-safe counter.
 *
 * Previously this rendered "0" + suffix on the server (e.g. "0M+") and only
 * animated to the real number on client-side intersection. That shipped "0"
 * to Googlebot, AI crawlers, and no-JS / slow-network users — killing our
 * primary social proof.
 *
 * Now: initial state is the real value, which is what SSR + hydration render.
 * After mount, when the element scrolls into view, we restart from zero and
 * animate up — preserving the eye candy for users who scroll down to the
 * stats from below the fold. Above-fold stats (homepage) skip the animation
 * entirely because the element is already in view before the first paint.
 */
export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasMountedRef = useRef(false);
  const hasAnimatedRef = useRef(false);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(value);
  const { number, prefix, suffix } = parseValue(value);
  const hasCommas = value.includes(",");

  useEffect(() => {
    // First mount: if stats were in view on first frame (above-fold case on
    // homepage), the observer fires synchronously and we already have the
    // real number rendered. Skip the animation rather than flashing back to 0.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (isInView) {
        hasAnimatedRef.current = true;
        return;
      }
    }

    if (!isInView || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- rAF count-up animation
    setDisplayValue(formatNumber(0, hasCommas));
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = number * eased;
      setDisplayValue(formatNumber(current, hasCommas));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(formatNumber(number, hasCommas));
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, number, hasCommas]);

  // On SSR and first render, displayValue === `value`, so we output it
  // verbatim (prefix + value + suffix would double-prefix). Once the
  // animation runs, displayValue is just the numeric portion.
  const isFinalValue = displayValue === value;
  return (
    <span ref={ref} className={className}>
      {isFinalValue ? value : `${prefix}${displayValue}${suffix}`}
    </span>
  );
}
