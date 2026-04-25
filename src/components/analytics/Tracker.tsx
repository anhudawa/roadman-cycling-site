"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ensureAIReferrerPersisted,
  getStoredAIReferrer,
} from "@/lib/analytics/ai-referrer";

const STORAGE_KEY = "roadman_cookie_consent";

// $”€$”€ Consent Check $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const prefs = JSON.parse(stored);
    return prefs.analytics === true;
  } catch {
    return false;
  }
}

// $”€$”€ Session ID $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("roadman_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("roadman_session_id", sid);
  }
  return sid;
}

// $”€$”€ Send Event $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
function sendEvent(type: string, data: Record<string, string> = {}) {
  // Always check consent before sending
  if (!hasAnalyticsConsent()) return;

  // Attach AI-referrer attribution if this session started from an AI
  // assistant (ChatGPT, Perplexity, Claude, Gemini, Copilot, etc.). First-
  // touch persists in sessionStorage so every event in the session $€” not
  // just the landing pageview $€” inherits the attribution.
  const aiReferrer = getStoredAIReferrer();

  const payload: Record<string, unknown> = {
    type,
    page: window.location.pathname,
    referrer: document.referrer || undefined,
    session_id: getSessionId(),
    ...data,
  };
  if (aiReferrer) {
    payload.ai_referrer = aiReferrer;
  }

  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/events", blob);
  } else {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Silent fail $€” analytics should never break UX
    });
  }
}

// $”€$”€ Scroll Depth Tracker $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
function useScrollDepth(consented: boolean) {
  const firedRef = useRef<Set<number>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
    if (!consented) return;

    // Reset on page change
    firedRef.current = new Set();

    const thresholds = [25, 50, 75, 100];

    function handleScroll() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const pct = Math.round((window.scrollY / scrollHeight) * 100);

      for (const t of thresholds) {
        if (pct >= t && !firedRef.current.has(t)) {
          firedRef.current.add(t);
          sendEvent("scroll_depth", { depth: String(t) });
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, consented]);
}

// $”€$”€ Time on Page Tracker $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
function useTimeOnPage(consented: boolean) {
  const pathname = usePathname();

  useEffect(() => {
    if (!consented) return;

    const startTime = Date.now();

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        const duration = Math.round((Date.now() - startTime) / 1000);
        sendEvent("time_on_page", { seconds: String(duration) });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, consented]);
}

// $”€$”€ Tracker Component $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
export function Tracker() {
  const pathname = usePathname();
  // Initialise from localStorage synchronously so the first render
  // already knows consent state (avoids a flash of no-tracking).
  const [consented, setConsented] = useState(() => hasAnalyticsConsent());

  // Listen for runtime consent updates (cookie banner toggle).
  useEffect(() => {
    function onConsentUpdated(e: Event) {
      const detail = (e as CustomEvent).detail;
      setConsented(detail?.analytics === true);
    }

    window.addEventListener("consent-updated", onConsentUpdated);
    return () => window.removeEventListener("consent-updated", onConsentUpdated);
  }, []);

  // Scroll depth and time-on-page tracking
  useScrollDepth(consented);
  useTimeOnPage(consented);

  // Capture first-touch AI referrer (ChatGPT, Perplexity, Claude, Gemini,
  // Copilot, etc.) as soon as consent is available. Runs once per session $€”
  // ensureAIReferrerPersisted is idempotent against sessionStorage.
  useEffect(() => {
    if (!consented) return;
    ensureAIReferrerPersisted();
  }, [consented]);

  // Fire pageview when consent is given (or on navigation if already consented)
  const hasFiredRef = useRef<string | null>(null);
  useEffect(() => {
    if (!consented) return;
    if (pathname.startsWith("/admin")) return;
    // Avoid duplicate pageview for same path
    if (hasFiredRef.current === pathname) return;
    hasFiredRef.current = pathname;

    sendEvent("pageview");
  }, [pathname, consented]);

  // Expose global tracking function for form submissions
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__roadmanTrack = sendEvent;
  }, []);

  // Global click delegate $€” fires a `cta_click` event for any anchor or
  // button carrying `data-track="<event-name>"`. Lets us tag conversion
  // CTAs on any page without wiring bespoke onClick handlers through the
  // Button/Link components. The beacon pattern in sendEvent handles the
  // page-navigation race (the event fires before the new page loads).
  useEffect(() => {
    if (!consented) return;
    function onClick(e: MouseEvent) {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const trackEl = target.closest<HTMLElement>("[data-track]");
      if (!trackEl) return;
      const trackId = trackEl.getAttribute("data-track");
      if (!trackId) return;
      const href = trackEl.getAttribute("href") || "";
      sendEvent("cta_click", { track_id: trackId, destination: href });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [consented]);

  return null;
}

// Utility: call from newsletter/form submission handlers
export function trackSignup(page: string, email?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const track = (window as any).__roadmanTrack;
  if (typeof track === "function") {
    track("signup", { page, email: email || "" });
  }
}
