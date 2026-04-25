# Ted $€” Rollout Runbook

Step-by-step for taking Ted from a merged branch to fully-operational, following the 6-week rollout sequence in the spec.

---

## Pre-flight (do once, before any week starts)

### 1. Merge and deploy

- Merge the branch to `main`. Vercel auto-deploys the Next.js app (admin UI + API + weekly digest cron).

### 2. Run the database migration

One of:
```bash
npm run db:migrate
```
or apply directly: `drizzle/0019_ted_community_agent.sql`. The migration seeds `ted_kill_switch` with `paused=false` but every posting gate (`post_prompt_enabled`, `post_welcome_enabled`, `surface_threads_enabled`) starts **false** $€” shadow mode by default.

Verify in `/admin/ted/settings` that all three gates show as **shadow**.

### 3. Set GitHub Actions secrets

In the repository settings (Settings $†’ Secrets and variables $†’ Actions):

Required:
- `ANTHROPIC_API_KEY` $€” Claude access for drafting and voice-check
- `POSTGRES_URL` $€” the same `@vercel/postgres` URL the Next app uses
- `SKOOL_EMAIL` / `SKOOL_PASSWORD` $€” Ted's Skool account credentials (NOT Anthony's)
- `SKOOL_COMMUNITY_SLUG` $€” `roadman` unless it changed
- `SKOOL_INTRO_CATEGORY` $€” exact Skool category name for welcomes (default: `Intro Yourself`)

Optional but recommended:
- `RESEND_API_KEY` $€” for error/flag alerts
- `TED_ADMIN_ALERT_EMAIL` $€” who gets the alerts
- `TED_ALERT_FROM` $€” `ted@roadmancycling.com` or similar verified sender

### 4. Set Vercel env vars

For the weekly digest email + heartbeat alerts to work, Vercel project needs:
- `CRON_SECRET` (should already exist for other cron routes)
- `RESEND_API_KEY` and `TED_ADMIN_ALERT_EMAIL`
- `ANTHROPIC_API_KEY` and `POSTGRES_URL` for the `/api/admin/ted/*` routes

Optional $€” enables the "Run a job now" buttons on `/admin/ted/settings`:
- `GITHUB_TOKEN` (fine-grained, scope = `actions:write` on the repo)
- `GITHUB_REPO` (e.g. `anhudawa/roadman-cycling-site`)
- `GITHUB_DEFAULT_BRANCH` (defaults to `main`)

### 5. Set up Ted's Skool profile

Paste this exact bio into Ted's Skool profile:

> Ted $€” Roadman Cycling's AI community assistant. I surface good conversations, welcome new members, and make sure nothing important gets missed. Anthony still runs the show. Built by the Roadman team. If something's off, reply to the post and one of us will sort it.

Profile picture: whatever Anthony wants, but something that doesn't look like a real person.

### 6. Connect the Skool webhook

If not already: In Skool admin $†’ Settings $†’ Webhooks $†’ Add:
- URL: `https://roadmancycling.com/api/skool-webhook`
- Header: `Authorization: Bearer <SKOOL_WEBHOOK_SECRET>`

That webhook already tags members to Beehiiv; Ted now also enqueues a welcome row in `ted_welcome_queue`.

---

## Pre-flight verification (do before Week 1)

### A. Dry-run the drafting path

Manually trigger the `Ted $€” draft daily prompt` workflow from GitHub Actions UI with `dry_run=true`. Check:

- The workflow run succeeds.
- Artifacts contain `logs/ted/*.jsonl` with `"action":"generated"` and `"voiceCheckPass":true|false`.
- The generated body is visible in the log payload.

### B. Dry-run the posting path

Trigger `Ted $€” post daily prompt` with `dry_run=true`. Check:

- Workflow logs in at `https://www.skool.com/login` (look for `login-complete` screenshot in the artifact).
- Community page loads (`community-home` screenshot).
- Composer opens and fills (`compose-filled` screenshot).
- The workflow logs `[skool-browser] dry-run $€” skipping Post button click`.

**If any selector fails**, check the screenshot and update `SELECTORS` in `agents/ted/src/lib/skool-browser.ts`. Every Skool UI change risks this; keep an eye.

### C. Verify the admin UI

- Log in to `/admin/ted`.
- Click through: dashboard $†’ queue $†’ log $†’ settings.
- Confirm kill switch toggles work (flip on, flip off; watch the page update).

---

## Week 1 $€” Shadow mode (all gates off)

All gates stay **shadow**. Ted runs drafting + (dry-run) scans, never posts.

- `ted-draft-prompt` workflow runs at 06:00 UTC daily $†’ drafts land in `/admin/ted/queue`.
- Anthony reviews on Monday and Thursday. Edits go through the queue UI $€” every edit writes to `ted_edits` for the weekly digest metric.
- Welcomes + surfacing stay false. No Skool activity from Ted.

**Success for Week 1:** 7 drafts in the queue, Anthony's edits captured, no errors in `/admin/ted/log`.

---

## Week 2 $€” Enable daily prompts

At `/admin/ted/settings`, flip **Daily prompts** to enabled.

- `ted-post-prompt` workflow (06:30 UTC daily) now publishes the next approved draft.
- Anthony continues batch-approving on Mon/Thu.
- Monitor `/admin/ted/log` for `post-prompt` errors. Common first-run failures are Skool selector mismatches $€” update `skool-browser.ts`.

**Success for Week 2:** 7 days of published prompts, no misposts, no banned phrases in production.

