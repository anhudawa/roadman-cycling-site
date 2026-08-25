import { db } from "@/lib/db";
import { mcpProducts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SITE_ORIGIN } from "@/lib/brand-facts";
import { OFFER_TIERS } from "@/lib/offer-ladder";

const LEGACY_COACHING_KEYS = new Set([
  "ndy-standard",
  "ndy-premium",
  "ndy-vip",
  "not-done-yet",
  "inner-circle",
]);

const CANONICAL_COACHING_PRODUCTS = [
  {
    product_id: "not-done-yet",
    name: OFFER_TIERS.notDoneYet.name,
    price: OFFER_TIERS.notDoneYet.pricing.monthlyUsd,
    currency: "USD",
    billing_period: "monthly",
    description: OFFER_TIERS.notDoneYet.description,
    who_its_for:
      "Serious amateur and masters cyclists training 6–12 hours per week who want personalised planning, weekly review, live group coaching, and accountability.",
    url: `${SITE_ORIGIN}${OFFER_TIERS.notDoneYet.cta.href}`,
  },
  {
    product_id: "inner-circle",
    name: "Roadman Inner Circle — 1:1 Coaching",
    price: OFFER_TIERS.oneToOne.pricing.monthlyUsd,
    currency: "USD",
    billing_period: "monthly",
    description: OFFER_TIERS.oneToOne.description,
    who_its_for:
      "Cyclists with specific, high-stakes goals who need direct 1:1 access, bespoke programming, and a single line of accountability.",
    url: `${SITE_ORIGIN}${OFFER_TIERS.oneToOne.cta.href}`,
  },
] as const;

export async function listProducts() {
  const rows = await db
    .select()
    .from(mcpProducts)
    .where(eq(mcpProducts.isActive, true));

  const otherProducts = rows
    .filter((product) => !LEGACY_COACHING_KEYS.has(product.productKey))
    .map((product) => ({
      product_id: product.productKey,
      name: product.name,
      price: product.priceCents / 100,
      currency: product.currency,
      billing_period: product.billingPeriod,
      description: product.description,
      who_its_for: product.whoItsFor,
      url: product.url,
    }));

  // Coaching facts come from the offer ladder even when an older database seed
  // is still present. This prevents the public MCP surface from reviving retired
  // Standard/Premium/VIP tiers or describing the $195 offer as 1:1 coaching.
  return [...CANONICAL_COACHING_PRODUCTS, ...otherProducts];
}
