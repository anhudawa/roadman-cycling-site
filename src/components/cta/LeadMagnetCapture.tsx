"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { track } from "@/lib/analytics/events";
import { getLeadMagnet, type LeadMagnetId } from "@/lib/cta/lead-magnets";

/**
 * Shared inline lead-magnet capture form. Used by every intent CTA
 * that delivers an email asset (zones plan, event plan, masters
 * checklist, fuelling guide, 2-day gym plan, episode playlist).
 *
 * Visual design intentionally mirrors EmailCapture so a row of CTAs
 * across the site reads as one product, not eight bespoke widgets.
 *
 * The actual delivery is a Beehiiv automation keyed off the magnet's
 * tag — this component just posts to /api/lead-magnets and shows a
 * confirmation. See src/lib/cta/lead-magnets.ts for the registry.
 */
export interface LeadMagnetCaptureProps {
  magnet: LeadMagnetId;
  /** Eyebrow text above the heading (e.g. "FREE PLAN"). */
  eyebrow?: string;
  /** Main headline — usually a verb phrase. */
  heading: string;
  /** Supporting paragraph under the heading. */
  subheading?: string;
  /** Submit button copy. Defaults to "GET IT". */
  buttonText?: string;
  /** Source string for analytics + the CRM activity record. */
  source: string;
  /**
   * Optional context value baked in by the parent CTA (e.g. event
   * name for the EventPlanCTA). When supplied, it's sent to the API
   * as `context` and stored on the subscriber as the magnet's
   * configured custom field.
   */
  context?: string;
  /**
   * Optional secondary action rendered above the form — e.g.
   * NutritionCTA renders a "use the calculator" link before the
   * email field. Pass an element with the link styling baked in.
   */
  secondaryAction?: ReactNode;
  className?: string;
}

export function LeadMagnetCapture({
  magnet,
  eyebrow,
  heading,
  subheading,
  buttonText = "GET IT",
  source,
  context,
  secondaryAction,
  className = "",
}: LeadMagnetCaptureProps) {
  const definition = getLeadMagnet(magnet);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
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
      setMessage("Please agree to receive emails from Roadman Cycling.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/lead-magnets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          magnet,
          email,
          source,
          context,
          consent: true,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (res.ok) {
        setStatus("success");
        setMessage(data.message ?? definition.successMessage);
        track("email_captured", { source, email });
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <div
      className={`bg-background-elevated rounded-xl border border-coral/20 p-6 md:p-8 ${className}`}
      data-magnet={magnet}
    >
      {eyebrow && (
        <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
          {eyebrow}
        </p>
      )}
      <h3 className="font-heading text-xl md:text-2xl text-off-white mb-2 leading-tight">
        {heading}
      </h3>
      {subheading && (
        <p className="text-foreground-muted text-sm md:text-base mb-5 leading-relaxed">
          {subheading}
        </p>
      )}

      {secondaryAction && <div className="mb-5">{secondaryAction}</div>}

      {status === "success" ? (
        <p className="text-green-400 font-medium text-sm md:text-base">
          {message}
        </p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                aria-label="Email address"
                placeholder="Your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                className="
                  flex-1 bg-white/5 border border-white/10 rounded-md px-4 py-3
                  text-off-white placeholder:text-foreground-subtle
                  focus:border-coral focus:outline-none transition-colors
                "
                style={{ transitionDuration: "var(--duration-fast)" }}
                disabled={status === "loading"}
                required
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="
                  font-heading tracking-wider
                  bg-coral hover:bg-coral-hover disabled:opacity-50
                  text-off-white px-6 py-3 rounded-md
                  transition-colors shrink-0 cursor-pointer
                "
                style={{ transitionDuration: "var(--duration-fast)" }}
              >
                {status === "loading" ? "..." : buttonText}
              </button>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  if (status === "error") setStatus("idle");
                }}
                className="accent-coral mt-0.5 w-4 h-4 shrink-0 cursor-pointer"
              />
              <span className="text-xs text-foreground-muted leading-snug">
                I agree to receive emails from Roadman Cycling and accept the{" "}
                <a href="/privacy" className="text-coral hover:underline">
                  Privacy Policy
                </a>
                . Unsubscribe any time.
              </span>
            </label>
          </form>
          {status === "error" && (
            <p className="text-red-400 text-sm mt-2" role="alert">
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
