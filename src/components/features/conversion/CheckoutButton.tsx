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

/**
 * Stripe Checkout button.
 *
 * Primary path (zero-risk): direct-link to a Stripe Payment Link. This
 * works without any server-side state and is immune to env-var drift.
 *
 * If the caller passes a dynamic `priceId` (e.g. for a future coaching
 * product), the component falls back to the /api/checkout session flow.
 */
export function CheckoutButton({
  priceId,
  className = "",
  children,
  paymentLink,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resolvedLink = paymentLink ?? (priceId ? null : STRENGTH_TRAINING_PAYMENT_LINK);

  const handleCheckout = async () => {
    setErrorMsg(null);

    // Fast path: Stripe Payment Link. No network round-trip through our
    // backend, just a single navigation to Stripe's hosted checkout.
    if (resolvedLink) {
      window.location.href = resolvedLink;
      return;
    }

    setLoading(true);
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
          "Checkout could not start. Please email hello@roadmancycling.com and we'll send you a working link.",
        );
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setErrorMsg(
        "Network error. Please check your connection and try again.",
      );
    } finally {
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
