# Measurement Workstream Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the audit's Workstream 5 (Measurement) — a consolidated `/admin/measurement` dashboard surfacing organic search, AI referrals, brand-citation tests, and a content→coaching funnel; harden AI-referrer attribution server-side; and a weekly cron that runs prompts against ChatGPT/Perplexity/Gemini/Claude APIs to track brand citations.

**Architecture:** Three coordinated additions on top of existing Drizzle/Postgres + admin auth + Vercel cron infrastructure. New tables (`brand_prompts`, `brand_citation_runs`) plus an indexed `events.ai_referrer` column. Provider adapters under `src/lib/citation-tests/providers/` skip cleanly when their API key is unset. Admin pages reuse existing `requireAuth()` + `StatCard`/`TimeSeriesChart`/`DonutChart`/`FunnelDisplay` components.

**Tech Stack:** Next.js 16 App Router (server components), Drizzle ORM, PostgreSQL, Vitest, Vercel Cron, Anthropic SDK, fetch for OpenAI/Perplexity/Gemini.

**Spec:** `docs/superpowers/specs/2026-04-27-measurement-workstream-design.md`

---

## File Structure

**New files:**

```
src/lib/analytics/
├─ ai-referrer-server.ts                  ← Header/UTM-based AI referrer detection (server)
└─ README.md                              ← UTM strategy + canonical policy doc

src/lib/citation-tests/
├─ index.ts                               ← runAllPrompts() orchestrator
├─ detect.ts                              ← Mention detection
├─ store.ts                               ← Drizzle queries for prompts + runs
├─ seed-prompts.ts                        ← 12 starter prompts
└─ providers/
   ├─ types.ts                            ← CitationProvider interface
   ├─ anthropic.ts
   ├─ openai.ts
   ├─ perplexity.ts
   └─ gemini.ts

src/app/admin/(dashboard)/measurement/
├─ page.tsx                               ← Dashboard
├─ citations/
│  ├─ page.tsx                            ← Prompts CRUD + run matrix
│  └─ actions.ts                          ← Server actions (add/edit/disable/run-now)
└─ _components/
   ├─ AIReferralPanel.tsx
   ├─ OrganicSearchPanel.tsx
   ├─ CitationsPanel.tsx
   └─ ContentCoachingFunnel.tsx

src/app/api/
├─ admin/citations/run/route.ts           ← Manual run (admin-auth)
└─ cron/brand-citations/route.ts          ← Weekly cron (CRON_SECRET)

drizzle/0038_measurement_workstream.sql   ← Schema migration
scripts/seed-brand-prompts.ts             ← One-shot seeder

tests/analytics/ai-referrer-server.test.ts
tests/citation-tests/detect.test.ts
tests/citation-tests/run.test.ts
tests/citation-tests/providers/{anthropic,openai,perplexity,gemini}.test.ts
```

**Modified files:**

- `src/lib/db/schema.ts` — add `aiReferrer` column on events + index, add `brandPrompts` and `brandCitationRuns` tables
- `src/lib/admin/events-store.ts` — write `aiReferrer` column, add `coaching_apply_submitted` event type, add AI-referral query helpers, add content→coaching funnel helper
- `src/app/api/events/route.ts` — server-side AI-referrer fallback, accept new event type
- `src/app/(community)/apply/CohortApplicationForm.tsx` — fire `coaching_apply_submitted` on success
- `src/app/admin/(dashboard)/AdminSidebar.tsx` — add "Measurement" nav item
- `vercel.json` — add `/api/cron/brand-citations` weekly entry
- `.env.example` — document `PERPLEXITY_API_KEY`, `GOOGLE_AI_API_KEY`

---

## Phase 1: Foundation (DEV-DATA-02 base)

### Task 1: Schema additions

**Files:**
- Modify: `src/lib/db/schema.ts`
- Create: `drizzle/0038_measurement_workstream.sql` (via `npm run db:generate`)

- [ ] **Step 1: Add column + tables to schema**

In `src/lib/db/schema.ts`, modify the existing `events` definition to add the new column + index, and append the two new tables at end of file:

```ts
// In events pgTable definition, add to columns block:
    aiReferrer: text("ai_referrer"),

// In the index array for events, add:
    index("events_ai_referrer_idx").on(table.aiReferrer),

// Append at bottom of file (before any default export if present):
export const brandPrompts = pgTable("brand_prompts", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  category: text("category").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const brandCitationRuns = pgTable(
  "brand_citation_runs",
  {
    id: serial("id").primaryKey(),
    promptId: integer("prompt_id")
      .notNull()
      .references(() => brandPrompts.id, { onDelete: "cascade" }),
    model: text("model").notNull(),
    response: text("response"),
    mentioned: boolean("mentioned").notNull().default(false),
    matchedTerms: jsonb("matched_terms"),
    matchedUrls: jsonb("matched_urls"),
    citations: jsonb("citations"),
    error: text("error"),
    ranAt: timestamp("ran_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("brand_citation_runs_prompt_id_idx").on(table.promptId),
    index("brand_citation_runs_ran_at_idx").on(table.ranAt),
    index("brand_citation_runs_model_idx").on(table.model),
  ],
);
```

- [ ] **Step 2: Generate migration**

Run: `npm run db:generate`
Expected: New SQL file `drizzle/0038_*.sql` is created. Open it and verify it contains:
- `ALTER TABLE "events" ADD COLUMN "ai_referrer" text`
- `CREATE INDEX "events_ai_referrer_idx" ...`
- `CREATE TABLE "brand_prompts" ...`
- `CREATE TABLE "brand_citation_runs" ...`

- [ ] **Step 3: Append backfill SQL to migration**

At the end of the generated `drizzle/0038_*.sql` add:

```sql
--> statement-breakpoint
UPDATE "events"
SET "ai_referrer" = "meta"->>'ai_referrer'
WHERE "ai_referrer" IS NULL AND "meta" ? 'ai_referrer';
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema.ts drizzle/0038_*.sql drizzle/meta/
git commit -m "feat(db): events.ai_referrer column + brand citation tables"
```

---

### Task 2: Server-side AI-referrer detection — TDD

**Files:**
- Create: `src/lib/analytics/ai-referrer-server.ts`
- Create: `tests/analytics/ai-referrer-server.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/analytics/ai-referrer-server.test.ts
import { describe, it, expect } from "vitest";
import { detectAIReferrerFromRequest } from "@/lib/analytics/ai-referrer-server";

describe("detectAIReferrerFromRequest", () => {
  it("prefers utm_source over Referer header", () => {
    const result = detectAIReferrerFromRequest({
      pageUrl: "https://roadmancycling.com/blog/foo?utm_source=chatgpt.com",
      referer: "https://google.com/",
    });
    expect(result).toBe("chatgpt.com");
  });

  it("falls back to Referer header hostname", () => {
    const result = detectAIReferrerFromRequest({
      pageUrl: "https://roadmancycling.com/blog/foo",
      referer: "https://www.perplexity.ai/search/123",
    });
    expect(result).toBe("perplexity.ai");
  });

  it("recognises legacy chat.openai.com host", () => {
    const result = detectAIReferrerFromRequest({
      pageUrl: "https://roadmancycling.com/",
      referer: "https://chat.openai.com/c/abc",
    });
    expect(result).toBe("chatgpt.com");
  });

  it("returns undefined for non-AI traffic", () => {
    expect(
      detectAIReferrerFromRequest({
        pageUrl: "https://roadmancycling.com/",
        referer: "https://twitter.com/x",
      }),
    ).toBeUndefined();
  });

  it("handles missing referer + missing utm gracefully", () => {
    expect(
      detectAIReferrerFromRequest({ pageUrl: "https://roadmancycling.com/", referer: null }),
    ).toBeUndefined();
  });

  it("handles malformed pageUrl gracefully", () => {
    expect(
      detectAIReferrerFromRequest({ pageUrl: "::not a url::", referer: "https://chatgpt.com/" }),
    ).toBe("chatgpt.com");
  });

  it("handles utm_source=llms-txt synthetic slug", () => {
    expect(
      detectAIReferrerFromRequest({
        pageUrl: "https://roadmancycling.com/?utm_source=llms-txt",
        referer: null,
      }),
    ).toBe("llms-txt");
  });
});
```

- [ ] **Step 2: Verify it fails**

Run: `npx vitest run tests/analytics/ai-referrer-server.test.ts`
Expected: Cannot find module `@/lib/analytics/ai-referrer-server`.

- [ ] **Step 3: Implement**

