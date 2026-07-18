-- Migration: 00004_intelligence_layer.sql
-- Description: Intelligence expansion schema — trend detection, seasonal indices, daily deltas,
--              audience demographics, community data, revenue attribution, forecasting.
-- Date: 2026-07-18
-- Depends on: 00001_initial_schema.sql (core tables), 00003_content_clusters_metadata.sql
-- Reference: ROADMAN-OS-INTELLIGENCE-EXPANSION.md, ROADMAN-OS-MASTER-PLAN.md Section 3

-- ============================================================================
-- NEW ENUMS
-- ============================================================================

CREATE TYPE trend_confidence AS ENUM ('noise', 'emerging', 'probable', 'established');

CREATE TYPE insight_type AS ENUM (
  'seasonal_peak', 'timing_recommendation', 'format_effectiveness',
  'audience_affinity', 'demand_gap', 'decay_seasonal', 'anomaly', 'manual'
);

CREATE TYPE insight_status AS ENUM (
  'candidate', 'validated', 'dismissed', 'archived', 'actioned'
);

CREATE TYPE calendar_event_type AS ENUM (
  'race', 'grand_tour', 'classic', 'sportive_season', 'industry_launch',
  'resolution_period', 'holiday', 'weather_phase', 'roadman_event', 'other'
);

-- ============================================================================
-- EXTENSIONS (pgvector already enabled in 00001, pg_cron enabled at Supabase project level)
-- ============================================================================

-- Ensure pg_cron is available for scheduled computation jobs
-- CREATE EXTENSION IF NOT EXISTS "pg_cron";  -- Supabase enables this at project level

-- ============================================================================
-- ALTER EXISTING TABLES
-- ============================================================================

-- Add intelligence tracking columns to topics
ALTER TABLE topics
  ADD COLUMN IF NOT EXISTS is_trend_tracked BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS centroid_embedding vector(1536),
  ADD COLUMN IF NOT EXISTS commercial_category TEXT;

COMMENT ON COLUMN topics.is_trend_tracked IS 'Whether this topic feeds the trend engine (topic_daily_metrics, seasonal_indices)';
COMMENT ON COLUMN topics.centroid_embedding IS 'Average embedding of all content tagged with this topic — used for auto-classification';
COMMENT ON COLUMN topics.commercial_category IS 'Commercial grouping for sponsor evidence packs, e.g. supplements, tyres, training';

-- ============================================================================
-- TABLE 1: topic_aliases
-- Maps variant spellings, abbreviations, and GSC queries to canonical topics.
-- Used by the topic classifier (Ticket 56) to tag incoming GSC queries and
-- community posts to the correct canonical topic.
-- ============================================================================

CREATE TABLE topic_aliases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  alias       TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'manual',  -- 'manual', 'gsc_auto', 'community_auto'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(alias)
);

CREATE INDEX idx_topic_aliases_topic ON topic_aliases(topic_id);
CREATE INDEX idx_topic_aliases_alias ON topic_aliases(lower(alias));

COMMENT ON TABLE topic_aliases IS 'Maps variant names (zone 2, z2 training, zone two) to canonical topics. Globally unique alias constraint prevents ambiguous mappings.';

-- ============================================================================
-- TABLE 2: performance_daily
-- Daily deltas — the trend engine fuel. One row per publication × source × date.
-- Replaces snapshot-based performance_records as the primary analytical table.
-- Rows are either measured (from platform daily APIs) or derived (from
-- successive snapshot subtraction by the delta derivation pipeline, Ticket 52).
-- ============================================================================

