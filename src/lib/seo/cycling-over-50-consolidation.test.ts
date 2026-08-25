import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const CANONICAL_SLUG = "cycling-over-50-training";
const RETIRED_SLUG = "cycling-over-50-evidence-based-training-guide";

function blogFile(slug: string) {
  return resolve(process.cwd(), `content/blog/${slug}.mdx`);
}

describe("cycling-over-50 intent consolidation", () => {
  it("permanently redirects the weaker duplicate to the established guide", () => {
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

  it("keeps the incumbent URL current, reviewed and evidence-led", () => {
    const raw = readFileSync(blogFile(CANONICAL_SLUG), "utf8");
    const { data, content } = matter(raw);

    expect(data.publishDate).toBe("2026-01-16");
    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.reviewedBy).toBe("Anthony Walsh");
    expect(data.primaryHub).toBe("masters-cycling");
    expect(data.seoTitle).toMatch(/Cycling Over 50 Training/i);
    expect(data.citedClaims).toHaveLength(5);

    for (const claim of data.citedClaims) {
      expect(claim.claim).toBeTruthy();
      expect(claim.evidenceSource).toBeTruthy();
      expect(claim.practicalImplication).toBeTruthy();
      expect(["strong", "moderate", "emerging", "anecdotal"]).toContain(
        claim.evidenceLevel,
      );
    }

    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/2361923/");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/36078762/");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/31343601/");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/23867520/");
    expect(raw).not.toContain(RETIRED_SLUG);
  });

  it("removes the retired slug from active topic, answer and AI routing", () => {
    const activeRoutingFiles = [
      "src/lib/topics.ts",
      "src/lib/answers-data/high-volume-queries-3.ts",
      "scripts/ai-benchmark-prompts.json",
      "docs/canonical-clusters.md",
    ];

    for (const path of activeRoutingFiles) {
      const raw = readFileSync(resolve(process.cwd(), path), "utf8");
      expect(raw, path).not.toContain(RETIRED_SLUG);
    }

    const owners = readFileSync(
      resolve(process.cwd(), "src/lib/seo/search-ownership.ts"),
      "utf8",
    );
    expect(owners).toContain('"cycling over 50"');
    expect(owners).toContain(`path: "/blog/${CANONICAL_SLUG}"`);
  });
});