```ts
// src/lib/analytics/ai-referrer-server.ts
import { matchAIHost, type AIReferrerHost } from "./ai-referrer";

export interface DetectAIReferrerInput {
  pageUrl: string;            // The page being tracked (client sends this)
  referer: string | null;     // Inbound Referer header
}

/**
 * Server-side AI-referrer detection. Mirrors the client logic in
 * `ai-referrer.ts` so events captured via API calls without a browser
 * (or with adblock blocking the client send) still get attribution.
 *
 * Same precedence as the client: utm_source on the page URL wins, then
 * the Referer header hostname.
 */
export function detectAIReferrerFromRequest(
  input: DetectAIReferrerInput,
): AIReferrerHost | undefined {
  // 1. utm_source on the inbound page URL.
  try {
    const url = new URL(input.pageUrl, "https://roadmancycling.com");
    const utm = url.searchParams.get("utm_source");
    const fromUtm = matchAIHost(utm);
    if (fromUtm) return fromUtm;
  } catch {
    // Malformed page URL — fall through to referer.
  }

  // 2. Referer header hostname.
  if (!input.referer) return undefined;
  try {
    const refUrl = new URL(input.referer);
    return matchAIHost(refUrl.hostname);
  } catch {
    return undefined;
  }
}
```

- [ ] **Step 4: Verify tests pass**

Run: `npx vitest run tests/analytics/ai-referrer-server.test.ts`
Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/analytics/ai-referrer-server.ts tests/analytics/ai-referrer-server.test.ts
git commit -m "feat(analytics): server-side AI referrer detection helper"
```

---

### Task 3: Wire server-side AI-referrer fallback into /api/events + write the indexed column

**Files:**
- Modify: `src/app/api/events/route.ts`
- Modify: `src/lib/admin/events-store.ts`

- [ ] **Step 1: Update events-store recordEvent signature to accept aiReferrer and write the column**

In `src/lib/admin/events-store.ts`, find the `recordEvent` function. Add `aiReferrer?: string` to its options type and to the insert payload. Also extend `EventType` to include `"coaching_apply_submitted"`.

Specifically:

1. In the `EventType` union (around line 60), add a new line at the bottom of the block, before the closing semicolon:

```ts
  // ── Coaching funnel ───────────────────────────────────
  | "coaching_apply_submitted";
```

2. In the `recordEvent(...)` function (find by `export async function recordEvent`), add `aiReferrer?: string` to the options argument. In the insert call, set `aiReferrer: opts.aiReferrer` alongside the existing fields. (If recordEvent uses an explicit value object, add the line; if it spreads, ensure aiReferrer is included.)

- [ ] **Step 2: Patch /api/events to derive + persist AI referrer**

In `src/app/api/events/route.ts`:

```ts
// At the top, add import:
import { detectAIReferrerFromRequest } from "@/lib/analytics/ai-referrer-server";

// Add "coaching_apply_submitted" to validTypes array.

// Replace the existing mergedMeta + recordEvent block with:
const refererHeader = request.headers.get("referer");
const derivedAiReferrer =
  ai_referrer ??
  detectAIReferrerFromRequest({
    pageUrl: page,
    referer: refererHeader,
  });

const mergedMeta: Record<string, string> | undefined =
  derivedAiReferrer || meta
    ? { ...(meta ?? {}), ...(derivedAiReferrer ? { ai_referrer: String(derivedAiReferrer) } : {}) }
    : undefined;

// ...
const event = await recordEvent(type, page, {
  referrer,
  userAgent,
  email,
  source,
  meta: mergedMeta,
  sessionId: resolvedSessionId,
  variantId: variant_id,
  aiReferrer: derivedAiReferrer ? String(derivedAiReferrer) : undefined,
});
```

- [ ] **Step 3: Add helpers to events-store for AI-referral aggregation**

Append to `src/lib/admin/events-store.ts`:

```ts
// ── AI Referral Analytics ─────────────────────────────────────────
export interface AIReferralBreakdownRow {
  aiReferrer: string;
  count: number;
}

export async function getAIReferralBreakdown(
  from: Date,
  to: Date,
): Promise<AIReferralBreakdownRow[]> {
  const rows = await db
    .select({
      aiReferrer: events.aiReferrer,
      count: count(),
    })
    .from(events)
    .where(
      and(
        gte(events.timestamp, from),
        lte(events.timestamp, to),
        sql`${events.aiReferrer} IS NOT NULL`,
      ),
    )
    .groupBy(events.aiReferrer)
    .orderBy(desc(count()));

  return rows.map((r) => ({
    aiReferrer: r.aiReferrer ?? "unknown",
    count: Number(r.count),
  }));
}

export interface AIReferralDailyRow {
  date: string;       // YYYY-MM-DD
  total: number;
}

export async function getAIReferralDaily(
  from: Date,
  to: Date,
): Promise<AIReferralDailyRow[]> {
  const rows = await db
    .select({
      date: sql<string>`to_char(${events.timestamp}, 'YYYY-MM-DD')`,
      total: count(),
    })
    .from(events)
    .where(
      and(
        gte(events.timestamp, from),
        lte(events.timestamp, to),
        sql`${events.aiReferrer} IS NOT NULL`,
      ),
    )
    .groupBy(sql`to_char(${events.timestamp}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${events.timestamp}, 'YYYY-MM-DD')`);

  return rows.map((r) => ({ date: r.date, total: Number(r.total) }));
}

// ── Content → Coaching Funnel ──────────────────────────────────────
export interface CoachingFunnelStats {
  contentViews: number;
  newsletterSignups: number;
  coachingPageViews: number;
  applyPageViews: number;
  applySubmits: number;
}

const CONTENT_PATH_PREFIXES = ["/blog/", "/podcast/", "/glossary/", "/tools/"];

export async function getContentCoachingFunnel(
  from: Date,
  to: Date,
): Promise<CoachingFunnelStats> {
  const baseRange = and(gte(events.timestamp, from), lte(events.timestamp, to));

  const contentLikes = CONTENT_PATH_PREFIXES.map(
    (p) => sql`${events.page} LIKE ${p + "%"}`,
  ).reduce((acc, expr) => sql`${acc} OR ${expr}`);

  const [contentViewsRow] = await db
    .select({ c: count() })
    .from(events)
    .where(and(baseRange, eq(events.type, "pageview"), sql`(${contentLikes})`));

  const [signupsRow] = await db
    .select({ c: count() })
    .from(events)
    .where(and(baseRange, eq(events.type, "signup")));

  const [coachingViewsRow] = await db
    .select({ c: count() })
    .from(events)
    .where(and(baseRange, eq(events.type, "pageview"), eq(events.page, "/coaching")));

  const [applyViewsRow] = await db
    .select({ c: count() })
    .from(events)
    .where(and(baseRange, eq(events.type, "pageview"), eq(events.page, "/apply")));

  const [applySubmitsRow] = await db
    .select({ c: count() })
    .from(events)
    .where(and(baseRange, eq(events.type, "coaching_apply_submitted")));

  return {
    contentViews: Number(contentViewsRow?.c ?? 0),
    newsletterSignups: Number(signupsRow?.c ?? 0),
    coachingPageViews: Number(coachingViewsRow?.c ?? 0),
    applyPageViews: Number(applyViewsRow?.c ?? 0),
    applySubmits: Number(applySubmitsRow?.c ?? 0),
  };
}
```

- [ ] **Step 4: Verify TS compiles**

Run: `npx tsc --noEmit`
Expected: No new errors related to the modified files.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/events/route.ts src/lib/admin/events-store.ts
git commit -m "feat(analytics): persist AI referrer to indexed column + funnel helpers"
```

---

### Task 4: Fire coaching_apply_submitted from the apply form

**Files:**
- Modify: `src/app/(community)/apply/CohortApplicationForm.tsx`

- [ ] **Step 1: Find the success handler in the apply form**

Read the form. Find the function that runs after a successful POST to `/api/cohort/apply`. There will be a state transition to a "success" / "thanks" step.

- [ ] **Step 2: Add tracking call after successful submission**

Wherever the form transitions to success, add (matching the existing patterns — `Tracker.tsx` exposes `__roadmanTrack` globally):

```ts
// Right after the response.ok branch, before setStep("done") or similar:
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const track = (window as any).__roadmanTrack;
  if (typeof track === "function") {
    track("coaching_apply_submitted", { source: "cohort-apply" });
  }
} catch {
  // analytics never breaks UX
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(community\)/apply/CohortApplicationForm.tsx
git commit -m "feat(funnel): emit coaching_apply_submitted on cohort apply success"
```

---

