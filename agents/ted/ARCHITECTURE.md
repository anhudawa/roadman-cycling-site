# Ted — Architecture

The agent is split across three runtimes on purpose. Each has the minimum access it needs and no more.

```
                       ┌──────────────────────────────────────────┐
                       │              Skool Clubhouse             │
                       │   (no posting API — browser only)        │
                       └──────────┬────────────────────▲──────────┘
                                  │ new-member webhook │ Playwright
                                  │                    │ login + post + scan
                                  ▼                    │
           ┌──────────────────────────────────┐        │
           │       Vercel (Next.js app)       │        │
           │                                  │        │
           │  /api/skool-webhook              │        │
           │  /api/cron/ted-weekly-digest     │        │
           │  /api/cron/ted-heartbeat         │        │
           │  /admin/ted/* (dashboard, queue, │        │
           │    welcomes, members, log,       │        │
           │    settings)                     │        │
           │  /api/admin/ted/*  (drafts,      │        │
           │    kill-switch, members, log,    │        │
           │    health, trigger, workflow-runs)│       │
           └──────────────┬───────────────────┘        │
                          │                            │
                          │ reads + writes             │
                          ▼                            │
         ┌─────────────────────────────────────────────┴──┐
         │               Vercel Postgres                  │
         │                                                │
         │   ted_drafts            ted_welcome_queue      │
         │   ted_surfaced          ted_active_members     │
         │   ted_activity_log      ted_edits              │
         │   ted_kill_switch                              │
         └─────────────────────────────────────────────┬──┘
                          ▲                            │
                          │ reads + writes             │
                          │                            │
           ┌──────────────┴───────────────────┐        │
           │   GitHub Actions (scheduled)     │        │
           │                                  │        │
           │  ted-draft-prompt                │        │
           │  ted-post-prompt   ──────────────┼────────┘
           │  ted-welcomes                    │
           │  ted-surface-threads             │
           │                                  │
           │  Anthropic SDK (Claude)          │
           │  Playwright (chromium)           │
           │  tsx agents/ted/src/index.ts     │
           └──────────────────────────────────┘
```

## Why this split

- **Skool has no public posting API** — the only way to publish is a logged-in browser session, so Playwright has to run somewhere. Vercel serverless can't run a real browser.
- **GitHub Actions** gets the Skool credentials. It's where drafting, voice-checking, posting, and scanning all happen, via a single tsx entrypoint dispatched by `--job=`.
- **Next.js on Vercel** owns the admin dashboard, the Skool webhook, the weekly-digest email, and the heartbeat-stale alerts. None of those need Playwright.
- **Postgres** is the single source of truth both sides touch. Vercel and GH Actions both point at `POSTGRES_URL`.

## Daily lifecycle for a prompt

1. **06:00 UTC** — `ted-draft-prompt.yml` runs. tsx agents/ted/src/index.ts --job=draft-prompt.
   - Figures out tomorrow's Dublin date and pillar.
   - Runs `generateDailyPrompt` (Haiku draft + cheap banned-word scan + Opus voice-check, retry up to 2x).
   - Inserts the draft into `ted_drafts` with status `draft` (or `voice_flagged` on persistent failure).
   - Logs to `ted_activity_log` + JSONL on disk.

2. **Any time Mon/Thu mornings** — Anthony opens `/admin/ted/queue` in the Next.js app, reviews each draft, clicks approve / edits / rejects. Edits are written to `ted_edits` for the edit-rate metric.

3. **06:30 UTC** — `ted-post-prompt.yml` runs. tsx agents/ted/src/index.ts --job=post-prompt.
   - Checks kill switch + `post_prompt_enabled` gate. Aborts clean if either is off.
   - Picks the next approved draft whose `scheduled_for` ≤ today.
   - Opens Playwright, logs in to Skool, posts.
   - Marks the draft `posted` with the Skool URL.

4. **All runs log to `ted_activity_log`**, which surfaces in the admin `/admin/ted/log` page and rolls up into the weekly digest email.

## Voice-check retry loop

Every generator shares the same loop:

```
for attempt in 0..MAX_VOICE_RETRIES:
  body = callLLM(prompt, optional regeneration feedback)
  if body.startsWith("[SKIP"): break with FAIL
  if cheap banned-word scan hits: retry with explicit phrase feedback
  voiceCheck = callOpusAdvisor(voice-check prompt, body)
  if voiceCheck.pass: break with PASS
  retry with voiceCheck.regenerationNotes
return body + final voiceCheck
```

Persistent failures aren't dropped — they're stored with `status = voice_flagged` so a human can see the attempts and the feedback Opus gave.

## Kill switch semantics

Every long-running job:

```
state = assertNotPaused()              // throws if ted_kill_switch.paused = true
if !state[gate_for_this_job]: exit     // per-job shadow toggle
for item in batch:
  process(item)
  assertNotPaused()                    // re-check between items
```

Worst case a mid-run pause lets one in-flight post finish, then every subsequent item sees the new state and exits cleanly.

## Cost

Each job writes `payload.cost` into `ted_activity_log`. The admin dashboard sums over 7d for the "Cost (7d)" card and the daily bar chart. The weekly digest email rolls this into the "Pipeline health" section.

Rough per-day costs (assuming normal retry rate):

- draft-prompt: $0.01–0.05 (Haiku draft + Opus voice-check, 1–3 attempts)
- welcomes: $0.005–0.03 per welcome
- surface-threads: $0.02–0.08 per run (Sonnet is pricier, 1–3 variants tried)

## Where new code goes

- **Drafting logic** (Claude + voice rules) → `agents/ted/src/generators/*`, `agents/ted/src/lib/voice-check.ts`, `agents/ted/prompts/*`
- **Posting/scraping** (Playwright, Skool DOM) → `agents/ted/src/lib/skool-browser.ts`
- **Job orchestration** → `agents/ted/src/jobs/*`
- **DB access** → `agents/ted/src/lib/memory.ts` (and `src/lib/db/schema.ts` for schema)
- **Admin pages** → `src/app/admin/(dashboard)/ted/*`
- **Admin APIs** → `src/app/api/admin/ted/*`
- **Vercel cron endpoints** → `src/app/api/cron/ted-*`
- **GitHub workflows** → `.github/workflows/ted-*.yml`
