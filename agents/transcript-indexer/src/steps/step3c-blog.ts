import fs from "fs";
import path from "path";
import { callLLM, loadPrompt, parseJsonResponse } from "../lib/anthropic.js";
import { AgentLogger } from "../lib/logger.js";
import { MODELS } from "../config.js";
import type {
  EpisodeInput,
  EpisodeMetadata,
  ClusterAssignment,
  BlogContent,
} from "../types.js";

/**
 * Find existing episode slugs in the same cluster for internal linking.
 */
function findClusterSiblings(
  podcastDir: string,
  metaDir: string,
  primaryCluster: string,
  excludeSlug: string,
  limit: number = 5
): string[] {
  const siblings: string[] = [];

  if (fs.existsSync(metaDir)) {
    const metaFiles = fs.readdirSync(metaDir).filter((f) => f.endsWith(".json"));
    for (const file of metaFiles) {
      try {
        const meta = JSON.parse(fs.readFileSync(path.join(metaDir, file), "utf-8"));
        if (meta.primary_cluster === primaryCluster) {
          const slug = file.replace(/\.json$/, "");
          if (slug !== excludeSlug) siblings.push(slug);
        }
      } catch {
        // skip
      }
    }
  }

  return siblings.slice(0, limit);
}

export async function generateBlogContent(
  episode: EpisodeInput,
  metadata: EpisodeMetadata,
  cluster: ClusterAssignment,
  podcastDir: string,
  metaDir: string,
  promptsDir: string,
  logger: AgentLogger
): Promise<BlogContent> {
  const systemPrompt = loadPrompt(promptsDir, "step3c-blog-generation.md");

  // Truncate transcript
  const words = episode.transcript.split(/\s+/);
  const truncated =
    words.length > 8000 ? words.slice(0, 8000).join(" ") + "..." : episode.transcript;

  const siblings = findClusterSiblings(podcastDir, metaDir, cluster.primary_cluster, episode.slug);

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

## Related Episodes (for internal linking)
${siblings.map((s) => `- /podcast/${s}`).join("\n") || "None available yet"}

## Transcript (first ~8000 words)
${truncated}`;

  const result = await callLLM({
    model: MODELS.generation,
    system: systemPrompt,
    userMessage,
    maxTokens: 16000,
  });

  const content = parseJsonResponse<BlogContent>(result.text);

  logger.logStep(episode.slug, episode.episodeNumber, "step3c-blog", MODELS.generation, {
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  }, result.runtimeMs, true);

  return content;
}
