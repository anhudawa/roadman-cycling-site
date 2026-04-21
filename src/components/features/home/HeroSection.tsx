"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { Button } from "@/components/ui";
import { GlitchHero } from "./GlitchHero";
import { PodcastHero } from "./PodcastHero";
import type { EpisodeMeta } from "@/lib/podcast";

interface HeroSectionProps {
  latestEpisode: EpisodeMeta | null;
}

/**
 * Homepage hero — Direction 3 "Hero Crop" on desktop.
 *
 * Mobile (`<md`): untouched — `PodcastHero` leads with podcast
 * waveform + latest-episode strip + APPLY as primary.
 *
 * Tablet (`md` / 768–1023): single column, 4-line flush-left
 * headline above the glitch portrait block.
 *
 * Desktop (`lg+` / ≥1024): 2-column split. 4-line headline and
 * CTAs anchor the LEFT rail; hard-edged glitch portrait sits on
 * the RIGHT rail at ≤640px (well below the 801×801 source so the
 * glitch shards stay proportionally loud). Portrait has a soft
 * bottom mask fade so it dissolves into the section's deep-purple
 * background — no hard rectangle edge.
 *
 * Headline copy is verbatim "CYCLING IS HARD, OUR COACHING WILL
 * HELP." broken across 4 lines as:
 *   CYCLING
 *   IS HARD,
 *   OUR COACHING
 *   WILL HELP.
 * The line breaks are a visual composition choice — if the
 * headline ever changes, the line structure has to be rebalanced
 * by hand. Do not auto-wrap.
 */
export function HeroSection({ latestEpisode }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  // Gentle parallax on the portrait only — text stays put.
  // Hero does NOT fade out; StatsSection scrolls in over it.
  const portraitY = useTransform(smoothProgress, [0, 1], [0, 80]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setScrolled(v > 0.05);
  });

  const headlineLines = [
    { text: "CYCLING", accent: false },
    { text: "IS HARD,", accent: false },
    { text: "OUR COACHING", accent: false },
    { text: "WILL HELP.", accent: true },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: "#1d0838" }}
    >
      {/* Top-edge coral seam */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-coral/70 to-transparent"
      />

      {/* ─── MOBILE: podcast-first hero (unchanged) ───────── */}
      <div className="md:hidden relative z-10 flex flex-col items-center px-5 pt-[calc(5rem+var(--cohort-banner-height,0px))] pb-12">
        <PodcastHero
          episode={latestEpisode}
          ctaHref="/apply"
          ctaLabel="Apply for coaching"
        />
      </div>

      {/* ─── TABLET + DESKTOP: "Hero Crop" ──────────────────
          md (768-1023): single column — headline above portrait.
          lg+ (1024+):  2-col split — text left, portrait right. */}
      <div className="hidden md:block relative z-10 pt-[calc(6rem+var(--cohort-banner-height,0px))] pb-24">
        <div className="mx-auto max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* ── LEFT RAIL: eyebrow + headline + CTAs ──────── */}
          <div className="lg:col-span-5 text-center lg:text-left lg:pt-8">
            <motion.p
              className="font-body text-xs tracking-[0.3em] uppercase mb-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href="/podcast"
                className="text-off-white/50 hover:text-off-white transition-colors"
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track="home_hero_eyebrow_podcast"
              >
                PODCAST
              </Link>
              <span className="inline-block mx-2 text-off-white/30">·</span>
              <Link
                href="/coaching"
                className="text-coral/85 hover:text-coral transition-colors"
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track="home_hero_eyebrow_coaching"
              >
                COACHING
              </Link>
            </motion.p>

            <h1
              className="font-heading text-off-white mb-8"
              style={{
                fontSize: "clamp(3.5rem, 8vw, 7rem)",
                lineHeight: 0.88,
                letterSpacing: "-0.025em",
                textShadow: "0 4px 30px rgba(0,0,0,0.55)",
              }}
            >
              {headlineLines.map((line, i) => (
                <motion.span
                  key={line.text}
                  className={line.accent ? "text-coral block" : "block"}
                  style={line.accent ? { fontSize: "0.88em" } : undefined}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.85,
                    delay: 0.15 + i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {line.text}
                </motion.span>
              ))}
            </h1>

            {/* 24px coral hairline — the only decorative element */}
            <motion.div
              aria-hidden="true"
              className="w-6 h-px bg-coral mx-auto lg:mx-0 mb-7"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: "left" }}
            />

            <motion.div
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.65,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Button
                href="/apply"
                size="lg"
                className="shadow-[0_12px_40px_-8px_rgba(241,99,99,0.55)] hover:shadow-[0_16px_50px_-6px_rgba(241,99,99,0.7)] transition-shadow"
                dataTrack="home_hero_apply"
              >
                Apply →
              </Button>
              <Link
                href={latestEpisode ? `/podcast/${latestEpisode.slug}` : "/podcast"}
                className="font-heading text-sm tracking-[0.18em] uppercase text-off-white/75 hover:text-coral transition-colors py-3"
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track="home_hero_listen"
              >
                listen <span aria-hidden="true">→</span>
              </Link>
            </motion.div>

            <motion.p
              className="mt-10 text-[11px] tracking-[0.18em] uppercase text-off-white/45"
              style={{
                fontFamily:
                  "var(--font-jetbrains-mono), ui-monospace, monospace",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <span>1M listeners</span>
              <span className="mx-2 opacity-50">·</span>
              <span>65K newsletter</span>
              <span className="mx-2 opacity-50">·</span>
              <span>1300+ episodes</span>
            </motion.p>
          </div>

          {/* ── RIGHT RAIL: glitch portrait ─────────────────
              lg: cols 7–12 (skip col 6 gutter). md: stacks below. */}
          <motion.div
            className="lg:col-start-7 lg:col-span-6 w-full flex justify-center lg:justify-end"
            style={{ y: portraitY }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlitchHero />
          </motion.div>
        </div>
      </div>

      {/* Animated scroll indicator — desktop only */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 0 : 0.55 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <span className="text-[10px] text-foreground-muted tracking-[0.25em] uppercase font-body">
          Scroll
        </span>
        <motion.div
          className="w-[1px] h-8 bg-gradient-to-b from-coral to-transparent"
          animate={{ scaleY: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
