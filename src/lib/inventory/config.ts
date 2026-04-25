import type { InventoryType, PremiumTier } from '@/lib/inventory/types';

/**
 * Base rack rates in USD per episode/send for each inventory type.
 * These are the per-unit prices before any event premium or duration discount.
 * Anchored from real sponsor rates: TrainingPeaks pays $625/read (loyalty rate).
 * New sponsors pay a slight discount per-read but buy all 3 eps/week.
 */
export const BASE_RATES: Record<InventoryType, number> = {
  podcast_preroll: 650,
  podcast_midroll: 500,
  podcast_endroll: 250,
  newsletter_dedicated: 500,
  newsletter_banner: 200,
  newsletter_classified: 100,
  youtube_integration: 1500,
} as const;

/**
 * Currency for all public-facing pricing.
 */
export const CURRENCY = 'USD' as const;

/**
 * Duration discount percentages. Longer deals = lower per-episode rate.
 */
export const DURATION_DISCOUNTS: Record<number, number> = {
  1: 0,      // 1 month: full price
  3: 0.10,   // 3 months: 10% off
  6: 0.20,   // 6 months: 20% off
  12: 0.30,  // 12 months: 30% off
  24: 0.35,  // multi-year: 35% off
} as const;

/**
 * Event premium multipliers by tier.
 * Tier 1: Major events (Tour de France, Worlds, Olympics) -- +15%
 * Tier 2: Grand tours and classics blocks (Giro, Vuelta, Spring Classics) -- +10%
 * Tier 3: Monuments, smaller events, Roadman-owned -- flat (no premium)
 */
export const EVENT_MULTIPLIERS: Record<PremiumTier, number> = {
  '1': 1.15,
  '2': 1.10,
  '3': 1.00,
} as const;

/**
 * Calculate the rack rate for a slot given its type and the event's premium tier.
 * If no event is linked, tier defaults to '3' (no premium).
 */
export function calculateRackRate(
  inventoryType: InventoryType,
  premiumTier?: PremiumTier | null,
): number {
  const base = BASE_RATES[inventoryType];
  const multiplier = EVENT_MULTIPLIERS[premiumTier ?? '3'];
  // Round to 2 decimal places to avoid floating point drift
  return Math.round(base * multiplier * 100) / 100;
}

/**
 * Airtable table names. Single source of truth so they aren't scattered as strings.
 */
export const TABLES = {
  INVENTORY: 'inventory',
  EVENTS: 'events',
  SPONSORS: 'sponsors',
} as const;
