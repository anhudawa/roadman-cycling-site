"use client";

import { useState } from "react";

interface CheckoutButtonProps {
  priceId?: string;
  className?: string;
  children: React.ReactNode;
  /**
   * Override the Stripe Payment Link. If omitted, the component defaults
   * to the Strength Training course Payment Link (PAYMENT_LINK below).
   */
  paymentLink?: string;
  /**
   * Product identifier — used for analytics events + event logging.
   * Defaults to "strength-training".
   */
  product?: string;
  /**
   * Product value in USD for pixel events. Defaults to 65 (Strength
   * Training). Set explicitly for future products.
   */
  value?: number;
  /**
   * Product name for pixel events. Defaults to "Strength Training Course".
   */
  productName?: string;
}

/**
 * Stripe Payment Link for the Strength Training course ($65 one-off).
 *
 * Created 2026-04-16 using the live Stripe account so checkout works
 * without any server-side API call — removes dependency on
 * STRIPE_SECRET_KEY being correctly set in Vercel. Payment Links are
 * hosted on Stripe's own infra and don't go through our API route.
 *
 * Redirects to /strength-training/success on completion.
 */
const STRENGTH_TRAINING_PAYMENT_LINK =
  "https://buy.stripe.com/00w3cw9RJ4LIc7C6IIenS0c";

/** Minimum spinner display time (ms) so checkouts feel intentional not jumpy. */
const MIN_LOADING_MS = 250;

/**
 * Fire Meta Pixel InitiateCheckout + GA event before redirect. Consent-
 * gated via ConsentAwarePixel — silently no-ops if consent denied or
 * pixel blocked. Guarded against all edge cases so it can never throw
 * and block the actual checkout.
 */
function trackInitiateCheckout(
  product: string,
  productName: string,
  value: number,
) {
  if (typeof window === "undefined") return;
  try {
    const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
    if (typeof fbq === "function") {
      fbq("track", "InitiateCheckout", {
        content_name: productName,
        content_category: "digital_product",
        content_ids: [product],
        value,
        currency: "USD",
      });
    }
  } catch {
    /* pixel failure never blocks checkout */
  }
  try {
    const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (typeof gtag === "function") {
      gtag("event", "begin_checkout", {
        currency: "USD",
        value,
        items: [{ id: product, name: productName, quantity: 1, price: value }],
      });
    }
  } catch {
    /* ignore */
  }
}

/**
 * Log the checkout attempt to our event store (fire-and-forget, no await).
 * Useful for seeing checkout-click rates independent of what Stripe reports
 * back. Silent on failure.
 */
function logCheckoutAttempt(product: string) {
  if (typeof window === "undefined") return;
  try {
    navigator.sendBeacon?.(
      "/api/events",
      JSON.stringify({
        type: "checkout_initiated",
        page: window.location.pathname,
        product,
      }),
    );
  } catch {
    /* sendBeacon not supported — skip, not fatal */
  }
}

/**
 * Stripe Checkout button.
 *
 * Primary path (zero-risk): direct-link to a Stripe Payment Link. This
 * works without any server-side state and is immune to env-var drift.
 *
 * If the caller passes a dynamic `priceId` (e.g. for a future coaching
 * product), the component falls back to the /api/checkout session flow.
 *
 * Instruments: Meta Pixel InitiateCheckout, GA begin_checkout, server-
 * side checkout_initiated event. All analytics fire BEFORE redirect so
 * they're captured even when the page navigates away.
 */
export function CheckoutButton({
  priceId,
  className = "",
  children,
  paymentLink,
  product = "strength-training",
  value = 65,
  productName = "Strength Training Course",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resolvedLink = paymentLink ?? (priceId ? null : STRENGTH_TRAINING_PAYMENT_LINK);

  const handleCheckout = async () => {
    setErrorMsg(null);

    // Analytics + event log BEFORE redirect — otherwise they get lost
    // when the browser navigates away.
    trackInitiateCheckout(product, productName, value);
    logCheckoutAttempt(product);

    // Fast path: Stripe Payment Link. No network round-trip through our
    // backend, just a single navigation to Stripe's hosted checkout.
    if (resolvedLink) {
      window.location.href = resolvedLink;
      return;
    }

    setLoading(true);
    const start = Date.now();
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/strength-training/success`,
          cancelUrl: `${window.location.origin}/strength-training`,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        setErrorMsg(
          `Checkout could not start (${data.error || "unknown error"}). Email hello@roadmancycling.com and we'll send you a direct payment link.`,
        );
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setErrorMsg(
        "Network error. Please check your connection and try again, or email hello@roadmancycling.com.",
      );
    } finally {
      // Hold the spinner at least MIN_LOADING_MS so rapid clicks don't
      // produce flickery UX.
      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
      }
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`
          inline-flex items-center justify-center gap-2
          font-heading tracking-wider uppercase
          rounded-md transition-all cursor-pointer
          active:scale-[0.97] active:duration-75
          bg-charcoal hover:bg-deep-purple disabled:opacity-50
          text-off-white px-10 py-4 text-lg
          ${className}
        `}
      >
        {loading ? "PROCESSING..." : children}
      </button>
      {errorMsg && (
        <p className="text-coral text-xs max-w-xs text-center mt-1">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
