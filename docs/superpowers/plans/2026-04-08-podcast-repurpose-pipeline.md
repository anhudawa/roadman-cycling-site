# Podcast Content Repurposing Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a CLI pipeline that takes a podcast episode transcript and generates a blog post, social media posts for 4 platforms, and branded quote card images — saving everything to `content/repurposed/`.

**Architecture:** Single orchestration script (`scripts/repurpose-episode.ts`) calling modular generators in `scripts/lib/repurpose/`. Mirrors the existing `sync-youtube.ts` pattern: CLI arg parsing → episode loading → sequential generation → atomic file writes → state tracking.

**Tech Stack:** TypeScript (tsx), @anthropic-ai/sdk (Claude Sonnet + Haiku), gray-matter (MDX frontmatter), sharp (image processing), satori + @resvg/resvg-js (quote card rendering), Google Custom Search API (guest images)

**Spec:** `docs/superpowers/specs/2026-04-08-podcast-repurpose-pipeline-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `scripts/lib/repurpose/types.ts` | Shared interfaces for all repurpose modules |
| `scripts/lib/repurpose/prompts.ts` | All Claude prompt templates (blog, social, quotes) |
| `scripts/lib/repurpose/repurpose-state.ts` | Load/save repurpose state (which episodes processed) |
| `scripts/lib/repurpose/blog-generator.ts` | Transcript → SEO blog post MDX string |
| `scripts/lib/repurpose/social-generator.ts` | Transcript → Twitter/IG/LinkedIn/FB JSON |
| `scripts/lib/repurpose/quote-extractor.ts` | Transcript → array of quotable moments |
| `scripts/lib/repurpose/guest-image-fetcher.ts` | Google CSE / local file → processed guest image buffer |
| `scripts/lib/repurpose/quote-card-renderer.ts` | Quote data + image → PNG files via satori |
| `scripts/lib/repurpose/content-writer.ts` | Write all outputs to content/repurposed/ atomically |
| `scripts/repurpose-episode.ts` | CLI entry point and orchestration |
| `.github/workflows/podcast-repurpose.yml` | Commented-out GitHub Action |

---

## Task 1: Install Dependencies and Create Types

**Files:**
- Modify: `package.json` (add dependencies + npm scripts)
- Create: `scripts/lib/repurpose/types.ts`

- [ ] **Step 1: Install new dependencies**

```bash
cd ~/Desktop/roadman-cycling-site
npm install sharp satori @resvg/resvg-js
```

- [ ] **Step 2: Create the shared types file**

Create `scripts/lib/repurpose/types.ts`:

```typescript
export interface RepurposeState {
  lastRepurposeDate: string;
  processedEpisodeSlugs: string[];
}

export interface BlogOutput {
  mdxContent: string;
  slug: string;
}

export interface TwitterThread {
  tweets: { text: string; index: number }[];
  episodeSlug: string;
  generatedAt: string;
}

export interface InstagramPost {
  caption: string;
  hashtags: string[];
  episodeSlug: string;
  generatedAt: string;
}

export interface LinkedInPost {
  post: string;
  episodeSlug: string;
  generatedAt: string;
}

export interface FacebookPost {
  post: string;
  angle: string;
  episodeSlug: string;
  generatedAt: string;
}

export interface SocialOutput {
  twitter: TwitterThread;
  instagram: InstagramPost;
  linkedin: LinkedInPost;
  facebook: FacebookPost;
}

export interface ExtractedQuote {
  text: string;
  speaker: string;
  context: string;
}

export interface QuoteCardPaths {
  squarePath: string;
  landscapePath: string;
}

export interface RepurposeResult {
  blog: BlogOutput | null;
  social: SocialOutput | null;
  quotes: { extracted: ExtractedQuote[]; cardPaths: QuoteCardPaths[] } | null;
}

export interface EpisodeInput {
  slug: string;
  title: string;
  episodeNumber: number;
  guest?: string;
  guestCredential?: string;
  description: string;
  publishDate: string;
  duration: string;
  youtubeId?: string;
  pillar: string;
  type: string;
  keywords: string[];
  seoDescription: string;
  transcript: string;
}
```

- [ ] **Step 3: Add npm scripts to package.json**

Add to the `"scripts"` section in `package.json`:

```json
"repurpose:episode": "tsx scripts/repurpose-episode.ts --episode",
"repurpose:latest": "tsx scripts/repurpose-episode.ts --latest"
```

- [ ] **Step 4: Verify dependencies installed correctly**

```bash
node -e "require('sharp'); require('satori'); require('@resvg/resvg-js'); console.log('All deps OK')"
```

Expected: `All deps OK`

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json scripts/lib/repurpose/types.ts
git commit -m "feat(repurpose): install dependencies and create shared types"
```

---

## Task 2: Repurpose State Management

**Files:**
- Create: `scripts/lib/repurpose/repurpose-state.ts`

Mirrors the pattern in `scripts/lib/sync-state.ts` exactly.

- [ ] **Step 1: Create repurpose-state.ts**

Create `scripts/lib/repurpose/repurpose-state.ts`:

```typescript
import fs from "fs";
import path from "path";
import { type RepurposeState } from "./types.js";

const STATE_FILE = path.join(process.cwd(), "scripts/repurpose-state.json");

const DEFAULT_STATE: RepurposeState = {
  lastRepurposeDate: "",
  processedEpisodeSlugs: [],
};

export function loadRepurposeState(): RepurposeState {
  if (!fs.existsSync(STATE_FILE)) {
    return { ...DEFAULT_STATE };
  }

  try {
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveRepurposeState(state: RepurposeState): void {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsx -e "import { loadRepurposeState } from './scripts/lib/repurpose/repurpose-state.js'; const s = loadRepurposeState(); console.log('State:', JSON.stringify(s))"
```

Expected: `State: {"lastRepurposeDate":"","processedEpisodeSlugs":[]}`

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/repurpose/repurpose-state.ts
git commit -m "feat(repurpose): add state management for tracking processed episodes"
```

---

## Task 3: Prompt Templates

**Files:**
- Create: `scripts/lib/repurpose/prompts.ts`

All Claude prompt templates centralized in one file. Each function returns `{ system, user }` for a Claude API call.

- [ ] **Step 1: Create prompts.ts**

Create `scripts/lib/repurpose/prompts.ts`:

```typescript
import { type EpisodeInput } from "./types.js";

interface PromptPair {
  system: string;
  user: string;
}

interface RelatedEpisode {
  slug: string;
  title: string;
  episodeNumber: number;
}

const VOICE_SYSTEM = `You are a content writer for Roadman Cycling, a cycling media brand. Write in Anthony Walsh's voice: direct, practical, no fluff. Aimed at amateur cyclists who want to get faster. Not academic, not corporate. Warm but knowledgeable — like advice from a cycling mate who happens to be an expert. Never use phrases like "in this episode" or "dive into" or "join us as". Never use corporate buzzwords. Be specific and actionable.`;

