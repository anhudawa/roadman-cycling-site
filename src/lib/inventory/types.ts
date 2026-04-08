// ---------------------------------------------------------------------------
// Inventory Type System
// ---------------------------------------------------------------------------

export type InventoryType =
  | 'podcast_preroll'
  | 'podcast_midroll'
  | 'podcast_endroll'
  | 'newsletter_dedicated'
  | 'newsletter_banner'
  | 'newsletter_classified'
  | 'youtube_integration';

export type InventoryStatus = 'available' | 'held' | 'sold' | 'live';

export type ReadStatus =
  | 'pending'
  | 'script_written'
  | 'read_recorded'
  | 'approved'
  | 'live';

export type EventType =
  | 'grand_tour'
  | 'monument'
  | 'classics_block'
  | 'world_championship'
  | 'olympics'
  | 'roadman_owned'
  | 'winter';

export type EventStatus = 'upcoming' | 'active' | 'completed';

export type PremiumTier = '1' | '2' | '3';

export type SponsorTier =
  | 'spotlight'
  | 'quarter_starter'
  | 'quarter_standard'
  | 'quarter_premium'
  | 'annual';

// ---------------------------------------------------------------------------
// Core Entities
// ---------------------------------------------------------------------------

export interface Slot {
  id: string;
  slotId: number;
  inventoryType: InventoryType;
  episodeNumber: number | null;
  episodeTitle: string | null;
  plannedPublishDate: string; // ISO 8601
  position: number;
  status: InventoryStatus;
  sponsorId: string | null;
  ratePaid: number | null;
  rackRate: number;
  campaignId: string | null;
  briefUrl: string | null;
  scriptText: string | null;
  readStatus: ReadStatus | null;
  eventId: string | null;
  notes: string | null;
}

export interface SlotWithRelations extends Slot {
  sponsor: Sponsor | null;
  event: Event | null;
}

export interface Event {
  id: string;
  eventName: string;
  eventType: EventType;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  premiumTier: PremiumTier;
  coveragePlan: string | null;
  heroImageUrl: string | null;
  status: EventStatus;
}

export interface EventWithInventory extends Event {
  inventory: Slot[];
}

export interface Sponsor {
  id: string;
  brandName: string;
  contactName: string | null;
  contactEmail: string;
  tier: SponsorTier | null;
  contractStart: string | null;
  contractEnd: string | null;
  totalValue: number | null;
  renewalDate: string | null;
  lastContact: string | null;
  notes: string | null;
  logoUrl: string | null;
}

export interface SponsorWithInventory extends Sponsor {
  inventory: Slot[];
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface DateRange {
  from: string; // ISO 8601
  to: string; // ISO 8601
}

export interface SlotFilters {
  inventoryType?: InventoryType | InventoryType[];
  status?: InventoryStatus | InventoryStatus[];
  sponsorId?: string;
  eventId?: string;
  dateRange?: DateRange;
  campaignId?: string;
}

export interface EventFilters {
  eventType?: EventType | EventType[];
  status?: EventStatus | EventStatus[];
  dateRange?: DateRange;
  premiumTier?: PremiumTier;
}

export interface SponsorFilters {
  tier?: SponsorTier | SponsorTier[];
  search?: string; // free-text search on brand_name
}

// ---------------------------------------------------------------------------
// Aggregation Views
// ---------------------------------------------------------------------------

export interface AvailabilityByMonth {
  month: string; // YYYY-MM
  byType: Record<InventoryType, { total: number; available: number }>;
}

export interface UtilisationByMonth {
  month: string; // YYYY-MM
  byType: Record<
    InventoryType,
    { total: number; sold: number; held: number; utilisation: number }
  >;
}
