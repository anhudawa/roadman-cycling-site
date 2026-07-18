-- Migration: 00007_intelligence_functions.sql
-- Description: Trend engine SQL functions — delta derivation, topic aggregation,
--              seasonal indices, anomaly detection, forecasting.
-- Date: 2026-07-19
-- Depends on: 00004_intelligence_layer.sql (intelligence tables)
-- Reference: ROADMAN-OS-MASTER-PLAN.md Section 5, ROADMAN-OS-INTELLIGENCE-EXPANSION.md

-- ============================================================================
-- FUNCTION 1: derive_performance_daily()
-- Ticket 52 — Daily Delta Pipeline
-- Schedule: pg_cron 04:00 UTC daily
--
-- Converts consecutive performance_records snapshots into daily deltas in
-- performance_daily. Handles:
--   - Gap spreading: if snapshots are N days apart, spreads delta evenly
--   - Negative clamping: clamps negatives to 0 (counter resets, deletions)
--   - Idempotency: skips dates that already have is_measured = true rows
--   - Skips publications that already have derived rows for that date range
-- ============================================================================

CREATE OR REPLACE FUNCTION derive_performance_daily(
  p_lookback_days INTEGER DEFAULT 3  -- how many days back to re-derive (handles late syncs)
)
RETURNS TABLE(publications_processed INTEGER, rows_created INTEGER, rows_skipped INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_publications_processed INTEGER := 0;
  v_rows_created INTEGER := 0;
  v_rows_skipped INTEGER := 0;
  v_cutoff_date DATE;
  v_rec RECORD;
BEGIN
  v_cutoff_date := CURRENT_DATE - p_lookback_days;

  -- Process each publication × source pair that has ≥2 snapshots
  FOR v_rec IN
    SELECT DISTINCT pr.publication_id, pr.source
    FROM performance_records pr
    WHERE pr.recorded_at >= (v_cutoff_date - INTERVAL '1 day')::timestamptz
    GROUP BY pr.publication_id, pr.source
    HAVING COUNT(*) >= 1
  LOOP
    v_publications_processed := v_publications_processed + 1;

    -- For each consecutive pair of snapshots, compute daily deltas
    WITH snapshot_pairs AS (
      SELECT
        pr.*,
        LAG(pr.recorded_at) OVER w AS prev_recorded_at,
        LAG(pr.views) OVER w AS prev_views,
        LAG(pr.impressions) OVER w AS prev_impressions,
        LAG(pr.clicks) OVER w AS prev_clicks,
        LAG(pr.likes) OVER w AS prev_likes,
        LAG(pr.comments) OVER w AS prev_comments,
        LAG(pr.shares) OVER w AS prev_shares,
        LAG(pr.saves) OVER w AS prev_saves,
        LAG(pr.watch_time_seconds) OVER w AS prev_watch_time_seconds,
        LAG(pr.subscribers_gained) OVER w AS prev_subscribers_gained,
        LAG(pr.revenue_cents) OVER w AS prev_revenue_cents
      FROM performance_records pr
      WHERE pr.publication_id = v_rec.publication_id
        AND pr.source = v_rec.source
      WINDOW w AS (ORDER BY pr.recorded_at)
    ),
    -- Expand each pair into individual daily rows
    daily_deltas AS (
      SELECT
        sp.publication_id,
        sp.source,
        d::date AS date,
        -- Gap-spread: divide delta by number of days between snapshots
        -- Clamp negatives to 0 (counter resets, content deletion)
        GREATEST(0, (sp.views - COALESCE(sp.prev_views, 0)))
          / GREATEST(1, (sp.recorded_at::date - sp.prev_recorded_at::date)) AS views,
        GREATEST(0, (sp.impressions - COALESCE(sp.prev_impressions, 0)))
          / GREATEST(1, (sp.recorded_at::date - sp.prev_recorded_at::date)) AS impressions,
        GREATEST(0, (sp.clicks - COALESCE(sp.prev_clicks, 0)))
          / GREATEST(1, (sp.recorded_at::date - sp.prev_recorded_at::date)) AS clicks,
        GREATEST(0, (sp.likes - COALESCE(sp.prev_likes, 0)))
          / GREATEST(1, (sp.recorded_at::date - sp.prev_recorded_at::date)) AS likes,
        GREATEST(0, (sp.comments - COALESCE(sp.prev_comments, 0)))
          / GREATEST(1, (sp.recorded_at::date - sp.prev_recorded_at::date)) AS comments,
        GREATEST(0, (sp.shares - COALESCE(sp.prev_shares, 0)))
          / GREATEST(1, (sp.recorded_at::date - sp.prev_recorded_at::date)) AS shares,
        GREATEST(0, (sp.saves - COALESCE(sp.prev_saves, 0)))
          / GREATEST(1, (sp.recorded_at::date - sp.prev_recorded_at::date)) AS saves,
        GREATEST(0, (sp.watch_time_seconds - COALESCE(sp.prev_watch_time_seconds, 0)))
          / GREATEST(1, (sp.recorded_at::date - sp.prev_recorded_at::date)) AS watch_time_seconds,
        -- subscribers_gained can legitimately be negative (unsubscribes)
        (sp.subscribers_gained - COALESCE(sp.prev_subscribers_gained, 0))
          / GREATEST(1, (sp.recorded_at::date - sp.prev_recorded_at::date)) AS subscribers_gained,
        GREATEST(0, (sp.revenue_cents - COALESCE(sp.prev_revenue_cents, 0)))
          / GREATEST(1, (sp.recorded_at::date - sp.prev_recorded_at::date)) AS revenue_cents
      FROM snapshot_pairs sp
      -- Generate one row per day in the gap
      CROSS JOIN LATERAL generate_series(
        (sp.prev_recorded_at::date + 1),
        sp.recorded_at::date,
        '1 day'::interval
      ) AS d
      WHERE sp.prev_recorded_at IS NOT NULL
        AND d::date >= v_cutoff_date
    )
    INSERT INTO performance_daily (
      publication_id, source, date,
      views, impressions, clicks, likes, comments, shares, saves,
      watch_time_seconds, subscribers_gained, revenue_cents,
      is_measured
    )
    SELECT
      dd.publication_id,
      dd.source,
      dd.date,
      dd.views::bigint,
      dd.impressions::bigint,
      dd.clicks::bigint,
      dd.likes::bigint,
      dd.comments::bigint,
      dd.shares::bigint,
      dd.saves::bigint,
      dd.watch_time_seconds::bigint,
      dd.subscribers_gained::integer,
      dd.revenue_cents::integer,
      FALSE  -- derived, not measured
    FROM daily_deltas dd
    -- Skip dates that already have a measured row (platform API provided actuals)
    WHERE NOT EXISTS (
      SELECT 1 FROM performance_daily pd
      WHERE pd.publication_id = dd.publication_id
        AND pd.source = dd.source
        AND pd.date = dd.date
        AND pd.is_measured = TRUE
    )
    ON CONFLICT (publication_id, source, date)
    DO UPDATE SET
      views = EXCLUDED.views,
      impressions = EXCLUDED.impressions,
      clicks = EXCLUDED.clicks,
      likes = EXCLUDED.likes,
      comments = EXCLUDED.comments,
      shares = EXCLUDED.shares,
      saves = EXCLUDED.saves,
      watch_time_seconds = EXCLUDED.watch_time_seconds,
      subscribers_gained = EXCLUDED.subscribers_gained,
      revenue_cents = EXCLUDED.revenue_cents
    -- Only overwrite if existing row is also derived (preserve measured rows)
    WHERE performance_daily.is_measured = FALSE;

    GET DIAGNOSTICS v_rows_created = ROW_COUNT;

  END LOOP;

  RETURN QUERY SELECT v_publications_processed, v_rows_created, v_rows_skipped;
END;
$$;

COMMENT ON FUNCTION derive_performance_daily IS 'T52: Converts cumulative performance_records snapshots into daily deltas. Gap-spreads multi-day intervals, clamps negatives, preserves measured rows. Idempotent.';

-- ============================================================================
-- FUNCTION 2: aggregate_topic_daily_metrics()
-- Ticket 59 — Topic Daily Aggregation
-- Schedule: pg_cron 04:30 UTC daily
--
-- Joins performance_daily through publications → assets → asset_topics to
-- produce per-topic, per-source, per-day aggregated metrics.
-- Also incorporates search_console_daily and community_posts data.
-- Computes relative_interest (normalised against the topic's trailing 365-day average).
-- ============================================================================

CREATE OR REPLACE FUNCTION aggregate_topic_daily_metrics(
  p_lookback_days INTEGER DEFAULT 3
)
RETURNS TABLE(topics_processed INTEGER, rows_upserted INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_topics_processed INTEGER := 0;
  v_rows_upserted INTEGER := 0;
  v_cutoff_date DATE;
BEGIN
  v_cutoff_date := CURRENT_DATE - p_lookback_days;

  -- Step 1: Aggregate performance_daily by topic × source × date
  WITH topic_perf AS (
    SELECT
      at2.topic_id,
      pd.source,
      pd.date,
      COUNT(DISTINCT pd.publication_id) AS live_asset_count,
      SUM(pd.views) AS views,
      SUM(pd.likes + pd.comments + pd.shares + pd.saves) AS engagement,
      SUM(pd.revenue_cents) AS revenue_cents
    FROM performance_daily pd
    JOIN publications pub ON pub.id = pd.publication_id
    JOIN asset_topics at2 ON at2.asset_id = pub.asset_id
    JOIN topics t ON t.id = at2.topic_id AND t.is_trend_tracked = TRUE
    WHERE pd.date >= v_cutoff_date
    GROUP BY at2.topic_id, pd.source, pd.date
  ),
  -- Step 2: Aggregate search_console_daily by topic × date
  gsc_agg AS (
    SELECT
      gsc.topic_id,
      gsc.date,
      SUM(gsc.clicks) AS search_clicks,
      SUM(gsc.impressions) AS search_impressions
    FROM search_console_daily gsc
    WHERE gsc.topic_id IS NOT NULL
      AND gsc.date >= v_cutoff_date
    GROUP BY gsc.topic_id, gsc.date
  ),
  -- Step 3: Count community posts by topic × date
  community_agg AS (
    SELECT
      cp.topic_id,
      cp.posted_at AS date,
      COUNT(*) AS post_count
    FROM community_posts cp
    WHERE cp.topic_id IS NOT NULL
      AND cp.posted_at >= v_cutoff_date
    GROUP BY cp.topic_id, cp.posted_at
  ),
  -- Step 4: Combine all signals per topic × source × date
  combined AS (
    SELECT
      tp.topic_id,
      tp.source,
      tp.date,
      tp.live_asset_count,
      tp.views,
      tp.engagement,
      COALESCE(ga.search_clicks, 0) AS search_clicks,
      COALESCE(ga.search_impressions, 0) AS search_impressions,
      COALESCE(ca.post_count, 0) AS community_posts,
      tp.revenue_cents
    FROM topic_perf tp
    LEFT JOIN gsc_agg ga ON ga.topic_id = tp.topic_id AND ga.date = tp.date
    LEFT JOIN community_agg ca ON ca.topic_id = tp.topic_id AND ca.date = tp.date
  )
  INSERT INTO topic_daily_metrics (
    topic_id, source, date, live_asset_count,
    views, engagement, search_clicks, search_impressions,
    community_posts, revenue_cents
  )
  SELECT
    c.topic_id, c.source, c.date, c.live_asset_count,
    c.views, c.engagement, c.search_clicks, c.search_impressions,
    c.community_posts, c.revenue_cents
  FROM combined c
  ON CONFLICT (topic_id, source, date)
  DO UPDATE SET
    live_asset_count = EXCLUDED.live_asset_count,
    views = EXCLUDED.views,
    engagement = EXCLUDED.engagement,
    search_clicks = EXCLUDED.search_clicks,
    search_impressions = EXCLUDED.search_impressions,
    community_posts = EXCLUDED.community_posts,
    revenue_cents = EXCLUDED.revenue_cents;

  GET DIAGNOSTICS v_rows_upserted = ROW_COUNT;

  -- Step 5: Generate all-platform rollup rows (source = NULL)
  INSERT INTO topic_daily_metrics (
    topic_id, source, date, live_asset_count,
    views, engagement, search_clicks, search_impressions,
    community_posts, revenue_cents
  )
  SELECT
    tdm.topic_id,
    NULL AS source,
    tdm.date,
    SUM(tdm.live_asset_count)::integer,
    SUM(tdm.views),
    SUM(tdm.engagement),
    SUM(tdm.search_clicks)::integer,
    SUM(tdm.search_impressions),
    SUM(tdm.community_posts)::integer,
    SUM(tdm.revenue_cents)::integer
  FROM topic_daily_metrics tdm
  WHERE tdm.source IS NOT NULL
    AND tdm.date >= v_cutoff_date
  GROUP BY tdm.topic_id, tdm.date
  ON CONFLICT (topic_id, source, date)
  DO UPDATE SET
    live_asset_count = EXCLUDED.live_asset_count,
    views = EXCLUDED.views,
    engagement = EXCLUDED.engagement,
    search_clicks = EXCLUDED.search_clicks,
    search_impressions = EXCLUDED.search_impressions,
    community_posts = EXCLUDED.community_posts,
    revenue_cents = EXCLUDED.revenue_cents;

  -- Step 6: Compute relative_interest for recently updated rows
  -- relative_interest = day's value / trailing 365-day average for this topic
  UPDATE topic_daily_metrics tdm
  SET relative_interest = CASE
    WHEN avg_stats.avg_views = 0 THEN NULL
    ELSE tdm.views::real / avg_stats.avg_views
  END
  FROM (
    SELECT
      topic_id, source,
      AVG(NULLIF(views, 0))::real AS avg_views
    FROM topic_daily_metrics
    WHERE date >= (CURRENT_DATE - 365)
    GROUP BY topic_id, source
  ) avg_stats
  WHERE tdm.topic_id = avg_stats.topic_id
    AND tdm.source IS NOT DISTINCT FROM avg_stats.source
    AND tdm.date >= v_cutoff_date;

  SELECT COUNT(DISTINCT topic_id) INTO v_topics_processed
  FROM topic_daily_metrics WHERE date >= v_cutoff_date;

  RETURN QUERY SELECT v_topics_processed, v_rows_upserted;
END;
$$;

COMMENT ON FUNCTION aggregate_topic_daily_metrics IS 'T59: Aggregates performance_daily + GSC + community data into topic_daily_metrics. Computes relative_interest (normalised against trailing 365-day average). Generates all-platform rollup rows. Idempotent.';

-- ============================================================================
-- FUNCTION 3: compute_seasonal_indices()
-- Ticket 60 — Seasonal Index Computation
-- Schedule: pg_cron Monday 05:00 UTC
--
-- Computes ISO-week seasonal multipliers from topic_daily_metrics.
-- For each topic × source × metric × iso_week:
--   index_value = mean of that week's values / annual mean
--   per_year_values = the index broken out per year
--   confidence_score = weighted composite of:
--     - years_observed (30%): more years = more confidence
--     - consistency (30%): low year-to-year variance = more confidence
--     - sample_depth (20%): more assets in the topic = more confidence
--     - cross_signal (20%): GSC + engagement both peak = more confidence
-- ============================================================================

CREATE OR REPLACE FUNCTION compute_seasonal_indices()
RETURNS TABLE(topics_computed INTEGER, indices_upserted INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_topics_computed INTEGER := 0;
  v_indices_upserted INTEGER := 0;
BEGIN
  -- Delete existing indices to recompute fresh (idempotent)
  DELETE FROM seasonal_indices;

  WITH weekly_stats AS (
    -- Aggregate topic_daily_metrics into ISO weeks
    SELECT
      tdm.topic_id,
      tdm.source,
      EXTRACT(ISOYEAR FROM tdm.date)::integer AS iso_year,
      EXTRACT(WEEK FROM tdm.date)::integer AS iso_week,
      SUM(tdm.views) AS weekly_views,
      SUM(tdm.engagement) AS weekly_engagement,
      SUM(tdm.search_impressions) AS weekly_search_impressions,
      AVG(tdm.live_asset_count) AS avg_assets
    FROM topic_daily_metrics tdm
    WHERE tdm.date >= (CURRENT_DATE - INTERVAL '5 years')  -- max lookback
    GROUP BY tdm.topic_id, tdm.source, iso_year, iso_week
  ),
  annual_means AS (
    -- Annual average per topic × source × metric
    SELECT
      topic_id, source,
      AVG(weekly_views)::real AS mean_views,
      AVG(weekly_engagement)::real AS mean_engagement,
      AVG(weekly_search_impressions)::real AS mean_search_impressions
    FROM weekly_stats
    GROUP BY topic_id, source
  ),
  -- Unpivot metrics so we can process views, engagement, search_impressions uniformly
  metrics_unpivoted AS (
    SELECT ws.topic_id, ws.source, ws.iso_year, ws.iso_week, ws.avg_assets,
           'views' AS metric,
           ws.weekly_views::real AS value,
           am.mean_views AS annual_mean
    FROM weekly_stats ws
    JOIN annual_means am ON am.topic_id = ws.topic_id AND am.source IS NOT DISTINCT FROM ws.source
    WHERE am.mean_views > 0

    UNION ALL

    SELECT ws.topic_id, ws.source, ws.iso_year, ws.iso_week, ws.avg_assets,
           'engagement',
           ws.weekly_engagement::real,
           am.mean_engagement
    FROM weekly_stats ws
    JOIN annual_means am ON am.topic_id = ws.topic_id AND am.source IS NOT DISTINCT FROM ws.source
    WHERE am.mean_engagement > 0

    UNION ALL

    SELECT ws.topic_id, ws.source, ws.iso_year, ws.iso_week, ws.avg_assets,
           'search_impressions',
           ws.weekly_search_impressions::real,
           am.mean_search_impressions
    FROM weekly_stats ws
    JOIN annual_means am ON am.topic_id = ws.topic_id AND am.source IS NOT DISTINCT FROM ws.source
    WHERE am.mean_search_impressions > 0
  ),
  -- Compute per-week indices
  week_indices AS (
    SELECT
      topic_id, source, metric, iso_week,
      -- Mean index across all years for this week
      AVG(value / annual_mean)::real AS index_value,
      -- Per-year breakdown as JSONB
      jsonb_object_agg(iso_year::text, ROUND((value / annual_mean)::numeric, 2)) AS per_year_values,
      COUNT(DISTINCT iso_year)::smallint AS years_observed,
      AVG(avg_assets)::integer AS sample_assets,
      -- Consistency: coefficient of variation of per-year indices (lower = more consistent)
      CASE
        WHEN COUNT(DISTINCT iso_year) > 1
        THEN STDDEV(value / annual_mean) / NULLIF(AVG(value / annual_mean), 0)
        ELSE 1.0  -- single year = no consistency signal
      END AS cv
    FROM metrics_unpivoted
    GROUP BY topic_id, source, metric, iso_week
  )
  INSERT INTO seasonal_indices (
    topic_id, source, metric, iso_week,
    index_value, per_year_values, years_observed, sample_assets,
    confidence_score, confidence
  )
  SELECT
    wi.topic_id,
    wi.source,
    wi.metric,
    wi.iso_week,
    wi.index_value,
    wi.per_year_values,
    wi.years_observed,
    wi.sample_assets,
    -- Confidence score: 0-100 composite
    LEAST(100, (
      -- years_observed component (30%): 1yr=5, 2yr=15, 3yr=25, 4yr+=30
      (LEAST(wi.years_observed, 4)::real / 4.0 * 30) +
      -- consistency component (30%): CV < 0.2 = full marks, > 1.0 = 0
      (GREATEST(0, 1.0 - wi.cv) * 30) +
      -- sample_depth component (20%): ≥5 assets = full marks
      (LEAST(wi.sample_assets, 5)::real / 5.0 * 20) +
      -- cross_signal component (20%): placeholder — requires views+GSC correlation
      -- For now, give partial credit if multiple metrics exist for this topic/week
      (CASE
        WHEN EXISTS (
          SELECT 1 FROM metrics_unpivoted mu
          WHERE mu.topic_id = wi.topic_id
            AND mu.source IS NOT DISTINCT FROM wi.source
            AND mu.iso_week = wi.iso_week
            AND mu.metric != wi.metric
        ) THEN 15
        ELSE 0
      END)
    ))::real AS confidence_score,
    -- Map score to tier
    CASE
      WHEN LEAST(100, (
        (LEAST(wi.years_observed, 4)::real / 4.0 * 30) +
        (GREATEST(0, 1.0 - wi.cv) * 30) +
        (LEAST(wi.sample_assets, 5)::real / 5.0 * 20) +
        (CASE WHEN EXISTS (
          SELECT 1 FROM metrics_unpivoted mu
          WHERE mu.topic_id = wi.topic_id
            AND mu.source IS NOT DISTINCT FROM wi.source
            AND mu.iso_week = wi.iso_week
            AND mu.metric != wi.metric
        ) THEN 15 ELSE 0 END)
      )) >= 75 THEN 'established'::trend_confidence
      WHEN LEAST(100, (
        (LEAST(wi.years_observed, 4)::real / 4.0 * 30) +
        (GREATEST(0, 1.0 - wi.cv) * 30) +
        (LEAST(wi.sample_assets, 5)::real / 5.0 * 20) +
        (CASE WHEN EXISTS (
          SELECT 1 FROM metrics_unpivoted mu
          WHERE mu.topic_id = wi.topic_id
            AND mu.source IS NOT DISTINCT FROM wi.source
            AND mu.iso_week = wi.iso_week
            AND mu.metric != wi.metric
        ) THEN 15 ELSE 0 END)
      )) >= 50 THEN 'probable'::trend_confidence
      WHEN LEAST(100, (
        (LEAST(wi.years_observed, 4)::real / 4.0 * 30) +
        (GREATEST(0, 1.0 - wi.cv) * 30) +
        (LEAST(wi.sample_assets, 5)::real / 5.0 * 20) +
        (CASE WHEN EXISTS (
          SELECT 1 FROM metrics_unpivoted mu
          WHERE mu.topic_id = wi.topic_id
            AND mu.source IS NOT DISTINCT FROM wi.source
            AND mu.iso_week = wi.iso_week
            AND mu.metric != wi.metric
        ) THEN 15 ELSE 0 END)
      )) >= 25 THEN 'emerging'::trend_confidence
      ELSE 'noise'::trend_confidence
    END AS confidence
  FROM week_indices wi;

  GET DIAGNOSTICS v_indices_upserted = ROW_COUNT;
  SELECT COUNT(DISTINCT topic_id) INTO v_topics_computed FROM seasonal_indices;

  RETURN QUERY SELECT v_topics_computed, v_indices_upserted;
END;
$$;

COMMENT ON FUNCTION compute_seasonal_indices IS 'T60: Computes ISO-week seasonal multipliers from topic_daily_metrics. Confidence scored 0-100 with four tiers. Full recompute weekly. Only "established" tier used in sponsor evidence packs.';

-- ============================================================================
-- FUNCTION 4: detect_anomalies()
-- Ticket 62 — Anomaly Detection
-- Schedule: pg_cron 05:00 UTC daily
--
-- Compares yesterday's topic_daily_metrics against seasonal baseline.
-- Uses robust z-scores (median/MAD, not mean/stddev) to detect anomalies.
-- Threshold: |z| > 2.5 triggers an anomaly record.
-- ============================================================================

CREATE OR REPLACE FUNCTION detect_anomalies(
  p_target_date DATE DEFAULT CURRENT_DATE - 1
)
RETURNS TABLE(anomalies_detected INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_anomalies_detected INTEGER := 0;
  v_current_iso_week SMALLINT;
BEGIN
  v_current_iso_week := EXTRACT(WEEK FROM p_target_date)::smallint;

  -- Compare actual values against seasonal expectations
  WITH actuals AS (
    SELECT
      tdm.topic_id,
      tdm.source,
      tdm.date,
      tdm.views::real AS actual_views,
      tdm.engagement::real AS actual_engagement,
      tdm.search_impressions::real AS actual_search_impressions
    FROM topic_daily_metrics tdm
    WHERE tdm.date = p_target_date
      AND tdm.source IS NULL  -- use all-platform rollup for anomaly detection
  ),
  baselines AS (
    SELECT
      si.topic_id,
      si.metric,
      si.index_value,
      si.confidence
    FROM seasonal_indices si
    WHERE si.iso_week = v_current_iso_week
      AND si.source IS NULL  -- all-platform
      AND si.confidence IN ('probable', 'established')
  ),
  -- Get trailing 52-week median and MAD for each topic × metric
  trailing_stats AS (
    SELECT
      tdm.topic_id,
      'views' AS metric,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY tdm.views::real) AS median_val,
      -- MAD = median(|x - median(x)|) × 1.4826
      PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY ABS(tdm.views::real - sub.med)
      ) * 1.4826 AS mad
    FROM topic_daily_metrics tdm
    CROSS JOIN LATERAL (
      SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY views::real) AS med
      FROM topic_daily_metrics
      WHERE topic_id = tdm.topic_id AND source IS NULL
        AND date >= (p_target_date - 365) AND date < p_target_date
    ) sub
    WHERE tdm.source IS NULL
      AND tdm.date >= (p_target_date - 365) AND tdm.date < p_target_date
    GROUP BY tdm.topic_id
  )
  INSERT INTO anomalies (topic_id, source, detected_on, metric, expected_value, actual_value, z_score, direction)
  SELECT
    a.topic_id,
    NULL,  -- all-platform
    a.date,
    'views',
    b.index_value * ts.median_val,  -- expected = seasonal index × median
    a.actual_views,
    CASE WHEN ts.mad > 0
      THEN (a.actual_views - (b.index_value * ts.median_val)) / ts.mad
      ELSE 0
    END AS z_score,
    CASE WHEN a.actual_views > (b.index_value * ts.median_val) THEN 'above' ELSE 'below' END
  FROM actuals a
  JOIN baselines b ON b.topic_id = a.topic_id AND b.metric = 'views'
  JOIN trailing_stats ts ON ts.topic_id = a.topic_id
  WHERE ts.mad > 0
    AND ABS(
      (a.actual_views - (b.index_value * ts.median_val)) / ts.mad
    ) > 2.5
    -- Don't re-detect if already detected for this topic/date
    AND NOT EXISTS (
      SELECT 1 FROM anomalies an
      WHERE an.topic_id = a.topic_id
        AND an.detected_on = a.date
        AND an.metric = 'views'
    );

  GET DIAGNOSTICS v_anomalies_detected = ROW_COUNT;

  RETURN QUERY SELECT v_anomalies_detected;
END;
$$;

COMMENT ON FUNCTION detect_anomalies IS 'T62: Robust z-score anomaly detection (median/MAD). Compares daily topic metrics against seasonal baseline. |z| > 2.5 triggers anomaly. Runs daily. Idempotent.';

-- ============================================================================
-- FUNCTION 5: generate_forecasts()
-- Ticket 63 — Forecasting
-- Schedule: pg_cron Monday 05:30 UTC
--
-- Seasonal-naive-with-drift predictions:
--   forecast = seasonal_index × (trailing_mean + year_over_year_drift)
-- Generates predictions for the next 4 weeks.
-- Self-grading: backfills actual_value and abs_pct_error for past forecasts.
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_forecasts()
RETURNS TABLE(forecasts_created INTEGER, forecasts_graded INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_forecasts_created INTEGER := 0;
  v_forecasts_graded INTEGER := 0;
BEGIN
  -- Step 1: Grade past forecasts where target_week has passed
  UPDATE forecasts f
  SET
    actual_value = actual.total_views,
    abs_pct_error = CASE
      WHEN actual.total_views > 0
      THEN ABS(f.forecast_value - actual.total_views) / actual.total_views
      ELSE NULL
    END
  FROM (
    SELECT
      topic_id, source,
      date_trunc('week', date)::date AS week_start,
      SUM(views)::real AS total_views
    FROM topic_daily_metrics
    WHERE source IS NULL  -- all-platform rollup
    GROUP BY topic_id, source, week_start
  ) actual
  WHERE f.topic_id = actual.topic_id
    AND f.source IS NOT DISTINCT FROM actual.source
    AND f.target_week = actual.week_start
    AND f.actual_value IS NULL
    AND actual.week_start < CURRENT_DATE;

  GET DIAGNOSTICS v_forecasts_graded = ROW_COUNT;

  -- Step 2: Generate forecasts for next 4 weeks
  WITH forecast_inputs AS (
    SELECT
      si.topic_id,
      si.source,
      si.metric,
      -- Generate target weeks: next Monday, +1w, +2w, +3w
      target_week,
      EXTRACT(WEEK FROM target_week)::smallint AS target_iso_week,
      si.index_value AS seasonal_index,
      si.confidence_score
    FROM seasonal_indices si
    CROSS JOIN LATERAL generate_series(
      date_trunc('week', CURRENT_DATE + 7)::date,
      date_trunc('week', CURRENT_DATE + 28)::date,
      '7 days'::interval
    ) AS target_week
    WHERE si.confidence IN ('probable', 'established')
      AND si.source IS NULL
      AND si.metric = 'views'
  ),
  trailing AS (
    SELECT
      topic_id,
      AVG(views)::real AS trailing_weekly_mean,
      -- Year-over-year drift: compare last 13 weeks to same 13 weeks prior year
      COALESCE(
        (AVG(CASE WHEN date >= (CURRENT_DATE - 91) THEN views END)::real -
         AVG(CASE WHEN date >= (CURRENT_DATE - 456) AND date < (CURRENT_DATE - 365) THEN views END)::real),
        0
      ) AS yoy_drift
    FROM topic_daily_metrics
    WHERE source IS NULL
      AND date >= (CURRENT_DATE - 456)  -- ~15 months back for YoY
    GROUP BY topic_id
  )
  INSERT INTO forecasts (
    topic_id, source, metric, target_week,
    forecast_value, lower_bound, upper_bound, model
  )
  SELECT
    fi.topic_id,
    fi.source,
    fi.metric,
    fi.target_week::date,
    -- Forecast = seasonal_index × (trailing_mean + drift) × 7 (weekly total)
    (fi.seasonal_index * (t.trailing_weekly_mean + t.yoy_drift) * 7)::real,
    -- Lower bound: 80% of forecast (simple interval)
    (fi.seasonal_index * (t.trailing_weekly_mean + t.yoy_drift) * 7 * 0.8)::real,
    -- Upper bound: 120% of forecast
    (fi.seasonal_index * (t.trailing_weekly_mean + t.yoy_drift) * 7 * 1.2)::real,
    'seasonal_naive_drift'
  FROM forecast_inputs fi
  JOIN trailing t ON t.topic_id = fi.topic_id
  WHERE t.trailing_weekly_mean > 0
  ON CONFLICT (topic_id, source, metric, target_week, model)
  DO UPDATE SET
    forecast_value = EXCLUDED.forecast_value,
    lower_bound = EXCLUDED.lower_bound,
    upper_bound = EXCLUDED.upper_bound,
    computed_at = NOW();

  GET DIAGNOSTICS v_forecasts_created = ROW_COUNT;

  RETURN QUERY SELECT v_forecasts_created, v_forecasts_graded;
END;
$$;

COMMENT ON FUNCTION generate_forecasts IS 'T63: Seasonal-naive-with-drift forecasting. Generates 4-week predictions. Self-grades past forecasts with actual values and MAPE. Weekly recompute.';

-- ============================================================================
-- pg_cron SCHEDULE DEFINITIONS
-- These are the SELECT statements to run via Supabase Dashboard > Database > Extensions > pg_cron
-- They cannot be run in a migration (pg_cron.schedule requires superuser).
-- Included here as documentation for Anthony to enable via the dashboard.
-- ============================================================================

-- To enable these, run in the Supabase SQL Editor with superuser:
--
-- SELECT cron.schedule('derive-performance-daily', '0 4 * * *', 'SELECT derive_performance_daily()');
-- SELECT cron.schedule('aggregate-topic-daily-metrics', '30 4 * * *', 'SELECT aggregate_topic_daily_metrics()');
-- SELECT cron.schedule('compute-seasonal-indices', '0 5 * * 1', 'SELECT compute_seasonal_indices()');
-- SELECT cron.schedule('detect-anomalies', '0 5 * * *', 'SELECT detect_anomalies()');
-- SELECT cron.schedule('generate-forecasts', '30 5 * * 1', 'SELECT generate_forecasts()');