export function blogPrompt(
  episode: EpisodeInput,
  relatedEpisodes: RelatedEpisode[]
): PromptPair {
  const relatedLinks = relatedEpisodes
    .map(
      (ep) =>
        `- [Episode ${ep.episodeNumber}: ${ep.title}](/podcast/${ep.slug})`
    )
    .join("\n");

  return {
    system: VOICE_SYSTEM,
    user: `Write a 1500-2000 word SEO blog post based on this podcast episode transcript.

Episode: "${episode.title}" (Episode ${episode.episodeNumber})
${episode.guest ? `Guest: ${episode.guest}${episode.guestCredential ? ` — ${episode.guestCredential}` : ""}` : "Solo/co-hosted episode"}
Pillar: ${episode.pillar}
Keywords to target naturally: ${episode.keywords.join(", ")}

Related episodes you can link to internally:
${relatedLinks || "None available"}

TRANSCRIPT:
${episode.transcript}

FORMAT REQUIREMENTS:
- Compelling opening paragraph that hooks the reader (no "in this episode" framing)
- 4-6 sections with H2 headers (## Header). Headers should be SEO-friendly and specific
- Each section should have actionable insights, not vague summaries
- Include a "Key Takeaways" section near the end with 4-6 bullet points
- End with a short conclusion and CTA to listen to the full episode
- Weave in internal links to the related episodes where contextually relevant, using the exact markdown format provided
- Write for Google — use target keywords naturally in headers and body text

Also generate these metadata fields and include them at the very top of your response as a JSON block:
\`\`\`json
{
  "seoTitle": "An SEO-optimized title (different from episode title, <60 chars)",
  "seoDescription": "Meta description (<155 chars)",
  "excerpt": "2-3 sentence summary for listing cards",
  "additionalKeywords": ["any", "new", "keywords", "you", "identify"]
}
\`\`\`

Then write the blog post body below the JSON block.`,
  };
}

export function socialPrompt(episode: EpisodeInput): PromptPair {
  return {
    system: VOICE_SYSTEM,
    user: `Generate social media content for all 4 platforms based on this podcast episode.

Episode: "${episode.title}" (Episode ${episode.episodeNumber})
${episode.guest ? `Guest: ${episode.guest}${episode.guestCredential ? ` — ${episode.guestCredential}` : ""}` : "Solo/co-hosted episode"}
Episode URL: /podcast/${episode.slug}

TRANSCRIPT:
${episode.transcript}

Respond with ONLY a JSON object in this exact format (no markdown, no code blocks):
{
  "twitter": {
    "tweets": [
      {"text": "Hook tweet — bold claim or surprising insight from the episode", "index": 1},
      {"text": "Key insight #1...", "index": 2},
      {"text": "Key insight #2...", "index": 3},
      {"text": "Key insight #3...", "index": 4},
      {"text": "Key insight #4...", "index": 5},
      {"text": "Actionable takeaway...", "index": 6},
      {"text": "Full episode: https://roadmancycling.com/podcast/${episode.slug} 🎙️", "index": 7}
    ]
  },
  "instagram": {
    "caption": "Multi-line caption with\\n\\nline breaks for readability. Include a hook, 3-4 key insights, and a CTA to listen. Episode ${episode.episodeNumber} out now.",
    "hashtags": ["#cycling", "#roadmancycling", "#cyclingpodcast", "...15-20 relevant hashtags"]
  },
  "linkedin": {
    "post": "Professional-angle post, 3-4 paragraphs.\\n\\nMention the guest by name and credential if applicable.\\n\\nNo hashtags. End with a link to the episode."
  },
  "facebook": {
    "post": "500-800 word storytelling post in first person (Anthony's voice). Pick the single most compelling insight from the episode and build a personal, conversational post around it. Should feel like Anthony writing to his cycling community, not a brand posting content. Include personal anecdotes or reflections where natural.",
    "angle": "Brief 1-sentence description of the angle chosen"
  }
}

RULES:
- Each tweet must be under 280 characters
- Instagram caption should use line breaks (\\n) for readability
- LinkedIn should be professional but accessible — not corporate
- Facebook should be personal, conversational, storytelling. First person. 500-800 words.
- All content should be specific to THIS episode — no generic cycling advice`,
  };
}

