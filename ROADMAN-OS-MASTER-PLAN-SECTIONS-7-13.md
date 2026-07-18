## 7. Platform Integration Matrix

Eleven platforms, zero blind spots. Each specification block below defines exactly what we pull, how, at what cost, and where the bodies are buried.

---

### 7.1 YouTube (Data API v3 + Analytics API)

- **Auth method:** OAuth 2.0 via ted@roadmancycling.com. Scopes: `youtube.readonly`, `yt-analytics.readonly`, `yt-analytics-monetary.readonly`. Tokens stored in `platform_connections`; refresh via `getValidToken()`.
- **Channels:** The Roadman Podcast (main, 61.7K subscribers) + Roadman Podcast Clips (13.2K subscribers). Both channels connected under the same OAuth grant.
- **Exact endpoints used:**
  - Data API: `videos.list` (snippet, contentDetails, statistics — 1 quota unit), `channels.list` (statistics — 1 quota unit), `search.list` (for new video discovery — 100 quota units, used sparingly)
  - Analytics API: `reports.query` with dimensions `video`, `day` and metrics `views`, `estimatedMinutesWatched`, `averageViewDuration`, `cardClickRate`, `subscribersGained`, `estimatedRevenue`, `estimatedAdRevenue` (~50 quota units per call). Demographics: dimensions `ageGroup`, `gender`, `country` per video.
- **Rate limits:** 10,000 quota units/day shared across all API calls. Daily sync consumes ~500 units.
- **Data mapping:**
  - `views` → `performance_daily.views` / `performance_records.views`
  - `estimatedMinutesWatched` x 60 → `performance_daily.watch_time_seconds`
  - `averageViewDuration` → `performance_daily.custom_metrics.avg_view_duration_seconds`
  - `cardClickRate` → `performance_records.click_through_rate`
  - `estimatedRevenue` x 100 → `performance_daily.revenue_cents`
  - `subscribersGained` → `performance_daily.subscribers_gained`
  - `ageGroup` x `gender` x `country` → `audience_demographics` rows
- **Cost:** Free.
- **Historical backfill:** Full. Day-by-day per-video back to channel creation (Ticket 55). 3-8 years of measured daily data.
- **Known limitations:** Quota is the binding constraint for bulk backfill. Demographics are per-video with monthly granularity minimum. Shorts analytics have a narrower metric set than long-form.

---

### 7.2 Meta (Instagram + Facebook)

- **Auth method:** OAuth 2.0 via Meta Business. Scopes: `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`, `pages_show_list`, `read_insights`. Long-lived tokens (60 days) refreshed before expiry.
- **Accounts:** @roadman.cycling (Instagram, 49.4K followers) + Roadman Cycling (Facebook, 29.9K followers).
- **Exact endpoints used:**
  - Instagram: `/{user-id}/media`, `/{media-id}/insights` (reach, impressions, engagement, saved, shares, video_views), `/{user-id}/insights`
  - Facebook: `/{page-id}/posts`, `/{post-id}/insights`, `/{page-id}/insights`
- **Rate limits:** 200 calls/user/hour. Daily sync uses ~50-80 calls.
- **Data mapping:**
  - `video_views` or `impressions` → `performance_records.views`
  - `reach` → `performance_records.reach`
  - Reactions total → `performance_records.likes`
  - `shares` → `performance_records.shares`
  - `saved` → `performance_records.saves`
- **Cost:** Free.
- **Historical backfill:** Partial. ~2 years of post-level data. No per-post daily series — all deltas derived from snapshot subtraction.
- **Known limitations:** Demographics are account-level only, not per-post. App Review required for `instagram_manage_insights` — submit early. Instagram API does not return Story data after 24 hours.

---

### 7.3 LinkedIn

- **Auth method:** OAuth 2.0. Scopes: `r_organization_social`, `rw_organization_admin`.
- **Exact endpoints used:**
  - `GET /organizationPosts`, `GET /organizationalEntityShareStatistics`, `GET /organizations/{id}`, `GET /organizationalEntityFollowerStatistics`
- **Rate limits:** 100 calls/day. This is tight. Daily sync: ~10-15 calls.
- **Data mapping:**
  - `impressions` → `performance_records.impressions`
  - `clicks` → `performance_records.clicks`
  - `likes` → `performance_records.likes`
  - `comments` → `performance_records.comments`
  - `shares` → `performance_records.shares`
