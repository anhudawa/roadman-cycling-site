import fs from "fs";
import path from "path";

// Load .env.local and .env
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

export function loadEnv(repoRoot: string) {
  loadEnvFile(path.join(repoRoot, ".env.local"));
  loadEnvFile(path.join(repoRoot, ".env"));
}

// Paths relative to repo root
export function paths(repoRoot: string) {
  return {
    podcastDir: path.join(repoRoot, "content/podcast"),
    transcriptsDir: path.join(repoRoot, "content/podcast/transcripts"),
    metaDir: path.join(repoRoot, "content/podcast/meta"),
    topicClusters: path.join(repoRoot, "content/seo/topic-clusters.json"),
    personaKeywords: path.join(repoRoot, "content/seo/persona-keywords.json"),
    episodeIndex: path.join(repoRoot, "content/podcast/index.json"),
    logsDir: path.join(repoRoot, "logs/agent"),
    promptsDir: path.join(repoRoot, "agents/transcript-indexer/prompts"),
  };
}

// Model configuration
export const MODELS = {
  metadata: "claude-haiku-4-5" as const,
  cluster: "claude-haiku-4-5" as const,
  generation: "claude-sonnet-4-6" as const,
  voiceCheck: "claude-opus-4-6" as const,
};

// Cost per million tokens (input / output)
export const COST_PER_M: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5": { input: 1.0, output: 5.0 },
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
  "claude-opus-4-6": { input: 5.0, output: 25.0 },
};

export const MAX_REGENERATION_ATTEMPTS = 3;
export const BACKFILL_RATE_LIMIT_MS = 3 * 60 * 1000; // 3 minutes between episodes
export const BACKFILL_BATCH_SIZE = 10; // episodes per PR
