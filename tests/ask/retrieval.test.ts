import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the three upstream search services so retrieval stays a pure unit test.

vi.mock("@/lib/mcp/services/episodes", () => ({
  searchEpisodes: vi.fn(),
}));
vi.mock("@/lib/mcp/services/methodology", () => ({
  searchMethodology: vi.fn(),
}));
vi.mock("@/lib/ask/retrieval/content-chunks", () => ({
  searchContentChunks: vi.fn(),
}));

const { searchEpisodes } = await import("@/lib/mcp/services/episodes");
const { searchMethodology } = await import("@/lib/mcp/services/methodology");
const { searchContentChunks } = await import("@/lib/ask/retrieval/content-chunks");
const { retrieve } = await import("@/lib/ask/retrieval");

describe("ask/retrieval", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty set for off_topic intent without hitting upstream search", async () => {
    const res = await retrieve({ query: "stock market", intent: "off_topic" });
    expect(res.chunks).toEqual([]);
    expect(searchEpisodes).not.toHaveBeenCalled();
  });

  it("returns empty set for safety intents (short-circuit)", async () => {
    const res = await retrieve({ query: "chest pain", intent: "safety_medical" });
    expect(res.chunks).toEqual([]);
    expect(res.totalCandidates).toBe(0);
  });

  it("merges episode + methodology results, sorts by score, caps at limit", async () => {
    vi.mocked(searchEpisodes).mockResolvedValue([
      { episode_id: 1, title: "A", guest: null, published_at: null, excerpt: "x", relevance_score: 0.9, url: "/a" },
      { episode_id: 2, title: "B", guest: null, published_at: null, excerpt: "y", relevance_score: 0.7, url: "/b" },
    ]);
    vi.mocked(searchMethodology).mockResolvedValue([
      { id: 10, principle: "P1", explanation: "e1", topic_tags: [], supporting_expert_names: [], supporting_episode_ids: [], relevance_score: 0.8, episode_citations: [] } as never,
    ]);
    vi.mocked(searchContentChunks).mockResolvedValue([]);

    const res = await retrieve({ query: "zone 2", intent: "training_general", limit: 2 });
    expect(res.chunks.map((c) => c.title)).toEqual(["A", "P1"]);
    expect(res.totalCandidates).toBe(3);
  });

  it("survives an episode search failure (falls back to methodology + content)", async () => {
    vi.mocked(searchEpisodes).mockRejectedValue(new Error("down"));
    vi.mocked(searchMethodology).mockResolvedValue([
      { id: 10, principle: "P1", explanation: "e1", topic_tags: [], supporting_expert_names: [], supporting_episode_ids: [], relevance_score: 0.6, episode_citations: [] } as never,
    ]);
    vi.mocked(searchContentChunks).mockResolvedValue([]);

    const res = await retrieve({ query: "zone 2", intent: "training_general" });
    expect(res.chunks).toHaveLength(1);
    expect(res.chunks[0].sourceType).toBe("methodology");
  });

  it("dedupes by (sourceType, sourceId) if upstream returns duplicates", async () => {
    vi.mocked(searchEpisodes).mockResolvedValue([
      { episode_id: 1, title: "A", guest: null, published_at: null, excerpt: "x", relevance_score: 0.9, url: "/a" },
      { episode_id: 1, title: "A", guest: null, published_at: null, excerpt: "x2", relevance_score: 0.85, url: "/a" },
    ]);
    vi.mocked(searchMethodology).mockResolvedValue([]);
    vi.mocked(searchContentChunks).mockResolvedValue([]);

    const res = await retrieve({ query: "x", intent: "training_general" });
    expect(res.chunks).toHaveLength(1);
  });
});
