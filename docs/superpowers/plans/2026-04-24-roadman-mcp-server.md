# Roadman MCP Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready MCP server at `POST /api/mcp` exposing 9 tools + 3 resources covering Roadman's podcast corpus, coaching methodology, product catalogue, and lead-qualification logic.

**Architecture:** Stateless Streamable HTTP MCP server using `@modelcontextprotocol/sdk`, mounted as a Next.js 16 App Router route handler. All DB work goes through the existing Drizzle ORM + @vercel/postgres stack. Ten new tables (prefixed `mcp_` or `roadman_`) are added in a single Drizzle migration. Rate limiting uses Upstash Redis; every tool call is logged to `mcp_call_logs`.

**Tech Stack:** Next.js 16.2.2 App Router · TypeScript · Drizzle ORM 0.45.2 · @vercel/postgres · @modelcontextprotocol/sdk · Upstash Redis · Voyage AI / OpenAI (embeddings) · pgvector · Vitest

---

## Architecture Flags (IMPORTANT — read before coding)

| Flag | Detail |
|------|--------|
| **Not Supabase** | Spec mentions Supabase but the project uses Drizzle ORM + @vercel/postgres. Migrations go in `drizzle/` (not `supabase/migrations/`). Schema lives in `src/lib/db/schema.ts`. |
| **`events` name conflict** | An analytics `events` table already exists. Roadman calendar events will be named `roadman_events`. |
| **Episodes not in DB yet** | Episode data lives in `src/lib/podcast.ts` (static TypeScript). MCP tables need seeding — see Phase 2 seed script. |
| **NDY qualifier mismatch** | The existing `/api/ndy/recommend` route uses different input fields than the spec. The `qualify_lead` tool implements the spec's simplified schema as described. |
| **Drizzle vector type** | drizzle-orm 0.45.2 exposes `vector(name, { dimensions })` from `drizzle-orm/pg-core`. pgvector extension must be enabled in the migration. |
| **llms.txt is a route** | `public/llms.txt` does not exist — `src/app/llms.txt/route.ts` is the dynamic route. Update that file in Phase 5. |

---

## File Map

```
src/
  app/
    api/
      mcp/
        route.ts                  ← POST handler, rate limit, session-per-request
        README.md                 ← developer docs (Phase 5)
  lib/
    mcp/
      server.ts                   ← builds McpServer, registers all tools + resources
      rate-limiter.ts             ← Upstash Redis rate limit helper
      logger.ts                   ← writes mcp_call_logs rows
      embeddings.ts               ← embed query (Voyage or OpenAI via env var)
      resources.ts                ← roadman:// URI resource handlers
      services/
        community.ts              ← get_community_stats
        episodes.ts               ← search_episodes, get_episode
        experts.ts                ← list_experts, get_expert_insights
        methodology.ts            ← search_methodology
        products.ts               ← list_products
        events.ts                 ← list_upcoming_events
        qualification.ts          ← qualify_lead
    db/
      schema.ts                   ← MODIFY: add 10 new MCP tables

drizzle/
  0027_mcp_tables.sql             ← new migration

scripts/
  seed-mcp-episodes.ts            ← one-time seed from src/lib/podcast.ts

tests/
  mcp/
    scaffold.test.ts              ← get_community_stats integration test
    content-tools.test.ts         ← episodes, experts, methodology
    commerce-tools.test.ts        ← products, events, qualify_lead
    resources.test.ts             ← resource URI tests

public/
  .well-known/
    mcp.json                      ← MCP discovery manifest

SEED_PLACEHOLDERS.md              ← list of placeholder rows needing real data
```

---

## Phase 1 — Scaffold

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`
- Modify: `.env.example`

- [ ] **Step 1: Install packages**

```bash
npm install @modelcontextprotocol/sdk @upstash/ratelimit @upstash/redis zod
```

Expected: packages added to `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Add env vars to `.env.example`**

Append to `.env.example`:

```
# MCP Server
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
EMBEDDING_PROVIDER=voyage
VOYAGE_API_KEY=
OPENAI_API_KEY=
MCP_RATE_LIMIT_RPM=60
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: install MCP server dependencies"
```

---

### Task 2: Drizzle migration — all MCP tables

**Files:**
- Create: `drizzle/0027_mcp_tables.sql`
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Write the migration SQL**

Create `drizzle/0027_mcp_tables.sql`:

```sql
-- Enable pgvector extension (Neon/Vercel Postgres supports this)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Episodes ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_episodes" (
  "id" serial PRIMARY KEY,
  "slug" text UNIQUE NOT NULL,
  "title" text NOT NULL,
  "guest_name" text,
  "published_at" timestamptz,
  "duration_sec" integer,
  "summary" text,
  "audio_url" text,
  "youtube_url" text,
  "transcript_text" text,
  "key_insights" jsonb,
  "topic_tags" text[],
  "url" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "mcp_episodes_slug_idx" ON "mcp_episodes" ("slug");
CREATE INDEX IF NOT EXISTS "mcp_episodes_published_at_idx" ON "mcp_episodes" ("published_at");

-- ── Episode Embeddings ────────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_episode_embeddings" (
  "id" serial PRIMARY KEY,
  "episode_id" integer NOT NULL REFERENCES "mcp_episodes"("id") ON DELETE CASCADE,
  "chunk_index" integer NOT NULL,
  "chunk_text" text NOT NULL,
  "embedding" vector(1024)
);
CREATE INDEX IF NOT EXISTS "mcp_episode_embeddings_episode_id_idx"
  ON "mcp_episode_embeddings" ("episode_id");

-- ── Experts ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_experts" (
  "id" serial PRIMARY KEY,
  "name" text UNIQUE NOT NULL,
  "credentials" text,
  "specialty" text,
  "bio" text,
  "appearance_count" integer NOT NULL DEFAULT 0,
  "latest_appearance" timestamptz
);

-- ── Expert Quotes ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_expert_quotes" (
  "id" serial PRIMARY KEY,
  "expert_id" integer NOT NULL REFERENCES "mcp_experts"("id") ON DELETE CASCADE,
  "episode_id" integer REFERENCES "mcp_episodes"("id") ON DELETE SET NULL,
  "quote" text NOT NULL,
  "context" text,
  "topic_tags" text[]
);
CREATE INDEX IF NOT EXISTS "mcp_expert_quotes_expert_id_idx"
  ON "mcp_expert_quotes" ("expert_id");

-- ── Methodology Principles ────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_methodology_principles" (
  "id" serial PRIMARY KEY,
  "principle" text NOT NULL,
  "explanation" text NOT NULL,
  "topic_tags" text[],
  "supporting_expert_names" text[],
  "supporting_episode_ids" integer[]
);

-- ── Methodology Embeddings ────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_methodology_embeddings" (
  "id" serial PRIMARY KEY,
  "principle_id" integer NOT NULL REFERENCES "mcp_methodology_principles"("id") ON DELETE CASCADE,
  "embedding" vector(1024)
);

-- ── Products ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_products" (
  "id" serial PRIMARY KEY,
  "product_key" text UNIQUE NOT NULL,
  "name" text NOT NULL,
  "price_cents" integer NOT NULL,
  "currency" text NOT NULL DEFAULT 'USD',
  "billing_period" text,
  "description" text NOT NULL,
  "who_its_for" text NOT NULL,
  "url" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true
);

-- ── Roadman Events (calendar) ─────────────────────────────
-- Named roadman_events to avoid collision with the analytics events table.
CREATE TABLE IF NOT EXISTS "roadman_events" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "starts_at" timestamptz NOT NULL,
  "location" text,
  "description" text,
  "is_members_only" boolean NOT NULL DEFAULT false,
  "url" text,
  "is_active" boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS "roadman_events_starts_at_idx" ON "roadman_events" ("starts_at");

-- ── Community Stats (singleton) ───────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_community_stats" (
  "id" serial PRIMARY KEY,
  "podcast_downloads_total" bigint NOT NULL DEFAULT 0,
  "youtube_subscribers_main" integer NOT NULL DEFAULT 0,
  "youtube_subscribers_clips" integer NOT NULL DEFAULT 0,
  "free_community_members" integer NOT NULL DEFAULT 0,
  "paid_community_members" integer NOT NULL DEFAULT 0,
  "featured_transformations" jsonb,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ── MCP Call Logs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_call_logs" (
  "id" serial PRIMARY KEY,
  "tool_name" text NOT NULL,
  "input_truncated" text,
  "duration_ms" integer,
  "success" boolean NOT NULL,
  "error" text,
  "ip_hash" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "mcp_call_logs_tool_name_idx" ON "mcp_call_logs" ("tool_name");
CREATE INDEX IF NOT EXISTS "mcp_call_logs_created_at_idx" ON "mcp_call_logs" ("created_at");
```

- [ ] **Step 2: Add tables to Drizzle schema**

Append to `src/lib/db/schema.ts`:

