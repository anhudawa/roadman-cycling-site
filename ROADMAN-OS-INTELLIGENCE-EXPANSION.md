# ROADMAN OS — DATA INTELLIGENCE EXPANSION

**Version:** 1.0 — 18 July 2026
**Extends:** ROADMAN-OS-ARCHITECTURE.md and ROADMAN-OS-BUILD-TICKETS.md (Tickets 1–50 remain valid)
**New scope:** Phases 9–12, Tickets 51–72
**Thesis:** Content is an appreciating asset. If annual patterns repeat, every day of captured data increases the accuracy of next year's decisions. Roadman OS becomes the system that captures those patterns, mines them, and converts them into publishing decisions and sponsor revenue.

---

## 1. The Core Reframe

Roadman OS today (Phases 1–8) answers: *"What content do we have, what's in flight, and how did it perform?"*

The expansion answers three harder questions:

1. **When** does each topic peak, for which audience, on which platform? (*"Creatine peaks in January for males 35–50 on YouTube"*)
2. **What should we publish next month**, and in what format, to capture demand before it arrives?
3. **What can we prove to a sponsor** that nobody else in cycling media can prove?

The single most important architectural insight: **the current `performance_records` table cannot answer any of these.** It stores cumulative snapshots (`recorded_at` + lifetime counters). Trend detection requires **daily deltas per topic** — "how much engagement did *creatine content* earn *on 14 January*", not "what are this video's lifetime views as of today". Everything in this document flows from fixing that.

The second most important insight: **we do not have to wait two years for two Januaries.** YouTube Analytics API serves day-by-day historical data back to channel creation, per video. Beehiiv serves historical post stats. GSC serves 16 months of daily query data. A backfill programme (Ticket 55) gives us **3–8 years of daily time series on day one**. The trend engine can declare "creatine peaks in January" with multi-year confidence at launch, not in 2028.

---

## 2. Architecture Overview

Four layers, stacked on the existing app:

```
┌────────────────────────────────────────────────────────────┐
│  LAYER 4: COMMERCIAL                                       │
│  Sponsor evidence packs · Annual audience report ·         │
│  Media kit automation · Benchmark data products            │
├────────────────────────────────────────────────────────────┤
│  LAYER 3: INSIGHT MINING                                   │
│  insights table · generator framework · timing recs ·      │
│  segment discovery · format effectiveness · review UI      │
├────────────────────────────────────────────────────────────┤
│  LAYER 2: TREND ENGINE                                     │
│  performance_daily (deltas) · topic_daily_metrics ·        │
│  seasonal_indices · anomalies · forecasts                  │
│  Computed in Postgres (pg_cron + SQL functions)            │
├────────────────────────────────────────────────────────────┤
│  LAYER 1: CAPTURE                                          │
│  Existing syncs (Tickets 23–35) + GSC + demographics +     │
│  keyword volumes + Skool weekly ritual + revenue events +  │
│  external calendar + historical backfill                   │
└────────────────────────────────────────────────────────────┘
```

**Compute placement decision:** all aggregation and statistics run **inside Postgres** via SQL functions scheduled with `pg_cron` (available on Supabase). Vercel functions only do what requires external APIs (fetch, OAuth). This avoids Vercel execution-time limits, keeps costs flat, and means the trend engine works even if the Next.js app is down. No Python, no ML infrastructure, no new services. The statistics chosen below (seasonal indices, median/MAD anomaly scores, seasonal-naive forecasts) are deliberately simple enough to express in SQL — and at Roadman's data volume, simple methods with clean data beat sophisticated methods with dirty data every time.

---

## 3. Layer 1 — Data Capture

### 3.1 What we capture, where from, at what granularity

| Signal | Source | Granularity | Method | History available |
|---|---|---|---|---|
| Engagement deltas per content piece | YouTube Analytics, Meta Insights, Beehiiv, GA4, Spotify | **Daily** | Extend existing syncs (Tickets 24–29, 33) | YouTube: full history. GA4: from property creation. Meta: ~2 years. Beehiiv: full post history |
| Audience demographics | YouTube Analytics (age/gender/geo per video), Meta (account + per-post reach demographics where available) | Monthly per asset; weekly per channel | New sync jobs | YouTube: historical by date range — backfillable |
| Search demand | Google Search Console (page × query × day) | Daily | New integration (service account, same pattern as GA4) | 16 months rolling — **start now, this window never gets longer** |
| Keyword volume trends | DataForSEO or Keywords Everywhere API (monthly volumes, 12-month trend arrays) | Monthly, per tracked keyword | New sync, ~500 tracked keywords | Vendors provide trailing 12–48 months |
| Community activity | Skool (no API) | Weekly manual ritual + post-title paste-in | Structured weekly form (5 min) + CSV/text import with auto topic classification | Manual reconstruction from Skool admin stats |
| Email engagement by topic/segment | Beehiiv API | Per send + daily | Extend Ticket 28 sync | Full post history |
| Revenue attribution | Skool joins (manual/CSV), camp bookings, course sales, UTM conventions in GA4 | Per event | `revenue_events` table + UTM discipline | Reconstructable from records |
| External seasonal markers | Curated: race calendar, product launch seasons, resolution period, sportive season, weather phases | Date ranges, seeded annually | `calendar_events` seed data | Fully backfillable |

### 3.2 The topic backbone

Trends are detected **per topic, not per asset**. A creatine trend only exists if every creatine video, post, newsletter and Skool thread is reliably tagged `creatine`. The `topics` table already exists; the expansion adds:

- **Auto-classification.** Each topic gets a centroid embedding (mean of embeddings of its confirmed assets, seeded from the topic name + description). New and backfilled assets are assigned topics by cosine similarity above a threshold, with human review for low-confidence matches. This reuses the Ticket 36 embedding pipeline — no new ML.
- **Aliases** (`topic_aliases`) so GSC queries ("creatine for cyclists", "creatine over 40") and Skool post titles map to canonical topics.
- **A tracked flag** — trend statistics only run for topics marked `is_trend_tracked`, keeping the engine focused on ~60–100 commercially meaningful topics (creatine, tyres, FTP, fasted training, Zone 2, bike fit, turmeric…) rather than every tag ever created.

