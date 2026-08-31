import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const EPISODE_SLUG = "pogacar-tour-de-france-recovery-routine";
const FIRST_HOUR_SLUG = "ep-31-5-things-pogacar-always-does-after-a-ride";
const ARTICLE_SLUG = "pogacar-recovery-routine";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const episode = matter(read(`content/podcast/${EPISODE_SLUG}.mdx`));
const firstHourEpisode = matter(read(`content/podcast/${FIRST_HOUR_SLUG}.mdx`));
const article = matter(read(`content/blog/${ARTICLE_SLUG}.mdx`));
const trustedCopy = `${JSON.stringify({
  ...episode.data,
  transcript: "",
})} ${episode.content} ${JSON.stringify(article.data)} ${article.content}`;

describe("Tour-stage recovery search cluster", () => {
  it("publishes a complete, reviewed Tour-stage episode package", () => {
    expect(episode.data.updatedDate).toBe("2026-08-31");
    expect(episode.data.seoTitle).toBe(
      "Tour de France Stage Recovery: The Overnight Checklist",
    );
    expect(episode.data.youtubeId).toBe("jmCBBk1RJkI");
    expect(episode.data.transcript.length).toBeGreaterThan(15_000);
    expect(episode.data.chapters).toHaveLength(9);
    expect(episode.data.chapters[0].timestamp).toBe("00:00");
    expect(episode.data.segmentTitles).toHaveLength(5);
    expect(episode.data.guestBio.length).toBeGreaterThan(250);
    expect(
      episode.data.citations.every(
        (citation: { reviewed?: boolean }) => citation.reviewed,
      ),
    ).toBe(true);
  });

  it("gives each Pogačar recovery page a distinct search job", () => {
    expect(article.data.seoTitle).toContain("Pogacar's Recovery Routine");
    expect(episode.data.seoTitle).toContain("Tour de France Stage Recovery");
    expect(firstHourEpisode.data.seoTitle).toContain("Evidence vs Observation");
    expect(episode.content).toContain(
      `](/podcast/${FIRST_HOUR_SLUG})`,
    );
    expect(firstHourEpisode.content).toContain(
      `](/podcast/${EPISODE_SLUG})`,
    );
    expect(article.data.relatedEpisodes).toEqual(
      expect.arrayContaining([EPISODE_SLUG, FIRST_HOUR_SLUG]),
    );
  });

  it("anchors the cluster to primary evidence and its limits", () => {
    const citationUrls = episode.data.citations.map(
      (citation: { url: string }) => citation.url,
    );

    expect(citationUrls).toEqual(
      expect.arrayContaining([
        "https://pubmed.ncbi.nlm.nih.gov/28919842/",
        "https://pubmed.ncbi.nlm.nih.gov/41945263/",
        "https://pubmed.ncbi.nlm.nih.gov/32426160/",
        "https://pubmed.ncbi.nlm.nih.gov/33146851/",
        "https://pubmed.ncbi.nlm.nih.gov/36686220/",
      ]),
    );
    expect(trustedCopy).toContain("under four hours");
    expect(trustedCopy).toContain("endurance effects are mixed");
    expect(trustedCopy).toContain("no direct improvement");
  });

  it("removes recovery guarantees from retrievable surfaces", () => {
    for (const unsupported of [
      "workout followed by the undo button",
      "soreness is the signal",
      "works identically at any level",
      "every pro team hands it out",
      "window is real",
      "free gains",
      "sleep wins every single time",
    ]) {
      expect(trustedCopy.toLowerCase()).not.toContain(unsupported.toLowerCase());
    }
  });

  it("routes practical recovery intent into tools and one app list", () => {
    for (const content of [episode.content, article.content]) {
      expect(content).toContain("](/tools/recovery-screen)");
      expect(content).toContain("](/tools/training-readiness)");
      expect(content).toContain("](/app?source=");
    }
  });

  it("records the opportunity and submits both owners for discovery", () => {
    const brief = read("docs/seo/tour-stage-recovery-cluster-2026-08-31.md");
    const indexNow = read("scripts/submit-indexnow.ts");

    expect(brief).toContain("9,910 impressions");
    expect(brief).toContain("79/100");
    expect(brief).toContain("Intent separation");
    expect(indexNow).toContain(
      `\`https://\${HOST}/podcast/${EPISODE_SLUG}\``,
    );
    expect(indexNow).toContain(
      `\`https://\${HOST}/blog/${ARTICLE_SLUG}\``,
    );
  });
});
