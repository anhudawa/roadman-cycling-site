import { NextResponse } from "next/server";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";
import { getAllGuests } from "@/lib/guests";
import { getAllTopics } from "@/lib/topics";
import { GLOSSARY_TERMS } from "@/lib/glossary";
import { COMPARISONS } from "@/lib/comparisons";
import { BEST_FOR_PAGES } from "@/lib/best-for";
import { PROBLEM_PAGES } from "@/lib/problems";
import { EVENTS } from "@/lib/training-plans";
import { type ContentPillar } from "@/types";

const BASE_URL = "https://roadmancycling.com";

/**
 * Pillar → preferred free calculator. Used to attach a "next tool to try"
 * on every page. The mapping is hand-picked: each pillar's most-used
 * tool, not an automated lookup, so an AI crawler always lands on the
 * single best match.
 */
const PILLAR_TOOL: Record<ContentPillar, { slug: string; href: string; title: string }> = {
  coaching: { slug: "ftp-zones", href: "/tools/ftp-zones", title: "FTP Zone Calculator" },
  nutrition: { slug: "fuelling", href: "/tools/fuelling", title: "In-Ride Fuelling Calculator" },
  strength: { slug: "wkg", href: "/tools/wkg", title: "W/kg Calculator" },
  recovery: { slug: "energy-availability", href: "/tools/energy-availability", title: "Energy Availability Calculator" },
  community: { slug: "race-weight", href: "/tools/race-weight", title: "Race Weight Calculator" },
};

/**
 * Pillar → preferred commercial next step. Coaching-pillar pages send
 * readers to /apply (highest-intent funnel), nutrition/strength send to
 * /coaching (educational with a path to apply), recovery to the
 * comeback persona page, community to the free Clubhouse. Mirrors the
 * existing topic-hub commercialPath logic so the API and the UI stay
 * aligned.
 */
const PILLAR_COMMERCIAL: Record<
  ContentPillar,
  { type: "coaching" | "newsletter" | "community" | "tool"; href: string; label: string }
> = {
  coaching: { type: "coaching", href: "/apply", label: "Apply for coaching (7-day free trial)" },
  nutrition: { type: "coaching", href: "/coaching", label: "Coaching that builds fuelling into your week" },
  strength: { type: "coaching", href: "/strength-training", label: "Strength Training for Cyclists course" },
  recovery: { type: "community", href: "/you/comeback", label: "Comeback support" },
  community: { type: "community", href: "/community/clubhouse", label: "Join the Clubhouse (free)" },
};

const NEWSLETTER_NEXT = {
  type: "newsletter" as const,
  href: "/newsletter",
  label: "The Saturday Spin — weekly coaching takeaways",
};

function relatedComparisonsByPillar(pillar: ContentPillar): { url: string; title: string }[] {
  return COMPARISONS.filter((c) => c.pillar === pillar)
    .slice(0, 3)
    .map((c) => ({
      url: `${BASE_URL}/compare/${c.slug}`,
      title: `${c.optionA} vs ${c.optionB}`,
    }));
}

/**
 * GET /api/content-map
 *
 * Public machine-readable content inventory. Every canonical page is
 * listed with type, title, dates, AND relationship metadata that AI
 * crawlers (ChatGPT, Perplexity, Claude, Gemini Deep Research) can use
 * to follow the content graph without scraping each page.
 *
 * Per page, the relationship envelope answers:
 *   - primaryQuestion — the question the page answers
 *   - summaryAnswer — the extractable short answer
 *   - relatedComparisons — adjacent decision pages
 *   - relatedTool — the calculator that pairs with this content
 *   - commercialNext — the next coaching/newsletter/community step
 *   - authoritySource — the named expert behind the content
 *
 * AEO-016 / DEV-AEO-02 from the answer optimisation dev roadmap.
 */
