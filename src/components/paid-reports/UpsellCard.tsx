"use client";

import { useEffect, useState } from "react";
import {
  PAID_REPORT_EVENTS,
  trackPaidReport,
} from "@/lib/analytics/paid-report-events";

/**
 * Paid-report upsell card used on /results/[tool]/[slug] and tool
 * result pages. Small client-side form — captures email confirmation
 * (pre-filled from the saved result) and opens Stripe checkout via
 * /api/reports/checkout.
 *
 * Intentionally avoids pulling in a heavier form library; this is one
 * input + one button and the happy path is a redirect.
 */

interface UpsellCardProps {
  productSlug: string;
  productName: string;
  priceCents: number;
  currency: string;
  description: string;
  toolResultSlug?: string | null;
  defaultEmail?: string | null;
  utm?: Record<string, string | null> | null;
}

function formatPrice(cents: number, currency: string): string {
  const major = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  switch (currency.toLowerCase()) {
    case "eur":
      return `€${major}`;
    case "gbp":
      return `£${major}`;
    case "usd":
      return `$${major}`;
    default:
      return `${major} ${currency.toUpperCase()}`;
  }
}

export function UpsellCard({
  productSlug,
  productName,
  priceCents,
  currency,
  description,
  toolResultSlug,
  defaultEmail,
  utm,
}: UpsellCardProps) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Impression beacon — fires once when the card first mounts so the
  // upsell-view vs checkout-start ratio is measurable.
  useEffect(() => {
    trackPaidReport({
      name: PAID_REPORT_EVENTS.UPSELL_VIEW,
      productSlug,
      toolResultSlug: toolResultSlug ?? undefined,
    });
  }, [productSlug, toolResultSlug]);

  async function handleCheckout() {
    if (!email) {
      setError("Enter the email you want the report sent to.");
      return;
    }
    trackPaidReport({
      name: PAID_REPORT_EVENTS.CHECKOUT_START,
      productSlug,
      toolResultSlug: toolResultSlug ?? undefined,
    });
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          email,
          toolResultSlug: toolResultSlug ?? undefined,
          utm: utm ?? undefined,
        }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Could not start checkout.");
      }
      window.location.assign(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-background-elevated p-6 md:p-8">
      <p className="font-heading text-coral text-xs tracking-widest mb-2">
        GET THE FULL ROADMAN REPORT
      </p>
      <h3 className="font-heading text-off-white text-xl md:text-2xl mb-3 leading-tight">
        {productName.toUpperCase()}
      </h3>
      <p className="text-foreground-muted text-sm mb-5 leading-relaxed">
        {description}
      </p>
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-heading text-off-white text-3xl">
          {formatPrice(priceCents, currency)}
        </span>
        <span className="text-foreground-subtle text-xs">one-off payment · delivered instantly</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-md bg-charcoal border border-white/10 text-off-white placeholder-foreground-subtle px-4 py-3 text-sm focus:border-coral focus:outline-none"
          aria-label="Email for report delivery"
        />
        <button
          type="button"
          disabled={loading}
          onClick={handleCheckout}
          className="rounded-md bg-coral text-off-white hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 text-sm font-heading tracking-wider uppercase transition-colors"
          data-track="paid_report_checkout_start"
          data-product={productSlug}
        >
          {loading ? "Redirecting…" : "Get the report"}
        </button>
      </div>
      {error ? (
        <p className="text-coral text-xs mt-3" role="alert">
          {error}
        </p>
      ) : null}
      <p className="text-foreground-subtle text-xs mt-3">
        Secure checkout by Stripe. Delivered within minutes to the email above.
      </p>
    </div>
  );
}
