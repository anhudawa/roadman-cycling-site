"use client";

import { useState } from "react";

interface Props {
  firstName?: string;
  /** Called once the email has been captured (or skipped). */
  onUnlock: (email: string | null) => void;
  /** Whether to allow skipping past the gate. Default true — gates that
   *  block the only valuable thing on a page tend to backfire. */
  allowSkip?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Soft-gate before the swipe-through cards. The user can subscribe with
 * an email or skip; either way the cards reveal. Subscriptions hit
 * /api/wrapped/subscribe asynchronously — the gate doesn't block on
 * the server response since it's already been validated client-side.
 */
export function EmailGate({ firstName, onUnlock, allowSkip = true }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email — or skip below.");
      return;
    }
    setBusy(true);
    try {
      // Fire-and-forget the subscribe call; even if it fails, let the
      // user see their cards. We still surface real network errors
      // because that usually means their device is offline.
      const res = await fetch("/api/wrapped/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, firstName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string })?.error ?? "Couldn't subscribe. Try again or skip.");
        setBusy(false);
        return;
      }
      onUnlock(trimmed);
    } catch {
      setError("Network issue — try again or skip.");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/[0.10] via-purple/[0.08] to-transparent p-6 md:p-8">
      <p className="font-display text-coral text-[11px] uppercase tracking-[0.3em] mb-2">
        Almost there {firstName ? `· ${firstName}` : ""}
      </p>
      <p className="font-display text-off-white text-3xl md:text-4xl uppercase tracking-tight leading-[1.05] max-w-2xl">
        See the cards — and the
        <br />
        <span className="text-coral">Saturday Spin in your inbox.</span>
      </p>
      <p className="mt-4 max-w-2xl text-off-white/75 text-sm md:text-base leading-relaxed">
        We&apos;ll send you the year&apos;s sharpest cycling lessons from the podcast,
        no spam — drop your email to unlock the cards. Already on the list?
        Same email, you&apos;ll only ever get one copy.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-3 max-w-xl">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@somewhere.cc"
          className="flex-1 bg-white/[0.06] border border-white/10 rounded-md px-3 py-3 text-off-white text-base placeholder:text-off-white/40 focus:outline-none focus:border-coral/60"
          maxLength={200}
          required
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-coral px-6 py-3 font-display text-base uppercase tracking-[0.18em] text-charcoal hover:bg-coral-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {busy ? "Subscribing…" : "Reveal cards →"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-coral text-sm" role="alert">
          {error}
        </p>
      )}

      {allowSkip && (
        <p className="mt-4 text-off-white/45 text-xs">
          <button
            type="button"
            onClick={() => onUnlock(null)}
            className="underline hover:text-off-white/70 transition"
          >
            Skip · just show me the cards
          </button>
        </p>
      )}
    </div>
  );
}
