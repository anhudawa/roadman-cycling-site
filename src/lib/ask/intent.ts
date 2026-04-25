/**
 * Intent classification via Claude Haiku 4.5. Cheap, fast, and structured $—
 * the orchestrator uses the output to pick a retrieval strategy, a CTA, and
 * whether to spend Opus tokens on the answer.
 *
 * Robustness: any parse or network failure falls back to
 * `{ intent: "training_general", deep: true, needsProfile: false, confidence: "low" }`
 * so a flaky Haiku call never breaks the pipeline $— Opus still runs on the
 * retrieval set.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Intent, IntentClassification } from "./types";

const MODEL = "claude-haiku-4-5-20251001";
const ATTEMPT_TIMEOUT_MS = 4_000;

const SYSTEM_PROMPT = `You are the intent classifier for Ask Roadman, a cycling-performance assistant.
Classify the user's query into exactly one intent from this enum:

  plateau                $— rider is stuck, FTP/performance has stalled, training isn't working
  fuelling               $— in-ride or training nutrition, carbs-per-hour, race fuelling
  content_discovery      $— asking about an episode, guest, or specific Roadman content
  recovery_masters       $— recovery, sleep, masters-specific training, ageing, HRV
  event_prep             $— preparing for a specific event (gran fondo, etape, race)
  coaching_decision      $— evaluating coaching (self-coaching vs coach, NDY, VIP)
  training_general       $— generic training questions that don't fit above
  safety_medical         $— medical symptoms (chest pain, fainting, heart issues)
  safety_injury          $— acute injury (torn muscle, broken bone, rupture)
  safety_weight          $— extreme weight loss / disordered eating signals
  off_topic              $— not cycling-related (weather, stock market, politics, etc.)
  unknown                $— can't tell

Also decide:
  deep           $— should this use the deep model (true) or a fast model (false)? Generally true for plateau / event_prep / coaching_decision; false for content_discovery / training_general.
  needsProfile   $— would knowing the rider's profile (FTP, hours, age) materially improve the answer? true for plateau / fuelling / event_prep / coaching_decision; false otherwise.
  confidence     $— high / medium / low

Return ONLY valid JSON in this exact shape:
{"intent":"...","deep":true,"needsProfile":false,"confidence":"high"}
No prose, no markdown, no code fences.`;

const FALLBACK: IntentClassification = {
  intent: "training_general",
  confidence: "low",
  deep: true,
  needsProfile: false,
};

function parseIntent(raw: string): IntentClassification {
  const stripped = raw.replace(/^```json\s*|\s*```$/g, "").trim();
  const first = stripped.indexOf("{");
  const last = stripped.lastIndexOf("}");
  if (first === -1 || last === -1) return FALLBACK;
  const jsonSlice = stripped.slice(first, last + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonSlice);
  } catch {
    return FALLBACK;
  }

  if (!parsed || typeof parsed !== "object") return FALLBACK;
  const p = parsed as Record<string, unknown>;

  const intent = (p.intent as Intent) ?? "unknown";
  const deep = typeof p.deep === "boolean" ? p.deep : true;
  const needsProfile = typeof p.needsProfile === "boolean" ? p.needsProfile : false;
  const confidence =
    p.confidence === "high" || p.confidence === "medium" || p.confidence === "low"
      ? p.confidence
      : "low";

  const validIntents: Intent[] = [
    "plateau",
    "fuelling",
    "content_discovery",
    "recovery_masters",
    "event_prep",
    "coaching_decision",
    "training_general",
    "safety_medical",
    "safety_injury",
    "safety_weight",
    "off_topic",
    "unknown",
  ];
  if (!validIntents.includes(intent)) {
    return { ...FALLBACK, confidence };
  }
  return { intent, deep, needsProfile, confidence };
}

export async function classifyIntent(query: string): Promise<IntentClassification> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return FALLBACK;

  const client = new Anthropic({ apiKey });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);

  try {
    const res = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 160,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: query }],
      },
      { signal: controller.signal },
    );
    const text = res.content
      .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
      .map((b) => b.text)
      .join("");
    return parseIntent(text);
  } catch {
    return FALLBACK;
  } finally {
    clearTimeout(timer);
  }
}
