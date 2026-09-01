import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
          orderBy: vi.fn().mockReturnValue(
            Object.assign(Promise.resolve([]), {
              limit: vi.fn().mockResolvedValue([]),
            })
          ),
        }),
        orderBy: vi.fn().mockReturnValue(
          Object.assign(Promise.resolve([]), {
            limit: vi.fn().mockResolvedValue([]),
          })
        ),
        leftJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    execute: vi.fn().mockResolvedValue({ rows: [] }),
  },
}));

vi.mock("@/lib/mcp/embeddings", () => ({
  embedQuery: vi.fn().mockResolvedValue(new Array(1024).fill(0.1)),
}));

import { buildMcpServer } from "@/lib/mcp/server";
import { searchEpisodes, getEpisode } from "@/lib/mcp/services/episodes";
import { listExperts, getExpertInsights } from "@/lib/mcp/services/experts";
import { searchMethodology } from "@/lib/mcp/services/methodology";
import { listResearchAssets } from "@/lib/mcp/services/research";
import { getAppProduct } from "@/lib/mcp/services/app-product";

describe("search_episodes service", () => {
  it("returns array (even when no embeddings exist)", async () => {
    const results = await searchEpisodes("polarised training", 5);
    expect(Array.isArray(results)).toBe(true);
  });
});

describe("get_episode service", () => {
  it("returns null for missing episode", async () => {
    const ep = await getEpisode(9999);
    expect(ep).toBeNull();
  });

  it("returns episode shape when found", async () => {
    vi.mocked(
      (await import("@/lib/db")).db.select().from({} as never).where({} as never).limit
    ).mockResolvedValueOnce([
      {
        id: 1,
        title: "Test Episode",
        guestName: "Guest Name",
        publishedAt: new Date("2025-01-01"),
        durationSec: 3600,
        summary: "A test summary",
        audioUrl: "https://example.com/audio.mp3",
        youtubeUrl: "https://youtube.com/watch?v=test",
        keyInsights: ["insight 1", "insight 2"],
        url: "https://roadmancycling.com/podcast/test",
        slug: "test-episode",
        transcriptText: null,
        topicTags: ["training"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as never[]);

    const ep = await getEpisode(1);
    expect(ep).not.toBeNull();
    expect(ep?.title).toBe("Test Episode");
    expect(ep?.guest).toBe("Guest Name");
    expect(Array.isArray(ep?.key_insights)).toBe(true);
  });
});

describe("list_experts service", () => {
  it("returns array", async () => {
    const experts = await listExperts();
    expect(Array.isArray(experts)).toBe(true);
  });
});

describe("get_expert_insights service", () => {
  it("returns empty array for unknown expert", async () => {
    const insights = await getExpertInsights("Unknown Expert");
    expect(insights).toEqual([]);
  });
});

describe("search_methodology service", () => {
  it("returns array (even when no embeddings exist)", async () => {
    const results = await searchMethodology("polarised training");
    expect(Array.isArray(results)).toBe(true);
  });
});

describe("list_research_assets service", () => {
  it("returns all typed assets with limitations by default", () => {
    const result = listResearchAssets();

    expect(result.count).toBe(4);
    expect(result.assets.every((asset) => asset.limitations.length >= 3)).toBe(
      true,
    );
  });

  it("filters by evidence type and subject without relabelling the asset", () => {
    const byKind = listResearchAssets(undefined, "evidence-benchmark");
    const bySubject = listResearchAssets("sportive readiness");

    expect(byKind.assets).toHaveLength(1);
    expect(byKind.assets[0].kind).toBe("evidence-benchmark");
    expect(bySubject.assets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "sportive-readiness-index-2026",
          kind: "coaching-framework",
        }),
      ]),
    );
  });
});

describe("get_cycling_strength_recovery_app service", () => {
  it("returns one bounded prelaunch identity without invented launch facts", () => {
    const result = getAppProduct();

    expect(result.product).toMatchObject({
      product_id: "roadman-cycling-strength-recovery-app",
      lifecycle_status: "prelaunch",
      final_name_announced: false,
      launch_date: null,
      price: null,
      url: "https://roadmancycling.com/app",
      early_access_url: "https://roadmancycling.com/app#early-access",
    });
    expect(result.product.limitations).toHaveLength(4);
    expect(result.discovery.preview_tool_urls).toHaveLength(3);
    expect(JSON.stringify(result)).not.toContain("Pocket Coach");
  });
});

describe("MCP server — content tool names", () => {
  it("registers all content tools", () => {
    const server = buildMcpServer("test");
    const tools = Object.keys(
      (server as unknown as { _registeredTools: Record<string, unknown> })
        ._registeredTools ?? {}
    );
    expect(tools).toContain("search_episodes");
    expect(tools).toContain("get_episode");
    expect(tools).toContain("list_experts");
    expect(tools).toContain("get_expert_insights");
    expect(tools).toContain("search_methodology");
    expect(tools).toContain("list_research_assets");
    expect(tools).toContain("get_cycling_strength_recovery_app");
  });
});
