"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TOOL_EVENTS, trackTool } from "@/lib/analytics/tool-events";
import type { ToolSlug } from "@/lib/tool-results/types";

/**
 * Unified Phase 2 save form. Captures email + optional first name +
 * consent, POSTs to /api/tools/save, then shows the permalink + an
 * Ask Roadman handoff link. The backing pipeline also emails a copy
 * of the result so the rider has it on their phone during the ride.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "submitting" | "saved" | "error";

interface Props {
  tool: ToolSlug;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  heading: string;
  subheading: string;
  bullets: string[];
  /** Path segment used in /results/<tool>/<slug>. */
  resultsPathTool: string;
  buttonText?: string;
}

export function SaveToolResultForm({
  tool,
  inputs,
  outputs,
  heading,
  subheading,
  bullets,
  resultsPathTool,
  buttonText = "SAVE + EMAIL MY RESULT",
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!consent) {
      setErrorMsg("Consent is required to save and email your result.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/tools/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool,
          email: trimmedEmail,
          firstName: name.trim() || null,
          consent,
          inputs,
          outputs,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        slug?: string;
        emailSent?: boolean;
        error?: string;
      };
      if (!res.ok || !body.success || !body.slug) {
        throw new Error(body.error || `Save failed (${res.status})`);
      }
      setSlug(body.slug);
      setEmailSent(Boolean(body.emailSent));
      setStatus("saved");
      trackTool({
        name: TOOL_EVENTS.DIAGNOSTIC_SAVED,
        tool,
        resultSlug: body.slug,
      });
      trackTool({
        name: TOOL_EVENTS.EMAIL_CAPTURED,
        tool,
        resultSlug: body.slug,
      });
      if (body.emailSent) {
        trackTool({
          name: TOOL_EVENTS.RESULT_EMAILED,
          tool,
          resultSlug: body.slug,
        });
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Couldn't save. Try again.");
    }
  };

  const resultUrl = slug ? `/results/${resultsPathTool}/${slug}` : null;
  const askUrl = slug
    ? `/ask?seed_tool=${tool}&seed_result=${encodeURIComponent(slug)}`
    : null;

  return (
    <div className="rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/5 via-deep-purple/30 to-charcoal p-6 md:p-8">
      <AnimatePresence mode="wait">
        {status !== "saved" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-heading text-coral text-xs tracking-widest mb-3">
              SAVE + EMAIL MY RESULT
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
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
                  {status === "submitting" ? "SAVING…" : buttonText}
                </button>
              </div>
              <label className="flex items-start gap-2 text-[11px] text-foreground-subtle leading-relaxed">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-coral"
                />
                <span>
                  Save my result, email me a copy, and add me to the Saturday
                  Spin. Unsubscribe any time. See our{" "}
                  <Link
                    href="/privacy"
                    className="text-coral hover:text-coral/80 underline underline-offset-2"
                  >
                    privacy policy
                  </Link>
                  .
                </span>
              </label>
            </form>

            {errorMsg && <p className="text-coral text-xs mt-3">{errorMsg}</p>}
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-heading text-coral text-xs tracking-widest mb-2">
              SAVED
            </p>
            <h3 className="font-heading text-off-white text-xl md:text-2xl mb-3 leading-tight">
              YOUR RESULT IS LIVE
            </h3>
            <p className="text-foreground-muted text-sm mb-5">
              {emailSent
                ? `We emailed a copy to ${email}. You can also view and share it anytime at the permalink below.`
                : `You can view and share your result at the permalink below. (We couldn't email this one — check your inbox in a minute or open the link directly.)`}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {resultUrl && (
                <Link
                  href={resultUrl}
                  onClick={() =>
                    trackTool({
                      name: TOOL_EVENTS.RESULT_VIEWED,
                      tool,
                      resultSlug: slug ?? undefined,
                      meta: { from: "save-form" },
                    })
                  }
                  className="flex-1 text-center px-5 py-3 rounded-lg bg-coral hover:bg-coral-hover text-off-white font-heading text-sm tracking-wider transition-colors"
                >
                  VIEW MY RESULT →
                </Link>
              )}
              {askUrl && (
                <Link
                  href={askUrl}
                  onClick={() =>
                    trackTool({
                      name: TOOL_EVENTS.DIAGNOSTIC_TO_AI_HANDOFF,
                      tool,
                      resultSlug: slug ?? undefined,
                      meta: { from: "save-form" },
                    })
                  }
                  className="flex-1 text-center px-5 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-off-white font-heading text-sm tracking-wider transition-colors"
                >
                  ASK ROADMAN →
                </Link>
              )}
            </div>
            <p className="text-foreground-subtle text-[11px] mt-4">
              Done a few tools? Your full history lives at{" "}
              <Link
                href="/results"
                className="text-coral hover:text-coral/80 underline underline-offset-2"
              >
                /results
              </Link>{" "}
              — request a signed link there.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
