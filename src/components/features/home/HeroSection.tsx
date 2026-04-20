"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { Button } from "@/components/ui";
import { GlitchHero } from "./GlitchHero";
import { useState } from "react";

/**
 * Homepage hero. Vertically-stacked composition:
 *
 *   [ brand eyebrow ]
 *   [ glitch portrait — 680px square, centred ]
 *   [ headline ]
 *   [ subtext ]
 *   [ primary + ghost CTAs ]
 *   [ quiet proof line ]
 *
 * On desktop the portrait stays below its native 801×801 source so
 * quality is preserved, with deep-purple negative space on the
 * left and right. Text never overlaps the face. Section background
 * is #1d0838 to match the portrait's baked-in background so the
 * neg space is seamless at the portrait edge.
 *
 * Gentle parallax on the portrait (down) + fade on the text block
 * (away) gives the hero a cinematic exit as the user scrolls into
 * the stats/pillar sections below.
 */
export function HeroSection() {
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
      {/* Top-edge coral seam — tiny accent that ties the hero to the
          Roadman brand palette and catches the eye on first paint */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-coral/70 to-transparent"
      />

      {/* Soft ambient blobs left + right to break up the flat
          negative space on wide desktops. Purely decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[20%] left-[-10%] w-[520px] h-[520px] rounded-full blur-[120px] opacity-40"
        style={{ background: "radial-gradient(circle, rgba(178,123,240,0.35) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[15%] right-[-10%] w-[480px] h-[480px] rounded-full blur-[120px] opacity-35"
        style={{ background: "radial-gradient(circle, rgba(255,61,90,0.3) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 flex flex-col items-center px-5 md:px-8 pt-[calc(5rem+var(--cohort-banner-height,0px))] md:pt-[calc(6rem+var(--cohort-banner-height,0px))] pb-10 md:pb-24">
        {/* ─── Brand eyebrow ─────────────────────────────────────
            Tiny, tracked-out signature. Anchors the brand before
            the visitor has visually parsed the glitch block.
            Hidden on mobile — the words ("PODCAST · COMMUNITY ·
            COACHING") look like nav items leaking out of the
            hamburger menu when the eyebrow floats alone in a
            mobile viewport. */}
        <motion.p
          className="hidden md:block font-body text-[11px] md:text-xs tracking-[0.3em] uppercase text-coral/80 mb-6 md:mb-8"
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

        {/* ─── Glitch portrait block ────────────────────────── */}
        <motion.div
          className="w-full flex justify-center"
          style={{ y: portraitY }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlitchHero />
        </motion.div>

        {/* ─── Text block ─────────────────────────────────────
            Small negative gap on mobile so the headline sits
            in the portrait's faded bottom band (clear of the
            face) and the primary CTA stays above the fold. */}
        <motion.div
          className="text-center max-w-[880px] mx-auto w-full -mt-4 md:mt-14"
          style={{ y: textY, opacity: textOpacity }}
        >
          <h1
            className="font-heading text-off-white leading-[0.95] mb-5 md:mb-6"
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
              transition={{
                duration: 0.9,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              CYCLING IS HARD,
            </motion.span>
            <motion.span
              className="text-coral block"
              style={{ fontSize: "0.88em" }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.38,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              OUR COACHING WILL HELP.
            </motion.span>
          </h1>

          <motion.p
            className="font-body text-off-white/80 max-w-xl mx-auto mb-6 md:mb-10 text-base md:text-lg leading-relaxed"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            The podcast trusted by 1 million monthly listeners. The community
            where serious cyclists stop guessing and start getting faster.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-5 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.72,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Button
              href="/podcast"
              size="lg"
              className="shadow-[0_12px_40px_-8px_rgba(241,99,99,0.55)] hover:shadow-[0_16px_50px_-6px_rgba(241,99,99,0.7)] transition-shadow"
            >
              Listen Now
            </Button>
            <Button
              href="/apply"
              variant="ghost"
              size="lg"
              className="border-white/40 backdrop-blur-sm shadow-lg shadow-black/20"
            >
              Apply for Coaching
            </Button>
          </motion.div>

          {/* ─── Quiet proof line ───────────────────────────
              Small trust signals under the CTAs. Uses JetBrains
              Mono so it reads as metadata / data, not marketing. */}
          <motion.p
            className="text-[11px] md:text-xs tracking-[0.18em] uppercase text-off-white/45"
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

      {/* Bottom fade — smooths the transition into the StatsSection
          below so the hero doesn't feel like a hard-edged box. */}
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
