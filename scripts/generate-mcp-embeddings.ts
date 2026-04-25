/**
 * Generates pgvector embeddings for MCP semantic search.
 *
 * Populates:
 *   mcp_episode_embeddings      — one row per chunk per episode
 *   mcp_methodology_embeddings  — one row per methodology principle
 *
 * Source:
 *   mcp_episodes (title, summary, key_insights, transcript_text)
 *   mcp_methodology_principles (principle, explanation, topic_tags)
 *
 * Provider (auto-selected, controlled by env):
 *   VOYAGE_API_KEY set           → Voyage voyage-3-large (1024 dims)
 *   else OPENAI_API_KEY set      → OpenAI text-embedding-3-large (1024 dims)
 *   EMBEDDING_PROVIDER=openai    → force OpenAI (honoured by src/lib/mcp/embeddings.ts too)
 *
 * Resumable: skips episodes that already have embeddings (unless --force).
 * Rate-limited: 200 ms between batches, exponential backoff on 429.
 *
 * Flags:
 *   --only=episodes|methodology   restrict to one table
 *   --limit=N                     cap number of source rows processed
 *   --batch-size=N                embeddings per API call (default 16)
 *   --chunk-size=N                target chars per transcript chunk (default 1800)
 *   --chunk-overlap=N             char overlap between chunks (default 200)
 *   --force                       re-embed rows that already have embeddings
 *   --dry-run                     plan only, no API calls, no writes
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
  mcpEpisodes,
  mcpEpisodeEmbeddings,
  mcpMethodologyPrinciples,
  mcpMethodologyEmbeddings,
} from "../src/lib/db/schema";

// ─── CLI args ───────────────────────────────────────────────

interface Args {
  only: "episodes" | "methodology" | "both";
  limit: number | null;
  batchSize: number;
  chunkSize: number;
  chunkOverlap: number;
  force: boolean;
  dryRun: boolean;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const get = (name: string): string | undefined => {
    const hit = argv.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.slice(name.length + 3) : undefined;
  };
  const has = (name: string): boolean => argv.includes(`--${name}`);

  const only = (get("only") as "episodes" | "methodology" | "both" | undefined) ?? "both";
  if (!["episodes", "methodology", "both"].includes(only)) {
    throw new Error(`--only must be episodes|methodology|both, got: ${only}`);
  }

  return {
    only,
    limit: get("limit") ? parseInt(get("limit")!, 10) : null,
    batchSize: get("batch-size") ? parseInt(get("batch-size")!, 10) : 16,
    chunkSize: get("chunk-size") ? parseInt(get("chunk-size")!, 10) : 1800,
    chunkOverlap: get("chunk-overlap") ? parseInt(get("chunk-overlap")!, 10) : 200,
    force: has("force"),
    dryRun: has("dry-run"),
  };
}

// ─── Provider selection + batch embedding ───────────────────

type Provider = "voyage" | "openai";

function chooseProvider(): Provider {
  if (process.env.EMBEDDING_PROVIDER === "openai") return "openai";
  if (process.env.EMBEDDING_PROVIDER === "voyage") return "voyage";
  if (process.env.VOYAGE_API_KEY) return "voyage";
  if (process.env.OPENAI_API_KEY) return "openai";
  throw new Error(
    "No embedding provider configured. Set VOYAGE_API_KEY or OPENAI_API_KEY."
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function embedBatchVoyage(inputs: string[]): Promise<number[][]> {
  let attempt = 0;
  while (true) {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({
        input: inputs,
        model: "voyage-3-large",
        input_type: "document",
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        data: { embedding: number[]; index: number }[];
      };
      return data.data
        .sort((a, b) => a.index - b.index)
        .map((d) => d.embedding);
    }
    if (res.status === 429 && attempt < 6) {
      const wait = 2_000 * Math.pow(2, attempt);
      console.warn(`  ⚠︎ Voyage 429 — backing off ${wait}ms (attempt ${attempt + 1})`);
      await sleep(wait);
      attempt++;
      continue;
    }
    throw new Error(`Voyage API error ${res.status}: ${await res.text()}`);
  }
}

async function embedBatchOpenAI(inputs: string[]): Promise<number[][]> {
  let attempt = 0;
  while (true) {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: inputs,
        model: "text-embedding-3-large",
        dimensions: 1024,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        data: { embedding: number[]; index: number }[];
      };
      return data.data
        .sort((a, b) => a.index - b.index)
        .map((d) => d.embedding);
    }
    if (res.status === 429 && attempt < 6) {
      const wait = 2_000 * Math.pow(2, attempt);
      console.warn(`  ⚠︎ OpenAI 429 — backing off ${wait}ms (attempt ${attempt + 1})`);
      await sleep(wait);
      attempt++;
      continue;
    }
    throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
  }
}

async function embedBatch(
  inputs: string[],
  provider: Provider
): Promise<number[][]> {
  if (provider === "voyage") return embedBatchVoyage(inputs);
  return embedBatchOpenAI(inputs);
}

// ─── Chunking ───────────────────────────────────────────────

/**
 * Split text into overlapping character windows. We chunk by character
 * rather than token because both Voyage and OpenAI accept inputs well
 * beyond any single chunk size we'd want here, and the embedding
 * semantics at 1800-char windows are excellent for retrieval.
 */