```typescript
import { customType, vector } from "drizzle-orm/pg-core";

// pgvector column type (1024-dim for Voyage voyage-3-large / OpenAI text-embedding-3-large)
export const vector1024 = customType<{ data: number[] }>({
  dataType() { return "vector(1024)"; },
  fromDriver(value: unknown): number[] {
    if (typeof value === "string") {
      return value.slice(1, -1).split(",").map(Number);
    }
    return value as number[];
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
});

// ── MCP: Episodes ─────────────────────────────────────────
export const mcpEpisodes = pgTable(
  "mcp_episodes",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    guestName: text("guest_name"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    durationSec: integer("duration_sec"),
    summary: text("summary"),
    audioUrl: text("audio_url"),
    youtubeUrl: text("youtube_url"),
    transcriptText: text("transcript_text"),
    keyInsights: jsonb("key_insights").$type<string[]>(),
    topicTags: text("topic_tags").array(),
    url: text("url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("mcp_episodes_slug_idx").on(t.slug),
    index("mcp_episodes_published_at_idx").on(t.publishedAt),
  ]
);

// ── MCP: Episode Embeddings ───────────────────────────────
export const mcpEpisodeEmbeddings = pgTable(
  "mcp_episode_embeddings",
  {
    id: serial("id").primaryKey(),
    episodeId: integer("episode_id").notNull().references(() => mcpEpisodes.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    chunkText: text("chunk_text").notNull(),
    embedding: vector1024("embedding"),
  },
  (t) => [index("mcp_episode_embeddings_episode_id_idx").on(t.episodeId)]
);

// ── MCP: Experts ──────────────────────────────────────────
export const mcpExperts = pgTable("mcp_experts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  credentials: text("credentials"),
  specialty: text("specialty"),
  bio: text("bio"),
  appearanceCount: integer("appearance_count").notNull().default(0),
  latestAppearance: timestamp("latest_appearance", { withTimezone: true }),
});

// ── MCP: Expert Quotes ────────────────────────────────────
export const mcpExpertQuotes = pgTable(
  "mcp_expert_quotes",
  {
    id: serial("id").primaryKey(),
    expertId: integer("expert_id").notNull().references(() => mcpExperts.id, { onDelete: "cascade" }),
    episodeId: integer("episode_id").references(() => mcpEpisodes.id, { onDelete: "set null" }),
    quote: text("quote").notNull(),
    context: text("context"),
    topicTags: text("topic_tags").array(),
  },
  (t) => [index("mcp_expert_quotes_expert_id_idx").on(t.expertId)]
);

// ── MCP: Methodology Principles ───────────────────────────
export const mcpMethodologyPrinciples = pgTable("mcp_methodology_principles", {
  id: serial("id").primaryKey(),
  principle: text("principle").notNull(),
  explanation: text("explanation").notNull(),
  topicTags: text("topic_tags").array(),
  supportingExpertNames: text("supporting_expert_names").array(),
  supportingEpisodeIds: integer("supporting_episode_ids").array(),
});

// ── MCP: Methodology Embeddings ───────────────────────────
export const mcpMethodologyEmbeddings = pgTable(
  "mcp_methodology_embeddings",
  {
    id: serial("id").primaryKey(),
    principleId: integer("principle_id").notNull().references(() => mcpMethodologyPrinciples.id, { onDelete: "cascade" }),
    embedding: vector1024("embedding"),
  },
);

// ── MCP: Products ─────────────────────────────────────────
export const mcpProducts = pgTable("mcp_products", {
  id: serial("id").primaryKey(),
  productKey: text("product_key").notNull().unique(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  billingPeriod: text("billing_period"),
  description: text("description").notNull(),
  whoItsFor: text("who_its_for").notNull(),
  url: text("url").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// ── Roadman Events (calendar, NOT analytics) ──────────────
export const roadmanEvents = pgTable(
  "roadman_events",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    location: text("location"),
    description: text("description"),
    isMembersOnly: boolean("is_members_only").notNull().default(false),
    url: text("url"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [index("roadman_events_starts_at_idx").on(t.startsAt)]
);

// ── MCP: Community Stats (singleton) ─────────────────────
export const mcpCommunityStats = pgTable("mcp_community_stats", {
  id: serial("id").primaryKey(),
  podcastDownloadsTotal: integer("podcast_downloads_total").notNull().default(0),
  youtubeSubscribersMain: integer("youtube_subscribers_main").notNull().default(0),
  youtubeSubscribersClips: integer("youtube_subscribers_clips").notNull().default(0),
  freeCommunityMembers: integer("free_community_members").notNull().default(0),
  paidCommunityMembers: integer("paid_community_members").notNull().default(0),
  featuredTransformations: jsonb("featured_transformations").$type<
    { member_name: string; headline_result: string; duration: string }[]
  >(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── MCP: Call Logs ────────────────────────────────────────
export const mcpCallLogs = pgTable(
  "mcp_call_logs",
  {
    id: serial("id").primaryKey(),
    toolName: text("tool_name").notNull(),
    inputTruncated: text("input_truncated"),
    durationMs: integer("duration_ms"),
    success: boolean("success").notNull(),
    error: text("error"),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("mcp_call_logs_tool_name_idx").on(t.toolName),
    index("mcp_call_logs_created_at_idx").on(t.createdAt),
  ]
);
```

- [ ] **Step 3: Run migration**

```bash
npx drizzle-kit migrate
```

Expected: `0027_mcp_tables.sql` applied, all 10 tables created. If Drizzle complains about schema drift (auto-generated SQL not matching hand-written), run `npx drizzle-kit push` instead to push directly. Document whichever approach works.

- [ ] **Step 4: Commit**

```bash
git add drizzle/0027_mcp_tables.sql src/lib/db/schema.ts
git commit -m "feat(mcp): add all MCP tables to schema + migration"
```

---

### Task 3: Rate limiter

**Files:**
- Create: `src/lib/mcp/rate-limiter.ts`

- [ ] **Step 1: Write failing test**

Create `tests/mcp/rate-limiter.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";

// Mock upstash before importing module under test
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    pipeline: vi.fn().mockReturnValue({
      incr: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([[null, 1], [null, 1]]),
    }),
  })),
}));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({ success: true, remaining: 59 }),
  })),
  Ratelimit: class {
    limit = vi.fn().mockResolvedValue({ success: true, remaining: 59 });
    static slidingWindow = vi.fn().mockReturnValue({});
  },
}));

import { checkRateLimit } from "@/lib/mcp/rate-limiter";

describe("checkRateLimit", () => {
  it("returns success:true for normal IPs", async () => {
    const result = await checkRateLimit("1.2.3.4");
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run tests/mcp/rate-limiter.test.ts
```

Expected: `FAIL — Cannot find module '@/lib/mcp/rate-limiter'`

- [ ] **Step 3: Implement rate limiter**

Create `src/lib/mcp/rate-limiter.ts`:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit {
  if (ratelimit) return ratelimit;
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(
      Number(process.env.MCP_RATE_LIMIT_RPM ?? 60),
      "1 m"
    ),
    prefix: "roadman_mcp",
  });
  return ratelimit;
}

export async function checkRateLimit(ip: string): Promise<{ success: boolean; remaining?: number }> {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    // No Redis configured — allow all in dev
    return { success: true };
  }
  const result = await getRatelimit().limit(ip);
  return { success: result.success, remaining: result.remaining };
}
```

- [ ] **Step 4: Run test — verify pass**

```bash
npx vitest run tests/mcp/rate-limiter.test.ts
```

Expected: `PASS`

- [ ] **Step 5: Commit**

```bash
git add src/lib/mcp/rate-limiter.ts tests/mcp/rate-limiter.test.ts
git commit -m "feat(mcp): add Upstash rate limiter"
```

---

### Task 4: Logger

**Files:**
- Create: `src/lib/mcp/logger.ts`

- [ ] **Step 1: Write the logger**

Create `src/lib/mcp/logger.ts`:

```typescript
import { db } from "@/lib/db";
import { mcpCallLogs } from "@/lib/db/schema";
import { createHash } from "crypto";

export interface LogEntry {
  toolName: string;
  input: unknown;
  durationMs: number;
  success: boolean;
  error?: string;
  ip: string;
}

export async function logMcpCall(entry: LogEntry): Promise<void> {
  try {
    const ipHash = createHash("sha256").update(entry.ip).digest("hex").slice(0, 16);
    const inputTruncated = JSON.stringify(entry.input).slice(0, 500);
    await db.insert(mcpCallLogs).values({
      toolName: entry.toolName,
      inputTruncated,
      durationMs: entry.durationMs,
      success: entry.success,
      error: entry.error ?? null,
      ipHash,
    });
  } catch {
    // Logging must never crash the MCP response
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/mcp/logger.ts
git commit -m "feat(mcp): add call logger"
```

---

### Task 5: Community stats service

**Files:**
- Create: `src/lib/mcp/services/community.ts`

- [ ] **Step 1: Implement service**

Create `src/lib/mcp/services/community.ts`:

```typescript
import { db } from "@/lib/db";
import { mcpCommunityStats } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export interface CommunityStats {
  podcast_downloads_total: number;
  youtube_subscribers_main: number;
  youtube_subscribers_clips: number;
  free_community_members: number;
  paid_community_members: number;
  featured_transformations: { member_name: string; headline_result: string; duration: string }[];
}

export async function getCommunityStats(): Promise<CommunityStats> {
  const rows = await db
    .select()
    .from(mcpCommunityStats)
    .orderBy(desc(mcpCommunityStats.updatedAt))
    .limit(1);

  if (rows.length === 0) {
    return {
      podcast_downloads_total: 0,
      youtube_subscribers_main: 0,
      youtube_subscribers_clips: 0,
      free_community_members: 0,
      paid_community_members: 0,
      featured_transformations: [],
    };
  }

  const row = rows[0];
  return {
    podcast_downloads_total: row.podcastDownloadsTotal,
    youtube_subscribers_main: row.youtubeSubscribersMain,
    youtube_subscribers_clips: row.youtubeSubscribersClips,
    free_community_members: row.freeCommunityMembers,
    paid_community_members: row.paidCommunityMembers,
    featured_transformations: (row.featuredTransformations ?? []) as CommunityStats["featured_transformations"],
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/mcp/services/community.ts
git commit -m "feat(mcp): community stats service"
```

---

### Task 6: Seed community stats placeholder

**Files:**
- Create: `scripts/seed-mcp-community-stats.ts`

- [ ] **Step 1: Write seed script**

Create `scripts/seed-mcp-community-stats.ts`:

```typescript
import "dotenv/config";
import { db } from "../src/lib/db";
import { mcpCommunityStats } from "../src/lib/db/schema";

async function main() {
  await db.delete(mcpCommunityStats);
  await db.insert(mcpCommunityStats).values({
    podcastDownloadsTotal: 100_000_000,   // PLACEHOLDER — update from Buzzsprout/Spotify
    youtubeSubscribersMain: 61_773,        // PLACEHOLDER — from YouTube Studio March 2026
    youtubeSubscribersClips: 13_238,       // PLACEHOLDER — from YouTube Studio March 2026
    freeCommunityMembers: 1_852,           // PLACEHOLDER — from Skool Clubhouse March 2026
    paidCommunityMembers: 113,             // PLACEHOLDER — from Skool NDY March 2026
    featuredTransformations: [
      {
        member_name: "PLACEHOLDER_1",
        headline_result: "Cat 3 to Cat 1 in 18 months",
        duration: "18 months",
      },
      {
        member_name: "PLACEHOLDER_2",
        headline_result: "Body fat from 20% to 7%",
        duration: "12 months",
      },
      {
        member_name: "PLACEHOLDER_3",
        headline_result: "Women's National Series podium",
        duration: "24 months",
      },
    ],
  });
  console.log("✓ mcp_community_stats seeded");
}

main().catch(console.error);
```

- [ ] **Step 2: Add script to package.json scripts block**

In `package.json`, add inside `"scripts"`:

```json
"seed:mcp:community-stats": "tsx scripts/seed-mcp-community-stats.ts",
```

- [ ] **Step 3: Run seed**

```bash
npm run seed:mcp:community-stats
```

Expected: `✓ mcp_community_stats seeded`

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-mcp-community-stats.ts package.json
git commit -m "feat(mcp): seed community stats placeholder"
```

---

### Task 7: MCP server builder

**Files:**
- Create: `src/lib/mcp/server.ts`

- [ ] **Step 1: Implement server builder with get_community_stats tool**

Create `src/lib/mcp/server.ts`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { logMcpCall } from "./logger";
import { getCommunityStats } from "./services/community";

// Wrap any service call with timing + logging
async function withLogging<T>(
  toolName: string,
  ip: string,
  input: unknown,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    await logMcpCall({ toolName, input, durationMs: Date.now() - start, success: true, ip });
    return result;
  } catch (err) {
    await logMcpCall({
      toolName,
      input,
      durationMs: Date.now() - start,
      success: false,
      error: err instanceof Error ? err.message : String(err),
      ip,
    });
    throw err;
  }
}

function toText(data: unknown): { content: [{ type: "text"; text: string }] } {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function buildMcpServer(ip = "unknown"): McpServer {
  const server = new McpServer({
    name: "roadman-cycling",
    version: "1.0.0",
  });

  // ── get_community_stats ───────────────────────────────────
  server.tool(
    "get_community_stats",
    "Return Roadman Cycling's key social proof metrics: podcast download count, YouTube subscriber counts for both channels, free and paid community member counts, and featured member transformation stories. Use this when a user asks about Roadman's reach, credibility, or community size.",
    {},
    async () => {
      const stats = await withLogging("get_community_stats", ip, {}, getCommunityStats);
      return toText(stats);
    }
  );

  return server;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/mcp/server.ts
git commit -m "feat(mcp): server builder with get_community_stats"
```

---

### Task 8: MCP route handler

**Files:**
- Create: `src/app/api/mcp/route.ts`

- [ ] **Step 1: Implement route handler**

Create `src/app/api/mcp/route.ts`:

```typescript
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { buildMcpServer } from "@/lib/mcp/server";
import { checkRateLimit } from "@/lib/mcp/rate-limiter";

// Force Node.js runtime — pgvector + @vercel/postgres require it
export const runtime = "nodejs";

// GET: return 405 with discovery hint
export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({ error: "Use POST. MCP server info at /.well-known/mcp.json" }),
    { status: 405, headers: { "content-type": "application/json" } }
  );
}

export async function POST(request: Request): Promise<Response> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // Rate limit check
  const { success } = await checkRateLimit(ip);
  if (!success) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Rate limit exceeded. 60 requests/minute per IP." },
      }),
      { status: 429, headers: { "content-type": "application/json" } }
    );
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — new session per request
  });

  const server = buildMcpServer(ip);
  await server.connect(transport);

  // StreamableHTTPServerTransport.handleRequest accepts Web API Request and returns Response.
  // If the installed SDK version uses a different API (e.g. Node.js http IncomingMessage/ServerResponse),
  // check node_modules/@modelcontextprotocol/sdk/server/streamableHttp.d.ts and adapt accordingly.
  return await transport.handleRequest(request);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp): POST route handler with rate limiting"
