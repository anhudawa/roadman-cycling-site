import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { COST_PER_M } from "../config.js";

let client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export interface LLMCallResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  runtimeMs: number;
}

/**
 * Make a single LLM call with a system prompt and user message.
 * Returns parsed text + usage stats.
 */
export async function callLLM(opts: {
  model: string;
  system: string;
  userMessage: string;
  maxTokens?: number;
}): Promise<LLMCallResult> {
  const cl = getClient();
  const start = Date.now();

  const response = await cl.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 16000,
    system: opts.system,
    messages: [{ role: "user", content: opts.userMessage }],
  });

  const runtimeMs = Date.now() - start;
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as Anthropic.TextBlock).text)
    .join("");

  const costPerM = COST_PER_M[opts.model] ?? { input: 5.0, output: 25.0 };
  const cost =
    (response.usage.input_tokens * costPerM.input) / 1_000_000 +
    (response.usage.output_tokens * costPerM.output) / 1_000_000;

  return {
    text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cost,
    runtimeMs,
  };
}

/**
 * Call Opus 4.6 with adaptive thinking for the voice check.
 * Uses advisor tool beta header if available, falls back to direct call.
 */
export async function callOpusAdvisor(opts: {
  system: string;
  userMessage: string;
  maxTokens?: number;
}): Promise<LLMCallResult> {
  const cl = getClient();
  const start = Date.now();

  // Direct Opus call with adaptive thinking for nuanced quality assessment
  const response = await cl.messages.create({
    model: "claude-opus-4-6",
    max_tokens: opts.maxTokens ?? 16000,
    thinking: { type: "adaptive" },
    system: opts.system,
    messages: [{ role: "user", content: opts.userMessage }],
  });

  const runtimeMs = Date.now() - start;
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as Anthropic.TextBlock).text)
    .join("");

  const costPerM = COST_PER_M["claude-opus-4-6"];
  const cost =
    (response.usage.input_tokens * costPerM.input) / 1_000_000 +
    (response.usage.output_tokens * costPerM.output) / 1_000_000;

  return {
    text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cost,
    runtimeMs,
  };
}

/**
 * Load a prompt template from the prompts directory.
 */
export function loadPrompt(promptsDir: string, filename: string): string {
  return fs.readFileSync(path.join(promptsDir, filename), "utf-8");
}

/**
 * Parse a JSON response from an LLM, stripping markdown fences if present.
 */
export function parseJsonResponse<T>(text: string): T {
  let cleaned = text.trim();
  // Strip markdown code fences
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return JSON.parse(cleaned) as T;
}
