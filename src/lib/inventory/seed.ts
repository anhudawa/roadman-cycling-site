#!/usr/bin/env tsx
/**
 * Seed script: populates Airtable with 6 months of inventory slots,
 * the 2026 cycling calendar events, and existing sponsor records.
 *
 * Usage:
 *   npx tsx src/lib/inventory/seed.ts
 *
 * Requires AIRTABLE_API_KEY and AIRTABLE_BASE_ID env vars.
 * Add --dry-run to print what would be created without writing to Airtable.
 */

import 'dotenv/config';
import {
  createRecords,
  mapFieldsToAirtable,
  listRecords,
  type AirtableRecord,
} from './airtable';
import { calculateRackRate, TABLES } from './config';
import type {
  EventType,
  PremiumTier,
  InventoryType,
  EventStatus,
  SponsorTier,
} from './types';

const DRY_RUN = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// 2026 Cycling Calendar
// ---------------------------------------------------------------------------

interface SeedEvent {
  eventName: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  premiumTier: PremiumTier;
  status: EventStatus;
  coveragePlan: string | null;
}

const EVENTS: SeedEvent[] = [
  {
    eventName: 'Spring Classics Block',
    eventType: 'classics_block',
    startDate: '2026-03-28',
    endDate: '2026-04-19',
    premiumTier: '2',
    status: 'upcoming',
    coveragePlan:
      'Three weekends of racing: E3, Gent-Wevelgem, Tour of Flanders, Paris-Roubaix. Daily preview and debrief episodes, two dedicated YouTube race analysis pieces, and a weekly Classics email to the list.',
  },
  {
    eventName: 'Giro d\'Italia 2026',
    eventType: 'grand_tour',
    startDate: '2026-05-09',
    endDate: '2026-05-31',
    premiumTier: '2',
    status: 'upcoming',
    coveragePlan:
      'Three weeks of daily podcast coverage. Stage previews and debriefs, two long-form YouTube pieces at the midpoint and finale, and a dedicated Giro email on rest days. Sponsor reads in every daily episode.',
  },
  {
    eventName: 'Criterium du Dauphine 2026',
    eventType: 'classics_block',
    startDate: '2026-06-07',
    endDate: '2026-06-14',
    premiumTier: '3',
    status: 'upcoming',
    coveragePlan:
      'Daily stage recaps, one YouTube preview, and a dedicated newsletter send at the start of the race.',
  },
  {
    eventName: 'Tour de France 2026',
    eventType: 'grand_tour',
    startDate: '2026-07-04',
    endDate: '2026-07-26',
    premiumTier: '1',
    status: 'upcoming',
    coveragePlan:
      'Three weeks. Twenty-one stages. Anthony is in the car for nine of them, with nightly dispatch episodes recorded from the team hotels and published same-day. Full daily podcast coverage for the duration, two long-form YouTube pieces, plus a dedicated email on race morning and another when the peloton hits Paris.',
  },
  {
    eventName: 'Vuelta a Espana 2026',
    eventType: 'grand_tour',
    startDate: '2026-08-15',
    endDate: '2026-09-06',
    premiumTier: '2',
    status: 'upcoming',
    coveragePlan:
      'Three weeks of daily podcast coverage, stage previews and debriefs, two YouTube analyses, and Vuelta-dedicated newsletter sends on rest days.',
  },
  {
    eventName: 'UCI World Championships 2026',
    eventType: 'world_championship',
    startDate: '2026-09-20',
    endDate: '2026-09-27',
    premiumTier: '1',
    status: 'upcoming',
    coveragePlan:
      'Daily race previews and results episodes. One pre-race YouTube preview, one post-race documentary-style piece. Dedicated email to the list for the road race.',
  },
  {
    eventName: 'Il Lombardia 2026',
    eventType: 'monument',
    startDate: '2026-10-10',
    endDate: '2026-10-10',
    premiumTier: '3',
    status: 'upcoming',
    coveragePlan:
      'Preview episode and race debrief. One dedicated newsletter send covering season wrap-up through the final monument.',
  },
  {
    eventName: 'Migration Gravel 2026',
    eventType: 'roadman_owned',
    startDate: '2026-09-12',
    endDate: '2026-09-13',
    premiumTier: '3',
    status: 'upcoming',
    coveragePlan:
      'Two dedicated pre-race episodes, live social coverage on the day, a full race debrief episode within 48 hours, and a short-form YouTube doc in the following fortnight. Title placement in pre-race episodes, branding across all race-day comms.',
  },
  {
    eventName: 'Roadman Performance Camp 2026',
    eventType: 'roadman_owned',
    startDate: '2026-11-07',
    endDate: '2026-11-09',
    premiumTier: '3',
    status: 'upcoming',
    coveragePlan:
      'Two pre-event episodes covering the camp programme, live social during the weekend, a full camp recap episode, and a YouTube day-in-the-life piece published the following week.',
  },
  {
    eventName: 'Winter Indoor Season 2026-27',
    eventType: 'winter',
    startDate: '2026-11-15',
    endDate: '2027-02-28',
    premiumTier: '3',
    status: 'upcoming',
    coveragePlan:
      'Indoor training content block: equipment reviews, training plan episodes, indoor racing coverage. Consistent podcast cadence through the off-season with sponsor reads maintained.',
  },
];