CREATE TABLE performance_daily (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id      UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  source              metric_source NOT NULL,
  date                DATE NOT NULL,
  -- Daily delta metrics (NOT cumulative — each row is one day's activity)
  views               BIGINT NOT NULL DEFAULT 0,
  impressions         BIGINT NOT NULL DEFAULT 0,
  clicks              BIGINT NOT NULL DEFAULT 0,
  likes               BIGINT NOT NULL DEFAULT 0,
  comments            BIGINT NOT NULL DEFAULT 0,
  shares              BIGINT NOT NULL DEFAULT 0,
  saves               BIGINT NOT NULL DEFAULT 0,
  watch_time_seconds  BIGINT NOT NULL DEFAULT 0,
  subscribers_gained  INTEGER NOT NULL DEFAULT 0,
  revenue_cents       INTEGER NOT NULL DEFAULT 0,
  -- TRUE = value came from platform's own daily API endpoint
  -- FALSE = derived from subtracting consecutive performance_records snapshots
  is_measured         BOOLEAN NOT NULL DEFAULT FALSE,
  -- Flexible store for platform-specific metrics not in fixed columns
  -- e.g. completion_rate, impression_sources, engagement_rate, scroll_depth_pct
  custom_metrics      JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(publication_id, source, date)
);

CREATE INDEX idx_perf_daily_pub_date ON performance_daily(publication_id, date);
CREATE INDEX idx_perf_daily_date ON performance_daily USING BRIN(date);
CREATE INDEX idx_perf_daily_source_date ON performance_daily(source, date);

COMMENT ON TABLE performance_daily IS 'Daily engagement deltas per publication per platform. The core fuel for the trend engine — aggregated into topic_daily_metrics, then seasonal_indices.';
COMMENT ON COLUMN performance_daily.is_measured IS 'TRUE when the platform API provides actual daily figures. FALSE when derived from snapshot subtraction (Ticket 52 pipeline).';

-- ============================================================================
-- TABLE 3: audience_demographics
-- Age/gender/geo breakdowns per platform. Scope is per-asset or channel-level.
-- Populated by platform sync handlers; used for audience segmentation and
-- sponsor evidence packs ("males 35-50 engage 3× with supplement content").
-- ============================================================================

CREATE TABLE audience_demographics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source          metric_source NOT NULL,
  scope           TEXT NOT NULL CHECK (scope IN ('asset', 'channel')),
  asset_id        UUID REFERENCES assets(id) ON DELETE CASCADE,
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  age_bracket     TEXT NOT NULL,      -- '18-24','25-34','35-44','45-54','55-64','65+','unknown'
  gender          TEXT NOT NULL,      -- 'male','female','unknown'
  country         TEXT,               -- ISO 3166-1 alpha-2 (NULL = not segmented by country)
  share_pct       REAL NOT NULL,      -- 0.0 to 1.0 — share within this source/scope/period
  absolute_value  BIGINT,             -- absolute count if platform provides it
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (source, scope, asset_id, period_start, age_bracket, gender, country)
);

CREATE INDEX idx_demo_asset ON audience_demographics(asset_id);
CREATE INDEX idx_demo_period ON audience_demographics(period_start, period_end);
CREATE INDEX idx_demo_source ON audience_demographics(source);

COMMENT ON TABLE audience_demographics IS 'Platform audience breakdowns by age, gender, and geography. Channel-scope rows describe overall platform audience; asset-scope rows describe per-video/per-post viewers.';

-- ============================================================================
-- TABLE 4: search_console_daily
-- GSC page × query × day data. The cleanest demand signal because it is
-- content-age-independent — impressions reflect what people are searching for,
-- not how old the content is. 16-month rolling window means data not captured
-- now is lost forever.
-- ============================================================================

CREATE TABLE search_console_daily (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date          DATE NOT NULL,
  page_url      TEXT NOT NULL,
  query         TEXT NOT NULL,
  asset_id      UUID REFERENCES assets(id) ON DELETE SET NULL,
  topic_id      UUID REFERENCES topics(id) ON DELETE SET NULL,
  clicks        INTEGER NOT NULL DEFAULT 0,
  impressions   INTEGER NOT NULL DEFAULT 0,
  position      REAL,                -- average ranking position for this query on this day
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, page_url, query)
);