---

## Week 3 $€” Enable welcomes

Flip **New-member welcomes** to enabled.

- `ted-welcomes` workflow runs twice daily (08:00 and 17:00 UTC).
  Phase 1 drafts; phase 2 posts the rows you've **approved** in `/admin/ted/welcomes`.
- Per-day draft cap: job skips if fewer than 3 pending welcomes exist, to avoid weird single-member welcome days. Override with `inputs.force=true` on a manual run.
- Every welcome needs human approve-edit-or-reject at `/admin/ted/welcomes`.

**Success for Week 3:** All new members welcomed within 24h. Every welcome reviewed by a human. No two welcomes are identical.

---

## Week 4 $€” Enable thread surfacing

Flip **Thread surfacing** to enabled.

- `ted-surface-threads` workflow runs at 13:00 UTC daily.
  Phase 1 (draft-surfaces) scans the last 48h of threads and drafts up to 2 candidate replies into `ted_surface_drafts`.
  Phase 2 (post-surfaces) posts only the drafts you've approved in `/admin/ted/surfaces`.
- Criteria: $‰¥3 replies, not already surfaced in last 48h, not authored by Ted or Anthony.

**Pre-requisite:** `ted_active_members` should have at least 10 rows so `surface-tag` can fire. See "Seeding active members" below.

**Success for Week 4:** 3+ thread surfaces per week after your review, all with genuine value-add (tag, link, or summary).

---

## Weeks 5$€“6 $€” Full operation

All three gates on. Anthony batch-approves prompts Mon/Thu. Weekly digest email lands Monday morning.

Watch `/admin/ted` dashboard for:
- **Edit rate $†“** over time (Ted learning Anthony's voice)
- **Voice-flagged drafts $†“** (cheap scan catching more before Opus runs)
- **Posted prompts = 7/week**
- **Errors $†“ or stable near zero**

### Decision point at Week 6

- Edit rate **<20%** $†’ hand over to Sarah with the voice notes Anthony accumulated.
- Edit rate **20$€“50%** $†’ Sarah shadows Anthony for 2 weeks.
- Edit rate **>50%** $†’ extend batch approval 4 more weeks. Don't push Sarah.

---

## Seeding active members (for Week 4)

`ted_active_members` powers `surface-tag`. Until a Playwright scanner populates it automatically, seed manually from a CSV:

```bash
npx tsx agents/ted/scripts/seed-active-members.ts --file=path/to/members.csv
```

CSV format:
```
member_id,first_name,topic_tags
alice-123,Alice,"endurance,nutrition"
seÃ¡n-456,SeÃ¡n,culture
```

Re-run any time. The seeder upserts, so repeated rows update `last_seen_at` and tags.

---

## Admin UI tour

Every `/admin/ted/*` page shares a navigation bar across the top:

- **Dashboard** $€” six stat cards (drafts pending, edit rate, voice-pass rate, welcomes ready, surfaces, 7d cost), per-gate status pills, daily-cost bar chart, recent errors, preflight checks, schedule with live countdowns, recent GitHub Actions runs, Ted's Skool bio with a copy button.
- **Queue** $€” draft-by-draft review. Approve, edit (captures a word-level diff + logs the change), or reject. Chips at the top filter by status or pillar and are URL-param driven for bookmarkable views.
- **Welcomes** $€” read-only view of the welcome pipeline (pending $†’ drafted $†’ posted), showing persona, draft body, and Skool link once posted.
- **Members** $€” `ted_active_members` roster plus a paste-CSV upsert form. Sample CSV at `agents/ted/data/example-members.csv`.
- **Log** $€” latest 200 activity log entries with filter query-params, auto-refresh toggle (default 30s), and a JSONL export for archival.
- **Settings** $€” kill switch + three per-job posting gates + a "Run a job now" panel (requires `GITHUB_TOKEN`).

## Health endpoint for external monitoring

`GET /api/admin/ted/health` returns `{status, checks[]}` and a 200/503 status code. Accepts either the admin session OR `Authorization: Bearer <CRON_SECRET>` so UptimeRobot / Pingdom / Better Uptime can ping it directly. Useful to wire into whatever monitoring Anthony already uses.

## Emergency pause

From `/admin/ted/settings`, click the kill switch. Every scheduled Ted job reads the flag at start and between items $€” a mid-run pause aborts within one post/welcome/surface.

Resume by clicking again. Reason field is optional; it shows up on the dashboard when paused.

---

## Troubleshooting quick reference

| Symptom | Most likely cause | Fix |
|---|---|---|
| Playwright workflow fails at login | Selector drift | Update `SELECTORS.loginEmail`/`loginPassword`/`loginSubmit` in `skool-browser.ts` |
| `voice_flagged` piling up in queue | System prompt too strict OR model drift | Check `voice-check-ted.md` red-flag list; review last 10 flagged drafts for common pattern |
| Welcomes identical | Welcome generator not rotating | Check `prompts/welcome.md` opener list; regenerate the `ted_welcome_queue` row (mark status='pending') |
| Weekly digest not arriving | Missing `RESEND_API_KEY` on Vercel | Set env var, redeploy |
| `post-prompt` succeeds but `skool_post_url` is wrong | Skool URL capture is `page.url()` best-effort | Tune the post-submit wait in `postToCommunity()` to wait for the feed page to settle |
| Kill switch flipped but jobs still run | Cache or stale cron | Check `/admin/ted/log` $€” jobs that started before the flip will finish their single item then abort |
