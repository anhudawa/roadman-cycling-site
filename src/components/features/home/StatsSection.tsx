"use client";

import { ScrollReveal, AnimatedCounter } from "@/components/ui";
import { useMemo, useState, useEffect } from "react";

const stats = [
  { value: "1M+", label: "Monthly Listeners" },
  { value: "2,100+", label: "Community Members" },
  { value: "61K+", label: "YouTube Subscribers" },
  { value: "49K+", label: "Instagram Followers" },
];

/**
 * Stats bar with:
 * - Animated counters that count up on scroll
 * - Subtle dot particle field behind stats
 * - Coral glow text-shadow on numbers
 * - Pulse animation on each stat card
 */
export function StatsSection() {
  return (
    <section className="bg-deep-purple py-12 md:py-16 relative overflow-hidden">
      {/* Dot particle field */}
      <DotField />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} direction="up" delay={i * 0.12}>
              <div className="stat-card-pulse rounded-xl p-4">
                <p className="font-heading text-3xl md:text-5xl text-coral mb-1 stat-glow">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-sm text-foreground-muted">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Grid of subtle dots for depth — pure CSS, no JS overhead */
function DotField() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use seeded positions to avoid hydration mismatch from Math.random()
  const dots = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${(i % 10) * 10 + Math.random() * 8}%`,
      top: `${Math.floor(i / 10) * 25 + Math.random() * 20}%`,
      opacity: 0.05 + Math.random() * 0.08,
      size: 1 + Math.random() * 2,
      delay: `${Math.random() * 4}s`,
    }));
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-coral"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            animation: `stat-pulse 3s ease-in-out ${d.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
