# Roadman OS — Full Build Tickets

> **Version:** 1.0
> **Date:** 16 July 2026
> **Total tickets:** 50
> **Estimated timeline:** 8 phases
> **Builder:** Claude (Dispatch sessions)

Each ticket is designed to be completable in a single Dispatch session. Tickets within a phase can be built in order. Cross-phase dependencies are noted.

---

## Phase 1: Foundation (Tickets 1–6)

### Ticket 1: Project Scaffolding

**Size:** S
**Depends on:** Nothing

Create the `roadman-os` Next.js project with all tooling and integrations configured from day one. This is the full production scaffold — not a stripped-down shell. Every dependency needed across all 50 tickets is installed up front, and every environment variable is documented.

**Tasks:**
- Run `create-next-app@latest` with App Router, TypeScript, Tailwind, ESLint
- Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `date-fns`, `lucide-react`, `@tanstack/react-table`, `googleapis`, `openai`, `recharts`
- Configure `tailwind.config.ts` with Roadman brand colours:
  - `charcoal`: #252526 (Dark Charcoal)
  - `deep-purple`: #210140 (Deep Purple)
  - `coral`: #F16363 (Coral)
  - `purple`: #4C1273 (Purple)
  - `off-white`: #FAFAFA (Off White)
  - `mid-grey`: #545559 (Mid Grey)
- Configure `tailwind.config.ts` with font families: `heading` (Bebas Neue), `body` (Work Sans)
- Set up Google Fonts imports in `src/app/layout.tsx` (Bebas Neue via `next/font/google`, Work Sans via `next/font/google`)
- Create `.env.example` with all required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REDIRECT_URI`
  - `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI`
  - `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`
  - `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`
  - `GA4_PROPERTY_ID`, `GA4_CLIENT_EMAIL`, `GA4_PRIVATE_KEY`
  - `OPENAI_API_KEY`
  - `CRON_SECRET`
  - `NEXT_PUBLIC_APP_URL` (defaults to `https://os.roadmancycling.com`)
- Create `src/lib/supabase/client.ts` (browser client using `createBrowserClient`)
- Create `src/lib/supabase/server.ts` (server client using `createServerClient` with cookies)
- Create `src/lib/supabase/middleware.ts` (session refresh helper)
- Create `src/middleware.ts` with auth redirect logic: unauthenticated requests to any route except `/login` redirect to `/login`
- Initialise Git repository, push to GitHub
- Create Vercel project, link to repo, deploy empty shell

**Acceptance criteria:**
- `npm run dev` starts without errors
- Deployed to Vercel with a blank page at `os.roadmancycling.com` (or preview URL)
- Supabase client initialises without errors in both browser and server contexts
- Brand colours and fonts render correctly in a test element
- `.env.example` documents every variable needed across all phases
- All dependencies install without version conflicts

---

### Ticket 2: Database Schema

**Size:** L
**Depends on:** Ticket 1

Create the full database schema in Supabase with all tables, enums, indexes, and the pgvector extension. This is the complete schema — not iterative. Every table referenced across all 50 tickets is created in this single migration.

**Tasks:**
- Initialise Supabase CLI in the project (`supabase init`)
- Create migration `00001_initial_schema.sql` containing:
  - Enable pgvector extension: `CREATE EXTENSION IF NOT EXISTS vector`
  - All 16 enum types (as defined in architecture doc section 3.1): `user_role`, `content_pillar`, `asset_type`, `asset_status`, `campaign_type`, `campaign_status`, `publication_status`, `task_status`, `task_priority`, `idea_status`, `brief_status`, `highlight_type`, `platform_type`, `file_type`, `sync_status`, `performance_classification`
  - Core tables:
    - `profiles` (id, auth_user_id, email, display_name, role, avatar_url, created_at, updated_at)
    - `permissions` (id, role, resource, action, allowed, created_at)
    - `topics` (id, name, slug, pillar, description, parent_id, sort_order, is_active, created_at, updated_at)
    - `tags` (id, name, slug, colour, usage_count, created_at)
    - `campaigns` (id, title, description, type, status, pillar, start_date, end_date, goals, key_messages, owner_id, sponsor_id, product_id, cta_url, cta_text, colour, notes, archived_at, created_at, updated_at)
    - `assets` (id, title, asset_type, status, pillar, description, body, excerpt, campaign_id, source_asset_id, is_source, assigned_to, due_date, episode_number, season_number, duration_seconds, youtube_id, spotify_url, guest_name, guest_credential, recording_date, seo_title, seo_description, keywords, answer_capsule, canonical_url, word_count, external_url, search_vector, created_by, archived_at, created_at, updated_at)
    - `asset_topics` (asset_id, topic_id)
    - `asset_tags` (asset_id, tag_id)
    - `files` (id, asset_id, file_name, file_type, file_size, storage_path, external_url, platform, is_primary, uploaded_by, created_at)
    - `transcripts` (id, asset_id, full_text, word_count, duration_seconds, is_verified, speakers, search_vector, created_at, updated_at)
    - `transcript_highlights` (id, transcript_id, highlight_type, text, start_time, end_time, note, colour, used_in_asset_id, created_by, created_at, updated_at)
    - `platforms` (id, name, slug, platform_type, account_handle, base_url, is_active, ideal_post_times, character_limits, format_specs, created_at, updated_at)
    - `platform_reuse_policies` (id, platform_id, asset_type, min_gap_days, max_reuses, created_at)
    - `publications` (id, asset_id, platform_id, campaign_id, scheduled_at, published_at, status, platform_title, platform_body, hashtags, mentions, platform_url, notes, created_by, archived_at, created_at, updated_at)
    - `performance_records` (id, publication_id, asset_id, platform_id, period_start, period_end, views, impressions, reach, clicks, click_through_rate, likes, comments, shares, saves, engagement_rate, watch_time_seconds, average_view_duration_seconds, completion_rate, revenue_cents, cost_cents, conversions, new_subscribers, unsubscribes, open_rate, source, classification, created_at, updated_at)
    - `products` (id, name, slug, description, price_cents, currency, url, is_active, created_at, updated_at)
    - `sponsors` (id, name, slug, contact_name, contact_email, deal_value_cents, currency, deliverables, notes, is_active, created_at, updated_at)
    - `tasks` (id, title, description, status, priority, asset_id, campaign_id, assigned_to, due_date, estimated_minutes, labels, parent_task_id, created_by, archived_at, created_at, updated_at)
    - `content_briefs` (id, asset_id, campaign_id, status, primary_query, secondary_queries, search_intent, target_persona, pillar, unique_angle, competitor_gaps, original_sources, answer_capsule, decision_framework, pillar_page_url, related_episodes, related_tools, cta, cannibalisation_check, rejection_reason, submitted_at, approved_at, approved_by, created_by, created_at, updated_at)
    - `ideas` (id, title, description, status, pillar, source, target_asset_type, vote_count, converted_to_asset_id, created_by, archived_at, created_at, updated_at)
    - `comments` (id, entity_type, entity_id, parent_id, body, mentions, edited_at, created_by, archived_at, created_at)
    - `activity_log` (id, action, entity_type, entity_id, entity_title, field_changed, old_value, new_value, actor_id, created_at)
    - `content_clusters` (id, name, slug, description, pillar, pillar_asset_id, target_query, related_queries, status, created_at, updated_at)
    - `content_cluster_assets` (id, cluster_id, asset_id, role, created_at)
  - New integration tables:
    - `platform_connections` (id, platform_id, auth_type, access_token, refresh_token, token_expires_at, api_key, scopes, account_id, account_name, connected_by, connected_at, disconnected_at, last_error, created_at, updated_at)
    - `sync_jobs` (id, platform_connection_id, job_type, status, started_at, completed_at, records_processed, records_failed, error_message, metadata, created_at)
    - `content_embeddings` (id, entity_type, entity_id, chunk_index, chunk_text, embedding vector(1536), created_at, updated_at)
    - `notifications` (id, user_id, type, title, body, entity_type, entity_id, is_read, created_at)
  - All indexes:
    - GIN indexes for full-text search on `assets.search_vector` and `transcripts.search_vector`
    - IVFFlat index on `content_embeddings.embedding` for vector similarity search
    - B-tree indexes on all foreign key columns
    - B-tree indexes on `assets.asset_type`, `assets.status`, `assets.pillar`, `assets.campaign_id`
    - B-tree indexes on `publications.scheduled_at`, `publications.status`, `publications.platform_id`
    - B-tree indexes on `performance_records.period_start`, `performance_records.platform_id`
    - B-tree index on `activity_log.entity_type`, `activity_log.entity_id`
    - B-tree index on `notifications.user_id`, `notifications.is_read`
    - Unique index on `content_embeddings(entity_type, entity_id, chunk_index)`
- Run migration against Supabase project (`supabase db push`)
- Generate TypeScript types (`supabase gen types typescript --project-id <id> > src/types/database.ts`)
- Verify all tables exist in Supabase dashboard

**Acceptance criteria:**
- All 27 tables created with correct columns, types, and constraints
- All foreign key relationships valid
- TypeScript types generated and importable via `import { Database } from '@/types/database'`
- pgvector extension enabled and `content_embeddings` table accepts vector data
- No migration errors
- GIN and IVFFlat indexes created successfully

---

### Ticket 3: Supabase Auth Setup

**Size:** S
**Depends on:** Ticket 2

Configure Supabase Auth for email/password login and wire up the Next.js auth flow for all 5 internal users.

**Tasks:**
- Enable email/password auth in Supabase dashboard
- Disable email confirmation (internal users only — no need)
- Create 5 auth users via Supabase dashboard or admin API:
  - anthony@roadmancycling.com (admin)
  - sarah@roadmancycling.com (content_manager)
  - caoimhe@roadmancycling.com (creator)
  - matthew@roadmancycling.com (social_publisher)
  - wes@roadmancycling.com (creator)
- Create `/login/page.tsx` with email/password form styled with brand colours (Deep Purple background, Off White text, Coral button, Roadman OS logo)
- Wire up `supabase.auth.signInWithPassword()` on form submit
- Wire up `supabase.auth.signOut()` for logout
- Implement middleware auth check: unauthenticated requests to any page except `/login` redirect to `/login`
- Implement post-login redirect to `/`
- Handle auth errors (invalid credentials, network errors) with inline error messages

**Acceptance criteria:**
- All 5 users can log in with email/password
- Unauthenticated users are redirected to `/login`
- Authenticated users are redirected away from `/login`
- Session persists across page refreshes
- Sign out clears session and redirects to `/login`
- Auth error messages display clearly without exposing sensitive details

---

### Ticket 4: User Seeding & Profiles Trigger

**Size:** S
**Depends on:** Ticket 3

Create profile records for each auth user and set up the auto-creation trigger so future users get profiles automatically.

**Tasks:**
- Create a Supabase database function + trigger that auto-creates a `profiles` row when a new `auth.users` row is inserted (migration `00002_profiles_trigger.sql`)
- Seed profile data for the 5 launch users:
  - Anthony Walsh — `admin` — display name "Anthony"
  - Sarah — `content_manager` — display name "Sarah"
  - Caoimhe — `creator` — display name "Caoimhe"
  - Matthew — `social_publisher` — display name "Matthew"
  - Wes — `creator` — display name "Wes"
- Create `src/lib/utils/auth.ts` with `getCurrentProfile()` utility that fetches the current user's profile from the session (server-side, using Supabase server client)
- Create `src/lib/utils/auth-client.ts` with `useCurrentProfile()` hook for client components
- Verify profiles are accessible from both server and client components

**Acceptance criteria:**
- Each auth user has a corresponding `profiles` row with correct role and display name
- `getCurrentProfile()` returns the full profile for the logged-in user in server components
- `useCurrentProfile()` hook returns the profile in client components
- New users (if created in future) auto-get a profile row via the trigger
- Profile data is available in the app layout (for sidebar user display)

---

### Ticket 5: App Shell + Sidebar Navigation

**Size:** M
**Depends on:** Ticket 4

Build the main application layout with sidebar, header, and responsive navigation. This is the visual foundation — every page in Roadman OS lives inside this shell.

