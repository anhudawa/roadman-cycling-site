import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "magnesium-cyclists-recovery-performance-guide";
const RETIRED = "cycling-magnesium-performance-recovery-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("cycling magnesium search owner", () => {
  it("keeps one reviewed broad owner and retires the next-day duplicate", () => {
    expect(owner.data.seoTitle).toBe(
      "Magnesium for Cyclists: Food, Supplements and Evidence",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(8);
    expect(
      fs.existsSync(path.join(ROOT, `content/blog/${RETIRED}.mdx`)),
    ).toBe(false);

    const redirects = read("next.config.ts");
    const start = redirects.indexOf(`source: "/blog/${RETIRED}"`);
    expect(start).toBeGreaterThan(-1);
    expect(redirects.slice(start, start + 300)).toContain(
      `destination: "/blog/${OWNER}"`,
    );
    expect(redirects.slice(start, start + 300)).toContain("permanent: true");
  });

  it("answers the broad magnesium-for-cyclists query family", () => {
    for (const answer of [
      "Your magnesium decision in 60 seconds",
      "What magnesium does in the body",
      "How much magnesium do cyclists need?",
      "Are most cyclists magnesium deficient?",
      "Can a blood test diagnose magnesium deficiency?",
      "Does magnesium improve cycling performance?",
      "Does magnesium improve sleep and recovery?",
      "Does magnesium prevent cycling cramps?",
      "Glycinate, citrate or oxide: which form is best?",
      "Supplement dosage, timing and safety",
      "A practical food-first plan",
    ]) {
      expect(owner.content).toContain(answer);
    }
  });

  it("cites intake guidance, athlete evidence and safety boundaries", () => {
    expect(owner.content).toContain(
      "https://www.efsa.europa.eu/en/press/news/150728",
    );
    expect(owner.content).toContain(
      "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/",
    );

    for (const pmid of [
      "22064327",
      "30909645",
      "29637897",
      "22398820",
      "40077784",
      "35184264",
      "40918053",
      "32956536",
      "14596323",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes unsupported deficiency, dose, test, form and benefit claims", () => {
    const trusted = `${JSON.stringify(owner.data)}\n${owner.content}`.toLowerCase();
    for (const unsupported of [
      "most endurance cyclists need 400-600mg",
      "50-80 per cent of the general population",
      "magnesium glycinate is the best",
      "200-400mg 30-60 minutes before bed",
      "absorption rates as low as 4%",
      "red blood cell magnesium is a better marker",
      "optimal rbc magnesium",
      "the downside risk is essentially zero",
      "sleep improvement alone justifies",
      "reasonable probability you are not meeting requirements",
      "magnesium demands increase",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("aligns nutrition discovery surfaces with the owner", () => {
    const topic = read("content/topics/cycling-nutrition.mdx");
    expect(topic).toContain(
      `](/blog/${OWNER})`,
    );
    expect(topic).toContain(
      "Magnesium: Essential, Not an Automatic Supplement",
    );
    expect(read("content/blog/supplements-cyclists-what-works-guide.mdx")).toContain(
      `](/blog/${OWNER})`,
    );
  });

  it("removes active internal references to the retired URL", () => {
    for (const base of ["content", "src/lib"]) {
      const files = fs
        .readdirSync(path.join(ROOT, base), { recursive: true })
        .filter((entry) => typeof entry === "string")
        .map((entry) => path.join(ROOT, base, entry as string))
        .filter((entry) => fs.existsSync(entry) && fs.statSync(entry).isFile())
        .filter(
          (entry) =>
            path.relative(ROOT, entry) !==
            "src/lib/method/protocol-content.ts",
        );

      for (const file of files) {
        const source = read(path.relative(ROOT, file));
        expect(source, file).not.toContain(`/blog/${RETIRED}`);
        expect(source, file).not.toContain(`- ${RETIRED}`);
        expect(source, file).not.toContain(`- "${RETIRED}"`);
      }
    }
  });

  it("routes interest into the existing single attributed app audience", () => {
    expect(owner.content).toContain("](/app?source=magnesium-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"magnesium-guide"');
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-magnesium-guide-bottom",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-cycling-magnesium-owner-2026-08-31.md");
    for (const signal of [
      "94 clicks",
      "approximately 8,970 web impressions",
      "approximately 3,360 Google AI-feature impressions",
      "average position 6.9",
      "prompt 361",
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
      expect.objectContaining({ id: 361, target_page: `/blog/${OWNER}` }),
    );
  });
});