CREATE INDEX idx_gsc_topic_date ON search_console_daily(topic_id, date);
CREATE INDEX idx_gsc_date ON search_console_daily USING BRIN(date);
CREATE INDEX idx_gsc_asset ON search_console_daily(asset_id);

COMMENT ON TABLE search_console_daily IS 'Google Search Console daily data: clicks, impressions, position per page × query. Primary seasonality signal. 16-month rolling window — capture daily or data is lost.';

-- ============================================================================
-- TABLE 5: keyword_metrics
-- Monthly keyword volumes from DataForSEO. Used for demand-gap analysis
-- (Ticket 58) and commercial-value scoring in sponsor evidence packs.
-- ============================================================================

CREATE TABLE keyword_metrics (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword        TEXT NOT NULL,
  topic_id       UUID REFERENCES topics(id) ON DELETE SET NULL,
  month          DATE NOT NULL,          -- first day of the month
  search_volume  INTEGER,               -- estimated monthly search volume
  cpc_cents      INTEGER,               -- cost-per-click in cents (commercial signal)
  competition    REAL,                   -- 0.0 to 1.0 paid competition index
  provider       TEXT NOT NULL DEFAULT 'dataforseo',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(keyword, month, provider)
);

CREATE INDEX idx_keyword_topic_month ON keyword_metrics(topic_id, month);

COMMENT ON TABLE keyword_metrics IS 'Monthly keyword volume and CPC data from DataForSEO. Feeds demand-gap analysis and commercial-value scoring.';

-- ============================================================================
-- TABLE 6: community_snapshots
-- Weekly manual entries for Skool community health. The "weekly ritual"
-- (Ticket 57) — Sarah or Anthony enters these every Monday morning.
-- ============================================================================

CREATE TABLE community_snapshots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community         TEXT NOT NULL CHECK (community IN ('free', 'ndy')),
  week_start        DATE NOT NULL,       -- Monday of the week
  total_members     INTEGER NOT NULL,
  new_members       INTEGER NOT NULL DEFAULT 0,
  churned_members   INTEGER NOT NULL DEFAULT 0,
  active_members    INTEGER,             -- NULL if not manually counted
  posts_count       INTEGER NOT NULL DEFAULT 0,
  comments_count    INTEGER NOT NULL DEFAULT 0,
  entered_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(community, week_start)
);

COMMENT ON TABLE community_snapshots IS 'Weekly Skool community metrics. Manual entry as Skool API is limited. Feeds community trend analysis.';

-- ============================================================================
-- TABLE 7: community_posts
-- Skool post titles with topic classification. Community discussions are a
-- leading indicator — members ask about creatine BEFORE they search for it.
-- ============================================================================

CREATE TABLE community_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community     TEXT NOT NULL CHECK (community IN ('free', 'ndy')),
  posted_at     DATE NOT NULL,
  title         TEXT NOT NULL,
  author_type   TEXT NOT NULL DEFAULT 'member',  -- 'member', 'admin', 'coach'
  topic_id      UUID REFERENCES topics(id) ON DELETE SET NULL,
  comments_count INTEGER DEFAULT 0,
  likes_count   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_posts_topic_date ON community_posts(topic_id, posted_at);
CREATE INDEX idx_community_posts_community ON community_posts(community);

COMMENT ON TABLE community_posts IS 'Skool community post titles, topic-classified. Leading demand indicator — community interest precedes search interest.';

-- ============================================================================
-- TABLE 8: revenue_events
-- Revenue attribution per event. Links revenue to products, assets, and topics
-- for ROI analysis and sponsor evidence packs.
-- ============================================================================

CREATE TABLE revenue_events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at           TIMESTAMPTZ NOT NULL,
  product_id            UUID REFERENCES products(id) ON DELETE SET NULL,
  amount_cents          INTEGER NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'USD',
  event_type            TEXT NOT NULL,     -- 'join', 'renewal', 'purchase', 'booking', 'churn'
  attributed_asset_id   UUID REFERENCES assets(id) ON DELETE SET NULL,
  attributed_topic_id   UUID REFERENCES topics(id) ON DELETE SET NULL,
  attribution_method    TEXT,              -- 'utm', 'survey', 'last_touch', 'manual'
  source_detail         JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_revenue_occurred ON revenue_events(occurred_at);