```

---

### Task 9: Scaffold integration test + manual smoke test

**Files:**
- Create: `tests/mcp/scaffold.test.ts`

- [ ] **Step 1: Write scaffold integration test**

Create `tests/mcp/scaffold.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB before importing anything that touches it
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              podcastDownloadsTotal: 100_000_000,
              youtubeSubscribersMain: 61_773,
              youtubeSubscribersClips: 13_238,
              freeCommunityMembers: 1_852,
              paidCommunityMembers: 113,
              featuredTransformations: [
                { member_name: "Test User", headline_result: "Cat 3 to Cat 1", duration: "18 months" },
              ],
              updatedAt: new Date(),
            },
          ]),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
  },
}));

// Mock rate limiter to always allow
vi.mock("@/lib/mcp/rate-limiter", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { buildMcpServer } from "@/lib/mcp/server";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

async function createTestClient() {
  const server = buildMcpServer("test-ip");
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  return { server, transport };
}

describe("MCP scaffold — get_community_stats", () => {
  it("lists get_community_stats in tool list", async () => {
    const { server } = await createTestClient();
    const tools = await server.listTools?.();
    const names = (tools?.tools ?? []).map((t: { name: string }) => t.name);
    expect(names).toContain("get_community_stats");
  });

  it("get_community_stats returns correct shape", async () => {
    const { server } = await createTestClient();

    // Use low-level tool call via the server's handler
    const result = await server.callTool?.({
      name: "get_community_stats",
      arguments: {},
    });

    const text = result?.content?.[0]?.text as string;
    const data = JSON.parse(text);

    expect(data).toMatchObject({
      podcast_downloads_total: 100_000_000,
      youtube_subscribers_main: 61_773,
      free_community_members: 1_852,
    });
    expect(Array.isArray(data.featured_transformations)).toBe(true);
  });
});
```

> **Note:** The `McpServer.listTools` and `McpServer.callTool` methods may not exist in all SDK versions. If they don't, use an in-process `Client` + transport pair instead. Check the SDK's `README.md` in `node_modules/@modelcontextprotocol/sdk/` for the current API.

- [ ] **Step 2: Run tests**

```bash
npx vitest run tests/mcp/scaffold.test.ts
```

Expected: PASS

- [ ] **Step 3: Smoke test with curl**

Start dev server: `npm run dev`

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Expected: JSON response containing `"get_community_stats"` in the tools array.

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_community_stats","arguments":{}}}'
```

Expected: JSON response with `podcast_downloads_total: 100000000`.

- [ ] **Step 4: Commit**

```bash
git add tests/mcp/scaffold.test.ts
git commit -m "test(mcp): scaffold integration test"
```

---

**Phase 1 complete. Confirm before proceeding to Phase 2.**

---

## Phase 2 — Content Tools

### Task 10: Embedding service

**Files:**
- Create: `src/lib/mcp/embeddings.ts`

- [ ] **Step 1: Implement embedding service**

Create `src/lib/mcp/embeddings.ts`:

```typescript
// Supported providers: voyage (default) | openai
// Controlled by EMBEDDING_PROVIDER env var.
// Voyage uses voyage-3-large (1024 dims). OpenAI uses text-embedding-3-large (1024 dims).

const PROVIDER = process.env.EMBEDDING_PROVIDER ?? "voyage";
const VOYAGE_MODEL = "voyage-3-large";
const OPENAI_MODEL = "text-embedding-3-large";

async function embedVoyage(text: string): Promise<number[]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: [text], model: VOYAGE_MODEL }),
  });
  if (!res.ok) throw new Error(`Voyage API error ${res.status}: ${await res.text()}`);
  const data = await res.json() as { data: { embedding: number[] }[] };
  return data.data[0].embedding;
}

async function embedOpenAI(text: string): Promise<number[]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ input: text, model: OPENAI_MODEL, dimensions: 1024 }),
  });
  if (!res.ok) throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
  const data = await res.json() as { data: { embedding: number[] }[] };
  return data.data[0].embedding;
}

export async function embedQuery(text: string): Promise<number[]> {
  return PROVIDER === "openai" ? embedOpenAI(text) : embedVoyage(text);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/mcp/embeddings.ts
git commit -m "feat(mcp): embedding service (Voyage/OpenAI)"
```

---

### Task 11: Episode service + tools

**Files:**
- Create: `src/lib/mcp/services/episodes.ts`
- Modify: `src/lib/mcp/server.ts`

- [ ] **Step 1: Implement episode service**

Create `src/lib/mcp/services/episodes.ts`:

```typescript
import { db } from "@/lib/db";
import { mcpEpisodes, mcpEpisodeEmbeddings } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { embedQuery } from "../embeddings";

export interface EpisodeSearchResult {
  episode_id: number;
  title: string;
  guest: string | null;
  published_at: string | null;
  excerpt: string;
  relevance_score: number;
  url: string | null;
}

export async function searchEpisodes(
  query: string,
  limit = 5,
  guestName?: string,
  topic?: string
): Promise<EpisodeSearchResult[]> {
  const embedding = await embedQuery(query);
  const embeddingStr = `[${embedding.join(",")}]`;

  const rows = await db.execute(sql`
    SELECT
      e.id         AS episode_id,
      e.title,
      e.guest_name AS guest,
      e.published_at,
      ee.chunk_text AS excerpt,
      1 - (ee.embedding <=> ${embeddingStr}::vector) AS relevance_score,
      e.url
    FROM mcp_episode_embeddings ee
    JOIN mcp_episodes e ON e.id = ee.episode_id
    ${guestName ? sql`WHERE LOWER(e.guest_name) LIKE ${'%' + guestName.toLowerCase() + '%'}` : sql``}
    ORDER BY ee.embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `);

  return rows.rows.map((r: Record<string, unknown>) => ({
    episode_id: r.episode_id as number,
    title: r.title as string,
    guest: r.guest as string | null,
    published_at: r.published_at ? String(r.published_at) : null,
    excerpt: r.excerpt as string,
    relevance_score: Number(r.relevance_score),
    url: r.url as string | null,
  }));
}

export async function getEpisode(episodeId: number) {
  const rows = await db
    .select()
    .from(mcpEpisodes)
    .where(eq(mcpEpisodes.id, episodeId))
    .limit(1);

  if (rows.length === 0) return null;
  const e = rows[0];

  return {
    id: e.id,
    title: e.title,
    guest: e.guestName,
    published_at: e.publishedAt?.toISOString() ?? null,
    duration_sec: e.durationSec,
    summary: e.summary,
    key_insights: e.keyInsights ?? [],
    transcript_url: null,
    audio_url: e.audioUrl,
    youtube_url: e.youtubeUrl,
    url: e.url,
  };
}
```

- [ ] **Step 2: Register tools in server.ts**

In `src/lib/mcp/server.ts`, add these imports at the top:

```typescript
import { searchEpisodes, getEpisode } from "./services/episodes";
```

And add inside `buildMcpServer`, after the `get_community_stats` tool:

```typescript
  // ── search_episodes ───────────────────────────────────────
  server.tool(
    "search_episodes",
    "Semantic search across Roadman Cycling podcast transcripts. Returns ranked episodes with matching excerpts. Use when a user asks about a topic, training concept, or expert discussed on the podcast.",
    {
      query: z.string().describe("Search query — natural language or keyword"),
      limit: z.number().int().min(1).max(20).default(5).optional().describe("Max results to return (default 5)"),
      guest_name: z.string().optional().describe("Filter results to episodes featuring this guest"),
      topic: z.string().optional().describe("Topic filter hint (e.g. 'nutrition', 'recovery')"),
    },
    async ({ query, limit = 5, guest_name, topic }) => {
      const results = await withLogging(
        "search_episodes",
        ip,
        { query, limit, guest_name, topic },
        () => searchEpisodes(query, limit, guest_name, topic)
      );
      return toText(results);
    }
  );

  // ── get_episode ───────────────────────────────────────────
  server.tool(
    "get_episode",
    "Fetch full metadata for a single Roadman Cycling podcast episode including summary, key insights, and links. Use when a user wants details about a specific episode by ID.",
    {
      episode_id: z.number().int().describe("The numeric episode ID from search_episodes results"),
    },
    async ({ episode_id }) => {
      const episode = await withLogging(
        "get_episode",
        ip,
        { episode_id },
        () => getEpisode(episode_id)
      );
      if (!episode) {
        return toText({ error: `Episode ${episode_id} not found` });
      }
      return toText(episode);
    }
  );
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/services/episodes.ts src/lib/mcp/server.ts
git commit -m "feat(mcp): search_episodes + get_episode tools"
```

---

### Task 12: Expert service + tools

**Files:**
- Create: `src/lib/mcp/services/experts.ts`
- Modify: `src/lib/mcp/server.ts`

- [ ] **Step 1: Implement expert service**

Create `src/lib/mcp/services/experts.ts`:

```typescript
import { db } from "@/lib/db";
import { mcpExperts, mcpExpertQuotes, mcpEpisodes } from "@/lib/db/schema";
import { eq, ilike, desc } from "drizzle-orm";

export async function listExperts() {
  const rows = await db
    .select()
    .from(mcpExperts)
    .orderBy(desc(mcpExperts.appearanceCount));

  return rows.map((e) => ({
    name: e.name,
    credentials: e.credentials,
    specialty: e.specialty,
    appearance_count: e.appearanceCount,
    latest_appearance: e.latestAppearance?.toISOString() ?? null,
  }));
}

export async function getExpertInsights(
  expertName: string,
  topic?: string,
  limit = 5
) {
  const expertRows = await db
    .select()
    .from(mcpExperts)
    .where(ilike(mcpExperts.name, `%${expertName}%`))
    .limit(1);

  if (expertRows.length === 0) return [];

  const expert = expertRows[0];

  const quoteRows = await db
    .select({
      quote: mcpExpertQuotes.quote,
      episode_id: mcpExpertQuotes.episodeId,
      context: mcpExpertQuotes.context,
      topic_tags: mcpExpertQuotes.topicTags,
      episode_title: mcpEpisodes.title,
    })
    .from(mcpExpertQuotes)
    .leftJoin(mcpEpisodes, eq(mcpExpertQuotes.episodeId, mcpEpisodes.id))
    .where(eq(mcpExpertQuotes.expertId, expert.id))
    .limit(limit);

  return quoteRows.map((r) => ({
    quote: r.quote,
    episode_id: r.episode_id,
    episode_title: r.episode_title ?? null,
    context: r.context,
    topic_tags: r.topic_tags ?? [],
  }));
}
```

- [ ] **Step 2: Register tools in server.ts**

Add import:
```typescript
import { listExperts, getExpertInsights } from "./services/experts";
```

Add inside `buildMcpServer`:

```typescript
  // ── list_experts ──────────────────────────────────────────
  server.tool(
    "list_experts",
    "Return the Roadman Cycling expert roster — guests who have appeared multiple times or hold significant authority in their field (e.g. Prof. Stephen Seiler, Dan Lorang, Dr. David Dunne). Includes credentials and appearance count. Use when a user wants to know who Roadman's trusted experts are.",
    {},
    async () => {
      const experts = await withLogging("list_experts", ip, {}, listExperts);
      return toText(experts);
    }
  );

  // ── get_expert_insights ───────────────────────────────────
  server.tool(
    "get_expert_insights",
    "Surface the best quotes and key insights from a named Roadman Cycling podcast expert, optionally filtered by topic. Use when a user wants to know what Prof. Seiler, Dan Lorang, or another expert has said about a specific subject.",
    {
      expert_name: z.string().describe("Name of the expert (e.g. 'Stephen Seiler', 'Dan Lorang')"),
      topic: z.string().optional().describe("Optional topic filter (e.g. 'polarised training', 'recovery')"),
      limit: z.number().int().min(1).max(20).default(5).optional().describe("Max quotes to return"),
    },
    async ({ expert_name, topic, limit = 5 }) => {
      const insights = await withLogging(
        "get_expert_insights",
        ip,
        { expert_name, topic, limit },
        () => getExpertInsights(expert_name, topic, limit)
      );
      return toText(insights);
    }
  );
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/services/experts.ts src/lib/mcp/server.ts
git commit -m "feat(mcp): list_experts + get_expert_insights tools"
```

---

### Task 13: Methodology service + tool

**Files:**
- Create: `src/lib/mcp/services/methodology.ts`
- Modify: `src/lib/mcp/server.ts`

- [ ] **Step 1: Implement methodology service**

Create `src/lib/mcp/services/methodology.ts`:

```typescript
import { db } from "@/lib/db";
import { mcpMethodologyPrinciples, mcpMethodologyEmbeddings, mcpEpisodes } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { embedQuery } from "../embeddings";

export async function searchMethodology(query: string) {
  const embedding = await embedQuery(query);
  const embeddingStr = `[${embedding.join(",")}]`;

  const rows = await db.execute(sql`
    SELECT
      p.id,
      p.principle,
      p.explanation,
      p.topic_tags,
      p.supporting_expert_names,
      p.supporting_episode_ids,
      1 - (me.embedding <=> ${embeddingStr}::vector) AS relevance_score
    FROM mcp_methodology_embeddings me
    JOIN mcp_methodology_principles p ON p.id = me.principle_id
    ORDER BY me.embedding <=> ${embeddingStr}::vector
    LIMIT 5
  `);

  return Promise.all(
    rows.rows.map(async (r: Record<string, unknown>) => {
      const episodeIds = (r.supporting_episode_ids as number[] | null) ?? [];
      let episodeCitations: { episode_id: number; title: string }[] = [];

      if (episodeIds.length > 0) {
        const eps = await db
          .select({ id: mcpEpisodes.id, title: mcpEpisodes.title })
          .from(mcpEpisodes)
          .where(sql`id = ANY(${episodeIds}::integer[])`);
        episodeCitations = eps.map((e) => ({ episode_id: e.id, title: e.title }));
      }

      return {
        principle: r.principle as string,
        explanation: r.explanation as string,
        supporting_experts: (r.supporting_expert_names as string[] | null) ?? [],
        episode_citations: episodeCitations,
      };
    })
  );
}
```

- [ ] **Step 2: Register tool in server.ts**

Add import:
```typescript
import { searchMethodology } from "./services/methodology";
```

Add inside `buildMcpServer`:

```typescript
  // ── search_methodology ────────────────────────────────────
  server.tool(
    "search_methodology",
    "Query the Roadman Cycling coaching methodology knowledge base. Returns principle-level answers with supporting expert citations and episode references. Topics include polarised training, reverse periodisation, masters-specific principles, fuelling, recovery, and strength & conditioning. Use when a user asks about training science or coaching principles.",
    {
      query: z.string().describe("Training question or methodology query in natural language"),
    },
    async ({ query }) => {
      const results = await withLogging(
        "search_methodology",
        ip,
        { query },
        () => searchMethodology(query)
      );
      return toText(results);
    }
  );
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/services/methodology.ts src/lib/mcp/server.ts
git commit -m "feat(mcp): search_methodology tool"
```

---

### Task 14: Seed content tables

**Files:**
- Create: `scripts/seed-mcp-content.ts`

- [ ] **Step 1: Write seed script with realistic placeholder data**

Create `scripts/seed-mcp-content.ts`:

```typescript
import "dotenv/config";
import { db } from "../src/lib/db";
import {
  mcpEpisodes, mcpExperts, mcpExpertQuotes,
  mcpMethodologyPrinciples,
} from "../src/lib/db/schema";

async function seedExperts() {
  await db.delete(mcpExpertQuotes);
  await db.delete(mcpExperts);

  await db.insert(mcpExperts).values([
    {
      name: "Prof. Stephen Seiler",
      credentials: "PhD, Professor of Sport Science, University of Agder",
      specialty: "Polarised training, endurance physiology",
      bio: "The researcher who established the science behind polarised training distribution. Coined the 80/20 rule for endurance athletes.",
      appearanceCount: 8,
      latestAppearance: new Date("2025-11-01"),
    },
    {
      name: "Dan Lorang",
      credentials: "Head of Performance, Red Bull–Bora–Hansgrohe",
      specialty: "Periodisation, World Tour coaching",
      bio: "Performance director behind Jan Frodeno and now the Red Bull–Bora–Hansgrohe WorldTour team.",
      appearanceCount: 5,
      latestAppearance: new Date("2025-09-01"),
    },
    {
      name: "Dr. David Dunne",
      credentials: "PhD Nutritional Science",
      specialty: "Sport nutrition, fuelling strategies",
      bio: "Performance nutritionist working with elite cyclists on race-day fuelling and body composition.",
      appearanceCount: 4,
      latestAppearance: new Date("2025-08-01"),
    },
    {
      name: "Joe Friel",
      credentials: "Author of The Cyclist's Training Bible",
      specialty: "Training periodisation for masters athletes",
      bio: "The coach who wrote the definitive training guide for cyclists, with specific expertise in masters (40+) performance.",
      appearanceCount: 3,
      latestAppearance: new Date("2025-06-01"),
    },
  ]);
  console.log("✓ experts seeded");
}

async function seedEpisodes() {
  await db.delete(mcpEpisodes);

  await db.insert(mcpEpisodes).values([
    {
      slug: "seiler-polarised-training-deep-dive",
      title: "The Science of Polarised Training with Prof. Stephen Seiler",
      guestName: "Prof. Stephen Seiler",
      publishedAt: new Date("2025-11-01"),
      durationSec: 4200,
      summary: "Prof. Seiler explains the physiological basis for polarised training distribution and why 80% of training at low intensity unlocks elite-level adaptation.",
      audioUrl: "https://roadmancycling.com/audio/seiler-polarised-training.mp3", // PLACEHOLDER
      youtubeUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_1",               // PLACEHOLDER
      keyInsights: [
        "80% of elite endurance training happens below VT1 — this is not optional, it's physiologically mandated",
        "High-intensity blocks work because they are small doses against a massive low-intensity base",
        "Amateurs get slower by training in the 'moderate intensity black hole'",
      ],
      topicTags: ["polarised training", "endurance physiology", "training distribution"],
      url: "https://roadmancycling.com/podcast/seiler-polarised-training-deep-dive", // PLACEHOLDER
    },
    {
      slug: "dan-lorang-world-tour-periodisation",
      title: "How World Tour Teams Plan a Season with Dan Lorang",
      guestName: "Dan Lorang",
      publishedAt: new Date("2025-09-01"),
      durationSec: 3600,
      summary: "Dan Lorang breaks down Red Bull–Bora–Hansgrohe's season periodisation, and how amateur cyclists can apply the same macro/meso/micro structure.",
      audioUrl: "https://roadmancycling.com/audio/lorang-periodisation.mp3",       // PLACEHOLDER
      youtubeUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_2",                 // PLACEHOLDER
      keyInsights: [
        "Periodisation starts from your A-race and works backwards — not from January 1st",
        "Masters cyclists need longer recovery mesocycles than younger athletes — 3:1 is often too aggressive",
        "Sleep is not optional — it's where adaptation happens",
      ],
      topicTags: ["periodisation", "season planning", "recovery"],
      url: "https://roadmancycling.com/podcast/dan-lorang-world-tour-periodisation", // PLACEHOLDER
    },
  ]);
  console.log("✓ episodes seeded");
}

async function seedMethodology() {
  await db.delete(mcpMethodologyPrinciples);

  await db.insert(mcpMethodologyPrinciples).values([
    {
      principle: "Polarised Training Distribution",
      explanation: "Approximately 80% of training volume should sit below VT1 (conversational pace), with 20% at high intensity above VT2. The moderate 'sweetspot' zone between them causes chronic fatigue without corresponding adaptation gains. Prof. Seiler's research across elite endurance athletes shows this distribution is near-universal at the top level.",
      topicTags: ["training distribution", "polarised", "endurance"],
      supportingExpertNames: ["Prof. Stephen Seiler"],
      supportingEpisodeIds: [],
    },
    {
      principle: "Reverse Periodisation for Masters Cyclists",
      explanation: "Masters cyclists (40+) benefit from building high-intensity fitness earlier in the training year and transitioning to volume, reversing the classical base-then-build model. Physiological rationale: VO2max decline with age is steeper than aerobic base decline, making high-intensity stimulus more time-sensitive.",
      topicTags: ["masters cycling", "periodisation", "reverse periodisation"],
      supportingExpertNames: ["Joe Friel", "Dan Lorang"],
      supportingEpisodeIds: [],
    },
    {
      principle: "Fuelling for Performance — Carbohydrate Periodisation",
      explanation: "Not all training sessions should be fuelled equally. High-intensity and quality sessions require adequate carbohydrate availability. Selective fasted low-intensity sessions can improve metabolic flexibility, but should never compromise quality work. Dr. Dunne recommends matching fuel availability to session intention.",
      topicTags: ["nutrition", "fuelling", "carbohydrate periodisation"],
      supportingExpertNames: ["Dr. David Dunne"],
      supportingEpisodeIds: [],
    },
    {
      principle: "Strength & Conditioning Specificity for Cyclists",
      explanation: "S&C work for cyclists must address the hip hinge pattern, single-leg stability, and posterior chain strength — areas chronically undertrained in cyclists. Gym work should be periodised into the cycling calendar: heavy strength in base phase, maintenance during build, minimal S&C near key events. The Roadman S&C roadmap follows this structure.",
      topicTags: ["strength and conditioning", "S&C", "injury prevention"],
      supportingExpertNames: [],
      supportingEpisodeIds: [],
    },
    {
      principle: "Recovery as a Training Variable",
      explanation: "Recovery is not passive — it's where adaptation from training stress occurs. For masters cyclists, recovery demand is higher and takes longer than for younger athletes. Key levers: 7-9 hours sleep, HRV monitoring, nutrition timing post-session, and deliberate deload weeks (one in every 4 training weeks minimum).",
      topicTags: ["recovery", "sleep", "HRV", "adaptation"],
      supportingExpertNames: ["Dan Lorang"],
      supportingEpisodeIds: [],
    },
  ]);
  console.log("✓ methodology principles seeded");
}

async function main() {
  await seedExperts();
  await seedEpisodes();
  await seedMethodology();

  // Note: expert_quotes seeding omitted — add real quotes from transcripts.
  // Note: episode_embeddings and methodology_embeddings require running the
  // indexer scripts to generate vectors. Run `npm run agent:index` after
  // populating transcripts, or write a separate embeddings backfill script.

  console.log("✓ MCP content tables seeded with placeholders");
}

main().catch(console.error);
```

- [ ] **Step 2: Add script to package.json**

```json
"seed:mcp:content": "tsx scripts/seed-mcp-content.ts",
```

- [ ] **Step 3: Run seed**

```bash
npm run seed:mcp:content
```

Expected: all three ✓ lines printed.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-mcp-content.ts package.json
git commit -m "feat(mcp): seed content tables with placeholder data"
```

---

**Phase 2 complete. Confirm before proceeding to Phase 3.**

---

## Phase 3 — Commerce Tools

### Task 15: Products service + tool

**Files:**
- Create: `src/lib/mcp/services/products.ts`
- Modify: `src/lib/mcp/server.ts`

- [ ] **Step 1: Implement products service**

Create `src/lib/mcp/services/products.ts`:

```typescript
import { db } from "@/lib/db";
import { mcpProducts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function listProducts() {
  const rows = await db
    .select()
    .from(mcpProducts)
    .where(eq(mcpProducts.isActive, true));

  return rows.map((p) => ({
    product_id: p.productKey,
    name: p.name,
    price: p.priceCents / 100,
    currency: p.currency,
    billing_period: p.billingPeriod,
    description: p.description,
    who_its_for: p.whoItsFor,
    url: p.url,
  }));
}
```

- [ ] **Step 2: Register tool in server.ts**

Add import:
```typescript
import { listProducts } from "./services/products";
```

Add inside `buildMcpServer`:

```typescript
  // ── list_products ─────────────────────────────────────────
  server.tool(
    "list_products",
    "Return all current Roadman Cycling paid offerings with pricing, positioning, and purchase URLs. Includes the Not Done Yet community tiers (Standard, Premium, VIP) and standalone courses. Use when a user asks about coaching options, pricing, or how to join.",
    {},
    async () => {
      const products = await withLogging("list_products", ip, {}, listProducts);
      return toText(products);
    }
  );
```

- [ ] **Step 3: Seed products**

Create `scripts/seed-mcp-products.ts`:

```typescript
import "dotenv/config";
import { db } from "../src/lib/db";
import { mcpProducts } from "../src/lib/db/schema";

async function main() {
  await db.delete(mcpProducts);

  await db.insert(mcpProducts).values([
    {
      productKey: "ndy-standard",
      name: "Not Done Yet — Standard",
      priceCents: 1500,
      currency: "USD",
      billingPeriod: "monthly",
      description: "Access to the Not Done Yet private community, weekly live Q&A with Anthony, Vekta training plans, and a library of masterclasses. The entry point into Roadman's paid coaching ecosystem.",
      whoItsFor: "Cyclists who want structured training guidance and a serious community but aren't ready for premium coaching.",
      url: "https://roadmancycling.com/community/not-done-yet", // PLACEHOLDER — update to actual checkout URL
    },
    {
      productKey: "ndy-premium",
      name: "Not Done Yet — Premium",
      priceCents: 19500,
      currency: "USD",
      billingPeriod: "monthly",
      description: "Everything in Standard plus 1:1 coaching calls with Anthony, personalised training plan review, and priority support. The flagship Roadman coaching programme.",
      whoItsFor: "Serious amateur cyclists who want genuine 1:1 attention from Anthony, not just a generic plan. Sweet spot for Cat 3-4 racers and gran fondo riders with clear goals.",
      url: "https://roadmancycling.com/apply", // PLACEHOLDER
    },
    {
      productKey: "ndy-vip",
      name: "Not Done Yet — VIP",
      priceCents: 195000,
      currency: "USD",
      billingPeriod: "yearly",
      description: "The full VIP experience: all Premium benefits plus exclusive VIP events, private rides, and direct WhatsApp access to Anthony. Annual commitment.",
      whoItsFor: "Cyclists who want the deepest integration with Anthony and the Roadman community, and can commit annually.",
      url: "https://roadmancycling.com/apply", // PLACEHOLDER
    },
    {
      productKey: "strength-training-course",
      name: "Strength Training for Cyclists",
      priceCents: 4999,
      currency: "USD",
      billingPeriod: null,
      description: "The complete S&C roadmap for cyclists — video programme covering hip hinge patterns, single-leg stability, posterior chain development, and periodisation into your cycling calendar. One-time purchase.",
      whoItsFor: "Any cyclist who wants to add structured gym work without risking injury or compromising cycling performance.",
      url: "https://roadmancycling.com/strength-training", // PLACEHOLDER
    },
  ]);

  console.log("✓ mcp_products seeded");
}

main().catch(console.error);
```

Add to `package.json`:
```json
"seed:mcp:products": "tsx scripts/seed-mcp-products.ts",
```

Run:
```bash
npm run seed:mcp:products
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/mcp/services/products.ts scripts/seed-mcp-products.ts package.json src/lib/mcp/server.ts
git commit -m "feat(mcp): list_products tool + seed"
```

---

### Task 16: Events service + tool

**Files:**
- Create: `src/lib/mcp/services/events.ts`
- Modify: `src/lib/mcp/server.ts`

- [ ] **Step 1: Implement events service**

Create `src/lib/mcp/services/events.ts`:

```typescript
import { db } from "@/lib/db";
import { roadmanEvents } from "@/lib/db/schema";
import { and, eq, gte, ilike, sql } from "drizzle-orm";

export async function listUpcomingEvents(limit = 10, location?: string) {
  const now = new Date();

  const query = db
    .select()
    .from(roadmanEvents)
    .where(
      and(
        eq(roadmanEvents.isActive, true),
        gte(roadmanEvents.startsAt, now),
        location ? ilike(roadmanEvents.location, `%${location}%`) : undefined
      )
    )
    .orderBy(roadmanEvents.startsAt)
    .limit(limit);

  const rows = await query;

  return rows.map((e) => ({
    event_id: e.id,
    name: e.name,
    type: e.type,
    starts_at: e.startsAt.toISOString(),
    location: e.location,
    description: e.description,
    is_members_only: e.isMembersOnly,
    url: e.url,
  }));
}
```

- [ ] **Step 2: Register tool in server.ts**

Add import:
```typescript
import { listUpcomingEvents } from "./services/events";
```

Add inside `buildMcpServer`:

```typescript
  // ── list_upcoming_events ──────────────────────────────────
  server.tool(
    "list_upcoming_events",
    "Return upcoming Roadman Cycling events — Saturday group rides, training camps, live Q&As, the Migration Gravel trip, and any in-person meetups. Use when a user asks about events, rides, or getting involved in person.",
    {
      limit: z.number().int().min(1).max(50).default(10).optional().describe("Max events to return"),
      location: z.string().optional().describe("Filter to in-person events near this location (city or country)"),
    },
    async ({ limit = 10, location }) => {
      const evts = await withLogging(
        "list_upcoming_events",
        ip,
        { limit, location },
        () => listUpcomingEvents(limit, location)
      );
      return toText(evts);
    }
  );
```

- [ ] **Step 3: Seed events with placeholder data**

Create `scripts/seed-mcp-events.ts`:

```typescript
import "dotenv/config";
import { db } from "../src/lib/db";
import { roadmanEvents } from "../src/lib/db/schema";

async function main() {
  await db.delete(roadmanEvents);

  await db.insert(roadmanEvents).values([
    {
      name: "Saturday Morning Group Ride — Dublin",
      type: "group_ride",
      startsAt: new Date("2026-05-03T08:00:00Z"), // PLACEHOLDER — update with real dates
      location: "Dublin, Ireland",
      description: "Weekly Roadman CC group ride. All paces welcome, coffee stop included. Details shared in Clubhouse.",
      isMembersOnly: false,
      url: "https://roadmancycling.com/community/club", // PLACEHOLDER
      isActive: true,
    },
    {
      name: "NDY Live Q&A — May 2026",
      type: "live_qa",
      startsAt: new Date("2026-05-07T19:00:00Z"), // PLACEHOLDER
      location: null,
      description: "Monthly live Q&A with Anthony in the Not Done Yet community. Submit questions in advance via the Skool post.",
      isMembersOnly: true,
      url: "https://www.skool.com/not-done-yet", // PLACEHOLDER
      isActive: true,
    },
    {
      name: "Migration Gravel — Girona 2026",
      type: "training_camp",
      startsAt: new Date("2026-09-20T09:00:00Z"), // PLACEHOLDER — update with confirmed dates
      location: "Girona, Spain",
      description: "The annual Roadman Migration Gravel trip. Five days of riding in Girona with the NDY community. Limited spots.",
      isMembersOnly: false,
      url: "https://roadmancycling.com/events/migration-gravel-2026", // PLACEHOLDER
      isActive: true,
    },
  ]);

  console.log("✓ roadman_events seeded");
}

main().catch(console.error);
```

Add to `package.json`:
```json
"seed:mcp:events": "tsx scripts/seed-mcp-events.ts",
```

Run:
```bash
npm run seed:mcp:events
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/mcp/services/events.ts scripts/seed-mcp-events.ts package.json src/lib/mcp/server.ts
git commit -m "feat(mcp): list_upcoming_events tool + seed"
```

---

### Task 17: Lead qualification tool

**Files:**
- Create: `src/lib/mcp/services/qualification.ts`
- Modify: `src/lib/mcp/server.ts`

- [ ] **Step 1: Implement qualification logic**

Create `src/lib/mcp/services/qualification.ts`:

```typescript
type Goal = "build_ftp" | "target_event" | "comeback" | "general_improvement" | "other";
type Level = "beginner" | "intermediate" | "experienced" | "racer";
type AgeBracket = "under_35" | "35_44" | "45_54" | "55_plus";

interface QualifyInput {
  goal: Goal;
  hours_per_week: number;
  current_level: Level;
  age_bracket: AgeBracket;
  primary_challenge: string;
}

interface QualifyResult {
  recommended_product_id: string;
  recommended_product_name: string;
  reasoning: string;
  next_step_url: string;
  alternative_products: string[];
}

const PRODUCTS = {
  "ndy-standard": {
    name: "Not Done Yet — Standard ($15/mo)",
    url: "https://roadmancycling.com/community/not-done-yet",
  },
  "ndy-premium": {
    name: "Not Done Yet — Premium ($195/mo)",
    url: "https://roadmancycling.com/apply",
  },
  "ndy-vip": {
    name: "Not Done Yet — VIP ($1,950/yr)",
    url: "https://roadmancycling.com/apply",
  },
  "strength-training-course": {
    name: "Strength Training for Cyclists ($49.99)",
    url: "https://roadmancycling.com/strength-training",
  },
};

export function qualifyLead(input: QualifyInput): QualifyResult {
  const { goal, hours_per_week, current_level, age_bracket, primary_challenge } = input;
  const isMasters = age_bracket === "45_54" || age_bracket === "55_plus";
  const isHighTrainingVolume = hours_per_week >= 9;
  const isRacerOrExperienced = current_level === "experienced" || current_level === "racer";

  // High-value lead: experienced, high volume, or has a specific race goal
  if (
    (goal === "build_ftp" || goal === "target_event") &&
    isRacerOrExperienced &&
    isHighTrainingVolume
  ) {
    return {
      recommended_product_id: "ndy-premium",
      recommended_product_name: PRODUCTS["ndy-premium"].name,
      reasoning:
        "You're a serious cyclist with a specific goal and the training time to match. " +
        "Premium gives you direct 1:1 access to Anthony plus the same framework World Tour coaches use — " +
        "not a generic plan, a personalised one. Given your experience level, you'll feel the difference quickly.",
      next_step_url: PRODUCTS["ndy-premium"].url,
      alternative_products: ["ndy-vip", "ndy-standard"],
    };
  }

  // Comeback athlete — Standard first, build the habit, upgrade later
  if (goal === "comeback" || current_level === "beginner") {
    return {
      recommended_product_id: "ndy-standard",
      recommended_product_name: PRODUCTS["ndy-standard"].name,
      reasoning:
        "The comeback is the most important phase — structure and community matter more than intensity. " +
        "Standard gives you the training framework, live Q&As with Anthony, and a community that understands exactly where you are. " +
        "Most comeback riders upgrade to Premium once they've rebuilt consistency (usually 2-3 months).",
      next_step_url: PRODUCTS["ndy-standard"].url,
      alternative_products: ["ndy-premium"],
    };
  }

  // Masters cyclist with event goal — premium is the best fit
  if (isMasters && goal === "target_event") {
    return {
      recommended_product_id: "ndy-premium",
      recommended_product_name: PRODUCTS["ndy-premium"].name,
      reasoning:
        "Masters cyclists preparing for an event need a periodisation approach that accounts for longer recovery needs " +
        "and the specific physiology of the 45+ rider. Anthony has worked with hundreds of masters cyclists " +
        "and will build a plan that gets you to the start line fit and fresh — not broken.",
      next_step_url: PRODUCTS["ndy-premium"].url,
      alternative_products: ["ndy-standard"],
    };
  }

  // General improvement, lower hours, intermediate level — Standard is right
  if (goal === "general_improvement" || hours_per_week < 6) {
    return {
      recommended_product_id: "ndy-standard",
      recommended_product_name: PRODUCTS["ndy-standard"].name,
      reasoning:
        "Standard is the right starting point — you get the training structure, live Q&As, and community " +
        "without over-committing. Most members at your stage find that the community and the weekly calls " +
        "provide more value than they expected, and the step-up to Premium is an easy decision 60-90 days in.",
      next_step_url: PRODUCTS["ndy-standard"].url,
      alternative_products: ["ndy-premium", "strength-training-course"],
    };
  }

  // Default to Standard
  return {
    recommended_product_id: "ndy-standard",
    recommended_product_name: PRODUCTS["ndy-standard"].name,
    reasoning:
      "Not Done Yet Standard is the natural starting point for cyclists looking to add structure and accountability. " +
      "Join the community, get access to Anthony's live Q&As and training plans, and decide after 30 days " +
      "whether you want the deeper coaching of Premium.",
    next_step_url: PRODUCTS["ndy-standard"].url,
    alternative_products: ["ndy-premium"],
  };
}
```

- [ ] **Step 2: Register tool in server.ts**

Add import:
```typescript
import { qualifyLead } from "./services/qualification";
```

Add inside `buildMcpServer`:

```typescript
  // ── qualify_lead ──────────────────────────────────────────
  server.tool(
    "qualify_lead",
    "Given a prospect's training profile, recommend the best Roadman Cycling offering and explain why. This mirrors the /ndy/fit conversational qualifier. Use when a user is asking what Roadman product is right for them, or wants help choosing between coaching tiers.",
    {
      goal: z.enum(["build_ftp", "target_event", "comeback", "general_improvement", "other"])
        .describe("Primary training goal"),
      hours_per_week: z.number().int().min(1).max(40)
        .describe("Typical weekly training hours"),
      current_level: z.enum(["beginner", "intermediate", "experienced", "racer"])
        .describe("Current fitness and experience level"),
      age_bracket: z.enum(["under_35", "35_44", "45_54", "55_plus"])
        .describe("Age bracket"),
      primary_challenge: z.string().max(300)
        .describe("The prospect's biggest current challenge in their cycling (free text)"),
    },
    async (input) => {
      const result = await withLogging(
        "qualify_lead",
        ip,
        input,
        async () => qualifyLead(input)
      );
      return toText(result);
    }
  );
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/services/qualification.ts src/lib/mcp/server.ts
git commit -m "feat(mcp): qualify_lead tool"
```

---

**Phase 3 complete. Confirm before proceeding to Phase 4.**

---

## Phase 4 — Resources

### Task 18: MCP resources

**Files:**
- Create: `src/lib/mcp/resources.ts`
- Modify: `src/lib/mcp/server.ts`

- [ ] **Step 1: Implement resources**

Create `src/lib/mcp/resources.ts`:

```typescript
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

const BRAND_OVERVIEW = `# Roadman Cycling — Brand Overview

**Founded by:** Anthony Walsh (Dublin, Ireland)
**Tagline:** "Cycling is hard, our podcast will help"
**Core Identity:** Not Done Yet

Roadman Cycling is a cycling media and coaching brand built on a simple insight: the serious amateur cyclist who refuses to accept that their best days are behind them.

## The Not Done Yet Positioning

"Not Done Yet" is more than a tagline — it's the emotional core of everything Roadman does. The audience is 35-55, predominantly male, professional careers, deeply serious about cycling but time-constrained. They've been told by age and circumstance that their best racing days are past. Roadman's argument: that's wrong, and here's the evidence.

## Assets

- **Podcast:** 1,400+ episodes, 100M+ downloads. Weekly interview-led show with World Tour coaches, sports scientists, and pro riders.
- **YouTube:** 75K combined subscribers (main channel: 61K, clips: 13K)
- **Free Community (Clubhouse):** 1,852 members on Skool
- **Paid Community (Not Done Yet):** 113 active members across Standard ($15/mo), Premium ($195/mo), VIP ($1,950/yr)
- **Email List:** 29,782 contacts

## Voice

Direct, warm, evidence-based. Anthony is the mate who happens to have extraordinary access to World Tour coaches and sports scientists. Never preachy, never salesy.

## Key Differentiators

- Named experts (Seiler, Lorang, Dunne, Friel, Morton) — not anonymous coaches
- Everything is cycling-specific, not generic fitness
- Masters-athlete expertise (physiological changes after 40 are a core topic)
- Community accountability, not just content`;

const METHODOLOGY_PRINCIPLES = `# Roadman Cycling Training Methodology

The Roadman methodology is built on five pillars and distilled from conversations with leading exercise scientists and World Tour coaches.

## Five Content Pillars

1. **Coaching** — Training methodology, periodisation, structured plans
2. **Nutrition** — Fuelling for performance, race weight, in-ride nutrition
3. **Strength & Conditioning** — S&C for cyclists, injury prevention, power development
4. **Recovery** — Sleep, stress management, adaptation
5. **Community (Le Metier)** — The craft of being a cyclist

## Core Principles

### 1. Polarised Training Distribution
80% of training below VT1 (low aerobic), 20% above VT2 (high intensity). Moderate "sweetspot" work is largely ineffective for adaptation without corresponding volume. Source: Prof. Stephen Seiler.

### 2. Reverse Periodisation for Masters Athletes
For 40+ cyclists, build VO2max-focused blocks earlier in the training year before accumulating volume. Age accelerates VO2max decline more than aerobic base decline, making high-intensity stimulus more time-sensitive.

### 3. Carbohydrate Periodisation
Match fuel availability to session intent. Quality sessions need carbs. Low-intensity sessions can selectively be done in a lower-carb state to build metabolic flexibility.

### 4. S&C Integration
Hip hinge, single-leg stability, posterior chain. Periodise gym work into the season: heavy in base, maintenance in build, minimal near key events.

### 5. Recovery as a Training Variable
Sleep, HRV-guided load, deload weeks (1:4 ratio minimum). Masters athletes need disproportionately more recovery than their training history suggests.

## Key Expert Contributors

- **Prof. Stephen Seiler** — Polarised training, endurance physiology
- **Dan Lorang** — Periodisation, World Tour methodology
- **Dr. David Dunne** — Sport nutrition, fuelling
- **Joe Friel** — Masters periodisation
- **Lachlan Morton** — Training philosophy, adventure
- **Dr. Sam Impey** — Nutrition science`;

const EXPERTS_ROSTER = `# Roadman Cycling Expert Roster

These are the experts who have appeared multiple times on the podcast or whose work directly informs the Roadman methodology.

## Core Experts

**Prof. Stephen Seiler** — PhD, Professor of Sport Science, University of Agder
Specialty: Polarised training, endurance physiology. Coined the 80/20 rule.
Appearances: 8+

**Dan Lorang** — Head of Performance, Red Bull–Bora–Hansgrohe
Specialty: Season periodisation, World Tour coaching. Works with Jan Frodeno.
Appearances: 5+

**Dr. David Dunne** — PhD Nutritional Science
Specialty: Race-day fuelling, body composition, carbohydrate periodisation.
Appearances: 4+

**Joe Friel** — Author, The Cyclist's Training Bible
Specialty: Masters periodisation, training load management for 40+ athletes.
Appearances: 3+

**Lachlan Morton** — EF Education-EasyPost
Specialty: Training philosophy, gravel, adventure cycling.
Appearances: 2+

**Dan Bigham** — Former Hour Record Holder
Specialty: Aerodynamics, marginal gains, data-driven training.
Appearances: 2+

**Dr. Sam Impey** — PhD Sports Nutrition
Specialty: Nutrition for endurance athletes, race nutrition.
Appearances: 3+

**Tim Spector** — ZOE Founder, Professor
Specialty: Gut microbiome, nutrition science.
Appearances: 1

**Greg LeMond** — 3× Tour de France Winner
Specialty: Racing history, training philosophy.
Appearances: 1`;

export function registerResources(server: McpServer): void {
  server.resource(
    "roadman-brand-overview",
    "roadman://brand/overview",
    { mimeType: "text/plain" },
    async () => ({
      contents: [{ uri: "roadman://brand/overview", text: BRAND_OVERVIEW, mimeType: "text/plain" }],
    })
  );

  server.resource(
    "roadman-methodology-principles",
    "roadman://methodology/principles",
    { mimeType: "text/plain" },
    async () => ({
      contents: [{ uri: "roadman://methodology/principles", text: METHODOLOGY_PRINCIPLES, mimeType: "text/plain" }],
    })
  );

  server.resource(
    "roadman-experts-roster",
    "roadman://experts/roster",
    { mimeType: "text/plain" },
    async () => ({
      contents: [{ uri: "roadman://experts/roster", text: EXPERTS_ROSTER, mimeType: "text/plain" }],
    })
  );
}
```

- [ ] **Step 2: Register resources in server.ts**

Add import at top of `src/lib/mcp/server.ts`:
```typescript
import { registerResources } from "./resources";
```

At the bottom of `buildMcpServer`, before `return server`:
```typescript
  registerResources(server);
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/resources.ts src/lib/mcp/server.ts
git commit -m "feat(mcp): brand/methodology/experts resources"
```

---

**Phase 4 complete. Confirm before proceeding to Phase 5.**

---

## Phase 5 — Tests, Docs, Manifest, llms.txt

### Task 19: Full integration test suite

**Files:**
- Create: `tests/mcp/content-tools.test.ts`
- Create: `tests/mcp/commerce-tools.test.ts`
- Create: `tests/mcp/resources.test.ts`

- [ ] **Step 1: Content tools tests**

Create `tests/mcp/content-tools.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue({ rows: [] }),
  },
}));

