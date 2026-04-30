# SEO-NEW-15 — MCP server completeness pass

**Date:** 2026-04-30
**Status:** Approved
**Scope:** Audit existing 6 MCP tools in `/mcp-server/` against the SEO-NEW-15 spec, close gaps, and add the missing `fetch_training_plan` tool. Ship today.

## Context

A read-only stdio MCP server already lives at `/mcp-server/` (publishable as `@roadman/mcp-server`) with 6 tools: `search_roadman`, `fetch_article`, `fetch_episode`, `fetch_guest`, `fetch_glossary_term`, `fetch_tool_result`. The 7th spec'd tool, `fetch_training_plan`, is missing. Several existing tools also under-deliver against the spec because they query summary-level feeds (`/feeds/*.json`) instead of the richer `/api/v1/fetch` endpoint, which has been extended since they were written.

A separate in-app HTTP MCP server at `/src/app/api/mcp` exists for the funnel/community use case (qualify_lead, list_products, semantic search). That server is out of scope for this work.

## Audit

| Tool | Spec | Current | Gap |
|---|---|---|---|
| `search_roadman` | articles, episodes, guests, tools, glossary | type enum: article\|episode\|topic\|glossary; backend doesn't index guests or tools | Backend search must also index guests + tools; MCP enum extended |
| `fetch_article` | markdown body, citations, related pages | `/api/v1/fetch?type=article` already returns all of these | None |
| `fetch_episode` | guest, topic, key takeaways | Hits `/feeds/episodes.json` — only feed-level fields | Must hit `/api/v1/fetch?type=episode` for `keyQuotes` (= key takeaways), body, transcript |
| `fetch_guest` | bio, episodes appeared on, expertise areas | Hits `/feeds/guests.json` — credential + relatedEpisodes (slugs only) | Must hit `/api/v1/fetch?type=guest` — episodes with titles + `pillars`/`tags` (= expertise) |
| `fetch_tool_result` | run a tool calculation | `/api/v1/tools/<slug>` passthrough — works for all 4 tools | None |
| `fetch_training_plan` | training plan details | Not implemented | New tool + new backend endpoint required |
| `fetch_glossary_term` | definition, related terms | Hits `/feeds/glossary.json` with case-insensitive lookup | Resolve slug from feed, then call `/api/v1/fetch?type=glossary` for `extendedDefinition` body + `relatedPages` |

## fetch_training_plan — interpretation

"Training plan" in this codebase has two meanings. The spec describes (B):

- **(A) Calculator-generated outline** — `/api/v1/tools/training-plan` (already reachable via `fetch_tool_result`).
- **(B) Static event-based plan** — `EVENTS` × `PHASES` data in `src/lib/training-plans.ts`, powering `/plan/[event]/[weeksOut]/`. **No API yet.**

We add a new `/api/v1/training-plan` endpoint exposing the event + phase(s) data, and a `fetch_training_plan(event, weeksOut?)` MCP tool that calls it.

## Changes

### Backend

**New: `src/app/api/v1/training-plan/route.ts`**
`GET /api/v1/training-plan?event=<slug>[&weeksOut=<n>]`

- `event` (required) — slug of a `TrainingEvent` (e.g. `wicklow-200`).
- `weeksOut` (optional) — if provided, return only the matching `TrainingPhase`; otherwise return all phases.
- Response: event metadata, selected phase(s), linked `blogSlug` if any, `baseUrl`, `generatedAt`.
- 404 on unknown event; 400 on invalid `weeksOut`.

**Modified: `src/app/api/v1/search/route.ts`**

- Index `getAllGuests()` (title=name, keywords=pillars+tags, body=credential).
- Index the static tools registry (`/tools/<slug>` titles + descriptions).
- Extend `SearchHit["type"]` union to include `guest` and `tool`.
- Existing comma-separated type filter already handles the new types.

### MCP server (`/mcp-server`)

**Modified: `src/index.ts`**

1. `search_roadman` — extend `type` enum to `["article", "episode", "topic", "glossary", "guest", "tool"]`.
2. `fetch_episode` — replace feed lookup with `/api/v1/fetch?type=episode&id=<slug>`. Errors map directly through `getJson`.
3. `fetch_guest` — same: `/api/v1/fetch?type=guest&id=<slug>`.
4. `fetch_glossary_term` — keep the case-insensitive feed resolver so `"FTP"` / `"RED-S"` still work, then chain into `/api/v1/fetch?type=glossary&id=<slug>` for `extendedDefinition`.
5. **New** `fetch_training_plan(event, weeksOut?)` — calls `/api/v1/training-plan`.
6. Version bump: `0.1.0` → `0.2.0`.
7. README: list 7 tools; include training-plan example.
8. `scripts/smoke.mjs` — assert 7 tools present.

### Tests

- `tests/api/v1/training-plan.test.ts` — happy path, weeksOut filter, 404, 400.
- `tests/api/v1/search.test.ts` — guest + tool result types appear when included.
- Smoke remains the only mcp-server test (no live network).

## Non-goals

- Rewriting the in-app HTTP MCP server.
- Publishing `@roadman/mcp-server` to npm in this PR.
- Adding `topic` to the spec list (already supported in MCP server, leave as-is).

## Verification

```bash
npm run typecheck
npm test -- tests/api/v1
npm run build
cd mcp-server && npm run build && npm run smoke
```
