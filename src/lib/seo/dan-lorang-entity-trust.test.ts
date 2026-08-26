import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { getAllAnswers } from "@/lib/answers";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER_PATH = "/entity/dan-lorang";

describe("Dan Lorang entity owner and current-role trust", () => {
  it("turns the established entity owner into a current, reviewed profile", () => {
    const entity = matter(read("content/entities/dan-lorang.mdx"));

    expect(entity.data.seoTitle).toBe(
      "Dan Lorang: Lidl-Trek Head of Performance & Coach",
    );
    expect(entity.data.jobTitle).toBe("Head of Performance, Lidl-Trek");
    expect(entity.data.nationality).toBe("Luxembourgish");
    expect(entity.data.location).toBeUndefined();
    expect(entity.data.podcastAppearances).toBe(2);
    expect(entity.data.lastReviewed).toBe("2026-08-26");
    expect(entity.data.sources).toHaveLength(5);
    expect(entity.data.faqs).toHaveLength(5);
    expect(entity.content).toContain("Those interviews support a decision framework");
  });

  it("publishes review, citation and FAQ schema on expert entity owners", () => {
    const page = read("src/app/(marketing)/entity/[slug]/page.tsx");
    const loader = read("src/lib/entities.ts");

    expect(page).toContain('"@type": "FAQPage"');
    expect(page).toContain("citation: entity.sources.map");
    expect(page).toContain("SOURCES AND VERIFICATION");
    expect(page).toContain("entity.seoTitle");
    expect(loader).toContain("sources?: ExpertSource[]");
    expect(loader).toContain("faqs?: ExpertFaq[]");
  });

  it("differentiates podcast, expert and practical support intent", () => {
    const profiles = read("src/lib/guests/profiles.ts");
    const archive = matter(
      read("content/blog/every-roadman-episode-with-dan-lorang.mdx"),
    );
    const plan = matter(read("content/blog/dan-lorang-amateur-training-plan.mdx"));
    const positions = matter(
      read("content/blog/what-dan-lorang-says-about-endurance.mdx"),
    );

    expect(profiles).toContain(
      'seoTitle: "Dan Lorang: Lidl-Trek Role, Coaching & Podcast"',
    );
    expect(profiles).toContain(
      'expertSeoTitle: "Dan Lorang on Amateur Training & Load Management"',
    );
    expect(profiles).toContain('lastReviewed: "2026-08-26"');
    expect(archive.data.seoTitle).toContain("Complete Roadman Archive");
    expect(archive.data.relatedEpisodes).toHaveLength(2);
    expect(plan.data.seoTitle).toBe(
      "Dan Lorang Training Plan for Amateur Cyclists",
    );
    expect(positions.data.seoTitle).toContain("Verified Positions");
    for (const page of [archive, plan, positions]) {
      expect(page.data.updatedDate).toBe("2026-08-26");
      expect(page.data.lastReviewed).toBe("2026-08-26");
    }
  });

  it("removes known false identity links and coach attributions", () => {
    const entity = read("content/entities/dan-lorang.mdx");
    const registry = read("src/data/canonical-entities.ts");
    const hubs = read("src/lib/cluster-hubs.ts");

    for (const stale of [
      "https://en.wikipedia.org/wiki/Dan_Lorang",
      "https://www.linkedin.com/in/dan-lorang/",
      "coach to Pogačar and Vingegaard",
    ]) {
      expect(`${entity}\n${registry}\n${hubs}`).not.toContain(stale);
    }
    expect(registry).toContain('affiliation: "Lidl-Trek"');
    expect(hubs).toContain("Roadman has no verified basis");

    const danEvidence = getAllAnswers()
      .flatMap((answer) => answer.expertEvidence)
      .filter((point) => point.name === "Dan Lorang");
    expect(danEvidence.length).toBeGreaterThan(0);
    expect(
      danEvidence.every(
        (point) => point.credential === "Head of Performance, Lidl-Trek",
      ),
    ).toBe(true);
  });

  it("records the exact-query baseline and extends discovery measurement", () => {
    const decision = read("docs/seo/gsc-dan-lorang-opportunity-2026-08-26.md");
    for (const signal of [
      "52 clicks",
      "2,294 impressions",
      "2.3% CTR",
      "Average position 7.4",
      "1,851",
      "**5 September 2026**",
      "**26 September 2026**",
    ]) {
      expect(decision).toContain(signal);
    }

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Dan Lorang: Lidl-Trek Role and Endurance Coaching",
    );
    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      OWNER_PATH,
      "/guests/dan-lorang",
      "/experts/dan-lorang",
      "/blog/every-roadman-episode-with-dan-lorang",
      "/blog/dan-lorang-amateur-training-plan",
      "/blog/what-dan-lorang-says-about-endurance",
    ]) {
      expect(indexNow).toContain(path);
    }

    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts).toContainEqual(
      expect.objectContaining({
        id: 235,
        target_page: OWNER_PATH,
        prompt: "who is Dan Lorang and what is his current role at Lidl-Trek",
      }),
    );
  });
});
