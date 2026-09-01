import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }),
        orderBy: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }),
      }),
    }),
  },
}));

vi.mock("@/lib/mcp/embeddings", () => ({
  embedQuery: vi.fn().mockResolvedValue(new Array(1024).fill(0.1)),
}));

import { buildMcpServer } from "@/lib/mcp/server";

type RegisteredResource = {
  readCallback: () => Promise<{ contents: { uri: string; text: string }[] }>;
};

function getResource(server: ReturnType<typeof buildMcpServer>, uri: string) {
  const registry = (
    server as unknown as { _registeredResources: Record<string, RegisteredResource> }
  )._registeredResources;
  return registry[uri];
}

describe("MCP resources — registration", () => {
  it("registers all 5 resource URIs", () => {
    const server = buildMcpServer("test");
    const registry = (
      server as unknown as { _registeredResources: Record<string, unknown> }
    )._registeredResources;
    const uris = Object.keys(registry ?? {});
    expect(uris).toHaveLength(5);
    expect(uris).toContain("roadman://brand/overview");
    expect(uris).toContain("roadman://methodology/principles");
    expect(uris).toContain("roadman://experts/roster");
    expect(uris).toContain("roadman://research/assets");
    expect(uris).toContain(
      "roadman://products/cycling-strength-recovery-app",
    );
  });
});

describe("MCP resources — content", () => {
  it("brand/overview includes Roadman identity markers", async () => {
    const server = buildMcpServer("test");
    const resource = getResource(server, "roadman://brand/overview");
    const result = await resource.readCallback();
    const text = result.contents[0].text;
    expect(text).toContain("Anthony Walsh");
    expect(text).toContain("Not Done Yet");
    // The headline trust claim is "100M+ podcast downloads" (lifetime,
    // cumulative) — not the older monthly-listeners framing.
    expect(text).toContain("100M+");
    expect(text).toContain("1,400+");
  });

  it("methodology/principles includes core training concepts", async () => {
    const server = buildMcpServer("test");
    const resource = getResource(server, "roadman://methodology/principles");
    const result = await resource.readCallback();
    const text = result.contents[0].text;
    expect(text).toContain("Polarised Training");
    expect(text).toContain("Seiler");
    expect(text).toContain("Masters");
    expect(text).toContain("not a universal rule");
    expect(text).not.toContain("causes chronic fatigue without corresponding adaptation");
    expect(text).not.toContain("1:4 ratio minimum");
  });

  it("experts/roster lists named experts", async () => {
    const server = buildMcpServer("test");
    const resource = getResource(server, "roadman://experts/roster");
    const result = await resource.readCallback();
    const text = result.contents[0].text;
    expect(text).toContain("Prof. Stephen Seiler");
    expect(text).toContain("Dan Lorang");
    expect(text).toContain("Dr. David Dunne");
    expect(text).toContain("Joe Friel");
    expect(text).not.toContain("Coined the 80/20 rule");
  });

  it("research/assets preserves types, limitations and direct data URLs", async () => {
    const server = buildMcpServer("test");
    const resource = getResource(server, "roadman://research/assets");
    const result = await resource.readCallback();
    const body = JSON.parse(result.contents[0].text);

    expect(body.assets).toHaveLength(4);
    expect(body.assets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "sportive-readiness-index-2026",
          kind: "coaching-framework",
          dataUrl:
            "https://roadmancycling.com/data/sportive-readiness-index-2026.csv",
        }),
        expect.objectContaining({
          id: "amateur-cyclist-fuelling-benchmarks-2026",
          kind: "evidence-benchmark",
        }),
      ]),
    );
    expect(
      body.assets.every((asset: { limitations: string[] }) =>
        asset.limitations.length >= 3,
      ),
    ).toBe(true);
  });

  it("products/app exposes one prelaunch identity and early-access URL", async () => {
    const server = buildMcpServer("test");
    const resource = getResource(
      server,
      "roadman://products/cycling-strength-recovery-app",
    );
    const result = await resource.readCallback();
    const body = JSON.parse(result.contents[0].text);

    expect(body.product).toMatchObject({
      lifecycle_status: "prelaunch",
      launch_date: null,
      price: null,
      early_access_url: "https://roadmancycling.com/app#early-access",
    });
    expect(body.product.features).toHaveLength(5);
    expect(JSON.stringify(body)).not.toContain("Pocket Coach");
  });

  it("each resource returns correct uri in contents", async () => {
    const server = buildMcpServer("test");
    for (const uri of [
      "roadman://brand/overview",
      "roadman://methodology/principles",
      "roadman://experts/roster",
      "roadman://research/assets",
      "roadman://products/cycling-strength-recovery-app",
    ]) {
      const resource = getResource(server, uri);
      const result = await resource.readCallback();
      expect(result.contents[0].uri).toBe(uri);
      expect(result.contents[0].text.length).toBeGreaterThan(100);
    }
  });
});
