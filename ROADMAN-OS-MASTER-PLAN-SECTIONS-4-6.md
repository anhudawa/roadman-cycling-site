## 4. Complete API Route Map

Every API route grouped by domain. Auth defaults are stated once per group; exceptions are noted inline.

**Default auth:** All routes require a valid Supabase session, validated in `src/middleware.ts` via `@supabase/ssr` cookie-based session check. Unauthenticated requests receive `401`. Unauthorised requests (valid session, insufficient role) receive `403`.

---

### 4.1 Server Actions (Mutations via `'use server'`)

Server Actions are not HTTP routes — they are TypeScript functions in `src/lib/actions/` invoked directly from React components via form submissions or `startTransition`. Auth is validated internally via `createServerClient()` reading the session cookie. Each action validates input with Zod, checks permissions via `checkPermission(userId, resource, action)`, performs the operation, logs to `activity_log`, and calls `revalidatePath()` on affected routes.

| Action | File | Writes to | Auth check | Notes |
|---|---|---|---|---|
| `createCampaign(formData)` | `actions/campaigns.ts` | `campaigns`, `activity_log` | `can('campaigns', 'create')` | Validates `start_date < end_date`; sets `status = 'draft'` |
| `updateCampaign(id, formData)` | `actions/campaigns.ts` | `campaigns`, `activity_log` | `can('campaigns', 'update')` | Logs field-level diffs to `activity_log.changes` |
| `archiveCampaign(id)` | `actions/campaigns.ts` | `campaigns`, `activity_log` | `can('campaigns', 'delete')` | Soft delete: sets `archived_at = NOW()` |
| `createAsset(formData)` | `actions/assets.ts` | `assets`, `asset_topics`, `asset_tags`, `activity_log` | `can('assets', 'create')` | Handles topic/tag assignment in same transaction |
| `updateAsset(id, formData)` | `actions/assets.ts` | `assets`, `asset_topics`, `asset_tags`, `activity_log` | `can('assets', 'update')` — creators restricted to own assets | Diffs topic/tag sets; removes stale, inserts new |
| `linkDerivative(childId, parentId)` | `actions/assets.ts` | `assets` | `can('assets', 'update')` | Sets `source_asset_id` on child; sets `is_source = false` |
| `schedulePublication(formData)` | `actions/publications.ts` | `publications`, `activity_log` | `can('publications', 'publish')` | Validates platform exists and is active; checks `platform_reuse_policies` for `min_gap_days` conflicts |
| `createTask(formData)` | `actions/tasks.ts` | `tasks`, `activity_log` | `can('tasks', 'create')` | If `assigned_to` is set, triggers notification (Ticket 22) |
| `updateTaskStatus(id, status)` | `actions/tasks.ts` | `tasks`, `activity_log` | `can('tasks', 'update')` — creators restricted to assigned tasks | Records `started_at` on first move to `in_progress`; `completed_at` on `done` |
| `captureIdea(formData)` | `actions/ideas.ts` | `ideas`, `activity_log` | `can('ideas', 'create')` | Minimal validation: only `title` required |
| `promoteIdea(ideaId, assetData)` | `actions/ideas.ts` | `ideas`, `assets`, `activity_log` | `can('assets', 'create')` | Creates asset; sets `ideas.converted_to_asset_id` and `converted_at` |
| `addComment(formData)` | `actions/comments.ts` | `comments`, `activity_log` | Any authenticated user | Extracts `@mentions` from body; triggers notification per mentioned `profiles.id` |
| `addHighlight(formData)` | `actions/transcripts.ts` | `transcript_highlights`, `activity_log` | Any authenticated user | Validates `start_time_ms < end_time_ms`; validates `transcript_id` exists |
| `uploadFile(formData)` | `actions/files.ts` | `files`, Supabase Storage | `can('assets', 'update')` | Streams to Supabase Storage via signed URL; inserts `files` record on success |

**Rate limits:** Server Actions are protected by Vercel's built-in request limits (no additional application-level rate limiting needed for 5 users). No public API surface.

---

### 4.2 Core Data Route Handlers

