import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SLUG = "ep-31-5-things-pogacar-always-does-after-a-ride";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const source = read(`content/podcast/${SLUG}.mdx`);
const episode = matter(source);
const trustedCopy = `${JSON.stringify({
  ...episode.data,
  transcript: "",
})} ${episode.content}`;

describe("Pogacar recovery podcast knowledge package", () => {
  it("publishes a complete transcript, chapter and source package", () => {
    expect(episode.data.updatedDate).toBe("2026-08-31");
    expect(episode.data.seoTitle).toBe(
      "Pogačar Recovery Routine: Evidence vs Observation",
    );
    expect(episode.data.youtubeId).toBe("uUOHqSQP-ds");
    expect(episode.data.transcript.length).toBeGreaterThan(5_000);
    expect(episode.data.chapters).toHaveLength(10);
    expect(episode.data.chapters[0].timestamp).toBe("00:00");
    expect(episode.data.guestBio.length).toBeGreaterThan(250);
    expect(
      episode.data.claims.every(
        (claim: { reviewed?: boolean }) => claim.reviewed,
      ),
    ).toBe(true);
    expect(
      episode.data.citations.every(
        (citation: { reviewed?: boolean }) => citation.reviewed,
      ),
    ).toBe(true);
  });

  it("anchors every intervention to reviewed evidence and its limits", () => {
    const citationUrls = episode.data.citations.map(
      (citation: { url: string }) => citation.url,
    );

    expect(citationUrls).toEqual(
      expect.arrayContaining([
        "https://pubmed.ncbi.nlm.nih.gov/29663142/",
        "https://pubmed.ncbi.nlm.nih.gov/28919842/",
        "https://pubmed.ncbi.nlm.nih.gov/41945263/",
        "https://pubmed.ncbi.nlm.nih.gov/41103301/",
      ]),
    );
    expect(trustedCopy).toContain("does not consistently improve later recovery");
    expect(trustedCopy).toContain("under four hours");
    expect(trustedCopy).toContain("heterogeneous");
    expect(trustedCopy).toContain("observation or host interpretation");
  });

  it("removes recovery guarantees from every retrievable summary surface", () => {
    for (const unsupported of [
      "Miss it and you're playing catch-up",
      "the 15-minute window is real",
      "protect immune function",
      "stretching is definitely beneficial",
      "standard part of the post-race nutrition stack",
    ]) {
      expect(trustedCopy.toLowerCase()).not.toContain(unsupported.toLowerCase());
    }
  });

  it("hands recovery intent into the useful tools and single app list", () => {
    expect(episode.content).toContain("](/tools/recovery-screen)");
    expect(episode.content).toContain("](/tools/training-readiness)");
    expect(episode.content).toContain("](/app?source=pogacar-recovery-episode)");
    expect(episode.data.relatedPosts).toEqual(
      expect.arrayContaining([
        "cycling-active-recovery-rides-guide",
        "post-ride-recovery-nutrition-cyclists",
        "cycling-recovery-tips",
      ]),
    );
  });

  it("records the measured opportunity and submits the page for discovery", () => {
    const brief = read(
      "docs/seo/pogacar-recovery-episode-package-2026-08-31.md",
    );
    const indexNow = read("scripts/submit-indexnow.ts");

    expect(brief).toContain("9,910 impressions");
    expect(brief).toContain("79/100");
    expect(brief).toContain("single");
    expect(indexNow).toContain(`\`https://\${HOST}/podcast/${SLUG}\``);
  });
});