// ---------------------------------------------------------------------------
// Seed Sponsors
// ---------------------------------------------------------------------------

interface SeedSponsor {
  brandName: string;
  contactName: string | null;
  contactEmail: string;
  tier: SponsorTier | null;
  contractStart: string | null;
  contractEnd: string | null;
  totalValue: number | null;
  renewalDate: string | null;
  notes: string | null;
  logoUrl: string | null;
}

const SPONSORS: SeedSponsor[] = [
  {
    brandName: 'TrainingPeaks',
    contactName: null,
    contactEmail: 'partnerships@trainingpeaks.com',
    tier: 'annual',
    contractStart: '2026-01-01',
    contractEnd: '2026-12-31',
    totalValue: 60000,
    renewalDate: '2026-11-01',
    notes: 'Annual title partner. $5k/mo.',
    logoUrl: null,
  },
  {
    brandName: 'Parlee',
    contactName: null,
    contactEmail: 'marketing@parlee.com',
    tier: 'quarter_standard',
    contractStart: '2026-04-01',
    contractEnd: '2026-06-30',
    totalValue: 6000,
    renewalDate: '2026-06-01',
    notes: 'Quarter standard. $2k/mo.',
    logoUrl: null,
  },
  {
    brandName: '4Endurance',
    contactName: null,
    contactEmail: 'sponsors@4endurance.com',
    tier: 'quarter_standard',
    contractStart: '2026-04-01',
    contractEnd: '2026-06-30',
    totalValue: 6000,
    renewalDate: '2026-06-01',
    notes: 'Quarter standard. $2k/mo.',
    logoUrl: null,
  },
  {
    brandName: 'Hexis',
    contactName: null,
    contactEmail: 'affiliates@hexis.com',
    tier: null,
    contractStart: null,
    contractEnd: null,
    totalValue: null,
    renewalDate: null,
    notes: 'Affiliate arrangement only. ~$5k/mo variable. No inventory slots assigned.',
    logoUrl: null,
  },
  {
    brandName: 'Bikmo',
    contactName: null,
    contactEmail: 'partnerships@bikmo.com',
    tier: null,
    contractStart: '2025-01-01',
    contractEnd: '2025-12-31',
    totalValue: null,
    renewalDate: null,
    notes: 'Historical sponsor. Inactive. Previous year contract.',
    logoUrl: null,
  },
];

// ---------------------------------------------------------------------------
// Slot generation
// ---------------------------------------------------------------------------

interface SeedSlot {
  inventoryType: InventoryType;
  plannedPublishDate: string;
  position: number;
  episodeNumber: number | null;
  episodeTitle: string | null;
  status: 'available';
  readStatus: string | null;
  rackRate: number;
  eventId: string | null; // will be filled after events are created
}

function generateSlots(
  startDate: Date,
  months: number,
  eventLookup: Map<string, { id: string; premiumTier: PremiumTier }>,
): SeedSlot[] {
  const slots: SeedSlot[] = [];
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);

  let episodeCounter = 400; // starting episode number
  const current = new Date(startDate);

  while (current < endDate) {
    const dayOfWeek = current.getDay(); // 0=Sun, 1=Mon, ...
    const dateStr = current.toISOString().slice(0, 10);

    // Podcast: Mon (1), Wed (3), Fri (5) -- 3 slots each (pre/mid/end)
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      episodeCounter++;
      const event = findEventForDateSync(dateStr, eventLookup);

      const podcastTypes: { type: InventoryType; position: number }[] = [
        { type: 'podcast_preroll', position: 1 },
        { type: 'podcast_midroll', position: 2 },
        { type: 'podcast_endroll', position: 3 },
      ];

      for (const { type, position } of podcastTypes) {
        slots.push({
          inventoryType: type,
          plannedPublishDate: dateStr,
          position,
          episodeNumber: episodeCounter,
          episodeTitle: null,
          status: 'available',
          readStatus: 'pending',
          rackRate: calculateRackRate(type, event?.premiumTier),
          eventId: event?.id ?? null,
        });
      }
    }

    // Newsletter: Saturday (6) -- 4 slots (1 dedicated + 1 banner + 2 classified)
    if (dayOfWeek === 6) {
      const event = findEventForDateSync(dateStr, eventLookup);

      const nlTypes: { type: InventoryType; position: number }[] = [
        { type: 'newsletter_dedicated', position: 1 },
        { type: 'newsletter_banner', position: 2 },
        { type: 'newsletter_classified', position: 3 },
        { type: 'newsletter_classified', position: 4 },
      ];

      for (const { type, position } of nlTypes) {
        slots.push({
          inventoryType: type,
          plannedPublishDate: dateStr,
          position,
          episodeNumber: null,
          episodeTitle: null,
          status: 'available',
          readStatus: null,
          rackRate: calculateRackRate(type, event?.premiumTier),
          eventId: event?.id ?? null,
        });
      }
    }

    // YouTube: Tue (2), Thu (4) -- 1 integration each
    if (dayOfWeek === 2 || dayOfWeek === 4) {
      const event = findEventForDateSync(dateStr, eventLookup);

      slots.push({
        inventoryType: 'youtube_integration',
        plannedPublishDate: dateStr,
        position: 1,
        episodeNumber: null,
        episodeTitle: null,
        status: 'available',
        readStatus: null,
        rackRate: calculateRackRate('youtube_integration', event?.premiumTier),
        eventId: event?.id ?? null,
      });
    }

    // Advance one day
    current.setDate(current.getDate() + 1);
  }

  return slots;
}

