"use client";

import React from "react";
import { motion } from "framer-motion";
import { type ContentPillar } from "@/types";

interface PillarIconProps {
  pillar: ContentPillar;
  color: string;
  className?: string;
}

/**
 * Animated SVG icons for each content pillar.
 * Draw-on animation when they enter the viewport.
 */
export function PillarIcon({ pillar, color, className = "" }: PillarIconProps) {
  const strokeProps = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  const drawTransition = {
    duration: 1,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  const icons: Record<ContentPillar, React.ReactNode> = {
    coaching: (
      // Power meter / crank
      <svg viewBox="0 0 40 40" className={className}>
        <motion.circle cx="20" cy="20" r="14" {...strokeProps} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={drawTransition} />
        <motion.line x1="20" y1="20" x2="20" y2="8" {...strokeProps} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.3 }} />
        <motion.line x1="20" y1="20" x2="30" y2="26" {...strokeProps} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.5 }} />
        <motion.circle cx="20" cy="20" r="3" fill={color} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.7, type: "spring" }} />
      </svg>
    ),
    nutrition: (
      // Water bottle / bidon
      <svg viewBox="0 0 40 40" className={className}>
        <motion.path d="M 14 10 L 14 6 L 26 6 L 26 10" {...strokeProps} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={drawTransition} />
        <motion.path d="M 12 10 L 12 32 Q 12 36 16 36 L 24 36 Q 28 36 28 32 L 28 10 Z" {...strokeProps} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.2 }} />
        <motion.path d="M 14 22 Q 17 20 20 22 Q 23 24 26 22" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.5 }} />
      </svg>
    ),
    strength: (
      // Dumbbell
      <svg viewBox="0 0 40 40" className={className}>
        <motion.line x1="8" y1="20" x2="32" y2="20" {...strokeProps} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={drawTransition} />
        <motion.rect x="6" y="13" width="6" height="14" rx="2" {...strokeProps} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.3 }} />
        <motion.rect x="28" y="13" width="6" height="14" rx="2" {...strokeProps} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.3 }} />
      </svg>
    ),
    recovery: (
      // Moon / sleep
      <svg viewBox="0 0 40 40" className={className}>
        <motion.path d="M 28 12 Q 20 14 16 20 Q 12 26 16 32 Q 20 38 28 36 Q 22 34 20 28 Q 18 22 22 16 Q 24 13 28 12 Z" {...strokeProps} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={drawTransition} />
        <motion.circle cx="28" cy="10" r="1.5" fill={color} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6, type: "spring" }} />
        <motion.circle cx="32" cy="16" r="1" fill={color} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, type: "spring" }} />
      </svg>
    ),
    "le-metier": (
      // Road / path
      <svg viewBox="0 0 40 40" className={className}>
        <motion.path d="M 12 36 Q 14 28 16 22 Q 18 16 20 12 Q 22 8 24 4" {...strokeProps} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={drawTransition} />
        <motion.path d="M 20 36 Q 21 28 22 22 Q 23 16 24 12 Q 25 8 26 4" {...strokeProps} strokeWidth={1} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.2 }} />
        <motion.path d="M 28 36 Q 28 28 28 22 Q 28 16 28 12 Q 28 8 28 4" {...strokeProps} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ ...drawTransition, delay: 0.1 }} />
        <motion.circle cx="20" cy="8" r="2" fill={color} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.7, type: "spring" }} />
      </svg>
    ),
  };

  return icons[pillar] || null;
}
