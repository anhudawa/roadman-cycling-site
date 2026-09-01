import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "iron-deficiency-cyclists-masters";
const RETIRED = [
  "cycling-iron-ferritin-endurance-guide",
  "cycling-iron-deficiency-performance-guide",
] as const;
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const article = matter(read(`content/blog/${OWNER}.mdx`));

describe("cyclist iron-deficiency search owner", () => {
  it("keeps the established URL as the reviewed broad owner", () => {
    expect(article.data.seoTitle).toBe(
      "Iron Deficiency in Cyclists: Symptoms, Tests and Treatment",
    );
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.lastReviewed).toBe("2026-08-31");
    expect(article.data.evidenceLevel).toBe("moderate");
    expect(article.data.citedClaims).toHaveLength(9);
    expect(article.data.faq).toHaveLength(10);

    for (const heading of [
      "What iron does—and what cycling data cannot prove",
      "Who is more likely to need iron assessment?",
      "Masters cyclists: age is not the cause",
      "Which blood tests assess iron status?",
      "What ferritin level should a cyclist have?",
      "Exercise, hepcidin and the timing question",
      "What the treatment evidence actually shows",
      "Oral iron: clinician-led, not one best form",
      "Intravenous iron is not a performance shortcut",
      "Can you train while iron deficient?",
      "A safe cyclist iron pathway",
    ]) {
      expect(article.content).toContain(heading);
    }
  });

  it("retires both duplicate iron and ferritin guides permanently", () => {
    const redirects = read("next.config.ts");
    for (const retired of RETIRED) {
      expect(
        fs.existsSync(path.join(ROOT, `content/blog/${retired}.mdx`)),
      ).toBe(false);
      const start = redirects.indexOf(`source: "/blog/${retired}"`);
      expect(start).toBeGreaterThan(-1);
      expect(redirects.slice(start, start + 260)).toContain(
        `destination: "/blog/${OWNER}"`,
      );
      expect(redirects.slice(start, start + 260)).toContain("permanent: true");
    }
  });

  it("cites screening, performance, treatment, absorption and REDs evidence", () => {
    for (const official of [
      "https://www.who.int/publications/i/item/9789240000124",
      "https://www.nhs.uk/conditions/iron-deficiency-anaemia/",
    ]) {
      expect(article.content).toContain(official);
    }

    for (const pmid of [
      "31055680",
      "31901316",
      "38407751",
      "39536912",
      "35661896",
      "33184627",
      "37752011",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes unsupported thresholds, promises and treatment protocols", () => {
    const trusted = `${JSON.stringify(article.data)} ${article.content}`.toLowerCase();

    for (const unsupported of [
      "endurance cyclists need ferritin above 50",
      "ideally 70-150",
      "ferritin: 50-150",
      "functionally compromised on the bike",
      "increased aerobic decoupling",
      "correcting deficiency typically yields a 3-7% power increase",
      "gain 10-15 watts",
      "test ferritin at least twice a year",
      "routine ferritin screening every 6 months is not optional",
      "female cyclists face roughly double",
      "ferrous bisglycinate is the preferred",
      "alternate-day dosing often outperforms",
      "ferritin is very low (below 20",
      "raise ferritin significantly within 1-2 weeks",
      "every fourth ride",
      "foot-strike haemolysis from pedal impacts",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("removes active references to both retired URLs", () => {
    for (const base of ["content", "src/lib"]) {
      const files = fs
        .readdirSync(path.join(ROOT, base), { recursive: true })
        .filter((entry) => typeof entry === "string")
        .map((entry) => path.join(ROOT, base, entry as string))
        .filter((entry) => fs.existsSync(entry) && fs.statSync(entry).isFile());

      for (const file of files) {
        const source = read(path.relative(ROOT, file));
        for (const retired of RETIRED) {
          expect(source, file).not.toContain(`/blog/${retired}`);
          expect(source, file).not.toContain(`- ${retired}`);
          expect(source, file).not.toContain(`- "${retired}"`);
        }
      }
    }
  });

  it("routes interest into the single attributed app audience", () => {
    expect(article.content).toContain("](/app?source=iron-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"iron-guide"');
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("records combined demand and extends AI discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-cyclist-iron-deficiency-consolidation-2026-08-31.md",
    );
    for (const signal of [
      "179 clicks",
      "11,520 web impressions",
      "1.6% combined CTR",
      "5.6 average position",
      "6,600 Google AI-feature impressions",
      "Prompt **376**",
    ]) {
      expect(brief).toContain(signal);
    }

    for (const slug of [OWNER, ...RETIRED]) {
      expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${slug}`);
    }
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 376, target_page: `/blog/${OWNER}` }),
    );
  });
});
