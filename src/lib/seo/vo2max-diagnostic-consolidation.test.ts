import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const CANONICAL_SLUG = "vo2max-cycling-fixable-reasons-low";
const RETIRED_SLUG = "vo2max-training-cyclists-seven-reasons";

function blogFile(slug: string) {
  return resolve(process.cwd(), `content/blog/${slug}.mdx`);
}

describe("VO2max diagnostic intent consolidation", () => {
  it("permanently redirects the later diagnostic duplicate", () => {
    const config = readFileSync(
      resolve(process.cwd(), "next.config.ts"),
      "utf8",
    );
    const source = `source: "/blog/${RETIRED_SLUG}"`;
    const redirect = config.slice(
      config.indexOf(source),
      config.indexOf(source) + 260,
    );

    expect(config).toContain(source);
    expect(redirect).toContain(
      `destination: "/blog/${CANONICAL_SLUG}"`,
    );
    expect(redirect).toContain("permanent: true");
    expect(existsSync(blogFile(RETIRED_SLUG))).toBe(false);
  });

  it("keeps the incumbent diagnostic current, reviewed and evidence-led", () => {
    const raw = readFileSync(blogFile(CANONICAL_SLUG), "utf8");
    const { data, content } = matter(raw);

    expect(data.publishDate).toBe("2026-03-01");
    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.reviewedBy).toBe("Anthony Walsh");
    expect(data.author).toBe("anthony-walsh");
    expect(data.primaryHub).toBe("vo2max-training");
    expect(data.seoTitle).toMatch(/^Why Is My VO2 Max So Low\?/i);
    expect(data.citedClaims).toHaveLength(5);

    for (const claim of data.citedClaims) {
      expect(claim.claim).toBeTruthy();
      expect(claim.evidenceSource).toBeTruthy();
      expect(claim.practicalImplication).toBeTruthy();
      expect(["strong", "moderate", "emerging", "anecdotal"]).toContain(
        claim.evidenceLevel,
      );
    }

    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/35072942/");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/10484570/");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/21812820/");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/35100494/");
    expect(raw).not.toContain(RETIRED_SLUG);
  });

  it("preserves the cluster's distinct measurement, interval and masters owners", () => {
    const retainedSlugs = [
      "cycling-vo2max-intervals",
      "vo2-max-workouts-cyclists-over-40",
      "vo2max-cycling-what-your-number-means-guide",
    ];

    for (const slug of retainedSlugs) {
      expect(existsSync(blogFile(slug)), slug).toBe(true);
    }
  });

  it("removes the retired slug from active topic and machine routing", () => {
    const activeRoutingFiles = [
      "content/topics/vo2max-training.mdx",
      "src/lib/topics.ts",
      "src/lib/cluster-hubs.ts",
      "src/app/llms-full.txt/route.ts",
    ];

    for (const path of activeRoutingFiles) {
      const raw = readFileSync(resolve(process.cwd(), path), "utf8");
      expect(raw, path).not.toContain(RETIRED_SLUG);
    }
  });
});
