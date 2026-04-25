"use client";

import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  className?: string;
}

/**
 * Ambient floating particles $€” adds depth and atmosphere.
 * Pure CSS/Framer Motion, no canvas. Lightweight.
 *
 * Performance-safe:
 *  - Renders nothing before mount (avoids hydration mismatch from random)
 *  - Reduces to 8 particles on mobile (FPS-friendly)
 *  - Renders nothing when prefers-reduced-motion is set
 */
export function FloatingParticles({
  count = 20,
  color = "rgba(241, 99, 99, 0.15)",
  className = "",
}: FloatingParticlesProps) {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Reduce particle count on mobile/low-power devices to improve FPS
  const effectiveCount = typeof window !== "undefined" && window.innerWidth < 768
    ? Math.min(count, 8)
    : count;

  const particles = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: effectiveCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      driftX: (Math.random() - 0.5) * 60,
      driftY: -(Math.random() * 40 + 20),
    }));
  }, [effectiveCount, mounted]);

  if (!mounted || reducedMotion) {
    return (
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
          }}
          animate={{
            y: [0, p.driftY, 0],
            x: [0, p.driftX, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