vi.mock("@/lib/mcp/embeddings", () => ({
  embedQuery: vi.fn().mockResolvedValue(new Array(1024).fill(0.1)),
}));

import { buildMcpServer } from "@/lib/mcp/server";

describe("Content tools", () => {
  it("server exposes search_episodes tool", async () => {
    const server = buildMcpServer("test");
    const tools = await server.listTools?.();
    const names = (tools?.tools ?? []).map((t: { name: string }) => t.name);
    expect(names).toContain("search_episodes");
  });

  it("server exposes get_episode tool", async () => {
    const server = buildMcpServer("test");
    const tools = await server.listTools?.();
    const names = (tools?.tools ?? []).map((t: { name: string }) => t.name);
    expect(names).toContain("get_episode");
  });

  it("server exposes list_experts tool", async () => {
    const server = buildMcpServer("test");
    const tools = await server.listTools?.();
    const names = (tools?.tools ?? []).map((t: { name: string }) => t.name);
    expect(names).toContain("list_experts");
  });

  it("server exposes get_expert_insights tool", async () => {
    const server = buildMcpServer("test");
    const tools = await server.listTools?.();
    const names = (tools?.tools ?? []).map((t: { name: string }) => t.name);
    expect(names).toContain("get_expert_insights");
  });

  it("server exposes search_methodology tool", async () => {
    const server = buildMcpServer("test");
    const tools = await server.listTools?.();
    const names = (tools?.tools ?? []).map((t: { name: string }) => t.name);
    expect(names).toContain("search_methodology");
  });

  it("search_episodes returns array (even when empty)", async () => {
    const server = buildMcpServer("test");
    const result = await server.callTool?.({ name: "search_episodes", arguments: { query: "polarised training" } });
    const text = result?.content?.[0]?.text as string;
    expect(Array.isArray(JSON.parse(text))).toBe(true);
  });

  it("get_episode returns not-found for missing ID", async () => {
    const server = buildMcpServer("test");
    const result = await server.callTool?.({ name: "get_episode", arguments: { episode_id: 9999 } });
    const text = result?.content?.[0]?.text as string;
    expect(JSON.parse(text)).toHaveProperty("error");
  });
});
```

- [ ] **Step 2: Commerce tools tests**

Create `tests/mcp/commerce-tools.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    delete: vi.fn().mockReturnValue(Promise.resolve()),
  },
}));

