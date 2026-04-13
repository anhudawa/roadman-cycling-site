# SEO Content Generation Pipeline — Design Spec

**Date:** 2026-04-13
**Status:** Draft
**Priority order:** Answer capsules → Topic hub pillar content → Podcast companion articles

## Overview

Generate SEO content in Anthony Walsh's voice using existing podcast transcripts as source material. All content generates to `content/drafts/` for editorial review before publishing. Three workstreams, executed sequentially.

## Voice & Tone

Source material: 311 podcast episode transcripts stored in `content/podcast/*.mdx` frontmatter (`transcript` field). The generation prompt will include 2-3 transcript excerpts as voice examples per run, selected from episodes matching the article's pillar/topic. Anthony's voice characteristics to preserve:

- Direct, second-person ("you") address
- Short declarative sentences, often starting with "Here's the thing"
- References real coaching experience and specific athletes/episodes
- Contrarian framing: names the bad advice, then corrects it
- Evidence-based but accessible — cites studies without being academic
- Irish idiom occasionally ("grand", practical humour)

## Workstream 1: Answer Capsules

**Goal:** Add a 40-60 word direct answer to each of the 93 blog posts. These target Google's AI Overview and featured snippet slots.

### Format

New frontmatter field `answerCapsule` on each blog post:

```yaml
answerCapsule: "Zone 2 training is riding at 55-75% of your FTP — a pace where you can hold a conversation. It builds mitochondrial density and fat oxidation, the aerobic base everything else sits on. Most cyclists skip it because it feels too easy. That's exactly why it works."
```

### Rendering

Add an `<AnswerCapsule>` component rendered at the top of every blog post that has the field. Styled as a highlighted box (pillar accent border, slightly elevated background). Also injected into the page's JSON-LD as the article's `description` or as a `speakable` property for voice search.

### Generation Script

`scripts/generate-capsules.ts`

**Input:** For each blog post, read the MDX file's title, excerpt, first 500 words of body content, and any matching podcast transcript (via `relatedEpisodes` or pillar+keyword matching).

**Prompt structure:**
1. System: "You are Anthony Walsh writing a 40-60 word direct answer for a cyclist searching Google."
2. Voice examples: 2 transcript excerpts (200 words each) from same-pillar episodes
3. Article context: title, excerpt, first 500 words
4. Instruction: "Write a single paragraph, 40-60 words. Answer the search intent directly. No hedging, no 'it depends' — give the answer, then one sentence of why."

**Output:** Write updated frontmatter back to the existing MDX file in `content/blog/`. Since these are small additions to existing files, they go directly into the blog directory but with a companion manifest at `content/drafts/capsules-manifest.json` tracking which posts have been generated and their review status:

```json
{
  "generatedAt": "2026-04-13T...",
  "posts": [
    { "slug": "zone-2-training-complete-guide", "status": "draft", "reviewedAt": null },
    ...
  ]
}
```

**CLI:** `npx tsx scripts/generate-capsules.ts [--dry-run] [--slug=zone-2-training-complete-guide] [--pillar=coaching]`

**Cost estimate:** ~93 calls to Claude Haiku, ~$0.50 total.

### AnswerCapsule Component

New file: `src/components/ui/AnswerCapsule.tsx`

```tsx
// Rendered in blog/[slug]/page.tsx when post.answerCapsule exists
// Styled box with pillar-coloured left border, slightly larger text
// Also adds speakable schema markup
```

### Blog Page Changes

In `src/app/(content)/blog/[slug]/page.tsx`:
- Read `answerCapsule` from frontmatter
- Render `<AnswerCapsule>` between the hero and the article body
- Add `speakable` to the Article JSON-LD when capsule exists

## Workstream 2: Topic Hub Pillar Content

**Goal:** Generate 2-3k words of pillar content for each of the 9 topic hubs. Currently hubs are just curated link pages — adding substantive content makes them rank for head terms.

### Storage

New MDX files at `content/drafts/hubs/<topic-slug>.mdx`. After review, content moves into the topic hub rendering pipeline.

