# Roadman OS — Architecture Document

> **Version:** 2.0
> **Date:** 16 July 2026
> **Status:** Approved for full build
> **Author:** Ted (COO)

Roadman OS is the internal content intelligence and operating system for Roadman Cycling. It is a standalone Next.js application — completely separate from the public roadmancycling.com website — designed to give the five-person Roadman team a single place to plan campaigns, manage content assets through their full lifecycle, track publications across platforms, and measure performance.

This document defines the technical architecture, data model, feature scope, integration architecture, and build plan.

---

## 1. Tech Stack Decision

### Next.js 14+ (App Router) — Frontend & API

Next.js is the right choice because the existing roadmancycling.com site already runs on it, meaning the team has established patterns (Server Components, Server Actions, Route Handlers) that carry directly into this project. The App Router gives us server-side rendering for the dashboard (fast initial loads), React Server Components for data-heavy list pages (no client-side fetching waterfalls), and Route Handlers for any API endpoints. The internal-only nature of the app means we can use `'use server'` actions aggressively without worrying about public API surface.

### Supabase (Postgres + Auth + Storage) — Backend

Supabase provides a managed Postgres database, built-in email/password authentication, row-level security, and object storage — all on a free tier that comfortably covers 5 users. Using Supabase instead of the existing Drizzle + raw Postgres setup on roadmancycling.com is deliberate: this is a separate product with separate data, and Supabase's auth and storage features eliminate the need to build custom auth flows (as was done for The Roadman Method). The Supabase JS client handles sessions, JWT refresh, and RLS automatically.

### Vercel — Deployment

Vercel is already used for roadmancycling.com. A second Vercel project for Roadman OS keeps deployment simple: push to `main`, it deploys. The free tier supports the traffic level of 5 internal users with zero concern.

### Additional Libraries

| Library | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Client for Postgres queries, auth, storage |
| `@supabase/ssr` | Server-side Supabase client for Next.js |
| `tailwindcss` | Styling (matches existing team knowledge) |
| `date-fns` | Date manipulation and formatting |
| `zod` | Runtime validation for forms and API inputs |
| `react-hook-form` | Form state management |
| `@tanstack/react-table` | Data tables for asset lists, publication calendars |
| `lucide-react` | Icons |
| `googleapis` | YouTube Data API and Analytics API client |
| `openai` | Embedding generation for semantic search |
| `recharts` | Charts for performance dashboards |
| `inngest` | Background job queue (if needed beyond Edge Functions) |

---

## 2. Project Structure

```
roadman-os/
├── .env.local                          # Local environment variables
├── .env.example                        # Template for team
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── supabase/
│   ├── config.toml                     # Supabase project config
│   └── migrations/
│       ├── 00001_initial_schema.sql     # Full initial migration
│       └── ...
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (auth gate, sidebar, theme)
│   │   ├── page.tsx                    # Dashboard / home (redirects to /campaigns)
│   │   ├── login/
│   │   │   └── page.tsx                # Login page (email + password)
│   │   │
│   │   ├── campaigns/
│   │   │   ├── page.tsx                # Campaign list (weekly focus prominent)
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx            # Campaign detail (assets, tasks, calendar)
│   │   │   │   └── edit/page.tsx       # Edit campaign
│   │   │   └── new/page.tsx            # Create campaign
│   │   │
│   │   ├── assets/
│   │   │   ├── page.tsx                # Asset library (search, filter, list)
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx            # Asset detail (files, derivatives, publications)
│   │   │   │   └── edit/page.tsx       # Edit asset metadata
│   │   │   └── new/page.tsx            # Create asset (with source type selection)
│   │   │
│   │   ├── calendar/
│   │   │   └── page.tsx                # Publication calendar (week/month view)
│   │   │
│   │   ├── ideas/
│   │   │   └── page.tsx                # Quick capture + idea list
│   │   │
│   │   ├── tasks/
│   │   │   └── page.tsx                # Task board (kanban or list view)
│   │   │
│   │   ├── transcripts/
│   │   │   ├── page.tsx                # Transcript list
│   │   │   └── [id]/page.tsx           # Transcript viewer with highlights
│   │   │
│   │   ├── performance/
│   │   │   └── page.tsx                # Performance dashboard
│   │   │
│   │   ├── settings/
│   │   │   ├── page.tsx                # General settings
│   │   │   ├── platforms/page.tsx      # Platform management
│   │   │   ├── topics/page.tsx         # Topic taxonomy management
│   │   │   └── team/page.tsx           # User management (admin only)
│   │   │
│   │   └── api/
│   │       ├── assets/
│   │       │   └── route.ts            # CRUD for assets
│   │       ├── campaigns/
│   │       │   └── route.ts            # CRUD for campaigns
│   │       ├── ideas/
│   │       │   └── route.ts            # CRUD for ideas
│   │       ├── publications/
│   │       │   └── route.ts            # CRUD for publications
│   │       ├── tasks/
│   │       │   └── route.ts            # CRUD for tasks
│   │       ├── search/
│   │       │   └── route.ts            # Full-text search endpoint
│   │       ├── upload/
│   │       │   └── route.ts            # File upload handler
│   │       ├── performance/
│   │       │   └── route.ts            # Performance data ingestion
│   │       ├── sync/
│   │       │   ├── youtube/route.ts        # YouTube data sync endpoint
│   │       │   ├── meta/route.ts           # Meta (IG + FB) sync endpoint
│   │       │   ├── linkedin/route.ts       # LinkedIn sync endpoint
│   │       │   ├── spotify/route.ts        # Spotify/podcast sync endpoint
│   │       │   ├── beehiiv/route.ts        # Beehiiv newsletter sync endpoint
│   │       │   ├── ga4/route.ts            # Google Analytics 4 sync endpoint
│   │       │   └── status/route.ts         # Sync status dashboard endpoint
│   │       ├── webhooks/
│   │       │   ├── youtube/route.ts        # YouTube push notification receiver
│   │       │   └── beehiiv/route.ts        # Beehiiv webhook receiver
│   │       ├── import/
│   │       │   └── route.ts               # Bulk import orchestrator
│   │       └── cron/
│   │           ├── daily-sync/route.ts    # Daily analytics sync (Vercel Cron)
│   │           └── weekly-sync/route.ts   # Weekly deep sync (Vercel Cron)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx             # Main navigation sidebar
│   │   │   ├── Header.tsx              # Top bar (breadcrumbs, user menu)
│   │   │   └── MobileNav.tsx           # Mobile navigation
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── TagInput.tsx
│   │   │   ├── FileUploader.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── campaigns/
│   │   │   ├── CampaignCard.tsx
│   │   │   ├── WeeklyFocusBanner.tsx   # The most important UI element
│   │   │   └── CampaignForm.tsx
│   │   ├── assets/
│   │   │   ├── AssetCard.tsx
│   │   │   ├── AssetForm.tsx
│   │   │   ├── DerivativeTree.tsx      # Visual parent-child asset tree
│   │   │   └── AssetFilters.tsx
│   │   ├── publications/
│   │   │   ├── PublicationCalendar.tsx
│   │   │   ├── PublicationCard.tsx
│   │   │   └── ScheduleForm.tsx
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskBoard.tsx
│   │   │   └── TaskForm.tsx
│   │   ├── transcripts/
│   │   │   ├── TranscriptViewer.tsx
│   │   │   └── HighlightMarker.tsx
│   │   └── performance/
│   │       ├── MetricCard.tsx
│   │       └── PerformanceChart.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser Supabase client
│   │   │   ├── server.ts               # Server-side Supabase client
│   │   │   └── middleware.ts            # Auth middleware for session refresh
│   │   ├── actions/
│   │   │   ├── campaigns.ts            # Server Actions for campaigns
│   │   │   ├── assets.ts               # Server Actions for assets
│   │   │   ├── publications.ts         # Server Actions for publications
│   │   │   ├── tasks.ts                # Server Actions for tasks
│   │   │   ├── ideas.ts                # Server Actions for ideas
│   │   │   └── search.ts              # Server Actions for search
│   │   ├── queries/
│   │   │   ├── campaigns.ts            # Database query functions
│   │   │   ├── assets.ts
│   │   │   ├── publications.ts
│   │   │   ├── tasks.ts
│   │   │   └── performance.ts
│   │   ├── utils/
│   │   │   ├── dates.ts                # Date formatting helpers
│   │   │   ├── search.ts               # Search query builder
│   │   │   └── permissions.ts          # Role-based permission checks
│   │   ├── integrations/
│   │   │   ├── youtube.ts              # YouTube Data API + Analytics API client
│   │   │   ├── meta.ts                 # Meta Graph API client (IG + FB)
│   │   │   ├── linkedin.ts             # LinkedIn API client
│   │   │   ├── spotify.ts              # Spotify for Podcasters / RSS client
│   │   │   ├── beehiiv.ts              # Beehiiv API client
│   │   │   ├── ga4.ts                  # Google Analytics 4 client
│   │   │   └── sync-engine.ts          # Shared sync orchestration logic
│   │   └── constants.ts                # Enums, pillar lists, platform configs
│   │
│   ├── types/
│   │   ├── database.ts                 # Generated Supabase types
│   │   ├── campaigns.ts
│   │   ├── assets.ts
│   │   ├── publications.ts
│   │   └── tasks.ts
│   │
│   └── middleware.ts                    # Next.js middleware (auth redirect)
│
├── public/
│   └── roadman-os-logo.svg
│
└── README.md
```

---

## 3. Data Model

All tables use `id` as a UUID primary key (Supabase default), `created_at` and `updated_at` timestamps, and soft-delete via `archived_at` where applicable. All foreign keys use `ON DELETE SET NULL` unless otherwise specified. Timestamps are `timestamptz`.

### 3.1 Enums

