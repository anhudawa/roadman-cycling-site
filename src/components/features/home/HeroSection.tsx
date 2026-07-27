"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { GlitchHero } from "./GlitchHero";

/**
 * Homepage hero — coaching-first redesign.
 *
 * One message above the fold: Not Done Yet coaching is the primary offer.
 * The podcast is proof, not the product — that positioning lives in the
 * Proof Engine section further down the page.
 *
 * Structure:
 *   Eyebrow → massive "YOU'RE NOT DONE YET." headline → value-prop
 *   subheadline → dual CTAs (Apply / Diagnostic) → social proof strip
 *   → scroll indicator.
 *
 * Anthony's glitch portrait stays as the visual anchor. Dark charcoal /
 * deep purple background. Coral #F16363 for the primary CTA.
 *
 * Mobile:  single column, portrait above text.
 * Desktop: 2-column — text left (cols 1-6), portrait right (cols 7-12).
 */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const traveled = -rect.top;
      const distance = rect.height || 1;
      setScrolled(traveled / distance > 0.05);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-deep-purple min-h-screen flex items-center"
    >
      {/* Top-edge coral seam */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-coral/70 to-transparent"
      />

      <div className="relative z-10 pt-[calc(5rem+var(--cohort-banner-height,0px))] md:pt-[calc(6rem+var(--cohort-banner-height,0px))] pb-16 md:pb-24 w-full">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* ── GLITCH PORTRAIT ──────────────────────────────
              DOM-first so it loads first on mobile. On lg+ it's
              placed in cols 7-12 on the right rail. */}
          <div className="lg:col-start-7 lg:col-span-6 lg:row-start-1 w-full flex justify-center lg:justify-end">
            <GlitchHero />
          </div>

          {/* ── TEXT RAIL ── */}
          <div className="lg:col-start-1 lg:col-span-6 lg:row-start-1 text-center lg:text-left lg:pt-4">
            {/* Eyebrow */}
            <motion.p
              className="font-heading text-[11px] md:text-xs tracking-[0.3em] uppercase text-off-white/50 mb-6 md:mb-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              THE COACHING COMMUNITY FOR SERIOUS CYCLISTS
            </motion.p>

            {/* Headline */}
            <h1
              className="font-heading text-off-white mb-6 md:mb-8"
              style={{
                fontSize: "clamp(3rem, 9vw, 7.5rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.025em",
                textShadow: "0 4px 30px rgba(0,0,0,0.55)",
              }}
            >
              {[
                { text: "YOU'RE", accent: false },
                { text: "NOT DONE", accent: false },
                { text: "YET.", accent: true },
              ].map((line, i) => (
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

            {/* Coral hairline */}
            <motion.div
              aria-hidden="true"
              className="w-8 h-px bg-coral mx-auto lg:mx-0 mb-6 md:mb-7"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: "left" }}
            />

            {/* Subheadline */}
            <motion.p
              className="text-foreground-muted text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8 md:mb-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              The five-pillar coaching system built on 100M+ podcast downloads
              and conversations with the coaches behind Grand Tour wins.
              For cyclists 35–55 who refuse to plateau.
            </motion.p>

            {/* Dual CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 sm:gap-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Button
                href="/apply"
                className="shadow-[0_12px_40px_-8px_rgba(241,99,99,0.55)] hover:shadow-[0_16px_50px_-6px_rgba(241,99,99,0.7)] transition-shadow"
                dataTrack="home_hero_apply"
              >
                Apply for Coaching
              </Button>
              <Button
                href="/plateau"
                variant="ghost"
                dataTrack="home_hero_plateau"
              >
                Take the Diagnostic
              </Button>
            </motion.div>

            {/* Social proof strip */}
            <motion.p
              className="mt-8 md:mt-10 text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-off-white/55"
              style={{
                fontFamily:
                  "var(--font-jetbrains-mono), ui-monospace, monospace",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.95 }}
            >
              <span>113 coached athletes</span>
              <span className="mx-2 opacity-50">&middot;</span>
              <span>Cat 3→Cat 1 results</span>
              <span className="mx-2 opacity-50">&middot;</span>
              <span>$195/month</span>
            </motion.p>
          </div>
        </div>
      </div>

      {/* Scroll indicator — md+ only */}
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
