import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const BROAD = "cycling-core-workout-routine";
const PLANK = "core-strength-cyclists-beyond-planks";
const RETIRED = "cycling-core-training-complete-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const broad = matter(read(`content/blog/${BROAD}.mdx`));
const plank = matter(read(`content/blog/${PLANK}.mdx`));
const trustedCopy = `${JSON.stringify(broad.data)} ${broad.content} ${JSON.stringify(plank.data)} ${plank.content}`;

describe("cycling core search owners", () => {
  it("preserves the broad query owner with a current direct routine", () => {
    expect(broad.data.seoTitle).toBe(
      "Core Exercises for Cyclists: 15-Minute Workout",
    );
    expect(broad.data.updatedDate).toBe("2026-08-31");
    expect(broad.data.lastReviewed).toBe("2026-08-31");
    expect(broad.data.reviewedBy).toContain("cited cyclist trial");
    expect(broad.data.evidenceLevel).toBe("emerging");
    expect(broad.data.citedClaims).toHaveLength(5);
    expect(broad.data.keyTakeaways).toHaveLength(6);
    expect(broad.data.faq).toHaveLength(7);

    for (const exercise of [
      "Dead bug",
      "Side plank",
      "Bird dog",
      "Pallof press",
      "Suitcase carry",
    ]) {
      expect(broad.content).toContain(exercise);
    }
  });

  it("keeps plank intent distinct with explicit progression boundaries", () => {
    expect(plank.data.seoTitle).toBe(
      "Planks for Cyclists: Benefits, Limits & Progressions",
    );
    expect(plank.data.updatedDate).toBe("2026-08-31");
    expect(plank.data.lastReviewed).toBe("2026-08-31");
    expect(plank.data.evidenceLevel).toBe("emerging");
    expect(plank.data.citedClaims).toHaveLength(5);
    expect(plank.data.keyTakeaways).toHaveLength(6);
    expect(plank.data.faq).toHaveLength(6);
    expect(plank.content).toContain("## How long should cyclists hold a plank?");
    expect(plank.content).toContain("## A practical plank progression");
    expect(plank.content).toContain(
      "There is no evidence-based universal target",
    );
  });

  it("separates acute cycling mechanics, training and pain evidence", () => {
    for (const pmid of ["18076271", "38817493", "36829378", "27784817"]) {
      expect(broad.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
      expect(plank.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }

    expect(broad.content).toContain("pedal-force and work measures did not");
    expect(broad.content).toContain("each group contained only 12 riders");
    expect(broad.content).toContain("did not validate a generic core routine");
  });

  it("removes transfer guarantees, fixed doses and injury promises", () => {
    for (const unsupported of [
      "directly replicating the demands of pedalling",
      "single best core exercise for cyclists",
      "this is the fix",
      "prevents the hip drop",
      "minimum effective dose",
      "never before hard sessions",
      "core fatigue directly reduces pedalling efficiency",
      "strong core also prevents lower back pain",
      "standing and half-kneeling work transfers better",
      "single highest-transfer",
      "watts are leaking",
      "back-pain insurance",
      "three sessions per week, 15-20 minutes each, is the effective dose",
      "disc injury risk that is not justified",
      "three sessions per week. fifteen to twenty minutes each. that is the dose",
    ]) {
      expect(trustedCopy.toLowerCase()).not.toContain(unsupported.toLowerCase());
    }
  });

  it("retires the weak duplicate and repoints the cluster", () => {
    expect(
      fs.existsSync(path.join(ROOT, `content/blog/${RETIRED}.mdx`)),
    ).toBe(false);

    const config = read("next.config.ts");
    expect(config).toContain(`source: "/blog/${RETIRED}"`);
    expect(config).toContain(`destination: "/blog/${BROAD}"`);

    for (const relativePath of [
      "src/lib/topics.ts",
      "content/topics/cycling-strength-conditioning.mdx",
      "content/blog/cycling-anti-rotation-core-stability-guide.mdx",
    ]) {
      expect(read(relativePath)).not.toContain(`/blog/${RETIRED}`);
    }
  });

  it("routes both surviving intents into one attributed app audience", () => {
    expect(broad.content).toContain("](/app?source=core-workout)");
    expect(plank.content).toContain("](/app?source=core-progressions)");

    const acquisition = read("src/lib/app-acquisition.ts");
    expect(acquisition).toContain('"core-workout"');
    expect(acquisition).toContain('"core-progressions"');
  });

  it("records Web and AI baselines and updates discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-cycling-core-owner-consolidation-2026-08-31.md",
    );
    for (const signal of [
      "250 clicks",
      "8,780 impressions",
      "2.8% CTR",
      "average position 6.9",
      "2,997 impressions",
      "39 clicks",
      "5,817 impressions",
      "1,192 Google AI impressions",
      "one click from 244",
    ]) {
      expect(brief).toContain(signal);
    }

    const indexNow = read("scripts/submit-indexnow.ts");
    expect(indexNow).toContain(`/blog/${BROAD}`);
    expect(indexNow).toContain(`/blog/${PLANK}`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 91, target_page: `/blog/${BROAD}` }),
    );
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 97, target_page: `/blog/${PLANK}` }),
    );
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 351, target_page: `/blog/${BROAD}` }),
    );
  });
});