function chunkText(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= chunkSize) return [clean];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    // Try to break at a sentence boundary within the last 200 chars.
    let actualEnd = end;
    if (end < clean.length) {
      const tail = clean.slice(end - 200, end);
      const lastStop = tail.lastIndexOf(". ");
      if (lastStop > 0) actualEnd = end - 200 + lastStop + 1;
    }
    chunks.push(clean.slice(start, actualEnd).trim());
    if (actualEnd >= clean.length) break;
    start = actualEnd - overlap;
    if (start < 0) start = 0;
  }
  return chunks;
}

/**
 * Build the chunk set for an episode. Chunk 0 is always a structured
 * header block (title + guest + summary + key insights) so that
 * search_episodes can return a meaningful excerpt even when the
 * transcript is missing. Remaining chunks are a sliding window over
 * the transcript.
 */
function episodeChunks(
  ep: {
    title: string;
    guestName: string | null;
    summary: string | null;
    keyInsights: unknown;
    transcriptText: string | null;
    topicTags: string[] | null;
  },
  chunkSize: number,
  overlap: number
): string[] {
  const insights = Array.isArray(ep.keyInsights)
    ? (ep.keyInsights as string[])
    : [];
  const headerParts = [
    `Title: ${ep.title}`,
    ep.guestName ? `Guest: ${ep.guestName}` : null,
    ep.topicTags?.length ? `Topics: ${ep.topicTags.join(", ")}` : null,
    ep.summary ? `Summary: ${ep.summary}` : null,
    insights.length ? `Key insights: ${insights.join(" | ")}` : null,
  ].filter(Boolean);
  const header = headerParts.join("\n");

  const chunks = header ? [header] : [];
  if (ep.transcriptText && ep.transcriptText.trim()) {
    chunks.push(...chunkText(ep.transcriptText, chunkSize, overlap));
  }
  return chunks;
}

function methodologyText(p: {
  principle: string;
  explanation: string;
  topicTags: string[] | null;
}): string {
  const tagLine = p.topicTags?.length ? `\nTopics: ${p.topicTags.join(", ")}` : "";
  return `Principle: ${p.principle}\n\n${p.explanation}${tagLine}`;
}

// ─── Episode embedding pipeline ─────────────────────────────

interface EpisodeTask {
  episodeId: number;
  chunkIndex: number;
  text: string;
}

async function loadEpisodes(args: Args) {
  const rows = await db
    .select({
      id: mcpEpisodes.id,
      slug: mcpEpisodes.slug,
      title: mcpEpisodes.title,
      guestName: mcpEpisodes.guestName,
      summary: mcpEpisodes.summary,
      keyInsights: mcpEpisodes.keyInsights,
      transcriptText: mcpEpisodes.transcriptText,
      topicTags: mcpEpisodes.topicTags,
    })
    .from(mcpEpisodes);

  if (args.force) return args.limit ? rows.slice(0, args.limit) : rows;

  // Skip episodes that already have at least one embedding row.
  const existing = await db
    .select({ episodeId: mcpEpisodeEmbeddings.episodeId })
    .from(mcpEpisodeEmbeddings);
  const done = new Set(existing.map((r) => r.episodeId));
  const pending = rows.filter((r) => !done.has(r.id));
  return args.limit ? pending.slice(0, args.limit) : pending;
}

