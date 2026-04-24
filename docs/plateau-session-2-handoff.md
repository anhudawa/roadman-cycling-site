# Plateau Diagnostic — Session 2 Handoff

Picking up from the browser-enabled session that drove the operator setup.
This is the next handoff: what's done, what's broken, what's left.

## Current state (end of session 2, 2026-04-22)

### Done
- **DB migrations** 0025 + 0026 applied to prod Postgres. `diagnostic_submissions` table verified, 0 rows, `retake_number` column present.
- **Beehiiv tags** — all 7 exist in "The Saturday Spin" publication (`pub_196bef03-2d1d-462f-b038-0378c50333dc`). Note: Beehiiv lowercases on storage, so the camelCase ones appear as `profile-underrecovered`, `profile-strengthgap`, `profile-fuelingdeficit`. See gotcha #1.
- **Cal.com event** live at `https://cal.com/roadman/plateau-15`. 15 min, Cal Video default. Username `roadman` claimed.
- **Meta Pixel ID** captured: `649389789190949`.
- **PR #38** opened on `claude/build-lead-magnet-ZyiYb` → `main`. Title "Plateau Diagnostic: end-to-end lead magnet at /plateau". 3 checks green, Vercel preview deployed successfully.

### Blocked / in-flight
- **PR #38 merge** is blocked by a branch-protection rule on `main` ("Merging is blocked due to failing merge requirements"). Need Anthony to approve his own PR (Files → Review changes → Approve) or bypass the rule via the dropdown next to the Merge button.
- **Vercel env vars** — two still need adding, all scopes (Production + Preview + Development):
  ```
  NEXT_PUBLIC_CAL_BOOKING_URL=https://cal.com/roadman/plateau-15
  NEXT_PUBLIC_META_PIXEL_ID=649389789190949
  ```
  The six from the original handoff (ANTHROPIC_API_KEY, CRON_SECRET, NEXT_PUBLIC_SITE_URL, RESEND_API_KEY, BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID) should already be there — confirm while in Vercel settings.
- **Beehiiv automation** — draft exists, named "Plateau Diagnostic Nurture (5 emails)", automation id `02957fbc-acf0-4e4a-9ed1-08a352b8357a`. Segment-action trigger type is selected; no segment bound yet, no emails built.

## What's left — in priority order

### 1. Merge + deploy (finish step 7)
Anthony must approve the PR and merge. I cannot bypass branch protection.
After merge → Vercel auto-deploys `main` to prod.