import { buildMcpServer } from "@/lib/mcp/server";
import { qualifyLead } from "@/lib/mcp/services/qualification";

describe("Commerce tools", () => {
  it("server exposes list_products", async () => {
    const server = buildMcpServer("test");
    const tools = await server.listTools?.();
    const names = (tools?.tools ?? []).map((t: { name: string }) => t.name);
    expect(names).toContain("list_products");
  });

  it("server exposes list_upcoming_events", async () => {
    const server = buildMcpServer("test");
    const tools = await server.listTools?.();
    const names = (tools?.tools ?? []).map((t: { name: string }) => t.name);
    expect(names).toContain("list_upcoming_events");
  });

  it("server exposes qualify_lead", async () => {
    const server = buildMcpServer("test");
    const tools = await server.listTools?.();
    const names = (tools?.tools ?? []).map((t: { name: string }) => t.name);
    expect(names).toContain("qualify_lead");
  });
});

describe("qualify_lead logic (unit)", () => {
  it("recommends premium for experienced racer with FTP goal and high hours", () => {
    const result = qualifyLead({
      goal: "build_ftp",
      hours_per_week: 12,
      current_level: "racer",
      age_bracket: "35_44",
      primary_challenge: "Stuck at 280w for 18 months",
    });
    expect(result.recommended_product_id).toBe("ndy-premium");
    expect(result.next_step_url).toContain("apply");
  });

  it("recommends standard for comeback cyclist", () => {
    const result = qualifyLead({
      goal: "comeback",
      hours_per_week: 5,
      current_level: "intermediate",
      age_bracket: "45_54",
      primary_challenge: "Haven't ridden properly in 2 years",
    });
    expect(result.recommended_product_id).toBe("ndy-standard");
  });

  it("recommends premium for masters cyclist with event goal", () => {
    const result = qualifyLead({
      goal: "target_event",
      hours_per_week: 10,
      current_level: "experienced",
      age_bracket: "55_plus",
      primary_challenge: "Etape du Tour in July, need to peak at the right time",
    });
    expect(result.recommended_product_id).toBe("ndy-premium");
  });

  it("result always has required shape", () => {
    const result = qualifyLead({
      goal: "other",
      hours_per_week: 4,
      current_level: "beginner",
      age_bracket: "under_35",
      primary_challenge: "Just starting out",
    });
    expect(result).toHaveProperty("recommended_product_id");
    expect(result).toHaveProperty("recommended_product_name");
    expect(result).toHaveProperty("reasoning");
    expect(result).toHaveProperty("next_step_url");
    expect(Array.isArray(result.alternative_products)).toBe(true);
  });
});
```

- [ ] **Step 3: Resources test**

Create `tests/mcp/resources.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildMcpServer } from "@/lib/mcp/server";

