import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "massage-guns-cyclists-worth-it";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("massage guns for cyclists search owner", () => {
  it("keeps one reviewed broad and buying-intent owner", () => {
    expect(owner.data.seoTitle).toBe(
      "Massage Guns for Cyclists: Do They Work?",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("emerging");
    expect(owner.data.citedClaims).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(8);
  });

  it("answers benefits, recovery, protocol, safety and buying intent", () => {
    for (const answer of [
      "Your massage-gun decision in 60 seconds",
      "What does the research actually show?",
      "Range of motion: the clearest practical use",
      "Recovery and soreness: the 2026 evidence update",
      "Does a massage gun improve cycling performance?",
      "How long, how hard and which attachment?",
      "Before or after cycling?",
      "Massage-gun safety for cyclists",
      "Massage gun versus foam roller",
      "What to look for when buying a massage gun",
      "Where massage guns fit in recovery",
      "A practical massage-gun decision",
    ]) {
      expect(owner.content).toContain(answer);
    }
  });

  it("cites massage-gun reviews, an acute trial and safety evidence", () => {
    for (const pmid of [
      "37754971",
      "37020441",
      "33239942",
      "42286692",
      "33156927",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes universal, mechanical, performance and price claims", () => {
    const trusted = `${JSON.stringify(owner.data)}\n${owner.content}`.toLowerCase();
    for (const unsupported of [
      "two proven jobs",
      "real and underrated role",
      "1–2 minutes per muscle",
      "pre-ride activation tool",
      "primes range of motion",
      "break down scar tissue",
      "percussive therapy targets superficial tissue",
      "the depth of effect is shallower",
      "mid-range devices deliver the same physiological effect",
      "a solid mid-range gun does the same job",
      "the extra money buys battery life",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("aligns recovery and sports-massage surfaces with the owner", () => {
    for (const surface of [
      "content/topics/cycling-recovery.mdx",
      "content/blog/cycling-recovery-tips.mdx",
      "content/blog/cycling-sports-massage-when-and-why-guide.mdx",
    ]) {
      expect(read(surface), surface).toContain(`](/blog/${OWNER})`);
    }

    const recovery = read("src/lib/answers-data/recovery.ts");
    expect(recovery).toContain(`/blog/${OWNER}`);
    const foamAnswer = recovery.slice(
      recovery.indexOf('slug: "foam-rolling-massage-recovery"'),
      recovery.indexOf("// MONITORING RECOVERY AND READINESS"),
    );
    expect(foamAnswer).not.toContain("similar short-term effects");
    expect(foamAnswer).not.toContain("same broad mechanism");
  });

  it("routes product interest into the existing single attributed audience", () => {
    expect(owner.content).toContain("](/app?source=massage-gun-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"massage-gun-guide"',
    );
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-massage-gun-guide-hero",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-massage-guns-owner-2026-08-31.md");
    for (const signal of ["55", "1,469", "3.7%", "7.0", "494", "prompt 366"]) {
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
      expect.objectContaining({ id: 366, target_page: `/blog/${OWNER}` }),
    );
  });
});
