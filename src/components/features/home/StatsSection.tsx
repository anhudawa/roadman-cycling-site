"use client";

import { ScrollReveal, AnimatedCounter } from "@/components/ui";

const stats = [
  { value: "100M+", label: "Podcast Downloads" },
  { value: "1,852", label: "Community Members" },
  { value: "61K+", label: "YouTube Subscribers" },
  { value: "49K+", label: "Instagram Followers" },
];

export function StatsSection() {
  return (
    <section className="bg-deep-purple py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} direction="up" delay={i * 0.1}>
              <p className="font-heading text-3xl md:text-5xl text-coral mb-1">
                <AnimatedCounter value={stat.value} />
              </p>
              <p className="text-sm text-foreground-muted">{stat.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
