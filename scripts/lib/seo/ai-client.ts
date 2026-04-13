import Anthropic from "@anthropic-ai/sdk";

type Model = "haiku" | "sonnet";

const MODEL_IDS: Record<Model, string> = {
  haiku: "claude-haiku-4-5-20251001",
  sonnet: "claude-sonnet-4-5-20241022",
};

interface AiCallOptions {
  system: string;
  prompt: string;
  model?: Model;
  maxTokens?: number;
  dryRun?: boolean;
}

interface AiCallResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

let client: Anthropic | null = null;
let totalInputTokens = 0;
let totalOutputTokens = 0;
let totalCalls = 0;

function getClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not set");
    }
    client = new Anthropic();
  }
  return client;
}

/**
 * Make an AI call with rate limiting and retry
 */
export async function aiCall(options: AiCallOptions): Promise<AiCallResult> {
  const { system, prompt, model = "haiku", maxTokens = 1024, dryRun = false } = options;
  const modelId = MODEL_IDS[model];

  if (dryRun) {
    console.log(`  [DRY RUN] Would call ${model} (${modelId})`);
    console.log(`  System: ${system.slice(0, 100)}...`);
    console.log(`  Prompt: ${prompt.slice(0, 200)}...`);
    return { text: "[dry run]", inputTokens: 0, outputTokens: 0, model: modelId };
  }

  // Rate limiting — wait between calls
  if (totalCalls > 0) {
    await new Promise((r) => setTimeout(r, 600));
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await getClient().messages.create({
        model: modelId,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "";
      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;

      totalInputTokens += inputTokens;
      totalOutputTokens += outputTokens;
      totalCalls++;

      return { text, inputTokens, outputTokens, model: modelId };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`  ⚠ Attempt ${attempt + 1}/3 failed: ${lastError.message}`);
      if (attempt < 2) {
        const backoff = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }

  throw lastError || new Error("AI call failed after 3 attempts");
}

/**
 * Print cost summary
 */
export function printCostSummary(): void {
  // Approximate pricing per 1M tokens
  const haiku = { input: 1.0, output: 5.0 };
  const sonnet = { input: 3.0, output: 15.0 };

  // Use haiku pricing as conservative estimate (actual varies by model mix)
  const inputCost = (totalInputTokens / 1_000_000) * haiku.input;
  const outputCost = (totalOutputTokens / 1_000_000) * haiku.output;

  console.log("\n📊 AI Usage Summary:");
  console.log(`   Calls: ${totalCalls}`);
  console.log(`   Input tokens: ${totalInputTokens.toLocaleString()}`);
  console.log(`   Output tokens: ${totalOutputTokens.toLocaleString()}`);
  console.log(`   Estimated cost: $${(inputCost + outputCost).toFixed(2)} (Haiku pricing)`);
}

/**
 * Reset counters
 */
export function resetCounters(): void {
  totalInputTokens = 0;
  totalOutputTokens = 0;
  totalCalls = 0;
}