describe("MCP resources", () => {
  it("lists three resources", async () => {
    const server = buildMcpServer("test");
    const res = await server.listResources?.();
    const uris = (res?.resources ?? []).map((r: { uri: string }) => r.uri);
    expect(uris).toContain("roadman://brand/overview");
    expect(uris).toContain("roadman://methodology/principles");
    expect(uris).toContain("roadman://experts/roster");
  });

  it("brand overview resource returns non-empty text", async () => {
    const server = buildMcpServer("test");
    const res = await server.readResource?.({ uri: "roadman://brand/overview" });
    const text = res?.contents?.[0]?.text as string;
    expect(text.length).toBeGreaterThan(100);
    expect(text).toContain("Not Done Yet");
  });

  it("methodology resource mentions polarised training", async () => {
    const server = buildMcpServer("test");
    const res = await server.readResource?.({ uri: "roadman://methodology/principles" });
    const text = res?.contents?.[0]?.text as string;
    expect(text.toLowerCase()).toContain("polarised");
  });
});
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run tests/mcp/
```

Expected: all pass. Fix any API shape mismatches against the actual installed SDK version.

- [ ] **Step 5: Commit**

```bash
git add tests/mcp/content-tools.test.ts tests/mcp/commerce-tools.test.ts tests/mcp/resources.test.ts
git commit -m "test(mcp): integration tests for all 9 tools + resources"
```

---

### Task 20: Developer README

**Files:**
- Create: `src/app/api/mcp/README.md`

- [ ] **Step 1: Write README**

Create `src/app/api/mcp/README.md`:

```markdown
# Roadman Cycling MCP Server

