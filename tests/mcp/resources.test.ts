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

describe("MCP resources $€” registration", () => {
  it("registers all 3 resource URIs", () => {
    const server = buildMcpServer("test");
    const registry = (
      server as unknown as { _registeredResources: Record<string, unknown> }
    )._registeredResources;
    const uris = Object.keys(registry ?? {});
    expect(uris).toContain("roadman://brand/overview");
    expect(uris).toContain("roadman://methodology/principles");
    expect(uris).toContain("roadman://experts/roster");
  });
});

describe("MCP resources $€” content", () => {
  it("brand/overview includes Roadman identity markers", async () => {
    const server = buildMcpServer("test");
    const resource = getResource(server, "roadman://brand/overview");
    const result = await resource.readCallback();
    const text = result.contents[0].text;
    expect(text).toContain("Anthony Walsh");
    expect(text).toContain("Not Done Yet");
    expect(text).toContain("100M+");
  });

  it("methodology/principles includes core training concepts", async () => {
    const server = buildMcpServer("test");
    const resource = getResource(server, "roadman://methodology/principles");
    const result = await resource.readCallback();
    const text = result.contents[0].text;
    expect(text).toContain("Polarised Training");
    expect(text).toContain("Seiler");
    expect(text).toContain("Masters");
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
  });

  it("each resource returns correct uri in contents", async () => {
    const server = buildMcpServer("test");
    for (const uri of [
      "roadman://brand/overview",
      "roadman://methodology/principles",
      "roadman://experts/roster",
    ]) {
      const resource = getResource(server, uri);
      const result = await resource.readCallback();
      expect(result.contents[0].uri).toBe(uri);
      expect(result.contents[0].text.length).toBeGreaterThan(100);
    }
  });
});
