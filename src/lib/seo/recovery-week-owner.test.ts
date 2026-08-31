import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "cycling-recovery-week-what-to-actually-do";
const RETIRED = "cycling-rest-week-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("cycling recovery-week search owner", () => {
  it("keeps one reviewed owner and retires the competing guide", () => {
    expect(owner.data.seoTitle).toBe(
      "Cycling Recovery Week: 7-Day Rest Week Plan",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(5);
    expect(owner.data.faq).toHaveLength(7);
    expect(fs.existsSync(path.join(ROOT, `content/blog/${RETIRED}.mdx`))).toBe(
      false,
    );

    const redirects = read("next.config.ts");
    const start = redirects.indexOf(`source: "/blog/${RETIRED}"`);
    expect(start).toBeGreaterThan(-1);
    expect(redirects.slice(start, start + 240)).toContain(
      `destination: "/blog/${OWNER}"`,
    );
    expect(redirects.slice(start, start + 240)).toContain("permanent: true");
  });

  it("answers plan, TSS, masters and intensity modifiers directly", () => {
    for (const answer of [
      "A practical 7-day cycling recovery-week plan",
      "What should recovery-week TSS be?",
      "Masters cyclists: adjust the person, not the birthday",
      "Openers are optional",
      "one to three complete rest days",
    ]) {
      expect(owner.content).toContain(answer);
    }
  });

  it("bounds the protocol to the evidence actually available", () => {
    for (const pmid of [
      "37163550",
      "29345524",
      "26423706",
      "25880787",
      "38753045",
      "23247672",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }

    const trusted = `${JSON.stringify(owner.data)} ${owner.content} ${read(
      "src/lib/answers-data/recovery.ts",
    )}`.toLowerCase();
    for (const unsupported of [
      "standard 3-build-1-recovery mesocycle is the evidence-based",
      "masters cyclists over 35 often benefit",
      "fitness is maintained for 2-3 weeks",
      "feeling flat on days 2-3 is normal",
      "if you feel great on day 2",
      "two minimum. three is often better",
      "hrv trending 15%+ below",
      "resting hr elevated 5-10 bpm",
      "plan a deload week every 3–4 training weeks regardless",
      "after 45, the body's ability to buffer accumulated fatigue declines",
      "the first hard session after a proper deload almost always",
      "down to 35–40% rather than 50%",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("routes app interest into the single attributed waiting list", () => {
    expect(owner.content).toContain("](/app?source=recovery-week)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"recovery-week"');
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("removes active internal references to the retired URL", () => {
    for (const base of ["content", "src/lib"]) {
      const files = fs
        .readdirSync(path.join(ROOT, base), { recursive: true })
        .filter((entry) => typeof entry === "string")
        .map((entry) => path.join(ROOT, base, entry as string))
        .filter((entry) => fs.existsSync(entry) && fs.statSync(entry).isFile());

      for (const file of files) {
        expect(read(path.relative(ROOT, file)), file).not.toContain(
          `/blog/${RETIRED}`,
        );
      }
    }
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-recovery-week-owner-2026-08-31.md");
    for (const signal of ["19,430", "181", "5,712", "prompt 354"]) {
      expect(brief).toContain(signal);
    }

    expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${OWNER}`);
    expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${RETIRED}`);
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 354, target_page: `/blog/${OWNER}` }),
    );
  });
});
