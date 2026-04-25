# Ask Roadman + Saved Diagnostics $€” MVP Design

**Date:** 2026-04-24
**Author:** Claude (for Anthony)
**Status:** Proposed
**Depends on:** PR #76 (merged as `747884c`) $€” MCP server, pgvector, episode/methodology embeddings

## 1. Summary

Build an "Ask Roadman" chat surface on roadmancycling.com that answers cyclist questions using Roadman's own podcast archive, methodology, and coaching content $€” plus upgrade three diagnostic tools (Plateau Diagnostic, In-Ride Fuelling, FTP Zones) so their saved results feed both the rider profile and Ask Roadman's context.

The MVP unifies five moving parts that already partially exist:

1. **Ask Roadman chat** (new) $€” `/ask` page, streaming API, RAG over the MCP layer PR #76 shipped.
2. **Saved Diagnostics** $€” Plateau Diagnostic already exists (`src/lib/diagnostic/`); fuelling calculator and FTP zone calculator get built/upgraded to the same "save + email + CRM tag" pattern.
3. **Shared rider profile** $€” a single `rider_profiles` record per email, linked to the existing `contacts` row, holding discipline / hours / FTP / goal / limiter / consent / history pointers.
4. **Shared content corpus** $€” extend PR #76's vector store with a generic `content_chunks` table so articles, guides, tool pages, FAQs, case studies are retrievable alongside episodes and methodology principles.
5. **Admin + analytics** $€” reuse `src/app/admin/` shell, add a `/admin/ask` surface for chat review, and a `/admin/corpus` surface for ingestion audit. Analytics events fire to the existing `events` table via `trackAnalyticsEvent`.

## 2. Recommended technical architecture

```
$”Œ$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”
$”$                     roadmancycling.com (Next.js 16)                  $”$
$”$                                                                      $”$
$”$  /ask                  /diagnostic             /tools/fuelling       $”$
$”$  $”Œ$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”          $”Œ$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”         $”Œ$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”      $”$
$”$  $”$AskShell  $”$          $”$PlateauForm  $”$         $”$FuellingCalc  $”$      $”$
$”$  $”$+stream   $”$          $”$+save+email  $”$         $”$+save+email   $”$      $”$
$”$  $””$”€$”€$”€$”€$”$$”€$”€$”€$”€$”€$”˜          $””$”€$”€$”€$”€$”€$”€$”$$”€$”€$”€$”€$”€$”€$”˜         $””$”€$”€$”€$”€$”€$”€$”$$”€$”€$”€$”€$”€$”€$”€$”˜      $”$
$”$       $”$                       $”$                       $”$              $”$
$”$       $–¼                       $–¼                       $–¼              $”$
$”$  /api/ask (stream)   /api/diagnostic/submit   /api/tools/*/save      $”$
$”$       $”$                       $”$                       $”$              $”$
$”$       $–¼                       $””$”€$”€$”€$”€$”€$”€$”€$”€$”$$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”˜              $”$
$”$  $”Œ$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”                     $–¼                             $”$
$”$  $”$ask-orchestrator$”$          rider-profile.upsert()                  $”$
$”$  $”$ (server-only)  $”$$—„$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”                                $”$
$”$  $””$”€$”€$”€$”€$”€$”€$”$$”€$”€$”€$”€$”€$”€$”€$”€$”€$”˜                 $”$ load saved profile             $”$
$”$         $”$                           $”$ on /ask load                   $”$
$”$         $–¼                           $”$                                $”$
$”$  retrieval.search(query, filters) $”€$”€$”˜                                $”$
$”$   $”œ$”€$”€ search_episodes (existing)                                     $”$
$”$   $”œ$”€$”€ search_methodology (existing)                                  $”$
$”$   $”œ$”€$”€ search_content_chunks (NEW) $”€$”€$”€$”€ articles/guides/FAQs/tools   $”$
$”$   $”œ$”€$”€ get_expert_insights (existing)                                 $”$
$”$   $”œ$”€$”€ list_products (existing)                                       $”$
$”$   $””$”€$”€ recommend_cta (NEW) $”€$”€ maps intent $†’ Roadman surface           $”$
$”$                                                                      $”$
$”$  claude-3-5-sonnet / claude-opus-4 (Anthropic SDK)                   $”$
$”$   $”œ$”€$”€ system prompt = Ask Roadman persona + safety                   $”$
$”$   $”œ$”€$”€ context = retrieved chunks + saved profile + diagnostic state  $”$
$”$   $”œ$”€$”€ tools exposed to model = retrieval fns above                   $”$
$”$   $””$”€$”€ streaming response with inline citations                       $”$
$”$                                                                      $”$
$”$  ask_sessions, ask_messages, ask_retrievals (NEW tables)             $”$
$”$  rider_profiles (NEW table, FK to contacts)                          $”$
$”$  content_sources + content_chunks (NEW tables, vector(1024))         $”$
$””$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”˜
```

### Key boundaries

- **UI layer** (`src/app/(marketing)/ask/`, `src/app/tools/*`) $€” client components for chat + diagnostic forms, server components for layout. No business logic; calls API routes only.
- **API layer** (`src/app/api/ask/`, `src/app/api/diagnostic/*`, `src/app/api/tools/*`) $€” thin request/response adapters. Rate-limits, auth, validation, streams.
- **Orchestration layer** (`src/lib/ask/`) $€” pure server-only module. Receives `{query, profile, sessionHistory}`, decides retrieval, calls Claude, streams result. Testable in isolation.
- **Retrieval layer** (`src/lib/ask/retrieval/`) $€” one function per source type. Episodes + methodology reuse PR #76 services verbatim; content_chunks is new.
- **Data layer** (`src/lib/db/schema.ts` + `src/lib/rider-profile/`, `src/lib/ask/store.ts`, `src/lib/corpus/`) $€” Drizzle queries, no HTTP, no Claude.
- **Ingestion layer** (`agents/corpus-indexer/` or extend `agents/transcript-indexer/`) $€” reads MDX + structured content, chunks, embeds, upserts `content_chunks`.

