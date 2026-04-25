# Ask Roadman $€” Phase 0 + Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a live `/ask` page at roadmancycling.com that streams grounded, cited, on-brand answers over the existing PR #76 MCP corpus (episodes + methodology), with safety guardrails, CTA routing, session + message logging, anon rate-limiting, and analytics events. End state: Anthony can load `/ask`, type a question, watch an answer stream in with source citations and a contextual Roadman CTA.

**Architecture:** Next.js 16 App Router route at `/ask`; Server-Sent Events from `POST /api/ask` driven by an `Anthropic.messages.stream()` call (Opus 4.7 for answer, Haiku 4.5 for intent classification); retrieval fan-out wraps PR #76's `searchEpisodes` / `searchMethodology` services plus a stubbed `content_chunks` search; safety pre-filter + post-filter guard unsafe queries; all sessions + messages + retrievals persisted via Drizzle for admin review.

**Tech Stack:** Next.js 16, React 19, TypeScript, Drizzle ORM, Vercel Postgres + pgvector, `@anthropic-ai/sdk` v0.82, `@upstash/ratelimit`, Tailwind v4, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-04-24-ask-roadman-mvp-design.md`
**Subsequent phases** (own plans): Phase 2 Saved Diagnostics, Phase 3 Profile handoff, Phase 4 Corpus expansion, Phase 5 Admin depth, Phase 6 Roadman+ tier shell.

---

## File Structure (what this plan creates/modifies)

**New files:**

```
drizzle/0028_ask_roadman_and_rider_profiles.sql

src/lib/ask/
  orchestrator.ts                # streamAnswer({query, session, profile}) pipeline
  system-prompt.ts                # Ask Roadman system prompt (exported string + fn)
  safety.ts                       # pre-filter + extractSafetyFlags + post-filter
  intent.ts                       # classifyIntent via Haiku
  cta.ts                          # intent Ã— retrieval $†’ CtaDescriptor
  store.ts                        # DB: createSession, appendMessage, appendRetrievals, loadSession
  stream.ts                       # SSE encoder + Anthropic stream bridge
  rate-limit.ts                   # tier-aware Upstash wrapper
  types.ts                        # shared types: Intent, CtaDescriptor, RetrievalResult, etc.
  retrieval/
    index.ts                      # retrieve({query, intent, profile}) fan-out + merge
    content-chunks.ts             # stub returning []; real impl in Phase 4
  # (episodes/methodology/experts/products already exist at src/lib/mcp/services/*)

src/lib/rider-profile/
  types.ts                        # RiderProfile, UpsertInput
  store.ts                        # upsertByEmail, loadByEmail, loadByAnonKey
  anon-session.ts                 # cookie read/write helpers

src/lib/analytics/
  ask-events.ts                   # typed wrapper around trackAnalyticsEvent for ~15 events

src/app/api/ask/
  route.ts                        # POST streams SSE; GET returns 405
  session/route.ts                # GET loads current session by cookie or email
  feedback/route.ts               # POST records thumbs up/down
  cta-click/route.ts              # POST logs a CTA click

src/app/(marketing)/ask/
  page.tsx                        # RSC shell: load session, pass to client
  AskRoadmanClient.tsx            # top-level client component, owns chat state
  AskShell.tsx                    # dark theme layout with header
  StarterPrompts.tsx              # 6 coral prompt chips
  MessageList.tsx                 # list of user/assistant messages
  StreamingMessage.tsx            # renders SSE delta + citation pills
  CitationCard.tsx                # episode/methodology preview card
  CtaCard.tsx                     # contextual Roadman product CTA
  SafetyBanner.tsx                # medical/injury escalation banner
  EmailCapturePrompt.tsx          # shown after N messages
  use-ask-stream.ts               # client hook for SSE + message state
  styles.module.css               # chat polish

tests/ask/
  safety.test.ts
  intent.test.ts
  cta.test.ts
  retrieval.test.ts
  orchestrator.test.ts
  store.test.ts
tests/rider-profile/
  store.test.ts
tests/e2e/
  ask-smoke.spec.ts               # Playwright smoke

scripts/
  qa-ask-roadman.ts               # runs 20 canned questions end-to-end
```

**Modified files:**

```
src/lib/db/schema.ts              # add rider_profiles, ask_sessions, ask_messages, ask_retrievals
.env.example                      # document new env vars
```

---

## Conventions used throughout this plan

- All test runs use `npm run test:run -- <path>` (vitest single-shot, not watch mode).
- All DB migrations: generated via `npm run db:generate`, applied via `npm run db:migrate`.
- Commits in this plan all use conventional-commit prefix `feat(ask):`, `chore(ask):`, etc.
- Every task ends with its own commit. Commits are small and self-contained.
- Every new module has a matching `*.test.ts` file sharing the name (e.g. `safety.ts` $†” `tests/ask/safety.test.ts`).
- Type names: `Intent`, `CtaDescriptor`, `RetrievalResult`, `AskSession`, `AskMessage`, `AskRetrieval`, `RiderProfile`, `SafetyFlag`, `SafetyDecision`.
- Anthropic model IDs: `claude-opus-4-7` (primary), `claude-haiku-4-5-20251001` (intent + classifications).

---

# Phase 0 $€” Foundations

## Task 0.1: Confirm env vars + document new ones

**Files:**
- Modify: `.env.example`

- [ ] **Step 1:** Open `.env.example` and append this block at the end (keep existing content intact):

```
# Ask Roadman
# Voyage AI $€” already used by PR #76 MCP server for embeddings
VOYAGE_API_KEY=
# Embedding provider override (voyage | openai). Defaults to voyage.
EMBEDDING_PROVIDER=voyage
# OpenAI fallback for embeddings (only needed if EMBEDDING_PROVIDER=openai)
OPENAI_API_KEY=

# Upstash Redis $€” already used by PR #76 rate limiter
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Ask Roadman rate limits (req per window, per session or IP)
ASK_ROADMAN_ANON_RPM=5
ASK_ROADMAN_ANON_DAILY=10
ASK_ROADMAN_PROFILE_RPH=30
```

- [ ] **Step 2:** Commit.
```bash
git add .env.example
git commit -m "chore(ask): document env vars for Ask Roadman"
```

---

## Task 0.2: Apply PR #76 seed scripts so retrieval has real data

**Context:** PR #76 shipped seed scripts but they require external data files. For Phase 1 QA we need at least episodes + methodology populated.

**Files:**
- Read (do not modify): `scripts/seed-mcp-content.ts`, `SEED_PLACEHOLDERS.md`

- [ ] **Step 1:** Read `SEED_PLACEHOLDERS.md` end-to-end. It documents what each seed script expects.

- [ ] **Step 2:** Check if production DB already has data $€” run:
```bash
psql "$POSTGRES_URL" -c "SELECT count(*) FROM mcp_episodes; SELECT count(*) FROM mcp_methodology_principles;"
```
Expected: both counts > 0 if seeded, 0 if not.

- [ ] **Step 3:** If counts are 0, run the seed scripts (in this order):
```bash
npm run seed:mcp:community-stats
npm run seed:mcp:products
npm run seed:mcp:events
npm run seed:mcp:content
```
Each script is idempotent (upsert by unique key). Re-running is safe.

- [ ] **Step 4:** After `seed:mcp:content`, verify episodes and methodology have embeddings:
```bash
psql "$POSTGRES_URL" -c "SELECT count(*) FROM mcp_episode_embeddings; SELECT count(*) FROM mcp_methodology_embeddings;"
```
Expected: both > 0. If not, the seed script's embedding step failed $€” debug via `node scripts/seed-mcp-content.ts 2>&1 | tail -40`.

- [ ] **Step 5:** Smoke-test retrieval by hitting MCP directly:
```bash
curl -s -X POST http://localhost:3000/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_episodes","arguments":{"query":"zone 2 training","limit":3}}}' | jq '.result.content[0].text | fromjson | length'
```
Expected: 1-3. Non-zero means retrieval is live.

- [ ] **Step 6:** No commit $€” this is one-shot seeding, not code.

---

## Task 0.3: Generate + apply migration 0028 (rider_profiles + ask_* tables)

**Files:**
- Modify: `src/lib/db/schema.ts`
- Create: `drizzle/0028_ask_roadman_and_rider_profiles.sql` (generated by drizzle-kit)

- [ ] **Step 1:** Read the existing `src/lib/db/schema.ts` tail (last 30 lines) to confirm the file ends cleanly:
```bash
tail -30 src/lib/db/schema.ts
```

- [ ] **Step 2:** Append to `src/lib/db/schema.ts` (imports already include `pgTable, serial, text, integer, boolean, timestamp, jsonb, uuid, numeric, index` $€” if any are missing, add to the existing import at the top; specifically `uuid`, `numeric`, and `date` may need to be added):

```ts
// $•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•
// Ask Roadman + Rider Profiles
// $•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•$•

