# LLM Citation Monitor — AEO Scoreboard

Tracks whether **roadmancycling.com** appears in search results for high-value queries that AI answer engines (ChatGPT, Perplexity, Gemini) are likely to source from. Run monthly to measure AEO progress.

## How it works

1. Reads 20 queries from `queries.json`, organized by persona (Tom, Mark, James, Dave)
2. Searches each query via Google (with SearXNG fallback)
3. Logs which domains appear in the top results
4. Flags whether `roadmancycling.com` appears and at what position
5. Outputs a JSON report and a human-readable markdown report
6. Compares against the previous report if one exists (month-over-month deltas)

## Running it

From the project root:

```bash
# Full run — searches all 20 queries, writes reports
npx tsx scripts/llm-citation-monitor/monitor.ts

# Dry run — lists queries without making network requests
npx tsx scripts/llm-citation-monitor/monitor.ts --dry-run
```

No API keys or environment variables required.

## Reading the report

Reports are saved to `scripts/llm-citation-monitor/reports/`:

- `citation-report-YYYY-MM-DD.json` — machine-readable, full data
- `citation-report-YYYY-MM-DD.md` — human-readable with:
  - Executive summary (appearance rate, average position)
  - Month-over-month comparison (if a previous report exists)
  - Per-persona breakdown
  - Detailed per-query results
  - Top competitors by frequency
  - Action items (queries where Roadman doesn't appear)

## Editing queries

Open `queries.json` to add, remove, or modify queries. Each query has:

```json
{
  "id": "tom-06",
  "persona": "tom",
  "query": "threshold intervals for time trial",
  "intent": "informational",
  "priority": "medium"
}
```

- **id**: Unique identifier, used for month-over-month tracking. Don't change IDs for existing queries.
- **persona**: Must match a persona `id` in the `personas` array.
- **intent**: `informational`, `commercial`, or `navigational` — for context in reports.
- **priority**: `high` or `medium` — helps prioritize action items.

Add seasonal queries before big events (pre-Etape, pre-Marmotte, etc.) and remove them after.

## Suggested cadence

Run once per month, ideally on the same date each month for clean comparisons. The 1st or 15th works well.

```
# Example: first of each month
npx tsx scripts/llm-citation-monitor/monitor.ts
```

The script spaces queries 3 seconds apart to avoid rate limiting. A full run takes roughly 60-90 seconds.

## Limitations

- This measures search engine visibility, not direct LLM citation. True LLM citation monitoring would require API access to ChatGPT, Perplexity, etc.
- Google may throttle or block automated requests. The script handles this gracefully (logs errors, falls back to SearXNG, continues with remaining queries).
- Results reflect organic search rankings, which correlate with but don't guarantee AI answer engine citation.
- Position numbers are approximate — Google personalizes results by location, history, etc.
