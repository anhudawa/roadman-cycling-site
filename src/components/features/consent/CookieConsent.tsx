"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const STORAGE_KEY = "roadman_cookie_consent";
const COOKIE_NAME = "roadman_consent";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

function setConsentCookie(value: string) {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function saveConsent(prefs: ConsentPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

  if (prefs.analytics && prefs.marketing) {
    setConsentCookie("all");
  } else if (!prefs.analytics && !prefs.marketing) {
    setConsentCookie("essential");
  } else {
    const parts = ["essential"];
    if (prefs.analytics) parts.push("analytics");
    if (prefs.marketing) parts.push("marketing");
    setConsentCookie(parts.join("+"));
  }

  window.dispatchEvent(new CustomEvent("consent-updated", { detail: prefs }));
}

export function CookieConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Don't show on admin pages
    if (pathname.startsWith("/admin")) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return;

    // Defer showing the banner until the user has scrolled OR dwelled
    // for 6s, whichever comes first. This keeps the hero's first paint
    // clean $€” nothing covers the H1 or primary CTA while the visitor
    // is still reading the value prop. We still show the banner before
    // they can submit a form or convert.
    let shown = false;
    function show() {
      if (shown) return;
      shown = true;
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
      window.removeEventListener("scroll", show);
      window.removeEventListener("pointerdown", show);
      if (timer) clearTimeout(timer);
    }

    const timer = window.setTimeout(show, 6000);
    window.addEventListener("scroll", show, { passive: true, once: true });
    window.addEventListener("pointerdown", show, { passive: true, once: true });

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("scroll", show);
      window.removeEventListener("pointerdown", show);
    };
  }, [pathname]);

  const handleAcceptAll = useCallback(() => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    });
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 300);
  }, []);

  const handleRejectNonEssential = useCallback(() => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 300);
  }, []);

  const handleSavePreferences = useCallback(() => {
    saveConsent({
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    });
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 300);
  }, [analytics, marketing]);

  if (!visible) return null;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-[#2E2E30] border-t border-white/10
        transition-all duration-300 ease-out
        ${animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
      `}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-4 md:py-5">
        <div className="flex flex-col gap-4">
          {/* Main message */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <p className="text-sm text-off-white/80 flex-1">
              We use cookies for analytics and marketing to improve your
              experience.{" "}
              <Link
                href="/cookies"
                className="text-coral hover:underline"
              >
                Cookie Policy
              </Link>
            </p>

            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={handleAcceptAll}
                className="
                  font-heading text-sm tracking-wider
                  bg-coral hover:bg-coral-hover text-off-white
                  px-5 py-2.5 min-h-[40px] rounded-md transition-colors cursor-pointer
                "
                style={{ transitionDuration: "var(--duration-fast, 150ms)" }}
              >
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="
                  font-heading text-sm tracking-wider
                  border border-white/20 hover:border-white/40 text-off-white
                  px-5 py-2.5 min-h-[40px] rounded-md transition-colors cursor-pointer
                "
                style={{ transitionDuration: "var(--duration-fast, 150ms)" }}
              >
                Reject Non-Essential
              </button>
              <button
                onClick={() => setShowPrefs((p) => !p)}
                className="
                  font-heading text-sm tracking-wider
                  border border-white/20 hover:border-white/40 text-off-white/70
                  px-5 py-2.5 min-h-[40px] rounded-md transition-colors cursor-pointer
                "
                style={{ transitionDuration: "var(--duration-fast, 150ms)" }}
              >
                {showPrefs ? "Hide Preferences" : "Manage Preferences"}
              </button>
            </div>
          </div>

          {/* Preferences panel */}
          {showPrefs && (
            <div className="border-t border-white/10 pt-4 pb-1">
              <div className="grid gap-3 sm:grid-cols-3 max-w-xl">
                {/* Essential $€” always on */}
                <label className="flex items-center gap-2 text-sm text-off-white/70">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="accent-coral w-4 h-4 rounded opacity-60"
                  />
                  <span>Essential</span>
                  <span className="text-xs text-off-white/40">(required)</span>
                </label>

                {/* Analytics */}
                <label className="flex items-center gap-2 text-sm text-off-white/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="accent-coral w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Analytics</span>
                </label>

                {/* Marketing */}
                <label className="flex items-center gap-2 text-sm text-off-white/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="accent-coral w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Marketing</span>
                </label>
              </div>

              <button
                onClick={handleSavePreferences}
                className="
                  mt-3 font-heading text-sm tracking-wider
                  bg-coral hover:bg-coral-hover text-off-white
                  px-5 py-2.5 min-h-[40px] rounded-md transition-colors cursor-pointer
                "
                style={{ transitionDuration: "var(--duration-fast, 150ms)" }}
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
