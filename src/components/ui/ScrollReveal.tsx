"use client";

import { useRef, useEffect } from "react";
import { motion, useInView, useAnimationControls } from "framer-motion";
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
   * Skip the reveal animation entirely and keep content permanently visible.
   * Use for hero/brand content that should never animate.
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
 * SSR renders a plain visible motion.div (no inline opacity styles) so
 * Googlebot and no-JS users see fully rendered HTML. After hydration we
 * check whether the element is already in the viewport:
 *   - in view  → leave it visible, no animation
 *   - below fold → controls.set() immediately hides it, then controls.start()
 *                  animates it in when the IntersectionObserver fires
 *
 * We always render motion.div (never swap to a plain div). Swapping element
 * types after hydration detaches the element that the IntersectionObserver
 * is watching, causing isInView to never fire.
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
  const controls = useAnimationControls();
  const isInView = useInView(ref, { once, margin: "-50px" });
  const offset = directionOffsets[direction];

  // On mount: immediately hide below-fold content so it can animate in on
  // scroll. controls.set() applies synchronously with no transition, avoiding
  // the one-frame flash that animate would cause.
  useEffect(() => {
    if (eager) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setup = () => {
      if (mq.matches) {
        controls.set({ opacity: 1, x: 0, y: 0 });
        return;
      }
      const rect = ref.current?.getBoundingClientRect();
      const alreadyVisible =
        !rect || (rect.top < window.innerHeight - 50 && rect.bottom > 50);
      if (!alreadyVisible) {
        controls.set({ opacity: 0, x: offset.x, y: offset.y });
      }
    };
    setup();
    mq.addEventListener("change", setup);
    return () => mq.removeEventListener("change", setup);
  }, [eager, controls, offset.x, offset.y]);

  // Animate in when the element enters the viewport.
  useEffect(() => {
    if (eager) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    if (isInView) {
      controls.start({
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
      });
    } else if (!once) {
      // For repeating reveals: snap back to hidden when scrolled past.
      controls.set({ opacity: 0, x: offset.x, y: offset.y });
    }
  }, [isInView, eager, controls, duration, delay, once, offset.x, offset.y]);

  return (
    <motion.div ref={ref} animate={controls} className={className}>
      {children}
    </motion.div>
  );
}
