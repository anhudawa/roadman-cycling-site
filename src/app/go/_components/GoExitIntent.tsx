"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

/**
 * Exit-intent toolkit offer for the /go PPC surface.
 *
 * /go is otherwise deliberately single-CTA — every distraction would
 * compete with the diagnostic button on the way IN. This popup only
 * fires when the visitor is already leaving, so it can't poach a
 * forward click. Captured emails are a consolation lead the cold
 * traffic spend would otherwise burn.
 *
 * Triggers:
 *  - Desktop: pointer leaves the viewport upward (reach for chrome,
 *    back button or tab strip).
 *  - Mobile / touch: 30s of inactivity (no scroll, tap, or key
 *    press). Resets on every interaction so an engaged reader
 *    doesn't get interrupted.
 *
 * Suppressed for the session once shown or dismissed via
 * `sessionStorage`. Submissions POST to /api/newsletter with
 * source="go-exit-intent" so Beehiiv can segment these leads from
 * the other capture surfaces.
 */

const SESSION_KEY = "go-exit-intent-shown-v1";
const MOBILE_INACTIVITY_MS = 30_000;
// Don't arm immediately on mount — a fast back-tab reflex on a slow
// paint should not trip the popup as the visitor enters.
const ARM_DELAY_MS = 4_000;

export function GoExitIntent() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const trigger = useCallback(() => {
    // Re-check the flag here, not just on mount: after a dismiss the
    // listener is still attached, and `setOpen(false)` would happily
    // flip back to true on the next mouseleave without this guard.
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sessionStorage disabled (Safari private). The popup still
      // shows; we just lose the once-per-session guarantee.
    }
    trackAnalyticsEvent({ type: "go_exit_intent_shown", page: "/go" });
    setOpen(true);
  }, []);

  const dismiss = useCallback(() => {
    setOpen(false);
    trackAnalyticsEvent({ type: "go_exit_intent_dismissed", page: "/go" });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // sessionStorage unavailable — bail rather than nag every nav.
      return;
    }

    let armed = false;
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, ARM_DELAY_MS);

    const onMouseLeave = (e: MouseEvent) => {
      if (!armed) return;
      // Only top-edge exits count as intent to leave. Side exits on
      // trackpad scroll are too easy to trip accidentally.
      if (e.clientY <= 0) trigger();
    };
    document.addEventListener("mouseleave", onMouseLeave);

    // Touch / no-pointer fallback. Resets on activity, fires after
    // a quiet stretch — the only signal we get that someone's about
    // to bail without a `mouseleave`.
    const isTouch =
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 768;
    let inactivityTimer: number | null = null;
    const resetInactivity = () => {
      if (!isTouch) return;
      if (inactivityTimer !== null) window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(() => {
        if (armed) trigger();
      }, MOBILE_INACTIVITY_MS);
    };
    const activityEvents: Array<keyof DocumentEventMap> = [
      "scroll",
      "touchstart",
      "click",
      "keydown",
    ];
    activityEvents.forEach((evt) =>
      document.addEventListener(evt, resetInactivity, { passive: true })
    );
    resetInactivity();

    return () => {
      window.clearTimeout(armTimer);
      if (inactivityTimer !== null) window.clearTimeout(inactivityTimer);
      document.removeEventListener("mouseleave", onMouseLeave);
      activityEvents.forEach((evt) =>
        document.removeEventListener(evt, resetInactivity)
      );
    };
  }, [trigger]);

  // Esc closes — only listen while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  // Move focus into the dialog when it opens so screen readers and
  // keyboard users land somewhere meaningful.
  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    if (!node) return;
    const input = node.querySelector<HTMLInputElement>("input[type=email]");
    (input ?? node).focus();
  }, [open]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const value = email.trim();
    if (!value.includes("@") || !value.includes(".")) {
      setError("Please enter a valid email.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source: "go-exit-intent" }),
      });

      if (res.ok) {
        trackAnalyticsEvent({
          type: "go_exit_intent_submit",
          page: "/go",
          meta: { email_domain: value.split("@")[1] ?? "" },
        });
        setSubmitted(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(data.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="go-exit-intent-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <div
        aria-hidden="true"
        onClick={dismiss}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="
          relative w-full max-w-md
          rounded-2xl border border-white/10
          bg-charcoal text-off-white
          shadow-[0_20px_60px_rgba(0,0,0,0.55)]
          p-6 md:p-8
          focus:outline-none
        "
      >
        <span
          aria-hidden="true"
          className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-coral to-transparent"
        />

        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="
            absolute top-3 right-3
            w-9 h-9 rounded-full
            flex items-center justify-center
            text-foreground-muted hover:text-off-white hover:bg-white/10
            transition-colors cursor-pointer
          "
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {submitted ? (
          <div className="text-center pt-2 pb-1">
            <p className="font-heading text-coral text-[11px] tracking-[0.3em] mb-4">
              ON ITS WAY
            </p>
            <h2
              id="go-exit-intent-title"
              className="font-heading text-off-white text-3xl md:text-4xl leading-tight mb-3"
            >
              CHECK YOUR INBOX.
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              The Roadman Toolkit is on its way. If it&rsquo;s not there in a
              minute, check promotions.
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="
                mt-6 font-heading tracking-wider text-sm
                text-coral hover:text-off-white
                transition-colors cursor-pointer
              "
            >
              CLOSE
            </button>
          </div>
        ) : (
          <>
            <p className="font-heading text-coral text-[11px] tracking-[0.3em] mb-3">
              ONE LAST THING
            </p>
            <h2
              id="go-exit-intent-title"
              className="font-heading text-off-white text-3xl md:text-4xl leading-tight mb-4"
            >
              BEFORE YOU GO&hellip;
            </h2>
            <p className="text-foreground-muted leading-relaxed mb-6">
              Get the free Roadman Cycling Toolkit &mdash; training tips from
              World Tour coaches, delivered to your inbox.
            </p>
            <form onSubmit={onSubmit} className="space-y-3">
              <label htmlFor="go-exit-intent-email" className="sr-only">
                Email address
              </label>
              <input
                id="go-exit-intent-email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="your@email.com"
                className="
                  w-full bg-white/5 border border-white/15 rounded-md
                  px-4 py-3 text-off-white placeholder:text-foreground-subtle
                  focus:border-coral focus:outline-none transition-colors
                "
              />
              {error && (
                <p className="text-red-400 text-sm" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                data-track="go_exit_intent_submit"
                className="
                  w-full inline-flex items-center justify-center
                  font-heading tracking-wider text-base md:text-lg
                  bg-coral hover:bg-coral-hover disabled:opacity-50
                  text-off-white
                  px-6 py-3.5 rounded-md
                  transition-all cursor-pointer
                  shadow-[0_10px_30px_rgba(241,99,99,0.35)]
                  hover:shadow-[0_14px_40px_rgba(241,99,99,0.55)]
                "
              >
                {submitting ? "SENDING..." : "SEND ME THE TOOLKIT"}
              </button>
            </form>
            <p className="text-foreground-subtle text-xs mt-4 text-center">
              One-click unsubscribe. We never sell your email.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
