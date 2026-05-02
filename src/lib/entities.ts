/**
 * Expert entity loader.
 *
 * Loads MDX files from `content/entities/` to power the
 * `/entity/[slug]` route. Each entity file pairs structured
 * frontmatter (the data the Person JSON-LD and the page sidebar
 * need) with an MDX body that holds the long-form "why this
 * person's work matters to your cycling" prose.
 *
 * The brand/org entities under `/entity/{anthony-walsh, roadman-cycling, ...}`
 * are kept as static page.tsx files because they reference brand-facts
 * directly. This loader powers the *expert network* — the World Tour
 * coaches, exercise physiologists, and pros who appear on the podcast
 * and whose work the rest of the site cites.
 *
 * The slug a file ships under should match the guest-page slug for
 * the same person where one exists (e.g. `stephen-seiler.mdx` →
 * `/entity/stephen-seiler` AND `/guests/stephen-seiler`). That symmetry
 * lets the entity page deep-link into podcast appearances and lets the
 * guest page link back at the entity for AEO/SGE.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ENTITIES_DIR = path.join(process.cwd(), "content/entities");

/** Schema.org Person `worksFor` shape — narrowed to the org types we use. */
export type WorksForType = "SportsTeam" | "CollegeOrUniversity" | "Organization";

export interface ExpertWorksFor {
  name: string;
  type: WorksForType;
  url?: string;
}

/** A single notable position the expert is known for. Shown on-page as a
 *  short citable claim and used as part of the JSON-LD `knowsAbout` graph. */
export interface ExpertPosition {
  /** The position itself, written as a short declarative sentence (8-30 words). */
  claim: string;
  /** Optional context — where Anthony heard it, what it means in practice. */
  context?: string;
}

export interface ExpertEntityFrontmatter {
  /** Canonical display name (e.g. "Professor Stephen Seiler"). */
  name: string;
  /** Short job-title-style credential (1 line). */
  jobTitle: string;
  /** One-sentence description used in <meta>, OG, and the hero. */
  shortBio: string;
  /** Country/region — populates schema.org `homeLocation`. */
  location?: string;
  /** Headshot URL (absolute). Optional. */
  image?: string;
  /** Primary org affiliation. */
  worksFor?: ExpertWorksFor;
  /**
   * Knowledge Graph disambiguation URLs. Wikipedia/Wikidata first, then
   * official site, then verified socials. Every URL must be verified —
   * inventing a `sameAs` is worse than omitting it.
   */
  sameAs?: string[];
  /** Topics this person is publicly known for (drives `knowsAbout`). */
  knowsAbout: string[];
  /** How this person relates to Roadman — 1-2 sentence summary. */
  relationship: string;
  /** Number of podcast appearances. Optional — only set if known. */
  podcastAppearances?: number;
  /** Slug of the matching `/guests/[slug]` page if one exists. */
  guestSlug?: string;
  /** Notable positions / quotes. 3-6 items shown on-page. */
  positions: ExpertPosition[];
  /** Slugs of related blog posts. Rendered as a "Featured in" grid. */
  relatedArticles?: string[];
  /** Slugs of topic hubs to surface (matches /topics/[slug]). */
  relatedTopicHubs?: string[];
  /** Slugs of related podcast episodes. */
  relatedEpisodes?: string[];
  /** ISO date this entity entry was last reviewed. Drives sitemap lastmod. */
  lastReviewed?: string;
}

export interface ExpertEntityMeta extends ExpertEntityFrontmatter {
  slug: string;
}

export interface ExpertEntityFull extends ExpertEntityMeta {
  /** Raw MDX body — the "why their work matters to your cycling" prose. */
  content: string;
}

function ensureDir() {
  if (!fs.existsSync(ENTITIES_DIR)) {
    fs.mkdirSync(ENTITIES_DIR, { recursive: true });
  }
}

export function getAllEntitySlugs(): string[] {
  ensureDir();
  return fs
    .readdirSync(ENTITIES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getAllEntities(): ExpertEntityMeta[] {
  ensureDir();
  return fs
    .readdirSync(ENTITIES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const filePath = path.join(ENTITIES_DIR, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);
      return { ...(data as ExpertEntityFrontmatter), slug };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getEntityBySlug(slug: string): ExpertEntityFull | null {
  ensureDir();
  const filePath = path.join(ENTITIES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  return { ...(data as ExpertEntityFrontmatter), slug, content };
}
