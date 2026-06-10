# Roadman Fantasy Tour — architecture & runbook

Fantasy Tour de France 2026 game at `/fantasy`. Built June 2026 against the
build handover brief; deadlines: picking live **26 June**, scoring live
**4 July** (Stage 1, Barcelona).

## What exists

| Layer | Where | Notes |
|---|---|---|
| Schema | `src/lib/db/schema.ts` (fantasy_* tables), migration `drizzle/0041_fantasy_tour.sql` | 16 tables: effective-dated squads, scoring ledger, computed leaderboards, audit log |
| Game rules | `src/lib/fantasy/config.ts`, `rules.ts` | All numbers are launch defaults overridable per-key in `fantasy_game_config` (admin → Config) |
| Scoring engine | `src/lib/fantasy/scoring.ts` | Pure + deterministic; recompute = wipe stage events, re-run, rebuild totals |
| Service layer | `src/lib/fantasy/queries.ts` | Squad-as-of-stage joins, transfer application, two-step publish, leaderboard rebuild |
| Auth | `src/lib/fantasy/auth.ts` | Magic link (24 h, single-use) + stateless 7-day play-scoped deep-link JWTs for the daily email CTA |
| Lead gen | `src/lib/fantasy/marketing.ts` | Beehiiv sync (tags `fantasy-tour-2026`, `source:fantasy`, persona) + Meta CAPI Lead; cron retry queue |
| Emails | `src/lib/fantasy/emails.ts` | Magic link, daily stage email, rest-day email. Table-layout HTML, brand-styled |
| Content guard | `src/lib/fantasy/content-guard.ts` | Fact blocklist (Lorang↔Pogačar hardcoded forbidden) + AI-slop filters; runs before any stage note ships |
| Public UI | `src/app/fantasy/*`, `src/components/features/fantasy/*` | Landing (static), echelon builder, dashboard, leagues, standings, terms |
| Admin | `src/app/admin/(dashboard)/fantasy/*` | Overview, stage manager, startlist manager, results entry (two-step publish), pricing CSV, config editor |
| Share cards | `/api/og/fantasy` | `card=team` and `card=stage` variants, edge-rendered |
| Cron | `/api/cron/fantasy-daily-email` (vercel.json: `30 5 * 7 *` = 06:30 Irish in July) | Stage + rest-day emails, Beehiiv retry sweep |
| Tests | `src/lib/fantasy/__tests__/` | 51 tests incl. simulated 21-stage Tour with abandon wave, jury relegation, correction recompute |

## Deliberate deviations from the brief

1. **Drizzle + Vercel Postgres, not Supabase.** Section 7 says "match the
   existing Roadman build pattern" and also says Supabase; the existing
   pattern (Plateau Diagnostic, Ask Roadman, CRM) is Drizzle on Vercel
   Postgres with custom magic-link auth. Matching the codebase won: one
   database, one auth idiom, RLS-equivalent enforcement in the service
   layer (every player query is scoped by the session email; admin routes
   gate on the admin session).
2. **Deep-link tokens are stateless JWTs**, not DB rows: minting 5–15k
   bcrypt rows per cron run would blow the send window. Play-scoped,
   7-day expiry, secret rotation as the revocation story.
3. **Rest-day bonus transfers are exempt from the 2-per-stage cap**
   (`restDayBonusExemptFromStageCap`) — otherwise the bonus would be
   unusable on a day you also wanted your two standard moves. Toggleable.
4. **Stage deadline fallback**: until ASO publishes start times,
   transfers lock at 12:00 CEST on the stage date (conservative). Fill
   real times in admin → Fantasy → Stages when the roadbook lands.

## Data integrity status (Section 6)

- **Stages**: 21 rows seeded from `src/data/fantasy/stages-2026.json`,
  verified 10 June 2026 against two independent sources (Wikipedia stage
  table citing the official ASO press kit of 23 Oct 2025; cross-checked
  against Domestique's stage guide). letour.fr and PCS block automated
  fetch (403) — **re-verify by hand against letour.fr before launch** and
  update `verifiedAt`. Published distances sum to 3,329.7 km vs the
  announced 3,333 km (sources round per-stage values; roadbook will settle it).
- **Teams**: 23 rows (18 WorldTeams + 5 ProTeams) from the 30 Jan 2026
  ASO announcement, cross-checked Wikipedia/Cycling Weekly. `jerseyHex`
  values are Roadman display accents, deliberately NOT kit colours
  (Section 9: no official jersey graphics).
- **Riders**: **none seeded — by design.** No rider enters the database
  from model memory. When PCS publishes the provisional startlist:
  `npx tsx scripts/fantasy/import-startlist.ts startlist.csv --source-url=<url>`
  (CSV: name,pcs_id,team,class,price,country). Then per-team confirmation
  as squads are announced:
  `npx tsx scripts/fantasy/import-startlist.ts --confirm-team="Lidl–Trek" --source-url=<announcement>`
- **Pricing**: draft generator in `src/lib/fantasy/pricing.ts` (rank-based
  curve, 24 down to 4) — feed it PCS points, then **Anthony signs off the
  full sheet** via the admin pricing CSV export/import before launch.

## Daily race-ops runbook (Ted, ~10 min)

1. Stage finishes (~17:30 CEST). **Wait for official results** — jury
   decisions take 30–60 min. Never score from live timing.
2. Admin → Fantasy → Results → stage: enter top 20, jerseys,
   intermediate sprint top 3, KOM top 3, combativity, abandons.
   (Stage 1: individual times if published; team order otherwise — the
   fallback is the `tttIndividualTimes` config toggle.)
3. Save draft → **Preview scores** → eyeball against the official result.
4. **Publish**: events written, every team scored against its
   squad-as-of-stage, leaderboard rebuilt, audit logged.
5. Corrections (relegation/DSQ): re-open the stage, fix the payload,
   preview, publish again. Recompute is idempotent — every team and
   league corrects automatically.

## Launch checklist (maps to brief Phases 4–5)

- [ ] Run migration `0041_fantasy_tour.sql` + `npm run fantasy:seed`
- [ ] Set `FANTASY_SESSION_SECRET` (and optionally META_CAPI_*) in Vercel
- [ ] Import provisional startlist when PCS publishes (see above)
- [ ] Pricing sheet: generate draft → Anthony review/sign-off → import
- [ ] Re-verify all 21 stage rows against letour.fr by hand; fill start times
- [ ] Stage notes ("Roadman take") for all 21 stages → Sarah/Ted review
      (content guard runs automatically on save AND at send time)
- [ ] Startlist confirmation pass as squads announce (27 Jun–2 Jul);
      final human audit 3 July (Anthony or Ted) — log it in the audit trail
- [ ] Prize terms confirmed by Anthony → update `/fantasy/terms`
- [ ] Send-time check: 06:30 Irish vs existing broadcast calendar (open
      decision #3) — adjust the cron in vercel.json if it collides
- [ ] T-minus emails to the 30k list (launch / 3 days / teams lock tonight)
      — broadcast from Beehiiv, segment excludes nobody (tag appends for
      existing contacts, no duplicates)

## Still to build (known gaps)

- Mini-league nudge (48 h after signup, no league) and post-Tour
  sequence — straightforward crons once launch settles
- Share-card buttons in the dashboard wired to `/api/og/fantasy`
  (route exists; the dashboard currently shares text links)
- Pre-generation of all 21 stage emails via Claude API into a review
  queue — the render pipeline + guard exist; generation script pending
  stage notes
- Results-ingestion automation (PCS blocks scraping; manual admin entry
  is the shipped reliability floor per Section 6.1)