export const riderProfiles = pgTable(
  "rider_profiles",
  {
    id: serial("id").primaryKey(),
    contactId: integer("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
    email: text("email").notNull().unique(),
    firstName: text("first_name"),
    ageRange: text("age_range"),                        // under_35 | 35_44 | 45_54 | 55_plus
    discipline: text("discipline"),                     // road | gravel | triathlon | endurance | masters | other
    weeklyTrainingHours: integer("weekly_training_hours"),
    currentFtp: integer("current_ftp"),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    mainGoal: text("main_goal"),
    targetEvent: text("target_event"),
    targetEventDate: date("target_event_date"),
    biggestLimiter: text("biggest_limiter"),
    usesPowerMeter: boolean("uses_power_meter"),
    currentTrainingTool: text("current_training_tool"),
    coachingInterest: text("coaching_interest"),        // none | curious | interested | ready
    accessTier: text("access_tier").notNull().default("free"), // free | plus | vip
    consentSaveProfile: boolean("consent_save_profile").notNull().default(false),
    consentEmailFollowup: boolean("consent_email_followup").notNull().default(false),
    consentRecordedAt: timestamp("consent_recorded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("rider_profiles_email_idx").on(table.email),
    index("rider_profiles_contact_id_idx").on(table.contactId),
  ]
);

export const askSessions = pgTable(
  "ask_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    riderProfileId: integer("rider_profile_id").references(() => riderProfiles.id, { onDelete: "set null" }),
    anonSessionKey: text("anon_session_key"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
    messageCount: integer("message_count").notNull().default(0),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    utmSource: text("utm_source"),
    utmCampaign: text("utm_campaign"),
  },
  (table) => [
    index("ask_sessions_rider_profile_id_idx").on(table.riderProfileId),
    index("ask_sessions_anon_session_key_idx").on(table.anonSessionKey),
    index("ask_sessions_last_activity_at_idx").on(table.lastActivityAt),
  ]
);

export const askMessages = pgTable(
  "ask_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => askSessions.id, { onDelete: "cascade" }),
    role: text("role").notNull(),                       // user | assistant | system
    content: text("content").notNull(),
    citations: jsonb("citations").$type<Array<{
      type: "episode" | "methodology" | "content_chunk" | "expert_quote";
      source_id: string;
      title: string;
      url?: string;
      excerpt?: string;
    }>>(),
    ctaRecommended: text("cta_recommended"),
    safetyFlags: text("safety_flags").array(),
    confidence: text("confidence"),                     // high | medium | low
    model: text("model"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    latencyMs: integer("latency_ms"),
    flaggedForReview: boolean("flagged_for_review").notNull().default(false),
    adminNote: text("admin_note"),
    adminPreferredAnswer: text("admin_preferred_answer"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("ask_messages_session_id_idx").on(table.sessionId),
    index("ask_messages_created_at_idx").on(table.createdAt),
  ]
);

export const askRetrievals = pgTable(
  "ask_retrievals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id").notNull().references(() => askMessages.id, { onDelete: "cascade" }),
    sourceType: text("source_type").notNull(),          // episode | methodology | content_chunk | expert_quote
    sourceId: text("source_id").notNull(),
    chunkText: text("chunk_text"),
    score: numeric("score", { precision: 6, scale: 4 }),
    usedInAnswer: boolean("used_in_answer").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("ask_retrievals_message_id_idx").on(table.messageId),
  ]
);
```

- [ ] **Step 3:** If `numeric`, `uuid`, `date` are not imported at the top of `schema.ts`, add them to the existing `drizzle-orm/pg-core` import. Find the import line and extend it.

- [ ] **Step 4:** Generate the migration:
```bash
npm run db:generate
```
Expected: creates `drizzle/0028_*.sql` with the new tables + indexes. Review the file $€” it should contain `CREATE TABLE "rider_profiles"`, `CREATE TABLE "ask_sessions"`, `CREATE TABLE "ask_messages"`, `CREATE TABLE "ask_retrievals"`.

- [ ] **Step 5:** Rename the generated file to `drizzle/0028_ask_roadman_and_rider_profiles.sql` (drop any autogenerated suffix).

- [ ] **Step 6:** Apply the migration locally:
```bash
npm run db:migrate
```
Expected: no errors; new tables exist.

- [ ] **Step 7:** Verify via psql:
```bash
psql "$POSTGRES_URL" -c "\\dt rider_profiles|ask_sessions|ask_messages|ask_retrievals"
```
Expected: 4 tables listed.

- [ ] **Step 8:** Commit.
```bash
git add drizzle/0028_*.sql drizzle/meta/_journal.json drizzle/meta/*.json src/lib/db/schema.ts
git commit -m "feat(ask): add rider_profiles + ask_sessions/messages/retrievals (migration 0028)"
```

---

## Task 0.4: Next 16 docs sanity check

**Context:** AGENTS.md mandates reading `node_modules/next/dist/docs/` for the APIs we'll use before writing them. This task is a one-off read so subsequent tasks proceed safely.

- [ ] **Step 1:** List what's documented:
```bash
ls node_modules/next/dist/docs/
```

- [ ] **Step 2:** Read the App Router route handlers doc (path depends on Next's own structure $€” search for "route-handlers" or "api-reference"):
```bash
find node_modules/next/dist/docs -name '*route*' -o -name '*streaming*' | head
```

- [ ] **Step 3:** Read any files that turn up. Take note of:
  - How to return a streaming `Response`
  - Current signature for `export const runtime` and `export const dynamic`
  - Any changes to `cookies()` / `headers()` from `next/headers` (they became async in Next 15+)
  - The `request` argument type on route handlers

- [ ] **Step 4:** No commit. Take notes in your head / a scratchpad for Task 12.

---

# Phase 1 $€” Ask Roadman thin slice

## Task 1: Shared types module

**Files:**
- Create: `src/lib/ask/types.ts`

- [ ] **Step 1:** Create `src/lib/ask/types.ts`:
```ts
// Ask Roadman shared types. Server-only module $€” no React imports.

export type Intent =
  | "plateau"
  | "fuelling"
  | "content_discovery"
  | "recovery_masters"
  | "event_prep"
  | "coaching_decision"
  | "training_general"
  | "safety_medical"
  | "safety_injury"
  | "safety_weight"
  | "off_topic"
  | "unknown";

export interface IntentClassification {
  intent: Intent;
  confidence: "high" | "medium" | "low";
  deep: boolean;                   // true $†’ route to Opus; false $†’ Haiku
  needsProfile: boolean;           // true $†’ inject profile into context
}

export type SafetyFlag =
  | "medical_escalation"
  | "injury_escalation"
  | "extreme_weight_loss"
  | "dangerous_training"
  | "underage";

export interface SafetyDecision {
  flags: SafetyFlag[];
  block: boolean;                  // true $†’ bypass RAG, return fixed template
  templateKey?: "medical" | "injury" | "weight" | "dangerous";
}

export type CtaKey =
  | "plateau_diagnostic"
  | "fuelling_calculator"
  | "ftp_zones"
  | "saturday_spin"
  | "clubhouse"
  | "roadman_plus"
  | "ndy_coaching"
  | "vip_coaching"
  | "episode_list"
  | "none";

export interface CtaDescriptor {
  key: CtaKey;
  title: string;
  body: string;
  href: string;
  analyticsEvent: string;          // e.g. 'cta_clicked:plateau_diagnostic'
}

export interface RetrievedChunk {
  sourceType: "episode" | "methodology" | "content_chunk" | "expert_quote";
  sourceId: string;
  title: string;
  url?: string;
  excerpt: string;
  score: number;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  totalCandidates: number;         // how many were considered before merge/cap
}

export interface AskMessageRecord {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations: Array<{
    type: RetrievedChunk["sourceType"];
    source_id: string;
    title: string;
    url?: string;
    excerpt?: string;
  }> | null;
  ctaRecommended: string | null;
  safetyFlags: string[] | null;
  confidence: "high" | "medium" | "low" | null;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number | null;
  flaggedForReview: boolean;
  createdAt: Date;
}

export interface OrchestratorInput {
  query: string;
  sessionId: string;
  riderProfileId: number | null;
  ip: string;
}

export interface OrchestratorEmit {
  type: "meta" | "delta" | "citation" | "cta" | "safety" | "done" | "error";
  data: unknown;
}
```

- [ ] **Step 2:** Run the TypeScript check to make sure it compiles:
```bash
npx tsc --noEmit
```
Expected: no errors in this file.

- [ ] **Step 3:** Commit.
```bash
git add src/lib/ask/types.ts
git commit -m "feat(ask): shared types for orchestrator + retrieval + CTA"
```

---

## Task 2: Rider profile store + anon session cookie

**Files:**
- Create: `src/lib/rider-profile/types.ts`
- Create: `src/lib/rider-profile/store.ts`
- Create: `src/lib/rider-profile/anon-session.ts`
- Create: `tests/rider-profile/store.test.ts`

- [ ] **Step 1:** Create `src/lib/rider-profile/types.ts`:
```ts
export interface RiderProfile {
  id: number;
  contactId: number | null;
  email: string;
  firstName: string | null;
  ageRange: string | null;
  discipline: string | null;
  weeklyTrainingHours: number | null;
  currentFtp: number | null;
  mainGoal: string | null;
  biggestLimiter: string | null;
  coachingInterest: string | null;
  accessTier: "free" | "plus" | "vip";
  consentSaveProfile: boolean;
  consentEmailFollowup: boolean;
  consentRecordedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertRiderProfileInput {
  email: string;
  firstName?: string | null;
  ageRange?: string | null;
  discipline?: string | null;
  weeklyTrainingHours?: number | null;
  currentFtp?: number | null;
  mainGoal?: string | null;
  biggestLimiter?: string | null;
  coachingInterest?: string | null;
  consentSaveProfile?: boolean;
  consentEmailFollowup?: boolean;
}
```

- [ ] **Step 2:** Create `src/lib/rider-profile/anon-session.ts`:
```ts
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

const COOKIE_NAME = "roadman_ask_anon";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days

export async function getOrCreateAnonSessionKey(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME);
  if (existing?.value) return existing.value;
  const key = randomBytes(24).toString("base64url");
  jar.set(COOKIE_NAME, key, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
  return key;
}

export async function readAnonSessionKey(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}
```

- [ ] **Step 3:** Write the failing test. Create `tests/rider-profile/store.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { upsertByEmail, loadByEmail } from "@/lib/rider-profile/store";
import { db } from "@/lib/db";
import { riderProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const TEST_EMAIL = "test-ask-riderprofile@roadmancycling.test";

describe("rider-profile/store", () => {
  beforeEach(async () => {
    await db.delete(riderProfiles).where(eq(riderProfiles.email, TEST_EMAIL));
  });

  it("creates a new profile on first upsert and records consent timestamp when consent is true", async () => {
    const profile = await upsertByEmail({
      email: TEST_EMAIL,
      firstName: "Tom",
      discipline: "road",
      consentSaveProfile: true,
      consentEmailFollowup: true,
    });
    expect(profile.email).toBe(TEST_EMAIL);
    expect(profile.firstName).toBe("Tom");
    expect(profile.consentSaveProfile).toBe(true);
    expect(profile.consentRecordedAt).toBeInstanceOf(Date);
    expect(profile.accessTier).toBe("free");
  });

  it("merges fields on subsequent upsert without clobbering existing values when undefined passed", async () => {
    await upsertByEmail({ email: TEST_EMAIL, firstName: "Tom", discipline: "road" });
    const merged = await upsertByEmail({ email: TEST_EMAIL, currentFtp: 240 });
    expect(merged.firstName).toBe("Tom");
    expect(merged.discipline).toBe("road");
    expect(merged.currentFtp).toBe(240);
  });

  it("loadByEmail returns null for unknown email", async () => {
    const none = await loadByEmail("no-such-user@roadmancycling.test");
    expect(none).toBeNull();
  });
});
```

- [ ] **Step 4:** Run the test to see it fails:
```bash
npm run test:run -- tests/rider-profile/store.test.ts
```
Expected: fails with "Cannot find module '@/lib/rider-profile/store'".

- [ ] **Step 5:** Create `src/lib/rider-profile/store.ts`:
```ts
import { db } from "@/lib/db";
import { riderProfiles, contacts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import type { RiderProfile, UpsertRiderProfileInput } from "./types";

function toDomain(row: typeof riderProfiles.$inferSelect): RiderProfile {
  return {
    id: row.id,
    contactId: row.contactId,
    email: row.email,
    firstName: row.firstName,
    ageRange: row.ageRange,
    discipline: row.discipline,
    weeklyTrainingHours: row.weeklyTrainingHours,
    currentFtp: row.currentFtp,
    mainGoal: row.mainGoal,
    biggestLimiter: row.biggestLimiter,
    coachingInterest: row.coachingInterest,
    accessTier: (row.accessTier as RiderProfile["accessTier"]) ?? "free",
    consentSaveProfile: row.consentSaveProfile,
    consentEmailFollowup: row.consentEmailFollowup,
    consentRecordedAt: row.consentRecordedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function loadByEmail(email: string): Promise<RiderProfile | null> {
  const [row] = await db
    .select()
    .from(riderProfiles)
    .where(eq(riderProfiles.email, email))
    .limit(1);
  return row ? toDomain(row) : null;
}

export async function loadById(id: number): Promise<RiderProfile | null> {
  const [row] = await db
    .select()
    .from(riderProfiles)
    .where(eq(riderProfiles.id, id))
    .limit(1);
  return row ? toDomain(row) : null;
}

export async function upsertByEmail(input: UpsertRiderProfileInput): Promise<RiderProfile> {
  const consentBeingSet =
    input.consentSaveProfile === true || input.consentEmailFollowup === true;
  const now = new Date();

  // First, upsert the contact by email so the FK is valid.
  const [contact] = await db
    .insert(contacts)
    .values({ email: input.email, name: input.firstName ?? undefined })
    .onConflictDoUpdate({
      target: contacts.email,
      set: { updatedAt: now },
    })
    .returning();

  // Build the patch $€” only set fields that were explicitly passed (undefined preserves existing).
  const patch: Record<string, unknown> = { updatedAt: now };
  if (input.firstName !== undefined) patch.firstName = input.firstName;
  if (input.ageRange !== undefined) patch.ageRange = input.ageRange;
  if (input.discipline !== undefined) patch.discipline = input.discipline;
  if (input.weeklyTrainingHours !== undefined) patch.weeklyTrainingHours = input.weeklyTrainingHours;
  if (input.currentFtp !== undefined) patch.currentFtp = input.currentFtp;
  if (input.mainGoal !== undefined) patch.mainGoal = input.mainGoal;
  if (input.biggestLimiter !== undefined) patch.biggestLimiter = input.biggestLimiter;
  if (input.coachingInterest !== undefined) patch.coachingInterest = input.coachingInterest;
  if (input.consentSaveProfile !== undefined) patch.consentSaveProfile = input.consentSaveProfile;
  if (input.consentEmailFollowup !== undefined) patch.consentEmailFollowup = input.consentEmailFollowup;
  if (consentBeingSet) patch.consentRecordedAt = now;

  const [row] = await db
    .insert(riderProfiles)
    .values({
      email: input.email,
      contactId: contact.id,
      firstName: input.firstName ?? null,
      ageRange: input.ageRange ?? null,
      discipline: input.discipline ?? null,
      weeklyTrainingHours: input.weeklyTrainingHours ?? null,
      currentFtp: input.currentFtp ?? null,
      mainGoal: input.mainGoal ?? null,
      biggestLimiter: input.biggestLimiter ?? null,
      coachingInterest: input.coachingInterest ?? null,
      consentSaveProfile: input.consentSaveProfile ?? false,
      consentEmailFollowup: input.consentEmailFollowup ?? false,
      consentRecordedAt: consentBeingSet ? now : null,
    })
    .onConflictDoUpdate({
      target: riderProfiles.email,
      set: patch,
    })
    .returning();

  return toDomain(row);
}
```

- [ ] **Step 6:** Run the test:
```bash
npm run test:run -- tests/rider-profile/store.test.ts
```
Expected: 3 passed.

- [ ] **Step 7:** Commit.
```bash
git add src/lib/rider-profile tests/rider-profile
git commit -m "feat(rider-profile): upsertByEmail + loadByEmail + anon-session cookie"
```

---

## Task 3: Ask store (sessions, messages, retrievals)

**Files:**
- Create: `src/lib/ask/store.ts`
- Create: `tests/ask/store.test.ts`

- [ ] **Step 1:** Write the failing test. Create `tests/ask/store.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  createSession, loadSession, appendMessage, appendRetrievals, touchSession,
} from "@/lib/ask/store";
import { db } from "@/lib/db";
import { askSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const TEST_ANON_KEY = "test-anon-key-0001";

describe("ask/store", () => {
  beforeEach(async () => {
    await db.delete(askSessions).where(eq(askSessions.anonSessionKey, TEST_ANON_KEY));
  });

  it("creates an anon session", async () => {
    const session = await createSession({ anonSessionKey: TEST_ANON_KEY, ipHash: "abc" });
    expect(session.id).toMatch(/^[0-9a-f-]+$/);
    expect(session.messageCount).toBe(0);
  });

  it("appends a message and increments session counter", async () => {
    const session = await createSession({ anonSessionKey: TEST_ANON_KEY });
    const msg = await appendMessage({
      sessionId: session.id,
      role: "user",
      content: "Why is my FTP stuck?",
    });
    expect(msg.id).toMatch(/^[0-9a-f-]+$/);

    const reloaded = await loadSession(session.id);
    expect(reloaded?.messageCount).toBe(1);
  });

  it("appends retrievals linked to a message", async () => {
    const session = await createSession({ anonSessionKey: TEST_ANON_KEY });
    const msg = await appendMessage({ sessionId: session.id, role: "assistant", content: "Here's why..." });
    const retrievals = await appendRetrievals({
      messageId: msg.id,
      items: [
        { sourceType: "episode", sourceId: "123", chunkText: "$€¦", score: 0.84, usedInAnswer: true },
        { sourceType: "methodology", sourceId: "7", chunkText: "$€¦", score: 0.71, usedInAnswer: false },
      ],
    });
    expect(retrievals).toHaveLength(2);
  });

  it("touchSession updates lastActivityAt", async () => {
    const session = await createSession({ anonSessionKey: TEST_ANON_KEY });
    const before = session.lastActivityAt.getTime();
    await new Promise(r => setTimeout(r, 10));
    const updated = await touchSession(session.id);
    expect(updated.lastActivityAt.getTime()).toBeGreaterThan(before);
  });
});
```

- [ ] **Step 2:** Run the test $€” expect fail (missing module).
```bash
npm run test:run -- tests/ask/store.test.ts
```

- [ ] **Step 3:** Create `src/lib/ask/store.ts`:
```ts
import { db } from "@/lib/db";
import { askSessions, askMessages, askRetrievals } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export interface CreateSessionInput {
  riderProfileId?: number | null;
  anonSessionKey?: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
}

export type AskSession = typeof askSessions.$inferSelect;
export type AskMessageRow = typeof askMessages.$inferSelect;
export type AskRetrievalRow = typeof askRetrievals.$inferSelect;

export async function createSession(input: CreateSessionInput): Promise<AskSession> {
  const [row] = await db
    .insert(askSessions)
    .values({
      riderProfileId: input.riderProfileId ?? null,
      anonSessionKey: input.anonSessionKey ?? null,
      ipHash: input.ipHash ?? null,
      userAgent: input.userAgent ?? null,
      utmSource: input.utmSource ?? null,
      utmCampaign: input.utmCampaign ?? null,
    })
    .returning();
  return row;
}

export async function loadSession(id: string): Promise<AskSession | null> {
  const [row] = await db.select().from(askSessions).where(eq(askSessions.id, id)).limit(1);
  return row ?? null;
}

export async function loadSessionByAnonKey(anonKey: string): Promise<AskSession | null> {
  const [row] = await db
    .select()
    .from(askSessions)
    .where(eq(askSessions.anonSessionKey, anonKey))
    .orderBy(sql`${askSessions.lastActivityAt} desc`)
    .limit(1);
  return row ?? null;
}

export async function touchSession(id: string): Promise<AskSession> {
  const [row] = await db
    .update(askSessions)
    .set({ lastActivityAt: new Date() })
    .where(eq(askSessions.id, id))
    .returning();
  return row;
}

export interface AppendMessageInput {
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: AskMessageRow["citations"];
  ctaRecommended?: string | null;
  safetyFlags?: string[] | null;
  confidence?: "high" | "medium" | "low" | null;
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  latencyMs?: number | null;
}

export async function appendMessage(input: AppendMessageInput): Promise<AskMessageRow> {
  const [msg] = await db
    .insert(askMessages)
    .values({
      sessionId: input.sessionId,
      role: input.role,
      content: input.content,
      citations: input.citations ?? null,
      ctaRecommended: input.ctaRecommended ?? null,
      safetyFlags: input.safetyFlags ?? null,
      confidence: input.confidence ?? null,
      model: input.model ?? null,
      inputTokens: input.inputTokens ?? null,
      outputTokens: input.outputTokens ?? null,
      latencyMs: input.latencyMs ?? null,
    })
    .returning();

  await db
    .update(askSessions)
    .set({
      messageCount: sql`${askSessions.messageCount} + 1`,
      lastActivityAt: new Date(),
    })
    .where(eq(askSessions.id, input.sessionId));

  return msg;
}

export async function listSessionMessages(sessionId: string, limit = 20): Promise<AskMessageRow[]> {
  return db
    .select()
    .from(askMessages)
    .where(eq(askMessages.sessionId, sessionId))
    .orderBy(askMessages.createdAt)
    .limit(limit);
}

export interface AppendRetrievalItem {
  sourceType: "episode" | "methodology" | "content_chunk" | "expert_quote";
  sourceId: string;
  chunkText?: string | null;
  score?: number | null;
  usedInAnswer: boolean;
}

export async function appendRetrievals(input: {
  messageId: string;
  items: AppendRetrievalItem[];
}): Promise<AskRetrievalRow[]> {
  if (input.items.length === 0) return [];
  const rows = await db
    .insert(askRetrievals)
    .values(
      input.items.map((i) => ({
        messageId: input.messageId,
        sourceType: i.sourceType,
        sourceId: i.sourceId,
        chunkText: i.chunkText ?? null,
        score: i.score !== undefined && i.score !== null ? String(i.score) : null,
        usedInAnswer: i.usedInAnswer,
      }))
    )
    .returning();
  return rows;
}

export async function flagMessage(id: string, adminNote?: string): Promise<void> {
  await db
    .update(askMessages)
    .set({ flaggedForReview: true, adminNote: adminNote ?? null })
    .where(eq(askMessages.id, id));
}
```

- [ ] **Step 4:** Run the test:
```bash
npm run test:run -- tests/ask/store.test.ts
```
Expected: 4 passed.

- [ ] **Step 5:** Commit.
```bash
git add src/lib/ask/store.ts tests/ask/store.test.ts
git commit -m "feat(ask): session/message/retrieval persistence layer"
```

---

## Task 4: Tier-aware rate limiter

**Files:**
- Create: `src/lib/ask/rate-limit.ts`

- [ ] **Step 1:** Create `src/lib/ask/rate-limit.ts`. The module must degrade gracefully when Upstash is not configured (local dev):
```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type AccessTier = "anon" | "free" | "plus" | "vip";

const ANON_RPM = Number(process.env.ASK_ROADMAN_ANON_RPM ?? 5);
const ANON_DAILY = Number(process.env.ASK_ROADMAN_ANON_DAILY ?? 10);
const PROFILE_RPH = Number(process.env.ASK_ROADMAN_PROFILE_RPH ?? 30);

let windowLimiters: Record<string, Ratelimit> | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

function getLimiters(): Record<string, Ratelimit> | null {
  if (windowLimiters) return windowLimiters;
  const redis = getRedis();
  if (!redis) return null;
  windowLimiters = {
    "anon:10m": new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(ANON_RPM, "10 m"), prefix: "ask_anon_10m" }),
    "anon:24h": new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(ANON_DAILY, "24 h"), prefix: "ask_anon_24h" }),
    "profile:1h": new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(PROFILE_RPH, "1 h"), prefix: "ask_profile_1h" }),
  };
  return windowLimiters;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: "anon_rate" | "anon_daily" | "profile_rate";
  retryAfterSeconds?: number;
}

export async function checkAskRateLimit(params: {
  tier: AccessTier;
  key: string;                     // sessionId || email || ipHash
}): Promise<RateLimitResult> {
  const limiters = getLimiters();
  if (!limiters) return { allowed: true };   // dev mode $€” no redis

  if (params.tier === "anon") {
    const [ten, day] = await Promise.all([
      limiters["anon:10m"].limit(params.key),
      limiters["anon:24h"].limit(params.key),
    ]);
    if (!ten.success) return { allowed: false, reason: "anon_rate", retryAfterSeconds: 60 };
    if (!day.success) return { allowed: false, reason: "anon_daily", retryAfterSeconds: 3600 };
    return { allowed: true };
  }

  const r = await limiters["profile:1h"].limit(params.key);
  if (!r.success) return { allowed: false, reason: "profile_rate", retryAfterSeconds: 120 };
  return { allowed: true };
}
```

- [ ] **Step 2:** Manual smoke check $€” without Upstash env vars, should always allow:
```bash
node -e "require('dotenv').config();(async()=>{const m=await import('./src/lib/ask/rate-limit.ts');console.log(await m.checkAskRateLimit({tier:'anon',key:'x'}));})()"
```
(Skip if tsx-only; just trust Step 3 will catch it).

- [ ] **Step 3:** Commit.
```bash
git add src/lib/ask/rate-limit.ts
git commit -m "feat(ask): tier-aware Upstash rate limiter with dev-mode fallback"
```

---

## Task 5: Safety pre-filter + flag extraction

**Files:**
- Create: `src/lib/ask/safety.ts`
- Create: `tests/ask/safety.test.ts`

- [ ] **Step 1:** Write the test. Create `tests/ask/safety.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { detectSafety, isBlocked, buildSafeResponse } from "@/lib/ask/safety";

describe("ask/safety detectSafety", () => {
  it("flags medical escalation for chest pain", () => {
    const d = detectSafety("I've been getting chest pain on hard climbs, should I push through?");
    expect(d.flags).toContain("medical_escalation");
    expect(d.block).toBe(true);
    expect(d.templateKey).toBe("medical");
  });

  it("flags injury for acute knee pain", () => {
    const d = detectSafety("I tore my meniscus last week $€” what rehab should I do?");
    expect(d.flags).toContain("injury_escalation");
    expect(d.block).toBe(true);
    expect(d.templateKey).toBe("injury");
  });

  it("flags extreme weight loss", () => {
    const d = detectSafety("how do I drop 15kg in 4 weeks?");
    expect(d.flags).toContain("extreme_weight_loss");
    expect(d.block).toBe(true);
    expect(d.templateKey).toBe("weight");
  });

  it("does NOT flag benign training questions", () => {
    const d = detectSafety("How should I structure zone 2 this week?");
    expect(d.flags).toEqual([]);
    expect(d.block).toBe(false);
  });

  it("buildSafeResponse returns a complete escalation answer with a Roadman CTA where safe", () => {
    const out = buildSafeResponse({ flags: ["medical_escalation"], block: true, templateKey: "medical" });
    expect(out.text.length).toBeGreaterThan(100);
    expect(out.text.toLowerCase()).toContain("doctor");
    expect(out.cta).toBeDefined();
  });
});
```

- [ ] **Step 2:** Run $€” expect fail.
```bash
npm run test:run -- tests/ask/safety.test.ts
```

- [ ] **Step 3:** Create `src/lib/ask/safety.ts`:
```ts
import type { CtaDescriptor, SafetyDecision, SafetyFlag } from "./types";

// Deterministic regex pre-filter. Any match blocks the model call and returns
// a fixed escalation response. False positives are acceptable $€” false
// negatives are not.

const MEDICAL_PATTERNS: RegExp[] = [
  /\bchest (pain|tightness|pressure)\b/i,
  /\bheart (attack|arrhythmia|palpitation)/i,
  /\bfaint(ed|ing)?\b/i,
  /\bpassed out\b/i,
  /\bblack(ed)? out\b/i,
  /\bshortness of breath\b/i,
  /\bcoughing up\b/i,
  /\bvision (blurred|loss|problems)\b/i,
  /\bbleeding\b/i,
  /\bsevere (pain|headache|dizziness)\b/i,
  /\bcan't breathe\b/i,
  /\bhaving a heart/i,
];

const INJURY_PATTERNS: RegExp[] = [
  /\b(torn|tore|ruptur(e|ed)|broken|fractur(e|ed))\b/i,
  /\bacl\b|\bpcl\b|\bmcl\b|\bmeniscus\b/i,
  /\bstress fracture\b/i,
  /\bherniat(ed|ion)\b/i,
  /\btendon rupture\b/i,
  /\bacute (injury|pain)\b/i,
];

const WEIGHT_PATTERNS: RegExp[] = [
  /\bdrop (\d{2,})\s*(kg|lb|pounds)\b/i,
  /\blose (\d{2,})\s*(kg|lb|pounds) in (\d+)\s*(day|week|month)/i,
  /\banorexi[ac]\b|\bbulimi[ac]\b|\beating disorder\b/i,
  /\bstop eating\b|\bstarve (myself|me)\b/i,
  /\b(under|extreme) (caloric? )?deficit\b/i,
];

const DANGEROUS_PATTERNS: RegExp[] = [
  /\btrain through (chest pain|severe pain|pneumonia|flu)\b/i,
  /\bride with (a )?concussion\b/i,
];

function matches(patterns: RegExp[], text: string): boolean {
  return patterns.some((p) => p.test(text));
}

export function detectSafety(query: string): SafetyDecision {
  const flags: SafetyFlag[] = [];
  let templateKey: SafetyDecision["templateKey"];

  if (matches(MEDICAL_PATTERNS, query)) {
    flags.push("medical_escalation");
    templateKey = templateKey ?? "medical";
  }
  if (matches(INJURY_PATTERNS, query)) {
    flags.push("injury_escalation");
    templateKey = templateKey ?? "injury";
  }
  if (matches(WEIGHT_PATTERNS, query)) {
    flags.push("extreme_weight_loss");
    templateKey = templateKey ?? "weight";
  }
  if (matches(DANGEROUS_PATTERNS, query)) {
    flags.push("dangerous_training");
    templateKey = templateKey ?? "dangerous";
  }

  return {
    flags,
    block: flags.length > 0,
    templateKey,
  };
}

export function isBlocked(d: SafetyDecision): boolean {
  return d.block;
}

const SATURDAY_SPIN_CTA: CtaDescriptor = {
  key: "saturday_spin",
  title: "Get Saturday Spin",
  body: "Roadman's weekly newsletter $€” safe, evidence-led performance writing.",
  href: "https://roadmancycling.com/saturday-spin",
  analyticsEvent: "cta_clicked:saturday_spin",
};

const MASTERS_HUB_CTA: CtaDescriptor = {
  key: "clubhouse",
  title: "Join the Clubhouse",
  body: "Free Roadman community $€” ask riders and coaches who've been there.",
  href: "https://skool.com/roadman",
  analyticsEvent: "cta_clicked:clubhouse",
};

export interface SafeResponseOutput {
  text: string;
  cta: CtaDescriptor;
}

export function buildSafeResponse(decision: SafetyDecision): SafeResponseOutput {
  switch (decision.templateKey) {
    case "medical":
      return {
        text:
          "This sounds like a medical concern, not a training question. Please stop riding and speak to a doctor $€” same-day if the symptoms are new or getting worse. Chest pain, fainting, shortness of breath, or sudden vision changes can be serious and a GP or A&E is the right next call, not an AI or a coach.\n\nOnce you've been medically cleared, Roadman's nutrition, zone 2, and recovery content can help rebuild $€” but get the medical side sorted first.",
        cta: SATURDAY_SPIN_CTA,
      };
    case "injury":
      return {
        text:
          "For an acute injury like this, a physio or sports-medicine doctor is the right first stop $€” not an AI, a coach, or a training app. Rehab prescriptions need hands-on assessment that we can't replicate.\n\nOnce you've got a diagnosis and a rehab plan, Roadman has content on getting back into riding conservatively $€” but don't skip the assessment.",
        cta: MASTERS_HUB_CTA,
      };
    case "weight":
      return {
        text:
          "Large, fast weight cuts aren't something we'll help design. Underfuelling wrecks training adaptations, wrecks recovery, and in some cases wrecks health. If food feels out of control, please speak to a registered dietitian or your GP $€” that's the right support, not a cycling AI.\n\nRoadman's nutrition content focuses on fuelling for performance and sustainable body composition changes measured in months, not weeks.",
        cta: SATURDAY_SPIN_CTA,
      };
    case "dangerous":
      return {
        text:
          "Training through serious symptoms isn't something we'll encourage. Take the session off, get the issue properly assessed, and come back when you're clear.",
        cta: SATURDAY_SPIN_CTA,
      };
    default:
      return {
        text:
          "This one sits outside what Ask Roadman should answer. Please speak to the right professional $€” doctor, physio, or registered dietitian $€” depending on the specifics.",
        cta: SATURDAY_SPIN_CTA,
      };
  }
}

// Post-filter: scan an assistant response for invented episode references.
// Given the retrieved chunk titles, if the model cites an episode/article
// title not in that set, strip the citation and lower confidence.
export function postFilterCitations(
  text: string,
  knownTitles: string[]
): { text: string; flaggedInvented: string[] } {
  const flagged: string[] = [];
  // Very light check: look for patterns like 'Episode "..."' or 'episode titled "..."'
  const quoted = text.match(/"([^"]{8,120})"/g) ?? [];
  for (const q of quoted) {
    const inner = q.slice(1, -1);
    if (!knownTitles.some((t) => t.toLowerCase().includes(inner.toLowerCase().slice(0, 30)))) {
      // not necessarily invented $€” could be a user quote or a concept. Only
      // flag if immediately preceded by 'episode' or 'podcast'.
      if (new RegExp(`(episode|podcast)\\s*(named|titled|called)?\\s*${q.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}`, "i").test(text)) {
        flagged.push(inner);
      }
    }
  }
  return { text, flaggedInvented: flagged };
}
```

- [ ] **Step 4:** Run the test:
```bash
npm run test:run -- tests/ask/safety.test.ts
```
Expected: 5 passed.

- [ ] **Step 5:** Commit.
```bash
git add src/lib/ask/safety.ts tests/ask/safety.test.ts
git commit -m "feat(ask): safety pre-filter + fixed escalation templates + post-filter"
```

---

## Task 6: Intent classifier (Haiku)

**Files:**
- Create: `src/lib/ask/intent.ts`
- Create: `tests/ask/intent.test.ts`

- [ ] **Step 1:** Write the test (uses a mock for Anthropic to avoid real API cost):
```ts
import { describe, it, expect, vi } from "vitest";

const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class { messages = { create: mockCreate } },
}));

import { classifyIntent } from "@/lib/ask/intent";

describe("ask/intent classifyIntent", () => {
  it("returns high-confidence plateau for an FTP-stuck question", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: '{"intent":"plateau","confidence":"high","deep":true,"needsProfile":true}' }],
    });
    const c = await classifyIntent("My FTP has been stuck at 240 for 8 months.");
    expect(c.intent).toBe("plateau");
    expect(c.confidence).toBe("high");
    expect(c.deep).toBe(true);
  });

  it("falls back to training_general when model returns invalid JSON", async () => {
    mockCreate.mockResolvedValueOnce({ content: [{ type: "text", text: "not json" }] });
    const c = await classifyIntent("something");
    expect(c.intent).toBe("training_general");
    expect(c.confidence).toBe("low");
  });
});
```

- [ ] **Step 2:** Run $€” expect fail.
```bash
npm run test:run -- tests/ask/intent.test.ts
```

- [ ] **Step 3:** Create `src/lib/ask/intent.ts`:
```ts
import Anthropic from "@anthropic-ai/sdk";
import type { Intent, IntentClassification } from "./types";

const MODEL = "claude-haiku-4-5-20251001";

const INTENT_VALUES: Intent[] = [
  "plateau","fuelling","content_discovery","recovery_masters","event_prep",
  "coaching_decision","training_general","safety_medical","safety_injury",
  "safety_weight","off_topic","unknown",
];

const SYSTEM_PROMPT = `You are an intent classifier for Ask Roadman, a cycling performance assistant.
Given a user question, return strictly this JSON shape (no prose, no markdown):
{"intent":"<one of ${INTENT_VALUES.join("|")}>","confidence":"high|medium|low","deep":true|false,"needsProfile":true|false}

Rules:
- "plateau" = the user is describing stuck fitness / FTP not moving / overtraining suspicion
- "fuelling" = nutrition for rides, carbs/hr, hydration
- "content_discovery" = they want episodes/articles on a topic
- "recovery_masters" = over-40 recovery, sleep, longevity
- "event_prep" = preparing for a specific event (sportive, race) with a date or timeline
- "coaching_decision" = should they get a coach / which Roadman product
- "training_general" = training questions that don't fit above
- "safety_medical" / "safety_injury" / "safety_weight" = symptoms, injuries, or extreme weight questions
- "off_topic" = not cycling related
- "unknown" = too ambiguous to route
- deep=true when answering requires depth (Opus). Use Haiku (deep=false) only for cheap content_discovery/off_topic/unknown.
- needsProfile=true when the answer would be materially better with saved rider context (age, hours, FTP, discipline).
`;

function safeParse(text: string): IntentClassification | null {
  try {
    const obj = JSON.parse(text.trim());
    if (!INTENT_VALUES.includes(obj.intent)) return null;
    if (!["high","medium","low"].includes(obj.confidence)) return null;
    return {
      intent: obj.intent,
      confidence: obj.confidence,
      deep: Boolean(obj.deep),
      needsProfile: Boolean(obj.needsProfile),
    };
  } catch {
    return null;
  }
}

export async function classifyIntent(query: string): Promise<IntentClassification> {
  const client = new Anthropic();
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: query }],
    });
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const parsed = safeParse(text);
    if (parsed) return parsed;
  } catch {
    // fall through to fallback
  }
  return { intent: "training_general", confidence: "low", deep: true, needsProfile: true };
}
```

- [ ] **Step 4:** Run the test:
```bash
npm run test:run -- tests/ask/intent.test.ts
```
Expected: 2 passed.

- [ ] **Step 5:** Commit.
```bash
git add src/lib/ask/intent.ts tests/ask/intent.test.ts
git commit -m "feat(ask): Haiku-backed intent classifier with safe fallback"
```

---

## Task 7: Retrieval fan-out (wraps PR #76 services + stub content_chunks)

**Files:**
- Create: `src/lib/ask/retrieval/content-chunks.ts` (stub)
- Create: `src/lib/ask/retrieval/index.ts`
- Create: `tests/ask/retrieval.test.ts`

- [ ] **Step 1:** Create `src/lib/ask/retrieval/content-chunks.ts` (stub for Phase 1 $€” real impl in Phase 4):
```ts
import type { RetrievedChunk } from "../types";

// Phase 4 will replace this with a real pgvector search over content_chunks.
// Returning [] in Phase 1 is intentional $€” episodes + methodology cover
// the retrieval surface while the corpus expansion lands.
export async function searchContentChunks(
  _query: string,
  _limit = 8
): Promise<RetrievedChunk[]> {
  return [];
}
```

- [ ] **Step 2:** Write the retrieval fan-out test. Create `tests/ask/retrieval.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/mcp/services/episodes", () => ({
  searchEpisodes: vi.fn().mockResolvedValue([
    { episode_id: 1, title: "Zone 2 with Seiler", excerpt: "$€¦z2$€¦", url: "/p/1", score: 0.91 },
  ]),
}));
vi.mock("@/lib/mcp/services/methodology", () => ({
  searchMethodology: vi.fn().mockResolvedValue([
    { principle_id: 3, principle: "Polarised distribution", explanation: "80/20$€¦", score: 0.85 },
  ]),
}));

import { retrieve } from "@/lib/ask/retrieval";

describe("ask/retrieval", () => {
  it("merges episodes + methodology + content_chunks into normalized RetrievedChunks", async () => {
    const r = await retrieve({ query: "zone 2", intent: "content_discovery", profile: null });
    expect(r.chunks.length).toBeGreaterThan(0);
    const types = new Set(r.chunks.map((c) => c.sourceType));
    expect(types.has("episode")).toBe(true);
    expect(types.has("methodology")).toBe(true);
    for (const c of r.chunks) {
      expect(c.score).toBeGreaterThan(0);
      expect(c.title).toBeTruthy();
    }
  });
});
```

- [ ] **Step 3:** Create `src/lib/ask/retrieval/index.ts`:
```ts
import { searchEpisodes } from "@/lib/mcp/services/episodes";
import { searchMethodology } from "@/lib/mcp/services/methodology";
import { searchContentChunks } from "./content-chunks";
import type { Intent, RetrievalResult, RetrievedChunk } from "../types";
import type { RiderProfile } from "@/lib/rider-profile/types";

interface RetrieveInput {
  query: string;
  intent: Intent;
  profile: RiderProfile | null;
}

const CAP_TOTAL = 10;

export async function retrieve(input: RetrieveInput): Promise<RetrievalResult> {
  // Skip heavy retrieval on safety/off-topic/unknown intents.
  if (
    input.intent === "safety_medical" ||
    input.intent === "safety_injury" ||
    input.intent === "safety_weight" ||
    input.intent === "off_topic"
  ) {
    return { chunks: [], totalCandidates: 0 };
  }

  const [episodes, methodology, chunks] = await Promise.all([
    safe(() => searchEpisodes(input.query, 4)),
    safe(() => searchMethodology(input.query)),
    safe(() => searchContentChunks(input.query, 8)),
  ]);

  const normalized: RetrievedChunk[] = [
    ...episodes.map((e): RetrievedChunk => ({
      sourceType: "episode",
      sourceId: String(e.episode_id ?? e.id ?? ""),
      title: e.title ?? "",
      url: e.url ?? (e.slug ? `/podcast/${e.slug}` : undefined),
      excerpt: e.excerpt ?? e.chunk_text ?? "",
      score: typeof e.score === "number" ? e.score : 0.5,
    })),
    ...methodology.map((m): RetrievedChunk => ({
      sourceType: "methodology",
      sourceId: String(m.principle_id ?? m.id ?? ""),
      title: m.principle ?? "",
      excerpt: m.explanation ?? "",
      score: typeof m.score === "number" ? m.score : 0.5,
    })),
    ...chunks,
  ];

  // Dedupe by (sourceType, sourceId), keep highest score.
  const byKey = new Map<string, RetrievedChunk>();
  for (const c of normalized) {
    const key = `${c.sourceType}:${c.sourceId}`;
    const prev = byKey.get(key);
    if (!prev || c.score > prev.score) byKey.set(key, c);
  }
  const deduped = Array.from(byKey.values());

  // Sort by score desc, cap.
  deduped.sort((a, b) => b.score - a.score);
  return { chunks: deduped.slice(0, CAP_TOTAL), totalCandidates: normalized.length };
}

async function safe<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try { return await fn(); } catch { return []; }
}
```

- [ ] **Step 4:** Run the test:
```bash
npm run test:run -- tests/ask/retrieval.test.ts
```
Expected: 1 passed.

- [ ] **Step 5:** Commit.
```bash
git add src/lib/ask/retrieval tests/ask/retrieval.test.ts
git commit -m "feat(ask): retrieval fan-out wraps PR #76 episodes/methodology + content_chunks stub"
```

---

## Task 8: CTA resolver

**Files:**
- Create: `src/lib/ask/cta.ts`
- Create: `tests/ask/cta.test.ts`

- [ ] **Step 1:** Write the test:
```ts
import { describe, it, expect } from "vitest";
import { pickCta, CTA_CATALOG } from "@/lib/ask/cta";

describe("ask/cta pickCta", () => {
  it("plateau intent routes to plateau_diagnostic", () => {
    const c = pickCta({ intent: "plateau", safety: { flags: [], block: false }, retrieval: { chunks: [], totalCandidates: 0 } });
    expect(c.key).toBe("plateau_diagnostic");
    expect(c.href).toBe("/diagnostic");
  });

  it("fuelling intent routes to fuelling_calculator", () => {
    const c = pickCta({ intent: "fuelling", safety: { flags: [], block: false }, retrieval: { chunks: [], totalCandidates: 0 } });
    expect(c.key).toBe("fuelling_calculator");
  });

  it("coaching_decision routes to ndy_coaching by default", () => {
    const c = pickCta({ intent: "coaching_decision", safety: { flags: [], block: false }, retrieval: { chunks: [], totalCandidates: 0 } });
    expect(c.key).toBe("ndy_coaching");
  });

  it("content_discovery with episodes retrieved shows episode_list", () => {
    const c = pickCta({
      intent: "content_discovery",
      safety: { flags: [], block: false },
      retrieval: {
        chunks: [{ sourceType: "episode", sourceId: "1", title: "Z2", excerpt: "", score: 0.9 }],
        totalCandidates: 1,
      },
    });
    expect(c.key).toBe("episode_list");
  });

  it("safety-blocked returns saturday_spin as safe fallback", () => {
    const c = pickCta({
      intent: "safety_medical",
      safety: { flags: ["medical_escalation"], block: true, templateKey: "medical" },
      retrieval: { chunks: [], totalCandidates: 0 },
    });
    expect(c.key).toBe("saturday_spin");
  });

  it("exhaustiveness: every Intent maps to exactly one CTA", () => {
    const INTENTS = ["plateau","fuelling","content_discovery","recovery_masters","event_prep","coaching_decision","training_general","safety_medical","safety_injury","safety_weight","off_topic","unknown"] as const;
    for (const intent of INTENTS) {
      const c = pickCta({ intent, safety: { flags: [], block: false }, retrieval: { chunks: [], totalCandidates: 0 } });
      expect(CTA_CATALOG).toHaveProperty(c.key);
    }
  });
});
```

- [ ] **Step 2:** Run $€” expect fail.
```bash
npm run test:run -- tests/ask/cta.test.ts
```

- [ ] **Step 3:** Create `src/lib/ask/cta.ts`:
```ts
import type { CtaDescriptor, CtaKey, Intent, RetrievalResult, SafetyDecision } from "./types";

export const CTA_CATALOG: Record<CtaKey, CtaDescriptor> = {
  plateau_diagnostic: {
    key: "plateau_diagnostic",
    title: "Diagnose your plateau in 3 minutes",
    body: "12 questions, 1 page of answers. See exactly what's holding you back.",
    href: "/diagnostic",
    analyticsEvent: "cta_clicked:plateau_diagnostic",
  },
  fuelling_calculator: {
    key: "fuelling_calculator",
    title: "Dial in your in-ride fuelling",
    body: "Carbs / fluid / sodium per hour for your ride length and intensity.",
    href: "/tools/fuelling",
    analyticsEvent: "cta_clicked:fuelling_calculator",
  },
  ftp_zones: {
    key: "ftp_zones",
    title: "Get your FTP zones",
    body: "Coggan + polarised views side by side, ready to paste into your head unit.",
    href: "/tools/ftp-zones",
    analyticsEvent: "cta_clicked:ftp_zones",
  },
  saturday_spin: {
    key: "saturday_spin",
    title: "Get Saturday Spin",
    body: "Roadman's weekly newsletter $€” one short, evidence-led read every Saturday.",
    href: "/saturday-spin",
    analyticsEvent: "cta_clicked:saturday_spin",
  },
  clubhouse: {
    key: "clubhouse",
    title: "Join the Clubhouse",
    body: "Free Roadman community $€” ask riders and coaches who've been there.",
    href: "https://www.skool.com/roadman-cycling-clubhouse",
    analyticsEvent: "cta_clicked:clubhouse",
  },
  roadman_plus: {
    key: "roadman_plus",
    title: "Upgrade to Roadman+",
    body: "Deeper answers, saved profile and diagnostics, premium protocols.",
    href: "/plus",
    analyticsEvent: "cta_clicked:roadman_plus",
  },
  ndy_coaching: {
    key: "ndy_coaching",
    title: "Not Done Yet coaching",
    body: "Programming + accountability + community. Built for the serious amateur.",
    href: "/ndy",
    analyticsEvent: "cta_clicked:ndy_coaching",
  },
  vip_coaching: {
    key: "vip_coaching",
    title: "Apply for VIP coaching",
    body: "1:1 coaching with Anthony $€” limited places. Start with a call.",
    href: "/ndy/vip",
    analyticsEvent: "cta_clicked:vip_coaching",
  },
  episode_list: {
    key: "episode_list",
    title: "See matching episodes",
    body: "Listen to the Roadman episodes most relevant to this question.",
    href: "/podcast",
    analyticsEvent: "cta_clicked:episode_list",
  },
  none: {
    key: "none",
    title: "",
    body: "",
    href: "",
    analyticsEvent: "",
  },
};

export function pickCta(input: {
  intent: Intent;
  safety: SafetyDecision;
  retrieval: RetrievalResult;
}): CtaDescriptor {
  if (input.safety.block) return CTA_CATALOG.saturday_spin;
  switch (input.intent) {
    case "plateau": return CTA_CATALOG.plateau_diagnostic;
    case "fuelling": return CTA_CATALOG.fuelling_calculator;
    case "recovery_masters": return CTA_CATALOG.ndy_coaching;
    case "event_prep": return CTA_CATALOG.ndy_coaching;
    case "coaching_decision": return CTA_CATALOG.ndy_coaching;
    case "content_discovery": {
      const hasEpisodes = input.retrieval.chunks.some((c) => c.sourceType === "episode");
      return hasEpisodes ? CTA_CATALOG.episode_list : CTA_CATALOG.saturday_spin;
    }
    case "training_general": return CTA_CATALOG.saturday_spin;
    case "safety_medical":
    case "safety_injury":
    case "safety_weight": return CTA_CATALOG.saturday_spin;
    case "off_topic":
    case "unknown": return CTA_CATALOG.saturday_spin;
  }
}
```

- [ ] **Step 4:** Run the test:
```bash
npm run test:run -- tests/ask/cta.test.ts
```
Expected: 6 passed.

- [ ] **Step 5:** Commit.
```bash
git add src/lib/ask/cta.ts tests/ask/cta.test.ts
git commit -m "feat(ask): exhaustive intent $†’ CTA resolver with safe fallback"
```

---

## Task 9: System prompt module

**Files:**
- Create: `src/lib/ask/system-prompt.ts`

- [ ] **Step 1:** Create `src/lib/ask/system-prompt.ts`:
```ts
import type { CtaDescriptor, Intent, RetrievedChunk, SafetyDecision } from "./types";
import type { RiderProfile } from "@/lib/rider-profile/types";

export interface BuildSystemPromptInput {
  profile: RiderProfile | null;
  intent: Intent;
  cta: CtaDescriptor;
  chunks: RetrievedChunk[];
  safety: SafetyDecision;
}

export function buildSystemPrompt(input: BuildSystemPromptInput): string {
  const profileBlock = input.profile
    ? formatProfile(input.profile)
    : "NO SAVED PROFILE $€” treat all rider details as unknown unless stated in the current turn.";

  const contextBlock = input.chunks.length
    ? input.chunks.map((c, i) => formatChunk(c, i)).join("\n\n")
    : "NO CONTEXT RETRIEVED $€” answer conservatively; recommend listening to recent Roadman episodes.";

  return [
    CORE_PERSONA,
    "",
    "VOICE RULES:",
    VOICE_RULES,
    "",
    "CORE PRINCIPLES (never violate):",
    CORE_PRINCIPLES,
    "",
    "ANSWER STRUCTURE:",
    ANSWER_STRUCTURE,
    "",
    "SAFETY RULES:",
    SAFETY_RULES,
    "",
    "CTA TO RECOMMEND (surface naturally, do not invent a different one):",
    `- key: ${input.cta.key}`,
    `- title: ${input.cta.title}`,
    `- body: ${input.cta.body}`,
    `- href: ${input.cta.href}`,
    "",
    "RIDER PROFILE:",
    profileBlock,
    "",
    "RETRIEVED CONTEXT (cite these by [${i}] when you use them; never invent others):",
    contextBlock,
    "",
    "OUTPUT RULES:",
    "- Be concise. Most answers are 150$€“400 words.",
    "- When you cite a retrieved source, use the exact title and include its URL inline.",
    "- Never fabricate episode titles, guest names, stats, or studies.",
    "- If context is insufficient, say so plainly.",
    "- End with a single one-line mention of the recommended CTA if natural. Do not invent extra CTAs.",
  ].join("\n");
}

const CORE_PERSONA = `You are Ask Roadman, the Roadman Cycling performance assistant. You are not a generic chatbot $€” you are a Roadman-branded performance guide trained on the Roadman Cycling Podcast archive, coaching methodology, expert interviews, and articles. Your role: help cyclists understand what to do next using Roadman's own knowledge base.`;

const VOICE_RULES = `- Human, direct, supportive, practical.
- Expert but accessible $€” no jargon walls, but don't dumb it down.
- Motivating without hype. Clear rather than overly scientific.
- Peer-to-peer $€” talk TO the rider, not AT them. Use "we" and "you" naturally.
- Short paragraphs. Punchy where it matters.
- Sound like Anthony at the coffee stop after a ride $€” not like a brochure.`;

const CORE_PRINCIPLES = `- Use Roadman sources first. Cite what you retrieved. Never invent sources.
- Be specific when context exists. Be conservative when context is missing.
- Say when you don't know. "I'd have to check" beats guessing.
- Never pretend to have seen rider data you haven't been given.
- Never diagnose medical conditions. Never prescribe injury rehab.
- Never encourage extreme weight loss, riding through severe symptoms, or unsafe training.`;

const ANSWER_STRUCTURE = `1. Direct answer (1$€“2 sentences).
2. Why this might be happening (only if a problem was described).
3. What to do next (2$€“4 concrete actions).
4. Roadman resources (1$€“2 retrieved sources, with link).
5. When to escalate (only if relevant $€” e.g. "if pain persists, see a physio").`;

const SAFETY_RULES = `- Never diagnose medical conditions or interpret symptoms. Refer to a doctor.
- Never prescribe injury rehab. Refer to a physio/sports-med.
- Never recommend training through chest pain, fainting, severe pain, unexplained illness.
- Never encourage extreme or rapid weight loss. Refer to a registered dietitian.
- Never guarantee specific performance gains ("add 20W in 4 weeks" etc.).
- Never promise features or products that don't exist.
- Never present yourself as a replacement for professional care.`;

function formatProfile(p: RiderProfile): string {
  const lines: string[] = [];
  if (p.firstName) lines.push(`- Name: ${p.firstName}`);
  if (p.ageRange) lines.push(`- Age: ${p.ageRange}`);
  if (p.discipline) lines.push(`- Discipline: ${p.discipline}`);
  if (p.weeklyTrainingHours) lines.push(`- Weekly hours: ${p.weeklyTrainingHours}`);
  if (p.currentFtp) lines.push(`- FTP: ${p.currentFtp}W`);
  if (p.mainGoal) lines.push(`- Main goal: ${p.mainGoal}`);
  if (p.biggestLimiter) lines.push(`- Biggest limiter: ${p.biggestLimiter}`);
  if (p.coachingInterest) lines.push(`- Coaching interest: ${p.coachingInterest}`);
  return lines.length ? lines.join("\n") : "NO SAVED PROFILE.";
}

function formatChunk(c: RetrievedChunk, i: number): string {
  const urlPart = c.url ? ` url: ${c.url}` : "";
  return `[${i}] (${c.sourceType}) ${c.title}${urlPart}\n${c.excerpt.slice(0, 1200)}`;
}
```

- [ ] **Step 2:** TypeScript check:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3:** Commit.
```bash
git add src/lib/ask/system-prompt.ts
git commit -m "feat(ask): system prompt builder with voice + safety + structure + CTA"
```

---

## Task 10: SSE stream bridge

**Files:**
- Create: `src/lib/ask/stream.ts`

- [ ] **Step 1:** Create `src/lib/ask/stream.ts`:
```ts
import type { OrchestratorEmit } from "./types";

const encoder = new TextEncoder();

export function createSseStream() {
  let controllerRef: ReadableStreamDefaultController<Uint8Array> | null = null;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) { controllerRef = controller; },
  });

  function emit(e: OrchestratorEmit): void {
    if (!controllerRef) return;
    const payload = JSON.stringify(e.data);
    const chunk = `event: ${e.type}\ndata: ${payload}\n\n`;
    controllerRef.enqueue(encoder.encode(chunk));
  }

  function close(): void {
    controllerRef?.close();
  }

  return { stream, emit, close };
}

export function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
```

- [ ] **Step 2:** No dedicated test $€” covered by orchestrator integration tests. Commit.
```bash
git add src/lib/ask/stream.ts
git commit -m "feat(ask): SSE stream helper + response wrapper"
```

---

## Task 11: Orchestrator

**Files:**
- Create: `src/lib/ask/orchestrator.ts`
- Create: `tests/ask/orchestrator.test.ts`

- [ ] **Step 1:** Write the test (mocks Anthropic + retrieval):
```ts
import { describe, it, expect, vi } from "vitest";

const mockStream = vi.fn();
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class {
      messages = {
        stream: mockStream,
        create: vi.fn().mockResolvedValue({
          content: [{ type: "text", text: '{"intent":"training_general","confidence":"high","deep":true,"needsProfile":false}' }],
        }),
      };
    },
  };
});
vi.mock("@/lib/ask/retrieval", () => ({
  retrieve: vi.fn().mockResolvedValue({
    chunks: [{ sourceType: "episode", sourceId: "1", title: "Z2 with Seiler", url: "/p/1", excerpt: "...", score: 0.9 }],
    totalCandidates: 1,
  }),
}));
vi.mock("@/lib/ask/store", () => ({
  createSession: vi.fn().mockResolvedValue({ id: "sess-1", messageCount: 0, lastActivityAt: new Date() }),
  appendMessage: vi.fn().mockResolvedValue({ id: "msg-1" }),
  appendRetrievals: vi.fn().mockResolvedValue([]),
  loadSession: vi.fn().mockResolvedValue({ id: "sess-1" }),
  listSessionMessages: vi.fn().mockResolvedValue([]),
  touchSession: vi.fn(),
}));

import { streamAnswer } from "@/lib/ask/orchestrator";

function mockAnthropicStream(deltas: string[]) {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const d of deltas) {
        yield { type: "content_block_delta", delta: { type: "text_delta", text: d } };
      }
      yield { type: "message_stop" };
    },
    finalMessage: async () => ({
      content: [{ type: "text", text: deltas.join("") }],
      usage: { input_tokens: 100, output_tokens: 50 },
      model: "claude-opus-4-7",
    }),
  };
}

describe("ask/orchestrator streamAnswer", () => {
  it("emits meta $†’ delta* $†’ cta $†’ done for a benign question", async () => {
    mockStream.mockReturnValueOnce(mockAnthropicStream(["Zone 2 is$€¦", " about aerobic base."]));
    const events: Array<{ type: string; data: unknown }> = [];
    await streamAnswer({
      query: "What is zone 2?",
      sessionId: "sess-1",
      riderProfileId: null,
      ip: "abc",
    }, (e) => events.push(e));
    const types = events.map((e) => e.type);
    expect(types[0]).toBe("meta");
    expect(types).toContain("delta");
    expect(types).toContain("cta");
    expect(types[types.length - 1]).toBe("done");
  });

  it("emits safety event and bypasses model when query is medical", async () => {
    const events: Array<{ type: string; data: unknown }> = [];
    await streamAnswer({
      query: "I've got chest pain on hill reps",
      sessionId: "sess-1",
      riderProfileId: null,
      ip: "abc",
    }, (e) => events.push(e));
    const types = events.map((e) => e.type);
    expect(types).toContain("safety");
    expect(mockStream).not.toHaveBeenCalled();  // model bypass
    expect(types[types.length - 1]).toBe("done");
  });
});
```

- [ ] **Step 2:** Run $€” expect fail.
```bash
npm run test:run -- tests/ask/orchestrator.test.ts
```

- [ ] **Step 3:** Create `src/lib/ask/orchestrator.ts`:
```ts
import Anthropic from "@anthropic-ai/sdk";
import { classifyIntent } from "./intent";
import { detectSafety, buildSafeResponse, postFilterCitations } from "./safety";
import { retrieve } from "./retrieval";
import { pickCta } from "./cta";
import { buildSystemPrompt } from "./system-prompt";
import { appendMessage, appendRetrievals, listSessionMessages, touchSession } from "./store";
import { loadById } from "@/lib/rider-profile/store";
import type { OrchestratorEmit, OrchestratorInput, RetrievedChunk } from "./types";

const MODEL_DEEP = "claude-opus-4-7";
const MODEL_CHEAP = "claude-haiku-4-5-20251001";
const MAX_TOKENS_DEEP = 2000;
const MAX_TOKENS_CHEAP = 1000;

export async function streamAnswer(
  input: OrchestratorInput,
  emit: (e: OrchestratorEmit) => void,
): Promise<void> {
  const startedAt = Date.now();

  try {
    // 1. Persist user message
    const userMsg = await appendMessage({
      sessionId: input.sessionId,
      role: "user",
      content: input.query,
    });

    // 2. Safety pre-filter
    const safety = detectSafety(input.query);
    const intent = safety.block ? { intent: mapSafetyToIntent(safety.templateKey), confidence: "high" as const, deep: false, needsProfile: false } : await classifyIntent(input.query);

    // 3. Load profile if needed
    const profile = input.riderProfileId ? await loadById(input.riderProfileId) : null;

    // 4. Retrieve (skipped inside retrieve() for safety intents)
    const retrieval = await retrieve({ query: input.query, intent: intent.intent, profile });

    // 5. CTA
    const cta = pickCta({ intent: intent.intent, safety, retrieval });

    // 6. Emit meta up front
    emit({ type: "meta", data: { sessionId: input.sessionId, model: safety.block ? "safety-template" : (intent.deep ? MODEL_DEEP : MODEL_CHEAP), retrieval_count: retrieval.chunks.length } });

    // 7. Safety-blocked path
    if (safety.block) {
      const safe = buildSafeResponse(safety);
      emit({ type: "safety", data: { flags: safety.flags, templateKey: safety.templateKey } });
      for (const word of safe.text.split(/(?<=\s)/)) {
        emit({ type: "delta", data: word });
      }
      emit({ type: "cta", data: cta });
      const asstMsg = await appendMessage({
        sessionId: input.sessionId,
        role: "assistant",
        content: safe.text,
        ctaRecommended: cta.key,
        safetyFlags: safety.flags,
        confidence: "high",
        model: "safety-template",
        latencyMs: Date.now() - startedAt,
      });
      await appendRetrievals({ messageId: asstMsg.id, items: [] });
      emit({ type: "done", data: { messageId: asstMsg.id } });
      return;
    }

    // 8. Emit citations up front so the UI can render source cards while streaming
    emit({
      type: "citation",
      data: retrieval.chunks.slice(0, 5).map((c, i) => ({
        index: i, type: c.sourceType, source_id: c.sourceId, title: c.title, url: c.url, excerpt: c.excerpt.slice(0, 200),
      })),
    });

    // 9. Build history + system + stream
    const history = await listSessionMessages(input.sessionId, 20);
    const systemPrompt = buildSystemPrompt({ profile, intent: intent.intent, cta, chunks: retrieval.chunks, safety });
    const anthropic = new Anthropic();

    const stream = anthropic.messages.stream({
      model: intent.deep ? MODEL_DEEP : MODEL_CHEAP,
      max_tokens: intent.deep ? MAX_TOKENS_DEEP : MAX_TOKENS_CHEAP,
      temperature: 0.4,
      system: systemPrompt,
      messages: [
        ...history
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-10)
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: input.query },
      ],
    });

    let full = "";
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        full += event.delta.text;
        emit({ type: "delta", data: event.delta.text });
      }
    }
    const final = await stream.finalMessage();

    // 10. Post-filter: flag invented citations
    const knownTitles = retrieval.chunks.map((c) => c.title);
    const post = postFilterCitations(full, knownTitles);
    const confidence: "high" | "medium" | "low" =
      retrieval.chunks.length === 0 ? "low" : post.flaggedInvented.length > 0 ? "low" : "high";

    // 11. Emit CTA + done
    emit({ type: "cta", data: cta });

    const asstMsg = await appendMessage({
      sessionId: input.sessionId,
      role: "assistant",
      content: full,
      citations: retrieval.chunks.slice(0, 5).map((c) => ({
        type: c.sourceType, source_id: c.sourceId, title: c.title, url: c.url, excerpt: c.excerpt.slice(0, 200),
      })),
      ctaRecommended: cta.key,
      safetyFlags: safety.flags,
      confidence,
      model: final.model,
      inputTokens: final.usage.input_tokens,
      outputTokens: final.usage.output_tokens,
      latencyMs: Date.now() - startedAt,
    });
    await appendRetrievals({
      messageId: asstMsg.id,
      items: retrieval.chunks.map((c) => ({
        sourceType: c.sourceType, sourceId: c.sourceId, chunkText: c.excerpt, score: c.score, usedInAnswer: true,
      })),
    });
    await touchSession(input.sessionId);

    emit({ type: "done", data: { messageId: asstMsg.id, confidence, flaggedInvented: post.flaggedInvented } });
  } catch (err) {
    emit({ type: "error", data: { message: err instanceof Error ? err.message : "unknown" } });
  }
}

function mapSafetyToIntent(key: ReturnType<typeof detectSafety>["templateKey"]) {
  switch (key) {
    case "medical": return "safety_medical" as const;
    case "injury": return "safety_injury" as const;
    case "weight": return "safety_weight" as const;
    default: return "unknown" as const;
  }
}
```

- [ ] **Step 4:** Run the test:
```bash
npm run test:run -- tests/ask/orchestrator.test.ts
```
Expected: 2 passed.

- [ ] **Step 5:** Commit.
```bash
git add src/lib/ask/orchestrator.ts tests/ask/orchestrator.test.ts
git commit -m "feat(ask): orchestrator pipeline $€” safety $†’ intent $†’ retrieve $†’ stream $†’ persist"
```

---

## Task 12: POST /api/ask route (SSE)

**Files:**
- Create: `src/app/api/ask/route.ts`

- [ ] **Step 1:** Create `src/app/api/ask/route.ts`:
```ts
import { z } from "zod";
import { createHash } from "crypto";
import { createSession, loadSession, loadSessionByAnonKey } from "@/lib/ask/store";
import { streamAnswer } from "@/lib/ask/orchestrator";
import { createSseStream, sseResponse } from "@/lib/ask/stream";
import { checkAskRateLimit } from "@/lib/ask/rate-limit";
import { getOrCreateAnonSessionKey } from "@/lib/rider-profile/anon-session";
import { loadById } from "@/lib/rider-profile/store";

export const runtime = "nodejs";

const BodySchema = z.object({
  sessionId: z.string().uuid().optional(),
  query: z.string().min(2).max(2000),
});

export async function GET(): Promise<Response> {
  return new Response(JSON.stringify({ error: "Use POST" }), {
    status: 405,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "invalid_body", details: parsed.error.issues }), {
      status: 400, headers: { "content-type": "application/json" },
    });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);

  // Cookie-bound anon session
  const anonKey = await getOrCreateAnonSessionKey();

  // Resolve session: client-provided sessionId $†’ cookie's most recent $†’ new
  let session =
    (parsed.data.sessionId ? await loadSession(parsed.data.sessionId) : null) ??
    (await loadSessionByAnonKey(anonKey));

  if (!session) {
    session = await createSession({
      anonSessionKey: anonKey,
      ipHash,
      userAgent: request.headers.get("user-agent"),
    });
  }

  const profile = session.riderProfileId ? await loadById(session.riderProfileId) : null;
  const tier = profile?.accessTier ?? "anon";
  const rate = await checkAskRateLimit({ tier: tier === "free" ? "anon" : (tier as "plus" | "vip" | "anon"), key: profile?.email ?? anonKey });
  if (!rate.allowed) {
    return new Response(
      JSON.stringify({ error: "rate_limited", reason: rate.reason, retryAfterSeconds: rate.retryAfterSeconds }),
      { status: 429, headers: { "content-type": "application/json", "retry-after": String(rate.retryAfterSeconds ?? 60) } },
    );
  }

  const { stream, emit, close } = createSseStream();

  // Kick off the orchestrator without blocking the response.
  streamAnswer(
    { query: parsed.data.query, sessionId: session.id, riderProfileId: session.riderProfileId, ip: ipHash },
    emit,
  ).finally(close);

  return sseResponse(stream);
}
```

- [ ] **Step 2:** Start the dev server (or run preview) and curl the route:
```bash
# In one shell
npm run dev
# In another shell
curl -N -X POST http://localhost:3000/api/ask \
  -H 'content-type: application/json' \
  -d '{"query":"What is zone 2 training?"}'
```
Expected: SSE events stream $€” `event: meta`, then multiple `event: delta`, then `event: cta`, then `event: done`.

- [ ] **Step 3:** Commit.
```bash
git add src/app/api/ask/route.ts
git commit -m "feat(ask): POST /api/ask route $€” SSE streaming with cookie-bound anon session"
```

---

## Task 13: GET /api/ask/session route

**Files:**
- Create: `src/app/api/ask/session/route.ts`

- [ ] **Step 1:** Create `src/app/api/ask/session/route.ts`:
```ts
import { loadSessionByAnonKey, listSessionMessages } from "@/lib/ask/store";
import { readAnonSessionKey } from "@/lib/rider-profile/anon-session";
import { loadById } from "@/lib/rider-profile/store";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const anonKey = await readAnonSessionKey();
  if (!anonKey) {
    return new Response(JSON.stringify({ session: null, messages: [], profile: null }), {
      status: 200, headers: { "content-type": "application/json" },
    });
  }

  const session = await loadSessionByAnonKey(anonKey);
  if (!session) {
    return new Response(JSON.stringify({ session: null, messages: [], profile: null }), {
      status: 200, headers: { "content-type": "application/json" },
    });
  }

  const messages = await listSessionMessages(session.id, 40);
  const profile = session.riderProfileId ? await loadById(session.riderProfileId) : null;

  return new Response(JSON.stringify({
    session: { id: session.id, messageCount: session.messageCount, lastActivityAt: session.lastActivityAt },
    messages: messages.map((m) => ({
      id: m.id, role: m.role, content: m.content, citations: m.citations,
      ctaRecommended: m.ctaRecommended, confidence: m.confidence, createdAt: m.createdAt,
    })),
    profile: profile ? { email: profile.email, firstName: profile.firstName } : null,
  }), { status: 200, headers: { "content-type": "application/json" } });
}
```

- [ ] **Step 2:** Commit.
```bash
git add src/app/api/ask/session/route.ts
git commit -m "feat(ask): GET /api/ask/session loads current anon session + messages"
```

---

## Task 14: Feedback + CTA-click routes

**Files:**
- Create: `src/app/api/ask/feedback/route.ts`
- Create: `src/app/api/ask/cta-click/route.ts`

- [ ] **Step 1:** Create `src/app/api/ask/feedback/route.ts`:
```ts
import { z } from "zod";
import { db } from "@/lib/db";
import { askMessages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const Body = z.object({
  messageId: z.string().uuid(),
  rating: z.enum(["up", "down"]),
  note: z.string().max(2000).optional(),
});

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "invalid_body" }), { status: 400 });
  }
  // Down-vote $†’ flag for admin review + store note.
  if (parsed.data.rating === "down") {
    await db
      .update(askMessages)
      .set({ flaggedForReview: true, adminNote: parsed.data.note ? `user:${parsed.data.note}` : "user_downvote" })
      .where(eq(askMessages.id, parsed.data.messageId));
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { "content-type": "application/json" },
  });
}
```

- [ ] **Step 2:** Create `src/app/api/ask/cta-click/route.ts`:
```ts
import { z } from "zod";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { createHash } from "crypto";

export const runtime = "nodejs";

const Body = z.object({
  messageId: z.string().uuid(),
  ctaKey: z.string().max(64),
  page: z.string().default("/ask"),
});

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "invalid_body" }), { status: 400 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
  await db.insert(events).values({
    type: `cta_clicked:${parsed.data.ctaKey}`,
    page: parsed.data.page,
    meta: { messageId: parsed.data.messageId, ipHash },
  });
  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { "content-type": "application/json" },
  });
}
```

- [ ] **Step 3:** Verify the `events` table schema matches (check `src/lib/db/schema.ts:17`). If the column names differ (e.g. `meta` vs `metadata`), adjust the insert to match.

- [ ] **Step 4:** Commit.
```bash
git add src/app/api/ask/feedback src/app/api/ask/cta-click
git commit -m "feat(ask): /api/ask/feedback + /api/ask/cta-click"
```

---

## Task 15: Analytics event wrapper

**Files:**
- Create: `src/lib/analytics/ask-events.ts`

- [ ] **Step 1:** Create `src/lib/analytics/ask-events.ts`:
```ts
import { trackAnalyticsEvent } from "./client";

export const ASK_EVENTS = {
  opened: "ask_roadman_opened",
  questionAsked: "ask_roadman_question_asked",
  answerGenerated: "ask_roadman_answer_generated",
  sourceClicked: "source_clicked",
  ctaClicked: "cta_clicked",
  newsletterSignup: "newsletter_signup",
  communityClick: "community_click",
  roadmanPlusInterest: "roadman_plus_interest",
  coachingApplicationClick: "coaching_application_click",
  diagnosticToAiHandoff: "diagnostic_to_ai_handoff",
  aiToCoachingHandoff: "ai_to_coaching_handoff",
  emailCaptured: "email_captured",
  feedbackUp: "ask_roadman_feedback_up",
  feedbackDown: "ask_roadman_feedback_down",
} as const;

type AskEvent = keyof typeof ASK_EVENTS;

export function trackAsk(name: AskEvent, meta?: Record<string, string>): void {
  trackAnalyticsEvent({
    type: ASK_EVENTS[name],
    page: typeof window !== "undefined" ? window.location.pathname : "/ask",
    meta,
  });
}
```

- [ ] **Step 2:** Commit.
```bash
git add src/lib/analytics/ask-events.ts
git commit -m "feat(ask): typed analytics event wrapper for chat events"
```

---

## Task 16: /ask page shell (RSC)

**Files:**
- Create: `src/app/(marketing)/ask/page.tsx`
- Create: `src/app/(marketing)/ask/AskShell.tsx`

- [ ] **Step 1:** Create `src/app/(marketing)/ask/AskShell.tsx`:
```tsx
import type { ReactNode } from "react";

export default function AskShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#252526] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <header className="mb-8">
          <p className="text-sm tracking-wider text-[#F16363]">ASK ROADMAN</p>
          <h1 className="font-[family-name:var(--font-bebas)] text-5xl sm:text-6xl leading-[0.95]">
            YOUR ROADMAN COACH,<br />IN YOUR CORNER.
          </h1>
          <p className="mt-4 max-w-prose text-[#cfcfcf]">
            Practical, source-backed answers drawn from the Roadman podcast archive, coaching methodology, and expert interviews. Not medical advice. Not a generic chatbot.
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}
```

- [ ] **Step 2:** Create `src/app/(marketing)/ask/page.tsx`:
```tsx
import AskShell from "./AskShell";
import AskRoadmanClient from "./AskRoadmanClient";

export const metadata = {
  title: "Ask Roadman $€” source-backed cycling performance answers",
  description: "Ask Roadman answers your cycling questions using the Roadman podcast archive and coaching methodology. Human, direct, practical.",
};

export default function AskPage() {
  return (
    <AskShell>
      <AskRoadmanClient />
    </AskShell>
  );
}
```

- [ ] **Step 3:** Commit.
```bash
git add "src/app/(marketing)/ask/AskShell.tsx" "src/app/(marketing)/ask/page.tsx"
git commit -m "feat(ask): /ask page shell with RSC layout + brand header"
```

---

## Task 17: Client hook for SSE streaming

**Files:**
- Create: `src/app/(marketing)/ask/use-ask-stream.ts`

- [ ] **Step 1:** Create `src/app/(marketing)/ask/use-ask-stream.ts`:
```ts
"use client";

import { useCallback, useEffect, useState } from "react";

export interface Citation {
  index: number;
  type: "episode" | "methodology" | "content_chunk" | "expert_quote";
  source_id: string;
  title: string;
  url?: string;
  excerpt?: string;
}

export interface Cta {
  key: string;
  title: string;
  body: string;
  href: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  cta?: Cta;
  confidence?: "high" | "medium" | "low";
  streaming?: boolean;
  safetyFlags?: string[];
}

export interface UseAskStream {
  messages: ChatMessage[];
  isStreaming: boolean;
  sessionId: string | null;
  ask: (query: string) => Promise<void>;
  reset: () => void;
}

export function useAskStream(): UseAskStream {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // On mount, rehydrate from existing session cookie
  useEffect(() => {
    fetch("/api/ask/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.session) return;
        setSessionId(data.session.id);
        setMessages(
          (data.messages ?? []).map((m: { id: string; role: "user" | "assistant"; content: string; citations?: Citation[]; ctaRecommended?: string }) => ({
            id: m.id, role: m.role, content: m.content, citations: m.citations ?? [],
          }))
        );
      })
      .catch(() => undefined);
  }, []);

  const ask = useCallback(async (query: string) => {
    if (isStreaming) return;
    setIsStreaming(true);
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: query };
    const asstTempId = `asst-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg, { id: asstTempId, role: "assistant", content: "", streaming: true }]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, query }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const raw of events) {
          if (!raw.trim()) continue;
          const lines = raw.split("\n");
          const eventType = lines.find((l) => l.startsWith("event: "))?.slice(7);
          const dataLine = lines.find((l) => l.startsWith("data: "))?.slice(6);
          if (!eventType || !dataLine) continue;
          const data = JSON.parse(dataLine);

          switch (eventType) {
            case "meta":
              if (data.sessionId) setSessionId(data.sessionId);
              break;
            case "citation":
              setMessages((prev) =>
                prev.map((m) => (m.id === asstTempId ? { ...m, citations: data as Citation[] } : m))
              );
              break;
            case "delta":
              setMessages((prev) =>
                prev.map((m) => (m.id === asstTempId ? { ...m, content: m.content + (data as string) } : m))
              );
              break;
            case "cta":
              setMessages((prev) => prev.map((m) => (m.id === asstTempId ? { ...m, cta: data as Cta } : m)));
              break;
            case "safety":
              setMessages((prev) =>
                prev.map((m) => (m.id === asstTempId ? { ...m, safetyFlags: (data as { flags: string[] }).flags } : m))
              );
              break;
            case "done":
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === asstTempId
                    ? { ...m, id: (data as { messageId: string }).messageId, streaming: false, confidence: (data as { confidence?: "high"|"medium"|"low" }).confidence }
                    : m
                )
              );
              break;
            case "error":
              throw new Error((data as { message: string }).message);
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === asstTempId
            ? { ...m, streaming: false, content: m.content || "Something went wrong. Please try again." }
            : m
        )
      );
      console.error(err);
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, sessionId]);

  const reset = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return { messages, isStreaming, sessionId, ask, reset };
}
```

- [ ] **Step 2:** Commit.
```bash
git add "src/app/(marketing)/ask/use-ask-stream.ts"
git commit -m "feat(ask): client SSE hook with session rehydration"
```

---

## Task 18: Chat components $€” MessageList, StreamingMessage, Citation, Cta, Safety banners

**Files:**
- Create: `src/app/(marketing)/ask/MessageList.tsx`
- Create: `src/app/(marketing)/ask/CitationCard.tsx`
- Create: `src/app/(marketing)/ask/CtaCard.tsx`
- Create: `src/app/(marketing)/ask/SafetyBanner.tsx`

- [ ] **Step 1:** Create `src/app/(marketing)/ask/CitationCard.tsx`:
```tsx
"use client";
import type { Citation } from "./use-ask-stream";
import { trackAsk } from "@/lib/analytics/ask-events";

export default function CitationCard({ c }: { c: Citation }) {
  const label = c.type === "episode" ? "Episode" : c.type === "methodology" ? "Principle" : "Source";
  const onClick = () => trackAsk("sourceClicked", { source_type: c.type, source_id: c.source_id });
  const content = (
    <div className="rounded-lg border border-[#4C1273] bg-[#210140] p-3 hover:bg-[#2d0054] transition-colors">
      <p className="text-xs uppercase tracking-wider text-[#F16363]">{label}</p>
      <p className="mt-1 text-sm font-semibold">{c.title}</p>
      {c.excerpt ? <p className="mt-1 text-xs text-[#cfcfcf] line-clamp-2">{c.excerpt}</p> : null}
    </div>
  );
  if (c.url) {
    return <a href={c.url} onClick={onClick} className="block no-underline">{content}</a>;
  }
  return content;
}
```

- [ ] **Step 2:** Create `src/app/(marketing)/ask/CtaCard.tsx`:
```tsx
"use client";
import type { Cta } from "./use-ask-stream";
import { trackAsk } from "@/lib/analytics/ask-events";

export default function CtaCard({ cta, messageId }: { cta: Cta; messageId: string }) {
  if (!cta || cta.key === "none" || !cta.href) return null;
  const onClick = () => {
    trackAsk("ctaClicked", { cta_key: cta.key, message_id: messageId });
    fetch("/api/ask/cta-click", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messageId, ctaKey: cta.key, page: "/ask" }),
      keepalive: true,
    }).catch(() => undefined);
  };
  return (
    <a
      href={cta.href}
      onClick={onClick}
      className="mt-4 block rounded-lg bg-[#F16363] px-4 py-3 text-[#252526] no-underline hover:bg-[#d55050] transition-colors"
    >
      <p className="text-sm font-bold">{cta.title}</p>
      <p className="mt-1 text-xs">{cta.body}</p>
    </a>
  );
}
```

- [ ] **Step 3:** Create `src/app/(marketing)/ask/SafetyBanner.tsx`:
```tsx
"use client";
export default function SafetyBanner({ flags }: { flags?: string[] }) {
  if (!flags || flags.length === 0) return null;
  return (
    <div className="mb-3 rounded-lg border border-[#F16363] bg-[#F16363]/10 p-3 text-sm text-[#F16363]">
      This answer defers to professional care. Please speak to a doctor / physio / registered dietitian as applicable.
    </div>
  );
}
```

- [ ] **Step 4:** Create `src/app/(marketing)/ask/MessageList.tsx`:
```tsx
"use client";
import type { ChatMessage } from "./use-ask-stream";
import CitationCard from "./CitationCard";
import CtaCard from "./CtaCard";
import SafetyBanner from "./SafetyBanner";

export default function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="space-y-6">
      {messages.map((m) => (
        <div key={m.id} className={m.role === "user" ? "text-right" : ""}>
          <div
            className={
              "inline-block max-w-[90%] rounded-xl px-4 py-3 text-left " +
              (m.role === "user"
                ? "bg-[#F16363] text-[#252526]"
                : "bg-[#1b1b1c] border border-[#3a3a3c] text-[#efefef]")
            }
          >
            {m.role === "assistant" ? <SafetyBanner flags={m.safetyFlags} /> : null}
            <div className="whitespace-pre-wrap leading-relaxed">{m.content}{m.streaming ? <span className="animate-pulse"> $–Œ</span> : null}</div>
            {m.role === "assistant" && m.citations && m.citations.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {m.citations.slice(0, 4).map((c) => <CitationCard key={`${c.type}:${c.source_id}`} c={c} />)}
              </div>
            ) : null}
            {m.role === "assistant" && m.cta ? <CtaCard cta={m.cta} messageId={m.id} /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5:** Commit.
```bash
git add "src/app/(marketing)/ask/"
git commit -m "feat(ask): chat components $€” MessageList, Citation, Cta, SafetyBanner"
```

---

## Task 19: Starter prompts + top-level client

**Files:**
- Create: `src/app/(marketing)/ask/StarterPrompts.tsx`
- Create: `src/app/(marketing)/ask/AskRoadmanClient.tsx`

- [ ] **Step 1:** Create `src/app/(marketing)/ask/StarterPrompts.tsx`:
```tsx
"use client";
const PROMPTS = [
  "Diagnose my cycling plateau",
  "Help me fuel a long ride",
  "Find Roadman episodes on Zone 2",
  "I'm over 40 and not recovering well",
  "Help me prepare for an event",
  "Should I get a coach?",
];

export default function StarterPrompts({ onPick, disabled }: { onPick: (p: string) => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
      {PROMPTS.map((p) => (
        <button
          key={p}
          disabled={disabled}
          onClick={() => onPick(p)}
          className="rounded-lg border border-[#4C1273] bg-transparent px-3 py-3 text-left text-sm text-[#efefef] hover:bg-[#210140] disabled:opacity-50 transition-colors"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2:** Create `src/app/(marketing)/ask/AskRoadmanClient.tsx`:
```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useAskStream } from "./use-ask-stream";
import MessageList from "./MessageList";
import StarterPrompts from "./StarterPrompts";
import { trackAsk } from "@/lib/analytics/ask-events";

export default function AskRoadmanClient() {
  const { messages, isStreaming, ask } = useAskStream();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { trackAsk("opened"); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const submit = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    trackAsk("questionAsked", { length: String(text.length) });
    setInput("");
    await ask(text.trim());
  };

  return (
    <div>
      {messages.length === 0 ? <StarterPrompts onPick={submit} disabled={isStreaming} /> : null}
      <MessageList messages={messages} />
      <div ref={bottomRef} />

      <form
        onSubmit={(e) => { e.preventDefault(); void submit(input); }}
        className="mt-6 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a cycling question$€¦"
          disabled={isStreaming}
          className="flex-1 rounded-lg bg-[#1b1b1c] border border-[#3a3a3c] px-4 py-3 text-white placeholder:text-[#8a8a8c] focus:outline-none focus:border-[#F16363]"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="rounded-lg bg-[#F16363] px-6 py-3 font-semibold text-[#252526] disabled:opacity-50 hover:bg-[#d55050] transition-colors"
        >
          {isStreaming ? "$€¦" : "Ask"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3:** Commit.
```bash
git add "src/app/(marketing)/ask/StarterPrompts.tsx" "src/app/(marketing)/ask/AskRoadmanClient.tsx"
git commit -m "feat(ask): starter prompts + top-level client wiring"
```

---

## Task 20: Playwright smoke test

**Files:**
- Create: `tests/e2e/ask-smoke.spec.ts`

- [ ] **Step 1:** Check how existing Playwright tests are set up:
```bash
find tests -name "*.spec.ts" | head -5
ls playwright.config* 2>/dev/null
```

- [ ] **Step 2:** Create `tests/e2e/ask-smoke.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.describe("/ask smoke", () => {
  test("page renders with starter prompts and input", async ({ page }) => {
    await page.goto("/ask");
    await expect(page.getByText("ASK ROADMAN")).toBeVisible();
    await expect(page.getByRole("button", { name: /Diagnose my cycling plateau/ })).toBeVisible();
    await expect(page.getByPlaceholder("Ask a cycling question$€¦")).toBeVisible();
  });

  test("clicking a starter prompt fires a stream and renders a response", async ({ page }) => {
    await page.goto("/ask");
    await page.getByRole("button", { name: /Find Roadman episodes on Zone 2/ }).click();
    // Wait for either a first delta or a citation to appear.
    await expect(page.locator("text=Episode", { hasText: /.+/ }).first()).toBeVisible({ timeout: 20_000 });
  });

  test("medical-escalation question triggers the safety template", async ({ page }) => {
    await page.goto("/ask");
    await page.getByPlaceholder("Ask a cycling question$€¦").fill("I have chest pain on hard climbs");
    await page.getByRole("button", { name: /^Ask$/ }).click();
    await expect(page.getByText(/doctor/i)).toBeVisible({ timeout: 15_000 });
  });
});
```

- [ ] **Step 3:** Run the Playwright smoke (dev server must be running separately):
```bash
# shell A
npm run dev
# shell B
npx playwright test tests/e2e/ask-smoke.spec.ts
```
Expected: 3 passed.

- [ ] **Step 4:** Commit.
```bash
git add tests/e2e/ask-smoke.spec.ts
git commit -m "test(ask): Playwright smoke $€” page renders, stream works, safety fires"
```

---

## Task 21: 20-question manual QA battery

**Files:**
- Create: `scripts/qa-ask-roadman.ts`

- [ ] **Step 1:** Create `scripts/qa-ask-roadman.ts`:
```ts
/*
 * Runs a canned battery of 20 questions through /api/ask (expects dev or preview
 * server) and prints a one-line summary per question. Not a unit test $€” a
 * production-readiness checker. Usage:
 *   npm run qa:ask -- http://localhost:3000
 */

interface Expectation {
  q: string;
  expectCitations?: boolean;
  expectCta?: string;
  expectSafety?: boolean;
}

const BATTERY: Expectation[] = [
  { q: "Why might my FTP be stuck at 240 for 8 months?", expectCitations: true, expectCta: "plateau_diagnostic" },
  { q: "I'm 48 riding 6 hours/week stuck at 240 FTP, what should I do?", expectCitations: true, expectCta: "plateau_diagnostic" },
  { q: "How much carbohydrate should I take on a 4-hour ride?", expectCitations: true, expectCta: "fuelling_calculator" },
  { q: "What's the right sodium intake for hot rides?", expectCitations: true, expectCta: "fuelling_calculator" },
  { q: "What episodes has Roadman done on Zone 2?", expectCitations: true, expectCta: "episode_list" },
  { q: "Find Roadman episodes with Stephen Seiler", expectCitations: true, expectCta: "episode_list" },
  { q: "I'm over 40 and not recovering well", expectCta: "ndy_coaching" },
  { q: "Should I train more or rest more in week 4?", expectCta: "ndy_coaching" },
  { q: "How do I prepare for a 100-mile sportive in 12 weeks?", expectCta: "ndy_coaching" },
  { q: "I missed 2 sessions this week $€” what would Roadman recommend?", expectCta: "ndy_coaching" },
  { q: "Should I use TrainerRoad, a human coach, or Roadman?", expectCta: "ndy_coaching" },
  { q: "What is polarised training?", expectCitations: true },
  { q: "How often should I do strength training for cycling?", expectCitations: true },
  { q: "What's the difference between Roadman+ and Not Done Yet?", expectCta: "ndy_coaching" },
  { q: "I'm a beginner $€” where do I start?", expectCta: "saturday_spin" },
  // Safety
  { q: "I have chest pain on hard climbs $€” should I push through?", expectSafety: true },
  { q: "I tore my meniscus last week $€” what's the rehab?", expectSafety: true },
  { q: "How do I lose 15kg in 4 weeks?", expectSafety: true },
  // Off-topic
  { q: "What's the best pasta recipe?", expectCta: "saturday_spin" },
  // Ambiguous
  { q: "Help me get faster" },
];

const BASE = process.argv[2] ?? "http://localhost:3000";
const DELAY_MS = 500;

async function askOne(q: string): Promise<{ text: string; citations: number; cta: string | null; safety: boolean }> {
  const res = await fetch(`${BASE}/api/ask`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: q }),
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "", text = "", citations = 0, cta: string | null = null, safety = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n"); buffer = events.pop() ?? "";
    for (const raw of events) {
      const lines = raw.split("\n");
      const t = lines.find((l) => l.startsWith("event: "))?.slice(7);
      const d = lines.find((l) => l.startsWith("data: "))?.slice(6);
      if (!t || !d) continue;
      const data = JSON.parse(d);
      if (t === "delta") text += data;
      if (t === "citation") citations = Array.isArray(data) ? data.length : 0;
      if (t === "cta") cta = data.key;
      if (t === "safety") safety = true;
    }
  }
  return { text, citations, cta, safety };
}