CREATE INDEX idx_revenue_topic ON revenue_events(attributed_topic_id);
CREATE INDEX idx_revenue_product ON revenue_events(product_id);

COMMENT ON TABLE revenue_events IS 'Revenue attribution events. Every join, renewal, purchase, booking, and churn event with product/topic/asset attribution.';
COMMENT ON COLUMN revenue_events.currency IS 'ISO 4217 currency code. USD for all products except Girona camps (EUR).';

-- ============================================================================
-- TABLE 9: calendar_events
-- External seasonal markers: race calendar, resolution periods, weather phases.
-- Used by the trend engine to correlate external events with topic interest
-- changes. Seeded with the cycling race calendar at migration time.
-- ============================================================================

CREATE TABLE calendar_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  event_type        calendar_event_type NOT NULL,
  starts_on         DATE NOT NULL,
  ends_on           DATE NOT NULL,
  recurs_annually   BOOLEAN NOT NULL DEFAULT TRUE,
  related_topic_ids UUID[] NOT NULL DEFAULT '{}',
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calendar_dates ON calendar_events(starts_on, ends_on);
CREATE INDEX idx_calendar_type ON calendar_events(event_type);

COMMENT ON TABLE calendar_events IS 'External events that affect content trends: Grand Tours, classics, New Year resolution period, tyre season, etc. Correlated with topic_daily_metrics to explain spikes.';

-- ============================================================================
-- TABLE 10: topic_daily_metrics
-- The CORE FACT TABLE. One row per date × topic × platform.
-- NULL source = all-platform rollup.
-- Aggregated from performance_daily + search_console_daily + community_posts
-- by the pg_cron aggregation function (Ticket 59).
-- ============================================================================

CREATE TABLE topic_daily_metrics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id            UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source              metric_source,      -- NULL = all-platform rollup
  date                DATE NOT NULL,
  live_asset_count    INTEGER NOT NULL DEFAULT 0,
  views               BIGINT NOT NULL DEFAULT 0,
  engagement          BIGINT NOT NULL DEFAULT 0,  -- likes + comments + shares + saves
  search_clicks       INTEGER NOT NULL DEFAULT 0,
  search_impressions  BIGINT NOT NULL DEFAULT 0,
  email_opens         INTEGER NOT NULL DEFAULT 0,
  email_clicks        INTEGER NOT NULL DEFAULT 0,
  community_posts     INTEGER NOT NULL DEFAULT 0,
  revenue_cents       INTEGER NOT NULL DEFAULT 0,
  -- normalised interest relative to this topic's annual average
  -- 1.0 = average day, 3.2 = 3.2× average
  relative_interest   REAL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (topic_id, source, date)
);

CREATE INDEX idx_tdm_topic_date ON topic_daily_metrics(topic_id, date);
CREATE INDEX idx_tdm_date ON topic_daily_metrics USING BRIN(date);
CREATE INDEX idx_tdm_source ON topic_daily_metrics(source);

COMMENT ON TABLE topic_daily_metrics IS 'Core fact table: daily engagement per topic per platform. Feeds seasonal_indices computation. NULL source rows are all-platform rollups.';
COMMENT ON COLUMN topic_daily_metrics.relative_interest IS 'Normalised: 1.0 = this topic''s annual average day. Values above 1.0 indicate above-average interest.';

-- ============================================================================
-- TABLE 11: seasonal_indices
-- ISO-week seasonal multipliers with confidence scoring.
-- Computed weekly by pg_cron from topic_daily_metrics (Ticket 60).
-- Confidence: 0-100, four tiers: noise/emerging/probable/established.
-- Only "established" indices appear in sponsor evidence packs.
-- ============================================================================

