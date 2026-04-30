# Headline & CTA Clarity Audit — 2026-04-24

## Summary
- Total pages / components checked: ~35 (all `src/app/**/page.tsx` public routes, templated hubs, conversion components)
- Broken-grammar headlines: 1 (live cache — source fix already landed)
- Off-brand banned-word copy: 9
- Confusing / vague CTAs: 7
- Placeholder / TODO strings shipped: 0
- Minor cosmetic / brand-voice: 3

Source is largely clean. The biggest live issues are (a) the `topics/cycling-nutrition` H2 still rendering the pre-fix broken headline on production (verify deploy/cache), and (b) scattered banned-word copy (`unlock`, `elevate`, `journey`, `discover`) inside first-party TSX headlines and bullets — not just podcast transcripts.

---

## Findings (ranked by severity)

### [1] BROKEN-GRAMMAR — "GET COACHED ON FUEL SMARTER, RIDE" still live on /topics/cycling-nutrition
- **File:** n/a (source already fixed in commit `00a4b2f`; `topic.ctaHeadline` at `src/app/(content)/topics/[slug]/page.tsx:248` is hand-written)
- **Current text (live):** H2 `"GET COACHED ON FUEL SMARTER, RIDE"` — confirmed via WebFetch on 2026-04-24
- **Issue:** Either the fix hasn't deployed, ISR hasn't revalidated the /topics/cycling-nutrition page, or the CDN is still serving stale HTML. This is the exact bug the audit was commissioned to eliminate.
- **Recommended fix:** Force redeploy or hit revalidate endpoint for `/topics/cycling-nutrition` (and all other `/topics/[slug]` routes) and re-verify.

### [2] OFF-BRAND — "unlock the next level" in coaching assessment "READY" result
- **File:** `src/app/(content)/assessment/CoachingAssessment.tsx:70`
- **Current text:** `"Your training history, goals, and current plateau make you an ideal candidate for structured coaching. You've outgrown what apps and self-coaching can deliver. A coach will unlock the next level."`
- **Issue:** Banned word "unlock" in the primary value line of the highest-intent funnel moment (user just finished a quiz that classified them as ready to pay).
- **Recommended fix:** `"A coach turns outgrown-app into a proper system."` or `"A coach is the next step — not another app."`

### [3] OFF-BRAND — "unlock the next step" in plateau diagnostic high-volume result
- **File:** `src/components/features/persona/PlateauDiagnostic.tsx:83`
- **Current text:** `"High volume, mostly easy — you have the base, but you're missing the ceiling work. Adding a small, precise dose of genuinely hard intensity will unlock the next step."`
- **Issue:** Banned word in a diagnostic result screen — one of the most-read short texts on the site.
- **Recommended fix:** Replace "will unlock the next step" with `"is the next step."`

### [4] OFF-BRAND — "unlock greater mobility" in /strength-training feature bullet
- **File:** `src/app/(marketing)/strength-training/page.tsx:40`
- **Current text:** `"Targets the key muscle groups used in pedalling — unlock greater mobility, reduce soreness, and prevent the tightness that leads to injury."`
- **Issue:** Banned word on a paid-product landing page. Easy drop-in fix.
- **Recommended fix:** `"Targets the key muscle groups used in pedalling — more mobility, less soreness, and the tightness that leads to injury stopped before it starts."`

### [5] OFF-BRAND — "set me on a dietary, mental and physical journey" repeated across 4 /coaching/[location] pages
- **File:** `src/app/(marketing)/coaching/[location]/page.tsx:65, 280, 342, 416` (Ireland, Dublin, Cork, Galway testimonials)
- **Current text:** `"Anthony set me on a dietary, mental and physical journey. Average wattage doubled and weekly 100km+ rides are now the norm."` — Chris O'Connor
- **Issue:** Banned word "journey" appears in four testimonial bodies on the geo-coaching pages. Scope note said to skip citation-style usage, but these are *testimonials hand-picked for marketing pages* — they are brand copy by selection, not cited research. Same quote also embedded as review schema at `src/app/(community)/apply/page.tsx:169` adding `"journey of true discovery"` (discover + journey in one line).
- **Recommended fix:** Use a different Chris O'Connor quote or edit down the stat line (`"Average wattage doubled. Weekly 100km+ rides are now the norm. 84kg → 68kg, 20% bodyfat → 7%."`) and drop the journey sentence.

