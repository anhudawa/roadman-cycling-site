# Plateau Diagnostic — Launch Checklist

Everything that needs to happen after the code is merged before the funnel is actually live on production. Work through top to bottom.

## 1. Run the migration

The new `diagnostic_submissions` table needs to exist in prod Postgres.

```bash
# Option A: drizzle-kit push (matches how the schema-only tables work)
npm run db:push

# Option B: apply the SQL file directly
psql "$POSTGRES_URL" -f drizzle/0025_diagnostic_submissions.sql
```

Verify:

```sql
SELECT count(*) FROM diagnostic_submissions;
-- Should return 0
```

## 2. Environment variables

All optional, but each one upgrades the funnel:

| Var | Effect if unset | Where to set |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Every user gets the static §9 fallback breakdown — still a usable funnel. | Vercel |
| `RESEND_API_KEY` | No transactional confirmation email. Beehiiv still handles nurture. | Vercel (already set for contact form) |
| `BEEHIIV_API_KEY` + `BEEHIIV_PUBLICATION_ID` | No nurture subscribe / profile tag. Submissions still saved in Postgres + CRM. | Vercel (already set for newsletter) |
| `NEXT_PUBLIC_CAL_BOOKING_URL` | Call-booking CTAs route to `/contact?topic=plateau-diagnostic`. | Vercel |
| `NEXT_PUBLIC_META_PIXEL_ID` | No Facebook Pixel events. No conversion optimisation data for ads. | Vercel |
| `NEXT_PUBLIC_SITE_URL` | Confirmation email link uses the production default. | Vercel (usually already set) |

## 3. Beehiiv setup

Inside Beehiiv's admin UI:

1. Create these **tags**:
   - `plateau-diagnostic`
   - `profile-underRecovered`
   - `profile-polarisation`
   - `profile-strengthGap`
   - `profile-fuelingDeficit`
   - `multi-system` (applied when every profile scored 6+)

2. Load the **5-email nurture sequence** from spec §13 as an automation.
   - Trigger: tag `plateau-diagnostic` applied
   - Emails send at Day 0 / 1 / 3 / 5 / 7
   - Copy is in the original spec; do not rewrite without Anthony's sign-off

3. (Optional) Create per-profile subject line variants that merge from the `diagnostic_profile` custom field Beehiiv receives at subscribe time.

## 4. Cal.com link

The CTAs on Under-recovered and Fueling Deficit profiles (plus the severe multi-system edge case) route to a Cal.com booking URL read from `NEXT_PUBLIC_CAL_BOOKING_URL`.

Expected format: `https://cal.com/anthony-walsh/15-min-plateau-call` or equivalent.

## 5. Meta Pixel

1. Create the pixel in Meta Business Manager.
2. Set `NEXT_PUBLIC_META_PIXEL_ID` on Vercel.
3. The client-side pixel fires:
   - `PageView` on `/plateau` and `/diagnostic/[slug]`
   - `Lead` on `/diagnostic/[slug]` (the conversion signal)
4. **Server-side Conversions API is not yet wired** — when adding it later, ensure the server and client events share an `eventID` per Meta's dedup rules so stats don't double-count.

## 6. Voice QA on LLM outputs

Once live traffic is flowing, Anthony should read the first 30–50 LLM-generated breakdowns at `/admin/diagnostic`. Any output that doesn't sound like him is a signal to tune the system prompt at `src/lib/diagnostic/prompt.ts` — iterate until consistent.

The admin page exposes:
- **LLM success rate** — % of submissions where Claude's first or second attempt passed validation (vs the static fallback)
- **Fallback** vs **LLM** badge per row — filter for LLM rows first
- **Multi** badge — severe multi-system cases for direct-call routing
- Per-row "Open" link into the live results page

If a specific output is off, POST to `/api/diagnostic/[slug]/regenerate` (admin-gated) to re-run Claude with the same stored answers.

## 7. Ad setup

Out of scope for the code build. See spec §14 for the three ad variants, targeting, and the €20 → €300/day ramp plan.

## 8. Smoke test

After deploy, walk through the flow manually once:

1. Visit `/plateau` — landing should render with the CTA.
2. Click through the demographics + 12 questions.
3. Submit with a real email you control.
4. Verify:
   - Redirect to `/diagnostic/[slug]` with a personalised breakdown
   - Confirmation email from `noreply@roadmancycling.com` arrives
   - Row appears in `/admin/diagnostic` with an LLM or Fallback badge
   - Contact row appears in the CRM (`/admin/contacts`)
   - Submission shows up in Beehiiv with the right tags
   - In Meta Events Manager, a `Lead` event fires when the results page loads

## Rollback

The diagnostic is isolated — removing it means:
- Remove `/plateau` link from `src/components/layout/Footer.tsx`
- Unset `NEXT_PUBLIC_META_PIXEL_ID` to kill tracking (if needed)
- The DB table is harmless; leave it in place so historical submissions stay queryable

No global state to unwind.