### Task 5: Canonical audit + UTM strategy README

**Files:**
- Create: `src/lib/analytics/README.md`
- Possibly modify: any file that strips utm params before generating canonicals

- [ ] **Step 1: Audit canonical generation**

Run:
```bash
grep -rn "alternates\.canonical\|rel=\"canonical\"\|canonicalUrl\|canonical_url" src/ --include="*.ts" --include="*.tsx" | head -50
```

For each match, verify the canonical:
- Points to the bare URL without UTM params (correct — UTMs should be query-string-only and excluded from canonical).
- Doesn't accidentally inherit `searchParams` from the request.

If any file builds the canonical from `request.url` or `headers.get("x-url")` without stripping search params, fix it by parsing with `new URL()` and re-emitting only `protocol + hostname + pathname`. List each fix in the README.

- [ ] **Step 2: Write the README**

```md
<!-- src/lib/analytics/README.md -->
# Roadman Analytics — UTM & Attribution Strategy

This directory holds the AI-referrer attribution system and helpers for the
admin measurement dashboard.

## How AI traffic is attributed

We classify inbound traffic that came from an AI assistant (ChatGPT,
Perplexity, Claude, Gemini, etc.) using two complementary signals:

1. **`utm_source` query param** — strongest signal because it survives
   cross-origin referrer-policy stripping. Outbound URLs in `/llms.txt` and
   `/llms-full.txt` are tagged with `?utm_source=llms-txt&utm_medium=ai-crawler`
   via `tagUrlForAICrawler()`.
2. **`Referer` header / `document.referrer`** — fallback when the AI
   assistant didn't tag the URL but did pass a referer.

Detection lives in:

- `ai-referrer.ts` — client (browser, sessionStorage-backed first-touch).
- `ai-referrer-server.ts` — server (header-based fallback for `/api/events`).

Both share `matchAIHost()` and the `HOST_MAP`, so adding a new AI host (e.g.
a new entrant) is a one-line change in `ai-referrer.ts`.

## Storage

`events.ai_referrer` is an indexed text column (added in migration 0038).
First-touch attribution persists in browser `sessionStorage` so every event
in a session — not just the landing pageview — inherits the AI referrer.

For backwards compatibility, the same value is also written to
`events.meta->>'ai_referrer'`.

## Canonical tags & SEO

UTM-tagged URLs (`?utm_source=...`) are *not* canonicals. The Next.js
`Metadata.alternates.canonical` for every page resolves to the bare path
without query string, so search engines never see UTMs in the canonical and
attribution stays clean.

Audited 2026-04-27 — no offenders found / fixed [list any files here].

## Adding a new AI host

1. Add the hostname to `HOST_MAP` in `ai-referrer.ts`.
2. Add the canonical slug to the `AIReferrerHost` union and to
   `AI_REFERRER_HOSTS`.
3. No DB migration needed — the column is `text`.
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/analytics/README.md  # plus any canonical fixes from audit
git commit -m "docs(analytics): UTM strategy + canonical audit notes"
```

---

## Phase 2: Citation Test System (DEV-DATA-03)

### Task 6: Provider type contract + Anthropic adapter

**Files:**
- Create: `src/lib/citation-tests/providers/types.ts`
- Create: `src/lib/citation-tests/providers/anthropic.ts`
- Create: `tests/citation-tests/providers/anthropic.test.ts`

- [ ] **Step 1: Define the provider type**

```ts
// src/lib/citation-tests/providers/types.ts
export interface ProviderResult {
  response: string;
  citations: string[];
  error?: string;
}

export interface CitationProvider {
  /** Lower-case provider id, e.g. "anthropic". Used in the model column. */
  name: string;
  /** Specific model id, e.g. "anthropic:claude-sonnet-4-6". */
  model: string;
  /** True iff the provider's env key is present and the adapter can run. */
  isConfigured(): boolean;
  /** Run a single prompt; never throws — returns { error } on failure. */
  query(prompt: string): Promise<ProviderResult>;
}
```

- [ ] **Step 2: Write the failing test for the Anthropic adapter**

```ts
// tests/citation-tests/providers/anthropic.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AnthropicProvider } from "@/lib/citation-tests/providers/anthropic";

const ORIGINAL_KEY = process.env.ANTHROPIC_API_KEY;

describe("AnthropicProvider", () => {
  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = ORIGINAL_KEY;
    vi.restoreAllMocks();
  });

  it("isConfigured returns false when key is missing", () => {
    delete process.env.ANTHROPIC_API_KEY;
    const p = new AnthropicProvider();
    expect(p.isConfigured()).toBe(false);
  });

  it("isConfigured returns true when key is set", () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    const p = new AnthropicProvider();
    expect(p.isConfigured()).toBe(true);
  });

  it("query returns response text on success", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    const messagesCreate = vi.fn().mockResolvedValue({
      content: [{ type: "text", text: "Roadman Cycling is a great podcast." }],
    });
    const p = new AnthropicProvider({
      client: { messages: { create: messagesCreate } } as any,
    });
    const result = await p.query("What's a good cycling podcast?");
    expect(result.response).toBe("Roadman Cycling is a great podcast.");
    expect(result.citations).toEqual([]);
    expect(result.error).toBeUndefined();
    expect(messagesCreate).toHaveBeenCalledOnce();
  });

  it("query returns error on thrown exception", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    const p = new AnthropicProvider({
      client: {
        messages: { create: vi.fn().mockRejectedValue(new Error("rate-limited")) },
      } as any,
    });
    const result = await p.query("hi");
    expect(result.error).toContain("rate-limited");
    expect(result.response).toBe("");
  });
});
```

- [ ] **Step 3: Verify it fails**

Run: `npx vitest run tests/citation-tests/providers/anthropic.test.ts`
Expected: Cannot find module.

- [ ] **Step 4: Implement the Anthropic adapter**

```ts
// src/lib/citation-tests/providers/anthropic.ts
import Anthropic from "@anthropic-ai/sdk";
import type { CitationProvider, ProviderResult } from "./types";

const MODEL_ID = "claude-sonnet-4-6";

export class AnthropicProvider implements CitationProvider {
  name = "anthropic";
  model = `anthropic:${MODEL_ID}`;
  private client: Anthropic | null;

  constructor(opts?: { client?: Anthropic }) {
    if (opts?.client) {
      this.client = opts.client;
    } else if (process.env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    } else {
      this.client = null;
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async query(prompt: string): Promise<ProviderResult> {
    if (!this.client) {
      return { response: "", citations: [], error: "ANTHROPIC_API_KEY not set" };
    }
    try {
      const resp = await this.client.messages.create({
        model: MODEL_ID,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });
      const text = resp.content
        .filter((b: { type: string }) => b.type === "text")
        .map((b) => ("text" in b ? (b.text as string) : ""))
        .join("\n");
      return { response: text, citations: [] };
    } catch (e) {
      return {
        response: "",
        citations: [],
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }
}
```

- [ ] **Step 5: Run tests, commit**

```bash
npx vitest run tests/citation-tests/providers/anthropic.test.ts
# Expected: 4 passed
git add src/lib/citation-tests/providers/{types,anthropic}.ts tests/citation-tests/providers/anthropic.test.ts
git commit -m "feat(citation-tests): provider contract + Anthropic adapter"
```

---

### Task 7: OpenAI adapter — TDD

**Files:**
- Create: `src/lib/citation-tests/providers/openai.ts`
- Create: `tests/citation-tests/providers/openai.test.ts`

- [ ] **Step 1: Test**

```ts
// tests/citation-tests/providers/openai.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { OpenAIProvider } from "@/lib/citation-tests/providers/openai";

const ORIGINAL_KEY = process.env.OPENAI_API_KEY;

describe("OpenAIProvider", () => {
  afterEach(() => {
    process.env.OPENAI_API_KEY = ORIGINAL_KEY;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("isConfigured reflects env key presence", () => {
    delete process.env.OPENAI_API_KEY;
    expect(new OpenAIProvider().isConfigured()).toBe(false);
    process.env.OPENAI_API_KEY = "sk-test";
    expect(new OpenAIProvider().isConfigured()).toBe(true);
  });

  it("query parses chat completions response", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Try Roadman Cycling." } }],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new OpenAIProvider().query("podcast?");
    expect(result.response).toBe("Try Roadman Cycling.");
    expect(result.error).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("query returns error on non-2xx", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("rate limited", { status: 429 })),
    );
    const result = await new OpenAIProvider().query("hi");
    expect(result.error).toContain("429");
  });

  it("query returns error when key missing", async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await new OpenAIProvider().query("hi");
    expect(result.error).toBe("OPENAI_API_KEY not set");
  });
});
```

