import { describe, it, expect, vi, beforeEach } from "vitest";

// $”€$”€ DB mock $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              podcastDownloadsTotal: 100_000_000,
              youtubeSubscribersMain: 61_773,
              youtubeSubscribersClips: 13_238,
              freeCommunityMembers: 1_852,
              paidCommunityMembers: 113,
              featuredTransformations: [
                {
                  member_name: "Test User",
                  headline_result: "Cat 3 to Cat 1",
                  duration: "18 months",
                },
              ],
              updatedAt: new Date(),
            },
          ]),
        }),
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    execute: vi.fn().mockResolvedValue({ rows: [] }),
  },
}));

vi.mock("@/lib/mcp/rate-limiter", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/mcp/embeddings", () => ({
  embedQuery: vi.fn().mockResolvedValue(new Array(1024).fill(0.1)),
}));

import { buildMcpServer } from "@/lib/mcp/server";
import { getCommunityStats } from "@/lib/mcp/services/community";

describe("get_community_stats service", () => {
  it("returns correct shape", async () => {
    const stats = await getCommunityStats();
    expect(stats).toMatchObject({
      podcast_downloads_total: 100_000_000,
      youtube_subscribers_main: 61_773,
      youtube_subscribers_clips: 13_238,
      free_community_members: 1_852,
      paid_community_members: 113,
    });
    expect(Array.isArray(stats.featured_transformations)).toBe(true);
  });

  it("returns empty stats when no row exists", async () => {
    vi.mocked(
      (await import("@/lib/db")).db.select().from({} as never).orderBy({} as never).limit
    ).mockResolvedValueOnce([]);
    const stats = await getCommunityStats();
    expect(stats.podcast_downloads_total).toBe(0);
  });
});

describe("MCP server $€” tool registration", () => {
  it("server builds without throwing", () => {
    expect(() => buildMcpServer("test")).not.toThrow();
  });

  it("server has all 9 tools registered", () => {
    const server = buildMcpServer("test");
    // Access internal tool registry
    const toolNames = Object.keys(
      (server as unknown as { _registeredTools: Record<string, unknown> })
        ._registeredTools ?? {}
    );
    const expected = [
      "get_community_stats",
      "search_episodes",
      "get_episode",
      "list_experts",
      "get_expert_insights",
      "search_methodology",
      "list_products",
      "list_upcoming_events",
      "qualify_lead",
    ];
    for (const name of expected) {
      expect(toolNames).toContain(name);
    }
  });

  it("server has all 3 resources registered", () => {
    const server = buildMcpServer("test");
    const resourceUris = Object.keys(
      (server as unknown as { _registeredResources: Record<string, unknown> })
        ._registeredResources ?? {}
    );
    expect(resourceUris).toContain("roadman://brand/overview");
    expect(resourceUris).toContain("roadman://methodology/principles");
    expect(resourceUris).toContain("roadman://experts/roster");
  });
});
