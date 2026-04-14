"use server";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { db } from "@/lib/db";
import { repurposedEpisodes, repurposedContent, contentChatMessages } from "@/lib/db/schema";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const REVALIDATE_PATH = "/admin/content/repurposed";
const PODCAST_DIR = path.join(process.cwd(), "content/podcast");
const BLOG_DIR = path.join(process.cwd(), "content/blog");

// ---------------------------------------------------------------------------
// Episode queries
// ---------------------------------------------------------------------------

export async function getEpisodes(filter?: string) {
  const episodes = await db
    .select({
      id: repurposedEpisodes.id,
      episodeSlug: repurposedEpisodes.episodeSlug,
      episodeTitle: repurposedEpisodes.episodeTitle,
      episodeNumber: repurposedEpisodes.episodeNumber,
      pillar: repurposedEpisodes.pillar,
      status: repurposedEpisodes.status,
      generatedAt: repurposedEpisodes.generatedAt,
      createdAt: repurposedEpisodes.createdAt,
      updatedAt: repurposedEpisodes.updatedAt,
      totalContent: sql<number>`count(${repurposedContent.id})::int`,
      approvedContent: sql<number>`count(${repurposedContent.id}) filter (where ${repurposedContent.status} = 'approved')::int`,
    })
    .from(repurposedEpisodes)
    .leftJoin(repurposedContent, eq(repurposedContent.episodeId, repurposedEpisodes.id))
    .groupBy(repurposedEpisodes.id)
    .orderBy(desc(repurposedEpisodes.generatedAt))
    .$dynamic();

  // Apply status filter in JS after fetching — keeps the query simple and avoids
  // $dynamic() chaining issues with conditional where clauses.
  if (filter && filter !== "all") {
    const filtered = await db
      .select({
        id: repurposedEpisodes.id,
        episodeSlug: repurposedEpisodes.episodeSlug,
        episodeTitle: repurposedEpisodes.episodeTitle,
        episodeNumber: repurposedEpisodes.episodeNumber,
        pillar: repurposedEpisodes.pillar,
        status: repurposedEpisodes.status,
        generatedAt: repurposedEpisodes.generatedAt,
        createdAt: repurposedEpisodes.createdAt,
        updatedAt: repurposedEpisodes.updatedAt,
        totalContent: sql<number>`count(${repurposedContent.id})::int`,
        approvedContent: sql<number>`count(${repurposedContent.id}) filter (where ${repurposedContent.status} = 'approved')::int`,
      })
      .from(repurposedEpisodes)
      .leftJoin(repurposedContent, eq(repurposedContent.episodeId, repurposedEpisodes.id))
      .where(eq(repurposedEpisodes.status, filter))
      .groupBy(repurposedEpisodes.id)
      .orderBy(desc(repurposedEpisodes.generatedAt));
    return filtered;
  }

  return episodes;
}

export async function getEpisodeDetail(episodeId: number) {
  const [episode] = await db
    .select()
    .from(repurposedEpisodes)
    .where(eq(repurposedEpisodes.id, episodeId));

  if (!episode) return null;

  const contentPieces = await db
    .select({
      id: repurposedContent.id,
      episodeId: repurposedContent.episodeId,
      contentType: repurposedContent.contentType,
      content: repurposedContent.content,
      status: repurposedContent.status,
      version: repurposedContent.version,
      createdAt: repurposedContent.createdAt,
      updatedAt: repurposedContent.updatedAt,
      chatMessageCount: sql<number>`count(${contentChatMessages.id})::int`,
    })
    .from(repurposedContent)
    .leftJoin(contentChatMessages, eq(contentChatMessages.contentId, repurposedContent.id))
    .where(eq(repurposedContent.episodeId, episodeId))
    .groupBy(repurposedContent.id)
    .orderBy(repurposedContent.contentType);

  return { episode, contentPieces };
}

// ---------------------------------------------------------------------------
// Episode status helpers
// ---------------------------------------------------------------------------