| Route | Description | Auth | Rate limit notes |
|---|---|---|---|
| `GET /api/search?q=...&type=...&pillar=...` | Combined full-text (tsvector) + semantic (pgvector) search across `assets`, `transcripts`, `campaigns`, `ideas`, `tasks`. Returns results grouped by entity type with `ts_headline` highlights. | Supabase session | Debounced client-side (200ms); no server-side limit needed |
| `POST /api/upload` | Multipart file upload. Generates a Supabase Storage signed URL, returns it to the client for direct upload. On completion callback, inserts a `files` row. Max file size: 50MB. | Supabase session; `can('assets', 'update')` | 50MB body limit enforced in `next.config.ts` |
| `GET /api/assets?type=...&status=...&pillar=...&campaign=...&page=...` | Paginated, filtered asset list for `DataTable`. Default page size: 25. Supports `sort_by` and `sort_dir` query params. Joins `asset_topics` and `asset_tags` for topic/tag display. | Supabase session | Pagination prevents unbounded queries |
| `GET /api/campaigns/current` | Returns the active `weekly_focus` campaign: `SELECT * FROM campaigns WHERE type = 'weekly_focus' AND status = 'active' AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE ORDER BY start_date DESC LIMIT 1`. Includes linked assets count and task summary. | Supabase session | Cached with `revalidate: 300` (5 min) |
| `GET /api/publications?from=...&to=...&platform=...` | Publications for the calendar view. Date range query on `scheduled_at` and `published_at`. Joins `platforms` for colour coding and `assets` for title/type. | Supabase session | Max range: 90 days enforced server-side |
| `POST /api/performance` | Batch insert `performance_records`. Accepts array of records with `publication_id`, `source`, and metric fields. Used by sync handlers and manual import. | Supabase session; `can('performance', 'create')` | Batch size capped at 500 records per request |
| `GET /api/performance/summary?asset=...&platform=...&period=...` | Aggregated performance data. Groups `performance_records` by `period_start` with SUM/AVG aggregations. Returns `views`, `engagement_rate`, `likes`, `comments`, `shares` with period-over-period delta percentages. | Supabase session | Response cached with `revalidate: 3600` for `period=all_time` |

---

### 4.3 Platform Sync Routes

All sync routes validate the request origin: either `CRON_SECRET` header (for cron-triggered syncs) or an admin/leadership Supabase session (for manual triggers). Each creates a `sync_jobs` record on entry and updates it on completion.

| Route | Description | Auth | Rate limit notes |
|---|---|---|---|
| `POST /api/sync/youtube/route.ts` | Pulls video list from YouTube Data API v3 (`videos.list`), performance metrics from YouTube Analytics API (`reports.query`). Writes cumulative snapshots to `performance_records`; measured daily deltas to `performance_daily` (`is_measured = true`). Both channels synced sequentially. | CRON_SECRET or admin session | YouTube quota: ~500 units/day of 10,000 limit |
| `POST /api/sync/meta/route.ts` | Pulls Instagram media list (`/{user-id}/media`), per-post insights (`/{media-id}/insights`), Facebook post list and insights. Writes to `performance_records`. | CRON_SECRET or admin session | Meta: ~50-80 calls of 200/user/hour limit |
| `POST /api/sync/linkedin/route.ts` | Pulls organisation posts and statistics. Writes to `performance_records`. | CRON_SECRET or admin session | LinkedIn: ~20 calls of 100/day limit |
| `POST /api/sync/spotify/route.ts` | Parses podcast RSS feed for episode metadata. Creates `podcast_episode` assets for new episodes. Content metadata only — analytics handled by `/api/sync/spotify-analytics`. | CRON_SECRET or admin session | RSS: no rate limit |
| `POST /api/sync/beehiiv/route.ts` | Pulls newsletter sends (`/publications/{id}/posts`), per-send stats, subscriber counts. Writes to `performance_records`. | CRON_SECRET or admin session | Beehiiv: generous API limits; no concern at Roadman's volume |
| `POST /api/sync/ga4/route.ts` | Pulls per-article pageviews, engagement, bounce rate, scroll depth via GA4 Data API `runReport`. Matches `pagePath` to assets by slug/URL. Writes measured daily rows to `performance_daily` (`is_measured = true`, `source = 'ga4'`). Channel-level demographics to `audience_demographics`. | CRON_SECRET or admin session | GA4: ~5 requests of 10,000/day quota |
| `POST /api/sync/tiktok/route.ts` | TikTok Business API. Pulls video list (`/business/video/list/`), account insights (`/business/get/`), demographics. Writes cumulative snapshots to `performance_records`; measured account-level daily series to `performance_daily`; demographics to `audience_demographics`. | CRON_SECRET or admin session | TikTok Business API: hundreds/minute; no concern |
| `POST /api/sync/twitter/route.ts` | X API v2. Pulls recent tweets (`/2/users/{id}/tweets`) and tweet metrics (`/2/tweets` with `non_public_metrics`). Writes cumulative snapshots to `performance_records`. Daily deltas derived via snapshot subtraction (Ticket 52). | CRON_SECRET or admin session | X Basic: 10,000 post-reads/month. Request budgeter in `sync_jobs.custom` hard-stops before cap |
| `POST /api/sync/spotify-analytics/route.ts` | Spotify for Podcasters analytics (unofficial endpoints behind feature flag). Pulls show-level daily streams/listeners/followers, per-episode completion and retention curves. Writes measured daily rows to `performance_daily`; demographics to `audience_demographics`. Falls back to CSV importer if flag disabled. | CRON_SECRET or admin session | Self-throttled to ~1 req/second. Unofficial: schema drift flips connection to Error state |
| `POST /api/sync/gsc/route.ts` | Google Search Console via service account. Pulls page x query x day rows. Writes to `search_console_daily`. Matches pages to assets by URL; topics matched via `topic_aliases` + embedding cosine fallback. 3-day reporting lag handled. | CRON_SECRET or admin session | GSC API: 2,000 queries/day; daily sync uses ~5-10 |
| `GET /api/sync/status/route.ts` | Sync status dashboard data. Reads `platform_connections` (last_sync_at, last_sync_status, error_count), recent `sync_jobs` per connection, and data freshness indicators. No writes. | Supabase session | Cached with `revalidate: 60` |

