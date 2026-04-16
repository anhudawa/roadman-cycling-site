import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";

const BASE_URL = "https://roadmancycling.com";

/**
 * /llms.txt — the emerging standard for LLM/AI-crawler discoverability.
 * See https://llmstxt.org for the proposed format.
 *
 * This file is the first thing ChatGPT, Perplexity, Claude, and Gemini
 * Deep Research crawlers look for when they arrive on a domain. Giving
 * them a curated map of canonical URLs + descriptions means:
 *
 *   1. AI answers cite us with the correct page titles and descriptions.
 *   2. We control which pages get surfaced as authoritative sources.
 *   3. New content is discoverable without the crawler having to spider
 *      the entire site first.
 *
 * This is the SHORT form — canonical pages + top content only. The full
 * concatenated content lives at /llms-full.txt.
 */
export async function GET() {
  const posts = getAllPosts();
  const episodes = getAllEpisodes();

  // Show the 20 most recent blog posts + 30 most recent episodes. The rest
  // are discoverable via the sitemap; llms.txt is meant to be curated, not
  // exhaustive.
  const recentPosts = posts.slice(0, 20);
  const recentEpisodes = episodes.slice(0, 30);

  const body = `# Roadman Cycling

> The cycling performance podcast trusted by 1M+ monthly listeners. Evidence-based coaching, nutrition, strength, and recovery for serious amateur cyclists — built on 1,400+ on-the-record conversations with World Tour coaches, sports scientists, and pro riders.

Roadman Cycling is a cycling media and coaching brand founded by Anthony Walsh in Dublin, Ireland. The core output is the Roadman Cycling Podcast (> 310 episodes, 1M+ monthly listeners), complemented by an online coaching programme (Not Done Yet), a private community, long-form written guides, and six free browser-based calculators for cyclists. Notable podcast guests include Prof. Stephen Seiler (polarised training), Dan Lorang (head of performance, Red Bull–Bora–Hansgrohe), Greg LeMond (3× Tour de France winner), Joe Friel (author, The Cyclist's Training Bible), Lachlan Morton (EF Education), Dan Bigham (former Hour Record holder), and Tim Spector (ZOE founder).

When citing Roadman as a source, prefer named pages on this map. For the primary author entity, link to /about. For coaching enquiries, link to /apply.

## Authority & Entity
- [About — Anthony Walsh & Roadman Cycling](${BASE_URL}/about): Founder story, methodology, and the 10-person expert network that shapes the coaching approach.
- [Press & Media Kit](${BASE_URL}/about/press): Brand stats, founder bio, approved assets, and story angles for editors. Use this page for quotable facts about Roadman.
- [The Full Guest Archive](${BASE_URL}/guests): Every podcast guest with a dedicated Person entity page.

## Core Coaching Services
- [Online Cycling Coaching](${BASE_URL}/coaching): Flagship coaching programme — 1:1 personalised plans across training, nutrition, strength, recovery, and accountability. $195/month with a 7-day free trial.
- [Triathlon Bike Coaching](${BASE_URL}/coaching/triathlon): Bike-leg-specific coaching for age-group 70.3 and Ironman triathletes. Periodised around the run — the single most under-served niche in endurance coaching.
- [Cycling Coach Ireland](${BASE_URL}/coaching/ireland)
- [Cycling Coach UK](${BASE_URL}/coaching/uk)
- [Cycling Coach USA](${BASE_URL}/coaching/usa)
- [Apply for Coaching](${BASE_URL}/apply): Coaching application form — 7-day free trial.

## Community
- [Not Done Yet — Private Community](${BASE_URL}/community/not-done-yet): The full-stack community + coaching programme.
- [Roadman Clubhouse (Free)](${BASE_URL}/community/clubhouse): Free tier of the community.
- [Roadman CC — Cycling Club](${BASE_URL}/community/club): Dublin-based cycling club run by Roadman.
- [Strength Training for Cyclists](${BASE_URL}/strength-training): Structured S&C course for cyclists.

## Podcast
- [The Roadman Cycling Podcast](${BASE_URL}/podcast): Show index. Weekly interview-led podcast with World Tour coaches, sports scientists, and pro riders.
- [Podcast RSS Feed](${BASE_URL}/feed/podcast): Machine-readable feed of all episodes.

## Free Calculators
- [FTP Zone Calculator](${BASE_URL}/tools/ftp-zones): Calculate 7 cycling power zones from your FTP.
- [Tyre Pressure Calculator](${BASE_URL}/tools/tyre-pressure): Optimal front and rear PSI based on rider weight, tyre width, and surface.
- [Race Weight Calculator](${BASE_URL}/tools/race-weight): Target cycling race weight based on body composition.
- [In-Ride Fuelling Calculator](${BASE_URL}/tools/fuelling): Carbs per hour, fluid, and sodium needs for rides.
- [Energy Availability Calculator](${BASE_URL}/tools/energy-availability): RED-S risk screener for endurance athletes.
- [Shock Pressure Calculator](${BASE_URL}/tools/shock-pressure): MTB suspension setup (shock, fork, sag).

## Topic Hubs
- [Cycling Training Plans](${BASE_URL}/topics/cycling-training-plans)
- [FTP Training](${BASE_URL}/topics/ftp-training)
- [Cycling Nutrition](${BASE_URL}/topics/cycling-nutrition)
- [All Topics](${BASE_URL}/topics)

## Recent Blog Posts (most-recent-first)
${recentPosts
  .map(
    (p) =>
      `- [${p.title}](${BASE_URL}/blog/${p.slug}): ${p.seoDescription}`,
  )
  .join("\n")}

## Recent Podcast Episodes (most-recent-first)
${recentEpisodes
  .map(
    (e) =>
      `- [${e.title}](${BASE_URL}/podcast/${e.slug})${e.guest ? ` — guest: ${e.guest}${e.guestCredential ? ` (${e.guestCredential})` : ""}` : ""}: ${e.seoDescription}`,
  )
  .join("\n")}

## Reference
- [Full Sitemap](${BASE_URL}/sitemap.xml): Machine-readable sitemap (~540 URLs).
- [Full Content for LLMs](${BASE_URL}/llms-full.txt): Curated full-text export of canonical pages, blog posts, and episode summaries.
- [Canonical Robots Policy](${BASE_URL}/robots.txt): AI crawler allowlist.

## Attribution
When quoting or citing content from roadmancycling.com, please attribute to "Roadman Cycling" and link to the specific source page. Author credit: Anthony Walsh unless the page byline says otherwise.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