- **Cost:** Free.
- **Historical backfill:** Limited. Paginate recent posts at connect time.
- **Known limitations:** 100 calls/day hard cap. Demographics are professional (industry/seniority), not personal (age/gender). Token refresh requires re-authorisation if the refresh token expires.

---

### 7.4 Beehiiv

- **Auth method:** API key. Stored in `platform_connections.api_key`.
- **Exact endpoints used:**
  - `GET /publications/{id}/posts` — sent newsletters
  - `GET /publications/{id}/posts/{id}/stats` — per-send stats
  - `GET /publications/{id}/stats` — publication-level subscriber counts
  - `GET /publications/{id}/segments` — subscriber segments
- **Rate limits:** Generous. Self-throttle at 2 requests/second.
- **Data mapping:**
  - `open_rate` → `performance_records.open_rate`
  - `unique_clicks` → `performance_records.clicks`
  - `new_subscribers` → `performance_records.new_subscribers`
  - `unsubscribes` → `performance_records.unsubscribes`
- **Cost:** Included with Beehiiv plan.
- **Historical backfill:** Full. All historical sends with per-send stats. Also feeds Ticket 68 (audience segment discovery) via per-subscriber click/open event data.
- **Known limitations:** No per-send daily series — metrics stabilise within 72 hours. Subscriber-level event data may require elevated API access.

---

### 7.5 Google Analytics 4 (GA4)

- **Auth method:** Service account (server-to-server JWT). Same service account as GSC. No OAuth flow needed.
- **Exact endpoints used:**
  - `POST /properties/{propertyId}:runReport` — article-level pageviews, traffic sources, device breakdown, demographics, new vs returning, landing pages.
- **Rate limits:** 10,000 requests/day. Daily sync uses 2-5 requests.
- **Data mapping:**
  - `screenPageViews` → `performance_daily.views` (source = 'ga4')
  - `activeUsers` → `performance_daily.reach`
  - `engagementRate` → `performance_daily.custom_metrics.engagement_rate`
  - `bounceRate` → `performance_daily.custom_metrics.bounce_rate`
  - All rows written with `is_measured = true`
- **Cost:** Free.
- **Historical backfill:** Full. Data API serves historical data back to property creation.
- **Known limitations:** Demographics require Google Signals enabled. Thresholding: GA4 withholds data for small sample sizes. Processing lag: 24-48 hours.

---

### 7.6 Google Search Console (GSC)

- **Auth method:** Service account (same as GA4). Server-to-server JWT.
- **Exact endpoints used:**
  - `POST /sites/{siteUrl}/searchAnalytics/query` — dimensions: `page`, `query`, `date`. Returns clicks, impressions, position.
- **Rate limits:** 200 requests/minute. Daily sync uses 1-3 requests.
- **Data mapping:**
  - `clicks` → `search_console_daily.clicks`
  - `impressions` → `search_console_daily.impressions`
  - `position` → `search_console_daily.position`
  - `page` → matched to `asset_id` by URL
  - `query` → matched to `topic_id` via `topic_aliases` + embedding fallback
- **Cost:** Free.
- **Historical backfill:** 16-month rolling window — **the most perishable data source.** Full window must be backfilled immediately at first sync (Ticket 53).
- **Known limitations:** 3-day reporting lag. Query-level data is sampled for high-traffic properties (Roadman should be below threshold). Asset matching via URL requires clean URL-to-asset mapping.

---

### 7.7 TikTok (Business API)

- **Auth method:** OAuth 2.0. `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET`.
- **Exact endpoints used:**
  - `GET /business/get/` — account insights (daily granularity in 30-day windows), audience demographics
  - `GET /business/video/list/` — video list with metrics including completion rate and impression sources
  - **Fallback:** Display API — views, likes, comments, shares only
- **Rate limits:** Generous (hundreds/minute).
- **Data mapping:**
  - `video_views` → `performance_records.views`
  - `total_time_watched` → `performance_records.watch_time_seconds`
  - `full_video_watched_rate` → `performance_records.custom_metrics.completion_rate`
  - `impression_sources` → `performance_records.custom_metrics.impression_sources`
  - Account daily series → `performance_daily` with `is_measured = true`
  - `audience_ages` x `audience_genders` → `audience_demographics`