```sql
-- User roles
CREATE TYPE user_role AS ENUM (
  'admin',
  'leadership',
  'content_manager',
  'creator',
  'social_publisher',
  'coach',
  'commercial'
);

-- Asset types (source formats)
CREATE TYPE asset_type AS ENUM (
  'podcast_episode',
  'youtube_video',
  'blog_post',
  'social_post',
  'newsletter',
  'course_module',
  'quote_card',
  'infographic',
  'reel',
  'short',
  'clip',
  'story',
  'carousel',
  'thread',
  'pdf',
  'live_stream',
  'webinar',
  'other'
);

-- Asset lifecycle status
CREATE TYPE asset_status AS ENUM (
  'idea',
  'brief_written',
  'in_production',
  'in_review',
  'approved',
  'scheduled',
  'published',
  'repurposed',
  'archived'
);

-- Campaign types
CREATE TYPE campaign_type AS ENUM (
  'weekly_focus',
  'product_launch',
  'event_promotion',
  'sponsor_campaign',
  'seasonal',
  'evergreen',
  'ad_hoc'
);

-- Campaign status
CREATE TYPE campaign_status AS ENUM (
  'draft',
  'planned',
  'active',
  'completed',
  'cancelled'
);

-- Publication status
CREATE TYPE publication_status AS ENUM (
  'draft',
  'scheduled',
  'published',
  'failed',
  'removed'
);

-- Task status
CREATE TYPE task_status AS ENUM (
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
  'blocked'
);

-- Task priority
CREATE TYPE task_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Content pillar
CREATE TYPE content_pillar AS ENUM (
  'coaching',
  'nutrition',
  'strength_and_conditioning',
  'recovery',
  'le_metier'
);

-- Idea status
CREATE TYPE idea_status AS ENUM (
  'captured',
  'developing',
  'ready',
  'used',
  'discarded'
);

-- Activity action types
CREATE TYPE activity_action AS ENUM (
  'created',
  'updated',
  'status_changed',
  'assigned',
  'commented',
  'published',
  'archived',
  'restored',
  'file_uploaded',
  'file_deleted',
  'highlight_added',
  'scheduled',
  'approved',
  'rejected'
);

-- File storage location
CREATE TYPE file_storage_type AS ENUM (
  'supabase',
  'youtube',
  'spotify',
  'google_drive',
  'dropbox',
  'external_url'
);

-- Performance metric source
CREATE TYPE metric_source AS ENUM (
  'youtube',
  'spotify',
  'apple_podcasts',
  'instagram',
  'facebook',
  'tiktok',
  'twitter_x',
  'linkedin',
  'website',
  'beehiiv',
  'ga4',
  'skool',
  'manual'
);

-- Sponsor status
CREATE TYPE sponsor_status AS ENUM (
  'prospect',
  'contacted',
  'negotiating',
  'active',
  'paused',
  'completed',
  'lost'
);

-- Product type
CREATE TYPE product_type AS ENUM (
  'community',
  'course',
  'coaching',
  'event',
  'merchandise',
  'digital_download',
  'sponsorship',
  'other'
);
```

### 3.2 Users & Auth

Supabase Auth handles authentication. The `profiles` table extends `auth.users` with Roadman-specific fields.

```sql
CREATE TABLE profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT NOT NULL UNIQUE,
  full_name         TEXT NOT NULL,
  display_name      TEXT,                    -- Short name for UI ("Anthony", "Sarah")
  avatar_url        TEXT,
  role              user_role NOT NULL DEFAULT 'creator',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  last_seen_at      TIMESTAMPTZ,
  notification_preferences JSONB DEFAULT '{}',  -- Per-user notification settings
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Launch users:**

| Name | Email | Role |
|------|-------|------|
| Anthony Walsh | anthony@roadmancycling.com | admin |
| Sarah | sarah@roadmancycling.com | content_manager |
| Caoimhe | caoimhe@roadmancycling.com | creator |
| Matthew | matthew@roadmancycling.com | social_publisher |
| Wes | wes@roadmancycling.com | creator |

### 3.3 Roles & Permissions

```sql
CREATE TABLE permissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role              user_role NOT NULL,
  resource          TEXT NOT NULL,           -- 'campaigns', 'assets', 'tasks', etc.
  action            TEXT NOT NULL,           -- 'create', 'read', 'update', 'delete', 'publish', 'assign'
  conditions        JSONB DEFAULT '{}',      -- Optional conditions (e.g., "own_only": true)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one permission entry per role+resource+action
CREATE UNIQUE INDEX idx_permissions_unique ON permissions(role, resource, action);
```

**Permission matrix (seeded at launch):**

| Role | Campaigns | Assets | Tasks | Publications | Ideas | Settings | Users |
|------|-----------|--------|-------|-------------|-------|----------|-------|
| admin | CRUD + assign | CRUD + approve | CRUD + assign | CRUD + publish | CRUD | Full | CRUD |
| leadership | CRUD | CRUD + approve | CRUD + assign | CRUD + publish | CRUD | Read | Read |
| content_manager | Read + update | CRUD | CRUD + assign | CRUD + publish | CRUD | Read | — |
| creator | Read | CRUD (own) | Read + update (assigned) | Read | CRUD | — | — |
| social_publisher | Read | Read | Read + update (assigned) | CRUD + publish | CRUD | — | — |
| coach | Read | Read + create | Read | Read | CRUD | — | — |
| commercial | Read | Read | Read | Read | Read | Read | — |

### 3.4 Topics (Controlled Taxonomy)

```sql
CREATE TABLE topics (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL UNIQUE,     -- "Zone 2 Training", "Nutrition Timing"
  slug              TEXT NOT NULL UNIQUE,     -- "zone-2-training"
  pillar            content_pillar,           -- Which content pillar this topic belongs to
  description       TEXT,
  parent_topic_id   UUID REFERENCES topics(id) ON DELETE SET NULL,  -- Hierarchical topics
  sort_order        INTEGER DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at       TIMESTAMPTZ                -- Soft delete
);

CREATE INDEX idx_topics_pillar ON topics(pillar);
CREATE INDEX idx_topics_parent ON topics(parent_topic_id);
```

### 3.5 Tags (Freeform)

```sql
CREATE TABLE tags (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL UNIQUE,     -- Freeform tag, e.g., "Prof Seiler", "Girona"
  slug              TEXT NOT NULL UNIQUE,
  colour            TEXT,                     -- Optional hex colour for UI display
  usage_count       INTEGER NOT NULL DEFAULT 0,  -- Denormalised count for sorting
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);
```

### 3.6 Asset–Topic and Asset–Tag Junction Tables

```sql
CREATE TABLE asset_topics (
  asset_id          UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  topic_id          UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  is_primary        BOOLEAN NOT NULL DEFAULT FALSE,  -- One primary topic per asset
  assigned_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (asset_id, topic_id)
);

CREATE TABLE asset_tags (
  asset_id          UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  tag_id            UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  added_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  added_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (asset_id, tag_id)
);
```

### 3.7 Campaigns

The weekly focus is the most important operational concept. It is modelled as a campaign with `type = 'weekly_focus'`.

```sql
CREATE TABLE campaigns (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,            -- "Week 29: Zone 2 Deep Dive"
  slug              TEXT NOT NULL UNIQUE,
  type              campaign_type NOT NULL DEFAULT 'weekly_focus',
  status            campaign_status NOT NULL DEFAULT 'draft',
  description       TEXT,                     -- Rich text description / brief
  pillar            content_pillar,           -- Primary pillar for this campaign
  goals             JSONB DEFAULT '[]',       -- Array of goal strings
  target_audience   TEXT,                     -- Which persona(s) this targets
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  colour            TEXT,                     -- Hex colour for calendar display
  hero_image_url    TEXT,                     -- Optional campaign hero image
  key_messages      JSONB DEFAULT '[]',       -- Core messages to communicate
  cta_url           TEXT,                     -- Primary call-to-action URL
  cta_text          TEXT,                     -- CTA button text
  sponsor_id        UUID REFERENCES sponsors(id) ON DELETE SET NULL,
  product_id        UUID REFERENCES products(id) ON DELETE SET NULL,
  owner_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  budget_cents      INTEGER,                  -- Optional campaign budget
  notes             TEXT,                     -- Internal notes
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at       TIMESTAMPTZ               -- Soft delete
);

CREATE INDEX idx_campaigns_type ON campaigns(type);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_owner ON campaigns(owner_id);
```

### 3.8 Assets

Assets are the core entity. A podcast episode is a source asset; a blog post derived from it, a social clip, and a quote card are all derivative assets linked via `source_asset_id`. This parent-child relationship is the backbone of content repurposing tracking.

```sql
CREATE TABLE assets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  asset_type        asset_type NOT NULL,
  status            asset_status NOT NULL DEFAULT 'idea',
  pillar            content_pillar,
  description       TEXT,                     -- Description or synopsis
  body              TEXT,                     -- Full content body (for text-based assets)
  excerpt           TEXT,                     -- Short excerpt / teaser

  -- Source and derivation
  source_asset_id   UUID REFERENCES assets(id) ON DELETE SET NULL,  -- Parent asset (for derivatives)
  is_source         BOOLEAN NOT NULL DEFAULT TRUE,  -- TRUE if this is an original/source asset
  derivation_note   TEXT,                     -- How this was derived ("Clip from timestamp 14:22-18:45")

  -- Campaign link
  campaign_id       UUID REFERENCES campaigns(id) ON DELETE SET NULL,

  -- Podcast-specific fields
  episode_number    INTEGER,
  season_number     INTEGER,
  duration_seconds  INTEGER,
  youtube_id        TEXT,                     -- YouTube video ID
  spotify_url       TEXT,
  apple_podcasts_url TEXT,
  guest_name        TEXT,
  guest_credential  TEXT,                     -- "Cycling Coach, Team Ineos"
  recording_date    DATE,

  -- SEO fields (for blog/article assets)
  seo_title         TEXT,
  seo_description   TEXT,                     -- Max 160 chars
  keywords          JSONB DEFAULT '[]',       -- Array of keyword strings
  answer_capsule    TEXT,                     -- Direct answer for AI search (40-80 words)
  canonical_url     TEXT,

  -- Workflow
  assigned_to       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at       TIMESTAMPTZ,
  due_date          DATE,

  -- Metadata
  word_count        INTEGER,
  estimated_read_minutes INTEGER,
  content_score     INTEGER,                  -- Quality score (0-100)
  external_url      TEXT,                     -- URL if published externally
  metadata          JSONB DEFAULT '{}',       -- Flexible metadata store

  -- Ownership and lifecycle
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at      TIMESTAMPTZ,
  archived_at       TIMESTAMPTZ               -- Soft delete
);

CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_pillar ON assets(pillar);
CREATE INDEX idx_assets_source ON assets(source_asset_id);
CREATE INDEX idx_assets_campaign ON assets(campaign_id);
CREATE INDEX idx_assets_assigned ON assets(assigned_to);
CREATE INDEX idx_assets_published ON assets(published_at);
CREATE INDEX idx_assets_episode ON assets(episode_number);

