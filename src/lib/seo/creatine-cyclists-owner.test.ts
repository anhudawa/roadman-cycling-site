import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "creatine-for-cyclists-thirty-day-data";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("creatine for cyclists consolidated search owner", () => {
  it("keeps one reviewed broad owner", () => {
    expect(owner.data.seoTitle).toBe(
      "Creatine for Cyclists: Benefits, Dose & Weight Gain",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(7);
    expect(owner.data.faq).toHaveLength(8);
  });

  it("answers endurance, sprint, strength, dose, weight and safety intent", () => {
    for (const answer of [
      "Your creatine decision in 60 seconds",
      "Does creatine improve endurance cycling performance?",
      "What about sprints, attacks and repeated surges?",
      "Creatine and strength training for cyclists",
      "Should masters cyclists take creatine?",
      "Dose: maintenance or loading",
      "Does timing matter?",
      "Weight gain and climbing",
      "Anthony’s 30-day creatine self-test",
      "Does creatine improve cognition?",
      "Do professional cyclists take creatine?",
      "Safety, kidneys, cramps and hydration",
      "Which creatine should cyclists buy?",
      "Where creatine fits in the Roadman app",
      "A practical creatine decision",
    ]) {
      expect(owner.content).toContain(answer);
    }
  });

  it("cites direct endurance, strength, body-mass and cognition evidence", () => {
    for (const pmid of [
      "36877404",
      "38892701",
      "42280321",
      "39519498",
      "39074168",
      "29138605",
      "39042054",
      "39070254",
      "38582412",
      "39564533",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes universal performance, weight, cognition and masters claims", () => {
    const trusted = `${JSON.stringify(owner.data)}\n${owner.content}`.toLowerCase();
    for (const unsupported of [
      "the answer to those questions is yes",
      "the evidence is solid",
      "everyone else — especially masters riders — should be taking this",
      "if you are over 40 and not on creatine",
      "cognitive benefits are real and relevant",
      "for most riders the watts-per-kilogram trade-off favours",
      "creatine accelerates glycogen resynthesis",
      "recovery argument as strong as the performance one",
      "periodise around it",
      "expect 1-2 kg",
      "brand doesn't matter",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("permanently consolidates the three overlapping articles", () => {
    const config = read("next.config.ts");
    for (const duplicate of [
      "cycling-creatine-supplementation-guide",
      "creatine-for-cyclists-30-day-experiment",
      "creatine-for-cyclists-30-day-protocol",
    ]) {
      expect(config).toContain(`source: "/blog/${duplicate}"`);
      expect(
        fs.existsSync(path.join(ROOT, `content/blog/${duplicate}.mdx`)),
      ).toBe(false);
    }
    expect(config.match(new RegExp(`/blog/${OWNER}`, "g"))?.length).toBeGreaterThanOrEqual(3);
  });

  it("aligns the concise answer and internal discovery with the owner", () => {
    for (const surface of [
      "src/lib/answers-data/creatine-trust-override.ts",
      "src/lib/glossary.ts",
      "src/lib/topics.ts",
      "content/blog/supplements-cyclists-what-works-guide.mdx",
      "content/blog/fuelling-self-assessment-cycling-nutrition-guide.mdx",
      "content/blog/nomio-green-shots-isothiocyanates-cyclists.mdx",
    ]) {
      expect(read(surface), surface).toContain(OWNER);
    }
  });

  it("routes app interest into the existing single attributed audience", () => {
    expect(owner.content).toContain("](/app?source=creatine-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"creatine-guide"');
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-creatine-guide-hero",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-creatine-owner-consolidation-2026-08-31.md",
    );
    for (const signal of [
      "188",
      "22,246",
      "5,521",
      "123",
      "10,028",
      "2,822",
      "prompt 368",
    ]) {
      expect(brief).toContain(signal);
    }
    expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${OWNER}`);
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 368, target_page: `/blog/${OWNER}` }),
    );
  });
});
