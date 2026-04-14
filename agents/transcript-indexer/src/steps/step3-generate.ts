import fs from "fs";
import path from "path";
import { callLLM, loadPrompt, parseJsonResponse } from "../lib/anthropic.js";
import { AgentLogger } from "../lib/logger.js";
import { MODELS } from "../config.js";
import type {
  EpisodeInput,
  EpisodeMetadata,
  ClusterAssignment,
  GeneratedContent,
} from "../types.js";

/**
 * Find existing episode slugs in the same primary cluster for internal linking.
 */
function findClusterSiblings(
  podcastDir: string,
  metaDir: string,
  primaryCluster: string,
  excludeSlug: string,
  limit: number = 10
): string[] {
  const siblings: string[] = [];

  // Check meta sidecars for cluster assignments
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
        // skip malformed files
      }
    }
  }

  // Fallback: check frontmatter pillar field in MDX files
  if (siblings.length < 3) {
    const mdxFiles = fs.readdirSync(podcastDir).filter((f) => f.endsWith(".mdx"));
    for (const file of mdxFiles) {
      const slug = file.replace(/\.mdx$/, "");
      if (slug === excludeSlug || siblings.includes(slug)) continue;

      try {
        const content = fs.readFileSync(path.join(podcastDir, file), "utf-8");
        const pillarMatch = content.match(/^pillar:\s*(.+)$/m);
        if (pillarMatch && pillarMatch[1].trim() === primaryCluster) {
          siblings.push(slug);
        }
      } catch {
        // skip
      }
      if (siblings.length >= limit) break;
    }
  }

  return siblings.slice(0, limit);
}

export async function generateContent(
  episode: EpisodeInput,
  metadata: EpisodeMetadata,
  cluster: ClusterAssignment,
  podcastDir: string,
  metaDir: string,
  promptsDir: string,
  logger: AgentLogger,
  regenerationNotes?: string
): Promise<GeneratedContent> {
  const systemPrompt = loadPrompt(promptsDir, "step3-page-generation.md");

  // Truncate transcript
  const words = episode.transcript.split(/\s+/);
  const truncated =
    words.length > 8000 ? words.slice(0, 8000).join(" ") + "..." : episode.transcript;

  // Find sibling episodes for internal linking
  const siblings = findClusterSiblings(podcastDir, metaDir, cluster.primary_cluster, episode.slug);

  let userMessage = `## Episode
Title: ${episode.title}
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
Secondary: ${cluster.secondary_clusters.join(", ") || "None"}
Primary Persona: ${cluster.primary_persona}

## Episodes in Same Cluster (for internal linking)
${siblings.map((s) => `- /podcast/${s}`).join("\n") || "None available yet"}

## Transcript (first ~8000 words)
${truncated}`;

  if (regenerationNotes) {
    userMessage += `\n\n## REGENERATION NOTES — Previous attempt failed. Fix these issues:\n${regenerationNotes}`;
  }

  const result = await callLLM({
    model: MODELS.generation,
    system: systemPrompt,
    userMessage,
    maxTokens: 16000,
  });

  const content = parseJsonResponse<GeneratedContent>(result.text);

  logger.logStep(episode.slug, episode.episodeNumber, "step3-generate", MODELS.generation, {
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  }, result.runtimeMs, true);

  return content;
}
