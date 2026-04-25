# Roadman MCP Server

**Endpoint:** `POST /api/mcp`
**Protocol:** [Model Context Protocol](https://modelcontextprotocol.io) — Streamable HTTP (stateless)
**Discovery:** `GET /.well-known/mcp.json`

---

## Quick Start

```bash
# Test server health (should return 405 + discovery hint)
curl https://roadmancycling.com/api/mcp

# Send an MCP initialize request
curl -X POST https://roadmancycling.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

---

## Tools (9)

| Tool | Description |
|------|-------------|
| `get_community_stats` | Live podcast downloads, YouTube subscribers, community member counts |
| `search_episodes` | Semantic search across 1,400+ podcast episodes |
| `get_episode` | Full metadata for a specific episode by ID |
| `list_experts` | Roster of expert guests sorted by appearance count |
| `get_expert_insights` | Quotes and key insights from a named expert |
| `search_methodology` | Semantic search over Roadman coaching principles |
| `list_products` | Active NDY products with pricing |
| `list_upcoming_events` | Calendar of group rides, Q&As, and training camps |
| `qualify_lead` | Recommends the right product tier based on cyclist profile |

---

## Resources (3)

| URI | Description |
|-----|-------------|
| `roadman://brand/overview` | Brand identity, voice, and audience summary |
| `roadman://methodology/principles` | Five content pillars and core training principles |
| `roadman://experts/roster` | Named expert credentials and appearance counts |

---

## Rate Limiting

- **60 requests/minute per IP** (sliding window via Upstash Redis)
- Rate limiting gracefully degrades to no-op if `UPSTASH_REDIS_REST_URL` is not set
- Exceeded limit returns `429` with JSON-RPC error body

---

## Architecture

```
POST /api/mcp
  └── checkRateLimit(ip)          # Upstash Redis sliding window
  └── WebStandardStreamableHTTP   # MCP SDK Web API transport
  └── buildMcpServer(ip)          # Registers all 9 tools + 3 resources
       ├── withLogging()           # Wraps every handler — logs to mcp_call_logs
       └── services/               # One file per domain
            ├── community.ts
            ├── episodes.ts        # pgvector cosine similarity search
            ├── experts.ts
            ├── methodology.ts     # pgvector cosine similarity search
            ├── products.ts
            ├── events.ts
            └── qualification.ts  # Pure logic — no DB
```

### Transport

`WebStandardStreamableHTTPServerTransport` (not `StreamableHTTPServerTransport`) is required
for Next.js App Router — it works with Web API `Request`/`Response` types directly.
`sessionIdGenerator: undefined` makes each POST stateless (new session per request).

### Embeddings

- **Primary:** Voyage AI `voyage-3-large` (1024 dims) — set `EMBEDDING_PROVIDER=voyage`
- **Fallback:** OpenAI `text-embedding-3-large` (1024 dims) — set `EMBEDDING_PROVIDER=openai`
- Controlled by `EMBEDDING_PROVIDER` env var

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_URL` | Yes | Vercel Postgres connection string |
| `VOYAGE_API_KEY` | For semantic search | Voyage AI key |
| `OPENAI_API_KEY` | Fallback for semantic search | OpenAI key |
| `EMBEDDING_PROVIDER` | No (defaults to voyage) | `voyage` or `openai` |
| `UPSTASH_REDIS_REST_URL` | No (rate limiting disabled if absent) | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | No (rate limiting disabled if absent) | Upstash Redis token |

---

## Database Tables

All tables use the `mcp_` prefix (except `roadman_events`).

| Table | Purpose |
|-------|---------|
| `mcp_community_stats` | Singleton stats row (manually updated) |
| `mcp_episodes` | Podcast episode metadata |
| `mcp_episode_embeddings` | pgvector embeddings for episode search |
| `mcp_experts` | Expert guest roster |
| `mcp_expert_quotes` | Key quotes attributed to experts |
| `mcp_methodology_principles` | Core coaching principles |
| `mcp_methodology_embeddings` | pgvector embeddings for methodology search |
| `mcp_products` | Product catalogue with pricing |
| `roadman_events` | Upcoming events calendar |
| `mcp_call_logs` | Audit log for every tool call (ip hashed) |

---

## Seeding

```bash
# Community stats (singleton — run once then update manually)
npx tsx scripts/seed-mcp-community-stats.ts

# Expert roster + episodes + methodology principles
npx tsx scripts/seed-mcp-content.ts

# Product catalogue
npx tsx scripts/seed-mcp-products.ts

# Events calendar
npx tsx scripts/seed-mcp-events.ts
```

See `SEED_PLACEHOLDERS.md` for which fields need real data before production use.