**Tasks:**
- Create root `src/app/(app)/layout.tsx` with:
  - Dark theme (bg-charcoal #252526 on `<body>`)
  - Google Fonts loading (Bebas Neue for headings, Work Sans for body)
  - Auth gate (redirect to login if not authenticated)
  - Three-column layout: sidebar + main content area with header
- Build `src/components/layout/Sidebar.tsx`:
  - Deep Purple (#210140) background, 240px wide, full height
  - Roadman OS logo at top (text logo in Bebas Neue, Off White)
  - Navigation links with Lucide icons:
    - Dashboard (`LayoutDashboard`)
    - Campaigns (`Target`)
    - Assets (`FileText`)
    - Calendar (`Calendar`)
    - Ideas (`Lightbulb`)
    - Tasks (`CheckSquare`)
    - Transcripts (`FileAudio`)
    - Performance (`BarChart3`)
    - Settings (`Settings`)
  - Active state: Coral (#F16363) left border + text colour
  - Hover state: slightly lighter purple background
  - Collapsed state for mobile (hidden by default, slide-in on toggle)
  - Current user avatar + display name + role badge at bottom with sign-out button
- Build `src/components/layout/Header.tsx`:
  - Breadcrumbs component (dynamic, based on route)
  - Search bar placeholder (styled input, wired in Ticket 47)
  - User menu dropdown (profile, sign out)
  - Notification bell placeholder (wired in Ticket 22)
- Build `src/components/layout/MobileNav.tsx`:
  - Hamburger menu trigger (visible below 768px)
  - Slide-out navigation panel with same links as sidebar
  - Overlay backdrop, close on backdrop click or Escape key
- Create placeholder pages for all routes (each renders just the page title in Bebas Neue):
  - `src/app/(app)/page.tsx` (Dashboard)
  - `src/app/(app)/campaigns/page.tsx`
  - `src/app/(app)/assets/page.tsx`
  - `src/app/(app)/calendar/page.tsx`
  - `src/app/(app)/ideas/page.tsx`
  - `src/app/(app)/tasks/page.tsx`
  - `src/app/(app)/transcripts/page.tsx`
  - `src/app/(app)/performance/page.tsx`
  - `src/app/(app)/settings/page.tsx`

**Acceptance criteria:**
- Sidebar renders with all navigation links and correct icons
- Clicking nav links navigates to correct routes
- Active route is visually highlighted with Coral accent
- Mobile navigation works (hamburger visible below 768px, slide-out panel opens/closes)
- Current user display name and role badge displayed in sidebar footer
- Sign-out works from the sidebar and user menu
- All placeholder pages render without errors
- Brand colours and fonts applied consistently throughout the shell

---

### Ticket 6: Permission System

**Size:** S
**Depends on:** Ticket 4

Implement the full role-based permission system for both server and client. Permissions are checked at the Server Action level and used in the UI to show/hide elements.

**Tasks:**
- Seed the `permissions` table with the full permission matrix (migration `00003_permissions_seed.sql`):
  - Roles: `admin`, `leadership`, `content_manager`, `creator`, `social_publisher`, `coach`, `commercial`
  - Resources: `campaigns`, `assets`, `publications`, `tasks`, `ideas`, `transcripts`, `performance`, `settings`, `briefs`, `comments`, `integrations`
  - Actions: `create`, `read`, `update`, `delete`, `publish`, `approve`
  - Admin has all permissions; other roles have restricted access per the architecture doc section 3.3
- Create `src/lib/utils/permissions.ts` with:
  - `checkPermission(userId: string, resource: string, action: string): Promise<boolean>` — server-side async check against permissions table via Supabase query
  - `hasPermission(role: UserRole, resource: string, action: string): boolean` — synchronous check against a cached permission map (loaded once per session)
  - `getPermissionsForRole(role: UserRole): Permission[]` — returns all permissions for a role
- Create `src/components/providers/PermissionsProvider.tsx` — React context provider that loads the current user's permissions on mount and caches them
- Create `src/hooks/usePermissions.ts` — hook returning `{ can: (resource: string, action: string) => boolean, role: UserRole }`
- Add the `PermissionsProvider` to the root `(app)/layout.tsx`
- Create `src/components/ui/PermissionGate.tsx` — wrapper component: `<PermissionGate resource="campaigns" action="create">{children}</PermissionGate>` — conditionally renders children based on permission check

**Acceptance criteria:**
- `checkPermission('anthony-id', 'campaigns', 'create')` returns `true`
- `checkPermission('wes-id', 'settings', 'update')` returns `false`
- `checkPermission('matthew-id', 'publications', 'publish')` returns `true`
- `usePermissions().can('publications', 'publish')` returns correct value per role
- `<PermissionGate>` hides UI elements the user lacks permission for
- Permission checks do not cause N+1 queries (batch loaded on mount, cached in context)

---

## Phase 2: Content Core (Tickets 7–15)

### Ticket 7: Campaign CRUD

**Size:** M
**Depends on:** Tickets 5, 6

Full campaign create/read/update with Server Actions, Zod validation, and activity logging. Campaigns are the central organising unit in Roadman OS — every piece of content is tied to a campaign.

**Tasks:**
- Create `src/lib/actions/campaigns.ts` with Server Actions:
  - `createCampaign(formData: FormData)` — validates with Zod schema, inserts into `campaigns` table, logs activity via `logActivity()`
  - `updateCampaign(id: string, formData: FormData)` — validates, updates, logs activity with field-level change tracking
  - `archiveCampaign(id: string)` — sets `archived_at` to current timestamp, logs activity
- Create `src/lib/schemas/campaigns.ts` with Zod schema: `campaignSchema` requiring title, start_date, end_date, owner_id; optional description, type (default `weekly_focus`), status, pillar, goals (string array), key_messages (string array), sponsor_id, product_id, cta_url, cta_text, colour, notes
- Create `src/components/campaigns/CampaignForm.tsx` with fields:
  - Title (text input, required)
  - Description (textarea)
  - Type (dropdown: weekly_focus, product_launch, sponsor_campaign, event, evergreen, series)
  - Status (dropdown: draft, planned, active, completed, cancelled)
  - Pillar (dropdown: coaching, nutrition, strength_conditioning, recovery, le_metier)
  - Start date, end date (date pickers)
  - Goals (multi-input — add/remove goals as string array)
  - Key messages (multi-input — add/remove messages as string array)
  - Owner (user selector dropdown, populated from profiles)
  - Sponsor (selector, optional, populated from sponsors table)
  - Product (selector, optional, populated from products table)
  - CTA URL, CTA text (text inputs)
  - Colour picker (hex colour, defaults to brand colours)
  - Notes (textarea)
- Create `src/app/(app)/campaigns/new/page.tsx` — renders CampaignForm in create mode
- Create `src/app/(app)/campaigns/[id]/edit/page.tsx` — renders CampaignForm in edit mode, pre-populated with existing campaign data
- Create `src/lib/queries/campaigns.ts` with query functions:
  - `getCampaign(id: string)` — single campaign with owner profile
  - `getCampaigns(filters)` — filtered list with pagination
  - `getActiveCampaigns()` — non-archived campaigns
  - `getCurrentWeeklyFocus()` — active weekly_focus campaign by date range
- Wire up `react-hook-form` with Zod resolver for client-side validation

**Acceptance criteria:**
- Users can create a campaign with all fields populated
- Form validation prevents submission with missing required fields (title, start/end dates, owner)
- Created campaigns appear in the database with correct data
- Edit form loads existing campaign data and pre-fills all fields
- Updates persist correctly, including array fields (goals, key_messages)
- Activity log records creation and updates with actor and entity details
- Campaign type defaults to `weekly_focus` when not specified

---

### Ticket 8: Weekly Focus Banner

**Size:** M
**Depends on:** Ticket 7

The hero component — the most important UI element in Roadman OS. The Weekly Focus Banner sits at the top of the dashboard and tells the team exactly what this week's content focus is.

**Tasks:**
- Create `src/components/campaigns/WeeklyFocusBanner.tsx`:
  - Full-width banner at the top of the dashboard
  - Shows the currently active `weekly_focus` campaign (where `start_date <= today <= end_date`)
  - Large title in Bebas Neue font
  - Pillar badge (coloured by pillar), date range (formatted with `date-fns`), owner avatar + name
  - Key messages displayed as a styled list
  - Quick stats row: assets count (from `assets` where `campaign_id` matches), tasks remaining (incomplete tasks), publications scheduled (upcoming publications)
  - "View Campaign" CTA button linking to `/campaigns/[id]`, styled with Coral (#F16363)
  - Empty state: when no weekly focus is active, show "No Weekly Focus Set" with "Create Weekly Focus" CTA
- Create `src/app/api/campaigns/current/route.ts`:
  - Returns the active `weekly_focus` campaign where `start_date <= today <= end_date`
  - Falls back to the next upcoming weekly focus if none is currently active
  - Includes counts for assets, tasks, publications
- Create the dashboard page `src/app/(app)/page.tsx`:
  - WeeklyFocusBanner at top
  - "Upcoming Weeks" section: next 4 upcoming weekly focuses in card layout
  - "Recent Activity" feed: latest 10 activity log entries with actor, action, entity link, timestamp
- Style with brand: Deep Purple (#210140) gradient background on banner, Coral (#F16363) accent on CTA and stats, Off White (#FAFAFA) text

**Acceptance criteria:**
- Banner shows the current week's campaign (determined by date range comparison with today's date)
- Banner displays title, pillar badge, date range, owner avatar, and key messages
- Asset count, task count, and publication count are accurate (queried from related tables)
- When no weekly focus exists for the current week, a clear empty state is shown with "Create Weekly Focus" CTA
- Upcoming weeks are listed below the banner as cards
- Recent activity feed shows human-readable entries
- Brand styling is consistent: Deep Purple gradient, Coral accent, Off White text, Bebas Neue heading

---

### Ticket 9: Campaign Detail + List

**Size:** M
**Depends on:** Tickets 7, 8

The campaign detail view showing everything related to a campaign, and the campaign list page with filtering.

**Tasks:**
- Create `src/app/(app)/campaigns/[id]/page.tsx`:
  - Campaign header: title (Bebas Neue), type badge, status badge, pillar badge, date range, owner avatar + name
  - Description section
  - Goals list (numbered)
  - Key messages list (styled)
  - Sponsor and product links (if set) — displayed as linked cards
  - Tabbed content area with 4 tabs:
    - "Assets" tab: list of assets linked to this campaign via `assets.campaign_id` — shows title, type, status, assigned to
    - "Tasks" tab: list of tasks linked via `tasks.campaign_id` — shows title, status, priority, assignee, due date
    - "Publications" tab: list of publications linked via `publications.campaign_id` — shows asset title, platform, scheduled date, status
    - "Activity" tab: activity log filtered to this campaign's entity_id
  - Edit button (permission-gated to `campaigns.update`)
  - Archive button (permission-gated to `campaigns.delete`, with confirmation dialogue)
- Create campaign query functions in `src/lib/queries/campaigns.ts`:
  - `getAssetsByCampaign(campaignId: string)`
  - `getTasksByCampaign(campaignId: string)`
  - `getPublicationsByCampaign(campaignId: string)`
  - `getActivityByCampaign(campaignId: string)`
- Update `src/app/(app)/campaigns/page.tsx`:
  - WeeklyFocusBanner at top (from Ticket 8)
  - "All Campaigns" section below with card grid layout
  - Each card: title, type badge, status badge, date range, pillar badge, owner avatar, asset count
  - Click card → navigate to `/campaigns/[id]`
  - Filter bar: type filter, status filter, pillar filter, date range filter
  - Sort by: start date (default), title, status
  - "New Campaign" button (permission-gated to `campaigns.create`)
- Wire up tab navigation using URL search params (`?tab=assets`)

**Acceptance criteria:**
- Campaign detail page loads with all campaign data
- All four tabs display correct data (empty states when no linked entities exist)
- Edit and archive buttons respect permissions (hidden for unauthorised roles)
- Archive requires confirmation dialogue before proceeding
- Campaign list shows all non-archived campaigns as cards
- Filters narrow the list correctly (all filters combinable)
- Cards link to detail pages
- Breadcrumbs show: Dashboard > Campaigns > [Campaign Title]

---

### Ticket 10: Asset CRUD

**Size:** L
**Depends on:** Tickets 5, 6, 7

Full asset create/read/update with type-specific form sections. Assets are the core content records — everything from podcast episodes to Instagram posts lives here. The form adapts its fields based on `asset_type`.

**Tasks:**
- Create `src/lib/actions/assets.ts` with Server Actions:
  - `createAsset(formData: FormData)` — validates with type-specific Zod schema, inserts into `assets` table, handles topic/tag junction table inserts (`asset_topics`, `asset_tags`), updates `search_vector` via trigger, logs activity
  - `updateAsset(id: string, formData: FormData)` — validates, updates, handles topic/tag diffs (add new, remove old), logs activity with field-level changes
  - `archiveAsset(id: string)` — sets `archived_at`, logs activity
- Create `src/lib/schemas/assets.ts` with Zod schemas:
  - `baseAssetSchema` — common fields: title (required), asset_type (required), status, pillar, description, body, excerpt, campaign_id, source_asset_id, assigned_to, due_date
  - `podcastEpisodeSchema` — extends base with: episode_number, season_number, duration_seconds, youtube_id, spotify_url, guest_name, guest_credential, recording_date
  - `blogPostSchema` — extends base with: seo_title, seo_description, keywords (string array), answer_capsule, canonical_url, word_count
  - `socialPostSchema` — extends base with platform-specific fields
  - `youtubeVideoSchema`, `clipSchema`, `newsletterSchema`, `communityPostSchema`
- Create `src/components/assets/AssetForm.tsx` with:
  - Common fields section: title, asset_type (dropdown — podcast_episode, youtube_video, clip, blog_post, newsletter, social_instagram, social_facebook, social_tiktok, social_twitter, social_linkedin, community_post), status (dropdown), pillar (dropdown), description (textarea), body (large textarea), excerpt (textarea)
  - Campaign selector (searchable dropdown from active campaigns)
  - Source asset selector (searchable dropdown — sets `source_asset_id`, marks `is_source = false`)
  - Assigned to (user selector), due date (date picker)
  - Type-specific sections that show/hide based on `asset_type`:
    - Podcast: episode_number (number), season_number (number), duration_seconds (number), youtube_id (text), spotify_url (url), guest_name (text), guest_credential (text), recording_date (date)
    - Blog: seo_title (text, max 60 chars), seo_description (textarea, max 160 chars), keywords (multi-input), answer_capsule (textarea), canonical_url (url)
    - Social: platform-specific character count indicators
  - Topic multi-select (from controlled taxonomy, grouped by pillar)
  - Tag multi-select (with create-new option — type and press Enter to create inline)
- Create `src/app/(app)/assets/new/page.tsx` — renders AssetForm in create mode
- Create `src/app/(app)/assets/[id]/edit/page.tsx` — renders AssetForm in edit mode, pre-populated
- Create `src/lib/queries/assets.ts` with query functions:
  - `getAsset(id: string)` — single asset with campaign, owner, topics, tags
  - `getAssets(filters)` — filtered list with pagination
  - `searchAssets(query: string)` — full-text search via `search_vector`

**Acceptance criteria:**
- Users can create assets of any type (all asset_type enum values supported)
- Type-specific fields appear/disappear when the relevant asset_type is selected
- Topics and tags are saved correctly to junction tables (`asset_topics`, `asset_tags`)
- Validation prevents submission with missing required fields (title, asset_type)
- Activity log records creation and updates
- Form handles all field types correctly (text, textarea, date, select, multi-select, number, url)
- Source asset linking works (searchable dropdown, saves `source_asset_id`)

---

### Ticket 11: Asset List + Search

**Size:** M
**Depends on:** Ticket 10

Filterable, searchable asset library using `@tanstack/react-table` with server-side pagination and full-text search.

**Tasks:**
- Create `src/app/(app)/assets/page.tsx`:
  - `DataTable` component using `@tanstack/react-table`
  - Columns: title (clickable link to `/assets/[id]`), type badge, status badge, pillar badge, campaign name, assigned to (avatar + name), updated date (relative with `date-fns`)
  - Server-side pagination: 20 items per page, page number in URL params
  - Row click → navigate to `/assets/[id]`
  - Column sorting (title, type, status, updated)
  - Asset count displayed: "Showing 1–20 of 142 assets"
- Create `src/components/assets/AssetFilters.tsx`:
  - Search input (full-text search via `to_tsvector` / `plainto_tsquery` on `assets.search_vector`)
  - Type filter (multi-select checkboxes)
  - Status filter (multi-select checkboxes)
  - Pillar filter (single-select dropdown)
  - Campaign filter (single-select dropdown from active campaigns)
  - Assigned to filter (single-select dropdown from profiles)
  - Date range filter (created/updated date range picker)
- Create search query in `src/lib/queries/assets.ts`:
  - `getFilteredAssets(filters: AssetFilters, page: number, perPage: number)` — builds dynamic query with all filter conditions, joins for campaign and profile data, applies full-text search when query provided, returns `{ data, count }`
- Implement URL-based filter state using `useSearchParams` (filters persist on page refresh and are shareable)
- "New Asset" button (permission-gated to `assets.create`)

**Acceptance criteria:**
- Assets are listed in a paginated table with correct data in each column
- All filters work independently and in combination
- Full-text search returns relevant results when querying titles, descriptions, guest names
- Pagination works correctly (page controls, correct count)
- Filters are reflected in the URL (shareable and refresh-safe)
- Empty state message when no assets match filters
- Asset count displayed accurately ("Showing 1–20 of 142 assets")
- "New Asset" button only visible to users with create permission

---

### Ticket 12: File Upload + Management

**Size:** M
**Depends on:** Ticket 10

File upload to Supabase Storage with drag-and-drop, progress tracking, external URL references, and primary file designation.

**Tasks:**
- Create Supabase Storage buckets via migration or dashboard:
  - `assets` bucket — for uploaded content files (images, PDFs, audio, documents)
  - `thumbnails` bucket — for auto-generated or uploaded thumbnails
  - Set appropriate RLS policies (authenticated users can read/write)
- Create `src/components/files/FileUploader.tsx`:
  - Drag-and-drop zone (dashed border, hover state) + file picker button
  - File type validation: images (jpg, png, webp, gif), PDFs, audio (mp3, wav, m4a), documents (doc, docx)
  - File size validation: 50MB maximum per file
  - Upload progress bar (percentage + animated bar)
  - Direct upload to Supabase Storage using signed URLs
  - Multiple file support (queue uploads sequentially)
- Create `src/lib/actions/files.ts` with Server Actions:
  - `uploadFile(assetId: string, formData: FormData)` — generates signed URL via Supabase, uploads file, inserts `files` record with metadata (name, type, size, storage_path)
  - `addExternalFile(assetId: string, formData: FormData)` — inserts `files` record with `external_url`, platform, and description (no file upload — just a link)
  - `deleteFile(fileId: string)` — removes file from Supabase Storage + deletes `files` record
  - `setPrimaryFile(fileId: string, assetId: string)` — marks the specified file as primary (`is_primary = true`), unmarks all others for that asset
- Create `src/components/files/FileList.tsx` — file list component for asset detail page:
  - List of files with: name, file type icon (Lucide), formatted size (KB/MB), upload date, primary badge (star icon)
  - Image preview (thumbnail for image files)
  - Download link (signed URL from Supabase Storage, or direct external URL)
  - Delete button (permission-gated, with confirmation)
  - "Set as primary" toggle
  - "Add external link" form: URL input, platform dropdown, description text input
- Create `src/app/api/upload/route.ts` for generating signed upload URLs

**Acceptance criteria:**
- Users can upload files via drag-and-drop or file picker
- Files are stored in Supabase Storage under the `assets` bucket with path `{asset_id}/{filename}`
- File records appear in the `files` table with correct metadata (name, type, size, storage_path)
- External URLs can be added without file upload (e.g. YouTube link, Spotify link)
- Files can be downloaded via signed URLs (or direct external URL)
- Files can be deleted (both from Supabase Storage and database)
- One file per asset can be marked as primary (toggling primary on one unmarks others)
- Upload progress is visible during upload
- File type and size validation prevents invalid uploads with clear error messages

---

### Ticket 13: Source→Derivative Linking

**Size:** M
**Depends on:** Ticket 10

Parent-child asset relationships and the derivative tree view. This is core to the Roadman content model: a podcast episode (source) spawns YouTube videos, clips, blog posts, social posts, and newsletter segments (derivatives).

**Tasks:**
- Enhance source asset selector in `src/components/assets/AssetForm.tsx`:
  - Searchable dropdown of existing assets (search by title, filter by type)
  - When selected, sets `source_asset_id` on the asset being created/edited
  - Shows the source asset title + type as a linked badge below the selector
  - "Clear source" button to remove the link
- Create `src/components/assets/DerivativeTree.tsx`:
  - Visual tree component showing: source asset at root → derivative assets as children → sub-derivatives as grandchildren
  - Each node displays: title (truncated), type badge (coloured), status badge
  - Click any node → navigate to that asset's detail page
  - Expand/collapse toggles for branches with children
  - "Add Derivative" button on source assets → navigates to `/assets/new?source={assetId}` with source pre-filled
  - Tree lines connecting nodes (CSS border-based, not SVG)
- Integrate derivative tree into asset detail page `src/app/(app)/assets/[id]/page.tsx`:
  - If asset `is_source === true` or has derivatives: show DerivativeTree section
  - If asset has `source_asset_id`: show "Source" link to parent + sibling derivatives list
- Create recursive query in `src/lib/queries/assets.ts`:
  - `getDerivativeTree(assetId: string)` — recursive CTE query to get full tree (asset + all descendants at any depth)
  - `getSourceChain(assetId: string)` — walk up the tree to find the root source
  - `getSiblings(assetId: string)` — other derivatives of the same source

**Acceptance criteria:**
- Assets can be linked to a source asset during creation or editing via the searchable dropdown
- The derivative tree correctly displays parent-child relationships with visual tree lines
- Multi-level trees render correctly (source → derivative → sub-derivative)
- Clicking a node navigates to that asset's detail page
- "Add Derivative" pre-fills `source_asset_id` in the new asset form
- Assets with `source_asset_id` show a link back to their source and a list of siblings
- Orphan derivatives (where source was archived) display gracefully with a "Source archived" indicator

---

### Ticket 14: Topic + Tag System

**Size:** M
**Depends on:** Ticket 10

Controlled topic taxonomy organised by content pillar, and freeform tags with autocomplete. Topics are the structured taxonomy; tags are the flexible labelling system.

**Tasks:**
- Create `src/app/(app)/settings/topics/page.tsx`:
  - CRUD table for topics using `@tanstack/react-table`
  - Fields: name (text), slug (auto-generated from name), pillar (dropdown), description (textarea), parent topic (dropdown of existing topics in same pillar), sort order (number)
  - Active/inactive toggle per topic
  - Pillar filter tabs at the top
  - Admin-only access (permission-gated to `settings.update`)
  - Inline edit mode (click to edit, Enter to save)
- Create `src/lib/actions/topics.ts` with Server Actions: `createTopic`, `updateTopic`, `toggleTopicActive`, `reorderTopics`
- Seed initial topics (migration `00004_topics_seed.sql`) for all 5 pillars:
  - **Coaching:** Zone 2, Threshold Training, Periodisation, Polarised Training, Durability, Power Metrics, Recovery Weeks, Race Preparation, Sweet Spot, VO2max, FTP Testing
  - **Nutrition:** Fuelling, Body Composition, Race Day Nutrition, Supplements, Carb Loading, Hydration, Gut Training, Caffeine, Recovery Nutrition
  - **Strength & Conditioning:** Core Training, Mobility, Power Development, Injury Prevention, Stretching, Gym Programming, Single-Leg Work, Plyometrics
  - **Recovery:** Sleep, Stress Management, Active Recovery, Overtraining, Heart Rate Variability, Massage, Cold Water Immersion
  - **Le Metier:** Group Riding, Skills, Bike Handling, Climbing, Time Trial, Equipment, Aerodynamics, Pacing, Positioning
- Create `src/components/ui/TagInput.tsx`:
  - Multi-select input with autocomplete dropdown
  - Type to search existing tags (debounced 150ms query)
  - Create new tags inline (type name + press Enter to create)
  - Remove tags with x button
  - Shows tag colour as a dot if set
  - Distinct variants: one for topics (controlled, no create-new), one for tags (freeform, create-new enabled)
- Wire `TagInput` into `AssetForm.tsx` for both topics (grouped by pillar) and tags (freeform)
- Create `src/lib/actions/tags.ts` with Server Actions: `createTag`, `updateTag`, `deleteTag`

**Acceptance criteria:**
- Admin can create, edit, and deactivate topics from `/settings/topics`
- Topics are organised by pillar with optional parent hierarchy (e.g. Coaching > Zone 2)
- Initial topics are seeded for all 5 pillars (minimum 7 topics per pillar)
- TagInput auto-completes from existing tags when typing
- New tags can be created inline by pressing Enter on a new name
- Topics and tags are saved to junction tables (`asset_topics`, `asset_tags`) when assets are saved
- Tags have a `usage_count` that increments when applied to an asset
- Pillar filter on settings page correctly filters the topic list

---

### Ticket 15: Content Clusters

**Size:** M
**Depends on:** Ticket 10

Content clusters group related assets together for SEO and internal linking purposes. Each cluster has a pillar page and supporting content pieces.

**Tasks:**
- Create `src/lib/actions/clusters.ts` with Server Actions:
  - `createCluster(formData: FormData)` — validates, inserts into `content_clusters`, logs activity
  - `updateCluster(id: string, formData: FormData)` — updates cluster metadata
  - `addAssetToCluster(clusterId: string, assetId: string, role: string)` — inserts into `content_cluster_assets`
  - `removeAssetFromCluster(clusterId: string, assetId: string)` — deletes from junction table
  - `archiveCluster(id: string)` — sets archived status
- Create `src/components/clusters/ClusterForm.tsx` with fields:
  - Name (text, required), slug (auto-generated), description (textarea)
  - Pillar (dropdown), pillar asset selector (searchable — the main page for this cluster)
  - Target query (text — the primary search query this cluster targets)
  - Related queries (multi-input — secondary queries)
  - Status (dropdown: draft, active, archived)
- Create `src/app/(app)/settings/clusters/page.tsx`:
  - List of clusters with name, pillar, status, member count, coverage score
  - "New Cluster" button
- Create `src/app/(app)/settings/clusters/[id]/page.tsx`:
  - Cluster header: name, pillar, target query, description
  - Member assets list: title, type, role (pillar/supporting/related), added date
  - "Add Asset" button with searchable asset selector and role dropdown
  - Remove asset button per row
  - Coverage score: calculated as percentage of content formats covered (e.g. has blog post, has video, has social — out of total possible formats)
- Create `src/lib/queries/clusters.ts`: `getCluster`, `getClusters`, `getClusterAssets`, `calculateCoverageScore`

**Acceptance criteria:**
- Clusters can be created with name, pillar, target query, and description
- Assets can be added to clusters with a role assignment (pillar, supporting, related)
- Assets can be removed from clusters
- Coverage score displays correctly (e.g. "4/7 formats covered — 57%")
- Cluster list page shows all clusters with member counts
- Cluster detail page shows all member assets grouped by role

---

## Phase 3: Workflow (Tickets 16–22)

### Ticket 16: Platform Seeding + Management

**Size:** S
**Depends on:** Ticket 2

Configure the 10 platforms Roadman publishes to. Each platform has format specs, character limits, and reuse policies that inform content scheduling.

**Tasks:**
- Create `src/app/(app)/settings/platforms/page.tsx`:
  - CRUD table for platforms using `@tanstack/react-table`
  - Fields: name (text), slug (auto-generated), platform_type (dropdown), account_handle (text), base_url (url), is_active (toggle), ideal_post_times (JSON — array of times), character_limits (JSON — e.g. `{ caption: 2200, hashtags: 30 }`), format_specs (JSON — e.g. `{ image: "1080x1080", video_max: "60s" }`)
  - Reuse policy editor per platform: expandable section showing asset_type → min_gap_days, max_reuses matrix
  - Active/inactive toggle
- Create `src/lib/actions/platforms.ts`: `createPlatform`, `updatePlatform`, `togglePlatformActive`, `updateReusePolicy`
- Seed Roadman's 10 platforms (migration `00005_platforms_seed.sql`):
  - **YouTube (Main):** The Roadman Podcast, slug `youtube-main`, platform_type `youtube`, handle `@theroadmanpodcast`, base_url `https://youtube.com/@theroadmanpodcast`
  - **YouTube (Clips):** Roadman Podcast Clips, slug `youtube-clips`, platform_type `youtube`, handle `@roadmanpodcastclips`, base_url `https://youtube.com/@roadmanpodcastclips`
  - **Instagram:** @roadman.cycling, slug `instagram`, platform_type `instagram`, character_limits `{ caption: 2200, hashtags: 30 }`, format_specs `{ image: "1080x1080 or 1080x1350", reel_max: "90s", story: "1080x1920" }`
  - **Facebook:** Roadman Cycling, slug `facebook`, platform_type `facebook`, base_url `https://facebook.com/roadmancycling`
  - **TikTok:** slug `tiktok`, platform_type `tiktok`, format_specs `{ video_max: "10m", aspect: "9:16" }`
  - **Twitter/X:** slug `twitter`, platform_type `twitter`, character_limits `{ post: 280 }`
  - **LinkedIn:** slug `linkedin`, platform_type `linkedin`, character_limits `{ post: 3000 }`
  - **Beehiiv Newsletter:** slug `beehiiv`, platform_type `newsletter`, base_url `https://roadmancycling.beehiiv.com`
  - **Skool Community:** slug `skool`, platform_type `community`, base_url `https://www.skool.com/roadmancycling`
  - **Website (Blog):** slug `website-blog`, platform_type `website`, base_url `https://roadmancycling.com/blog`
- Create platform reuse policies for each platform x asset type combination

**Acceptance criteria:**
- All 10 platforms are seeded with correct metadata (names, handles, URLs, limits, specs)
- Platform management page allows editing all fields
- Reuse policies are configurable per platform (asset type → min gap days, max reuses)
- Character limits and format specs are stored as JSON and accessible for display in scheduling forms
- Active/inactive toggle works and inactive platforms are excluded from scheduling

---

### Ticket 17: Publication CRUD + Bulk Scheduling

**Size:** M
**Depends on:** Tickets 10, 16

Create and manage publications (the record of an asset being published to a specific platform at a specific time), including bulk scheduling to multiple platforms at once.

**Tasks:**
- Create `src/lib/actions/publications.ts` with Server Actions:
  - `schedulePublication(formData: FormData)` — validates with Zod, inserts into `publications`, logs activity
  - `updatePublication(id: string, formData: FormData)` — validates, updates, logs activity
  - `markPublished(id: string, platformUrl: string)` — sets `status = 'published'`, `published_at = now()`, saves `platform_url`, logs activity
  - `cancelPublication(id: string)` — sets `archived_at`, logs activity
  - `bulkSchedulePublications(assetId: string, schedules: BulkSchedule[])` — creates multiple publication records in a transaction
- Create `src/lib/schemas/publications.ts` with Zod schemas
- Create `src/components/publications/ScheduleForm.tsx`:
  - Asset selector (searchable dropdown of assets)
  - Platform selector (dropdown of active platforms, shows platform icon)
  - Scheduled date/time picker (date + time inputs)
  - Platform-specific content fields:
    - Platform title (text, defaults to asset title)
    - Platform body (textarea, defaults to asset body/excerpt)
    - Hashtags (multi-input — add/remove hashtags)
    - Mentions (multi-input — add/remove @mentions)
  - Character count indicator (shows remaining chars based on platform limits)
  - Notes field (textarea)
- Create `src/components/publications/PublicationCard.tsx`:
  - Asset title, platform icon + platform name, scheduled time (relative or absolute)
  - Status badge: draft (grey), scheduled (blue), published (green), failed (red)
  - Quick actions: edit, mark published (opens URL input), cancel (with confirmation)
- Create `src/components/publications/BulkScheduleForm.tsx`:
  - Shows asset title (non-editable, passed as prop)
  - Platform checklist (checkboxes for each active platform with platform icons)
  - Per-platform date/time pickers (one row per selected platform)
  - "Same time for all" toggle — when enabled, single date/time applies to all selected platforms
  - Per-platform content overrides (expandable accordion per platform)
  - Submit creates multiple publication records via `bulkSchedulePublications`

**Acceptance criteria:**
- Publications can be created linking an asset to a platform with a specific date/time
- Platform-specific content fields default to asset content but can be overridden
- Character count indicator reflects platform limits accurately
- Publications appear in the database with correct status (defaults to `scheduled`)
- "Mark as published" updates status and records the platform URL
- Publications can be cancelled (sets `archived_at`)
- Bulk scheduling creates one publication record per selected platform
- "Same time for all" toggle correctly applies a single datetime across all platforms

---

### Ticket 18: Publication Calendar View

**Size:** L
**Depends on:** Ticket 17

Visual calendar showing publications across all platforms. The primary scheduling interface — the team uses this daily to see what is going out and when.

**Tasks:**
- Create `src/components/calendar/PublicationCalendar.tsx`:
  - **Week view** (default): 7 columns (Monday–Sunday), rows per active platform, publication chips placed in correct day/platform intersection
  - **Month view** (toggle): standard calendar month grid, each day cell shows coloured dots for publications (one dot per platform colour)
  - Publication chips: platform colour background + asset title (truncated to fit), status indicator
  - Click chip → open publication detail/edit dialogue (modal with ScheduleForm pre-filled)
  - Click empty slot → open ScheduleForm pre-filled with that date and platform
  - Today highlighted with Coral (#F16363) border
  - Navigation: previous/next week/month buttons, "Today" button to jump to current
  - Week/month toggle buttons
- Create `src/app/(app)/calendar/page.tsx`:
  - PublicationCalendar component
  - Filter bar:
    - Platform filter (multi-select checkboxes — show/hide platform rows)
    - Status filter (all, draft, scheduled, published)
    - Campaign filter (dropdown — show only publications from a specific campaign)
  - "Schedule New" button
- Create query in `src/lib/queries/publications.ts`:
  - `getPublicationsByDateRange(from: Date, to: Date, filters: PublicationFilters)` — returns publications with asset and platform data, sorted by scheduled_at
- Platform-specific colours for chips/dots:
  - YouTube: #FF0000 (red)
  - Instagram: linear gradient #833AB4 → #FD1D1D → #FCAF45
  - Facebook: #1877F2 (blue)
  - TikTok: #000000 (black)
  - Twitter/X: #1DA1F2 (blue)
  - LinkedIn: #0A66C2 (blue)
  - Beehiiv: #FF6719 (orange)
  - Skool: #2563EB (blue)
  - Website: #252526 (charcoal)

**Acceptance criteria:**
- Week view shows 7 columns (Mon–Sun) with platform rows and publication chips in correct positions
- Month view shows a standard grid with coloured dots indicating publications per day
- Clicking a publication chip opens the edit dialogue with all fields pre-filled
- Clicking an empty slot opens the schedule form with date and platform pre-filled
- Platform filter hides/shows platform rows in week view
- Navigation between weeks/months works correctly
- Current day is visually highlighted with Coral border
- Platform colours are distinct and consistent across the calendar

---

### Ticket 19: Task CRUD + Board

**Size:** M
**Depends on:** Tickets 5, 6, 7, 10

Task management with kanban board and list views. Tasks can be standalone or linked to assets and campaigns.

**Tasks:**
- Create `src/lib/actions/tasks.ts` with Server Actions:
  - `createTask(formData: FormData)` — validates with Zod, inserts, logs activity
  - `updateTask(id: string, formData: FormData)` — validates, updates, logs activity
  - `updateTaskStatus(id: string, status: TaskStatus)` — status change only, logs activity with old/new status
  - `assignTask(id: string, userId: string)` — assigns task, logs activity
  - `archiveTask(id: string)` — sets `archived_at`, logs activity
- Create `src/components/tasks/TaskBoard.tsx`:
  - Kanban columns: Backlog, To Do, In Progress, In Review, Done
  - Each column header shows column name + task count
  - Task cards show: title, priority badge (urgent=red, high=orange, medium=yellow, low=grey), assignee avatar, due date (red if overdue), asset link (if linked)
  - Drag-and-drop between columns using HTML Drag and Drop API (updates status via `updateTaskStatus`)
  - Click card → expand to inline edit form or navigate to detail
- Create `src/components/tasks/TaskForm.tsx`:
  - Title (text, required), description (textarea)
  - Status (dropdown: backlog, to_do, in_progress, in_review, done)
  - Priority (dropdown: urgent, high, medium, low)
  - Asset selector (optional, searchable dropdown)
  - Campaign selector (optional, searchable dropdown)
  - Assigned to (user selector dropdown)
  - Due date (date picker)
  - Estimated minutes (number input)
  - Labels (multi-input freeform)
  - Parent task selector (for sub-tasks — searchable dropdown of existing tasks)
- Create `src/app/(app)/tasks/page.tsx`:
  - Toggle between kanban view (TaskBoard) and list view (DataTable)
  - Filter bar: assignee, status, priority, campaign, due date range
  - "New Task" button
- Create list view: DataTable with columns — title, status, priority, assignee, campaign, due date, estimated minutes
- Create `src/lib/queries/tasks.ts`: `getTasks`, `getTasksByStatus`, `getTasksByCampaign`, `getSubTasks`

**Acceptance criteria:**
- Tasks can be created with all fields including optional asset/campaign links
- Kanban board displays tasks in correct status columns
- Drag-and-drop moves tasks between columns and updates status in the database
- List view shows all tasks in a sortable, filterable table
- Tasks can be assigned to team members
- Sub-tasks display under their parent task (indented in list view, grouped in kanban)
- Filters work in both kanban and list views
- Overdue tasks show due date in red
- Priority badges use appropriate colours

---

### Ticket 20: Content Briefs + Approval Flow

**Size:** M
**Depends on:** Tickets 10, 7

Content brief creation with a submit → approve/reject workflow. Briefs ensure content is strategically aligned before production begins.

**Tasks:**
- Create `src/components/briefs/BriefForm.tsx` with sections:
  - **Targeting:** primary query (text), secondary queries (multi-input), search intent (dropdown: informational, navigational, transactional, commercial), target persona (dropdown: beginner, intermediate, advanced, coach, all), pillar (dropdown)
  - **Angle:** unique angle (textarea — what makes this different from existing content), competitor gaps (textarea — what competitors miss), original sources (multi-input — links/references), answer capsule (textarea — the one-paragraph answer), decision framework (textarea — how reader should decide)
  - **Internal Linking:** pillar page URL (text), related episodes (multi-select assets), related tools (multi-input), CTA (text — what action the reader should take)
  - **Cannibalisation Check:** existing pages covering this topic (multi-input), decision (dropdown: proceed, merge, redirect, cancel), rationale (textarea)
- Create `src/lib/actions/briefs.ts` with Server Actions:
  - `createBrief(formData: FormData)` — validates with Zod, inserts into `content_briefs`, sets status to `draft`, logs activity
  - `updateBrief(id: string, formData: FormData)` — updates brief fields, logs activity
  - `submitBrief(id: string)` — changes status to `submitted`, sets `submitted_at`, logs activity
  - `approveBrief(id: string)` — changes status to `approved`, sets `approved_at` and `approved_by`, logs activity; permission-gated to `admin` or `leadership` roles only
  - `rejectBrief(id: string, reason: string)` — changes status to `rejected`, saves `rejection_reason`, logs activity; permission-gated to `admin` or `leadership` only
- Create `src/app/(app)/assets/[id]/brief/page.tsx` — brief form linked to an asset
- Link briefs to assets: when viewing an asset detail page, show brief status badge and link to brief
- Show brief status on asset cards in list view (small badge: draft, submitted, approved, rejected)

**Acceptance criteria:**
- Content briefs can be created with all targeting, angle, internal linking, and cannibalisation fields
- Briefs are linked to an asset via `content_briefs.asset_id`
- Submit workflow works: draft → submitted (creator action) → approved or rejected (admin/leadership action)
- Only users with `admin` or `leadership` role can approve or reject briefs
- Rejection includes a reason that is visible to the brief creator
- Brief status badge appears on asset detail page and asset list cards
- Approved briefs signal that the linked asset can proceed to production

---

### Ticket 21: Ideas Quick Capture

**Size:** S
**Depends on:** Tickets 5, 6

Lightweight idea capture with one-field quick entry, voting, and promotion to full assets. Ideas are the top of the content funnel.

**Tasks:**
- Create `src/app/(app)/ideas/page.tsx`:
  - Quick capture input at the top: title text input + pillar dropdown + submit button (or Enter key)
  - Idea list below as cards:
    - Title, status badge (new, in_review, approved, promoted, discarded), pillar badge
    - Source (text — where the idea came from), created by (avatar + name), date (relative)
    - Vote count with thumbs-up button
    - Click idea → expand inline to show/edit description, source, target_asset_type
    - "Promote to Asset" button (creates a new asset pre-filled with idea data, sets idea status to `promoted`, links via `converted_to_asset_id`)
    - "Discard" button (sets status to `discarded`, with confirmation)
  - Filter bar: status filter, pillar filter, created by filter
  - Sort options: newest (default), most votes, pillar
- Create `src/lib/actions/ideas.ts` with Server Actions:
  - `captureIdea(formData: FormData)` — minimal validation (title required), fast insert with `status = 'new'`, `created_by = currentUser`, logs activity
  - `updateIdea(id: string, formData: FormData)` — full update of title, description, pillar, source, target_asset_type
  - `voteIdea(id: string)` — increments `vote_count` by 1 (one vote per user enforced at app layer via activity_log check)
  - `promoteIdea(id: string)` — creates a new asset with idea's title/description/pillar, sets idea's `converted_to_asset_id` and `status = 'promoted'`, logs activity
  - `discardIdea(id: string)` — sets `status = 'discarded'`, logs activity
- Create `src/lib/queries/ideas.ts`: `getIdeas(filters, sort)`, `getIdea(id)`

**Acceptance criteria:**
- Ideas can be captured with just a title (one-field quick entry, Enter to submit)
- Ideas appear in the list immediately after creation
- Pillar can be selected during quick capture (optional — defaults to null)
- Voting increments the count (one vote per user enforced)
- "Promote to Asset" creates a new asset pre-filled with the idea's title, description, and pillar
- Promoted ideas show "Promoted" status badge with a link to the created asset
- "Discard" requires confirmation before proceeding
- Filters and sorting work correctly across all combinations

---

### Ticket 22: Notifications

**Size:** M
**Depends on:** Tickets 5, 6

In-app notification system that alerts users when something relevant happens — task assignments, brief decisions, mentions, and scheduled publications.

**Tasks:**
- Create `notifications` table (already in schema from Ticket 2) — verify columns: id, user_id, type, title, body, entity_type, entity_id, is_read, created_at
- Create `src/lib/actions/notifications.ts` with:
  - `createNotification(userId: string, type: string, title: string, body: string, entityType: string, entityId: string)` — inserts notification record
  - `markAsRead(notificationId: string)` — sets `is_read = true`
  - `markAllAsRead(userId: string)` — marks all unread notifications as read for the user
  - `getUnreadCount(userId: string)` — returns count of unread notifications
- Add notification triggers to existing Server Actions:
  - Task assigned → notify assignee: "You've been assigned a task: {title}"
  - Brief approved → notify creator: "Your content brief has been approved: {title}"
  - Brief rejected → notify creator: "Your content brief needs revision: {title} — Reason: {reason}"
  - Comment with @mention → notify mentioned user: "{actor} mentioned you in a comment on {entity_title}"
  - Publication scheduled → notify asset owner: "Publication scheduled: {asset_title} on {platform} at {time}"
- Create `src/components/layout/NotificationBell.tsx`:
  - Bell icon (Lucide `Bell`) in the header
  - Unread count badge (red circle with number, hidden when 0)
  - Click → dropdown panel showing recent notifications (last 20)
  - Each notification: icon (by type), title, body (truncated), relative timestamp, read/unread indicator (dot)
  - Click notification → navigate to the relevant entity and mark as read
  - "Mark all as read" link at the top of the dropdown
- Create `src/app/api/notifications/route.ts` for fetching notifications (supports polling)
- Wire NotificationBell into `Header.tsx`
- Set up polling: fetch unread count every 30 seconds, or use Supabase Realtime subscription on the `notifications` table filtered by `user_id`

**Acceptance criteria:**
- Notifications are created on trigger events (task assigned, brief approved/rejected, comment mention, publication scheduled)
- Notification bell in header shows unread count as a red badge
- Clicking the bell opens a dropdown with recent notifications
- Each notification shows type icon, title, body, and relative timestamp
- Clicking a notification navigates to the relevant entity (task, brief, asset, etc.)
- "Mark all as read" clears all unread notifications for the current user
- Notification count updates within 30 seconds of a new notification (via polling or realtime)

---

## Phase 4: Platform Integrations (Tickets 23–30)

### Ticket 23: Integration Settings UI

**Size:** M
**Depends on:** Tickets 5, 6

The integration management page where platform connections are configured, OAuth flows are initiated, and sync status is monitored.

**Tasks:**
- Create `src/app/(app)/settings/integrations/page.tsx`:
  - Grid of platform connection cards (one per platform)
  - Permission-gated to `integrations.update` (admin only)
- Create `src/components/integrations/ConnectionCard.tsx`:
  - Platform icon and name
  - Connection status indicator: Connected (green), Disconnected (grey), Error (red), Expired (amber)
  - Last sync time (relative, e.g. "2 hours ago")
  - Account info when connected (e.g. "ted@roadmancycling.com", "@roadman.cycling")
  - Action buttons:
    - "Connect" (when disconnected) → initiates OAuth flow or shows API key input
    - "Disconnect" (when connected) → confirms, then removes tokens from `platform_connections`
    - "Re-authorise" (when expired/error) → re-initiates OAuth flow
    - "Sync Now" (when connected) → triggers manual sync
- Create `src/components/integrations/SyncStatusBadge.tsx`:
  - Green dot: last sync < 24 hours ago
  - Amber dot: last sync 1–3 days ago
  - Red dot: last sync > 3 days ago or error state
- Create OAuth2 flow handler:
  - `src/app/api/auth/[platform]/route.ts` — initiates OAuth flow (builds auth URL with correct scopes, state parameter with CSRF token, redirect URI)
  - `src/app/api/auth/[platform]/callback/route.ts` — handles OAuth callback (exchanges code for tokens, stores access_token, refresh_token, token_expires_at, scopes in `platform_connections`, redirects back to settings page)
- Create API key entry form component for platforms that use API keys (Beehiiv, GA4 service account):
  - Secure input field (password type), save button
  - Stores key in `platform_connections.api_key` (encrypted at rest via Supabase)
- Create `src/lib/utils/oauth.ts` with:
  - `refreshAccessToken(connectionId: string)` — refreshes expired OAuth tokens using the stored refresh_token
  - `getValidToken(connectionId: string)` — returns a valid access token, refreshing if needed
- Create `src/lib/queries/integrations.ts`: `getConnections`, `getConnection(platformId)`, `getConnectionStatus`

**Acceptance criteria:**
- Integration settings page shows all platforms with their current connection status
- OAuth flow works end-to-end: click Connect → redirect to provider → authorise → callback stores tokens → redirected back to settings showing "Connected"
- API key entry works for Beehiiv and GA4 (saved to `platform_connections`)
- "Disconnect" removes stored tokens after confirmation
- "Re-authorise" re-initiates the OAuth flow for expired connections
- SyncStatusBadge correctly shows green/amber/red based on last sync time
- OAuth state parameter prevents CSRF attacks

---

### Ticket 24: YouTube Integration

**Size:** L
**Depends on:** Ticket 23

Full YouTube Data API v3 and Analytics API integration for both channels (The Roadman Podcast + Roadman Podcast Clips). Pulls video metadata, analytics, and revenue data.

**Tasks:**
- Create `src/lib/integrations/youtube.ts` — YouTube API client:
  - Initialise with OAuth2 credentials from `platform_connections` (auth via ted@roadmancycling.com)
  - YouTube Data API v3 functions:
    - `listChannelVideos(channelId: string, maxResults: number, pageToken?: string)` — returns video list with snippet, contentDetails, statistics
    - `getVideoDetails(videoId: string)` — returns full video metadata
    - `getChannelStats(channelId: string)` — returns subscriber count, total views, video count
  - YouTube Analytics API functions:
    - `getVideoAnalytics(videoId: string, startDate: string, endDate: string)` — returns views, estimatedMinutesWatched, averageViewDuration, cardClickRate, subscribersGained
    - `getRevenueData(videoId: string, startDate: string, endDate: string)` — returns estimatedRevenue, estimatedAdRevenue, grossRevenue
    - `getChannelAnalytics(channelId: string, startDate: string, endDate: string)` — aggregate channel metrics
  - OAuth2 scopes required: `youtube.readonly`, `yt-analytics.readonly`, `yt-analytics-monetary.readonly`
  - Rate limit tracking: monitor daily quota usage (10,000 units/day), log quota consumption per request, pause sync if quota approaches limit
  - Token refresh handling via `getValidToken()`
- Create sync handler `src/app/api/sync/youtube/route.ts`:
  - Validates request (CRON_SECRET or admin session)
  - Iterates both channels: The Roadman Podcast (UC...) + Roadman Podcast Clips (UC...)
  - For each video: upsert `performance_records` with mapped fields
  - Maps YouTube data to `performance_records`:
    - `views` → views
    - `estimatedMinutesWatched` × 60 → `watch_time_seconds`
    - `cardClickRate` → `click_through_rate`
    - `averageViewDuration` → `average_view_duration_seconds`
    - `estimatedRevenue` × 100 → `revenue_cents`
    - `subscribersGained` → `new_subscribers`
  - Creates `sync_jobs` record tracking progress (status, records_processed, records_failed, error_message)
- Create `src/lib/integrations/youtube-mapper.ts` — maps YouTube API responses to internal types

**Acceptance criteria:**
- Both YouTube channels can be connected via OAuth2 (ted@roadmancycling.com)
- Video list is pulled correctly from both channels with metadata (title, description, duration, thumbnail)
- Analytics data is fetched and stored as `performance_records` (views, watch time, CTR, avg duration)
- Revenue data is tracked in cents in `performance_records.revenue_cents`
- Rate limits are respected (quota tracking, pause at threshold)
- Sync handler creates `sync_jobs` records with accurate progress tracking
- Token refresh works automatically when tokens expire

---

### Ticket 25: Meta Integration (Instagram + Facebook)

**Size:** L
**Depends on:** Ticket 23

Meta Graph API integration for Instagram (@roadman.cycling, 49.4K followers) and Facebook (Roadman Cycling, 29.9K followers). Pulls post data, insights, and follower counts.

**Tasks:**
- Create `src/lib/integrations/meta.ts` — Meta Graph API client:
  - Initialise with OAuth2 credentials from `platform_connections`
  - OAuth2 scopes: `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`, `pages_show_list`, `read_insights`
  - Instagram functions:
    - `listInstagramMedia(accountId: string, limit: number, after?: string)` — returns media list with id, caption, media_type, timestamp, permalink
    - `getInstagramInsights(mediaId: string)` — returns reach, impressions, engagement, saved, shares, video_views (for reels/videos)
    - `getInstagramAccountInsights(accountId: string, period: string)` — follower count, reach, impressions over period
  - Facebook functions:
    - `listFacebookPosts(pageId: string, limit: number, after?: string)` — returns post list with message, created_time, permalink
    - `getFacebookInsights(postId: string)` — returns post_impressions, post_engaged_users, post_clicks, post_reactions_by_type
    - `getFacebookPageInsights(pageId: string, period: string)` — page likes, followers, reach
  - `getFollowerCounts()` — returns current follower/like counts for both platforms
  - Pagination handler: `fetchAllPages(initialUrl)` — follows cursor-based pagination to pull all results within a date range
- Create sync handler `src/app/api/sync/meta/route.ts`:
  - Validates request (CRON_SECRET or admin session)
  - Pulls latest Instagram media with insights
  - Pulls latest Facebook posts with insights
  - For each post: upserts `performance_records` with mapped fields:
    - `views` → video_views or impressions
    - `impressions` → impressions
    - `reach` → reach
    - `likes` → reactions total
    - `comments` → comments count
    - `shares` → shares
    - `saves` → saved
    - `engagement_rate` → calculated (engagements / reach × 100)
  - Tracks follower counts as separate `performance_records` with `source = 'instagram'` / `source = 'facebook'`
  - Creates `sync_jobs` record

**Acceptance criteria:**
- Instagram (@roadman.cycling) and Facebook (Roadman Cycling) can be connected via Meta OAuth2
- Instagram posts are pulled with insights (reach, impressions, engagement, saves, shares, video views)
- Facebook posts are pulled with insights (impressions, clicks, reactions, shares)
- Follower counts are tracked for both platforms
- Data is correctly mapped to `performance_records` fields
- Cursor-based pagination handles bulk data pulls without missing posts
- Sync creates accurate `sync_jobs` records

---

### Ticket 26: LinkedIn Integration

**Size:** M
**Depends on:** Ticket 23

LinkedIn API integration for the Roadman Cycling organisation page. Pulls post statistics and follower data.

**Tasks:**
- Create `src/lib/integrations/linkedin.ts` — LinkedIn API client:
  - Initialise with OAuth2 credentials from `platform_connections`
  - OAuth2 scopes: `r_organization_social`, `rw_organization_admin`
  - Functions:
    - `listOrganizationPosts(organizationId: string, count: number, start?: number)` — returns post list with id, text, created timestamp
    - `getPostStatistics(postUrn: string)` — returns impressions, clicks, engagement, likes, comments, shares, click-through rate
    - `getFollowerData(organizationId: string)` — returns total followers, follower demographics (industry, seniority, function)
    - `getOrganizationStatistics(organizationId: string, timeRange: string)` — aggregate page views, unique visitors
  - Handle LinkedIn-specific URN format for post and organisation IDs
  - Token refresh via `getValidToken()`
- Create sync handler `src/app/api/sync/linkedin/route.ts`:
  - Validates request (CRON_SECRET or admin session)
  - Pulls latest posts with statistics
  - Maps to `performance_records`:
    - `impressions` → impressions
    - `clicks` → clicks
    - `engagement_rate` → engagement rate
    - `likes` → likes
    - `comments` → comments
    - `shares` → shares
  - Tracks follower count
  - Creates `sync_jobs` record

**Acceptance criteria:**
- LinkedIn organisation page can be connected via OAuth2
- Organisation posts are pulled with performance statistics
- Follower data is tracked including total count
- Data is correctly mapped to `performance_records`
- LinkedIn URN format is handled correctly for API calls
- Sync creates accurate `sync_jobs` records

---

### Ticket 27: Spotify / Podcast Integration

**Size:** M
**Depends on:** Ticket 23

RSS feed parsing and Spotify for Podcasters API integration. The Roadman Cycling Podcast has 100M+ downloads — this integration pulls episode metadata and listener data.

**Tasks:**
- Create `src/lib/integrations/spotify.ts` — Podcast integration client:
  - RSS feed parser:
    - `parseRSSFeed(feedUrl: string)` — fetches and parses the podcast RSS feed (XML)
    - Extracts per episode: title, description, duration, publish date, enclosure URL (audio file), episode number, season number, guid
    - Uses built-in DOMParser or `xml2js` library for parsing
  - Spotify for Podcasters API (if available):
    - `getEpisodeStats(episodeId: string)` — downloads/streams, listeners, completion rate
    - `getPodcastStats()` — total downloads, subscriber count, platform breakdown (Apple, Spotify, web, etc.)
    - `getListenerDemographics()` — age, gender, location breakdown
  - Fallback: if Spotify API is not available or limited, support manual metric entry for download counts
- Create sync handler `src/app/api/sync/spotify/route.ts`:
  - Validates request (CRON_SECRET or admin session)
  - Parses RSS feed to discover new episodes
  - For each new episode: creates an `assets` record with `asset_type = 'podcast_episode'`, populates episode_number, season_number, duration_seconds, description
  - If Spotify API available: pulls analytics and creates `performance_records`
  - Deduplication: skips episodes that already exist (match by episode_number or guid)
  - Creates `sync_jobs` record

**Acceptance criteria:**
- RSS feed is parsed correctly, extracting all episode metadata (title, description, duration, publish date, episode number)
- New episodes discovered via RSS are created as `podcast_episode` assets automatically
- If Spotify API is available: download counts and listener data are pulled and stored as `performance_records`
- Duplicate episodes are not created (deduplication by episode_number or guid)
- Sync creates accurate `sync_jobs` records
- Manual fallback works for entering download counts when API is unavailable

---

### Ticket 28: Beehiiv Integration

**Size:** M
**Depends on:** Ticket 23

Beehiiv API integration for the Roadman Cycling newsletter (29,782 contacts). Pulls newsletter performance data and subscriber growth. Note: Beehiiv is the email platform — NOT ClickFunnels.

**Tasks:**
- Create `src/lib/integrations/beehiiv.ts` — Beehiiv API client:
  - Auth: API key from `platform_connections.api_key`
  - Base URL: `https://api.beehiiv.com/v2`
  - Functions:
    - `listPosts(publicationId: string, limit: number, page?: number)` — returns sent newsletters with id, title, subtitle, status, publish_date, web_url
    - `getPostStats(postId: string)` — returns open_rate, click_rate, unique_opens, total_opens, unique_clicks, total_clicks, unsubscribes
    - `getPublicationStats(publicationId: string)` — returns total_subscribers, active_subscribers, new_subscribers_30d, churn_30d
    - `getSegments(publicationId: string)` — returns subscriber segments
    - `getAutomations(publicationId: string)` — returns automation sequences
  - Pagination handler for list endpoints
- Create sync handler `src/app/api/sync/beehiiv/route.ts`:
  - Validates request (CRON_SECRET or admin session)
  - Pulls latest newsletter sends with stats
  - Maps to `performance_records`:
    - `open_rate` → open_rate
    - `clicks` → unique_clicks
    - `new_subscribers` → new subscribers in period
    - `unsubscribes` → unsubscribes in period
  - Tracks subscriber count as a separate `performance_records` entry with `source = 'beehiiv'`
  - Creates `sync_jobs` record
- Create webhook handler `src/app/api/webhooks/beehiiv/route.ts`:
  - Receives new newsletter send events from Beehiiv webhooks
  - On new send: creates a `newsletter` asset and starts tracking performance
  - Validates webhook signature if Beehiiv provides one

**Acceptance criteria:**
- Beehiiv connects via API key (entered in integration settings)
- Newsletter data is pulled correctly: titles, publish dates, web URLs
- Performance stats are fetched per newsletter: open rate, click rate, unique opens/clicks
- Subscriber growth is tracked: total count, new subscribers, churn
- Webhook receives new newsletter send events and creates asset records
- Data is correctly mapped to `performance_records` with `source = 'beehiiv'`
- Sync creates accurate `sync_jobs` records

---

### Ticket 29: GA4 Integration

**Size:** M
**Depends on:** Ticket 23

Google Analytics 4 integration for roadmancycling.com. Uses a service account (no OAuth) to pull page-level analytics, traffic sources, and engagement data.

**Tasks:**
- Create `src/lib/integrations/ga4.ts` — GA4 Data API client:
  - Auth: service account credentials (no OAuth — server-to-server via `GA4_CLIENT_EMAIL` + `GA4_PRIVATE_KEY` environment variables)
  - Initialise `google.analytics.data.v1beta` client with JWT auth
  - Functions:
    - `runReport(propertyId: string, dimensions: string[], metrics: string[], dateRange: DateRange, filters?: FilterExpression)` — executes a GA4 report query
    - `getPageViews(propertyId: string, dateRange: DateRange)` — returns page path, page views, sessions, avg engagement time
    - `getTrafficSources(propertyId: string, dateRange: DateRange)` — returns source, medium, sessions, users
    - `getTopPages(propertyId: string, dateRange: DateRange, limit: number)` — returns top pages by views
    - `getDeviceBreakdown(propertyId: string, dateRange: DateRange)` — returns device category, sessions, users
    - `getEngagementMetrics(propertyId: string, dateRange: DateRange)` — returns engagement rate, events per session, avg session duration
  - Date range helper: `getDateRange(period: '7d' | '30d' | '90d' | 'custom')` — returns formatted date range
- Create sync handler `src/app/api/sync/ga4/route.ts`:
  - Validates request (CRON_SECRET or admin session)
  - Pulls page-level data for the last 7 days (daily sync) or 30 days (weekly sync)
  - Matches GA4 page paths to assets: compare `pagePath` against `assets.canonical_url` or `assets.external_url` to link GA4 data to the correct asset
  - Creates `performance_records` entries per page/asset:
    - `views` → page views
    - `impressions` → sessions
    - `clicks` → outbound clicks (if tracked)
    - `engagement_rate` → engagement rate
  - Stores traffic source breakdown in `performance_records.metadata` (JSON)
  - Creates `sync_jobs` record

**Acceptance criteria:**
- GA4 connects via service account credentials (no OAuth required — API key entry in settings)
- Page-level data is pulled correctly (page views, sessions, engagement time)
- Traffic sources are captured (organic, social, direct, referral)
- GA4 page paths are matched to assets by `canonical_url` or `external_url`
- Device breakdown data is stored
- Sync creates accurate `sync_jobs` records
- Service account auth works without user interaction

---

### Ticket 30: Skool Integration

**Size:** S
**Depends on:** Ticket 23

Manual metric entry for Skool community data. Skool does not have a public API, so metrics are entered manually. Clubhouse (free, 1,852 members) and Not Done Yet (paid, $195/month, 113 members) are tracked separately.

**Tasks:**
- Create `src/app/(app)/settings/integrations/skool/page.tsx`:
  - Manual metric entry form with two sections:
    - **Clubhouse (Free):** member count, new joins this period, members left this period, active members (7d), posts this period, comments this period
    - **Not Done Yet (Paid — $195/month):** member count, new joins this period, members left this period (churn), active members (7d), posts this period, comments this period, MRR (calculated: members × $195)
  - Period selector: weekly or monthly entry
  - Date picker for the period
  - History table showing past entries with edit capability
  - "Save Metrics" button
- Create `src/lib/actions/skool.ts`:
  - `saveSkoolMetrics(formData: FormData)` — validates, stores as `performance_records` with `source = 'skool'`, platform_id matching the Skool platform
  - `getSkoolHistory(limit: number)` — returns historical Skool metrics
- Map Skool data to `performance_records`:
  - `views` → active members
  - `new_subscribers` → new joins
  - `unsubscribes` → members left (churn)
  - `engagement_rate` → (active members / total members) × 100
  - `revenue_cents` → MRR in cents (for NDY paid tier only)
- Add a note in the UI: "Skool does not currently offer a public API. If one becomes available, an automated connector will be built."

**Acceptance criteria:**
- Manual Skool metrics can be entered for both Clubhouse (free) and Not Done Yet (paid) tiers
- Data is stored as `performance_records` with `source = 'skool'`
- Historical tracking works — past entries are visible in a history table and can be edited
- MRR is auto-calculated for NDY paid tier (member count × $195)
- Period date is recorded accurately for trend tracking
- The manual entry form is accessible from the integration settings page

---

## Phase 5: Auto-Import & Sync (Tickets 31–35)

### Ticket 31: Bulk Import — YouTube

**Size:** L
**Depends on:** Ticket 24

Import wizard that pulls all existing published videos from both YouTube channels (The Roadman Podcast — 61.7K subs, and Roadman Podcast Clips — 13.2K subs), creating assets and publications for each.

**Tasks:**
- Create `src/app/(app)/settings/import/youtube/page.tsx` — import wizard:
  - Step 1: Select channel(s) — checkboxes for The Roadman Podcast and Roadman Podcast Clips
  - Step 2: Select date range — start date and end date pickers (default: all time)
  - Step 3: Preview — paginated table of videos to be imported (title, publish date, views, duration), with select/deselect toggles
  - Step 4: Import — progress indicator showing current video, total processed, errors
- Create `src/lib/import/youtube-import.ts`:
  - `importYouTubeChannel(channelId: string, channelSlug: string, dateRange: DateRange)` — iterates all videos:
    - Creates `assets` record: `asset_type = 'youtube_video'` (main channel) or `asset_type = 'clip'` (clips channel), populates title, description, duration_seconds, youtube_id, episode_number (parsed from title if available)
    - Creates `publications` record: platform_id = YouTube Main or YouTube Clips, status = 'published', published_at = video publish date, platform_url = video URL
    - Creates `files` record: external_url = YouTube video URL, platform = 'youtube'
    - Pulls initial analytics for the video and creates `performance_records`
  - Deduplication: checks `assets.youtube_id` before creating — skips if already exists
  - Handles pagination (YouTube API returns max 50 per page)
- Create progress tracking:
  - Store import progress in `sync_jobs` table
  - Real-time progress updates via polling (`/api/import/status/[jobId]`)
  - Show: "Importing video 47 of 312...", progress bar, current video title
- Handle both channels distinctly:
  - The Roadman Podcast → `asset_type = 'youtube_video'`, platform = YouTube Main
  - Roadman Podcast Clips → `asset_type = 'clip'`, platform = YouTube Clips

**Acceptance criteria:**
- Import wizard allows selecting channels and date range
- Preview shows videos to be imported with key metadata
- All published videos are imported from both channels as assets with correct `asset_type`
- Publications are created linking each asset to the correct YouTube platform
- File records are created with YouTube URLs
- Initial analytics are attached as `performance_records`
- No duplicate assets are created (deduplication by `youtube_id`)
- Progress indicator shows real-time import status (current video, total count, errors)
- Import can be resumed if interrupted (skips already-imported videos)

---

### Ticket 32: Bulk Import — Podcast + Blog + Beehiiv

**Size:** M
**Depends on:** Tickets 27, 28

Import wizard for podcast episodes (from RSS feed), blog posts (from roadmancycling.com), and newsletters (from Beehiiv). Establishes source→derivative links where possible.

**Tasks:**
- Create `src/app/(app)/settings/import/page.tsx` — unified import wizard:
  - Platform selection: checkboxes for Podcast (RSS), Blog (Website), Newsletter (Beehiiv)
  - Per-platform configuration and preview
  - Import progress with per-platform status
- **Podcast import** (`src/lib/import/podcast-import.ts`):
  - Parse full RSS feed using `parseRSSFeed()` from Ticket 27
  - For each episode: create `podcast_episode` asset with title, description, episode_number, season_number, duration_seconds, spotify_url, recording_date
  - Match to YouTube videos: compare episode_number or fuzzy-match title to existing YouTube assets to establish `source_asset_id` links (podcast episode is the source, YouTube video is the derivative)
  - Deduplication by episode_number
- **Blog import** (`src/lib/import/blog-import.ts`):
  - Fetch sitemap.xml from `https://roadmancycling.com/sitemap.xml`
  - Parse sitemap to extract blog post URLs
  - For each blog URL: fetch page, extract title, meta description, canonical URL, publish date (from structured data or meta tags)
  - Create `blog_post` asset with title, seo_description, canonical_url, external_url
  - Deduplication by canonical_url
- **Beehiiv import** (`src/lib/import/beehiiv-import.ts`):
  - Use `listPosts()` from Ticket 28 to fetch all sent newsletters
  - For each newsletter: create `newsletter` asset with title, description (subtitle), external_url (web URL)
  - Pull performance stats and create `performance_records`
  - Deduplication by external_url
- Import wizard with progress tracking per platform

**Acceptance criteria:**
- Podcast episodes are imported from the RSS feed as `podcast_episode` assets
- Podcast episodes are linked to YouTube videos as source→derivative where episode numbers or titles match
- Blog posts are imported from roadmancycling.com sitemap as `blog_post` assets with canonical URLs
- Newsletters are imported from Beehiiv as `newsletter` assets with performance data
- No duplicate assets are created across any platform (deduplication checks before insert)
- Import progress is tracked per platform with counts and error reporting

---

### Ticket 33: Vercel Cron Sync Jobs

**Size:** M
**Depends on:** Tickets 24, 25, 26, 27, 28, 29

Automated daily and weekly sync jobs that keep all platform data fresh. Runs via Vercel Cron with a shared sync engine that orchestrates across all connected platforms.

**Tasks:**
- Create `vercel.json` cron configuration:
  ```json
  {
    "crons": [
      { "path": "/api/cron/daily-sync", "schedule": "0 6 * * *" },
      { "path": "/api/cron/weekly-sync", "schedule": "0 3 * * 1" }
    ]
  }
  ```
- Create `src/app/api/cron/daily-sync/route.ts`:
  - Validates `CRON_SECRET` from `Authorization: Bearer {CRON_SECRET}` header
  - Creates a parent `sync_jobs` record for the daily run
  - Runs sync for all active connections (checks `platform_connections.disconnected_at IS NULL`):
    - YouTube: pull latest analytics for recent videos (last 7 days)
    - Meta: pull latest Instagram + Facebook insights
    - LinkedIn: pull latest post statistics
    - Beehiiv: pull latest newsletter stats and subscriber count
    - GA4: pull page-level data for the last 7 days
  - Error handling: if one platform fails, continue with others, log error in `sync_jobs.error_message`
  - Updates parent `sync_jobs` with total records processed and status
- Create `src/app/api/cron/weekly-sync/route.ts`:
  - Validates `CRON_SECRET`
  - Deeper sync operations:
    - YouTube: discover any new videos not yet imported, pull 30-day analytics window
    - Meta: pull 30-day insights, demographic data
    - Spotify: check RSS for new podcast episodes
    - Beehiiv: pull 30-day subscriber growth data
    - GA4: pull 30-day page data, traffic source trends
  - Recalculate performance benchmarks (percentiles for classification)
- Create `src/lib/sync/sync-engine.ts` — shared orchestration logic:
  - `runPlatformSync(connectionId: string, syncType: 'daily' | 'weekly')` — dispatches to platform-specific sync handler
  - `runAllSyncs(syncType: 'daily' | 'weekly')` — iterates all active connections, runs sync for each
  - Per-platform error isolation: try/catch around each platform sync
  - `sync_jobs` record management: creates child job per platform, updates with progress

**Acceptance criteria:**
- Daily cron fires at 06:00 UTC and syncs all connected platforms
- Weekly cron fires on Monday at 03:00 UTC and runs deeper sync operations
- `CRON_SECRET` is validated on every request (rejects without valid secret)
- `sync_jobs` records track progress accurately (status, records_processed, records_failed, error_message)
- Platform-specific errors do not prevent other platforms from syncing
- New content is discovered during weekly sync (new YouTube videos, new podcast episodes)
- Performance benchmarks are recalculated weekly

---

### Ticket 34: Webhook Receivers

**Size:** M
**Depends on:** Tickets 24, 28

Webhook endpoints that receive real-time notifications from YouTube and Beehiiv when new content is published.

**Tasks:**
- Create `src/app/api/webhooks/youtube/route.ts`:
  - Implements PubSubHubbub (WebSub) receiver for YouTube push notifications
  - GET handler: responds to hub verification challenge (returns `hub.challenge` parameter)
  - POST handler: receives Atom feed XML when a new video is published
  - Parses the Atom entry to extract video ID, title, channel ID, publish date
  - On new video:
    - Creates `assets` record with `asset_type = 'youtube_video'` or `'clip'` (based on channel)
    - Creates `publications` record linked to the correct YouTube platform
    - Queues analytics pull (initial metrics are 0 — first real data comes on next daily sync)
  - Validates hub signature (`X-Hub-Signature` header) using HMAC-SHA1 with a stored secret
  - Logs failed webhook deliveries in `sync_jobs` for retry
- Create `src/app/api/webhooks/beehiiv/route.ts`:
  - POST handler: receives webhook payload when a newsletter is sent
  - Parses payload to extract newsletter ID, title, send date, recipient count
  - On new send:
    - Creates `newsletter` asset with title and Beehiiv web URL
    - Creates `publications` record linked to Beehiiv platform
    - Begins tracking: schedules first stats pull for 24 hours after send (via a deferred sync job)
  - Validates webhook signature if Beehiiv provides one (check Beehiiv webhook docs)
  - Logs failed deliveries in `sync_jobs`
- Create `src/lib/webhooks/webhook-utils.ts`:
  - `validateHubSignature(body: string, signature: string, secret: string)` — HMAC-SHA1 validation
  - `logWebhookFailure(platform: string, error: Error, payload: unknown)` — records in `sync_jobs`

**Acceptance criteria:**
- YouTube webhook receives PubSubHubbub notifications for new videos
- YouTube webhook responds correctly to hub verification challenges (GET requests)
- New YouTube videos trigger asset + publication creation automatically
- Hub signature is validated on every webhook delivery (rejects invalid signatures)
- Beehiiv webhook receives new newsletter send events
- Beehiiv webhook creates asset + publication records on new sends
- Failed webhook deliveries are logged in `sync_jobs` with error details

---

### Ticket 35: Sync Status Dashboard

**Size:** S
**Depends on:** Ticket 33

Enhanced integration settings page with sync status monitoring, manual sync triggers, and job history.

**Tasks:**
- Enhance `src/app/(app)/settings/integrations/page.tsx` with sync status section:
  - Per-platform sync summary: last sync time, records processed, status (success/partial/failed), "Sync Now" button
- Create `src/components/integrations/SyncStatusDashboard.tsx`:
  - Table of all platforms with columns: platform name, connection status, last sync time (relative), records in last sync, errors in last sync, data freshness indicator
  - "Sync All Now" button (triggers all platform syncs)
  - Per-platform "Sync Now" button (triggers single platform sync)
- Create `src/components/integrations/DataFreshnessIndicator.tsx`:
  - Green dot + "Fresh": last sync < 24 hours ago
  - Amber dot + "Stale": last sync 1–3 days ago
  - Red dot + "Outdated": last sync > 3 days ago or last sync failed
- Create sync job history section:
  - `src/components/integrations/SyncHistory.tsx`: table of recent sync jobs (last 50)
  - Columns: platform, job type (daily/weekly/manual), status, started at, duration, records processed, records failed, error message (expandable)
  - Filter by platform, status
- Create `src/app/api/sync/manual/route.ts`:
  - Accepts platform_id parameter
  - Triggers sync for the specified platform (or all platforms if no ID)
  - Returns job ID for polling progress
- Create `src/lib/queries/sync.ts`: `getSyncJobs(filters)`, `getLatestSyncPerPlatform()`, `getSyncJob(id)`

**Acceptance criteria:**
- Sync status is displayed per platform with last sync time, record counts, and freshness indicator
- DataFreshnessIndicator shows correct colour (green/amber/red) based on recency
- "Sync Now" button triggers manual sync for a single platform and shows progress
- "Sync All Now" triggers sync for all connected platforms
- Sync job history table shows recent jobs with all metadata
- Job history can be filtered by platform and status
- Duration is calculated and displayed (e.g. "took 12s")

---

## Phase 6: Search & Intelligence (Tickets 36–39)

### Ticket 36: Embedding Generation Pipeline

**Size:** M
**Depends on:** Tickets 2, 10

Generate vector embeddings for all content using OpenAI's text-embedding-3-small model (1536 dimensions) and store them in the `content_embeddings` table via pgvector.

**Tasks:**
- Create `src/lib/embeddings/embedding-service.ts`:
  - `generateEmbedding(text: string): Promise<number[]>` — calls OpenAI `text-embedding-3-small` API, returns 1536-dimension vector
  - `chunkText(text: string, chunkSize: number, overlap: number): string[]` — splits text into chunks of ~500 tokens with 100-token overlap
  - `countTokens(text: string): number` — approximate token count (words × 1.3)
  - `estimateCost(tokenCount: number): number` — calculates embedding cost in USD
- Create `src/lib/embeddings/embed-assets.ts`:
  - `embedAsset(assetId: string)` — generates embedding from `title + ' ' + description`, stores in `content_embeddings` with `entity_type = 'asset'`, `chunk_index = 0`
  - `embedTranscript(transcriptId: string)` — chunks `full_text` into 500-token windows with 100-token overlap, generates embedding per chunk, stores each in `content_embeddings` with `entity_type = 'transcript'`, sequential `chunk_index`
  - `embedIdea(ideaId: string)` — generates embedding from `title + ' ' + description`, stores with `entity_type = 'idea'`
  - `removeEmbeddings(entityType: string, entityId: string)` — deletes existing embeddings for an entity (before re-embedding on update)
- Hook into existing Server Actions:
  - `createAsset` → call `embedAsset(newAssetId)` after insert
  - `updateAsset` → call `removeEmbeddings('asset', id)` then `embedAsset(id)` after update
  - `captureIdea` / `updateIdea` → call `embedIdea(ideaId)` after insert/update
- Create bulk embedding job `src/lib/embeddings/bulk-embed.ts`:
  - `bulkEmbedAll()` — queries all assets, transcripts, and ideas without embeddings, generates and stores embeddings in batches of 20
  - Rate limiting: max 3 requests/second to OpenAI API
  - Progress tracking via `sync_jobs` table
- Create admin trigger `src/app/api/embeddings/bulk/route.ts`:
  - POST endpoint (admin only) to trigger bulk embedding job
  - Returns job ID for progress tracking
- Token counting and cost tracking:
  - Log total tokens embedded and estimated cost per batch in `sync_jobs.metadata`

**Acceptance criteria:**
- Embeddings are generated automatically when assets or ideas are created or updated
- Transcript chunks are embedded with correct 500-token windows and 100-token overlap
- Embeddings are stored in `content_embeddings` with correct `entity_type`, `entity_id`, `chunk_index`
- Bulk embedding job processes all existing content without embeddings
- Rate limiting prevents OpenAI API throttling (max 3 requests/second)
- Token count and estimated cost are tracked per batch
- Re-embedding on update removes old embeddings first (no duplicates)

---

### Ticket 37: Semantic Search

**Size:** M
**Depends on:** Ticket 36

Vector similarity search using pgvector. Users can search by meaning rather than exact keywords, and find content similar to any existing asset or transcript segment.

**Tasks:**
- Create `src/lib/search/semantic-search.ts`:
  - `semanticSearch(query: string, limit: number, entityTypes?: string[])` — generates embedding for query text, runs pgvector similarity search (`<=>` cosine distance operator) against `content_embeddings`, returns results with similarity scores
  - `findSimilar(entityType: string, entityId: string, limit: number)` — finds content similar to a specific entity by comparing its embedding against all others
  - Similarity threshold: only return results with cosine similarity > 0.7 (distance < 0.3)
- Update `src/app/api/search/route.ts`:
  - Accept `?mode=semantic` query parameter
  - When `mode=semantic`: run `semanticSearch()` instead of full-text search
  - When `mode=combined`: run both full-text and semantic search in parallel, merge results, deduplicate by entity_id, rank by combined score
- Create "Find Similar" button on asset detail page:
  - Click → runs `findSimilar('asset', assetId, 10)`
  - Results shown in a sidebar panel or modal: title, type, pillar, similarity score (as percentage), link to asset
- Create "Find Similar" button on transcript viewer:
  - Select text in transcript → "Find similar content" option in highlight toolbar
  - Generates embedding for selected text, searches against all content
  - Shows similar assets and transcript segments
- Display similarity scores in search results as percentage (e.g. "92% match")

**Acceptance criteria:**
- Semantic search returns relevant content based on meaning (not just keyword matching)
- Results are ranked by cosine similarity score
- Only results above 0.7 similarity threshold are returned
- "Find similar" on asset detail page returns related content with similarity scores
- "Find similar" on transcript text selection works and returns relevant matches
- Combined search mode (keyword + semantic) merges results without duplicates
- Similarity scores are displayed as human-readable percentages

---

### Ticket 38: Content Gap Detection

**Size:** M
**Depends on:** Ticket 36

Analyse embedding distribution to identify content gaps — topics with sparse coverage, pillar imbalances, and format gaps.

**Tasks:**
- Create `src/lib/intelligence/gap-detection.ts`:
  - `analysePillarCoverage()` — counts assets per pillar, calculates percentage distribution, flags imbalances (any pillar < 10% of total content)
  - `analyseTopicCoverage()` — counts assets per topic, identifies topics with < 3 assets or only 1 content format
  - `analyseFormatDiversity(pillar: string)` — checks which asset_types exist per pillar (e.g. coaching has blog posts and videos but no newsletter coverage)
  - `identifyGaps()` — combines all analyses into a structured report with recommendations
  - `getEmbeddingDistribution(pillar: string)` — analyses embedding clustering to find sparse regions in the vector space (areas of meaning not well covered)
- Create `src/app/(app)/intelligence/page.tsx`:
  - Pillar coverage chart (recharts bar chart): percentage of content per pillar, with ideal target line (20% each)
  - Topic heat map: grid of topics × content formats, coloured cells (green = well covered, amber = sparse, red = missing), click cell for details
  - Format diversity table: pillar × asset_type matrix showing counts
  - Gap recommendations list: prioritised suggestions like "Recovery pillar has only 5% of total content — consider creating more recovery-focused episodes" or "Zone 2 topic has 8 blog posts but no video content — repurpose top-performing blog as a YouTube video"
  - Last analysis timestamp, "Re-analyse" button
- Create `src/app/api/intelligence/gaps/route.ts`:
  - Runs gap analysis on demand
  - Caches results (re-runs on weekly sync or manual trigger)

**Acceptance criteria:**
- Pillar coverage analysis correctly counts content per pillar and identifies imbalances
- Topic coverage analysis flags topics with sparse content (< 3 assets or limited formats)
- Format diversity analysis shows which formats are missing per pillar/topic
- Pillar coverage chart renders with correct data and target line
- Topic heat map correctly colours cells by coverage level
- Gap recommendations are specific and actionable (reference actual pillars, topics, and formats)
- Analysis can be re-run manually and updates on weekly sync

---

### Ticket 39: Duplicate Detection + Reuse Recommendations

**Size:** M
**Depends on:** Ticket 36

Flag potentially duplicate content using embedding similarity, and recommend existing content for reuse when creating new assets.

**Tasks:**
- Create `src/lib/intelligence/duplicate-detection.ts`:
  - `findDuplicates(threshold: number = 0.92)` — queries `content_embeddings` for asset pairs with cosine similarity > threshold, returns pairs with similarity score, titles, types
  - `checkForDuplicates(assetId: string)` — checks a single asset against all others, returns potential duplicates
  - Schedule: runs during weekly sync, stores results in a cache table or `sync_jobs.metadata`
- Create `src/app/(app)/intelligence/duplicates/page.tsx`:
  - Duplicate review UI: list of flagged pairs
  - Each pair shows: side-by-side comparison (title, type, pillar, description, created date, performance summary)
  - Actions per pair:
    - "Not a duplicate" → dismisses the pair (stores dismissal so it does not reappear)
    - "Merge" → opens merge wizard (choose which asset to keep, transfer derivatives/publications to the kept asset, archive the other)
  - Filter: by pillar, by similarity score range
- Create reuse recommendation component `src/components/assets/ReuseRecommendations.tsx`:
  - Shown on the `/assets/new` page after the user enters a title and description
  - Generates embedding for the draft content, searches against existing assets
  - Shows top 5 similar existing assets with similarity scores
  - Suggestions: "Consider repurposing this existing content" or "Link to this as a source asset"
  - Dismissible — user can proceed with creating the new asset
- Create `src/lib/actions/duplicates.ts`: `dismissDuplicate(pairKey)`, `mergeAssets(keepId, archiveId)`

**Acceptance criteria:**
- Asset pairs with cosine similarity > 0.92 are flagged as potential duplicates
- Duplicate review UI shows side-by-side comparison with all relevant metadata
- "Not a duplicate" dismissal persists (pair does not reappear after dismissal)
- "Merge" action transfers derivatives and publications to the kept asset and archives the other
- Reuse recommendations appear on the new asset form after title/description entry
- Top 5 similar existing assets are shown with similarity percentages
- Recommendations are dismissible without blocking asset creation

---

## Phase 7: Reporting & Dashboards (Tickets 40–44)

### Ticket 40: Performance Dashboard

**Size:** L
**Depends on:** Ticket 33

Cross-platform performance dashboard with real data from all connected platform APIs. No manual metric entry — all data flows from automated sync.

**Tasks:**
- Create `src/app/(app)/performance/page.tsx`:
  - Time period selector: 7d, 30d, 90d, custom date range (URL-persisted)
  - Top-level metric cards (4 cards in a row):
    - Total Views: sum of `performance_records.views` across all platforms for the period, with trend indicator (% change vs previous period)
    - Total Engagement: sum of likes + comments + shares + saves, with trend
    - Subscriber Growth: net new subscribers across all platforms, with trend
    - Revenue: sum of `performance_records.revenue_cents` (formatted as USD), with trend
  - Platform comparison chart (recharts `BarChart`): views per platform, grouped by platform, colour-coded with platform colours
  - Content performance table (`@tanstack/react-table`):
    - Top performing assets ranked by primary metric per platform (views for YouTube, reach for Instagram, open rate for Beehiiv)
    - Columns: asset title (linked), platform, primary metric value, engagement rate, classification badge
    - Server-side pagination, sortable
  - Performance classification badges — auto-calculated from historical benchmarks:
    - **Exceptional:** top 10% of content on that platform → purple badge
    - **Strong:** top 25% → green badge
    - **Average:** middle 50% → grey badge
    - **Weak:** bottom 25% → red badge
  - Trend indicators: up arrow (green) / down arrow (red) with percentage change, flat dash (grey) for < 2% change
- Create `src/lib/queries/performance.ts`:
  - `getPerformanceOverview(dateRange: DateRange)` — aggregates across all platforms
  - `getPlatformComparison(dateRange: DateRange)` — per-platform totals
  - `getTopContent(dateRange: DateRange, limit: number)` — top assets by primary metric
  - `calculateClassification(platformId: string, metric: string, value: number)` — returns classification based on historical percentiles
  - `calculateTrend(current: number, previous: number)` — returns { direction, percentage }
- Create `src/components/performance/MetricCard.tsx`: value (large number), label, trend arrow + percentage, sparkline (optional)
- Create `src/components/performance/PlatformChart.tsx`: recharts bar chart with platform colours
- Create `src/components/performance/ClassificationBadge.tsx`: coloured badge (Exceptional/Strong/Average/Weak)

**Acceptance criteria:**
- Dashboard loads with real data from all connected platforms (no manual entry)
- Metric cards show correct totals with trend indicators comparing to previous period
- Platform comparison chart displays correctly with platform-specific colours
- Content performance table ranks assets by primary metric and shows classification badges
- Classification is auto-calculated from historical percentiles (not manually assigned)
- Time period switching (7d/30d/90d/custom) updates all data correctly
- Trend indicators show correct direction and percentage change
- Empty state handles gracefully when no performance data exists for a platform

---

### Ticket 41: Campaign Scorecards

**Size:** M
**Depends on:** Ticket 40

Campaign-level performance analysis that aggregates metrics across all assets and publications within a campaign.

**Tasks:**
- Enhance campaign detail page (`src/app/(app)/campaigns/[id]/page.tsx`) with a "Performance" tab:
  - Campaign scorecard showing aggregate metrics across all campaign assets and publications
- Create `src/components/campaigns/CampaignScorecard.tsx`:
  - Summary cards: total reach (sum of reach/impressions across all platforms), total engagement, total views, revenue (if sponsored campaign)
  - Per-platform breakdown: table showing each platform's contribution to the campaign
  - Top performing asset within the campaign (highest views/engagement)
  - Campaign ROI section (visible for sponsored campaigns):
    - Deal value (from `sponsors.deal_value_cents`)
    - Deliverables completed vs committed (count of published publications vs expected)
    - Cost per impression / cost per engagement (deal value / total impressions or engagements)
    - ROI indicator: positive (green) if reach exceeds industry benchmarks for the deal value
  - Cross-platform reach: visual showing how the campaign message spread across platforms (small platform icons with reach numbers)
- Create comparison section:
  - Compare with previous campaigns of the same type
  - Bar chart: this campaign vs average of past campaigns (views, engagement, reach)
  - "Best performing campaign of this type" indicator
- Create `src/lib/queries/campaign-performance.ts`:
  - `getCampaignPerformance(campaignId: string)` — aggregates all performance_records for assets/publications in the campaign
  - `getCampaignROI(campaignId: string)` — calculates ROI metrics for sponsored campaigns
  - `compareCampaigns(campaignId: string, type: string)` — compares against historical campaigns of the same type

**Acceptance criteria:**
- Campaign scorecard shows aggregated metrics across all assets and publications in the campaign
- Per-platform breakdown shows each platform's contribution
- Top performing asset is identified and highlighted
- ROI section displays for sponsored campaigns showing deal value vs deliverables vs performance
- Cross-platform reach visualisation shows campaign spread
- Comparison with historical campaigns of the same type works
- Empty state handles campaigns with no performance data

---

### Ticket 42: Sponsor Reporting

**Size:** M
**Depends on:** Ticket 40

Sponsor-specific reporting showing deliverable progress, performance summary, and exportable reports for sponsor communication.

**Tasks:**
- Create `src/app/(app)/performance/sponsors/page.tsx`:
  - List of sponsors with active campaigns
  - Each sponsor card: name, campaign title, deal value, deliverable progress bar, total reach
- Create `src/app/(app)/performance/sponsors/[id]/page.tsx` — sponsor detail page:
  - Sponsor header: name, contact info, deal value (formatted as USD)
  - Deliverables tracker:
    - List of committed deliverables (from `sponsors.deliverables` JSON)
    - Check off completed deliverables (auto-counted from published publications matching the campaign)
    - Progress bar: X of Y deliverables completed
  - Performance summary:
    - Total reach across all campaign content
    - Total engagement across all campaign content
    - Platform-by-platform breakdown
    - Top performing piece of sponsored content
  - Content list: all assets and publications linked to the sponsor's campaign(s)
- Create exportable sponsor report:
  - `src/app/api/reports/sponsor/[id]/route.ts` — generates a formatted HTML report
  - Report includes: sponsor name, campaign details, deliverable checklist, reach/engagement metrics, top content, platform breakdown
  - "Export Report" button on sponsor detail page → opens formatted report in new tab (printable)
  - Report styled with Roadman branding (logo, brand colours, fonts)
- Create `src/lib/queries/sponsor-performance.ts`:
  - `getSponsorReport(sponsorId: string)` — full sponsor report data
  - `getDeliverableStatus(sponsorId: string)` — deliverable progress

**Acceptance criteria:**
- Sponsor list page shows all sponsors with active campaigns and progress overview
- Sponsor detail page shows deliverable tracker with progress bar
- Deliverables are auto-tracked from published publications (not manual ticking)
- Performance summary aggregates metrics correctly across all sponsor campaign content
- Export generates a formatted, branded HTML report suitable for sending to sponsors
- Report opens in a new tab and is printable (clean layout, no app chrome)

---

### Ticket 43: Content Decay Alerts

**Size:** M
**Depends on:** Ticket 40

Detect content where performance has dropped significantly and alert the team with suggested actions.

**Tasks:**
- Create `src/lib/intelligence/decay-detection.ts`:
  - `detectDecay(thresholdPercentage: number = 50, periodDays: number = 30)` — compares the latest period's primary metric against the previous period for each asset
  - Returns assets where the primary metric has dropped by more than the threshold percentage
  - For each decaying asset: calculates decline percentage, previous value, current value, suggested actions
  - Suggested actions based on content type and age:
    - Blog post older than 6 months: "Refresh — update statistics, add new sections, update publish date"
    - Blog post younger than 6 months: "Investigate — check if a competitor published better content on this topic"
    - Video with declining views: "Repurpose — create updated clips or a follow-up episode"
    - Newsletter with declining open rate: "Update — revise subject line strategy, segment audience"
    - Any content: "Archive — consider archiving if no longer relevant"
- Create `src/app/(app)/performance/decay/page.tsx`:
  - Content decay dashboard
  - List of decaying assets sorted by decline percentage (steepest first)
  - Each row: asset title (linked), type badge, platform, previous metric value, current metric value, decline percentage (red), suggested action
  - Filter: by platform, by content type, by decline severity
- Create decay detection trigger:
  - Runs during weekly sync (Ticket 33) after analytics data is updated
  - Creates notifications for asset owners when decay is detected: "Performance alert: {asset_title} views dropped {X}% in the last 30 days"
- Create `src/lib/queries/decay.ts`: `getDecayingContent(filters)`, `getDismissedDecayAlerts()`
- Allow dismissing alerts: "Acknowledged" button that suppresses the alert for that asset for 30 days

**Acceptance criteria:**
- Decay detection correctly identifies content with > 50% metric decline over 30 days
- Decaying content is listed with before/after metrics and decline percentage
- Suggested actions are relevant to the content type and age
- Notifications are sent to asset owners when decay is detected
- Alerts can be dismissed (suppressed for 30 days)
- Detection runs automatically during weekly sync
- Filter and sort options work on the decay dashboard

---

### Ticket 44: Transcript Viewer + Highlights

**Size:** M
**Depends on:** Tickets 10, 27

Transcript display with timestamps, speaker labels, and a selection-based highlighting system for marking quotes, insights, clip-worthy moments, and action items.

**Tasks:**
- Create `src/app/(app)/transcripts/page.tsx`:
  - List of assets that have transcripts (query: join `transcripts` on `assets` where transcript exists)
  - Columns: asset title (linked), type badge, duration, word count, verified badge, highlights count
  - Search within transcripts (full-text search on `transcripts.search_vector`)
  - Click → navigate to `/transcripts/[id]`
- Create `src/app/(app)/transcripts/[id]/page.tsx`:
  - Asset header: title (Bebas Neue), episode number, guest name + credential, duration, recording date
  - Two-column layout: transcript (main, 70%) + sidebar (30%)
  - Main: full transcript rendered via TranscriptViewer
  - Sidebar: asset metadata, highlights list (filterable), derivative assets list
- Create `src/components/transcripts/TranscriptViewer.tsx`:
  - Scrollable transcript container
  - Timestamped segments: each paragraph shows timestamp (HH:MM:SS format) in the left margin, clickable (future: could jump to video position)
  - Speaker labels: bold speaker name before their text (e.g. "**Anthony:** ...")
  - Paragraph breaks between speaker turns
  - Text selection support: user can select text to trigger the highlight toolbar
  - Word count and estimated reading time displayed in header
- Create `src/components/transcripts/HighlightMarker.tsx`:
  - User selects text in the transcript → floating toolbar appears near the selection
  - Toolbar options:
    - Highlight type selector: Quote, Insight, Action Item, Clip-Worthy, Fact (each with its own icon)
    - Note field (text input — optional annotation)
    - Colour indicator (auto-set by type: Quote = blue, Insight = purple, Action Item = coral, Clip-Worthy = green, Fact = yellow)
    - "Save" button → creates `transcript_highlights` record
  - Cancel: clicking elsewhere dismisses the toolbar
- Display existing highlights:
  - Highlighted text sections shown with coloured background in the transcript body
  - Hover on highlight → tooltip showing type, note, created by, date
  - Click highlight → edit/delete options
- Sidebar highlight list:
  - All highlights for this transcript, grouped by type
  - Filter toggles: by type (Quote/Insight/Action Item/Clip-Worthy/Fact), by user, by used/unused
  - Each highlight shows: text (truncated), type badge, note (if any), "Used" badge (if linked to derivative asset)
  - "Mark as used" action → opens asset selector to link the highlight to a derivative asset
- Create `src/lib/actions/transcripts.ts`:
  - `addHighlight(formData: FormData)` — validates, inserts into `transcript_highlights` with start_time, end_time, text, type, note, colour, created_by
  - `updateHighlight(id: string, formData: FormData)` — updates note, type, colour
  - `deleteHighlight(id: string)` — deletes highlight record
  - `markHighlightUsed(id: string, assetId: string)` — sets `used_in_asset_id`, indicating the highlight was turned into content

**Acceptance criteria:**
- Transcripts display with clear formatting: timestamped segments, speaker labels, paragraph breaks
- Timestamps are visible in HH:MM:SS format in the left margin
- Speaker labels are displayed when available (bold name prefix)
- Highlighting works via text selection: floating toolbar appears with type options and note field
- Different highlight types have distinct colours (Quote = blue, Insight = purple, Action Item = coral, Clip-Worthy = green, Fact = yellow)
- Existing highlights are visible as coloured backgrounds in the transcript text
- Hover on highlight shows tooltip with details
- Sidebar lists all highlights with type/user/used filters
- "Mark as used" links a highlight to a derivative asset
- Transcript text is searchable from the transcripts list page

---

## Phase 8: Polish & Team Onboarding (Tickets 45–50)

### Ticket 45: Comments System

**Size:** M
**Depends on:** Tickets 7, 10, 17, 19, 21

Threaded comments on all entity types — assets, campaigns, tasks, publications, and ideas.

**Tasks:**
- Create `src/components/comments/CommentThread.tsx`:
  - Comment list: each comment shows author avatar, display name, relative timestamp (date-fns `formatDistanceToNow`), body text
  - Reply button → nested reply input (one level of threading only — no infinite nesting)
  - Edit button (visible on own comments only — opens inline edit mode)
  - Delete button (visible on own comments or admin role — with confirmation dialogue)
  - @-mention support: typing `@` triggers user autocomplete dropdown (searches profiles by display_name)
  - Markdown-light formatting: bold (`**text**`), italic (`*text*`), links (`[text](url)`) — rendered in display mode
  - "Add comment" input at the bottom with submit button
- Create `src/lib/actions/comments.ts`:
  - `addComment(formData: FormData)` — validates body (required, max 5000 chars), inserts into `comments` with entity_type, entity_id, parent_id (null for top-level, comment_id for replies), body, mentions (extracted @usernames), created_by. Logs activity. Creates notifications for @-mentioned users.
  - `updateComment(id: string, body: string)` — updates body, sets `edited_at = now()`, logs activity
  - `deleteComment(id: string)` — sets `archived_at` (soft delete), logs activity. Permission check: own comment or admin role.
- Integrate `CommentThread` into:
  - Asset detail page (`src/app/(app)/assets/[id]/page.tsx`) — as a tab or section
  - Campaign detail page (`src/app/(app)/campaigns/[id]/page.tsx`) — in the Activity tab or separate Comments tab
  - Task detail (inline in task board card expansion or task detail modal)
  - Publication detail (in publication edit dialogue)
  - Idea detail (in inline expand on ideas page)
- Create `src/lib/queries/comments.ts`: `getComments(entityType, entityId)`, `getCommentCount(entityType, entityId)`

**Acceptance criteria:**
- Comments can be added to assets, campaigns, tasks, publications, and ideas
- Replies appear nested one level under parent comments with visual indentation
- @-mentions trigger autocomplete dropdown and create notifications for mentioned users
- Own comments can be edited (shows "edited" indicator after update)
- Own comments and any comment (for admin) can be deleted with confirmation
- Comments display with correct author avatar, name, timestamp, and formatted body
- Activity log records new comments
- Markdown-light formatting (bold, italic, links) renders correctly

---

### Ticket 46: Activity Log

**Size:** M
**Depends on:** All previous tickets

Comprehensive activity logging across the entire application, with a feed component used on the dashboard, campaign detail, and asset detail pages.

**Tasks:**
- Create `src/lib/utils/activity.ts`:
  - `logActivity(params: { action: string, entity_type: string, entity_id: string, entity_title: string, field_changed?: string, old_value?: string, new_value?: string, actor_id: string })` — inserts into `activity_log` table
  - Human-readable description generator: `describeActivity(log: ActivityLog): string` — returns e.g. "Anthony created campaign 'Week 29: Zone 2 Deep Dive'" or "Sarah changed asset status from 'draft' to 'in_review'"
- Audit ALL existing Server Actions across the codebase and add `logActivity()` calls where missing:
  - `src/lib/actions/campaigns.ts` — create, update, archive
  - `src/lib/actions/assets.ts` — create, update, archive
  - `src/lib/actions/publications.ts` — schedule, update, markPublished, cancel
  - `src/lib/actions/tasks.ts` — create, update, updateStatus, assign, archive
  - `src/lib/actions/ideas.ts` — capture, update, vote, promote, discard
  - `src/lib/actions/briefs.ts` — create, update, submit, approve, reject
  - `src/lib/actions/comments.ts` — add, update, delete
  - `src/lib/actions/files.ts` — upload, delete, setPrimary
  - `src/lib/actions/topics.ts` — create, update, toggle
  - `src/lib/actions/clusters.ts` — create, update, addAsset, removeAsset
- Create `src/components/activity/ActivityFeed.tsx`:
  - Chronological list of activities (newest first)
  - Each entry: actor avatar + display name, action verb, entity link (clickable → navigates to entity), relative timestamp
  - Human-readable descriptions via `describeActivity()`
  - Filter bar: entity type (asset, campaign, task, publication, idea, brief, comment), action type (create, update, delete, status_change), actor (user selector), date range
  - Paginated loading: "Load more" button or infinite scroll
- Add activity feed to:
  - Dashboard sidebar (last 10 entries, "View all" link)
  - Campaign detail page (Activity tab — filtered to campaign entity)
  - Asset detail page (Activity tab — filtered to asset entity)
- Create `src/app/api/activity/route.ts` for paginated activity queries with filters

**Acceptance criteria:**
- All create, update, delete, and status change actions are logged in `activity_log`
- Activity feed displays in chronological order (newest first)
- Each entry links to the relevant entity (clicking navigates to the detail page)
- Actor name and action are human-readable (not raw database values)
- Filters work correctly across all dimensions (entity type, action, actor, date)
- Paginated loading works (initial 20, load more in batches of 20)
- No duplicate entries for a single action
- Dashboard shows the 10 most recent activities in a sidebar feed

---

### Ticket 47: Global Search (Full-Text + Semantic)

**Size:** M
**Depends on:** Tickets 10, 7, 44, 21, 19, 37

Unified search across all entity types combining full-text search (tsvector) and semantic search (pgvector). The search bar lives in the header and supports typeahead with keyboard navigation.

**Tasks:**
- Update `src/app/api/search/route.ts`:
  - Accept query parameters: `q` (search query), `type` (entity type filter), `pillar`, `limit` (default 20), `offset`, `mode` ('keyword' | 'semantic' | 'combined', default 'combined')
  - **Keyword mode:** searches across assets (title, description, body, guest_name via `search_vector`), campaigns (title, description), transcripts (full_text via `search_vector`), ideas (title, description), tasks (title, description) using `plainto_tsquery` with `ts_rank` for ranking and `ts_headline` for highlighted excerpts
  - **Semantic mode:** generates embedding for query, runs pgvector similarity search against `content_embeddings`, returns results with similarity scores
  - **Combined mode:** runs both keyword and semantic searches in parallel (Promise.all), merges results, deduplicates by entity_type + entity_id, ranks by combined score (keyword rank normalised + similarity score)
  - Returns results grouped by entity type with total counts per type
- Create `src/components/search/SearchBar.tsx`:
  - Input field in the header (always visible on desktop, icon toggle on mobile)
  - Typeahead results dropdown (debounced 200ms):
    - Shows top 3 results per entity type (assets, campaigns, transcripts, ideas, tasks)
    - Each result: type icon, title, excerpt with highlighted match
    - "View all results for '{query}'" link at bottom
  - Keyboard navigation: up/down arrows to move through results, Enter to select, Escape to close
  - `Cmd+K` (Mac) / `Ctrl+K` (Windows) shortcut to focus the search bar
  - Empty state: "Start typing to search..."
  - No results state: "No results found for '{query}'"
- Create `src/app/(app)/search/page.tsx` — full search results page:
  - Search input at top (pre-filled from query)
  - Results grouped by entity type with headers and counts
  - Each result card: type icon, title (linked), excerpt with highlighted matches, pillar badge, date
  - Filter sidebar: entity type checkboxes, pillar filter
  - Mode toggle: Keyword / Semantic / Combined
  - Pagination
- Wire `SearchBar` into `Header.tsx` (replace placeholder from Ticket 5)

**Acceptance criteria:**
- Search returns relevant results across all entity types (assets, campaigns, transcripts, ideas, tasks)
- Typeahead shows results within 300ms of typing (debounced, no flickering)
- Results are ranked by relevance (keyword matches and/or semantic similarity)
- Matching text is highlighted in search results using `ts_headline`
- `Cmd+K` focuses the search bar from any page
- Full search results page shows grouped results with filters
- Combined mode merges keyword and semantic results without duplicates
- Empty state and no-results state display clearly

---

### Ticket 48: Polish + Bug Fixes

**Size:** M
**Depends on:** All previous tickets

UI consistency, loading states, error handling, mobile responsiveness, and overall polish pass.

**Tasks:**
- **Loading skeletons:** add shimmer/skeleton placeholder components to all pages:
  - Dashboard (banner skeleton, activity feed skeleton)
  - Campaign list (card skeletons), campaign detail (header skeleton, tab content skeletons)
  - Asset list (table row skeletons), asset detail
  - Calendar (grid skeleton)
  - Tasks (board column skeletons)
  - Performance (metric card skeletons, chart skeleton)
  - Create reusable `Skeleton` component variants: `SkeletonCard`, `SkeletonTable`, `SkeletonText`, `SkeletonChart`
- **Error boundaries:** add `error.tsx` files to all route segments:
  - `src/app/(app)/error.tsx` — catch-all with "Something went wrong" message and retry button
  - Per-route error boundaries for campaigns, assets, tasks, calendar, performance, settings
  - Styled consistently with brand (charcoal background, Off White text, Coral retry button)
- **Toast notifications:** create `src/components/ui/Toast.tsx`:
  - Success (green), error (red), info (blue), warning (amber) variants
  - Auto-dismiss after 4 seconds, manual dismiss with x button
  - Add toasts to all successful Server Action completions: "Campaign created", "Asset updated", "Task moved to In Progress", "Publication scheduled"
- **Confirmation dialogs:** create `src/components/ui/ConfirmDialog.tsx`:
  - Modal with title, description, confirm button (red for destructive), cancel button
  - Add to all destructive actions: archive campaign, archive asset, delete file, cancel publication, delete comment, discard idea
- **Inline form validation:** ensure all forms show field-level errors (red border + error message below field) via react-hook-form + Zod resolver
- **Mobile responsiveness audit:**
  - Sidebar collapses to hamburger below 768px
  - DataTables scroll horizontally on small screens (with scroll indicator)
  - Forms stack vertically on mobile (single column)
  - Calendar adapts: week view shows 3-day window on mobile with swipe navigation
  - Cards stack vertically in grid layouts
- **Consistent empty states:** create `src/components/ui/EmptyState.tsx` — icon, title, description, optional CTA button. Use on all list/table pages when no data matches
- **Keyboard accessibility:** all interactive elements focusable (tab order), Escape closes modals/dropdowns, Enter submits forms
- **Visual consistency pass:** audit spacing (consistent padding/margin using Tailwind scale), colours (only brand colours), font weights (Bebas Neue for headings only, Work Sans for everything else)
- **Page titles:** set `<title>` via `metadata` export on every page (e.g. "Campaigns — Roadman OS", "Dashboard — Roadman OS")
- **Breadcrumbs:** ensure breadcrumbs are present and accurate on every page

**Acceptance criteria:**
- No page shows a blank white screen while loading (skeletons appear immediately)
- All forms display inline validation errors with red border and error message
- Toast notifications appear for all successful mutations (create, update, delete, status change)
- Destructive actions require confirmation dialogue before executing
- App is usable on mobile (iPad minimum — 768px breakpoint)
- No console errors in production build (`next build` succeeds without warnings)
- All pages have correct browser tab titles with " — Roadman OS" suffix
- Breadcrumbs show correct hierarchy on every page
- Empty states are consistent and include helpful CTAs

---

### Ticket 49: Tagging Rules + Operational Setup

**Size:** S
**Depends on:** Ticket 14

Auto-tagging rules and workflow templates to standardise team operations.

**Tasks:**
- Create `src/app/(app)/settings/rules/page.tsx` — auto-tagging rules configuration:
  - Rule builder: IF [field] [condition] [value] THEN add tag [tag] / add topic [topic]
  - Fields: guest_name, title, description, pillar, asset_type
  - Conditions: contains, equals, starts with
  - Example rules:
    - IF guest_name contains "Prof Seiler" THEN add tag "Prof Seiler"
    - IF asset_type equals "podcast_episode" AND pillar equals "coaching" THEN add topic "Coaching"
    - IF title contains "Zone 2" THEN add topic "Zone 2"
  - Rule list: active/inactive toggle, edit, delete
  - Rules execute on asset creation (in `createAsset` Server Action)
- Create `src/lib/utils/tagging-rules.ts`:
  - `evaluateRules(asset: Asset): { tags: Tag[], topics: Topic[] }` — evaluates all active rules against the asset, returns matching tags and topics
  - `applyRules(assetId: string)` — evaluates rules and adds matching tags/topics to the asset
- Create workflow templates `src/app/(app)/settings/workflows/page.tsx`:
  - Pre-defined task sets for common workflows:
    - "New Podcast Episode" → 8 tasks: Edit audio, Upload to hosting, Create YouTube video, Write show notes, Create blog post, Schedule social posts, Send newsletter segment, Update Skool community
    - "New Blog Post" → 5 tasks: Write draft, Create graphics, SEO review, Schedule social, Send newsletter
    - "Sponsor Campaign" → 6 tasks: Brief creation, Content production, Review with sponsor, Schedule publications, Track deliverables, Generate report
  - Template editor: name, description, task list (title, description, default assignee, estimated minutes, order)
  - "Apply Template" button on campaign detail page → creates all tasks in the template linked to the campaign
- Create `src/app/(app)/settings/conventions/page.tsx`:
  - Built-in team conventions page with sections:
    - Status flow guide (how to move content through statuses)
    - Naming conventions (how to title assets, campaigns)
    - Tagging best practices (when to use topics vs tags)
    - Publication scheduling guidelines (ideal post times per platform)
  - Editable by admin (stored as a settings record or markdown in database)

**Acceptance criteria:**
- Auto-tagging rules can be configured via the UI (field + condition + value → tag/topic)
- Rules execute automatically on asset creation and correctly add matching tags/topics
- Rules can be toggled active/inactive and edited/deleted
- Workflow templates are configurable (name, task list, default assignees)
- "Apply Template" on a campaign creates all tasks from the selected template
- Conventions page is accessible and editable by admin
- Pre-defined templates are seeded for common workflows (Podcast Episode, Blog Post, Sponsor Campaign)

---

### Ticket 50: Launch Prep + Team Onboarding

**Size:** S
**Depends on:** Ticket 48

Final production configuration, integration connections, data import, and team verification.

**Tasks:**
- **Production environment:**
  - Set all production environment variables in Vercel dashboard:
    - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
    - YouTube: `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REDIRECT_URI`
    - Meta: `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI`
    - LinkedIn: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`
    - Beehiiv: `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`
    - GA4: `GA4_PROPERTY_ID`, `GA4_CLIENT_EMAIL`, `GA4_PRIVATE_KEY`
    - OpenAI: `OPENAI_API_KEY`
    - Cron: `CRON_SECRET`
    - App: `NEXT_PUBLIC_APP_URL=https://os.roadmancycling.com`
  - Configure `os.roadmancycling.com` DNS: CNAME record pointing to `cname.vercel-dns.com`
  - Verify SSL certificate is active and auto-renewing
- **Production build verification:**
  - Run `next build` — must succeed with no errors
  - Test all routes in production: dashboard, campaigns, assets, calendar, tasks, ideas, transcripts, performance, settings, integrations, intelligence, search
  - Verify RLS policies are active on all tables (ensure no public access without auth)
- **Data import:**
  - Run YouTube import wizard (Ticket 31): import all videos from both channels
  - Run Podcast import (Ticket 32): import all episodes from RSS feed, link to YouTube videos
  - Run Blog import (Ticket 32): import blog posts from roadmancycling.com
  - Run Beehiiv import (Ticket 32): import all sent newsletters with stats
  - Run bulk embedding job (Ticket 36): generate embeddings for all imported content
  - Verify: imported data appears correctly in asset list, performance dashboard shows real metrics
- **User setup:**
  - Set strong passwords for all 5 user accounts
  - Verify each user can log in: Anthony (admin), Sarah (content_manager), Caoimhe (creator), Matthew (social_publisher), Wes (creator)
  - Verify permissions work correctly per role
- **Platform connections:**
  - Connect YouTube via OAuth2 (ted@roadmancycling.com)
  - Connect Instagram + Facebook via Meta OAuth2
  - Connect LinkedIn via OAuth2
  - Enter Beehiiv API key
  - Configure GA4 service account credentials
  - Enter initial Skool metrics manually
- **First sync:**
  - Trigger manual sync for all connected platforms
  - Verify first daily sync completes successfully (check `sync_jobs` records)
  - Verify performance dashboard shows real data from all platforms
- **Team walkthrough:**
  - Create a test weekly focus campaign for the current week
  - Add a test asset linked to the campaign
  - Schedule a test publication to Instagram
  - View the performance dashboard with real imported data
  - Verify the full workflow end-to-end
- **Browser testing:**
  - Test on Chrome (primary), Safari, Firefox
  - Verify no layout issues, no console errors, all interactions work

**Acceptance criteria:**
- App is live at `os.roadmancycling.com` with SSL active (HTTPS only)
- All 5 users can log in with their credentials and see the correct role-based UI
- Permissions work correctly: Anthony sees everything, Matthew sees social publisher view, Wes/Caoimhe see creator view
- All platform integrations are connected and syncing
- First daily sync completed successfully (all `sync_jobs` show status = 'completed')
- Imported data is present: YouTube videos, podcast episodes, blog posts, newsletters
- Performance dashboard shows real metrics from connected platforms
- App loads in under 3 seconds on first visit
- No errors in Vercel deployment logs
- The end-to-end workflow works: create campaign → add asset → schedule publication → view performance

---

## Summary

| Phase | Tickets | Focus |
|-------|---------|-------|
| 1 | 1–6 | Foundation (auth, database, UI shell, permissions) |
| 2 | 7–15 | Content Core (campaigns, assets, files, taxonomy, clusters) |
| 3 | 16–22 | Workflow (publications, calendar, tasks, briefs, ideas, notifications) |
| 4 | 23–30 | Platform Integrations (YouTube, Meta, LinkedIn, Spotify, Beehiiv, GA4, Skool) |
| 5 | 31–35 | Auto-Import & Sync (bulk import, cron jobs, webhooks, sync dashboard) |
| 6 | 36–39 | Search & Intelligence (embeddings, semantic search, gap detection, duplicates) |
| 7 | 40–44 | Reporting & Dashboards (performance, campaign scorecards, sponsor reports, decay alerts, transcripts) |
| 8 | 45–50 | Polish & Team Onboarding (comments, activity log, search, polish, operational setup, launch) |
| **Total** | **50** | |

**Size distribution:** S x 10, M x 33, L x 7