export function quoteExtractionPrompt(
  transcript: string,
  title: string,
  guest?: string
): PromptPair {
  return {
    system:
      "You extract quotable moments from podcast transcripts. Return only JSON.",
    user: `Extract 3-5 of the most quotable, shareable moments from this podcast transcript.

Episode: "${title}"
${guest ? `Guest: ${guest}` : "Solo/co-hosted episode"}

TRANSCRIPT:
${transcript}

For each quote, pick moments that are:
- Surprising, counterintuitive, or memorable
- Specific and actionable (not vague platitudes)
- Self-contained (make sense without context)
- Short enough to fit on a quote card (1-3 sentences max)

Respond with ONLY a JSON array (no markdown, no code blocks):
[
  {"text": "The exact or near-exact quote", "speaker": "Speaker Name", "context": "Brief context (e.g., 'on training in zone 2')"},
  ...
]`,
  };
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsx -e "import { blogPrompt, socialPrompt, quoteExtractionPrompt } from './scripts/lib/repurpose/prompts.js'; console.log('All prompt functions exported OK')"
```

Expected: `All prompt functions exported OK`

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/repurpose/prompts.ts
git commit -m "feat(repurpose): add centralized Claude prompt templates"
```

---

## Task 4: Blog Post Generator

**Files:**
- Create: `scripts/lib/repurpose/blog-generator.ts`

Uses Claude Sonnet to generate a full SEO blog post from the transcript. Outputs a complete MDX string with frontmatter matching the `BlogFrontmatter` interface in `src/lib/blog.ts`.

- [ ] **Step 1: Create blog-generator.ts**

Create `scripts/lib/repurpose/blog-generator.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import matter from "gray-matter";
import fs from "fs";
import path from "path";
import { type EpisodeInput, type BlogOutput } from "./types.js";
import { blogPrompt } from "./prompts.js";
import { aiDelay } from "../ai-extractor.js";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

interface RelatedEpisode {
  slug: string;
  title: string;
  episodeNumber: number;
}

/**
 * Load related episodes from the podcast content directory.
 * Simplified version of getRelatedEpisodes from src/lib/podcast.ts
 * that works in the scripts context (no @/ alias).
 */
function findRelatedEpisodes(
  currentSlug: string,
  pillar: string,
  keywords: string[],
  limit: number = 5
): RelatedEpisode[] {
  const podcastDir = path.join(process.cwd(), "content/podcast");
  if (!fs.existsSync(podcastDir)) return [];

  const files = fs.readdirSync(podcastDir).filter((f) => f.endsWith(".mdx"));
  const inputKeywords = keywords.map((k) => k.toLowerCase());

  const scored: { ep: RelatedEpisode; score: number }[] = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    if (slug === currentSlug) continue;

    const raw = fs.readFileSync(path.join(podcastDir, file), "utf-8");
    const { data } = matter(raw);

    let score = 0;
    if (data.pillar === pillar) score += 10;

    const epKeywords = ((data.keywords as string[]) || []).map((k) =>
      k.toLowerCase()
    );
    for (const kw of inputKeywords) {
      if (epKeywords.includes(kw)) score += 3;
    }

    if (score > 0) {
      scored.push({
        ep: {
          slug,
          title: data.title as string,
          episodeNumber: data.episodeNumber as number,
        },
        score,
      });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.ep);
}

/**
 * Sanitize text for MDX compilation.
 * Reuses the same sanitization logic from scripts/lib/mdx-generator.ts.
 */
function sanitizeMdx(text: string): string {
  return text
    .replace(/[\u2060\u200B\uFEFF]/g, "")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/(https?:\/\/[^\s)]+)/g, "[$1]($1)")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(?!\/?\w)/g, "\\<")
    .replace(/(?<!\w)>/g, "\\>")
    .trim();
}

export async function generateBlogPost(
  episode: EpisodeInput
): Promise<BlogOutput | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("  ⚠ ANTHROPIC_API_KEY not set, skipping blog generation");
    return null;
  }

  // Find related episodes for internal linking
  const relatedEpisodes = findRelatedEpisodes(
    episode.slug,
    episode.pillar,
    episode.keywords
  );

  const { system, user } = blogPrompt(episode, relatedEpisodes);

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

    // Parse the metadata JSON block from the response
    const jsonMatch = text.match(/```json\s*\n([\s\S]*?)\n```/);
    let metadata = {
      seoTitle: episode.title,
      seoDescription: episode.description.slice(0, 155),
      excerpt: episode.description,
      additionalKeywords: [] as string[],
    };

    if (jsonMatch) {
      try {
        metadata = { ...metadata, ...JSON.parse(jsonMatch[1]) };
      } catch {
        console.warn("  ⚠ Could not parse blog metadata JSON, using defaults");
      }
    }

    // Extract the blog body (everything after the JSON block)
    let blogBody = jsonMatch
      ? text.slice(text.indexOf("```", jsonMatch.index! + 3) + 3).trim()
      : text.trim();

    // Remove any leading ``` if present
    blogBody = blogBody.replace(/^```\s*\n?/, "").trim();

    // Sanitize for MDX
    blogBody = sanitizeMdx(blogBody);

    // Build frontmatter matching BlogFrontmatter from src/lib/blog.ts
    const allKeywords = [
      ...new Set([...episode.keywords, ...metadata.additionalKeywords]),
    ];

    const blogSlug = `podcast-ep-${episode.episodeNumber}-${episode.slug
      .replace(/^ep-\d+-/, "")
      .slice(0, 50)}`;

    const frontmatter: Record<string, unknown> = {
      title: metadata.seoTitle,
      seoTitle: metadata.seoTitle,
      seoDescription: metadata.seoDescription,
      excerpt: metadata.excerpt,
      pillar: episode.pillar,
      author: "Anthony Walsh",
      publishDate: new Date().toISOString().split("T")[0],
      keywords: allKeywords.slice(0, 10),
      relatedEpisodes: relatedEpisodes.map((ep) => ep.slug),
      sourceEpisode: episode.slug,
    };

    const mdxContent = matter.stringify(blogBody + "\n", frontmatter);

    return { mdxContent, slug: blogSlug };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`  ❌ Blog generation failed: ${msg}`);
    return null;
  }
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsx -e "import { generateBlogPost } from './scripts/lib/repurpose/blog-generator.js'; console.log('blog-generator compiled OK')"
```

Expected: `blog-generator compiled OK`

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/repurpose/blog-generator.ts
git commit -m "feat(repurpose): add blog post generator (Claude Sonnet)"
```

---

## Task 5: Social Media Generator

**Files:**
- Create: `scripts/lib/repurpose/social-generator.ts`

Single Claude Sonnet call generates all 4 platform posts. Returns structured JSON matching the social output types.

- [ ] **Step 1: Create social-generator.ts**

Create `scripts/lib/repurpose/social-generator.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import {
  type EpisodeInput,
  type SocialOutput,
  type TwitterThread,
  type InstagramPost,
  type LinkedInPost,
  type FacebookPost,
} from "./types.js";
import { socialPrompt } from "./prompts.js";
import { aiDelay } from "../ai-extractor.js";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

function validateTwitterThread(data: unknown): data is TwitterThread {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.tweets)) return false;
  return d.tweets.every(
    (t: unknown) =>
      typeof t === "object" &&
      t !== null &&
      typeof (t as Record<string, unknown>).text === "string" &&
      typeof (t as Record<string, unknown>).index === "number"
  );
}

function validateSocialResponse(data: unknown): data is {
  twitter: TwitterThread;
  instagram: { caption: string; hashtags: string[] };
  linkedin: { post: string };
  facebook: { post: string; angle: string };
} {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    validateTwitterThread(d.twitter) &&
    typeof (d.instagram as Record<string, unknown>)?.caption === "string" &&
    Array.isArray((d.instagram as Record<string, unknown>)?.hashtags) &&
    typeof (d.linkedin as Record<string, unknown>)?.post === "string" &&
    typeof (d.facebook as Record<string, unknown>)?.post === "string" &&
    typeof (d.facebook as Record<string, unknown>)?.angle === "string"
  );
}

export async function generateSocialPosts(
  episode: EpisodeInput
): Promise<SocialOutput | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("  ⚠ ANTHROPIC_API_KEY not set, skipping social generation");
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

    // Parse JSON — may be wrapped in ```json blocks or raw
    let jsonStr = text;
    const codeBlockMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    } else {
      const rawJsonMatch = text.match(/\{[\s\S]*\}/);
      if (rawJsonMatch) {
        jsonStr = rawJsonMatch[0];
      }
    }

    const parsed = JSON.parse(jsonStr);

    if (!validateSocialResponse(parsed)) {
      console.warn("  ⚠ Social response failed validation");
      return null;
    }

    const now = new Date().toISOString();

    return {
      twitter: {
        tweets: parsed.twitter.tweets,
        episodeSlug: episode.slug,
        generatedAt: now,
      },
      instagram: {
        caption: parsed.instagram.caption,
        hashtags: parsed.instagram.hashtags,
        episodeSlug: episode.slug,
        generatedAt: now,
      },
      linkedin: {
        post: parsed.linkedin.post,
        episodeSlug: episode.slug,
        generatedAt: now,
      },
      facebook: {
        post: parsed.facebook.post,
        angle: parsed.facebook.angle,
        episodeSlug: episode.slug,
        generatedAt: now,
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`  ❌ Social generation failed: ${msg}`);
    return null;
  }
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsx -e "import { generateSocialPosts } from './scripts/lib/repurpose/social-generator.js'; console.log('social-generator compiled OK')"
```

Expected: `social-generator compiled OK`

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/repurpose/social-generator.ts
git commit -m "feat(repurpose): add social media post generator (4 platforms)"
```

---

