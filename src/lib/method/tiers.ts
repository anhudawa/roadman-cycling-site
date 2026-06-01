/**
 * The Roadman Method — pricing tiers (single source of truth).
 *
 * Both the sales page and the checkout flow must agree on price, and the
 * Stripe API must charge the amount the rider actually selected. Before this
 * existed the checkout always charged the Standard price regardless of tier,
 * so Premium buyers were undercharged and under-served. Keep all tier facts
 * here so the form label, the Stripe line item, and the entitlement gate can
 * never drift apart again.
 *
 * Production should set per-tier Stripe Price IDs so pricing is editable in
 * the dashboard without a deploy:
 *   STRIPE_METHOD_PRICE_ID          — Standard ($297)
 *   STRIPE_METHOD_PREMIUM_PRICE_ID  — Premium ($397)
 * Falling back to inline `price_data` only when a Price ID is unset.
 */

export const METHOD_TIERS = ["standard", "premium"] as const;
export type MethodTier = (typeof METHOD_TIERS)[number];

export interface MethodTierInfo {
  tier: MethodTier;
  /** Default amount in cents (USD) when no Stripe Price ID is configured. */
  defaultPriceCents: number;
  /** Env var holding a pre-created Stripe Price ID for this tier. */
  priceIdEnvKey: string;
  /** Env var holding an override unit amount (cents) for this tier. */
  priceCentsEnvKey: string;
  /** Short display price, e.g. "$297". */
  priceLabel: string;
  /** Line shown under the checkout CTA. */
  checkoutLabel: string;
  /** Human name for emails / dashboards. */
  name: string;
}

export const METHOD_TIER_INFO: Record<MethodTier, MethodTierInfo> = {
  standard: {
    tier: "standard",
    defaultPriceCents: 29700,
    priceIdEnvKey: "STRIPE_METHOD_PRICE_ID",
    priceCentsEnvKey: "STRIPE_METHOD_PRICE_CENTS",
    priceLabel: "$297",
    checkoutLabel: "$297 · One payment · Lifetime access",
    name: "The Roadman Method — Standard",
  },
  premium: {
    tier: "premium",
    defaultPriceCents: 39700,
    priceIdEnvKey: "STRIPE_METHOD_PREMIUM_PRICE_ID",
    priceCentsEnvKey: "STRIPE_METHOD_PREMIUM_PRICE_CENTS",
    priceLabel: "$397",
    checkoutLabel: "$397 · One payment · Personalised plan + plan review",
    name: "The Roadman Method — Premium",
  },
};

/** Coerce arbitrary input to a valid tier, defaulting to standard. */
export function normaliseTier(value: unknown): MethodTier {
  return value === "premium" ? "premium" : "standard";
}

/** True when the enrollment is entitled to Premium-only fulfilment. */
export function isPremiumTier(
  enrollment: { tier?: string | null } | null | undefined,
): boolean {
  return enrollment?.tier === "premium";
}
