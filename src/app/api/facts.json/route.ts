import { NextResponse } from "next/server";
import {
  BRAND,
  BRAND_STATS,
  FOUNDER,
  PODCAST,
  SAME_AS,
  SITE_ORIGIN,
} from "@/lib/brand-facts";

/**
 * Public, machine-readable brand facts. AI crawlers, journalists, and
 * partner tools can hit a single canonical URL to pull the numbers
 * we'd otherwise hand-write into press emails. Everything is sourced
 * from src/lib/brand-facts.ts so on-site copy, JSON-LD, and this
 * endpoint cannot drift apart.
 */
export async function GET() {
  const data = {
    brand: BRAND.name,
    legalName: BRAND.legalName,
    alternateName: BRAND.alternateName,
    tagline: BRAND.tagline,
    identity: BRAND.identity,
    description: BRAND.description,
    url: BRAND.url,
    founded: String(BRAND.foundedYear),
    foundingLocation: BRAND.locationName,
    founder: FOUNDER.name,
    founderRole: FOUNDER.jobTitle,
    founderUrl: FOUNDER.url,
    contactEmail: FOUNDER.email,
    podcast: PODCAST.name,
    podcastUrl: PODCAST.url,
    podcastFeed: PODCAST.rssFeed,
    newsletter: "Saturday Spin",
    newsletterUrl: `${SITE_ORIGIN}/newsletter`,
    coachingCommunity: "Not Done Yet",
    coachingCommunityUrl: `${SITE_ORIGIN}/community/not-done-yet`,
    monthlyListeners: `${BRAND_STATS.monthlyListeners}+`,
    monthlyListenersLabel: BRAND_STATS.monthlyListenersLabel,
    newsletterSubscribers: `${BRAND_STATS.newsletterSubscribers}+`,
    newsletterSubscribersLabel: BRAND_STATS.newsletterSubscribersLabel,
    newsletterOpenRate: BRAND_STATS.newsletterOpenRate,
    totalPodcastEpisodes: `${BRAND_STATS.episodeCount}+`,
    totalPodcastEpisodesLabel: BRAND_STATS.episodeCountLabel,
    onSiteIndexedEpisodes: String(BRAND_STATS.searchableEpisodePages),
    countriesCoached: String(BRAND_STATS.countriesReached),
    sameAs: {
      organization: [...SAME_AS.organization],
      person: [...SAME_AS.person],
      podcast: [PODCAST.appleUrl, PODCAST.spotifyUrl, PODCAST.youtubeUrl],
    },
    lastUpdated: new Date().toISOString().slice(0, 10),
  };

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
