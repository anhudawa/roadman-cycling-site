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
    console.error("  $œ— ANTHROPIC_API_KEY not set $€” skipping social generation");
    return null;
  }

  try {
    const { system, user } = socialPrompt(episode);

    const response = await getClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    });

    await aiDelay();

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Try to parse JSON $€” response should be raw JSON per prompt instructions
    let jsonStr = text.trim();

    // Handle case where model wraps in code block despite instructions
    const codeBlockMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error(
        `  $œ— Failed to parse social JSON for: ${episode.title}`
      );
      return null;
    }

    // Validate required structure
    const tw = parsed.twitter as Record<string, unknown> | undefined;
    const ig = parsed.instagram as Record<string, unknown> | undefined;
    const li = parsed.linkedin as Record<string, unknown> | undefined;
    const fb = parsed.facebook as Record<string, unknown> | undefined;

    if (
      !tw || !Array.isArray(tw.tweets) ||
      !ig || typeof ig.caption !== "string" || !Array.isArray(ig.hashtags) ||
      !li || typeof li.post !== "string" ||
      !fb || typeof fb.post !== "string" || typeof fb.angle !== "string"
    ) {
      console.error(
        `  $œ— Social JSON missing required fields for: ${episode.title}`
      );
      return null;
    }

    // Stamp episodeSlug and generatedAt on each platform output
    const now = new Date().toISOString();
    const output: SocialOutput = {
      twitter: {
        tweets: tw.tweets as { text: string; index: number }[],
        episodeSlug: episode.slug,
        generatedAt: now,
      },
      instagram: {
        caption: ig.caption as string,
        hashtags: ig.hashtags as string[],
        episodeSlug: episode.slug,
        generatedAt: now,
      },
      linkedin: {
        post: li.post as string,
        episodeSlug: episode.slug,
        generatedAt: now,
      },
      facebook: {
        post: fb.post as string,
        angle: fb.angle as string,
        episodeSlug: episode.slug,
        generatedAt: now,
      },
    };

    return output;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(
      `  $œ— Social generation failed for "${episode.title}": ${msg}`
    );
    return null;
  }
}
