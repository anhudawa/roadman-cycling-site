# SEO-NEW-15 — Roadman read-only MCP server

## Goal
Ship a standalone npm-publishable MCP server (`@roadman/mcp-server`) that exposes the existing public Roadman Cycling content endpoints as MCP tools, so AI agents (Claude Desktop, Cursor, Claude Code, etc.) can query the site directly without scraping.

## Constraints
- **Read-only.** No mutating tools, no write paths. The underlying endpoints are all GETs.
- **No auth.** All proxied endpoints are already public.
- **Stdio transport only.** Standard for the publish-an-npm-package use case.

## Tools

| Tool | Maps to | Notes |
|---|---|---|
| `search_roadman(query, limit?, type?)` | `GET /api/v1/search?q=` | `limit` 1–100 (default 20). `type` ∈ `article \| episode \| topic \| glossary`. |
| `fetch_article(slug)` | `GET /api/v1/fetch?id=&type=article` | Full body + metadata. |
| `fetch_episode(slug)` | `GET /feeds/episodes.json`, filtered client-side | Returns the metadata entry for the matching slug. |
| `fetch_guest(slug)` | `GET /feeds/guests.json`, filtered client-side | Same shape as `fetch_episode`. |
| `fetch_glossary_term(term)` | `GET /feeds/glossary.json`, filtered client-side | Match is case-insensitive against `id`, `title`, and `entities`. |
| `fetch_tool_result(tool_name, params?)` | `GET /api/v1/tools/{tool_name}?{params}` | `params` is a flat key/value object, stringified into the query string. |

## Architecture
- Single TypeScript entry (`src/index.ts`) using `@modelcontextprotocol/sdk` `McpServer` + `StdioServerTransport`.
- Tool inputs validated with `zod`.
- Single `getJson(path)` helper does the HTTP fetch with timeout and bubbles upstream HTTP errors back as MCP tool errors (`isError: true` + descriptive text).
- Base URL defaults to the canonical `SITE_ORIGIN` (`https://roadmancycling.com`) but is overridable via `ROADMAN_BASE_URL` for local dev / staging.
- Output: each tool returns the upstream JSON, pretty-printed, as a single text content block. Agents parse it.

## Files
```
mcp-server/
  package.json            # @roadman/mcp-server, "bin": "dist/index.js"
  tsconfig.json
  README.md
  .gitignore
  src/index.ts
```

## Verification
- `npm run build` (tsc) succeeds.
- A local smoke that pipes a JSON-RPC `tools/list` request into `node dist/index.js` returns all six tools.
- A second smoke pipes `tools/call` for `search_roadman` against the live site (skipped if no network).

## Out of scope
- Resources / prompts.
- Streamable HTTP transport.
- Authenticated endpoints (member-only content, admin).
- Caching / rate limiting (the upstream endpoints already cache).