### Content Structure Per Hub

Each hub article follows a consistent template:

```markdown
## What Is [Topic]?
(100-150 words — definition, why it matters for cyclists)

## The Roadman Approach to [Topic]
(200-300 words — Anthony's philosophy, what makes this different from generic advice)

## Key Concepts
(3-5 subsections, 200-400 words each — the core knowledge)

## Common Mistakes
(200-300 words — what most cyclists get wrong)

## How to Get Started
(150-200 words — actionable first steps)

## FAQ
(4-6 questions with 50-100 word answers — targets People Also Ask)
```

### Generation Script

`scripts/generate-hub-content.ts`

**Input per hub:**
1. Topic definition from `TOPIC_DEFINITIONS` in `src/lib/topics.ts` (title, description, keywords)
2. Titles + excerpts of all mapped blog posts for context
3. 3-5 transcript excerpts from episodes matching the hub's keyword regex (longest transcripts preferred for richer source material)

**Prompt structure:**
1. System: "You are Anthony Walsh writing a comprehensive topic guide for roadmancycling.com."
2. Voice examples: 3 transcript excerpts (300 words each)
3. Topic context: hub definition, keyword targets, related article titles
4. Instruction: Follow the template structure. 2-3k words. Reference specific episodes and articles by name (these become internal links during editorial review). Include FAQ section.

**Output:** MDX files in `content/drafts/hubs/` with frontmatter:

```yaml
---
topicSlug: ftp-training
title: "FTP Training for Cyclists — The Complete Guide"
generatedAt: "2026-04-13T..."
status: draft
wordCount: 2400
sourceEpisodes:
  - ep-123-title
  - ep-456-title
---
```

**CLI:** `npx tsx scripts/generate-hub-content.ts [--dry-run] [--hub=ftp-training]`

**Cost estimate:** ~9 calls to Claude Sonnet (longer content needs better model), ~$2.00 total.

### Integration Path (Post-Review)

After editorial review, hub content gets rendered on the topic page. This requires:
1. A `getHubContent(slug)` function in `src/lib/topics.ts` that reads the hub MDX
2. MDX rendering section added to `src/app/(content)/topics/[slug]/page.tsx` between the hero and the articles grid
3. FAQ section wired to `FAQPageJsonLd` component (already exists)

## Workstream 3: Podcast Companion Articles

**Goal:** Generate blog-style companion articles for the top 50 podcast episodes. These capture long-tail search traffic from episode topics and create internal linking between podcast and blog.

### Episode Selection

Rank episodes by a composite score:
- Title keyword density against high-value keyword list from the SEO audit
- Episode type weight: `interview` (1.5x), `solo` (1.2x), `sarah-anthony` (1.0x), `panel` (0.8x)
- Transcript length (longer = richer content)
- Recency bias (newer episodes weighted slightly higher)

Script outputs the ranked list for review before generating.

### Storage

`content/drafts/companion/<episode-slug>.mdx`

### Article Structure

```markdown
---
title: "[Derived from episode title — rewritten for search intent]"
seoTitle: "[Keyword-optimised, ≤60 chars]"
seoDescription: "[150-160 chars targeting the primary search query]"
excerpt: "[1-2 sentences for article cards]"
pillar: [inherited from episode]
author: Anthony Walsh
publishDate: [episode publish date]
keywords: [extracted from episode + gap analysis]
relatedEpisodes: [the source episode slug]
sourceEpisode: [episode slug — for tracking]
status: draft
generatedAt: "2026-04-13T..."
---

## [Answer the core question — 100 words]

## Key Takeaways from the Episode
(Bulleted summary — 5-8 points, 20-40 words each)

## [Deep-dive section 1 — 300-500 words]

## [Deep-dive section 2 — 300-500 words]

## [Deep-dive section 3 — 200-400 words]

## What This Means for Your Training
(200-300 words — actionable application)

## FAQ
(3-5 questions from the episode content)
```

### Generation Script

`scripts/generate-companion-articles.ts`

