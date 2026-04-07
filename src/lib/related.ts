import { getAllPosts, type BlogPostMeta } from "./blog";
import { getAllEpisodes, type EpisodeMeta } from "./podcast";
import { type ContentPillar } from "@/types";

// ============================================
// Cross-content similarity scoring
// ============================================

export type ContentType = "blog" | "podcast";

export interface ScoredContent {
  type: ContentType;
  slug: string;
  title: string;
  description: string;
  pillar: ContentPillar;
  href: string;
  /** Blog-only fields */
  readTime?: string;
  /** Podcast-only fields */
  guest?: string;
  duration?: string;
  episodeNumber?: number;
  /** Internal score — higher means more relevant */
  score: number;
}

interface ScoringInput {
  currentSlug: string;
  currentType: ContentType;
  pillar: ContentPillar;
  keywords: string[];
}

/**
 * Score a blog post's relevance to the current content.
 *
 * Scoring weights:
 *   - Same pillar: +10
 *   - Each shared keyword (case-insensitive): +3
 *   - Partial keyword overlap (one keyword contains the other): +1
 */
function scoreBlogPost(post: BlogPostMeta, input: ScoringInput): number {
  let score = 0;

  if (post.pillar === input.pillar) score += 10;

  const postKeywords = post.keywords.map((k) => k.toLowerCase());
  const inputKeywords = input.keywords.map((k) => k.toLowerCase());

  for (const inputKw of inputKeywords) {
    for (const postKw of postKeywords) {
      if (postKw === inputKw) {
        score += 3;
      } else if (postKw.includes(inputKw) || inputKw.includes(postKw)) {
        score += 1;
      }
    }
  }

  return score;
}

/**
 * Score a podcast episode's relevance to the current content.
 * Same logic as blog posts.
 */
function scoreEpisode(episode: EpisodeMeta, input: ScoringInput): number {
  let score = 0;

  if (episode.pillar === input.pillar) score += 10;

  const epKeywords = episode.keywords.map((k) => k.toLowerCase());
  const inputKeywords = input.keywords.map((k) => k.toLowerCase());

  for (const inputKw of inputKeywords) {
    for (const epKw of epKeywords) {
      if (epKw === inputKw) {
        score += 3;
      } else if (epKw.includes(inputKw) || inputKw.includes(epKw)) {
        score += 1;
      }
    }
  }

  return score;
}

/**
 * Find related content across both blog posts and podcast episodes.
 * Returns a mixed list sorted by relevance score.
 */
export function getRelatedContent(
  input: ScoringInput,
  limit: number = 3
): ScoredContent[] {
  const results: ScoredContent[] = [];

  // Score all blog posts (excluding self if current is a blog post)
  const allPosts = getAllPosts();
  for (const post of allPosts) {
    if (input.currentType === "blog" && post.slug === input.currentSlug)
      continue;

    const score = scoreBlogPost(post, input);
    if (score > 0) {
      results.push({
        type: "blog",
        slug: post.slug,
        title: post.title,
        description: post.excerpt,
        pillar: post.pillar,
        href: `/blog/${post.slug}`,
        readTime: post.readTime,
        score,
      });
    }
  }

  // Score all podcast episodes (excluding self if current is a podcast episode)
  const allEpisodes = getAllEpisodes();
  for (const ep of allEpisodes) {
    if (input.currentType === "podcast" && ep.slug === input.currentSlug)
      continue;

    const score = scoreEpisode(ep, input);
    if (score > 0) {
      results.push({
        type: "podcast",
        slug: ep.slug,
        title: ep.title,
        description: ep.description,
        pillar: ep.pillar,
        href: `/podcast/${ep.slug}`,
        guest: ep.guest,
        duration: ep.duration,
        episodeNumber: ep.episodeNumber,
        score,
      });
    }
  }

  // Sort by score descending, then prefer variety (alternate types when scores are close)
  results.sort((a, b) => {
    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) return scoreDiff;
    // Tie-break: prefer the opposite type to the current content for variety
    if (a.type !== b.type) {
      return a.type === input.currentType ? 1 : -1;
    }
    return 0;
  });

  return results.slice(0, limit);
}
