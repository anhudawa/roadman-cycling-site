/**
 * Validates public/.well-known/mcp.json against the actual MCP server
 * registration in src/lib/mcp/server.ts and src/lib/mcp/resources.ts.
 *
 * This is a drift guard $€” PR #76 ships manifest + server together, but
 * every subsequent tool/resource change risks the manifest falling out
 * of sync. Run this in CI (or locally before release) to fail loudly
 * if drift appears.
 *
 * Checks:
 *   $€¢ Every tool name in the manifest is registered on the server.
 *   $€¢ Every tool registered on the server is declared in the manifest.
 *   $€¢ Same check for resources (matched by URI).
 *   $€¢ Manifest has the required top-level shape (mcpServers.roadman-cycling).
 *   $€¢ `url` is absolute and ends with /api/mcp.
 *
 * Static source parse $€” no DB, no live server. Runs in < 100 ms.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

interface ManifestTool {
  name: string;
  description?: string;
}

interface ManifestResource {
  uri: string;
  description?: string;
}

interface Manifest {
  mcpServers: Record<
    string,
    {
      url: string;
      name: string;
      description: string;
      version: string;
      transport: string;
      tools: ManifestTool[];
      resources: ManifestResource[];
    }
  >;
}

// $”€$”€$”€ Source parsers $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€

/**
 * Extract `server.tool("name", ...)` first-arg strings from server.ts.
 * Matches the single unambiguous call-site shape used in the file.
 */
function parseServerTools(src: string): string[] {
  const names: string[] = [];
  const re = /\bserver\.tool\(\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) names.push(m[1]);
  return names;
}

/**
 * Extract the roadman:// URI (2nd arg) from each
 * `server.resource(name, uri, opts, handler)` call in resources.ts.
 */
function parseServerResources(src: string): string[] {
  const uris: string[] = [];
  const re = /\bserver\.resource\([^,]+,\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) uris.push(m[1]);
  return uris;
}

// $”€$”€$”€ Validation $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€

interface Issue {
  severity: "error" | "warning";
  message: string;
}

function diffSets(
  actual: string[],
  expected: string[]
): { missing: string[]; extra: string[] } {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  return {
    missing: expected.filter((e) => !actualSet.has(e)),
    extra: actual.filter((a) => !expectedSet.has(a)),
  };
}

function validate(): { issues: Issue[]; summary: string } {
  const root = process.cwd();
  const manifestPath = resolve(root, "public/.well-known/mcp.json");
  const serverPath = resolve(root, "src/lib/mcp/server.ts");
  const resourcesPath = resolve(root, "src/lib/mcp/resources.ts");

  const manifestRaw = readFileSync(manifestPath, "utf-8");
  const manifest = JSON.parse(manifestRaw) as Manifest;
  const serverSrc = readFileSync(serverPath, "utf-8");
  const resourcesSrc = readFileSync(resourcesPath, "utf-8");

  const issues: Issue[] = [];

  // $”€$”€$”€ Shape $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
  const entry = manifest.mcpServers?.["roadman-cycling"];
  if (!entry) {
    issues.push({
      severity: "error",
      message: "mcpServers['roadman-cycling'] block missing from manifest",
    });
    return { issues, summary: "manifest shape invalid $€” aborting" };
  }

  if (!/^https?:\/\/.+\/api\/mcp$/.test(entry.url)) {
    issues.push({
      severity: "error",
      message: `manifest url should be an absolute URL ending in /api/mcp, got: ${entry.url}`,
    });
  }
  if (entry.transport !== "streamable-http") {
    issues.push({
      severity: "warning",
      message: `manifest transport is '${entry.transport}', server ships Streamable HTTP $€” expected 'streamable-http'`,
    });
  }

  // $”€$”€$”€ Tool parity $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
  const manifestToolNames = entry.tools.map((t) => t.name);
  const serverToolNames = parseServerTools(serverSrc);

  const toolDiff = diffSets(manifestToolNames, serverToolNames);
  for (const name of toolDiff.missing) {
    issues.push({
      severity: "error",
      message: `tool '${name}' is registered on the server but missing from manifest`,
    });
  }
  for (const name of toolDiff.extra) {
    issues.push({
      severity: "error",
      message: `tool '${name}' is declared in manifest but not registered on the server`,
    });
  }
  for (const t of entry.tools) {
    if (!t.description || t.description.trim().length < 10) {
      issues.push({
        severity: "warning",
        message: `tool '${t.name}' has a missing or too-short description in the manifest`,
      });
    }
  }

  // $”€$”€$”€ Resource parity $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
  const manifestResourceUris = entry.resources.map((r) => r.uri);
  const serverResourceUris = parseServerResources(resourcesSrc);

  const resourceDiff = diffSets(manifestResourceUris, serverResourceUris);
  for (const uri of resourceDiff.missing) {
    issues.push({
      severity: "error",
      message: `resource '${uri}' is registered on the server but missing from manifest`,
    });
  }
  for (const uri of resourceDiff.extra) {
    issues.push({
      severity: "error",
      message: `resource '${uri}' is declared in manifest but not registered on the server`,
    });
  }
  for (const r of entry.resources) {
    if (!r.uri.startsWith("roadman://")) {
      issues.push({
        severity: "warning",
        message: `resource '${r.uri}' does not use the roadman:// scheme`,
      });
    }
  }

  const summary = `${manifestToolNames.length} tools + ${manifestResourceUris.length} resources declared; ${serverToolNames.length} tools + ${serverResourceUris.length} resources registered on server`;
  return { issues, summary };
}

// $”€$”€$”€ Main $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€

function main() {
  const { issues, summary } = validate();

  console.log(`MCP manifest validation $· ${summary}`);

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  for (const i of issues) {
    const tag = i.severity === "error" ? "$œ— ERROR" : "$š  WARN ";
    console.log(`  ${tag}  ${i.message}`);
  }

  if (errors.length === 0) {
    console.log(
      warnings.length === 0
        ? "$œ“ manifest is in sync with server + resources"
        : `$œ“ no errors; ${warnings.length} warning(s)`
    );
    process.exit(0);
  }
  console.error(`$œ— ${errors.length} error(s)`);
  process.exit(1);
}

main();
