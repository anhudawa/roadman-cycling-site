# Ted $€” Changelog

## Unreleased $€” human-approval on every post

Extends the v1 review queue so **every** Ted post (prompts, welcomes, and
thread surfaces) requires human approval before it goes live $€” not just
prompts.

- **Welcomes** now gate on `status='approved'`. Previously `post-welcome`
  auto-picked `drafted` rows. New `/admin/ted/welcomes` has an interactive
  "Needs review" section with approve / edit-and-approve / reject per draft
  and the same word-level diff used on the prompt queue.
- **Surfaces** get a new table `ted_surface_drafts` (migration
  `0020_ted_surface_drafts.sql`). The old single `surface-threads` job is
  split into `draft-surfaces` (scan $†’ generate $†’ store) and `post-surfaces`
  (drain approved $†’ Playwright). New `/admin/ted/surfaces` page with the
  same review UX. Thread title + author + body shown in context.
- New top-nav link **"Surfaces"** on every `/admin/ted/*` page.
- `ted-surface-threads.yml` GitHub workflow now runs draft then post in one
  scheduled job.

## v1 $€” 2026-04-16

First end-to-end build of the transparent AI community agent for the free Roadman Cycling Clubhouse on Skool. Drafts, welcomes, and thread surfaces via Claude + Playwright, human batch-approval through `/admin/ted`, gated per-job posting with a kill switch.

### Scope

Three jobs, each tied to a per-job enable flag in `ted_kill_switch`:

- **Daily prompt** $€” one post per day rotating through 7 pillar prompts (coaching, nutrition, S&C, recovery, Community, podcast-episode, weekend ride). Drafts land in the review queue; Anthony batch-approves; GitHub Actions posts.
- **New-member welcomes** $€” drafted hourly, posted twice daily. First-name, non-identical copy, persona-aware when the Skool webhook provided classification. Skipped if fewer than 3 members are pending (per spec: "daily welcomes for one person feels weird").
- **Thread surfacing** $€” daily scan of the last 48h. Generator cascades tag $†’ link $†’ summary, picks the first variant that clears voice-check. Up to 2 surfaces per run.

### Runtime split

- **Drafting, scanning, posting** $€” GitHub Actions scheduled workflows under `.github/workflows/ted-*.yml`. Playwright runs here; credentials live as repository secrets, never in the Next.js app.
- **Admin UI + monitoring** $€” Next.js at `/admin/ted` (dashboard, queue, welcomes, members, log, settings) backed by admin API routes.
- **Weekly digest + heartbeat alerts** $€” Vercel cron routes `/api/cron/ted-weekly-digest` and `/api/cron/ted-heartbeat`.

### Voice control

- Short-form voice-check at `agents/ted/prompts/voice-check-ted.md`, adapted from the transcript-indexer's Sacred Cow framework.
- Cheap pre-check scans for banned phrases before the paid Opus call.
- Retry loop regenerates up to 2x; a third failure parks the draft as `voice_flagged` in the queue.
- Prompt files themselves are lint-tested $€” non-list prompts can't contain banned phrases.

### Admin UI (`/admin/ted`)

- **Dashboard** $€” paused banner, 6 stat cards (drafts pending, edit rate, voice-pass rate, welcomes ready, surfaces this week, cost), per-gate posting status, daily cost bar chart, recent errors, preflight checks (DB, env vars, activity freshness), static cron schedule with countdown to next run, and Ted's Skool bio with a copy button.
- **Queue** $€” draft-by-draft review with approve / edit-and-approve / reject. Edits capture before/after into `ted_edits` for the weekly metric, and show a toggleable word-level diff.
- **Welcomes** $€” read-only view of the `ted_welcome_queue` pipeline (pending $†’ drafted $†’ posted).
- **Members** $€” `ted_active_members` roster for thread-surface tagging, with an explicit warning when empty.
- **Log** $€” last 200 activity log entries, filterable by job / level.
- **Settings** $€” kill switch + three per-job posting gates (prompts / welcomes / surfaces).

### Persistence

Eight new Postgres tables (migration `0019_ted_community_agent.sql`):

- `ted_drafts` $€” daily prompt queue with status lifecycle and voice-check JSON
- `ted_welcome_queue` $€” new-member welcome queue keyed by email
- `ted_surfaced` $€” thread-surface history with 48h de-dup
- `ted_active_members` $€” tag candidates
- `ted_activity_log` $€” JSONL-mirrored run log
- `ted_edits` $€” Anthony's edit diffs for the edit-rate metric
- `ted_kill_switch` $€” singleton row for global pause + three per-job gates

### Guardrails + operator tooling

- **Kill switch** $€” checked at job start and between items, so mid-run pauses stop within one post.
- **Heartbeat cron** $€” every 6h, emails via Resend if no activity in 36h. 24h de-dup.
- **Weekly digest** $€” Mondays, Resend email with edit rate, voice-flag count, welcomes posted, surfaces, and cost.
- **ROLLOUT.md** $€” week-by-week deployment checklist with pre-flight, dry-run verification, gate flip sequence, troubleshooting table.
- **CI** $€” typecheck + Ted tests + CLI-boot on every Ted-branch push and any PR touching Ted files.
- **CSV seeder** $€” `agents/ted/scripts/seed-active-members.ts` unblocks thread-surface tagging before the Playwright member scanner exists.
- **Topic-map rebuilder** $€” `agents/ted/scripts/rebuild-topic-map.ts` regenerates `agents/ted/data/episode-topic-map.json` from `content/podcast/` frontmatter.

### Tests

68 unit tests across 10 files:

- `agents/ted/src/config.test.ts` $€” pillar rotation, Dublin timezone
- `agents/ted/src/lib/voice-check.test.ts` $€” banned-word scanner
- `agents/ted/src/lib/csv.test.ts` $€” CSV parser for the seeder
- `agents/ted/src/generators/surface-generator.test.ts` $€” tag $†’ link $†’ summary cascade with mocked Claude + voice-check
- `agents/ted/prompts/prompts.test.ts` $€” prompt-file lint
- `agents/ted/data/episode-topic-map.test.ts` $€” topic-map shape
- `src/lib/skool/persona.test.ts` $€” persona classifier
- `src/lib/text/word-diff.test.ts` $€” queue diff helper
- `src/app/admin/(dashboard)/ted/_components/ScheduleCard.test.ts` $€” next-run calculator

### Known limitations

- **Skool selectors are best-guess** $€” `agents/ted/src/lib/skool-browser.ts` uses educated-guess selectors from the public Skool UI as of April 2026. First production dry-run must verify screenshots and tune selectors.
- **Active-members scanner not built** $€” surface-tag falls through to link or summary until `ted_active_members` is populated (use the CSV seeder).
- **Saturday pillar without episode context** $€” returns `[SKIP]` and parks as `voice_flagged` for human review.
- **Cost cap not implemented** $€” the weekly digest shows cost so anomalies are visible, but no automatic pause on runaway spend.
