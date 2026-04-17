import path from "path";
import { callOpusAdvisor, loadPrompt, parseJsonResponse } from "./anthropic.js";
import { MODELS } from "../config.js";
import type { LLMUsage, VoiceCheckResult } from "../types.js";

export interface VoiceCheckContext {
  jobLabel: "prompt" | "welcome" | "surface";
  pillarOrVariant: string;
  maxWords: number;
  draftBody: string;
}

export interface VoiceCheckCall {
  result: VoiceCheckResult;
  usage: LLMUsage;
  modelUsed: string;
}

export async function runVoiceCheck(
  promptsDir: string,
  ctx: VoiceCheckContext
): Promise<VoiceCheckCall> {
  const system = loadPrompt(promptsDir, "voice-check-ted.md");

  const userMessage = `## Ted post — voice check

Job: ${ctx.jobLabel}
Variant / pillar: ${ctx.pillarOrVariant}
Length cap (words): ${ctx.maxWords}

### Draft to evaluate

${ctx.draftBody}
`;

  const resp = await callOpusAdvisor({ system, userMessage });

  // Voice-check responses are expected to be JSON. If the model wraps in fences, parseJsonResponse strips them.
  let parsed: VoiceCheckResult;
  try {
    parsed = parseJsonResponse<VoiceCheckResult>(resp.text);
  } catch (err) {
    // Treat parse failures as a soft fail — don't block posting entirely; hand it to a human.
    parsed = {
      pass: false,
      redFlags: ["voice-check returned unparseable output"],
      notes: resp.text.slice(0, 500),
      regenerationNotes: `Parse error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  return {
    result: parsed,
    usage: {
      inputTokens: resp.inputTokens,
      outputTokens: resp.outputTokens,
      cost: resp.cost,
      runtimeMs: resp.runtimeMs,
    },
    modelUsed: MODELS.voiceCheck,
  };
}

/** Client-side sanity check for the banned word list. Cheap and deterministic. */
export function quickBannedWordScan(text: string): string[] {
  const banned: Array<{ needle: string; label: string }> = [
    { needle: "sacred cow", label: "sacred cow" },
    { needle: "unlock your potential", label: "unlock your potential" },
    { needle: "transform your journey", label: "transform your journey" },
    { needle: "game-changer", label: "game-changer" },
    { needle: "game changer", label: "game changer" },
    { needle: "life hack", label: "life hack" },
    { needle: "crush it", label: "crush it" },
    { needle: "smash it", label: "smash it" },
    { needle: "no excuses", label: "no excuses" },
    { needle: "sparked something", label: "sparked something" },
    { needle: "worth stealing", label: "worth stealing" },
    { needle: "if this resonated", label: "if this resonated" },
    { needle: "in today's fast-paced", label: "today's fast-paced" },
    { needle: "it's important to note", label: "it's important to note" },
    { needle: "it's worth noting", label: "it's worth noting" },
    { needle: "delve", label: "delve" },
    { needle: "leverage", label: "leverage" },
    { needle: "tapestry", label: "tapestry" },
    { needle: "ecosystem", label: "ecosystem" },
    { needle: "paradigm", label: "paradigm" },
  ];

  const haystack = text.toLowerCase();
  const hits: string[] = [];
  for (const b of banned) {
    if (haystack.includes(b.needle)) hits.push(b.label);
  }
  return hits;
}

export function promptFileForPillar(pillar: string): string {
  return `pillar-${pillar}.md`;
}

export function promptsPath(dir: string, file: string): string {
  return path.join(dir, file);
}
