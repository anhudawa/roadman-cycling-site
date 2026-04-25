# Podcast Content Repurposing Pipeline — Design Spec

## Overview

An automated CLI pipeline that takes a podcast episode (MDX file with transcript) and generates: a blog post, platform-specific social media posts, and branded quote card images. Built as a scripts-only tool — not part of the Next.js app runtime.

**Goal:** Reduce Anthony's content creation time from hours per episode to a review-and-publish workflow. Generated content targets 80% quality — Anthony tweaks and publishes.

## Architecture

**Approach:** Single orchestration script (`scripts/repurpose-episode.ts`) with modular generator libraries in `scripts/lib/repurpose/`. Mirrors the existing `sync-youtube.ts` pattern.

**AI models:**
- Claude Sonnet — blog posts and social media content (quality matters)
- Claude Haiku — quote extraction (bulk, cheaper)

**New dependencies:**
- `sharp` — image processing (resize, crop, overlay)
- `satori` — JSX → SVG rendering for quote cards
- `@resvg/resvg-js` — SVG → PNG conversion

**New env vars:**
- `GOOGLE_CSE_API_KEY` — Google Custom Search API key (for guest image fetching)
- `GOOGLE_CSE_ID` — Google Custom Search Engine ID

## File Structure

```
scripts/
  repurpose-episode.ts                # CLI entry point
  repurpose-state.json                # Tracks which episodes have been repurposed
  lib/
    repurpose/
      blog-generator.ts               # Transcript → SEO blog post MDX
      social-generator.ts             # Transcript → Twitter/IG/LinkedIn/FB JSON
      quote-extractor.ts              # Transcript → quote text + attribution (Haiku)
      quote-card-renderer.ts          # Quote data + guest image → PNG via satori
      guest-image-fetcher.ts          # Google Custom Search → cropped headshot
      content-writer.ts               # Write all outputs to content/repurposed/
      prompts.ts                      # All Claude prompt templates centralized

content/
  repurposed/
    ep-{number}-{slug}/
      blog-post.mdx                   # Ready-to-publish blog post
      twitter-thread.json             # Array of tweet objects
      instagram.json                  # Caption + hashtags
      linkedin.json                   # Post text
      facebook.json                   # Long-form storytelling post
      quotes/
        quote-{n}-square.png          # 1080x1080 for Instagram
        quote-{n}-landscape.png       # 1200x675 for Twitter
  guests/
    {guest-slug}.jpg                  # Manual guest image overrides

.github/workflows/
  podcast-repurpose.yml               # Commented-out GitHub Action
```

## CLI Interface

### Entry point: `scripts/repurpose-episode.ts`

**Flags:**
- `--episode=<slug>` — Process a specific episode by slug
- `--latest` — Process the most recent episode (by publishDate)
- `--auto` — Detect and process all un-repurposed episodes since last run
- `--dry-run` — Log what would be generated, don't write files
- `--force` — Overwrite existing output directory (default: skip if exists)
- `--skip-blog` — Skip blog post generation
- `--skip-social` — Skip social media generation
- `--skip-quotes` — Skip quote card generation

**npm scripts:**
```json
{
  "repurpose:episode": "npx tsx scripts/repurpose-episode.ts --episode",
  "repurpose:latest": "npx tsx scripts/repurpose-episode.ts --latest"
}
```

### Orchestration flow

1. Parse CLI args
2. Resolve target episode(s):
   - `--episode=<slug>`: load via slug match in `content/podcast/`
   - `--latest`: find most recent by publishDate
   - `--auto`: compare against `repurpose-state.json`, find unprocessed episodes
3. For each episode:
   a. Load episode MDX (frontmatter + body)
   b. Verify transcript exists in frontmatter — abort with error if missing
   c. Check if `content/repurposed/ep-{number}-{slug}/` exists — skip unless `--force`
   d. Run enabled generators in sequence:
      - Blog generation (Claude Sonnet)
      - Social media generation (Claude Sonnet, single call for all 4 platforms)
      - Quote extraction (Claude Haiku) + image fetching + card rendering
   e. Write all outputs via `content-writer.ts`
   f. Update `repurpose-state.json`
4. Print summary: files generated, paths, API token usage

### Idempotence

- `repurpose-state.json` tracks processed episode slugs (same pattern as `sync-state.json`)
- Output directory existence check prevents accidental regeneration
- `--force` flag overrides for intentional regeneration

## Module Specifications

