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
 * Homepage hero.
 *
 * Mobile (`<md`): podcast-first layout — headline + animated
 * waveform + latest-episode strip + "PLAY LATEST EPISODE" as
 * the primary coral CTA. Lead with the product 1M listeners/
 * month actually consume; APPLY is a quiet secondary link.
 *
 * Desktop (`md+`): glitch portrait hero. Portrait is now
 * hard-rectangle (no rounded corners, no shadow, no ambient
 * blobs) — the glitch is the brand, stop dressing it up. CTA
 * hierarchy flipped so APPLY (the paid funnel) gets the solid
 * coral button and Listen is secondary.
 *
 * Gentle parallax on the portrait (down) + fade on the text
 * block (away) gives the hero a cinematic exit on desktop.
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

  const textY = useTransform(smoothProgress, [0, 0.5], [0, -60]);
  const textOpacity = useTransform(smoothProgress, [0, 0.6], [1, 0]);
  const portraitY = useTransform(smoothProgress, [0, 1], [0, 140]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setScrolled(v > 0.05);
  });

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

      {/* ─── MOBILE: podcast-first hero ───────────────────── */}
      <div className="md:hidden relative z-10 flex flex-col items-center px-5 pt-[calc(5rem+var(--cohort-banner-height,0px))] pb-12">
        <PodcastHero
          episode={latestEpisode}
          ctaHref="/apply"
          ctaLabel="Apply for coaching"
        />
      </div>

      {/* ─── DESKTOP: glitch portrait hero ────────────────── */}
      <div className="hidden md:flex relative z-10 flex-col items-center px-8 pt-[calc(6rem+var(--cohort-banner-height,0px))] pb-24">
        <motion.p
          className="font-body text-xs tracking-[0.3em] uppercase text-coral/80 mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-off-white/40">PODCAST</span>
          <span className="inline-block mx-2 opacity-40">·</span>
          <span className="text-off-white/40">COMMUNITY</span>
          <span className="inline-block mx-2 opacity-40">·</span>
          <span>COACHING</span>
        </motion.p>

        <motion.div
          className="w-full flex justify-center"
          style={{ y: portraitY }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlitchHero />
        </motion.div>

        <motion.div
          className="text-center max-w-[880px] mx-auto w-full mt-14"
          style={{ y: textY, opacity: textOpacity }}
        >
          <h1
            className="font-heading text-off-white leading-[0.95] mb-6"
            style={{
              fontSize: "var(--text-hero)",
              letterSpacing: "-0.02em",
              textShadow: "0 4px 30px rgba(0,0,0,0.5)",
            }}
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              CYCLING IS HARD,
            </motion.span>
            <motion.span
              className="text-coral block"
              style={{ fontSize: "0.88em" }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              OUR COACHING WILL HELP.
            </motion.span>
          </h1>

          <motion.p
            className="font-body text-off-white/80 max-w-xl mx-auto mb-10 text-lg leading-relaxed"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            The podcast trusted by 1 million monthly listeners. The community
            where serious cyclists stop guessing and start getting faster.
          </motion.p>

          {/* CTA hierarchy: APPLY is the business goal, so it gets
              the solid coral button. Listen is the ghost. */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button
              href="/apply"
              size="lg"
              className="shadow-[0_12px_40px_-8px_rgba(241,99,99,0.55)] hover:shadow-[0_16px_50px_-6px_rgba(241,99,99,0.7)] transition-shadow"
            >
              Apply for Coaching
            </Button>
            <Link
              href={latestEpisode ? `/podcast/${latestEpisode.slug}` : "/podcast"}
              className="font-heading text-sm tracking-[0.18em] uppercase text-off-white/75 hover:text-coral transition-colors py-3 px-2"
              style={{ transitionDuration: "var(--duration-fast)" }}
            >
              Or listen to the podcast <span aria-hidden="true">→</span>
            </Link>
          </motion.div>

          <motion.p
            className="text-xs tracking-[0.18em] uppercase text-off-white/45"
            style={{ fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.95 }}
          >
            <span>1M+ monthly listeners</span>
            <span className="mx-2 opacity-50">·</span>
            <span>29K newsletter</span>
            <span className="mx-2 opacity-50">·</span>
            <span>300+ episodes</span>
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom fade into the StatsSection */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(29,8,56,0.7) 60%, rgb(37,37,38) 100%)",
        }}
      />

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
