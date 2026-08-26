import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { TOOL_LANDING_CONTENT } from "@/lib/tools/landing-content";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const OWNER = "cycling-power-to-weight-ratio-guide";
const OWNER_PATH = `/blog/${OWNER}`;
const RETIRED = "cycling-watts-per-kilo-complete-guide";

describe("cycling W/kg search ownership", () => {
  const raw = read(`content/blog/${OWNER}.mdx`);
  const { data, content } = matter(raw);

  it("publishes one reviewed broad W/kg explainer", () => {
    expect(data.seoTitle).toBe(
      "Cycling W/kg Guide: Power-to-Weight Chart & Calculator",
    );
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.primaryHub).toBe("ftp-training");
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("primary research");
    expect(data.citedClaims).toHaveLength(6);
    expect(data.faq).toHaveLength(6);
    expect(data.howTo.steps).toHaveLength(5);
    expect(data.howTo.totalTime).toBe("PT3M");
    expect(content).toContain("## Cycling W/kg chart");
    expect(content).toContain("## Which Roadman W/kg page should you use?");
  });

  it("grounds duration, climbing, benchmark and energy-safety boundaries", () => {
    for (const source of [
      "https://www.trainingpeaks.com/blog/power-profiling/",
      "https://www.britishcycling.org.uk/knowledge/training/get-started/article/izn20140820-Training-Understanding-Intensity-3--Power-0",
      "https://pubmed.ncbi.nlm.nih.gov/18213539/",
      "https://pubmed.ncbi.nlm.nih.gov/40901017/",
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC8783871/",
      "https://bjsm.bmj.com/content/57/17/1073",
    ]) {
      expect(raw).toContain(source);
    }

    for (const boundary of [
      "W/kg is duration-specific",
      "not the complete climbing equation",
      "not a race-category or population-percentile ranking",
      "There is no context-free threshold",
      "old version of this guide prescribed weight loss",
      "These pages have separate jobs",
    ]) {
      expect(content).toContain(boundary);
    }
  });

  it("removes unsupported rankings and weight-loss prescriptions", () => {
    const tool =
      read("src/app/(content)/tools/wkg/page.tsx") +
      JSON.stringify(TOOL_LANDING_CONTENT.wkg);
    const checked = raw + tool;

    for (const staleClaim of [
      "Most amateurs improve fastest by losing excess weight",
      "If your body fat's above 15%",
      "0.3-0.5 W/kg gain in 12 weeks",
      "The fastest gain is usually 3-4 kg",
      "Grand Tour climbers: 6.0+",
      'label: "Professional"',
      'label: "Semi-pro"',
      'label: "Elite amateur"',
      "single best predictor of climbing speed and overall road cycling performance",
    ]) {
      expect(checked).not.toContain(staleClaim);
    }
  });

  it("retires only the same-job explainer and preserves specialist jobs", () => {
    expect(
      existsSync(resolve(process.cwd(), `content/blog/${RETIRED}.mdx`)),
    ).toBe(false);

    const config = read("next.config.ts");
    const start = config.indexOf(`source: "/blog/${RETIRED}"`);
    const redirect = config.slice(start, start + 240);
    expect(start).toBeGreaterThan(0);
    expect(redirect).toContain(`destination: "${OWNER_PATH}"`);
    expect(redirect).toContain("permanent: true");

    for (const path of [
      "src/app/(content)/tools/wkg/page.tsx",
      "src/lib/glossary.ts",
      "src/lib/answers-data/ftp.ts",
      "content/blog/age-group-ftp-benchmarks-2026.mdx",
      "content/blog/ftp-benchmarks-by-age-and-experience.mdx",
      "content/blog/power-duration-curve-find-your-limiters.mdx",
      "content/blog/watts-per-kg-alpe-dhuez.mdx",
      "content/blog/triathlon-cycling-power-to-weight.mdx",
      "content/podcast/ep-2187-power-to-weight-the-number-that-matters.mdx",
    ]) {
      expect(existsSync(resolve(process.cwd(), path)), path).toBe(true);
    }
  });

  it("keeps the owner, calculator and evidence trust in discovery", async () => {
    const blogUrls = (await sitemap({ id: Promise.resolve("1") })).map(
      (entry) => entry.url,
    );
    expect(blogUrls).toContain(`https://roadmancycling.com${OWNER_PATH}`);
    expect(blogUrls).not.toContain(
      `https://roadmancycling.com/blog/${RETIRED}`,
    );

    const tools = TOOL_LANDING_CONTENT.wkg;
    expect(tools.title).toBe("Cycling W/kg Calculator");
    expect(tools.dateModified).toBe("2026-08-26");
    expect(tools.evidenceSources).toHaveLength(6);
    expect(tools.webAppFeatures).toHaveLength(4);
    expect(tools.answerSummary).toContain("not a race category");

    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Canonical broad watts-per-kilogram explainer",
    );
    expect(read("src/app/llms-full.txt/route.ts")).toContain(
      "canonical broad W/kg interpretation",
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(OWNER_PATH);
  });

  it("records the GSC baseline and AI citation prompts", () => {
    const decision = read(
      "docs/seo/gsc-cycling-wkg-consolidation-2026-08-26.md",
    );
    for (const signal of [
      "453 | 67,699",
      "59 | 7,210",
      "5 clicks, 1,220 impressions",
      "4 clicks, 814 impressions",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 294, target_page: OWNER_PATH }),
    );
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 295, target_page: "/tools/wkg" }),
    );
  });
});
