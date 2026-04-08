import type { InventoryType, PremiumTier } from '@/lib/inventory/types';

/**
 * Base rack rates in GBP for each inventory type.
 * These are the starting prices before any event premium is applied.
 */
export const BASE_RATES: Record<InventoryType, number> = {
  podcast_preroll: 900,
  podcast_midroll: 1200,
  podcast_endroll: 500,
  newsletter_dedicated: 1800,
  newsletter_banner: 600,
  newsletter_classified: 400,
  youtube_integration: 2000,
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