### [6] OFF-BRAND — "looking to unlock new potential" in /coaching/triathletes testimonial
- **File:** `src/app/(marketing)/coaching/triathletes/page.tsx:167`
- **Current text:** Aaron Kearney quote, `"...if you're looking to unlock new potential, I couldn't recommend Anthony enough."`
- **Issue:** Banned word "unlock" in a hand-selected testimonial on a pillar landing page.
- **Recommended fix:** Trim to `"The expertise and personalised plan allowed me to utilise my past racing experience and gave me the adaptations needed for the changeover. Couldn't recommend Anthony enough."`

### [7] OFF-BRAND — "unlock lower pressures" in shock-pressure calculator output
- **File:** `src/app/(content)/tools/shock-pressure/page.tsx:1550`
- **Current text:** `"Running tubes means higher minimum pressure to avoid pinch flats. Consider going tubeless to unlock lower pressures and better grip."`
- **Issue:** Banned word in tool result copy that many SEO visitors will see.
- **Recommended fix:** `"...going tubeless lets you run lower pressures with better grip."`

### [8] OFF-BRAND — "The three rules that unlock the week" in /tools/ftp-zones lead-magnet bullet
- **File:** `src/app/(content)/tools/ftp-zones/page.tsx:330`
- **Current text:** Lead-magnet bullet: `"The three rules that unlock the week"`
- **Issue:** Banned word in an email-capture value prop — literally the last sentence before the user gives their email.
- **Recommended fix:** `"The three rules that make the week work"` or `"The three rules every Zone 2 week follows"`.

### [9] OFF-BRAND — "where they are in their cycling journey" in home PersonaRouter comment → gets picked up by intent-classifier/search
- **File:** `src/components/features/home/PersonaRouter.tsx:6`
- **Current text (code comment, but mirrored in UI patterns):** `"based on where they are in their cycling journey."`
- **Issue:** Code comment, not live copy — **low severity** — but flag because the same framing shows up in adjacent UI. Confirm no user-facing string reuses the phrase.
- **Recommended fix:** Change comment to `"...based on where they are in their cycling development."` as a lint signal for anyone reading the file.

### [10] VAGUE CTA — "Learn More" button on /topics/[slug] pages where commercial path isn't /apply
- **File:** `src/app/(content)/topics/[slug]/page.tsx:259`
- **Current text:** `{topic.commercialPath === "/apply" ? "Apply Now" : "Learn More"} →`
- **Issue:** "Learn More" is a banned-style vague CTA; it's also the label for most non-/apply commercial paths (which currently route to `/coaching` and `/strength-training`). A visitor has no idea what they're clicking into.
- **Recommended fix:** Replace with a field-driven `topic.ctaLabel` that is hand-written per topic (same pattern as the new `ctaHeadline`). Defaults: for `/coaching` → "See Coaching Options", for `/strength-training` → "Get the Plan".

### [11] VAGUE CTA — "Learn More" on /author/anthony-walsh coaching block
- **File:** `src/app/(marketing)/author/anthony-walsh/page.tsx:274`
- **Current text:** Secondary button: `"Learn More"`
- **Issue:** Paired with "Apply for Coaching"; "Learn More" gives no hint that the destination is the coaching overview page.
- **Recommended fix:** `"How Coaching Works"` (matches label used elsewhere on the site, incl. `/blog/[slug]`, `/you/[slug]`, `/about`).

### [12] VAGUE CTA — "Learn More" on homepage Not Done Yet community card
- **File:** `src/app/page.tsx:377`
- **Current text:** `"Learn More"` on `/community/not-done-yet` card
- **Issue:** Homepage has ~20 buttons; the one pointing at your flagship paid product shouldn't be the vaguest label on the page.
- **Recommended fix:** `"See What's Included"` or `"Inside Not Done Yet"`.

