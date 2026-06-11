import { describe, expect, it } from "vitest";
import { scoreViralPotential } from "./viral-score";
import type { EpisodeMeta } from "../podcast";

function episode(overrides: Partial<EpisodeMeta & { transcript?: string }> = {}): EpisodeMeta & { transcript?: string } {
  return {
    slug: "test-episode",
    title: "Default episode title",
    episodeNumber: 1,
    description: "A neutral description of the episode.",
    publishDate: "2026-01-01",
    duration: "45:00",
    pillar: "coaching",
    type: "standard",
    keywords: [],
    seoDescription: "Neutral SEO description.",
    ...overrides,
  } as EpisodeMeta & { transcript?: string };
}

describe("scoreViralPotential", () => {
  it("scores a hooky, pain-point, quote-ready episode highly", () => {
    const result = scoreViralPotential(
      episode({
        title: "Why your FTP is stuck — and the exact fix nobody tells you",
        description:
          "You are training hard but your progress has plateaued. Here is the exact framework to change that.",
        keywords: ["ftp", "plateau", "coaching"],
        topicTags: ["ftp", "coaching", "training"],
        answerCapsule:
          "The real reason riders stall is usually a mix of too much intensity, not enough recovery, and no clear progression.",
        keyTakeaways: [
          "Stop treating every ride like a test.",
          "Recover hard enough to absorb the work.",
          "Use progression instead of random suffering.",
        ],
        keyQuotes: [
          { text: "The real issue is that most people are tired, not lazy.", speaker: "Host" },
        ],
        transcript:
          "why your ftp is stuck and the exact fix is actually boring. the thing is most riders want more work when they need better recovery and a clearer progression.",
      }),
    );

    expect(result.total).toBeGreaterThanOrEqual(40);
    expect(result.hook).toBeGreaterThan(10);
    expect(result.pain).toBeGreaterThan(4);
    expect(result.utility).toBeGreaterThan(4);
    expect(result.quotability).toBeGreaterThan(0);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("keeps generic content below a high-viral threshold", () => {
    const result = scoreViralPotential(
      episode({
        title: "Episode 42",
        description: "A general check-in on the week.",
        transcript: "we talked about training and some other things. it was fine.",
      }),
    );

    expect(result.total).toBeLessThan(35);
    expect(result.hook).toBeLessThanOrEqual(5);
    expect(result.pain).toBeLessThanOrEqual(4);
  });

  it("rewards concrete metrics and specific numbers", () => {
    const result = scoreViralPotential(
      episode({
        title: "How to build a 12-week plan for a 4 kg race-weight cut",
        description: "A practical plan with FTP, W/kg, and 3 steps you can use this week.",
        topicTags: ["race-weight", "nutrition", "ftp"],
        keyTakeaways: ["Step 1", "Step 2", "Step 3"],
      }),
    );

    expect(result.specificity).toBeGreaterThan(4);
    expect(result.utility).toBeGreaterThan(4);
    // A concrete, specific, useful episode with no quotes/pain/novelty still
    // scores well above generic content (specificity 13 + utility 6 drive it).
    expect(result.total).toBeGreaterThan(30);
  });
});
