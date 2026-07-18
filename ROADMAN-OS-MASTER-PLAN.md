# Roadman OS — Master Plan

> **Version:** 1.0
> **Date:** 18 July 2026
> **Status:** Approved for execution — credentials due Monday 20 July 2026
> **Author:** Ted (COO), synthesised from Architecture Doc v2.0, Build Tickets v1.0, Intelligence Expansion v1.0

---

## 1. Executive Summary

Roadman OS is the internal content intelligence platform for Roadman Cycling, a five-person cycling media company run by Anthony Walsh. It is built on Next.js 14+ (App Router) with Supabase (Postgres, Auth, Storage) and deployed on Vercel at **os.roadmancycling.com**.

### The Ecosystem

Roadman Cycling publishes across eleven platforms:

| Platform | Metric |
|---|---|
| YouTube — The Roadman Podcast (main) | 61.7K subscribers |
| YouTube — Roadman Podcast Clips | 13.2K subscribers |
| Instagram | 49.4K followers |
| Facebook | 29.9K followers |
| Beehiiv newsletter | 29,782 contacts |
| Skool — Roadman Cycling Clubhouse (free) | 1,852 members |
| Skool — Not Done Yet (paid, $195/month) | 113 members |
| TikTok | Active, growing |
| X / Twitter | Active, low priority |
| LinkedIn | Active |
| Website (roadmancycling.com) | Organic search via blog content |

All content maps to five pillars: **coaching**, **nutrition**, **strength & conditioning**, **recovery**, and **le métier** (the craft of riding — tactics, kit, race knowledge).

### Build Status

Roadman OS has **76 total build tickets across 12 phases**. Phases 1–3 (Tickets 1–22) are **complete** — the foundation, content core, and workflow tools are live. Remaining phases:

- **Phase 4** — Platform integrations (YouTube, Meta, GA4, GSC, LinkedIn, Beehiiv, TikTok, X/Twitter, Spotify Analytics)
- **Phase 5** — Auto-import and sync (cron jobs, webhooks, backfill pipelines)
- **Phase 6** — Search and intelligence (semantic search, content similarity, embeddings)
- **Phase 7** — Reporting and dashboards (cross-platform performance views)
- **Phase 8** — Polish (comments, activity log, global search, mobile responsiveness)
- **Phase 9** — Temporal data foundation (daily deltas, demographics, GSC, backfill)
- **Phase 10** — Trend engine (topic aggregation, seasonal indices, anomaly detection, forecasts)
- **Phase 11** — Insight mining (generators, review UI, timing recommendations, audience segments)
- **Phase 12** — Commercial layer (sponsor evidence packs, revenue attribution, annual report)

Additional platform tickets: **30A** (TikTok), **30B** (X/Twitter), **30C** (Spotify Analytics), **30D** (GA4 article-level).

### The Moat

Three structural advantages compound over time:

1. **Time-based data advantage.** Seasonal confidence requires years of observation. A competitor starting later is structurally behind and the gap never closes. Google Search Console's 16-month rolling window makes data literally perishable — what is not captured this month is gone forever at any price.

2. **Cross-platform join.** No external tool sees the same niche audience's interest spiking across YouTube, email, search, and community simultaneously. That correlation only exists in a system that joins all four data sources against the same content taxonomy. YouTube Studio knows YouTube. Beehiiv knows email. Only Roadman OS knows both.

3. **Private layer.** Skool community discussions, NDY member behaviour, camp bookings, and revenue events are invisible to every external analytics tool. Community topic data is a leading indicator — members ask about creatine *before* they search for it.

### Running Costs

| Item | Monthly Cost |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| OpenAI embeddings | ~$2 |
| **Current total (Phases 1–3)** | **~$47** |
| With intelligence expansion (Phases 9–12) | ~$68 |
| Optional: X/Twitter Basic API | +$100 |

---

## 2. API Credentials Checklist — Monday 20 July 2026

This is the single most time-sensitive task in the entire build. Anthony provides credentials on Monday morning; every day of delay on API access is a day of data not captured — and for GSC, data that expires permanently.

### Priority Order

