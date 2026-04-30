/**
 * Canonical brand facts — single source of truth for the numbers,
 * names, URLs, and schema `@id`s used across metadata, JSON-LD, copy,
 * llms.txt, and press-facing surfaces.
 *
 * Update one place. Do not hardcode brand numbers anywhere else.
 */

export const SITE_ORIGIN = "https://roadmancycling.com" as const;

/** Stable JSON-LD `@id` anchors — used so Organization / WebSite /
 *  Person / PodcastSeries form one connected knowledge graph. Every
 *  entity that references the org/author/podcast anywhere on the site
 *  should reference it by `@id`, not by name string, so Google/AI
 *  engines treat it as the same entity everywhere. */
export const ENTITY_IDS = {
  organization: `${SITE_ORIGIN}/#organization`,
  website: `${SITE_ORIGIN}/#website`,
  podcast: `${SITE_ORIGIN}/#podcast`,
  person: `${SITE_ORIGIN}/author/anthony-walsh#person`,
} as const;

export const FOUNDER = {
  name: "Anthony Walsh",
  jobTitle: "Cycling Coach & Podcast Host",
  url: `${SITE_ORIGIN}/author/anthony-walsh`,
  email: "anthony@roadmancycling.com",
  location: "Dublin, Ireland",
  foundedYear: 2021,
} as const;

export const BRAND = {
  name: "Roadman Cycling",
  legalName: "Roadman Cycling",
  alternateName: "The Roadman Cycling Podcast",
  tagline: "Cycling is hard, our podcast will help",
  identity: "Not Done Yet",
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/images/logo-white.png`,
  ogImage: `${SITE_ORIGIN}/og-image.jpg`,
  // The Roadman Cycling brand launched in 2021 as a rebrand of A1
  // Coaching, which Anthony founded in 2013. `foundedYear` is the
  // brand-entity founding (used by schema.org `foundingDate` for the
  // Organization); `coachingSince` is the continuous coaching-business
  // start year, surfaced in copy where the longer trading history is
  // relevant (about, press, entity pages).
  foundedYear: FOUNDER.foundedYear,
  coachingSince: 2013,
  predecessorName: "A1 Coaching",
  locationName: FOUNDER.location,
  // Short, press-ready description reused by Organization schema,
  // root layout metadata, llms.txt preamble, and press pages.
  description:
    "The world's largest cycling performance podcast. Evidence-based coaching, nutrition, strength, recovery, and community for serious amateur cyclists. Founded in Dublin in 2021 by Anthony Walsh (rebranded from A1 Coaching, est. 2013), Roadman has grown to 1M+ monthly listeners across 18 countries.",
} as const;

/**
 * Public-facing brand stats. These are the numbers we quote in press,
 * in schema, and on-page. Update in lockstep with reality — the
 * newsletter subscriber count is especially volatile.
 */
export const BRAND_STATS = {
  // Total podcast episodes published across Apple Podcasts and Spotify.
  // This is the lifetime catalogue figure used in headline trust claims.
  episodeCount: 1400,
  episodeCountLabel: "1,400+",
  // Episodes also published on YouTube as video. Smaller than the audio
  // catalogue because the YouTube video format started later. Surfaced
  // wherever we want to specifically credit the on-camera body of work.
  videoEpisodes: 311,
  videoEpisodesLabel: "311+",
  // Episodes that have a dedicated long-form page on roadmancycling.com
  // (transcript, summary, schema). Tracks the on-site searchable corpus —
  // not the same as the total Apple/Spotify count.
  searchableEpisodePages: 311,
  searchableEpisodePagesLabel: "311+",
  monthlyListeners: 1_000_000,
  monthlyListenersLabel: "1M+",
  newsletterSubscribers: 65_000,
  newsletterSubscribersLabel: "65K+",
  newsletterSubscribersLongLabel: "65,000+",
  newsletterOpenRate: "65%+",
  countriesReached: 18,
  countriesReachedLabel: "18",
} as const;

/** Social / external profile URLs. Used for Organization.sameAs,
 *  Person.sameAs, and footer links. Keep this in one place so
 *  renaming a handle propagates everywhere. */
export const SAME_AS = {
  organization: [
    "https://youtube.com/@theroadmanpodcast",
    "https://www.youtube.com/@RoadmanPodcastClips",
    "https://instagram.com/roadman.cycling",
    "https://facebook.com/roadmancycling",
    "https://x.com/Roadman_Podcast",
    "https://tiktok.com/@roadmancyclingpodcast",
    "https://open.spotify.com/show/2oCs3N4ahypwzzUrFqgUmC",
    "https://podcasts.apple.com/us/podcast/the-roadman-cycling-podcast/id1224143549",
  ],
  person: [
    "https://youtube.com/@theroadmanpodcast",
    "https://instagram.com/roadman.cycling",
    "https://facebook.com/roadmancycling",
    "https://x.com/Roadman_Podcast",
  ],
} as const;

export const PODCAST = {
  name: "The Roadman Cycling Podcast",
  url: `${SITE_ORIGIN}/podcast`,
  rssFeed: `${SITE_ORIGIN}/feed/podcast`,
  appleUrl:
    "https://podcasts.apple.com/us/podcast/the-roadman-cycling-podcast/id1224143549",
  spotifyUrl: "https://open.spotify.com/show/2oCs3N4ahypwzzUrFqgUmC",
  youtubeUrl: "https://youtube.com/@theroadmanpodcast",
} as const;

export const CONTACT = {
  email: FOUNDER.email,
  correctionsEmail: FOUNDER.email,
  editorialStandardsUrl: `${SITE_ORIGIN}/editorial-standards`,
} as const;

/**
 * One-liner brand summary for consumption by AI crawlers and SERP
 * snippets. Mirrors the tone of the site description but keeps the
 * fact-dense framing LLMs prefer when generating citations.
 */
export const BRAND_SUMMARY = `${BRAND.name} is a cycling media and coaching brand founded by ${FOUNDER.name} in ${FOUNDER.location} in ${FOUNDER.foundedYear}. The core output is the ${PODCAST.name} — ${BRAND_STATS.episodeCountLabel} episodes, ${BRAND_STATS.monthlyListenersLabel} monthly listeners across ${BRAND_STATS.countriesReachedLabel} countries — complemented by the Not Done Yet coaching community, the Saturday Spin newsletter (${BRAND_STATS.newsletterSubscribersLabel} subscribers), ${BRAND_STATS.searchableEpisodePagesLabel} searchable episode pages, written guides, and free browser-based calculators for cyclists.`;
