# Roadman OS — MVP Build Tickets

> **Version:** 1.0
> **Date:** 16 July 2026
> **Total tickets:** 30
> **Estimated timeline:** 6 sprints (~35 working days)
> **Builder:** Claude (Dispatch sessions)

Each ticket is designed to be completable in a single Dispatch session. Tickets within a sprint can be built in order. Cross-sprint dependencies are noted.

---

## Sprint 1: Foundation (Tickets 1–6)

### Ticket 1: Project Scaffolding

**Size:** S
**Depends on:** Nothing

Create the `roadman-os` Next.js project with all tooling configured.

**Tasks:**
- Run `create-next-app@latest` with App Router, TypeScript, Tailwind, ESLint
- Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `date-fns`, `lucide-react`, `@tanstack/react-table`
- Configure `tailwind.config.ts` with Roadman brand colours (#252526, #210140, #F16363, #4C1273, #FAFAFA, #545559) and fonts (Bebas Neue, Work Sans)
- Set up Google Fonts imports in `layout.tsx`
- Create `.env.example` with all required variables
- Create `.env.local` with Supabase project credentials
- Set up `src/lib/supabase/client.ts` (browser client)
- Set up `src/lib/supabase/server.ts` (server client using cookies)
- Set up `src/lib/supabase/middleware.ts` (session refresh)
- Create `src/middleware.ts` (auth redirect logic)
- Initialise Git repository, push to GitHub
- Create Vercel project, link to repo, deploy empty shell

**Acceptance criteria:**
- `npm run dev` starts without errors
- Deployed to Vercel with a blank page at `os.roadmancycling.com` (or preview URL)
- Supabase client initialises without errors in both browser and server contexts
- Brand colours and fonts render correctly

---

### Ticket 2: Database Schema

**Size:** M
**Depends on:** Ticket 1

Create the full database schema in Supabase.

**Tasks:**
- Initialise Supabase CLI in the project (`supabase init`)
- Create migration `00001_initial_schema.sql` containing:
  - All enum types (16 enums as defined in architecture doc section 3.1)
  - All tables (profiles, permissions, topics, tags, asset_topics, asset_tags, campaigns, assets, files, transcripts, transcript_highlights, platforms, platform_reuse_policies, publications, performance_records, products, sponsors, tasks, content_briefs, ideas, comments, activity_log, content_clusters, content_cluster_assets)
  - All indexes as defined in the architecture doc
  - Full-text search GIN indexes on assets and transcripts
- Run migration against Supabase project (`supabase db push`)
- Generate TypeScript types (`supabase gen types typescript --project-id <id> > src/types/database.ts`)
- Verify all tables exist in Supabase dashboard

**Acceptance criteria:**
- All 24 tables created with correct columns, types, and constraints
- All foreign key relationships valid
- TypeScript types generated and importable
- No migration errors

---

### Ticket 3: Supabase Auth Setup

**Size:** S
**Depends on:** Ticket 2

Configure Supabase Auth for email/password login and wire up the Next.js auth flow.

**Tasks:**
- Enable email/password auth in Supabase dashboard
- Disable email confirmation (internal users — no need)
- Create 5 auth users via Supabase dashboard or admin API:
  - anthony@roadmancycling.com (admin)
  - sarah@roadmancycling.com (content_manager)
  - caoimhe@roadmancycling.com (creator)
  - matthew@roadmancycling.com (social_publisher)
  - wes@roadmancycling.com (creator)
- Create `/login/page.tsx` with email/password form
- Wire up `supabase.auth.signInWithPassword()` on form submit
- Wire up `supabase.auth.signOut()` for logout
- Implement middleware auth check: unauthenticated requests to any page except `/login` redirect to `/login`
- Implement post-login redirect to `/`
- Handle auth errors (invalid credentials, network errors)

**Acceptance criteria:**
- All 5 users can log in with email/password
- Unauthenticated users are redirected to `/login`
- Authenticated users are redirected away from `/login`
- Session persists across page refreshes
- Sign out clears session and redirects to `/login`

---

### Ticket 4: User Seeding & Profiles Trigger

**Size:** S
**Depends on:** Ticket 3

Create profile records for each auth user and set up the auto-creation trigger.

**Tasks:**
- Create a Supabase database function + trigger that auto-creates a `profiles` row when a new `auth.users` row is inserted
- Seed profile data for the 5 launch users:
  - Anthony Walsh — admin — "Anthony"
  - Sarah — content_manager — "Sarah"
  - Caoimhe — creator — "Caoimhe"
  - Matthew — social_publisher — "Matthew"
  - Wes — creator — "Wes"
- Create a utility function `getCurrentProfile()` that fetches the current user's profile from the session
- Verify profiles are accessible from both server and client components

**Acceptance criteria:**
- Each auth user has a corresponding `profiles` row with correct role
- `getCurrentProfile()` returns the full profile for the logged-in user
- New users (if created in future) auto-get a profile row via the trigger
- Profile data is available in the app layout (for sidebar user display)

---

### Ticket 5: App Shell + Sidebar Navigation

**Size:** M
**Depends on:** Ticket 4

Build the main application layout with sidebar, header, and responsive navigation.

**Tasks:**
- Create root `layout.tsx` with:
  - Dark theme (bg-charcoal #252526)
  - Google Fonts loading (Bebas Neue, Work Sans)
  - Auth gate (redirect to login if not authenticated)
  - Sidebar + header + main content area
- Build `Sidebar.tsx`:
  - Deep Purple (#210140) background, 240px wide
  - Roadman OS logo at top
  - Navigation links: Dashboard, Campaigns, Assets, Calendar, Ideas, Tasks, Transcripts, Performance, Settings
  - Active state highlighting (Coral #F16363)
  - Collapsed state for mobile
  - Current user avatar + name at bottom with sign-out
- Build `Header.tsx`:
  - Breadcrumbs
  - Search bar (placeholder for now)
  - User menu dropdown
- Build `MobileNav.tsx`:
  - Hamburger menu trigger
  - Slide-out navigation panel
- Create placeholder pages for all routes (just the page title)

**Acceptance criteria:**
- Sidebar renders with all navigation links
- Clicking nav links navigates to correct routes
- Active route is visually highlighted
- Mobile navigation works (< 768px)
- Current user name and role displayed in sidebar
- Sign-out works from the user menu
- All placeholder pages render without errors

---

### Ticket 6: Permission System

**Size:** S
**Depends on:** Ticket 4

Implement role-based permission checking for both server and client.

**Tasks:**
- Seed the `permissions` table with the full permission matrix (as defined in architecture doc section 3.3)
- Create `src/lib/utils/permissions.ts` with:
  - `checkPermission(userId, resource, action)` — server-side async check against permissions table
  - `hasPermission(role, resource, action)` — sync check against cached permissions
- Create a React context provider `PermissionsProvider` that loads the current user's permissions on mount
- Create `usePermissions()` hook returning `{ can: (resource, action) => boolean, role: user_role }`
- Add the provider to the root layout
- Create `<PermissionGate resource="..." action="...">` wrapper component that conditionally renders children

**Acceptance criteria:**
- `checkPermission('anthony-id', 'campaigns', 'create')` returns `true`
- `checkPermission('wes-id', 'settings', 'update')` returns `false`
- `usePermissions().can('publications', 'publish')` returns correct value per role
- `<PermissionGate>` hides UI elements the user lacks permission for
- Permission checks don't cause N+1 queries (batch loaded)

---

## Sprint 2: Campaigns + Weekly Focus (Tickets 7–10)

### Ticket 7: Campaign CRUD

**Size:** M
**Depends on:** Tickets 5, 6

Full campaign create/read/update with Server Actions.

**Tasks:**
- Create `src/lib/actions/campaigns.ts` with Server Actions:
  - `createCampaign(formData)` — validates with Zod, inserts, logs activity
  - `updateCampaign(id, formData)` — validates, updates, logs activity
  - `archiveCampaign(id)` — sets `archived_at`, logs activity
- Create `CampaignForm.tsx` with fields:
  - Title, description, type (dropdown), status (dropdown)
  - Pillar (dropdown), start date, end date
  - Goals (multi-input), key messages (multi-input)
  - Owner (user selector), sponsor (selector, optional), product (selector, optional)
  - CTA URL, CTA text, colour picker, notes
- Create `/campaigns/new/page.tsx` — renders CampaignForm in create mode
- Create `/campaigns/[id]/edit/page.tsx` — renders CampaignForm in edit mode, pre-populated
- Create campaign query functions in `src/lib/queries/campaigns.ts`
- Wire up form validation with Zod schema and display errors

**Acceptance criteria:**
- Users can create a campaign with all fields
- Form validation prevents submission with missing required fields (title, start/end dates, owner)
- Created campaigns appear in the database
- Edit form loads existing campaign data
- Updates persist correctly
- Activity log records creation and updates
- Campaign type defaults to `weekly_focus`

---

### Ticket 8: Weekly Focus Banner

**Size:** M
**Depends on:** Ticket 7

The hero component — the most important UI element in Roadman OS.

**Tasks:**
- Create `WeeklyFocusBanner.tsx`:
  - Full-width banner at the top of the dashboard
  - Shows the currently active `weekly_focus` campaign
  - Large title in Bebas Neue
  - Pillar badge, date range, owner avatar
  - Key messages displayed
  - Quick stats: assets count, tasks remaining, publications scheduled
  - "View Campaign" CTA linking to `/campaigns/[id]`
  - Empty state when no weekly focus is active
- Create `/api/campaigns/current/route.ts`:
  - Returns the active `weekly_focus` campaign where `start_date <= today <= end_date`
  - Falls back to the next upcoming weekly focus if none is currently active
- Create the dashboard page (`/page.tsx` or `/campaigns/page.tsx`):
  - WeeklyFocusBanner at top
  - "Upcoming Weeks" section below showing next 4 weekly focuses
  - "Recent Activity" feed (from activity_log)
- Style with brand colours: Deep Purple gradient background, Coral accent, Off White text

**Acceptance criteria:**
- Banner shows the current week's campaign (determined by date range)
- Banner displays title, pillar, date range, owner, key messages
- Asset count, task count, and publication count are accurate
- When no weekly focus exists, a clear empty state is shown with "Create Weekly Focus" CTA
- Upcoming weeks are listed below the banner
- The banner is visually prominent and matches Roadman brand aesthetic

---

### Ticket 9: Campaign Detail Page

**Size:** M
**Depends on:** Tickets 7, 8

The campaign detail view showing everything related to a campaign.

**Tasks:**
- Create `/campaigns/[id]/page.tsx`:
  - Campaign header: title, type badge, status badge, pillar badge, date range, owner
  - Description section
  - Goals list
  - Key messages
  - Sponsor and product links (if set)
  - "Assets" tab: list of assets linked to this campaign (via `assets.campaign_id`)
  - "Tasks" tab: list of tasks linked to this campaign (via `tasks.campaign_id`)
  - "Publications" tab: list of publications linked to this campaign
  - "Activity" tab: activity log filtered to this campaign
  - Edit button (permission-gated)
  - Archive button (permission-gated, with confirmation)
- Create query functions for campaign-related data (assets by campaign, tasks by campaign, etc.)
- Wire up tab navigation (URL-based or client-side)

**Acceptance criteria:**
- Campaign detail page loads with all campaign data
- All four tabs display correct data (can be empty initially)
- Edit and archive buttons respect permissions
- Archive requires confirmation dialog
- Breadcrumbs show: Dashboard > Campaigns > [Campaign Title]

---

### Ticket 10: Campaign List + Filters

**Size:** S
**Depends on:** Ticket 7

Browsable, filterable campaign list.

**Tasks:**
- Update `/campaigns/page.tsx`:
  - WeeklyFocusBanner at top (from Ticket 8)
  - "All Campaigns" section below
  - Card grid layout (campaigns as cards)
  - Each card: title, type badge, status badge, date range, pillar, owner avatar, asset count
  - Click card → navigate to `/campaigns/[id]`
- Add filter bar:
  - Type filter (all, weekly_focus, product_launch, etc.)
  - Status filter (all, draft, planned, active, completed)
  - Pillar filter
  - Date range filter
- Add "New Campaign" button (permission-gated)
- Sort by: start date (default), title, status

**Acceptance criteria:**
- All non-archived campaigns are listed
- Filters narrow the list correctly
- Campaign cards show key information at a glance
- "New Campaign" button only visible to users with create permission
- Empty state message when no campaigns match filters

---

## Sprint 3: Assets + Files (Tickets 11–15)

### Ticket 11: Asset CRUD

**Size:** L
**Depends on:** Tickets 5, 6, 7

Full asset create/read/update with type-specific form sections.

**Tasks:**
- Create `src/lib/actions/assets.ts` with Server Actions:
  - `createAsset(formData)` — validates, inserts, handles topic/tag assignments, logs activity
  - `updateAsset(id, formData)` — validates, updates, handles topic/tag diffs, logs activity
  - `archiveAsset(id)` — soft delete, logs activity
- Create `AssetForm.tsx` with:
  - Common fields: title, asset_type, status, pillar, description, body (rich text area), excerpt
  - Campaign selector
  - Source asset selector (for derivatives)
  - Assigned to (user selector), due date
  - Type-specific sections that show/hide based on asset_type:
    - Podcast: episode_number, season_number, duration, youtube_id, spotify_url, guest_name, guest_credential, recording_date
    - Blog: seo_title, seo_description, keywords, answer_capsule, canonical_url, word_count
    - Social: platform-specific fields
  - Topic multi-select (from controlled taxonomy)
  - Tag multi-select (with create-new option)
- Create `/assets/new/page.tsx` and `/assets/[id]/edit/page.tsx`
- Create Zod validation schemas per asset type

**Acceptance criteria:**
- Users can create assets of any type
- Type-specific fields appear when the relevant asset_type is selected
- Topics and tags are saved correctly (junction tables)
- Validation prevents submission with missing required fields
- Activity log records creation and updates
- Form handles all field types (text, textarea, date, select, multi-select, number)

---

### Ticket 12: Asset List + Search

**Size:** M
**Depends on:** Ticket 11

Filterable, searchable asset library.

**Tasks:**
- Create `/assets/page.tsx`:
  - DataTable component using `@tanstack/react-table`
  - Columns: title (clickable), type badge, status badge, pillar badge, campaign, assigned to, updated date
  - Server-side pagination (20 per page)
  - Row click → navigate to `/assets/[id]`
- Create `AssetFilters.tsx`:
  - Search input (full-text search via `to_tsvector`)
  - Type filter (multi-select)
  - Status filter (multi-select)
  - Pillar filter
  - Campaign filter
  - Assigned to filter
  - Date range filter (created/updated)
- Create the asset search query in `src/lib/queries/assets.ts`
- Add "New Asset" button (permission-gated)
- Implement URL-based filter state (so filters persist on page refresh)

**Acceptance criteria:**
- Assets are listed in a paginated table
- All filters work independently and in combination
- Search returns relevant results using full-text search
- Pagination works correctly
- Filters are reflected in the URL
- Empty state message when no assets match
- Asset count displayed ("Showing 1–20 of 142 assets")

---

### Ticket 13: File Upload + Management

**Size:** M
**Depends on:** Ticket 11

File upload to Supabase Storage and external URL reference management.

**Tasks:**
- Create Supabase Storage buckets: `assets`, `thumbnails`
- Create `FileUploader.tsx`:
  - Drag-and-drop zone + file picker button
  - File type validation (images, PDFs, audio, documents)
  - File size validation (50MB max per file)
  - Upload progress bar
  - Direct upload to Supabase Storage using signed URLs
- Create `src/lib/actions/files.ts`:
  - `uploadFile(assetId, formData)` — generates signed URL, inserts file record
  - `addExternalFile(assetId, formData)` — inserts file record with external URL
  - `deleteFile(fileId)` — removes from storage + database
  - `setPrimaryFile(fileId)` — marks as primary, unmarks others for that asset
- Create file list component for asset detail page:
  - List of files with: name, type icon, size, upload date, primary badge
  - Preview for images (thumbnail)
  - Download link (signed URL)
  - Delete button
  - "Set as primary" toggle
  - "Add external link" form (URL, platform, description)
- Create `/api/upload/route.ts` for generating signed upload URLs

**Acceptance criteria:**
- Users can upload files via drag-and-drop or file picker
- Files are stored in Supabase Storage under the correct bucket/path
- File records appear in the `files` table with correct metadata
- External URLs can be added without file upload
- Files can be downloaded via signed URLs
- Files can be deleted (both storage and database)
- One file per asset can be marked as primary
- Upload progress is visible during upload
- File type and size validation prevents invalid uploads

---

### Ticket 14: Source→Derivative Linking

**Size:** M
**Depends on:** Ticket 11

Parent-child asset relationships and the derivative tree view.

**Tasks:**
- Add source asset selector to `AssetForm.tsx`:
  - Searchable dropdown of existing assets
  - When selected, sets `source_asset_id` and `is_source = false`
  - Shows the source asset title + type as a linked badge
- Create `DerivativeTree.tsx`:
  - Visual tree showing: source asset at root → derivative assets as children
  - Each node shows: title, type badge, status badge
  - Click node → navigate to that asset
  - Expand/collapse for deep trees
  - "Add Derivative" button on source assets
- Add derivative tree to the asset detail page (`/assets/[id]/page.tsx`):
  - If asset is a source: show tree of all derivatives
  - If asset is a derivative: show link to source + siblings
- Create query: `getDerivativeTree(assetId)` — recursive query to get full tree

**Acceptance criteria:**
- Assets can be linked to a source asset during creation or editing
- The derivative tree correctly displays parent-child relationships
- Multi-level trees render correctly (source → derivative → sub-derivative)
- Clicking a node navigates to that asset
- "Add Derivative" pre-fills the source_asset_id in the new asset form
- Orphan derivatives (source deleted) display gracefully

---

### Ticket 15: Topic + Tag System

**Size:** M
**Depends on:** Ticket 11

Controlled topic taxonomy and freeform tags, applied to assets.

**Tasks:**
- Create `/settings/topics/page.tsx`:
  - CRUD table for topics
  - Fields: name, slug (auto-generated), pillar, description, parent topic, sort order
  - Drag-to-reorder (or manual sort order)
  - Active/inactive toggle
  - Pillar filter
  - Admin-only access
- Seed initial topics:
  - Coaching: Zone 2, Threshold Training, Periodisation, Polarised Training, Durability, Power Metrics, Recovery Weeks, Race Preparation
  - Nutrition: Fuelling, Body Composition, Race Day Nutrition, Supplements, Carb Loading, Hydration
  - S&C: Core Training, Mobility, Power Development, Injury Prevention, Stretching
  - Recovery: Sleep, Stress Management, Active Recovery, Overtraining
  - Le Metier: Group Riding, Skills, Bike Handling, Climbing, Time Trial, Equipment
- Create `TagInput.tsx`:
  - Multi-select with autocomplete
  - Type to search existing tags
  - Create new tags inline (press Enter)
  - Remove tags with × button
  - Shows tag colour if set
- Wire TagInput into AssetForm for both topics and tags
- Create actions for topic CRUD and tag creation

**Acceptance criteria:**
- Admin can create, edit, and deactivate topics
- Topics are organised by pillar with optional parent hierarchy
- Initial topics are seeded for all 5 pillars
- TagInput component auto-completes from existing tags
- New tags can be created inline
- Topics and tags are saved to junction tables when assets are saved
- Tags have a usage count that increments when applied

---

## Sprint 4: Calendar + Publications (Tickets 16–19)

### Ticket 16: Platform Seeding + Management

**Size:** S
**Depends on:** Ticket 2

Configure the platforms Roadman publishes to.

**Tasks:**
- Create `/settings/platforms/page.tsx`:
  - CRUD table for platforms
  - Fields: name, slug, platform_type, account_handle, base_url, is_active, ideal_post_times, character_limits, format_specs
  - Reuse policy editor per platform (asset type → min gap days, max reuses)
- Seed Roadman's platforms:
  - YouTube (Main): The Roadman Podcast, character limits, format specs
  - YouTube (Clips): Roadman Podcast Clips
  - Instagram: @roadman.cycling, 2200 char caption, 30 hashtags, 1080×1080 / 1080×1350 images
  - Facebook: Roadman Cycling page, long-form optimised
  - TikTok: format specs for short video
  - Twitter/X: 280 char limit
  - LinkedIn: professional format
  - Beehiiv Newsletter: no char limit
  - Skool Community: for community posts
  - Website (Blog): roadmancycling.com/blog
- Create platform reuse policies for each platform × asset type combination

**Acceptance criteria:**
- All 10 platforms are seeded with correct metadata
- Platform management page allows editing
- Reuse policies are configurable per platform
- Character limits and format specs are stored and accessible

---

### Ticket 17: Publication CRUD

**Size:** M
**Depends on:** Tickets 11, 16

Create and manage publications (asset × platform × date).

**Tasks:**
- Create `src/lib/actions/publications.ts`:
  - `schedulePublication(formData)` — validates, inserts, logs activity
  - `updatePublication(id, formData)` — validates, updates, logs activity
  - `markPublished(id, url)` — sets status to published, records published_at and platform_url
  - `cancelPublication(id)` — soft delete
- Create `ScheduleForm.tsx`:
  - Asset selector (searchable dropdown)
  - Platform selector (from active platforms)
  - Scheduled date/time picker
  - Platform-specific content fields:
    - Platform title (defaults to asset title)
    - Platform body (defaults to asset body/excerpt)
    - Hashtags (multi-input)
    - Mentions (multi-input)
  - Notes field
- Create `PublicationCard.tsx`:
  - Asset title, platform icon + name, scheduled time
  - Status badge (draft, scheduled, published, failed)
  - Quick actions: edit, mark published, cancel

**Acceptance criteria:**
- Publications can be created linking an asset to a platform with a date/time
- Platform-specific content fields default to asset content but can be overridden
- Publications appear in the database with correct status
- "Mark as published" updates status and records the platform URL
- Publications can be cancelled (soft deleted)

---

### Ticket 18: Publication Calendar View

**Size:** L
**Depends on:** Ticket 17

Visual calendar showing publications across all platforms.

**Tasks:**
- Create `PublicationCalendar.tsx`:
  - Week view (default): 7 columns (Mon–Sun), rows per platform
  - Month view (toggle): standard month grid with publication dots
  - Each publication shown as a coloured chip: platform colour + asset title truncated
  - Click chip → open publication detail/edit dialog
  - Click empty slot → open ScheduleForm pre-filled with that date/platform
  - Today highlighted
  - Navigation: previous/next week/month, "Today" button
- Create `/calendar/page.tsx`:
  - Calendar component
  - Platform filter (show/hide platforms)
  - Status filter (all, scheduled, published)
  - Campaign filter (show only publications for a campaign)
- Create query: `getPublicationsByDateRange(from, to, filters)`
- Style with platform-specific colours (YouTube red, Instagram gradient, Facebook blue, etc.)

**Acceptance criteria:**
- Week view shows publications for the current week across all platforms
- Month view shows publication density per day
- Clicking a publication opens edit/detail
- Clicking an empty slot opens the schedule form
- Platform filter hides/shows rows
- Navigation between weeks/months works
- Current day is visually highlighted
- Platform colours are distinct and consistent

---

### Ticket 19: Bulk Scheduling

**Size:** S
**Depends on:** Ticket 17

Schedule one asset to multiple platforms at once.

**Tasks:**
- Add "Schedule to Platforms" button on the asset detail page
- Create `BulkScheduleForm.tsx`:
  - Shows asset title (non-editable)
  - Platform checklist (checkboxes for each active platform)
  - Per-platform date/time pickers
  - "Same time for all" toggle
  - Per-platform content overrides (expandable)
  - Submit creates multiple publication records
- Create `bulkSchedulePublications(assetId, schedules[])` Server Action

**Acceptance criteria:**
- Users can select multiple platforms and schedule an asset to all of them
- Each platform gets its own publication record with correct date/time
- "Same time for all" sets the same date/time across all selected platforms
- Individual date/time can be set per platform
- All publications appear in the calendar after scheduling

---

## Sprint 5: Tasks, Ideas, Transcripts (Tickets 20–23)

### Ticket 20: Task CRUD + Board

**Size:** M
**Depends on:** Tickets 5, 6, 7, 11

Task management with kanban board and list views.

**Tasks:**
- Create `src/lib/actions/tasks.ts`:
  - `createTask(formData)` — validates, inserts, logs activity
  - `updateTask(id, formData)` — validates, updates
  - `updateTaskStatus(id, status)` — status change + logs activity
  - `assignTask(id, userId)` — assigns, logs activity
  - `archiveTask(id)` — soft delete
- Create `TaskBoard.tsx`:
  - Kanban columns: Backlog, To Do, In Progress, In Review, Done
  - Cards show: title, priority badge, assignee avatar, due date, asset link
  - Drag-and-drop between columns (updates status)
  - Click card → expand to edit form
- Create `TaskForm.tsx`:
  - Title, description, status, priority
  - Asset selector (optional), campaign selector (optional)
  - Assigned to (user selector)
  - Due date, estimated minutes
  - Labels (freeform)
  - Parent task selector (for sub-tasks)
- Create `/tasks/page.tsx`:
  - Toggle between kanban and list view
  - Filters: assignee, status, priority, campaign, due date range
  - "New Task" button
- Create list view as DataTable alternative to kanban

**Acceptance criteria:**
- Tasks can be created with all fields
- Kanban board displays tasks in correct columns
- Drag-and-drop moves tasks between statuses
- List view shows all tasks in a sortable, filterable table
- Tasks can be assigned to team members
- Sub-tasks display under their parent
- Filters work in both views

---

### Ticket 21: Ideas Quick Capture

**Size:** S
**Depends on:** Tickets 5, 6

Lightweight idea capture and management.

**Tasks:**
- Create `/ideas/page.tsx`:
  - Quick capture input at the top (just title + optional pillar + Enter to save)
  - Idea list below: title, status badge, pillar badge, source, created by, date, vote count
  - Vote buttons (thumbs up) — increments `vote_count`
  - Click idea → expand inline for description, source, target asset type
  - "Promote to Asset" action → opens new asset form pre-filled with idea data
  - Filter by: status, pillar, created by
  - Sort by: newest, most votes, priority
- Create `src/lib/actions/ideas.ts`:
  - `captureIdea(formData)` — minimal validation, fast insert
  - `updateIdea(id, formData)` — full update
  - `voteIdea(id)` — increment vote_count
  - `promoteIdea(id)` — creates asset, links idea via `converted_to_asset_id`
  - `discardIdea(id)` — sets status to discarded

**Acceptance criteria:**
- Ideas can be captured with just a title (one-field quick entry)
- Ideas appear in the list immediately after creation
- Voting increments the count (one vote per user enforced at app layer)
- "Promote to Asset" creates a new asset with the idea's title and description
- Promoted ideas show "Used" status with a link to the created asset
- Filters and sorting work

---

### Ticket 22: Transcript Viewer

**Size:** M
**Depends on:** Ticket 11

Transcript display with timestamps and speaker labels.

**Tasks:**
- Create `/transcripts/page.tsx`:
  - List of assets that have transcripts
  - Shows: asset title, type, duration, word count, verified badge
  - Search within transcripts (full-text search)
  - Click → navigate to `/transcripts/[id]`
- Create `/transcripts/[id]/page.tsx`:
  - Asset header (title, episode number, guest, duration)
  - Full transcript text with:
    - Timestamped segments (clickable timestamps)
    - Speaker labels (if diarisation available)
    - Paragraph breaks
  - Sidebar: asset metadata, linked highlights, derivative assets
- Create `TranscriptViewer.tsx`:
  - Scrollable transcript with timestamp markers
  - Speaker name labels
  - Text selection support (for highlighting in Ticket 23)
  - Word count and reading time

**Acceptance criteria:**
- Transcripts are displayed with clear formatting
- Timestamps are visible and formatted (HH:MM:SS)
- Speaker labels are displayed when available
- Transcript text is searchable from the list page
- Long transcripts scroll smoothly with good performance
- Sidebar shows relevant metadata

---

### Ticket 23: Transcript Highlights

**Size:** M
**Depends on:** Ticket 22

Selection-based highlighting of transcript sections.

**Tasks:**
- Create `HighlightMarker.tsx`:
  - User selects text in the transcript
  - A floating toolbar appears with highlight options:
    - Highlight type: quote, insight, action item, clip-worthy, fact
    - Note field (optional)
    - Colour selection
  - On save, creates a `transcript_highlights` record
- Display existing highlights:
  - Highlighted sections shown with background colour in the transcript
  - Hover to see note and type
  - Click to edit or delete
  - Sidebar list of all highlights for this transcript
- Create `src/lib/actions/transcripts.ts`:
  - `addHighlight(formData)` — inserts highlight with start/end times and text
  - `updateHighlight(id, formData)` — updates note, type, colour
  - `deleteHighlight(id)` — removes highlight
  - `markHighlightUsed(id, assetId)` — links to derivative asset
- Filter highlights by type, by user, by used/unused

**Acceptance criteria:**
- Users can select text in the transcript to create a highlight
- Highlights are visually displayed in the transcript
- Different highlight types have different colours
- Notes can be added to highlights
- Highlights can be edited and deleted
- "Used" highlights link to the asset they were used in
- Highlight list in sidebar shows all highlights with filters

---

## Sprint 6: Performance, Comments, Search, Polish (Tickets 24–30)

### Ticket 24: Performance Tracking

**Size:** M
**Depends on:** Tickets 17, 16

Manual performance metric entry and dashboard.

**Tasks:**
- Create `/performance/page.tsx`:
  - Overview cards: total views (7d), total engagement (7d), top performing asset, top platform
  - Platform comparison chart (bar chart: views per platform)
  - Recent performance entries table
  - "Add Performance Data" button
- Create performance entry form:
  - Select publication or asset + platform (one of the two)
  - Date range (period start/end)
  - Metric fields (all optional): views, impressions, reach, clicks, CTR, likes, comments, shares, saves, engagement rate
  - Video metrics: watch time, avg view duration, completion rate
  - Revenue: revenue, cost, conversions
  - Source selector (manual, youtube, instagram, etc.)
- Create `MetricCard.tsx`: value, label, trend indicator (up/down/flat)
- Create `PerformanceChart.tsx`: simple bar/line chart using recharts or similar
- Create `src/lib/actions/performance.ts` for CRUD operations

**Acceptance criteria:**
- Performance data can be entered manually for any publication or asset+platform
- Dashboard shows key metrics with period comparison
- Platform comparison chart displays correctly
- Metrics are stored with correct source attribution
- Empty states handle gracefully when no data exists

---

### Ticket 25: Comments System

**Size:** M
**Depends on:** Tickets 7, 11, 17, 20, 21

Threaded comments on all entity types.

**Tasks:**
- Create `CommentThread.tsx`:
  - List of comments with: author avatar, name, timestamp, body
  - Reply button → nested reply (one level of threading)
  - Edit button (own comments only)
  - Delete button (own comments or admin)
  - Mention support: @-mention triggers user autocomplete
  - Markdown-light formatting (bold, italic, links)
- Create `src/lib/actions/comments.ts`:
  - `addComment(formData)` — validates, inserts, extracts mentions, logs activity
  - `updateComment(id, body)` — updates, sets edited_at
  - `deleteComment(id)` — soft delete (sets archived_at)
- Integrate CommentThread into:
  - Asset detail page (`/assets/[id]`)
  - Campaign detail page (`/campaigns/[id]`)
  - Task detail (inline in board)
  - Publication detail
  - Idea detail (inline expand)

**Acceptance criteria:**
- Comments can be added to assets, campaigns, tasks, publications, and ideas
- Replies appear nested under parent comments
- @-mentions auto-complete from user list
- Own comments can be edited and deleted
- Admin can delete any comment
- Comments display with correct author, timestamp, and formatting
- Activity log records new comments

---

### Ticket 26: Activity Log

**Size:** M
**Depends on:** All previous tickets

Automatic activity recording and feed display.

**Tasks:**
- Create `logActivity()` utility function:
  - Parameters: action, entity_type, entity_id, entity_title, field_changed, old_value, new_value, actor_id
  - Called from all Server Actions on create/update/delete/status-change
- Audit all existing Server Actions and add `logActivity()` calls where missing
- Create `ActivityFeed.tsx`:
  - Chronological list of activities
  - Each entry: actor avatar + name, action verb, entity link, timestamp
  - Human-readable descriptions ("Anthony created campaign 'Week 29: Zone 2 Deep Dive'")
  - Filter by: entity type, action type, actor, date range
- Add activity feed to:
  - Dashboard sidebar
  - Campaign detail page (activity tab)
  - Asset detail page (activity tab)
- Create `/api/activity` route for paginated activity queries

**Acceptance criteria:**
- All create, update, delete, and status change actions are logged
- Activity feed displays in chronological order (newest first)
- Each entry links to the relevant entity
- Actor name and action are human-readable
- Filters work correctly
- Pagination loads more entries on scroll
- No duplicate entries for a single action

---

### Ticket 27: Global Search

**Size:** M
**Depends on:** Tickets 11, 7, 22, 21, 20

Full-text search across all entity types.

**Tasks:**
- Create `/api/search/route.ts`:
  - Accepts: `q` (query string), `type` (filter to entity type), `pillar`, `limit`, `offset`
  - Searches across: assets (title, description, body, guest_name), campaigns (title, description), transcripts (full_text), ideas (title, description), tasks (title, description)
  - Uses `to_tsvector` / `plainto_tsquery` with ranking
  - Returns grouped results by entity type
  - Highlights matching text with `ts_headline`
- Create `SearchBar.tsx`:
  - Input in the header (always visible)
  - Typeahead results dropdown (debounced 200ms)
  - Shows top 3 results per entity type
  - "View all results" link
  - Keyboard navigation (up/down arrows, Enter to select)
  - `Cmd+K` shortcut to focus search
- Create search results page (or modal):
  - Full results grouped by type
  - Result cards: title, type icon, excerpt with highlighted match, date
  - Click → navigate to entity detail page
  - Filters: entity type, pillar

**Acceptance criteria:**
- Search returns relevant results across all entity types
- Typeahead shows results within 300ms of typing
- Results are ranked by relevance
- Matching text is highlighted in results
- `Cmd+K` focuses the search bar
- Empty query shows recent searches (stored in localStorage)
- No results state displays clearly

---

### Ticket 28: Content Briefs

**Size:** M
**Depends on:** Tickets 11, 7

Content brief creation with approval workflow.

**Tasks:**
- Create content brief form within the asset detail page or as a linked page:
  - Targeting section: primary query, secondary queries, search intent, target persona, pillar
  - Angle section: unique angle, competitor gaps, original sources, answer capsule, decision framework
  - Internal linking: pillar page, related episodes, related tools, CTA
  - Cannibalisation check: existing pages, decision, rationale
  - All fields from the content brief template (see `docs/content-brief-template.md`)
- Create `src/lib/actions/briefs.ts`:
  - `createBrief(formData)` — validates, inserts, logs activity
  - `updateBrief(id, formData)` — updates
  - `submitBrief(id)` — changes status to submitted
  - `approveBrief(id)` — changes status to approved (admin/leadership only)
  - `rejectBrief(id, reason)` — changes status to rejected with reason
- Link briefs to assets: when a brief is approved, the linked asset can proceed to production
- Show brief status on asset cards

**Acceptance criteria:**
- Content briefs can be created with all fields from the template
- Briefs can be linked to an asset and/or campaign
- Submission → approval workflow works (submitted → approved/rejected)
- Only admin/leadership can approve briefs
- Rejection includes a reason visible to the creator
- Brief status is visible on the asset detail page

---

### Ticket 29: Polish + Bug Fixes

**Size:** M
**Depends on:** All previous tickets

UI consistency, loading states, error handling, and mobile responsiveness.

**Tasks:**
- Add loading skeletons to all pages (shimmer placeholders while data loads)
- Add error boundaries to all route segments
- Add toast notifications for successful actions ("Campaign created", "Asset updated")
- Add confirmation dialogs for destructive actions (archive, delete)
- Ensure all forms show inline validation errors
- Mobile responsiveness audit:
  - Sidebar collapses properly
  - Tables scroll horizontally on small screens
  - Forms stack vertically on mobile
  - Calendar adapts to narrow viewports
- Consistent empty states across all list pages
- Keyboard accessibility: all interactive elements focusable, Escape closes modals
- Fix any visual inconsistencies (spacing, colours, font weights)
- Add page titles (for browser tabs)
- Add breadcrumbs to all pages

**Acceptance criteria:**
- No page shows a blank white screen while loading (skeletons everywhere)
- All forms display validation errors inline
- Toast notifications appear for all successful mutations
- Destructive actions require confirmation
- App is usable on mobile (iPad minimum)
- No console errors in production build
- All pages have correct browser tab titles
- Breadcrumbs show correct hierarchy on every page

---

### Ticket 30: Launch Prep

**Size:** S
**Depends on:** Ticket 29

Final production configuration and user onboarding.

**Tasks:**
- Set production environment variables in Vercel
- Configure `os.roadmancycling.com` DNS (CNAME to Vercel)
- Verify SSL certificate is active
- Run production build and test all routes
- Verify RLS policies are active on all tables
- Create initial seed data:
  - 1 sample weekly focus campaign (current week)
  - 3 sample assets (1 podcast episode, 1 blog post, 1 social post — linked as source→derivatives)
  - 2 sample tasks
  - 2 sample ideas
  - 5 sample publications across different platforms
- Set strong passwords for all 5 user accounts
- Write brief onboarding notes in the app (or `/settings` page):
  - How to create a weekly focus
  - How to add an asset
  - How to schedule a publication
- Verify all 5 users can log in and see the correct permissions
- Test on Chrome, Safari, Firefox

**Acceptance criteria:**
- App is live at `os.roadmancycling.com`
- All 5 users can log in with their credentials
- Sample data provides a clear starting point
- Permissions work correctly (Anthony sees everything, Matthew sees social publisher view)
- No errors in Vercel deployment logs
- App loads in under 3 seconds on first visit
- SSL is active (HTTPS only)

---

## Summary

| Sprint | Tickets | Focus | Days |
|--------|---------|-------|------|
| 1 | 1–6 | Foundation, auth, shell | 5 |
| 2 | 7–10 | Campaigns + weekly focus | 5 |
| 3 | 11–15 | Assets + files + taxonomy | 7 |
| 4 | 16–19 | Calendar + publications | 5 |
| 5 | 20–23 | Tasks, ideas, transcripts | 7 |
| 6 | 24–30 | Performance, comments, search, polish, launch | 6 |
| **Total** | **30** | | **~35 days** |

**Size distribution:** S × 8, M × 18, L × 4

Each ticket is scoped to be completable in a single Dispatch session. Complex tickets (L) may require 2 sessions. The build order is strictly sequential within sprints but sprints are designed to deliver working increments.
