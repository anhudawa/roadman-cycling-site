/**
 * Ask Roadman orchestrator.
 *
 * Pipeline, in order:
 *   1. persist the user message
 *   2. safety pre-filter (regex) — if blocked, emit fixed template + CTA, done
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
 * event — the client shows a friendly message and the operation is logged.
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

export async function streamAnswer(
  input: OrchestratorInput,
  sse: SseController,
): Promise<void> {
  const startedAt = Date.now();

  // User-message persistence is best-effort: if the DB is unreachable
  // (e.g. ask_messages table missing in prod), log it and continue so
  // the rider still gets an answer.
  if (!input.sessionEphemeral) {
    try {
      await appendMessage({
        sessionId: input.sessionId,
        role: "user",
        content: input.query,
      });
    } catch (err) {
      console.error("[ask/orchestrator] user message persist failed (continuing):", err);
    }
  }

  // 2 — safety pre-filter
  const safety = detectSafety(input.query);
  if (safety.block) {
    await emitSafeBlock({
      sse,
      sessionId: input.sessionId,
      query: input.query,
      decision: safety,
      startedAt,
      ephemeral: Boolean(input.sessionEphemeral),
    });
    return;
  }

  // 3-4 — intent + profile + seed in parallel
  const [classification, profile, seed] = await Promise.all([
    classifyIntent(input.query),
    input.riderProfileId != null ? loadProfileById(input.riderProfileId) : Promise.resolve(null),
    input.seed ? loadSeedContext(input.seed.tool, input.seed.slug).catch(() => null) : Promise.resolve(null),
  ]);

  // 5 — retrieval. If the rider arrived with a seed context, broaden the
  //     query with the seed headline so retrieval leans toward material
  //     that explains their saved result.
  const retrievalQuery = seed ? `${input.query} ${seed.headline}` : input.query;
  let retrieval: Awaited<ReturnType<typeof retrieve>>;
  try {
    retrieval = await retrieve({ query: retrievalQuery, intent: classification.intent });
  } catch {
    retrieval = { chunks: [], totalCandidates: 0 };
  }

  // 6 — CTA
  const cta = pickCta({
    intent: classification.intent,
    hasProfile: profile != null,
    coachingInterest: profile?.coachingInterest as "none" | "curious" | "interested" | "ready" | null | undefined,
    retrieved: retrieval.chunks,
  });

  // 7 — meta event so the client can paint a skeleton
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

  // 8 — emit citations + cta upfront so the UI can show them while the answer streams
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

  // 9 — stream the answer. The Anthropic call is the only step that
  // should surface a user-visible error; persistence (10) is best-effort.
  let full: Awaited<ReturnType<typeof streamFromAnthropic>>;
  try {
    full = await streamFromAnthropic({
      query: input.query,
      intent: classification.intent,
      deep: classification.deep,
      profile,
      cta,
      chunks: retrieval.chunks,
      seed,
      sse,
    });
  } catch (err) {
    console.error("[ask/orchestrator] answer generation failed:", err);
    sse.enqueue({
      type: "error",
      data: { message: "Something went sideways generating the answer. Try again in a moment." },
    });
    sse.close();
    return;
  }

  // 10 — post-filter + persist (best-effort).
  const { flaggedInvented } = postFilterCitations(
    full.text,
    retrieval.chunks.map((c) => c.title),
  );
  const flagged = flaggedInvented.length > 0;

  let assistantId: string | null = null;
  if (!input.sessionEphemeral) {
    try {
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
      assistantId = assistant.id;

      if (retrieval.chunks.length > 0) {
        try {
          await appendRetrievals({
            messageId: assistant.id,
            items: retrieval.chunks.map((c) => chunkToRetrievalItem(c, true)),
          });
        } catch (err) {
          console.error("[ask/orchestrator] retrieval persist failed (non-fatal):", err);
        }
      }
    } catch (err) {
      console.error("[ask/orchestrator] assistant message persist failed (non-fatal):", err);
    }
  }

  sse.enqueue({
    type: "done",
    data: { messageId: assistantId, flaggedForReview: flagged },
  });
  sse.close();
}

async function emitSafeBlock(args: {
  sse: SseController;
  sessionId: string;
  query: string;
  decision: ReturnType<typeof detectSafety>;
  startedAt: number;
  ephemeral: boolean;
}): Promise<void> {
  const { sse, sessionId, decision, startedAt, ephemeral } = args;
  const safe = buildSafeResponse(decision);

  sse.enqueue({
    type: "meta",
    data: { intent: `safety_${decision.templateKey ?? "generic"}`, safetyFlags: decision.flags, chunksRetrieved: 0 },
  });
  sse.enqueue({ type: "safety", data: { flags: decision.flags, templateKey: decision.templateKey } });
  sse.enqueue({ type: "cta", data: safe.cta });

  // emit the text as a single delta so the UI renders the same way as a model response
  sse.enqueue({ type: "delta", data: safe.text });

  let messageId: string | null = null;
  if (!ephemeral) {
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
      messageId = assistant.id;
    } catch (err) {
      console.error("[ask/orchestrator] safety persist failed (non-fatal):", err);
    }
  }
  sse.enqueue({ type: "done", data: { messageId, flaggedForReview: true } });
  sse.close();
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

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "[ask/orchestrator] ANTHROPIC_API_KEY missing or empty — serving fallback. " +
        "Set it in Vercel → Settings → Environment Variables (Preview + Production) and redeploy.",
    );
    const fallback = buildFallbackNoKey(intent, chunks);
    sse.enqueue({ type: "delta", data: fallback });
    return { text: fallback };
  }

  const client = new Anthropic({ apiKey });
  const system = buildSystemPrompt({ profile, cta, chunks, seed });
  const model = deep ? MODEL_DEEP : MODEL_FAST;

  const stream = client.messages.stream({
    model,
    max_tokens: MAX_TOKENS,
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
    stream.on("error", (err) => {
      console.error("[ask/orchestrator] Anthropic stream error:", err);
      reject(err);
    });
  });

  return { text: full, inputTokens, outputTokens };
}

function buildFallbackNoKey(_intent: Intent, chunks: RetrievedChunk[]): string {
  const top = chunks[0];
  const second = chunks[1];
  const intro =
    "Ask Roadman is catching its breath right now — the live answer engine is offline. " +
    "Here's the closest material from the podcast and notes that should help while it's down:";
  const lines: string[] = [intro];
  if (top) {
    lines.push("");
    lines.push(`• ${top.title}${top.url ? ` — ${top.url}` : ""}`);
  }
  if (second) {
    lines.push(`• ${second.title}${second.url ? ` — ${second.url}` : ""}`);
  }
  if (!top) {
    lines.push("");
    lines.push("Try one of the starter prompts below, or come back in a minute.");
  }
  return lines.join("\n");
}
