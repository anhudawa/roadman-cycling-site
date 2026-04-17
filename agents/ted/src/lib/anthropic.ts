import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { COST_PER_M } from "../config.js";
import type { LLMUsage } from "../types.js";

let client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export interface LLMCallResult extends LLMUsage {
  text: string;
}

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
    max_tokens: opts.maxTokens ?? 2000,
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

export async function callOpusAdvisor(opts: {
  system: string;
  userMessage: string;
  maxTokens?: number;
}): Promise<LLMCallResult> {
  const cl = getClient();
  const start = Date.now();

  const response = await cl.messages.create({
    model: "claude-opus-4-6",
    max_tokens: opts.maxTokens ?? 4000,
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

export function loadPrompt(promptsDir: string, filename: string): string {
  return fs.readFileSync(path.join(promptsDir, filename), "utf-8");
}

export function parseJsonResponse<T>(text: string): T {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "");
  }
  return JSON.parse(cleaned) as T;
}
