import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "cycling-mobility-routine";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("cycling mobility search owner", () => {
  it("keeps a reviewed, query-matched practical owner", () => {
    expect(owner.data.seoTitle).toBe(
      "Cycling Mobility Routine: 15-Minute Plan",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(5);
    expect(owner.data.faq).toHaveLength(7);

    for (const exercise of [
      "Cat-cow",
      "Open-book rotation",
      "90/90 hip switches",
      "Half-kneeling hip-flexor position",
      "Controlled hamstring hinge",
      "Knee-to-wall ankle drill",
      "Glute bridge",
    ]) {
      expect(owner.content).toContain(exercise);
    }
  });

  it("cites ROM, evidence-gap, injury and cycling-biomechanics sources", () => {
    for (const pmid of [
      "37301370",
      "39614059",
      "38457105",
      "38735533",
      "15076777",
      "27784817",
      "41705012",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
    expect(owner.content).toContain("77 studies");
    expect(owner.content).toContain("300 athlete stretching trials");
    expect(owner.content).toContain("only five investigated injury outcomes");
  });

  it("removes universal pain, injury, timing and watt claims", () => {
    const trusted =
      `${JSON.stringify(owner.data)} ${owner.content}`.toLowerCase();
    for (const unsupported of [
      "every cyclist needs",
      "reduces injury risk",
      "shortened hip flexors directly reduce watt output",
      "post-ride is the best window",
      "daily is ideal",
      "this is the single most consequential mobility deficit",
      "you are leaving watts on the table",
      "the fix is almost always in the soft tissue",
      "mobility work is not optional",
      "structural tissue changes take 6-8 weeks",
      "my glutes could not fire properly",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("preserves distinct supporting mobility and stretching intents", () => {
    for (const related of [
      "cycling-stretching-routine",
      "10-minute-mobility-routine-masters-cyclist",
      "cycling-hip-mobility-power-guide",
      "cycling-ankle-mobility-calf-strength-guide",
      "cycling-thoracic-spine-mobility-guide",
    ]) {
      expect(owner.data.relatedPosts).toContain(related);
    }
  });

  it("routes mobility interest into the single attributed app audience", () => {
    expect(owner.content).toContain("](/app?source=mobility-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"mobility-guide"');
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("records GSC demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-cycling-mobility-owner-2026-08-31.md");
    for (const signal of [
      "211 clicks",
      "11,210 impressions",
      "1.9% CTR",
      "average position 8.2",
      "3,908 Google AI-feature impressions",
      "prompt 355",
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
      expect.objectContaining({ id: 355, target_page: `/blog/${OWNER}` }),
    );
  });
});
