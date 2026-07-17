-- ==========================================================================
-- Roadman OS — Initial Schema Migration
-- Creates all enum types, tables, indexes, and triggers.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Extensions
-- --------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- --------------------------------------------------------------------------
-- Enum Types (16 total)
-- --------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM (
  'admin', 'leadership', 'content_manager', 'creator',
  'social_publisher', 'coach', 'commercial'
);

CREATE TYPE asset_type AS ENUM (
  'podcast_episode', 'youtube_video', 'blog_post', 'social_post',
  'newsletter', 'course_module', 'quote_card', 'infographic',
  'reel', 'short', 'clip', 'story', 'carousel', 'thread',
  'pdf', 'live_stream', 'webinar', 'other'
);

CREATE TYPE asset_status AS ENUM (
  'idea', 'brief_written', 'in_production', 'in_review',
  'approved', 'scheduled', 'published', 'repurposed', 'archived'
);

CREATE TYPE campaign_type AS ENUM (
  'weekly_focus', 'product_launch', 'event_promotion',
  'sponsor_campaign', 'seasonal', 'evergreen', 'ad_hoc'
);

CREATE TYPE campaign_status AS ENUM (
  'draft', 'planned', 'active', 'completed', 'cancelled'
);

CREATE TYPE publication_status AS ENUM (
  'draft', 'scheduled', 'published', 'failed', 'removed'
);

CREATE TYPE task_status AS ENUM (
  'backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked'
);

CREATE TYPE task_priority AS ENUM (
  'low', 'medium', 'high', 'urgent'
);

CREATE TYPE content_pillar AS ENUM (
  'coaching', 'nutrition', 'strength_and_conditioning',
  'recovery', 'le_metier'
);

CREATE TYPE idea_status AS ENUM (
  'captured', 'developing', 'ready', 'used', 'discarded'
);

CREATE TYPE activity_action AS ENUM (
  'created', 'updated', 'status_changed', 'assigned',
  'commented', 'published', 'archived', 'restored',
  'file_uploaded', 'file_deleted', 'highlight_added',
  'scheduled', 'approved', 'rejected'
);

CREATE TYPE file_storage_type AS ENUM (
  'supabase', 'youtube', 'spotify', 'google_drive',
  'dropbox', 'external_url'
);

CREATE TYPE metric_source AS ENUM (
  'youtube', 'spotify', 'apple_podcasts', 'instagram',
  'facebook', 'tiktok', 'twitter_x', 'linkedin',
  'website', 'beehiiv', 'ga4', 'skool', 'manual'
);

CREATE TYPE sponsor_status AS ENUM (
  'prospect', 'contacted', 'negotiating', 'active',
  'paused', 'completed', 'lost'
);

CREATE TYPE product_type AS ENUM (
  'community', 'course', 'coaching', 'event',
  'merchandise', 'digital_download', 'sponsorship', 'other'
);

-- --------------------------------------------------------------------------
-- 1. profiles
-- --------------------------------------------------------------------------
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  display_name TEXT,
  avatar_url  TEXT,
  role        user_role NOT NULL DEFAULT 'creator',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  last_seen_at TIMESTAMPTZ,
  notification_preferences JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- --------------------------------------------------------------------------
-- 2. permissions
-- --------------------------------------------------------------------------
CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource    TEXT NOT NULL,       -- e.g. 'campaigns', 'assets', 'tasks'
  can_create  BOOLEAN NOT NULL DEFAULT FALSE,
  can_read    BOOLEAN NOT NULL DEFAULT TRUE,
  can_update  BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, resource)
);

CREATE INDEX idx_permissions_profile ON permissions(profile_id);

-- --------------------------------------------------------------------------
-- 3. topics
-- --------------------------------------------------------------------------
CREATE TABLE topics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  pillar      content_pillar,
  description TEXT,
  parent_id   UUID REFERENCES topics(id) ON DELETE SET NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_topics_pillar ON topics(pillar);
CREATE INDEX idx_topics_parent ON topics(parent_id);
CREATE INDEX idx_topics_slug ON topics(slug);

-- --------------------------------------------------------------------------
-- 4. tags
-- --------------------------------------------------------------------------
CREATE TABLE tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  colour      TEXT,                -- hex colour for UI display
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);

-- --------------------------------------------------------------------------
-- 5. platforms
-- --------------------------------------------------------------------------
CREATE TABLE platforms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  icon_url        TEXT,
  base_url        TEXT,
  supported_types asset_type[] NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_platforms_slug ON platforms(slug);
CREATE INDEX idx_platforms_is_active ON platforms(is_active);

