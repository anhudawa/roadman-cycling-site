import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "cycling-tart-cherry-juice-recovery-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("tart cherry for cyclists search owner", () => {
  it("keeps one reviewed recovery, sleep and dose owner", () => {
    expect(owner.data.seoTitle).toBe(
      "Tart Cherry Juice for Cyclists: Does It Work?",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("emerging");
    expect(owner.data.citedClaims).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(8);
  });

  it("answers recovery, cyclist, performance, sleep, dose and buying intent", () => {
    for (const answer of [
      "Your tart-cherry decision in 60 seconds",
      "Why do cyclists drink cherry juice?",
      "What the recovery evidence actually shows",
      "What cyclist trials tell us",
      "Does tart cherry improve cycling performance?",
      "Does tart cherry help cyclists sleep?",
      "Dose and timing: why there is no single protocol",
      "Concentrate, juice, powder, capsules or whole cherries?",
      "Will tart cherry blunt training adaptation?",
      "Safety and medication questions",
      "What to look for when buying tart cherry",
      "Where tart cherry fits in cycling recovery",
      "A practical tart-cherry decision",
    ]) {
      expect(owner.content).toContain(answer);
    }
  });

  it("cites current reviews and positive and null cyclist evidence", () => {
    for (const pmid of [
      "41945263",
      "33440334",
      "39141644",
      "25794236",
      "31986108",
      "40964149",
      "36014779",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes universal dose, sleep, medicine and adaptation claims", () => {
    const trusted = `${JSON.stringify(owner.data)}\n${owner.content}`.toLowerCase();
    for (const unsupported of [
      "reduces doms by 13-26",
      "34-84 minutes",
      "one of the few recovery supplements where",
      "80-100 per day",
      "roughly half the cost",
      "works like ibuprofen",
      "replace anti-inflammatory medication",
      "can interact with blood thinners such as warfarin",
      "this is not a daily supplement",
      "the precautionary principle applies",
      "standard research dosing protocol",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("aligns supporting recovery, nutrition and podcast surfaces", () => {
    for (const surface of [
      "content/topics/cycling-recovery.mdx",
      "content/blog/cycling-anti-inflammatory-foods-recovery-guide.mdx",
      "content/blog/best-recovery-foods-after-cycling.mdx",
      "content/blog/nomio-green-shots-isothiocyanates-cyclists.mdx",
      "content/blog/cycling-supplement-timing-stacking-guide.mdx",
      "content/blog/cycling-joint-supplements-glucosamine-guide.mdx",
      "content/podcast/ep-2114-how-pro-cyclists-boost-their-performance-with-this-magic-dri.mdx",
    ]) {
      expect(read(surface), surface).toContain(`](/blog/${OWNER})`);
    }
  });

  it("routes app interest into the existing single attributed audience", () => {
    expect(owner.content).toContain("](/app?source=tart-cherry-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"tart-cherry-guide"',
    );
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-tart-cherry-guide-bottom",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-tart-cherry-owner-2026-08-31.md");
    for (const signal of ["47", "6,948", "0.7%", "9.4", "1,350", "prompt 367"]) {
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
      expect.objectContaining({ id: 367, target_page: `/blog/${OWNER}` }),
    );
  });
});