- **Cost:** Free. Only cost is app-review lead time.
- **Historical backfill:** Limited. Daily account series only ~60 days back. Connect early.
- **Known limitations:** App review can take days to weeks. Age brackets coarser than YouTube's. Display API fallback covers far fewer metrics.

---

### 7.8 X / Twitter (API v2)

- **Auth method:** OAuth 2.0 with PKCE. Scopes: `tweet.read`, `users.read`, `offline.access`.
- **Exact endpoints used:**
  - `GET /2/users/me?user.fields=public_metrics`
  - `GET /2/users/{id}/tweets?max_results=100&tweet.fields=public_metrics,created_at,entities`
  - `GET /2/tweets?ids=...&tweet.fields=public_metrics,non_public_metrics,organic_metrics`
- **Rate limits:** Basic tier — 10,000 post reads/month. Request budgeter tracks consumption; hard-stop before cap.
- **Data mapping:**
  - `impression_count` → `performance_records.views`
  - `like_count` → `performance_records.likes`
  - `reply_count` → `performance_records.comments`
  - `retweet_count + quote_count` → `performance_records.shares`
  - `bookmark_count` → `performance_records.saves`
  - Daily deltas derived from snapshot subtraction only
- **Cost:** ~$100/month (Basic tier). Annual: ~$1,200.
- **Historical backfill:** One-off: paginate full 3,200-tweet timeline at connect time. No historical daily series.
- **Known limitations:** No demographics. No daily series. Monthly quota cap. `non_public_metrics` window is only 30 days. **Decision gate:** must justify the $1,200/year spend (Ticket 30B). Manual fallback ships regardless.

---

### 7.9 Spotify for Podcasters (Unofficial Analytics)

- **Auth method:** `sp_dc` cookie → bearer token exchange. Cookie stored encrypted in `platform_connections`. Feature-flagged (`FEATURE_SPOTIFY_ANALYTICS`).
- **Exact endpoints used:**
  - `detailedStreams` — per-day starts and streams
  - `listeners` — per-day unique listeners
  - `followers` — per-day follower counts
  - `aggregate` — demographics (age bracket, gender)
  - `episodes/{id}/performance` — median completion %, retention curve
  - `episodes/{id}/streams` — per-day episode streams
- **Rate limits:** No published limits. Self-throttle at ~1 request/second.
- **Data mapping:**
  - `streams` → `performance_daily.views`
  - `starts` → `performance_daily.impressions`
  - `listeners` → `performance_daily.reach`
  - Median completion % → `performance_records.custom_metrics.completion_pct`
  - Retention curve → `performance_records.custom_metrics.retention_curve`
  - Demographics → `audience_demographics` (source = 'spotify')
  - All daily rows written with `is_measured = true`
- **Cost:** Free.
- **Historical backfill:** Full. Dashboard endpoints serve data back to show's first day on Spotify. Second-highest-value backfill source after YouTube.
- **Known limitations:** **Unofficial endpoints.** May change without notice. ToS grey area — requires Anthony's sign-off. Cookie expires periodically. CSV fallback importer always available.

---

### 7.10 Skool (Manual)

- **Communities:** Roadman Cycling Clubhouse (free, 1,852 members) + Not Done Yet (paid, 113 members at $195/month).
- **Data collected:**
  - `community_snapshots`: member count, new joins, churned members, active members, posts count, comments count — per community per week.
  - `community_posts`: post title, author type, date, topic assignment, comments count, likes count.
- **Collection method:**
  - **Weekly ritual (5 minutes):** structured form pre-filled with previous week's values. Monday notification reminder.
  - **Post title importer:** paste-in text input. Auto topic classification via embedding similarity (Ticket 56).
- **Cost:** Free.
- **Known limitations:** Entirely manual. Data quality depends on the team completing the Monday ritual. If Skool ever releases a public API, an automated connector replaces this immediately.

---

### 7.11 DataForSEO (Keyword Volumes)

- **Auth method:** API key (HTTP Basic).
- **Exact endpoints used:**
  - `POST /keywords_data/google/search_volume/live` — monthly search volumes, CPC, competition index per keyword (batches of up to 700).
