# Measurement Workstream (DEV-DATA-01/02/03) — Design

**Status:** Approved 2026-04-27
**Audit ticket:** Workstream 5 — Measurement
**Owner:** Anthony

## Goal

Close the measurement gap on the security/SEO audit by shipping three connected pieces:

1. **DEV-DATA-01** — A single admin dashboard that surfaces organic search, AI-referral traffic, answer-engine citation runs, and the content-to-coaching funnel in one view.
2. **DEV-DATA-02** — Hardened AI-referrer attribution (server-side fallback, indexed column, canonical audit, documented UTM strategy).
3. **DEV-DATA-03** — Recurring brand-citation prompt-test system that calls AI APIs on a cron and stores whether Roadman is mentioned in their answers.

Non-goals: alerting on citation-rate drops, real-time streaming dashboards, replacing Vercel Analytics, GA4 OAuth UI, or a public marketing dashboard. All deferred.

## Constraints

- Next.js 16 App Router. Read `node_modules/next/dist/docs/` before using new APIs.
- Existing infrastructure to reuse:
  - Auth: `requireAuth()` + `user.role === "admin"` check from `@/lib/admin/auth`.
  - DB: PostgreSQL via Drizzle. Schema at `src/lib/db/schema.ts`.
  - Events: `events` table fed by `/api/events`, recorded via `recordEvent` in `src/lib/admin/events-store.ts`.
  - AI referrer client lib: `src/lib/analytics/ai-referrer.ts` (slugs, host map, browser detection, UTM tagger).
  - Charting components: `StatCard`, `TimeSeriesChart`, `DonutChart`, `FunnelDisplay` in `src/app/admin/(dashboard)/components/charts/`.
  - GA4 client: `src/lib/analytics/ga4.ts` (gracefully no-ops when env vars missing).
  - Cron pattern: `vercel.json` cron + `Authorization: Bearer ${process.env.CRON_SECRET}` route guard.
- Env keys present: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GA4_PROPERTY_ID`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`. **Missing**: `PERPLEXITY_API_KEY`, `GOOGLE_AI_API_KEY` (Gemini). Providers must skip gracefully when their key is unset.

## Architecture

### File layout

```
src/
├─ app/
│  ├─ admin/(dashboard)/
│  │  ├─ measurement/
│  │  │  ├─ page.tsx                    ← Main dashboard (DEV-DATA-01)
│  │  │  ├─ citations/
│  │  │  │  ├─ page.tsx                 ← Prompt CRUD + run matrix (DEV-DATA-03)
│  │  │  │  └─ actions.ts               ← Server actions: add/edit/disable prompt, run-now
│  │  │  └─ _components/
│  │  │     ├─ AIReferralPanel.tsx
│  │  │     ├─ OrganicSearchPanel.tsx
│  │  │     ├─ CitationsPanel.tsx
│  │  │     └─ ContentCoachingFunnel.tsx
│  └─ api/
│     ├─ events/route.ts                ← Patched: server-side AI-referrer fallback (DEV-DATA-02)
│     ├─ admin/citations/run/route.ts   ← Manual run trigger (admin auth)
│     └─ cron/brand-citations/route.ts  ← Weekly cron (DEV-DATA-03)
├─ lib/
│  ├─ analytics/
│  │  ├─ ai-referrer.ts                 ← Add server-side detection helper
│  │  ├─ ai-referrer-server.ts          ← New: header-based detection
│  │  └─ README.md                      ← Documents UTM strategy (DEV-DATA-02)
│  ├─ admin/events-store.ts             ← Add new event type, AI-referrer query helpers
│  ├─ citation-tests/
│  │  ├─ index.ts                       ← runAllPrompts(), seed list
│  │  ├─ detect.ts                      ← mention + URL detection
│  │  ├─ store.ts                       ← Drizzle queries for prompts + runs
│  │  ├─ seed-prompts.ts                ← 12 starter prompts
│  │  └─ providers/
│  │     ├─ types.ts
│  │     ├─ anthropic.ts
│  │     ├─ openai.ts
│  │     ├─ perplexity.ts               ← Returns null when key missing
│  │     └─ gemini.ts                   ← Returns null when key missing
│  └─ db/schema.ts                      ← Add brandPrompts + brandCitationRuns + events.aiReferrer column
└─ drizzle/                             ← Migration for new tables + column + backfill
```

