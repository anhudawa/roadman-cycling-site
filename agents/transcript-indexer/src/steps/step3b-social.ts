import { callLLM, loadPrompt, parseJsonResponse } from "../lib/anthropic.js";
import { AgentLogger } from "../lib/logger.js";
import { MODELS } from "../config.js";
import type {
  EpisodeInput,
  EpisodeMetadata,
  ClusterAssignment,
  SocialContent,
} from "../types.js";

export async function generateSocialContent(
  episode: EpisodeInput,
  metadata: EpisodeMetadata,
  cluster: ClusterAssignment,
  promptsDir: string,
  logger: AgentLogger
): Promise<SocialContent> {
  const systemPrompt = loadPrompt(promptsDir, "step3b-social-generation.md");

  // Truncate transcript
  const words = episode.transcript.split(/\s+/);
  const truncated =
    words.length > 8000 ? words.slice(0, 8000).join(" ") + "..." : episode.transcript;

  const userMessage = `## Episode
Title: ${episode.title}
Episode URL: /podcast/${episode.slug}
Publish Date: ${episode.publishDate}

## Metadata
Guest: ${metadata.guest_name ?? "None (solo/co-hosted)"}
Guest Credentials: ${metadata.guest_credentials ?? "N/A"}
Key Claims: ${metadata.key_claims.join("; ")}
Named Experts Referenced: ${metadata.named_experts.join(", ") || "None"}
Specific Numbers/Protocols: ${metadata.specific_numbers.join("; ") || "None"}
Episode Type: ${metadata.episode_type}

## Cluster Assignment
Primary: ${cluster.primary_cluster}
Primary Persona: ${cluster.primary_persona}

## Transcript (first ~8000 words)
${truncated}`;

  const result = await callLLM({
    model: MODELS.generation,
    system: systemPrompt,
    userMessage,
    maxTokens: 8000,
  });

  const content = parseJsonResponse<SocialContent>(result.text);

  logger.logStep(episode.slug, episode.episodeNumber, "step3b-social", MODELS.generation, {
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  }, result.runtimeMs, true);

  return content;
}
