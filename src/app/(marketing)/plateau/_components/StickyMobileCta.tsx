"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Floating bottom CTA shown only on small screens.
 *
 * Visibility rules (cold-traffic UX):
 *  - Hidden until the hero scrolls out of view (sentinel: #plateau-hero)
 *  - Hidden whenever the diagnostic flow is on screen — we don't want
 *    to obscure the Next/Previous buttons inside the quiz
 *  - Hidden when the final CTA is on screen — avoids stacking two
 *    coral buttons on top of each other
 *
 * Pure presentation; routes to the same #start anchor as every other
 * CTA on the page.
 */
export function StickyMobileCta() {
  const [pastHero, setPastHero] = useState(false);
  const [inDiagnostic, setInDiagnostic] = useState(false);
  const [inFinalCta, setInFinalCta] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("plateau-hero");
    const diagnostic = document.getElementById("start");
    const finalCta = document.getElementById("plateau-final-cta");

    const observers: IntersectionObserver[] = [];

    if (hero) {
      const o = new IntersectionObserver(
        ([entry]) => setPastHero(!entry.isIntersecting),
        { threshold: 0, rootMargin: "0px 0px -40% 0px" },
      );
      o.observe(hero);
      observers.push(o);
    } else {
      setPastHero(true);
    }

    if (diagnostic) {
      const o = new IntersectionObserver(
        ([entry]) => setInDiagnostic(entry.isIntersecting),
        { threshold: 0.05 },
      );
      o.observe(diagnostic);
      observers.push(o);
    }

    if (finalCta) {
      const o = new IntersectionObserver(
        ([entry]) => setInFinalCta(entry.isIntersecting),
        { threshold: 0.2 },
      );
      o.observe(finalCta);
      observers.push(o);
    }

    return () => {
      for (const o of observers) o.disconnect();
    };
  }, []);

  const visible = pastHero && !inDiagnostic && !inFinalCta;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="
            lg:hidden fixed inset-x-0 bottom-0 z-40
            px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3
            bg-gradient-to-t from-charcoal via-charcoal/95 to-transparent
            pointer-events-none
          "
        >
          <a
            href="#start"
            data-cta="sticky-mobile"
            className="
              pointer-events-auto block w-full text-center
              font-heading tracking-wider text-lg
              bg-coral hover:bg-coral-hover active:bg-coral-hover
              text-off-white px-6 py-4 rounded-md
              shadow-[0_8px_30px_rgba(241,99,99,0.45)]
              transition-colors
            "
            style={{ transitionDuration: "var(--duration-fast)" }}
          >
            FIND MY PROFILE
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