### `prompts.ts` — Prompt Templates

Centralizes all Claude prompt templates. Each prompt is a function that takes episode metadata and returns `{ system: string, user: string }`.

**Voice guidelines baked into system prompts:**
- Anthony's voice: direct, practical, no fluff
- Aimed at amateur cyclists who want to get faster
- Not academic, not corporate
- Warm but knowledgeable — like advice from a cycling mate who happens to be an expert

### `blog-generator.ts` — Blog Post Generation

**Input:** Episode frontmatter + transcript + related episode slugs
**Output:** Complete MDX string with frontmatter

**Process:**
1. Load episode metadata (title, guest, pillar, keywords, description, guestCredential)
2. Get related episodes via existing `getRelatedEpisodes()` for internal linking
3. Call Claude Sonnet:
   - System prompt: Roadman Cycling content writer voice
   - User prompt: transcript (truncated to ~15,000 words) + episode metadata + related episode slugs/titles for internal links
   - Instructions: 1500-2000 word SEO blog post, compelling intro, 4-6 H2 sections, actionable takeaways, conclusion with CTA, internal links as `[Episode {N}: {title}](/podcast/{slug})`
4. Generate frontmatter:
   - `title`: AI-generated SEO title (distinct from episode title)
   - `seoTitle`: Variant or same as title
   - `seoDescription`: 155-char meta description
   - `excerpt`: 2-3 sentence summary for listing cards
   - `pillar`: Inherited from episode
   - `author`: "Anthony Walsh" (default, matching existing blog posts)
   - `publishDate`: Today's date (ISO format)
   - `keywords`: Inherited from episode + any new ones identified
   - `relatedEpisodes`: Array of related episode slugs
   - `sourceEpisode`: Source episode slug (traceability)
5. Assemble MDX via gray-matter, sanitize body using existing `mdx-generator.ts` sanitization patterns

**Rate limiting:** 500ms delay after API call (match existing `aiDelay()` pattern)

### `social-generator.ts` — Social Media Posts

**Input:** Episode frontmatter + transcript
**Output:** Object with four platform payloads

**Process:**
1. Single Claude Sonnet call with structured JSON output for all four platforms
2. System prompt establishes Anthony's voice
3. User prompt provides transcript + episode metadata

**Output schemas:**

#### Twitter/X Thread — `twitter-thread.json`
```json
{
  "tweets": [
    { "text": "Hook tweet...", "index": 1 },
    { "text": "Insight tweet...", "index": 2 },
    { "text": "Listen: {url}", "index": 7 }
  ],
  "episodeSlug": "...",
  "generatedAt": "ISO timestamp"
}
```
- 5-7 tweets, each under 280 characters
- First tweet: bold claim, surprising stat, or question
- Last tweet: link to episode page (`/podcast/{slug}`)

#### Instagram — `instagram.json`
```json
{
  "caption": "Multi-line caption...",
  "hashtags": ["#cycling", "#roadmancycling", ...],
  "episodeSlug": "...",
  "generatedAt": "..."
}
```
- Line breaks for readability
- 15-20 relevant cycling hashtags
- CTA to listen (link in bio / episode number reference)

#### LinkedIn — `linkedin.json`
```json
{
  "post": "Professional-angle post...",
  "episodeSlug": "...",
  "generatedAt": "..."
}
```
- 3-4 paragraphs, professional but accessible
- Mention guest by name + credential if interview episode
- No hashtags

