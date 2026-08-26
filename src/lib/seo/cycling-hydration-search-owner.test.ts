import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { nutritionAnswers } from "@/lib/answers-data/nutrition";
import { highVolumeQuery12Answers } from "@/lib/answers-data/high-volume-queries-12";
import { getToolLanding } from "@/lib/tools/landing-content";
import { TOOLS } from "@/lib/tools-registry";
import { calculateSweatMetrics } from "@/lib/tools/hydration-calculator";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const OWNER = "cycling-hydration-guide";
const SUPPORT = [
  "cycling-electrolytes-sweat-rate-testing-guide",
  "electrolytes-sweat-rate-cycling",
  "cycling-sodium-loading-hydration-guide",
] as const;

describe("cycling hydration search ownership and trust", () => {
  it("keeps one reviewed broad owner and distinct specialist pages", () => {
    const owner = matter(read(`content/blog/${OWNER}.mdx`));

    expect(owner.data.seoTitle).toBe(
      "Cycling Hydration Guide: How Much to Drink on the Bike",
    );
    expect(owner.data.updatedDate).toBe("2026-08-26");
    expect(owner.data.lastReviewed).toBe("2026-08-26");
    expect(owner.data.reviewedBy).toContain("Anthony Walsh");
    expect(owner.data.citedClaims).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(6);
    expect(owner.content).toContain("https://pubmed.ncbi.nlm.nih.gov/41468209/");
    expect(owner.content).toContain("https://pubmed.ncbi.nlm.nih.gov/26102445/");

    for (const slug of SUPPORT) {
      const article = matter(read(`content/blog/${slug}.mdx`));
      expect(article.data.updatedDate).toBe("2026-08-26");
      expect(article.data.lastReviewed).toBe("2026-08-26");
      expect(article.data.reviewedBy).toContain("Anthony Walsh");
      expect(article.data.answerCapsule).toBeTruthy();
      expect(article.data.citedClaims.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("retires the broad duplicates with permanent redirects", () => {
    const redirects = read("next.config.ts");
    const retired = [
      "cycling-hydration-strategy-complete-guide",
      "cycling-hydration-sweat-rate-guide",
    ];

    for (const slug of retired) {
      expect(existsSync(resolve(root, `content/blog/${slug}.mdx`))).toBe(false);
      expect(redirects).toContain(`source: "/blog/${slug}"`);
    }
    expect(
      redirects.match(/destination: "\/blog\/cycling-hydration-guide"/g),
    ).toHaveLength(2);
  });

  it("uses measured inputs and aligned visible and structured tool content", () => {
    const page = read("src/app/(content)/tools/hydration/page.tsx");
    const calculation = read("src/lib/tools/hydration-calculator.ts");
    expect(calculation).toContain("preWeightKg - postWeightKg");
    expect(calculation).toContain("fluidMl / 1000 - urineMl / 1000");
    expect(page).toContain("not a mandatory drinking target");
    expect(page).not.toContain("duration + intensity + temp");

    const result = calculateSweatMetrics({
      preWeightKg: 75,
      postWeightKg: 74.4,
      fluidMl: 750,
      urineMl: 0,
      durationMinutes: 90,
    });
    expect(result.sweatLossLitres).toBeCloseTo(1.35, 6);
    expect(result.sweatRateLitresPerHour).toBeCloseTo(0.9, 6);
    expect(result.netBodyMassChangePercent).toBeCloseTo(0.8, 6);

    const landing = getToolLanding("hydration");
    expect(landing?.title).toBe("Cycling Sweat Rate Calculator");
    expect(landing?.dateModified).toBe("2026-08-26");
    expect(landing?.reviewedBy).toBe("Anthony Walsh");
    expect(landing?.faqs).toHaveLength(5);
    expect(landing?.evidenceSources).toHaveLength(4);

    expect(TOOLS.find(({ slug }) => slug === "hydration")).toMatchObject({
      title: "Cycling Sweat Rate Calculator",
      inputs: ["preWeight", "postWeight", "fluid", "urine", "duration"],
    });
  });

  it("keeps the two hydration answers reviewed and intent-specific", () => {
    const answers = nutritionAnswers.filter(({ slug }) =>
      ["how-much-to-drink-cycling", "do-cyclists-need-electrolytes"].includes(slug),
    );

    expect(answers).toHaveLength(2);
    for (const answer of answers) {
      expect(answer.updatedDate).toBe("2026-08-26");
      expect(answer.reviewedBy).toContain("Anthony Walsh");
      expect(answer.evidenceNote).toBeTruthy();
      expect(answer.faq.length).toBeGreaterThanOrEqual(3);
    }

    const productChoiceAnswer = highVolumeQuery12Answers.find(
      ({ slug }) => slug === "what-to-drink-while-cycling",
    );
    expect(productChoiceAnswer?.updatedDate).toBe("2026-08-26");
    expect(productChoiceAnswer?.reviewedBy).toContain("Anthony Walsh");
    expect(productChoiceAnswer?.directAnswer).toContain(
      "there is no universal bottle-per-hour or sodium dose",
    );
    expect(productChoiceAnswer?.directAnswer).not.toContain("500-750ml");
  });

  it("records the GSC baseline and extends AI and recrawl discovery", () => {
    const decision = read(
      "docs/seo/gsc-cycling-hydration-consolidation-2026-08-26.md",
    );
    expect(decision).toContain("1,265");
    expect(decision).toContain("1,136");
    expect(decision).toContain("8.1 average position");
    expect(decision).toContain("**5 September 2026**");
    expect(decision).toContain("**26 September 2026**");

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Cycling hydration, sweat rate and electrolytes",
    );
    expect(read("src/lib/seo/llms-content.ts")).toContain(OWNER);
    expect(read("scripts/submit-indexnow.ts")).toContain(
      "HYDRATION_TRUST_CLUSTER",
    );
    expect(read("src/app/sitemap.ts")).toContain(
      "`${BASE_URL}/tools/hydration`",
    );

    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts).toContainEqual(
      expect.objectContaining({ id: 248, target_page: `/blog/${OWNER}` }),
    );
    expect(benchmark.prompts).toContainEqual(
      expect.objectContaining({ id: 249, target_page: "/tools/hydration" }),
    );
  });
});
