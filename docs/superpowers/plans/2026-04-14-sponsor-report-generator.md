# Sponsor Report Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a monthly per-sponsor report at `/admin/inventory/sponsors/[sponsorId]/reports/[yyyy-mm]` with podcast brand mentions, episode reach, web sessions, and social stats $Äî plus a PDF export.

**Architecture:** Server-rendered report page backed by pure composer functions. Mentions are computed on-demand from existing MDX transcripts (regex + char-index $Üí approximate timestamp). Episode downloads are seeded deterministic numbers cached in Postgres. Monthly social stats are manually entered and persisted. GA4 supplies web sessions. Same React component tree renders for the web view and the PDF export.

**Tech Stack:** Next.js 16 (App Router, RSC + Server Actions), TypeScript, Tailwind 4, Drizzle ORM on Postgres, Airtable (existing sponsor pipeline), Vitest, `@react-pdf/renderer`, `@google-analytics/data`.

**Spec:** `docs/superpowers/specs/2026-04-14-sponsor-report-generator-design.md`

---

## File Structure

### New files

```
src/lib/reports/
  mentions.ts                    # findMentions() $Äî pure
  mentions.test.ts
  timestamp.ts                   # approximateTimestamp() $Äî pure
  timestamp.test.ts
  downloads.ts                   # seededDownloads() + cache read-through
  downloads.test.ts
  social-stats.ts                # get/upsert monthly_social_stats
  sponsor-report.ts              # composer: (sponsorId, month) $Üí ReportPayload
  types.ts                       # Mention, EpisodeMentionGroup, ReportPayload

src/lib/analytics/
  ga4.ts                         # getMonthlyWebSessions(month)

src/components/admin/reports/
  SponsorReport.tsx              # top-level layout
  ReportHero.tsx
  HeadlineStats.tsx
  CounterAnimated.tsx            # client-only animated counter
  MentionsTimeline.tsx
  AudiencePanel.tsx
  SocialStatsForm.tsx            # client form, calls server action
  MonthPicker.tsx                # client; popover on sponsor card

src/components/admin/reports/pdf/
  SponsorReportPDF.tsx           # @react-pdf/renderer version
  pdf-theme.ts                   # shared colors / fonts

src/app/admin/inventory/sponsors/[sponsorId]/reports/[month]/
  page.tsx                       # server component
  actions.ts                     # saveSocialStats server action
  pdf/route.ts                   # GET $Üí PDF stream

drizzle/<timestamp>_sponsor_reports.sql   # generated migration
```

### Modified files

- `src/lib/db/schema.ts` $Äî add `monthlySocialStats`, `episodeDownloadsCache`.
- `src/lib/inventory/types.ts` $Äî add `brandAliases?: string` on `Sponsor`.
- `src/lib/inventory/airtable.ts` $Äî read new `Brand Aliases` Airtable field.
- `src/app/admin/inventory/sponsors/SponsorsClient.tsx` (or equivalent) $Äî add a **Reports** button + `MonthPicker` on each sponsor card.
- `.env.example` $Äî add `GA4_PROPERTY_ID`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`.

---

## Task 1: Shared types

**Files:**
- Create: `src/lib/reports/types.ts`

- [ ] **Step 1: Create the types file**

```ts
// src/lib/reports/types.ts

export interface Mention {
  alias: string;        // the exact alias matched, as it appears in aliases list
  charIndex: number;    // position in the transcript blob
  quote: string;        // ~10-15 words of surrounding context, trimmed
  timestampSeconds: number; // approximated from char index + duration
}

export interface EpisodeMentionGroup {
  episodeSlug: string;
  episodeNumber: number;
  episodeTitle: string;
  publishDate: string;            // ISO
  durationSeconds: number;
  spotifyId?: string;
  downloads: number;
  mentions: Mention[];
}

export interface PlatformStat {
  platform: 'website' | 'facebook' | 'x' | 'instagram';
  views: number | null;           // null = not entered yet
  deltaPct: number | null;        // vs previous month, null if no history
}

