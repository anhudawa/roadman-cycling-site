"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";

type ApplicationContext = "form" | "diagnostic";

const HOME_NAV_ITEMS = [
  { label: "Results", href: "/#results", track: "home_nav_results" },
  {
    label: "Coaching System",
    href: "/#system",
    track: "home_nav_coaching_system",
  },
  { label: "Podcast", href: "/podcast", track: "home_nav_podcast" },
] as const;

const FORM_NAV_ITEMS = [
  { label: "Results", href: "#proof-heading", track: "apply_nav_results" },
  {
    label: "What You Get",
    href: "#delivery-heading",
    track: "apply_nav_delivery",
  },
  { label: "Your Coach", href: "#coach-heading", track: "apply_nav_coach" },
  { label: "FAQ", href: "#faq-heading", track: "apply_nav_faq" },
] as const;

const DIAGNOSTIC_NAV_ITEMS = [
  {
    label: "Your Result",
    href: "#diagnostic-result",
    track: "diagnostic_nav_result",
  },
  {
    label: "How It Works",
    href: "/community/not-done-yet",
    track: "diagnostic_nav_how_it_works",
  },
  {
    label: "Method",
    href: "/methodology",
    track: "diagnostic_nav_method",
  },
  { label: "About", href: "/about", track: "diagnostic_nav_about" },
] as const;

const EXPLORE_ITEMS = [
  {
    label: "Blog",
    href: "/blog",
    description: "Evidence-led training and performance guides",
    track: "home_nav_explore_blog",
  },
  {
    label: "Free Tools",
    href: "/tools",
    description: "Calculators and diagnostics for better decisions",
    track: "home_nav_explore_tools",
  },
  {
    label: "Training Plans",
    href: "/plan",
    description: "Structured plans for the events that matter",
    track: "home_nav_explore_plans",
  },
  {
    label: "Training Camps",
    href: "https://roadmancycling.com/training-camps",
    description: "Ride and progress with Roadman in Girona",
    track: "home_nav_explore_camps",
  },
  {
    label: "Methodology",
    href: "/methodology",
    description: "The evidence and principles behind the coaching",
    track: "home_nav_explore_method",
  },
  {
    label: "About Roadman",
    href: "/about",
    description: "Our story, standards and reason for being",
    track: "home_nav_explore_about",
  },
] as const;