-- Full-text search index
CREATE INDEX idx_assets_search ON assets
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(body, '') || ' ' || coalesce(guest_name, '')));
```

### 3.9 Files

The Files table handles both Supabase-stored files and external references (YouTube videos, Spotify episodes, Google Drive documents). Small files (images, PDFs, documents) go into Supabase Storage. Large media files (full video, raw audio) remain on their native platforms and are referenced by URL.

```sql
CREATE TABLE files (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id          UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  file_name         TEXT NOT NULL,            -- Original filename
  display_name      TEXT,                     -- Human-friendly name
  file_type         TEXT NOT NULL,            -- MIME type: "image/png", "audio/mp3", "video/mp4"
  file_extension    TEXT,                     -- ".png", ".mp3", ".mp4"
  file_size_bytes   BIGINT,                   -- NULL for external references
  storage_type      file_storage_type NOT NULL DEFAULT 'supabase',

  -- Supabase Storage fields
  storage_bucket    TEXT,                     -- "assets", "thumbnails", "documents"
  storage_path      TEXT,                     -- Path within bucket

  -- External reference fields
  external_url      TEXT,                     -- Full URL for external files
  external_id       TEXT,                     -- Platform-specific ID (YouTube video ID, etc.)
  embed_url         TEXT,                     -- Embeddable URL if different from external_url

  -- Image-specific
  width_px          INTEGER,
  height_px         INTEGER,
  thumbnail_url     TEXT,                     -- Auto-generated thumbnail URL

  -- Audio/video-specific
  duration_seconds  INTEGER,
  bitrate_kbps      INTEGER,

  -- Metadata
  description       TEXT,
  alt_text          TEXT,                     -- Accessibility alt text for images
  is_primary        BOOLEAN NOT NULL DEFAULT FALSE,  -- Primary file for the asset
  sort_order        INTEGER DEFAULT 0,
  metadata          JSONB DEFAULT '{}',

  -- Lifecycle
  uploaded_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at       TIMESTAMPTZ               -- Soft delete
);

CREATE INDEX idx_files_asset ON files(asset_id);
CREATE INDEX idx_files_type ON files(file_type);
CREATE INDEX idx_files_storage ON files(storage_type);
```

### 3.10 Transcripts & Highlights

```sql
CREATE TABLE transcripts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id          UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  full_text         TEXT NOT NULL,            -- Complete transcript text
  language          TEXT DEFAULT 'en',
  source            TEXT,                     -- "youtube_auto", "deepgram", "manual", "whisper"
  word_count        INTEGER,
  duration_seconds  INTEGER,                  -- Duration of the audio/video
  segments          JSONB DEFAULT '[]',       -- Timestamped segments: [{start, end, text, speaker}]
  speakers          JSONB DEFAULT '[]',       -- Speaker diarisation: [{id, name, segments}]
  confidence_score  REAL,                     -- Overall transcription confidence (0.0 - 1.0)
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,  -- Manually reviewed
  verified_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at       TIMESTAMPTZ,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transcripts_asset ON transcripts(asset_id);

-- Full-text search on transcript content
CREATE INDEX idx_transcripts_search ON transcripts
  USING GIN (to_tsvector('english', full_text));

CREATE TABLE transcript_highlights (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id     UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  start_time_ms     INTEGER NOT NULL,         -- Start timestamp in milliseconds
  end_time_ms       INTEGER NOT NULL,         -- End timestamp in milliseconds
  text              TEXT NOT NULL,             -- Highlighted text excerpt
  speaker           TEXT,                      -- Who said it
  highlight_type    TEXT DEFAULT 'general',    -- "quote", "insight", "action_item", "clip_worthy", "fact"
  note              TEXT,                      -- User's note about why this is highlighted
  colour            TEXT,                      -- Highlight colour (for UI)
  tags              JSONB DEFAULT '[]',        -- Quick tags on highlights
  is_used           BOOLEAN NOT NULL DEFAULT FALSE,  -- Has this been used in a derivative asset
  used_in_asset_id  UUID REFERENCES assets(id) ON DELETE SET NULL,  -- Which asset used it
  created_by        UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_highlights_transcript ON transcript_highlights(transcript_id);
CREATE INDEX idx_highlights_type ON transcript_highlights(highlight_type);
```

### 3.11 Platforms & Reuse Policies

```sql
CREATE TABLE platforms (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL UNIQUE,      -- "YouTube (Main)", "Instagram", "Facebook"
  slug              TEXT NOT NULL UNIQUE,      -- "youtube-main", "instagram"
  platform_type     TEXT NOT NULL,             -- "youtube", "instagram", "facebook", "tiktok", "twitter_x", "linkedin", "podcast", "newsletter", "website", "skool"
  icon_url          TEXT,
  base_url          TEXT,                      -- "https://youtube.com/@theroadmanpodcast"
  account_handle    TEXT,                      -- "@roadman.cycling"
  account_id        TEXT,                      -- Platform-specific account/channel ID
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  ideal_post_times  JSONB DEFAULT '[]',        -- Preferred posting times: [{day, time, timezone}]
  character_limits  JSONB DEFAULT '{}',        -- {title: 100, body: 2200, hashtags: 30}
  format_specs      JSONB DEFAULT '{}',        -- {image_width: 1080, image_height: 1080, video_max_seconds: 60}
  notes             TEXT,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE platform_reuse_policies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id       UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  asset_type        asset_type NOT NULL,       -- Which asset type this policy applies to
  min_gap_days      INTEGER NOT NULL DEFAULT 0,  -- Minimum days before reusing similar content
  max_reuses        INTEGER,                   -- Max times similar content can be posted (NULL = unlimited)
  allowed_formats   JSONB DEFAULT '[]',        -- Allowed derivative formats for this platform
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (platform_id, asset_type)
);

CREATE INDEX idx_reuse_policies_platform ON platform_reuse_policies(platform_id);
```

### 3.12 Publications

The junction between assets and platforms. Every time a piece of content is published (or scheduled) on a specific platform on a specific date, a publication record is created.

```sql
CREATE TABLE publications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id          UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  platform_id       UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  campaign_id       UUID REFERENCES campaigns(id) ON DELETE SET NULL,

  -- Scheduling
  scheduled_at      TIMESTAMPTZ,              -- When it's scheduled to go live
  published_at      TIMESTAMPTZ,              -- When it actually went live
  status            publication_status NOT NULL DEFAULT 'draft',

  -- Platform-specific content (may differ from asset body)
  platform_title    TEXT,                     -- Title as posted on this platform
  platform_body     TEXT,                     -- Body text as posted (may differ per platform)
  platform_url      TEXT,                     -- Direct URL to the published post
  platform_post_id  TEXT,                     -- Platform's native post ID

  -- Publishing metadata
  hashtags          JSONB DEFAULT '[]',
  mentions          JSONB DEFAULT '[]',
  media_urls        JSONB DEFAULT '[]',       -- URLs of media attached to this publication

  -- Workflow
  scheduled_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  published_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes             TEXT,

  -- Lifecycle
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at       TIMESTAMPTZ               -- Soft delete
);

CREATE INDEX idx_publications_asset ON publications(asset_id);
CREATE INDEX idx_publications_platform ON publications(platform_id);
CREATE INDEX idx_publications_campaign ON publications(campaign_id);
CREATE INDEX idx_publications_scheduled ON publications(scheduled_at);
CREATE INDEX idx_publications_published ON publications(published_at);
CREATE INDEX idx_publications_status ON publications(status);
```

### 3.13 Performance Records

```sql
CREATE TABLE performance_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id    UUID REFERENCES publications(id) ON DELETE SET NULL,
  asset_id          UUID REFERENCES assets(id) ON DELETE SET NULL,
  platform_id       UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,

  -- When this data was recorded
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_start      DATE,                     -- Start of the measurement period
  period_end        DATE,                     -- End of the measurement period

  -- Universal engagement metrics (nullable — not all platforms report all metrics)
  views             BIGINT,
  impressions       BIGINT,
  reach             BIGINT,
  clicks            BIGINT,
  click_through_rate REAL,                    -- As decimal (0.053 = 5.3%)
  likes             INTEGER,
  comments          INTEGER,
  shares            INTEGER,
  saves             INTEGER,
  engagement_rate   REAL,                     -- As decimal

  -- Video/audio metrics
  watch_time_seconds BIGINT,
  average_view_duration_seconds INTEGER,
  completion_rate   REAL,                     -- As decimal

  -- Growth metrics
  new_followers     INTEGER,
  new_subscribers   INTEGER,
  unsubscribes      INTEGER,

  -- Revenue metrics
  revenue_cents     INTEGER,                  -- Ad revenue in cents
  cost_cents        INTEGER,                  -- Promotion/ad spend in cents
  conversions       INTEGER,                  -- Signups, purchases, etc.
  conversion_value_cents INTEGER,

  -- Podcast-specific
  downloads         INTEGER,
  unique_listeners  INTEGER,

  -- Newsletter-specific
  open_rate         REAL,
  bounce_rate       REAL,

  -- Source and reliability
  source            metric_source NOT NULL,
  is_estimated      BOOLEAN NOT NULL DEFAULT FALSE,
  confidence        REAL,                     -- Data confidence (0.0 - 1.0)
  raw_data          JSONB DEFAULT '{}',       -- Full raw API response for debugging
  notes             TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_performance_publication ON performance_records(publication_id);
CREATE INDEX idx_performance_asset ON performance_records(asset_id);
CREATE INDEX idx_performance_platform ON performance_records(platform_id);
CREATE INDEX idx_performance_recorded ON performance_records(recorded_at);
CREATE INDEX idx_performance_period ON performance_records(period_start, period_end);
```

### 3.14 Products

```sql
CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,             -- "Not Done Yet Community", "Strength Training Course"
  slug              TEXT NOT NULL UNIQUE,
  product_type      product_type NOT NULL,
  description       TEXT,
  price_cents       INTEGER,                   -- Price in cents (NULL for free)
  currency          TEXT DEFAULT 'usd',
  recurring_interval TEXT,                     -- "month", "year", NULL for one-off
  url               TEXT,                      -- Product page URL
  skool_url         TEXT,                      -- Skool community URL if applicable
  beehiiv_id        TEXT,                      -- Beehiiv automation/segment ID
  stripe_price_id   TEXT,                      -- Stripe price ID
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  tier              TEXT,                      -- "standard", "premium", "vip"
  member_count      INTEGER,                   -- Denormalised current member count
  notes             TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at       TIMESTAMPTZ
);

CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_active ON products(is_active);
```

### 3.15 Sponsors

```sql
CREATE TABLE sponsors (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,             -- "Science in Sport", "Wahoo"
  slug              TEXT NOT NULL UNIQUE,
  contact_name      TEXT,
  contact_email     TEXT,
  website_url       TEXT,
  logo_url          TEXT,
  status            sponsor_status NOT NULL DEFAULT 'prospect',
  deal_value_cents  INTEGER,                   -- Total deal value
  deal_currency     TEXT DEFAULT 'usd',
  deal_start_date   DATE,
  deal_end_date     DATE,
  deliverables      JSONB DEFAULT '[]',        -- [{type, count, description}]
  delivered_count   INTEGER DEFAULT 0,
  talking_points    JSONB DEFAULT '[]',        -- Required sponsor mentions/messaging
  restrictions      TEXT,                      -- Content restrictions from sponsor
  notes             TEXT,
  metadata          JSONB DEFAULT '{}',
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at       TIMESTAMPTZ
);

CREATE INDEX idx_sponsors_status ON sponsors(status);
```

### 3.16 Tasks

```sql
CREATE TABLE tasks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  description       TEXT,
  status            task_status NOT NULL DEFAULT 'backlog',
  priority          task_priority NOT NULL DEFAULT 'medium',

  -- Relationships
  asset_id          UUID REFERENCES assets(id) ON DELETE SET NULL,
  campaign_id       UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  publication_id    UUID REFERENCES publications(id) ON DELETE SET NULL,
  parent_task_id    UUID REFERENCES tasks(id) ON DELETE SET NULL,  -- Sub-tasks

  -- Assignment
  assigned_to       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at       TIMESTAMPTZ,

  -- Dates
  due_date          DATE,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,

  -- Metadata
  estimated_minutes INTEGER,                  -- Estimated effort
  actual_minutes    INTEGER,                  -- Actual effort (manual entry)
  sort_order        INTEGER DEFAULT 0,
  labels            JSONB DEFAULT '[]',       -- Freeform labels
  metadata          JSONB DEFAULT '{}',

  -- Lifecycle
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at       TIMESTAMPTZ
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_asset ON tasks(asset_id);
CREATE INDEX idx_tasks_campaign ON tasks(campaign_id);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
```

### 3.17 Content Briefs

```sql
CREATE TABLE content_briefs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id          UUID REFERENCES assets(id) ON DELETE SET NULL,  -- Links to the asset it's briefing
  campaign_id       UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  pillar            content_pillar,
  target_asset_type asset_type,               -- What type of asset this brief is for

  -- Targeting
  primary_query     TEXT,                     -- Primary search query / keyword
  secondary_queries JSONB DEFAULT '[]',
  search_intent     TEXT,                     -- "problem_aware", "education", "evaluation", "commercial"
  target_persona    TEXT,                     -- "tom", "mark", "james", "dave"

  -- Content direction
  angle             TEXT,                     -- Unique angle / hook
  key_messages      JSONB DEFAULT '[]',
  competitor_gaps   TEXT,                     -- What competitors miss
  original_sources  JSONB DEFAULT '[]',       -- Podcast episodes, research, case studies
  answer_capsule    TEXT,                     -- 40-80 word direct answer
  decision_framework TEXT,                    -- Framework for reader decision-making

  -- Internal linking plan
  pillar_page       TEXT,                     -- Slug of pillar page to link to
  related_episodes  JSONB DEFAULT '[]',
  related_tools     JSONB DEFAULT '[]',
  cta_url           TEXT,
  cta_text          TEXT,

  -- Cannibalisation check
  existing_pages    JSONB DEFAULT '[]',       -- [{slug, ranking, traffic}]
  cannibalisation_decision TEXT,              -- "new_page", "merge", "update", "redirect"
  cannibalisation_rationale TEXT,

  -- Review
  status            TEXT DEFAULT 'draft',     -- "draft", "submitted", "approved", "rejected", "revision_requested"
  approved_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at       TIMESTAMPTZ,
  rejection_reason  TEXT,

  -- Lifecycle
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at       TIMESTAMPTZ
);

CREATE INDEX idx_briefs_asset ON content_briefs(asset_id);
CREATE INDEX idx_briefs_campaign ON content_briefs(campaign_id);
CREATE INDEX idx_briefs_status ON content_briefs(status);
CREATE INDEX idx_briefs_pillar ON content_briefs(pillar);
```

### 3.18 Ideas

```sql
CREATE TABLE ideas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,             -- Quick capture title
  description       TEXT,                      -- Expanded description
  status            idea_status NOT NULL DEFAULT 'captured',
  pillar            content_pillar,
  source            TEXT,                      -- "podcast", "conversation", "competitor", "audience", "trend", "manual"
  source_url        TEXT,                      -- URL if idea came from the web
  target_asset_type asset_type,                -- Suggested asset type
  target_platforms  JSONB DEFAULT '[]',        -- Suggested platforms
  priority          task_priority DEFAULT 'medium',
  vote_count        INTEGER NOT NULL DEFAULT 0,  -- Team voting on ideas
  assigned_to       UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- When an idea becomes an asset
  converted_to_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  converted_at      TIMESTAMPTZ,

  -- Lifecycle
  created_by        UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at       TIMESTAMPTZ
);

CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_pillar ON ideas(pillar);
CREATE INDEX idx_ideas_created_by ON ideas(created_by);
CREATE INDEX idx_ideas_priority ON ideas(priority);
```

### 3.19 Comments

```sql
CREATE TABLE comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body              TEXT NOT NULL,

  -- Polymorphic parent: one of these will be set
  asset_id          UUID REFERENCES assets(id) ON DELETE CASCADE,
  campaign_id       UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  task_id           UUID REFERENCES tasks(id) ON DELETE CASCADE,
  publication_id    UUID REFERENCES publications(id) ON DELETE CASCADE,
  idea_id           UUID REFERENCES ideas(id) ON DELETE CASCADE,
  content_brief_id  UUID REFERENCES content_briefs(id) ON DELETE CASCADE,

  -- Threading
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- Mentions
  mentions          JSONB DEFAULT '[]',        -- [{user_id, display_name}]

  -- Lifecycle
  author_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  edited_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at       TIMESTAMPTZ

  -- Constraint: exactly one parent entity must be set
  -- Enforced at application layer, not DB (to keep schema simple)
);