-- --------------------------------------------------------------------------
-- 6. platform_reuse_policies
-- --------------------------------------------------------------------------
CREATE TABLE platform_reuse_policies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id       UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  asset_type        asset_type NOT NULL,
  min_gap_days      INTEGER NOT NULL DEFAULT 0,
  max_reuses        INTEGER,              -- NULL means unlimited
  require_edit      BOOLEAN NOT NULL DEFAULT FALSE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform_id, asset_type)
);

CREATE INDEX idx_reuse_policies_platform ON platform_reuse_policies(platform_id);

-- --------------------------------------------------------------------------
-- 7. products
-- --------------------------------------------------------------------------
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  type            product_type NOT NULL,
  description     TEXT,
  price_cents     INTEGER,
  currency        TEXT NOT NULL DEFAULT 'GBP',
  url             TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);

-- --------------------------------------------------------------------------
-- 8. sponsors
-- --------------------------------------------------------------------------
CREATE TABLE sponsors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  logo_url        TEXT,
  website_url     TEXT,
  contact_name    TEXT,
  contact_email   TEXT,
  status          sponsor_status NOT NULL DEFAULT 'prospect',
  deal_value_cents INTEGER,
  currency        TEXT NOT NULL DEFAULT 'GBP',
  contract_start  DATE,
  contract_end    DATE,
  deliverables    JSONB NOT NULL DEFAULT '[]',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sponsors_status ON sponsors(status);
CREATE INDEX idx_sponsors_slug ON sponsors(slug);

-- --------------------------------------------------------------------------
-- 9. campaigns
-- --------------------------------------------------------------------------
CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  type            campaign_type NOT NULL,
  status          campaign_status NOT NULL DEFAULT 'draft',
  description     TEXT,
  goal            TEXT,
  start_date      DATE,
  end_date        DATE,
  owner_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sponsor_id      UUID REFERENCES sponsors(id) ON DELETE SET NULL,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(type);
CREATE INDEX idx_campaigns_owner ON campaigns(owner_id);
CREATE INDEX idx_campaigns_slug ON campaigns(slug);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_sponsor ON campaigns(sponsor_id);
CREATE INDEX idx_campaigns_product ON campaigns(product_id);

-- --------------------------------------------------------------------------
-- 10. assets
-- --------------------------------------------------------------------------
CREATE TABLE assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  type            asset_type NOT NULL,
  status          asset_status NOT NULL DEFAULT 'idea',
  pillar          content_pillar,
  description     TEXT,
  body            TEXT,                   -- main content / script / copy
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  parent_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  creator_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assignee_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  publish_date    TIMESTAMPTZ,
  due_date        TIMESTAMPTZ,
  external_id     TEXT,                   -- e.g. YouTube video ID
  external_url    TEXT,
  thumbnail_url   TEXT,
  duration_seconds INTEGER,
  word_count      INTEGER,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_pillar ON assets(pillar);
CREATE INDEX idx_assets_campaign ON assets(campaign_id);
CREATE INDEX idx_assets_parent ON assets(parent_asset_id);
CREATE INDEX idx_assets_creator ON assets(creator_id);
CREATE INDEX idx_assets_assignee ON assets(assignee_id);
CREATE INDEX idx_assets_slug ON assets(slug);
CREATE INDEX idx_assets_publish_date ON assets(publish_date);
CREATE INDEX idx_assets_due_date ON assets(due_date);
CREATE INDEX idx_assets_external_id ON assets(external_id);

-- --------------------------------------------------------------------------
-- 11. asset_topics (junction)
-- --------------------------------------------------------------------------
CREATE TABLE asset_topics (
  asset_id    UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  topic_id    UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (asset_id, topic_id)
);

CREATE INDEX idx_asset_topics_topic ON asset_topics(topic_id);

-- --------------------------------------------------------------------------
-- 12. asset_tags (junction)
-- --------------------------------------------------------------------------
CREATE TABLE asset_tags (
  asset_id    UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (asset_id, tag_id)
);

CREATE INDEX idx_asset_tags_tag ON asset_tags(tag_id);