CREATE TABLE seasonal_indices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id          UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source            metric_source,       -- NULL = all-platform
  metric            TEXT NOT NULL,        -- 'views', 'search_impressions', 'engagement', etc.
  iso_week          SMALLINT NOT NULL CHECK (iso_week BETWEEN 1 AND 53),
  index_value       REAL NOT NULL,        -- 1.0 = average; 3.2 = 3.2× average
  per_year_values   JSONB NOT NULL DEFAULT '{}',  -- {"2023": 2.8, "2024": 3.4, "2025": 3.1}
  years_observed    SMALLINT NOT NULL,
  sample_assets     INTEGER NOT NULL,
  -- Confidence scoring: 0-100
  -- Components: years_observed (30%), consistency (30%), sample_depth (20%), cross_signal (20%)
  confidence_score  REAL NOT NULL,
  confidence        trend_confidence NOT NULL,
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (topic_id, source, metric, iso_week)
);

CREATE INDEX idx_seasonal_topic ON seasonal_indices(topic_id, metric);
CREATE INDEX idx_seasonal_confidence ON seasonal_indices(confidence, index_value);
CREATE INDEX idx_seasonal_week ON seasonal_indices(iso_week);

COMMENT ON TABLE seasonal_indices IS 'ISO-week seasonal multipliers per topic. Index of 3.2 for creatine in week 3 means 3.2× average engagement. Only "established" confidence tier used in sponsor decks.';
COMMENT ON COLUMN seasonal_indices.confidence_score IS '0-100 composite: years_observed 30%, consistency 30%, sample_depth 20%, cross_signal_corroboration 20%';

-- ============================================================================
-- TABLE 12: anomalies
-- Detected anomalies — unexpected spikes or drops beyond seasonal expectation.
-- Detected by robust z-scores (median/MAD, not mean/stddev) against the
-- seasonal baseline (Ticket 62).
-- ============================================================================

CREATE TABLE anomalies (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id              UUID REFERENCES topics(id) ON DELETE SET NULL,
  asset_id              UUID REFERENCES assets(id) ON DELETE SET NULL,
  source                metric_source,
  detected_on           DATE NOT NULL,
  metric                TEXT NOT NULL,
  expected_value        REAL NOT NULL,     -- seasonal baseline prediction
  actual_value          REAL NOT NULL,     -- what actually happened
  z_score               REAL NOT NULL,     -- robust z-score (median/MAD based)
  direction             TEXT NOT NULL CHECK (direction IN ('above', 'below')),
  is_acknowledged       BOOLEAN NOT NULL DEFAULT FALSE,
  promoted_insight_id   UUID,              -- FK added after insights table created
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- At least one of topic_id or asset_id must be set
  CHECK (topic_id IS NOT NULL OR asset_id IS NOT NULL)
);

CREATE INDEX idx_anomalies_detected ON anomalies(detected_on, is_acknowledged);
CREATE INDEX idx_anomalies_topic ON anomalies(topic_id);

COMMENT ON TABLE anomalies IS 'Detected deviations from seasonal baseline. Robust z-scores (median/MAD) > 2.5 trigger anomaly records. Can be promoted to insights.';

-- ============================================================================
-- TABLE 13: forecasts
-- Seasonal-naive-with-drift predictions that grade their own accuracy.
-- Generated weekly by pg_cron (Ticket 63). After the target week passes,
-- actual_value is backfilled and abs_pct_error (MAPE component) is computed.
-- ============================================================================

CREATE TABLE forecasts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id        UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source          metric_source,
  metric          TEXT NOT NULL,
  target_week     DATE NOT NULL,          -- Monday of the target week
  forecast_value  REAL NOT NULL,
  lower_bound     REAL,                   -- prediction interval lower
  upper_bound     REAL,                   -- prediction interval upper
  actual_value    REAL,                   -- backfilled after the week passes
  abs_pct_error   REAL,                   -- |actual - forecast| / actual — MAPE component
  model           TEXT NOT NULL DEFAULT 'seasonal_naive_drift',
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (topic_id, source, metric, target_week, model)
);

