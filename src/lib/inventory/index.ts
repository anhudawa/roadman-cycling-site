/**
 * Sponsor Inventory -- Public API
 *
 * All Airtable access is encapsulated here. No component or route should
 * import from `./airtable` directly.
 */

import {
  listRecords,
  getRecord,
  createRecords,
  updateRecords,
  mapFieldsFromAirtable,
  mapFieldsToAirtable,
  type AirtableRecord,
} from './airtable';
import { calculateRackRate, TABLES } from './config';
import type {
  Slot,
  SlotWithRelations,
  SlotFilters,
  Event,
  EventWithInventory,
  EventFilters,
  Sponsor,
  SponsorWithInventory,
  SponsorFilters,
  DateRange,
  AvailabilityByMonth,
  UtilisationByMonth,
  InventoryType,
  PremiumTier,
} from './types';

// Re-export types so consumers only need one import path
export type {
  Slot,
  SlotWithRelations,
  SlotFilters,
  Event,
  EventWithInventory,
  EventFilters,
  Sponsor,
  SponsorWithInventory,
  SponsorFilters,
  DateRange,
  AvailabilityByMonth,
  UtilisationByMonth,
  InventoryType,
  InventoryStatus,
  ReadStatus,
  EventType,
  EventStatus,
  PremiumTier,
  SponsorTier,
} from './types';

export { calculateRackRate, BASE_RATES, EVENT_MULTIPLIERS } from './config';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const INVENTORY_TYPES: InventoryType[] = [
  'podcast_preroll',
  'podcast_midroll',
  'podcast_endroll',
  'newsletter_dedicated',
  'newsletter_banner',
  'newsletter_classified',
  'youtube_integration',
];

function recordToSlot(record: AirtableRecord): Slot {
  const fields = mapFieldsFromAirtable<Record<string, unknown>>(record.fields);
  return {
    id: record.id,
    slotId: fields.slotId as number,
    inventoryType: fields.inventoryType as Slot['inventoryType'],
    episodeNumber: (fields.episodeNumber as number) ?? null,
    episodeTitle: (fields.episodeTitle as string) ?? null,
    plannedPublishDate: fields.plannedPublishDate as string,
    position: fields.position as number,
    status: (fields.status as Slot['status']) ?? 'available',
    sponsorId: extractLinkId(fields.sponsor),
    ratePaid: (fields.ratePaid as number) ?? null,
    rackRate: (fields.rackRate as number) ?? 0,
    campaignId: (fields.campaignId as string) ?? null,
    briefUrl: (fields.briefUrl as string) ?? null,
    scriptText: (fields.scriptText as string) ?? null,
    readStatus: (fields.readStatus as Slot['readStatus']) ?? null,
    eventId: extractLinkId(fields.event),
    notes: (fields.notes as string) ?? null,
  };
}

function recordToEvent(record: AirtableRecord): Event {
  const fields = mapFieldsFromAirtable<Record<string, unknown>>(record.fields);
  return {
    id: record.id,
    eventName: fields.eventName as string,
    eventType: fields.eventType as Event['eventType'],
    startDate: fields.startDate as string,
    endDate: fields.endDate as string,
    premiumTier: (fields.premiumTier as PremiumTier) ?? '3',
    coveragePlan: (fields.coveragePlan as string) ?? null,
    heroImageUrl: (fields.heroImageUrl as string) ?? null,
    status: (fields.status as Event['status']) ?? 'upcoming',
  };
}

