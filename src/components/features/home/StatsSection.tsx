"use client";

import { ScrollReveal, AnimatedCounter } from "@/components/ui";

const stats = [
  { value: "1M+", label: "Monthly Listeners" },
  { value: "2,100+", label: "Community Members" },
  { value: "61K+", label: "YouTube Subscribers" },
  { value: "49K+", label: "Instagram Followers" },
];

/**
 * Stats bar with:
 * - Animated counters that count up on scroll
 * - CSS radial-gradient dot field (replaces 40 individual DOM nodes)
 * - Coral glow text-shadow on numbers
 * - Pulse animation on each stat card
 */
export function StatsSection() {
  return (
    <section className="bg-deep-purple py-12 md:py-16 relative overflow-hidden">
      {/* Dot field $€” single div with CSS radial-gradient pattern, zero JS overhead */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-coral) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} direction="up" delay={i * 0.12} eager>
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