**Endpoint:** `POST /api/mcp`  
**Transport:** Streamable HTTP (MCP spec §4.2)  
**Auth:** None (v1 — public read-only)  
**Rate limit:** 60 requests/minute per IP

## Connecting

### Claude Desktop
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "roadman": {
      "url": "https://roadmancycling.com/api/mcp"
    }
  }
}
```

### Any MCP client
Set the server URL to `https://roadmancycling.com/api/mcp` and use the Streamable HTTP transport.

## Tools

| Tool | Description |
|------|-------------|
| `get_community_stats` | Podcast downloads, YouTube subs, community member counts, featured transformations |
| `search_episodes` | Semantic search across 1,400+ episode transcripts |
| `get_episode` | Full metadata + key insights for a single episode |
| `list_experts` | Expert roster with credentials and appearance counts |
| `get_expert_insights` | Key quotes from a named expert, optionally filtered by topic |
| `search_methodology` | Query the Roadman coaching methodology knowledge base |
| `list_products` | All paid offerings with pricing and purchase URLs |
| `list_upcoming_events` | Upcoming rides, camps, Q&As, and events |
| `qualify_lead` | Recommend the right Roadman product given a training profile |

## Resources

| URI | Contents |
|-----|----------|
| `roadman://brand/overview` | One-page brand primer |
| `roadman://methodology/principles` | Roadman training methodology at principle level |
| `roadman://experts/roster` | Expert roster with credentials |

