"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface WelcomeStaggerInProps {
  children: ReactNode;
  delay?: number;
}

/**
 * Thin framer-motion wrapper that fades + lifts its child on mount.
 * Composed by stacking siblings on the welcome page so blocks reveal
 * one after the other rather than all at once.
 */
export function WelcomeStaggerIn({ children, delay = 0 }: WelcomeStaggerInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
