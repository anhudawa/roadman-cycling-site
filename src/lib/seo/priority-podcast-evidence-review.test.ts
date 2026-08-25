import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { getEpisodeBySlug } from "../podcast";

const PRIORITY_EPISODES = [
  "ep-2043-i-tried-creatine-for-30-days-the-results-shocked-me",
  "ep-2064-5-easy-fixes-for-numb-hands-while-cycling",
  "ep-2036-5-exercises-pogacar-always-does-before-a-ride",
] as const;

const ALLOWED_SOURCE_HOSTS = new Set(["doi.org", "pubmed.ncbi.nlm.nih.gov"]);

function rawFrontmatter(slug: string) {
  const raw = readFileSync(
    resolve(process.cwd(), `content/podcast/${slug}.mdx`),
    "utf8",
  );
  return matter(raw).data;
}

function publicSummaryText(data: Record<string, unknown>) {
  const faqs = Array.isArray(data.faq)
    ? data.faq.flatMap((item) => [item.question, item.answer])
    : [];
  return [
    data.description,
    data.seoDescription,
    data.answerCapsule,
    ...(Array.isArray(data.keyTakeaways) ? data.keyTakeaways : []),
    ...faqs,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

describe("priority podcast evidence review queue", () => {
  it("publishes podcast editorial freshness consistently across metadata, schema and sitemaps", () => {
    const pageSource = readFileSync(
      resolve(process.cwd(), "src/app/(content)/podcast/[slug]/page.tsx"),
      "utf8",
    );
    const sitemapSource = readFileSync(
      resolve(process.cwd(), "src/app/sitemap.ts"),
      "utf8",
    );

    expect(pageSource).toContain("modifiedTime: episode.updatedDate");
    expect(pageSource).toContain(
      "dateModified: episode.updatedDate || episode.publishDate",
    );
    expect(pageSource).toContain("<time dateTime={episode.updatedDate}>");
    expect(
      sitemapSource.match(/ep\.updatedDate \?\? ep\.publishDate/g),
    ).toHaveLength(2);
  });

  it.each(PRIORITY_EPISODES)(
    "keeps every proposed claim and source for %s behind human review",
    (slug) => {
      const raw = rawFrontmatter(slug);
      expect(raw.claims.length).toBeGreaterThanOrEqual(4);
      expect(
        raw.claims.every(
          (claim: { reviewed?: boolean }) => claim.reviewed === false,
        ),
      ).toBe(true);

      expect(raw.citations.length).toBeGreaterThanOrEqual(4);
      for (const citation of raw.citations) {
        expect(citation.reviewed).toBe(false);
        expect(citation.type).toBe("paper");
        expect(citation.url).toBeTruthy();
        expect(ALLOWED_SOURCE_HOSTS.has(new URL(citation.url).hostname)).toBe(
          true,
        );
      }

      const publicEpisode = getEpisodeBySlug(slug);
      expect(publicEpisode?.claims).toEqual([]);
      expect(publicEpisode?.citations).toEqual([]);
    },
  );

  it("removes categorical creatine conclusions from the citation-ready summary fields", () => {
    const text = publicSummaryText(rawFrontmatter(PRIORITY_EPISODES[0]));
    expect(text).toContain("uncontrolled");
    expect(text).toContain("no significant endurance-performance improvement");
    expect(text).not.toContain("no endurance drop");
    expect(text).not.toContain("water weight by week two, consistent with");
  });

  it("removes universal and permanent-damage language from the numb-hands summaries", () => {
    const text = publicSummaryText(rawFrontmatter(PRIORITY_EPISODES[1]));
    expect(text).toContain("qualified clinician");
    expect(text).not.toContain("almost always");
    expect(text).not.toContain("permanent damage");
    expect(text).not.toContain("lost hand sensation permanently");
  });

  it("limits the activation summary to the population and protocol actually studied", () => {
    const text = publicSummaryText(rawFrontmatter(PRIORITY_EPISODES[2]));
    expect(text).toContain("prolonged static stretching");
    expect(text).toContain("does not prove");
    expect(text).not.toContain(
      "static stretching before a ride makes you slower",
    );
    expect(text).not.toContain("cut injury rates by up to 50%");
  });
});