---

### 4.4 Cron Routes

| Route | Description | Auth | Rate limit notes |
|---|---|---|---|
| `GET /api/cron/daily-sync/route.ts` | Daily analytics sync orchestrator. Creates a parent `sync_jobs` record, then calls each connected platform's sync handler sequentially. Each platform sync is error-isolated — one failure does not abort others. | `CRON_SECRET` header validated; rejects without it | Runs once daily at 06:00 UTC; no rate concern |
| `GET /api/cron/weekly-sync/route.ts` | Weekly deep sync orchestrator. Full video/post list sweep, deeper metrics (demographics, subscriber sources, revenue), benchmark recalculation. | `CRON_SECRET` header validated | Runs once weekly, Monday 03:00 UTC |

---

### 4.5 Auth Callback Routes

OAuth2 callback handlers. Each validates the `state` parameter against a server-side nonce (stored in encrypted cookie during the OAuth initiation), exchanges the authorisation code for access/refresh tokens, stores tokens in `platform_connections` (encrypted at rest), and redirects to `/settings/integrations`.

| Route | Description | Auth |
|---|---|---|
| `GET /api/auth/youtube/callback` | Google/YouTube OAuth2 callback. Scopes: `youtube.readonly`, `yt-analytics.readonly`, `yt-analytics-monetary.readonly`. | State parameter + Supabase session |
| `GET /api/auth/meta/callback` | Meta OAuth2 callback. Scopes: `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`, `pages_show_list`, `read_insights`. | State parameter + Supabase session |
| `GET /api/auth/linkedin/callback` | LinkedIn OAuth2 callback. Scopes: `r_organization_social`, `rw_organization_admin`. | State parameter + Supabase session |
| `GET /api/auth/tiktok/callback` | TikTok Business OAuth2 callback. Business Account insight and video-list scopes. | State parameter + Supabase session |
| `GET /api/auth/twitter/callback` | X/Twitter OAuth2 callback with PKCE. Scopes: `tweet.read`, `users.read`, `offline.access`. | State parameter + PKCE verifier + Supabase session |

---

### 4.6 Webhook Routes

Webhook routes do not use Supabase session auth. Each validates a platform-specific signature or token.

| Route | Description | Auth | Rate limit notes |
|---|---|---|---|
| `POST /api/webhooks/youtube/route.ts` | YouTube PubSubHubbub push notifications. Receives new-video events for both channels. Validates the hub signature. Creates asset + publication records immediately; triggers an initial metrics pull. | HMAC signature validation against the hub secret | Infrequent — fires only on new video publish |
| `POST /api/webhooks/beehiiv/route.ts` | Beehiiv webhook receiver. Fires when a newsletter is sent. Validates webhook secret header. Creates a `newsletter` asset record and starts performance tracking. | Webhook secret header validation | Infrequent — fires only on new newsletter send |