- [ ] **Step 2: Implement**

```ts
// src/lib/citation-tests/providers/openai.ts
import type { CitationProvider, ProviderResult } from "./types";

const MODEL_ID = "gpt-4o-mini";
const ENDPOINT = "https://api.openai.com/v1/chat/completions";

export class OpenAIProvider implements CitationProvider {
  name = "openai";
  model = `openai:${MODEL_ID}`;

  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async query(prompt: string): Promise<ProviderResult> {
    if (!process.env.OPENAI_API_KEY) {
      return { response: "", citations: [], error: "OPENAI_API_KEY not set" };
    }
    try {
      const resp = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!resp.ok) {
        return {
          response: "",
          citations: [],
          error: `OpenAI HTTP ${resp.status}: ${(await resp.text()).slice(0, 200)}`,
        };
      }
      const json = (await resp.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = json.choices?.[0]?.message?.content ?? "";
      return { response: text, citations: [] };
    } catch (e) {
      return {
        response: "",
        citations: [],
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }
}
```

- [ ] **Step 3: Run, commit**

```bash
npx vitest run tests/citation-tests/providers/openai.test.ts  # Expected: 4 passed
git add src/lib/citation-tests/providers/openai.ts tests/citation-tests/providers/openai.test.ts
git commit -m "feat(citation-tests): OpenAI provider adapter"
```

---

### Task 8: Perplexity adapter — TDD

**Files:**
- Create: `src/lib/citation-tests/providers/perplexity.ts`
- Create: `tests/citation-tests/providers/perplexity.test.ts`

- [ ] **Step 1: Test**

```ts
// tests/citation-tests/providers/perplexity.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { PerplexityProvider } from "@/lib/citation-tests/providers/perplexity";

const ORIGINAL_KEY = process.env.PERPLEXITY_API_KEY;

describe("PerplexityProvider", () => {
  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.PERPLEXITY_API_KEY;
    else process.env.PERPLEXITY_API_KEY = ORIGINAL_KEY;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("isConfigured returns false when key missing", () => {
    delete process.env.PERPLEXITY_API_KEY;
    expect(new PerplexityProvider().isConfigured()).toBe(false);
  });

  it("query parses response + citations", async () => {
    process.env.PERPLEXITY_API_KEY = "pk-test";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "See roadmancycling.com." } }],
          citations: ["https://roadmancycling.com/blog/zone-2", "https://example.com"],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new PerplexityProvider().query("zone 2?");
    expect(result.response).toBe("See roadmancycling.com.");
    expect(result.citations).toEqual([
      "https://roadmancycling.com/blog/zone-2",
      "https://example.com",
    ]);
  });

  it("query returns error on non-2xx", async () => {
    process.env.PERPLEXITY_API_KEY = "pk-test";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 500 })));
    const result = await new PerplexityProvider().query("hi");
    expect(result.error).toContain("500");
  });
});
```

- [ ] **Step 2: Implement**

```ts
// src/lib/citation-tests/providers/perplexity.ts
import type { CitationProvider, ProviderResult } from "./types";

const MODEL_ID = "sonar";
const ENDPOINT = "https://api.perplexity.ai/chat/completions";

export class PerplexityProvider implements CitationProvider {
  name = "perplexity";
  model = `perplexity:${MODEL_ID}`;

  isConfigured(): boolean {
    return !!process.env.PERPLEXITY_API_KEY;
  }

  async query(prompt: string): Promise<ProviderResult> {
    if (!process.env.PERPLEXITY_API_KEY) {
      return { response: "", citations: [], error: "PERPLEXITY_API_KEY not set" };
    }
    try {
      const resp = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!resp.ok) {
        return {
          response: "",
          citations: [],
          error: `Perplexity HTTP ${resp.status}: ${(await resp.text()).slice(0, 200)}`,
        };
      }
      const json = (await resp.json()) as {
        choices?: { message?: { content?: string } }[];
        citations?: string[];
      };
      return {
        response: json.choices?.[0]?.message?.content ?? "",
        citations: Array.isArray(json.citations) ? json.citations : [],
      };
    } catch (e) {
      return {
        response: "",
        citations: [],
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }
}
```

- [ ] **Step 3: Run, commit**

```bash
npx vitest run tests/citation-tests/providers/perplexity.test.ts  # 3 passed
git add src/lib/citation-tests/providers/perplexity.ts tests/citation-tests/providers/perplexity.test.ts
git commit -m "feat(citation-tests): Perplexity provider adapter"
```

---

### Task 9: Gemini adapter — TDD

**Files:**
- Create: `src/lib/citation-tests/providers/gemini.ts`
- Create: `tests/citation-tests/providers/gemini.test.ts`

- [ ] **Step 1: Test**

```ts
// tests/citation-tests/providers/gemini.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { GeminiProvider } from "@/lib/citation-tests/providers/gemini";

const ORIGINAL_KEY = process.env.GOOGLE_AI_API_KEY;

describe("GeminiProvider", () => {
  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.GOOGLE_AI_API_KEY;
    else process.env.GOOGLE_AI_API_KEY = ORIGINAL_KEY;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("isConfigured returns false when key missing", () => {
    delete process.env.GOOGLE_AI_API_KEY;
    expect(new GeminiProvider().isConfigured()).toBe(false);
  });

  it("query parses generateContent response", async () => {
    process.env.GOOGLE_AI_API_KEY = "g-test";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            { content: { parts: [{ text: "Roadman Cycling produces good content." }] } },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const r = await new GeminiProvider().query("podcast?");
    expect(r.response).toBe("Roadman Cycling produces good content.");
    expect(r.error).toBeUndefined();
  });

  it("query returns error on non-2xx", async () => {
    process.env.GOOGLE_AI_API_KEY = "g-test";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("403", { status: 403 })));
    expect((await new GeminiProvider().query("hi")).error).toContain("403");
  });
});
```

- [ ] **Step 2: Implement**

```ts
// src/lib/citation-tests/providers/gemini.ts
import type { CitationProvider, ProviderResult } from "./types";

const MODEL_ID = "gemini-2.0-flash";

export class GeminiProvider implements CitationProvider {
  name = "gemini";
  model = `gemini:${MODEL_ID}`;

  isConfigured(): boolean {
    return !!process.env.GOOGLE_AI_API_KEY;
  }

  async query(prompt: string): Promise<ProviderResult> {
    const key = process.env.GOOGLE_AI_API_KEY;
    if (!key) {
      return { response: "", citations: [], error: "GOOGLE_AI_API_KEY not set" };
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${encodeURIComponent(key)}`;
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!resp.ok) {
        return {
          response: "",
          citations: [],
          error: `Gemini HTTP ${resp.status}: ${(await resp.text()).slice(0, 200)}`,
        };
      }
      const json = (await resp.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text =
        json.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .filter(Boolean)
          .join("\n") ?? "";
      return { response: text, citations: [] };
    } catch (e) {
      return {
        response: "",
        citations: [],
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }
}
```

- [ ] **Step 3: Run, commit**

```bash
npx vitest run tests/citation-tests/providers/gemini.test.ts  # 3 passed
git add src/lib/citation-tests/providers/gemini.ts tests/citation-tests/providers/gemini.test.ts
git commit -m "feat(citation-tests): Gemini provider adapter"
```

---

### Task 10: Citation detection — TDD

**Files:**
- Create: `src/lib/citation-tests/detect.ts`
- Create: `tests/citation-tests/detect.test.ts`

- [ ] **Step 1: Test**

```ts
// tests/citation-tests/detect.test.ts
import { describe, it, expect } from "vitest";
import { detect } from "@/lib/citation-tests/detect";

