"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function sendEvent(type: string, data: Record<string, string> = {}) {
  const payload = {
    type,
    page: window.location.pathname,
    referrer: document.referrer || undefined,
    ...data,
  };

  // Use sendBeacon with Blob for correct Content-Type, fall back to fetch
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

export function Tracker() {
  const pathname = usePathname();

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
