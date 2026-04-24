# MCP Seed Data — Sources, Staleness, Placeholders

The seed scripts in `scripts/seed-mcp-*.ts` populate the MCP tables from the
real Roadman codebase wherever possible. This document tracks what is
derived automatically vs. what needs manual refresh, and when.

Run the full pipeline with:

```bash
npm run seed:mcp:all          # content → products → events → stats → embeddings
npm run validate:mcp:manifest # drift-check public/.well-known/mcp.json
```

---

## `scripts/seed-mcp-content.ts`

### Episodes (`mcp_episodes`) — derived from MDX

All episodes are pulled from `content/podcast/**/*.mdx` via `getAllEpisodes()`.
Every field (title, slug, date, guests, topics, summary, keyInsights, audio/
youtube URLs, durationSeconds) is extracted from the MDX frontmatter or
content. No placeholders.

**Refresh trigger:** re-run `npm run seed:mcp:content` after any new episode
lands in `content/podcast/`. Upserts by `slug` — safe to re-run.

### Experts (`mcp_experts`) — derived from guest profiles

Experts are upserted from `src/lib/guests.ts`:`getAllGuests()`, filtered to:

1. Names in the `FEATURED_EXPERTS` allow-list (37 names), OR
2. Any guest with ≥2 podcast appearances in the catalogue.

`appearanceCount` and `latestAppearance` are computed at seed time from
episode frontmatter. `keyQuotes` are joined from episode transcripts where a
quote is attributed to the guest via `mcpExpertQuotes`.

**Refresh trigger:** same as episodes — re-run after new episodes publish.

**Placeholder field:** none. If a guest has no credentials in
`KNOWN_CREDENTIALS`, the `credentials` column is an empty array — extend that
map rather than editing the seed.

### Methodology Principles (`mcp_methodology_principles`)

10 principles hand-curated in the script, each tagged with 3–5 search terms
and a `supportingEpisodeIds` array auto-wired by keyword match against
episode topics/titles at seed time.

**Placeholder field:** none. Editing a principle is editing the script
(intentional — these are canonical brand statements).

---

## `scripts/seed-mcp-products.ts`

16-product catalogue covering the full Roadman offering:

- **Paid coaching:** NDY Standard ($15/mo), NDY Premium ($195/mo), NDY VIP ($1,950/yr)
- **Paid courses:** Strength Training for Cyclists ($49.99, one-time)
- **Free community:** Clubhouse, Saturday Spin newsletter
- **Free diagnostic:** Masters Plateau Diagnostic
- **Free tools:** FTP Zones, Fuelling, W/kg, HR Zones, Energy Availability,
  Race Weight, Tyre Pressure, MTB Shock Pressure

`priceCents` reflects pricing as of **2026-04**. `billingPeriod` is
`monthly`, `yearly`, or `null` for free / one-time. URLs use `SITE_ORIGIN`
from `brand-facts.ts`.

**Refresh trigger:** pricing change, new product launch, or product sunset.
Set `isActive: false` rather than deleting — the MCP log tables reference
`productKey`.

---

## `scripts/seed-mcp-events.ts`

### Recurring rides — projected 12 weeks ahead

The three weekly rides are expanded into 12 concrete future occurrences via
`nextOccurrences(weekdayIndex, hour, minute, 12)`:

- **Monday 19:30 UTC** — Live Coaching Call (online, NDY members only)
- **Thursday 18:30 UTC** — Thursday Chop (Phoenix Park, Dublin)
- **Saturday 09:30 UTC** — Saturday Spin (360 Cycles, Clontarf, Dublin)

Times are stored in UTC; the MCP surface shows day + time copy separately for
localisation. Dublin DST shifts aren't modelled — close enough for
upcoming-event surfacing.

**Refresh trigger:** **re-run weekly** (or wire a cron). The projection walks
forward from today, so stale data never surfaces, but the horizon shrinks
each week until you re-seed.

### Annual events — manual

- Migration Gravel Girona — **2026-09-20**
- Roadman Summer Camp Wicklow — **2026-07-18**

**Refresh trigger:** each season, confirm dates with Anthony and update the
`makeAnnualEvents()` literal.

---

## `scripts/seed-mcp-community-stats.ts`

Singleton row. Headline podcast / audience numbers are derived from
`src/lib/brand-facts.ts`:`BRAND_STATS` so the MCP stays in lockstep with
on-page copy.

Platform-specific numbers that **cannot** be derived from the codebase are
declared as named constants at the top of the script, each annotated with
source + last-refreshed date:

| Constant | Source | Refreshed |
|---|---|---|
| `YT_MAIN_SUBS` | YouTube Studio → The Roadman Podcast | 2026-04 |
| `YT_CLIPS_SUBS` | YouTube Studio → Roadman Podcast Clips | 2026-04 |
| `CLUBHOUSE_FREE_MEMBERS` | Skool admin → Clubhouse | 2026-04 |
| `NDY_PAID_MEMBERS` | Skool admin → Not Done Yet | 2026-04 |

`featuredTransformations` is a hand-curated 3-row list of headline member
wins. Generic first-name + age until members consent to attribution.

**Refresh trigger:** monthly, after pulling fresh numbers. Update the date
comments at the same time as the values.

---

## Embeddings — `scripts/generate-mcp-embeddings.ts`

Generates and stores `vector(1024)` embeddings for episodes and methodology
principles so `search_episodes` and `search_methodology` return useful
nearest-neighbours.

**Provider selection:**

- If `VOYAGE_API_KEY` is set → Voyage `voyage-3-large` (1024 dims)
- Else if `OPENAI_API_KEY` is set → OpenAI `text-embedding-3-large` with
  `dimensions: 1024`
- Else → the script exits with a clear error.

**Resumability:** only embeds rows that don't already have an entry in
`mcp_episode_embeddings` / `mcp_methodology_embeddings`. Pass `--force` to
re-embed everything, `--only=episodes` or `--only=methodology` to scope,
and `--limit=N` to cap a run.

**Refresh trigger:** after `seed:mcp:content`. The `seed:mcp:all` composite
script runs it last automatically.

---

## Drift guard — `scripts/validate-mcp-manifest.ts`

Static-regex parse of `src/lib/mcp/server.ts` + `src/lib/mcp/resources.ts`
compared against `public/.well-known/mcp.json`. Fails loudly if:

- A tool is on the server but missing from the manifest (or vice versa).
- A resource is registered but not declared (or vice versa).
- The manifest `url` is not an absolute URL ending in `/api/mcp`.
- The `transport` is not `streamable-http`.
- Any tool/resource description is missing or <10 chars (warning).

Runs in <100 ms with no DB, no live server — safe for CI. Wire into the
pre-release check:

```bash
npm run validate:mcp:manifest
```
