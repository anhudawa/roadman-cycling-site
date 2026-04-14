# Sponsor Report Generator — Design Spec

**Date:** 2026-04-14
**Status:** Approved for implementation
**Owner:** Ted
**Location in app:** `/admin/inventory/sponsors/[sponsorId]/reports/[yyyy-mm]`

## Goal

Give Roadman a one-click monthly report per sponsor (Training Peaks, Bikmo, Parlee, Hexis, SRAM, 4 Endurance, and any future sponsor) that can be screenshotted, emailed, or exported as a PDF to sponsors at renewal. The report quantifies:

1. Brand mentions in the Roadman Cycling podcast that month (with episode link + approximate timestamp + surrounding quote).
2. Episode-level download reach for the episodes that mentioned the sponsor.
3. Aggregate monthly audience data (website sessions, Facebook / X / Instagram views).

## Architecture

### Route

- **Report view:** `/admin/inventory/sponsors/[sponsorId]/reports/[yyyy-mm]`
- **PDF export:** `/admin/inventory/sponsors/[sponsorId]/reports/[yyyy-mm]/pdf`
- **Social stats entry:** inline form on the report view (same route, server action).

### Data sources

| Data | Source | Notes |
|------|--------|-------|
| Sponsor list + metadata | Existing Airtable pipeline via `src/lib/inventory/airtable.ts` | Add one new field `brandAliases` (comma-separated) on the sponsor record. |
| Episodes + transcripts | Existing MDX pipeline via `src/lib/podcast.ts` (`getAllEpisodes()`) | Transcript is a single text blob; no built-in timestamps. |
| Mentions | Computed on-demand | Regex scan transcript for each alias, case-insensitive, word-boundary. Return `{episodeId, charIndex, quote}`. |
| Approximate timestamp | Computed on-demand | `timestampSeconds = (charIndex / transcript.length) * episodeDurationSeconds`. |
| Episode downloads (v1) | Seeded deterministic fake | `seededDownloads(episodeId)` returns a stable integer in `[70_000, 150_000]` derived from a hash of the episode id. Cached in `episode_downloads_cache` on first access. |
| Website sessions | GA4 Data API | New helper `src/lib/analytics/ga4.ts` → `getMonthlyWebSessions(month)`. |
| Social views (FB / X / Instagram) | Manual entry | Stored in new `monthly_social_stats` table. Small form on the report page, one input per platform. |

### Caching

- Mentions + GA4 sessions: HTTP cache 1 hour per `(sponsorId, month)`.
- Social stats: no TTL — invalidate on save.
- Downloads cache: written once per episode, never auto-expired (source column allows later upgrade to real data).

### Rendering

- Report view is a React Server Component — fetches sponsor, episodes for the month, mentions, downloads, GA4, and social stats in parallel.
- PDF export route re-uses the same report components rendered through `@react-pdf/renderer` for a print-ready file. (Fall back to Puppeteer if `@react-pdf/renderer` has styling parity issues with the dark theme — evaluate during implementation.)

## Data model

### New Drizzle tables (`src/lib/db/schema.ts`)

