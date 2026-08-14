import { describe, expect, it } from "vitest";
import type { EpisodeMeta } from "@/lib/podcast";
import { evaluatePodcastKnowledge } from "./knowledge";

const baseEpisode: EpisodeMeta = {
  slug: "test-episode",
  title: "Test episode",
  episodeNumber: 1,
  description: "Description",
  seoDescription: "SEO description",
  publishDate: "2026-01-01",
  duration: "45:00",
  pillar: "coaching",
  type: "interview",
  keywords: [],
};

describe("podcast knowledge coverage", () => {
  it("only marks evidence-backed transcript packages citation-ready", () => {
    const result = evaluatePodcastKnowledge(
      {
        ...baseEpisode,
        answerCapsule: "A concise answer.",
        keyTakeaways: ["One"],
        topicTags: ["ftp-training"],
        claims: [{ claim: "A reviewed claim", evidence: "expert" }],
      },
      true,
    );

    expect(result.status).toBe("citation-ready");
    expect(result.completed).toContain("transcript");
  });

  it("keeps transcript-free show notes out of citation-ready status", () => {
    const result = evaluatePodcastKnowledge(baseEpisode, false);
    expect(result.status).toBe("show-notes-only");
    expect(result.missing).toContain("transcript");
  });
});