## Task 6: Quote Extractor

**Files:**
- Create: `scripts/lib/repurpose/quote-extractor.ts`

Uses Claude Haiku (cheaper) to extract 3-5 quotable moments from the transcript.

- [ ] **Step 1: Create quote-extractor.ts**

Create `scripts/lib/repurpose/quote-extractor.ts`:

```typescript
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
    console.warn("  ⚠ ANTHROPIC_API_KEY not set, skipping quote extraction");
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

    // Parse JSON array — may be wrapped in code blocks or raw
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
      console.warn("  ⚠ Quote extraction did not return an array");
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
    console.error(`  ❌ Quote extraction failed: ${msg}`);
    return [];
  }
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsx -e "import { extractQuotes } from './scripts/lib/repurpose/quote-extractor.js'; console.log('quote-extractor compiled OK')"
```

Expected: `quote-extractor compiled OK`

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/repurpose/quote-extractor.ts
git commit -m "feat(repurpose): add quote extractor (Claude Haiku)"
```

---

## Task 7: Guest Image Fetcher

**Files:**
- Create: `scripts/lib/repurpose/guest-image-fetcher.ts`

Fetches a guest headshot via priority: local file → Google Custom Search → YouTube thumbnail → null.

- [ ] **Step 1: Create guest-image-fetcher.ts**

Create `scripts/lib/repurpose/guest-image-fetcher.ts`:

```typescript
import fs from "fs";
import path from "path";
import sharp from "sharp";

const GUESTS_DIR = path.join(process.cwd(), "content/guests");

/**
 * Convert a guest name to a slug for file matching.
 * "Lael Wilcox" → "lael-wilcox"
 */
function guestSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Fetch an image from a URL and return the buffer.
 */
async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

/**
 * Search Google Custom Search for a guest image.
 * Requires GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID env vars.
 */
async function searchGoogleImage(guestName: string): Promise<Buffer | null> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cseId) {
    return null;
  }

  try {
    const query = encodeURIComponent(`"${guestName}" cycling portrait`);
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${query}&searchType=image&imgSize=large&num=3`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = (await response.json()) as {
      items?: { link: string; image?: { width: number; height: number } }[];
    };

    if (!data.items || data.items.length === 0) return null;

    // Try each result until one succeeds
    for (const item of data.items) {
      const imageBuffer = await fetchImageBuffer(item.link);
      if (imageBuffer) return imageBuffer;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch a YouTube video thumbnail.
 */
async function fetchYouTubeThumbnail(
  youtubeId: string
): Promise<Buffer | null> {
  // Try maxresdefault first, fall back to hqdefault
  for (const quality of ["maxresdefault", "hqdefault"]) {
    const url = `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`;
    const buffer = await fetchImageBuffer(url);
    if (buffer) return buffer;
  }
  return null;
}

/**
 * Process a raw image buffer: resize and center-crop to square.
 */
async function processImage(
  buffer: Buffer,
  size: number = 1080
): Promise<Buffer> {
  return sharp(buffer)
    .resize(size, size, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({ quality: 90 })
    .toBuffer();
}

/**
 * Fetch a guest image with fallback chain:
 * 1. Local file in content/guests/{slug}.jpg
 * 2. Google Custom Search API
 * 3. YouTube episode thumbnail
 * 4. null
 *
 * Caches Google/YouTube results to content/guests/ for future runs.
 */
export async function fetchGuestImage(
  guestName: string | undefined,
  youtubeId: string | undefined
): Promise<Buffer | null> {
  // Priority 1: Local file
  if (guestName) {
    const slug = guestSlug(guestName);
    const localPath = path.join(GUESTS_DIR, `${slug}.jpg`);
    if (fs.existsSync(localPath)) {
      const raw = fs.readFileSync(localPath);
      return processImage(raw);
    }
  }

  // Priority 2: Google Custom Search
  if (guestName) {
    console.log(`   🔍 Searching for image of ${guestName}...`);
    const googleImage = await searchGoogleImage(guestName);
    if (googleImage) {
      const processed = await processImage(googleImage);
      // Cache for future runs
      if (!fs.existsSync(GUESTS_DIR)) {
        fs.mkdirSync(GUESTS_DIR, { recursive: true });
      }
      const slug = guestSlug(guestName);
      fs.writeFileSync(path.join(GUESTS_DIR, `${slug}.jpg`), processed);
      console.log(`   ✓ Found and cached image for ${guestName}`);
      return processed;
    }
  }

  // Priority 3: YouTube thumbnail
  if (youtubeId) {
    const thumbnail = await fetchYouTubeThumbnail(youtubeId);
    if (thumbnail) {
      return processImage(thumbnail);
    }
  }

  // Priority 4: No image available
  return null;
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsx -e "import { fetchGuestImage } from './scripts/lib/repurpose/guest-image-fetcher.js'; console.log('guest-image-fetcher compiled OK')"
```

Expected: `guest-image-fetcher compiled OK`

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/repurpose/guest-image-fetcher.ts
git commit -m "feat(repurpose): add guest image fetcher with Google CSE + YouTube fallback"
```

---

## Task 8: Quote Card Renderer

**Files:**
- Create: `scripts/lib/repurpose/quote-card-renderer.ts`

Renders branded quote card images using satori (JSX → SVG) + @resvg/resvg-js (SVG → PNG). Two sizes: 1080x1080 square (Instagram) and 1200x675 landscape (Twitter).

- [ ] **Step 1: Create quote-card-renderer.ts**

Create `scripts/lib/repurpose/quote-card-renderer.ts`:

```typescript
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { type ExtractedQuote } from "./types.js";

/**
 * Load a font file for satori. Uses Work Sans (the site's body font).
 * Falls back to a system font if not available locally.
 */
async function loadFont(): Promise<ArrayBuffer> {
  // Try to load Work Sans from the project or system
  const fontPaths = [
    path.join(process.cwd(), "public/fonts/WorkSans-Regular.ttf"),
    path.join(process.cwd(), "public/fonts/WorkSans-Bold.ttf"),
  ];

  for (const fontPath of fontPaths) {
    if (fs.existsSync(fontPath)) {
      const buffer = fs.readFileSync(fontPath);
      return buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
    }
  }

  // Fetch Work Sans from Google Fonts as fallback
  const response = await fetch(
    "https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;700&display=swap"
  );
  const css = await response.text();
  const fontUrlMatch = css.match(/url\((https:\/\/[^)]+\.woff2)\)/);
  if (fontUrlMatch) {
    const fontResponse = await fetch(fontUrlMatch[1]);
    return fontResponse.arrayBuffer();
  }

  throw new Error("Could not load Work Sans font");
}

interface CardDimensions {
  width: number;
  height: number;
  quoteFontSize: number;
  speakerFontSize: number;
  contextFontSize: number;
  padding: number;
}

const SQUARE: CardDimensions = {
  width: 1080,
  height: 1080,
  quoteFontSize: 36,
  speakerFontSize: 24,
  contextFontSize: 18,
  padding: 80,
};

