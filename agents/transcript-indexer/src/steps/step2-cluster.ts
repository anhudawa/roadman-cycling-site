import fs from "fs";
import { callLLM, loadPrompt, parseJsonResponse } from "../lib/anthropic.js";
import { AgentLogger } from "../lib/logger.js";
import { MODELS } from "../config.js";
import type { EpisodeInput, EpisodeMetadata, ClusterAssignment } from "../types.js";

export async function assignCluster(
  episode: EpisodeInput,
  metadata: EpisodeMetadata,
  topicClustersPath: string,
  personaKeywordsPath: string,
  promptsDir: string,
  logger: AgentLogger
): Promise<ClusterAssignment> {
  const systemPrompt = loadPrompt(promptsDir, "step2-topic-cluster.md");
  const topicClusters = fs.readFileSync(topicClustersPath, "utf-8");
  const personaKeywords = fs.readFileSync(personaKeywordsPath, "utf-8");

  const userMessage = `## Episode
Title: ${episode.title}
Type: ${metadata.episode_type}

## Metadata (from Step 1)
Guest: ${metadata.guest_name ?? "None"} ${metadata.guest_credentials ? `(${metadata.guest_credentials})` : ""}
Key Claims: ${metadata.key_claims.join("; ")}
Topics: ${metadata.topics.join(", ")}
Named Experts: ${metadata.named_experts.join(", ")}

## Topic Clusters
${topicClusters}

## Persona Keywords
${personaKeywords}`;

  const result = await callLLM({
    model: MODELS.cluster,
    system: systemPrompt,
    userMessage,
  });

  const cluster = parseJsonResponse<ClusterAssignment>(result.text);

  logger.logStep(episode.slug, episode.episodeNumber, "step2-cluster", MODELS.cluster, {
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  }, result.runtimeMs, true);

  return cluster;
}
