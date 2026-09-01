import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("app MCP discovery contract", () => {
  it("declares the app tool and resource in every discovery surface", () => {
    const manifest = JSON.parse(read("public/.well-known/mcp.json"));
    const server = manifest.mcpServers["roadman-cycling"];
    const toolNames = server.tools.map((tool: { name: string }) => tool.name);
    const resourceUris = server.resources.map(
      (resource: { uri: string }) => resource.uri,
    );

    expect(server.version).toBe("1.2.0");
    expect(toolNames).toHaveLength(11);
    expect(toolNames).toContain("get_cycling_strength_recovery_app");
    expect(resourceUris).toHaveLength(5);
    expect(resourceUris).toContain(
      "roadman://products/cycling-strength-recovery-app",
    );

    for (const path of [
      "src/app/llms.txt/route.ts",
      "src/app/llms-full.txt/route.ts",
      "src/app/api/mcp/README.md",
    ]) {
      const source = read(path);
      expect(source).toContain("get_cycling_strength_recovery_app");
      expect(source).toContain(
        "roadman://products/cycling-strength-recovery-app",
      );
    }
  });
});