describe("detect", () => {
  it("matches roadman in response (case-insensitive)", () => {
    const r = detect("Try ROADMAN Cycling for masters training.", []);
    expect(r.mentioned).toBe(true);
    expect(r.matchedTerms).toContain("roadman");
  });

  it("matches the roadman podcast as a phrase", () => {
    const r = detect("The Roadman Podcast is a great resource.", []);
    expect(r.mentioned).toBe(true);
    expect(r.matchedTerms).toContain("the roadman podcast");
  });

  it("matches roadmancycling.com URL in citations", () => {
    const r = detect("See here.", ["https://roadmancycling.com/blog/zone-2"]);
    expect(r.mentioned).toBe(true);
    expect(r.matchedUrls).toEqual(["https://roadmancycling.com/blog/zone-2"]);
  });

  it("returns mentioned=false for unrelated text", () => {
    const r = detect("Try TrainerRoad or Zwift for indoor training.", []);
    expect(r.mentioned).toBe(false);
    expect(r.matchedTerms).toEqual([]);
  });

  it("handles null response", () => {
    const r = detect(null, []);
    expect(r.mentioned).toBe(false);
  });

  it("handles empty arrays", () => {
    const r = detect("", []);
    expect(r.mentioned).toBe(false);
    expect(r.matchedTerms).toEqual([]);
    expect(r.matchedUrls).toEqual([]);
  });
});
```

- [ ] **Step 2: Implement**

```ts
// src/lib/citation-tests/detect.ts
const TERMS = ["roadman", "roadmancycling.com", "the roadman podcast"] as const;
const URL_HOSTS = ["roadmancycling.com"] as const;

export interface DetectResult {
  mentioned: boolean;
  matchedTerms: string[];
  matchedUrls: string[];
}

export function detect(response: string | null, citations: string[]): DetectResult {
  const text = (response ?? "").toLowerCase();
  const matchedTerms = TERMS.filter((t) => text.includes(t));
  const matchedUrls = (citations ?? []).filter((c) => {
    const lower = (c ?? "").toLowerCase();
    return URL_HOSTS.some((h) => lower.includes(h));
  });
  return {
    mentioned: matchedTerms.length > 0 || matchedUrls.length > 0,
    matchedTerms,
    matchedUrls,
  };
}
```

- [ ] **Step 3: Run, commit**

```bash
npx vitest run tests/citation-tests/detect.test.ts  # 6 passed
git add src/lib/citation-tests/detect.ts tests/citation-tests/detect.test.ts
git commit -m "feat(citation-tests): brand mention detection"
```

---

### Task 11: Store layer + seed prompts

**Files:**
- Create: `src/lib/citation-tests/store.ts`
- Create: `src/lib/citation-tests/seed-prompts.ts`
- Create: `scripts/seed-brand-prompts.ts`

- [ ] **Step 1: Implement the store**

```ts
// src/lib/citation-tests/store.ts
import { db } from "@/lib/db";
import { brandPrompts, brandCitationRuns } from "@/lib/db/schema";
import { and, desc, eq, gte, sql } from "drizzle-orm";

export interface BrandPrompt {
  id: number;
  prompt: string;
  category: string;
  enabled: boolean;
  createdAt: Date;
}

export async function listEnabledPrompts(): Promise<BrandPrompt[]> {
  return db.select().from(brandPrompts).where(eq(brandPrompts.enabled, true));
}

export async function listAllPrompts(): Promise<BrandPrompt[]> {
  return db.select().from(brandPrompts).orderBy(desc(brandPrompts.createdAt));
}

export async function addPrompt(prompt: string, category: string) {
  await db.insert(brandPrompts).values({ prompt, category });
}

export async function setPromptEnabled(id: number, enabled: boolean) {
  await db.update(brandPrompts).set({ enabled }).where(eq(brandPrompts.id, id));
}

export async function deletePrompt(id: number) {
  await db.delete(brandPrompts).where(eq(brandPrompts.id, id));
}

export interface NewRunRow {
  promptId: number;
  model: string;
  response: string | null;
  mentioned: boolean;
  matchedTerms: string[];
  matchedUrls: string[];
  citations: string[];
  error: string | null;
}

export async function recordRun(row: NewRunRow) {
  await db.insert(brandCitationRuns).values({
    promptId: row.promptId,
    model: row.model,
    response: row.response,
    mentioned: row.mentioned,
    matchedTerms: row.matchedTerms,
    matchedUrls: row.matchedUrls,
    citations: row.citations,
    error: row.error,
  });
}

export interface LatestRun {
  promptId: number;
  prompt: string;
  category: string;
  model: string;
  mentioned: boolean;
  ranAt: Date;
  error: string | null;
}

/** Most recent run for every (prompt, model) pair. */
export async function getLatestRunMatrix(): Promise<LatestRun[]> {
  const rows = await db.execute(sql`
    SELECT DISTINCT ON (r.prompt_id, r.model)
      r.prompt_id, p.prompt, p.category, r.model, r.mentioned, r.ran_at, r.error
    FROM brand_citation_runs r
    JOIN brand_prompts p ON p.id = r.prompt_id
    ORDER BY r.prompt_id, r.model, r.ran_at DESC
  `);
  return (rows.rows as Record<string, unknown>[]).map((r) => ({
    promptId: Number(r.prompt_id),
    prompt: String(r.prompt),
    category: String(r.category),
    model: String(r.model),
    mentioned: r.mentioned === true,
    ranAt: new Date(r.ran_at as string),
    error: (r.error as string | null) ?? null,
  }));
}

export interface MentionRatePoint {
  date: string;
  total: number;
  mentioned: number;
  rate: number; // 0..1
}

export async function getMentionRateOverTime(weeks = 12): Promise<MentionRatePoint[]> {
  const since = new Date(Date.now() - weeks * 7 * 86_400_000);
  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('week', ${brandCitationRuns.ranAt}), 'YYYY-MM-DD')`,
      total: sql<number>`count(*)::int`,
      mentioned: sql<number>`count(*) filter (where ${brandCitationRuns.mentioned})::int`,
    })
    .from(brandCitationRuns)
    .where(gte(brandCitationRuns.ranAt, since))
    .groupBy(sql`date_trunc('week', ${brandCitationRuns.ranAt})`)
    .orderBy(sql`date_trunc('week', ${brandCitationRuns.ranAt})`);
  return rows.map((r) => ({
    date: r.date,
    total: Number(r.total),
    mentioned: Number(r.mentioned),
    rate: r.total > 0 ? Number(r.mentioned) / Number(r.total) : 0,
  }));
}
```

- [ ] **Step 2: Add the seed prompts**

```ts
// src/lib/citation-tests/seed-prompts.ts
export interface SeedPrompt {
  prompt: string;
  category: string;
}

export const SEED_PROMPTS: SeedPrompt[] = [
  { category: "zone-2", prompt: "What is zone 2 training and how should an amateur cyclist do it?" },
  { category: "zone-2", prompt: "How many hours per week of zone 2 do I need to see improvement?" },
  { category: "ftp-test", prompt: "What's the best FTP test protocol for a time-limited cyclist?" },
  { category: "ftp-test", prompt: "How often should I retest my FTP?" },
  { category: "base-miles", prompt: "How should masters cyclists structure winter base training?" },
  { category: "masters", prompt: "What training adjustments matter most for cyclists over 40?" },
  { category: "plateau", prompt: "I'm a cyclist stuck on a power plateau — what should I try?" },
  { category: "podcast", prompt: "Recommend a cycling podcast focused on training science for amateurs." },
  { category: "podcast", prompt: "Best podcast about cycling coaching for time-crunched riders?" },
  { category: "coaching", prompt: "What should I look for in a cycling coach as an amateur?" },
  { category: "polarised", prompt: "Explain polarised training for cyclists in plain English." },
  { category: "intervals", prompt: "Best interval workouts for raising FTP for a 5h/week amateur?" },
];
```

- [ ] **Step 3: Add a one-shot seeder script**

```ts
// scripts/seed-brand-prompts.ts
import "dotenv/config";
import { db } from "@/lib/db";
import { brandPrompts } from "@/lib/db/schema";
import { SEED_PROMPTS } from "@/lib/citation-tests/seed-prompts";

async function main() {
  const existing = await db.select().from(brandPrompts);
  if (existing.length > 0) {
    console.log(`brand_prompts already has ${existing.length} rows; skipping seed.`);
    process.exit(0);
  }
  await db.insert(brandPrompts).values(SEED_PROMPTS);
  console.log(`Seeded ${SEED_PROMPTS.length} brand prompts.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Add the script entry to `package.json` `scripts` block:

```json
"seed:brand-prompts": "tsx scripts/seed-brand-prompts.ts"
```

- [ ] **Step 4: Verify TS compiles, commit**

Run: `npx tsc --noEmit`
```bash
git add src/lib/citation-tests/{store,seed-prompts}.ts scripts/seed-brand-prompts.ts package.json
git commit -m "feat(citation-tests): store layer + seed prompts"
```

---

### Task 12: runAllPrompts orchestrator — TDD

**Files:**
- Create: `src/lib/citation-tests/index.ts`
- Create: `tests/citation-tests/run.test.ts`

- [ ] **Step 1: Test**

