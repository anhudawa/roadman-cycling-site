import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";
import { getAllGuests } from "@/lib/guests";
import { getAllTopicSlugs } from "@/lib/topics";
import { fetchNewsletterIssues } from "@/lib/integrations/beehiiv";
import { getAllPlanCombinations, getAllEventSlugs } from "@/lib/training-plans";

const BASE_URL = "https://roadmancycling.com";

/**
 * How recently was content updated? Returns an appropriate changeFrequency.
 * - Under 30 days  → "weekly"
 * - Under 180 days → "monthly"
 * - Older          → "yearly"
 */
function changeFreqByAge(
  date: Date,
): "weekly" | "monthly" | "yearly" {
  const ageMs = Date.now() - date.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < 30) return "weekly";
  if (ageDays < 180) return "monthly";
  return "yearly";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ---------------------------------------------------------------------------
  // Static pages — grouped by priority tier
  // ---------------------------------------------------------------------------

  const staticPages: MetadataRoute.Sitemap = [
    // Homepage — priority 1.0
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },

    // Main section indexes — priority 0.8
    {
      url: `${BASE_URL}/podcast`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/guests`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/topics`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about/press`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/community`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/strength-training`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/coaching`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/coaching/triathlon`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/coaching/ireland`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/coaching/uk`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/coaching/usa`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/coaching/dublin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/coaching/cork`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/coaching/galway`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/coaching/london`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/coaching/manchester`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/coaching/belfast`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/coaching/edinburgh`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/coaching/leeds`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },

    // Start Here — curated onboarding hub
    {
      url: `${BASE_URL}/start-here`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },

    // Research — evidence base hub
    {
      url: `${BASE_URL}/research`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // Persona landing pages — high-intent funnel entries
    {
      url: `${BASE_URL}/you/plateau`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/you/event`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/you/comeback`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/you/listener`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // Training plan index
    {
      url: `${BASE_URL}/plan`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // Community sub-pages — priority 0.7
    {
      url: `${BASE_URL}/community/clubhouse`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/community/not-done-yet`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/community/club`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // Tools — priority 0.7
    {
      url: `${BASE_URL}/tools/ftp-zones`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/tyre-pressure`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/race-weight`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/fuelling`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/energy-availability`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/shock-pressure`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // Lower priority static pages
    {
      url: `${BASE_URL}/newsletter`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/partners`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  // ---------------------------------------------------------------------------
  // Blog posts — priority 0.6, use frontmatter dates for lastModified
  // changeFrequency adapts based on age: recent posts update more often
  // ---------------------------------------------------------------------------

  const posts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => {
    const lastMod = post.updatedDate
      ? new Date(post.updatedDate)
      : new Date(post.publishDate);
    return {
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: lastMod,
      changeFrequency: changeFreqByAge(lastMod),
      priority: 0.6,
    };
  });

  // ---------------------------------------------------------------------------
  // Podcast episodes — priority 0.6, use publishDate for lastModified
  // changeFrequency adapts based on age: recent episodes may get show-notes edits
  // ---------------------------------------------------------------------------

  const episodes = getAllEpisodes();
  const podcastPages: MetadataRoute.Sitemap = episodes.map((ep) => {
    const lastMod = new Date(ep.publishDate);
    return {
      url: `${BASE_URL}/podcast/${ep.slug}`,
      lastModified: lastMod,
      changeFrequency: changeFreqByAge(lastMod),
      priority: 0.6,
    };
  });

  // ---------------------------------------------------------------------------
  // Guest pages — priority 0.6, use latestAppearance date for lastModified
  // ---------------------------------------------------------------------------

  const guests = getAllGuests();
  const guestPages: MetadataRoute.Sitemap = guests.map((guest) => {
    const lastMod = new Date(guest.latestAppearance);
    return {
      url: `${BASE_URL}/guests/${guest.slug}`,
      lastModified: lastMod,
      changeFrequency: changeFreqByAge(lastMod),
      priority: 0.6,
    };
  });

  // ---------------------------------------------------------------------------
  // Topic hub pages — priority 0.7 (high-value SEO landing pages)
  // ---------------------------------------------------------------------------

  const topicSlugs = getAllTopicSlugs();
  const topicPages: MetadataRoute.Sitemap = topicSlugs.map((slug) => ({
    url: `${BASE_URL}/topics/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // ---------------------------------------------------------------------------
  // Programmatic training plan pages — event × weeks-out combinations
  // Each is a unique, SEO-targeted long-tail landing page.
  // ---------------------------------------------------------------------------

  const planPages: MetadataRoute.Sitemap = getAllPlanCombinations().map(
    ({ event, weeksOut }) => ({
      url: `${BASE_URL}/plan/${event}/${weeksOut}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }),
  );

  // Event hub pages sit above the weeks-out children and match the
  // natural "{event} training plan" query intent.
  const planEventHubs: MetadataRoute.Sitemap = getAllEventSlugs().map(
    (event) => ({
      url: `${BASE_URL}/plan/${event}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  // ---------------------------------------------------------------------------
  // Newsletter issues — priority 0.5 (monthly content, indexed for SEO)
  // ---------------------------------------------------------------------------

  let newsletterPages: MetadataRoute.Sitemap = [];
  try {
    const issues = await fetchNewsletterIssues(100);
    newsletterPages = issues
      .filter((issue): issue is typeof issue & { publishDate: string } => Boolean(issue.publishDate))
      .map((issue) => ({
        url: `${BASE_URL}/newsletter/${issue.slug}`,
        lastModified: new Date(issue.publishDate),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }));
  } catch {
    // Beehiiv API unavailable — skip newsletter pages in sitemap
  }

  return [
    ...staticPages,
    ...blogPages,
    ...podcastPages,
    ...guestPages,
    ...topicPages,
    ...planEventHubs,
    ...planPages,
    ...newsletterPages,
  ];
}
