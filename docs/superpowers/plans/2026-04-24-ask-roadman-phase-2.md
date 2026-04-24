# Ask Roadman Phase 2 — Saved Diagnostics + Rider Profiles

> **Status:** in-progress. Written after merging PR #77 (Phase 1) into the current worktree.

**Goal:** Upgrade three diagnostics (Plateau, Fuelling, FTP Zones) so every completion saves a result, emails the rider, progressively builds their shared rider profile, tags the CRM, offers an "Ask Roadman what this means" handoff, and feeds a rich admin analytics dashboard.

**Architecture:**
- One generic `tool_results` table stores every tool completion (inputs, outputs, summary, tags). Plateau keeps its richer `diagnostic_submissions` table but gains a `rider_profile_id` FK + mirror row in `tool_results` so one history view serves all three tools.
- All three tools share a library (`src/lib/tool-results/*`) that performs: save → upsert rider profile → CRM tag + activity → email report → typed analytics event.
- "Ask Roadman what this means" is a query-string handoff: `/ask?seed_tool=<slug>&seed_result=<slug>` — the ask orchestrator seeds the system prompt with the tool result as extra context, and fires `diagnostic_to_ai_handoff` analytics.
- Admin dashboard adds `/admin/insights` with nine panels powered by SQL aggregates over `tool_results`, `rider_profiles`, `ask_messages`, `ask_retrievals`, and the analytics `events` table.

**Tech stack:** Next.js 16.2.2 (app router), React 19.2.4, Drizzle ORM 0.45.2, Vercel Postgres, Resend, Beehiiv, Vitest.

---

## Schema changes (single migration 0029)

1. `rider_profiles` — add `self_coached_or_coached text` (null | self | coached).
2. `diagnostic_submissions` — add `rider_profile_id integer REFERENCES rider_profiles(id) ON DELETE SET NULL`, index.
3. New table `tool_results`:
   - `id serial PK`
   - `slug text NOT NULL UNIQUE` (10-char nanoid)
   - `rider_profile_id integer REFERENCES rider_profiles(id) ON DELETE SET NULL`
   - `email text NOT NULL`
   - `tool_slug text NOT NULL` — 'plateau' | 'fuelling' | 'ftp_zones'
   - `inputs jsonb NOT NULL` — the raw form values
   - `outputs jsonb NOT NULL` — the computed result object the UI renders
   - `summary text NOT NULL` — one-line summary, shown in history list
   - `primary_result text` — e.g. the plateau profile key or the top carb bucket
   - `tags jsonb NOT NULL DEFAULT '[]'` — CRM tags fired on completion
   - `utm jsonb`
   - `source_page text` — the tool page URL
   - `email_sent_at timestamptz`
   - `ask_handoff_at timestamptz` — first handoff click
   - `created_at timestamptz NOT NULL DEFAULT now()`
   - indexes on email, tool_slug, rider_profile_id, created_at.

## Shared tool-results library (`src/lib/tool-results/`)

- `types.ts` — `ToolSlug`, `ToolResult`, `SaveToolResultInput`, `ToolResultSummary`.
- `slug.ts` — nanoid-style public id generator with unique-constraint retry.
- `store.ts` — `saveToolResult(input)`, `getBySlug(slug)`, `listByEmail(email, limit)`, `listByRiderProfile(id, limit)`, `markEmailSent(slug)`, `markAskHandoff(slug)`.
- `pipeline.ts` — `completeToolResult(input)` orchestrates: `upsertRiderProfile` (+partial fields) → `saveToolResult` → `tagContactForTool` (CRM) → `emailToolReport` (Resend wrapper that reuses `src/lib/tools/reports.ts`). Returns `{ slug, profileId, emailSent }`. Non-fatal side-effects.
- `email.ts` — thin wrapper around Resend with the shared email shell (branded, dark theme) and per-tool bodies pulled from `src/lib/tools/reports.ts`.
- `tags.ts` — deterministic tag set per tool + result; e.g. `fuelling-<intensity>-<gut>` for fuelling.

## Analytics

New typed wrapper `src/lib/analytics/tool-events.ts` exposing `ToolEventName`:
- `tool_started`, `tool_completed`, `diagnostic_saved`, `email_captured`, `diagnostic_to_ai_handoff`, `result_emailed`, `result_viewed`, `history_viewed`.