Tests under `tests/` mirror this layout.

### Data flow

**DEV-DATA-01 — Dashboard:**

1. Server component reads `searchParams.range` (reuses `parseTimeRangeWithComparison`).
2. In parallel: GA4 organic sessions, AI-referrer event aggregations, citation-run aggregations, funnel step counts.
3. Each panel renders its data; missing-data states ("GA4 not configured", "no citation runs yet") are explicit, not silent zeroes.

**DEV-DATA-02 — Server-side AI referrer:**

1. Client `Tracker` already sends `ai_referrer` in the body when sessionStorage has it.
2. New: `/api/events` derives a fallback from `Referer` header + parsed `utm_source` on the inbound `page` URL when the client omits it. Uses shared `matchAIHost` so client and server stay in sync.
3. New: events table gets an indexed `ai_referrer` text column. `recordEvent` writes to both the column and `meta.ai_referrer` (preserving back-compat for any reader). Migration backfills the column from `meta->>'ai_referrer'`.
4. `events-store.ts` gains `getAIReferralBreakdown(from, to)` and `getAIReferralTimeSeries(from, to)` that query the indexed column.
5. Canonical audit is a one-shot grep + fix pass; results documented in the analytics README.

**DEV-DATA-03 — Citation tests:**

1. Cron hits `/api/cron/brand-citations` weekly (Mon 09:00 UTC).
2. `runAllPrompts()` loads enabled prompts from `brand_prompts`. For each (prompt × provider), calls the provider adapter. Skips providers whose env key is missing.
3. Adapter returns `{ response: string, citations: string[], error?: string }`. `detect(response, citations)` returns `{ mentioned: boolean, matchedTerms: string[], matchedUrls: string[] }`.
4. Result row inserted into `brand_citation_runs`.
5. Admin UI reads runs grouped by prompt × model, showing latest result and a sparkline of mention rate over the last 12 weeks.
6. Manual "Run now" calls a server action → `/api/admin/citations/run` (admin auth, not cron secret).

### Schema changes

```ts
// Append to events table:
aiReferrer: text("ai_referrer"),  // indexed below
// + index("events_ai_referrer_idx").on(table.aiReferrer)

export const brandPrompts = pgTable("brand_prompts", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  category: text("category").notNull(),       // e.g. "zone-2", "ftp-test"
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const brandCitationRuns = pgTable("brand_citation_runs", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id").notNull().references(() => brandPrompts.id, { onDelete: "cascade" }),
  model: text("model").notNull(),             // e.g. "anthropic:claude-sonnet-4-6"
  response: text("response"),                 // null if errored
  mentioned: boolean("mentioned").notNull().default(false),
  matchedTerms: jsonb("matched_terms"),       // string[]
  matchedUrls: jsonb("matched_urls"),         // string[]
  citations: jsonb("citations"),              // raw provider citation list (Perplexity, Gemini)
  error: text("error"),                       // provider/network error message
  ranAt: timestamp("ran_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("brand_citation_runs_prompt_id_idx").on(table.promptId),
  index("brand_citation_runs_ran_at_idx").on(table.ranAt),
  index("brand_citation_runs_model_idx").on(table.model),
]);
```

### Funnel definition

Five steps, all queried from `events` over the selected range:

| Step | Source |
|---|---|
| Content pageview | `pageview` where `page` matches `/blog/*`, `/podcast/*`, `/glossary/*`, `/tools/*` |
| Newsletter signup | `signup` event |
| Coaching page view | `pageview` where `page = /coaching` |
| Apply page view | `pageview` where `page = /apply` |
| Apply submit | new event type `coaching_apply_submitted`, fired by the apply form on success |

