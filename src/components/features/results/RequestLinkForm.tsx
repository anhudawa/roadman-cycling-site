"use client";

import { useState } from "react";

/**
 * Email capture form for /results. Posts to /api/results/request-link
 * which always returns success — no information leaked about which
 * emails we actually have on file. The UI shows a generic "check your
 * inbox" confirmation regardless.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RequestLinkForm({ tokenStatus }: { tokenStatus?: "expired" | "invalid" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/results/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Couldn't send link. Try again.");
    }
  };

  const bannerMsg =
    tokenStatus === "expired"
      ? "That link has expired. We can send a fresh one — enter your email below."
      : tokenStatus === "invalid"
      ? "That link doesn't look right. Enter your email and we'll send a working one."
      : null;

  return (
    <div className="rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/5 via-deep-purple/30 to-charcoal p-6 md:p-8">
      <p className="font-heading text-coral text-xs tracking-widest mb-3">
        VIEW YOUR SAVED RESULTS
      </p>
      <h2 className="font-heading text-off-white text-2xl md:text-3xl mb-3 leading-tight">
        SEND ME A LINK TO MY RESULTS
      </h2>
      <p className="text-foreground-muted text-sm mb-5 leading-relaxed">
        Every plateau diagnostic, fuelling plan, and FTP zone table you&apos;ve
        saved lives on one page. Enter the email you used and we&apos;ll send a
        signed link that opens it — good for seven days.
      </p>

      {bannerMsg && (
        <p className="text-coral/80 text-sm mb-4" role="alert">
          {bannerMsg}
        </p>
      )}

      {status === "sent" ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="font-heading text-off-white text-sm mb-1">
            CHECK YOUR INBOX
          </p>
          <p className="text-foreground-muted text-sm">
            If we have results on file for that email, a link is on its way.
            Give it a minute to land — and peek in spam if you don&apos;t see
            it.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "submitting"}
            autoComplete="email"
            className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none text-sm"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="px-5 py-3 rounded-lg bg-coral hover:bg-coral-hover text-off-white font-heading text-sm tracking-wider disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {status === "submitting" ? "SENDING…" : "SEND LINK"}
          </button>
        </form>
      )}

      {errorMsg && <p className="text-coral text-xs mt-3">{errorMsg}</p>}
    </div>
  );
}