function recordToSponsor(record: AirtableRecord): Sponsor {
  const fields = mapFieldsFromAirtable<Record<string, unknown>>(record.fields);
  return {
    id: record.id,
    brandName: fields.brandName as string,
    contactName: (fields.contactName as string) ?? null,
    contactEmail: fields.contactEmail as string,
    tier: (fields.tier as Sponsor['tier']) ?? null,
    contractStart: (fields.contractStart as string) ?? null,
    contractEnd: (fields.contractEnd as string) ?? null,
    totalValue: (fields.totalValue as number) ?? null,
    renewalDate: (fields.renewalDate as string) ?? null,
    lastContact: (fields.lastContact as string) ?? null,
    notes: (fields.notes as string) ?? null,
    logoUrl: (fields.logoUrl as string) ?? null,
    brandAliases: (fields.brandAliases as string) ?? undefined,
  };
}

/**
 * Airtable linked record fields come back as an array of record IDs.
 * Extract the first one, or return null.
 */
function extractLinkId(value: unknown): string | null {
  if (Array.isArray(value) && value.length > 0) return value[0] as string;
  if (typeof value === 'string') return value;
  return null;
}

// ---------------------------------------------------------------------------
// Slot filter -> Airtable formula builder
// ---------------------------------------------------------------------------

function buildSlotFormula(filters?: SlotFilters): string | undefined {
  if (!filters) return undefined;
  const parts: string[] = [];

  if (filters.inventoryType) {
    const types = Array.isArray(filters.inventoryType)
      ? filters.inventoryType
      : [filters.inventoryType];
    const or = types.map((t) => `{inventory_type}='${t}'`).join(',');
    parts.push(types.length === 1 ? `{inventory_type}='${types[0]}'` : `OR(${or})`);
  }

  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    const or = statuses.map((s) => `{status}='${s}'`).join(',');
    parts.push(statuses.length === 1 ? `{status}='${statuses[0]}'` : `OR(${or})`);
  }

  if (filters.sponsorId) {
    parts.push(`FIND('${filters.sponsorId}', ARRAYJOIN({sponsor}))`);
  }

  if (filters.eventId) {
    parts.push(`FIND('${filters.eventId}', ARRAYJOIN({event}))`);
  }

  if (filters.campaignId) {
    parts.push(`{campaign_id}='${filters.campaignId}'`);
  }

  if (filters.dateRange) {
    parts.push(`{planned_publish_date}>='${filters.dateRange.from}'`);
    parts.push(`{planned_publish_date}<='${filters.dateRange.to}'`);
  }

  if (parts.length === 0) return undefined;
  return parts.length === 1 ? parts[0] : `AND(${parts.join(',')})`;
}

function buildEventFormula(filters?: EventFilters): string | undefined {
  if (!filters) return undefined;
  const parts: string[] = [];

  if (filters.eventType) {
    const types = Array.isArray(filters.eventType) ? filters.eventType : [filters.eventType];
    const or = types.map((t) => `{event_type}='${t}'`).join(',');
    parts.push(types.length === 1 ? `{event_type}='${types[0]}'` : `OR(${or})`);
  }

  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    const or = statuses.map((s) => `{status}='${s}'`).join(',');
    parts.push(statuses.length === 1 ? `{status}='${statuses[0]}'` : `OR(${or})`);
  }

  if (filters.premiumTier) {
    parts.push(`{premium_tier}='${filters.premiumTier}'`);
  }

  if (filters.dateRange) {
    // Events overlapping the date range
    parts.push(`{end_date}>='${filters.dateRange.from}'`);
    parts.push(`{start_date}<='${filters.dateRange.to}'`);
  }

  if (parts.length === 0) return undefined;
  return parts.length === 1 ? parts[0] : `AND(${parts.join(',')})`;
}

