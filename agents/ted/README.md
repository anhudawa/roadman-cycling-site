# Ted — Community Agent

Autonomous agent that runs the free Roadman Cycling Clubhouse on Skool. Three jobs:

1. **Daily community prompt** — one post per day, rotating through 5 content pillars.
2. **New member welcomes** — within 24h, by first name, non-identical copy.
3. **Thread surfacing** — tag returners, link podcast episodes, summarise discussion for lurkers.

Transparent: posts under a profile clearly identified as an AI assistant. Anthony batch-approves drafts. Kill switch in `/admin/ted/settings`.

## Runtime split

Skool has no public posting API. Two runtimes:

- **Drafting (no browser)** → Vercel Cron endpoints under `/api/cron/ted-*`. Generates draft posts via Claude, writes to Postgres, runs voice-check. No Skool login.
- **Posting + scanning (Playwright)** → GitHub Actions workflows in `.github/workflows/ted-*.yml`. Reads approved drafts from Postgres, posts into Skool, scans threads.

Skool credentials live as GitHub Actions secrets; the Next.js app never holds them.

## Commands

```bash
# Drafting (runs anywhere)
npm run ted:draft-prompt -- --dry-run           # generate tomorrow's prompt, don't write DB
npm run ted:draft-prompt -- --date=2026-04-20   # generate for a specific date
npm run ted:draft-welcome -- --dry-run          # draft pending welcomes

# Posting (requires Playwright + Skool login)
npm run ted:post-prompt -- --dry-run            # log in, navigate, screenshot, don't submit
npm run ted:post-welcome -- --dry-run
npm run ted:surface -- --dry-run                # scan + generate, don't post
```

## Files

- `src/index.ts` — entrypoint, dispatches on `--job=<name>`
- `src/jobs/*` — job orchestrators
- `src/generators/*` — Claude-backed content generators
- `src/lib/*` — shared (anthropic, voice-check, skool-browser, memory, kill-switch, log, alert)
- `prompts/*` — system prompts for each pillar and job (markdown)
- `data/episode-topic-map.json` — manual top-50 podcast episodes by topic (curated for v1)

## Voice

Voice rules live in `prompts/system-ted.md` and the short-form voice-check in `prompts/voice-check-ted.md`. Short-form adaptation of `agents/transcript-indexer/prompts/step4-voice-check.md`. Retries up to 2x, then parks as `voice_flagged` for human review in `/admin/ted/queue`.

## Rollout

Per-job posting is gated by flags in the `ted_kill_switch` table:

- `paused` — global kill switch
- `post_prompt_enabled` — enable posting daily prompts
- `post_welcome_enabled` — enable posting welcomes
- `surface_threads_enabled` — enable posting thread surfaces

Week 1 all flags false (shadow mode). Flip per-job as each lane stabilises.