CREATE INDEX idx_comments_asset ON comments(asset_id);
CREATE INDEX idx_comments_campaign ON comments(campaign_id);
CREATE INDEX idx_comments_task ON comments(task_id);
CREATE INDEX idx_comments_publication ON comments(publication_id);
CREATE INDEX idx_comments_idea ON comments(idea_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
```

### 3.20 Activity Log

```sql
CREATE TABLE activity_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action            activity_action NOT NULL,
  description       TEXT,                      -- Human-readable description

  -- What was acted on (polymorphic)
  entity_type       TEXT NOT NULL,             -- "asset", "campaign", "task", "publication", etc.
  entity_id         UUID NOT NULL,
  entity_title      TEXT,                      -- Denormalised title for display

  -- What changed
  field_changed     TEXT,                      -- Which field changed (for updates)
  old_value         TEXT,                      -- Previous value (as text)
  new_value         TEXT,                      -- New value (as text)
  changes           JSONB DEFAULT '{}',        -- Full diff for complex changes

  -- Who did it
  actor_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_name        TEXT,                      -- Denormalised for display

  -- Context
  ip_address        TEXT,
  user_agent        TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_actor ON activity_log(actor_id);
CREATE INDEX idx_activity_action ON activity_log(action);
CREATE INDEX idx_activity_created ON activity_log(created_at);
```

### 3.21 Content Clusters

```sql
CREATE TABLE content_clusters (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,             -- "Zone 2 Training Hub"
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  pillar            content_pillar,
  pillar_asset_id   UUID REFERENCES assets(id) ON DELETE SET NULL,  -- The main pillar page
  target_query      TEXT,                      -- Primary keyword cluster targets
  related_queries   JSONB DEFAULT '[]',
  status            TEXT DEFAULT 'planned',    -- "planned", "building", "complete", "needs_update"
  asset_count       INTEGER NOT NULL DEFAULT 0,  -- Denormalised count
  coverage_score    REAL,                      -- 0.0 - 1.0 how well the cluster covers its topic
  notes             TEXT,
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at       TIMESTAMPTZ
);

CREATE INDEX idx_clusters_pillar ON content_clusters(pillar);
CREATE INDEX idx_clusters_status ON content_clusters(status);

-- Junction table: cluster membership
CREATE TABLE content_cluster_assets (
  cluster_id        UUID NOT NULL REFERENCES content_clusters(id) ON DELETE CASCADE,
  asset_id          UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  role              TEXT DEFAULT 'supporting', -- "pillar", "supporting", "related"
  sort_order        INTEGER DEFAULT 0,
  added_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (cluster_id, asset_id)
);
```

### 3.22 Platform Connections (OAuth & API Keys)

```sql
CREATE TABLE platform_connections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id       UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  connection_type   TEXT NOT NULL,             -- 'oauth2', 'api_key', 'rss'
  
  -- OAuth2 fields
  access_token      TEXT,                      -- Encrypted at rest
  refresh_token     TEXT,                      -- Encrypted at rest
  token_expires_at  TIMESTAMPTZ,
  oauth_scope       TEXT,                      -- Granted scopes
  oauth_account_id  TEXT,                      -- Platform account ID from OAuth
  oauth_email       TEXT,                      -- Email used for OAuth (e.g. ted@roadmancycling.com)
  
  -- API key fields
  api_key           TEXT,                      -- Encrypted at rest
  
  -- RSS fields
  feed_url          TEXT,                      -- RSS feed URL
  
  -- Connection state
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  last_sync_at      TIMESTAMPTZ,
  last_sync_status  TEXT,                      -- 'success', 'partial', 'failed'
  last_error        TEXT,
  error_count       INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  settings          JSONB DEFAULT '{}',        -- Platform-specific sync settings
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_platform_connections_platform ON platform_connections(platform_id);
CREATE UNIQUE INDEX idx_platform_connections_unique ON platform_connections(platform_id, connection_type);
```

### 3.23 Sync Jobs

```sql
CREATE TABLE sync_jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id     UUID NOT NULL REFERENCES platform_connections(id) ON DELETE CASCADE,
  job_type          TEXT NOT NULL,             -- 'daily_analytics', 'weekly_deep', 'bulk_import', 'webhook'
  status            TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'running', 'completed', 'failed', 'cancelled'
  
  -- Progress tracking
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  records_created   INTEGER DEFAULT 0,
  records_updated   INTEGER DEFAULT 0,
  records_failed    INTEGER DEFAULT 0,
  
  -- Error handling
  error_message     TEXT,
  error_details     JSONB DEFAULT '{}',
  retry_count       INTEGER NOT NULL DEFAULT 0,
  max_retries       INTEGER NOT NULL DEFAULT 3,
  next_retry_at     TIMESTAMPTZ,
  
  -- Job parameters
  params            JSONB DEFAULT '{}',        -- Date ranges, filters, etc.
  result_summary    JSONB DEFAULT '{}',        -- Summary of what was synced
  
  -- Audit
  triggered_by      TEXT NOT NULL DEFAULT 'cron',  -- 'cron', 'webhook', 'manual', 'bulk_import'
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_connection ON sync_jobs(connection_id);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX idx_sync_jobs_type ON sync_jobs(job_type);
CREATE INDEX idx_sync_jobs_created ON sync_jobs(created_at);
```

### 3.24 Content Embeddings (Semantic Search)

```sql
-- Requires: CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE content_embeddings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source reference (polymorphic)
  entity_type       TEXT NOT NULL,             -- 'asset', 'transcript_chunk', 'idea'
  entity_id         UUID NOT NULL,
  
  -- Embedding data
  embedding         vector(1536),              -- OpenAI text-embedding-3-small dimensions
  chunk_text        TEXT NOT NULL,             -- The text that was embedded
  chunk_index       INTEGER DEFAULT 0,         -- For chunked content (transcripts)
  
  -- Metadata
  model             TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  token_count       INTEGER,
  
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_embeddings_entity ON content_embeddings(entity_type, entity_id);
CREATE INDEX idx_embeddings_vector ON content_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

## 4. Feature Set

The platform ships with 17 core features. Each feature lists the routes and components it requires.

### Feature 1: Authentication & User Management

Users log in with email/password via Supabase Auth. Profiles are pre-seeded for the 5 launch users. Admin can manage users from settings.

**Routes:** `/login`, `/settings/team`
**Components:** Login form, UserManagement table
**Complexity:** S

### Feature 2: Weekly Focus Campaign Dashboard

The home page. Shows the current week's campaign prominently with its assets, tasks, and publication schedule. Upcoming and past weekly focuses are listed below. This is the single most important view — everything else radiates from here.

**Routes:** `/` (redirects to `/campaigns`), `/campaigns`, `/campaigns/[id]`, `/campaigns/new`, `/campaigns/[id]/edit`
**Components:** `WeeklyFocusBanner`, `CampaignCard`, `CampaignForm`, campaign asset list, campaign task list
**Complexity:** L

### Feature 3: Asset Library

Browse, search, and filter all content assets. Create new assets, edit metadata, view the source→derivative tree. Filter by type, status, pillar, campaign, assigned user.

**Routes:** `/assets`, `/assets/[id]`, `/assets/new`, `/assets/[id]/edit`
**Components:** `AssetCard`, `AssetForm`, `AssetFilters`, `DerivativeTree`, asset list with pagination
**Complexity:** L

### Feature 4: Asset Source→Derivative Linking

When creating or editing an asset, users can link it to a source asset. The asset detail page shows the full derivation tree — e.g., a podcast episode with its blog post, social posts, and quote cards as children.

**Routes:** Part of `/assets/[id]`
**Components:** `DerivativeTree` (visual tree component), source asset selector in `AssetForm`
**Complexity:** M

### Feature 5: Topic & Tag Management

Admin manages the controlled topic taxonomy (linked to pillars). All users can create and apply freeform tags. Topics and tags are applied to assets via multi-select inputs.

**Routes:** `/settings/topics`
**Components:** `TagInput` (with autocomplete + create), topic CRUD table, pillar filter
**Complexity:** M

### Feature 6: Publication Calendar

A visual calendar showing what's scheduled and published across all platforms. Week view by default, with month view toggle. Click a day to see all publications. Click a publication to edit. Drag to reschedule (stretch goal).

**Routes:** `/calendar`
**Components:** `PublicationCalendar` (week + month views), `PublicationCard`, `ScheduleForm`
**Complexity:** L

### Feature 7: Publication Scheduling

Create publication records linking an asset to a platform with a scheduled date/time. Platform-specific fields (hashtags, platform title, platform body) can differ from the source asset. Bulk schedule across multiple platforms from the asset detail page.

**Routes:** Part of `/assets/[id]` and `/calendar`
**Components:** `ScheduleForm` (with platform selector, date/time picker, platform-specific fields)
**Complexity:** M

### Feature 8: Platform Management

Configure the platforms Roadman publishes to. Each platform has posting constraints (character limits, image sizes, ideal times) and reuse policies.

**Routes:** `/settings/platforms`
**Components:** Platform CRUD table, reuse policy editor
**Complexity:** S

### Feature 9: Task Management

A task board for content workflow. Tasks link to assets, campaigns, and publications. Kanban view (backlog → todo → in progress → in review → done) and list view. Assignable to team members.

**Routes:** `/tasks`
**Components:** `TaskBoard` (kanban), `TaskCard`, `TaskForm`, filters (by assignee, status, campaign)
**Complexity:** M

### Feature 10: Ideas Quick Capture

A lightweight interface for capturing content ideas fast. Minimal required fields (just a title). Ideas can be promoted to full assets. Voting for team prioritisation.

**Routes:** `/ideas`
**Components:** Quick-capture input, idea list with vote buttons, promote-to-asset action
**Complexity:** S

### Feature 11: Transcript Viewer with Highlights

View podcast/video transcripts with timestamped segments. Team members highlight noteworthy sections (quotes, insights, clip-worthy moments) and tag them. Highlights feed into content brief creation and derivative asset planning.

**Routes:** `/transcripts`, `/transcripts/[id]`
**Components:** `TranscriptViewer` (scrollable, timestamped), `HighlightMarker` (selection-based highlighting)
**Complexity:** M

### Feature 12: Performance Tracking (API-Driven)

Automated performance data collection via platform APIs (YouTube, Meta, LinkedIn, Spotify, Beehiiv, GA4). No manual metric entry — all data is pulled from connected platforms on a scheduled basis. Dashboard shows key metrics with trend indicators. Performance classification (exceptional / strong / average / weak) is calculated automatically based on platform-specific benchmarks derived from Roadman's historical data. Performance data links back to assets and campaigns for ROI analysis.

**Routes:** `/performance`, `/settings/integrations`
**Components:** `MetricCard`, `PerformanceChart`, `PlatformSyncStatus`, performance dashboard, benchmark configuration
**Complexity:** L

### Feature 13: Comments & Activity Log

Threaded comments on assets, campaigns, tasks, publications, and ideas. Activity log records all state changes with who/what/when for audit and team awareness.

**Routes:** Comment panels embedded in detail pages; activity log in sidebar or dedicated feed
**Components:** Comment thread component, activity feed component
**Complexity:** M

### Feature 14: Global Search

Full-text search across assets, transcripts, campaigns, ideas, and tasks. Results grouped by entity type with quick navigation.

**Routes:** `/api/search`, search bar in header
**Components:** `SearchBar` (with typeahead), search results page
**Complexity:** M

### Feature 15: Platform Integrations

OAuth2 and API key connections to YouTube (Data API v3 + Analytics API), Meta Graph API (Instagram + Facebook), LinkedIn API, Spotify for Podcasters / RSS, Beehiiv API, and Google Analytics 4. Each integration has a connection management UI, sync status indicators, and error handling. Connected via ted@roadmancycling.com for OAuth2 platforms.

**Routes:** `/settings/integrations`, `/settings/integrations/[platform]`
**Components:** `ConnectionCard`, `OAuthFlow`, `SyncStatusBadge`, `IntegrationSettings`
**Complexity:** L

### Feature 16: Auto-Import & Sync

On first setup, bulk import existing content from YouTube (both channels), podcast RSS feed, website blog posts, and Beehiiv newsletters — creating asset and publication records automatically. Ongoing scheduled sync via Vercel Cron Jobs: daily analytics pulls and weekly deep syncs. Webhook receivers for platforms that support push notifications. Data freshness indicators show when each platform was last synced.

**Routes:** `/settings/import`, API cron routes
**Components:** `ImportWizard`, `SyncStatusDashboard`, `DataFreshnessIndicator`
**Complexity:** L

### Feature 17: Semantic Search & Intelligence

Embedding-based semantic search using pgvector. Content similarity detection ("find content similar to this episode"), content gap analysis across pillars and topics, duplicate/overlap detection, and reuse recommendations. Embeddings generated for asset descriptions, transcript chunks, and ideas.

**Routes:** Part of `/api/search`, `/intelligence`
**Components:** `SimilarContentPanel`, `ContentGapReport`, `DuplicateDetector`
**Complexity:** L

---

## 5. Build Plan

The full build is organised into 8 phases. Each phase delivers a deployable increment. Work is designed for Claude in Dispatch sessions — each ticket is scoped to be completable in a single session. The detailed ticket breakdown is in `ROADMAN-OS-BUILD-TICKETS.md`.

### Phase 1: Foundation (Tickets 1–6)

**Goal:** Deployable shell with auth, database, permissions, and navigation.

| # | Ticket | Size | Description |
|---|--------|------|-------------|
| 1 | Project scaffolding | S | Next.js project, Supabase project, Vercel deployment, env vars |
| 2 | Database schema | L | Full initial migration: all tables, indexes, enums, pgvector extension |
| 3 | Supabase Auth setup | S | Email/password auth, middleware, session handling |
| 4 | User seeding + profiles | S | Seed 5 profiles with correct roles, auto-creation trigger |
| 5 | App shell + sidebar | M | Layout, sidebar nav, header, mobile nav, dark brand theme |
| 6 | Permission system | S | Role-based permission checks, `usePermissions` hook |

### Phase 2: Content Core (Tickets 7–15)

**Goal:** Full content asset management with taxonomy, files, and campaigns.

| # | Ticket | Size | Description |
|---|--------|------|-------------|
| 7 | Campaign CRUD | M | Create, read, update campaigns with full form |
| 8 | Weekly Focus Banner | M | Hero component showing current week's campaign |
| 9 | Campaign detail + list | M | Campaign overview with linked assets, filterable list |
| 10 | Asset CRUD | L | Full asset form with type-specific sections |
| 11 | Asset list + search | M | Filterable, searchable asset library with full-text search |
| 12 | File upload + management | M | Supabase Storage integration, external references, file list |
| 13 | Source→derivative linking | M | Parent-child asset relationships, derivative tree view |
| 14 | Topic + tag system | M | Controlled taxonomy, freeform tags, asset assignment |
| 15 | Content clusters | M | Content cluster management, pillar page linking |

### Phase 3: Workflow (Tickets 16–22)

**Goal:** Content workflow tools — tasks, briefs, calendar, ideas, approvals.

| # | Ticket | Size | Description |
|---|--------|------|-------------|
| 16 | Platform seeding + management | S | Platform CRUD, seed Roadman's 10 platforms |
| 17 | Publication CRUD + bulk scheduling | M | Schedule assets to platforms, bulk schedule |
| 18 | Publication calendar view | L | Week + month calendar with platform colour coding |
| 19 | Task CRUD + board | M | Kanban board, list view, assignment, sub-tasks |
| 20 | Content briefs + approval flow | M | Brief creation, submission, approval/rejection workflow |
| 21 | Ideas quick capture | S | Rapid idea entry, voting, promote to asset |
| 22 | Notifications | M | In-app notifications for assignments, approvals, mentions |

### Phase 4: Platform Integrations (Tickets 23–30)

**Goal:** Every external platform connected via API with OAuth2 or API keys.

| # | Ticket | Size | Description |
|---|--------|------|-------------|
| 23 | Integration settings UI | M | Connection management page, OAuth flow, API key entry |
| 24 | YouTube integration | L | Data API v3 + Analytics API for both channels |
| 25 | Meta integration (IG + FB) | L | Graph API for @roadman.cycling + FB page |
| 26 | LinkedIn integration | M | Post performance, impressions, engagement |
| 27 | Spotify / podcast integration | M | RSS feed import + Spotify for Podcasters API |
| 28 | Beehiiv integration | M | Newsletter performance, subscriber growth |
| 29 | GA4 integration | M | Website content performance, traffic sources, events |
| 30 | Skool integration | S | Community metrics (API if available, manual fallback) |

### Phase 5: Auto-Import & Sync (Tickets 31–35)

**Goal:** Bulk import existing content and set up ongoing sync.

| # | Ticket | Size | Description |
|---|--------|------|-------------|
| 31 | Bulk import — YouTube | L | Import all published videos from both channels as assets |
| 32 | Bulk import — podcast + blog + Beehiiv | M | Import episodes via RSS, blog posts, newsletters |
| 33 | Vercel Cron sync jobs | M | Daily analytics sync, weekly deep sync |
| 34 | Webhook receivers | M | YouTube push notifications, Beehiiv webhooks |
| 35 | Sync status dashboard | S | Connection health, last sync times, error reporting |

### Phase 6: Search & Intelligence (Tickets 36–39)

**Goal:** Semantic search with pgvector, content gap detection, duplicate detection.

| # | Ticket | Size | Description |
|---|--------|------|-------------|
| 36 | Embedding generation pipeline | M | Generate embeddings for assets, transcript chunks, ideas |
| 37 | Semantic search | M | "Find similar content", similarity scores, combined with FTS |
| 38 | Content gap detection | M | Identify under-covered topics across pillars |
| 39 | Duplicate detection + reuse recommendations | M | Flag overlapping content, suggest repurposing |

### Phase 7: Reporting & Dashboards (Tickets 40–44)

**Goal:** Performance dashboards, campaign scorecards, sponsor reporting.

| # | Ticket | Size | Description |
|---|--------|------|-------------|
| 40 | Performance dashboard | L | Cross-platform metrics, trend indicators, benchmarking |
| 41 | Campaign scorecards | M | Campaign-level ROI, asset performance within campaigns |
| 42 | Sponsor reporting | M | Deliverable tracking, performance reports for sponsors |
| 43 | Content decay alerts | M | Identify content losing performance, suggest refresh |
| 44 | Transcript viewer + highlights | M | Timestamped transcripts, selection-based highlighting |

### Phase 8: Polish & Team Onboarding (Tickets 45–50)

**Goal:** Production hardening, mobile responsiveness, team training.

| # | Ticket | Size | Description |
|---|--------|------|-------------|
| 45 | Comments system | M | Threaded comments on all entity types, @-mentions |
| 46 | Activity log | M | Automatic activity recording, feed display |
| 47 | Global search (full-text + semantic) | M | Combined FTS + vector search, typeahead, Cmd+K |
| 48 | Polish + bug fixes | M | Loading states, error handling, mobile responsiveness |
| 49 | Tagging rules + operational setup | S | Auto-tagging rules, workflow templates, team conventions |
| 50 | Launch prep + team onboarding | S | DNS, SSL, seed data, team training, user docs |

### Build Summary

| Phase | Tickets | Focus |
|-------|---------|-------|
| 1 | 1–6 | Foundation |
| 2 | 7–15 | Content Core |
| 3 | 16–22 | Workflow |
| 4 | 23–30 | Platform Integrations |
| 5 | 31–35 | Auto-Import & Sync |
| 6 | 36–39 | Search & Intelligence |
| 7 | 40–44 | Reporting & Dashboards |
| 8 | 45–50 | Polish & Team Onboarding |
| **Total** | **50** | **Full platform** |

**Size distribution:** S × 10, M × 33, L × 7

---

## 6. Auth Strategy

### Supabase Auth with Email/Password

For 5 known internal users, email/password auth via Supabase is the simplest path. No social login, no magic links, no SSO — just email and password.

**Setup:**

1. Create users in Supabase Auth dashboard (or via admin API)
2. Each auth user has a corresponding `profiles` row (created via trigger or seeding)
3. Next.js middleware checks for valid session on every request except `/login`
4. The `@supabase/ssr` package handles cookie-based session management

**Session flow:**

```
User → /login → enters email + password
       → Supabase auth.signInWithPassword()
       → Supabase sets session cookies (access_token + refresh_token)
       → Middleware reads cookies, creates server-side Supabase client
       → All server components/actions use the authenticated client
       → RLS policies enforce data access
```

**Middleware (`src/middleware.ts`):**

```
Every request:
  1. Read Supabase session from cookies
  2. If expired, attempt silent refresh
  3. If no valid session and not on /login → redirect to /login
  4. If valid session and on /login → redirect to /
```

### Role-Based Access Control

Permissions are checked at two levels:

1. **Database (RLS):** Supabase Row Level Security policies prevent direct data access violations. All users can read most tables. Write access is restricted by role using the `profiles.role` column joined via `auth.uid()`.

2. **Application (UI):** Components conditionally render based on the current user's role. The `usePermissions()` hook and `checkPermission()` server utility provide a consistent API:

```typescript
// Server-side
const canPublish = await checkPermission(userId, 'publications', 'publish');

// Client-side (hook reads from session context)
const { can } = usePermissions();
if (can('publications', 'publish')) { ... }
```

### Role Definitions

| Role | Description | Typical User |
|------|-------------|-------------|
| `admin` | Full access to everything, including user management and settings | Anthony |
| `leadership` | Full access to content and campaigns, can approve and publish | — |
| `content_manager` | Manages content workflow, can assign tasks and publish | Sarah |
| `creator` | Creates and edits own assets, works on assigned tasks | Caoimhe, Wes |
| `social_publisher` | Focuses on publication scheduling and social content | Matthew |
| `coach` | Read-heavy access with ability to create content and ideas | — |
| `commercial` | Read-only access for commercial/sponsorship visibility | — |

---

## 7. API Design

The API layer uses a hybrid approach: **Server Actions** for mutations (create, update, delete) and **Route Handlers** for reads that need to support non-React consumers (search, file upload, performance data ingestion). This matches the pattern established on roadmancycling.com.

### Server Actions (Mutations)

All Server Actions live in `src/lib/actions/` and use `'use server'` directives. They validate input with Zod, check permissions, perform the operation, and revalidate relevant paths.

```
POST operations via Server Actions:
  createCampaign(formData)    → validates, inserts, logs activity, revalidates /campaigns
  updateCampaign(id, formData) → validates, updates, logs activity, revalidates /campaigns/[id]
  archiveCampaign(id)         → soft delete, logs activity
  createAsset(formData)       → validates, inserts, handles topic/tag assignments
  updateAsset(id, formData)   → validates, updates, handles topic/tag diffs
  linkDerivative(childId, parentId) → sets source_asset_id
  schedulePublication(formData) → validates, inserts publication record
  createTask(formData)        → validates, inserts, notifies assignee
  updateTaskStatus(id, status) → updates, logs activity
  captureIdea(formData)       → minimal validation, fast insert
  promoteIdea(ideaId, assetData) → creates asset from idea, links them
  addComment(formData)        → validates, inserts, extracts mentions
  addHighlight(formData)      → validates, inserts transcript highlight
  uploadFile(formData)        → streams to Supabase Storage, inserts file record
```

### Route Handlers (Reads & Special Operations)

```
GET  /api/search?q=...&type=...&pillar=...
  → Full-text search across assets, transcripts, campaigns, ideas, tasks
  → Returns grouped results with highlights

POST /api/upload
  → Multipart file upload → Supabase Storage
  → Returns file record with storage URL

GET  /api/assets?type=...&status=...&pillar=...&campaign=...&page=...
  → Paginated, filtered asset list (for DataTable)

GET  /api/campaigns/current
  → Returns the active weekly_focus campaign (for WeeklyFocusBanner)

GET  /api/publications?from=...&to=...&platform=...
  → Publications for the calendar view (date range query)

POST /api/performance
  → Batch insert performance records (for future automated ingestion)

GET  /api/performance/summary?asset=...&platform=...&period=...
  → Aggregated performance data for dashboard cards
```

### Error Handling Pattern

All API endpoints follow a consistent error response format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": { "field": "title", "constraint": "required" }
  }
}
```

HTTP status codes: 400 (validation), 401 (not authenticated), 403 (not authorised), 404 (not found), 500 (server error).

---

## 8. Search Strategy

### Full-Text Search (Postgres tsvector)

Postgres full-text search via `tsvector` indexes handles keyword-based searching across structured content. The GIN indexes defined in the schema (on `assets` and `transcripts`) handle the heavy lifting.

**Search implementation:**

```sql
-- Example: search assets
SELECT * FROM assets
WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(body, ''))
  @@ plainto_tsquery('english', $1)
