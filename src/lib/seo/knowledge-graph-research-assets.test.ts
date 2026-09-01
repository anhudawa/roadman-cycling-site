import { beforeAll, describe, expect, it } from "vitest";
import { GET } from "@/app/knowledge-graph.json/route";
import { RESEARCH_ASSETS } from "@/data/research-assets";

interface ResearchGraphNode {
  id: string;
  type: string;
  subtype?: string;
  url: string | null;
  dataUrl?: string;
  version?: string;
  updatedDate?: string;
  limitations?: string[];
  reuseTerms?: string;
}

interface ResearchGraphPayload {
  meta: {
    schemaVersion: number;
    nodesByType: Record<string, number>;
    edgesByRelationship: Record<string, number>;
  };
  nodes: ResearchGraphNode[];
  edges: Array<{ source: string; target: string; relationship: string }>;
}

let graph: ResearchGraphPayload;

beforeAll(async () => {
  graph = (await GET().json()) as ResearchGraphPayload;
});

describe("knowledge graph research assets", () => {
  it("publishes every asset with its type and evidence boundary intact", () => {
    expect(graph.meta.schemaVersion).toBe(2);
    expect(
      Object.entries(graph.meta.nodesByType)
        .filter(([type]) => type.startsWith("research-asset:"))
        .reduce((total, [, count]) => total + count, 0),
    ).toBe(RESEARCH_ASSETS.length);

    for (const asset of RESEARCH_ASSETS) {
      expect(graph.nodes).toContainEqual(
        expect.objectContaining({
          id: `research-asset:${asset.id}`,
          type: "research-asset",
          subtype: asset.kind,
          url: `https://roadmancycling.com${asset.canonicalPath}`,
          dataUrl: `https://roadmancycling.com${asset.dataPath}`,
          version: asset.version,
          updatedDate: asset.updatedDate,
          limitations: asset.limitations,
          reuseTerms: asset.reuse.terms,
        }),
      );
      expect(graph.edges).toContainEqual({
        source: `research-asset:${asset.id}`,
        target: "person:anthony-walsh",
        relationship: "maintained_by",
      });
    }
  });

  it("connects reusable assets to their method pages, topics and owners", () => {
    expect(graph.edges).toContainEqual({
      source: "research-asset:sportive-readiness-index-2026",
      target: "article:sportive-training-readiness-index-2026",
      relationship: "documented_by",
    });
    expect(graph.edges).toContainEqual({
      source: "research-asset:amateur-cyclist-fuelling-benchmarks-2026",
      target: "topic:cycling-nutrition",
      relationship: "about_topic",
    });
    expect(graph.edges).toContainEqual({
      source: "research-asset:cycling-podcast-archive-study-2026",
      target: "entity:search-owner:cycling-podcast",
      relationship: "supports_owner",
    });
    expect(graph.meta.edgesByRelationship.documented_by).toBe(2);
  });
});