## 3. Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 16 App Router (already in repo) | Matches repo. **AGENTS.md says read `node_modules/next/dist/docs/` before writing code** $€” breaking changes from earlier Next. |
| Language | TypeScript 5 (already in repo) | Matches repo |
| UI | React 19 + Tailwind v4 + framer-motion (already in repo) | Matches repo and brand palette already wired |
| LLM | `@anthropic-ai/sdk` v0.82 $€” claude-opus-4-7 for primary answers, claude-haiku-4-5 for intent classification / cheap classification | Already installed. Opus for quality on main answer, Haiku for intent/cta routing to keep cost/latency sane. |
| Streaming | Server-Sent Events via Next App Router `Response` with `ReadableStream` (Anthropic SDK `.stream()`) | Standard for chat; avoids websockets |
| Embeddings | Voyage `voyage-3-large` (1024 dim) $€” already wired via `src/lib/mcp/embeddings.ts` | Use the provider already in use; do not mix dimensions |
| Vector DB | Postgres + pgvector on Vercel Postgres (already enabled) | PR #76 already installed extension |
| Rate limiting | `@upstash/ratelimit` sliding window (already installed for MCP) | Consistent with MCP rate limiter |
| Auth | next-auth v5 beta (already in repo) + email-magic-link for logged-in tier | Already wired for admin; extend to public |
| Email | Resend (already wired) | For diagnostic result emails + optional save-answer emails |
| Admin | Existing `/admin` shell with `isAnthony()` guard + email allowlist | Don't build a second admin |
| Analytics | Existing `events` table + `trackAnalyticsEvent` helper | Don't build a second analytics pipe |
| Testing | vitest + playwright (already in repo), test DB via local Postgres | Matches repo |

## 4. Data model

All new tables use `ask_` or `rider_` or `content_` prefix to avoid colliding with existing conventions.