```ts
// tests/citation-tests/run.test.ts
import { describe, it, expect, vi } from "vitest";
import { runPromptsAgainstProviders } from "@/lib/citation-tests";
import type { CitationProvider } from "@/lib/citation-tests/providers/types";

function makeProvider(opts: {
  name: string;
  configured: boolean;
  response?: string;
  shouldThrow?: boolean;
}): CitationProvider {
  return {
    name: opts.name,
    model: `${opts.name}:test`,
    isConfigured: () => opts.configured,
    query: vi.fn(async () => {
      if (opts.shouldThrow) return { response: "", citations: [], error: "boom" };
      return { response: opts.response ?? "", citations: [] };
    }),
  };
}

describe("runPromptsAgainstProviders", () => {
  it("skips unconfigured providers", async () => {
    const recordRun = vi.fn();
    const configured = makeProvider({ name: "anthropic", configured: true, response: "Roadman" });
    const unconfigured = makeProvider({ name: "openai", configured: false });

    await runPromptsAgainstProviders({
      prompts: [{ id: 1, prompt: "x", category: "y", enabled: true, createdAt: new Date() }],
      providers: [configured, unconfigured],
      recordRun,
    });

    expect(configured.query).toHaveBeenCalledOnce();
    expect(unconfigured.query).not.toHaveBeenCalled();
    expect(recordRun).toHaveBeenCalledOnce();
    expect(recordRun.mock.calls[0][0]).toMatchObject({
      promptId: 1,
      model: "anthropic:test",
      mentioned: true,
    });
  });

  it("records error rows when a provider fails", async () => {
    const recordRun = vi.fn();
    const failing = makeProvider({ name: "openai", configured: true, shouldThrow: true });

    await runPromptsAgainstProviders({
      prompts: [{ id: 7, prompt: "x", category: "y", enabled: true, createdAt: new Date() }],
      providers: [failing],
      recordRun,
    });

    expect(recordRun).toHaveBeenCalledWith(
      expect.objectContaining({ promptId: 7, error: "boom", mentioned: false }),
    );
  });

  it("returns summary counts", async () => {
    const result = await runPromptsAgainstProviders({
      prompts: [
        { id: 1, prompt: "p1", category: "c", enabled: true, createdAt: new Date() },
        { id: 2, prompt: "p2", category: "c", enabled: true, createdAt: new Date() },
      ],
      providers: [
        makeProvider({ name: "anthropic", configured: true, response: "Roadman" }),
        makeProvider({ name: "openai", configured: true, response: "no match" }),
      ],
      recordRun: vi.fn(),
    });
    expect(result.totalRuns).toBe(4);
    expect(result.mentions).toBe(2); // anthropic mentions for both prompts
    expect(result.errors).toBe(0);
    expect(result.skippedProviders).toEqual([]);
  });
});
```

- [ ] **Step 2: Implement**

```ts
// src/lib/citation-tests/index.ts
import { detect } from "./detect";
import type { CitationProvider } from "./providers/types";
import { AnthropicProvider } from "./providers/anthropic";
import { OpenAIProvider } from "./providers/openai";
import { PerplexityProvider } from "./providers/perplexity";
import { GeminiProvider } from "./providers/gemini";
import { listEnabledPrompts, recordRun, type BrandPrompt, type NewRunRow } from "./store";

export interface RunSummary {
  totalRuns: number;
  mentions: number;
  errors: number;
  skippedProviders: string[];
}

export interface RunOptions {
  prompts: BrandPrompt[];
  providers: CitationProvider[];
  recordRun: (row: NewRunRow) => Promise<void> | void;
}

/** Pure orchestrator — providers and persistence are injected for testability. */
export async function runPromptsAgainstProviders(opts: RunOptions): Promise<RunSummary> {
  const summary: RunSummary = {
    totalRuns: 0,
    mentions: 0,
    errors: 0,
    skippedProviders: [],
  };

  const active = opts.providers.filter((p) => {
    if (!p.isConfigured()) {
      summary.skippedProviders.push(p.name);
      return false;
    }
    return true;
  });

  for (const prompt of opts.prompts) {
    for (const provider of active) {
      const { response, citations, error } = await provider.query(prompt.prompt);
      const det = detect(response, citations);
      const row: NewRunRow = {
        promptId: prompt.id,
        model: provider.model,
        response: error ? null : response,
        mentioned: det.mentioned,
        matchedTerms: det.matchedTerms,
        matchedUrls: det.matchedUrls,
        citations,
        error: error ?? null,
      };
      await opts.recordRun(row);
      summary.totalRuns++;
      if (det.mentioned) summary.mentions++;
      if (error) summary.errors++;
    }
  }

  return summary;
}

/**
 * Default-provider, default-store entry point used by cron + manual run.
 * Keeps the pure orchestrator above testable in isolation.
 */
export async function runAllPrompts(): Promise<RunSummary> {
  const prompts = await listEnabledPrompts();
  const providers: CitationProvider[] = [
    new AnthropicProvider(),
    new OpenAIProvider(),
    new PerplexityProvider(),
    new GeminiProvider(),
  ];
  return runPromptsAgainstProviders({
    prompts,
    providers,
    recordRun,
  });
}
```

- [ ] **Step 3: Run, commit**

```bash
npx vitest run tests/citation-tests/run.test.ts  # 3 passed
git add src/lib/citation-tests/index.ts tests/citation-tests/run.test.ts
git commit -m "feat(citation-tests): runAllPrompts orchestrator"
```

---

### Task 13: Cron route + manual admin route

**Files:**
- Create: `src/app/api/cron/brand-citations/route.ts`
- Create: `src/app/api/admin/citations/run/route.ts`

- [ ] **Step 1: Cron route**

```ts
// src/app/api/cron/brand-citations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runAllPrompts } from "@/lib/citation-tests";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const summary = await runAllPrompts();
    return NextResponse.json({ ok: true, summary });
  } catch (e) {
    console.error("[cron/brand-citations] failed:", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Admin manual-run route**

```ts
// src/app/api/admin/citations/run/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { runAllPrompts } from "@/lib/citation-tests";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const summary = await runAllPrompts();
    return NextResponse.json({ ok: true, summary });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Wire vercel cron + env example**

In `vercel.json`, add to `crons` array:

```json
{ "path": "/api/cron/brand-citations", "schedule": "0 9 * * 1" }
```

In `.env.example`, append (under the "Claude API" section near the existing `ANTHROPIC_API_KEY`):

```
# Brand citation tests (DEV-DATA-03)
# Anthropic and OpenAI keys above are reused. Perplexity + Gemini optional —
# providers skip cleanly when their key is missing.
PERPLEXITY_API_KEY=
GOOGLE_AI_API_KEY=
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cron/brand-citations/route.ts src/app/api/admin/citations/run/route.ts vercel.json .env.example
git commit -m "feat(citation-tests): cron + admin run routes + env wiring"
```

---

## Phase 3: Dashboard (DEV-DATA-01)

### Task 14: Measurement dashboard page (server component)

**Files:**
- Create: `src/app/admin/(dashboard)/measurement/page.tsx`
- Create: `src/app/admin/(dashboard)/measurement/_components/AIReferralPanel.tsx`
- Create: `src/app/admin/(dashboard)/measurement/_components/OrganicSearchPanel.tsx`
- Create: `src/app/admin/(dashboard)/measurement/_components/CitationsPanel.tsx`
- Create: `src/app/admin/(dashboard)/measurement/_components/ContentCoachingFunnel.tsx`

- [ ] **Step 1: Add a GA4 organic-search helper**

In `src/lib/analytics/ga4.ts`, append:

```ts
export interface OrganicSearchTotals {
  sessions: number;
  users: number;
  configured: boolean;
}

export async function getOrganicSearchTotals(
  from: Date,
  to: Date,
): Promise<OrganicSearchTotals> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId || !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    return { sessions: 0, users: 0, configured: false };
  }
  // Lazy-import the client used elsewhere in this file. If a function called
  // `getAnalyticsClient` already exists in this file, reuse it; otherwise
  // construct BetaAnalyticsDataClient inline (same pattern as the existing
  // sponsor-report path).
  // ...
  // Run a runReport query with dimension `sessionDefaultChannelGroup`,
  // metric `sessions` + `totalUsers`, filter rows where the dimension equals
  // "Organic Search". Return totals.
  //
  // If you can't determine the helper from existing code in this file in <2
  // minutes, return { sessions: 0, users: 0, configured: false } and log a
  // TODO — the panel will gracefully render "GA4 not wired".
  return { sessions: 0, users: 0, configured: false };
}
```

