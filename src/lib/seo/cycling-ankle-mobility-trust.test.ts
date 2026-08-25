import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const GUIDE_PATH =
  "content/blog/cycling-ankle-mobility-calf-strength-guide.mdx";

describe("cycling ankle-mobility and calf-strength search trust", () => {
  const guide = read(GUIDE_PATH);
  const parsed = matter(guide);

  it("publishes a reviewed, extractable search owner", () => {
    expect(parsed.data.seoTitle).toBe(
      "Ankle Mobility & Calf Strength for Cyclists",
    );
    expect(parsed.data.updatedDate).toBe("2026-08-25");
    expect(parsed.data.lastReviewed).toBe("2026-08-25");
    expect(parsed.data.reviewedBy).toContain(
      "cited ankle-test, cycling-biomechanics",
    );
    expect(parsed.data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(parsed.data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(
      60,
    );
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(
      100,
    );
    expect(parsed.content.match(/^# /gm)).toBeNull();
  });

  it("uses the wall test as a repeatable measure rather than a diagnosis", () => {
    expect(guide).toContain(
      "Average minimal detectable change was about 1.6cm between clinicians and 1.9cm for the same clinician",
    );
    expect(guide).toContain(
      "10cm as a universal pass mark for cyclists",
    );
    expect(guide).toContain(
      "Range and strength are different",
    );
  });

  it("grounds cycling and Achilles limits in primary or official evidence", () => {
    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/25704110/",
      "https://pubmed.ncbi.nlm.nih.gov/32880133/",
      "https://pubmed.ncbi.nlm.nih.gov/34911507/",
      "https://pubmed.ncbi.nlm.nih.gov/4076940/",
      "https://pubmed.ncbi.nlm.nih.gov/17226060/",
      "https://pubmed.ncbi.nlm.nih.gov/35129429/",
      "https://pubmed.ncbi.nlm.nih.gov/39285616/",
      "https://pubmed.ncbi.nlm.nih.gov/39611662/",
      "https://pubmed.ncbi.nlm.nih.gov/37284136/",
      "https://www.nhs.uk/symptoms/foot-pain/ankle-pain/",
    ]) {
      expect(guide).toContain(url);
    }
    expect(guide).toContain(
      "It does not restrict care to eccentric heel drops",
    );
  });

  it("removes guaranteed fixes, diagnoses and fixed cleat prescriptions", () => {
    for (const staleClaim of [
      "Cycling itself reduces ankle mobility over time",
      "less than 10 cm clearance indicates a meaningful restriction",
      "Three exercises fix it",
      "produces measurable improvement in 4-6 weeks",
      "Most riders gain 2-4 cm",
      "the single most evidence-based intervention",
      "Achilles tendinopathy is the most common lower-leg overuse injury in cyclists over 40",
      "Move it back 2-3 mm and reassess",
      "move it rearward 2-3 mm and ride with it for two weeks",
      "accounts for a significant proportion of cycling-related Achilles injuries",
      "the restriction is likely articular",
      "These are mechanical symptoms that suggest loose bodies",
      "Pain that stays — or worsens — during a ride indicates a tendon",
      "reactive tendinopathy to degenerative tendinopathy",
      "Test yourself. Do the three exercises.",
    ]) {
      expect(guide).not.toContain(staleClaim);
    }
  });

  it("records the GSC decision and adds AI plus discovery measurement", () => {
    const decision = read(
      "docs/seo/gsc-cycling-ankle-mobility-opportunity-2026-08-25.md",
    );
    for (const signal of [
      "2,420 impressions",
      "26 clicks",
      "1.1% CTR",
      "average position 8.7",
      "14 visible query rows",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 208,
          target_page: "/blog/cycling-ankle-mobility-calf-strength-guide",
        }),
      ]),
    );

    expect(read("scripts/submit-indexnow.ts")).toContain(
      "/blog/cycling-ankle-mobility-calf-strength-guide",
    );
  });
});