function buildSponsorFormula(filters?: SponsorFilters): string | undefined {
  if (!filters) return undefined;
  const parts: string[] = [];

  if (filters.tier) {
    const tiers = Array.isArray(filters.tier) ? filters.tier : [filters.tier];
    const or = tiers.map((t) => `{tier}='${t}'`).join(',');
    parts.push(tiers.length === 1 ? `{tier}='${tiers[0]}'` : `OR(${or})`);
  }

  if (filters.search) {
    // Case-insensitive search on brand_name
    parts.push(`FIND(LOWER('${filters.search}'), LOWER({brand_name}))`);
  }

  if (parts.length === 0) return undefined;
  return parts.length === 1 ? parts[0] : `AND(${parts.join(',')})`;
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

export async function getSlots(filters?: SlotFilters): Promise<Slot[]> {
  const records = await listRecords(TABLES.INVENTORY, {
    filterByFormula: buildSlotFormula(filters),
    sort: [{ field: 'planned_publish_date', direction: 'asc' }],
  });
  return records.map(recordToSlot);
}

export async function getSlotById(id: string): Promise<SlotWithRelations | null> {
  const record = await getRecord(TABLES.INVENTORY, id);
  if (!record) return null;

  const slot = recordToSlot(record);

  // Hydrate relations
  const [sponsor, event] = await Promise.all([
    slot.sponsorId ? getRecord(TABLES.SPONSORS, slot.sponsorId) : null,
    slot.eventId ? getRecord(TABLES.EVENTS, slot.eventId) : null,
  ]);

  return {
    ...slot,
    sponsor: sponsor ? recordToSponsor(sponsor) : null,
    event: event ? recordToEvent(event) : null,
  };
}

export async function createSlot(
  data: Omit<Slot, 'id' | 'slotId' | 'rackRate'>,
): Promise<Slot> {
  // Find overlapping event for auto-assignment
  const event = await findEventForDate(data.plannedPublishDate);
  const rackRate = calculateRackRate(
    data.inventoryType,
    event?.premiumTier,
  );

  const fields = mapFieldsToAirtable({
    ...data,
    rackRate,
    // Link to event if one was found
    ...(event ? { event: [event.id] } : {}),
    // Ensure sponsor is wrapped in array for Airtable link field
    ...(data.sponsorId ? { sponsor: [data.sponsorId] } : {}),
  });

  // Remove the sponsorId key since we mapped it to `sponsor` as array
  delete fields.sponsor_id;
  // eventId was never a real Airtable field -- it's the link field `event`
  delete fields.event_id;

  const [created] = await createRecords(TABLES.INVENTORY, [fields]);
  return recordToSlot(created);
}

export async function updateSlot(
  id: string,
  data: Partial<Omit<Slot, 'id' | 'slotId'>>,
): Promise<Slot> {
  // If date changed, recalculate event assignment and rack rate
  let extraFields: Record<string, unknown> = {};

  if (data.plannedPublishDate || data.inventoryType) {
    // We need the current slot to know the full picture
    const current = await getRecord(TABLES.INVENTORY, id);
    if (!current) throw new Error(`Slot ${id} not found`);
    const currentSlot = recordToSlot(current);

    const publishDate = data.plannedPublishDate ?? currentSlot.plannedPublishDate;
    const invType = data.inventoryType ?? currentSlot.inventoryType;

    const event = await findEventForDate(publishDate);
    const rackRate = calculateRackRate(invType, event?.premiumTier);

    extraFields = {
      rackRate,
      ...(event ? { event: [event.id] } : { event: [] }),
    };
  }

  const fields = mapFieldsToAirtable({ ...data, ...extraFields });

  // Fix link fields
  if (data.sponsorId !== undefined) {
    fields.sponsor = data.sponsorId ? [data.sponsorId] : [];
    delete fields.sponsor_id;
  }
  delete fields.event_id;

  const [updated] = await updateRecords(TABLES.INVENTORY, [
    { id, fields },
  ]);
  return recordToSlot(updated);
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export async function getEvents(filters?: EventFilters): Promise<Event[]> {
  const records = await listRecords(TABLES.EVENTS, {
    filterByFormula: buildEventFormula(filters),
    sort: [{ field: 'start_date', direction: 'asc' }],
  });
  return records.map(recordToEvent);
}

export async function getEventById(id: string): Promise<EventWithInventory | null> {
  const record = await getRecord(TABLES.EVENTS, id);
  if (!record) return null;

  const event = recordToEvent(record);

  // Fetch all inventory linked to this event
  const inventory = await getSlots({ eventId: id });

  return { ...event, inventory };
}

// ---------------------------------------------------------------------------
// Sponsors
// ---------------------------------------------------------------------------

export async function getSponsors(filters?: SponsorFilters): Promise<Sponsor[]> {
  const records = await listRecords(TABLES.SPONSORS, {
    filterByFormula: buildSponsorFormula(filters),
    sort: [{ field: 'brand_name', direction: 'asc' }],
  });
  return records.map(recordToSponsor);
}

export async function getSponsorById(id: string): Promise<SponsorWithInventory | null> {
  const record = await getRecord(TABLES.SPONSORS, id);
  if (!record) return null;

  const sponsor = recordToSponsor(record);
  const inventory = await getSlots({ sponsorId: id });

  return { ...sponsor, inventory };
}

export async function createSponsor(
  data: Omit<Sponsor, 'id'>,
): Promise<Sponsor> {
  const fields = mapFieldsToAirtable(data);
  const [created] = await createRecords(TABLES.SPONSORS, [fields]);
  return recordToSponsor(created);
}

export async function updateSponsor(
  id: string,
  data: Partial<Omit<Sponsor, 'id'>>,
): Promise<Sponsor> {
  const fields = mapFieldsToAirtable(data);
  const [updated] = await updateRecords(TABLES.SPONSORS, [
    { id, fields },
  ]);
  return recordToSponsor(updated);
}

// ---------------------------------------------------------------------------
// Aggregated Views
// ---------------------------------------------------------------------------

export async function getAvailability(dateRange: DateRange): Promise<AvailabilityByMonth[]> {
  const slots = await getSlots({ dateRange });
  return aggregateByMonth(slots, (month, typeSlots) => ({
    total: typeSlots.length,
    available: typeSlots.filter((s) => s.status === 'available').length,
  }));
}

export async function getUtilisation(dateRange: DateRange): Promise<UtilisationByMonth[]> {
  const slots = await getSlots({ dateRange });
  return aggregateByMonth(slots, (month, typeSlots) => {
    const total = typeSlots.length;
    const sold = typeSlots.filter((s) => s.status === 'sold' || s.status === 'live').length;
    const held = typeSlots.filter((s) => s.status === 'held').length;
    return {
      total,
      sold,
      held,
      utilisation: total > 0 ? Math.round((sold / total) * 100) / 100 : 0,
    };
  });
}

function aggregateByMonth<T>(
  slots: Slot[],
  fn: (month: string, typeSlots: Slot[]) => T,
): { month: string; byType: Record<InventoryType, T> }[] {
  // Group slots by YYYY-MM
  const months = new Map<string, Slot[]>();
  for (const slot of slots) {
    const month = slot.plannedPublishDate.slice(0, 7); // YYYY-MM
    if (!months.has(month)) months.set(month, []);
    months.get(month)!.push(slot);
  }

  // Sort by month
  const sortedMonths = [...months.keys()].sort();

  return sortedMonths.map((month) => {
    const monthSlots = months.get(month)!;
    const byType = {} as Record<InventoryType, T>;

    for (const type of INVENTORY_TYPES) {
      const typeSlots = monthSlots.filter((s) => s.inventoryType === type);
      byType[type] = fn(month, typeSlots);
    }

    return { month, byType };
  });
}

// ---------------------------------------------------------------------------
// Event auto-assignment helper
// ---------------------------------------------------------------------------

async function findEventForDate(date: string): Promise<Event | null> {
  const records = await listRecords(TABLES.EVENTS, {
    filterByFormula: `AND({start_date}<='${date}', {end_date}>='${date}')`,
    maxRecords: 1,
  });

  if (records.length === 0) return null;
  return recordToEvent(records[0]);
}
