/**
 * Ask Roadman orchestrator.
 *
 * Pipeline, in order:
 *   1. persist the user message
 *   2. safety pre-filter (regex) $€” if blocked, emit fixed template + CTA, done
 *   3. intent classification (Haiku)
 *   4. load rider profile (if session has one)
 *   5. retrieval fan-out (episodes + methodology + content chunks)
 *   6. CTA selection
 *   7. emit meta (intent/chunks count)
 *   8. emit citations + cta
 *   9. stream answer from Anthropic (Opus or Haiku depending on intent)
 *  10. post-filter citations, persist assistant message + retrievals
 *  11. emit done
 *
 * Any step that fails catastrophically falls through to an `error` SSE
 * event $€” the client shows a friendly message and the operation is logged.
 */

import Anthropic from "@anthropic-ai/sdk";
import { detectSafety, buildSafeResponse, postFilterCitations } from "./safety";
import { classifyIntent } from "./intent";
import { retrieve } from "./retrieval";
import { pickCta } from "./cta";
import { buildSystemPrompt } from "./system-prompt";
import { loadSeedContext, type SeedContext } from "./seed";
import {
  appendMessage,
  appendRetrievals,
  chunkToRetrievalItem,
} from "./store";
import { loadById as loadProfileById } from "@/lib/rider-profile/store";
import type { SseController } from "./stream";
import type {
  CtaDescriptor,
  Intent,
  OrchestratorInput,
  RetrievedChunk,
} from "./types";
import type { RiderProfile } from "@/lib/rider-profile/types";

const MODEL_DEEP = "claude-opus-4-7";
const MODEL_FAST = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1200;
const TEMPERATURE = 0.6;

export async function streamAnswer(
  input: OrchestratorInput,
  sse: SseController,
): Promise<void> {
  const startedAt = Date.now();

  try {
    await appendMessage({
      sessionId: input.sessionId,
      role: "user",
      content: input.query,
    });
  } catch {
    sse.enqueue({ type: "error", data: { message: "Couldn't persist the question $€” try again." } });
    sse.close();
    return;
  }

  // 2 $€” safety pre-filter
  const safety = detectSafety(input.query);
  if (safety.block) {
    await emitSafeBlock({
      sse,
      sessionId: input.sessionId,
      query: input.query,
      decision: safety,
      startedAt,
    });
    return;
  }

  // 3-4 $€” intent + profile + seed in parallel
  const [classification, profile, seed] = await Promise.all([
    classifyIntent(input.query),
    input.riderProfileId != null ? loadProfileById(input.riderProfileId) : Promise.resolve(null),
    input.seed ? loadSeedContext(input.seed.tool, input.seed.slug).catch(() => null) : Promise.resolve(null),
  ]);

  // 5 $€” retrieval. If the rider arrived with a seed context, broaden the
  //     query with the seed headline so retrieval leans toward material
  //     that explains their saved result.
  const retrievalQuery = seed ? `${input.query} ${seed.headline}` : input.query;
  let retrieval: Awaited<ReturnType<typeof retrieve>>;
  try {
    retrieval = await retrieve({ query: retrievalQuery, intent: classification.intent });
  } catch {
    retrieval = { chunks: [], totalCandidates: 0 };
  }

  // 6 $€” CTA
  const cta = pickCta({
    intent: classification.intent,
    hasProfile: profile != null,
    coachingInterest: profile?.coachingInterest as "none" | "curious" | "interested" | "ready" | null | undefined,
    retrieved: retrieval.chunks,
  });

  // 7 $€” meta event so the client can paint a skeleton
  sse.enqueue({
    type: "meta",
    data: {
      intent: classification.intent,
      confidence: classification.confidence,
      chunksRetrieved: retrieval.chunks.length,
      model: classification.deep ? MODEL_DEEP : MODEL_FAST,
      seed: seed
        ? { kind: seed.kind, slug: seed.slug, headline: seed.headline }
        : null,
    },
  });

  // 8 $€” emit citations + cta upfront so the UI can show them while the answer streams
  if (retrieval.chunks.length > 0) {
    sse.enqueue({
      type: "citation",
      data: retrieval.chunks.map((c) => ({
        type: c.sourceType,
        source_id: c.sourceId,
        title: c.title,
        url: c.url,
        excerpt: c.excerpt.slice(0, 280),
      })),
    });
  }
  if (cta.key !== "none") {
    sse.enqueue({ type: "cta", data: cta });
  }

  // 9 $€” stream the answer
  try {
    const full = await streamFromAnthropic({
      query: input.query,
      intent: classification.intent,
      deep: classification.deep,
      profile,
      cta,
      chunks: retrieval.chunks,
      seed,
      sse,
    });

    // 10 $€” post-filter + persist
    const { flaggedInvented } = postFilterCitations(
      full.text,
      retrieval.chunks.map((c) => c.title),
    );

    const flagged = flaggedInvented.length > 0;

    const assistant = await appendMessage({
      sessionId: input.sessionId,
      role: "assistant",
      content: full.text,
      citations: retrieval.chunks.map((c) => ({
        type: c.sourceType,
        source_id: c.sourceId,
        title: c.title,
        url: c.url,
        excerpt: c.excerpt.slice(0, 280),
      })),
      ctaRecommended: cta.key,
      safetyFlags: flagged ? ["invented_citation"] : [],
      confidence: classification.confidence,
      model: classification.deep ? MODEL_DEEP : MODEL_FAST,
      inputTokens: full.inputTokens ?? null,
      outputTokens: full.outputTokens ?? null,
      latencyMs: Date.now() - startedAt,
      flaggedForReview: flagged,
    });

    if (retrieval.chunks.length > 0) {
      await appendRetrievals({
        messageId: assistant.id,
        items: retrieval.chunks.map((c) => chunkToRetrievalItem(c, true)),
      });
    }

    sse.enqueue({ type: "done", data: { messageId: assistant.id, flaggedForReview: flagged } });
  } catch {
    sse.enqueue({
      type: "error",
      data: { message: "Something went sideways generating the answer. Try again in a moment." },
    });
  } finally {
    sse.close();
  }
}

