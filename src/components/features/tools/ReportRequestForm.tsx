"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type ToolSlug } from "@/lib/tools/reports";

/** RFC-lite email regex — consistent with /apply + newsletter endpoints. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ReportRequestFormProps {
  /** Which calculator this report belongs to. Drives the API payload. */
  tool: ToolSlug;
  /** Inputs captured from the calculator — forwarded to the report generator. */
  inputs: Record<string, unknown>;
  /** Optional: defaults when the user has already given their name. */
  defaultName?: string;
  /** Short headline above the form — what they're getting. */
  heading: string;
  /** 1-2 sentence value prop. */
  subheading: string;
  /** 3-5 bullet list of what the email contains. */
  bullets: string[];
  /** CTA text. */
  buttonText?: string;
}

type Status = "idle" | "submitting" | "sent" | "error";

/**
 * Email-gated "full report" upgrade. Used below the on-page calculator
 * result to offer a personalised report delivered via email. Generous
 * on the user-facing promise (bullet list of what's inside), tight on
 * the server side (one API call hits Resend + Beehiiv + CRM).
 *
 * Success state shows a "check your inbox" card — no instant-inline
 * reveal to preserve the email-worth-giving feel. If the user already
 * has our cookie-consent for marketing, this is frictionless.
 */
export function ReportRequestForm({
  tool,
  inputs,
  defaultName = "",
  heading,
  subheading,
  bullets,
  buttonText = "EMAIL ME THE FULL REPORT",
}: ReportRequestFormProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/tools/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool,
          email: trimmedEmail,
          name: name.trim() || undefined,
          inputs,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        emailSent?: boolean;
        message?: string;
      };
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Report request failed");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/5 via-deep-purple/30 to-charcoal p-6 md:p-8">
      <AnimatePresence mode="wait">
        {status !== "sent" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-heading text-coral text-xs tracking-widest mb-3">
              WANT THIS AS A REPORT?
            </p>
            <h3 className="font-heading text-off-white text-xl md:text-2xl mb-3 leading-tight">
              {heading.toUpperCase()}
            </h3>
            <p className="text-foreground-muted text-sm mb-5 leading-relaxed">
              {subheading}
            </p>

            <ul className="space-y-2 mb-6">
              {bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-sm text-foreground-muted"
                >
                  <span className="text-coral mt-0.5 shrink-0">&#10003;</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                placeholder="First name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="sm:w-40 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none text-sm"
                disabled={status === "submitting"}
                autoComplete="given-name"
              />
              <input
                type="email"
                required
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none text-sm"
                disabled={status === "submitting"}
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="px-5 py-3 rounded-lg bg-coral hover:bg-coral-hover text-off-white font-heading text-sm tracking-wider disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {status === "submitting" ? "SENDING…" : buttonText}
              </button>
            </form>

            {errorMsg && (
              <p className="text-coral text-xs mt-3">{errorMsg}</p>
            )}

            <p className="text-foreground-subtle text-xs mt-3">
              One-off report email. We&apos;ll also add you to the Saturday
              Spin — unsubscribe anytime.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center"
          >
            <div className="text-4xl mb-3">📬</div>
            <p className="font-heading text-coral text-xs tracking-widest mb-2">
              REPORT ON ITS WAY
            </p>
            <h3 className="font-heading text-off-white text-xl md:text-2xl mb-3 leading-tight">
              CHECK YOUR INBOX
            </h3>
            <p className="text-foreground-muted text-sm max-w-md mx-auto">
              We just sent your personalised report to{" "}
              <span className="text-coral">{email}</span>. If it&apos;s not
              there in a minute, check your spam folder and mark us as &ldquo;not
              spam&rdquo; — it helps with future deliveries.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
