import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("daily cycling readiness search owner", () => {
  const guide = read(
    "content/blog/daily-training-readiness-check-cycling-guide.mdx",
  );
  const recoveryGuide = read(
    "content/blog/recovery-readiness-self-assessment-cycling-guide.mdx",
  );
  const trainingTool = read(
    "src/app/(content)/tools/training-readiness/layout.tsx",
  );

  it("owns the informational query and routes the interactive job to one tool", () => {
    expect(guide).toContain("Cycling Readiness Score: Daily Check + Limits");
    expect(guide).toContain("](/tools/training-readiness)");
    expect(trainingTool).toContain(
      'alternates: { canonical: "/tools/training-readiness" }',
    );
  });

  it("keeps daily context, wider recovery and the product as distinct jobs", () => {
    expect(guide).toContain("](/tools/recovery-screen)");
    expect(guide).toContain(
      "](/blog/recovery-readiness-self-assessment-cycling-guide)",
    );
    expect(guide).toContain("](/app?source=daily-readiness-guide)");
    expect(recoveryGuide).toContain("Recovery Readiness Self-Assessment");
  });

  it("states the validation boundary and cites the strongest supporting evidence", () => {
    for (const marker of [
      "PMID 26423706",
      "PMID 32957081",
      "PMID 32991706",
      "PMID 33144349",
      "PMID 34639599",
      "PMID 23247672",
      "have not been clinically validated",
      "decision aid, not a decision maker",
    ]) {
      expect(guide).toContain(marker);
    }
  });

  it("removes the old universal rules and outcome promises", () => {
    for (const unsafeClaim of [
      "prevents the sessions that make you slower",
      "as accurately as HRV",
      "five or more beats above your baseline",
      "the score wins",
      "three-day rule",
      "three consecutive days below twelve",
      "makes the decision for you",
      "The session you skip protects the three that follow",
      "when the two conflict, the data wins",
    ]) {
      expect(guide.toLowerCase()).not.toContain(unsafeClaim.toLowerCase());
    }
  });

  it("records the real web and AI search baseline and benchmark prompt", () => {
    const baseline = read(
      "docs/seo/gsc-daily-cycling-readiness-owner-2026-09-01.md",
    );
    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };

    expect(baseline).toContain("286 impressions");
    expect(baseline).toContain("Generative AI features: 39 impressions");
    expect(benchmark.metadata.prompt_count).toBe(382);
    expect(benchmark.prompts.find((prompt) => prompt.id === 382)).toMatchObject(
      {
        target_page: "/blog/daily-training-readiness-check-cycling-guide",
      },
    );
  });
});
