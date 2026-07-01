/**
 * Roadman Fantasy Tour — rider pricing draft generator.
 *
 * Produces the FIRST DRAFT of the pricing sheet from PCS points and a
 * classification. Pricing is editorial judgement: Anthony reviews and
 * signs off the full sheet in the admin pricing editor (CSV in/out)
 * before launch (Section 4.2). Nothing here is final.
 *
 * The curve is rank-based and deliberately top-heavy so a "galáctico"
 * squad is impossible: the top rider costs 24, and three 20+ riders
 * blow most of a 100-credit budget on their own.
 */

export interface PricingInput {
  riderId: number;
  /** PCS points, last 12 months — the primary signal. */
  pcsPoints: number;
  riderClass: "gc" | "sprint" | "climb" | "break";
}

export interface PricedRider {
  riderId: number;
  price: number;
}

export const PRICE_MAX = 24;
export const PRICE_MIN = 4;

/**
 * Rank-based exponential decay from PRICE_MAX down to PRICE_MIN.
 * The exponent (2.2) keeps the top ~5 riders in the 18–24 band, the
 * next ~20 in 10–17, and the long tail of domestiques at 4–6 so the
 * min-one-cheap-rider rule always has plenty of stock.
 */
export function generateDraftPrices(inputs: PricingInput[]): PricedRider[] {
  const sorted = [...inputs].sort((a, b) => b.pcsPoints - a.pcsPoints);
  const n = sorted.length;
  return sorted.map((rider, idx) => {
    const rankFraction = n <= 1 ? 0 : idx / (n - 1);
    const curve = Math.pow(1 - rankFraction, 2.2);
    const price = Math.round(PRICE_MIN + (PRICE_MAX - PRICE_MIN) * curve);
    return { riderId: rider.riderId, price };
  });
}
