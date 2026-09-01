import { describe, expect, it } from "vitest";
import { GET } from "@/app/knowledge-graph.json/route";
import { SEARCH_OWNERS } from "./search-ownership";

interface GraphPayload {
  meta: {
    nodesByType: Record<string, number>;
    edgesByRelationship: Record<string, number>;
  };
  nodes: Array<{ id: string; subtype?: string; url: string | null }>;
  edges: Array<{ source: string; target: string; relationship: string }>;
}

describe("knowledge graph search ownership", () => {
  it("publishes every definitive owner and its trust relationships", async () => {
    const response = GET();
    const graph = (await response.json()) as GraphPayload;
    const nodeIds = new Set(graph.nodes.map((node) => node.id));

    expect(graph.meta.nodesByType["entity:search-owner"]).toBe(
      SEARCH_OWNERS.length,
    );
    for (const owner of SEARCH_OWNERS) {
      const ownerId = `entity:search-owner:${owner.id}`;
      expect(graph.nodes).toContainEqual(
        expect.objectContaining({
          id: ownerId,
          subtype: "search-owner",
          url: `https://roadmancycling.com${owner.path}`,
        }),
      );
      expect(graph.edges).toContainEqual({
        source: ownerId,
        target: "person:anthony-walsh",
        relationship: "maintained_by",
      });
    }

    expect(graph.edges).toContainEqual({
      source: "article:best-online-cycling-coach-how-to-choose",
      target: "entity:search-owner:cycling-coaching",
      relationship: "supports_owner",
    });
    expect(graph.edges).toContainEqual({
      source: "entity:search-owner:cycling-training-plans",
      target: "article:how-pro-cyclist-trains-60-days",
      relationship: "supported_by",
    });
    expect(graph.edges).toContainEqual({
      source: "entity:search-owner:cycling-training-camps",
      target: "article:what-to-expect-cycling-training-camp",
      relationship: "supported_by",
    });
    expect(graph.nodes).toContainEqual(
      expect.objectContaining({
        id: "entity:search-owner:cycling-recovery",
        url: "https://roadmancycling.com/blog/cycling-recovery-tips",
        dataUrl: "https://roadmancycling.com/feeds/cycling-recovery.json",
      }),
    );

    expect(graph.meta.edgesByRelationship.maintained_by).toBeGreaterThanOrEqual(
      SEARCH_OWNERS.length,
    );
    expect(graph.meta.edgesByRelationship.supported_by).toBeGreaterThan(0);
    expect(graph.meta.edgesByRelationship.supports_owner).toBeGreaterThan(0);
    expect(
      graph.edges.every(
        (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
      ),
    ).toBe(true);
  });
});
