import Anthropic from "@anthropic-ai/sdk";
import { aiDelay } from "../ai-extractor.js";
import { socialPrompt } from "./prompts.js";
import {
  type EpisodeInput,
  type SocialOutput,
  type TwitterThread,
} from "./types.js";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

function validateTwitterThread(data: unknown): data is TwitterThread["tweets"] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).text === "string" &&
      typeof (item as Record<string, unknown>).index === "number"
  );
}

function validateSocialResponse(data: unknown): data is {
  twitter: { tweets: TwitterThread["tweets"] };
  instagram: { caption: string; hashtags: string[] };
  linkedin: { post: string };
  facebook: { post: string; angle: string };
} {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;

  // Validate twitter
  if (
    typeof d.twitter !== "object" ||
    d.twitter === null ||
    !validateTwitterThread((d.twitter as Record<string, unknown>).tweets)
  ) {
    return false;
  }

  // Validate instagram
  if (
    typeof d.instagram !== "object" ||
    d.instagram === null
  ) return false;
  const ig = d.instagram as Record<string, unknown>;
  if (typeof ig.caption !== "string" || !Array.isArray(ig.hashtags)) {
    return false;
  }

  // Validate linkedin
  if (
    typeof d.linkedin !== "object" ||
    d.linkedin === null ||
    typeof (d.linkedin as Record<string, unknown>).post !== "string"
  ) {
    return false;
  }

  // Validate facebook
  if (
    typeof d.facebook !== "object" ||
    d.facebook === null
  ) return false;
  const fb = d.facebook as Record<string, unknown>;
  if (typeof fb.post !== "string" || typeof fb.angle !== "string") {
    return false;
  }

  return true;
}

export async function generateSocialPosts(
  episode: EpisodeInput
): Promise<SocialOutput | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }

  const { system, user } = socialPrompt(episode);

  try {
    const response = await getClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    });

    await aiDelay();

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Handle both ```json wrapped and raw JSON
    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)```/) ||
      text.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      console.error(
        `  social-generator: Could not extract JSON from response for "${episode.title}"`
      );
      return null;
    }

    const rawJson = jsonMatch[1] ?? jsonMatch[0];
    const parsed = JSON.parse(rawJson) as unknown;

    if (!validateSocialResponse(parsed)) {
      console.error(
        `  social-generator: Invalid response structure for "${episode.title}"`
      );
      return null;
    }

    const generatedAt = new Date().toISOString();
    const { slug: episodeSlug } = episode;

    const output: SocialOutput = {
      twitter: {
        tweets: parsed.twitter.tweets,
        episodeSlug,
        generatedAt,
      },
      instagram: {
        caption: parsed.instagram.caption,
        hashtags: parsed.instagram.hashtags,
        episodeSlug,
        generatedAt,
      },
      linkedin: {
        post: parsed.linkedin.post,
        episodeSlug,
        generatedAt,
      },
      facebook: {
        post: parsed.facebook.post,
        angle: parsed.facebook.angle,
        episodeSlug,
        generatedAt,
      },
    };

    return output;
  } catch (error) {
    console.error(
      `  social-generator: Failed for "${episode.title}":`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}