-- --------------------------------------------------------------------------
-- 13. files
-- --------------------------------------------------------------------------
CREATE TABLE files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  uploaded_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  storage_type    file_storage_type NOT NULL DEFAULT 'supabase',
  file_name       TEXT NOT NULL,
  file_path       TEXT NOT NULL,
  mime_type       TEXT,
  file_size_bytes BIGINT,
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_asset ON files(asset_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_storage_type ON files(storage_type);

-- --------------------------------------------------------------------------
-- 14. transcripts
-- --------------------------------------------------------------------------
CREATE TABLE transcripts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  language        TEXT NOT NULL DEFAULT 'en',
  full_text       TEXT NOT NULL,
  word_count      INTEGER,
  confidence      REAL,
  provider        TEXT,               -- e.g. 'whisper', 'deepgram', 'manual'
  segments        JSONB NOT NULL DEFAULT '[]',  -- timestamped segments
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transcripts_asset ON transcripts(asset_id);
CREATE INDEX idx_transcripts_language ON transcripts(language);

-- --------------------------------------------------------------------------
-- 15. transcript_highlights
-- --------------------------------------------------------------------------
CREATE TABLE transcript_highlights (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id   UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_ms        INTEGER NOT NULL,
  end_ms          INTEGER NOT NULL,
  text            TEXT NOT NULL,
  label           TEXT,
  colour          TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_highlights_transcript ON transcript_highlights(transcript_id);
CREATE INDEX idx_highlights_created_by ON transcript_highlights(created_by);

-- --------------------------------------------------------------------------
-- 16. publications
-- --------------------------------------------------------------------------
CREATE TABLE publications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  platform_id     UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  status          publication_status NOT NULL DEFAULT 'draft',
  scheduled_at    TIMESTAMPTZ,
  published_at    TIMESTAMPTZ,
  external_id     TEXT,               -- platform-specific post ID
  external_url    TEXT,
  platform_metadata JSONB NOT NULL DEFAULT '{}',
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_publications_asset ON publications(asset_id);
CREATE INDEX idx_publications_platform ON publications(platform_id);
CREATE INDEX idx_publications_status ON publications(status);
CREATE INDEX idx_publications_scheduled ON publications(scheduled_at);
CREATE INDEX idx_publications_published ON publications(published_at);
CREATE INDEX idx_publications_external ON publications(external_id);

-- --------------------------------------------------------------------------
-- 17. performance_records
-- --------------------------------------------------------------------------
CREATE TABLE performance_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id        UUID REFERENCES assets(id) ON DELETE CASCADE,
  publication_id  UUID REFERENCES publications(id) ON DELETE CASCADE,
  source          metric_source NOT NULL,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  views           BIGINT DEFAULT 0,
  impressions     BIGINT DEFAULT 0,
  clicks          BIGINT DEFAULT 0,
  likes           BIGINT DEFAULT 0,
  comments        BIGINT DEFAULT 0,
  shares          BIGINT DEFAULT 0,
  saves           BIGINT DEFAULT 0,
  subscribers_gained INTEGER DEFAULT 0,
  watch_time_seconds BIGINT DEFAULT 0,
  avg_view_duration_seconds REAL DEFAULT 0,
  ctr             REAL DEFAULT 0,
  engagement_rate REAL DEFAULT 0,
  reach           BIGINT DEFAULT 0,
  revenue_cents   INTEGER DEFAULT 0,
  custom_metrics  JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_perf_asset ON performance_records(asset_id);
CREATE INDEX idx_perf_publication ON performance_records(publication_id);
CREATE INDEX idx_perf_source ON performance_records(source);
CREATE INDEX idx_perf_recorded_at ON performance_records(recorded_at);

-- --------------------------------------------------------------------------
-- 18. tasks
-- --------------------------------------------------------------------------
CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  status          task_status NOT NULL DEFAULT 'backlog',
  priority        task_priority NOT NULL DEFAULT 'medium',
  asset_id        UUID REFERENCES assets(id) ON DELETE SET NULL,
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  assignee_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date        TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  labels          TEXT[] NOT NULL DEFAULT '{}',
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_asset ON tasks(asset_id);
CREATE INDEX idx_tasks_campaign ON tasks(campaign_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- --------------------------------------------------------------------------
-- 19. content_briefs
-- --------------------------------------------------------------------------
CREATE TABLE content_briefs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  objective       TEXT,
  target_audience TEXT,
  key_messages    TEXT[],
  tone            TEXT,
  references      JSONB NOT NULL DEFAULT '[]',  -- links, inspiration
  seo_keywords    TEXT[],
  distribution_plan JSONB NOT NULL DEFAULT '{}',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_briefs_asset ON content_briefs(asset_id);
CREATE INDEX idx_briefs_created_by ON content_briefs(created_by);

-- --------------------------------------------------------------------------
-- 20. ideas
-- --------------------------------------------------------------------------
CREATE TABLE ideas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  status          idea_status NOT NULL DEFAULT 'captured',
  pillar          content_pillar,
  suggested_type  asset_type,
  source          TEXT,               -- where the idea came from
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  asset_id        UUID REFERENCES assets(id) ON DELETE SET NULL,  -- linked when converted
  score           INTEGER DEFAULT 0,  -- upvote/priority score
  tags            TEXT[] NOT NULL DEFAULT '{}',
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_pillar ON ideas(pillar);
CREATE INDEX idx_ideas_created_by ON ideas(created_by);
CREATE INDEX idx_ideas_asset ON ideas(asset_id);
CREATE INDEX idx_ideas_score ON ideas(score);

-- --------------------------------------------------------------------------
-- 21. comments
-- --------------------------------------------------------------------------
CREATE TABLE comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id        UUID REFERENCES assets(id) ON DELETE CASCADE,
  task_id         UUID REFERENCES tasks(id) ON DELETE CASCADE,
  idea_id         UUID REFERENCES ideas(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES comments(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  is_resolved     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- At least one target must be set
  CONSTRAINT comments_target_check CHECK (
    asset_id IS NOT NULL OR task_id IS NOT NULL OR idea_id IS NOT NULL
  )
);

CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_asset ON comments(asset_id);
CREATE INDEX idx_comments_task ON comments(task_id);
CREATE INDEX idx_comments_idea ON comments(idea_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- --------------------------------------------------------------------------
-- 22. activity_log
-- --------------------------------------------------------------------------
CREATE TABLE activity_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action          activity_action NOT NULL,
  entity_type     TEXT NOT NULL,       -- e.g. 'asset', 'campaign', 'task'
  entity_id       UUID NOT NULL,
  changes         JSONB NOT NULL DEFAULT '{}',  -- before/after diff
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_actor ON activity_log(actor_id);
CREATE INDEX idx_activity_action ON activity_log(action);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_log(created_at);

-- --------------------------------------------------------------------------
-- 23. content_clusters
-- --------------------------------------------------------------------------
CREATE TABLE content_clusters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  pillar          content_pillar,
  hub_asset_id    UUID REFERENCES assets(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clusters_slug ON content_clusters(slug);
CREATE INDEX idx_clusters_pillar ON content_clusters(pillar);
CREATE INDEX idx_clusters_hub ON content_clusters(hub_asset_id);

-- --------------------------------------------------------------------------
-- 24. content_cluster_assets (junction)
-- --------------------------------------------------------------------------
CREATE TABLE content_cluster_assets (
  cluster_id  UUID NOT NULL REFERENCES content_clusters(id) ON DELETE CASCADE,
  asset_id    UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (cluster_id, asset_id)
);

CREATE INDEX idx_cluster_assets_asset ON content_cluster_assets(asset_id);

-- --------------------------------------------------------------------------
-- 25. platform_connections
-- --------------------------------------------------------------------------
CREATE TABLE platform_connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id     UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  access_token    TEXT,
  refresh_token   TEXT,
  token_expires_at TIMESTAMPTZ,
  account_id      TEXT,               -- platform-specific account identifier
  account_name    TEXT,
  scopes          TEXT[],
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_synced_at  TIMESTAMPTZ,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform_id, profile_id)
);

CREATE INDEX idx_connections_platform ON platform_connections(platform_id);
CREATE INDEX idx_connections_profile ON platform_connections(profile_id);
CREATE INDEX idx_connections_is_active ON platform_connections(is_active);

-- --------------------------------------------------------------------------
-- 26. sync_jobs
-- --------------------------------------------------------------------------
CREATE TABLE sync_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id   UUID REFERENCES platform_connections(id) ON DELETE SET NULL,
  source          metric_source NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',   -- pending, running, completed, failed
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  records_synced  INTEGER DEFAULT 0,
  error_message   TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_connection ON sync_jobs(connection_id);
CREATE INDEX idx_sync_jobs_source ON sync_jobs(source);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX idx_sync_jobs_created ON sync_jobs(created_at);

-- --------------------------------------------------------------------------
-- 27. content_embeddings
-- --------------------------------------------------------------------------
CREATE TABLE content_embeddings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     TEXT NOT NULL,       -- 'asset', 'transcript', 'idea'
  entity_id       UUID NOT NULL,
  chunk_index     INTEGER NOT NULL DEFAULT 0,
  chunk_text      TEXT NOT NULL,
  embedding       vector(1536),        -- OpenAI text-embedding-3-small dimension
  model           TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  token_count     INTEGER,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, chunk_index)
);

CREATE INDEX idx_embeddings_entity ON content_embeddings(entity_type, entity_id);
CREATE INDEX idx_embeddings_vector ON content_embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- --------------------------------------------------------------------------
-- Trigger function: auto-update updated_at
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- --------------------------------------------------------------------------
-- Apply updated_at triggers to all tables with an updated_at column
-- --------------------------------------------------------------------------
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON platforms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON platform_reuse_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON sponsors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON transcripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON transcript_highlights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON publications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON content_briefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON content_clusters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON platform_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
