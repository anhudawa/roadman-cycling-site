import { callLLM, loadPrompt } from "../lib/anthropic.js";
import { runVoiceCheck, quickBannedWordScan } from "../lib/voice-check.js";
import { MODELS } from "../config.js";
import type {
  SkoolPost,
  SurfaceDraftResult,
  SurfaceType,
  VoiceCheckResult,
} from "../types.js";

const SURFACE_WORD_CAP = 60;

interface ActiveMemberCandidate {
  firstName: string;
  topicTags: string[];
  lastSeenAt: string;
  priorContributionNote: string;
}

interface EpisodeCandidate {
  slug: string;
  title: string;
  guest?: string;
  relevance: string;
}

/** Deterministic cascade: tag → link → summary. First one that doesn't SKIP wins. */
export async function generateSurfaceForThread(opts: {
  promptsDir: string;
  thread: SkoolPost;
  activeMembers: ActiveMemberCandidate[];
  episodes: EpisodeCandidate[];
}): Promise<SurfaceDraftResult | null> {
  const systemBase = loadPrompt(opts.promptsDir, "system-ted.md");

  const attempts: Array<{ type: SurfaceType; promptFile: string; user: string }> = [];

  if (opts.activeMembers.length > 0) {
    attempts.push({
      type: "tag",
      promptFile: "surface-tag.md",
      user: buildTagUser(opts.thread, opts.activeMembers),
    });
  }
  if (opts.episodes.length > 0) {
    attempts.push({
      type: "link",
      promptFile: "surface-link.md",
      user: buildLinkUser(opts.thread, opts.episodes),
    });
  }
  attempts.push({
    type: "summary",
    promptFile: "surface-summary.md",
    user: buildSummaryUser(opts.thread),
  });

  for (const attempt of attempts) {
    const pillarPrompt = loadPrompt(opts.promptsDir, attempt.promptFile);
    const system = `${systemBase}\n\n---\n\n${pillarPrompt}`;

    const gen = await callLLM({
      model: MODELS.surface,
      system,
      userMessage: attempt.user,
      maxTokens: 400,
    });

    const body = gen.text.trim();
    if (body.startsWith("[SKIP")) continue;

    const cheapHits = quickBannedWordScan(body);
    if (cheapHits.length > 0) {
      // Surface posts don't regenerate; this attempt is dropped, next type tried.
      continue;
    }

    const voice = await runVoiceCheck(opts.promptsDir, {
      jobLabel: "surface",
      pillarOrVariant: attempt.type,
      maxWords: SURFACE_WORD_CAP,
      draftBody: body,
    });

    if (!voice.result.pass) {
      continue;
    }

    return {
      surfaceType: attempt.type,
      body,
      targetPostId: opts.thread.id,
      voiceCheck: voice.result,
    };
  }

  return null;
}

function buildTagUser(
  thread: SkoolPost,
  members: ActiveMemberCandidate[]
): string {
  const memberList = members
    .map(
      (m) =>
        `- @${m.firstName} — topics: ${m.topicTags.join(", ")}; prior note: ${m.priorContributionNote}`
    )
    .join("\n");
  return `Thread to surface:

Author: ${thread.author}
Body:
${thread.body}

Candidate active members:
${memberList}

Pick ONE member. Write a reply that tags them in. Return only the post body (including \`— Ted\`), or \`[SKIP — no match]\` if none is a strong fit.`;
}

function buildLinkUser(
  thread: SkoolPost,
  episodes: EpisodeCandidate[]
): string {
  const epList = episodes
    .map(
      (e) =>
        `- slug: ${e.slug}; title: ${e.title}${e.guest ? ` (${e.guest})` : ""}; relevance: ${e.relevance}`
    )
    .join("\n");
  return `Thread to surface:

Author: ${thread.author}
Body:
${thread.body}

Candidate episodes:
${epList}

Pick ONE episode. Write a reply linking it. Return only the post body (including \`— Ted\`), or \`[SKIP — no match]\`.`;
}

function buildSummaryUser(thread: SkoolPost): string {
  return `Thread to surface:

Author: ${thread.author}
Body:
${thread.body}

(Replies preview omitted here — the browser module provides them live when needed.)

Summarise the takes so far for lurkers. Return only the post body (including \`— Ted\`), or \`[SKIP — thread too thin]\`.`;
}

export function voiceCheckEmpty(): VoiceCheckResult {
  return { pass: false, redFlags: [], notes: "", regenerationNotes: "" };
}