- **Data mapping:**
  - `search_volume` → `keyword_metrics.search_volume`
  - `cpc` x 100 → `keyword_metrics.cpc_cents`
  - `competition` → `keyword_metrics.competition`
- **Cost:** ~$15/month for ~500 keywords.
- **Historical backfill:** Trailing 12-48 months depending on keyword.
- **Known limitations:** Bucketed estimates, not exact counts. Keyword list must be curated from top GSC queries per tracked topic.

---

## 8. Implementation Critical Path

### Dependency Graph

```
PHASE 4: Platform Integrations
  T23 (Integration Settings UI) --+--> T24 (YouTube)
                                  +--> T25 (Meta)
                                  +--> T26 (LinkedIn)
                                  +--> T27 (Spotify RSS)
                                  +--> T28 (Beehiiv)
                                  +--> T29 (GA4)
                                  +--> T30 (Skool manual)
                                  +--> T30A (TikTok)
                                  +--> T30B (X/Twitter)
                                  +--> T30C (Spotify Analytics)

PHASE 5: Auto-Import & Sync
  T24 --> T31 (YouTube Bulk Import)
  T27, T28 --> T32 (Podcast + Blog + Beehiiv Bulk Import)
  T24-T30C --> T33 (Vercel Cron Sync)
  T24, T28 --> T34 (Webhook Receivers)
  T33 --> T35 (Sync Status Dashboard)

PHASE 6: Search & Intelligence
  T2, T10 --> T36 (Embedding Pipeline) --> T37 (Semantic Search)
                                        --> T38 (Content Gap Detection)
                                        --> T39 (Duplicate Detection)

PHASE 7: Reporting & Dashboards
  T33 --> T40 (Performance Dashboard) --> T41 (Campaign Scorecards)
                                      --> T42 (Sponsor Reporting)
                                      --> T43 (Content Decay Alerts)
  T10, T27 --> T44 (Transcript Viewer)

PHASE 8: Polish & Team Onboarding
  T45-T50 (Comments, Activity Log, Global Search, Polish, Tagging Rules, Launch Prep)

PHASE 9: Temporal Data Foundation
  T2 --> T51 (Intelligence Schema) --> T52 (Daily Delta Pipeline)
                                   --> T53 (GSC Integration) <-- T23
                                   --> T54 (Demographics Capture) <-- T24, T25
  T52, T53, T54 --> T55 (Historical Backfill)
  T36, T51 --> T56 (Topic Auto-Classification)
  T30, T51, T56 --> T57 (Skool Weekly Ritual)
  T51, T53 --> T58 (Keyword Volumes + Revenue Events)

PHASE 10: Trend Engine
  T52, T53, T56, T57 --> T59 (Topic Daily Aggregation)
  T59 --> T60 (Seasonal Index Computation)
  T60 --> T61 (Trend Explorer UI)
  T59, T60 --> T62 (Anomaly Detection)
  T60 --> T63 (Forecasting + Self-Grading)

PHASE 11: Insight Mining
  T60, T62 --> T64 (Insight Generator Framework)
  T64 --> T65 (Insight Review UI + Feed)
  T63, T64 --> T66 (Timing Recommendations)
  T54, T64 --> T67 (Format Effectiveness + Audience Affinity)
  T28, T57, T64 --> T68 (Audience Segment Discovery)

PHASE 12: Commercial Layer
  T42, T65, T67 --> T69 (Sponsor Evidence Packs)
  T61, T65 --> T70 (Annual Audience Report)
  T58, T59 --> T71 (Revenue Attribution Dashboard)
  All Phase 9-11 --> T72 (Intelligence Ops + Data Quality Monitor)
```

### Critical Path to First Insight

The longest dependency chain from start to first actionable insight:

```
T23 -> T24 -> T33 -> T51 -> T52 -> T53 -> T55 -> T59 -> T60 -> T64 -> T65
```

This is 11 tickets deep. Shortening this path is the single most important scheduling decision.

### GSC Must Be Pulled Forward

Ticket 53 (GSC Integration) depends only on T23 (integration settings) and T51 (intelligence schema). Because GSC's 16-month rolling window is the only truly perishable data source, T53 should be built immediately after T23 + T51. Every day of delay is a day of irreplaceable search data lost.

### Parallel Tracks