**Input per episode:**
1. Episode frontmatter (title, description, guest, type, pillar, keywords)
2. Full transcript
3. Existing blog post titles (to avoid duplication and enable internal link suggestions)

**Prompt structure:**
1. System: "You are Anthony Walsh turning a podcast episode into a comprehensive blog article."
2. Voice examples: 2 transcript excerpts from other same-pillar episodes
3. Full episode transcript
4. Instruction: Write 1500-2500 words. Extract the key insights from the conversation. Reference the guest by name where applicable. Suggest 3-5 internal links to existing articles. Include FAQ section.

**Output:** MDX files in `content/drafts/companion/` with the frontmatter above.

**CLI:** `npx tsx scripts/generate-companion-articles.ts [--dry-run] [--rank-only] [--episode=slug] [--limit=10]`

**Cost estimate:** ~50 calls to Claude Sonnet, ~$15-20 total.

### Integration Path (Post-Review)

After editorial review:
1. Move file from `content/drafts/companion/` to `content/blog/`
2. Remove `sourceEpisode`, `status`, `generatedAt` fields
3. Add to relevant `TOPIC_POST_MAP` entries in `src/lib/topics.ts`
4. Build picks them up automatically via `getAllPosts()`

## Shared Infrastructure

### Transcript Loading

`scripts/lib/transcript-loader.ts`

- Reads all `content/podcast/*.mdx` files
- Parses frontmatter with `gray-matter`
- Returns `{ slug, title, pillar, keywords, transcript, episodeNumber }[]`
- Filters to episodes that have non-empty `transcript` field
- Caches parsed data for reuse across scripts

### Voice Example Selector

`scripts/lib/voice-selector.ts`

- Given a pillar and optional keywords, returns 2-3 transcript excerpts (200-300 words each) that best match
- Prefers variety: different episodes, different topics within the pillar
- Extracts the most "voice-rich" passages (dialogue, opinion, advice — not introductions or sponsor reads)

### AI Client

`scripts/lib/ai-client.ts`

- Wraps `@anthropic-ai/sdk`
- Configurable model (Haiku for capsules, Sonnet for longer content)
- Rate limiting (10 req/min default)
- Retry with exponential backoff
- Token usage tracking and cost reporting
- Dry-run mode that logs the prompt without calling the API

### Draft Manager

`scripts/lib/draft-manager.ts`

- Writes MDX files to appropriate `content/drafts/` subdirectory
- Maintains manifest files per workstream
- Tracks generation metadata (model, tokens, cost, timestamp)
- `--dry-run` support: logs what would be written

## Directory Structure

```
scripts/
  generate-capsules.ts
  generate-hub-content.ts
  generate-companion-articles.ts
  lib/
    transcript-loader.ts
    voice-selector.ts
    ai-client.ts
    draft-manager.ts

content/
  drafts/
    capsules-manifest.json
    hubs/
      ftp-training.mdx
      cycling-nutrition.mdx
      ...
    companion/
      ep-xxx-episode-title.mdx
      ...
```

## Dependencies

- `@anthropic-ai/sdk` (already installed — used by podcast repurpose pipeline)
- `gray-matter` (already installed)
- `tsx` (already installed)

No new dependencies required.

## Environment Variables

- `ANTHROPIC_API_KEY` — already in `.env.local`

## Review Workflow

1. **Generate** — run the script, content appears in `content/drafts/`
2. **Review** — Anthony reads drafts, edits in VS Code or any text editor
3. **Publish** — move/copy to final location (`content/blog/` or topic hub integration)
4. **Build** — `npm run build` picks up new content automatically

No CMS UI needed. File-based workflow matches the existing content pipeline.

## Success Metrics

- Answer capsules: track featured snippet wins in Google Search Console (target: 10+ within 30 days)
- Topic hubs: monitor ranking for head terms (e.g., "FTP training", "cycling nutrition") — target page 1 within 60 days
- Companion articles: track organic traffic to new articles — target 500+ monthly sessions within 90 days
- Overall: organic traffic growth of 30%+ within 90 days of full content deployment