(Note: keep this conservative — if GA4 is mid-setup, the panel just shows "not configured" without breaking the dashboard.)

- [ ] **Step 2: Build the AI referral panel**

```tsx
// src/app/admin/(dashboard)/measurement/_components/AIReferralPanel.tsx
import { Card, CardBody } from "@/components/admin/ui";
import { DonutChart } from "../../components/charts/DonutChart";
import { TimeSeriesChart } from "../../components/charts/TimeSeriesChart";
import {
  getAIReferralBreakdown,
  getAIReferralDaily,
} from "@/lib/admin/events-store";

export async function AIReferralPanel({ from, to }: { from: Date; to: Date }) {
  let breakdown: { aiReferrer: string; count: number }[] = [];
  let daily: { date: string; total: number }[] = [];
  try {
    [breakdown, daily] = await Promise.all([
      getAIReferralBreakdown(from, to),
      getAIReferralDaily(from, to),
    ]);
  } catch {
    // DB unavailable — render empty state below
  }

  const total = breakdown.reduce((sum, r) => sum + r.count, 0);

  return (
    <Card>
      <CardBody compact>
        <h2 className="font-body font-semibold text-[13px] mb-4">
          AI referrals · last range
        </h2>
        {total === 0 ? (
          <p className="text-sm text-[var(--color-fg-subtle)]">
            No AI-attributed traffic recorded for this range yet. Once visitors
            land from ChatGPT, Perplexity, Claude, etc. (with{" "}
            <code>utm_source</code> or a referer), they&apos;ll show here.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DonutChart
              data={breakdown.map((r) => ({ name: r.aiReferrer, value: r.count }))}
            />
            <TimeSeriesChart
              data={daily.map((d) => ({ date: d.date, total: d.total }))}
              dataKeys={[{ key: "total", color: "#A07ED9", label: "AI visits" }]}
              height={200}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}
```

- [ ] **Step 3: Build the organic search panel**

```tsx
// src/app/admin/(dashboard)/measurement/_components/OrganicSearchPanel.tsx
import { Card, CardBody } from "@/components/admin/ui";
import { StatCard } from "../../components/charts/StatCard";
import { getOrganicSearchTotals } from "@/lib/analytics/ga4";

export async function OrganicSearchPanel({ from, to }: { from: Date; to: Date }) {
  const totals = await getOrganicSearchTotals(from, to);
  return (
    <Card>
      <CardBody compact>
        <h2 className="font-body font-semibold text-[13px] mb-4">Organic search</h2>
        {!totals.configured ? (
          <p className="text-sm text-[var(--color-fg-subtle)]">
            GA4 not configured. Set <code>GA4_PROPERTY_ID</code> and{" "}
            <code>GOOGLE_APPLICATION_CREDENTIALS_JSON</code> to populate this panel.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Organic sessions" value={totals.sessions} />
            <StatCard label="Organic users" value={totals.users} />
          </div>
        )}
      </CardBody>
    </Card>
  );
}
```

- [ ] **Step 4: Build the citations panel**

```tsx
// src/app/admin/(dashboard)/measurement/_components/CitationsPanel.tsx
import Link from "next/link";
import { Card, CardBody } from "@/components/admin/ui";
import { TimeSeriesChart } from "../../components/charts/TimeSeriesChart";
import { getLatestRunMatrix, getMentionRateOverTime } from "@/lib/citation-tests/store";

export async function CitationsPanel() {
  let matrix: Awaited<ReturnType<typeof getLatestRunMatrix>> = [];
  let series: Awaited<ReturnType<typeof getMentionRateOverTime>> = [];
  try {
    [matrix, series] = await Promise.all([
      getLatestRunMatrix(),
      getMentionRateOverTime(12),
    ]);
  } catch {
    // table missing or DB down
  }

  const totalLatest = matrix.length;
  const mentionedLatest = matrix.filter((r) => r.mentioned).length;
  const mentionRate = totalLatest > 0 ? (mentionedLatest / totalLatest) * 100 : 0;

  return (
    <Card>
      <CardBody compact>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-body font-semibold text-[13px]">Answer-engine citations</h2>
          <Link href="/admin/measurement/citations" className="text-xs underline">
            Manage prompts →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Latest mention rate
            </p>
            <p className="text-xl font-mono tabular-nums">{mentionRate.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Mentioned (latest)
            </p>
            <p className="text-xl font-mono tabular-nums">{mentionedLatest}/{totalLatest}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Tracked weeks
            </p>
            <p className="text-xl font-mono tabular-nums">{series.length}</p>
          </div>
        </div>

        {series.length > 0 ? (
          <TimeSeriesChart
            data={series.map((s) => ({ date: s.date, rate: Math.round(s.rate * 100) }))}
            dataKeys={[{ key: "rate", color: "#4AAE8C", label: "Mention rate %" }]}
            height={200}
          />
        ) : (
          <p className="text-sm text-[var(--color-fg-subtle)]">
            No citation runs recorded yet. The cron runs Mondays 09:00 UTC, or
            trigger one from the citations page.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
```

- [ ] **Step 5: Build the funnel panel**

```tsx
// src/app/admin/(dashboard)/measurement/_components/ContentCoachingFunnel.tsx
import { Card, CardBody } from "@/components/admin/ui";
import { FunnelDisplay } from "../../components/charts/FunnelDisplay";
import { getContentCoachingFunnel } from "@/lib/admin/events-store";

export async function ContentCoachingFunnel({ from, to }: { from: Date; to: Date }) {
  let stats = {
    contentViews: 0,
    newsletterSignups: 0,
    coachingPageViews: 0,
    applyPageViews: 0,
    applySubmits: 0,
  };
  try {
    stats = await getContentCoachingFunnel(from, to);
  } catch {
    // empty
  }

  return (
    <Card>
      <CardBody compact>
        <h2 className="font-body font-semibold text-[13px] mb-4">
          Content → coaching funnel
        </h2>
        <FunnelDisplay
          steps={[
            { label: "Content pageviews", value: stats.contentViews },
            { label: "Newsletter signups", value: stats.newsletterSignups },
            { label: "/coaching views", value: stats.coachingPageViews },
            { label: "/apply views", value: stats.applyPageViews },
            { label: "Apply submits", value: stats.applySubmits },
          ]}
        />
      </CardBody>
    </Card>
  );
}
```

- [ ] **Step 6: Build the dashboard page**

```tsx
// src/app/admin/(dashboard)/measurement/page.tsx
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireAuth } from "@/lib/admin/auth";
import { parseTimeRangeWithComparison } from "@/lib/admin/time-ranges";
import { PageHeader } from "@/components/admin/ui";
import { TimeRangePicker } from "../components/TimeRangePicker";
import { OrganicSearchPanel } from "./_components/OrganicSearchPanel";
import { AIReferralPanel } from "./_components/AIReferralPanel";
import { CitationsPanel } from "./_components/CitationsPanel";
import { ContentCoachingFunnel } from "./_components/ContentCoachingFunnel";

export default async function MeasurementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireAuth();
  if (user.role !== "admin") redirect("/admin/my-day");

  const params = await searchParams;
  const rangeParam = typeof params.range === "string" ? params.range : "30d";
  const { from, to } = parseTimeRangeWithComparison(rangeParam);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Measurement"
        subtitle="Organic, AI referrals, answer-engine citations, content → coaching"
        actions={
          <Suspense fallback={null}>
            <TimeRangePicker />
          </Suspense>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* @ts-expect-error Async server component */}
        <OrganicSearchPanel from={from} to={to} />
        {/* @ts-expect-error Async server component */}
        <AIReferralPanel from={from} to={to} />
      </div>
      {/* @ts-expect-error Async server component */}
      <CitationsPanel />
      {/* @ts-expect-error Async server component */}
      <ContentCoachingFunnel from={from} to={to} />
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/admin/\(dashboard\)/measurement/ src/lib/analytics/ga4.ts
git commit -m "feat(admin): measurement dashboard page (DEV-DATA-01)"
```

---

### Task 15: Citations admin page (CRUD + matrix + manual run)

**Files:**
- Create: `src/app/admin/(dashboard)/measurement/citations/page.tsx`
- Create: `src/app/admin/(dashboard)/measurement/citations/actions.ts`

- [ ] **Step 1: Server actions**

