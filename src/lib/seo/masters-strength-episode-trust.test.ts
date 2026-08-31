import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SLUG =
  "ep-new-study-finally-confirms-what-winning-masters-cyclists-have-known";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const source = read(`content/podcast/${SLUG}.mdx`);
const episode = matter(source);
const trustedCopy = `${JSON.stringify({
  ...episode.data,
  transcript: "",
})} ${episode.content}`;

describe("masters cycling strength podcast knowledge package", () => {
  it("publishes a complete transcript, chapter and source package", () => {
    expect(episode.data.updatedDate).toBe("2026-08-31");
    expect(episode.data.seoTitle).toBe(
      "Strength Training for Cyclists Over 40: Evidence",
    );
    expect(episode.data.youtubeId).toBe("KyMysrsaeAg");
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

  it("anchors the package to cyclist-only evidence and its limits", () => {
    const citationUrls = episode.data.citations.map(
      (citation: { url: string }) => citation.url,
    );

    expect(citationUrls).toEqual(
      expect.arrayContaining([
        "https://pubmed.ncbi.nlm.nih.gov/40632222/",
        "https://pubmed.ncbi.nlm.nih.gov/23914932/",
        "https://pubmed.ncbi.nlm.nih.gov/24862305/",
        "https://pubmed.ncbi.nlm.nih.gov/23256921/",
      ]),
    );
    expect(trustedCopy).toContain("low certainty");
    expect(trustedCopy).toContain("did not establish a special masters subgroup");
    expect(trustedCopy).toContain("not a research-proven minimum");
  });

  it("removes overclaims from every retrievable summary surface", () => {
    for (const unsupported of [
      "benefits appear to be greater for riders over 40",
      "heavy compound movements are the only intervention that works",
      "no negative effect on VO2 max whatsoever",
      "optimal protocol identified",
      "the study proved it works",
    ]) {
      expect(trustedCopy.toLowerCase()).not.toContain(unsupported.toLowerCase());
    }
  });

  it("hands strength intent into the useful tool and single app list", () => {
    expect(episode.content).toContain(
      "](/tools/strength-session-planner)",
    );
    expect(episode.content).toContain(
      "](/app?source=masters-strength-episode)",
    );
    expect(episode.data.relatedPosts).toEqual(
      expect.arrayContaining([
        "cycling-strength-training-guide",
        "strength-training-cyclists-over-50",
        "cycling-gym-exercises-best",
      ]),
    );
  });

  it("records the measured opportunity and submits the owner for discovery", () => {
    const brief = read(
      "docs/seo/masters-strength-episode-package-2026-08-31.md",
    );
    const indexNow = read("scripts/submit-indexnow.ts");

    expect(brief).toContain("8,400 strength-query impressions");
    expect(brief).toContain("79/100");
    expect(brief).toContain("low-certainty");
    expect(indexNow).toContain(`\`https://\${HOST}/podcast/${SLUG}\``);
  });
});