### [13] VAGUE CTA — "Submit your application" as step 01 label in /apply
- **File:** `src/app/(community)/apply/page.tsx:485`
- **Current text:** Step 01 title `"Submit your application"` (rendered uppercase as H4)
- **Issue:** "Submit" is one of the explicitly banned vague CTA words. Even though it labels a step, not a button, the step title carries the same weight.
- **Recommended fix:** `"Fill in the 2-minute form"` or `"Answer four questions"` — matches the description directly beneath.

### [14] VAGUE CTA — "Try it free →" used 7× on homepage toolkit without per-tool purpose
- **File:** `src/app/page.tsx` (toolkit grid) and `src/app/(content)/topics/[slug]/page.tsx:226`
- **Current text:** `"Try it free →"` repeated on every tool card; card h3 carries the tool name but the CTA doesn't.
- **Issue:** Seven identical button labels in a row reduces click decisiveness. WebFetch of `/` counted the string 7× — accessibility/screenreader users get a wall of the same label.
- **Recommended fix:** Pull the tool name into the CTA: `"Calculate Your Zones →"`, `"Calculate Race Weight →"`, etc. Or wrap each card as a single link and hide the CTA from the a11y tree.

### [15] VAGUE CTA — "Deep Dive Article →" and "Free Assessment →" on /compare/[slug]
- **File:** `src/app/(content)/compare/[slug]/page.tsx:191, 199`
- **Current text:** `"Deep Dive Article →"` / `"Free Assessment →"`
- **Issue:** Both labels are generic. "Free Assessment" especially is ambiguous — could be the plateau diagnostic, event diagnostic, or a tool. No context.
- **Recommended fix:** Use the target's actual title (e.g. `"Read: Polarised vs Sweet Spot"` and `"Take the Plateau Diagnostic"`).

### [16] VAGUE CTA — "Find Your Fit" on /partners secondary button
- **File:** `src/app/(marketing)/partners/page.tsx:858`
- **Current text:** `"Find Your Fit"` → `/sponsor#quiz`
- **Issue:** Fine on its own; but a prospective partner landing on `/partners` has no clue "Fit" means "sponsorship-tier quiz". Reads like a clothing CTA.
- **Recommended fix:** `"Take the Sponsorship Quiz"` or `"Which Slot Is Right for You?"`.