**Governance rule (this is the moat's backbone):** topics are created deliberately by Sarah or Anthony, never ad hoc. A messy taxonomy in year one poisons every year-over-year comparison afterwards. Ticket 49 (Tagging Rules) gains teeth here.

### 3.3 Why snapshots aren't enough — the delta derivation

Existing syncs write cumulative snapshots to `performance_records`. We keep that (raw data is sacred; never destroy it) and add a nightly Postgres job that computes **daily deltas**: today's snapshot minus yesterday's, per publication per source, written to `performance_daily`. Where a platform provides true daily figures (YouTube Analytics API does; use it in preference to snapshot subtraction), the sync writes `performance_daily` directly with `is_measured = true`. Snapshot subtraction is the fallback (`is_measured = false`), and the deriver handles gaps (missed sync days spread the delta evenly) and counter resets (negative deltas clamped and flagged).

---

## 4. Layer 2 — Trend Detection Engine

### 4.1 The core fact table

Everything aggregates into one table: `topic_daily_metrics` — one row per **date × topic × platform** (plus a `platform = 'all'` rollup). Columns: content pieces live, engagement sum, views, view-normalised engagement rate, search clicks, search impressions, email opens/clicks, community posts/comments, revenue. This is the time series everything else reads. At 100 topics × 10 platforms × 365 days ≈ 365k rows/year — trivial for Postgres, no partitioning needed for a decade.

### 4.2 Normalisation — the part most people get wrong

Raw January engagement being high proves nothing if the channel grew or we published more. Three corrections, applied in order:

1. **Per-piece normalisation:** engagement ÷ number of live content pieces on that topic (else publishing 10 creatine posts in January manufactures a fake January peak).
2. **Channel-baseline normalisation:** divide by the trailing-90-day all-topic average for that platform (removes channel growth and platform-wide algorithm shifts).
3. **Age-cohort control:** only count engagement from content less than 180 days old for the "interest" series, OR use the search-demand series (GSC impressions are content-age-independent) as the primary seasonal signal and platform engagement as corroboration. **GSC impressions per topic are the cleanest seasonality signal we have** — they measure what the audience wants, independent of what we published.

The result per topic per ISO week: a **relative interest score** where 1.0 = that topic's own annual average.

### 4.3 Seasonal indices — "creatine peaks in January"

For each tracked topic × platform × metric:

- Bucket the normalised series by **ISO week-of-year** (1–53), smoothed with a centred 3-week rolling mean to kill single-week noise.
- Seasonal index for week *w* = mean(relative interest in week *w* across all observed years).
- Example output: creatine, `search_impressions`, weeks 1–4 → index 3.2 (i.e. 3.2× that topic's annual average). That is literally Anthony's sentence, computed: *"Creatine content gets 3.2x engagement in January vs annual average."*

**Year-over-year methodology:** align by ISO week (not calendar date — Easter, TdF and weekends shift). Store per-year values alongside the mean so the UI can show whether the peak repeated in each year or is driven by one anomalous year.

### 4.4 Confidence scoring and minimum thresholds

Every seasonal claim carries a 0–100 confidence score. Components:

| Component | Weight | Logic |
|---|---|---|
| Years observed | 30 | 1 year = weak; 2 = usable; 3+ = strong |
| Consistency | 30 | Did the peak land within ±2 weeks in every observed year? (Coefficient of variation of per-year indices) |
| Sample depth | 20 | Distinct content pieces + total engagement volume in the window (min: 3 pieces and 1,000 engagement-events per year, else capped) |
| Cross-signal corroboration | 20 | Does search demand agree with platform engagement? Does email agree with YouTube? Independent signals agreeing is the strongest evidence we have |

Tiers: **0–39 noise** (not shown), **40–64 emerging** (shown, labelled), **65–84 probable**, **85–100 established** (usable in sponsor decks). Hard floor: no trend is ever surfaced from a single year of data or fewer than 3 distinct content pieces — it's an observation, not a trend.

### 4.5 Anomaly detection

Nightly, per topic × platform: compute the seasonally-adjusted residual (actual ÷ expected-for-this-week) and a robust z-score using median and MAD over the trailing 8 weeks. |z| > 2.5 → write an anomaly row ("Tyre pressure content is running 4.1× its seasonal expectation this week"). Median/MAD rather than mean/stddev because engagement data is heavy-tailed — one viral short must not blind the detector for a month. Anomalies feed the dashboard and can be promoted to insights ("ride the wave now") with one click.

### 4.6 Forecasting

Deliberately boring: **seasonal-naive with drift.** Forecast for week *w* next month = trailing 13-week baseline × seasonal index for week *w* × topic drift factor (trailing 26-week trend slope, capped). Stored in `forecasts` with the actual filled in later, so the system **measures its own forecast error (MAPE) per topic** and displays it. A forecast that admits "±40% typical error on this topic" is honest; forecasts without error bars are marketing. If accuracy on high-volume topics warrants it later, Holt-Winters is a drop-in upgrade — but not before the simple thing is measured.

---

## 5. Layer 3 — Insight Mining

### 5.1 The `insights` table and generator framework

An insight is a **first-class database record**: typed, evidenced, confidence-scored, and reviewable. Generators run weekly (pg_cron), write candidate insights, and the team validates or dismisses them in a review UI. Validated insights power the planning calendar and sponsor packs; dismissed ones train the thresholds. Numbers in insight statements are **always computed in SQL and templated in TypeScript** — an LLM may polish the prose, but it never touches the figures. No hallucinated statistics in a sponsor deck, ever.

Six generators at launch:

1. **`seasonal_peak`** — "Creatine content earns 3.2× its annual-average engagement in weeks 1–4 (Jan). Established: 4 years, peak repeated every year." Evidence: index values per year, content pieces, platforms.
2. **`timing_recommendation`** — works backwards from demand peak minus content lead time minus SEO ramp: "Publish tyre content in weeks 15–18 (Apr) to capture the May demand peak; historical ROI of April-published tyre content is 2.1× annual average."
3. **`format_effectiveness`** — per topic, engagement-per-audience-member by asset type: "Video outperforms blog 4:1 for nutrition topics; the reverse holds for training-plan topics (blog 1.8:1)."
4. **`audience_affinity`** — joins demographics to topic performance: "Male 35–50 viewers over-index 2.4× on supplement content in Q1 vs their annual baseline." This is the sponsor-pitch generator.
5. **`demand_gap`** — GSC impressions high + position poor or no dedicated asset + seasonal window approaching: "Search demand for 'winter turbo training plan' is rising (index 2.8 in Nov); no dedicated asset exists. Window opens week 40." Extends Ticket 38's gap detection with the temporal dimension.
6. **`decay_seasonal`** — upgrades Ticket 43: distinguishes true decay from seasonal trough. "FTP-test post traffic down 60% — expected; seasonal trough. Re-promote week 51." No more false alarms in July for January content.

### 5.2 Audience segment discovery

Beyond demographics: **behavioural clusters**. For each identifiable audience member (email subscriber via Beehiiv events; Skool member via community activity), build a topic-affinity vector (engagement share per topic, recency-weighted). Cluster with k-means (k=5–8, run in a scheduled job; small data — 29k emails — so this runs in seconds). Expected discoveries: "the supplement-curious returner", "the sportive deadline trainer", "the kit obsessive". Segments get names, sizes, seasonal activity curves, and revenue rates — and become Beehiiv segment exports for targeted sends. **Privacy line:** clustering uses only first-party engagement data the audience generated with us; no cross-site tracking, no data enrichment vendors, nothing we'd be uncomfortable explaining on the podcast.

### 5.3 Cross-platform journeys

Person-level cross-platform identity stitching is out (impossible without invasive tracking, and off-brand). Instead: **content-level journey mapping** — GA4 path analysis from blog → /go → Skool, UTM-tagged YouTube descriptions → site, newsletter click → course page. Stored as aggregate flows ("supplement blog readers convert to NDY at 2.3× the rate of race-recap readers"), which is what actually informs decisions anyway.

---

## 6. Schema Changes (Migration `00004_intelligence_layer.sql`)

New enums:

```sql
CREATE TYPE trend_confidence AS ENUM ('noise', 'emerging', 'probable', 'established');
CREATE TYPE insight_type AS ENUM (
  'seasonal_peak', 'timing_recommendation', 'format_effectiveness',
  'audience_affinity', 'demand_gap', 'decay_seasonal', 'anomaly', 'manual'
);
CREATE TYPE insight_status AS ENUM ('candidate', 'validated', 'dismissed', 'archived', 'actioned');
CREATE TYPE calendar_event_type AS ENUM (
  'race', 'grand_tour', 'classic', 'sportive_season', 'industry_launch',
  'resolution_period', 'holiday', 'weather_phase', 'roadman_event', 'other'
);
```

Topic backbone additions:

```sql
ALTER TABLE topics
  ADD COLUMN is_trend_tracked BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN centroid_embedding vector(1536),
  ADD COLUMN commercial_category TEXT;   -- e.g. 'supplements', 'tyres' — sponsor-facing grouping

CREATE TABLE topic_aliases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  alias       TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'manual',   -- 'manual', 'gsc_query', 'skool'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(topic_id, alias)
);
CREATE INDEX idx_topic_aliases_alias ON topic_aliases(lower(alias));
```

Daily deltas (the engine's fuel):

```sql
CREATE TABLE performance_daily (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id        UUID REFERENCES assets(id) ON DELETE CASCADE,
  publication_id  UUID REFERENCES publications(id) ON DELETE CASCADE,
  source          metric_source NOT NULL,
  date            DATE NOT NULL,
  views           BIGINT NOT NULL DEFAULT 0,
  impressions     BIGINT NOT NULL DEFAULT 0,
  clicks          BIGINT NOT NULL DEFAULT 0,
  likes           BIGINT NOT NULL DEFAULT 0,
  comments        BIGINT NOT NULL DEFAULT 0,
  shares          BIGINT NOT NULL DEFAULT 0,
  saves           BIGINT NOT NULL DEFAULT 0,
  watch_time_seconds BIGINT NOT NULL DEFAULT 0,
  subscribers_gained INTEGER NOT NULL DEFAULT 0,
  revenue_cents   INTEGER NOT NULL DEFAULT 0,
  is_measured     BOOLEAN NOT NULL DEFAULT FALSE,
  custom_metrics  JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(publication_id, source, date)
);
CREATE INDEX idx_perf_daily_asset_date ON performance_daily(asset_id, date);
CREATE INDEX idx_perf_daily_date ON performance_daily USING BRIN(date);
```

Demographics:

```sql
CREATE TABLE audience_demographics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source          metric_source NOT NULL,
  scope           TEXT NOT NULL,             -- 'asset' or 'channel'
  asset_id        UUID REFERENCES assets(id) ON DELETE CASCADE,
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  age_bracket     TEXT NOT NULL,             -- '18-24','25-34','35-44','45-54','55-64','65+','unknown'
  gender          TEXT NOT NULL,             -- 'male','female','unknown'
  country         TEXT,                      -- ISO 3166-1 alpha-2
  share_pct       REAL NOT NULL,
  absolute_value  BIGINT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source, scope, asset_id, period_start, age_bracket, gender, country)
);
CREATE INDEX idx_demo_asset ON audience_demographics(asset_id);
CREATE INDEX idx_demo_period ON audience_demographics(period_start, period_end);
```

Search demand:

```sql
CREATE TABLE search_console_daily (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date          DATE NOT NULL,
  page_url      TEXT NOT NULL,
  query         TEXT NOT NULL,
  asset_id      UUID REFERENCES assets(id) ON DELETE SET NULL,
  topic_id      UUID REFERENCES topics(id) ON DELETE SET NULL,
  clicks        INTEGER NOT NULL DEFAULT 0,
  impressions   INTEGER NOT NULL DEFAULT 0,
  position      REAL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, page_url, query)
);
CREATE INDEX idx_gsc_topic_date ON search_console_daily(topic_id, date);
CREATE INDEX idx_gsc_date ON search_console_daily USING BRIN(date);

CREATE TABLE keyword_metrics (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword        TEXT NOT NULL,
  topic_id       UUID REFERENCES topics(id) ON DELETE SET NULL,
  month          DATE NOT NULL,
  search_volume  INTEGER,
  cpc_cents      INTEGER,
  competition    REAL,
  provider       TEXT NOT NULL DEFAULT 'dataforseo',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(keyword, month, provider)
);
CREATE INDEX idx_keyword_topic_month ON keyword_metrics(topic_id, month);
```

Community (Skool — manual by design, no API):

```sql
CREATE TABLE community_snapshots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community         TEXT NOT NULL,             -- 'free', 'ndy'
  week_start        DATE NOT NULL,
  total_members     INTEGER NOT NULL,
  new_members       INTEGER NOT NULL DEFAULT 0,
  churned_members   INTEGER NOT NULL DEFAULT 0,
  active_members    INTEGER,
  posts_count       INTEGER NOT NULL DEFAULT 0,
  comments_count    INTEGER NOT NULL DEFAULT 0,
  entered_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(community, week_start)
);

CREATE TABLE community_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community     TEXT NOT NULL,
  posted_at     DATE NOT NULL,
  title         TEXT NOT NULL,
  author_type   TEXT NOT NULL DEFAULT 'member',
  topic_id      UUID REFERENCES topics(id) ON DELETE SET NULL,
  comments_count INTEGER DEFAULT 0,
  likes_count   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_community_posts_topic_date ON community_posts(topic_id, posted_at);
```

Revenue and external calendar:

```sql
CREATE TABLE revenue_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at       TIMESTAMPTZ NOT NULL,
  product_id        UUID REFERENCES products(id) ON DELETE SET NULL,
  amount_cents      INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',
  event_type        TEXT NOT NULL,             -- 'join', 'renewal', 'purchase', 'booking', 'churn'
  attributed_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  attributed_topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  attribution_method  TEXT,                    -- 'utm', 'survey', 'last_touch', 'manual'
  source_detail     JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_revenue_occurred ON revenue_events(occurred_at);
CREATE INDEX idx_revenue_topic ON revenue_events(attributed_topic_id);

CREATE TABLE calendar_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  event_type    calendar_event_type NOT NULL,
  starts_on     DATE NOT NULL,
  ends_on       DATE NOT NULL,
  recurs_annually BOOLEAN NOT NULL DEFAULT TRUE,
  related_topic_ids UUID[] NOT NULL DEFAULT '{}',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_calendar_dates ON calendar_events(starts_on, ends_on);
```

The engine tables:

```sql
CREATE TABLE topic_daily_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id        UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source          metric_source,              -- NULL = all-platform rollup
  date            DATE NOT NULL,
  live_asset_count INTEGER NOT NULL DEFAULT 0,
  views           BIGINT NOT NULL DEFAULT 0,
  engagement      BIGINT NOT NULL DEFAULT 0,
  search_clicks   INTEGER NOT NULL DEFAULT 0,
  search_impressions BIGINT NOT NULL DEFAULT 0,
  email_opens     INTEGER NOT NULL DEFAULT 0,
  email_clicks    INTEGER NOT NULL DEFAULT 0,
  community_posts INTEGER NOT NULL DEFAULT 0,
  revenue_cents   INTEGER NOT NULL DEFAULT 0,
  relative_interest REAL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(topic_id, source, date)
);
CREATE INDEX idx_tdm_topic_date ON topic_daily_metrics(topic_id, date);
CREATE INDEX idx_tdm_date ON topic_daily_metrics USING BRIN(date);

CREATE TABLE seasonal_indices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id        UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source          metric_source,
  metric          TEXT NOT NULL,
  iso_week        SMALLINT NOT NULL CHECK (iso_week BETWEEN 1 AND 53),
  index_value     REAL NOT NULL,
  per_year_values JSONB NOT NULL DEFAULT '{}',
  years_observed  SMALLINT NOT NULL,
  sample_assets   INTEGER NOT NULL,
  confidence_score REAL NOT NULL,
  confidence      trend_confidence NOT NULL,
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(topic_id, source, metric, iso_week)
);
CREATE INDEX idx_seasonal_topic ON seasonal_indices(topic_id, metric);
CREATE INDEX idx_seasonal_confidence ON seasonal_indices(confidence, index_value);

CREATE TABLE anomalies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id        UUID REFERENCES topics(id) ON DELETE CASCADE,
  asset_id        UUID REFERENCES assets(id) ON DELETE CASCADE,
  source          metric_source,
  detected_on     DATE NOT NULL,
  metric          TEXT NOT NULL,
  expected_value  REAL NOT NULL,
  actual_value    REAL NOT NULL,
  z_score         REAL NOT NULL,
  direction       TEXT NOT NULL,              -- 'above', 'below'
  is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  promoted_insight_id UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_anomalies_detected ON anomalies(detected_on, is_acknowledged);

CREATE TABLE forecasts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id        UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source          metric_source,
  metric          TEXT NOT NULL,
  target_week     DATE NOT NULL,
  forecast_value  REAL NOT NULL,
  lower_bound     REAL,
  upper_bound     REAL,
  actual_value    REAL,
  abs_pct_error   REAL,
  model           TEXT NOT NULL DEFAULT 'seasonal_naive_drift',
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(topic_id, source, metric, target_week, model)
);

CREATE TABLE insights (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            insight_type NOT NULL,
  status          insight_status NOT NULL DEFAULT 'candidate',
  statement       TEXT NOT NULL,
  topic_id        UUID REFERENCES topics(id) ON DELETE SET NULL,
  commercial_category TEXT,
  evidence        JSONB NOT NULL DEFAULT '{}',
  confidence_score REAL NOT NULL,
  confidence      trend_confidence NOT NULL,
  valid_from      DATE,
  valid_until     DATE,
  reviewed_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  actioned_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  sponsor_safe    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_insights_status_type ON insights(status, type);
CREATE INDEX idx_insights_topic ON insights(topic_id);

CREATE TABLE audience_segments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  discovery_method TEXT NOT NULL DEFAULT 'kmeans_topic_affinity',
  member_count    INTEGER NOT NULL DEFAULT 0,
  topic_affinities JSONB NOT NULL DEFAULT '{}',
  seasonal_profile JSONB NOT NULL DEFAULT '{}',
  revenue_rate    REAL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE segment_members (
  segment_id    UUID NOT NULL REFERENCES audience_segments(id) ON DELETE CASCADE,
  member_key    TEXT NOT NULL,               -- hashed email / skool member ref
  member_source TEXT NOT NULL,               -- 'beehiiv', 'skool'
  affinity      REAL NOT NULL,
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (segment_id, member_key)
);
```

~14 new tables + 2 altered, taking the schema from 27 to ~41 tables.

---

## 7. New Build Tickets — Phases 9–12 (Tickets 51–72)

### Phase 9: Temporal Data Foundation (Tickets 51–58)

**Ticket 51: Intelligence Schema Migration** — **Size:** L — **Depends on:** Ticket 2
Tasks: create migration `00004_intelligence_layer.sql` with all Section 6 tables, enums, indexes; enable `pg_cron`; regenerate TypeScript types; seed `calendar_events` with the cycling year (Grand Tours, spring classics, sportive season Apr–Sep, resolution window Dec 26–Jan 31, N+1 bike-buying season, winter turbo season); mark initial ~60 topics `is_trend_tracked` with `commercial_category`.
Acceptance: migration runs clean; types importable; calendar seeded with ≥25 events; tracked-topic list reviewed by Anthony.

---

**Ticket 52: Daily Delta Pipeline** — **Size:** M — **Depends on:** 51, 33
Tasks: SQL function `derive_performance_daily()` (snapshot subtraction, gap-spreading, negative-delta clamping with sync-job warning); modify YouTube sync to write measured daily rows from the Analytics API (`is_measured = true`); pg_cron nightly schedule; backfill deltas from existing snapshots.
Acceptance: every publication with ≥2 snapshots has daily rows; YouTube rows are measured not derived; no negative values; reruns are idempotent.

---

**Ticket 53: Google Search Console Integration** — **Size:** M — **Depends on:** 23, 51
Tasks: GSC API via service account (same auth pattern as GA4, Ticket 29); daily sync of page × query × day into `search_console_daily` (3-day reporting lag handled); asset matching by URL; topic matching via `topic_aliases` + embedding fallback; **immediately backfill the full 16-month window**; unmatched-query review queue that suggests new aliases.
Acceptance: 16 months backfilled; ≥70% of impressions topic-matched; nightly sync stable; review queue functional.

---

**Ticket 54: Audience Demographics Capture** — **Size:** M — **Depends on:** 24, 25, 51
Tasks: YouTube Analytics demographics (age/gender/geo) per video monthly + channel-level weekly; Meta account-level audience + per-post reach breakdowns where the API still provides them; historical YouTube demographics backfill by date range; demographics panel on asset detail page.
Acceptance: every YouTube asset >1,000 views has demographic rows; channel-level weekly series exists; historical backfill ≥24 months; shares sum to ~100% per scope/period.

---

**Ticket 55: Historical Backfill Programme** — **Size:** L — **Depends on:** 52, 53, 54
The moat-bootstrapping ticket. Tasks: YouTube Analytics day-by-day historical per video **back to channel creation** (batched, quota-aware, resumable via `sync_jobs`); Beehiiv historical post stats; GA4 daily pageviews per blog URL back to property creation; map everything to assets/topics; report on coverage gaps.
Acceptance: ≥3 years of daily YouTube data in `performance_daily`; all Beehiiv sends historically loaded; backfill resumable after quota exhaustion; coverage report per topic per year rendered in admin.

---

**Ticket 56: Topic Auto-Classification** — **Size:** M — **Depends on:** 36, 51
Tasks: compute `topics.centroid_embedding` from confirmed assets (name+description seed for empty topics); classification job over unassigned/backfilled assets (cosine threshold, e.g. ≥0.78 auto-assign, 0.65–0.78 review queue); review UI (accept/reject); recompute centroids weekly.
Acceptance: ≥90% of published assets carry ≥1 topic; spot-check of 50 auto-assignments ≥85% correct; review queue functional.

---

**Ticket 57: Skool Weekly Ritual + Community Posts** — **Size:** M — **Depends on:** 30, 51, 56
Tasks: 5-minute weekly form for `community_snapshots` (both communities), with previous-week values pre-filled and Monday reminder notification (reuses Ticket 22); paste-in importer for post titles → `community_posts` with auto topic classification; community trend mini-dashboard (member growth, topic mix over time).
Acceptance: form completable in under 5 minutes; importer handles ≥50 titles per paste with topic assignment; reminder fires Mondays; dashboard renders both communities.

---

**Ticket 58: Keyword Volume Tracking + Revenue Events** — **Size:** M — **Depends on:** 51, 53
Tasks: DataForSEO (or equivalent) monthly sync for ~500 tracked keywords derived from top GSC queries per tracked topic, with trailing-history import; `revenue_events` capture: Skool join/churn CSV importer, camp booking manual entry, UTM convention (`utm_campaign=asset-slug`) documented and enforced in the publication composer (Ticket 17 UI gains a UTM builder); last-touch attribution from GA4 where UTMs exist.
Acceptance: 500 keywords tracked ≤$20/month; 12-month history imported; Skool CSV import maps joins to dates; UTM builder embedded in publication flow.

---

### Phase 10: Trend Engine (Tickets 59–63)

**Ticket 59: Topic Daily Aggregation** — **Size:** M — **Depends on:** 52, 53, 56, 57
Tasks: SQL function `aggregate_topic_daily_metrics()` joining `performance_daily` + `search_console_daily` + email + community + revenue through asset_topics; per-source rows + all-platform rollup; the three-step normalisation (per-piece, channel-baseline, age-cohort/GSC-primary) computing `relative_interest`; nightly pg_cron; full historical run over backfilled data.
Acceptance: every tracked topic has daily rows across the full backfilled range; normalisation verified against a hand-computed sample; full historical rebuild completes in <10 minutes; idempotent.

---

**Ticket 60: Seasonal Index Computation** — **Size:** L — **Depends on:** 59
Tasks: SQL function computing ISO-week seasonal indices per topic × source × metric with 3-week smoothing; per-year values stored; confidence scoring exactly per Section 4.4 (components stored in evidence for transparency); weekly recompute; hard minimum thresholds enforced (≥3 pieces, ≥1 observed year for "emerging", ≥2 for "probable").
Acceptance: creatine-class topics show January peaks with correct multipliers verifiable by hand; confidence tiers assigned; single-year topics never exceed "emerging"; recompute is idempotent.

---

**Ticket 61: Trend Explorer UI** — **Size:** L — **Depends on:** 60
Tasks: `/trends` route; topic seasonal curve chart (Recharts) — 53-week index line with per-year overlays and confidence band; annotated `calendar_events` markers on the x-axis (TdF, resolution window); platform comparison toggle; metric toggle (search demand / engagement / revenue); "Seasonal Almanac" view — a 12-month grid of which topics peak when, the single page that answers "what should we be making in March?"; confidence badges everywhere a number appears.
Acceptance: curve renders per-year overlays; almanac shows every established/probable trend in its peak month; filters work; nothing below "emerging" confidence displayed without explicit toggle.

---

**Ticket 62: Anomaly Detection** — **Size:** M — **Depends on:** 59, 60
Tasks: nightly robust z-score job (median/MAD, trailing 8 weeks, seasonally adjusted); `anomalies` writes at |z|>2.5; dashboard card "Unusual this week"; acknowledge + promote-to-insight actions; notification (Ticket 22) for |z|>3.5 on tracked topics.
Acceptance: synthetic spike injected into test data is detected; viral outliers don't distort subsequent weeks' expectations (MAD verified); promote action creates a candidate insight with evidence attached.

---

**Ticket 63: Forecasting + Self-Grading** — **Size:** M — **Depends on:** 60
Tasks: seasonal-naive-with-drift forecasts, 8 weeks ahead, weekly recompute; backfill actuals + `abs_pct_error` as weeks close; per-topic MAPE display; forecast strip on the Trend Explorer ("Next 8 weeks for this topic"); planning calendar (Ticket 18) gains a demand-forecast overlay row.
Acceptance: forecasts exist for all established/probable topics; error grading fills weekly; MAPE visible per topic; calendar overlay renders without slowing the calendar.

---

### Phase 11: Insight Mining (Tickets 64–68)

**Ticket 64: Insight Generator Framework** — **Size:** L — **Depends on:** 60, 62
Tasks: TypeScript generator framework (`src/lib/insights/generators/`) with a common contract: query → evidence → templated statement → confidence; implement `seasonal_peak` and `demand_gap` generators; weekly scheduled run; dedupe against existing non-dismissed insights; `valid_until` expiry for seasonal insights.
Acceptance: generators produce grammatical, numerically-correct statements (numbers traceable to evidence JSON); no duplicate insights on rerun; expired insights auto-archive.

---

**Ticket 65: Insight Review UI + Feed** — **Size:** M — **Depends on:** 64
Tasks: `/insights` route: candidate queue (validate / dismiss with reason / edit statement), validated feed filterable by type/topic/category; `sponsor_safe` toggle (admin/commercial roles only, permission-gated via Ticket 6); "create asset from insight" action pre-filling an asset + brief with the insight attached (`actioned_asset_id` linked); dashboard widget: top 3 insights for the next 30 days.
Acceptance: full review workflow functional; asset creation links back to insight; dashboard widget live; slop-free statement quality (statements read like Anthony wrote them).

---

**Ticket 66: Timing Recommendations** — **Size:** M — **Depends on:** 63, 64
Tasks: `timing_recommendation` generator working backwards from demand peaks (peak week − format lead time − SEO ramp: blog 6 weeks, video 2, email 1); "Plan ahead" calendar view — next 12 weeks of publish-by windows per topic; historical validation report: did content published in recommended windows actually outperform.
Acceptance: tyre-class topics generate April publish recommendations for May peaks; windows appear on the planning calendar; validation report computes the actual historical multiplier per recommendation.

---

**Ticket 67: Format Effectiveness + Audience Affinity Generators** — **Size:** M — **Depends on:** 54, 64
Tasks: `format_effectiveness` (per topic, per-piece engagement by asset_type, min 3 pieces per format before comparing); `audience_affinity` joining `audience_demographics` to topic performance with seasonal splits ("male 35–50 over-index 2.4× on supplements in Q1"); both feed the insight queue; asset detail page shows "best format for this topic" hint.
Acceptance: nutrition-class topics produce format ratios with sample sizes shown; affinity insights carry demographic evidence; minimum-sample rules enforced.

---

**Ticket 68: Audience Segment Discovery** — **Size:** L — **Depends on:** 28, 57, 64
Tasks: topic-affinity vectors per Beehiiv subscriber (click/open events by send topic, recency-weighted) and Skool member (post/comment topics); k-means (k configurable 5–8) in a scheduled job; segment naming workflow (system describes, human names); seasonal activity curve + revenue rate per segment; Beehiiv segment export (CSV of emails per segment) for targeted sends; privacy note rendered in UI (first-party data only, hashed member keys).
Acceptance: 29k contacts clustered in one job run; segments have interpretable top-topic profiles; export produces a valid Beehiiv import file; no raw emails stored in `segment_members`.

---

### Phase 12: Commercial Layer (Tickets 69–72)

**Ticket 69: Sponsor Evidence Packs** — **Size:** L — **Depends on:** 42, 65, 67
Tasks: per `commercial_category` (supplements, tyres, kit…), one-click evidence pack: audience size + demographics, seasonal demand curve, established insights (`sponsor_safe` only), format effectiveness, comparable past campaign performance (Ticket 42 data); rendered as a shareable branded page + PDF export; all figures carry sample sizes and date ranges (credibility is the product); pack views logged.
Acceptance: supplements pack generates in <10 seconds with real figures; only sponsor_safe insights appear; PDF matches brand (Bebas Neue, Deep Purple, Coral); every stat shows its basis.

---

**Ticket 70: Annual Audience Report Pipeline** — **Size:** M — **Depends on:** 61, 65
Tasks: "State of the Masters Cyclist" data export — the year's seasonal almanac, top rising/falling topics, demographic shifts, community themes — as structured JSON + chart images, feeding a manually-edited annual report (editorial stays human, per the 9.5 standard); designed as both a marketing asset (lead magnet / PR) and a paid industry product for brands.
Acceptance: export covers a full calendar year; charts render publication-quality; no individual-level data anywhere in the export.

---

**Ticket 71: Revenue Attribution Dashboard** — **Size:** M — **Depends on:** 58, 59
Tasks: `/performance/revenue` view: revenue by topic, by month, by attribution method; NDY join-curve against content calendar overlay ("what did we publish in the fortnight before join spikes?"); cohort view of camp bookings vs camp-content publishing; honesty labels on attribution method (UTM-attributed vs inferred shown separately, never blended silently).
Acceptance: every revenue event visible with method label; topic revenue rollup matches `revenue_events` sums; join-curve overlay renders.

---

**Ticket 72: Intelligence Ops + Data Quality Monitor** — **Size:** M — **Depends on:** all Phase 9–11
Tasks: `/settings/intelligence` admin page: sync coverage heat-map (source × week — instantly shows capture gaps before they poison a year of trends), topic taxonomy health (untagged asset %, alias coverage), stale-index warnings, pg_cron job status; runbook page documenting the weekly ritual (Skool form Monday, insight review Friday); alert when any capture source goes dark >3 days.
Acceptance: a deliberately-broken sync shows on the heat-map within a day; taxonomy health scores render; dark-source alert fires via notifications.

---

## 8. Implementation Priorities — What Ships Value Fastest

Sequencing principle: **capture before compute, compute before UI.** Every week GSC isn't syncing is a week of the 16-month window lost forever — that makes Ticket 53 the single most time-sensitive ticket in this entire document.

1. **Immediately (even before Phase 4–8 completes):** Tickets 51, 53 — schema + GSC capture. GSC's rolling window is the only truly perishable data source.
2. **First value milestone (~Phase 9 complete):** Ticket 55's backfill + Ticket 59–61 gives the Seasonal Almanac on multi-year data. This alone answers "what do we make in March?" and is demonstrably the moment Roadman OS becomes something no competitor has.
3. **Second milestone:** Tickets 64–66 — the system starts telling the team things ("publish tyre content in 3 weeks") rather than waiting to be asked.
4. **Third milestone:** Ticket 69 — the first sponsor deck built on established insights. This is when the data starts paying for itself.

Phases 9–10 depend on Phase 4–5 integrations (Tickets 24–33) being live; Phase 9 can interleave with Phases 6–8 since they touch different surfaces.

---

## 9. Budget

| Item | Current | With expansion |
|---|---|---|
| Supabase Pro | $25 | $25 (data volume comfortably within Pro; ~1–2 GB/year growth) |
| Vercel | $20 | $20 |
| OpenAI (embeddings + classification) | ~$2 | ~$8 (backfill month spikes to ~$20 once) |
| Keyword data (DataForSEO pay-as-you-go) | — | ~$15 |
| **Total** | **~$47** | **~$68/month** |

No new services, no dedicated ML infrastructure, no data warehouse. Postgres is the warehouse.

---

## 10. The Data Moat — Why This Compounds

**What competitors cannot replicate:**

1. **Time itself.** Seasonal confidence requires years of observation. A competitor starting in 2027 is structurally two years behind the day they start, and the gap never closes as long as capture continues. The GSC 16-month window makes this literal: data not captured this month is unobtainable at any price.
2. **The cross-platform join.** YouTube Studio knows YouTube. Beehiiv knows email. Nobody — including the platforms — can see that the *same niche audience's* supplement interest spikes across search, video, email and community simultaneously in January. That correlation only exists in a system that joins all four, and only Roadman holds all four for this audience.
3. **The private layer.** Skool community discussions, NDY member behaviour, camp bookings, and revenue events are invisible to every external tool. Community topic data is leading-indicator gold: members ask about creatine *before* they search for it.
4. **Taxonomy discipline.** The consistent topic backbone applied across 1,010 posts, 100M podcast downloads' worth of episodes, and every send and short is itself years of accumulated editorial labour. Raw data without the taxonomy is noise; the taxonomy is un-scrapeable.

**How it monetises beyond content decisions:**

- **Sponsor sales (nearest revenue):** "We can prove male 35–50 audiences engage 3× with supplement content in Q1 — here's four years of evidence" converts sponsorship from rate-card haggling to evidence-based sell, and justifies premium seasonal pricing (a January supplement slot is provably worth more — price it so).
- **The annual report:** a "State of the Masters Cyclist" industry report is PR, lead magnet, and a paid product for brands in one artefact — priced in the $1,500–5,000 range per brand licence, it needs only a handful of buyers to matter.
- **Category benchmarking / consulting:** brands planning launches will pay for "when does interest in your category peak among serious amateurs 35–55" — data nobody else holds at this granularity.
- **The template play:** Roadman OS itself, proven on Roadman, becomes a productisable pattern for other niche media operators (the golf Roadman, the running Roadman) — the furthest-out and largest option, and it costs nothing to keep open.

**The compounding loop:** better timing → better content performance → more audience → more data → sharper trends → better timing. Each cycle also raises confidence tiers, which raises what's usable in sponsor decks, which funds more content. The flywheel's only maintenance cost is capture discipline — which is exactly what Ticket 72 exists to police.

---

## 11. Additional Platform Integrations (Tickets 30A–30C)

*Added 18 July 2026 — extends Phase 4 (Tickets 23–30) to cover TikTok, X/Twitter, and Spotify for Podcasters analytics.*

These three platforms complete the capture surface. LinkedIn is already covered by Ticket 26. TikTok and Twitter/X are already seeded in the `platforms` table (Ticket 16) and their `metric_source` enum values already exist — no schema migration needed. Ticket 33's cron lists must be amended to include all three.

### Ticket 30A: TikTok Integration

**Size:** L
**Depends on:** Ticket 23 (daily-delta and demographics tasks also depend on Ticket 51)

TikTok Business Account API integration for the Roadman TikTok account. Pulls video-level performance (views, engagement, watch time, completion rate), account-level follower growth, and audience demographics.

**Tasks:**
- **Prerequisite setup (Anthony):**
  - Convert the TikTok account to a Business account if not already (demographics and insights require it)
  - Register a developer app in the TikTok for Business developer portal (business-api.tiktok.com), request Business Account insight and video-list scopes, submit for app review — approval can take days to weeks, kick this off before the build starts
  - Store `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET` in Vercel env vars; register OAuth redirect URI (`/api/auth/tiktok/callback`)
- Create `src/lib/integrations/tiktok.ts` — TikTok Business API client:
  - Base URL: `https://business-api.tiktok.com/open_api/v1.3/`
  - Auth: OAuth 2.0 authorisation-code flow via shared handler from Ticket 23; tokens stored in `platform_connections`, refresh via `getValidToken()` (access tokens short-lived with long-lived refresh tokens — treat expiry defensively)
  - Functions:
    - `getAccountInsights(businessId, startDate, endDate)` — `GET /business/get/` with metric fields for follower count, follower net growth, profile views, video views, likes, comments, shares, plus audience fields (`audience_ages`, `audience_genders`, `audience_countries`, `audience_activity`). Daily granularity; request in ≤30-day windows
    - `listVideos(businessId, cursor?)` — `GET /business/video/list/` with fields: `item_id`, `create_time`, `caption`, `share_url`, `thumbnail_url`, `duration`, `video_views`, `likes`, `comments`, `shares`, `reach`, `total_time_watched`, `average_time_watched`, `full_video_watched_rate`, `impression_sources`. Cursor-based pagination handler
  - Fallback path: simpler Display API (`open.tiktokapis.com/v2/`) covers views/likes/comments/shares and follower count only (no watch time, no completion rate, no demographics). Use only if Business API app review stalls
- Create sync handler `src/app/api/sync/tiktok/route.ts`:
  - Validates request (CRON_SECRET or admin session)
  - Pulls video list; matches videos to existing assets by `share_url`/external URL, creating asset + publication records for unmatched videos (Ticket 24 pattern)
  - Upserts cumulative lifetime snapshots into `performance_records`:
    - `video_views` → `views`, `reach` → `reach`
    - `likes` → `likes`, `comments` → `comments`, `shares` → `shares`
    - `total_time_watched` → `watch_time_seconds`
    - `average_time_watched` → `avg_view_duration_seconds`
    - `full_video_watched_rate` → `custom_metrics.completion_rate`
    - `impression_sources` breakdown (For You / profile / search / follow) → `custom_metrics.impression_sources`
    - `engagement_rate` → calculated ((likes + comments + shares) / video_views × 100)
  - Writes measured daily rows into `performance_daily` (`is_measured = true`) from `getAccountInsights` daily series: daily video views → `views`, daily likes/comments/shares → respective columns, daily follower net change → `subscribers_gained`. Video-level daily deltas derived from successive snapshots by Ticket 52 (`is_measured = false`)
  - Tracks follower count as channel-level `performance_records` entry with `source = 'tiktok'`
  - Writes account-level demographics into `audience_demographics` with `source = 'tiktok'`, `scope = 'channel'`: `audience_ages` × `audience_genders` → `age_bracket`/`gender`/`share_pct`, `audience_countries` → `country` rows. Map TikTok's coarser '55+' bracket into schema's bracket set and document the mapping
  - Creates `sync_jobs` record
- Add TikTok to Ticket 33 cron: daily sync (account insights + recent video metrics), weekly sync (full video list sweep, demographics refresh)
- Add TikTok `ConnectionCard` to Ticket 23 integrations page

**Rate limits, cost, and history:**
- Business API limits generous (hundreds/minute) — nightly sync won't approach them; log request counts in `sync_jobs`
- Cost: free. Only cost is app-review lead time
- Historical: video lifetime metrics available from connect time (backfillable as initial cumulative snapshot per video), but daily account-level history limited to ~60 days and demographics are current-snapshot only — **connect early; every week before connection is trend data lost**

**Acceptance criteria:**
- TikTok Business account connects via OAuth 2.0 from integration settings
- Video list pulled with full metrics (views, likes, comments, shares, reach, watch time, completion rate)
- Lifetime snapshots in `performance_records`, daily account-level series in `performance_daily` with `is_measured = true`
- Follower count and daily growth tracked
- Channel-scope demographics in `audience_demographics` summing to ~100%
- Unmatched videos create asset + publication records; reruns idempotent
- Sync creates accurate `sync_jobs` records; TikTok appears in daily and weekly cron

---

### Ticket 30B: X (Twitter) Integration

**Size:** M
**Depends on:** Ticket 23 (daily-delta tasks also depend on Ticket 51)

X API v2 integration for the Roadman account. **Decision gate before building:** free tier (~100 posts read/month) is unusable; Basic (~$100/month) is required. Only build if X is an active Roadman channel worth ~$1,200/year of tooling. Manual fallback ships regardless.

**Tasks:**
- **Prerequisite setup (Anthony):**
  - Confirm account handle and that it's worth the Basic subscription
  - Create developer account at developer.x.com, create Project + App, subscribe to **Basic** tier
  - Enable OAuth 2.0 with PKCE, set callback URL (`/api/auth/twitter/callback`), store `X_CLIENT_ID` and `X_CLIENT_SECRET` in Vercel env vars
- Create `src/lib/integrations/twitter.ts` — X API v2 client:
  - Base URL: `https://api.x.com/2/`
  - Auth: OAuth 2.0 Authorisation Code with PKCE, **user context** (required for non-public metrics); scopes: `tweet.read`, `users.read`, `offline.access`. Access tokens expire ~2 hours — refresh via `getValidToken()` on every sync
  - Functions:
    - `getAuthenticatedUser()` — `GET /2/users/me?user.fields=public_metrics` — returns `followers_count`, `following_count`, `tweet_count`, `listed_count`
    - `getUserTweets(userId, paginationToken?, startTime?)` — `GET /2/users/{id}/tweets?max_results=100&tweet.fields=public_metrics,created_at,entities` — reverse-chronological, paginate up to 3,200 most recent tweets
    - `getTweetMetrics(tweetIds[])` — `GET /2/tweets?ids=...&tweet.fields=public_metrics,non_public_metrics,organic_metrics` — batched up to 100 IDs. `non_public_metrics` (impressions, link clicks, profile visits) and `organic_metrics` only returned for tweets ≤30 days old in user context
  - Request budgeter: Basic caps monthly post reads (10,000/month) and per-endpoint windows (~10–15 requests/15 minutes on timeline). Track consumption in `sync_jobs.custom` and hard-stop before cap
- Create sync handler `src/app/api/sync/twitter/route.ts`:
  - Daily: fetch tweets from last 30 days (few timeline pages), one batched `getTweetMetrics` — comfortably under 3,000 post-reads/month at Roadman's posting volume
  - Upserts cumulative snapshots into `performance_records` with `source = 'twitter_x'`:
    - `impression_count` → `views` and `impressions`
    - `like_count` → `likes`, `reply_count` → `comments`, `retweet_count + quote_count` → `shares`, `bookmark_count` → `saves`
    - `url_link_clicks` → `clicks` (when available), `user_profile_clicks` → `custom_metrics.profile_visits`
    - `engagement_rate` → calculated (likes + replies + retweets + quotes + bookmarks) / impressions × 100
  - Tracks `followers_count` as channel-level record; daily deltas derived by Ticket 52 into `performance_daily.subscribers_gained`
  - Tweet-level daily deltas: API provides **no historical daily series** — all `performance_daily` rows derived from successive snapshots by Ticket 52 (`is_measured = false`)
  - Matches tweets to assets/publications by URL in `entities`; standalone tweets create lightweight publication records
  - **Demographics:** X API v2 exposes **no** audience age/gender/geo data. `audience_demographics` not populated for this source — note explicitly in integration card
- One-off backfill: paginate full 3,200-tweet timeline at connect time to seed lifetime `public_metrics` snapshots (~32 requests / 3,200 post-reads — run in first month's quota headroom, resumable via `sync_jobs`)
- **Manual fallback (build regardless):** CSV/manual entry form (Ticket 30 Skool pattern) for pasting monthly figures from free X analytics dashboard, same `performance_records` shape with `source = 'twitter_x'`
- Add X to Ticket 33 daily cron; add `ConnectionCard` showing tier and monthly quota consumption

**Rate limits, cost, and history:**
- Basic: ~$100/month (verify — X has repriced); 10,000 post reads/month
- Historical: last 3,200 tweets with lifetime metrics — yes; daily series — no; link clicks/profile visits — trailing 30 days only
- Daily series builds forward from first sync via snapshot subtraction

**Acceptance criteria:**
- Account connects via OAuth 2.0 PKCE with token refresh across 2-hour expiry
- Recent tweets sync daily with public and (where available) non-public metrics
- Follower count tracked, daily deltas in `performance_daily`
- Monthly quota tracked, sync hard-stops before Basic cap
- One-off 3,200-tweet backfill completes and is resumable
- Manual fallback form works independently of API subscription

---

### Ticket 30C: Spotify for Podcasters Analytics

**Size:** L
**Depends on:** Tickets 23, 27 (daily-delta and demographics tasks also depend on Ticket 51)

Deep Spotify-specific analytics: episode starts/streams/listeners, completion and retention, show followers, listener demographics. Separate from Ticket 27 (RSS content metadata) — this ticket owns the numbers.

**Important caveat:** Spotify offers no general public analytics API. This ticket builds a tiered approach: unofficial dashboard endpoints behind a feature flag as the primary automated path, with CSV importer as the supported fallback. The unofficial path uses the same endpoints the Spotify for Podcasters web dashboard calls; it is brittle and sits in a ToS grey area — needs Anthony's explicit sign-off before enabling, and must fail soft (never break the cron run).

**Tasks:**
- **Prerequisite setup (Anthony):**
  - Confirm sign-off on unofficial-endpoint approach, or choose CSV-only
  - If automated: capture `sp_dc` cookie from a logged-in Spotify for Podcasters browser session, paste into integration settings (stored in `platform_connections.api_key`, encrypted at rest). Note the show ID from the dashboard URL. Cookie lives months but not forever — connection card surfaces expiry loudly
  - Check whether podcast hosting provider exposes its own analytics API
- Create `src/lib/integrations/spotify-analytics.ts` — analytics client (distinct from `spotify.ts` in Ticket 27):
  - Token exchange: `sp_dc` cookie → short-lived bearer token via `open.spotify.com/get_access_token`; cache (~1 hour), re-exchange on 401
  - Base URL: `https://generic.wg.spotify.com/podcasters/v0/shows/{showId}/`
  - Functions (all date-ranged, all guarded by feature flag):
    - `getShowStreams(start, end)` — `detailedStreams` — per-day starts and streams
    - `getShowListeners(start, end)` — `listeners` — per-day unique listeners
    - `getFollowers(start, end)` — `followers` — per-day follower counts
    - `getDemographics(start, end)` — `aggregate` — listener counts by age bracket and gender
    - `listEpisodes(start, end, page, size)` — episode list with Spotify episode IDs, starts, streams, listeners
    - `getEpisodePerformance(episodeId)` — `episodes/{id}/performance` — median completion %, average listen, sample-point retention curve
    - `getEpisodeStreams(episodeId, start, end)` — per-day starts/streams for one episode
  - Polite throttling (~1 req/second), response-shape validation on every call — any schema drift flips connection to Error state rather than writing bad rows
- Create sync handler `src/app/api/sync/spotify-analytics/route.ts`:
  - Matches Spotify episodes to `podcast_episode` assets from Ticket 27 (by title + publish date; store Spotify episode ID once matched)
  - Cumulative snapshots → `performance_records` with `source = 'spotify'`:
    - `streams` → `views` (stream = played >60s; document the semantic)
    - `starts` → `impressions` (starts ≥ streams; start→stream ratio = hook metric → `custom_metrics.start_to_stream_rate`)
    - `listeners` → `reach`
    - Average listen seconds → `avg_view_duration_seconds`
    - Median completion % → `custom_metrics.completion_pct`
    - Retention curve samples → `custom_metrics.retention_curve`
    - Show follower count → channel-level record
  - Daily series → `performance_daily` with `is_measured = true` (per-day endpoints give real measured values): daily streams → `views`, daily starts → `impressions`, daily listeners → `custom_metrics.listeners`, daily follower change → `subscribers_gained`
  - Demographics → `audience_demographics` with `source = 'spotify'`, `scope = 'channel'`: map Spotify brackets (0-17, 18-22, 23-27, 28-34, 35-44, 45-59, 60+) onto schema brackets with documented mapping. Genders: male/female/non-binary/not-specified → 'male'/'female'/'unknown'
  - **Failure must never abort the rest of the cron run** (error isolation per Ticket 33)
- **Historical backfill:** dashboard endpoints serve data back to show's first day on Spotify — run one-off resumable backfill (month-by-month windows, `sync_jobs` checkpointing) covering full show history. This is the highest-value backfill outside YouTube (Ticket 55) — years of measured daily podcast data feeding `topic_daily_metrics` and seasonal indices
- **CSV fallback importer** (build in all cases): upload form accepting Spotify for Podcasters dashboard CSV exports (episode performance, followers), parsed and written to same tables
- Add to Ticket 33 daily cron (yesterday's dailies + recent episode performance) and weekly cron (demographics, full-episode sweep); add `ConnectionCard` to Ticket 23 with cookie-expiry warning state

**Rate limits, cost, and history:**
- Cost: free. Risk: unofficial surface may change — hence flag, validation, CSV fallback
- No published rate limits; self-throttle
- Historical: full backfill to show start is possible — do it immediately after connection

**Acceptance criteria:**
- Feature flag off → no unofficial calls ever made; CSV importer works standalone
- Flag on with valid cookie: show-level dailies land in `performance_daily` as measured rows
- Episode-level completion, average listen, retention curves stored per episode
- Demographics rows with documented bracket mapping, shares summing to ~100%
- Full historical backfill completes, is resumable, populates daily rows back to show start
- Cookie expiry or endpoint drift flips connection to Error with clear message, never breaks wider cron
- Episodes correctly matched to Ticket 27 assets with no duplicates

---

### Ticket 30D: Website Article-Level Readership (GA4 Enhancement)

**Size:** M
**Depends on:** Ticket 29 (GA4 integration), Ticket 51 (for `performance_daily`)

Extends Ticket 29 to capture **per-article readership data** — "who's reading what" — and map it to content assets in Roadman OS. GA4 page-level data is the strongest owned-platform signal for topic demand.

**Tasks:**
- Extend `src/lib/integrations/ga4.ts` to pull page-level dimensions:
  - `runReport()` with dimensions: `pagePath`, `date`, `deviceCategory`, `country`, `city`, `newVsReturning`
  - Metrics: `screenPageViews`, `activeUsers`, `sessions`, `averageSessionDuration`, `engagedSessions`, `engagementRate`, `bounceRate`, `scrolledUsers` (GA4 enhanced measurement scroll tracking)
  - Landing page report: `landingPage` dimension — shows which articles bring people to the site
  - User flow: `pagePath` + `pageReferrer` — shows where readers go after an article (internal linking effectiveness)
- Create article-matcher in sync handler:
  - Strip `/blog/`, `/topics/`, `/answer/`, `/tools/` prefixes from `pagePath`
  - Match to `content_assets` by slug or URL
  - Unmatched high-traffic paths flagged for manual mapping (tool pages, landing pages, etc.)
- Write per-article daily rows to `performance_daily` with `source = 'ga4'`:
  - `screenPageViews` → `views`
  - `activeUsers` → `reach`
  - `engagedSessions` → `custom_metrics.engaged_sessions`
  - `engagementRate` → `custom_metrics.engagement_rate`
  - `bounceRate` → `custom_metrics.bounce_rate`
  - `averageSessionDuration` → `avg_view_duration_seconds`
  - `scrolledUsers / activeUsers` → `custom_metrics.scroll_depth_pct`
  - All with `is_measured = true` (GA4 provides actual daily figures)
- Write site-level demographics to `audience_demographics` with `source = 'ga4'`:
  - GA4 user demographics report (requires Google Signals enabled): age brackets, gender
  - Geo report: `country`, `city` → `audience_demographics` rows
  - Device breakdown → `custom_metrics.device_split` on channel-level record
- **Content performance aggregation:** write a pg_cron function (or extend Ticket 59's `aggregate_topic_daily_metrics`) that:
  - Joins `performance_daily` (source = 'ga4') rows with `content_assets` → `content_asset_topics` to roll article views up into `topic_daily_metrics`
  - This is the critical join: it converts "page /blog/creatine-for-cyclists got 340 views on Jan 15" into "topic:supplements got 340 website views on Jan 15" — which feeds the seasonal index that proves creatine peaks in January
- **New vs returning reader ratio per topic:** aggregate `newVsReturning` dimension per topic — a topic where 80% of readers are new is a discovery topic (SEO/social entry point); one where 80% are returning is a loyalty topic (community interest). Surface this as `custom_metrics.new_reader_pct` on `topic_daily_metrics`
- GA4 Data API quotas: 10,000 requests/day for free GA4 properties — daily article-level sync uses 2–5 requests, no concern

**Historical backfill:**
- GA4 Data API serves historical data back to property creation (no rolling window like GSC)
- Backfill per-article daily metrics from GA4 property start date — potentially 2+ years of daily article readership
- Run as resumable month-by-month job via `sync_jobs`

**Acceptance criteria:**
- Per-article daily views, engagement rate, bounce rate, scroll depth, session duration land in `performance_daily`
- Articles matched to `content_assets` with unmatched high-traffic paths flagged
- Article views roll up correctly into `topic_daily_metrics` via topic joins
- New vs returning reader ratio aggregated per topic
- Site-level demographics (age, gender, geo, device) in `audience_demographics`
- Historical backfill completes to GA4 property start date

---

### Integration Notes (Tickets 30A–30D)

- **Ticket 16 (platform seeding):** no changes needed — TikTok (slug `tiktok`) and Twitter/X (slug `twitter`) already in seed list. Add account handles once confirmed.
- **`metric_source` enum:** no migration needed — `'tiktok'`, `'twitter_x'` and `'spotify'` already exist.
- **LinkedIn:** already covered by Ticket 26 — no gap.
- **Ticket 33 (cron):** amend daily-sync and weekly-sync task lists to include TikTok, X, Spotify Analytics, and GA4 article-level. Extend dependency list with 30A, 30B, 30C, 30D.
- **Ticket 51 dependency:** the `performance_daily` and `audience_demographics` writes in all four tickets require the intelligence schema migration. If any ships before Ticket 51, land the `performance_records` snapshot path first and add daily/demographic writes when 51 merges.
- **Total platform coverage after 30A–30D:**
  - YouTube × 2 channels (Ticket 24) ✓
  - Instagram (Ticket 25) ✓
  - Facebook (Ticket 26) ✓
  - LinkedIn (Ticket 26) ✓
  - Beehiiv (Ticket 28) ✓
  - GA4 site-level + article-level (Tickets 29 + 30D) ✓
  - Skool (Ticket 30) ✓
  - TikTok (Ticket 30A) ✓
  - X/Twitter (Ticket 30B) ✓
  - Spotify podcast analytics (Ticket 30C) ✓
  - GSC (Ticket 53) ✓
  - **11 platforms, zero blind spots**

---

## Summary

- **~14 new tables** on top of the existing 27, centred on `performance_daily` (the delta fix), `topic_daily_metrics` (the time series), `seasonal_indices` (the trends), and `insights` (the product).
- **22 new tickets (51–72)** across four new phases, plus **4 additional platform tickets (30A–30D)** for complete capture coverage.
- **Three non-obvious design decisions:** compute in Postgres via pg_cron (not Vercel functions); GSC impressions as the primary seasonality signal (content-age-independent); historical backfill from YouTube/Beehiiv/GA4 to bootstrap multi-year trends at launch instead of waiting two years.
- **Two urgent actions regardless of build order:** start GSC capture now (perishable 16-month window), and lock the topic taxonomy governance now (a messy year one poisons every later comparison).
- **Budget impact:** ~$47 → ~$68/month (X Basic adds ~$100/month if approved — decision gate on Ticket 30B). No new infrastructure.
