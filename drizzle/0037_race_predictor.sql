-- Race predictor: courses, segments, predictions, prediction_results.
-- Backs the /predict feature: free time-range insight + paid Race Report ($29).
--
-- courses                      -- shared catalog of curated event GPX
-- course_segments              -- pre-derived segment array per course (denormalised
--                                 to avoid re-deriving on every prediction)
-- predictions                  -- one row per user run; anonymous-shareable via slug
-- prediction_results           -- post-event actual times for community calibration

-- ---------------------------------------------------------------
-- 1. courses
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "courses" (
  "id"                   serial PRIMARY KEY,
  "slug"                 text NOT NULL UNIQUE,
  "name"                 text NOT NULL,
  "country"              text,
  "region"               text,
  "discipline"           text NOT NULL DEFAULT 'road',          -- road | gravel | mtb
  "distance_m"           integer NOT NULL,
  "elevation_gain_m"     integer NOT NULL,
  "elevation_loss_m"     integer NOT NULL DEFAULT 0,
  "surface_summary"      text,                                   -- e.g. "tarmac_smooth"
  "gpx_data"             jsonb NOT NULL,                         -- TrackPoint[] payload
  "course_data"          jsonb NOT NULL,                         -- Course (typed) cached
  "event_dates"          date[] NOT NULL DEFAULT '{}'::date[],
  "verified"             boolean NOT NULL DEFAULT false,         -- curated vs user upload
  "source"               text,                                   -- e.g. "etape", "user"
  "uploader_email"       text,
  "uploader_rider_id"    integer REFERENCES "rider_profiles" ("id") ON DELETE SET NULL,
  "created_at"           timestamptz NOT NULL DEFAULT now(),
  "updated_at"           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "courses_country_idx"     ON "courses" ("country");
CREATE INDEX IF NOT EXISTS "courses_discipline_idx"  ON "courses" ("discipline");
CREATE INDEX IF NOT EXISTS "courses_verified_idx"    ON "courses" ("verified");

-- ---------------------------------------------------------------
-- 2. course_segments (optional pre-derived per-segment table)
-- For now, segments live in course_data jsonb; this table reserved for the
-- per-segment surface Crr / wind-overlay feature in Phase 4.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "course_segments" (
  "id"             serial PRIMARY KEY,
  "course_id"      integer NOT NULL REFERENCES "courses" ("id") ON DELETE CASCADE,
  "segment_index"  integer NOT NULL,
  "start_distance" integer NOT NULL,
  "end_distance"   integer NOT NULL,
  "gradient_mrad"  integer NOT NULL,                              -- gradient·1000, milliradians
  "heading_mrad"   integer NOT NULL,
  "surface"        text,
  "elevation_m"    integer NOT NULL,                              -- start elevation
  "metadata"       jsonb,
  UNIQUE ("course_id", "segment_index")
);
CREATE INDEX IF NOT EXISTS "course_segments_course_id_idx" ON "course_segments" ("course_id");

-- ---------------------------------------------------------------
-- 3. predictions
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "predictions" (
  "id"                       serial PRIMARY KEY,
  "slug"                     text NOT NULL UNIQUE,
  "rider_profile_id"         integer REFERENCES "rider_profiles" ("id") ON DELETE SET NULL,
  "course_id"                integer REFERENCES "courses" ("id") ON DELETE SET NULL,
  "course_gpx_hash"          text,                                -- if uploaded ad-hoc
  "course_data"              jsonb,                               -- snapshot for repro
  "mode"                     text NOT NULL DEFAULT 'plan_my_race',
                                                                  -- can_i_make_it | plan_my_race
  "predicted_time_s"         integer NOT NULL,
  "confidence_low_s"         integer NOT NULL,
  "confidence_high_s"        integer NOT NULL,
  "average_power"            integer,                             -- W
  "normalized_power"         integer,                             -- W
  "variability_index"        real,
  "rider_inputs"             jsonb NOT NULL,                      -- RiderProfile snapshot
  "environment_inputs"       jsonb NOT NULL,                      -- Environment snapshot
  "pacing_plan"              jsonb,                               -- per-segment W
  "result_summary"           jsonb,                               -- key insights, climb breakdown
  "weather_data"             jsonb,                               -- forecast at event date
  "ai_translation"           jsonb,                               -- AI-extracted params + confidence
  "email"                    text,
  "is_paid"                  boolean NOT NULL DEFAULT false,
  "paid_report_id"           integer REFERENCES "paid_reports" ("id") ON DELETE SET NULL,
  "engine_version"           text NOT NULL DEFAULT 'v1.0',
  "created_at"               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "predictions_email_idx"            ON "predictions" ("email");
CREATE INDEX IF NOT EXISTS "predictions_course_id_idx"        ON "predictions" ("course_id");
CREATE INDEX IF NOT EXISTS "predictions_rider_profile_id_idx" ON "predictions" ("rider_profile_id");
CREATE INDEX IF NOT EXISTS "predictions_is_paid_idx"          ON "predictions" ("is_paid");

-- ---------------------------------------------------------------
-- 4. prediction_results (actual ride finish times for calibration)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "prediction_results" (
  "id"                serial PRIMARY KEY,
  "prediction_id"     integer NOT NULL REFERENCES "predictions" ("id") ON DELETE CASCADE,
  "actual_time_s"     integer NOT NULL,
  "average_power"     integer,
  "ride_file_url"     text,
  "segment_actuals"   jsonb,
  "analysis"          jsonb,
  "model_error_pct"   real,                                       -- (actual − predicted) / actual
  "submitted_email"   text,
  "submitted_at"      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "prediction_results_prediction_id_idx" ON "prediction_results" ("prediction_id");

-- ---------------------------------------------------------------
-- 5. Wire up the Race Report product in the existing reports SKU registry.
--    Pricing matches the standardised $29 / $69 USD bundle policy
--    (commit f511a62 — pricing: standardise reports at $29 each).
-- ---------------------------------------------------------------
INSERT INTO "report_products"
  ("slug", "name", "description", "tool_slug", "bundle_items", "price_cents", "currency", "active", "page_count_target")
VALUES
  (
    'report_race',
    'Race Report — Personal Pacing Plan',
    'A physics-grounded pacing plan for your target event: per-km power targets, climb-by-climb strategy, weather-aware adjustments, fuelling cues, and the equipment changes that move the needle most.',
    NULL,
    NULL,
    2900,
    'usd',
    true,
    16
  )
ON CONFLICT ("slug") DO NOTHING;
