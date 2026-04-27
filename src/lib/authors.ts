/**
 * Author / contributor registry. Drives both the static
 * /author/anthony-walsh page (canonical) and the dynamic
 * /author/[slug] route for additional contributors and reviewers.
 *
 * Adding a contributor:
 *   1. Append a new entry below.
 *   2. Their slug becomes the URL: /author/<slug>.
 *   3. If a blog post sets `reviewedBy: <Name>`, the methodology
 *      page and editorial-standards links will resolve to this
 *      record's profile page.
 *
 * The schema/entity layer references these records via
 * https://roadmancycling.com/author/<slug>#person and the
 * existing ENTITY_IDS.person points at anthony-walsh.
 */

import { SITE_ORIGIN } from "./brand-facts";

export interface AuthorRecord {
  slug: string;
  name: string;
  /** Job title used in schema.org Person.jobTitle */
  jobTitle: string;
  /** Short tagline / role summary for the hero */
  tagline: string;
  /** Long-form bio, plain text. Rendered as a paragraph. */
  bio: string;
  /** Profile image — square, public path under /public */
  image?: string;
  /** Bullet credentials shown on the profile */
  credentials: string[];
  /** Areas of expertise — chip cloud */
  expertise: string[];
  /** Verified social/profile sameAs links — go into Person schema */
  sameAs: string[];
  /** Whether this is the primary editorial entity (Anthony) */
  primary?: boolean;
}

export const AUTHORS: AuthorRecord[] = [
  {
    slug: "anthony-walsh",
    name: "Anthony Walsh",
    jobTitle: "Cycling Coach & Podcast Host",
    tagline:
      "Founder of Roadman Cycling. Cycling coach. Host of 1,400+ on-the-record podcast conversations with the world's best coaches and scientists.",
    bio: "Anthony Walsh founded Roadman Cycling in Dublin in 2021. He coaches cyclists and triathletes across Ireland, the UK and the US through the Not Done Yet coaching community. Anthony hosts the Roadman Cycling Podcast — over 1,400 on-the-record conversations with World Tour coaches, sports scientists and pro riders including Greg LeMond, Prof. Stephen Seiler, Dan Lorang, Lachlan Morton and Joe Friel.",
    image: "/images/about/anthony-profile-closeup-v2.jpg",
    credentials: [
      "Cycling coach — Not Done Yet coaching community",
      "Host of the Roadman Cycling Podcast (1M+ monthly listeners)",
      "1,400+ on-the-record interviews with World Tour coaches, sports scientists, and professional riders",
      "Guests include Prof. Stephen Seiler, Dan Lorang, Greg LeMond, Joe Friel, Tim Spector, Lachlan Morton",
      "Based in Dublin, Ireland",
      "Coaches cyclists and triathletes across Ireland, the UK, and the US",
    ],
    expertise: [
      "Cycling training methodology",
      "Polarised and threshold training",
      "FTP and power-based coaching",
      "Cycling nutrition and fuelling",
      "Strength training for cyclists",
      "Recovery and adaptation",
      "Triathlon bike coaching",
      "Masters cyclist performance",
    ],
    sameAs: [
      "https://youtube.com/@theroadmanpodcast",
      "https://instagram.com/roadman.cycling",
      "https://facebook.com/roadmancycling",
      "https://x.com/Roadman_Podcast",
    ],
    primary: true,
  },
];

export function getAllAuthors(): AuthorRecord[] {
  return AUTHORS;
}

export function getAuthorBySlug(slug: string): AuthorRecord | null {
  return AUTHORS.find((a) => a.slug === slug) ?? null;
}

/**
 * Resolve an author slug from a name string used in blog frontmatter
 * `author:` or `reviewedBy:`. Falls back to the primary author if the
 * name doesn't match a known contributor — better than rendering a
 * dead link in the entity graph.
 */
export function resolveAuthorSlug(name: string | undefined | null): string {
  if (!name) return AUTHORS.find((a) => a.primary)?.slug ?? AUTHORS[0].slug;
  const match = AUTHORS.find(
    (a) => a.name.toLowerCase() === name.toLowerCase().trim()
  );
  return match
    ? match.slug
    : AUTHORS.find((a) => a.primary)?.slug ?? AUTHORS[0].slug;
}

export function getAuthorUrl(slug: string): string {
  return `${SITE_ORIGIN}/author/${slug}`;
}
