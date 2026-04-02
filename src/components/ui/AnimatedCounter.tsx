"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

function parseValue(value: string): { number: number; prefix: string; suffix: string } {
  const match = value.match(/^([^\d]*)([\d,.]+)([^\d]*)$/);
  if (!match) return { number: 0, prefix: "", suffix: value };

  return {
    prefix: match[1],
    number: parseFloat(match[2].replace(/,/g, "")),
    suffix: match[3],
  };
}

function formatNumber(num: number, original: string): string {
  if (original.includes(",")) {
    return num.toLocaleString("en-US");
  }
  if (original.includes("K")) {
    return `${Math.round(num / 1000)}`;
  }
  return Math.round(num).toString();
}

export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState("0");
  const { number, prefix, suffix } = parseValue(value);

  useEffect(() => {
    if (!isInView) return;

    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = number * eased;

      setDisplayValue(formatNumber(current, value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Set final formatted value
        setDisplayValue(value.replace(/^[^\d]*/, "").replace(/[^\d,.KM+]*$/, "").replace(/,/g, "").includes("K")
          ? value.replace(/^[^\d]*/, "").replace(/[^\d,.KM+]*$/, "")
          : formatNumber(number, value));
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, number, value]);

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
