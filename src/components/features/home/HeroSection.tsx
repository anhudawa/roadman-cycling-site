"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { useState } from "react";

/**
 * Cinematic hero with:
 * - Aurora / northern-lights gradient that slowly shifts
 * - Scroll-driven text scaling (shrinks as you scroll)
 * - Parallax depth layers
 * - Clip-path text reveal on load
 */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Spring-smoothed progress for buttery feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  // Scroll-driven transforms
  const textScale = useTransform(smoothProgress, [0, 0.5], [1, 0.7]);
  const textY = useTransform(smoothProgress, [0, 0.5], [0, -80]);
  const textOpacity = useTransform(smoothProgress, [0, 0.6], [1, 0]);
  const bgY = useTransform(smoothProgress, [0, 1], [0, 200]);
  const auroraY = useTransform(smoothProgress, [0, 1], [0, 100]);
  const overlayOpacity = useTransform(smoothProgress, [0, 0.5], [0.5, 0.9]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setScrolled(v > 0.05);
  });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen md:min-h-[120vh] flex items-start justify-center overflow-hidden"
    >
      {/* === LAYER 1: Deep background with parallax === */}
      <motion.div className="absolute inset-0 bg-charcoal" style={{ y: bgY }}>
        {/* Hero portrait background */}
        <Image
          src="/images/about/anthony-podcast-promo.jpg"
          alt=""
          fill
          className="object-cover opacity-40"
          style={{ objectPosition: "center 80%" }}
          sizes="100vw"
          priority
        />
        {/* Radial vignette to blend edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,transparent_20%,rgba(37,37,38,0.85)_70%,rgb(37,37,38)_100%)]" />
        {/* Grain texture */}
        <div className="absolute inset-0 grain-overlay" />
      </motion.div>

      {/* === LAYER 2: Aurora / northern-lights effect === */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: auroraY }}
        aria-hidden="true"
      >
        {/* Primary aurora band */}
        <div className="absolute inset-0 aurora-container">
          <div className="aurora-band aurora-band-1" />
          <div className="aurora-band aurora-band-2" />
          <div className="aurora-band aurora-band-3" />
        </div>
      </motion.div>

      {/* === LAYER 3: Gradient overlay (darkens on scroll) === */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-deep-purple/50 via-charcoal/70 to-charcoal"
        style={{ opacity: overlayOpacity }}
      />

      {/* === LAYER 4: Floating particles (two layers for depth) === */}
      <FloatingParticles count={25} color="rgba(241, 99, 99, 0.12)" />
      <FloatingParticles count={10} color="rgba(76, 18, 115, 0.15)" />

      {/* === LAYER 5: Content with scroll-driven scaling === */}
      <motion.div
        className="relative z-10 text-center px-5 md:px-8 max-w-[1200px] mx-auto w-full pt-[35vh] md:pt-[30vh]"
        style={{
          scale: textScale,
          y: textY,
          opacity: textOpacity,
        }}
      >
        {/* Headline with clip-path reveal */}
        <motion.h1
          className="font-heading text-off-white leading-none mb-6"
          style={{
            fontSize: "var(--text-hero)",
            letterSpacing: "-0.02em",
            textShadow: "0 4px 30px rgba(0,0,0,0.4)",
          }}
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
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
        </motion.h1>

        <motion.p
          className="font-body text-foreground-muted max-w-2xl mx-auto mb-10 text-lg md:text-xl leading-relaxed"
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
          <Button href="/podcast" size="lg">
            Listen Now
          </Button>
          <Button href="/community/clubhouse" variant="ghost" size="lg">
            Join Free
          </Button>
        </motion.div>
      </motion.div>

      {/* === Animated scroll indicator === */}
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