async function recalculateEpisodeStatus(episodeId: number) {
  const siblings = await db
    .select({ status: repurposedContent.status })
    .from(repurposedContent)
    .where(eq(repurposedContent.episodeId, episodeId));

  const total = siblings.length;
  if (total === 0) return;

  const approvedCount = siblings.filter((s) => s.status === "approved").length;
  const rejectedCount = siblings.filter((s) => s.status === "rejected").length;

  let episodeStatus: string;
  if (approvedCount === total) {
    episodeStatus = "approved";
  } else if (approvedCount + rejectedCount === total && approvedCount > 0) {
    // All reviewed but not all approved
    episodeStatus = "partial";
  } else if (approvedCount > 0) {
    episodeStatus = "partial";
  } else {
    episodeStatus = "pending";
  }

  await db
    .update(repurposedEpisodes)
    .set({ status: episodeStatus, updatedAt: new Date() })
    .where(eq(repurposedEpisodes.id, episodeId));
}

// ---------------------------------------------------------------------------
// Content mutations
// ---------------------------------------------------------------------------

export async function approveContent(contentId: number) {
  const [piece] = await db
    .select({
      episodeId: repurposedContent.episodeId,
      contentType: repurposedContent.contentType,
      content: repurposedContent.content,
    })
    .from(repurposedContent)
    .where(eq(repurposedContent.id, contentId));

  if (!piece) throw new Error("Content not found");

  await db
    .update(repurposedContent)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(repurposedContent.id, contentId));

  // When episode-page is approved, publish the page to the site
  if (piece.contentType === "episode-page") {
    await publishEpisodePage(piece.episodeId);
  }

  // When blog is approved, publish the blog post to the site
  if (piece.contentType === "blog") {
    await publishBlogPost(piece.content);
  }

  await recalculateEpisodeStatus(piece.episodeId);
  revalidatePath(REVALIDATE_PATH);
}

/**
 * Publish an episode page by updating the MDX file with approved content.
 * The MDX file already exists from the agent run with full frontmatter
 * (youtubeId, guest info, etc). This updates the body with the approved text.
 */
async function publishEpisodePage(episodeId: number) {
  // Get the episode slug
  const [episode] = await db
    .select()
    .from(repurposedEpisodes)
    .where(eq(repurposedEpisodes.id, episodeId));

  if (!episode) return;

  // Get all episode content pieces
  const contentPieces = await db
    .select()
    .from(repurposedContent)
    .where(eq(repurposedContent.episodeId, episodeId));

  const pagePiece = contentPieces.find((p) => p.contentType === "episode-page");
  const metaPiece = contentPieces.find((p) => p.contentType === "episode-meta");
  const citationPiece = contentPieces.find((p) => p.contentType === "episode-citation");

  if (!pagePiece) return;

  const mdxPath = path.join(PODCAST_DIR, `${episode.episodeSlug}.mdx`);

  // Read existing frontmatter (has youtubeId, guest, duration, etc.)
  let frontmatter: Record<string, unknown> = {};
  if (fs.existsSync(mdxPath)) {
    const existing = fs.readFileSync(mdxPath, "utf-8");
    const { data } = matter(existing);
    frontmatter = data;
  } else {
    // No existing file — build minimal frontmatter
    frontmatter = {
      title: episode.episodeTitle,
      episodeNumber: episode.episodeNumber,
      pillar: episode.pillar,
      publishDate: new Date().toISOString().split("T")[0],
    };
  }

  // Update SEO fields from approved episode-meta if available
  if (metaPiece) {
    try {
      const meta = JSON.parse(metaPiece.content);
      if (meta.seoTitle) frontmatter.seoTitle = meta.seoTitle;
      if (meta.metaDescription) frontmatter.seoDescription = meta.metaDescription;
    } catch {
      // skip if meta content isn't valid JSON
    }
  }

  // Strip any AI citation tags from the citation content
  const citationText = citationPiece
    ? citationPiece.content.replace(/<\/?AICitationBlock>/g, "").trim()
    : "";

  // Build MDX body
  let body = pagePiece.content;

  if (citationText) {
    body += `\n\n<AICitationBlock>\n${citationText}\n</AICitationBlock>`;
  }

  const mdxContent = matter.stringify(body, frontmatter);
  fs.writeFileSync(mdxPath, mdxContent);

  // Revalidate the public podcast page
  revalidatePath(`/podcast/${episode.episodeSlug}`);
}

