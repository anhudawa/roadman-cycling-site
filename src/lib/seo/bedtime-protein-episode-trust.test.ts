import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const EPISODE_SLUG =
  "ep-27-protein-before-bed-builds-cyclists-muscles-faster-new-study";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const episodeSource = read(`content/podcast/${EPISODE_SLUG}.mdx`);
const episode = matter(episodeSource);
const episodeMetadata = { ...episode.data, transcript: "" };

describe("bedtime protein cycling knowledge package", () => {
  it("publishes a complete timestamped and reviewed podcast owner", () => {
    expect(episode.data.updatedDate).toBe("2026-08-31");
    expect(episode.data.seoTitle).toBe(
      "Protein Before Bed for Cyclists: Evidence & Dose",
    );
    expect(episode.data.chapters).toHaveLength(13);
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
    expect(
      episode.data.citations.map((citation: { url: string }) => citation.url),
    ).toEqual(
      expect.arrayContaining([
        "https://pubmed.ncbi.nlm.nih.gov/32811763/",
        "https://pubmed.ncbi.nlm.nih.gov/36686220/",
        "https://pubmed.ncbi.nlm.nih.gov/36857005/",
        "https://pubmed.ncbi.nlm.nih.gov/35599912/",
      ]),
    );
  });

  it("states the direct cycling boundary and removes unsupported promises", () => {
    const trustedCopy = `${JSON.stringify(episodeMetadata)} ${episode.content}`;

    expect(trustedCopy).toContain("more than 2.5g/kg");
    expect(trustedCopy).toContain("no extra recovery or performance benefit");
    expect(trustedCopy).toContain("Total daily protein");
    expect(trustedCopy).not.toContain(
      "skipping pre-sleep protein is the greater risk",
    );
    expect(trustedCopy).not.toContain(
      "surplus calories on top of a normal diet",
    );
    expect(trustedCopy).not.toContain(
      "maximum of 10-15 grams of carbohydrates",
    );
  });

  it("separates the evidence owner from the practical decision protocol", () => {
    const evidencePage = read(
      "content/blog/michael-ormsbee-protein-before-bed-cyclists.mdx",
    );
    const protocolPage = read(
      "content/blog/bedtime-protein-cyclists-recovery-protocol.mdx",
    );

    expect(evidencePage).toContain('lastReviewed: "2026-08-31"');
    expect(evidencePage).toContain("https://pubmed.ncbi.nlm.nih.gov/36686220/");
    expect(evidencePage).toContain("What the systematic evidence says");
    expect(protocolPage).toContain("The 30-second decision");
    expect(protocolPage).toContain("Step 1: Check total daily protein");
    expect(protocolPage).toContain("Step 5: Protect sleep");
    expect(protocolPage).not.toContain("will not move the scale");
    expect(protocolPage).not.toContain("No body composition cost");
  });

  it("keeps the entity and answer layer aligned with the evidence boundary", () => {
    const guestProfiles = read("src/lib/guests/profiles.ts");
    const nutritionAnswers = read("src/lib/answers-data/nutrition.ts");

    expect(guestProfiles).toContain(
      "The professional-cycling trial found no added recovery or performance benefit",
    );
    expect(guestProfiles).not.toContain(
      "skip pre-bed fueling and you can't race the next morning",
    );
    expect(nutritionAnswers).toContain("total daily intake comes first");
    expect(nutritionAnswers).not.toContain(
      "leaving muscles in a catabolic state for eight hours",
    );
  });

  it("places the full owner set in the curated discovery submission", () => {
    const indexNow = read("scripts/submit-indexnow.ts");

    for (const path of [
      `/podcast/${EPISODE_SLUG}`,
      "/blog/michael-ormsbee-protein-before-bed-cyclists",
      "/blog/bedtime-protein-cyclists-recovery-protocol",
      "/guests/michael-ormsbee",
    ]) {
      expect(indexNow).toContain(`\`https://\${HOST}${path}\``);
    }
  });
});
