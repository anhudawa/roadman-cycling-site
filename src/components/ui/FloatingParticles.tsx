"use client";

import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  className?: string;
}

/**
 * Ambient floating particles — adds depth and atmosphere.
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot mount + media-query subscription
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
    // Deterministic per-index pseudo-random — keeps visual variety while
    // staying pure (Math.random() in render trips react-hooks/purity and
    // would also risk hydration mismatch on a fast client→server round trip).
    const rng = (i: number, salt: number) => {
      const x = Math.sin(i * 9999 + salt) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: effectiveCount }, (_, i) => ({
      id: i,
      x: rng(i, 1) * 100,
      y: rng(i, 2) * 100,
      size: rng(i, 3) * 3 + 1,
      duration: rng(i, 4) * 20 + 15,
      delay: rng(i, 5) * 10,
      driftX: (rng(i, 6) - 0.5) * 60,
      driftY: -(rng(i, 7) * 40 + 20),
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
