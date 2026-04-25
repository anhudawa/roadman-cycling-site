import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { aiDelay } from "../ai-extractor.js";
import { blogPrompt } from "./prompts.js";
import { type EpisodeInput, type BlogOutput } from "./types.js";

// --- Singleton Anthropic client ---

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

// --- MDX sanitization (mirrors mdx-generator.ts) ---

function sanitizeMdx(text: string): string {
  return text
    // Remove zero-width characters
    .replace(/[\u2060\u200B\uFEFF]/g, "")
    // Escape curly braces (JSX expressions in MDX)
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    // Convert bare URLs to markdown links (skip URLs already inside markdown links)
    .replace(/(?<!\]\()(?<!\()(https?:\/\/[^\s)]+)(?!\))/g, "[$1]($1)")
    // Remove HTML comments (MDX handles them differently)
    .replace(/<!--[\s\S]*?-->/g, "")
    // Escape < and > that aren't part of markdown
    .replace(/<(?!\/?\w)/g, "\\<")
    .replace(/(?<!\w)>/g, "\\>")
    .trim();
}

// --- Related episode types ---

interface RelatedEpisodeMeta {
  slug: string;
  title: string;
  episodeNumber: number;
  pillar: string;
  keywords: string[];
}

interface RelatedEpisodeRef {
  slug: string;
  title: string;
  episodeNumber: number;
}

// --- findRelatedEpisodes ---

export function findRelatedEpisodes(
  episode: EpisodeInput,
  limit: number = 5
): RelatedEpisodeRef[] {
  const podcastDir = path.join(process.cwd(), "content/podcast");

  if (!fs.existsSync(podcastDir)) {
    return [];
  }

  const files = fs.readdirSync(podcastDir).filter((f) => f.endsWith(".mdx"));

  const episodes: RelatedEpisodeMeta[] = [];
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    if (slug === episode.slug) continue;

    const raw = fs.readFileSync(path.join(podcastDir, file), "utf-8");
    const { data } = matter(raw);

    if (!data.title || !data.episodeNumber) continue;

    episodes.push({
      slug,
      title: data.title as string,
      episodeNumber: data.episodeNumber as number,
      pillar: (data.pillar as string) ?? "",
      keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : [],
    });
  }

  const inputKeywords = episode.keywords.map((k) => k.toLowerCase());

  const scored = episodes.map((ep) => {
    let score = 0;

    // Pillar match: +10
    if (ep.pillar === episode.pillar) score += 10;

    // Keyword overlap: +3 per exact match
    const epKeywords = new Set(ep.keywords.map((k) => k.toLowerCase()));
    for (const kw of inputKeywords) {
      if (epKeywords.has(kw)) score += 3;
    }

    return { ep, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => ({
      slug: s.ep.slug,
      title: s.ep.title,
      episodeNumber: s.ep.episodeNumber,
    }));
}

// --- Blog slug builder ---

function buildBlogSlug(episode: EpisodeInput): string {
  // Strip leading ep-N- prefix from episode slug
  const cleanedSlug = episode.slug.replace(/^ep-\d+-/, "");
  const base = `podcast-ep-${episode.episodeNumber}-${cleanedSlug}`;
  // Cap at 50 chars
  return base.slice(0, 50).replace(/-+$/, "");
}

// --- generateBlogPost ---

export async function generateBlogPost(
  episode: EpisodeInput
): Promise<BlogOutput | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("  $œ— ANTHROPIC_API_KEY not set $€” skipping blog generation");
    return null;
  }

  try {
    // Find related episodes for internal linking
    const relatedEpisodes = findRelatedEpisodes(episode);

    // Build prompt
    const { system, user } = blogPrompt(episode, relatedEpisodes);

    // Call Claude Sonnet
    const response = await getClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    });

    await aiDelay();

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the metadata JSON block (```json ... ```)
    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)```/);
    if (!jsonBlockMatch) {
      console.error(`  $œ— Could not find JSON block in response for: ${episode.title}`);
      return null;
    }

    let metadata: {
      seoTitle?: string;
      seoDescription?: string;
      excerpt?: string;
      additionalKeywords?: string[];
    };

    try {
      metadata = JSON.parse(jsonBlockMatch[1].trim());
    } catch {
      console.error(`  $œ— Failed to parse metadata JSON for: ${episode.title}`);
      return null;
    }

    // Extract blog body (everything after the JSON block)
    const jsonBlockEnd = text.indexOf("```", text.indexOf("```json") + 7);
    const afterJsonBlock = text.slice(jsonBlockEnd + 3).trim();
    const blogBody = sanitizeMdx(afterJsonBlock);

    if (!blogBody) {
      console.error(`  $œ— Empty blog body for: ${episode.title}`);
      return null;
    }

    // Merge keywords
    const mergedKeywords = Array.from(
      new Set([
        ...episode.keywords,
        ...(metadata.additionalKeywords ?? []),
      ])
    );

    // Build today's date (YYYY-MM-DD)
    const today = new Date().toISOString().slice(0, 10);

    // Build frontmatter matching BlogFrontmatter
    const frontmatter = {
      title: episode.title,
      seoTitle: metadata.seoTitle ?? episode.title,
      seoDescription: metadata.seoDescription ?? episode.seoDescription,
      excerpt: metadata.excerpt ?? "",
      pillar: episode.pillar,
      author: "Anthony Walsh",
      publishDate: today,
      keywords: mergedKeywords,
      relatedEpisodes: relatedEpisodes.map((ep) => ep.slug),
      sourceEpisode: episode.slug,
    };

    // Assemble MDX via gray-matter.stringify()
    const mdxContent = matter.stringify(blogBody, frontmatter);

    const slug = buildBlogSlug(episode);

    return { mdxContent, slug };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`  $œ— Blog generation failed for "${episode.title}": ${msg}`);
    return null;
  }
}