```ts
export const monthlySocialStats = pgTable('monthly_social_stats', {
  id: serial('id').primaryKey(),
  month: varchar('month', { length: 7 }).notNull(), // 'YYYY-MM'
  platform: varchar('platform', { length: 20 }).notNull(), // 'facebook' | 'x' | 'instagram'
  views: integer('views').notNull(),
  enteredAt: timestamp('entered_at').defaultNow(),
  enteredBy: varchar('entered_by', { length: 100 }),
}, (t) => ({
  monthPlatformIdx: uniqueIndex('month_platform_idx').on(t.month, t.platform),
}));

export const episodeDownloadsCache = pgTable('episode_downloads_cache', {
  episodeId: varchar('episode_id', { length: 100 }).primaryKey(),
  downloads: integer('downloads').notNull(),
  source: varchar('source', { length: 20 }).notNull().default('seeded'), // 'seeded' | 'spotify' | 'manual'
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Airtable field addition

Add `brandAliases` (long text, comma-separated) to the Sponsors table. Matching defaults to the brand name itself if empty. Expose through the existing sponsor type in `src/lib/inventory/types.ts`.

### No mentions table

Mentions are computed on-demand from transcript text and cached at the HTTP layer. Storing them adds sync headaches for zero benefit at current episode volume.

## Modules

| File | Purpose |
|------|---------|
| `src/lib/reports/sponsor-report.ts` | Top-level composer: takes `(sponsorId, month)`, returns the full report payload. |
| `src/lib/reports/mentions.ts` | `findMentions(transcript, aliases) → Mention[]` with char-index + quote. Pure function, unit-tested. |
| `src/lib/reports/timestamp.ts` | `approximateTimestamp(charIndex, transcriptLength, durationSeconds)`. Pure, unit-tested. |
| `src/lib/reports/downloads.ts` | `seededDownloads(episodeId)` — deterministic hash → `[70k, 150k]`. Wraps `episode_downloads_cache` read-through. |
| `src/lib/reports/social-stats.ts` | CRUD for `monthly_social_stats`. Upsert on save. |
| `src/lib/analytics/ga4.ts` | GA4 Data API wrapper. One function: `getMonthlyWebSessions(month) → number`. |
| `src/app/admin/inventory/sponsors/[sponsorId]/reports/[month]/page.tsx` | Server component report view. |
| `src/app/admin/inventory/sponsors/[sponsorId]/reports/[month]/pdf/route.ts` | PDF export route. |
| `src/app/admin/inventory/sponsors/[sponsorId]/reports/[month]/actions.ts` | Server action for social-stats form submit. |
| `src/components/admin/reports/SponsorReport.tsx` | Top-level report UI (shared between web + PDF). |
| `src/components/admin/reports/ReportHero.tsx` | Logo + title + coral divider. |
| `src/components/admin/reports/HeadlineStats.tsx` | 4 animated counters + deltas. |
| `src/components/admin/reports/MentionsTimeline.tsx` | Episode list with mention rows + Listen deeplinks. |
| `src/components/admin/reports/AudiencePanel.tsx` | 2×2 platform grid. |
| `src/components/admin/reports/SocialStatsForm.tsx` | Inline entry form. |
| `src/components/admin/reports/MonthPicker.tsx` | Month selector on the sponsors index card. |

## UI

### Sponsors index (existing page, light upgrade)

Each sponsor card gains a **Reports** button with a month picker popover (defaults to previous month — the useful default for renewal conversations).

### Report page

Full-bleed dark layout, designed as a deliverable.

1. **Hero** — sponsor logo (large), sponsor name in Bebas Neue, subtitle "Monthly Partnership Report — <Month Year>". Coral divider.
2. **Headline stats row** — 4 animated counters:
   - Brand Mentions
   - Total Episode Reach (sum of downloads across mentioning episodes)
   - Web Sessions
   - Social Impressions (sum of FB + X + Insta)

   Each with a month-over-month delta pill (↑ coral / ↓ muted grey). Comparison month = previous month's report for the same sponsor.
3. **Mentions timeline** — chronological list of episodes that mentioned the sponsor this month. Each episode row shows:
   - Episode number + title
   - Mention count badge
   - Downloads number
   - Below: mention sub-rows of `MM:SS — "...10–15 words of surrounding transcript..."` with a coral **Listen →** button (Spotify deeplink with `?t=seconds`).
4. **Audience panel** — 2×2 grid of platform cards (Website, Facebook, X, Instagram). Each card: monthly view count, sparkline if history exists, platform icon, subtle brand-colored accent.
5. **Footer** — "Generated on <date> — Roadman Cycling" + prominent coral **Download PDF** button.

### Visual language

- Background: deep purple `#210140` fading to charcoal `#252526`.
- Headings / large numbers: Bebas Neue.
- Body: Work Sans.
- Accents + CTAs: coral `#F16363`.
- Generous whitespace, large type, counters animate up on first load. PDF uses same palette, static.

## Error handling & edge cases

- **Sponsor has no mentions this month:** timeline shows a friendly empty state ("No mentions this month — here's your audience growth instead") with the audience panel still rendered. Report is still useful.
- **No episodes published this month:** same empty state; headline counter reads `0` with delta disabled.
- **GA4 unreachable:** render the web card with a subtle "—" and an admin-only tooltip explaining the fetch failed. Report still loads.
- **Social stats not yet entered:** platform cards show the entry form inline instead of the number. Saving submits via server action and re-renders.
- **Transcript missing for an episode:** skip that episode silently for mention-matching but still include it in downloads if relevant. Log to server console.
- **Future month selected:** month picker disables future months.

## Testing

- **Unit (Vitest):** `findMentions` (case-insensitive, word-boundary, multi-alias, overlapping matches), `approximateTimestamp` (edge cases: char 0, char = length, zero-length transcript), `seededDownloads` (determinism, range bounds).
- **Integration:** report composer with a fixture month containing 2 episodes and 5 mentions. Verify payload shape end-to-end.
- **Visual regression (optional):** Playwright snapshot of the report page for one sponsor/month seeded with fixture data.

## Out of scope for v1

- Real Spotify download numbers (swap in later via `episode_downloads_cache.source`).
- Automated social scraping (manual entry chosen deliberately).
- Shareable public links for sponsors (sponsor email + PDF covers 95% of use cases).
- Human confirmation/correction of transcript mentions (can add later if alias matching proves noisy).
- Historical backfill for months before today — sparklines will fill in organically as months tick past.

## Rollout

1. Ship with seeded downloads + manual socials + GA4 live.
2. Use for the April 2026 reports this month.
3. If sponsors want more detail or we get mis-matches, add human-in-the-loop mention confirmation.
4. Swap seeded downloads for real Spotify numbers when a pipeline exists.