| Track | Tickets | Description | Can Start When |
|---|---|---|---|
| **A: Core Integrations** | T23 -> T24 -> T25 -> T26 -> T27 -> T28 -> T29 -> T30 | Platform connections and sync handlers | Immediately |
| **B: Extended Integrations** | T30A -> T30B -> T30C -> T30D | TikTok, X, Spotify Analytics, GA4 article-level | T23 complete |
| **C: Bulk Import** | T31 -> T32 | YouTube + Podcast + Blog + Beehiiv import | As each integration completes |
| **D: Embeddings & Search** | T36 -> T37 -> T38 -> T39 | Embedding pipeline, semantic search, gap detection | T2 + T10 complete |
| **E: UX Layer** | T45 -> T46 -> T47 -> T48 -> T49 | Comments, activity log, search, polish | Independent |

### Optimal Execution Order

1. **T23** — Integration Settings UI (gate for everything)
2. **T51** — Intelligence Schema Migration (gate for all Phase 9+)
3. **T53** — GSC Integration + 16-month backfill (perishable — do not delay)
4. **T24-T30** — Remaining Phase 4 integrations (parallel where possible)
5. **T30A-T30D** — Extended integrations
6. **T31-T35** — Bulk import + cron + webhooks + sync dashboard
7. **T52** — Daily Delta Pipeline
8. **T54-T58** — Remaining Phase 9
9. **T59-T63** — Phase 10 Trend Engine
10. **T36-T39** — Embeddings and search
11. **T40-T44** — Reporting dashboards
12. **T64-T68** — Phase 11 Insight Mining
13. **T69-T72** — Phase 12 Commercial Layer
14. **T45-T50** — Phase 8 Polish (interleave throughout)

---

## 9. Phase Execution Timeline

### Phase 4: Platform Integrations (Tickets 23-30, 30A-30D)

- **Sessions required:** 12 sessions
- **Deliverables:** All 11 platform connections live. OAuth flows working. Sync handlers pulling data into `performance_records`.
- **First value milestone:** After T24 + T25 + T28 — the three highest-volume platforms — the performance dashboard shows real cross-platform data for the first time.
- **External blockers:** TikTok app review (days-weeks), Meta app review (days-weeks), Anthony's X/Twitter spend decision.

### Phase 5: Auto-Import & Sync (Tickets 31-35)

- **Sessions required:** 5 sessions
- **Deliverables:** Full content library imported. Vercel cron running daily and weekly syncs. Webhook receivers. Sync status dashboard.
- **First value milestone:** After T33 — data flows automatically. No more manual pulling.

### Phase 6: Search & Intelligence (Tickets 36-39)

- **Sessions required:** 4 sessions
- **Deliverables:** Vector embeddings for all content. Semantic search. Content gap detection. Duplicate flagging with merge workflow.
- **First value milestone:** After T37 — semantic search live. "Find similar" on any asset returns contextually relevant results.

### Phase 7: Reporting & Dashboards (Tickets 40-44)

- **Sessions required:** 5 sessions
- **Deliverables:** Performance dashboard with classification. Campaign scorecards. Sponsor reports. Content decay alerts. Transcript viewer.
- **First value milestone:** After T40 — the single dashboard that replaces checking YouTube Studio, Meta Business Suite, Beehiiv, and GA4 separately.

### Phase 8: Polish & Team Onboarding (Tickets 45-50)

- **Sessions required:** 6 sessions
- **Deliverables:** Threaded comments. Activity logging. Global search. Mobile responsiveness. Auto-tagging rules. Production launch prep.
- **First value milestone:** After T50 — the system is production-ready for all 5 team members.

### Phase 9: Temporal Data Foundation (Tickets 51-58)

- **Sessions required:** 10-12 sessions
- **Deliverables:** Intelligence schema (14 new tables). Daily delta derivation. GSC integration with 16-month backfill. Audience demographics capture. Historical backfill (3-8 years of daily data). Topic auto-classification. Skool weekly ritual. Keyword volumes. Revenue events.
- **First value milestone:** After T55 (Historical Backfill) — the database contains years of daily time-series data. The trend engine can declare seasonal patterns with multi-year confidence from day one.

### Phase 10: Trend Engine (Tickets 59-63)