function findEventForDateSync(
  date: string,
  eventLookup: Map<string, { id: string; premiumTier: PremiumTier }>,
): { id: string; premiumTier: PremiumTier } | null {
  // eventLookup keyed by "startDate|endDate" -- iterate to find match
  for (const [range, event] of eventLookup) {
    const [start, end] = range.split('|');
    if (date >= start && date <= end) return event;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== SEEDING AIRTABLE ===');

  // 1. Create events
  console.log(`\nCreating ${EVENTS.length} events...`);
  const eventLookup = new Map<string, { id: string; premiumTier: PremiumTier }>();

  if (DRY_RUN) {
    for (const event of EVENTS) {
      console.log(`  [dry] ${event.eventName} (${event.startDate} to ${event.endDate}, tier ${event.premiumTier})`);
      eventLookup.set(`${event.startDate}|${event.endDate}`, {
        id: `dry_${event.eventName}`,
        premiumTier: event.premiumTier,
      });
    }
  } else {
    const eventFields = EVENTS.map((e) => mapFieldsToAirtable(e as unknown as Record<string, unknown>));
    const createdEvents = await createRecords(TABLES.EVENTS, eventFields);
    for (let i = 0; i < createdEvents.length; i++) {
      const event = EVENTS[i];
      const record = createdEvents[i];
      console.log(`  Created: ${event.eventName} -> ${record.id}`);
      eventLookup.set(`${event.startDate}|${event.endDate}`, {
        id: record.id,
        premiumTier: event.premiumTier,
      });
    }
  }

  // 2. Create sponsors
  console.log(`\nCreating ${SPONSORS.length} sponsors...`);
  const sponsorIds = new Map<string, string>();

  if (DRY_RUN) {
    for (const sponsor of SPONSORS) {
      console.log(`  [dry] ${sponsor.brandName} (${sponsor.tier ?? 'no tier'})`);
      sponsorIds.set(sponsor.brandName, `dry_${sponsor.brandName}`);
    }
  } else {
    const sponsorFields = SPONSORS.map((s) => mapFieldsToAirtable(s as unknown as Record<string, unknown>));
    const createdSponsors = await createRecords(TABLES.SPONSORS, sponsorFields);
    for (let i = 0; i < createdSponsors.length; i++) {
      const sponsor = SPONSORS[i];
      const record = createdSponsors[i];
      console.log(`  Created: ${sponsor.brandName} -> ${record.id}`);
      sponsorIds.set(sponsor.brandName, record.id);
    }
  }

  // 3. Generate and create slots
  const startDate = new Date('2026-04-01');
  const slots = generateSlots(startDate, 6, eventLookup);
  console.log(`\nGenerated ${slots.length} inventory slots.`);

  if (DRY_RUN) {
    // Summary by type
    const byType = new Map<string, number>();
    for (const slot of slots) {
      byType.set(slot.inventoryType, (byType.get(slot.inventoryType) ?? 0) + 1);
    }
    for (const [type, count] of byType) {
      console.log(`  [dry] ${type}: ${count} slots`);
    }
    const withEvents = slots.filter((s) => s.eventId).length;
    console.log(`  [dry] ${withEvents} slots linked to events`);
  } else {
    console.log('Creating inventory slots in batches...');
    const slotFields = slots.map((s) => {
      const fields = mapFieldsToAirtable({
        inventoryType: s.inventoryType,
        plannedPublishDate: s.plannedPublishDate,
        position: s.position,
        episodeNumber: s.episodeNumber,
        episodeTitle: s.episodeTitle,
        status: s.status,
        readStatus: s.readStatus,
        rackRate: s.rackRate,
      });

      // Add event link if applicable
      if (s.eventId) {
        fields.event = [s.eventId];
      }

      return fields;
    });

    const created = await createRecords(TABLES.INVENTORY, slotFields);
    console.log(`  Created ${created.length} inventory slots.`);

    const withEvents = slots.filter((s) => s.eventId).length;
    console.log(`  ${withEvents} slots auto-linked to events.`);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
