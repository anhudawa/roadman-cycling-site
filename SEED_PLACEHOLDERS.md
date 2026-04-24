# MCP Seed Data — Placeholder Fields

The seed scripts in `scripts/seed-mcp-*.ts` populate the MCP tables with representative data.
Several fields contain placeholder values that must be replaced with real data before the MCP
server is used in a production context.

---

## `scripts/seed-mcp-content.ts`

### Episodes (`mcp_episodes`)

| Field | Placeholder | Action needed |
|-------|-------------|---------------|
| `audioUrl` | `https://roadmancycling.com/audio/PLACEHOLDER_*.mp3` | Replace with real CDN audio URLs from the podcast host |
| `youtubeUrl` | `https://www.youtube.com/watch?v=PLACEHOLDER_*` | Replace with real YouTube video IDs |
| `transcriptText` | `null` | Optional: add episode transcripts for better semantic search |
| `keyInsights` | Representative but hand-written | Review against actual episode content |

**Only 3 episodes are seeded.** Real data will have 1,400+ episodes. Consider a bulk import from
the podcast RSS feed or YouTube Data API rather than hand-editing the seed script.

### Experts (`mcp_experts`)

All 6 seeded experts are real people with accurate credentials and bios. Fields that may need
updating:

| Field | Note |
|-------|------|
| `appearanceCount` | Update with actual counts from the episode back-catalogue |
| `latestAppearance` | Update as new episodes with these experts air |

### Methodology Principles (`mcp_methodology_principles`)

All 6 seeded principles are substantive. The field that needs attention:

| Field | Note |
|-------|------|
| `supportingEpisodeIds` | All are `[]` — link to actual episode IDs once episodes are imported |

---

## `scripts/seed-mcp-events.ts`

Events have real structure but placeholder dates. **Check and update before each broadcast season:**

| Event | `startsAt` | Note |
|-------|-----------|------|
| Saturday Morning Group Ride — Dublin | 2026-05-03 | Recurring — update to next upcoming date |
| NDY Live Q&A — May 2026 | 2026-05-07 | Update monthly |
| NDY Live Q&A — June 2026 | 2026-06-04 | Update monthly |
| Migration Gravel — Girona 2026 | 2026-09-20 | Confirm date with Anthony |
| Roadman Summer Camp — Ireland | 2026-07-18 | Confirm date with Anthony |

Also check that `url` fields point to live pages — several link to event pages not yet published.

---

## `scripts/seed-mcp-products.ts`

Products reflect actual pricing as of April 2026. No structural placeholders — keep updated as
pricing changes. Fields to review if pricing changes:

- `priceCents` — recalculate if prices change
- `billingPeriod` — `monthly`, `yearly`, or `null` (one-time)
- `isActive` — set to `false` for discontinued products (do not delete, for log integrity)

---

## `scripts/seed-mcp-community-stats.ts`

The stats row is a **manually maintained singleton**. Update it whenever you have fresh numbers:

| Field | Source |
|-------|--------|
| `podcastDownloadsTotal` | Podcast host analytics dashboard |
| `youtubeSubscribersMain` | YouTube Studio → The Roadman Podcast channel |
| `youtubeSubscribersClips` | YouTube Studio → Roadman Podcast Clips channel |
| `freeCommunityMembers` | Skool admin → Clubhouse community |
| `paidCommunityMembers` | Skool admin → Not Done Yet community |
| `featuredTransformations` | Hand-curated — pick 2-3 compelling member results |

**Suggestion:** run `seed:mcp:community-stats` monthly after pulling fresh metrics from each platform.

---

## Embedding Population

After seeding episodes and methodology principles, generate and store embeddings so semantic
search works:

```bash
# TODO: write scripts/generate-mcp-embeddings.ts
# Should:
# 1. Query mcp_episodes with no corresponding mcp_episode_embeddings row
# 2. Call embedQuery(episode.summary + ' ' + episode.keyInsights.join(' '))
# 3. INSERT into mcp_episode_embeddings
# 4. Repeat for mcp_methodology_principles → mcp_methodology_embeddings
```

Without embeddings, `search_episodes` and `search_methodology` fall back to returning empty
arrays (the cosine similarity query simply finds no nearest neighbours).