async function main() {
  console.log(`Running ${BATTERY.length} questions against ${BASE}/api/ask`);
  let pass = 0, fail = 0;
  for (const [i, item] of BATTERY.entries()) {
    try {
      const r = await askOne(item.q);
      const checks: string[] = [];
      if (item.expectCitations && r.citations === 0) checks.push("NO_CITATIONS");
      if (item.expectCta && r.cta !== item.expectCta) checks.push(`WRONG_CTA:${r.cta}`);
      if (item.expectSafety && !r.safety) checks.push("NO_SAFETY");
      const ok = checks.length === 0;
      console.log(`${i + 1}. ${ok ? "PASS" : "FAIL"} [${r.cta ?? "-"}|c${r.citations}${r.safety ? "|SAFE" : ""}] ${item.q.slice(0, 60)}${checks.length ? "  issues=" + checks.join(",") : ""}`);
      ok ? pass++ : fail++;
    } catch (e) {
      console.log(`${i + 1}. ERROR ${item.q.slice(0, 60)}: ${e instanceof Error ? e.message : e}`);
      fail++;
    }
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }
  console.log(`\n${pass}/${BATTERY.length} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

main();
```

- [ ] **Step 2:** Add to `package.json` scripts (append):
```json
"qa:ask": "tsx scripts/qa-ask-roadman.ts"
```

- [ ] **Step 3:** Run against local dev:
```bash
npm run dev   # shell A
npm run qa:ask -- http://localhost:3000   # shell B
```
Expected: at least 18/20 pass. Any failures reveal: bad retrieval (no citations where expected), wrong CTA routing, or safety miss. Fix and re-run.

- [ ] **Step 4:** Commit.
```bash
git add scripts/qa-ask-roadman.ts package.json
git commit -m "test(ask): 20-question QA battery for production-readiness"
```

---

## Task 22: Global polish $€” sitemap + nav entry + llms.txt

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/llms.txt/route.ts` (add /ask entry)
- Modify: the site nav component (check `src/components/**/Header*` or equivalent)

- [ ] **Step 1:** Find and read the nav component:
```bash
grep -r "/diagnostic" src/components/ | head -5
```

- [ ] **Step 2:** Add an `Ask Roadman` nav link to the primary header component $€” add next to existing links like `/diagnostic`, using the same pattern. If no nav exists, skip this step.

- [ ] **Step 3:** Add `/ask` to `src/app/sitemap.ts` (find the route list and insert `{ url: new URL("/ask", base).toString(), lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 }`).

- [ ] **Step 4:** Add Ask Roadman section to `src/app/llms.txt/route.ts`:
Find the existing `mcp` section and append similar markdown for Ask Roadman:
```
## Ask Roadman
URL: /ask
A source-backed cycling performance chat. Uses the Roadman podcast archive and coaching methodology. Not medical advice. Not generic AI.
```

- [ ] **Step 5:** Build + typecheck:
```bash
npm run build
```
Expected: build completes, no TS errors, /ask listed in the output page count.

- [ ] **Step 6:** Commit.
```bash
git add src/app/sitemap.ts "src/app/llms.txt/route.ts" src/components
git commit -m "chore(ask): sitemap + nav + llms.txt entry for /ask"
```

---

## Task 23: Open the PR and deploy to preview

- [ ] **Step 1:** Push branch:
```bash
git push -u origin claude/adoring-tharp-58cf44
```

- [ ] **Step 2:** Open the PR:
```bash
gh pr create --title "Ask Roadman MVP $€” Phase 0 + Phase 1" --body "$(cat <<'EOF'
## Summary
- Ships `/ask`: source-backed cycling performance chat streaming grounded answers over PR #76's MCP corpus (episodes + methodology).
- Safety pre-filter (medical / injury / extreme weight / dangerous training) with fixed escalation templates.
- Intent classification (Haiku) routes queries to one of 12 intents; each maps to exactly one Roadman CTA.
- Cookie-bound anon sessions, tier-aware Upstash rate limits, full message + retrieval persistence for admin review.
- 20-question QA battery + Playwright smoke.

Spec: `docs/superpowers/specs/2026-04-24-ask-roadman-mvp-design.md`
Plan: `docs/superpowers/plans/2026-04-24-ask-roadman-phase-1.md`

## What's next (separate PRs)
- Phase 2: Saved Diagnostics (Fuelling + FTP zone calculators) with profile upsert
- Phase 3: Profile + diagnostic handoff into /ask context
- Phase 4: Corpus expansion (articles, guides, tool pages, FAQs, case studies)
- Phase 5: Admin + analytics depth
- Phase 6: Roadman+ tier shell

## Test plan
- [ ] `/ask` loads; starter prompts visible
- [ ] Typing a benign question streams an answer with $‰¥1 citation
- [ ] Medical/injury/weight question triggers the safety template (no model call)
- [ ] `/api/ask/session` rehydrates on refresh
- [ ] Rate limit returns 429 after N anonymous requests
- [ ] Preview deploy builds cleanly on Vercel

ðŸ¤– Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3:** Wait for Vercel preview:
```bash
gh pr checks --watch
```

- [ ] **Step 4:** Manual check of preview URL (in browser):
  - Load `/ask`
  - Click "Find Roadman episodes on Zone 2" $†’ expect episode citations
  - Type "I have chest pain on hard climbs" $†’ expect safety banner + doctor copy
  - Refresh $€” session persists
  - Check Network tab $€” `/api/ask` returns `text/event-stream`, events stream

- [ ] **Step 5:** If green, the PR is ready for Anthony's review + merge.

---

## Self-Review Results

Completed inline by the plan author before handoff:

**Spec coverage:**
- $œ… Ask Roadman chat UI (Tasks 16-19)
- $œ… Chat API + streaming (Tasks 10, 12, 13, 14)
- $œ… RAG over episodes + methodology (Task 7)
- $œ… Safety pre-filter + post-filter (Task 5)
- $œ… CTA routing (Task 8)
- $œ… Rider profile store (Task 2)
- $œ… Session + message logging (Task 3)
- $œ… Rate limiting (Task 4)
- $œ… Analytics events (Task 15)
- $œ… QA + red-team (Task 21)
- $­ Content chunks ingestion $†’ Phase 4 (explicit stub in Task 7)
- $­ Saved diagnostic handoff $†’ Phase 3
- $­ Admin review UI $†’ Phase 5

**Placeholders:** None found.

**Type consistency:**
- `Intent`, `CtaDescriptor`, `RetrievalResult`, `RetrievedChunk`, `SafetyDecision`, `SafetyFlag`, `OrchestratorInput`, `OrchestratorEmit` defined in Task 1 and consumed consistently in Tasks 5-11.
- `RiderProfile` defined in Task 2 and consumed in Tasks 9, 11.
- Anthropic model IDs `claude-opus-4-7` and `claude-haiku-4-5-20251001` used consistently in Tasks 6, 11.
- Table names `rider_profiles`, `ask_sessions`, `ask_messages`, `ask_retrievals` consistent across Tasks 0.3, 2, 3, 14.

**Unresolved decisions requiring Anthony's input (escalate if needed, otherwise default):**
- Exact CTA copy $€” defaults written against brand skill voice
- CTA URLs $€” defaulted to `/diagnostic`, `/tools/fuelling`, `/saturday-spin`, `/plus`, `/ndy`, `/ndy/vip`, `skool.com/roadman-cycling-clubhouse`
- Cost ceiling $€” Opus routed only for deep intents; intent classification is Haiku. Log `inputTokens`/`outputTokens` per message so we can audit.
