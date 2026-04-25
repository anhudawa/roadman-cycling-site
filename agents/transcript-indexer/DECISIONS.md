# Transcript Indexer Agent — Decisions & Assumptions

## Architecture

### MDX files, not page.tsx
The existing site uses a dynamic `src/app/(content)/podcast/[slug]/page.tsx` route
that renders MDX files from `content/podcast/`. The agent generates **enriched MDX
files** (not standalone page components) to match this pattern. The page already
handles Schema.org markup via `<JsonLd>`, transcript display via `<TranscriptViewer>`,
and related episodes via `<RelatedEpisodes>`.

### Standard Anthropic SDK, not Managed Agents SDK (yet)
The spec calls for Managed Agents runtime (`managed-agents-2026-04-01`). Since the
instruction is to stop after dry-run and NOT deploy, the pipeline is built using
`@anthropic-ai/sdk` (already in the repo's `package.json`) with manual model routing.
This will be wrapped in the Managed Agents SDK when we wire up the schedule.

### Advisor tool for Opus voice check
Step 4 uses the `advisor-tool-2026-03-01` beta header to invoke Opus 4.6 for the
voice fidelity gate. If this beta is unavailable, falls back to a direct
`claude-opus-4-6` API call at higher cost.

### Transcription: YouTube captions first, Whisper fallback
The repo already has a `youtube-transcript` based pipeline. For backfill, we use
existing YouTube auto-captions (already present on most episodes via
`enrich-transcripts.ts`). For new episodes in watch mode, we first try YouTube
captions; Whisper (via OpenAI API) is the fallback when captions aren't available
within the polling window. This avoids the cost of re-transcribing 1,400+ episodes
that already have usable transcripts.

### Episode numbering
Filenames use the YouTube video slug (e.g., `ep-2036-5-exercises-pogacar...`).
The `episodeNumber` in frontmatter is the internal sequence number. The agent
preserves both conventions.

## Content Generation

### Enriched MDX frontmatter
The generated MDX includes additional frontmatter fields beyond what `sync-youtube.ts`
creates:
- `sacredCowScore`: number (0-7) from voice check
- `primaryCluster`: string (cluster ID)
- `secondaryCluster`: string[] (0-2 cluster IDs)
- `primaryPersona`: string (persona ID)
- `guestName`: string
- `guestCredentials`: string
- `keyClaims`: string[]
- `namedExperts`: string[]
- `aiCitationBlock`: string (standalone quotable paragraph)

### Internal links
Reciprocal links are injected as MDX content blocks in existing episode files —
specifically a `## Related Episodes` section update. The agent only modifies files
in the same primary cluster and adds a single link per file, avoiding churn.

## Cost & Rate Limiting

### Backfill rate limiting
20 episodes per session hour as specified. Implemented via a simple token bucket
with 3-minute intervals between episodes.

### Model routing
| Step | Model | Reasoning |
|------|-------|-----------|
| 1. Metadata extraction | claude-haiku-4-5 | Structured extraction, low complexity |
| 2. Topic cluster assignment | claude-haiku-4-5 | Classification task |
| 3. Page generation | claude-sonnet-4-6 | Creative writing with voice constraints |
| 4. Voice fidelity check | claude-opus-4-6 | Nuanced quality gate — the hardest step |
| 5. Link injection | N/A (programmatic) | No LLM needed |
| 6. PR creation | N/A (gh CLI) | No LLM needed |

### Estimated cost per episode
- Step 1: ~2K input + ~500 output on Haiku = ~$0.005
- Step 2: ~1K input + ~300 output on Haiku = ~$0.003
- Step 3: ~4K input + ~3K output on Sonnet = ~$0.06
- Step 4: ~5K input + ~1K output on Opus = ~$0.05
- Total: ~$0.12/episode (without regenerations)
- Full backfill (1,400 episodes): ~$168

## RSS Polling

### Feed URL
Set via `PODCAST_RSS` env var. Default polling interval: 6 hours in watch mode.
The agent diffs against `content/podcast/index.json` (will be created if missing)
which stores processed episode IDs.

## PR Strategy

### Watch mode: one PR per episode
Branch: `episode/<ep-number>-<slug>`
Title: `Episode <n>: <title> — auto-indexed`

### Backfill mode: batch PRs
10 episodes per PR to avoid review fatigue.
Branch: `backfill/<start>-<end>`
Title: `Backfill: Episodes <start>-<end> — auto-indexed`

## Observability

### Log format
JSONL at `logs/agent/<run-id>.jsonl` with one entry per step per episode.
Fields: timestamp, runId, episodeId, step, model, tokensUsed, runtimeMs,
regenerationAttempt, sacredCowResults, pass/fail.

### Weekly summary
`logs/agent/weekly-<date>.md` — generated programmatically, not via LLM.
