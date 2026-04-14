import { callLLM, loadPrompt, parseJsonResponse } from "../lib/anthropic.js";
import { AgentLogger } from "../lib/logger.js";
import { MODELS } from "../config.js";
import type { EpisodeInput, EpisodeMetadata } from "../types.js";

export async function extractMetadata(
  episode: EpisodeInput,
  promptsDir: string,
  logger: AgentLogger
): Promise<EpisodeMetadata> {
  const systemPrompt = loadPrompt(promptsDir, "step1-metadata-extraction.md");

  // Truncate transcript for Haiku (keep first ~8000 words)
  const words = episode.transcript.split(/\s+/);
  const truncated =
    words.length > 8000 ? words.slice(0, 8000).join(" ") + "..." : episode.transcript;

  const userMessage = `## Episode Details
Title: ${episode.title}
Publish Date: ${episode.publishDate}
Duration: ${episode.duration ?? "unknown"}

## Transcript
${truncated}`;

  const result = await callLLM({
    model: MODELS.metadata,
    system: systemPrompt,
    userMessage,
  });

  const metadata = parseJsonResponse<EpisodeMetadata>(result.text);

  logger.logStep(episode.slug, episode.episodeNumber, "step1-metadata", MODELS.metadata, {
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  }, result.runtimeMs, true);

  return metadata;
}