| # | Platform | Why This Order | Setup Time | Review Wait |
|---|---|---|---|---|
| 1 | Google (GSC + YouTube + GA4) | GSC's 16-month rolling window is perishable. All four Google APIs share one project. | 20 min | None |
| 2 | Meta (Instagram + Facebook) | Largest social audience. App Review takes days — submit early. | 30 min | 1–5 business days |
| 3 | TikTok | Longest review lead time of any platform. Submit early. | 20 min | Days to weeks |
| 4 | LinkedIn | Marketing API may require review. Start the clock. | 15 min | Potentially days |
| 5 | Beehiiv | Instant API key, no review. Quick win. | 5 min | None |
| 6 | X / Twitter | Requires $100/month subscription decision. | 15 min | None (payment only) |
| 7 | Spotify for Podcasters | No public API. Requires sign-off on approach. | 10 min | None |

---

### 2.1 Google Cloud Project (YouTube + GA4 + GSC — One Project, All Four APIs)

All four Google APIs run through a single Google Cloud project. Do this first.

**Step-by-step:**

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **Select a project** → **New Project**. Name: `Roadman OS`. Click **Create**.
3. Go to **APIs & Services → Library** and enable all four:
   - YouTube Data API v3
   - YouTube Analytics API
   - Google Analytics Data API
   - Google Search Console API
4. **Create OAuth 2.0 credentials** (needed for YouTube — requires user consent for channel data):
   - **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `Roadman OS`
   - Authorised redirect URI: `https://os.roadmancycling.com/api/auth/youtube/callback`
   - Copy the **Client ID** and **Client Secret**
5. **Set up OAuth consent screen:**
   - **APIs & Services → OAuth consent screen**
   - User type: **External** (stays in "Testing" mode — add ted@roadmancycling.com as test user)
   - App name: `Roadman OS`, support email, developer contact
   - Scopes: `youtube.readonly`, `yt-analytics.readonly`, `yt-analytics-monetary.readonly`
6. **Create a Service Account** (for GA4 + GSC — server-to-server, no consent needed):
   - **APIs & Services → Credentials → Create Credentials → Service account**
   - Name: `roadman-os-service`
   - Click **Create and Continue**, skip role, click **Done**
   - Click into the account → **Keys → Add Key → Create new key → JSON**
   - Download the JSON key file. Extract `client_email` and `private_key`.
