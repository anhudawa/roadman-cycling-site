"use client";

import {
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import { track } from "@/lib/analytics/events";

/**
 * Email gate for premium blog content.
 *
 * Wraps article content and shows the first ~400px before fading into
 * a gradient overlay with an email capture form. On submission, reveals
 * the full content and sets a 90-day cookie so returning visitors
 * bypass the gate entirely.
 *
 * SEO: the full content stays in the DOM (never removed) — the gate is
 * purely CSS (overflow, max-height, mask-image). Crawlers that ignore
 * CSS (Googlebot, Bingbot, AI extractors) see the complete text.
 *
 * Posts to `/api/newsletter` with `source: "masters-report-gate"` — the
 * same endpoint the squeeze page uses, already Beehiiv-wired.
 */

const COOKIE_NAME = "masters_report_unlocked";
const COOKIE_DAYS = 90;
const PREVIEW_HEIGHT = 420; // px of content visible before the fade

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

const subscribeToCookie = () => () => {};
const getUnlockedSnapshot = () => getCookie(COOKIE_NAME) === "1";
const getUnlockedServerSnapshot = () => true;

interface ContentGateProps {
  children: ReactNode;
}

export function ContentGate({ children }: ContentGateProps) {
  const cookieUnlocked = useSyncExternalStore(
    subscribeToCookie,
    getUnlockedSnapshot,
    getUnlockedServerSnapshot,
  );
  const [unlockedThisVisit, setUnlockedThisVisit] = useState(false);
  const unlocked = cookieUnlocked || unlockedThisVisit;
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    if (!consent) {
      setStatus("error");
      setMessage("Please tick the box to confirm.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "masters-report-gate",
          consent: true,
        }),
      });

      if (res.ok) {
        track("email_captured", {
          source: "masters-report-gate",
          email,
        });
        setCookie(COOKIE_NAME, "1", COOKIE_DAYS);
        setStatus("success");
        setUnlockedThisVisit(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  };

  // SSR / first paint: show everything (crawlers).
  // Client with cookie: show everything.
  if (unlocked) {
    return <>{children}</>;
  }

  // ---------- Gated view ----------
  //
  // The full content is rendered once inside a single container with
  // max-height + overflow:hidden. The content stays in the DOM so
  // crawlers (Googlebot, Bingbot, AI extractors) that parse the full
  // DOM tree can index everything. A gradient overlay at the bottom of
  // the visible area signals to the reader that more content exists.

  return (
    <div className="relative">
      {/* Content — the full article is in the DOM, visually clipped */}
      <div
        className="overflow-hidden relative"
        style={{ maxHeight: `${PREVIEW_HEIGHT}px` }}
      >
        {children}
      </div>

      {/* Gradient fade overlay — positioned at the bottom of the
          clipped preview area so the text fades into charcoal. */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: "180px",
          background:
            "linear-gradient(to bottom, rgba(37,37,38,0) 0%, rgba(37,37,38,0.85) 60%, rgba(37,37,38,1) 100%)",
          top: `${PREVIEW_HEIGHT - 180}px`,
        }}
        aria-hidden="true"
      />

      {/* Gate card */}
      <div className="relative -mt-4 pt-8 pb-12 flex flex-col items-center text-center px-4">
        <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
          KEEP READING
        </p>
        <h2 className="font-heading text-off-white text-2xl md:text-3xl mb-3 max-w-lg">
          THE FULL REPORT HAS 18 SECTIONS
        </h2>
        <p className="text-foreground-muted text-sm md:text-base max-w-md mb-8 leading-relaxed">
          Enter your email to read the complete report — training blocks, case
          studies, nutrition protocols, and the section on female masters
          athletes. Free, no double opt-in.
        </p>

        {status === "success" ? (
          <div
            className="
              rounded-2xl bg-white/[0.04] border border-coral/40
              px-5 py-6 md:px-7 md:py-8
              text-center max-w-md mx-auto
            "
            role="status"
          >
            <p className="font-heading text-coral text-sm tracking-[0.25em] mb-2">
              YOU&rsquo;RE IN
            </p>
            <p className="text-off-white text-base md:text-lg leading-snug">
              Opening the full report now.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md mx-auto"
            data-track="content_gate_form"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                aria-label="Email address"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                disabled={status === "loading"}
                className="
                  flex-1 bg-white/5 border border-white/15 rounded-md
                  px-4 py-3 text-base text-off-white
                  placeholder:text-foreground-subtle
                  focus:border-coral focus:outline-none transition-colors
                "
              />
              <button
                type="submit"
                disabled={status === "loading"}
                data-track="content_gate_submit"
                className="
                  inline-flex items-center justify-center gap-2
                  font-heading tracking-wider text-base
                  bg-coral hover:bg-coral-hover disabled:opacity-50
                  text-off-white px-6 py-3 rounded-md
                  shadow-[0_10px_30px_rgba(241,99,99,0.35)]
                  hover:shadow-[0_14px_40px_rgba(241,99,99,0.55)]
                  transition-all shrink-0 cursor-pointer
                "
              >
                {status === "loading"
                  ? "SENDING..."
                  : "READ THE FULL REPORT"}
              </button>
            </div>

            <label className="flex items-start gap-2 mt-3 cursor-pointer text-left">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  if (status === "error") setStatus("idle");
                }}
                className="accent-coral mt-1 w-4 h-4 shrink-0 cursor-pointer"
              />
              <span className="text-xs text-foreground-muted leading-snug">
                Send me the report and the Saturday Spin newsletter. One-click
                unsubscribe.{" "}
                <a
                  href="/privacy"
                  className="text-coral hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy
                </a>
                .
              </span>
            </label>

            {status === "error" && (
              <p
                className="text-coral text-sm mt-2 text-left"
                role="alert"
              >
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
