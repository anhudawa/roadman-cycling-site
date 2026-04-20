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
 * Homepage hero. Vertically-stacked layout:
 *   1. Glitch portrait block (square, max 680px, centred)
 *   2. Headline ("CYCLING IS HARD, / OUR COACHING WILL HELP.")
 *   3. Subtext
 *   4. CTAs ("Listen Now" / "Apply for Coaching")
 *
 * On desktop the portrait keeps native-ish quality (≤ its 801×801
 * source) and there's generous deep-purple negative space on the
 * left and right. Text lives strictly BELOW the portrait so the
 * glitching face is never obscured.
 *
 * Hero section background is #1d0838 to match the portrait's
 * baked-in bg — no visible seam at the portrait edge.
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

  // Gentle scroll-driven motion on the copy. No scaling on the
  // glitch itself — it owns its own breathing/glitch animations.
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
      <div className="relative z-10 flex flex-col items-center px-5 md:px-8 pt-24 md:pt-28 pb-20 md:pb-24">
        {/* ─── Glitch portrait block ──────────────────────────── */}
        <motion.div
          className="w-full flex justify-center"
          style={{ y: portraitY }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlitchHero />
        </motion.div>

        {/* ─── Headline + subtext + CTAs, stacked below portrait ── */}
        <motion.div
          className="text-center max-w-[900px] mx-auto w-full mt-12 md:mt-16"
          style={{ y: textY, opacity: textOpacity }}
        >
          <h1
            className="font-heading text-off-white leading-none mb-6"
            style={{
              fontSize: "var(--text-hero)",
              letterSpacing: "-0.02em",
              textShadow: "0 4px 30px rgba(0,0,0,0.4)",
            }}
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.15,
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
                delay: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              OUR COACHING WILL HELP.
            </motion.span>
          </h1>

          <motion.p
            className="font-body text-off-white/80 max-w-2xl mx-auto mb-10 text-lg md:text-xl leading-relaxed"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            The podcast trusted by 1 million monthly listeners. The community
            where serious cyclists stop guessing and start getting faster.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Button href="/podcast" size="lg" className="shadow-lg shadow-coral/25">
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
        </motion.div>
      </div>

      {/* Animated scroll indicator — desktop only */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 0 : 0.6 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <span className="text-xs text-foreground-muted tracking-widest uppercase font-body">
          Scroll
        </span>
        <motion.div
          className="w-[1px] h-10 bg-gradient-to-b from-coral to-transparent"
          animate={{ scaleY: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
