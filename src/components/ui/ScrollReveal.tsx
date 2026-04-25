"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { type ReactNode } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  /**
   * Skip the reveal animation entirely. The default SSR-safe behaviour
   * already keeps above-the-fold content visible on first paint, so pass
   * `eager` only when you want to permanently opt out of the reveal $€”
   * e.g. static brand/hero content that should never animate.
   */
  eager?: boolean;
}

const directionOffsets: Record<RevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

/**
 * SSR renders a plain visible `<div>` (so Googlebot and no-JS users see
 * fully rendered HTML). After hydration we measure the element's position $€”
 * anything already in the viewport stays as a plain div, anything below the
 * fold swaps to a motion.div that reveals on scroll.
 *
 * The earlier implementation emitted `opacity:0` in SSR HTML for every
 * ScrollReveal instance, which hid below-the-fold content from crawlers.
 */
export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className = "",
  once = true,
  eager = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-50px" });
  const [phase, setPhase] = useState<"ssr" | "animate" | "static">("ssr");

  useEffect(() => {
    if (eager) {
      setPhase("static");
      return;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setup = () => {
      if (mq.matches) {
        setPhase("static");
        return;
      }
      // If the element is already in (or near) the viewport at hydration time
      // the user already saw it rendered by SSR $€” don't flash opacity:0 at
      // them. Only animate the reveal for content still below the fold when
      // JS boots.
      const rect = ref.current?.getBoundingClientRect();
      const alreadyInView =
        !rect || (rect.top < window.innerHeight - 50 && rect.bottom > 50);
      setPhase(alreadyInView ? "static" : "animate");
    };
    setup();
    const handler = () => setup();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [eager]);

  // SSR + the first client render before useEffect runs must produce identical
  // HTML to avoid hydration mismatch. Keep it a plain visible div.
  if (phase !== "animate") {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  const offset = directionOffsets[direction];
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: offset.x, y: offset.y }
      }
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