ORDER BY ts_rank(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')),
  plainto_tsquery('english', $1)
) DESC
LIMIT 20;
```

### Semantic Search (pgvector)

pgvector is enabled from day one for embedding-based similarity search. This powers "find content similar to this episode" queries, content gap detection, and duplicate identification.

**Embedding strategy:**

- **Model:** OpenAI `text-embedding-3-small` (1536 dimensions, cost-effective for this scale)
- **What gets embedded:** Asset titles + descriptions, transcript chunks (500-token windows with 100-token overlap), idea titles + descriptions
- **Storage:** `content_embeddings` table with `vector(1536)` column, IVFFlat index for fast nearest-neighbour queries
- **Generation:** Embeddings are created on asset creation/update and during transcript import. A background job handles bulk embedding for existing content.

**Semantic search implementation:**

```sql
-- Find assets similar to a given embedding
SELECT ce.entity_type, ce.entity_id, ce.chunk_text,
       1 - (ce.embedding <=> $1) AS similarity
FROM content_embeddings ce
WHERE ce.entity_type = 'asset'
ORDER BY ce.embedding <=> $1
LIMIT 10;
```

### Combined Search

The search endpoint combines both approaches:

1. **Keyword search** runs first via tsvector, returning ranked results with highlighted matches
2. **Semantic search** runs in parallel, returning similar content by meaning
3. Results are merged, deduplicated, and presented in grouped sections (assets, campaigns, transcripts, ideas, tasks)

**Search features:**

- Typeahead in the search bar (debounced, 200ms)
- Results grouped by entity type
- Filter by type, pillar, status
- Highlighted matching text in results
- "Find similar" button on any asset or transcript
- `Cmd+K` shortcut to focus search
- Recent searches stored in `localStorage`

### Intelligence Features Built on Embeddings

- **Content gap detection:** Compare the embedding space coverage of each pillar/topic against a target distribution. Sparse areas indicate content gaps.
- **Duplicate detection:** Flag assets with cosine similarity > 0.92 for review. Prevents accidental content overlap.
- **Reuse recommendations:** When creating a new asset, surface existing content that covers similar ground — useful for repurposing and internal linking.

---

## 9. File Storage

### Strategy: Hybrid — Supabase Storage + External References

Not all files should be stored in Supabase. The strategy is:

**Store in Supabase Storage (small files, under 50MB):**

- Thumbnail images
- Quote card PNGs
- Content brief PDFs
- Blog post images
- Social media assets (carousels, stories)
- Documents (docx, xlsx, pdf)
- Brand assets

**Reference externally (large files, already hosted elsewhere):**

- Full podcast episodes (Spotify, Apple Podcasts)
- YouTube videos (already on YouTube)
- Raw audio recordings (Google Drive)
- Video edits (Google Drive or Dropbox)
- Large document collections (Google Drive)

### Supabase Storage Configuration

```
Buckets:
  assets/          → Asset-related files (images, PDFs, documents)
  thumbnails/      → Auto-generated and uploaded thumbnails
  uploads/         → Temporary upload staging area
