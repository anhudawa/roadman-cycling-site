# Sitewide Blog Quality Audit

**Date:** 2026-06-10
**Scope:** All `content/blog/*.mdx` (374 articles)
**Method:** Automated scan (grep + a Node link-resolver reproducing the app's slug logic), manual triage, in-place fixes.

This audit ran six checks. Where a flat term-scan over-matched legitimate domain language, findings were triaged against the documented brand policy (`memory/feedback_slop_terms.md`) before any edit — the standard is the policy, not the raw grep. Clear violations were fixed in place; genuinely ambiguous or out-of-scope items are flagged below for a decision rather than silently changed.

---

## Summary

| # | Check | Result | Action |
|---|-------|--------|--------|
| 1 | Slop scan | 2 figurative `unlock` fixed; all other hits legitimate domain usage | Fixed 2 |
| 2 | CTA audit | 26 NDY-community CTAs pointed at internal `/community*` | Converted to skool URL |
| 3 | Pricing | GBP: 0. NDY `$195` consistent. EUR present in 4 camp/cost pages | Flagged (no fabrication) |
| 4 | Expert attribution | Lorang correct everywhere. **Vekta mentioned in 4 files** | Removed all 4 |
| 5 | Heavy compound | 1 reader-facing back-squat prescription (`derek-teel…`) | Reframed to substitutions |
| 6 | Broken links | `/blog/ /podcast/ /experts/`: **0 broken (PASS)**. `/guests/`: 36 broken (out of scope) | Flagged for generator fix |

---

## 1. Slop scan

Scanned for: `unlock, dive into, game-changer, journey, landscape, leverage, tapestry, delve, harness, navigate, elevate, "it's important to note", "in today's world"`.

**Zero hits** for: `dive into`, `game-changer`, `journey`, `landscape`, `tapestry`, `delve`, `harness`, `it's important to note`, `in today's world`. The site is clean on the hard-slop terms.

**Hits requiring triage** (the brand policy bans `leverage` *only as a verb*, and does not ban physiological `elevate` or literal `navigate`):

### Fixed (figurative `unlock`)
| File | Line | Before → After |
|------|------|----------------|
| `cycling-in-ride-nutrition-guide.mdx` | 33 | "what **unlocks** intakes above 60g/hr" → "what **enables** intakes above 60g/hr" |
| `pro-cyclist-winter-habits-offseason-playbook.mdx` | 87 | "the freshness it **unlocks**" → "the freshness it **brings**" |

### Reviewed — legitimate, no action
- **`unlock` (kept):** `ben-hoffman-…:142` is a verbatim guest quote ("unlocking the potential of the mind") — quotes are not edited. `rouvy-vs-zwift.mdx:94` "jersey **unlocks**" is a literal Zwift game-feature noun.
- **`leverage` (kept):** No verb-form usage exists anywhere (the documented ban is verb-only). Occurrences split into two legitimate senses:
  - *Mechanical/physical noun* (handlebar/crank leverage): `mtb-bike-fit-basics.mdx:32,92,120`, `bike-fit-guide-cyclists.mdx:164`.
  - *Figurative "highest-leverage" adjective* (~28 instances, e.g. `strength-training-cyclists-complete-guide.mdx:136`, `how-to-structure-cycling-training-plan.mdx:148`, `triathlon-ftp-pacing-strategy.mdx:64`, `gym-vs-bike-…:221`, `alan-murchison-…:137`, `masters-recovery-audit-…:65`, `dan-lorang-amateur-training-plan.mdx:154`, and ~20 more). This is established house style and **not** a policy violation (noun/adjective, not verb). Left intact. *Optional future style pass: trim toward "highest-return / single biggest / most valuable" for the Rouleur bar — recommended, not required.*
- **`elevate` (kept):** Every occurrence is physiological — raise heart rate / blood glucose / muscle protein synthesis / inflammation (`mtb-heart-rate-zones-guide.mdx:38,50,143`, `pre-ride-breakfast-cyclists-guide.mdx:101`, `bedtime-protein-…:53,84`, `pro-cyclist-winter-…:160`, `efficiency-factor-cycling-masters.mdx:157`). Correct scientific English, not the "elevate your training" slop sense.
- **`navigate` (kept):** Single literal hit — `mtb-bike-fit-basics.mdx:34` "navigate tight trees."

---

## 2. CTA audit

**Standard applied:** the **Not Done Yet community** join-CTA must point to `https://www.skool.com/roadmancycling`. 29 articles already did; 26 still pointed at the internal `/community/not-done-yet` (23 files) or `/community` (NDY-labelled, 3 instances) — inconsistent. **All converted to the skool URL.**

Distinct product/funnel CTAs were **left as-is by design** (they are different offerings, not the community join):
`/coaching` (1:1 coaching), `/method` (Roadman Method, $297–397/mo), `/apply` (application funnel), `/strength-training` ($65 course), `/community/clubhouse` (the *free* community), `/plateau`, `/ask`, `/tools/*`. Generic lowercase `[community](/community)` references in prose (not join-CTAs) were also left.

> If the intent is broader — every funnel page redirected to skool — that is a separate decision; flag it and it can be done. The conservative read (community-join CTA → skool) is applied here.

Result: skool-CTA articles went from 58 → 89.

---

## 3. Pricing check

- **GBP (£):** 0 occurrences. ✅
- **NDY price:** `$195/month` everywhere it appears (10 instances) — consistent with the stated anchor. ✅
- **All brand products in USD:** NDY `$195`, Roadman Method `$297–397`, coaching tiers `$175–$1,250`, Strength course `$65`, app comparisons (`$19.95–$25`). ✅
- **EUR (€) — flagged, not auto-changed:** 4 files carry EUR pricing, all for **geographically European services**, not the core membership:
  - `girona-training-camps-2026.mdx`, `what-to-expect-cycling-training-camp.mdx`, `why-girona-best-place-train-cycling.mdx` — the Roadman **Girona camps** (€995/camp) and European camp-cost comparisons.
  - `bike-fit-guide-cyclists.mdx` — generic bike-fit cost examples (already shown dual as "€150–€350 (or $150–$350)").

  **Not converted:** the camps are physically in Spain and priced in euros; rewriting €995 → $995 would state a false price, and an accurate conversion would require a business-set USD rate. **This needs a pricing decision from the team**, not a find-and-replace. NDY — the term the instruction anchors on — is already fully USD.

---

## 4. Expert attribution

- **Dan Lorang:** correct in every occurrence — attributed to **Jan Frodeno, Anne Haug, Lucy Charles-Barclay** and **Red Bull–Bora-Hansgrohe**. **Zero** Pogačar misattributions. ✅
- **Vekta — REMOVED (4 violations):** the integration partner must never be named. Rewritten to "structured coaching plans" while preserving the TrainingPeaks-integration point:
  | File | Line |
  |------|------|
  | `nutrition-periodisation-base-build-race.mdx` | 169 |
  | `peaking-for-a-sportive-12-week-framework.mdx` | 191 |
  | `reading-your-training-data-tss-ctl-atl-tsb.mdx` | 202 |
  | `indoor-vs-outdoor-cycling-training-when-each-wins.mdx` | 176 |

  Post-fix scan for `vekta`: **0 occurrences.** ✅

---

## 5. Heavy compound check

Rule: no article may **prescribe** barbell back squats, conventional deadlifts, or barbell rows — only "avoid these / substitute" framing.

**1 violation fixed — `derek-teel-best-exercises-cyclists.mdx`.** The article reports Teel's "big three" (back squat, RDL, split squat) *and* carried a Roadman-take substitution box, but two reader-facing lines still prescribed barbell work directly:
- Closing CTA (was: "take the back squat, the Romanian deadlift, and the Bulgarian split squat… run those three movements") → reframed to the **Roadman substitutions** (front-loaded/goblet squat pattern, single-leg/kettlebell hinge, Bulgarian split squat).
- Progression example ("adds 20kg to **their squat**") → "meaningful load to their **main lower-body lift**."
- FAQ "Should cyclists squat or deadlift?" → added the substitution clause for the 35-55 audience.

Teel's framework is still *reported* (attributed journalism), consistent with how `cycling-deadlift-guide.mdx` handles it — but the reader's marching orders are now the substitutions.

**Verified compliant (discuss-then-substitute, no reader prescription):** `cycling-deadlift-guide.mdx` (keeps heavy barbell deadlifts "off the prescribed menu"; session template uses single-leg/kettlebell/hip-thrust patterns), `cycling-strength-training-12-week-beginner-plan.mdx`, `strength-training-cyclists-over-40/50`, `off-season-gym-routine-…`, `glute-activation-…` (argues *against* squats/deadlifts for the fix), `cycling-gym-exercises-best.mdx` (barbell named only as an EMG comparison + loaded hip-thrust, which is approved). Analogy/illustrative mentions (`steady-state-vs-interval:103`) are not prescriptions.

---

## 6. Broken internal links

Resolver reproduced the app's slug logic — blog/podcast from `content/*`, guest slugs from podcast `guest:` frontmatter + `GUEST_PROFILE_OVERRIDES`, expert-topic slugs from `experts.ts`.

**In scope (`/blog/`, `/podcast/`, `/experts/`): 0 broken — PASS.** ✅
(374 blog slugs, 709 podcast slugs, 35 topic slugs — all referenced links resolve.)

**Additional finding — out of listed scope: 36 broken `/guests/` links.** These resolve to `notFound()` (real 404s) because the target guest has no episode-derived profile, or the slug is malformed. Examples:
- *No episode-derived profile:* `/guests/jay-vine`, `/guests/matej-mohoric`, `/guests/wout-van-aert`, `/guests/sharon-madigan`, `/guests/tim-kerrison`, `/guests/peter-leo`, `/guests/dan-plews`, `/guests/david-lipman`, `/guests/andrew-sellars`, `/guests/yori-carlson`, `/guests/art-oconnor`, `/guests/sebastian-breuer`, `/guests/benji-naesen`.
- *Malformed slug:* `/guests/bent-ronstad` (should be Bent Rønnestad), `/guests/dylan-johnson` (his sole episode's `guest:` field is the title string "Decoding Dylan Johnson's Speed").

Full list (file:line → href): see the 36 entries flagged by `scripts`-equivalent run; spread across ~25 files including `cycling-periodisation-friel-lorang-johnson`, `recovery-for-cyclists-world-tour-protocols`, `vo2max-training-cyclists-seven-reasons`, `body-composition-cyclists-lighter-faster-myth`, `cycling-nutrition-world-tour-nutritionists`.

**Not hand-edited.** The `/guests/` namespace is produced by the automated guest/expert internal-linking subsystem (slug = `slugify(normalizeName(guest))`), so the correct fix is at the generator (add `NAME_ALIASES`/profiles for the orphaned names; correct the slugify edge cases) — hand-edits here would be regenerated away. Flagged as a follow-up task.

---

## Files changed by this audit
- Slop: `cycling-in-ride-nutrition-guide.mdx`, `pro-cyclist-winter-habits-offseason-playbook.mdx`
- Vekta: `nutrition-periodisation-base-build-race.mdx`, `peaking-for-a-sportive-12-week-framework.mdx`, `reading-your-training-data-tss-ctl-atl-tsb.mdx`, `indoor-vs-outdoor-cycling-training-when-each-wins.mdx`
- Heavy compound: `derek-teel-best-exercises-cyclists.mdx`
- CTA → skool: 25 files (all `/community/not-done-yet` + NDY-labelled `/community` links)

## Open items for the team
1. **EUR camp pricing** — decide whether Girona-camp prices stay in EUR (geographically accurate) or move to a team-set USD figure.
2. **36 broken `/guests/` links** — fix at the guest-linking generator (aliases/profiles for orphaned guests; slugify edge cases).
3. *(Optional)* trim the ~28 figurative "highest-leverage" phrasings for the Rouleur editorial bar.
