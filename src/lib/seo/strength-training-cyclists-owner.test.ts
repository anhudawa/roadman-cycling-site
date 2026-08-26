import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "cycling-strength-training-guide";
const RETIRED = "strength-training-cyclists-complete-guide";

describe("strength training for cyclists search ownership", () => {
  it("preserves the established owner and permanently retires the duplicate", () => {
    const config = read("next.config.ts");
    const source = `source: "/blog/${RETIRED}"`;
    const index = config.indexOf(source);

    expect(index).toBeGreaterThan(-1);
    expect(config.slice(index, index + 260)).toContain(
      `destination: "/blog/${OWNER}"`,
    );
    expect(config.slice(index, index + 260)).toContain("permanent: true");
    expect(
      existsSync(resolve(process.cwd(), `content/blog/${RETIRED}.mdx`)),
    ).toBe(false);
  });

  it("makes the broad owner current, direct and evidence-bounded", () => {
    const raw = read(`content/blog/${OWNER}.mdx`);
    const { data, content } = matter(raw);

    expect(data.seoTitle).toBe(
      "Strength Training for Cyclists: Evidence & Plan (2026)",
    );
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("editorial fact-checking");
    expect(data.primaryHub).toBe("cycling-strength-conditioning");
    expect(data.evidenceLevel).toBe("emerging");
    expect(data.citedClaims).toHaveLength(4);
    expect(data.faq).toHaveLength(6);
    expect(data.keywords).toContain("strength training for cyclists");

    expect(content).toContain("17 controlled studies with 262 adult endurance cyclists");
    expect(content).toContain("60 of whom were women");
    expect(content).toContain("The answer in 30 seconds");
    expect(content).toContain("A practical starting plan—not “the proven protocol”");
    expect(content).toContain("the review did not report the “masters subset”");
    expect(content).toContain("low certainty of evidence prevents robust recommendations");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/40632222/");
    expect(content).toContain("https://www.who.int/publications/i/item/9789240015128");

    for (const unsupported of [
      "The science is unequivocal",
      "the science on this is settled",
      "first 8 weeks feel awful",
      "transfer shows up around week 12",
      "masters subset of the meta-analysis is particularly compelling",
    ]) {
      expect(raw.toLowerCase()).not.toContain(unsupported.toLowerCase());
    }
  });

  it("differentiates the topic and pillar from the broad owner", () => {
    const topic = read("content/topics/cycling-strength-conditioning.mdx");
    const pillar = matter(read("content/pillars/strength.mdx"));

    expect(topic).toContain(
      "strength and conditioning research library for cyclists",
    );
    expect(topic).toContain(`/blog/${OWNER}`);
    expect(topic).toContain("Choose your next question");
    expect(topic).toContain("What is supported—and what is not");
    expect(topic).not.toContain("evidence base for heavy compound lifting");
    expect(topic).not.toContain("2x per week year-round produce more power");

    const topics = read("src/lib/topics.ts");
    expect(topics).toContain(
      'title: "Cycling Strength & Conditioning Research Library"',
    );
    expect(topics).not.toContain(
      'title: "Strength Training for Cyclists — The Complete Guide"',
    );

    expect(pillar.data.seoTitle).toBe(
      "Cycling Strength & Conditioning Library | Roadman",
    );
    expect(pillar.data.featuredPostSlugs[0]).toBe(OWNER);
    expect(pillar.content).toContain("without competing with the broad owner");
  });

  it("records the GSC baseline and extends AI and crawler discovery", () => {
    const decision = read(
      "docs/seo/gsc-strength-training-opportunity-2026-08-26.md",
    );
    expect(decision).toContain("90 clicks");
    expect(decision).toContain("1,575 impressions");
    expect(decision).toContain("5.7% CTR");
    expect(decision).toContain("Average position 7.0");
    expect(decision).toContain("earliest reliable review\n  **5 September 2026**");
    expect(decision).toContain("earliest reliable review\n  **26 September 2026**");

    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      `/blog/${OWNER}`,
      "/topics/cycling-strength-conditioning",
      "/blog/strength-training-cyclists-over-50",
    ]) {
      expect(indexNow).toContain(path);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 236,
        prompt: "what strength training should cyclists do and how often",
        target_page: `/blog/${OWNER}`,
      }),
    );
  });
});