/**
 * Publish a blog post by writing an MDX file to content/blog/.
 * The blog content is stored as JSON in the DB with title, body, keywords, etc.
 */
async function publishBlogPost(contentJson: string) {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(contentJson);
  } catch {
    console.error("[Publish] Blog content is not valid JSON");
    return;
  }

  const title = String(parsed.title ?? "");
  const body = String(parsed.body ?? "");
  if (!title || !body) return;

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  const frontmatter: Record<string, unknown> = {
    title,
    seoTitle: parsed.seoTitle || title,
    seoDescription: String(parsed.seoDescription ?? ""),
    excerpt: String(parsed.excerpt ?? ""),
    pillar: "coaching",
    author: "Anthony Walsh",
    publishDate: new Date().toISOString().split("T")[0],
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
  };

  if (parsed.featuredImage) {
    frontmatter.featuredImage = parsed.featuredImage;
  }

  if (Array.isArray(parsed.relatedEpisodeSlugs) && parsed.relatedEpisodeSlugs.length > 0) {
    frontmatter.relatedEpisodes = parsed.relatedEpisodeSlugs;
  }

  if (parsed.sourceEpisodeSlug) {
    frontmatter.relatedEpisodes = [
      ...(Array.isArray(frontmatter.relatedEpisodes) ? frontmatter.relatedEpisodes as string[] : []),
      String(parsed.sourceEpisodeSlug),
    ];
  }

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  const mdxContent = matter.stringify(body, frontmatter);
  fs.writeFileSync(path.join(BLOG_DIR, `${slug}.mdx`), mdxContent);

  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog");
}

export async function rejectContent(contentId: number) {
  const [piece] = await db
    .select({ episodeId: repurposedContent.episodeId })
    .from(repurposedContent)
    .where(eq(repurposedContent.id, contentId));

  if (!piece) throw new Error("Content not found");

  await db
    .update(repurposedContent)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(repurposedContent.id, contentId));

  await recalculateEpisodeStatus(piece.episodeId);
  revalidatePath(REVALIDATE_PATH);
}

export async function approveAllContent(episodeId: number) {
  await db
    .update(repurposedContent)
    .set({ status: "approved", updatedAt: new Date() })
    .where(
      and(
        eq(repurposedContent.episodeId, episodeId),
        inArray(repurposedContent.status, ["pending", "amended"]),
      ),
    );

  await db
    .update(repurposedEpisodes)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(repurposedEpisodes.id, episodeId));

  revalidatePath(REVALIDATE_PATH);
}

// ---------------------------------------------------------------------------
// Chat history
// ---------------------------------------------------------------------------

export async function getChatHistory(contentId: number) {
  return db
    .select()
    .from(contentChatMessages)
    .where(eq(contentChatMessages.contentId, contentId))
    .orderBy(contentChatMessages.createdAt);
}

// ---------------------------------------------------------------------------
// Manual content edits
// ---------------------------------------------------------------------------

export async function updateContentText(contentId: number, newContent: string) {
  const [piece] = await db
    .select({ version: repurposedContent.version, episodeId: repurposedContent.episodeId })
    .from(repurposedContent)
    .where(eq(repurposedContent.id, contentId));

  if (!piece) throw new Error("Content not found");

  await db
    .update(repurposedContent)
    .set({
      content: newContent,
      status: "amended",
      version: piece.version + 1,
      updatedAt: new Date(),
    })
    .where(eq(repurposedContent.id, contentId));

  await recalculateEpisodeStatus(piece.episodeId);
  revalidatePath(REVALIDATE_PATH);
}
