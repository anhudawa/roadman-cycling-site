import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const EPISODE_PATH =
  "content/podcast/ep-1-pro-bike-fitter-reveals-the-1-change-amateurs-should-make.mdx";

describe("Daryl Fitzgerald podcast and entity search trust", () => {
  const source = read(EPISODE_PATH);
  const parsed = matter(source);
  const summaryText = [
    parsed.data.title,
    parsed.data.description,
    parsed.data.seoTitle,
    parsed.data.seoDescription,
    parsed.data.answerCapsule,
    ...(parsed.data.keyTakeaways ?? []),
    ...(parsed.data.faq ?? []).flatMap(
      (item: { question: string; answer: string }) => [
        item.question,
        item.answer,
      ],
    ),
    parsed.content,
  ].join("\n");

  it("owns Daryl Fitzgerald interview and transcript intent", () => {
    expect(parsed.data.title).toBe(
      "Daryl Fitzgerald Bike-Fit Podcast: Saddle Height, Cranks and Fit",
    );
    expect(parsed.data.seoTitle).toBe(
      "Daryl Fitzgerald Bike-Fit Podcast & Transcript",
    );
    expect(parsed.data.updatedDate).toBe("2026-08-25");
    expect(parsed.data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(parsed.data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(
      60,
    );
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(
      100,
    );
    expect(parsed.data.topicTags).toEqual(
      expect.arrayContaining(["bike-fitting", "cycling-strength-conditioning"]),
    );
    expect(parsed.content.match(/^# /gm)).toBeNull();
    expect(parsed.content).toContain(
      "This episode page owns searches for the **Daryl Fitzgerald podcast, interview, audio, video and transcript**",
    );
  });

  it("keeps the transcript but labels surfaced claims by evidence type", () => {
    expect(parsed.data.transcript).toContain("always saddle height");
    expect(parsed.data.transcript).toContain("Go one mm at a time");
    expect(parsed.data.claims).toHaveLength(5);
    expect(parsed.data.claims.map((claim: { evidence: string }) => claim.evidence)).toEqual([
      "practice",
      "practice",
      "anecdote",
      "anecdote",
      "expert",
    ]);
    expect(
      parsed.data.claims.every(
        (claim: { reviewed?: boolean }) => claim.reviewed === true,
      ),
    ).toBe(true);
    for (const phrase of [
      "practitioner observation",
      "one client",
      "cannot isolate the saddle change as the cause",
      "not a controlled crank-length study",
      "not proof of population prevalence, causation or a universal adjustment",
    ]) {
      expect(summaryText).toContain(phrase);
    }
  });

  it("removes universal claims from every citation-ready editorial field", () => {
    for (const staleClaim of [
      "most amateur cyclists are sitting 5 to 7mm too high",
      "the single most common error is a saddle set too high, typically by 5 to 7mm",
      "the gain came entirely from improved aerodynamic position",
      "causes the saddle sores most riders blame on the saddle model",
      "at exactly the same power output",
      "still be leaving 15-20 watts on the table",
      "a 7mm reduction in saddle height produced",
      "shorter cranks (165mm) cause 20-30 watt power losses",
    ]) {
      expect(summaryText.toLowerCase()).not.toContain(staleClaim.toLowerCase());
    }
  });

  it("connects the episode to research, the companion owner and fresh review date", () => {
    for (const target of [
      "/blog/daryl-fitzgerald-saddle-height-one-change",
      "/blog/bike-fit-guide-cyclists",
      "/topics/bike-fitting",
      "https://pubmed.ncbi.nlm.nih.gov/34706617/",
      "https://pubmed.ncbi.nlm.nih.gov/32022807/",
      "https://pubmed.ncbi.nlm.nih.gov/35151569/",
    ]) {
      expect(source).toContain(target);
    }
    expect(read("src/app/(content)/podcast/[slug]/page.tsx")).toContain(
      "lastReviewed={episode.updatedDate ?? episode.publishDate}",
    );
  });

  it("corrects the Daryl guest entity and directory language", () => {
    const profiles = read("src/lib/guests/profiles.ts");
    const daryl = profiles.split('"daryl-fitzgerald": {')[1].split('"sam-calder": {')[0];
    expect(daryl).toContain("Bike fitter and coach at Science to Sport");
    expect(daryl).toContain("practice experience or anecdotes");
    expect(daryl).toContain('relatedHubs: ["bike-fitting", "cycling-strength-conditioning"]');
    for (const staleClaim of [
      "protects the knees, lower back and hands",
      "Knee pain, lower-back pain and numb hands are usually fit problems",
    ]) {
      expect(daryl).not.toContain(staleClaim);
    }
    expect(read("content/blog/cycling-podcast-guest-directory.mdx")).toContain(
      "Bike fitter and cycling coach at Science to Sport. 2 episodes.",
    );
  });

  it("records GSC demand and adds AI plus discovery measurement", () => {
    const decision = read(
      "docs/seo/gsc-daryl-podcast-opportunity-2026-08-25.md",
    );
    for (const signal of [
      "2,892 impressions",
      "26 clicks",
      "0.9% CTR",
      "average position 11.5",
      "19 visible query rows",
      "`how to penetration testing for cyclists`",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 211,
          target_page:
            "/podcast/ep-1-pro-bike-fitter-reveals-the-1-change-amateurs-should-make",
        }),
      ]),
    );

    expect(read("scripts/submit-indexnow.ts")).toContain(
      "/podcast/ep-1-pro-bike-fitter-reveals-the-1-change-amateurs-should-make",
    );
  });
});