### [17] BRAND-VOICE — "Unlock your hip flexors!" mocked in /blog/yoga-for-cyclists-guide
- **File:** `content/blog/yoga-for-cyclists-guide.mdx:68`
- **Current text:** `"Every few months, someone publishes an article claiming yoga is the missing piece of the cycling performance puzzle. Unlock your hip flexors! Breathe deeper! Become one with the bike!"`
- **Issue:** This is actually fine — Anthony is mocking the genre. Flagging only because a Ctrl-F for "unlock" in content will pick it up; leave as-is. (Listed here so it's documented and not "fixed" by mistake.)
- **Recommended fix:** None. Intentional.

### [18] BRAND-VOICE — "elevate / level up" inside podcast transcripts and auto-generated takeaways
- **Files:** 20+ matches across `content/podcast/*.mdx` (transcripts + takeaway bullets)
- **Current text:** e.g. `ep-2081-...mdx:583` `"A good group of training partners will elevate everything; miles disappear..."`, many Forey ad-read repetitions `"Ready to elevate your cycling game?"`
- **Issue:** Transcripts are verbatim so those are contextual. The *auto-generated takeaways*, however, carry banned words into TL;DR summaries that appear above the fold on podcast episode pages.
- **Recommended fix:** One-time sweep of the takeaways bullet-lists in `content/podcast/*.mdx` to swap `elevate`/`level up`/`unlock` for cycling-specific verbs. ~15 files, batchable with sed + human review.

### [19] BRAND-VOICE — "uncover exactly how" in podcast episode description(s)
- **File:** `content/podcast/ep-2115-how-fast-is-it-the-truth-about-the-van-rysel-bike.mdx:25, 580`, `ep-2108-....mdx:589`, `ep-2128-....mdx:93`
- **Current text:** `"we sit down with Jeremy Deo, head of product, to uncover exactly how..."`
- **Issue:** Banned word "uncover" in hand-written episode descriptions — shows up in podcast hub, RSS, and topic-hub episode cards.
- **Recommended fix:** `"...to get the real story on how..."` / `"to break down exactly how..."`.

### [20] MINOR — Cohort 3 indefinite urgency on /coaching and /apply
- **File:** `/coaching` (via WebFetch) and `src/app/(community)/apply/page.tsx` hero
- **Current text:** `"COHORT 3 COMING SOON"` with no date
- **Issue:** Permanent "coming soon" is a credibility drag. If cohort 3 is live, update label; if genuinely TBD, say the month.
- **Recommended fix:** Either `"COHORT 3 — APPLICATIONS OPEN"` or `"COHORT 3 — OPENS JUNE 2026"`.

### [21] MINOR — "transform your life" in /coaching/[location] USA testimonial
- **File:** `src/app/(marketing)/coaching/[location]/page.tsx:206`
- **Current text:** `"...The accountability and structure changed my life — not just my cycling."` (detail line: `"USA — Weight loss transformation"`)
- **Issue:** "Transform your training" is in the hype list. The testimonial is genuine; the **detail label** "Weight loss transformation" veers hype-y.
- **Recommended fix:** Change detail to concrete numbers: `"USA — 315lbs → sub-100kg"`.

### [22] MINOR — "When listening is no longer enough" persona CTA eyebrow
- **File:** `src/app/(content)/you/[slug]/page.tsx:425`
- **Current text:** `"WHEN LISTENING IS NO LONGER ENOUGH"`
- **Issue:** Evocative but ambiguous on cold read — "listening to what?" (podcast). Works with context but an eyebrow should stand alone.
- **Recommended fix:** `"WHEN THE PODCAST ISN'T ENOUGH"` — explicit, still on-brand.

---

## Sweeps that came back clean

- **Dynamic-string slicing:** only 3 TSX files slice/split into a user-visible string:
  - `src/app/(marketing)/partners/page.tsx:801` — splits curated `"Name — Credential"` data; safe by construction
  - `src/app/(content)/tools/ftp-zones/page.tsx:221` — splits on `—` for a short label; safe
  - `src/app/(content)/plan/[event]/[weeksOut]/page.tsx:493` — concatenates `keyCharacteristics[0]`, `commonMistakes[0]`, and `pacingStrategy.split(".")[0]` into a FAQ answer; each piece is full sentences so rendered grammar is OK, but worth spot-checking across all 6 events × 6 phases once per quarter.
  - All other `.split(` / `.slice(` calls are admin-side, SEO schema builders, or date formatters — no user-facing risk.
- **Placeholder / TODO / lorem-ipsum strings in production TSX:** none. All `placeholder=` attrs are legitimate form field placeholders; no stray "TODO" / "TBD" / "XXX" copy.
- **`/apply` CTAs:** all action-oriented and descriptive — `"Apply for Coaching"`, `"Apply — 7-Day Free Trial"`, `"Apply Now — 7-Day Free Trial"`. No "Click here" / "Submit" / "Get started" on CTAs.
- **`/coaching` / `/coaching/triathletes` primary CTAs:** `"Apply for Coaching"`, `"See How It Works"`, `"How the Bike Block Works"` — all clear and specific.
- **`/best/[slug]`, `/problem/[slug]`, `/compare/[slug]` footer CTAs:** all route to `/apply` with `"Apply for Coaching"` — consistent and unambiguous.
- **`/guests/[slug]`:** no broken grammar; `guest.name.toUpperCase()` + credential; all interpolations are well-formed.
- **`/podcast/[slug]`:** the `episode.guest.split(" ").map(w => w[0]).join("").slice(0, 2)` at line 362 is used only for a 2-letter avatar monogram — safe.
- **`/plan/[event]`:** the `event.description.split(".")[0]` at line 43 is only used for meta description; even if a period is missing the result is still a complete phrase.
- **`/newsletter/[slug]`:** fully Beehiiv-driven, no site-built headlines.
- **Coaching location pages (`/coaching/[location]`) headings / CTAs:** well-structured. Only issues are the journey-testimonials above.
- **Home hero, /start-here, /about, /about/press, /plateau:** clean — checked via WebFetch + source review.