CREATE INDEX idx_forecasts_target ON forecasts(target_week);
CREATE INDEX idx_forecasts_topic ON forecasts(topic_id);

COMMENT ON TABLE forecasts IS 'Forward-looking predictions: seasonal baseline + year-over-year drift. Self-grading — actual_value and abs_pct_error backfilled after target_week passes.';

-- ============================================================================
-- TABLE 14: insights
-- Generated insights with review workflow. Every number is SQL-computed,
-- never LLM-generated. Status flow: candidate → validated → actioned/dismissed.
-- Only "established" confidence insights with sponsor_safe = TRUE appear
-- in sponsor evidence packs.
-- ============================================================================

CREATE TABLE insights (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                  insight_type NOT NULL,
  status                insight_status NOT NULL DEFAULT 'candidate',
  statement             TEXT NOT NULL,        -- plain-English: "Creatine content peaks 3.2× in January for males 35-50"
  topic_id              UUID REFERENCES topics(id) ON DELETE SET NULL,
  commercial_category   TEXT,                 -- links to topics.commercial_category
  evidence              JSONB NOT NULL DEFAULT '{}',  -- structured evidence supporting the statement
  confidence_score      REAL NOT NULL,        -- 0-100
  confidence            trend_confidence NOT NULL,
  valid_from            DATE,                 -- insight validity window
  valid_until           DATE,
  reviewed_by           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at           TIMESTAMPTZ,
  actioned_asset_id     UUID REFERENCES assets(id) ON DELETE SET NULL,
  sponsor_safe          BOOLEAN NOT NULL DEFAULT FALSE,  -- safe for external sponsor decks
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_insights_status_type ON insights(status, type);
CREATE INDEX idx_insights_topic ON insights(topic_id);
CREATE INDEX idx_insights_confidence ON insights(confidence);
CREATE INDEX idx_insights_sponsor ON insights(sponsor_safe) WHERE sponsor_safe = TRUE;

COMMENT ON TABLE insights IS 'Machine-generated insights from the trend engine. All numbers are SQL-computed, never LLM-hallucinated. Review workflow ensures human validation before external use.';

-- ============================================================================
-- TABLE 15: audience_segments
-- Behavioural clusters discovered from engagement patterns.
-- Computed by the segment discovery pipeline (Ticket 68).
-- ============================================================================

CREATE TABLE audience_segments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  description       TEXT,
  discovery_method  TEXT NOT NULL DEFAULT 'kmeans_topic_affinity',
  member_count      INTEGER NOT NULL DEFAULT 0,
  topic_affinities  JSONB NOT NULL DEFAULT '{}',   -- {"supplements": 0.8, "indoor_training": 0.6}
  seasonal_profile  JSONB NOT NULL DEFAULT '{}',   -- engagement pattern by month
  revenue_rate      REAL,                          -- average revenue per member
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audience_segments IS 'Behavioural audience clusters. Topic affinities and seasonal profiles used for content targeting and sponsor evidence.';

-- ============================================================================
-- TABLE 16: segment_members
-- Junction: segments ↔ hashed member keys.
-- Privacy-preserving — no raw emails stored, only SHA-256 hashes.
-- ============================================================================

CREATE TABLE segment_members (
  segment_id    UUID NOT NULL REFERENCES audience_segments(id) ON DELETE CASCADE,
  member_key    TEXT NOT NULL,         -- SHA-256 hashed email
  member_source TEXT NOT NULL,         -- 'beehiiv', 'skool'
  affinity      REAL NOT NULL,         -- 0.0 to 1.0 — strength of membership in this segment
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (segment_id, member_key)
);

CREATE INDEX idx_segment_members_key ON segment_members(member_key);

COMMENT ON TABLE segment_members IS 'Privacy-preserving segment membership. Member keys are SHA-256 hashed emails. Affinity score indicates strength of cluster membership.';

-- ============================================================================
-- TABLE 17: data_quality_log
-- Monitors data freshness and integrity. The quality watchdog (Ticket 72)
-- writes daily checks here and alerts when something goes stale or breaks.
-- ============================================================================

CREATE TABLE data_quality_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_name    TEXT NOT NULL,         -- 'gsc_freshness', 'youtube_sync_gap', 'delta_consistency'
  status        TEXT NOT NULL,         -- 'pass', 'warn', 'fail'
  details       JSONB NOT NULL DEFAULT '{}',
  checked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dq_check ON data_quality_log(check_name, checked_at);
CREATE INDEX idx_dq_status ON data_quality_log(status) WHERE status != 'pass';

COMMENT ON TABLE data_quality_log IS 'Daily data quality checks. Monitors sync freshness, delta consistency, schema drift, and coverage gaps. Alerting triggered on consecutive failures.';

-- ============================================================================
-- DEFERRED FOREIGN KEYS (cross-table references created after both tables exist)
-- ============================================================================

ALTER TABLE anomalies
  ADD CONSTRAINT fk_anomalies_promoted_insight
  FOREIGN KEY (promoted_insight_id) REFERENCES insights(id) ON DELETE SET NULL;

-- ============================================================================
-- ADDITIONAL INDEXES (not covered by unique constraints)
-- ============================================================================

-- GSC query text lookups for keyword analysis
CREATE INDEX idx_gsc_query ON search_console_daily(lower(query));

-- Community posts standalone date range queries
CREATE INDEX idx_community_posts_date ON community_posts USING BRIN(posted_at);

-- Revenue events by asset attribution
CREATE INDEX idx_revenue_asset ON revenue_events(attributed_asset_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on insights (uses existing function from 00001)
CREATE TRIGGER set_updated_at BEFORE UPDATE ON insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- All intelligence tables follow the same pattern as core tables:
-- authenticated users with valid session can read; writes restricted to
-- system processes (service role) and admin users.
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE topic_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_console_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_log ENABLE ROW LEVEL SECURITY;

-- Read policies: all authenticated users can read all intelligence data
CREATE POLICY "Authenticated users can read topic_aliases" ON topic_aliases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read performance_daily" ON performance_daily FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read audience_demographics" ON audience_demographics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read search_console_daily" ON search_console_daily FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read keyword_metrics" ON keyword_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read community_snapshots" ON community_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read community_posts" ON community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read revenue_events" ON revenue_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read calendar_events" ON calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read topic_daily_metrics" ON topic_daily_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read seasonal_indices" ON seasonal_indices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read anomalies" ON anomalies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read forecasts" ON forecasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read insights" ON insights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read audience_segments" ON audience_segments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read segment_members" ON segment_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read data_quality_log" ON data_quality_log FOR SELECT TO authenticated USING (true);

-- Write policies: service_role (cron jobs, sync handlers) can write to all tables
-- Admin users can also write to manual-entry tables
CREATE POLICY "Service role can insert performance_daily" ON performance_daily FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert audience_demographics" ON audience_demographics FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert search_console_daily" ON search_console_daily FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert keyword_metrics" ON keyword_metrics FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert topic_daily_metrics" ON topic_daily_metrics FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert seasonal_indices" ON seasonal_indices FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert anomalies" ON anomalies FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert forecasts" ON forecasts FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert insights" ON insights FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert audience_segments" ON audience_segments FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert segment_members" ON segment_members FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert data_quality_log" ON data_quality_log FOR INSERT TO service_role WITH CHECK (true);

-- Manual-entry tables: authenticated users with appropriate role can write
CREATE POLICY "Authenticated users can insert community_snapshots" ON community_snapshots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert community_posts" ON community_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert revenue_events" ON revenue_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert calendar_events" ON calendar_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert topic_aliases" ON topic_aliases FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies for review workflows
CREATE POLICY "Authenticated users can update insights" ON insights FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can update anomalies" ON anomalies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Service role insert for auto-generated aliases (topic classifier, Ticket 56)
CREATE POLICY "Service role can insert topic_aliases" ON topic_aliases FOR INSERT TO service_role WITH CHECK (true);

-- Service role update policies (for backfill, recomputation)
CREATE POLICY "Service role can update performance_daily" ON performance_daily FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can update forecasts" ON forecasts FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can update topic_daily_metrics" ON topic_daily_metrics FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can update seasonal_indices" ON seasonal_indices FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can update audience_segments" ON audience_segments FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can update insights" ON insights FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- Service role delete policies (for recomputation — delete stale rows before re-inserting)
CREATE POLICY "Service role can delete topic_daily_metrics" ON topic_daily_metrics FOR DELETE TO service_role USING (true);
CREATE POLICY "Service role can delete seasonal_indices" ON seasonal_indices FOR DELETE TO service_role USING (true);
CREATE POLICY "Service role can delete forecasts" ON forecasts FOR DELETE TO service_role USING (true);
CREATE POLICY "Service role can delete audience_segments" ON audience_segments FOR DELETE TO service_role USING (true);
CREATE POLICY "Service role can delete segment_members" ON segment_members FOR DELETE TO service_role USING (true);
CREATE POLICY "Service role can delete data_quality_log" ON data_quality_log FOR DELETE TO service_role USING (true);

-- ============================================================================
-- SEED DATA: Calendar events for cycling season
-- ============================================================================

INSERT INTO calendar_events (name, event_type, starts_on, ends_on, recurs_annually, notes) VALUES
  ('New Year Resolution Period', 'resolution_period', '2026-01-01', '2026-02-15', true, 'Peak fitness/supplement/training plan interest'),
  ('Spring Training Ramp', 'weather_phase', '2026-03-01', '2026-04-30', true, 'Northern hemisphere riders starting outdoor season'),
  ('Milan–San Remo', 'classic', '2026-03-21', '2026-03-21', true, 'First monument'),
  ('Tour of Flanders', 'classic', '2026-04-05', '2026-04-05', true, 'Cobbled classic'),
  ('Paris–Roubaix', 'classic', '2026-04-12', '2026-04-12', true, 'Hell of the North — tyre/equipment interest spike'),
  ('Liège–Bastogne–Liège', 'classic', '2026-04-26', '2026-04-26', true, 'Ardennes classic'),
  ('Giro d''Italia', 'grand_tour', '2026-05-09', '2026-06-01', true, 'First Grand Tour of the season'),
  ('Sportive Season Peak', 'sportive_season', '2026-05-01', '2026-09-30', true, 'Peak sportive/gran fondo period — training plan and nutrition interest'),
  ('Tour de France', 'grand_tour', '2026-07-04', '2026-07-26', true, 'Biggest event in cycling — peak overall interest'),
  ('Vuelta a España', 'grand_tour', '2026-08-15', '2026-09-07', true, 'Third Grand Tour'),
  ('Il Lombardia', 'classic', '2026-10-11', '2026-10-11', true, 'Race of the Falling Leaves — last monument'),
  ('Indoor Training Season', 'weather_phase', '2026-11-01', '2027-02-28', true, 'Northern hemisphere indoor pivot — Zwift/TrainingPeaks Virtual interest'),
  ('Etape du Tour Registration', 'sportive_season', '2026-10-01', '2026-11-30', true, 'Registration window — training plan interest spike'),
  ('Roadman Girona Camp — Road', 'roadman_event', '2026-10-05', '2026-10-09', true, 'Roadman road training camp, Can Sagnari'),
  ('Roadman Girona Camp — Gravel', 'roadman_event', '2026-10-12', '2026-10-16', true, 'Roadman gravel training camp, Can Sagnari'),
  ('Black Friday/Cyber Monday', 'industry_launch', '2026-11-27', '2026-11-30', true, 'Equipment purchase peak — review/comparison content interest');