---

### 4.7 Intelligence Routes

Routes added by the intelligence expansion (Phases 9-12). All require a valid Supabase session.

| Route | Description | Auth | Rate limit notes |
|---|---|---|---|
| `GET /api/trends/explorer?topic=...&source=...&metric=...` | Trend explorer data. Returns the 53-week seasonal index curve for a given `topic_id` from `seasonal_indices`, plus per-year overlays from `per_year_values`, plus `calendar_events` markers for the x-axis. Joins `topics` for metadata. | Supabase session | Response cached with `revalidate: 3600` (indices recompute weekly) |
| `GET /api/trends/almanac?month=...&confidence=...` | Seasonal almanac. 12-month grid of topic peaks. Queries `seasonal_indices` grouped by ISO week, filtered by `confidence` >= requested tier (default: `probable`). Returns topics sorted by `index_value` within each month bucket. | Supabase session | Heavy read; cached with `revalidate: 3600` |
| `GET /api/trends/anomalies?days=...&acknowledged=...` | Current anomalies. Reads `anomalies` table filtered by `detected_on` >= NOW() - interval and `is_acknowledged`. Joins `topics` for names. Default: last 7 days, unacknowledged only. | Supabase session | Lightweight read |
| `GET /api/trends/forecasts?topic=...&weeks=...` | 8-week forecasts per topic. Reads `forecasts` for `target_week` >= CURRENT_DATE, filtered by `topic_id`. Includes `abs_pct_error` history for the topic to show typical accuracy (MAPE). | Supabase session | Lightweight read |
| `GET /api/insights?type=...&status=...&topic=...&category=...` | Insight list with filters. Reads `insights` table with optional filters on `type`, `status`, `topic_id`, `commercial_category`. Paginated. Joins `topics` for topic name. | Supabase session | Paginated; default 20 per page |
| `POST /api/insights/[id]/review` | Review an insight. Body: `{ status: 'validated' or 'dismissed', reason?: string }`. Updates `insights.status`, `reviewed_by`, `reviewed_at`. Sets `sponsor_safe` toggle (admin/commercial roles only via permission check). | Supabase session; `can('insights', 'update')` | — |
| `POST /api/insights/[id]/action` | Create an asset from an insight. Pre-fills asset title and description from the insight's `statement` and `evidence`. Links via `insights.actioned_asset_id`. Creates a `content_briefs` record with insight evidence attached. | Supabase session; `can('assets', 'create')` | — |
| `GET /api/sponsor/evidence-pack/[category]` | Sponsor evidence pack data for a `commercial_category`. Aggregates: audience size (from `audience_demographics`), seasonal demand curve (from `seasonal_indices` where `confidence >= 'established'`), validated `sponsor_safe` insights, format effectiveness ratios, past campaign performance from `performance_records`. Only surfaces `insights.sponsor_safe = true` records. | Supabase session; `can('sponsors', 'read')` | Response cached with `revalidate: 86400` (daily) |
| `GET /api/revenue/dashboard?period=...&topic=...` | Revenue attribution dashboard data. Aggregates `revenue_events` by `attributed_topic_id`, month, and `attribution_method`. Joins `products` for product names. Includes NDY join-curve overlay (revenue events with `event_type = 'join'` plotted against content calendar from `publications.published_at`). | Supabase session; `can('performance', 'read')` | — |
| `GET /api/segments?active=...` | Audience segments list. Reads `audience_segments` with `member_count`, `topic_affinities`, `seasonal_profile`, `revenue_rate`. Optionally filtered by `is_active`. | Supabase session | Lightweight read |
| `POST /api/community/snapshots` | Submit weekly Skool snapshot. Body matches `community_snapshots` columns. Pre-fills with previous week's values for quick entry. | Supabase session; any authenticated user | — |
| `POST /api/community/posts/import` | Import Skool post titles. Accepts a text blob or CSV. Auto-classifies topics via `topic_aliases` + embedding cosine similarity. Low-confidence matches flagged for review. | Supabase session; `can('assets', 'create')` | — |
| `GET /api/intelligence/health` | Data quality and coverage dashboard. Sync coverage heat-map, topic taxonomy health, alias coverage, stale-index warnings, pg_cron job status. | Supabase session; admin role | — |

---

## 5. Cron Job Specifications

Nine scheduled jobs across two execution environments. Vercel Cron handles jobs that require external API calls or TypeScript execution. pg_cron handles jobs that are pure SQL computation inside Postgres.