export function CoachingHeader({
  applicationContext,
}: {
  applicationContext?: ApplicationContext;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);
  const exploreButtonRef = useRef<HTMLButtonElement>(null);
  const hasExplore = !applicationContext;

  const navigationItems =
    applicationContext === "form"
      ? FORM_NAV_ITEMS
      : applicationContext === "diagnostic"
        ? DIAGNOSTIC_NAV_ITEMS
        : HOME_NAV_ITEMS;
  const ctaHref =
    applicationContext === "form"
      ? "#application-form"
      : applicationContext === "diagnostic"
        ? "#recommended-path"
        : "/apply";
  const ctaLabel =
    applicationContext === "diagnostic"
      ? "VIEW NEXT STEP"
      : "START APPLICATION";
  const desktopCtaTrack =
    applicationContext === "form"
      ? "apply_nav_form"
      : applicationContext === "diagnostic"
        ? "diagnostic_nav_next_step"
        : "home_nav_apply";
  const mobileCtaTrack =
    applicationContext === "form"
      ? "apply_mobile_nav_form"
      : applicationContext === "diagnostic"
        ? "diagnostic_mobile_nav_next_step"
        : "home_mobile_nav_apply";

  useEffect(() => {
    let frame = 0;

    const updateHeader = () => {
      frame = 0;
      const scrollTop = window.scrollY;
      const scrollRange =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollRange > 0 ? Math.min(1, Math.max(0, scrollTop / scrollRange)) : 0;

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
      setIsScrolled((current) => {
        const next = scrollTop > 50;
        return current === next ? current : next;
      });
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHeader);
    };

    updateHeader();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const backgroundElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main, footer, [data-mobile-auxiliary-surface='true']",
      ),
    );
    const previousInert = backgroundElements.map((element) => element.inert);
    backgroundElements.forEach((element) => {
      element.inert = true;
    });

    const focusFrame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    });

    const closeAtDesktop = () => {
      if (window.innerWidth < 1024) return;
      setIsMenuOpen(false);
      setIsExploreOpen(false);
      window.requestAnimationFrame(() => {
        logoRef.current?.focus({ preventScroll: true });
      });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      const menuItems = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) ?? [],
      );
      const focusable = [
        ...(menuButtonRef.current ? [menuButtonRef.current] : []),
        ...menuItems,
      ];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", closeAtDesktop);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", closeAtDesktop);
      backgroundElements.forEach((element, index) => {
        element.inert = previousInert[index];
      });
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isExploreOpen || isMenuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (exploreRef.current?.contains(event.target as Node)) return;
      setIsExploreOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsExploreOpen(false);
      exploreButtonRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isExploreOpen, isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsExploreOpen(false);
    window.requestAnimationFrame(() => {
      menuButtonRef.current?.focus({ preventScroll: true });
    });
  };

  const openExploreAndFocusFirstLink = () => {
    setIsExploreOpen(true);
    window.requestAnimationFrame(() => {
      exploreRef.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
    });
  };

  return (
    <>
      <div
        ref={progressRef}
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left scale-x-0 bg-coral motion-reduce:hidden"
        aria-hidden="true"
      />

      <header
        className={`fixed inset-x-0 top-0 ${
          isMenuOpen ? "z-[20001]" : "z-50"
        } border-b transition-[background-color,border-color,padding,backdrop-filter] duration-300 motion-reduce:transition-none ${
          isScrolled
            ? "border-white/5 bg-[#171419]/95 py-3 backdrop-blur-md"
            : "border-transparent bg-transparent py-5"
        }`}
      >
        <Container width="coaching">
          <nav
            aria-label="Main navigation"
            className="flex items-center justify-between"
          >
            <Link
              ref={logoRef}
              href="/"
              className={`relative z-10 flex items-center ${
                isMenuOpen ? "pointer-events-none" : ""
              }`}
              onClick={closeMenu}
              aria-hidden={isMenuOpen}
              tabIndex={isMenuOpen ? -1 : undefined}
            >
              <Image
                src="/images/logo-white.png"
                alt="Roadman Cycling"
                width={763}
                height={345}
                sizes="(max-width: 767px) 89px, 124px"
                className="h-10 w-auto max-w-none md:h-14"
                loading="eager"
                fetchPriority="high"
              />
            </Link>

            <div className="hidden items-center gap-8 lg:flex">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative min-h-11 content-center font-body text-sm text-foreground-muted transition-colors hover:text-off-white focus-visible:text-off-white"
                  data-track={item.track}
                >
                  {item.label}
                  <span
                    className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-coral transition-transform duration-300 motion-reduce:transition-none group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    aria-hidden="true"
                  />
                </Link>
              ))}
              {hasExplore ? (
                <div ref={exploreRef} className="relative">
                  <button
                    ref={exploreButtonRef}
                    type="button"
                    className="group relative flex min-h-11 items-center gap-1.5 font-body text-sm text-foreground-muted transition-colors hover:text-off-white focus-visible:text-off-white"
                    aria-expanded={isExploreOpen}
                    aria-controls="coaching-explore-panel"
                    data-track="home_nav_explore_toggle"
                    onClick={() => setIsExploreOpen((open) => !open)}
                    onKeyDown={(event) => {
                      if (event.key !== "ArrowDown") return;
                      event.preventDefault();
                      openExploreAndFocusFirstLink();
                    }}
                  >
                    Explore
                    <svg
                      viewBox="0 0 12 12"
                      className={`h-3 w-3 transition-transform duration-200 motion-reduce:transition-none ${
                        isExploreOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <path
                        d="m2.25 4.25 3.75 3.5 3.75-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="square"
                        strokeWidth="1.25"
                      />
                    </svg>
                    <span
                      className={`absolute inset-x-0 bottom-1 h-px origin-left bg-coral transition-transform duration-300 motion-reduce:transition-none ${
                        isExploreOpen
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <div
                    id="coaching-explore-panel"
                    className={`absolute right-0 top-[calc(100%+0.75rem)] w-[31rem] border border-white/10 bg-[#171419]/[0.98] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-md transition-[opacity,transform,visibility] duration-200 motion-reduce:transition-none ${
                      isExploreOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible pointer-events-none -translate-y-1 opacity-0"
                    }`}
                    aria-hidden={!isExploreOpen}
                  >
                    <p className="mb-3 font-heading text-xs tracking-[0.18em] text-coral">
                      EXPLORE ROADMAN
                    </p>
                    <nav aria-label="Explore Roadman">
                      <ul className="grid grid-cols-2 border-l border-t border-white/10">
                        {EXPLORE_ITEMS.map((item) => (
                          <li
                            key={item.href}
                            className="border-b border-r border-white/10"
                          >
                            <Link
                              href={item.href}
                              prefetch={false}
                              className="group/item flex min-h-[5.25rem] flex-col justify-center px-4 py-3 transition-colors hover:bg-white/[0.045] focus-visible:bg-white/[0.045]"
                              data-track={item.track}
                              tabIndex={isExploreOpen ? 0 : -1}
                              onClick={() => setIsExploreOpen(false)}
                            >
                              <span className="flex items-center justify-between gap-3 font-heading text-base tracking-wide text-off-white">
                                {item.label.toUpperCase()}
                                <span
                                  className="text-coral transition-transform duration-200 motion-reduce:transition-none group-hover/item:translate-x-0.5 group-focus-visible/item:translate-x-0.5"
                                  aria-hidden="true"
                                >
                                  ↗
                                </span>
                              </span>
                              <span className="mt-1 text-xs leading-snug text-foreground-muted">
                                {item.description}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                </div>
              ) : null}
              <Link
                href={ctaHref}
                className="inline-flex min-h-11 items-center bg-coral px-4 font-heading text-xs tracking-wide text-deep-purple transition-[background-color,box-shadow] motion-reduce:transition-none hover:bg-coral-hover hover:shadow-[var(--shadow-glow-coral)]"
                data-track={desktopCtaTrack}
              >
                {ctaLabel}
              </Link>
            </div>

            <button
              ref={menuButtonRef}
              type="button"
              className="relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="coaching-mobile-menu"
            >
              <span
                className={`block h-0.5 w-6 bg-off-white transition-transform duration-200 motion-reduce:transition-none ${
                  isMenuOpen ? "translate-y-1 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-off-white transition-[opacity,transform] duration-200 motion-reduce:transition-none ${
                  isMenuOpen ? "-translate-y-1 -rotate-45" : ""
                }`}
              />
            </button>
          </nav>
        </Container>
      </header>

      <div
        ref={menuRef}
        id="coaching-mobile-menu"
        className={`fixed inset-0 z-[20000] flex overflow-y-auto overscroll-contain bg-[#171419] px-6 pb-10 pt-28 transition-[opacity,visibility] duration-200 motion-reduce:transition-none lg:hidden ${
          isMenuOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
        aria-hidden={!isMenuOpen}
        role="dialog"
        aria-modal={isMenuOpen ? "true" : undefined}
        aria-label="Coaching navigation"
      >
        <nav
          aria-label="Mobile navigation"
          className="flex min-h-full w-full flex-col justify-between gap-8"
        >
          <div>
            <p className="mb-5 font-heading text-xs tracking-[0.2em] text-coral">
              NOT DONE YET COACHING
            </p>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {navigationItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-16 items-center justify-between font-heading text-xl tracking-wide text-off-white"
                  onClick={closeMenu}
                  tabIndex={isMenuOpen ? 0 : -1}
                  data-track={item.track.replace("_nav_", "_mobile_nav_")}
                >
                  {item.label.toUpperCase()}
                  <span
                    className="text-xs text-foreground-subtle"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              ))}
            </div>

            {hasExplore ? (
              <div className="mt-8">
                <p className="mb-3 font-heading text-xs tracking-[0.18em] text-coral">
                  EXPLORE ROADMAN
                </p>
                <div className="grid grid-cols-2 border-l border-t border-white/10 max-[359px]:grid-cols-1">
                  {EXPLORE_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      className="flex min-h-12 items-center justify-between gap-2 border-b border-r border-white/10 px-3 py-2.5 font-heading text-sm tracking-wide text-off-white"
                      data-track={item.track.replace(
                        "home_nav_",
                        "home_mobile_nav_",
                      )}
                      onClick={closeMenu}
                      tabIndex={isMenuOpen ? 0 : -1}
                    >
                      {item.label.toUpperCase()}
                      <span className="text-coral" aria-hidden="true">
                        ↗
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <Link
            href={ctaHref}
            className="inline-flex min-h-14 items-center justify-center bg-coral px-5 font-heading text-sm tracking-wide text-deep-purple"
            data-track={mobileCtaTrack}
            onClick={closeMenu}
            tabIndex={isMenuOpen ? 0 : -1}
          >
            {ctaLabel}
          </Link>
        </nav>
      </div>
    </>
  );
}
