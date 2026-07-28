"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { NAV_ITEMS, type NavItem } from "@/types";
import { Container } from "./Container";
import { SearchTrigger } from "@/components/features/search/SearchTrigger";
import { isBannerlessRoute } from "./ConversionChrome";

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
  "/inner-circle",
];

const COACHING_NAV_ITEMS: NavItem[] = [
  { label: "Results", href: "/#results" },
  { label: "What You Get", href: "/#system" },
  { label: "Method", href: "/methodology" },
  { label: "Podcast", href: "/podcast" },
  { label: "About", href: "/about" },
];

const APPLICATION_NAV_ITEMS: NavItem[] = [
  { label: "Results", href: "#proof-heading" },
  { label: "What You Get", href: "#delivery-heading" },
  { label: "Your Coach", href: "#coach-heading" },
  { label: "FAQ", href: "#faq-heading" },
];

const DIAGNOSTIC_NAV_ITEMS: NavItem[] = [
  { label: "Your Result", href: "#diagnostic-result" },
  { label: "How It Works", href: "/community/not-done-yet" },
  { label: "Method", href: "/methodology" },
  { label: "About", href: "/about" },
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
export function Header({
  variant = "default",
  applicationContext,
}: {
  variant?: "default" | "coaching";
  applicationContext?: "form" | "diagnostic";
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const reserveBannerSpace =
    variant !== "coaching" && !isBannerlessRoute(pathname);
  const navigationItems =
    variant !== "coaching"
      ? NAV_ITEMS
      : applicationContext === "form"
        ? APPLICATION_NAV_ITEMS
        : applicationContext === "diagnostic"
          ? DIAGNOSTIC_NAV_ITEMS
          : COACHING_NAV_ITEMS;
  const showApply = shouldShowApplyCta(pathname);
  const ctaHref =
    applicationContext === "form"
      ? "#application-form"
      : applicationContext === "diagnostic"
        ? "#recommended-path"
        : showApply
          ? "/apply"
          : "/community/clubhouse";
  const ctaLabel =
    applicationContext === "diagnostic"
      ? "VIEW NEXT STEP"
      : showApply && variant === "coaching"
        ? "START APPLICATION"
        : showApply
          ? "APPLY"
          : "JOIN FREE";
  const ctaLabelMobile =
    applicationContext === "diagnostic"
      ? "VIEW YOUR NEXT STEP"
      : showApply
        ? "START APPLICATION"
        : "JOIN THE CLUBHOUSE";
  const desktopCtaTrack =
    applicationContext === "form"
      ? "apply_nav_form"
      : applicationContext === "diagnostic"
        ? "diagnostic_nav_next_step"
        : showApply && variant === "coaching"
          ? "home_nav_apply"
          : undefined;
  const mobileCtaTrack =
    applicationContext === "form"
      ? "apply_mobile_nav_form"
      : applicationContext === "diagnostic"
        ? "diagnostic_mobile_nav_next_step"
        : showApply && variant === "coaching"
          ? "home_mobile_nav_apply"
          : undefined;

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

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const focusFrame = requestAnimationFrame(() => {
      mobileMenuRef.current
        ?.querySelector<HTMLElement>("a[href], button:not([disabled])")
        ?.focus();
    });

    const manageKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setExpandedMenu(null);
        mobileMenuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;
      const menuFocusables = Array.from(
        mobileMenuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      const focusables = [
        ...(mobileMenuButtonRef.current ? [mobileMenuButtonRef.current] : []),
        ...menuFocusables,
      ];
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", manageKeyboard);
    return () => {
      cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", manageKeyboard);
    };
  }, [isMobileMenuOpen]);

  return (
    <MotionConfig reducedMotion="user">
      <>
      {variant !== "coaching" && <SearchTrigger />}
      {/* Scroll progress bar */}
      <motion.div
        className="scroll-progress-bar"
        style={{ width: progressWidth }}
        aria-hidden="true"
      />

      <header
        className={`
          fixed left-0 right-0 z-50 transition-all
          ${
            isScrolled
              ? `${
                  variant === "coaching" ? "bg-[#171419]/95" : "bg-charcoal/95"
                } backdrop-blur-md border-b border-white/5 py-3`
              : "bg-transparent py-5"
          }
        `}
        style={{
          transitionDuration: "var(--duration-normal)",
          top:
            variant === "coaching"
              ? "0px"
              : reserveBannerSpace
                ? "var(--cohort-banner-height, 44px)"
                : "0px",
        }}
      >
        <Container width={variant === "coaching" ? "coaching" : "default"}>
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
                // Logo renders at ~88px (mobile) to ~124px (desktop) wide.
                // Without `sizes`, next/image ships the 1920w source on every
                // pageview — ~80-200KB of wasted bytes per load. See
                // docs/seo/cwv-audit-2026-04-23.md.
                sizes="(max-width: 767px) 89px, 124px"
                className="max-w-none h-10 md:h-14 w-auto"
                loading="eager"
                fetchPriority="high"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigationItems.map((item) => (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className="relative font-body text-sm text-foreground-muted hover:text-off-white transition-colors"
                    style={{ transitionDuration: "var(--duration-fast)" }}
                  >
                    {item.label}
                    {"children" in item && item.children && (
                      <span className="ml-1 text-xs opacity-50" aria-hidden="true">&#9662;</span>
                    )}
                    {/* Animated underline */}
                    <span className="absolute bottom-[-4px] left-0 h-[1.5px] w-0 group-hover:w-full bg-gradient-to-r from-coral to-coral/50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                  </Link>
                  {"children" in item && item.children && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all" style={{ transitionDuration: "var(--duration-normal)" }}>
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
              {variant !== "coaching" && (
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
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </Link>
              )}
              <Link
                href={ctaHref}
                className={`
                  font-heading text-xs tracking-wide whitespace-nowrap
                  bg-coral hover:bg-coral-hover
                  text-deep-purple px-4 min-h-11 inline-flex items-center ${
                    variant === "coaching" ? "rounded-none" : "rounded-md"
                  }
                  transition-all hover:shadow-[var(--shadow-glow-coral)]
                `}
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track={desktopCtaTrack}
              >
                {ctaLabel}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              ref={mobileMenuButtonRef}
              className="lg:hidden relative z-10 w-10 h-10 flex flex-col items-center justify-center gap-1.5"
              onClick={() => {
                const nextOpen = !isMobileMenuOpen;
                setIsMobileMenuOpen(nextOpen);
                if (!nextOpen) setExpandedMenu(null);
              }}
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
            ref={mobileMenuRef}
            id="mobile-menu"
            className="fixed inset-0 z-40 bg-deep-purple/98 backdrop-blur-lg overflow-y-auto overscroll-contain lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <nav
              aria-label="Mobile navigation"
              className="flex flex-col items-stretch gap-1 px-6 pt-24 pb-12"
            >
              {navigationItems.map((item, i) => {
                const isExpanded = expandedMenu === item.href;
                const hasChildren = !!item.children?.length;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.04 + i * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="border-b border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        className="flex-1 font-heading text-3xl text-off-white hover:text-coral transition-colors py-4"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{ transitionDuration: "var(--duration-fast)" }}
                      >
                        {item.label}
                      </Link>
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedMenu(isExpanded ? null : item.href)
                          }
                          aria-expanded={isExpanded}
                          aria-controls={`mobile-submenu-${item.href}`}
                          aria-label={
                            isExpanded
                              ? `Collapse ${item.label} menu`
                              : `Expand ${item.label} menu`
                          }
                          className="p-3 -mr-3 text-off-white"
                        >
                          <motion.svg
                            className="w-6 h-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{
                              duration: 0.25,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                          >
                            <path d="M6 9l6 6 6-6" />
                          </motion.svg>
                        </button>
                      )}
                    </div>
                    <AnimatePresence initial={false}>
                      {hasChildren && isExpanded && (
                        <motion.ul
                          id={`mobile-submenu-${item.href}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <li className="pb-3 pt-1">
                            <ul className="flex flex-col gap-0.5 pl-4 border-l-2 border-coral/30">
                              {item.children!.map((child) => (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    className="block font-body text-base text-foreground-muted hover:text-coral transition-colors py-2.5 px-3"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    style={{
                                      transitionDuration:
                                        "var(--duration-fast)",
                                    }}
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </li>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.35,
                  delay: 0.04 + navigationItems.length * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col items-stretch gap-4 pt-8"
              >
                <Link
                  href={ctaHref}
                  className={`
                    font-heading text-xl tracking-wider text-center
                    bg-coral hover:bg-coral-hover
                    text-deep-purple px-6 py-4 ${
                      variant === "coaching" ? "rounded-none" : "rounded-md"
                    }
                    transition-all
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ transitionDuration: "var(--duration-fast)" }}
                  data-track={mobileCtaTrack}
                >
                  {ctaLabelMobile}
                </Link>
                {variant !== "coaching" && (
                  <Link
                    href="/search"
                    className="inline-flex items-center justify-center gap-2 font-body text-sm text-foreground-muted hover:text-coral transition-colors min-h-[44px] py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ transitionDuration: "var(--duration-fast)" }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                    Search
                  </Link>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      </>
    </MotionConfig>
  );
}
