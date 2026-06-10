"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps the whole /method tree so every framer-motion animation honours
 * the visitor's `prefers-reduced-motion` setting. With `reducedMotion="user"`,
 * framer-motion drops transform/layout movement (the motion that triggers
 * vestibular discomfort) while keeping opacity cross-fades — so the product
 * still feels alive without overriding an accessibility preference.
 *
 * This is the single guard for all motion.* components in Method
 * (CompletionBurst, CompleteToggle, RecentActivity, EmailSentAnimation,
 * WelcomeStaggerIn, the mobile menu). Non-framer animations (Tailwind
 * transitions, CSS `animate-ping`) are guarded per-element with the
 * `motion-reduce:` / `motion-safe:` variants.
 */
export function MethodMotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
