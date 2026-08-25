import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

describe("smart-trainer search ownership", () => {
  it("removes duplicate documents and generated head-term competition", () => {
    for (const duplicate of [
      "content/blog/cycling-indoor-trainer-buying-guide.mdx",
      "content/blog/cycling-turbo-vs-rollers-vs-smart-trainer-guide.mdx",
    ]) {
      expect(existsSync(resolve(root, duplicate))).toBe(false);
    }

    expect(read("src/lib/best-for.ts")).not.toContain(
      'slug: "best-turbo-trainers-2026"',
    );
    expect(read("src/lib/topics.ts")).not.toContain(
      '"cycling-indoor-trainer-buying-guide"',
    );
    expect(read("src/lib/topics.ts")).not.toContain(
      '"cycling-turbo-vs-rollers-vs-smart-trainer-guide"',
    );
  });

  it("preserves every retired URL through its intended owner", () => {
    const redirects = read("next.config.ts");

    for (const [source, destination] of [
      [
        "/blog/cycling-indoor-trainer-buying-guide",
        "/blog/best-indoor-smart-trainers-2026",
      ],
      [
        "/best/best-turbo-trainers-2026",
        "/blog/best-indoor-smart-trainers-2026",
      ],
      [
        "/blog/cycling-turbo-vs-rollers-vs-smart-trainer-guide",
        "/blog/indoor-trainer-vs-rollers",
      ],
    ]) {
      const sourceIndex = redirects.indexOf(`source: "${source}"`);
      expect(sourceIndex).toBeGreaterThan(-1);
      expect(
        redirects.slice(sourceIndex, sourceIndex + 300),
      ).toContain(`destination: "${destination}"`);
      expect(redirects.slice(sourceIndex, sourceIndex + 300)).toContain(
        "permanent: true",
      );
    }
  });

  it("routes AI demand and internal recommendations to the owners", () => {
    const prompts = read("scripts/ai-benchmark-prompts.json");
    expect(prompts).not.toContain(
      '"target_page": "/blog/cycling-indoor-trainer-buying-guide"',
    );
    expect(prompts).toContain(
      '"target_page": "/blog/best-indoor-smart-trainers-2026"',
    );
    expect(prompts).toContain(
      '"target_page": "/blog/indoor-trainer-vs-rollers"',
    );

    expect(read("content/blog/cycling-buying-your-first-road-bike-guide.mdx"))
      .toContain('"best-indoor-smart-trainers-2026"');
    expect(read("content/blog/cycling-turbo-trainer-setup-optimisation-guide.mdx"))
      .toContain('"indoor-trainer-vs-rollers"');
  });

  it("keeps the indoor hub aligned with the current owner pages", () => {
    const hub = read("content/topics/indoor-training.mdx");

    expect(hub).toContain("Wahoo KICKR CORE 2");
    expect(hub).toContain(
      "[current smart trainer guide](/blog/best-indoor-smart-trainers-2026)",
    );
    expect(hub).toContain(
      "TrainerRoad for the plan and Zwift for the virtual environment",
    );

    for (const staleClaim of [
      "~$15/month",
      "$700-$1,000",
      "+/- 1-2%",
      "Any trainer supporting both will connect to everything",
    ]) {
      expect(hub).not.toContain(staleClaim);
    }
  });

  it("keeps the category comparison current and distinct from model selection", () => {
    const source = read("content/blog/indoor-trainer-vs-rollers.mdx");
    const { data, content } = matter(source);

    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.answerCapsule).toContain("Choose a controllable smart trainer");
    expect(source).toContain("2026 smart-trainer buyer guide");
    expect(source).toContain("https://support.zwift.com/");
    expect(source).toContain("https://support.trainerroad.com/");
    expect(source).toContain("https://support.rouvy.com/");
    expect(content.match(/^# /gm)).toBeNull();

    for (const unsupportedClaim of [
      "20-30 minutes per week",
      "15-30 watts",
      "respond to gradient changes in under a second",
      "near-silent",
      "non-negotiable",
      "costs $",
    ]) {
      expect(source).not.toContain(unsupportedClaim);
    }
  });
});
