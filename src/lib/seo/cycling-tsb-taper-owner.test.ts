import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("cycling TSB taper owner", () => {
  const guide = read(
    "content/blog/cycling-training-stress-balance-tsb-guide.mdx",
  );

  it("owns the practical cycling and race-taper intent", () => {
    expect(guide).toContain("TSB Cycling: Training Stress Balance & Race Form");
    expect(guide).toContain("how should TSB influence a cycling race taper?");
    expect(guide).toContain(
      "](/blog/training-load-ctl-atl-tsb-explained-cyclists)",
    );
  });

  it("uses the platform definition and the strongest taper evidence", () => {
    for (const marker of [
      "TrainingPeaks Form/TSB documentation",
      "not a predictor of performance",
      "14 endurance-athlete studies",
      "PMID 37163550",
      "PMID 17762369",
      "PMID 26423706",
      "PMID 32957081",
      "PMID 23247672",
    ]) {
      expect(guide).toContain(marker);
    }
  });

  it("removes unsupported race-day, danger and masters thresholds", () => {
    for (const unsafeClaim of [
      "Aim for a race-day TSB of +5 to +25",
      "Below +5, you are still carrying meaningful fatigue",
      "Above +25, you have probably rested too long",
      "TSB stuck below minus 30 for more than two weeks",
      "risk of illness, injury, and burnout rises sharply",
      "masters riders typically perform best",
      "effective fatigue decay closer to 9 or 10 days",
      "Target TSB +15 to +25",
      "TSB becomes legitimately predictive",
    ]) {
      expect(guide.toLowerCase()).not.toContain(unsafeClaim.toLowerCase());
    }
  });

  it("separates modelled load, readiness, the app and coaching", () => {
    expect(guide).toContain("](/tools/training-load)");
    expect(guide).toContain("](/tools/training-readiness)");
    expect(guide).toContain("](/app?source=tsb-guide)");
    expect(guide).toContain("](/coaching)");
  });

  it("records the real Web and AI baseline plus benchmark prompt", () => {
    const baseline = read("docs/seo/gsc-cycling-tsb-taper-owner-2026-09-01.md");
    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };

    expect(baseline).toContain("706 impressions");
    expect(baseline).toContain("153 impressions");
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts.find((prompt) => prompt.id === 383)).toMatchObject(
      {
        target_page: "/blog/cycling-training-stress-balance-tsb-guide",
      },
    );
  });
});