### 2. Smoke test (step 8)
After Vercel promotes the build, Anthony runs from his terminal (not the sandbox — see gotcha #2):
```
cd ~/Desktop/roadman-cycling-site
git checkout main && git pull
npm run smoke:plateau -- --url=https://roadmancycling.com
```
All ✓ = live and capturing leads.

If any fail, debug from stdout + `/admin/diagnostic` + Vercel logs. Rate-limit layer is in `src/lib/diagnostic/rate-limit.ts`.

### 3. Beehiiv automation (finish step 4) — the big remaining UI job
This was deferred in session 2 because rich-text email editing through browser MCP is a ~100-tool-call operation and context ran out. Cleanest way in a fresh session:

1. **Create the segment first.** In Beehiiv UI → Audience → Segments → New segment:
   - Name: `plateau-diagnostic`
   - Filter: Tag is `plateau-diagnostic`
   - Save
2. **Open automation** `Plateau Diagnostic Nurture (5 emails)` (Automations list → it's a Draft).
3. **Bind segment** on the Segment action trigger — `Enters` + segment `plateau-diagnostic`.
4. **Add 5 email nodes** at delays 0 / 1 / 3 / 5 / 7 days.
5. **Fill subjects + bodies verbatim** from `scripts/seed-beehiiv-plateau.ts` lines 67–188. Do not rewrite.
   - Merge tag for profile label: `{{ subscriber.custom_fields.diagnostic_profile }}`
   - Merge tag for results page slug: `{{ subscriber.custom_fields.diagnostic_slug }}`
   - Emails 4 and 5 reference the Cal booking URL — hard-code it to `https://cal.com/roadman/plateau-15` (the paste script uses `{{ NEXT_PUBLIC_CAL_BOOKING_URL }}` as a placeholder; Beehiiv won't resolve Vercel env vars).
6. **Save as draft** — Anthony reviews each email in preview before activating.
7. **Activate** once reviewed.

Segment-triggered automations only enroll subscribers on **new** segment entries. Activate before the first real ad traffic; retro-enrol manually if anything slipped through.

### 4. Cal.com polish (non-blocking)
- Limits tab → 5 min buffer before + after
- Advanced → Booking Questions → add required short-text question: `Which profile did you get?`
- Apps → Google Calendar → Connect (OAuth flow, Anthony does this himself)

### 5. Facebook ads (step 9)
Creative copy is in `docs/plateau-paste-packet.md §6`. Launch when video + static assets are ready.

### 6. Later PRs (explicitly deferred in PR #38)
- Meta Conversions API (needs shared `eventID` with client pixel for dedup)
- Cal.com booking webhook → `/api/webhooks/calcom` (not built yet)

## Gotchas we hit

### 1. Beehiiv tag case-normalization
Beehiiv stores tag names lowercased regardless of the casing supplied at create time. All 7 tags were created with the codebase's casing (e.g. `profile-underRecovered`) but Beehiiv displays them lowercase (`profile-underrecovered`).

**Risk:** The app at `src/app/api/diagnostic/submit/route.ts:184` sends `profile-${scoring.primary}` which produces camelCase (`profile-underRecovered`). If Beehiiv's tag-apply endpoint is **case-sensitive** it will create a second tag in that casing, and the segment filter won't match. If it's **case-insensitive** (likely, given every existing tag in the pub is lowercase), it applies to the existing tag and everything works.

**If smoke test or first real submit shows duplicate camelCase tags** appearing in Beehiiv:
```ts
// src/app/api/diagnostic/submit/route.ts:184 — change:
`profile-${scoring.primary}`,
// to:
`profile-${scoring.primary}`.toLowerCase(),
```
Commit, PR, deploy.

### 2. Sandbox cannot run the npm scripts
The Claude sandbox has no DNS to `api.beehiiv.com` (tried, got `EAI_AGAIN`). It also can't run `tsx` because `node_modules/esbuild` is macOS-arm64 while the sandbox is linux-arm64 — platform mismatch. Don't re-install `@esbuild/linux-arm64` in node_modules; it pollutes Anthony's local install and will cause his next `next build` to fail weirdly.

**Implication:** `npm run migrate:diagnostic`, `npm run seed:beehiiv:plateau`, `npm run smoke:plateau` must run on Anthony's terminal, not from the Claude sandbox. Session 2 worked around the seed script by creating tags manually in Beehiiv's UI.

### 3. Beehiiv has no literal "Tag applied" trigger
Only Segment action, Signed up, Email submitted, Survey submitted, Poll submitted, Referral, Upgraded, Downgraded, Product purchased, Added by API, Manual, Unengaged. To trigger on a tag, use Segment action + a dynamic segment filtered by that tag. This is why step 3 above starts with segment creation.

### 4. Beehiiv tag creation modal is flaky
When creating multiple tags in sequence through the New tag modal, the modal sometimes stays open after save with the previous value persisted in the name input. Pattern that reliably worked in session 2: triple-click the name input to select-all, type new name, click Save button at bottom of modal, wait 2s. If you try to close + reopen with a click on "New tag", the button often doesn't register (modal-backdrop intercept). Just keep editing the open modal.

### 5. Cal.com strips dashes in URL slug field
Typing `plateau-15` into the URL slug input results in `plateau15`. Workaround: use `form_input` with ref rather than `type`, or type the slug and then fix via `form_input` after.

## Artifact index
- `docs/plateau-handoff.md` — original handoff (session 1 → 2)
- `docs/plateau-diagnostic.md` — launch checklist (11 sections)
- `docs/plateau-paste-packet.md` — paste-ready content for external systems
- `docs/plateau-session-2-handoff.md` — this file
- `scripts/seed-beehiiv-plateau.ts` — contains §13 verbatim email bodies at lines 67–188
- `scripts/migrate-diagnostic.ts` — already run successfully
- `scripts/smoke-plateau.ts` — run post-deploy

## Your first message to Anthony (fresh session)

Something terse, like:

> Read `docs/plateau-session-2-handoff.md`. Where are we — has the PR merged? If no, which of the four remaining steps do you want me to drive first (review/merge walkthrough, Vercel env vars, smoke test, or Beehiiv automation build)?

Don't make him re-explain anything in the handoff.