const LANDSCAPE: CardDimensions = {
  width: 1200,
  height: 675,
  quoteFontSize: 32,
  speakerFontSize: 22,
  contextFontSize: 16,
  padding: 60,
};

/**
 * Build a satori-compatible JSX element for a quote card.
 * Satori uses React-like JSX syntax but rendered as objects.
 */
function buildCardElement(
  quote: ExtractedQuote,
  episodeNumber: number,
  dims: CardDimensions,
  hasImage: boolean
): Record<string, unknown> {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: dims.width,
        height: dims.height,
        backgroundColor: "#252526",
        padding: dims.padding,
        position: "relative",
      },
      children: [
        // Quote text
        {
          type: "div",
          props: {
            style: {
              color: "white",
              fontSize: dims.quoteFontSize,
              fontWeight: 400,
              textAlign: "center",
              lineHeight: 1.5,
              maxWidth: dims.width - dims.padding * 2,
            },
            children: `"${quote.text}"`,
          },
        },
        // Speaker name
        {
          type: "div",
          props: {
            style: {
              color: "#F16363",
              fontSize: dims.speakerFontSize,
              fontWeight: 700,
              marginTop: 30,
              textAlign: "center",
            },
            children: `— ${quote.speaker}`,
          },
        },
        // Context
        {
          type: "div",
          props: {
            style: {
              color: "#AAAAAA",
              fontSize: dims.contextFontSize,
              marginTop: 8,
              textAlign: "center",
            },
            children: quote.context,
          },
        },
        // Episode badge (top-left)
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 20,
              left: 20,
              backgroundColor: "#F16363",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              padding: "6px 12px",
              borderRadius: 6,
            },
            children: `EP ${episodeNumber}`,
          },
        },
        // Branding (bottom-right)
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: 20,
              right: 20,
              color: "#666666",
              fontSize: 14,
              fontWeight: 400,
            },
            children: "ROADMAN CYCLING",
          },
        },
      ],
    },
  };
}

/**
 * Render a quote card element to SVG using satori, then to PNG via resvg.
 */