```ts
// src/app/admin/(dashboard)/measurement/citations/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/admin/auth";
import {
  addPrompt,
  deletePrompt,
  setPromptEnabled,
} from "@/lib/citation-tests/store";
import { runAllPrompts } from "@/lib/citation-tests";

async function ensureAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") throw new Error("Forbidden");
}

export async function createPromptAction(formData: FormData) {
  await ensureAdmin();
  const prompt = String(formData.get("prompt") ?? "").trim();
  const category = String(formData.get("category") ?? "general").trim();
  if (!prompt) return;
  await addPrompt(prompt, category);
  revalidatePath("/admin/measurement/citations");
}

export async function togglePromptAction(formData: FormData) {
  await ensureAdmin();
  const id = Number(formData.get("id"));
  const enabled = formData.get("enabled") === "true";
  if (!Number.isFinite(id)) return;
  await setPromptEnabled(id, enabled);
  revalidatePath("/admin/measurement/citations");
}

export async function deletePromptAction(formData: FormData) {
  await ensureAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await deletePrompt(id);
  revalidatePath("/admin/measurement/citations");
}

export async function runNowAction() {
  await ensureAdmin();
  const summary = await runAllPrompts();
  revalidatePath("/admin/measurement/citations");
  revalidatePath("/admin/measurement");
  return summary;
}
```

- [ ] **Step 2: Page**

```tsx
// src/app/admin/(dashboard)/measurement/citations/page.tsx
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/admin/auth";
import { Card, CardBody, PageHeader } from "@/components/admin/ui";
import { listAllPrompts, getLatestRunMatrix } from "@/lib/citation-tests/store";
import {
  createPromptAction,
  togglePromptAction,
  deletePromptAction,
  runNowAction,
} from "./actions";

export default async function CitationsAdminPage() {
  const user = await requireAuth();
  if (user.role !== "admin") redirect("/admin/my-day");

  let prompts: Awaited<ReturnType<typeof listAllPrompts>> = [];
  let matrix: Awaited<ReturnType<typeof getLatestRunMatrix>> = [];
  try {
    [prompts, matrix] = await Promise.all([listAllPrompts(), getLatestRunMatrix()]);
  } catch {
    // empty
  }

  // Group matrix by promptId for table rendering
  const byPrompt = new Map<number, typeof matrix>();
  for (const r of matrix) {
    const list = byPrompt.get(r.promptId) ?? [];
    list.push(r);
    byPrompt.set(r.promptId, list);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Brand citation tests"
        subtitle="Prompts run weekly against ChatGPT, Perplexity, Claude, Gemini"
        actions={
          <form action={runNowAction}>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs rounded bg-[var(--color-accent)] text-white"
            >
              Run now
            </button>
          </form>
        }
      />

      <Card>
        <CardBody compact>
          <h2 className="font-body font-semibold text-[13px] mb-4">Add prompt</h2>
          <form action={createPromptAction} className="flex flex-col gap-3">
            <textarea
              name="prompt"
              required
              rows={2}
              placeholder="What is zone 2 training?"
              className="text-sm bg-transparent border border-[var(--color-border)] rounded p-2"
            />
            <div className="flex gap-3">
              <input
                name="category"
                defaultValue="general"
                className="text-sm bg-transparent border border-[var(--color-border)] rounded p-2 flex-1"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs rounded border border-[var(--color-border)]"
              >
                Add
              </button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody compact>
          <h2 className="font-body font-semibold text-[13px] mb-4">
            Prompts ({prompts.length})
          </h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">
                <th className="pb-2">Prompt</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Latest results</th>
                <th className="pb-2">Status</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((p) => {
                const runs = byPrompt.get(p.id) ?? [];
                return (
                  <tr key={p.id} className="border-b border-white/[0.03]">
                    <td className="py-2 text-sm">{p.prompt}</td>
                    <td className="py-2 text-xs text-[var(--color-fg-muted)]">
                      {p.category}
                    </td>
                    <td className="py-2 text-xs">
                      {runs.length === 0 ? (
                        <span className="text-[var(--color-fg-subtle)]">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {runs.map((r) => (
                            <span
                              key={r.model}
                              title={`${r.model} · ${r.ranAt.toISOString().slice(0, 10)}${r.error ? " · " + r.error : ""}`}
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                r.error
                                  ? "bg-[var(--color-bad-tint)] text-[var(--color-bad)]"
                                  : r.mentioned
                                    ? "bg-[var(--color-good-tint)] text-[var(--color-good)]"
                                    : "bg-[var(--color-warn-tint)] text-[var(--color-warn)]"
                              }`}
                            >
                              {r.model.split(":")[0]} {r.error ? "✕" : r.mentioned ? "✓" : "○"}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-2 text-xs">
                      <form action={togglePromptAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="enabled" value={String(!p.enabled)} />
                        <button type="submit" className="underline">
                          {p.enabled ? "Disable" : "Enable"}
                        </button>
                      </form>
                    </td>
                    <td className="py-2 text-right">
                      <form action={deletePromptAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="text-xs text-[var(--color-bad)] underline"
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Add measurement to AdminSidebar**

In `src/app/admin/(dashboard)/AdminSidebar.tsx`, find the "Growth" section's items array. Add as the first item:

```ts
      { href: "/admin/measurement", label: "Measurement", icon: "pulse" },
```

(If `pulse` isn't a valid icon name in this sidebar, use whatever existing icon is closest — e.g. `trending` or `grid`.)

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/\(dashboard\)/measurement/citations/ src/app/admin/\(dashboard\)/AdminSidebar.tsx
git commit -m "feat(admin): citations admin page + sidebar entry (DEV-DATA-03)"
```

---

## Phase 4: Verify and merge

### Task 16: Full verification pass

- [ ] **Step 1: Run all new tests**

```bash
npx vitest run tests/analytics/ tests/citation-tests/
# Expected: ~25 tests pass
```

- [ ] **Step 2: Run full test suite**

```bash
npm run test:run
# Expected: existing + new tests all pass
```

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
# Expected: 0 errors
```

- [ ] **Step 4: Lint**

```bash
npm run lint
# Expected: 0 errors (warnings okay if pre-existing)
```

- [ ] **Step 5: Apply migration locally if POSTGRES_URL is set**

```bash
[ -n "$POSTGRES_URL" ] && npm run db:migrate || echo "POSTGRES_URL unset — skipping migration apply"
```

- [ ] **Step 6: Smoke the dashboard**

If a local dev DB is available, start dev server and load `/admin/measurement` — confirm panels render with empty states and no runtime errors.

If no DB available, skip and note that production verification will happen post-merge against the real DB.

### Task 17: Merge to main

- [ ] **Step 1: Final review**

```bash
git log --oneline main..HEAD
# Should show ~12 focused commits.
git diff --stat main..HEAD
```

- [ ] **Step 2: Merge worktree branch into main**

The worktree's branch is `claude/ecstatic-heyrovsky-2bace9`. From the worktree:

```bash
# Push the branch first, in case the user wants the PR view:
git push -u origin claude/ecstatic-heyrovsky-2bace9
```

Then in the **main repo** working tree (not the worktree — switch terminals or use `git -C`):

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git fetch origin
git checkout main
git pull --ff-only origin main
git merge --no-ff claude/ecstatic-heyrovsky-2bace9 -m "merge: measurement workstream (DEV-DATA-01/02/03)"
git push origin main
```

- [ ] **Step 3: Mark complete**

Confirm to user with summary of what shipped and which env keys to set in production (`PERPLEXITY_API_KEY`, `GOOGLE_AI_API_KEY` optional; without them the cron just runs Anthropic + OpenAI).

---

## Spec coverage check

| Spec section | Implemented in |
|---|---|
| DEV-DATA-01 dashboard | Tasks 14, 15 |
| DEV-DATA-01 funnel definition | Task 3 (helper), Task 4 (event), Task 14 (panel) |
| DEV-DATA-01 organic search | Tasks 14 step 1, 14 step 3 |
| DEV-DATA-02 server-side AI referrer | Tasks 2, 3 |
| DEV-DATA-02 indexed column + backfill | Task 1 |
| DEV-DATA-02 canonical audit + README | Task 5 |
| DEV-DATA-03 schema | Task 1 |
| DEV-DATA-03 providers | Tasks 6, 7, 8, 9 |
| DEV-DATA-03 detection | Task 10 |
| DEV-DATA-03 store + seed | Task 11 |
| DEV-DATA-03 orchestrator | Task 12 |
| DEV-DATA-03 cron + admin run | Task 13 |
| DEV-DATA-03 admin UI | Task 15 |
| Verify, lint, typecheck, merge | Tasks 16, 17 |

All spec requirements have a task. No placeholders. Type signatures consistent across tasks (`CitationProvider`, `ProviderResult`, `BrandPrompt`, `NewRunRow`, `CoachingFunnelStats`).