---

### Job 1: Daily Analytics Sync

- **Name:** `daily-analytics-sync`
- **Schedule:** `0 6 * * *` — 06:00 UTC every day
- **Runs in:** Vercel Cron (triggers `GET /api/cron/daily-sync/route.ts`)
- **What it does:**
  1. Validates `CRON_SECRET` header
  2. Creates a parent `sync_jobs` record with `job_type = 'daily_analytics'`, `triggered_by = 'cron'`
  3. Queries `platform_connections WHERE is_active = true` to get the list of connected platforms
  4. For each connection, sequentially:
     a. Creates a child `sync_jobs` record with `status = 'running'`
     b. Calls the platform-specific sync handler
     c. Each handler: fetches yesterday's metrics → upserts cumulative snapshots into `performance_records` → writes measured daily rows into `performance_daily` where the API provides true daily figures (`is_measured = true`) → updates `platform_connections.last_sync_at` and `last_sync_status`
     d. Updates child `sync_jobs` with `records_processed`, `records_created`, `records_updated`, `status = 'completed'`
  5. Each platform sync is wrapped in a try/catch — one failure does not abort the remaining platforms
  6. Updates parent `sync_jobs` with aggregate results
- **Dependencies:** `platform_connections` must have at least one active connection with valid tokens. OAuth tokens must not be expired (each sync handler calls `getValidToken()` which attempts a refresh before the sync).
- **Error handling:** Each platform sync retries up to 3 times with exponential backoff (1 minute, 5 minutes, 30 minutes). After 3 failures: sets `sync_jobs.status = 'failed'`, increments `platform_connections.error_count`. If `error_count` reaches 5 consecutive failures, sets `platform_connections.is_active = false` (circuit breaker) and triggers a notification to admin users.
- **Estimated execution time:** 30-60 seconds total.

---

### Job 2: Weekly Deep Sync

- **Name:** `weekly-deep-sync`
- **Schedule:** `0 3 * * 1` — Monday 03:00 UTC
- **Runs in:** Vercel Cron (triggers `GET /api/cron/weekly-sync/route.ts`)
- **What it does:**
  1. Full content list sweep per platform (catches content published outside Roadman OS)
  2. Deeper metrics: demographics, subscriber sources, revenue data, retention curves, non-public metrics
  3. Recalculates performance benchmarks (10th, 25th, 75th, 90th percentiles)
  4. Recalculates performance classifications (exceptional / strong / average / weak)
- **Error handling:** Same as Job 1 — per-platform error isolation, 3 retries with exponential backoff, circuit breaker at 5 consecutive failures.
- **Estimated execution time:** 2-3 minutes.

---

### Job 3: Daily Delta Derivation

- **Name:** `derive-performance-daily`
- **Schedule:** `0 4 * * *` — 04:00 UTC daily (pg_cron)
- **Function:** `derive_performance_daily()`
- **What it does:** Computes daily deltas from consecutive `performance_records` snapshots. Writes to `performance_daily` with `is_measured = false`. Handles gaps by spreading deltas evenly. Clamps negative deltas to 0. Skips where measured daily rows already exist.
- **Estimated execution time:** < 30 seconds.

---

### Job 4: Topic Daily Aggregation

- **Name:** `aggregate-topic-daily-metrics`
- **Schedule:** `30 4 * * *` — 04:30 UTC daily (pg_cron)
- **Function:** `aggregate_topic_daily_metrics()`
- **What it does:** Joins `performance_daily` through `asset_topics` to aggregate by topic. Applies three-step normalisation (per-piece, channel-baseline, age-cohort) to compute `relative_interest`. Writes to `topic_daily_metrics`.
- **Estimated execution time:** 1-2 minutes.

---

### Job 5: Seasonal Index Recomputation

- **Name:** `compute-seasonal-indices`
- **Schedule:** `0 5 * * 1` — Monday 05:00 UTC weekly (pg_cron)
- **Function:** `compute_seasonal_indices()`
- **What it does:** For each tracked topic x source x metric, buckets `relative_interest` by ISO week, applies 3-week rolling mean, computes per-year and cross-year averages, computes confidence score from four weighted components (years observed, consistency, sample depth, cross-signal corroboration). Hard floor enforcement for insufficient data.
- **Estimated execution time:** 2-5 minutes.

---

### Job 6: Anomaly Detection