async function embedEpisodes(args: Args, provider: Provider) {
  console.log(`\n→ Episodes (provider=${provider})`);
  const rows = await loadEpisodes(args);
  if (rows.length === 0) {
    console.log("  nothing to do");
    return;
  }

  // Build the full task list up-front so we can report progress
  // meaningfully and batch across episode boundaries.
  const tasks: EpisodeTask[] = [];
  for (const ep of rows) {
    const chunks = episodeChunks(
      {
        title: ep.title,
        guestName: ep.guestName,
        summary: ep.summary,
        keyInsights: ep.keyInsights,
        transcriptText: ep.transcriptText,
        topicTags: ep.topicTags,
      },
      args.chunkSize,
      args.chunkOverlap
    );
    chunks.forEach((text, idx) => {
      tasks.push({ episodeId: ep.id, chunkIndex: idx, text });
    });
  }

  console.log(
    `  ${rows.length} episodes → ${tasks.length} chunks, batch size ${args.batchSize}`
  );
  if (args.dryRun) {
    console.log("  (dry-run) skipping API calls + DB writes");
    return;
  }

  // When we're re-embedding an existing episode we wipe its chunks
  // first so chunk_index stays contiguous.
  if (args.force) {
    const ids = Array.from(new Set(tasks.map((t) => t.episodeId)));
    if (ids.length) {
      await db.execute(
        sql`DELETE FROM mcp_episode_embeddings WHERE episode_id = ANY(${ids}::integer[])`
      );
    }
  }

  let done = 0;
  for (let i = 0; i < tasks.length; i += args.batchSize) {
    const batch = tasks.slice(i, i + args.batchSize);
    const embeddings = await embedBatch(
      batch.map((t) => t.text),
      provider
    );
    await db.insert(mcpEpisodeEmbeddings).values(
      batch.map((t, idx) => ({
        episodeId: t.episodeId,
        chunkIndex: t.chunkIndex,
        chunkText: t.text,
        embedding: embeddings[idx],
      }))
    );
    done += batch.length;
    process.stdout.write(`  ${done}/${tasks.length}\r`);
    await sleep(200);
  }
  console.log(`\n  ✓ ${tasks.length} episode chunks embedded`);
}

// ─── Methodology embedding pipeline ─────────────────────────

async function loadMethodology(args: Args) {
  const rows = await db
    .select({
      id: mcpMethodologyPrinciples.id,
      principle: mcpMethodologyPrinciples.principle,
      explanation: mcpMethodologyPrinciples.explanation,
      topicTags: mcpMethodologyPrinciples.topicTags,
    })
    .from(mcpMethodologyPrinciples);

  if (args.force) return args.limit ? rows.slice(0, args.limit) : rows;

  const existing = await db
    .select({ principleId: mcpMethodologyEmbeddings.principleId })
    .from(mcpMethodologyEmbeddings);
  const done = new Set(existing.map((r) => r.principleId));
  const pending = rows.filter((r) => !done.has(r.id));
  return args.limit ? pending.slice(0, args.limit) : pending;
}

async function embedMethodology(args: Args, provider: Provider) {
  console.log(`\n→ Methodology (provider=${provider})`);
  const rows = await loadMethodology(args);
  if (rows.length === 0) {
    console.log("  nothing to do");
    return;
  }
  console.log(`  ${rows.length} principles, batch size ${args.batchSize}`);
  if (args.dryRun) {
    console.log("  (dry-run) skipping API calls + DB writes");
    return;
  }

  if (args.force) {
    const ids = rows.map((r) => r.id);
    await db.execute(
      sql`DELETE FROM mcp_methodology_embeddings WHERE principle_id = ANY(${ids}::integer[])`
    );
  }

  let done = 0;
  for (let i = 0; i < rows.length; i += args.batchSize) {
    const batch = rows.slice(i, i + args.batchSize);
    const embeddings = await embedBatch(
      batch.map((r) => methodologyText(r)),
      provider
    );
    await db.insert(mcpMethodologyEmbeddings).values(
      batch.map((r, idx) => ({
        principleId: r.id,
        embedding: embeddings[idx],
      }))
    );
    done += batch.length;
    process.stdout.write(`  ${done}/${rows.length}\r`);
    await sleep(200);
  }
  console.log(`\n  ✓ ${rows.length} methodology principles embedded`);
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const provider = chooseProvider();
  console.log(`Generating MCP embeddings · provider=${provider}`);
  console.log(
    `  only=${args.only} force=${args.force} dryRun=${args.dryRun} limit=${args.limit ?? "-"}`
  );

  if (args.only === "episodes" || args.only === "both") {
    await embedEpisodes(args, provider);
  }
  if (args.only === "methodology" || args.only === "both") {
    await embedMethodology(args, provider);
  }

  console.log("\n✓ done");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
