"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics/events";

/**
 * Single-purpose email capture for the /masters-report squeeze page.
 *
 * Posts to /api/newsletter (already Beehiiv-wired in
 * src/lib/integrations/beehiiv.ts), tags the lead with
 * source="masters-report" so a Beehiiv segment can be cut from these
 * captures specifically, then redirects straight to the full report on
 * success. The redirect is the "delivery" — no double opt-in interstitial
 * because the report itself is the promised value and lives at a public
 * URL anyway.
 *
 * TODO (Beehiiv): once this surface has volume, set up a
 * "masters-report" segment + welcome automation inside Beehiiv that
 * follows up with the supporting CSVs, the current coaching application,
 * and a curated 3-email sequence pulling from the report's sections.
 * The signup tag is already being applied via the source field; the
 * automation just needs to be wired on the Beehiiv side.
 */

const REPORT_HREF = "/blog/masters-cycling-training-report-2026";

interface MastersReportCaptureProps {
  position: "hero" | "footer";
  buttonLabel?: string;
}

export function MastersReportCapture({
  position,
  buttonLabel = "SEND ME THE REPORT",
}: MastersReportCaptureProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const source = `masters-report-${position}`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    if (!consent) {
      setStatus("error");
      setMessage("Please tick the box to confirm you'd like the report.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, consent: true }),
      });

      if (res.ok) {
        track("email_captured", { source, email });
        setStatus("success");
        setMessage("You're in. Opening the report...");
        // Brief pause so success copy reads before redirect — the
        // server has confirmed the subscribe, the redirect is just
        // the delivery handoff. router.push keeps it in-app rather
        // than hard-reloading.
        setTimeout(() => router.push(REPORT_HREF), 600);
      } else {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus("error");
        setMessage(
          data.error ?? "Something went wrong. Try again.",
        );
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  };

  if (status === "success") {
    return (
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
          {message}
        </p>
        <p className="text-foreground-subtle text-xs mt-3">
          If the page doesn&rsquo;t open in a few seconds,{" "}
          <a
            href={REPORT_HREF}
            className="text-coral underline underline-offset-2"
          >
            click here
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-track={`masters_report_form_${position}`}
      className="w-full max-w-md mx-auto"
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
          data-track={`masters_report_submit_${position}`}
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
          {status === "loading" ? "SENDING..." : buttonLabel}
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
  );
}
