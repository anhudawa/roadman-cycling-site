import { callOpusAdvisor, loadPrompt, parseJsonResponse } from "../lib/anthropic.js";
import { AgentLogger } from "../lib/logger.js";
import { MODELS } from "../config.js";
import type {
  EpisodeInput,
  EpisodeMetadata,
  GeneratedContent,
  VoiceCheckResult,
} from "../types.js";

export async function checkVoiceFidelity(
  episode: EpisodeInput,
  metadata: EpisodeMetadata,
  content: GeneratedContent,
  promptsDir: string,
  logger: AgentLogger,
  regenerationAttempt: number
): Promise<VoiceCheckResult> {
  const systemPrompt = loadPrompt(promptsDir, "step4-voice-check.md");

  const userMessage = `## Episode Context
Title: ${episode.title}
Guest: ${metadata.guest_name ?? "Solo episode"}
Episode Type: ${metadata.episode_type}
Regeneration Attempt: ${regenerationAttempt}

## Generated Content to Evaluate

### Lede
${content.lede}

### Key Takeaways
${content.key_takeaways}

### AI Citation Block
${content.ai_citation_block}

### Internal Links Prose
${content.internal_links_prose}

### Meta Description
${content.meta_description}`;

  const result = await callOpusAdvisor({
    system: systemPrompt,
    userMessage,
  });

  const voiceCheck = parseJsonResponse<VoiceCheckResult>(result.text);

  logger.logStep(
    episode.slug,
    episode.episodeNumber,
    "step4-voice-check",
    MODELS.voiceCheck,
    { inputTokens: result.inputTokens, outputTokens: result.outputTokens },
    result.runtimeMs,
    voiceCheck.overall_pass,
    {
      regenerationAttempt,
      sacredCowScore: voiceCheck.sacred_cow_score,
    }
  );

  return voiceCheck;
}