- **Name:** `detect-anomalies`
- **Schedule:** `0 5 * * *` — 05:00 UTC daily (pg_cron)
- **Function:** `detect_anomalies()`
- **What it does:** Computes seasonally-adjusted residuals using robust z-scores (median/MAD over trailing 8 weeks). Writes anomalies where |z| > 2.5. Triggers notifications for |z| > 3.5.
- **Estimated execution time:** < 30 seconds.

---

### Job 7: Forecast Generation

- **Name:** `generate-forecasts`
- **Schedule:** `30 5 * * 1` — Monday 05:30 UTC weekly (pg_cron)
- **Function:** `generate_forecasts()`
- **What it does:** For topics with `probable` or higher confidence, computes 8-week forecasts using seasonal-naive-with-drift model. Self-grades by backfilling actuals and computing MAPE.
- **Estimated execution time:** < 1 minute.

---

### Job 8: Insight Generation

- **Name:** `generate-insights`
- **Schedule:** `0 6 * * 5` — Friday 06:00 UTC weekly
- **Runs in:** Vercel Cron
- **What it does:** Runs six generators sequentially: `seasonal_peak`, `timing_recommendation`, `format_effectiveness`, `audience_affinity`, `demand_gap`, `decay_seasonal`. All numbers computed in SQL, templated into statements. Optional LLM polish for prose only. Deduplicates against existing insights.
- **Estimated execution time:** 1-2 minutes.

---

### Job 9: Segment Clustering

- **Name:** `cluster-audience-segments`
- **Schedule:** `0 6 1 * *` — 1st of each month, 06:00 UTC
- **Runs in:** Vercel Cron
- **What it does:** Fetches subscriber engagement events from Beehiiv, builds topic-affinity vectors, runs k-means clustering (k = 5-8). Writes to `audience_segments` and `segment_members` (hashed identifiers only).
- **Estimated execution time:** 30-60 seconds.

---

### Cron Job Summary

| # | Name | Schedule | Environment | Depends on | Est. time |
|---|---|---|---|---|---|
| 1 | Daily Analytics Sync | `0 6 * * *` (06:00 UTC daily) | Vercel Cron | Active `platform_connections` | 30-60s |
| 2 | Weekly Deep Sync | `0 3 * * 1` (Mon 03:00 UTC) | Vercel Cron | Active `platform_connections` | 2-3 min |
| 3 | Daily Delta Derivation | `0 4 * * *` (04:00 UTC daily) | pg_cron | Job 1 (new `performance_records`) | < 30s |
| 4 | Topic Daily Aggregation | `30 4 * * *` (04:30 UTC daily) | pg_cron | Job 3 | 1-2 min |
| 5 | Seasonal Index Recomputation | `0 5 * * 1` (Mon 05:00 UTC) | pg_cron | Job 4 | 2-5 min |
| 6 | Anomaly Detection | `0 5 * * *` (05:00 UTC daily) | pg_cron | Jobs 4, 5 | < 30s |
| 7 | Forecast Generation | `30 5 * * 1` (Mon 05:30 UTC) | pg_cron | Job 5 | < 1 min |
| 8 | Insight Generation | `0 6 * * 5` (Fri 06:00 UTC) | Vercel Cron | Jobs 5, 6, 7 | 1-2 min |
| 9 | Segment Clustering | `0 6 1 * *` (1st of month 06:00 UTC) | Vercel Cron | Beehiiv API, `asset_topics` | 30-60s |

**Daily execution chain (UTC):**
```
03:00  Weekly Deep Sync (Mondays only)
04:00  Delta Derivation (pg_cron)
04:30  Topic Daily Aggregation (pg_cron)
05:00  Seasonal Index Recomputation (Mondays only, pg_cron)
05:00  Anomaly Detection (pg_cron)
05:30  Forecast Generation (Mondays only, pg_cron)
06:00  Daily Analytics Sync (Vercel Cron)
06:00  Insight Generation (Fridays only, Vercel Cron)
06:00  Segment Clustering (1st of month only, Vercel Cron)
```

The daily sync runs at 06:00 and the delta derivation at 04:00 — this means the derivation processes yesterday's sync data (synced at 06:00 the previous day), not today's. There is always a one-day lag between data capture and delta computation. This is deliberate: it ensures the sync has fully completed before derivation begins.

---

## 6. Data Flow: Platform to Insight

### 6.1 End-to-End Flow Diagram