#### Facebook — `facebook.json`
```json
{
  "post": "Long-form storytelling post...",
  "angle": "Brief description of the chosen angle",
  "episodeSlug": "...",
  "generatedAt": "..."
}
```
- 500-800 words, conversational first-person (Anthony's voice)
- AI selects the single most compelling/shareable insight and builds a storytelling post around it
- Personal tone — like Anthony writing to his cycling community
- Designed to post later in the day (timing note in metadata, not enforced by pipeline)

### `quote-extractor.ts` — Quote Extraction

**Input:** Episode transcript
**Output:** Array of quote objects

**Process:**
1. Claude Haiku call to extract 3-5 quotable moments
2. Output per quote:
   ```json
   {
     "text": "Exact or near-exact quote from transcript",
     "speaker": "Guest Name" or "Anthony Walsh",
     "context": "Brief context for quote card subtitle"
   }
   ```

### `guest-image-fetcher.ts` — Guest Image Sourcing

**Input:** Guest name, guest slug, YouTube video ID
**Output:** Buffer of processed guest image (or null)

**Image source priority:**
1. `content/guests/{guest-slug}.jpg` — manually-provided image (highest priority)
2. Google Custom Search API — search `"{guest name}" cycling` → fetch first high-quality result
3. YouTube episode thumbnail — `https://img.youtube.com/vi/{youtubeId}/maxresdefault.jpg`
4. Fallback: return null (quote card renderer uses text-only branded template)

**Image processing with sharp:**
1. Fetch/load source image
2. Resize to cover 1080x1080 (maintaining aspect ratio)
3. Center crop to square
4. Return processed buffer for use by quote card renderer

**Rate limiting:** Cache fetched images in `content/guests/` with guest slug filename so subsequent runs don't re-fetch.

### `quote-card-renderer.ts` — Quote Card Image Generation

**Input:** Quote object + guest image buffer (or null)
**Output:** PNG files (square + landscape)

**Technology:** satori (JSX → SVG) + @resvg/resvg-js (SVG → PNG)

**Template layout:**
- **Background:** Guest image with dark gradient overlay (semi-transparent black from bottom, ~60% opacity)
  - If no guest image: solid dark background (`#252526`) with subtle brand texture
- **Brand color tint:** Subtle coral `#F16363` overlay at ~10% opacity
- **Quote text:** Work Sans font, white, centered, auto-sized to fit
- **Attribution:** Speaker name below quote, smaller font
- **Speaker credential/context:** Below name, even smaller
- **Branding:** "Roadman Cycling" wordmark or logo in corner, small
- **Episode badge:** "EP {number}" in corner

**Output sizes:**
- Square: 1080x1080 px (Instagram)
- Landscape: 1200x675 px (Twitter/Facebook)

**File naming:** `quote-{n}-square.png`, `quote-{n}-landscape.png`

### `content-writer.ts` — Output Writer

**Input:** All generated content for an episode
**Output:** Files written to `content/repurposed/ep-{number}-{slug}/`

**Process:**
1. Create output directory (+ `quotes/` subdirectory)
2. Write blog MDX via gray-matter stringify
3. Write social JSON files with `JSON.stringify(data, null, 2)`
4. Write quote card PNGs
5. All writes are atomic: write to `.tmp` then rename (match existing pattern)
6. In `--dry-run` mode: log file paths and content previews without writing

## Episode Detection (`--auto` mode)

Rather than a separate detection mechanism, reuse the existing sync infrastructure:

1. Read `repurpose-state.json` for list of already-repurposed episode slugs
2. Read all podcast MDX files from `content/podcast/`
3. Find episodes not in the repurposed list
4. Optionally filter to only recent episodes (e.g., published in last 7 days)
5. Run the full pipeline on each new episode

This pairs with the existing `sync-youtube.ts` — run sync first to get new episodes, then run repurpose to generate content.

## GitHub Action (Commented Out)

`.github/workflows/podcast-repurpose.yml` — designed but commented out:

```yaml
name: Podcast Content Repurpose
on:
  schedule:
    - cron: '0 8 * * *'  # Daily at 8am UTC
  workflow_dispatch: {}

jobs:
  repurpose:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run sync:youtube:full
        env:
          YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - run: npm run repurpose:latest
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GOOGLE_CSE_API_KEY: ${{ secrets.GOOGLE_CSE_API_KEY }}
          GOOGLE_CSE_ID: ${{ secrets.GOOGLE_CSE_ID }}
      - name: Create PR
        uses: peter-evans/create-pull-request@v6
        with:
          title: 'New podcast content: [episode title]'
          body: 'Auto-generated content for review'
          branch: repurpose/latest
```

## Error Handling

- Missing transcript: skip episode with warning, don't abort entire run
- Claude API failure: retry once with exponential backoff, then skip that generator
- Image fetch failure: fall back to YouTube thumbnail, then to text-only template
- Google CSE quota exceeded: fall back to YouTube thumbnail
- File write failure: abort that episode, report error, continue to next

## Scope Exclusions

- **Deepgram transcription:** Not included. YouTube auto-captions are working. Can be added later as a drop-in replacement in `transcript.ts`.
- **Automated Instagram fetching:** Not included. Guest images sourced via Google Custom Search API or manual `content/guests/` directory.
- **Automated posting:** Pipeline generates content only. Posting to social platforms is manual (or a future integration).
- **Newsletter generation:** Not in scope. Could be added as another generator later.