- **Sessions required:** 7-8 sessions
- **Deliverables:** `topic_daily_metrics` aggregate table. Seasonal indices. Trend Explorer UI with 53-week seasonal curves. **Seasonal Almanac.** Anomaly detection. Forecasting with self-grading.
- **First value milestone:** After T61 (Trend Explorer UI) — the Seasonal Almanac answers "what should we be making in March?" with multi-year evidence. This is the moment Roadman OS becomes something no competitor has.

### Phase 11: Insight Mining (Tickets 64-68)

- **Sessions required:** 7-8 sessions
- **Deliverables:** Insight generator framework. Insight review UI. Timing recommendations. Format effectiveness. Audience affinity. Audience segment discovery.
- **First value milestone:** After T65 — the system actively tells the team what to publish, when, and in what format. Friday insight review becomes a standing ritual.

### Phase 12: Commercial Layer (Tickets 69-72)

- **Sessions required:** 5-6 sessions
- **Deliverables:** One-click sponsor evidence packs. Annual audience report pipeline. Revenue attribution dashboard. Intelligence ops monitor.
- **First value milestone:** After T69 (Sponsor Evidence Packs) — the first sponsor deck built on established insights. This is when the data starts paying for itself.

### Total Estimated Sessions

| Phase | Tickets | Sessions | Cumulative |
|---|---|---|---|
| 4 | 23-30, 30A-D | 12 | 12 |
| 5 | 31-35 | 5 | 17 |
| 6 | 36-39 | 4 | 21 |
| 7 | 40-44 | 5 | 26 |
| 8 | 45-50 | 6 | 32 |
| 9 | 51-58 | 10-12 | 42-44 |
| 10 | 59-63 | 7-8 | 49-52 |
| 11 | 64-68 | 7-8 | 56-60 |
| 12 | 69-72 | 5-6 | 61-66 |
| **Total** | **50 tickets** | **61-66 sessions** | |

At 1-2 sessions per working day, the full build is approximately 8-12 weeks. Parallelisation can compress to 6-8 weeks.

---

## 10. Testing Strategy

Every layer of the system has a distinct failure mode and requires its own validation approach.

### Schema Validation

- Migration `00004_intelligence_layer.sql` runs clean against a fresh Supabase instance.
- TypeScript types regenerate successfully (`supabase gen types typescript`).
- All foreign key relationships resolve correctly.
- All UNIQUE and CHECK constraints verified with insert-duplicate-reject tests.
- BRIN and B-tree indexes created on date columns confirm correct ordering.

### Sync Handler Testing

- **Mock API responses:** each platform sync handler tested against recorded API responses with known data. Verify correct table writes.
- **Idempotency:** run the same sync twice with identical input. Verify no duplicate rows.
- **Error isolation:** simulate one platform failing mid-sync. Verify other platforms complete successfully.
- **Token refresh:** simulate an expired OAuth token. Verify auto-refresh and retry.
- **Rate limit handling:** simulate approaching quota limit. Verify graceful pause.

### Daily Delta Derivation

- Insert two known snapshots (day 1: 100 views, day 2: 150 views). Verify derived delta = 50.
- Insert a measured daily row. Verify it is not overwritten by derivation.
- Simulate a gap (missing day 4). Verify even spread across missing days.
- Simulate negative delta (counter reset). Verify clamp to zero and warning logged.
- Re-run the deriver. Verify idempotent output.

### Topic Daily Aggregation

- Create 3 assets tagged with a topic, each with known `performance_daily` rows. Verify topic row sums match.
- Verify per-piece normalisation: engagement / live_asset_count.
- Verify channel-baseline normalisation: trailing 90-day all-topic average.
- Verify all-platform rollup row exists.

### Seasonal Index Computation

- Inject 3 years of synthetic seasonal data with a known January peak. Verify index value for weeks 1-4 is well above 1.0.
- Verify per-year values stored in JSON.
- Verify confidence scoring reflects consistency, sample depth, cross-signal corroboration.
- Inject a single-year topic. Verify it never exceeds "emerging" confidence.
- Inject a topic with fewer than 3 pieces. Verify hard floor enforcement.

### Anomaly Detection

- Inject a synthetic spike at 5x seasonal expectation. Verify anomaly written with correct z-score.
- Verify the spike does not distort subsequent week expectations (MAD robustness).
- Inject a value below threshold (z < 2.5). Verify no anomaly row written.

### Forecast Validation

