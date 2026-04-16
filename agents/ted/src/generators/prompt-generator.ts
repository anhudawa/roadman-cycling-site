import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { callLLM, loadPrompt } from "../lib/anthropic.js";
import { runVoiceCheck, quickBannedWordScan } from "../lib/voice-check.js";
import { MAX_VOICE_RETRIES, MODELS, type Pillar } from "../config.js";
import type { PromptDraftResult, VoiceCheckResult, LLMUsage } from "../types.js";

const PROMPT_WORD_CAP = 120;

interface EpisodeContext {
  title: string;
  guest?: string;
  publishDate: string;
  summary?: string;
  excerpt?: string;
}

export async function generateDailyPrompt(opts: {
  promptsDir: string;
  podcastDir: string;
  pillar: Pillar;
  targetDate: string; // YYYY-MM-DD
}): Promise<PromptDraftResult> {
  const systemBase = loadPrompt(opts.promptsDir, "system-ted.md");
  const pillarInstructions = loadPrompt(
    opts.promptsDir,
    `pillar-${opts.pillar}.md`
  );
  const system = `${systemBase}\n\n---\n\n${pillarInstructions}`;

  let episodeContext: EpisodeContext | null = null;
  if (opts.pillar === "saturday") {
    episodeContext = loadMostRecentEpisode(opts.podcastDir);
  }

  const baseUser = buildUserMessage(opts.pillar, opts.targetDate, episodeContext);

  let genUsage: LLMUsage = { inputTokens: 0, outputTokens: 0, cost: 0, runtimeMs: 0 };
  let checkUsage: LLMUsage = { inputTokens: 0, outputTokens: 0, cost: 0, runtimeMs: 0 };
  let attempts = 0;
  let lastBody = "";
  let lastVoiceCheck: VoiceCheckResult | null = null;
  let retryNotes = "";

  for (let i = 0; i <= MAX_VOICE_RETRIES; i++) {
    attempts = i + 1;
    const userMessage = retryNotes
      ? `${baseUser}\n\n---\n\n## Previous attempt failed voice check. Feedback:\n${retryNotes}\n\nRegenerate with these corrections. Do not repeat the failed phrasing.`
      : baseUser;

    const gen = await callLLM({
      model: MODELS.prompt,
      system,
      userMessage,
      maxTokens: 600,
    });
    genUsage = addUsage(genUsage, gen);

    lastBody = cleanBody(gen.text);

    if (lastBody.startsWith("[SKIP")) {
      // pillar's system prompt deliberately bailed (e.g. Saturday without ep context)
      lastVoiceCheck = {
        pass: false,
        redFlags: ["generator returned SKIP marker"],
        notes: lastBody,
        regenerationNotes: "Needs human input — generator could not proceed.",
      };
      break;
    }

    // Cheap banned-word sweep before the paid voice check
    const cheapHits = quickBannedWordScan(lastBody);
    if (cheapHits.length > 0) {
      lastVoiceCheck = {
        pass: false,
        redFlags: cheapHits.map((h) => `banned phrase: ${h}`),
        notes: "Quick banned-word scan failed before LLM voice-check.",
        regenerationNotes: `Remove these phrases: ${cheapHits.join(", ")}.`,
      };
      retryNotes = lastVoiceCheck.regenerationNotes;
      continue;
    }

    const voice = await runVoiceCheck(opts.promptsDir, {
      jobLabel: "prompt",
      pillarOrVariant: opts.pillar,
      maxWords: PROMPT_WORD_CAP,
      draftBody: lastBody,
    });
    checkUsage = addUsage(checkUsage, voice.usage);
    lastVoiceCheck = voice.result;

    if (voice.result.pass) break;
    retryNotes = voice.result.regenerationNotes || voice.result.redFlags.join("; ");
  }

  return {
    pillar: opts.pillar,
    body: lastBody,
    voiceCheck:
      lastVoiceCheck ?? {
        pass: false,
        redFlags: ["no voice-check produced"],
        notes: "",
        regenerationNotes: "",
      },
    attempts,
    usage: { generation: genUsage, voiceCheck: checkUsage },
  };
}

function buildUserMessage(
  pillar: Pillar,
  date: string,
  episode: EpisodeContext | null
): string {
  const parts = [`Write today's Ted prompt.`, `Date: ${date}`, `Pillar: ${pillar}`];
  if (pillar === "saturday") {
    if (episode) {
      parts.push(`\n### Latest podcast episode`);
      parts.push(`Title: ${episode.title}`);
      if (episode.guest) parts.push(`Guest: ${episode.guest}`);
      parts.push(`Published: ${episode.publishDate}`);
      if (episode.summary) parts.push(`\nSummary:\n${episode.summary}`);
      if (episode.excerpt) parts.push(`\nExcerpt:\n${episode.excerpt}`);
    } else {
      parts.push(`\nNo recent episode context available — return [SKIP — no recent episode found].`);
    }
  }
  parts.push(
    `\nReturn only the post body (including the \`— Ted\` sign-off on its own line). No preamble, no JSON, no commentary.`
  );
  return parts.join("\n");
}

function cleanBody(text: string): string {
  let cleaned = text.trim();
  // Strip opening code fences if the model wraps the post.
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return cleaned.trim();
}

function addUsage(a: LLMUsage, b: LLMUsage): LLMUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cost: a.cost + b.cost,
    runtimeMs: a.runtimeMs + b.runtimeMs,
  };
}

// ── Episode lookup — cheap, bounded, best-effort ─────────────

function loadMostRecentEpisode(podcastDir: string): EpisodeContext | null {
  if (!fs.existsSync(podcastDir)) return null;
  const files = fs
    .readdirSync(podcastDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => ({
      name: f,
      mtime: fs.statSync(path.join(podcastDir, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, 20);

  let best: { publishDate: string; context: EpisodeContext } | null = null;
  for (const f of files) {
    try {
      const raw = fs.readFileSync(path.join(podcastDir, f.name), "utf-8");
      const { data, content } = matter(raw);
      const publishDate = String(data.publishDate ?? "");
      if (!publishDate) continue;
      if (best && publishDate <= best.publishDate) continue;

      const firstParagraph = content.split(/\n\n+/).find((p) => p.trim().length > 40) ?? "";
      best = {
        publishDate,
        context: {
          title: String(data.title ?? ""),
          guest: data.guestName ? String(data.guestName) : undefined,
          publishDate,
          summary: data.seoDescription ? String(data.seoDescription) : undefined,
          excerpt: firstParagraph.slice(0, 800),
        },
      };
    } catch {
      // skip unparseable files
    }
  }
  return best?.context ?? null;
}
