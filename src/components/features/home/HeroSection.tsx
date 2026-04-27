"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { Button } from "@/components/ui";
import type { EpisodeMeta } from "@/lib/podcast";

interface HeroSectionProps {
  latestEpisode: EpisodeMeta | null;
}

const HERO_MASK =
  "linear-gradient(to bottom, #000 0%, #000 78%, transparent 100%)";

/**
 * Homepage hero — Direction 3 "Hero Crop", unified across all viewports.
 *
 * Mobile (`<md`):    single column. Cycling image first (visual anchor),
 *                    then eyebrow, 4-line headline, coral hairline, CTAs,
 *                    proof line.
 * Tablet (`md`):     single column (same stack as mobile, larger type).
 * Desktop (`lg+`):   2-column split — text in cols 1-5, image in cols
 *                    7-12.
 *
 * Image renders inside a square frame hard-capped at 640px (72vmin <md,
 * 88vmin md+). A soft bottom mask fade dissolves it into the section's
 * deep-purple background.
 *
 * Headline copy is verbatim "CYCLING IS HARD, OUR COACHING WILL HELP."
 * broken across 4 lines as CYCLING / IS HARD, / OUR COACHING / WILL
 * HELP. Line breaks are hand-tuned — if the copy changes, rebalance
 * manually. Do not auto-wrap.
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
      className="relative overflow-hidden bg-deep-purple"
    >
      {/* Top-edge coral seam */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-coral/70 to-transparent"
      />

      <div className="relative z-10 pt-[calc(5rem+var(--cohort-banner-height,0px))] md:pt-[calc(6rem+var(--cohort-banner-height,0px))] pb-16 md:pb-24">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* ── HERO IMAGE ──────────────────────────────────
              DOM-first so it shows first on mobile (visual anchor).
              On lg+ it's placed in cols 7-12 and pinned to row 1 so
              it sits on the right rail with the text on the left.
              LCP element on mobile and a major LCP element on desktop —
              avoid initial opacity:0 (would delay LCP until JS runs). */}
          <motion.div
            className="lg:col-start-7 lg:col-span-6 lg:row-start-1 w-full flex justify-center lg:justify-end"
            style={{ y: portraitY }}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="relative w-[min(72vmin,520px)] md:w-[min(88vmin,640px)] aspect-square overflow-hidden rounded-lg bg-deep-purple"
              style={{
                maskImage: HERO_MASK,
                WebkitMaskImage: HERO_MASK,
              }}
            >
              <Image
                src="/images/cycling/gravel-road-climb.jpg"
                alt="Two cyclists climbing a winding gravel road"
                fill
                preload
                sizes="(max-width: 768px) 80vw, 640px"
                className="object-cover"
                style={{ objectPosition: "center 40%" }}
              />
            </div>
          </motion.div>

          {/* ── TEXT RAIL: eyebrow / headline / hairline / CTAs / proof ── */}
          <div className="lg:col-start-1 lg:col-span-5 lg:row-start-1 text-center lg:text-left lg:pt-8">
            <motion.p
              className="font-body text-[11px] md:text-xs tracking-[0.3em] uppercase mb-6 md:mb-8"
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
              className="font-heading text-off-white mb-6 md:mb-8"
              style={{
                fontSize: "clamp(2.75rem, 8vw, 7rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.025em",
                textShadow: "0 4px 30px rgba(0,0,0,0.55)",
              }}
            >
              {/* Headline is a strong LCP candidate — render visible from SSR.
                  Keep the slide-in via translate only; no opacity gate. */}
              {headlineLines.map((line, i) => (
                <motion.span
                  key={line.text}
                  className={line.accent ? "text-coral block" : "block"}
                  style={
                    line.accent
                      ? { letterSpacing: "-0.03em" }
                      : undefined
                  }
                  initial={{ y: 24 }}
                  animate={{ y: 0 }}
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

            <motion.div
              aria-hidden="true"
              className="w-6 h-px bg-coral mx-auto lg:mx-0 mb-6 md:mb-7"
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
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-6 sm:gap-5"
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
                className="w-full sm:w-auto shadow-[0_12px_40px_-8px_rgba(241,99,99,0.55)] hover:shadow-[0_16px_50px_-6px_rgba(241,99,99,0.7)] transition-shadow"
                dataTrack="home_hero_apply"
              >
                Apply →
              </Button>
              <Link
                href={latestEpisode ? `/podcast/${latestEpisode.slug}` : "/podcast"}
                className="font-heading text-sm tracking-[0.18em] uppercase text-off-white/75 hover:text-coral hover:underline underline-offset-4 transition-colors py-3"
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track="home_hero_listen"
              >
                listen <span aria-hidden="true">→</span>
              </Link>
            </motion.div>

            <motion.p
              className="mt-8 md:mt-10 text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-off-white/65"
              style={{
                fontFamily:
                  "var(--font-jetbrains-mono), ui-monospace, monospace",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <span>1M monthly listeners</span>
              <span className="mx-2 opacity-50">·</span>
              <span>65K newsletter</span>
              <span className="mx-2 opacity-50">·</span>
              <span>1,400+ episodes</span>
            </motion.p>
          </div>
        </div>
      </div>

      {/* Animated scroll indicator — md+ only */}
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