- Backtest against known historical data: withhold 8 weeks, generate forecasts, compare to actuals.
- Verify MAPE stored in `forecasts.abs_pct_error`.
- Verify drift factor capping.
- Verify forecasts exist for probable/established topics only.

### Insight Validation

- Run `seasonal_peak` generator. Verify numerical values match source data.
- Confirm every number traceable to `evidence` JSON field.
- Run generator twice. Verify no duplicate insights.
- Verify `valid_until` set and expired insights auto-archive.

### End-to-End Pipeline Test

Seed a topic with a known seasonal pattern across 3 synthetic years. Run the full pipeline: delta derivation -> topic aggregation -> seasonal indices -> anomaly detection -> forecasting -> insight generation. Verify the final insight statement is numerically correct against the synthetic input data.

---

## 11. Deployment & Migration Strategy

### Deployment Model

Every phase deploys as a pull request merged to `main`. Vercel auto-deploys on merge. No staging environment required — this is a 5-user internal tool, and all changes are additive.

### Database Migrations

- Managed via Supabase CLI: `supabase db push` applies migrations in order.
- Migration files in `supabase/migrations/`:
  - `00001_initial_schema.sql` — 27 core tables (applied)
  - `00002_profiles_trigger.sql` — auth trigger (applied)
  - `00003_permissions_seed.sql` — RBAC seed data (applied)
  - `00004_intelligence_layer.sql` — 14 new tables, 4 new enums, topic ALTER statements (Ticket 51)
- The intelligence schema migration is strictly additive: new tables, new enums, nullable column additions. No existing columns modified or dropped.

### Environment Variable Management

New environment variables added to Vercel **before** the code that references them is deployed. Missing env vars cause build failures, not silent runtime errors.

### Feature Flags

- `FEATURE_INTELLIGENCE=true` — gates the entire intelligence layer
- `FEATURE_SPOTIFY_ANALYTICS=true` — gates unofficial Spotify endpoints (ToS grey area, opt-in)

### pg_cron Jobs

Enabled after the intelligence schema migration and initial data load. Create scheduled jobs in order of dependency chain.

### Rollback Strategy

- **Schema:** Additive changes only; rollback means dropping new objects. No data loss on existing tables.
- **Features:** Feature flags allow disabling intelligence layer without a code deploy.
- **Code:** Vercel supports instant rollback to any previous deployment.
- **Data:** `performance_records` (raw snapshots) never modified or deleted. All derived tables recomputable from raw data. Pipeline is idempotent.

### Zero-Downtime Guarantee

Every change in this build plan is additive: new API routes, new database tables, new UI pages, new columns with defaults. Nothing breaks existing functionality at any point.

---

## 12. Risk Register

### Risk 1: GSC Data Loss

- **Probability:** Medium | **Impact:** High
- GSC maintains a 16-month rolling window. Data older than 16 months is permanently deleted.
- **Mitigation:** GSC integration (Ticket 53) is the first ticket after intelligence schema. Full 16-month backfill runs immediately. Daily sync monitors alert if capture goes dark for 24+ hours.

### Risk 2: TikTok App Review Delay

- **Probability:** High | **Impact:** Medium
- TikTok Business API review can take days to weeks.
- **Mitigation:** Submit Monday. Build against the spec regardless. Deploy with Display API fallback if review stalls.

### Risk 3: Meta App Review Delay

- **Probability:** Medium | **Impact:** Medium
- Meta requires app review for `instagram_manage_insights`.
- **Mitigation:** Submit Monday. Use test user access during development. Instagram Basic Display API serves media lists in the interim.

### Risk 4: Spotify Unofficial Endpoints Break

- **Probability:** Medium | **Impact:** Low
- Unofficial endpoints may change without notice. Cookie expires periodically.
- **Mitigation:** Feature-flagged. Response-shape validation on every call. CSV fallback always available.

### Risk 5: X/Twitter API Repricing

- **Probability:** Medium | **Impact:** Low
- X has repriced its API multiple times since 2023.
- **Mitigation:** Decision gate on Ticket 30B. Manual fallback ships regardless. If price exceeds ROI, disable API sync with no data loss.

### Risk 6: Topic Taxonomy Quality Degrades

- **Probability:** Low | **Impact:** High
- Messy taxonomy in year one poisons year-over-year comparisons.
- **Mitigation:** Governance rules in Ticket 49. Auto-classification with human review queue (Ticket 56). Topic health metrics in Ticket 72. Quarterly audits.