Wired from each tool page + handoff button + save endpoint (server-side for `diagnostic_saved` and `result_emailed`).

## Plateau diagnostic upgrade

- Extend `/api/diagnostic/submit` to also `upsertRiderProfile` + mirror row in `tool_results`.
- Add `rider_profile_id` to the insert.
- Already sends the confirmation email — no change.
- `/diagnostic/[slug]` page: add a sticky "Ask Roadman what this means" button that POSTs to `/api/ask/seed` then redirects to `/ask`.

## Fuelling calculator upgrade

- `/tools/fuelling` currently computes results and offers a `ReportRequestForm` that calls `/api/tools/report`. Flow now:
  1. User fills inputs, clicks "Calculate".
  2. Client-side `tool_started` on first field interaction + `tool_completed` when result renders.
  3. ReportRequestForm → `/api/tools/fuelling/save` (new).
     - That endpoint calls `completeToolResult`, returns `{ slug }`.
     - Redirects client to `/results/fuelling/[slug]` (new result page) OR keeps inline and shows a success state with "Ask Roadman" CTA.
- `/results/fuelling/[slug]` (server component) renders the saved result from `tool_results` with the Ask Roadman handoff.

## FTP Zones upgrade

- Same pattern as fuelling. Endpoint `/api/tools/ftp-zones/save`. Result page `/results/ftp-zones/[slug]`.

## Ask Roadman handoff

- Accept two query params on `/ask`: `seed_tool` (slug) + `seed_result` (slug).
- Server-render a hidden seed into AskRoadmanClient. First submit POSTs an extra `seed` object to `/api/ask`.
- `/api/ask` route: when `seed` is present, load the tool result, build a one-shot system context block ("The user just completed the <tool> tool. Result summary: <...>. Inputs: <...>. Outputs: <...>"), and inject it into the system prompt before the normal per-request context. Fire `diagnostic_to_ai_handoff` server-side.
- `markAskHandoff(slug)` is called once per tool result (idempotent — only first click persists).

## Result history page

- `/results` (new route). Accepts `?email=X&token=Y` via magic link sent in the confirmation email OR `?rpid=<rider_profile_id>` when internal.
- Token is an HMAC-signed string of `${email}:${riderProfileId}` using an env secret. 7-day TTL.
- Lists all `tool_results` rows grouped by tool, newest first, each links to its result page.

## Admin dashboard `/admin/insights`

Server component using `requireAuth()`. Panels (all default 7d, selectable 24h/7d/30d/all):
1. Tool conversion funnels — for each of the three tools: `tool_started` → `tool_completed` → `email_captured` (saved) → `diagnostic_to_ai_handoff`.
2. Top user questions (askMessages WHERE role=user, grouped by first 6 words, top 20).
3. Top diagnostic results (tool_results GROUP BY primary_result ORDER BY count).
4. Common rider limiters (rider_profiles.biggest_limiter distribution).
5. Failed/low-confidence answers (askMessages WHERE flagged_for_review OR confidence='low').
6. Most-used sources (askRetrievals WHERE used_in_answer, grouped by source_type + source_id).
7. Ask Roadman conversion (sessions → questions → cta_clicked → profile_saved).
8. Coaching lead quality (rider_profiles WHERE coaching_interest IN ('interested','ready')).
9. Email capture performance (tool_results.email_sent_at NOT NULL / tool_results total).

Each panel is a standalone server component that owns its query; page is a thin composer.

## Testing

- Unit: `tool-results/slug.test.ts`, `tool-results/tags.test.ts`, `tool-results/pipeline.test.ts` (mock db + email + crm), `tool-events.test.ts`.
- Integration: `api/tools/fuelling/save.test.ts` and `api/ask/seed` happy path (stubs Anthropic).
- No E2E in this pass — the UI tools and result pages are verified by shape + type; dev server isn't started due to missing env vars.

## Commits

Granular so rollback is easy:
1. schema + migration
2. tool-results library
3. analytics events wrapper
4. plateau upgrade (profile link + ask handoff)
5. fuelling save endpoint + page
6. ftp-zones save endpoint + page
7. ask-roadman seed API
8. result history page
9. admin insights dashboard
10. tests + lint fixes
