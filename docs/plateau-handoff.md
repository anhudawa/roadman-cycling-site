# Plateau Diagnostic — Handoff to the Browser-Enabled Session

You are picking up the Plateau Diagnostic lead magnet project mid-flight. All code is done. Your job is to drive the operator setup that can't be automated from code — Vercel, Beehiiv, Cal.com, Meta Business — using the Playwright/browser tools you have.

## Context you need

- **Branch:** `claude/build-lead-magnet-ZyiYb` — 13 commits, all code shipped, typecheck + build + 87 tests clean.
- **Operator:** Anthony Walsh. You're working with him in real time. He has the credentials, you have the browser.
- **Chrome window** is already open. Anthony has logged (or will log) into each dashboard himself. Never ask for passwords.

## Read these first (in the repo)

1. `docs/plateau-diagnostic.md` — ordered launch checklist, 11 sections
2. `docs/plateau-paste-packet.md` — every piece of paste-ready content (env var keys, Beehiiv email bodies, Cal.com event config, Meta pixel steps, FB ad copy for 3 variants)
3. `AGENTS.md` — project conventions

Do a quick scan of both docs before asking Anthony anything. Don't make him re-explain what's already written down.

## Ground rules

- **Be fast.** Anthony has flagged that the pace matters. Batch your questions where you can. Don't ask for one env var at a time when you could list all the ones you need and have him paste a block back.
- **Confirm before irreversible actions** — launching a Beehiiv automation live, publishing a Meta pixel, launching ads. Not for env var edits, not for creating draft events.
- **You drive the browser.** Anthony watches, corrects, and provides values. Don't push him into clicks you could do.
- **Never handle passwords or API keys in chat.** If he pastes a value to you, use it immediately and don't echo it back.
- **The branch is not merged yet.** Don't merge or auto-deploy without explicit approval.

## What's already been done (don't redo)

- All code on the branch
- `docs/plateau-diagnostic.md` + `docs/plateau-paste-packet.md` written
- Three npm scripts exist: `migrate:diagnostic`, `seed:beehiiv:plateau`, `smoke:plateau`
- Anthony has already added these to Vercel: `ANTHROPIC_API_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`
- Already in Vercel from prior work: `RESEND_API_KEY`, `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`

## What's left (in order)

### 1. Finish Vercel env vars
Two placeholders will be filled later (Cal.com URL after step 4, Meta Pixel after step 5). For now, confirm the six above are present.

### 2. Run the DB migration
Anthony pastes `POSTGRES_URL` into `.env.local`, then runs:
```
npm run migrate:diagnostic
```
Wait for the ✓ output. This creates `diagnostic_submissions` with both columns from migrations 0025 + 0026.

### 3. Beehiiv tags
Anthony runs:
```
npm run seed:beehiiv:plateau -- --email=seed@<a-test-inbox-he-owns>
```
It subscribes a seed address with all 7 tags attached — this is how we force-create the tags since Beehiiv's API auto-creates them on first use. It also prints the full §13 email sequence to his terminal. Ask Anthony to paste that output back to you — you'll use it in step 4.

### 4. Beehiiv automation (manual UI, you drive Chrome)
- Navigate to app.beehiiv.com → Audience → Automations → New
- Trigger: Tag applied → `plateau-diagnostic`
- Audience: All subscribers
- Build 5 emails with delays 0 / 1 / 3 / 5 / 7 days
- Subject lines + bodies come from the seed-script output
- Merge tags used: `{{ subscriber.custom_fields.diagnostic_profile }}` and `{{ subscriber.custom_fields.diagnostic_slug }}` — these are already written into our subscribe call so they render correctly
- Save as **draft first** — Anthony reviews — then he activates

Then delete the seed subscriber you created in step 3 (Audience → Subscribers → find seed@… → delete).

### 5. Cal.com event type
Template in `docs/plateau-paste-packet.md` §4. Create the event, copy the booking URL, paste back into Vercel as `NEXT_PUBLIC_CAL_BOOKING_URL`.

### 6. Meta Pixel
Only the pixel. Do NOT set up Conversions API — that's a later PR. Steps in `docs/plateau-paste-packet.md` §5. Copy the 16-digit pixel ID back to Vercel as `NEXT_PUBLIC_META_PIXEL_ID`.

### 7. Merge + deploy
Only when Anthony explicitly gives the go. Open the GitHub PR for `claude/build-lead-magnet-ZyiYb`, he reviews + merges, Vercel auto-deploys.

### 8. Smoke test
Anthony runs:
```
npm run smoke:plateau -- --url=https://roadmancycling.com
```
All ✓ → good. If anything fails, debug from the output and either the admin page (`/admin/diagnostic`) or the Vercel logs.

### 9. Facebook ads (optional this session)
Copy for all 3 variants is in `docs/plateau-paste-packet.md` §6. Needs Anthony's video/static assets — don't launch without confirmation.

## How to move fast

- When you need info, batch the question. "I need A, B, C — paste them in any format, I'll sort it out."
- When you're navigating Chrome, narrate what you're doing in short lines so Anthony can intercept if you go the wrong way.
- If a UI changes unexpectedly (Beehiiv / Meta redesign their dashboards often), ask Anthony to screenshot or describe what he sees rather than guessing.
- Don't explain what you just did unless asked — just say "done, moving on to X."

## Gotchas that already bit us

- **Beehiiv automations are not API-creatable** — they're UI-only. This is why step 4 is manual.
- **Meta Conversions API needs shared `eventID` for dedup with the client pixel** — if you skip this, Leads double-count. Deferred for this launch.
- **Cal.com booking webhook** is deferred — we'll wire `call_booked` attribution later.
- **The diagnostic_submissions table doesn't exist until step 2 runs.** If Anthony runs the smoke test before migrating, it 500s.

## Your first message to Anthony

Short. Something like:

> Read the handoff. Ready to pick up from step 2 — have you got `POSTGRES_URL` ready to drop into `.env.local`? If yes, add it and run `npm run migrate:diagnostic`. Paste the output back when done.

Then go.
