import { callLLM, loadPrompt } from "../lib/anthropic.js";
import { runVoiceCheck, quickBannedWordScan } from "../lib/voice-check.js";
import { MAX_VOICE_RETRIES, MODELS } from "../config.js";
import type { VoiceCheckResult, WelcomeDraftResult } from "../types.js";

const WELCOME_WORD_CAP = 120;

const PERSONA_HOOKS: Record<string, string> = {
  plateau: "hitting a plateau and wanting to break through it",
  comeback: "coming back to the bike after a break",
  "event-prep": "prepping for a specific event",
  listener: "", // no hook $— use generic variant
};

export async function generateWelcome(opts: {
  promptsDir: string;
  firstName: string;
  persona?: string | null;
  questionnaireAnswers?: string[];
}): Promise<WelcomeDraftResult> {
  const systemBase = loadPrompt(opts.promptsDir, "system-ted.md");
  const welcomeInstructions = loadPrompt(opts.promptsDir, "welcome.md");
  const system = `${systemBase}\n\n---\n\n${welcomeInstructions}`;

  const hook =
    opts.persona && PERSONA_HOOKS[opts.persona] ? PERSONA_HOOKS[opts.persona] : "";
  const personaNote = hook ? `Persona hook: ${hook}` : "Persona hook: (none $— use generic variant)";

  const baseUser = [
    `Write a Ted welcome for a new Clubhouse member.`,
    `first_name: ${opts.firstName || "(empty)"}`,
    personaNote,
    opts.questionnaireAnswers?.length
      ? `Questionnaire answers (for tone only $— do not quote back verbatim):\n${opts.questionnaireAnswers
          .map((a, i) => `${i + 1}. ${a}`)
          .join("\n")}`
      : "",
    `Return only the post body (including \`$— Ted\`). No preamble, no JSON.`,
  ]
    .filter(Boolean)
    .join("\n");

  let attempts = 0;
  let lastBody = "";
  let lastVoiceCheck: VoiceCheckResult | null = null;
  let retryNotes = "";
  let totalCost = 0;

  for (let i = 0; i <= MAX_VOICE_RETRIES; i++) {
    attempts = i + 1;
    const userMessage = retryNotes
      ? `${baseUser}\n\n---\n\nPrevious attempt failed voice-check. Feedback:\n${retryNotes}\n\nRegenerate with the fixes above.`
      : baseUser;

    const gen = await callLLM({
      model: MODELS.welcome,
      system,
      userMessage,
      maxTokens: 500,
    });
    lastBody = gen.text.trim();
    totalCost += gen.cost;

    const cheapHits = quickBannedWordScan(lastBody);
    if (cheapHits.length > 0) {
      lastVoiceCheck = {
        pass: false,
        redFlags: cheapHits.map((h) => `banned phrase: ${h}`),
        notes: "",
        regenerationNotes: `Remove: ${cheapHits.join(", ")}`,
      };
      retryNotes = lastVoiceCheck.regenerationNotes;
      continue;
    }

    const voice = await runVoiceCheck(opts.promptsDir, {
      jobLabel: "welcome",
      pillarOrVariant: opts.persona ?? "listener",
      maxWords: WELCOME_WORD_CAP,
      draftBody: lastBody,
    });
    lastVoiceCheck = voice.result;
    totalCost += voice.usage.cost;

    if (voice.result.pass) break;
    retryNotes = voice.result.regenerationNotes || voice.result.redFlags.join("; ");
  }

  return {
    body: lastBody,
    voiceCheck:
      lastVoiceCheck ?? {
        pass: false,
        redFlags: ["no voice-check produced"],
        notes: "",
        regenerationNotes: "",
      },
    attempts,
    personaNote: hook || undefined,
    cost: totalCost,
  };
}