```
                    PLATFORM APIs
                    -------------
    YouTube . Meta . LinkedIn . Beehiiv . GA4 . TikTok
    X/Twitter . Spotify Analytics . GSC . Skool (manual)
                         |
                         v
              +---------------------+
              |   SYNC HANDLERS     |  POST /api/sync/{platform}/route.ts
              |   (Vercel, 06:00)   |  Job 1: Daily Analytics Sync
              +----------+----------+
                         |
            +------------+----------------------------+
            v            v                            v
   +-------------+ +------------------+  +----------------------+
   | performance_ | | performance_     |  | audience_            |
   | records      | | daily            |  | demographics         |
   | (cumulative  | | (measured daily  |  | (age/gender/geo      |
   |  snapshots)  | |  rows where API  |  |  per asset/channel)  |
   |              | |  provides them)  |  |                      |
   +------+-------+ +------------------+  +----------------------+
          |                ^
          |                |
          v                |
   +------------------+    |
   | derive_           |    |
   | performance_      |----+   Also writes:
   | daily()           |        search_console_daily (GSC sync)
   | (pg_cron, 04:00)  |        community_posts (Skool import)
   | Job 3             |        community_snapshots (Skool form)
   +------------------+        revenue_events (CSV/UTM import)
          |
          v
   +------------------+
   | performance_     |
   | daily            |  <- Now complete: measured + derived
   | (all daily       |     rows for every publication
   |  deltas)         |
   +------+-----------+
          |
          |  Joined through asset_topics
          v
   +----------------------------------+
   | aggregate_topic_daily_metrics()  |  pg_cron, 04:30 daily
   | Job 4                           |
   |                                 |
   | Three-step normalisation:       |
   |  1. Per-piece (/ live assets)   |
   |  2. Channel-baseline (/ 90d)    |
   |  3. Age-cohort / GSC-primary    |
   |  -> relative_interest           |
   +--------------+-------------------+
                  |
                  v
   +------------------------------+
   | topic_daily_metrics          |  1 row per topic x source x date
   | (the core time series)      |  ~365k rows/year
   +--------------+---------------+
                  |
       +----------+----------------------+
       v          v                      v
  +----------+ +--------------+  +----------------+
  | compute_ | | detect_      |  | generate_      |
  | seasonal_| | anomalies()  |  | forecasts()    |
  | indices()| | Job 6        |  | Job 7          |
  | Job 5    | | (daily)      |  | (weekly)       |
  +----+-----+ +------+-------+  +-------+--------+
       |              |                   |
       v              v                   v
  +----------+ +--------------+  +----------------+
  | seasonal_| | anomalies    |  | forecasts      |
  | indices  | |              |  |                |
  +----+-----+ +------+-------+  +-------+--------+
       |              |                   |
       +--------------+-------------------+
                      |
                      v
          +-------------------------+
          | INSIGHT GENERATORS      |  Vercel Cron, Fri 06:00
          | Job 8                   |
          |                        |
          | seasonal_peak          |
          | timing_recommendation  |
          | format_effectiveness   |
          | audience_affinity      |
          | demand_gap             |
          | decay_seasonal         |
          +-----------+-------------+
                      |
                      v
          +-------------------------+
          | insights                |  status = 'candidate'
          | (reviewed by team)      |
          +-----------+-------------+
                      |
                      v
          +-------------------------+
          | SPONSOR EVIDENCE PACKS  |
          | REVENUE DASHBOARD       |
          | ANNUAL REPORT           |
          +-------------------------+
```

### 6.2 Data Volume Estimates

| Table | Growth rate | After 3 years |
|---|---|---|
| `performance_records` | ~500 snapshots/day | ~550k rows |
| `performance_daily` | ~500 rows/day | ~550k rows |
| `topic_daily_metrics` | ~1,000 rows/day | ~1.1M rows |
| `seasonal_indices` | ~32k rows total (replaced weekly) | ~32k rows |
| `anomalies` | ~5-20 rows/day | ~20k rows |
| `forecasts` | ~5,000 rows/week (replaced weekly) | ~5k rows |
| `insights` | ~20-50 rows/week | ~5k rows |
| `search_console_daily` | ~500-2,000 rows/day | ~2M rows |
| `audience_demographics` | ~200 rows/month | ~7k rows |

All tables comfortably within Supabase Pro's 8GB storage limit. No partitioning needed for a decade at this volume.