```

**File naming convention:** `{asset_id}/{file_id}.{extension}`

**Access:** All buckets are private. Files are accessed via signed URLs generated server-side (1-hour expiry for viewing, 5-minute expiry for uploads).

### How the Files Table Handles Both

The `files` table has two sets of fields:

For **Supabase-stored files:**
- `storage_type = 'supabase'`
- `storage_bucket` = bucket name
- `storage_path` = path within bucket
- `file_size_bytes` = actual file size

For **external references:**
- `storage_type = 'youtube' | 'spotify' | 'google_drive' | 'dropbox' | 'external_url'`
- `external_url` = full URL to the file/resource
- `external_id` = platform-specific ID (e.g., YouTube video ID)
- `embed_url` = embeddable URL (e.g., YouTube embed URL)
- `file_size_bytes` = NULL (unknown for external files)

The `is_primary` flag marks the main file for each asset (e.g., the YouTube video is the primary file for a podcast episode, while quote card PNGs are secondary files).

### Upload Flow

```
1. User selects file in FileUploader component
2. Client requests signed upload URL from /api/upload
3. Server generates signed URL for Supabase Storage
4. Client uploads directly to Supabase (no server relay)
5. On success, server inserts file record into files table
6. File appears in the asset's file list immediately
```

---

## 10. Deployment

### Vercel Project Setup

1. **Create a new Vercel project** — `roadman-os` — completely separate from the `roadman-cycling` project that hosts roadmancycling.com.

2. **Repository:** Separate Git repository (`roadman-os/` at root). Not a monorepo. Clean separation of concerns.

3. **Domain:** `os.roadmancycling.com` — subdomain of the main site. Configure in Vercel project settings and DNS.

4. **Branch deployment:**
   - `main` → production (`os.roadmancycling.com`)
   - `dev` → preview (`dev-os.roadmancycling.com`)

### Supabase Project Setup

1. **Create a new Supabase project** in the Roadman Cycling organisation. Name: `roadman-os`. Region: EU West (London) — closest to the team.

2. **Run initial migration** via Supabase CLI: `supabase db push`

3. **Create auth users** for the 5 team members via the Supabase dashboard.

4. **Seed reference data:**
   - Permissions table (role × resource × action matrix)
   - Platforms (YouTube Main, YouTube Clips, Instagram, Facebook, TikTok, Twitter/X, LinkedIn, Beehiiv Newsletter, Skool, Website)
   - Topics (initial taxonomy from the 5 pillars)
   - Products (NDY Community Standard/Premium/VIP, Roadman Method, Strength Training Course, Toolkit)

5. **Enable RLS** on all tables and write policies.

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...        # Server-side only, never exposed to client

# App
NEXT_PUBLIC_APP_URL=https://os.roadmancycling.com
NEXT_PUBLIC_APP_NAME=Roadman OS

# YouTube (OAuth2 via ted@roadmancycling.com)
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REDIRECT_URI=https://os.roadmancycling.com/api/auth/youtube/callback

# Meta (OAuth2 — Instagram + Facebook)
META_APP_ID=...
META_APP_SECRET=...
META_REDIRECT_URI=https://os.roadmancycling.com/api/auth/meta/callback

# LinkedIn (OAuth2)
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_REDIRECT_URI=https://os.roadmancycling.com/api/auth/linkedin/callback

# Beehiiv
BEEHIIV_API_KEY=...
BEEHIIV_PUBLICATION_ID=...

# Google Analytics 4
GA4_PROPERTY_ID=...
GA4_CLIENT_EMAIL=...                        # Service account email
GA4_PRIVATE_KEY=...                         # Service account private key

# OpenAI (for embeddings)
OPENAI_API_KEY=...

# Vercel Cron
CRON_SECRET=...                             # Shared secret for cron endpoint auth
```

### CI/CD

Vercel handles CI/CD automatically on push. Additional automation:

- Database migration check on PR (Supabase CLI `db diff`)
- Type generation on migration change (`supabase gen types typescript`)
- Cron job health monitoring via Vercel dashboard
- E2E tests with Playwright (added during Phase 8)

### Cost Analysis

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| OpenAI (embeddings) | Pay-as-you-go | ~$2 |
| Domain (subdomain) | Already owned | $0 |
| YouTube API | Free tier | $0 |
| Meta Graph API | Free tier | $0 |
| LinkedIn API | Free tier | $0 |
| Beehiiv API | Included with plan | $0 |
| GA4 API | Free tier | $0 |
| **Total** | | **~$47/month** |

**Why Supabase Pro ($25/month):**

- Edge Functions (required for background sync jobs and webhook handlers)
- 8GB database storage (needed for embeddings, transcripts, and performance records)
- 250GB bandwidth (API sync traffic)
- Daily backups
- 100GB file storage (for thumbnails, documents, graphics)
- No pausing on inactivity

**OpenAI embedding costs:** At ~$0.02 per 1M tokens with `text-embedding-3-small`, embedding the entire Roadman content library (estimated 2,000 assets, 500 transcripts) costs roughly $1-2 for the initial bulk run. Ongoing costs are negligible — a few cents per month for new content.

**All platform APIs are free** at Roadman's scale. YouTube Data API allows 10,000 units/day (one video list call costs 1 unit). Meta, LinkedIn, and GA4 have no per-request charges for read-only analytics access.

---

## 11. Platform Integrations

Every external platform Roadman publishes to is connected via API. No manual data entry for performance metrics — everything is pulled automatically.

### 11.1 YouTube Data API v3 + YouTube Analytics API

**Channels:** The Roadman Podcast (main, 61.7K subscribers) + Roadman Podcast Clips (13.2K subscribers)

**Auth:** OAuth2 via ted@roadmancycling.com. Scopes: `youtube.readonly`, `yt-analytics.readonly`, `yt-analytics-monetary.readonly`.

**Data pulled:**

| Data | API | Frequency |
|------|-----|-----------|
| Published videos (title, description, thumbnail, duration, tags) | Data API v3 `videos.list` | Daily |
| Video performance (views, watch time, CTR, avg view duration) | Analytics API `reports.query` | Daily |
| Subscriber impact per video | Analytics API | Weekly |
| Revenue per video (ad revenue) | Analytics API (monetary) | Weekly |
| Channel-level stats (total subscribers, total views) | Data API v3 `channels.list` | Daily |

**Auto-import:** On first connection, bulk import all published videos from both channels as assets with `asset_type = 'youtube_video'` (main) or `asset_type = 'clip'` (clips channel). Each video creates an asset record, a publication record (platform = YouTube), and a file record (external reference to YouTube URL).

**Rate limits:** 10,000 quota units/day. A `videos.list` call costs 1 unit. A `reports.query` call costs ~50 units. Daily sync for both channels uses approximately 500 units — well within limits.

### 11.2 Meta Graph API (Instagram + Facebook)

**Accounts:** @roadman.cycling (Instagram, 49.4K followers) + Roadman Cycling (Facebook page, 29.9K followers)

**Auth:** OAuth2 via Meta Business account. Scopes: `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`, `pages_show_list`, `read_insights`.

**Data pulled:**

| Data | Endpoint | Frequency |
|------|----------|-----------|
| Instagram posts/reels (media, caption, timestamp) | `/{user-id}/media` | Daily |
| Instagram insights (reach, impressions, engagement, saves, shares) | `/{media-id}/insights` | Daily |
| Instagram video views | `/{media-id}/insights` | Daily |
| Facebook posts | `/{page-id}/posts` | Daily |
| Facebook insights (reach, impressions, engagement) | `/{post-id}/insights` | Daily |
| Follower counts | `/{user-id}` / `/{page-id}` | Daily |