```sql
-- Migration 0028_ask_roadman_and_rider_profiles.sql

-- $”€$”€ Rider profile $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
CREATE TABLE "rider_profiles" (
  "id" serial PRIMARY KEY,
  "contact_id" integer UNIQUE REFERENCES "contacts"("id") ON DELETE CASCADE,
  "email" text NOT NULL UNIQUE,
  "first_name" text,
  "age_range" text,                    -- under_35 | 35_44 | 45_54 | 55_plus
  "discipline" text,                   -- road | gravel | triathlon | endurance | masters | other
  "weekly_training_hours" integer,
  "current_ftp" integer,
  "weight_kg" numeric(5,2),            -- optional, treated sensitively
  "main_goal" text,
  "target_event" text,
  "target_event_date" date,
  "biggest_limiter" text,
  "uses_power_meter" boolean,
  "current_training_tool" text,        -- trainerroad | zwift | trainingpeaks | strava | coach | self | other
  "coaching_interest" text,            -- none | curious | interested | ready
  "consent_save_profile" boolean NOT NULL DEFAULT false,
  "consent_email_followup" boolean NOT NULL DEFAULT false,
  "consent_recorded_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "rider_profiles_email_idx" ON "rider_profiles" ("email");
CREATE INDEX "rider_profiles_contact_id_idx" ON "rider_profiles" ("contact_id");

-- $”€$”€ Ask Roadman sessions $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
CREATE TABLE "ask_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "rider_profile_id" integer REFERENCES "rider_profiles"("id") ON DELETE SET NULL,
  "anon_session_key" text,              -- cookie-bound for anon users
  "started_at" timestamptz NOT NULL DEFAULT now(),
  "last_activity_at" timestamptz NOT NULL DEFAULT now(),
  "message_count" integer NOT NULL DEFAULT 0,
  "ip_hash" text,
  "user_agent" text,
  "utm_source" text,
  "utm_campaign" text
);
CREATE INDEX "ask_sessions_rider_profile_id_idx" ON "ask_sessions" ("rider_profile_id");
CREATE INDEX "ask_sessions_anon_session_key_idx" ON "ask_sessions" ("anon_session_key");
CREATE INDEX "ask_sessions_last_activity_at_idx" ON "ask_sessions" ("last_activity_at");

-- $”€$”€ Ask Roadman messages $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
CREATE TABLE "ask_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" uuid NOT NULL REFERENCES "ask_sessions"("id") ON DELETE CASCADE,
  "role" text NOT NULL,                 -- user | assistant | system
  "content" text NOT NULL,
  "retrieval_ids" uuid[],               -- FK list into ask_retrievals
  "citations" jsonb,                    -- [{type, source_id, title, url, excerpt}]
  "cta_recommended" text,               -- e.g. 'plateau_diagnostic' | 'fuelling_calculator' | ...
  "safety_flags" text[],                -- e.g. ['medical_escalation','low_confidence']
  "confidence" text,                    -- high | medium | low
  "model" text,                         -- claude-opus-4-7 etc.
  "input_tokens" integer,
  "output_tokens" integer,
  "latency_ms" integer,
  "flagged_for_review" boolean NOT NULL DEFAULT false,
  "admin_note" text,
  "admin_preferred_answer" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "ask_messages_session_id_idx" ON "ask_messages" ("session_id");
CREATE INDEX "ask_messages_created_at_idx" ON "ask_messages" ("created_at");
CREATE INDEX "ask_messages_flagged_idx" ON "ask_messages" ("flagged_for_review") WHERE flagged_for_review;

-- $”€$”€ Retrieval trace per assistant message $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
CREATE TABLE "ask_retrievals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL REFERENCES "ask_messages"("id") ON DELETE CASCADE,
  "source_type" text NOT NULL,          -- episode | methodology | content_chunk | expert_quote
  "source_id" text NOT NULL,            -- stringified numeric or slug
  "chunk_text" text,
  "score" numeric(6,4),
  "used_in_answer" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "ask_retrievals_message_id_idx" ON "ask_retrievals" ("message_id");

-- $”€$”€ Generic content corpus (articles, guides, tools, FAQs) $”€$”€
CREATE TABLE "content_sources" (
  "id" serial PRIMARY KEY,
  "slug" text UNIQUE NOT NULL,
  "url" text NOT NULL,
  "title" text NOT NULL,
  "content_type" text NOT NULL,         -- article | guide | tool_page | coaching_page | faq | case_study | research_page | editorial_standard
  "author" text,
  "expert" text,
  "discipline" text,                    -- nullable, same taxonomy as rider_profiles.discipline
  "rider_level" text,                   -- beginner | intermediate | advanced | racer | masters
  "topic_tags" text[],
  "related_product" text,               -- newsletter | clubhouse | roadman_plus | ndy | vip | tool:plateau | tool:fuelling | tool:ftp
  "safety_sensitivity" text NOT NULL DEFAULT 'normal', -- normal | nutrition | injury | weight | medical | recovery
  "published_at" timestamptz,
  "last_reviewed_at" timestamptz,
  "source_hash" text,                   -- sha256 of raw content to detect changes
  "is_indexed" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "content_sources_content_type_idx" ON "content_sources" ("content_type");
CREATE INDEX "content_sources_topic_tags_gin" ON "content_sources" USING GIN ("topic_tags");

CREATE TABLE "content_chunks" (
  "id" serial PRIMARY KEY,
  "source_id" integer NOT NULL REFERENCES "content_sources"("id") ON DELETE CASCADE,
  "chunk_index" integer NOT NULL,
  "chunk_text" text NOT NULL,
  "heading_path" text,                  -- "Nutrition > Carbohydrate > In-ride"
  "embedding" vector(1024)
);
CREATE INDEX "content_chunks_source_id_idx" ON "content_chunks" ("source_id");
-- IVFFlat index added after initial bulk ingest:
-- CREATE INDEX content_chunks_embedding_ivfflat ON content_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists=100);

-- $”€$”€ Saved Diagnostic Results (fuelling + FTP zones) $”€$”€$”€$”€$”€$”€
CREATE TABLE "fuelling_submissions" (
  "id" serial PRIMARY KEY,
  "slug" text NOT NULL UNIQUE,
  "email" text NOT NULL,
  "rider_profile_id" integer REFERENCES "rider_profiles"("id") ON DELETE SET NULL,
  "duration_min" integer NOT NULL,
  "intensity" text NOT NULL,            -- endurance | tempo | threshold | race
  "weight_kg" numeric(5,2),
  "target_carbs_g_per_hr" integer,
  "total_carbs_g" integer,
  "fluid_ml_per_hr" integer,
  "sodium_mg_per_hr" integer,
  "breakdown" jsonb NOT NULL,
  "utm_source" text, "utm_medium" text, "utm_campaign" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "fuelling_submissions_email_idx" ON "fuelling_submissions" ("email");

CREATE TABLE "ftp_zone_submissions" (
  "id" serial PRIMARY KEY,
  "slug" text NOT NULL UNIQUE,
  "email" text NOT NULL,
  "rider_profile_id" integer REFERENCES "rider_profiles"("id") ON DELETE SET NULL,
  "ftp" integer NOT NULL,
  "method" text,                         -- test | estimate | threshold_hr | power_profile
  "zones" jsonb NOT NULL,                -- [{zone, label, low, high, pct_ftp_low, pct_ftp_high}]
  "breakdown" jsonb NOT NULL,
  "utm_source" text, "utm_medium" text, "utm_campaign" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "ftp_zone_submissions_email_idx" ON "ftp_zone_submissions" ("email");
```

### Relationships

- `contacts.email == rider_profiles.email` $€” profile is the enriched, rider-domain view; contact row stays the CRM truth.
- `diagnostic_submissions` (existing Plateau), `fuelling_submissions`, `ftp_zone_submissions` each carry `email` so we can backfill `rider_profile_id` later and the existing Plateau table doesn't need restructuring.
- `ask_sessions.rider_profile_id` is nullable $€” anon sessions are cookie-bound via `anon_session_key`; they upgrade to profile-bound when an email is captured.
- `ask_messages.retrieval_ids` gives us forensic trace: every assistant message links to the exact chunks retrieved, used in the admin review surface and in CTA-click attribution.

### Consent and sensitive fields

- `weight_kg` is optional on rider_profiles and fuelling_submissions. Never required. Never displayed back to the user outside "your saved data" surfaces.
- `consent_save_profile` + `consent_email_followup` explicit booleans with a `consent_recorded_at` timestamp (GDPR-grade audit trail).
- The Plateau Diagnostic already captures consent via the beehiiv subscribe step $€” mirror that pattern for fuelling + FTP.

## 5. API structure

All routes are App Router handlers under `src/app/api/$€¦/route.ts`.

### Ask Roadman

