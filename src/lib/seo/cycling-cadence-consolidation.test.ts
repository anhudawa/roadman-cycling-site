import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const GENERAL_SLUG = "cycling-cadence-optimal-guide";
const MASTERS_SLUG = "cycling-cadence-by-age-masters";
const RETIRED_SLUGS = [
  "cycling-cadence-optimal-rpm-guide",
  "cycling-cadence-finding-your-optimal-rpm-guide",
] as const;

function blogFile(slug: string) {
  return resolve(process.cwd(), `content/blog/${slug}.mdx`);
}

describe("cycling cadence search consolidation", () => {
  it("permanently redirects and removes both general-cadence duplicates", () => {
    const config = readFileSync(
      resolve(process.cwd(), "next.config.ts"),
      "utf8",
    );

    for (const slug of RETIRED_SLUGS) {
      const source = `source: "/blog/${slug}"`;
      const redirect = config.slice(
        config.indexOf(source),
        config.indexOf(source) + 260,
      );
      expect(config).toContain(source);
      expect(redirect).toContain(
        `destination: "/blog/${GENERAL_SLUG}"`,
      );
      expect(redirect).toContain("permanent: true");
      expect(existsSync(blogFile(slug)), slug).toBe(false);
    }
  });

  it("makes the incumbent the reviewed general cadence-chart owner", () => {
    const { data, content } = matter(
      readFileSync(blogFile(GENERAL_SLUG), "utf8"),
    );

    expect(data.title).toMatch(/^Cycling Cadence Chart:/);
    expect(data.primaryHub).toBe("cycling-cadence");
    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.reviewedBy).toContain("Anthony Walsh");
    expect(data.citedClaims).toHaveLength(5);
    expect(content).toContain("## Cycling cadence chart");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/22868209/");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/15503124/");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/10683101/");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/27175601/");
    expect(content.match(/^# /gm)).toBeNull();
  });

  it("keeps the masters page distinct and removes the unsupported age rule", () => {
    const raw = readFileSync(blogFile(MASTERS_SLUG), "utf8");
    const { data, content } = matter(raw);

    expect(data.title).toBe("Cycling Cadence by Age: What Changes After 40?");
    expect(data.primaryHub).toBe("masters-cycling");
    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.reviewedBy).toContain("Matthew Devins");
    expect(data.citedClaims).toHaveLength(5);
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/39088644/");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/24550843/");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/41837585/");
    expect(raw).not.toContain("Most masters cyclists ride 5–10 rpm too low");
    expect(data.answerCapsule).not.toContain("aim for 90–100 rpm");
    expect(JSON.stringify(data.faq)).not.toContain("aim for 90–100 rpm");
    expect(content.match(/^# /gm)).toBeNull();
  });

  it("removes retired slugs from active routing and strengthens canonical paths", () => {
    const activeRoutingFiles = [
      "src/lib/topics.ts",
      "content/topics/cycling-cadence.mdx",
      "content/blog/gear-ratio-cycling-complete-guide.mdx",
      "src/app/(content)/tools/cadence/page.tsx",
    ];

    for (const path of activeRoutingFiles) {
      const raw = readFileSync(resolve(process.cwd(), path), "utf8");
      for (const slug of RETIRED_SLUGS) {
        expect(raw, path).not.toContain(slug);
      }
    }

    const topic = readFileSync(
      resolve(process.cwd(), "content/topics/cycling-cadence.mdx"),
      "utf8",
    );
    expect(topic).toContain(`/blog/${GENERAL_SLUG}`);
    expect(topic).toContain(`/blog/${MASTERS_SLUG}`);
  });

  it("records the GSC decision and extends search and AI discovery", () => {
    const gsc = readFileSync(
      resolve(
        process.cwd(),
        "docs/seo/gsc-cycling-cadence-consolidation-2026-08-25.md",
      ),
      "utf8",
    );
    expect(gsc).toContain("71 clicks, 7,030 impressions, 1.0% CTR");
    expect(gsc).toContain("| `/blog/cycling-cadence-optimal-guide` | 239 | 33,311 | 0.7% | 7.4 |");
    expect(gsc).toContain("0.919 between the two later pages");

    const indexNow = readFileSync(
      resolve(process.cwd(), "scripts/submit-indexnow.ts"),
      "utf8",
    );
    expect(indexNow).toContain("/topics/cycling-cadence");
    expect(indexNow).toContain(`/blog/${GENERAL_SLUG}`);
    expect(indexNow).toContain(`/blog/${MASTERS_SLUG}`);

    const prompts = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "scripts/ai-benchmark-prompts.json"),
        "utf8",
      ),
    ) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 221,
        target_page: `/blog/${GENERAL_SLUG}`,
      }),
    );
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 222,
        target_page: `/blog/${MASTERS_SLUG}`,
      }),
    );
  });
});
