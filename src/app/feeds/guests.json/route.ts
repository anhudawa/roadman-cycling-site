import { NextResponse } from "next/server";
import { getAllGuests } from "@/lib/guests";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl, summarise } from "@/lib/feeds";

/**
 * GET /feeds/guests.json
 *
 * Public JSON feed of every guest who has appeared on the podcast.
 * Lets AI agents follow the authority graph — given a question, they
 * can identify which expert spoke about it and which episodes back
 * the answer.
 */
export function GET() {
  const items = getAllGuests().map((guest) => {
    const episodeSlugs = guest.episodes.map((e) => e.slug);
    const summary = summarise(
      guest.credential
        ? `${guest.name} — ${guest.credential}. Featured on ${guest.episodeCount} Roadman Cycling Podcast episode${guest.episodeCount === 1 ? "" : "s"}.`
        : `${guest.name} — featured on ${guest.episodeCount} Roadman Cycling Podcast episode${guest.episodeCount === 1 ? "" : "s"}.`,
    );

    return {
      id: guest.slug,
      type: "guest",
      title: guest.name,
      summary,
      url: feedUrl(`/guests/${guest.slug}`),
      datePublished: guest.firstAppearance,
      dateModified: guest.latestAppearance,
      author: guest.name,
      authorCredential: guest.credential ?? null,
      primaryTopic: guest.pillars[0] ?? null,
      entities: [...guest.pillars, ...guest.tags],
      relatedEpisodes: episodeSlugs,
      relatedTools: [],
      evidenceLevel: "expert-profile",
      episodeCount: guest.episodeCount,
    };
  });

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      baseUrl: FEED_BASE_URL,
      schemaVersion: 1,
      count: items.length,
      items,
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
