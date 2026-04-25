import Anthropic from "@anthropic-ai/sdk";
import { type ExtractedQuote } from "./types.js";
import { quoteExtractionPrompt } from "./prompts.js";
import { aiDelay } from "../ai-extractor.js";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export async function extractQuotes(
  transcript: string,
  title: string,
  guest?: string
): Promise<ExtractedQuote[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("  $š  ANTHROPIC_API_KEY not set, skipping quote extraction");
    return [];
  }

  const { system, user } = quoteExtractionPrompt(transcript, title, guest);

  try {
    const response = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    });

    await aiDelay();

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON array $€” may be wrapped in code blocks or raw
    let jsonStr = text;
    const codeBlockMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    } else {
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        jsonStr = arrayMatch[0];
      }
    }

    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) {
      console.warn("  $š  Quote extraction did not return an array");
      return [];
    }

    // Validate each quote has the required fields
    return parsed.filter(
      (q: unknown): q is ExtractedQuote =>
        typeof q === "object" &&
        q !== null &&
        typeof (q as Record<string, unknown>).text === "string" &&
        typeof (q as Record<string, unknown>).speaker === "string" &&
        typeof (q as Record<string, unknown>).context === "string"
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`  quote-extractor: Failed: ${msg}`);
    return [];
  }
}
