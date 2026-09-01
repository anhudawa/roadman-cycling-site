import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "cycling-testosterone-and-training-over-40-guide";
const RETIRED = "free-testosterone-cyclists-50th-percentile-dr-gordon";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const article = matter(read(`content/blog/${OWNER}.mdx`));

describe("cycling testosterone search owner", () => {
  it("keeps the query-matched URL as the reviewed broad owner", () => {
    expect(article.data.seoTitle).toBe(
      "Cycling and Testosterone: Effects, Testing and TRT Rules",
    );
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.lastReviewed).toBe("2026-08-31");
    expect(article.data.evidenceLevel).toBe("moderate");
    expect(article.data.citedClaims).toHaveLength(9);
    expect(article.data.faq).toHaveLength(10);

    for (const heading of [
      "Does cycling increase testosterone?",
      "Can long-term endurance cycling lower testosterone?",
      "Low energy availability is part of the question",
      "Symptoms come before an “optimal” target",
      "How should a male cyclist test testosterone?",
      "Total versus free testosterone",
      "What about age and masters cycling?",
      "Does a cycling crash cause low testosterone?",
      "TRT is medical treatment, not a recovery product",
      "Can a cyclist race on TRT?",
      "What the Roadman app can—and cannot—do",
    ]) {
      expect(article.content).toContain(heading);
    }
  });

  it("retires the competing guest-led page permanently", () => {
    expect(fs.existsSync(path.join(ROOT, `content/blog/${RETIRED}.mdx`))).toBe(
      false,
    );
    const redirects = read("next.config.ts");
    const start = redirects.indexOf(`source: "/blog/${RETIRED}"`);
    expect(start).toBeGreaterThan(-1);
    expect(redirects.slice(start, start + 300)).toContain(
      `"/blog/${OWNER}"`,
    );
    expect(redirects.slice(start, start + 300)).toContain("permanent: true");
  });

  it("cites clinical, exercise, energy-availability and anti-doping evidence", () => {
    for (const source of [
      "https://doi.org/10.1210/jc.2018-00229",
      "https://www.endocrine.org/news-and-advocacy/news-room/2026/statement-on-testosterone-replacement-therapy",
      "https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf",
      "https://www.wada-ama.org/sites/default/files/2023-12/tue_physician_guidelines_male_hypogonadism_-_version_8.1_-_october_2023.pdf",
      "https://www.ukad.org.uk/tue-submission",
    ]) {
      expect(article.content).toContain(source);
    }

    for (const pmid of [
      "35134000",
      "30692929",
      "16268050",
      "32082255",
      "27348623",
      "37052052",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes unsupported diagnosis, optimisation and racing claims", () => {
    const trusted = `${JSON.stringify(article.data)} ${article.content}`.toLowerCase();
    for (const unsupported of [
      "total testosterone is junk",
      "free testosterone is the metric",
      "50th to 75th percentile is the target",
      "fiftieth to seventy-fifth percentile is the target",
      "only 2-3% is biologically active",
      "testosterone declines at roughly 1-2% per year",
      "20-35% less by age 50",
      "sleep is the single most powerful testosterone intervention",
      "most of it before midnight",
      "body fat above 20%",
      "getting to 15-18% body fat",
      "cortisol-to-testosterone ratio is a better marker",
      "every crash you ever had",
      "every crash you walked away from",
      "fifteen minutes of meditation three times a week can halve cortisol",
      "dhea, vitamin d and zinc are the supplemental layer",
      "trt means a ban",
      "there is no therapeutic use exemption",
      "four-year ban",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("removes active references to the retired URL", () => {
    for (const base of ["content", "src/lib", "src/app"]) {
      const files = fs
        .readdirSync(path.join(ROOT, base), { recursive: true })
        .filter((entry) => typeof entry === "string")
        .map((entry) => path.join(ROOT, base, entry as string))
        .filter((entry) => fs.existsSync(entry) && fs.statSync(entry).isFile());

      for (const file of files) {
        const source = read(path.relative(ROOT, file));
        expect(source, file).not.toContain(`/blog/${RETIRED}`);
        expect(source, file).not.toContain(`- ${RETIRED}`);
        expect(source, file).not.toContain(`- "${RETIRED}"`);
      }
    }
  });

  it("routes interest into the single attributed app audience", () => {
    expect(article.content).toContain(
      "](/app?source=testosterone-guide)",
    );
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"testosterone-guide"',
    );
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("records combined demand and extends AI discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-cycling-testosterone-consolidation-2026-08-31.md",
    );
    for (const signal of [
      "58 clicks",
      "6,080 web impressions",
      "1.0% combined CTR",
      "7.1 average position",
      "1,041 Google AI-feature impressions",
      "Prompt **377**",
    ]) {
      expect(brief).toContain(signal);
    }

    for (const slug of [OWNER, RETIRED]) {
      expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${slug}`);
    }
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 377, target_page: `/blog/${OWNER}` }),
    );
  });
});