```
POST   /api/ask                  $€” start a message (streams SSE)
GET    /api/ask/session          $€” load current session (cookie-bound)
POST   /api/ask/session/email    $€” capture email + upgrade anon $†’ profile
POST   /api/ask/feedback         $€” thumbs up/down on a message
POST   /api/ask/cta-click        $€” log a CTA click tied to a message
```

Request shape (`POST /api/ask`):
```ts
{ session_id?: string, query: string, locale?: string }
```
Response: SSE with events: `meta` (session_id, message_id, retrieval summary), `delta` (token chunks), `citation` (one per source as Claude emits tool_use), `cta` (recommended CTA), `done`.

### Diagnostics

```
POST   /api/diagnostic/submit       $€” existing plateau flow (no change)
POST   /api/tools/fuelling/save     $€” new
POST   /api/tools/ftp-zones/save    $€” new
GET    /api/tools/fuelling/:slug    $€” public result page
GET    /api/tools/ftp-zones/:slug   $€” public result page
```

All three save-endpoints:
- Validate input with Zod
- Rate-limit by IP (Upstash, 5/min)
- Upsert `rider_profiles` by email
- Insert `*_submissions` row with slug
- Log `contact_activity` entry
- Enqueue Resend email (transactional, with "View in Ask Roadman" deep link)
- Fire analytics event `tool_completed` + `diagnostic_saved`

### Admin

```
GET    /api/admin/ask/messages      $€” recent/flagged messages
POST   /api/admin/ask/flag          $€” toggle flagged_for_review
POST   /api/admin/ask/preferred     $€” set admin_preferred_answer
GET    /api/admin/corpus/sources    $€” list sources, indexing status
POST   /api/admin/corpus/reindex    $€” trigger re-embed of a slug
```

All admin routes behind existing `isAnthony()` + allowlist guard.

### Rate limiting

| Endpoint | Anon | Logged-in | Roadman+ (future) |
|----------|------|-----------|-------------------|
| `/api/ask` | 5 / 10 min, 10 / day | 30 / hour | 200 / day |
| `/api/tools/*/save` | 5 / min | 5 / min | 5 / min |
| `/api/ask/feedback` | 30 / min | 30 / min | 30 / min |

Limits bounded by `anon_session_key` cookie OR `email` OR `ip_hash` (whichever highest-signal is available).

## 6. Front-end components

### New: `/ask` page

```
src/app/(marketing)/ask/
$”œ$”€$”€ page.tsx                       $€” RSC shell, loads session (if cookie) and profile (if logged in)
$”œ$”€$”€ AskRoadmanClient.tsx           $€” top-level client component, owns chat state
$”œ$”€$”€ AskShell.tsx                   $€” dark charcoal + purple background, Bebas Neue header
$”œ$”€$”€ StarterPrompts.tsx             $€” 6 coral-accented chips (Diagnose my plateau / Fuel a long ride / etc.)
$”œ$”€$”€ MessageList.tsx                $€” assistant + user bubbles, Work Sans body, coral accent on CTAs
$”œ$”€$”€ StreamingMessage.tsx           $€” renders SSE delta tokens + inline citation pills
$”œ$”€$”€ CitationCard.tsx               $€” episode/article preview with cover art + "Listen" / "Read" CTA
$”œ$”€$”€ CtaCard.tsx                    $€” the contextual Roadman-product recommendation
$”œ$”€$”€ EmailCapturePrompt.tsx         $€” shown after N messages; coral CTA
$”œ$”€$”€ SafetyBanner.tsx               $€” appears on medical/injury-sensitive flags
$”œ$”€$”€ SavedContextChip.tsx           $€” "Using your saved Plateau Diagnostic ( 2026-04-15 )" banner
$””$”€$”€ styles.module.css              $€” chat-specific polish only
```

Visual direction: dark charcoal `#252526` background, deep-purple `#210140` on message bubbles, coral `#F16363` on CTAs and user bubbles, Bebas Neue for section headers, Work Sans for body. Matches the "premium, not generic embedded chatbot" requirement and the existing brand palette.

Suggested starter prompts (fixed for MVP):

1. **Diagnose my cycling plateau** $†’ deep-links with intent=plateau, routes to Plateau Diagnostic CTA
2. **Help me fuel a long ride** $†’ intent=fuelling, routes to In-Ride Fuelling Calculator CTA
3. **Find Roadman episodes on Zone 2** $†’ intent=content_discovery, shows top 3 matching episodes
4. **I'm over 40 and not recovering well** $†’ intent=recovery_masters, routes to masters hub + NDY
5. **Help me prepare for an event** $†’ intent=event_prep, asks for event + date
6. **Should I get a coach?** $†’ intent=coaching_decision, routes to qualify_lead tool + NDY

### New: tool result pages + upgraded forms

```
src/app/(marketing)/tools/
$”œ$”€$”€ fuelling/
$”$   $”œ$”€$”€ page.tsx                   $€” calculator form (client)
$”$   $”œ$”€$”€ [slug]/page.tsx            $€” saved result (server, public)
$”$   $””$”€$”€ FuellingCalculator.tsx
$”œ$”€$”€ ftp-zones/
$”$   $”œ$”€$”€ page.tsx
$”$   $”œ$”€$”€ [slug]/page.tsx
$”$   $””$”€$”€ FtpZoneCalculator.tsx
```

Plateau Diagnostic already at `/diagnostic` (existing). We are not redesigning it $€” we wire up its saved results into rider_profiles + Ask Roadman context.

### New: admin surfaces

