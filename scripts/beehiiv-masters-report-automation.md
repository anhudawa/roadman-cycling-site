# Beehiiv automation — masters-report tag

**Purpose:** Belt-and-braces fallback to the transactional Resend welcome
that `/api/newsletter` now sends on `/masters-report` submissions. If Resend
ever fails (key rotation, outage, deliverability issue) the Beehiiv side
still has the PDF link queued behind a tag-triggered automation.

The Resend path is primary because Beehiiv automations cannot attach a
binary PDF — they can only link to it. The PDF lives at:

```
https://roadmancycling.com/downloads/masters-cycling-training-report-2026.pdf
```

## Setup steps (one-time, in Beehiiv UI)

1. **Sign in** to Beehiiv → publication "Roadman Cycling".
2. **Automations → New automation**.
   - Name: `Masters Report — PDF delivery`
   - Trigger: **Tag added** → choose tag `masters-report`
     (this tag is applied automatically by
     `src/app/api/newsletter/route.ts` via `subscribeToBeehiiv` when the
     source starts with `masters-report`).
3. **Add step: Send email**. Subject:
   `Your Masters Cycling Training Report (PDF inside)`
   Preview text:
   `The PDF is inside — what actually declines after 40, and what doesn't.`
4. **Email body** — use a Beehiiv template with the dark theme already in
   place for Saturday Spin. Body copy (paste verbatim, then style with the
   Beehiiv block editor — H1 in Bebas Neue if available, coral
   `#F16363` CTA button):

   ---

   Hey — cheers for grabbing the Masters Cycling Training Report 2026.

   This is the back-up copy of your download link in case the original
   welcome email got buried.

   **[Download the report (PDF)](https://roadmancycling.com/downloads/masters-cycling-training-report-2026.pdf)**

   You can also read it in the browser:
   [roadmancycling.com/blog/masters-cycling-training-report-2026](https://roadmancycling.com/blog/masters-cycling-training-report-2026).

   If you only have ten minutes today, read Sections 4 and 5 — that's the
   distribution question, which is the one most masters cyclists get
   wrong, and where the biggest gains hide.

   If you're plateaued and you already know which section applies to you,
   the four-minute [Plateau Diagnostic](https://roadmancycling.com/go)
   returns a specific prescription. Free, no upsell tunnel.

   You're not done yet.
   — Anthony
   Roadman Cycling

   ---

5. **Delay step** (optional but recommended): **Wait 7 days**, then
   trigger Beehiiv's existing "Saturday Spin nurture" sequence so masters
   leads land in the main editorial cadence.

6. **Activate** the automation.

## Verifying it's wired correctly

After saving the automation, run an end-to-end check:

```bash
# 1) Subscribe a test address through the squeeze page form
#    (or with curl, replacing email + the dev host as appropriate):
curl -X POST https://roadmancycling.com/api/newsletter \
  -H 'Content-Type: application/json' \
  -d '{"email":"ted+test1@roadmancycling.com","source":"masters-report-hero"}'
```

Within ~30 seconds you should see:

- **Resend dashboard** — one delivered email tagged
  `campaign=masters-report`.
- **Beehiiv → Subscribers** — the address present with the
  `masters-report` + `saturday-spin` tags applied.
- **Beehiiv → Automations → Masters Report — PDF delivery** — the
  subscriber appears in the run history within a minute.

If the Resend email doesn't arrive but the Beehiiv tag did apply, the
fallback automation will deliver the report within 1–2 minutes.

## When to update this automation

- **Whenever the PDF is regenerated** at a new path (it currently lives
  at the stable `/downloads/...2026.pdf`, so this is unlikely until the
  2027 edition).
- **Whenever the report's headline numbers change** — keep the inbox
  copy honest and synced with the squeeze page teasers.

## Related files

- `src/app/masters-report/page.tsx` — squeeze page.
- `src/app/masters-report/_components/MastersReportCapture.tsx` — form
  client component; sends `source=masters-report-hero` / `-footer`.
- `src/app/api/newsletter/route.ts` — the route handler that tags the
  Beehiiv subscriber and fires the Resend welcome.
- `src/lib/emails/masters-report-welcome.ts` — Resend HTML template
  (the source of truth; Beehiiv copy above mirrors it).
- `scripts/generate-masters-report-pdf.ts` — regenerates the PDF from
  the canonical MDX (`content/blog/masters-cycling-training-report-2026.mdx`).
  Run with `npx tsx scripts/generate-masters-report-pdf.ts` whenever the
  underlying report changes.
