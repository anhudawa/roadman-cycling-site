import { describe, expect, it } from "vitest";
import { GET } from "@/app/knowledge-graph.json/route";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface AppGraphPayload {
  meta: {
    schemaVersion: number;
    nodesByType: Record<string, number>;
  };
  nodes: Array<Record<string, unknown> & { id: string }>;
  edges: Array<{ source: string; target: string; relationship: string }>;
}

describe("Roadman app knowledge-graph entity", () => {
  it("publishes one bounded prelaunch software identity", async () => {
    const graph = (await GET().json()) as AppGraphPayload;

    expect(graph.meta.schemaVersion).toBe(3);
    expect(graph.meta.nodesByType["software:mobile-application"]).toBe(1);
    expect(graph.nodes).toContainEqual(
      expect.objectContaining({
        id: ROADMAN_APP_PRODUCT.graphId,
        type: "software",
        subtype: "mobile-application",
        name: ROADMAN_APP_PRODUCT.name,
        url: ROADMAN_APP_PRODUCT.canonicalUrl,
        lifecycleStatus: "prelaunch",
        earlyAccessUrl: ROADMAN_APP_PRODUCT.earlyAccessUrl,
        applicationCategory: "SportsApplication",
        operatingSystems: ["iOS"],
        limitations: ROADMAN_APP_PRODUCT.limitations,
      }),
    );
    expect(graph.nodes).toContainEqual(
      expect.objectContaining({
        id: "entity:organization:roadman-cycling",
        subtype: "organization",
        url: "https://roadmancycling.com/entity/roadman-cycling",
      }),
    );
  });

  it("connects the product to its owner, publisher, evidence and previews", async () => {
    const graph = (await GET().json()) as AppGraphPayload;
    const appId = ROADMAN_APP_PRODUCT.graphId;
    const edges = graph.edges.filter(
      (edge) => edge.source === appId || edge.target === appId,
    );

    expect(edges).toContainEqual({
      source: appId,
      target: "entity:search-owner:cycling-strength-recovery-app",
      relationship: "represented_by",
    });
    expect(edges).toContainEqual({
      source: "entity:search-owner:cycling-strength-recovery-app",
      target: appId,
      relationship: "represents_product",
    });
    expect(edges).toContainEqual({
      source: appId,
      target: "entity:organization:roadman-cycling",
      relationship: "developed_by",
    });
    expect(edges).toContainEqual({
      source: appId,
      target: "tool:training-readiness",
      relationship: "previewed_by",
    });
    expect(edges).toContainEqual({
      source: appId,
      target: "entity:best-for:best-cycling-recovery-apps",
      relationship: "compared_in",
    });
    expect(edges).toContainEqual({
      source: "article:cycling-strength-training-guide",
      target: appId,
      relationship: "supports_product",
    });

    expect(edges).toHaveLength(15);
  });

  it("keeps the landing-page graph on the same public product facts", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/app/(marketing)/app/page.tsx"),
      "utf8",
    );

    expect(source).toContain('import { ROADMAN_APP_PRODUCT } from "@/data/app-product"');
    expect(source).toContain("const APP_URL = ROADMAN_APP_PRODUCT.canonicalUrl");
    expect(source).toContain("const APP_DESCRIPTION = ROADMAN_APP_PRODUCT.description");
    expect(source).toContain("featureList: ROADMAN_APP_PRODUCT.features");
    expect(source).not.toContain("Pocket Coach");

    const llmsSource = readFileSync(
      resolve(process.cwd(), "src/app/llms.txt/route.ts"),
      "utf8",
    );
    expect(llmsSource).toContain("one name-neutral software identity");
    expect(llmsSource).toContain("Schema version 3");
  });
});