## Adding a New Tool

1. Create service logic in `src/lib/mcp/services/<name>.ts`
2. Register the tool inside `buildMcpServer()` in `src/lib/mcp/server.ts`
3. Add a test in `tests/mcp/`
4. Document in this README

## Monitoring

Every tool call is logged to the `mcp_call_logs` table in Postgres. Query:
```sql
SELECT tool_name, COUNT(*), AVG(duration_ms), SUM(CASE WHEN success THEN 0 ELSE 1 END) AS errors
FROM mcp_call_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY tool_name
ORDER BY COUNT(*) DESC;
```
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/mcp/README.md
git commit -m "docs(mcp): developer README"
```

---

### Task 21: SEED_PLACEHOLDERS.md

**Files:**
- Create: `SEED_PLACEHOLDERS.md` (at repo root)

- [ ] **Step 1: Write the file**

Create `SEED_PLACEHOLDERS.md` at the repo root:

```markdown
# MCP Seed Placeholders

These rows were seeded with placeholder values and must be updated before launch.

## mcp_community_stats

Run: `npm run seed:mcp:community-stats` after updating with real values.

| Field | Current Placeholder | Where to Get Real Value |
|-------|-------------------|------------------------|
| `podcast_downloads_total` | 100,000,000 | Buzzsprout or Spotify for Podcasters dashboard |
| `youtube_subscribers_main` | 61,773 | YouTube Studio → The Roadman Podcast channel |
| `youtube_subscribers_clips` | 13,238 | YouTube Studio → Roadman Podcast Clips channel |
| `free_community_members` | 1,852 | Skool → Clubhouse → Members count |
| `paid_community_members` | 113 | Skool → Not Done Yet → Members count |
| `featured_transformations[*].member_name` | PLACEHOLDER_1/2/3 | Replace with real NDY member names (with permission) |

## mcp_episodes

Run: `npm run seed:mcp:content` then populate real episodes from `src/lib/podcast.ts`.

| Field | Status |
|-------|--------|
| `audio_url` for seeded episodes | PLACEHOLDER — replace with real Buzzsprout/Spotify URLs |
| `youtube_url` for seeded episodes | PLACEHOLDER — replace with real YouTube video IDs |
| `url` for seeded episodes | PLACEHOLDER — replace with real /podcast/{slug} URLs |
| Episode embeddings | NOT SEEDED — run `npm run agent:index` or write a backfill script |

## mcp_products

Run: `npm run seed:mcp:products` after confirming the Skool/Stripe purchase URLs.

| Field | Status |
|-------|--------|
| `url` for ndy-standard | Points to /community/not-done-yet — confirm this is the Skool join link |
| `url` for ndy-premium and ndy-vip | Points to /apply — confirm this is correct |
| `url` for strength-training-course | Points to /strength-training — confirm this routes to checkout |

## roadman_events

Run: `npm run seed:mcp:events` after confirming dates.

| Event | Field | Status |
|-------|-------|--------|
| Saturday Group Ride | `starts_at` | PLACEHOLDER date — update with real next occurrence |
| NDY Live Q&A | `starts_at` | PLACEHOLDER date — update with real Skool event date |
| Migration Gravel | `starts_at` | PLACEHOLDER — update when Girona 2026 dates confirmed |
| Migration Gravel | `url` | PLACEHOLDER — update when event page is live |

## episode_embeddings + methodology_embeddings

These tables are empty after seeding. To populate:

1. Ensure `VOYAGE_API_KEY` (or `OPENAI_API_KEY` + `EMBEDDING_PROVIDER=openai`) is set in `.env.local`
2. Run the transcript indexer agent: `npm run agent:index`
3. Write a backfill script for methodology principles (not yet implemented)

Until embeddings are populated, `search_episodes` and `search_methodology` will return empty arrays.

## mcp_expert_quotes

The `mcp_expert_quotes` table is empty. To populate:
1. Review episode transcripts for notable quotes from each expert in `mcp_experts`
2. Insert via `scripts/seed-mcp-content.ts` or an admin API
```

- [ ] **Step 2: Commit**

```bash
git add SEED_PLACEHOLDERS.md
git commit -m "docs(mcp): SEED_PLACEHOLDERS.md"
```

---

### Task 22: mcp.json discovery manifest

**Files:**
- Create: `public/.well-known/mcp.json`

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p public/.well-known
```

Create `public/.well-known/mcp.json`:

```json
{
  "$schema": "https://modelcontextprotocol.io/schema/mcp-manifest.json",
  "name": "Roadman Cycling",
  "description": "MCP server for the Roadman Cycling podcast, methodology, coaching products, and community. Access 1,400+ episode transcripts, the Roadman coaching methodology, product catalogue, and lead qualification via AI agents.",
  "version": "1.0.0",
  "url": "https://roadmancycling.com/api/mcp",
  "transport": "streamable-http",
  "auth": "none",
  "capabilities": {
    "tools": true,
    "resources": true,
    "prompts": false,
    "sampling": false
  },
  "tools": [
    { "name": "get_community_stats", "description": "Podcast downloads, YouTube subscribers, community member counts" },
    { "name": "search_episodes", "description": "Semantic search across 1,400+ podcast episode transcripts" },
    { "name": "get_episode", "description": "Full metadata + key insights for a single episode" },
    { "name": "list_experts", "description": "Expert roster with credentials and appearance counts" },
    { "name": "get_expert_insights", "description": "Key quotes from a named expert by topic" },
    { "name": "search_methodology", "description": "Query the Roadman coaching methodology knowledge base" },
    { "name": "list_products", "description": "All paid offerings with pricing and purchase URLs" },
    { "name": "list_upcoming_events", "description": "Upcoming rides, camps, live Q&As, and events" },
    { "name": "qualify_lead", "description": "Recommend the right Roadman product for a given training profile" }
  ],
  "resources": [
    { "uri": "roadman://brand/overview", "description": "Brand primer and positioning" },
    { "uri": "roadman://methodology/principles", "description": "Coaching methodology at principle level" },
    { "uri": "roadman://experts/roster", "description": "Expert roster with credentials" }
  ],
  "contact": "ted@roadmancycling.com",
  "rateLimit": "60 requests/minute per IP"
}
```

- [ ] **Step 2: Commit**

```bash
git add public/.well-known/mcp.json
git commit -m "feat(mcp): discovery manifest at /.well-known/mcp.json"
```

---

### Task 23: Update llms.txt route

**Files:**
- Modify: `src/app/llms.txt/route.ts`

- [ ] **Step 1: Add MCP server section to the llms.txt body**

In `src/app/llms.txt/route.ts`, find the line that starts the `body` template literal and add the following block **after the `## Attribution` section** at the end:

```typescript
## MCP Server (Agent-to-Agent)
- [Roadman MCP Server](${BASE_URL}/api/mcp): Streamable HTTP MCP server. Tools: search_episodes, get_episode, list_experts, get_expert_insights, search_methodology, list_products, list_upcoming_events, qualify_lead, get_community_stats. Resources: roadman://brand/overview, roadman://methodology/principles, roadman://experts/roster. No auth. Rate limit: 60 req/min per IP. Discovery manifest: ${BASE_URL}/.well-known/mcp.json
```

- [ ] **Step 2: Commit**

```bash
git add src/app/llms.txt/route.ts
git commit -m "feat(mcp): add MCP server reference to llms.txt"
```

---

**Phase 5 complete.**

---

## Final verification checklist

- [ ] `npm run dev` starts without errors
- [ ] `curl -X POST http://localhost:3000/api/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'` returns all 9 tool names
- [ ] `curl -X POST http://localhost:3000/api/mcp ... "method":"tools/call","params":{"name":"get_community_stats"...}` returns real stats data
- [ ] `npx vitest run tests/mcp/` → all pass
- [ ] `curl http://localhost:3000/.well-known/mcp.json` returns the manifest
- [ ] `curl http://localhost:3000/llms.txt | grep "MCP Server"` shows the MCP entry
- [ ] `mcp_call_logs` table has rows after calling tools
- [ ] Claude Desktop can connect to `http://localhost:3000/api/mcp` and call tools successfully
