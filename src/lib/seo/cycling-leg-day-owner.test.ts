import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { getAnswerBySlug } from "@/lib/answers";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const LEG_DAY = "cycling-leg-day-should-cyclists";
const GYM_EXERCISES = "cycling-gym-exercises-best";
const LEG_DAY_PATH = `/blog/${LEG_DAY}`;
const GYM_EXERCISES_PATH = `/blog/${GYM_EXERCISES}`;

const legDay = matter(read(`content/blog/${LEG_DAY}.mdx`));
const gymExercises = matter(read(`content/blog/${GYM_EXERCISES}.mdx`));

describe("cycling leg-day and gym-exercise search ownership", () => {
  it("makes the leg-day owner direct, reviewed and evidence bounded", () => {
    expect(legDay.data.seoTitle).toBe(
      "Leg Day for Cyclists: Does Cycling Count? (2026)",
    );
    expect(legDay.data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(legDay.data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(legDay.data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(legDay.data.updatedDate).toBe("2026-08-26");
    expect(legDay.data.lastReviewed).toBe("2026-08-26");
    expect(legDay.data.reviewedBy).toContain("claims checked");
    expect(legDay.data.evidenceLevel).toBe("emerging");
    expect(legDay.data.citedClaims).toHaveLength(6);
    expect(legDay.data.faq).toHaveLength(6);
    expect(legDay.data.howTo.steps).toHaveLength(5);
    expect(legDay.data.howTo.totalTime).toBe("PT10M");
    expect(legDay.content).toContain("## Does cycling count as leg day?");
    expect(legDay.content).toContain("## Can you cycle after leg day?");
    expect(legDay.content).toContain("## Which Roadman page should you use?");
  });

  it("makes the gym owner an exercise-selection and routine page", () => {
    expect(gymExercises.data.seoTitle).toBe(
      "Best Gym Exercises for Cyclists: Evidence & Routine",
    );
    expect(gymExercises.data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(gymExercises.data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(gymExercises.data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(gymExercises.data.updatedDate).toBe("2026-08-26");
    expect(gymExercises.data.lastReviewed).toBe("2026-08-26");
    expect(gymExercises.data.reviewedBy).toContain("claims checked");
    expect(gymExercises.data.evidenceLevel).toBe("emerging");
    expect(gymExercises.data.citedClaims).toHaveLength(6);
    expect(gymExercises.data.faq).toHaveLength(6);
    expect(gymExercises.data.howTo.steps).toHaveLength(6);
    expect(gymExercises.data.howTo.totalTime).toBe("PT12M");
    expect(gymExercises.content).toContain("## Adaptable A/B gym routine");
    expect(gymExercises.content).toContain("### Session A");
    expect(gymExercises.content).toContain("### Session B");
    expect(gymExercises.content).toContain(
      "## Which Roadman page should you use?",
    );
  });

  it("grounds both owners in current named sources", () => {
    for (const source of [
      "https://pubmed.ncbi.nlm.nih.gov/40632222/",
      "https://pubmed.ncbi.nlm.nih.gov/41762427/",
      "https://pubmed.ncbi.nlm.nih.gov/42410632/",
      "https://pubmed.ncbi.nlm.nih.gov/24862305/",
    ]) {
      expect(legDay.content).toContain(source);
      expect(gymExercises.content).toContain(source);
    }
    expect(legDay.content).toContain(
      "https://www.who.int/publications/i/item/9789240015128",
    );
  });

  it("publishes safe reviewed short answers across the decision cluster", () => {
    const slugs = [
      "best-gym-exercises-for-cyclists",
      "how-many-strength-sessions-cyclists",
      "will-lifting-make-me-slower",
      "are-squats-good-for-cyclists",
      "when-to-lift-around-rides",
    ];
    const answers = slugs.map((slug) => getAnswerBySlug(slug));

    for (const answer of answers) {
      expect(answer).not.toBeNull();
      expect(answer?.updatedDate).toBe("2026-08-26");
      expect(answer?.reviewedBy).toBe("Anthony Walsh");
      expect(answer?.evidenceLevel).toBe("emerging");
      expect(answer?.sources).toHaveLength(4);
      expect(answer?.faq).toHaveLength(6);
    }

    const rendered = JSON.stringify(answers);
    for (const unsafe of [
      "The 8 exercises that transfer most directly",
      "One session a week maintains; two progresses; three",
      "injury rates fall",
      "the most cycling-specific squat variations",
      "Mark the 48-hour no-lift zone",
      "no later than 72 hours before",
    ]) {
      expect(rendered).not.toContain(unsafe);
    }

    expect(getAnswerBySlug("when-to-lift-around-rides")?.directAnswer).toContain(
      "There is no universal rule",
    );
    expect(
      getAnswerBySlug("best-gym-exercises-for-cyclists")?.directAnswer,
    ).toContain("There is no research-ranked list");
  });

  it("aligns crawler discovery, prompt measurement and IndexNow", () => {
    const pinned = read("src/lib/seo/llms-content.ts");
    expect(pinned).toContain(`"${LEG_DAY}"`);
    expect(pinned).toContain(`"${GYM_EXERCISES}"`);

    const shortLlms = read("src/app/llms.txt/route.ts");
    const fullLlms = read("src/app/llms-full.txt/route.ts");
    expect(shortLlms).toContain("Strength, gym exercise and leg-day queries");
    expect(shortLlms).toContain(LEG_DAY_PATH);
    expect(shortLlms).toContain(GYM_EXERCISES_PATH);
    expect(fullLlms).toContain(LEG_DAY_PATH);
    expect(fullLlms).toContain(GYM_EXERCISES_PATH);

    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      LEG_DAY_PATH,
      GYM_EXERCISES_PATH,
      "/answers/best-gym-exercises-for-cyclists",
      "/answers/when-to-lift-around-rides",
    ]) {
      expect(indexNow).toContain(path);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 300, target_page: LEG_DAY_PATH }),
    );
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 301, target_page: GYM_EXERCISES_PATH }),
    );
  });

  it("records the non-additive GSC baseline and review checkpoints", () => {
    const decision = read(
      "docs/seo/gsc-cycling-leg-day-owner-2026-08-26.md",
    );
    for (const signal of [
      "670 | 63,183 | 1.1% | 6.0",
      "394 | 11,600 | 3.4% | 6.1",
      "0 | 175 | 0% | 4.9",
      "23 / 155 / 14.8% / 3.8",
      "must not be summed",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