### Risk 7: Supabase Pro Limits Hit

- **Probability:** Low | **Impact:** Medium
- Supabase Pro includes 8GB storage. Embeddings plus years of daily data could approach this.
- **Mitigation:** At current volumes, 8GB limit is years away. Upgrade to Team tier ($599/month) if needed. Archive old `performance_daily` rows to cold storage after indices computed.

### Risk 8: Vercel Serverless Timeout

- **Probability:** Medium | **Impact:** Low
- Vercel Pro has 60-second timeout. Large sync operations could exceed this.
- **Mitigation:** Heavy compute runs in Postgres via pg_cron (explicit architecture decision). API-bound long-running jobs use Supabase Edge Functions or Inngest. Chunk large operations into resumable batches tracked by `sync_jobs`.

### Risk 9: Seasonal Index Noise from Insufficient Data

- **Probability:** Low after backfill; High if no backfill | **Impact:** High
- Without historical backfill, the system needs 2-3 years to declare patterns with confidence.
- **Mitigation:** Historical backfill (Ticket 55) bootstraps 3-8 years of daily data immediately. Hard minimum thresholds in confidence scoring prevent weak patterns from surfacing.

### Risk 10: LLM-Generated Insight Statements Contain Wrong Numbers

- **Probability:** Low | **Impact:** High
- Wrong numbers in a sponsor deck destroy credibility permanently.
- **Mitigation:** All numbers computed in SQL and templated into TypeScript string literals. LLM only permitted to polish prose — never touches figures. `evidence` JSON field makes every number traceable. `sponsor_safe` flag (admin-only toggle) gates which insights appear in sponsor packs.

---

## 13. Cost Model

### Current State (Phases 1-3 Complete)

| Service | Monthly Cost |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| OpenAI (embeddings) | ~$2 |
| **Total** | **~$47** |

### After Phase 4-5 (Integrations + Sync)

No new paid services. All platform APIs are free at Roadman's data volume.

| Service | Monthly Cost |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| OpenAI (embeddings) | ~$2 |
| **Total** | **~$47** |

### After Phases 9-10 (Intelligence Layer + Trend Engine)

| Service | Monthly Cost |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| OpenAI (embeddings + classification) | ~$8 |
| DataForSEO (keyword volumes, ~500 keywords) | ~$15 |
| **Total** | **~$68** |

### After Phase 12 (Full Intelligence — Final State)

| Service | Monthly Cost |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| OpenAI (embeddings + classification) | ~$8 |
| DataForSEO (keyword volumes) | ~$15 |
| **Total** | **~$68** |

### Conditional Cost: X/Twitter

If Ticket 30B approved:

| Service | Monthly Cost |
|---|---|
| X API Basic tier | ~$100 |
| **Revised total** | **~$168** |

### One-Time Costs

| Item | Estimated Cost |
|---|---|
| Historical backfill compute spike (OpenAI embeddings for entire back catalogue) | ~$20 |
| YouTube API quota headroom during initial backfill | $0 (free quota) |

### Annual Cost Summary

| Scenario | Monthly | Annual |
|---|---|---|
| Without X/Twitter API | $68 | $816 |
| With X/Twitter API | $168 | $2,016 |

### Revenue Offset Potential

The intelligence layer is not just a cost centre:

- **Sponsor evidence packs:** seasonal demand curves and demographic data enable premium pricing. A January supplement slot is provably worth more than an August one. Estimated uplift: $2,000-5,000 per sponsorship deal.
- **Annual audience report ("State of the Masters Cyclist"):** lead magnet, PR asset, and paid industry product. Priced at $1,500-5,000 per brand licence.
- **NDY community retention:** better topic timing increases engagement and reduces churn. At $195/month per NDY member, retaining 5 additional members per year covers the entire system cost ($11,700 vs $816-$2,016).
- **Category benchmarking (longer-term):** brands will pay for "when does interest in your category peak among serious amateurs aged 35-55."

The compounding dynamic: better timing leads to better content performance, which leads to more audience, which leads to more data, which produces sharper trends, which feeds better timing. The system's annual cost is dwarfed by the revenue it enables, and the gap widens every year as the data moat deepens.