export async function GET() {
  const posts = getAllPosts();
  const episodes = getAllEpisodes();
  const guests = getAllGuests();
  const topics = getAllTopics();

  const map = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    schemaVersion: 2,
    counts: {
      articles: posts.length,
      episodes: episodes.length,
      guests: guests.length,
      topics: topics.length,
      glossary: GLOSSARY_TERMS.length,
      comparisons: COMPARISONS.length,
      bestFor: BEST_FOR_PAGES.length,
      problems: PROBLEM_PAGES.length,
      events: EVENTS.length,
    },
    articles: posts.map((meta) => {
      const full = getPostBySlug(meta.slug);
      const summaryAnswer = full?.answerCapsule || meta.seoDescription;
      const expertSource =
        full?.experts && full.experts.length > 0
          ? { name: full.experts[0].name, role: full.experts[0].role }
          : { name: meta.author, role: "Cycling Coach & Podcast Host" };
      return {
        url: `${BASE_URL}/blog/${meta.slug}`,
        type: "article",
        title: meta.title,
        pillar: meta.pillar,
        publishDate: meta.publishDate,
        modifiedDate: meta.updatedDate || null,
        author: meta.author,
        keywords: meta.keywords,
        primaryQuestion: meta.seoTitle || meta.title,
        summaryAnswer,
        relatedComparisons: relatedComparisonsByPillar(meta.pillar),
        relatedTool: {
          url: `${BASE_URL}${PILLAR_TOOL[meta.pillar].href}`,
          title: PILLAR_TOOL[meta.pillar].title,
        },
        commercialNext: {
          ...PILLAR_COMMERCIAL[meta.pillar],
          href: `${BASE_URL}${PILLAR_COMMERCIAL[meta.pillar].href}`,
        },
        authoritySource: expertSource,
      };
    }),
    episodes: episodes.slice(0, 100).map((e) => ({
      url: `${BASE_URL}/podcast/${e.slug}`,
      type: "episode",
      title: e.title,
      pillar: e.pillar,
      publishDate: e.publishDate,
      guest: e.guest || null,
      episodeNumber: e.episodeNumber,
      primaryQuestion: e.seoTitle || e.title,
      summaryAnswer: e.answerCapsule || e.seoDescription,
      relatedComparisons: relatedComparisonsByPillar(e.pillar),
      relatedTool: {
        url: `${BASE_URL}${PILLAR_TOOL[e.pillar].href}`,
        title: PILLAR_TOOL[e.pillar].title,
      },
      commercialNext: {
        ...PILLAR_COMMERCIAL[e.pillar],
        href: `${BASE_URL}${PILLAR_COMMERCIAL[e.pillar].href}`,
      },
      authoritySource: e.guest
        ? { name: e.guest, role: e.guestCredential || null }
        : { name: "Anthony Walsh", role: "Cycling Coach & Podcast Host" },
    })),
    topics: topics.map((t) => ({
      url: `${BASE_URL}/topics/${t.slug}`,
      type: "topic",
      title: t.title,
      pillar: t.pillar,
      articleCount: t.posts.length,
      episodeCount: t.episodes.length,
      tools: t.tools.map((tool) => tool.href),
      commercialPath: t.commercialPath,
      relatedTopics: t.relatedTopics.map((s) => `${BASE_URL}/topics/${s}`),
      primaryQuestion: t.headline,
      summaryAnswer: t.description,
      relatedComparisons: relatedComparisonsByPillar(t.pillar),
      relatedTool: t.tools[0]
        ? { url: `${BASE_URL}${t.tools[0].href}`, title: t.tools[0].title }
        : { url: `${BASE_URL}${PILLAR_TOOL[t.pillar].href}`, title: PILLAR_TOOL[t.pillar].title },
      commercialNext: {
        type: "coaching" as const,
        href: `${BASE_URL}${t.commercialPath}`,
        label: "Roadman coaching application",
      },
      authoritySource: { name: "Anthony Walsh", role: "Cycling Coach & Podcast Host" },
    })),
    glossary: GLOSSARY_TERMS.map((t) => ({
      url: `${BASE_URL}/glossary/${t.slug}`,
      type: "glossary",
      term: t.term,
      pillar: t.pillar,
      relatedArticle: t.relatedArticle || null,
      relatedTool: t.relatedTool || null,
      primaryQuestion: `What is ${t.term}?`,
      authoritySource: { name: "Anthony Walsh", role: "Cycling Coach & Podcast Host" },
    })),
    comparisons: COMPARISONS.map((c) => ({
      url: `${BASE_URL}/compare/${c.slug}`,
      type: "comparison",
      optionA: c.optionA,
      optionB: c.optionB,
      pillar: c.pillar,
      primaryQuestion: `Which is better: ${c.optionA} or ${c.optionB}?`,
      summaryAnswer: c.verdict,
      relatedComparisons: COMPARISONS.filter(
        (other) => other.pillar === c.pillar && other.slug !== c.slug,
      )
        .slice(0, 2)
        .map((other) => ({
          url: `${BASE_URL}/compare/${other.slug}`,
          title: `${other.optionA} vs ${other.optionB}`,
        })),
      relatedTool: c.relatedTool
        ? { url: `${BASE_URL}${c.relatedTool}`, title: "Free assessment" }
        : { url: `${BASE_URL}${PILLAR_TOOL[c.pillar].href}`, title: PILLAR_TOOL[c.pillar].title },
      commercialNext: {
        ...PILLAR_COMMERCIAL[c.pillar],
        href: `${BASE_URL}${PILLAR_COMMERCIAL[c.pillar].href}`,
      },
      authoritySource: { name: "Anthony Walsh", role: "Cycling Coach & Podcast Host" },
    })),
    bestFor: BEST_FOR_PAGES.map((p) => ({
      url: `${BASE_URL}/best/${p.slug}`,
      type: "best-for",
      title: p.title,
      pillar: p.pillar,
      primaryQuestion: p.title.endsWith("?") ? p.title : `${p.title}?`,
      summaryAnswer: p.picks[0]
        ? `Top pick: ${p.picks[0].name}. ${p.picks[0].verdict}. Best for: ${p.picks[0].bestFor}.`
        : p.intro,
      relatedComparisons: relatedComparisonsByPillar(p.pillar),
      relatedTool: {
        url: `${BASE_URL}${PILLAR_TOOL[p.pillar].href}`,
        title: PILLAR_TOOL[p.pillar].title,
      },
      commercialNext: {
        ...PILLAR_COMMERCIAL[p.pillar],
        href: `${BASE_URL}${PILLAR_COMMERCIAL[p.pillar].href}`,
      },
      authoritySource: { name: "Anthony Walsh", role: "Cycling Coach & Podcast Host" },
    })),
    problems: PROBLEM_PAGES.map((p) => ({
      url: `${BASE_URL}/problem/${p.slug}`,
      type: "problem",
      title: p.title,
      pillar: p.pillar,
      primaryQuestion: p.title.endsWith("?") ? p.title : `${p.title}?`,
      summaryAnswer:
        p.causes[0] && p.solutions[0]
          ? `Most often: ${p.causes[0].toLowerCase()}. The fix: ${p.solutions[0].title.toLowerCase()} — ${p.solutions[0].description.toLowerCase()}.`
          : p.problem,
      relatedTool: p.toolHref
        ? { url: `${BASE_URL}${p.toolHref}`, title: p.toolLabel || "Try the free tool" }
        : { url: `${BASE_URL}${PILLAR_TOOL[p.pillar].href}`, title: PILLAR_TOOL[p.pillar].title },
      relatedComparisons: relatedComparisonsByPillar(p.pillar),
      commercialNext: {
        ...PILLAR_COMMERCIAL[p.pillar],
        href: `${BASE_URL}${PILLAR_COMMERCIAL[p.pillar].href}`,
      },
      authoritySource: { name: "Anthony Walsh", role: "Cycling Coach & Podcast Host" },
    })),
    guests: guests.slice(0, 50).map((g) => ({
      url: `${BASE_URL}/guests/${g.slug}`,
      type: "guest",
      name: g.name,
      credential: g.credential || null,
      episodeCount: g.episodeCount,
      pillars: g.pillars,
      primaryQuestion: `Who is ${g.name} and what do they say about cycling performance?`,
      authoritySource: { name: g.name, role: g.credential || null },
      commercialNext: NEWSLETTER_NEXT,
    })),
    events: EVENTS.map((e) => ({
      url: `${BASE_URL}/plan/${e.slug}`,
      type: "event",
      name: e.name,
      region: e.region,
      distanceKm: e.distanceKm,
      elevationGainM: e.elevationGainM,
      primaryQuestion: `How do I train for ${e.name}?`,
      relatedTool: {
        url: `${BASE_URL}${PILLAR_TOOL.coaching.href}`,
        title: PILLAR_TOOL.coaching.title,
      },
      commercialNext: {
        type: "coaching" as const,
        href: `${BASE_URL}/apply`,
        label: `Coached event prep for ${e.name}`,
      },
      authoritySource: { name: "Anthony Walsh", role: "Cycling Coach & Podcast Host" },
    })),
  };

  return NextResponse.json(map, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
