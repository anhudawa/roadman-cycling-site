"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// ── Session ID ────────────────────────────────────────────
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("roadman_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("roadman_session_id", sid);
  }
  return sid;
}

// ── Send Event ────────────────────────────────────────────
function sendEvent(type: string, data: Record<string, string> = {}) {
  const payload = {
    type,
    page: window.location.pathname,
    referrer: document.referrer || undefined,
    session_id: getSessionId(),
    ...data,
  };

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
      // Silent fail — analytics should never break UX
    });
  }
}

// ── Scroll Depth Tracker ──────────────────────────────────
function useScrollDepth() {
  const firedRef = useRef<Set<number>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
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
  }, [pathname]);
}

// ── Time on Page Tracker ──────────────────────────────────
function useTimeOnPage() {
  const pathname = usePathname();

  useEffect(() => {
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
  }, [pathname]);
}

// ── Tracker Component ─────────────────────────────────────
export function Tracker() {
  const pathname = usePathname();

  // Scroll depth and time-on-page tracking
  useScrollDepth();
  useTimeOnPage();

  useEffect(() => {
    // Skip admin pages
    if (pathname.startsWith("/admin")) return;

    sendEvent("pageview");
  }, [pathname]);

  // Expose global tracking function for form submissions
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__roadmanTrack = sendEvent;
  }, []);

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
