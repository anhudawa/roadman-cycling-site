# Content Admin Dashboard $€” Design Spec

## Overview

An admin dashboard for the podcast content repurposing pipeline. The team logs in, views generated content (blog posts, social media posts, quote cards), approves or rejects each piece, and suggests amendments via an inline chat interface that re-generates content using Claude.

**Auth:** Legacy password-based auth (same as analytics dashboard), under `/admin/(dashboard)/`.

**Storage:** All content state, versions, and chat history in Postgres via Drizzle. Pipeline writes directly to DB on generation.

**Architecture:** Server Actions for CRUD, one streaming API route for chat regeneration.

## Database Schema

Three new tables added to `src/lib/db/schema.ts`:

### `repurposedEpisodes`
| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| episodeSlug | text | unique, links to podcast MDX |
| episodeTitle | text | |
| episodeNumber | integer | |
| pillar | text | coaching/nutrition/strength/recovery/le-metier |
| status | text | `pending` / `approved` / `partial` |
| generatedAt | timestamp | when pipeline ran |
| createdAt | timestamp | default now() |
| updatedAt | timestamp | default now() |

### `repurposedContent`
| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| episodeId | integer | FK $†’ repurposedEpisodes.id |
| contentType | text | `blog` / `twitter` / `instagram` / `linkedin` / `facebook` / `quote-card` |
| content | text | full content (MDX for blog, JSON string for social, base64 for images) |
| status | text | `pending` / `approved` / `rejected` / `amended` |
| version | integer | increments on regeneration, starts at 1 |
| createdAt | timestamp | default now() |
| updatedAt | timestamp | default now() |

### `contentChatMessages`
| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| contentId | integer | FK $†’ repurposedContent.id |
| role | text | `user` / `assistant` |
| message | text | |
| createdAt | timestamp | default now() |

## Page Structure

### Sidebar
Add "Content Pipeline" link to AdminSidebar under a new "Content" section.

### Episode List $€” `/admin/(dashboard)/content/repurposed/page.tsx`
- Card/table layout: episode title, EP number, generated date, overall status, approved count / total
- Filter by status (all, pending, approved)
- Click to open episode detail
- Sorted by generatedAt descending (newest first)

### Episode Detail $€” `/admin/(dashboard)/content/repurposed/[episodeId]/page.tsx`
- Header: episode title, pillar badge, overall status, approve-all button
- 6 content cards in responsive grid (2 cols on lg, 1 on mobile):

**Blog Post Card:**
- Rendered markdown preview (truncated with expand)
- Word count
- Approve / Reject / Chat buttons

**Twitter Thread Card:**
- Each tweet displayed in sequence with character count
- Approve / Reject / Chat

**Instagram Card:**
- Caption text with line breaks
- Hashtag pills
- Approve / Reject / Chat

**LinkedIn Card:**
- Formatted post text
- Approve / Reject / Chat

**Facebook Card:**
- Full long-form post with the "angle" badge
- Approve / Reject / Chat

**Quote Cards:**
- Image thumbnails in a row (square versions)
- Click to view full-size
- Approve / Reject / Chat (amends quote text, re-renders image)

### Content Card Component
Each card has:
- Status badge (top-right): pending (yellow), approved (green), rejected (red), amended (blue)
- Content preview area (varies by type)
- Action bar: Approve / Reject buttons + Chat toggle
- Collapsible chat panel (below content when expanded)

## Inline Chat Interface

### Layout
When "Chat" is toggled on a content card, a panel expands below the content showing:
1. Chat history (scrollable, chronological)
2. Text input with send button at the bottom
3. Content preview updates in real-time during streaming

### Flow
1. User types amendment request (e.g., "make the intro punchier")
2. Client POSTs to `/api/admin/content/chat` with `{ contentId, message }`
3. Server:
   - Saves user message to `contentChatMessages`
   - Loads current content + full chat history
   - Calls Claude Sonnet with amendment prompt (streaming)
   - Streams response back via SSE
   - On completion: saves assistant response, creates new content version (version++), sets status to `amended`
4. Client updates content preview live during stream
5. New version shows with approve/reject buttons reset to pending

### Amendment Prompt
```
System: You are editing content for Roadman Cycling. Maintain Anthony Walsh's voice:
direct, practical, warm, knowledgeable. Aimed at amateur cyclists who want to get faster.

You will receive the current content and a request to amend it. Return the COMPLETE
revised content $€” not a diff, the full replacement. Match the exact format of the input.
```

User message includes: content type, current content, amendment request.

### Quote Card Amendments
Chat amends the quote text/speaker/context fields. After text update, server re-renders the card using `renderQuoteCards()` from the existing pipeline and stores the new image.

## Pipeline Integration

### Writing to Database
Modify `scripts/lib/repurpose/content-writer.ts` to add a `writeToDatabase()` function:
1. Insert into `repurposedEpisodes` (upsert on episodeSlug)
2. Insert into `repurposedContent` for each content piece (blog, 4 social, quote cards)
3. All content starts as `pending`, version 1
4. Continue writing to filesystem as backup

### Approval Workflow
- Individual content pieces: pending $†’ approved / rejected / amended
- Episode status: `pending` (any content pending), `partial` (some approved, some not), `approved` (all approved)
- Episode status auto-updates when child content statuses change

## Server Actions $€” `src/app/admin/(dashboard)/content/repurposed/actions.ts`

- `getEpisodes(filter?)` $€” list episodes with content counts
- `getEpisodeDetail(episodeId)` $€” episode + all content pieces + latest chat messages
- `approveContent(contentId)` $€” set status to approved, update episode status
- `rejectContent(contentId)` $€” set status to rejected
- `approveAllContent(episodeId)` $€” approve all pending content for an episode
- `getChatHistory(contentId)` $€” all messages for a content piece

## API Route $€” `/api/admin/content/chat/route.ts`

POST handler:
- Auth check via `isAuthenticated()`
- Body: `{ contentId: number, message: string }`
- Loads content + chat history from DB
- Streams Claude Sonnet response
- On completion: saves messages + new content version
- Returns SSE stream

## Styling
- Follow existing admin dashboard design: `bg-background-elevated border border-white/5 rounded-xl`
- Status badges: pending (amber), approved (green), rejected (red), amended (blue)
- Chat panel: darker background, message bubbles (user right-aligned, assistant left-aligned)
- Coral accent (#F16363) for primary actions

## Scope Exclusions
- No "publish" button (copying approved blog to content/blog/ is future work)
- No automated pipeline trigger from UI (use CLI for now)
- No real-time collaboration (one user at a time is fine)
- No undo/version rollback UI (versions stored but no UI to browse history)
