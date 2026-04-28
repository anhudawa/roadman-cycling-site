# @roadman/mcp-server

Read-only [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes the public Roadman Cycling content APIs as MCP tools. Lets Claude Desktop, Cursor, Claude Code, and any other MCP-compatible AI agent search and pull from [roadmancycling.com](https://roadmancycling.com) directly — no scraping, no auth.

All tools are non-destructive `GET` proxies. There are no write paths.

## Tools

| Tool | Description |
|---|---|
| `search_roadman(query, limit?, type?)` | Full-text search across articles, podcast episodes, topic hubs, and glossary terms. |
| `fetch_article(slug)` | Full body + metadata for a single blog article. |
| `fetch_episode(slug)` | Metadata for a single podcast episode. |
| `fetch_guest(slug)` | Profile + episode list for a single podcast guest. |
| `fetch_glossary_term(term)` | Definition + extended definition for a cycling term or abbreviation. Case-insensitive on slug, title, or alias. |
| `fetch_tool_result(tool_name, params?)` | Run an on-site calculator (e.g. `ftp-zones`, `race-weight`) and return the structured result. |

## Install

The server runs unprivileged over stdio. Add it to your MCP client's config:

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "roadman": {
      "command": "npx",
      "args": ["-y", "@roadman/mcp-server"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add roadman -- npx -y @roadman/mcp-server
```

### Cursor

`~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "roadman": {
      "command": "npx",
      "args": ["-y", "@roadman/mcp-server"]
    }
  }
}
```

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `ROADMAN_BASE_URL` | `https://roadmancycling.com` | Override the base URL (useful for staging or local dev against `http://localhost:3000`). |

## Examples

Once the server is registered, your agent can call the tools directly. Some prompts that exercise it:

- _"Search Roadman for FTP plateau articles."_
- _"Fetch the full text of the article `why-your-ftp-is-not-improving`."_
- _"What are the 7 power zones for an FTP of 280 watts? Use the Roadman calculator."_
- _"What does Roadman's glossary say about RED-S?"_

Under the hood, those map to:

```jsonc
{ "name": "search_roadman", "arguments": { "query": "ftp plateau" } }
{ "name": "fetch_article", "arguments": { "slug": "why-your-ftp-is-not-improving" } }
{ "name": "fetch_tool_result", "arguments": { "tool_name": "ftp-zones", "params": { "ftp": 280 } } }
{ "name": "fetch_glossary_term", "arguments": { "term": "RED-S" } }
```

Each tool returns the upstream JSON pretty-printed as a single text block. Upstream HTTP errors surface as MCP tool errors (`isError: true`) with the status, URL, and response snippet.

## Development

```bash
npm install
npm run build       # tsc → dist/
npm run start       # node dist/index.js
npm run dev         # tsx src/index.ts (watch-free, useful for iteration)
npm run smoke       # spawn the built server, verify all 6 tools list correctly
```

The smoke test does not hit the network — it only exercises the MCP handshake and `tools/list`. To do a live end-to-end check, point an MCP-aware client at the built `dist/index.js` and call `search_roadman`.

## License

MIT © Anthony Walsh / Roadman Cycling
