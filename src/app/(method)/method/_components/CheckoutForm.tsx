"use client";

import { useState, type FormEvent } from "react";
import { METHOD_TIER_INFO, normaliseTier, type MethodTier } from "@/lib/method/tiers";

export function CheckoutForm({ tier = "standard" }: { tier?: MethodTier }) {
  const selectedTier = normaliseTier(tier);
  const priceDisplay =
    process.env.NEXT_PUBLIC_METHOD_PRICE_LABEL ??
    METHOD_TIER_INFO[selectedTier].checkoutLabel;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/method/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          tier: selectedTier,
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        checkoutUrl?: string;
        error?: string;
      };
      if (!res.ok || !payload.checkoutUrl) {
        setError(payload.error ?? "Could not start checkout. Try again.");
        return;
      }
      // Hard navigation — Stripe Checkout is hosted off-site.
      window.location.assign(payload.checkoutUrl);
    } catch {
      setError("Network error — please try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <p className="font-heading uppercase tracking-wider text-coral text-sm">
        {priceDisplay}
      </p>
      <input type="hidden" name="tier" value={selectedTier} />
      <label className="grid gap-2">
        <span className="font-heading text-xs tracking-[0.25em] text-foreground-muted uppercase">
          Your name
        </span>
        <input
          type="text"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-white/15 bg-charcoal/80 px-4 py-3 text-off-white placeholder:text-foreground-muted/60 focus:border-coral focus:outline-none"
        />
      </label>
      <label className="grid gap-2">
        <span className="font-heading text-xs tracking-[0.25em] text-foreground-muted uppercase">
          Email
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-white/15 bg-charcoal/80 px-4 py-3 text-off-white placeholder:text-foreground-muted/60 focus:border-coral focus:outline-none"
          placeholder="you@example.com"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-coral">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-coral hover:bg-coral-hover disabled:opacity-60 px-6 py-4 font-heading uppercase tracking-wider text-off-white shadow-[var(--shadow-glow-coral)] transition-all active:scale-[0.97] text-lg"
      >
        {pending ? "Opening checkout..." : "Join The Method"}
      </button>
    </form>
  );
}
