import Anthropic from "@anthropic-ai/sdk";
import { aiDelay } from "../ai-extractor.js";
import { socialPrompt } from "./prompts.js";
import { type EpisodeInput, type SocialOutput } from "./types.js";

// --- Singleton Anthropic client ---

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

// --- generateSocialPosts ---

export async function generateSocialPosts(
  episode: EpisodeInput
): Promise<SocialOutput | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("  ✗ ANTHROPIC_API_KEY not set — skipping social generation");
    return null;
  }

  try {
    const { system, user } = socialPrompt(episode);

    const response = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    });

    await aiDelay();

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Try to parse JSON — response should be raw JSON per prompt instructions
    let jsonStr = text.trim();

    // Handle case where model wraps in code block despite instructions
    const codeBlockMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    }

    let parsed: SocialOutput;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error(
        `  ✗ Failed to parse social JSON for: ${episode.title}`
      );
      return null;
    }

    // Stamp episodeSlug and generatedAt on each platform output
    const now = new Date().toISOString();
    parsed.twitter = {
      ...parsed.twitter,
      episodeSlug: episode.slug,
      generatedAt: now,
    };
    parsed.instagram = {
      ...parsed.instagram,
      episodeSlug: episode.slug,
      generatedAt: now,
    };
    parsed.linkedin = {
      ...parsed.linkedin,
      episodeSlug: episode.slug,
      generatedAt: now,
    };
    parsed.facebook = {
      ...parsed.facebook,
      episodeSlug: episode.slug,
      generatedAt: now,
    };

    return parsed;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(
      `  ✗ Social generation failed for "${episode.title}": ${msg}`
    );
    return null;
  }
}