7. **Grant service account access to GA4:**
   - [analytics.google.com](https://analytics.google.com) → **Admin → Property Access Management → Add users**
   - Add the service account email. Role: **Viewer**.
8. **Grant service account access to GSC:**
   - [search.google.com/search-console](https://search.google.com/search-console) → Select `roadmancycling.com`
   - **Settings → Users and permissions → Add user**
   - Add the same service account email. Permission: **Full**.
9. **Note the GA4 Property ID:**
   - GA4 Admin → Property Settings — numeric Property ID at top

**Env vars to capture:**

```
GOOGLE_CLIENT_ID=<OAuth client ID from step 4>
GOOGLE_CLIENT_SECRET=<OAuth client secret from step 4>
GOOGLE_REDIRECT_URI=https://os.roadmancycling.com/api/auth/youtube/callback
GA4_PROPERTY_ID=<numeric property ID from step 9>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email from JSON key>
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=<private_key from JSON key — include BEGIN/END lines>
GSC_SITE_URL=https://roadmancycling.com
```

If the site is verified as a domain property, use `sc-domain:roadmancycling.com` instead.

**Approvals needed:** None. All four APIs enable instantly. OAuth consent screen stays in Testing mode.

**Time estimate:** 20 minutes.

---

### 2.2 Meta (Instagram + Facebook)

**Step-by-step:**

1. Go to [developers.facebook.com](https://developers.facebook.com) → **My Apps → Create App**
2. App type: **Business**. Name: `Roadman OS`.
3. Add products: **Instagram Graph API**, **Facebook Login for Business**
4. Configure Facebook Login: Valid OAuth Redirect URI: `https://os.roadmancycling.com/api/auth/meta/callback`
5. **App Settings → Basic** — copy **App ID** and **App Secret**
6. Ensure app is connected to the **Business Manager** owning @roadman.cycling (IG) and Roadman Cycling (FB page)
7. **App Review → Permissions and Features** — request: `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`, `pages_show_list`, `read_insights`
8. Submit for **App Review** — requires a screencast showing how the app uses each permission

**Env vars:**

```
META_APP_ID=<App ID>
META_APP_SECRET=<App Secret>
META_REDIRECT_URI=https://os.roadmancycling.com/api/auth/meta/callback
```

**Approvals:** App Review required for insights permissions. **1–5 business days.** Submit Monday morning.

**Time estimate:** 30 minutes setup + review wait.

---

### 2.3 TikTok

Longest review lead time. Submit on Monday even though build work comes later.

**Step-by-step:**

1. Confirm TikTok account is a **Business Account** (required for insights). If Creator, switch in Settings → Manage account.
2. Go to [business-api.tiktok.com](https://business-api.tiktok.com). Create developer account.
3. **Create an App**. Request scopes: video list, account insights, Business Account data.
4. Set OAuth redirect: `https://os.roadmancycling.com/api/auth/tiktok/callback`
5. Submit for app review — describe use as internal content performance tracking.

**Env vars:**

```
TIKTOK_CLIENT_KEY=<Client Key>
TIKTOK_CLIENT_SECRET=<Client Secret>
TIKTOK_REDIRECT_URI=https://os.roadmancycling.com/api/auth/tiktok/callback
```

**Approvals:** App review. **Days to weeks.** Submit first thing Monday.

**Time estimate:** 20 minutes setup + review wait.

---

### 2.4 LinkedIn

**Step-by-step:**

1. Go to [linkedin.com/developers](https://www.linkedin.com/developers/) → **Create App**
2. Name: `Roadman OS`. Associate with **Roadman Cycling LinkedIn Company Page** (requires admin access).
3. **Products** tab — request **Marketing API** (or Community Management API).
4. **Auth** tab — note **Client ID** and **Client Secret**. Add redirect: `https://os.roadmancycling.com/api/auth/linkedin/callback`
5. Required scopes: `r_organization_social`, `rw_organization_admin`

**Env vars:**

```
LINKEDIN_CLIENT_ID=<Client ID>
LINKEDIN_CLIENT_SECRET=<Client Secret>
LINKEDIN_REDIRECT_URI=https://os.roadmancycling.com/api/auth/linkedin/callback
```

**Approvals:** Marketing API may require LinkedIn review — potentially days.

**Time estimate:** 15 minutes + possible review wait.

---

### 2.5 Beehiiv

**Step-by-step:**

1. Log into [app.beehiiv.com](https://app.beehiiv.com) → **Settings → Integrations → API**
2. **Generate API Key** with Read access
3. Note the **Publication ID** from URL or Settings → General

**Env vars:**

```
BEEHIIV_API_KEY=<API key>
BEEHIIV_PUBLICATION_ID=<Publication ID>
```

**Approvals:** None. Instant.

**Time estimate:** 5 minutes.

---

### 2.6 X (Twitter)

**Decision gate:** Free tier is unusable (~100 post reads/month). Basic costs **~$100/month ($1,200/year)**. Anthony decides yes or no.

**Step-by-step (if approved):**

1. [developer.x.com](https://developer.x.com) → create developer account
2. Create **Project** + **App**
3. Subscribe to **Basic** tier
4. Enable **OAuth 2.0 with PKCE**. Callback: `https://os.roadmancycling.com/api/auth/twitter/callback`
5. Copy **Client ID** and **Client Secret**

**Env vars:**

```
X_CLIENT_ID=<Client ID>
X_CLIENT_SECRET=<Client Secret>
X_REDIRECT_URI=https://os.roadmancycling.com/api/auth/twitter/callback
```

**Time estimate:** 15 minutes + subscription decision.

---

### 2.7 Spotify for Podcasters

**Two approaches — Anthony chooses:**

**Option A (automated, unofficial):** Capture `sp_dc` cookie from a logged-in Spotify for Podcasters browser session. Stored encrypted. Lives months. Grey area on Spotify ToS. Feature-flagged.

**Option B (CSV fallback):** Manual CSV export from dashboard, uploaded via Roadman OS form. No ToS risk.

**If Option A approved:**
1. Log into [podcasters.spotify.com](https://podcasters.spotify.com) in Chrome
2. DevTools (F12) → Application → Cookies → find `sp_dc` → copy value
3. Note **Show ID** from dashboard URL

**Values to capture:**
```
SPOTIFY_SHOW_ID=<Show ID>
sp_dc cookie value → stored encrypted in platform_connections (not env var)
```

Also check: does the podcast hosting provider have its own analytics API?

**Time estimate:** 10 minutes.

---

### 2.8 Already Configured (Phases 1–3)

```
NEXT_PUBLIC_SUPABASE_URL        ← set in Phase 1
NEXT_PUBLIC_SUPABASE_ANON_KEY   ← set in Phase 1
SUPABASE_SERVICE_ROLE_KEY       ← set in Phase 1
OPENAI_API_KEY                  ← for embeddings
CRON_SECRET                     ← shared secret for cron auth
```

Confirm these are still active and valid before proceeding.

---

### Monday Morning Sequence

1. **Google Cloud Project** — 20 min. GSC capture begins immediately.
2. **Meta App Review submission** — 30 min. Review clock starts.
3. **TikTok developer app submission** — 20 min. Longest wait, submit early.
4. **LinkedIn app + Marketing API request** — 15 min.
5. **Beehiiv API key** — 5 min. Instant.
6. **X / Twitter decision** — 5 min yes/no. If yes, 15 min setup.
7. **Spotify decision** — 5 min. Choose A or B. If A, 10 min setup.

**Total:** 90–120 minutes of active work. All review-gated submissions in the queue by lunchtime.

---

## 3. Complete Database Schema

Single source of truth for every table in Roadman OS. Merges the 27 original tables (implemented in `00001_initial_schema.sql`) with 16 new intelligence tables plus a `topics` ALTER.

### 3.1 Existing Enums

| Enum | Values |
|------|--------|
| `user_role` | admin, leadership, content_manager, creator, social_publisher, coach, commercial |
| `asset_type` | podcast_episode, youtube_video, blog_post, social_post, newsletter, course_module, quote_card, infographic, reel, short, clip, story, carousel, thread, pdf, live_stream, webinar, other |
| `asset_status` | idea, brief_written, in_production, in_review, approved, scheduled, published, repurposed, archived |
| `campaign_type` | weekly_focus, product_launch, event_promotion, sponsor_campaign, seasonal, evergreen, ad_hoc |
| `campaign_status` | draft, planned, active, completed, cancelled |
| `publication_status` | draft, scheduled, published, failed, removed |
| `task_status` | backlog, todo, in_progress, in_review, done, blocked |
| `task_priority` | low, medium, high, urgent |
| `content_pillar` | coaching, nutrition, strength_and_conditioning, recovery, le_metier |
| `idea_status` | captured, developing, ready, used, discarded |
| `activity_action` | created, updated, status_changed, assigned, commented, published, archived, restored, file_uploaded, file_deleted, highlight_added, scheduled, approved, rejected |
| `file_storage_type` | supabase, youtube, spotify, google_drive, dropbox, external_url |
| `metric_source` | youtube, spotify, apple_podcasts, instagram, facebook, tiktok, twitter_x, linkedin, website, beehiiv, ga4, skool, manual |
| `sponsor_status` | prospect, contacted, negotiating, active, paused, completed, lost |
| `product_type` | community, course, coaching, event, merchandise, digital_download, sponsorship, other |

### 3.2 New Enums (Intelligence Expansion)

```sql
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
```

### 3.3 Existing Tables (27) — Summary

Full CREATE TABLE statements are in `roadman-os/supabase/migrations/00001_initial_schema.sql`. Not reprinted here.

#### Identity and Access

| # | Table | Purpose |
|---|-------|---------|
| 1 | `profiles` | User profiles extending Supabase `auth.users`. Name, avatar, role. |
| 2 | `permissions` | Role × resource × action permission matrix. |

#### Content Taxonomy

| # | Table | Purpose |
|---|-------|---------|
| 3 | `topics` | Controlled content taxonomy linked to pillars. Parent/child hierarchy. |
| 4 | `tags` | Freeform labels with optional colour. |
| 5 | `asset_topics` | Junction: assets ↔ topics (many-to-many). |
| 6 | `asset_tags` | Junction: assets ↔ tags (many-to-many). |

#### Campaigns and Content

| # | Table | Purpose |
|---|-------|---------|
| 7 | `campaigns` | Weekly focus periods and other campaign types. Links to sponsor and product. |
| 8 | `assets` | Core content entity. Every podcast, video, blog post, social post is an asset. |
| 9 | `files` | Uploaded and externally-referenced files attached to assets. |
| 10 | `transcripts` | Full transcript text with timestamped segments. |
| 11 | `transcript_highlights` | Notable moments within transcripts. Start/end times with labels. |

#### Publishing and Distribution

| # | Table | Purpose |
|---|-------|---------|
| 12 | `platforms` | Publishing platforms with character limits, format specs, ideal posting times. |
| 13 | `platform_reuse_policies` | Content reuse rules per platform per asset type. |
| 14 | `publications` | Junction: asset × platform × scheduled date. Tracks publication status. |
| 15 | `performance_records` | Cumulative metric snapshots from platform APIs. Views, impressions, engagement. |

#### Commercial

| # | Table | Purpose |
|---|-------|---------|
| 16 | `products` | Roadman products: NDY Community, courses, coaching, merchandise. |
| 17 | `sponsors` | Sponsor companies and deals. Status, deliverables, talking points. |

#### Workflow and Collaboration

| # | Table | Purpose |
|---|-------|---------|
| 18 | `tasks` | Content workflow tasks with kanban status, priority, due dates. |
| 19 | `content_briefs` | SEO/content briefs for planned assets. Keywords, personas, angles. |
| 20 | `ideas` | Quick-capture content ideas with voting and promote-to-asset. |
| 21 | `comments` | Threaded comments. Polymorphic parent: asset, task, idea, etc. |
| 22 | `activity_log` | Audit trail of all state changes. Actor, action, entity, diff. |

#### Content Organisation

| # | Table | Purpose |
|---|-------|---------|
| 23 | `content_clusters` | Topic cluster groupings with a hub/pillar asset. |
| 24 | `content_cluster_assets` | Junction: clusters ↔ assets with role and sort order. |

#### Integrations and Infrastructure

| # | Table | Purpose |
|---|-------|---------|
| 25 | `platform_connections` | OAuth tokens and API keys per platform. Token refresh, sync status. |
| 26 | `sync_jobs` | Sync job tracking with status, record counts, errors, retries. |
| 27 | `content_embeddings` | pgvector embeddings (1536-dim) for semantic search. |

### 3.4 Topic Backbone Additions

```sql
ALTER TABLE topics
  ADD COLUMN is_trend_tracked BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN centroid_embedding vector(1536),
  ADD COLUMN commercial_category TEXT;  -- e.g. 'supplements', 'tyres', 'training'
```

### 3.5 New Intelligence Tables (16)

Migration: `00004_intelligence_layer.sql`

---

#### 3.5.1 `topic_aliases`

Maps variant spellings, abbreviations, and GSC queries to canonical topics.

```sql
CREATE TABLE topic_aliases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  alias       TEXT NOT NULL,              -- e.g. 'zone 2', 'z2 training', 'zone two'
  source      TEXT NOT NULL DEFAULT 'manual',  -- 'manual', 'gsc_auto', 'community_auto'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(alias)
);
CREATE INDEX idx_topic_aliases_topic ON topic_aliases(topic_id);
CREATE INDEX idx_topic_aliases_alias ON topic_aliases(lower(alias));
```

---

#### 3.5.2 `performance_daily`

Daily deltas — the trend engine's fuel. One row per publication × source × date.

```sql
CREATE TABLE performance_daily (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id      UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  source              metric_source NOT NULL,
  date                DATE NOT NULL,
  -- Daily delta metrics (not cumulative)
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
  -- TRUE = from platform daily API; FALSE = derived from snapshot subtraction
  is_measured         BOOLEAN NOT NULL DEFAULT FALSE,
  custom_metrics      JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(publication_id, source, date)
);
CREATE INDEX idx_perf_daily_asset_date ON performance_daily(publication_id, date);
CREATE INDEX idx_perf_daily_date ON performance_daily USING BRIN(date);
```

---

#### 3.5.3 `audience_demographics`

Age/gender/geo breakdowns per platform. Scope is per-asset or channel-level.

```sql
CREATE TABLE audience_demographics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source          metric_source NOT NULL,
  scope           TEXT NOT NULL CHECK (scope IN ('asset', 'channel')),
  asset_id        UUID REFERENCES assets(id) ON DELETE CASCADE,
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  age_bracket     TEXT NOT NULL,      -- '18-24','25-34','35-44','45-54','55-64','65+','unknown'
  gender          TEXT NOT NULL,      -- 'male','female','unknown'
  country         TEXT,               -- ISO 3166-1 alpha-2
  share_pct       REAL NOT NULL,      -- 0.0 to 1.0
  absolute_value  BIGINT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source, scope, asset_id, period_start, age_bracket, gender, country)
);
CREATE INDEX idx_demo_asset ON audience_demographics(asset_id);
CREATE INDEX idx_demo_period ON audience_demographics(period_start, period_end);
```

---

#### 3.5.4 `search_console_daily`

GSC page × query × day data. Feeds demand-gap analysis and topic search trends.

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
```

---

#### 3.5.5 `keyword_metrics`

Monthly keyword volumes from DataForSEO. Demand-gap analysis and commercial-value scoring.

```sql
CREATE TABLE keyword_metrics (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword        TEXT NOT NULL,
  topic_id       UUID REFERENCES topics(id) ON DELETE SET NULL,
  month          DATE NOT NULL,          -- first day of the month
  search_volume  INTEGER,
  cpc_cents      INTEGER,
  competition    REAL,                   -- 0.0 to 1.0
  provider       TEXT NOT NULL DEFAULT 'dataforseo',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(keyword, month, provider)
);
CREATE INDEX idx_keyword_topic_month ON keyword_metrics(topic_id, month);
```

---

#### 3.5.6 `community_snapshots`

Weekly manual entries for Skool community health.

```sql
CREATE TABLE community_snapshots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community         TEXT NOT NULL CHECK (community IN ('free', 'ndy')),
  week_start        DATE NOT NULL,       -- Monday of the week
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
```

---

#### 3.5.7 `community_posts`

Skool post titles with topic classification. Demand-signal analysis.

```sql
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
```

---

#### 3.5.8 `revenue_events`

Revenue attribution per event.

```sql
CREATE TABLE revenue_events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at           TIMESTAMPTZ NOT NULL,
  product_id            UUID REFERENCES products(id) ON DELETE SET NULL,
  amount_cents          INTEGER NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'USD',
  event_type            TEXT NOT NULL,  -- 'join', 'renewal', 'purchase', 'booking', 'churn'
  attributed_asset_id   UUID REFERENCES assets(id) ON DELETE SET NULL,
  attributed_topic_id   UUID REFERENCES topics(id) ON DELETE SET NULL,
  attribution_method    TEXT,           -- 'utm', 'survey', 'last_touch', 'manual'
  source_detail         JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_revenue_occurred ON revenue_events(occurred_at);
CREATE INDEX idx_revenue_topic ON revenue_events(attributed_topic_id);
```

---

#### 3.5.9 `calendar_events`

External seasonal markers: race calendar, resolution periods, weather phases.

```sql
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
```

---

#### 3.5.10 `topic_daily_metrics`

The core fact table. One row per date × topic × platform (NULL source = all-platform rollup).

```sql
CREATE TABLE topic_daily_metrics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id            UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source              metric_source,      -- NULL = all-platform rollup
  date                DATE NOT NULL,
  live_asset_count    INTEGER NOT NULL DEFAULT 0,
  views               BIGINT NOT NULL DEFAULT 0,
  engagement          BIGINT NOT NULL DEFAULT 0,  -- likes+comments+shares+saves
  search_clicks       INTEGER NOT NULL DEFAULT 0,
  search_impressions  BIGINT NOT NULL DEFAULT 0,
  email_opens         INTEGER NOT NULL DEFAULT 0,
  email_clicks        INTEGER NOT NULL DEFAULT 0,
  community_posts     INTEGER NOT NULL DEFAULT 0,
  revenue_cents       INTEGER NOT NULL DEFAULT 0,
  relative_interest   REAL,               -- normalised: 1.0 = topic's annual average
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(topic_id, source, date)
);
CREATE INDEX idx_tdm_topic_date ON topic_daily_metrics(topic_id, date);
CREATE INDEX idx_tdm_date ON topic_daily_metrics USING BRIN(date);
```

---

#### 3.5.11 `seasonal_indices`

ISO-week seasonal multipliers with confidence scoring.

```sql
CREATE TABLE seasonal_indices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id          UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source            metric_source,
  metric            TEXT NOT NULL,        -- 'views', 'search_impressions', 'engagement', etc.
  iso_week          SMALLINT NOT NULL CHECK (iso_week BETWEEN 1 AND 53),
  index_value       REAL NOT NULL,        -- 1.0 = average; 3.2 = 3.2× average
  per_year_values   JSONB NOT NULL DEFAULT '{}',  -- {"2023": 2.8, "2024": 3.4}
  years_observed    SMALLINT NOT NULL,
  sample_assets     INTEGER NOT NULL,
  confidence_score  REAL NOT NULL,        -- 0–100
  confidence        trend_confidence NOT NULL,
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(topic_id, source, metric, iso_week)
);
CREATE INDEX idx_seasonal_topic ON seasonal_indices(topic_id, metric);
CREATE INDEX idx_seasonal_confidence ON seasonal_indices(confidence, index_value);
```

---

#### 3.5.12 `anomalies`

Detected anomalies — unexpected spikes or drops beyond seasonal expectation.

```sql
CREATE TABLE anomalies (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id              UUID REFERENCES topics(id) ON DELETE CASCADE,
  asset_id              UUID REFERENCES assets(id) ON DELETE CASCADE,
  source                metric_source,
  detected_on           DATE NOT NULL,
  metric                TEXT NOT NULL,
  expected_value        REAL NOT NULL,
  actual_value          REAL NOT NULL,
  z_score               REAL NOT NULL,
  direction             TEXT NOT NULL CHECK (direction IN ('above', 'below')),
  is_acknowledged       BOOLEAN NOT NULL DEFAULT FALSE,
  promoted_insight_id   UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_anomalies_detected ON anomalies(detected_on, is_acknowledged);
```

---

#### 3.5.13 `forecasts`

Seasonal-naive-with-drift predictions. Self-grading via backfilled actuals.

```sql
CREATE TABLE forecasts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id        UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source          metric_source,
  metric          TEXT NOT NULL,
  target_week     DATE NOT NULL,          -- Monday of the target week
  forecast_value  REAL NOT NULL,
  lower_bound     REAL,
  upper_bound     REAL,
  actual_value    REAL,                   -- backfilled after the week passes
  abs_pct_error   REAL,                   -- |actual - forecast| / actual
  model           TEXT NOT NULL DEFAULT 'seasonal_naive_drift',
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(topic_id, source, metric, target_week, model)
);
```

---

#### 3.5.14 `insights`

Generated insights with review workflow. Every number is SQL-computed, never LLM-generated.

```sql
CREATE TABLE insights (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                  insight_type NOT NULL,
  status                insight_status NOT NULL DEFAULT 'candidate',
  statement             TEXT NOT NULL,        -- plain-English, e.g. "Creatine peaks 3.2× in January"
  topic_id              UUID REFERENCES topics(id) ON DELETE SET NULL,
  commercial_category   TEXT,
  evidence              JSONB NOT NULL DEFAULT '{}',
  confidence_score      REAL NOT NULL,
  confidence            trend_confidence NOT NULL,
  valid_from            DATE,
  valid_until           DATE,
  reviewed_by           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at           TIMESTAMPTZ,
  actioned_asset_id     UUID REFERENCES assets(id) ON DELETE SET NULL,
  sponsor_safe          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_insights_status_type ON insights(status, type);
CREATE INDEX idx_insights_topic ON insights(topic_id);
```

---

#### 3.5.15 `audience_segments`

Behavioural clusters from engagement patterns.

```sql
CREATE TABLE audience_segments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  description       TEXT,
  discovery_method  TEXT NOT NULL DEFAULT 'kmeans_topic_affinity',
  member_count      INTEGER NOT NULL DEFAULT 0,
  topic_affinities  JSONB NOT NULL DEFAULT '{}',
  seasonal_profile  JSONB NOT NULL DEFAULT '{}',
  revenue_rate      REAL,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

#### 3.5.16 `segment_members`

Junction: segments ↔ hashed member keys. Privacy-preserving — no raw emails stored.

```sql
CREATE TABLE segment_members (
  segment_id    UUID NOT NULL REFERENCES audience_segments(id) ON DELETE CASCADE,
  member_key    TEXT NOT NULL,         -- SHA-256 hashed email
  member_source TEXT NOT NULL,         -- 'beehiiv', 'skool'
  affinity      REAL NOT NULL,
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (segment_id, member_key)
);
```

---

### 3.6 Schema Summary

| Layer | Tables | Status |
|-------|--------|--------|
| Content operations (existing) | 27 | Implemented |
| Topic backbone ALTER | 1 (topics) | 3 columns added |
| Intelligence expansion (new) | 16 | Migration `00004_intelligence_layer.sql` |
| **Total** | **43 tables** | |

---
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
- **Deliverables:** Intelligence schema (16 new tables). Daily delta derivation. GSC integration with 16-month backfill. Audience demographics capture. Historical backfill (3-8 years of daily data). Topic auto-classification. Skool weekly ritual. Keyword volumes. Revenue events.
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