Step 5 requires:
- Adding `"coaching_apply_submitted"` to the `EventType` union in `events-store.ts` and to the `validTypes` array in `/api/events/route.ts`.
- Wiring `__roadmanTrack("coaching_apply_submitted", { ... })` into the existing apply form's success handler. (Don't change the form's POST endpoint; just add the analytics call after success.)

### Citation detection

```ts
const TERMS = ["roadman", "roadmancycling.com", "the roadman podcast"];
const URL_HOSTS = ["roadmancycling.com"];

export function detect(response: string | null, citations: string[]): DetectResult {
  const text = (response ?? "").toLowerCase();
  const matchedTerms = TERMS.filter(t => text.includes(t));
  const matchedUrls = citations.filter(c => URL_HOSTS.some(h => c.toLowerCase().includes(h)));
  return {
    mentioned: matchedTerms.length > 0 || matchedUrls.length > 0,
    matchedTerms,
    matchedUrls,
  };
}
```

### Provider adapter contract

```ts
export interface CitationProvider {
  name: string;                                         // "anthropic", "openai", "perplexity", "gemini"
  model: string;                                        // model id used in DB row
  isConfigured(): boolean;                              // env-key check
  query(prompt: string): Promise<{
    response: string;
    citations: string[];                                // [] when provider has no native citations
  }>;
}
```

Anthropic uses `@anthropic-ai/sdk` (already in deps), latest Sonnet model. OpenAI uses raw `fetch` against responses API. Perplexity uses `fetch` against `api.perplexity.ai` chat completions and reads its `citations` field. Gemini uses raw `fetch` against the Generative Language API. Each adapter has a per-call timeout (30s) and surfaces errors as `{ error }` rather than throwing — so one provider's outage doesn't sink the whole run.

## Error handling

- DB unavailable → dashboard panels render the same "no data" state as `/admin` already does (catch block fallback).
- AI provider error → row inserted with `error` populated and `mentioned = false`. Doesn't fail the cron.
- Provider key missing → skipped silently, surfaced in admin UI as "Not configured" badge per provider.
- Backfill migration is idempotent — uses `WHERE ai_referrer IS NULL`.

## Testing strategy

Vitest unit tests:

- `tests/analytics/ai-referrer-server.test.ts` — header parsing, UTM precedence, malformed inputs.
- `tests/citation-tests/detect.test.ts` — case-insensitive matching, URL host extraction, empty inputs, non-Roadman responses.
- `tests/citation-tests/providers/*.test.ts` — each adapter with `vi.fn()`-mocked fetch verifying request shape, response parsing, error handling, missing-key behaviour.
- `tests/citation-tests/run.test.ts` — `runAllPrompts` orchestration with mocked providers, verifies disabled providers are skipped and errored ones don't abort the run.

Integration verification (manual on dev):

- Hit `/admin/measurement` after seeding events; panels render.
- POST to `/api/cron/brand-citations` with bearer secret; rows appear in `brand_citation_runs`.
- "Run now" from `/admin/measurement/citations` works.
- `npm run lint`, `npm run typecheck` (or `tsc --noEmit`), `npm run test:run` all green.

## Migration / rollout

- One Drizzle migration adds the column, index, and two new tables.
- Backfill SQL is part of the same migration.
- `vercel.json` gets one new cron entry.
- `.env.example` documents the four AI provider keys with notes on which are required vs optional.
- Feature is admin-only behind existing role check — no public surface, no flag needed.

## Out of scope (explicit)

- Alerting on mention-rate drops.
- Editing the seed prompt list at runtime via natural-language CSV upload.
- Adding more AI providers (Mistral, Deepseek). Adapter shape supports it; just not now.
- Dashboard time-range comparison for citation runs (just show "last 12 weeks").
- Notification when a new AI host appears in `events.ai_referrer` that isn't in `HOST_MAP`.
