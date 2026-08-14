import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAllEpisodes: vi.fn(),
  getTranscriptSlugs: vi.fn(),
}));

vi.mock("@/lib/podcast", () => mocks);

describe("GET /feeds/podcast-knowledge.json", () => {
  beforeEach(() => {
    mocks.getTranscriptSlugs.mockReturnValue(["episode-one"]);
    mocks.getAllEpisodes.mockReturnValue([
      {
        slug: "episode-one",
        title: "Episode one",
        episodeNumber: 1,
        description: "Description",
        seoDescription: "SEO description",
        answerCapsule: "Answer capsule",
        publishDate: "2026-01-01",
        duration: "45:00",
        pillar: "coaching",
        type: "interview",
        keywords: [],
        topicTags: ["ftp-training"],
        keyTakeaways: ["Takeaway"],
        claims: [{ claim: "Claim", evidence: "expert" }],
      },
    ]);
  });

  it("exposes transcript, evidence and canonical ownership", async () => {
    const { GET } = await import("./route");
    const response = GET();
    const body = await response.json();

    expect(body.canonicalSearchOwner).toBe("https://roadmancycling.com/podcast");
    expect(body.items[0].knowledge.status).toBe("citation-ready");
    expect(body.items[0].transcriptUrl).toContain("/transcript");
  });
});