export interface ReportPayload {
  sponsor: {
    id: string;
    brandName: string;
    logoUrl: string | null;
    aliases: string[];
  };
  month: string;                  // 'YYYY-MM'
  generatedAt: string;            // ISO
  headline: {
    mentionCount: number;
    totalReach: number;           // sum of downloads across mentioning episodes
    webSessions: number | null;
    socialImpressions: number | null;
    deltas: {
      mentionCount: number | null;
      totalReach: number | null;
      webSessions: number | null;
      socialImpressions: number | null;
    };
  };
  episodeGroups: EpisodeMentionGroup[];
  platforms: PlatformStat[];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/reports/types.ts
git commit -m "feat(reports): add shared report type definitions"
```

---

## Task 2: `findMentions` $Äî pure mention scanner

**Files:**
- Create: `src/lib/reports/mentions.ts`
- Test: `src/lib/reports/mentions.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/reports/mentions.test.ts
import { describe, it, expect } from 'vitest';
import { findMentions } from './mentions';

describe('findMentions', () => {
  it('returns empty array for empty transcript', () => {
    expect(findMentions('', ['SRAM'])).toEqual([]);
  });

  it('returns empty array for no aliases', () => {
    expect(findMentions('We love SRAM components.', [])).toEqual([]);
  });

  it('matches a single alias case-insensitively', () => {
    const result = findMentions('I ride sram every day.', ['SRAM']);
    expect(result).toHaveLength(1);
    expect(result[0].alias).toBe('SRAM');
    expect(result[0].charIndex).toBe(7);
  });

  it('respects word boundaries', () => {
    // should NOT match 'sramble' (contains sram as substring)
    const result = findMentions('He srambled the code.', ['SRAM']);
    expect(result).toHaveLength(0);
  });

  it('matches multi-word aliases', () => {
    const result = findMentions('Training Peaks is excellent.', ['Training Peaks']);
    expect(result).toHaveLength(1);
    expect(result[0].alias).toBe('Training Peaks');
  });

  it('matches multiple aliases for the same brand', () => {
    const result = findMentions(
      'We use SRAM groupsets. Shram is reliable.',
      ['SRAM', 'Shram'],
    );
    expect(result).toHaveLength(2);
  });

  it('returns quote with surrounding context (~10-15 words)', () => {
    const transcript =
      'The weather was great. I used SRAM gears on the climb today. It was amazing.';
    const result = findMentions(transcript, ['SRAM']);
    expect(result[0].quote).toContain('SRAM');
    expect(result[0].quote.split(/\s+/).length).toBeLessThanOrEqual(20);
    expect(result[0].quote.split(/\s+/).length).toBeGreaterThanOrEqual(5);
  });

  it('returns mentions in order of appearance', () => {
    const result = findMentions(
      'Bikmo is cheap. Later: Bikmo insurance rocks.',
      ['Bikmo'],
    );
    expect(result).toHaveLength(2);
    expect(result[0].charIndex).toBeLessThan(result[1].charIndex);
  });

  it('timestamp field defaults to 0 (filled by caller)', () => {
    const result = findMentions('SRAM.', ['SRAM']);
    expect(result[0].timestampSeconds).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/reports/mentions.test.ts`
Expected: FAIL $Äî `findMentions` is not defined.

- [ ] **Step 3: Implement `findMentions`**

```ts
// src/lib/reports/mentions.ts
import type { Mention } from './types';

const QUOTE_WORDS_BEFORE = 7;
const QUOTE_WORDS_AFTER = 7;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractQuote(transcript: string, charIndex: number, aliasLength: number): string {
  // take QUOTE_WORDS_BEFORE words before and QUOTE_WORDS_AFTER words after
  const before = transcript.slice(0, charIndex).split(/\s+/).slice(-QUOTE_WORDS_BEFORE).join(' ');
  const matchedSlice = transcript.slice(charIndex, charIndex + aliasLength);
  const after = transcript
    .slice(charIndex + aliasLength)
    .split(/\s+/)
    .slice(0, QUOTE_WORDS_AFTER + 1)
    .join(' ')
    .trim();
  return `${before} ${matchedSlice}${after ? ' ' + after : ''}`.trim();
}

export function findMentions(transcript: string, aliases: string[]): Mention[] {
  if (!transcript || aliases.length === 0) return [];

  const results: Mention[] = [];

  for (const alias of aliases) {
    if (!alias.trim()) continue;
    const pattern = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'gi');
    for (const match of transcript.matchAll(pattern)) {
      const charIndex = match.index ?? 0;
      results.push({
        alias,
        charIndex,
        quote: extractQuote(transcript, charIndex, alias.length),
        timestampSeconds: 0, // filled in by caller using approximateTimestamp
      });
    }
  }

  return results.sort((a, b) => a.charIndex - b.charIndex);
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run src/lib/reports/mentions.test.ts`
Expected: PASS (all 9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/reports/mentions.ts src/lib/reports/mentions.test.ts
git commit -m "feat(reports): add findMentions transcript scanner"
```

---

## Task 3: `approximateTimestamp` $Äî char index $Üí seconds

**Files:**
- Create: `src/lib/reports/timestamp.ts`
- Test: `src/lib/reports/timestamp.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/reports/timestamp.test.ts
import { describe, it, expect } from 'vitest';
import { approximateTimestamp, parseDurationString } from './timestamp';

describe('approximateTimestamp', () => {
  it('returns 0 at char 0', () => {
    expect(approximateTimestamp(0, 1000, 3600)).toBe(0);
  });

  it('returns duration at the last char', () => {
    expect(approximateTimestamp(1000, 1000, 3600)).toBe(3600);
  });

  it('linearly interpolates', () => {
    expect(approximateTimestamp(500, 1000, 3600)).toBe(1800);
  });

  it('returns 0 when transcript length is zero', () => {
    expect(approximateTimestamp(0, 0, 3600)).toBe(0);
  });

  it('returns 0 when duration is zero', () => {
    expect(approximateTimestamp(500, 1000, 0)).toBe(0);
  });

  it('floors to nearest integer second', () => {
    expect(approximateTimestamp(333, 1000, 100)).toBe(33);
  });
});

describe('parseDurationString', () => {
  it('parses HH:MM:SS', () => {
    expect(parseDurationString('01:02:03')).toBe(3723);
  });

  it('parses MM:SS', () => {
    expect(parseDurationString('05:30')).toBe(330);
  });

  it('parses raw seconds number string', () => {
    expect(parseDurationString('450')).toBe(450);
  });

  it('returns 0 for invalid input', () => {
    expect(parseDurationString('')).toBe(0);
    expect(parseDurationString('abc')).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/reports/timestamp.test.ts`
Expected: FAIL $Äî module not found.

- [ ] **Step 3: Implement**

```ts
// src/lib/reports/timestamp.ts

export function approximateTimestamp(
  charIndex: number,
  transcriptLength: number,
  durationSeconds: number,
): number {
  if (transcriptLength <= 0 || durationSeconds <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, charIndex / transcriptLength));
  return Math.floor(ratio * durationSeconds);
}

export function parseDurationString(raw: string): number {
  if (!raw) return 0;
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  const parts = trimmed.split(':').map((p) => parseInt(p, 10));
  if (parts.some((n) => isNaN(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run src/lib/reports/timestamp.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/reports/timestamp.ts src/lib/reports/timestamp.test.ts
git commit -m "feat(reports): add approximateTimestamp + duration parsing helpers"
```

---

## Task 4: DB schema $Äî `monthly_social_stats` + `episode_downloads_cache`

**Files:**
- Modify: `src/lib/db/schema.ts` (append at end)
- Create: generated migration under `drizzle/`

- [ ] **Step 1: Append schema additions**

Add to the bottom of `src/lib/db/schema.ts`:

```ts
// $îÄ$îÄ Sponsor Reports $îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ$îÄ
export const monthlySocialStats = pgTable(
  "monthly_social_stats",
  {
    id: serial("id").primaryKey(),
    month: text("month").notNull(), // 'YYYY-MM'
    platform: text("platform").notNull(), // 'facebook' | 'x' | 'instagram'
    views: integer("views").notNull(),
    enteredAt: timestamp("entered_at", { withTimezone: true }).defaultNow(),
    enteredBy: text("entered_by"),
  },
  (t) => ({
    monthPlatformIdx: uniqueIndex("monthly_social_stats_month_platform_idx").on(
      t.month,
      t.platform,
    ),
  }),
);

export const episodeDownloadsCache = pgTable("episode_downloads_cache", {
  episodeId: text("episode_id").primaryKey(),
  downloads: integer("downloads").notNull(),
  source: text("source").notNull().default("seeded"), // 'seeded' | 'spotify' | 'manual'
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

- [ ] **Step 2: Generate migration**

Run: `npx drizzle-kit generate`
Expected: a new `.sql` file under `drizzle/` creating both tables + the unique index.

- [ ] **Step 3: Inspect generated migration**

Read the new file. Ensure it contains `CREATE TABLE "monthly_social_stats"`, `CREATE TABLE "episode_downloads_cache"`, and `CREATE UNIQUE INDEX "monthly_social_stats_month_platform_idx"`. No destructive statements against existing tables.

- [ ] **Step 4: Apply migration locally**

Run: `npx drizzle-kit push` (or `npx drizzle-kit migrate` if that's the team convention $Äî check README).
Expected: Both tables exist in the local Postgres.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/schema.ts drizzle/
git commit -m "feat(db): add monthly_social_stats + episode_downloads_cache tables"
```

---

## Task 5: `seededDownloads` with DB cache read-through

**Files:**
- Create: `src/lib/reports/downloads.ts`
- Test: `src/lib/reports/downloads.test.ts`

- [ ] **Step 1: Write tests for the pure hash function**

```ts
// src/lib/reports/downloads.test.ts
import { describe, it, expect } from 'vitest';
import { deterministicDownloadNumber } from './downloads';

describe('deterministicDownloadNumber', () => {
  it('returns the same number for the same id', () => {
    expect(deterministicDownloadNumber('ep-147')).toBe(
      deterministicDownloadNumber('ep-147'),
    );
  });

  it('returns a value within [70000, 150000]', () => {
    for (const id of ['a', 'ep-1', 'ep-200', 'some-long-slug-here', 'x']) {
      const n = deterministicDownloadNumber(id);
      expect(n).toBeGreaterThanOrEqual(70000);
      expect(n).toBeLessThanOrEqual(150000);
    }
  });

  it('produces different numbers for different ids (most of the time)', () => {
    const sample = new Set(
      Array.from({ length: 20 }, (_, i) => deterministicDownloadNumber(`ep-${i}`)),
    );
    // Expect at least 18 distinct values out of 20
    expect(sample.size).toBeGreaterThanOrEqual(18);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/reports/downloads.test.ts`
Expected: FAIL $Äî module not found.

- [ ] **Step 3: Implement**

```ts
// src/lib/reports/downloads.ts
import { db } from '@/lib/db';
import { episodeDownloadsCache } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const MIN = 70_000;
const MAX = 150_000;

// FNV-1a 32-bit $Äî deterministic, fast, no dependencies
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}

export function deterministicDownloadNumber(episodeId: string): number {
  const hash = fnv1a(episodeId);
  const span = MAX - MIN + 1;
  return MIN + (hash % span);
}

/**
 * Returns the download count for an episode, reading from `episode_downloads_cache`.
 * On cache miss, writes a seeded deterministic number and returns it.
 */
export async function getDownloads(episodeId: string): Promise<number> {
  const [existing] = await db
    .select()
    .from(episodeDownloadsCache)
    .where(eq(episodeDownloadsCache.episodeId, episodeId))
    .limit(1);

  if (existing) return existing.downloads;

  const seeded = deterministicDownloadNumber(episodeId);
  await db
    .insert(episodeDownloadsCache)
    .values({ episodeId, downloads: seeded, source: 'seeded' })
    .onConflictDoNothing();
  return seeded;
}
```

- [ ] **Step 4: Run tests to verify pure-function tests pass**

Run: `npx vitest run src/lib/reports/downloads.test.ts`
Expected: PASS (the pure `deterministicDownloadNumber` tests $Äî `getDownloads` is not tested here because it touches the DB).

- [ ] **Step 5: Commit**

```bash
git add src/lib/reports/downloads.ts src/lib/reports/downloads.test.ts
git commit -m "feat(reports): add seeded deterministic download number + DB cache"
```

---

## Task 6: Social stats CRUD

**Files:**
- Create: `src/lib/reports/social-stats.ts`

- [ ] **Step 1: Implement**

```ts
// src/lib/reports/social-stats.ts
import { db } from '@/lib/db';
import { monthlySocialStats } from '@/lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';

export type SocialPlatform = 'facebook' | 'x' | 'instagram';

export interface SocialStatEntry {
  platform: SocialPlatform;
  views: number;
}

export async function getSocialStats(month: string): Promise<Record<SocialPlatform, number | null>> {
  const rows = await db
    .select()
    .from(monthlySocialStats)
    .where(eq(monthlySocialStats.month, month));

  const out: Record<SocialPlatform, number | null> = {
    facebook: null,
    x: null,
    instagram: null,
  };
  for (const r of rows) {
    if (r.platform === 'facebook' || r.platform === 'x' || r.platform === 'instagram') {
      out[r.platform] = r.views;
    }
  }
  return out;
}

export async function upsertSocialStats(
  month: string,
  entries: SocialStatEntry[],
  enteredBy?: string,
): Promise<void> {
  for (const entry of entries) {
    await db
      .insert(monthlySocialStats)
      .values({ month, platform: entry.platform, views: entry.views, enteredBy })
      .onConflictDoUpdate({
        target: [monthlySocialStats.month, monthlySocialStats.platform],
        set: { views: entry.views, enteredBy, enteredAt: sql`now()` },
      });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/reports/social-stats.ts
git commit -m "feat(reports): add monthly social stats CRUD"
```

---

## Task 7: GA4 wrapper with graceful degradation

**Files:**
- Create: `src/lib/analytics/ga4.ts`
- Modify: `.env.example`
- Modify: `package.json` (add `@google-analytics/data`)

- [ ] **Step 1: Install dep**

Run: `npm install @google-analytics/data`

- [ ] **Step 2: Implement helper**

```ts
// src/lib/analytics/ga4.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data';

let client: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient | null {
  if (client) return client;
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!credsJson || !propertyId) return null;

  try {
    const credentials = JSON.parse(credsJson);
    client = new BetaAnalyticsDataClient({ credentials });
    return client;
  } catch (e) {
    console.error('[ga4] Failed to init client:', e);
    return null;
  }
}

/**
 * Returns monthly web sessions for the given 'YYYY-MM' month.
 * Returns null if GA4 is not configured or the request fails $Äî callers
 * should render a graceful "$Äî" rather than erroring.
 */
export async function getMonthlyWebSessions(month: string): Promise<number | null> {
  const c = getClient();
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!c || !propertyId) return null;

  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return null;
  const startDate = `${month}-01`;
  const end = new Date(year, m, 0); // last day of month
  const endDate = `${month}-${String(end.getDate()).padStart(2, '0')}`;

  try {
    const [response] = await c.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'sessions' }],
    });
    const raw = response.rows?.[0]?.metricValues?.[0]?.value;
    return raw ? parseInt(raw, 10) : 0;
  } catch (e) {
    console.error('[ga4] runReport failed:', e);
    return null;
  }
}
```

- [ ] **Step 3: Update `.env.example`**

Append:

```
# Sponsor reports $Äî Google Analytics 4
GA4_PROPERTY_ID=
GOOGLE_APPLICATION_CREDENTIALS_JSON=
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/analytics/ga4.ts package.json package-lock.json .env.example
git commit -m "feat(analytics): add GA4 monthly web sessions helper"
```

---

## Task 8: Sponsor type + Airtable `brandAliases` field

**Files:**
- Modify: `src/lib/inventory/types.ts` (the `Sponsor` interface)
- Modify: `src/lib/inventory/airtable.ts` (read new field)

- [ ] **Step 1: Update `Sponsor` type**

Locate the `Sponsor` interface and add:

```ts
export interface Sponsor {
  // ...existing fields...
  brandAliases?: string; // comma-separated; used for transcript mention matching
}
```

- [ ] **Step 2: Read new field in the Airtable fetcher**

In `src/lib/inventory/airtable.ts`, find the sponsor mapping function and add:

```ts
brandAliases: record.get('Brand Aliases') as string | undefined,
```

(Field name in Airtable must match exactly. If the field doesn't exist yet, mapping will return `undefined` $Äî no breakage.)

- [ ] **Step 3: Add `Brand Aliases` long-text field to Airtable Sponsors table**

Manual step $Äî note in commit message. (Out-of-band $Äî Ted adds the field in the Airtable UI.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/inventory/types.ts src/lib/inventory/airtable.ts
git commit -m "feat(sponsors): expose optional brandAliases from Airtable

NOTE: requires adding a 'Brand Aliases' long-text field to the Airtable
Sponsors table. Comma-separated aliases used for podcast mention matching."
```

---

## Task 9: Report composer $Äî `buildSponsorReport`

**Files:**
- Create: `src/lib/reports/sponsor-report.ts`

- [ ] **Step 1: Implement**

```ts
// src/lib/reports/sponsor-report.ts
import { getAllEpisodes } from '@/lib/podcast';
import { readFileSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getSponsors } from '@/lib/inventory/airtable';
import { findMentions } from './mentions';
import { approximateTimestamp, parseDurationString } from './timestamp';
import { getDownloads } from './downloads';
import { getSocialStats } from './social-stats';
import { getMonthlyWebSessions } from '@/lib/analytics/ga4';
import type { ReportPayload, EpisodeMentionGroup, PlatformStat } from './types';

const PODCAST_DIR = path.join(process.cwd(), 'content/podcast');

function aliasesFor(brandName: string, raw?: string): string[] {
  const fromField = (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const all = [brandName, ...fromField];
  // dedupe case-insensitive
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of all) {
    const key = a.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(a);
    }
  }
  return out;
}

function loadTranscript(slug: string): string {
  try {
    const raw = readFileSync(path.join(PODCAST_DIR, `${slug}.mdx`), 'utf-8');
    const { data } = matter(raw);
    return typeof data.transcript === 'string' ? data.transcript : '';
  } catch {
    return '';
  }
}

function pctDelta(curr: number | null, prev: number | null): number | null {
  if (curr === null || prev === null || prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

function previousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function computeHeadlineCore(
  sponsorId: string,
  brandName: string,
  aliases: string[],
  month: string,
): Promise<{ mentionCount: number; totalReach: number; groups: EpisodeMentionGroup[] }> {
  const episodes = getAllEpisodes().filter((e) => e.publishDate.startsWith(month));
  const groups: EpisodeMentionGroup[] = [];
  let mentionCount = 0;
  let totalReach = 0;

  for (const ep of episodes) {
    const transcript = loadTranscript(ep.slug);
    if (!transcript) continue;
    const rawMentions = findMentions(transcript, aliases);
    if (rawMentions.length === 0) continue;

    const durationSeconds = parseDurationString(ep.duration);
    const mentions = rawMentions.map((m) => ({
      ...m,
      timestampSeconds: approximateTimestamp(m.charIndex, transcript.length, durationSeconds),
    }));
    const downloads = await getDownloads(ep.slug);

    groups.push({
      episodeSlug: ep.slug,
      episodeNumber: ep.episodeNumber,
      episodeTitle: ep.title,
      publishDate: ep.publishDate,
      durationSeconds,
      spotifyId: ep.spotifyId,
      downloads,
      mentions,
    });
    mentionCount += mentions.length;
    totalReach += downloads;
  }

  groups.sort((a, b) => a.publishDate.localeCompare(b.publishDate));
  return { mentionCount, totalReach, groups };
}

export async function buildSponsorReport(
  sponsorId: string,
  month: string,
): Promise<ReportPayload | null> {
  const sponsors = await getSponsors();
  const sponsor = sponsors.find((s) => s.id === sponsorId);
  if (!sponsor) return null;

  const aliases = aliasesFor(sponsor.brandName, sponsor.brandAliases);

  const [current, prev, social, prevSocial, web, prevWeb] = await Promise.all([
    computeHeadlineCore(sponsorId, sponsor.brandName, aliases, month),
    computeHeadlineCore(sponsorId, sponsor.brandName, aliases, previousMonth(month)),
    getSocialStats(month),
    getSocialStats(previousMonth(month)),
    getMonthlyWebSessions(month),
    getMonthlyWebSessions(previousMonth(month)),
  ]);

  const sumSocial = (s: Record<string, number | null>): number | null => {
    const vals = [s.facebook, s.x, s.instagram];
    if (vals.every((v) => v === null)) return null;
    return vals.reduce((acc: number, v) => acc + (v ?? 0), 0);
  };

  const socialImpressions = sumSocial(social);
  const prevSocialImpressions = sumSocial(prevSocial);

  const platforms: PlatformStat[] = [
    { platform: 'website', views: web, deltaPct: pctDelta(web, prevWeb) },
    { platform: 'facebook', views: social.facebook, deltaPct: pctDelta(social.facebook, prevSocial.facebook) },
    { platform: 'x', views: social.x, deltaPct: pctDelta(social.x, prevSocial.x) },
    { platform: 'instagram', views: social.instagram, deltaPct: pctDelta(social.instagram, prevSocial.instagram) },
  ];

  return {
    sponsor: {
      id: sponsor.id,
      brandName: sponsor.brandName,
      logoUrl: sponsor.logoUrl,
      aliases,
    },
    month,
    generatedAt: new Date().toISOString(),
    headline: {
      mentionCount: current.mentionCount,
      totalReach: current.totalReach,
      webSessions: web,
      socialImpressions,
      deltas: {
        mentionCount: pctDelta(current.mentionCount, prev.mentionCount),
        totalReach: pctDelta(current.totalReach, prev.totalReach),
        webSessions: pctDelta(web, prevWeb),
        socialImpressions: pctDelta(socialImpressions, prevSocialImpressions),
      },
    },
    episodeGroups: current.groups,
    platforms,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/reports/sponsor-report.ts
git commit -m "feat(reports): add sponsor report composer"
```

---

## Task 10: Month picker + Reports button on sponsor cards

**Files:**
- Create: `src/components/admin/reports/MonthPicker.tsx`
- Modify: existing sponsor card client component under `src/app/admin/inventory/sponsors/`

- [ ] **Step 1: Locate the sponsor card component**

Run: `grep -r "getSponsors\|SponsorsClient" src/app/admin/inventory/sponsors/ -l`
Read the returned file(s). Identify the per-sponsor row/card JSX.

- [ ] **Step 2: Create `MonthPicker.tsx`**

```tsx
// src/components/admin/reports/MonthPicker.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  sponsorId: string;
}

function currentMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1); // default to previous month
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthsBack(n: number): { value: string; label: string }[] {
  const today = new Date();
  const out: { value: string; label: string }[] = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    out.push({ value, label });
  }
  return out;
}

export function MonthPicker({ sponsorId }: Props) {
  const router = useRouter();
  const [month, setMonth] = useState(currentMonth());
  const options = monthsBack(12);

  return (
    <div className="flex items-center gap-2">
      <select
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-sm text-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => router.push(`/admin/inventory/sponsors/${sponsorId}/reports/${month}`)}
        className="rounded-md bg-[#F16363] px-3 py-1 text-sm font-semibold text-white hover:bg-[#e14d4d]"
      >
        Report $Üí
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Drop `MonthPicker` into each sponsor card**

In the file identified in Step 1, import `MonthPicker` and render `<MonthPicker sponsorId={sponsor.id} />` within each card, next to the existing action controls.

- [ ] **Step 4: Visual check**

Run: `npx next dev`
Navigate to `/admin/inventory/sponsors`. Confirm the month dropdown + Report button appear on each sponsor card and the button navigates to a (currently 404) report URL.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/reports/MonthPicker.tsx src/app/admin/inventory/sponsors/
git commit -m "feat(sponsors): add month picker + Report button on sponsor cards"
```

---

## Task 11: Animated counter component

**Files:**
- Create: `src/components/admin/reports/CounterAnimated.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/components/admin/reports/CounterAnimated.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  durationMs?: number;
  format?: (n: number) => string;
  className?: string;
}

const defaultFormat = (n: number) => n.toLocaleString('en-GB');

export function CounterAnimated({ value, durationMs = 900, format = defaultFormat, className }: Props) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const progress = Math.min(1, elapsed / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span className={className}>{format(display)}</span>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/reports/CounterAnimated.tsx
git commit -m "feat(reports): add animated counter component"
```

---

## Task 12: Report UI building blocks

**Files:**
- Create: `src/components/admin/reports/ReportHero.tsx`
- Create: `src/components/admin/reports/HeadlineStats.tsx`
- Create: `src/components/admin/reports/MentionsTimeline.tsx`
- Create: `src/components/admin/reports/AudiencePanel.tsx`

- [ ] **Step 1: `ReportHero.tsx`**

```tsx
// src/components/admin/reports/ReportHero.tsx
import Image from 'next/image';

interface Props {
  brandName: string;
  logoUrl: string | null;
  monthLabel: string;
}

export function ReportHero({ brandName, logoUrl, monthLabel }: Props) {
  return (
    <section className="flex flex-col items-center gap-6 pt-16 pb-10 text-center">
      {logoUrl && (
        <div className="relative h-24 w-48">
          <Image src={logoUrl} alt={`${brandName} logo`} fill className="object-contain" />
        </div>
      )}
      <h1 className="font-[var(--font-bebas-neue)] text-7xl tracking-wide text-white">
        {brandName}
      </h1>
      <p className="text-lg uppercase tracking-[0.3em] text-white/60">
        Monthly Partnership Report $Äî {monthLabel}
      </p>
      <div className="h-1 w-24 rounded-full bg-[#F16363]" />
    </section>
  );
}
```

- [ ] **Step 2: `HeadlineStats.tsx`**

```tsx
// src/components/admin/reports/HeadlineStats.tsx
import { CounterAnimated } from './CounterAnimated';

interface Stat {
  label: string;
  value: number | null;
  deltaPct: number | null;
}

interface Props {
  stats: Stat[];
}

function DeltaPill({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const up = pct >= 0;
  return (
    <span
      className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
        up ? 'bg-[#F16363]/20 text-[#F16363]' : 'bg-white/10 text-white/60'
      }`}
    >
      {up ? '$Üë' : '$Üì'} {Math.abs(pct)}%
    </span>
  );
}

export function HeadlineStats({ stats }: Props) {
  return (
    <section className="grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-white/5 bg-white/5 p-6 text-center">
          <div className="font-[var(--font-bebas-neue)] text-5xl text-white">
            {s.value === null ? '$Äî' : <CounterAnimated value={s.value} />}
          </div>
          <div className="mt-2 text-xs uppercase tracking-widest text-white/50">
            {s.label}
            <DeltaPill pct={s.deltaPct} />
          </div>
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 3: `MentionsTimeline.tsx`**

```tsx
// src/components/admin/reports/MentionsTimeline.tsx
import type { EpisodeMentionGroup } from '@/lib/reports/types';
import { formatTimestamp } from '@/lib/reports/timestamp';

interface Props {
  groups: EpisodeMentionGroup[];
}

function spotifyDeeplink(spotifyId: string | undefined, seconds: number): string | null {
  if (!spotifyId) return null;
  return `https://open.spotify.com/episode/${spotifyId}?t=${seconds}`;
}

export function MentionsTimeline({ groups }: Props) {
  if (groups.length === 0) {
    return (
      <section className="py-12 text-center text-white/60">
        <p className="text-xl">No mentions this month $Äî here&apos;s your audience growth instead.</p>
      </section>
    );
  }
  return (
    <section className="flex flex-col gap-6 py-10">
      <h2 className="font-[var(--font-bebas-neue)] text-3xl text-white">Podcast Mentions</h2>
      {groups.map((g) => (
        <article key={g.episodeSlug} className="rounded-xl border border-white/5 bg-white/5 p-6">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/50">
                Episode {g.episodeNumber} $∑ {g.publishDate}
              </div>
              <h3 className="text-xl font-semibold text-white">{g.episodeTitle}</h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-[#F16363]/20 px-3 py-1 text-sm font-semibold text-[#F16363]">
                {g.mentions.length} mention{g.mentions.length === 1 ? '' : 's'}
              </span>
              <span className="text-sm text-white/70">
                {g.downloads.toLocaleString('en-GB')} downloads
              </span>
            </div>
          </header>
          <ul className="mt-4 flex flex-col gap-3">
            {g.mentions.map((m, i) => {
              const link = spotifyDeeplink(g.spotifyId, m.timestampSeconds);
              return (
                <li
                  key={`${m.charIndex}-${i}`}
                  className="flex items-start gap-4 rounded-lg bg-black/20 p-4"
                >
                  <span className="font-mono text-sm text-[#F16363]">
                    {formatTimestamp(m.timestampSeconds)}
                  </span>
                  <span className="flex-1 text-sm text-white/80">&ldquo;{m.quote}&rdquo;</span>
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-md bg-[#F16363] px-3 py-1 text-sm font-semibold text-white hover:bg-[#e14d4d]"
                    >
                      Listen $Üí
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </article>
      ))}
    </section>
  );
}
```

- [ ] **Step 4: `AudiencePanel.tsx`**

```tsx
// src/components/admin/reports/AudiencePanel.tsx
import type { PlatformStat } from '@/lib/reports/types';
import { CounterAnimated } from './CounterAnimated';

const LABELS: Record<PlatformStat['platform'], string> = {
  website: 'Website Sessions',
  facebook: 'Facebook Views',
  x: 'X Views',
  instagram: 'Instagram Views',
};

interface Props {
  platforms: PlatformStat[];
}

export function AudiencePanel({ platforms }: Props) {
  return (
    <section className="py-10">
      <h2 className="mb-6 font-[var(--font-bebas-neue)] text-3xl text-white">Audience</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {platforms.map((p) => (
          <div key={p.platform} className="rounded-xl border border-white/5 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-widest text-white/50">{LABELS[p.platform]}</div>
            <div className="mt-2 font-[var(--font-bebas-neue)] text-5xl text-white">
              {p.views === null ? '$Äî' : <CounterAnimated value={p.views} />}
            </div>
            {p.deltaPct !== null && (
              <div
                className={`mt-1 text-sm ${p.deltaPct >= 0 ? 'text-[#F16363]' : 'text-white/50'}`}
              >
                {p.deltaPct >= 0 ? '$Üë' : '$Üì'} {Math.abs(p.deltaPct)}% vs last month
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/reports/
git commit -m "feat(reports): add report UI building blocks"
```

---

## Task 13: Social stats form + server action

**Files:**
- Create: `src/components/admin/reports/SocialStatsForm.tsx`
- Create: `src/app/admin/inventory/sponsors/[sponsorId]/reports/[month]/actions.ts`

- [ ] **Step 1: Server action**

```ts
// src/app/admin/inventory/sponsors/[sponsorId]/reports/[month]/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { upsertSocialStats } from '@/lib/reports/social-stats';

export async function saveSocialStatsAction(
  sponsorId: string,
  month: string,
  form: FormData,
): Promise<void> {
  const facebook = parseInt(String(form.get('facebook') ?? ''), 10);
  const x = parseInt(String(form.get('x') ?? ''), 10);
  const instagram = parseInt(String(form.get('instagram') ?? ''), 10);

  const entries = [
    { platform: 'facebook' as const, views: facebook },
    { platform: 'x' as const, views: x },
    { platform: 'instagram' as const, views: instagram },
  ].filter((e) => Number.isFinite(e.views) && e.views >= 0);

  await upsertSocialStats(month, entries);
  revalidatePath(`/admin/inventory/sponsors/${sponsorId}/reports/${month}`);
}
```

- [ ] **Step 2: Client form**

```tsx
// src/components/admin/reports/SocialStatsForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { saveSocialStatsAction } from '@/app/admin/inventory/sponsors/[sponsorId]/reports/[month]/actions';

interface Props {
  sponsorId: string;
  month: string;
  initial: { facebook: number | null; x: number | null; instagram: number | null };
}

export function SocialStatsForm({ sponsorId, month, initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="rounded-xl border border-white/10 bg-black/30 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          await saveSocialStatsAction(sponsorId, month, fd);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        });
      }}
    >
      <h3 className="mb-4 font-[var(--font-bebas-neue)] text-2xl text-white">
        Enter Social Views for {month}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(['facebook', 'x', 'instagram'] as const).map((p) => (
          <label key={p} className="flex flex-col gap-1 text-sm text-white/70">
            <span className="uppercase tracking-widest">{p}</span>
            <input
              type="number"
              name={p}
              defaultValue={initial[p] ?? ''}
              min={0}
              className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
            />
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-md bg-[#F16363] px-4 py-2 font-semibold text-white hover:bg-[#e14d4d] disabled:opacity-50"
      >
        {pending ? 'Saving$Ä¶' : saved ? 'Saved $úì' : 'Save'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/reports/SocialStatsForm.tsx src/app/admin/inventory/sponsors/
git commit -m "feat(reports): add social stats entry form + server action"
```

---

## Task 14: Top-level report page (server component)

**Files:**
- Create: `src/components/admin/reports/SponsorReport.tsx`
- Create: `src/app/admin/inventory/sponsors/[sponsorId]/reports/[month]/page.tsx`

- [ ] **Step 1: Top-level composition**

```tsx
// src/components/admin/reports/SponsorReport.tsx
import type { ReportPayload } from '@/lib/reports/types';
import { ReportHero } from './ReportHero';
import { HeadlineStats } from './HeadlineStats';
import { MentionsTimeline } from './MentionsTimeline';
import { AudiencePanel } from './AudiencePanel';
import { SocialStatsForm } from './SocialStatsForm';

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

interface Props {
  payload: ReportPayload;
  showSocialForm: boolean;
}

export function SponsorReport({ payload, showSocialForm }: Props) {
  const { sponsor, month, headline, episodeGroups, platforms } = payload;
  const social = {
    facebook: platforms.find((p) => p.platform === 'facebook')?.views ?? null,
    x: platforms.find((p) => p.platform === 'x')?.views ?? null,
    instagram: platforms.find((p) => p.platform === 'instagram')?.views ?? null,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#210140] to-[#252526] text-white">
      <div className="mx-auto max-w-5xl px-6">
        <ReportHero
          brandName={sponsor.brandName}
          logoUrl={sponsor.logoUrl}
          monthLabel={monthLabel(month)}
        />
        <HeadlineStats
          stats={[
            { label: 'Brand Mentions', value: headline.mentionCount, deltaPct: headline.deltas.mentionCount },
            { label: 'Episode Reach', value: headline.totalReach, deltaPct: headline.deltas.totalReach },
            { label: 'Web Sessions', value: headline.webSessions, deltaPct: headline.deltas.webSessions },
            { label: 'Social Impressions', value: headline.socialImpressions, deltaPct: headline.deltas.socialImpressions },
          ]}
        />
        <MentionsTimeline groups={episodeGroups} />
        <AudiencePanel platforms={platforms} />
        {showSocialForm && (
          <div className="py-6">
            <SocialStatsForm
              sponsorId={sponsor.id}
              month={month}
              initial={social}
            />
          </div>
        )}
        <footer className="flex items-center justify-between border-t border-white/10 py-10 text-sm text-white/50">
          <span>Generated {new Date(payload.generatedAt).toLocaleString('en-GB')}</span>
          <a
            href={`/admin/inventory/sponsors/${sponsor.id}/reports/${month}/pdf`}
            className="rounded-md bg-[#F16363] px-4 py-2 font-semibold text-white hover:bg-[#e14d4d]"
          >
            Download PDF
          </a>
        </footer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Page**

```tsx
// src/app/admin/inventory/sponsors/[sponsorId]/reports/[month]/page.tsx
import { notFound } from 'next/navigation';
import { buildSponsorReport } from '@/lib/reports/sponsor-report';
import { SponsorReport } from '@/components/admin/reports/SponsorReport';

interface Params {
  params: Promise<{ sponsorId: string; month: string }>;
}

export const revalidate = 3600;

export default async function Page({ params }: Params) {
  const { sponsorId, month } = await params;
  if (!/^\d{4}-\d{2}$/.test(month)) notFound();

  const payload = await buildSponsorReport(sponsorId, month);
  if (!payload) notFound();

  return <SponsorReport payload={payload} showSocialForm={true} />;
}
```

- [ ] **Step 3: Smoke test in the browser**

Run: `npx next dev`
From the sponsors index, pick a sponsor, pick last month, click Report. Page should render with the hero, stats (real or `$Äî`), mentions timeline (or empty state), audience grid, social form, and a Download PDF button (broken until Task 15).

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/reports/SponsorReport.tsx src/app/admin/inventory/sponsors/
git commit -m "feat(reports): add sponsor report page composition"
```

---

## Task 15: PDF export

**Files:**
- Modify: `package.json` (add `@react-pdf/renderer`)
- Create: `src/components/admin/reports/pdf/SponsorReportPDF.tsx`
- Create: `src/app/admin/inventory/sponsors/[sponsorId]/reports/[month]/pdf/route.ts`

- [ ] **Step 1: Install dep**

Run: `npm install @react-pdf/renderer`

- [ ] **Step 2: PDF document**

```tsx
// src/components/admin/reports/pdf/SponsorReportPDF.tsx
import { Document, Page, StyleSheet, Text, View, Image } from '@react-pdf/renderer';
import type { ReportPayload } from '@/lib/reports/types';
import { formatTimestamp } from '@/lib/reports/timestamp';

const styles = StyleSheet.create({
  page: { backgroundColor: '#210140', color: '#ffffff', padding: 40, fontSize: 11 },
  heroLogo: { width: 140, height: 70, objectFit: 'contain', marginBottom: 12, alignSelf: 'center' },
  heroTitle: { fontSize: 32, textAlign: 'center', marginBottom: 4 },
  heroSub: { fontSize: 10, color: '#cccccc', textAlign: 'center', letterSpacing: 2 },
  hr: { height: 2, backgroundColor: '#F16363', width: 60, alignSelf: 'center', marginVertical: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statCard: { width: '48%', padding: 10, backgroundColor: '#ffffff11', borderRadius: 6 },
  statValue: { fontSize: 24, color: '#ffffff' },
  statLabel: { fontSize: 9, color: '#ffffff99', letterSpacing: 1, marginTop: 2 },
  h2: { fontSize: 18, marginTop: 16, marginBottom: 8 },
  epCard: { marginBottom: 10, padding: 10, backgroundColor: '#ffffff0d', borderRadius: 6 },
  epTitle: { fontSize: 12, color: '#ffffff', marginBottom: 4 },
  epMeta: { fontSize: 9, color: '#ffffff99', marginBottom: 4 },
  mention: { fontSize: 9, color: '#ffffffcc', marginBottom: 2 },
  ts: { color: '#F16363', fontFamily: 'Courier' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#ffffff66', textAlign: 'center' },
});

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function SponsorReportPDF({ payload }: { payload: ReportPayload }) {
  const { sponsor, month, headline, episodeGroups, platforms } = payload;
  const fmt = (v: number | null) => (v === null ? '$Äî' : v.toLocaleString('en-GB'));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {sponsor.logoUrl && <Image src={sponsor.logoUrl} style={styles.heroLogo} />}
        <Text style={styles.heroTitle}>{sponsor.brandName}</Text>
        <Text style={styles.heroSub}>MONTHLY PARTNERSHIP REPORT $Äî {monthLabel(month).toUpperCase()}</Text>
        <View style={styles.hr} />

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{fmt(headline.mentionCount)}</Text>
            <Text style={styles.statLabel}>BRAND MENTIONS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{fmt(headline.totalReach)}</Text>
            <Text style={styles.statLabel}>EPISODE REACH</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{fmt(headline.webSessions)}</Text>
            <Text style={styles.statLabel}>WEB SESSIONS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{fmt(headline.socialImpressions)}</Text>
            <Text style={styles.statLabel}>SOCIAL IMPRESSIONS</Text>
          </View>
        </View>

        <Text style={styles.h2}>Podcast Mentions</Text>
        {episodeGroups.length === 0 ? (
          <Text style={styles.mention}>No mentions this month.</Text>
        ) : (
          episodeGroups.map((g) => (
            <View key={g.episodeSlug} style={styles.epCard}>
              <Text style={styles.epTitle}>Ep {g.episodeNumber} $Äî {g.episodeTitle}</Text>
              <Text style={styles.epMeta}>
                {g.publishDate} $∑ {g.mentions.length} mention(s) $∑ {g.downloads.toLocaleString('en-GB')} downloads
              </Text>
              {g.mentions.map((m, i) => (
                <Text key={i} style={styles.mention}>
                  <Text style={styles.ts}>{formatTimestamp(m.timestampSeconds)}</Text> $Äî $Äú{m.quote}$Äù
                </Text>
              ))}
            </View>
          ))
        )}

        <Text style={styles.h2}>Audience</Text>
        <View style={styles.statsGrid}>
          {platforms.map((p) => (
            <View key={p.platform} style={styles.statCard}>
              <Text style={styles.statValue}>{fmt(p.views)}</Text>
              <Text style={styles.statLabel}>{p.platform.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Generated {new Date(payload.generatedAt).toLocaleString('en-GB')} $Äî Roadman Cycling
        </Text>
      </Page>
    </Document>
  );
}
```

- [ ] **Step 3: PDF route**

```ts
// src/app/admin/inventory/sponsors/[sponsorId]/reports/[month]/pdf/route.ts
import { NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { buildSponsorReport } from '@/lib/reports/sponsor-report';
import { SponsorReportPDF } from '@/components/admin/reports/pdf/SponsorReportPDF';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sponsorId: string; month: string }> },
) {
  const { sponsorId, month } = await params;
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return new Response('Invalid month', { status: 400 });
  }
  const payload = await buildSponsorReport(sponsorId, month);
  if (!payload) return new Response('Sponsor not found', { status: 404 });

  const buffer = await renderToBuffer(<SponsorReportPDF payload={payload} />);
  const filename = `${payload.sponsor.brandName.replace(/\s+/g, '-').toLowerCase()}-${month}.pdf`;

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
```

- [ ] **Step 4: Smoke test**

Run dev server. Click Download PDF on the report page. Expected: PDF downloads with the sponsor name and month in the filename, renders with hero, stats grid, episode mentions, audience, footer.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/components/admin/reports/pdf/ src/app/admin/inventory/sponsors/
git commit -m "feat(reports): add PDF export route and @react-pdf document"
```

---

## Task 16: Integration test for the composer

**Files:**
- Create: `src/lib/reports/sponsor-report.integration.test.ts`
- Create: `src/lib/reports/__fixtures__/` with 1$Äì2 minimal MDX files

- [ ] **Step 1: Fixture episodes**

Create two MDX files in `src/lib/reports/__fixtures__/`:

```
// 2026-04-test-ep1.mdx
---
title: "Training Peaks Deep Dive"
episodeNumber: 999
description: "Test"
publishDate: "2026-04-05"
duration: "30:00"
spotifyId: "spot-test-1"
pillar: "training"
type: "interview"
keywords: []
seoDescription: "test"
transcript: "We had a great chat about Training Peaks today. SRAM groupsets also came up. Training Peaks again later."
---
# body
```

```
// 2026-04-test-ep2.mdx
---
title: "Unrelated Episode"
episodeNumber: 1000
description: "Test"
publishDate: "2026-04-20"
duration: "20:00"
spotifyId: "spot-test-2"
pillar: "training"
type: "interview"
keywords: []
seoDescription: "test"
transcript: "This one talks about nothing in particular."
---
# body
```

- [ ] **Step 2: Integration test**

```ts
// src/lib/reports/sponsor-report.integration.test.ts
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// Point podcast loader at our fixture dir by symlinking before tests
const FIXTURE_DIR = path.join(__dirname, '__fixtures__');
const PODCAST_DIR = path.join(process.cwd(), 'content/podcast');

describe('buildSponsorReport (integration)', () => {
  beforeAll(() => {
    for (const f of fs.readdirSync(FIXTURE_DIR)) {
      fs.copyFileSync(path.join(FIXTURE_DIR, f), path.join(PODCAST_DIR, f));
    }
  });

  afterAll(() => {
    for (const f of fs.readdirSync(FIXTURE_DIR)) {
      fs.unlinkSync(path.join(PODCAST_DIR, f));
    }
  });

  it('finds mentions of a sponsor in an April episode', async () => {
    vi.doMock('@/lib/inventory/airtable', () => ({
      getSponsors: async () => [
        {
          id: 'sp-tp',
          brandName: 'Training Peaks',
          contactName: null,
          contactEmail: 't@tp.com',
          tier: 'annual',
          contractStart: null,
          contractEnd: null,
          totalValue: null,
          renewalDate: null,
          lastContact: null,
          notes: null,
          logoUrl: null,
          brandAliases: '',
        },
      ],
    }));
    vi.doMock('@/lib/analytics/ga4', () => ({
      getMonthlyWebSessions: async () => 12345,
    }));

    const { buildSponsorReport } = await import('./sponsor-report');
    const payload = await buildSponsorReport('sp-tp', '2026-04');
    expect(payload).not.toBeNull();
    expect(payload!.headline.mentionCount).toBe(2);
    expect(payload!.episodeGroups).toHaveLength(1);
    expect(payload!.episodeGroups[0].episodeNumber).toBe(999);
    expect(payload!.platforms.find((p) => p.platform === 'website')?.views).toBe(12345);
  });
});
```

- [ ] **Step 3: Run integration test**

Run: `npx vitest run src/lib/reports/sponsor-report.integration.test.ts`
Expected: PASS.

If the DB calls (`getDownloads`, `getSocialStats`) hit a real Postgres that isn't available in test, add `vi.doMock('@/lib/reports/downloads', ...)` and `vi.doMock('@/lib/reports/social-stats', ...)` with in-memory stubs alongside the other `vi.doMock` calls in the test.

- [ ] **Step 4: Commit**

```bash
git add src/lib/reports/__fixtures__/ src/lib/reports/sponsor-report.integration.test.ts
git commit -m "test(reports): add integration test for sponsor report composer"
```

---

## Task 17: Final smoke test + docs

**Files:**
- Modify: `README.md` (a short "Sponsor Reports" section) $Äî optional if project README is thin.

- [ ] **Step 1: Full smoke test checklist**

With the dev server running:

1. Navigate to `/admin/inventory/sponsors`.
2. Confirm each sponsor card has a month picker + Report button.
3. Click Report for a sponsor with known mentions (e.g. Training Peaks, April 2026).
4. Confirm: hero, 4 headline stats, mentions timeline with correct episode(s), timestamp + Listen link, audience panel, social form.
5. Fill in FB / X / Insta, hit Save. Confirm numbers persist on reload.
6. Click Download PDF. Confirm file downloads, opens, matches the on-screen design.
7. Try an all-zeros case: pick a month with no mentions. Confirm empty state renders and page doesn't error.
8. Try a sponsor without aliases configured $Äî should still match the brand name.

- [ ] **Step 2: Run the full test suite**

Run: `npx vitest run`
Expected: all reports tests pass, no unrelated regressions.

- [ ] **Step 3: Run the build**

Run: `npx next build`
Expected: builds cleanly. Fix any type errors inline before committing.

- [ ] **Step 4: Final commit**

```bash
git commit --allow-empty -m "chore(reports): sponsor report generator v1 complete"
```

---

## Self-Review Checklist (internal, don't execute tasks for this)

- **Spec coverage:** Route $úì (Task 14), mentions $úì (2, 9), timestamps $úì (3, 9), downloads $úì (5), GA4 $úì (7), social stats $úì (6, 13), aliases $úì (8, 9), UI sections $úì (11, 12), PDF $úì (15), error handling $úì (empty states in 12, graceful GA4 null in 7, no-sponsor 404 in 14), month picker $úì (10), tests $úì (2, 3, 5, 16).
- **Placeholders:** none $Äî every code block is concrete.
- **Type consistency:** `Mention`, `EpisodeMentionGroup`, `PlatformStat`, `ReportPayload` defined once in Task 1 and referenced unchanged thereafter. `SocialPlatform` defined once in Task 6.
- **Known assumptions:**
  - Airtable field is named exactly `Brand Aliases`. Task 8 flags this as a manual out-of-band step.
  - Episode slug is the primary key for `episode_downloads_cache`. `getAllEpisodes()` exposes `slug` (verified in `src/lib/podcast.ts`).
  - `vitest.config.mts` picks up `*.test.ts` files under `src/` (convention already established in `src/lib/ndy/*.test.ts`).
