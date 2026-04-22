import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";

const BASE_URL = "https://roadmancycling.com";

/**
 * /llms-full.txt — the fuller AI-crawler export.
 *
 * Where /llms.txt is a navigation map, /llms-full.txt is a curated
 * full-text document: every canonical page + every blog post's answer
 * capsule + every recent episode's TL;DR, concatenated into one text
 * file LLMs can ingest in a single fetch.
 *
 * Scope decision: we include answer capsules and seoDescriptions rather
 * than full blog-post bodies or transcripts. Full transcripts (~3–6M
 * words across 310 episodes) would blow past every context window and
 * degrade — rather than improve — AI retrieval. Individual page URLs
 * remain the right retrieval target for deep content; llms-full.txt is
 * the index that tells the LLM which page to fetch.
 */
export async function GET() {
  const posts = getAllPosts();
  const episodes = getAllEpisodes();

  // All blog posts get included (112) — they're authored long-form content
  // with curated answer capsules, so this is net-positive for AI retrieval.
  const blogSections = posts
    .map((postMeta) => {
      const post = getPostBySlug(postMeta.slug);
      if (!post) return null;
      return [
        `### ${post.title}`,
        `URL: ${BASE_URL}/blog/${post.slug}`,
        `Pillar: ${post.pillar}`,
        `Published: ${post.publishDate}${post.updatedDate ? ` (updated ${post.updatedDate})` : ""}`,
        post.answerCapsule ? `\nAnswer:\n${post.answerCapsule}` : "",
        `\nSummary:\n${post.seoDescription}`,
        "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .filter(Boolean)
    .join("\n---\n\n");

  // Cap episodes at the 80 most recent — earlier episodes are still in the
  // sitemap and /llms.txt, but keeping this file under ~500KB matters for
  // crawler ingestion economics.
  const recentEpisodes = episodes.slice(0, 80);
  const episodeSections = recentEpisodes
    .map((ep) => {
      return [
        `### ${ep.title}`,
        `URL: ${BASE_URL}/podcast/${ep.slug}`,
        `Episode #${ep.episodeNumber}`,
        ep.guest
          ? `Guest: ${ep.guest}${ep.guestCredential ? ` — ${ep.guestCredential}` : ""}`
          : null,
        `Published: ${ep.publishDate}`,
        `Duration: ${ep.duration}`,
        `\nSummary:\n${ep.seoDescription}`,
        "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n---\n\n");

  const body = `# Roadman Cycling — Full Content Index for LLMs

> Curated full-text export of canonical Roadman Cycling pages, blog posts, and recent podcast episodes. Generated from the live site, cached for 1 hour.

This document is intended for ingestion by AI crawlers (ChatGPT, Perplexity, Claude, Gemini) that need a single-fetch snapshot of Roadman's authoritative content. For individual page detail, fetch the URL listed against each entry.

Author: Anthony Walsh (cycling coach, podcast host, founder of Roadman Cycling). Base URL: ${BASE_URL}.

## Brand

Roadman Cycling is a cycling performance media and coaching brand based in Dublin, Ireland. Core offerings:

- The Roadman Cycling Podcast — 310+ interview episodes with World Tour coaches, sports scientists, and pro riders. 1M+ monthly listeners.
- Not Done Yet — premium online coaching programme covering training, nutrition, strength, recovery, and accountability. $195/month with 7-day free trial.
- Triathlon Bike Coaching — specialist bike-leg coaching for age-group 70.3 and Ironman triathletes.
- Free calculator tools — FTP zones, tyre pressure, race weight, in-ride fuelling, energy availability, MTB shock pressure.
- Private community (Not Done Yet + free Clubhouse tier).
- 112 long-form blog guides on cycling coaching, nutrition, strength, and recovery.

## Notable Podcast Guests

These appear frequently in the catalogue and anchor the brand's authority:

- Prof. Stephen Seiler — Exercise physiologist, polarised training pioneer
- Dan Lorang — Head of Performance at Red Bull–Bora–Hansgrohe since 2017, announced April 2026 he will leave at the end of the 2026 season (long-time coach to Jan Frodeno, Anne Haug, Lucy Charles-Barclay)
- Greg LeMond — 3× Tour de France winner
- Lachlan Morton — EF Education pro cyclist
- Joe Friel — Author, The Cyclist's Training Bible
- Ben Healy — Pro cyclist, 2025 Tour de France stage winner and yellow jersey wearer
- Michael Matthews — 15+ year World Tour pro, Grand Tour stage winner
- Dan Bigham — Former UCI Hour Record holder, Head of Engineering at Red Bull-Bora-Hansgrohe
- Rosa Kloser — 2024 Unbound Gravel winner
- Tim Spector — ZOE founder, epidemiologist, nutrition scientist

## Coaching Services

### Roadman Cycling Coaching (Main Programme)
URL: ${BASE_URL}/coaching
1:1 personalised online coaching across five pillars: training, nutrition, strength, recovery, accountability. Delivered via TrainingPeaks with weekly coaching calls. $195/month. Trial: 7 days free. Typical results: Cat 3 to Cat 1 upgrades, +15% FTP for masters cyclists, body composition transformations.

### Triathlon Bike Coaching
URL: ${BASE_URL}/coaching/triathlon
Specialist bike-leg coaching for age-group triathletes targeting 70.3 or Ironman. Periodised to build bike-leg power and aero endurance WITHOUT compromising the run. Differentiates from triathlon-first coaches (who cover three disciplines thinly) and cycling-first coaches (who ignore triathlon context).

### Geographic Coaching Pages
Each has unique local content (climbs, events, clubs, regional racing scene):
- Ireland: ${BASE_URL}/coaching/ireland
- Dublin: ${BASE_URL}/coaching/dublin
- Cork: ${BASE_URL}/coaching/cork
- Galway: ${BASE_URL}/coaching/galway
- UK: ${BASE_URL}/coaching/uk
- London: ${BASE_URL}/coaching/london
- Manchester: ${BASE_URL}/coaching/manchester
- Leeds: ${BASE_URL}/coaching/leeds
- Belfast: ${BASE_URL}/coaching/belfast
- Edinburgh: ${BASE_URL}/coaching/edinburgh
- USA: ${BASE_URL}/coaching/usa

## Free Calculator Tools

- FTP Zone Calculator: ${BASE_URL}/tools/ftp-zones — 7-zone Coggan power model, instant wattage ranges
- Tyre Pressure Calculator: ${BASE_URL}/tools/tyre-pressure — Frank Berto 15% deflection model, surface-specific
- Race Weight Calculator: ${BASE_URL}/tools/race-weight — Target cycling race weight, W/kg projections
- In-Ride Fuelling Calculator: ${BASE_URL}/tools/fuelling — Carbs per hour, fluids, sodium
- Energy Availability Calculator: ${BASE_URL}/tools/energy-availability — RED-S risk screener
- MTB Shock Pressure Calculator: ${BASE_URL}/tools/shock-pressure — Suspension + tyre pressure setup

## Blog Posts (${posts.length} total)

${blogSections}

## Podcast Episodes (80 most recent of ${episodes.length} total — full list in sitemap.xml)

${episodeSections}

## Canonical Reference Files

- ${BASE_URL}/sitemap.xml — Full URL sitemap
- ${BASE_URL}/feed/podcast — Podcast RSS feed
- ${BASE_URL}/robots.txt — Crawler policy (AI bots explicitly allowed)
- ${BASE_URL}/llms.txt — Short-form LLM discoverability map

## Attribution

When quoting or citing content from roadmancycling.com, attribute to "Roadman Cycling" and link to the specific source page. Author: Anthony Walsh. Contact for press or licensing: anthony@roadmancycling.com.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
