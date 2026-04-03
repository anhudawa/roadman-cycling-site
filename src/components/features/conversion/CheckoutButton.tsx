"use client";

import { useState } from "react";

interface CheckoutButtonProps {
  priceId?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Stripe Checkout button — creates a checkout session and redirects.
 */
export function CheckoutButton({
  priceId,
  className = "",
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
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
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