```
src/app/admin/(dashboard)/ask/
$”œ$”€$”€ page.tsx                       $€” list view: recent questions, filters (flagged, low-confidence, topic)
$”œ$”€$”€ [id]/page.tsx                  $€” single conversation + retrieval trace + preferred answer editor
$”œ$”€$”€ topics/page.tsx                $€” top questions by cluster
$””$”€$”€ corpus/page.tsx                $€” content source list + reindex buttons
```

## 7. Backend services

```
src/lib/ask/
$”œ$”€$”€ orchestrator.ts                $€” main server-only entry. streamAnswer({query, session, profile}).
$”œ$”€$”€ system-prompt.ts               $€” the Ask Roadman system prompt (exported, testable, version-tagged)
$”œ$”€$”€ safety.ts                      $€” isMedicalEscalation(), extractSafetyFlags(), injectSafetyBanner()
$”œ$”€$”€ intent.ts                      $€” classifyIntent(query) via Haiku $€” returns {intent, confidence}
$”œ$”€$”€ retrieval/
$”$   $”œ$”€$”€ index.ts                   $€” retrieve({query, intent, profile}) $†’ RetrievalResult
$”$   $”œ$”€$”€ episodes.ts                $€” wraps searchEpisodes from src/lib/mcp/services
$”$   $”œ$”€$”€ methodology.ts             $€” wraps searchMethodology
$”$   $”œ$”€$”€ content-chunks.ts          $€” NEW: vector search over content_chunks
$”$   $”œ$”€$”€ experts.ts                 $€” wraps getExpertInsights
$”$   $””$”€$”€ products.ts                $€” wraps listProducts (for CTA routing)
$”œ$”€$”€ cta.ts                         $€” intent Ã— profile Ã— retrieved context $†’ single CTA descriptor
$”œ$”€$”€ store.ts                       $€” DB read/write for ask_sessions + ask_messages + ask_retrievals
$”œ$”€$”€ rate-limit.ts                  $€” Upstash wrapper, tier-aware
$””$”€$”€ stream.ts                      $€” SSE encoder + Anthropic stream bridge

src/lib/rider-profile/
$”œ$”€$”€ upsert.ts                      $€” upsertByEmail({email, patch, consent}) + log activity
$”œ$”€$”€ load.ts                        $€” loadByEmailOrAnon(sessionKey | email)
$””$”€$”€ enrich-from-submissions.ts     $€” pulls latest plateau/fuelling/ftp snapshots into profile context

src/lib/corpus/
$”œ$”€$”€ ingest.ts                      $€” scan MDX + structured sources, chunk, embed, upsert
$”œ$”€$”€ chunker.ts                     $€” heading-aware chunking (~1200 tokens, 150 overlap)
$”œ$”€$”€ sources/
$”$   $”œ$”€$”€ mdx-articles.ts            $€” reads src/content/**/*.mdx via existing blog.ts loader
$”$   $”œ$”€$”€ tool-pages.ts              $€” coded list of tool page URLs + descriptions
$”$   $”œ$”€$”€ coaching-pages.ts          $€” (marketing)/coaching/*, /ndy/*
$”$   $”œ$”€$”€ faqs.ts                    $€” pulls FAQ sections out of MDX front-matter
$”$   $””$”€$”€ case-studies.ts            $€” existing testimonials.ts
$””$”€$”€ reindex.ts                     $€” one slug at a time, idempotent via source_hash

src/lib/tools/
$”œ$”€$”€ fuelling/
$”$   $”œ$”€$”€ calculator.ts              $€” pure fn: inputs $†’ {carbs_g_per_hr, fluid_ml_per_hr, sodium_mg_per_hr, breakdown}
$”$   $”œ$”€$”€ email.ts                   $€” Resend template
$”$   $””$”€$”€ store.ts                   $€” insert fuelling_submissions
$””$”€$”€ ftp-zones/
    $”œ$”€$”€ calculator.ts              $€” pure fn: ftp + method $†’ zones[]
    $”œ$”€$”€ email.ts
    $””$”€$”€ store.ts

src/lib/analytics/
$””$”€$”€ ask-events.ts                  $€” typed wrapper around trackAnalyticsEvent for the ~15 event types
```

### Orchestrator flow (server-only, per message)

```ts
streamAnswer({ query, sessionId, profile }) {
  1. rateLimitOrThrow(sessionId, profile)
  2. intent = await classifyIntent(query)              // Haiku, ~200ms
  3. safety = detectSafetyFlags(query, intent)
     if (safety.block) return blockedResponse(safety)
  4. context = await buildContext({ profile, intent, query })
     // profile summary + latest plateau/fuelling/ftp if saved
  5. retrieval = await retrieve({ query, intent, profile })
     // parallel: episodes, methodology, content_chunks, experts
  6. cta = pickCta({ intent, retrieval, profile, safety })
  7. stream = anthropic.messages.stream({
       model: intent.deep ? 'claude-opus-4-7' : 'claude-haiku-4-5-20251001',
       system: systemPrompt(safety, profile, cta),
       messages: [...sessionHistory, { role: 'user', content: query }],
       max_tokens: intent.deep ? 2000 : 1000,
     })
  8. persist(message, retrieval, cta) as stream completes
  9. fire analytics(ask_roadman_answer_generated) with confidence + cta
}
```

### Safety layer

Implemented as a hard pre-filter + a soft post-filter:

- **Pre-filter** (`safety.ts`): regex + Haiku call for "medical / injury / weight / suicidal / underage". On a hit:
  - Medical symptom queries ("chest pain while riding") $†’ immediate escalation response, no RAG, log as `safety_flag=medical_escalation`
  - Eating-disorder / extreme weight loss $†’ escalation to registered dietitian response
  - Injury rehab prescriptions $†’ "speak to a physio" response
  - These responses use a fixed template, bypass the model for the unsafe portion, and still offer a helpful Roadman link where safe (e.g. masters recovery content for general recovery questions).
