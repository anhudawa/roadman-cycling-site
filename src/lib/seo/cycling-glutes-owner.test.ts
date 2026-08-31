import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "glute-activation-cyclists-power-leaks";
const RETIRED = "cycling-glute-activation-power-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("cycling glutes search owner", () => {
  it("keeps one reviewed, query-matched owner and retires the duplicate", () => {
    expect(owner.data.seoTitle).toBe(
      "Cycling Glutes: 5 Activation & Strength Exercises",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(5);
    expect(owner.data.faq).toHaveLength(8);
    expect(fs.existsSync(path.join(ROOT, `content/blog/${RETIRED}.mdx`))).toBe(
      false,
    );

    const redirects = read("next.config.ts");
    const start = redirects.indexOf(`source: "/blog/${RETIRED}"`);
    expect(start).toBeGreaterThan(-1);
    expect(redirects.slice(start, start + 260)).toContain(
      `destination: "/blog/${OWNER}"`,
    );
    expect(redirects.slice(start, start + 260)).toContain("permanent: true");
  });

  it("answers the exercise, primer, saddle and before-and-after intents", () => {
    for (const answer of [
      "Five practical glute exercises for cyclists",
      "A three-minute pre-ride glute primer",
      "Why “switched-off glutes” is the wrong model",
      "Activation versus strength",
      "Do not move the saddle just to feel more glute",
      "What “before and after” should mean",
    ]) {
      expect(owner.content).toContain(answer);
    }

    for (const exercise of [
      "Step-up",
      "Split squat",
      "Hip thrust or bridge",
      "Romanian-style hinge",
      "Resisted lateral step",
    ]) {
      expect(owner.content).toContain(exercise);
    }
  });

  it("bounds the guide to cycling, exercise and warm-up evidence", () => {
    for (const pmid of [
      "18093842",
      "25996563",
      "32132843",
      "33344003",
      "28761719",
      "37796168",
      "39231694",
      "35693869",
      "40276368",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }

    const trusted = `${JSON.stringify(owner.data)} ${owner.content}`.toLowerCase();
    for (const unsupported of [
      "your glutes are asleep after eight hours",
      "functionally asleep when you clip in",
      "the glutes wake up eventually",
      "primary driver of hip extension on every pedal stroke",
      "activation before everything else",
      "activation comes before loading",
      "adds 20 watts",
      "find power they didn't know was missing",
      "change your saddle position to engage the glutes",
      "compound lifts reinforce dysfunction",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
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

  it("routes interest into the single attributed app audience", () => {
    expect(owner.content).toContain("](/app?source=glute-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"glute-guide"');
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("records GSC demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-cycling-glutes-owner-2026-08-31.md");
    for (const signal of [
      "259 clicks",
      "44,034 web impressions",
      "4,403 Google AI-feature impressions",
      "0.6% baseline",
      "prompt 356",
    ]) {
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
      expect.objectContaining({ id: 356, target_page: `/blog/${OWNER}` }),
    );
  });
});
