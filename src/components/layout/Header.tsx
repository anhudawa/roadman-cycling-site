"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useMotionValueEvent } from "framer-motion";
import { NAV_ITEMS } from "@/types";
import { Container } from "./Container";
import { SearchTrigger } from "@/components/features/search/SearchTrigger";

/**
 * Pages where we show APPLY (high-intent CTA) instead of JOIN FREE
 * in the header. These are revenue-adjacent pages where leakage to the
 * free community is costing conversions.
 *
 * The homepage is included — it's the site's highest-traffic surface
 * and the podcast-first hero already routes curious listeners via
 * PLAY LATEST EPISODE, so the header CTA is reserved for the paid
 * funnel.
 */
const REVENUE_PATH_PREFIXES = [
  "/coaching",
  "/apply",
  "/about",
  "/community/not-done-yet",
];

function shouldShowApplyCta(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/") return true;
  return REVENUE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

/**
 * Header with:
 * - Scroll progress indicator (thin coral gradient at top)
 * - Staggered dropdown animations
 * - Animated underline on active/hover
 * - Dramatic mobile menu with staggered reveals
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const showApply = shouldShowApplyCta(pathname);
  const ctaHref = showApply ? "/apply" : "/community/clubhouse";
  const ctaLabel = showApply ? "APPLY" : "JOIN FREE";
  const ctaLabelMobile = showApply ? "APPLY NOW" : "JOIN THE CLUBHOUSE";

  // Scroll progress — single listener for both progress bar and header style
  const { scrollY, scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <SearchTrigger />
      {/* Scroll progress bar */}
      <motion.div
        className="scroll-progress-bar"
        style={{ width: progressWidth }}
      />

      <header
        className={`
          fixed left-0 right-0 z-50 transition-all
          ${
            isScrolled
              ? "bg-charcoal/95 backdrop-blur-md border-b border-white/5 py-3"
              : "bg-transparent py-5"
          }
        `}
        style={{
          transitionDuration: "var(--duration-normal)",
          top: "var(--cohort-banner-height, 0px)",
        }}
      >
        <Container>
          <nav aria-label="Main navigation" className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="relative z-10 flex items-center gap-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Image
                src="/images/logo-white.png"
                alt="Roadman Cycling"
                width={763}
                height={345}
                className="max-w-none h-10 md:h-14 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className="relative font-body text-sm text-foreground-muted hover:text-off-white transition-colors"
                    style={{ transitionDuration: "var(--duration-fast)" }}
                  >
                    {item.label}
                    {item.children && (
                      <span className="ml-1 text-xs opacity-50" aria-hidden="true">&#9662;</span>
                    )}
                    {/* Animated underline */}
                    <span className="absolute bottom-[-4px] left-0 h-[1.5px] w-0 group-hover:w-full bg-gradient-to-r from-coral to-coral/50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                  </Link>
                  {item.children && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all" style={{ transitionDuration: "var(--duration-normal)" }}>
                      <motion.div
                        className="bg-charcoal/95 backdrop-blur-md border border-white/10 rounded-lg p-2 min-w-[200px] shadow-[var(--shadow-elevated)]"
                        initial="hidden"
                        whileInView="visible"
                        variants={{
                          hidden: {},
                          visible: {
                            transition: { staggerChildren: 0.04 },
                          },
                        }}
                      >
                        {item.children.map((child) => (
                          <motion.div
                            key={child.href}
                            variants={{
                              hidden: { opacity: 0, x: -8 },
                              visible: {
                                opacity: 1,
                                x: 0,
                                transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                              },
                            }}
                          >
                            <Link
                              href={child.href}
                              className="block px-3 py-2 text-sm text-foreground-muted hover:text-off-white hover:bg-white/5 rounded-md transition-colors"
                              style={{ transitionDuration: "var(--duration-fast)" }}
                            >
                              {child.label}
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/search"
                className="relative text-foreground-muted hover:text-off-white transition-colors p-2"
                style={{ transitionDuration: "var(--duration-fast)" }}
                aria-label="Search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </Link>
              <Link
                href={ctaHref}
                className="
                  font-heading text-sm tracking-wider
                  bg-coral hover:bg-coral-hover
                  text-off-white px-6 py-2.5 rounded-md
                  transition-all hover:shadow-[var(--shadow-glow-coral)]
                "
                style={{ transitionDuration: "var(--duration-fast)" }}
              >
                {ctaLabel}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden relative z-10 w-10 h-10 flex flex-col items-center justify-center gap-1.5"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <motion.span
                className="block w-6 h-0.5 bg-off-white"
                animate={{
                  rotate: isMobileMenuOpen ? 45 : 0,
                  y: isMobileMenuOpen ? 4 : 0,
                }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.span
                className="block w-6 h-0.5 bg-off-white"
                animate={{
                  opacity: isMobileMenuOpen ? 0 : 1,
                  scaleX: isMobileMenuOpen ? 0 : 1,
                }}
                transition={{ duration: 0.15 }}
              />
              <motion.span
                className="block w-6 h-0.5 bg-off-white"
                animate={{
                  rotate: isMobileMenuOpen ? -45 : 0,
                  y: isMobileMenuOpen ? -4 : 0,
                }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              />
            </button>
          </nav>
        </Container>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 bg-deep-purple/98 backdrop-blur-lg flex flex-col items-center justify-center lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <nav aria-label="Mobile navigation" className="flex flex-col items-center gap-6">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.05 + i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={item.href}
                    className="font-heading text-4xl text-off-white hover:text-coral transition-colors px-4 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ transitionDuration: "var(--duration-fast)" }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.4,
                  delay: 0.05 + NAV_ITEMS.length * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={ctaHref}
                  className="
                    mt-4 font-heading text-xl tracking-wider
                    bg-coral hover:bg-coral-hover
                    text-off-white px-10 py-4 rounded-md
                    transition-all
                  "
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ transitionDuration: "var(--duration-fast)" }}
                >
                  {ctaLabelMobile}
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
