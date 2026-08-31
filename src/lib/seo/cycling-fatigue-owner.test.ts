import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "cycling-fatigue-signs-when-to-back-off";
const RETIRED = [
  "cycling-overtraining-signs-guide",
  "recognising-overtraining-cyclists-guide",
] as const;
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("cycling fatigue search owner", () => {
  it("keeps one reviewed owner and retires both broad duplicates", () => {
    expect(owner.data.seoTitle).toBe(
      "Cycling Fatigue Signs: When to Back Off or Get Help",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(5);
    expect(owner.data.faq).toHaveLength(8);

    const redirects = read("next.config.ts");
    for (const retired of RETIRED) {
      expect(
        fs.existsSync(path.join(ROOT, `content/blog/${retired}.mdx`)),
      ).toBe(false);
      const start = redirects.indexOf(`source: "/blog/${retired}"`);
      expect(start).toBeGreaterThan(-1);
      expect(redirects.slice(start, start + 280)).toContain(
        `destination: "/blog/${OWNER}"`,
      );
      expect(redirects.slice(start, start + 280)).toContain("permanent: true");
    }
  });

  it("answers symptoms, action, monitoring limits and escalation directly", () => {
    for (const answer of [
      "The back-off decision in 60 seconds",
      "Seven cycling fatigue signs worth tracking",
      "What resting heart rate and HRV cannot tell you",
      "Fatigue, overreaching and overtraining are not synonyms",
      "A practical 48-hour reset",
      "When persistent fatigue needs medical assessment",
    ]) {
      expect(owner.content).toContain(answer);
    }

    expect(owner.content).toContain("Chest pain, fainting");
    expect(owner.content).toContain("diagnosis of exclusion");
    expect(owner.content).toContain("no gold-standard test");
  });

  it("cites consensus and reviews for diagnosis, monitoring, HRV and REDs", () => {
    for (const pmid of [
      "23247672",
      "34496702",
      "34108275",
      "26423706",
      "18308872",
      "33533045",
      "37752011",
      "29713319",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes the former diagnostic thresholds and treatment promises", () => {
    const trusted = [
      `${JSON.stringify(owner.data)} ${owner.content}`,
      read("content/topics/cycling-recovery.mdx"),
      read("content/topics/cycling-plateaus.mdx"),
      read("content/blog/cycling-hrv-training-guide.mdx"),
      read("content/blog/cycling-recovering-from-overtraining-guide.mdx"),
      read("src/lib/problems.ts"),
    ]
      .join("\n")
      .toLowerCase();

    for (const unsupported of [
      "5+ beats above baseline for three or more consecutive days",
      "one warning sign in isolation is a data point",
      "two concurrent signs are a warning",
      "three or more concurrent signs",
      "functional overreaching resolves in 1-2 weeks",
      "true overtraining syndrome can require 3-6 months",
      "hrv trending below your personal baseline for five",
      "single most reliable early warning",
      "blood work is not optional here",
      "performance does not recover after two weeks of complete rest",
      "increase vitamin d",
      "increase protein to 2.0g/kg",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("preserves distinct comparison, persistent-fatigue and recovery intents", () => {
    for (const related of [
      "overtraining-vs-overreaching-cyclists",
      "cycling-chronic-fatigue-when-tiredness-persists-guide",
      "cycling-recovering-from-overtraining-guide",
    ]) {
      expect(owner.data.relatedPosts).toContain(related);
      expect(fs.existsSync(path.join(ROOT, `content/blog/${related}.mdx`))).toBe(
        true,
      );
    }
  });

  it("removes active internal references to both retired URLs", () => {
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
    expect(owner.content).toContain("](/app?source=fatigue-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"fatigue-guide"');
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-cycling-fatigue-owner-2026-08-31.md");
    for (const signal of [
      "400 clicks",
      "23,314 web impressions",
      "6,554 Google AI-feature impressions",
      "average position 6.1",
      "prompt 357",
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
      expect.objectContaining({ id: 357, target_page: `/blog/${OWNER}` }),
    );
  });
});