async function emitSafeBlock(args: {
  sse: SseController;
  sessionId: string;
  query: string;
  decision: ReturnType<typeof detectSafety>;
  startedAt: number;
}): Promise<void> {
  const { sse, sessionId, decision, startedAt } = args;
  const safe = buildSafeResponse(decision);

  sse.enqueue({
    type: "meta",
    data: { intent: `safety_${decision.templateKey ?? "generic"}`, safetyFlags: decision.flags, chunksRetrieved: 0 },
  });
  sse.enqueue({ type: "safety", data: { flags: decision.flags, templateKey: decision.templateKey } });
  sse.enqueue({ type: "cta", data: safe.cta });

  // emit the text as a single delta so the UI renders the same way as a model response
  sse.enqueue({ type: "delta", data: safe.text });

  try {
    const assistant = await appendMessage({
      sessionId,
      role: "assistant",
      content: safe.text,
      citations: [],
      ctaRecommended: safe.cta.key,
      safetyFlags: decision.flags,
      confidence: "high",
      model: "safety_template",
      latencyMs: Date.now() - startedAt,
      flaggedForReview: true,
    });
    sse.enqueue({ type: "done", data: { messageId: assistant.id, flaggedForReview: true } });
  } catch {
    sse.enqueue({ type: "done", data: { flaggedForReview: true } });
  } finally {
    sse.close();
  }
}

interface StreamArgs {
  query: string;
  intent: Intent;
  deep: boolean;
  profile: RiderProfile | null;
  cta: CtaDescriptor;
  chunks: RetrievedChunk[];
  seed: SeedContext | null;
  sse: SseController;
}

async function streamFromAnthropic(args: StreamArgs): Promise<{
  text: string;
  inputTokens?: number;
  outputTokens?: number;
}> {
  const { query, intent, deep, profile, cta, chunks, seed, sse } = args;

  if (!process.env.ANTHROPIC_API_KEY) {
    const fallback = buildFallbackNoKey(intent, chunks);
    sse.enqueue({ type: "delta", data: fallback });
    return { text: fallback };
  }

  const client = new Anthropic();
  const system = buildSystemPrompt({ profile, cta, chunks, seed });
  const model = deep ? MODEL_DEEP : MODEL_FAST;

  const stream = client.messages.stream({
    model,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    system,
    messages: [{ role: "user", content: query }],
  });

  let full = "";
  let inputTokens: number | undefined;
  let outputTokens: number | undefined;

  await new Promise<void>((resolve, reject) => {
    stream.on("text", (t: string) => {
      full += t;
      sse.enqueue({ type: "delta", data: t });
    });
    stream.on("message", (msg) => {
      inputTokens = msg.usage?.input_tokens;
      outputTokens = msg.usage?.output_tokens;
    });
    stream.on("end", () => resolve());
    stream.on("error", (err) => reject(err));
  });

  return { text: full, inputTokens, outputTokens };
}

function buildFallbackNoKey(intent: Intent, chunks: RetrievedChunk[]): string {
  const topTitle = chunks[0]?.title;
  const topUrl = chunks[0]?.url;
  const linkHint = topTitle
    ? `\n\nWhile Ask Roadman is offline, the closest Roadman material is "${topTitle}"${topUrl ? ` $€” ${topUrl}` : ""}.`
    : "";
  return `Ask Roadman is temporarily unavailable (the AI backend isn't configured for this environment). Intent detected: ${intent}.${linkHint}`;
}