async function renderCard(
  element: Record<string, unknown>,
  width: number,
  height: number,
  fontData: ArrayBuffer,
  backgroundImage: Buffer | null
): Promise<Buffer> {
  const svg = await satori(element as React.ReactNode, {
    width,
    height,
    fonts: [
      {
        name: "Work Sans",
        data: fontData,
        weight: 400,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
  });
  let pngBuffer = Buffer.from(resvg.render().asPng());

  // If we have a background image, composite the text overlay on top
  if (backgroundImage) {
    // Resize background to card dimensions
    const bg = await sharp(backgroundImage)
      .resize(width, height, { fit: "cover", position: "centre" })
      .composite([
        // Dark gradient overlay for text readability
        {
          input: Buffer.from(
            `<svg width="${width}" height="${height}">
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="black" stop-opacity="0.3"/>
                  <stop offset="50%" stop-color="black" stop-opacity="0.6"/>
                  <stop offset="100%" stop-color="black" stop-opacity="0.8"/>
                </linearGradient>
              </defs>
              <rect width="${width}" height="${height}" fill="url(#grad)"/>
            </svg>`
          ),
          top: 0,
          left: 0,
        },
        // Coral tint at 10% opacity
        {
          input: Buffer.from(
            `<svg width="${width}" height="${height}">
              <rect width="${width}" height="${height}" fill="#F16363" opacity="0.1"/>
            </svg>`
          ),
          top: 0,
          left: 0,
        },
        // The text overlay (from satori render)
        {
          input: pngBuffer,
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    return bg;
  }

  return pngBuffer;
}

/**
 * Render quote cards for all extracted quotes.
 * Produces both square (1080x1080) and landscape (1200x675) versions.
 */
export async function renderQuoteCards(
  quotes: ExtractedQuote[],
  episodeNumber: number,
  guestImage: Buffer | null,
  outputDir: string
): Promise<{ squarePath: string; landscapePath: string }[]> {
  // Ensure output directory exists
  const quotesDir = path.join(outputDir, "quotes");
  if (!fs.existsSync(quotesDir)) {
    fs.mkdirSync(quotesDir, { recursive: true });
  }

  const fontData = await loadFont();
  const results: { squarePath: string; landscapePath: string }[] = [];

  for (let i = 0; i < quotes.length; i++) {
    const quote = quotes[i];
    const num = i + 1;

    // Build card elements for both sizes
    const squareElement = buildCardElement(
      quote,
      episodeNumber,
      SQUARE,
      !!guestImage
    );
    const landscapeElement = buildCardElement(
      quote,
      episodeNumber,
      LANDSCAPE,
      !!guestImage
    );

    // Render both sizes
    const squarePng = await renderCard(
      squareElement,
      SQUARE.width,
      SQUARE.height,
      fontData,
      guestImage
    );
    const landscapePng = await renderCard(
      landscapeElement,
      LANDSCAPE.width,
      LANDSCAPE.height,
      fontData,
      guestImage
    );

    // Write files
    const squarePath = path.join(quotesDir, `quote-${num}-square.png`);
    const landscapePath = path.join(quotesDir, `quote-${num}-landscape.png`);

    fs.writeFileSync(squarePath, squarePng);
    fs.writeFileSync(landscapePath, landscapePng);

    results.push({ squarePath, landscapePath });
  }

  return results;
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsx -e "import { renderQuoteCards } from './scripts/lib/repurpose/quote-card-renderer.js'; console.log('quote-card-renderer compiled OK')"
```

Expected: `quote-card-renderer compiled OK`

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/repurpose/quote-card-renderer.ts
git commit -m "feat(repurpose): add quote card renderer (satori + sharp)"
```

---

## Task 9: Content Writer

**Files:**
- Create: `scripts/lib/repurpose/content-writer.ts`

Writes all repurposed content to `content/repurposed/ep-{number}-{slug}/`. Supports dry-run mode and atomic writes.

- [ ] **Step 1: Create content-writer.ts**

Create `scripts/lib/repurpose/content-writer.ts`:

```typescript
import fs from "fs";
import path from "path";
import {
  type BlogOutput,
  type SocialOutput,
  type RepurposeResult,
} from "./types.js";

const REPURPOSED_DIR = path.join(process.cwd(), "content/repurposed");

/**
 * Write a file atomically: write to .tmp then rename.
 * Matches the pattern from scripts/lib/mdx-generator.ts.
 */
function writeFileAtomic(filePath: string, content: string | Buffer): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tmpPath = filePath + ".tmp";
  fs.writeFileSync(tmpPath, content);
  fs.renameSync(tmpPath, filePath);
}

/**
 * Get the output directory path for an episode.
 */
export function getOutputDir(
  episodeNumber: number,
  slug: string
): string {
  // Strip the ep-{number}- prefix from slug if present to avoid duplication
  const cleanSlug = slug.replace(/^ep-\d+-/, "");
  return path.join(REPURPOSED_DIR, `ep-${episodeNumber}-${cleanSlug}`);
}

/**
 * Check if repurposed content already exists for an episode.
 */
export function outputExists(episodeNumber: number, slug: string): boolean {
  return fs.existsSync(getOutputDir(episodeNumber, slug));
}

/**
 * Write all repurposed content to disk.
 * In dry-run mode, logs what would be written without creating files.
 */
export function writeRepurposedContent(
  episodeNumber: number,
  slug: string,
  result: RepurposeResult,
  dryRun: boolean = false
): string[] {
  const outputDir = getOutputDir(episodeNumber, slug);
  const writtenFiles: string[] = [];

  if (dryRun) {
    console.log(`\n   📂 Would write to: ${path.relative(process.cwd(), outputDir)}/`);

    if (result.blog) {
      console.log("      blog-post.mdx");
      writtenFiles.push("blog-post.mdx");
    }
    if (result.social) {
      console.log("      twitter-thread.json");
      console.log("      instagram.json");
      console.log("      linkedin.json");
      console.log("      facebook.json");
      writtenFiles.push(
        "twitter-thread.json",
        "instagram.json",
        "linkedin.json",
        "facebook.json"
      );
    }
    if (result.quotes && result.quotes.cardPaths.length > 0) {
      for (let i = 0; i < result.quotes.cardPaths.length; i++) {
        console.log(`      quotes/quote-${i + 1}-square.png`);
        console.log(`      quotes/quote-${i + 1}-landscape.png`);
      }
      writtenFiles.push(
        ...result.quotes.cardPaths.flatMap((_, i) => [
          `quotes/quote-${i + 1}-square.png`,
          `quotes/quote-${i + 1}-landscape.png`,
        ])
      );
    }

    return writtenFiles;
  }

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write blog post
  if (result.blog) {
    const blogPath = path.join(outputDir, "blog-post.mdx");
    writeFileAtomic(blogPath, result.blog.mdxContent);
    writtenFiles.push(blogPath);
  }

  // Write social media files
  if (result.social) {
    const twitterPath = path.join(outputDir, "twitter-thread.json");
    writeFileAtomic(
      twitterPath,
      JSON.stringify(result.social.twitter, null, 2)
    );
    writtenFiles.push(twitterPath);

    const instagramPath = path.join(outputDir, "instagram.json");
    writeFileAtomic(
      instagramPath,
      JSON.stringify(result.social.instagram, null, 2)
    );
    writtenFiles.push(instagramPath);

    const linkedinPath = path.join(outputDir, "linkedin.json");
    writeFileAtomic(
      linkedinPath,
      JSON.stringify(result.social.linkedin, null, 2)
    );
    writtenFiles.push(linkedinPath);

    const facebookPath = path.join(outputDir, "facebook.json");
    writeFileAtomic(
      facebookPath,
      JSON.stringify(result.social.facebook, null, 2)
    );
    writtenFiles.push(facebookPath);
  }

  // Quote card PNGs are already written by the renderer directly
  // Just track them in the results
  if (result.quotes) {
    for (const card of result.quotes.cardPaths) {
      writtenFiles.push(card.squarePath);
      writtenFiles.push(card.landscapePath);
    }
  }

  return writtenFiles;
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsx -e "import { getOutputDir, outputExists, writeRepurposedContent } from './scripts/lib/repurpose/content-writer.js'; console.log('Output dir:', getOutputDir(42, 'ep-42-test-episode')); console.log('content-writer compiled OK')"
```

Expected output includes `ep-42-test-episode` path and `content-writer compiled OK`

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/repurpose/content-writer.ts
git commit -m "feat(repurpose): add content writer with atomic writes and dry-run support"
```

---

## Task 10: CLI Orchestration Script

**Files:**
- Create: `scripts/repurpose-episode.ts`

The main entry point. Parses CLI args, loads the target episode, runs generators in sequence, writes output, updates state. Mirrors `sync-youtube.ts` structure exactly.

- [ ] **Step 1: Create repurpose-episode.ts**

Create `scripts/repurpose-episode.ts`:

```typescript
import fs from "fs";
import path from "path";

// Load env files (same pattern as sync-youtube.ts)
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

import matter from "gray-matter";
import { truncateTranscript } from "./lib/transcript.js";
import {
  loadRepurposeState,
  saveRepurposeState,
} from "./lib/repurpose/repurpose-state.js";
import { generateBlogPost } from "./lib/repurpose/blog-generator.js";
import { generateSocialPosts } from "./lib/repurpose/social-generator.js";
import { extractQuotes } from "./lib/repurpose/quote-extractor.js";
import { fetchGuestImage } from "./lib/repurpose/guest-image-fetcher.js";
import { renderQuoteCards } from "./lib/repurpose/quote-card-renderer.js";
import {
  writeRepurposedContent,
  outputExists,
  getOutputDir,
} from "./lib/repurpose/content-writer.js";
import { type EpisodeInput, type RepurposeResult } from "./lib/repurpose/types.js";

// Parse CLI args
const args = process.argv.slice(2);
const episodeSlug = args
  .find((a) => a.startsWith("--episode="))
  ?.split("=")[1];
const latest = args.includes("--latest");
const auto = args.includes("--auto");
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const skipBlog = args.includes("--skip-blog");
const skipSocial = args.includes("--skip-social");
const skipQuotes = args.includes("--skip-quotes");

const PODCAST_DIR = path.join(process.cwd(), "content/podcast");

interface LoadedEpisode {
  slug: string;
  frontmatter: Record<string, unknown>;
  content: string;
}

/**
 * Load a single episode MDX file by slug.
 */
function loadEpisode(slug: string): LoadedEpisode | null {
  const filePath = path.join(PODCAST_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { slug, frontmatter: data, content };
}

/**
 * Find the most recent episode by publishDate.
 */
function findLatestEpisode(): LoadedEpisode | null {
  if (!fs.existsSync(PODCAST_DIR)) return null;

  const files = fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"));
  let latest: LoadedEpisode | null = null;
  let latestDate = "";

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const filePath = path.join(PODCAST_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const pubDate = (data.publishDate as string) || "";

    if (pubDate > latestDate) {
      latestDate = pubDate;
      latest = { slug, frontmatter: data, content };
    }
  }

  return latest;
}

/**
 * Find all unprocessed episodes (for --auto mode).
 */
function findUnprocessedEpisodes(
  processedSlugs: string[]
): LoadedEpisode[] {
  if (!fs.existsSync(PODCAST_DIR)) return [];

  const files = fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"));
  const processed = new Set(processedSlugs);
  const episodes: LoadedEpisode[] = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    if (processed.has(slug)) continue;

    const filePath = path.join(PODCAST_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    // Only process episodes with transcripts
    if (data.transcript) {
      episodes.push({ slug, frontmatter: data, content });
    }
  }

  // Sort by publishDate desc, only return recent (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return episodes
    .filter((ep) => {
      const pubDate = new Date((ep.frontmatter.publishDate as string) || "");
      return pubDate >= sevenDaysAgo;
    })
    .sort((a, b) => {
      const dateA = (a.frontmatter.publishDate as string) || "";
      const dateB = (b.frontmatter.publishDate as string) || "";
      return dateB.localeCompare(dateA);
    });
}

/**
 * Convert a loaded episode to the EpisodeInput format.
 */
function toEpisodeInput(ep: LoadedEpisode): EpisodeInput | null {
  const fm = ep.frontmatter;
  const transcript = fm.transcript as string | undefined;

  if (!transcript) {
    console.warn(`  ⚠ No transcript for ${ep.slug} — skipping`);
    return null;
  }

  return {
    slug: ep.slug,
    title: fm.title as string,
    episodeNumber: fm.episodeNumber as number,
    guest: fm.guest as string | undefined,
    guestCredential: fm.guestCredential as string | undefined,
    description: fm.description as string,
    publishDate: fm.publishDate as string,
    duration: fm.duration as string,
    youtubeId: fm.youtubeId as string | undefined,
    pillar: fm.pillar as string,
    type: fm.type as string,
    keywords: (fm.keywords as string[]) || [],
    seoDescription: fm.seoDescription as string,
    transcript: truncateTranscript(transcript, 15000),
  };
}

/**
 * Process a single episode through the repurpose pipeline.
 */
async function processEpisode(
  ep: LoadedEpisode,
  state: { processedEpisodeSlugs: string[] }
): Promise<boolean> {
  const input = toEpisodeInput(ep);
  if (!input) return false;

  const epNum = input.episodeNumber;

  // Check if already processed (unless --force)
  if (!force && outputExists(epNum, ep.slug)) {
    console.log(`  ⏭ Already repurposed (use --force to regenerate)`);
    return false;
  }

  console.log(`\n   📺 ${input.title}`);
  console.log(`   🔖 ${input.pillar} | ${input.type}${input.guest ? ` | Guest: ${input.guest}` : ""}`);

  const result: RepurposeResult = {
    blog: null,
    social: null,
    quotes: null,
  };

  // Step 1: Blog post
  if (!skipBlog) {
    process.stdout.write("   📝 Blog post... ");
    result.blog = await generateBlogPost(input);
    if (result.blog) {
      console.log("✓");
    } else {
      console.log("⚠ skipped");
    }
  }

  // Step 2: Social media
  if (!skipSocial) {
    process.stdout.write("   📱 Social posts... ");
    result.social = await generateSocialPosts(input);
    if (result.social) {
      console.log(
        `✓ (${result.social.twitter.tweets.length} tweets, FB: ${result.social.facebook.post.length} chars)`
      );
    } else {
      console.log("⚠ skipped");
    }
  }

  // Step 3: Quote cards
  if (!skipQuotes) {
    process.stdout.write("   💬 Quotes... ");
    const quotes = await extractQuotes(
      input.transcript,
      input.title,
      input.guest
    );

    if (quotes.length > 0) {
      console.log(`✓ ${quotes.length} quotes extracted`);

      // Fetch guest image
      process.stdout.write("   🖼  Guest image... ");
      const guestImage = await fetchGuestImage(input.guest, input.youtubeId);
      if (guestImage) {
        console.log("✓");
      } else {
        console.log("⚠ none (using text-only template)");
      }

      // Render quote cards
      if (!dryRun) {
        process.stdout.write("   🎨 Rendering cards... ");
        const outputDir = getOutputDir(epNum, ep.slug);
        const cardPaths = await renderQuoteCards(
          quotes,
          epNum,
          guestImage,
          outputDir
        );
        console.log(`✓ ${cardPaths.length * 2} images`);
        result.quotes = { extracted: quotes, cardPaths };
      } else {
        result.quotes = {
          extracted: quotes,
          cardPaths: quotes.map((_, i) => ({
            squarePath: `quotes/quote-${i + 1}-square.png`,
            landscapePath: `quotes/quote-${i + 1}-landscape.png`,
          })),
        };
      }
    } else {
      console.log("⚠ none found");
    }
  }

  // Write all outputs
  const writtenFiles = writeRepurposedContent(epNum, ep.slug, result, dryRun);

  if (!dryRun) {
    state.processedEpisodeSlugs.unshift(ep.slug);
    console.log(
      `   ✅ ${writtenFiles.length} files written to ${path.relative(process.cwd(), getOutputDir(epNum, ep.slug))}/`
    );
  }

  return true;
}

async function main() {
  console.log("🎙  Roadman Content Repurpose Pipeline");
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Force: ${force}`);
  console.log(
    `   AI: ${process.env.ANTHROPIC_API_KEY ? "ENABLED" : "DISABLED"}`
  );
  console.log(
    `   Generators: ${[!skipBlog && "blog", !skipSocial && "social", !skipQuotes && "quotes"].filter(Boolean).join(", ")}`
  );
  console.log("");

  const state = loadRepurposeState();

  // Resolve target episodes
  let episodes: LoadedEpisode[] = [];

  if (episodeSlug) {
    const ep = loadEpisode(episodeSlug);
    if (!ep) {
      console.error(`❌ Episode not found: ${episodeSlug}`);
      console.error(
        `   Check content/podcast/ for available .mdx files`
      );
      process.exit(1);
    }
    episodes = [ep];
  } else if (latest) {
    const ep = findLatestEpisode();
    if (!ep) {
      console.error("❌ No episodes found in content/podcast/");
      process.exit(1);
    }
    episodes = [ep];
  } else if (auto) {
    episodes = findUnprocessedEpisodes(state.processedEpisodeSlugs);
    if (episodes.length === 0) {
      console.log("✅ No new episodes to repurpose!");
      return;
    }
    console.log(`🆕 Found ${episodes.length} unprocessed episode(s)`);
  } else {
    console.error("❌ Specify --episode=<slug>, --latest, or --auto");
    console.error("   Example: npx tsx scripts/repurpose-episode.ts --episode=ep-308-my-episode");
    process.exit(1);
  }

  let processed = 0;
  let errors = 0;

  for (const ep of episodes) {
    try {
      const success = await processEpisode(ep, state);
      if (success) processed++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`\n   ❌ Error processing ${ep.slug}: ${msg}`);
      errors++;
    }
  }

  // Save state
  state.lastRepurposeDate = new Date().toISOString();
  if (!dryRun) {
    saveRepurposeState(state);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 REPURPOSE COMPLETE");
  console.log(`   Processed: ${processed}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total repurposed: ${state.processedEpisodeSlugs.length}`);
  console.log("=".repeat(50));
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

- [ ] **Step 2: Verify it compiles and shows help**

```bash
npx tsx scripts/repurpose-episode.ts 2>&1 | head -5
```

Expected: Should show the header and then error about needing `--episode`, `--latest`, or `--auto`.

- [ ] **Step 3: Test dry-run with a real episode**

Find an episode with a transcript and test:

```bash
# First, find an episode that has a transcript
npx tsx -e "
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
const dir = 'content/podcast';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
for (const f of files.slice(0, 50)) {
  const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf-8'));
  if (data.transcript) { console.log(f.replace('.mdx', '')); break; }
}
"
```

If an episode with transcript is found, test dry-run:

```bash
npx tsx scripts/repurpose-episode.ts --episode=<found-slug> --dry-run
```

Expected: Should show the pipeline header, episode info, and dry-run output listing files that would be written.

- [ ] **Step 4: Commit**

```bash
git add scripts/repurpose-episode.ts
git commit -m "feat(repurpose): add CLI orchestration script with --episode/--latest/--auto/--dry-run"
```

---

## Task 11: Add npm Scripts and GitHub Action

**Files:**
- Modify: `package.json` (npm scripts were added in Task 1, verify they're correct)
- Create: `.github/workflows/podcast-repurpose.yml`
- Create: `.gitignore` entry for `scripts/repurpose-state.json`

- [ ] **Step 1: Verify npm scripts exist in package.json**

Check that `repurpose:episode` and `repurpose:latest` are in the scripts section. If not, add them:

```json
"repurpose:episode": "tsx scripts/repurpose-episode.ts --episode",
"repurpose:latest": "tsx scripts/repurpose-episode.ts --latest"
```

- [ ] **Step 2: Create the commented-out GitHub Action**

Create `.github/workflows/podcast-repurpose.yml`:

```yaml
# Podcast Content Repurpose Pipeline
# ===================================
# Uncomment this workflow to automate content generation.
# It runs daily, syncs new episodes from YouTube, generates
# blog posts + social content + quote cards, and creates a PR
# for Anthony to review before publishing.
#
# Required secrets:
#   YOUTUBE_API_KEY
#   ANTHROPIC_API_KEY
#   GOOGLE_CSE_API_KEY
#   GOOGLE_CSE_ID
#
# name: Podcast Content Repurpose
#
# on:
#   schedule:
#     - cron: '0 8 * * *'  # Daily at 8am UTC
#   workflow_dispatch: {}
#
# jobs:
#   repurpose:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#
#       - uses: actions/setup-node@v4
#         with:
#           node-version: '22'
#           cache: 'npm'
#
#       - run: npm ci
#
#       - name: Sync new episodes from YouTube
#         run: npm run sync:youtube:full
#         env:
#           YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
#           ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
#
#       - name: Generate repurposed content
#         run: npm run repurpose:latest
#         env:
#           ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
#           GOOGLE_CSE_API_KEY: ${{ secrets.GOOGLE_CSE_API_KEY }}
#           GOOGLE_CSE_ID: ${{ secrets.GOOGLE_CSE_ID }}
#
#       - name: Create PR with generated content
#         uses: peter-evans/create-pull-request@v6
#         with:
#           title: 'content: new podcast repurposed content'
#           body: |
#             Auto-generated content from the latest podcast episode.
#
#             **Please review before merging:**
#             - [ ] Blog post reads well and is factually accurate
#             - [ ] Social posts match Anthony's voice
#             - [ ] Quote cards look good
#             - [ ] No sensitive information leaked
#           branch: repurpose/latest
#           commit-message: 'content: auto-generated repurposed podcast content'
```

- [ ] **Step 3: Add repurpose-state.json to .gitignore**

Check if `.gitignore` exists and add the repurpose state file (it's local state, not meant for version control):

Append to `.gitignore`:

```
# Repurpose pipeline state (local tracking)
scripts/repurpose-state.json
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/podcast-repurpose.yml .gitignore package.json
git commit -m "feat(repurpose): add GitHub Action (commented out) and npm scripts"
```

---

## Task 12: End-to-End Test

**Files:** None (verification only)

- [ ] **Step 1: Find an episode with a transcript for testing**

```bash
npx tsx -e "
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
const dir = 'content/podcast';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
let found = 0;
for (const f of files) {
  const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf-8'));
  if (data.transcript && found < 3) {
    console.log(f.replace('.mdx', ''), '|', (data.transcript as string).split(' ').length, 'words');
    found++;
  }
}
if (found === 0) console.log('No episodes with transcripts found — test with --latest and verify transcript warning');
"
```

- [ ] **Step 2: Run dry-run to verify pipeline without API calls**

```bash
npx tsx scripts/repurpose-episode.ts --latest --dry-run
```

Expected: Shows pipeline header, episode info. If no ANTHROPIC_API_KEY, generators will warn and skip. If API key is set, shows dry-run file listing.

- [ ] **Step 3: Run a real repurpose (if API key is available)**

```bash
npx tsx scripts/repurpose-episode.ts --latest --skip-quotes
```

This runs blog + social generation (skipping quotes to avoid needing Google CSE). Verify:
- `content/repurposed/ep-{number}-{slug}/` directory created
- `blog-post.mdx` has valid frontmatter and body
- `twitter-thread.json`, `instagram.json`, `linkedin.json`, `facebook.json` have valid JSON
- `scripts/repurpose-state.json` updated with the episode slug

- [ ] **Step 4: Verify blog post frontmatter matches BlogFrontmatter schema**

```bash
npx tsx -e "
import fs from 'fs';
import matter from 'gray-matter';
const dirs = fs.readdirSync('content/repurposed').filter(d => d.startsWith('ep-'));
if (dirs.length === 0) { console.log('No repurposed content yet'); process.exit(0); }
const blogPath = 'content/repurposed/' + dirs[0] + '/blog-post.mdx';
if (!fs.existsSync(blogPath)) { console.log('No blog post found'); process.exit(0); }
const { data } = matter(fs.readFileSync(blogPath, 'utf-8'));
const required = ['title', 'seoDescription', 'excerpt', 'pillar', 'author', 'publishDate', 'keywords'];
for (const field of required) {
  console.log(field + ':', data[field] ? '✓' : '✗ MISSING');
}
console.log('sourceEpisode:', data.sourceEpisode || '✗ MISSING');
"
```

Expected: All fields show ✓

- [ ] **Step 5: Commit any generated test content (if applicable)**

If test content was generated, either:
- Delete it: `rm -rf content/repurposed/` and remove from state
- Or commit it as a sample: `git add content/repurposed/ && git commit -m "test: sample repurposed content"`

---

## Summary

| Task | What it builds | Key files |
|------|---------------|-----------|
| 1 | Dependencies + types | `package.json`, `types.ts` |
| 2 | State management | `repurpose-state.ts` |
| 3 | Prompt templates | `prompts.ts` |
| 4 | Blog generator | `blog-generator.ts` |
| 5 | Social generator | `social-generator.ts` |
| 6 | Quote extractor | `quote-extractor.ts` |
| 7 | Guest image fetcher | `guest-image-fetcher.ts` |
| 8 | Quote card renderer | `quote-card-renderer.ts` |
| 9 | Content writer | `content-writer.ts` |
| 10 | CLI orchestration | `repurpose-episode.ts` |
| 11 | GitHub Action + npm scripts | `.github/workflows/`, `package.json` |
| 12 | End-to-end verification | (no new files) |