- **System prompt** embeds the seven explicit "Never" rules verbatim.
- **Post-filter**: scan output for invented-source patterns (episode titles not in retrieval, guest names not in experts table). If found, strip the citation, set `confidence=low`, `flagged_for_review=true`.

## 8. RAG approach

### Corpus coverage at MVP launch

| Source type | Where from | Rows expected | Status |
|-------------|-----------|---------------|--------|
| Podcast transcripts | `mcp_episodes` + `mcp_episode_embeddings` | ~300 episodes | Ready (PR #76) |
| Methodology principles | `mcp_methodology_principles` + `mcp_methodology_embeddings` | ~30 | Ready (PR #76, seed needed) |
| Expert quotes | `mcp_expert_quotes` (exact match, not vector) | ~200 | Ready (PR #76, seed needed) |
| MDX articles/pillars | `content_chunks` via `src/lib/blog.ts` + chunker | ~200 sources, ~2-4k chunks | NEW |
| Tool pages | `content_chunks`, hand-authored stub content | ~10 | NEW |
| Coaching pages (coaching, NDY, VIP) | `content_chunks` | ~15 | NEW |
| FAQs | `content_chunks`, extracted from MDX front-matter | ~50 | NEW |
| Case studies / testimonials | `content_chunks` via `src/lib/testimonials.ts` | ~30 | NEW |
| Editorial standards + research pages | `content_chunks` | ~10 | NEW |
| Products (for CTAs) | `mcp_products` (structured, not vector) | ~10 | Ready (PR #76, seed needed) |
| Events | `roadman_events` (structured, not vector) | ~10 | Ready (PR #76, seed needed) |

### Chunking

- Heading-aware: split on h2/h3 from MDX AST; fall back to ~1200-token chunks with 150-token overlap.
- Preserve `heading_path` (`"Nutrition > Carbohydrate > In-ride"`) for display in citations.
- Store `source_hash` so re-embedding only triggers on real changes.
- Episode transcripts already chunked by PR #76 $€” don't re-chunk.

### Retrieval strategy

Parallel fan-out per query, merged + re-ranked:

1. `search_content_chunks(query, filters={type in ['article','guide','tool_page','faq','case_study']}, limit=8)`
2. `search_episodes(query, limit=4)`
3. `search_methodology(query, limit=4)`
4. `get_expert_insights(...)` $€” only when intent=expert_quote or methodology-heavy

Merge: normalize cosine scores per source, MMR (Î»=0.5) to diversify, cap at 10 total.

Give the model the 10 chunks as a structured `<context>` block with explicit `<source id="ep:2132" type="episode">...` tags. Model is instructed to cite only the IDs it used.

### When RAG is intentionally bypassed

- Rider profile Q&A ("what's my FTP?") $†’ pulled from saved profile, not RAG
- CTA routing questions ("should I get a coach?") $†’ calls existing `qualifyLead` MCP service + formats reply; RAG supplements
- Safety escalations $†’ fixed template, no model call on unsafe portion
- Pure "find episodes on X" requests $†’ return structured list of top-K episodes, light model wrap

## 9. CRM integration

All already-wired:

- `rider_profiles.contact_id` $†’ `contacts.id`
- Tool completion inserts `contact_activities` row: `type=tool_completed, title='Completed Fuelling Calculator', meta={slug, carbs_g_per_hr, duration_min}`
- Ask Roadman email capture inserts `contact_activities` row: `type=ask_roadman_email_captured`
- CTA clicks insert `type=cta_clicked, meta={cta_key, ask_message_id}` so CRM segments can target "clicked coaching CTA but didn't apply"
- CRM tags applied on profile upsert:
  - `ask_user`
  - `plateau_profile_{primaryProfile}` (e.g. `plateau_profile_under-recovered`)
  - `discipline_{x}`, `age_{x}`, `hours_{x}`
  - `coaching_interest_{ready|interested|curious|none}`
- Consent for email followup adds the contact to Beehiiv (existing Plateau Diagnostic already does this $€” use the same `src/lib/crm/sync.ts`).

## 10. Admin dashboard plan

Single new section at `/admin/ask`, styled to match the existing `/admin` shell.

### Views

| Path | Purpose |
|------|---------|
| `/admin/ask` | List: recent questions, columns (time, user, intent, confidence, CTA, flagged). Filter chips: "Flagged", "Low-confidence", "No citations". |
| `/admin/ask/[id]` | Single conversation. Shows: session history, retrieval trace (which chunks with scores), model metadata, Anthony's notes, preferred-answer editor (future fine-tune seed). |
| `/admin/ask/topics` | Auto-clustered: runs a weekly cron that groups `ask_messages.content` (user role) by nearest-centroid over their embeddings. Surfaces: top 20 topics, # questions, % flagged, % converted-to-cta-click. |
| `/admin/ask/corpus` | Content sources table. Columns: slug, type, is_indexed, chunks, last_reviewed_at, "Reindex" button. |
| `/admin/ask/metrics` | Lightweight recharts panel: 7/30-day question volume, avg confidence, CTA click-through, email capture rate. Deeper metrics stay in GA4. |

### Admin actions

- Flag a message $†’ sets `flagged_for_review=true`
- Write a preferred answer $†’ stored on `admin_preferred_answer`; surfaced to Anthony in the review view only (not auto-served to users in MVP)
- "Reindex this source" $†’ enqueues job, updates `content_sources.is_indexed`
- Export $†’ CSV of `ask_messages` with filter applied

## 11. Privacy and consent plan

- **Anonymous users**: `anon_session_key` cookie (httpOnly, secure, sameSite=lax, 90-day). Sessions/messages stored keyed only by that cookie; IP stored only as SHA-256 hash for abuse detection.
- **Email capture**: an explicit CTA after 3 successful messages OR on user-initiated "save answer." Requires:
  - email
  - checkbox: "Save my questions + profile to improve my answers" $†’ `consent_save_profile`
  - checkbox: "Send me Roadman's weekly newsletter + follow-ups" $†’ `consent_email_followup`
  - Disclosure: "You can delete your data anytime at /account/delete."
- **Rider profile visibility**: only the owner can view; admin can only view aggregate analytics, never per-user PII outside `/admin/ask/[id]` (which is allowlisted).
- **Data retention**: anon sessions auto-purged after 90 days idle. Profiles retained until user deletes.
- **/account/delete**: a POST endpoint that cascade-deletes `rider_profiles` + `ask_sessions` + `*_submissions` by email. Kept simple for MVP.
- **Weight handling**: `weight_kg` optional, never displayed in chat answers, never used in model system prompt unless the user explicitly references it in the current turn.
- **Medical / sensitive topics**: never logged in model system prompt; the full message is stored in `ask_messages.content` for review, but the retrieval context omits the sensitive phrase.

## 12. Build phases

Each phase ends in a shippable, testable state. We DO NOT move to the next phase until the current one is green in production.

### Phase 0 $€” Foundations (half day)
- [x] Merge PR #76 (done)
- Seed MCP tables (`seed:mcp:community-stats`, `seed:mcp:content`, `seed:mcp:products`, `seed:mcp:events`) with real data from brand skill
- Run `db:migrate` for migration 0028
- Set env vars (`ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, `UPSTASH_REDIS_REST_URL/TOKEN` if not already set)

### Phase 1 $€” Ask Roadman thin slice (2-3 days)
- `rider_profiles` + `ask_sessions/messages/retrievals` tables
- `src/lib/ask/{orchestrator, system-prompt, retrieval, cta, store, safety, rate-limit, stream}.ts`
- `/api/ask` + `/api/ask/session` routes with SSE streaming
- `/ask` page with starter prompts, message list, streaming, citation cards, CTA card
- Safety pre-filter + post-filter
- Analytics events for `ask_roadman_opened`, `ask_roadman_question_asked`, `ask_roadman_answer_generated`, `source_clicked`, `cta_clicked`
- Manual QA on 20 sample questions covering: plateau / fuelling / zone 2 / masters recovery / event prep / coaching decision / safety (chest pain, injury, weight loss)

**Gate to phase 2:** the 20 sample questions return grounded, cited, on-brand answers with correct safety handling.

### Phase 2 $€” Saved Diagnostics upgrade (2-3 days)
- `fuelling_submissions` + `ftp_zone_submissions` tables
- `src/lib/tools/fuelling/` + `src/lib/tools/ftp-zones/`
- `/tools/fuelling` + `/tools/ftp-zones` forms with save flow
- `/tools/fuelling/[slug]` + `/tools/ftp-zones/[slug]` public result pages
- Resend email templates (reuse `src/lib/diagnostic/email.ts` pattern)
- Rider profile auto-upsert on each tool save
- CRM tags applied
- Plateau Diagnostic: no code change, but wire up `rider_profile_id` backfill

### Phase 3 $€” Profile + diagnostic handoff (1-2 days)
- `src/lib/rider-profile/` module
- `/ask` page loads saved profile into session context (if cookie matches)
- Ask Roadman uses latest Plateau / Fuelling / FTP results in its context block
- `SavedContextChip` shown on `/ask` when profile is attached
- `/api/ask/session/email` endpoint: captures email, upgrades anon session $†’ profile-bound

### Phase 4 $€” Corpus expansion (2-3 days)
- `content_sources` + `content_chunks` tables
- `src/lib/corpus/` ingestion
- `scripts/ingest-corpus.ts` one-shot; `agents/corpus-indexer/` for incremental
- Index articles, tool pages, coaching pages, FAQs, case studies
- Update orchestrator retrieval to fan out to `content_chunks`
- Re-run 20-question QA $€” we expect materially better answers for "how do I fuel a 4-hour ride?" now

### Phase 5 $€” Admin + analytics depth (2 days)
- `/admin/ask/*` surfaces
- Topic clustering cron
- Metrics dashboard

### Phase 6 $€” Roadman+ tier shell (0.5-1 day, no billing)
- Stub `rider_profiles.access_tier` column (`free | plus | vip`)
- Rate limiter reads tier
- Document the hook points so future billing just sets the tier

Estimated total: ~10-12 working days end-to-end for one engineer.

## 13. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Hallucinated episode titles or guest names | High in v1 | Brand damage | Post-filter citations against retrieval results; strip unknown IDs; flag_for_review=true. Fine-tune system prompt with explicit examples. |
| Safety miss on medical/injury question | Medium | Real-world harm + brand | Dual-layer: regex + Haiku pre-filter, fixed escalation response, no model call on the unsafe clause. Red-team with 30 crafted prompts before launch. |
| Embedding provider downtime (Voyage) | Low | Outage | Fallback to OpenAI provider is already wired in `embeddings.ts`. Document env flip. |
| Cost blowout from Opus usage | Medium | Margin | Route cheap intents to Haiku (intent classification, CTA routing, simple content-discovery). Cap `max_tokens`. Track cost per message in `ask_messages`. |
| Prompt injection via user query | Medium | Leaked system prompt / jailbreak | Use Anthropic's guidance: system prompt is server-only, user input goes in `messages`, never via templating into system. Guard retrieval text with `<untrusted-user-content>` tags. |
| Rate-limit abuse via rotating IPs | Low | Cost | Cookie-bound `anon_session_key` + IP hash double-check; CAPTCHA only if triggered |
| PR #76 embedding dimension mismatch if Voyage changes | Low | Vector search broken | Pin `voyage-3-large` model name. Migration 0028 reuses the same 1024-dim custom type. |
| CRM double-writes when tool saves + ask captures same email same minute | Medium | Duplicate contacts | All writes go through `upsertByEmail` which uses `contacts.email` unique constraint + `ON CONFLICT DO UPDATE`. |
| Corpus ingestion re-embedding cost | Low | One-off bill | Use `source_hash` to skip unchanged content; budget ~$30 for initial bulk embed. |
| Unmapped CTAs lead to dead ends | Medium | User bounce | `cta.ts` has a `fallback` CTA (Saturday Spin newsletter) that is always valid; every intent maps to exactly one CTA; CI-level unit test asserts exhaustive mapping. |
| Next 16 App Router pitfalls (AGENTS.md warned) | Medium | Build failures | Read `node_modules/next/dist/docs/` before each new route handler. Deprecation notices treated as blockers. |
| Streaming cut-offs on mobile networks | Medium | UX | Resume-on-reconnect via `session_id` + last-event-id; partial answer persisted as we stream. |

## 14. What's needed from Anthony before building

These are the items I'll block on $€” I cannot decide them alone.

### Must have before Phase 1

1. **Production env vars** added to Vercel: `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. (Some may already be set from PR #76 $€” I'll audit.)
2. **Cost ceiling** per month for the Anthropic API. I'll design under that ceiling. Suggested default: $300/mo for MVP.
3. **Exact product URLs + copy** for these CTAs:
   - Saturday Spin newsletter (signup URL)
   - Roadman Clubhouse (Skool free URL)
   - Roadman+ / Not Done Yet paid (Skool paid URL)
   - VIP coaching (application URL)
   - Plateau Diagnostic (`/diagnostic`, confirmed)
   - Fuelling Calculator (confirm path $€” I'll use `/tools/fuelling`)
   - FTP Zone Calculator (confirm path $€” I'll use `/tools/ftp-zones`)
   I'll use sensible defaults from the brand skill where missing.
4. **Go/no-go on data retention defaults**: anon sessions 90 days, profiles indefinite. Acceptable?

### Must have before Phase 2

5. **Fuelling calculator logic reference** $€” do you have a preferred formula/doc (Burke, Bent, Roadman house blend)? I'll default to the grams/hr-by-intensity Roadman methodology used in recent episodes unless directed otherwise.
6. **FTP zone model** $€” 7-zone Coggan or 3-zone polarised. I'll default to 7-zone Coggan with a second polarised view since that's Roadman house position.

### Must have before Phase 5

7. **Who has admin access** besides Anthony? Allowlist additions?

### Nice-to-have

8. **Testimonials/case studies cleared for public citation** $€” list in a Google Doc; I'll tag `safety_sensitivity=normal` on those, skip the rest.
9. **List of any known "never talk about X" topics** $€” sponsors in conflict, guests under embargo, etc.

I will not wait for items 4, 7, 8, 9 to start building $€” I'll pick defaults and flag them in the PR description.

## 15. Acceptance criteria (MVP v1)

Phase 1$€“5 complete and verified:

- [ ] `/ask` is live, branded, and streams answers
- [ ] Answers cite real Roadman episodes / articles / methodology with working links
- [ ] Answers route to the right Roadman surface per intent (newsletter / Clubhouse / tools / NDY / VIP)
- [ ] Safety pre-filter blocks medical/injury/extreme-weight questions with a safe escalation response
- [ ] Plateau / Fuelling / FTP zone tools save results, email them, and upsert rider profile
- [ ] Logged-in session on `/ask` uses saved profile + latest diagnostic results in model context
- [ ] `/admin/ask` shows recent questions, flagged items, retrieval trace
- [ ] Analytics events fire per the list in the spec
- [ ] Ingestion covers episodes, methodology, articles, tools, coaching, FAQs, case studies
- [ ] 20-question QA battery passes with $‰¥18 on-brand, grounded answers
- [ ] Red-team 30-prompt safety battery passes $€” zero unsafe outputs
- [ ] `rider_profiles.access_tier` column exists and is read by the rate limiter (future-proofing for Roadman+)

## 16. Out of scope for MVP v1

Explicit non-goals $€” these come after MVP ships:

- Billing / Stripe for Roadman+ tier gating (hook points only)
- Adaptive workout generation
- Multi-turn training-plan authoring
- Audio responses / TTS
- Mobile app
- Strava / power-meter integrations
- Coach handoff inbox (CRM tags only for now)
- Spanish / multi-language answers
- Fine-tuning (preferred answers are captured for future use, not served)
- Fully automated weekly topic clustering (start manual $†’ weekly cron later)

## 17. Open questions left for implementation-plan stage

- Exact CTA copy for each intent $€” drafted during Phase 1 against voice-guide
- Chunk size tuning $€” start 1200 tokens, measure retrieval precision@5, tune
- Opus vs Haiku split thresholds $€” start on intent.deep heuristic, A/B test in Phase 5
- Should admin preferred answers be auto-served in later versions? (Out of scope v1; collect them now, decide later.)