**Auto-import:** Import recent posts/reels from Instagram and Facebook as publication records linked to the respective platform. Where a post matches an existing asset (by URL or title), link them automatically.

**Rate limits:** 200 calls/user/hour for Instagram. Pagination handled for bulk imports. Daily sync uses approximately 50-80 calls — well within limits.

### 11.3 LinkedIn API

**Auth:** OAuth2. Scopes: `r_organization_social`, `rw_organization_admin`.

**Data pulled:**

| Data | Endpoint | Frequency |
|------|----------|-----------|
| Post performance | Organization Posts API | Daily |
| Impressions, clicks, engagement rate | Post Statistics API | Daily |
| Follower count and demographics | Organization API | Weekly |

**Rate limits:** 100 calls/day for most endpoints. Daily sync stays well within this.

### 11.4 Spotify for Podcasters API / RSS Feed

**Channels:** Roadman Cycling Podcast

**Approach:** Dual — RSS feed for episode metadata, Spotify for Podcasters API for analytics (if available). The RSS feed is the primary source for episode imports as it is platform-agnostic and always accessible.

**Data pulled:**

| Data | Source | Frequency |
|------|--------|-----------|
| Episode metadata (title, description, duration, publish date) | RSS feed | Daily |
| Download counts | Spotify for Podcasters API | Daily |
| Listener demographics (age, gender, location) | Spotify for Podcasters API | Weekly |
| Listening platforms breakdown | Spotify for Podcasters API | Weekly |

**Auto-import:** On first connection, parse the full RSS feed and create asset records for every episode (`asset_type = 'podcast_episode'`). Match against existing YouTube video assets by episode number or title to establish source→derivative relationships.

### 11.5 Beehiiv API

**Publication:** Roadman Cycling newsletter (29,782 contacts)

**Auth:** API key (from Beehiiv dashboard).

**Data pulled:**

| Data | Endpoint | Frequency |
|------|----------|-----------|
| Newsletter sends (subject, content, send date) | `/publications/{id}/posts` | Daily |
| Open rates, click rates | `/publications/{id}/posts/{id}/stats` | Daily |
| Subscriber count and growth | `/publications/{id}/stats` | Daily |
| Subscriber segments | `/publications/{id}/segments` | Weekly |
| Automations performance | `/publications/{id}/automations` | Weekly |

**Auto-import:** Import all sent newsletters as assets (`asset_type = 'newsletter'`) with performance records. The 29,782-contact list is Roadman's largest owned audience asset — tracking its growth and engagement is a top priority.

**Note:** Email is on Beehiiv, not ClickFunnels. All email-related metrics and operations reference Beehiiv.

### 11.6 Google Analytics 4 (GA4)

**Property:** roadmancycling.com

**Auth:** Service account with GA4 Data API access (no OAuth2 needed — server-to-server).

**Data pulled:**

| Data | Report Type | Frequency |
|------|-------------|-----------|
| Page views per article/tool | `runReport` | Daily |
| Traffic sources (organic, social, direct, referral) | `runReport` | Daily |
| User engagement (avg engagement time, bounce rate) | `runReport` | Daily |
| Conversion events (newsletter signups, Skool clicks) | `runReport` | Daily |
| Top landing pages | `runReport` | Weekly |
| Device/browser breakdown | `runReport` | Weekly |

**Matching:** GA4 page paths are matched to asset records by `canonical_url` or `external_url` to connect website performance data back to content assets.

### 11.7 Supabase Storage

Direct file uploads for thumbnails, documents, and graphics (small files under 50MB). Large video and audio files stay as external links to their native platforms (YouTube, Spotify). See Section 9 for full storage strategy.

### 11.8 Skool API

**Communities:** Roadman Cycling Clubhouse (free, 1,852 members) + Not Done Yet (paid, 113 members at $195/month)

**Approach:** Skool does not currently offer a public API. Metrics are either pulled via the Skool admin interface (browser automation) or entered manually. If Skool releases an API, a connector will be built.

**Data tracked:**

| Metric | Source | Frequency |
|--------|--------|-----------|
| Member count (free + paid) | Manual or browser automation | Weekly |
| New joins / churn | Manual | Weekly |
| Engagement metrics (posts, comments, reactions) | Manual | Weekly |
| Tier breakdown (Standard / Premium / VIP) | Manual | Weekly |

**Skool URLs:** Free community: https://www.skool.com/roadmancycling | Paid (NDY): https://www.skool.com/roadmancycling (separate access level)

---

## 12. Sync Architecture

### 12.1 Sync Schedule

| Job | Frequency | Trigger | Platforms |
|-----|-----------|---------|-----------|
| Daily analytics | Every day at 06:00 UTC | Vercel Cron | YouTube, Meta, LinkedIn, Beehiiv, GA4 |
| Weekly deep sync | Every Monday at 03:00 UTC | Vercel Cron | All platforms (full re-pull with deeper metrics) |
| Real-time webhooks | On event | Platform push | YouTube (new video), Beehiiv (new send) |
| Manual trigger | On demand | UI button | Any platform |

### 12.2 Vercel Cron Jobs

Configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-sync",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/weekly-sync",
      "schedule": "0 3 * * 1"
    }
  ]
}
```

Each cron endpoint validates the `CRON_SECRET` header before executing. The endpoint creates `sync_jobs` records and orchestrates the sync for each connected platform.

### 12.3 Webhook Receivers

**YouTube:** Uses the YouTube Data API push notification system (PubSubHubbub). When a new video is published on either channel, YouTube sends a notification to `/api/webhooks/youtube`, which creates the asset and publication records immediately.

**Beehiiv:** When a newsletter is sent, Beehiiv sends a webhook to `/api/webhooks/beehiiv` with the post data. The handler creates an asset record and starts tracking performance.

All webhook endpoints validate signatures/tokens before processing. Failed webhooks are logged and retried via the sync_jobs table.

### 12.4 Background Job Queue

For operations that take longer than Vercel's serverless function timeout (currently 60 seconds on Pro):

**Option A — Supabase Edge Functions:** Deploy long-running sync jobs as Supabase Edge Functions. The Vercel cron endpoint triggers the Edge Function via HTTP, which processes in the background. Edge Functions have a 150-second timeout on the Pro plan.

**Option B — Inngest:** Use Inngest for durable, retriable background jobs. Inngest integrates with Vercel and provides automatic retries, step functions, and observability. Free tier covers the sync workload comfortably.

**Recommended:** Start with Supabase Edge Functions for simplicity (already in the stack). Move to Inngest if job complexity grows.

### 12.5 Rate Limiting & Error Handling

Each platform integration module implements:

- **Rate limit tracking:** Store remaining API quota in `platform_connections.settings` JSONB. Respect `Retry-After` headers. Back off exponentially on 429 responses.
- **Error classification:** Transient errors (timeout, 500, rate limit) trigger automatic retry. Permanent errors (401 auth expired, 403 permission denied) pause the connection and alert the team.
- **Retry strategy:** Failed jobs are retried up to 3 times with exponential backoff (1 min, 5 min, 30 min). After 3 failures, the job is marked as failed and appears in the sync status dashboard.
- **Circuit breaker:** If a platform connection fails 5 times in a row, it is automatically deactivated. The admin must manually re-enable it after investigating.

### 12.6 Data Freshness Indicators

Every entity that receives data from platform APIs displays a freshness indicator:

- **Green dot:** Data updated within the last 24 hours
- **Amber dot:** Data is 1-3 days old
- **Red dot:** Data is more than 3 days old or sync has failed

The sync status dashboard (`/settings/integrations`) shows the last sync time for each platform, the number of records processed, and any errors from the most recent sync job.

### 12.7 Performance Classification

Performance metrics are automatically classified based on Roadman's historical benchmarks. No manual tagging required.

**Classification tiers:**

| Tier | Criteria |
|------|----------|
| Exceptional | Top 10% of all content on that platform (by primary metric) |
| Strong | Top 25% |
| Average | Middle 50% (25th–75th percentile) |
| Weak | Bottom 25% |

**Primary metrics by platform:**

| Platform | Primary Metric |
|----------|---------------|
| YouTube | Views (28-day) |
| Instagram | Reach |
| Facebook | Reach |
| LinkedIn | Impressions |
| Podcast (Spotify) | Downloads |
| Beehiiv | Open rate |
| Website (GA4) | Page views |

Benchmarks are recalculated weekly during the deep sync. The classification is stored on each `performance_records` row as a computed field, enabling filtering and reporting by performance tier.

---

## Appendix A: Entity Relationship Summary

```
profiles ─────────────────┐
  │                       │
  ├── campaigns ──────────┤
  │     │                 │
  │     ├── assets ───────┤
  │     │     │           │
  │     │     ├── files   │
  │     │     ├── asset_topics ── topics
  │     │     ├── asset_tags ──── tags
  │     │     ├── transcripts
  │     │     │     └── transcript_highlights
  │     │     ├── publications ── platforms
  │     │     │     └── performance_records
  │     │     ├── content_briefs
  │     │     └── content_cluster_assets ── content_clusters
  │     │
  │     ├── tasks
  │     └── publications
  │
  ├── ideas
  ├── comments (polymorphic → asset|campaign|task|publication|idea|brief)
  ├── activity_log (polymorphic → any entity)
  │
  ├── sponsors ── campaigns
  ├── products ── campaigns
  └── platform_reuse_policies ── platforms

Key relationship: assets.source_asset_id → assets.id (self-referential for derivatives)
```

## Appendix B: Brand Styling for Roadman OS

The internal tool follows the Roadman brand identity but with a utility-focused aesthetic:

| Element | Value |
|---------|-------|
| Background | Dark Charcoal #252526 (primary), Deep Purple #210140 (sidebar/accents) |
| Text | Off White #FAFAFA (primary), Mid Grey #545559 (secondary) |
| Accent / CTAs | Coral #F16363 |
| Brand colour | Purple #4C1273 (headers, badges, active states) |
| Headings | Bebas Neue (sparingly — page titles only; the rest is Work Sans) |
| Body | Work Sans |
| Border radius | 8px (cards), 6px (inputs), 4px (badges) |
| Sidebar | Deep Purple #210140, 240px wide |

The goal is a clean, functional tool — not a marketing site. Think Linear or Notion in dark mode, branded with Roadman colours.
