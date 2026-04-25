# /plateau — Cold Traffic Audit

**Reviewer brief:** Someone who has never heard of Roadman Cycling lands here from a paid ad. They give it 8 seconds. Does the page earn the next 8?

**Source reviewed:** `src/app/(marketing)/plateau/page.tsx` (385 lines, server component) plus `src/lib/diagnostic/profiles.ts` for the four profile labels surfaced in the teaser strip.

**Verdict in one line:** Strong skeleton, smart structure, but it is faceless, jargon-heavy in two key places, leans on credibility claims that don't survive a sceptic's eyebrow, and never tells the cold visitor *who* is on the other side of the screen. It will convert warm traffic. It will leak cold traffic.

---

## 1. First impressions (the 8-second test)

### What a cold visitor literally sees above the fold

```
[Header — Roadman logo + nav]

THE MASTERS PLATEAU DIAGNOSTIC      ← coral overline, all caps
FTP STUCK FOR A YEAR?               ← H1, hero size
IT'S ALMOST ALWAYS ONE OF FOUR THINGS.

Twelve questions. Four minutes. A specific answer for
why your progress has stalled — and the exact fix.

[ START THE DIAGNOSTIC ]            ← coral CTA

No email needed to start · 4 minutes · Free
· N cyclists took it this week
```

### What works

- **Time-to-comprehension is fast.** Headline + subhead + CTA in three glances. The triple-short-sentence cadence ("Twelve questions. Four minutes.") is on-brand and skim-friendly.
- **Friction-killer microcopy under the CTA is the single best element on the page.** "No email needed to start · 4 minutes · Free" pre-empts the three biggest cold-traffic objections in one line. Keep this.
- **Specificity beats vagueness.** "FTP stuck for a year" and "one of four things" promises a concrete answer rather than the generic "unlock your potential" that the brand bible explicitly warns against.
- **The dynamic recent-submission count** (`recentSubmissionCount()`, lines 122–135) is a smart, honest trust signal. It auto-suppresses on zero so the page never shows "0 cyclists took it this week," which would be devastating.

### What fails the 8-second test

- **The page never tells the visitor who is behind it.** No host name. No face. No "Hi, I'm Anthony." For a brand whose entire moat is *Anthony's access* (per the brand bible: "the same insights Anthony gets from World Tour coaches"), this is the single biggest miss on the page. Cold traffic clicks an ad, lands on a faceless quiz, and has no human to trust.
- **"FTP STUCK FOR A YEAR?"** assumes the reader knows what FTP is. For Persona 1 (Tom, the Cat 3-4 racer) this is fine. For Persona 2 (Mark, the Gran Fondo achiever who may not own a power meter) and Persona 3 (James, the comeback athlete) — both core targets per the brand bible — this is potential exclusion. The headline filters harder than it needs to.
- **"MASTERS"** is genre jargon. To the right reader, "masters" means 35+. To a cold reader, it's ambiguous (postgrad? expert level? what?). The actual age cutoff (35+, per `AGE_BRACKETS`) is hidden inside the diagnostic.
- **"It's almost always one of four things"** is a curiosity hook, but "almost always" is a weasel-word. It softens the very certainty the headline is trying to project. Strip it or commit to "It's one of four."
- **The "Not Done Yet" identity hook is missing from the hero.** The brand bible explicitly identifies "Not Done Yet" as "the deepest emotional truth of the entire audience." It does not appear on the page until the FAQ — and even there, only as a product name. The page is selling the diagnostic; it should also be selling the identity.

---

## 2. Trust signals

### What's on the page

| Signal | Where | Strength |
|---|---|---|
| Dynamic submission count | Hero subline | Strong — quantified, recent, honest |
| "Built from 1,400+ podcast conversations" | Social proof strip | Suspect (see below) |
| "Methods used by the coaches behind Tadej Pogačar, Chris Froome and Egan Bernal" | Social proof strip | Strong if true, fragile if not |
| "Trusted by over 1 million monthly listeners" | Social proof strip | Plausible (brand bible cites 100M+ total downloads) |
| Four named profiles in teaser chips | Below social proof | Strong — specificity = credibility |
| FAQ on email use | Below diagnostic | Honest — "Yes, so we can send your diagnosis" |

### Brutal flags

- **"1,400+ podcast conversations"** — the Roadman Cycling Podcast does not have 1,400 episodes (the brand bible cites 100M+ downloads but no episode count anywhere near 1,400). If "conversations" means individual interviews including clips, side-projects, and cross-pod appearances, the claim might be defensible internally — but a sceptical cold visitor will Google "Roadman Cycling podcast episodes," see a far smaller number, and dismiss the page. **Verify or rephrase.**
- **The Pogačar / Froome / Bernal claim** is the strongest credibility lever on the page, but it's also the highest-risk. Pogačar's coach is Iñigo San Millán; Froome's was Tim Kerrison; Bernal's was Xabier Artetxe. The brand bible names Dan Lorang and Professor Seiler as Anthony's expert network. There is a degree of separation here that the copy elides. If a cold cycling-literate visitor (the exact target) parses this as name-dropping, trust collapses. **Either name the actual experts (Lorang, Seiler, Dunne, Morton — all in the brand bible) or qualify the claim ("methods drawn from coaches who have worked with riders at the level of...").**
- **No host identity, anywhere.** Anthony's name does not appear on the page. No headshot. No "About the host." For a brand whose product is *the relationship with Anthony*, this is the largest single trust gap.
- **No member testimonials.** The brand bible cites specific results — "Cat 3 to Cat 1, body fat 20% to 7%, Women's National Series results." None are on the page. One named, photographed member with one specific outcome would do more for cold conversion than the entire social-proof strip.
- **No "as featured on" / podcast platform logos.** Apple Podcasts, Spotify, YouTube — instantly recognisable, immediately credibility-additive, and cheap to add.
- **No data/privacy reassurance.** The CTA promises "no email needed to start," but the FAQ admits email is required to receive the result. There is no "we don't sell your data" line, no privacy link near the email gate. Cold traffic in 2026 reads "we'll add you to a list" as a yellow flag.

---

## 3. Friction points

### Structural friction

- **The hero CTA is an anchor (`href="#start"`).** A cold visitor who clicks "Start the Diagnostic" is scrolled past four sections (social proof → profile teaser → how it works → diagnostic). On a phone with a slow scroll, that's a half-second of visual noise before they land in the right place. It's not broken — but it's not a click that *feels* like the start of an experience.
- **The diagnostic loads via Suspense + client component.** If JS fails or hangs, the user sees a skeleton (`DiagnosticSkeleton`, lines 104–111) with an empty box and no explanation. No "loading..." text, no fallback message. On a flaky mobile connection this is a silent dead-end.
- **No mid-page CTA.** The two CTAs (hero, final) are at the extremes. There's no commit-button after the social-proof strip or after "How it works" — which is the natural decision-moment for the on-the-fence reader who skims.
- **No sticky CTA on mobile.** A reader who scrolls deep into the FAQ has to thumb-scroll all the way back up or all the way down to act.

### Hidden-cost friction

- **"No email needed to start"** is technically true but functionally misleading. Email is required to *receive the result.* A cold visitor who invests 4 minutes and then hits an email gate may feel bait-and-switched. The FAQ admits this — but the FAQ is below the diagnostic. By the time they read it, they've already started.
- **The diagnostic is 12 scored questions plus demographics, optional FTP, optional goal, optional Q13, plus email.** That's substantially more than "12 questions" — the hero promise undersells the actual investment.
- **Profile-teaser chips include "Polarisation Failure."** Two of the four chips (Strength Gap, Fuelling Deficit, Under-recovered) are self-explanatory in plain English. "Polarisation Failure" is sport-science jargon. A cold visitor sees three things they understand and one thing they don't, and the unfamiliar one is the one that registers as "this isn't for me." Consider "Grey-zone trap" or "Junk-mile trap" as a plain-English label that still maps cleanly to the underlying concept.

---

## 4. Copy quality

### Against the brand voice guide

The brand bible specifies: *direct and warm, peer-to-peer, cycling-specific, no jargon overload, no clickbait, no vague motivational fluff.* Trigger words to favour: "structure, clarity, finally, actually works, proven, precision, stop guessing, not done yet, serious, like a pro, more in me, unlock, breakthrough."

| Brand rule | Page performance |
|---|---|
| Direct and warm | ✓ Mostly. Hero is direct, FAQ tone is warm. |
| No jargon overload | ✗ "FTP," "Masters," "Polarisation Failure" all assume insider knowledge |
| Cycling-specific | ✓ Strong — every claim is grounded in the sport |
| No clickbait | ✓ No "you won't believe" energy |
| Trigger words used | Partial — "specific" and "exact" are heavy; "not done yet," "breakthrough," "unlock," "more in me" are absent |
| Peer-to-peer "we/you" | Mixed. FAQ uses "I" and "you" naturally ("Reply to the email it lands in and tell me. I'll personally re-run it"). Hero is institutional ("Twelve questions. Four minutes."). |

### Headline-by-headline critique

- **"FTP STUCK FOR A YEAR? IT'S ALMOST ALWAYS ONE OF FOUR THINGS."** — Punchy. Specific. But "almost always" weakens the certainty, and "four things" doesn't tell the reader what kind of things (problems? fixes? profiles?). Stronger: "FTP STUCK FOR A YEAR? THERE ARE ONLY FOUR REASONS."
- **"FOUR MINUTES TO YOUR ANSWER"** — Good. Reinforces the time investment.
- **"WHAT YOU'LL GET"** — Generic. Could be: "WHAT LANDS IN YOUR INBOX" or "WHAT YOUR DIAGNOSIS LOOKS LIKE."
- **"STILL HERE? ANSWER YOUR FIRST QUESTION."** — Clever, on-brand, slightly cheeky. Works.
- **"COMMON QUESTIONS"** — Fine, but the FAQ is doing real heavy lifting (objection handling) and deserves a frame that sets that up.

### Subhead and microcopy

- The hero subhead is one of the best lines on the page: *"Twelve questions. Four minutes. A specific answer for why your progress has stalled — and the exact fix."* The cadence is correct, the promise is specific, the language is plain. **"Exact fix"** is slightly overpromised (the diagnostic returns a templated 3-step prescription, not a personalised plan) — but it's defensible.
- **CTA copy: "START THE DIAGNOSTIC"** is functional but generic. The brand voice would prefer something with more skin: *"Find my profile"* / *"Show me which one I am"* / *"Diagnose my plateau."* First-person CTAs lift cold-traffic clicks 5–15% in most A/B tests.
- The "What you'll get" cards (lines 66–79) are well-written and specific. The "Your next move" card is the weakest of the three — *"A clear recommendation, not a generic plan"* is a negation, not a description.

### What's missing from the copy

- **No story.** Cold traffic gets no narrative — no "I built this because..." line, no specific moment of insight. The page is all promise, no origin.
- **No emotional truth.** The brand bible's Persona 1 (Tom) feels "quiet shame that effort isn't yielding results." Persona 3 (James) feels "longing for a former version of himself." Neither emotion is named on the page. The headline names a *symptom* (FTP stuck) but not the *feeling*. A line like "You're putting in the hours. Nothing's moving. You're starting to wonder if this is it" would land harder than "FTP stuck for a year."

---

## 5. CTA positioning

### What's there

- **Hero CTA** (line 188–193): coral, large, clear, anchored to `#start`.
- **Bottom CTA** (line 368–374): identical copy, identical destination.
- **No mid-page CTA.**
- **No sticky/floating mobile CTA.**

### Issues

- **Two CTAs, same exact text, same destination.** This is a wasted variant. The bottom CTA could acknowledge the reader has now read the page: *"OK — start the 12 questions"* or *"You've read the page. Now answer one."*
- **Distance from hero CTA to actual diagnostic.** A click on the hero scrolls past four full sections. On mobile that's ~2,500–3,500 px of scroll animation. The transition should feel like *commitment*, not *flight time*.
- **No CTA after the social proof strip or after "How it works."** Both are natural conversion moments. A reader who is sold by "1 million monthly listeners" should be able to convert without having to scroll to the diagnostic embed.
- **The CTA on mobile sits at the very bottom.** A scrolling reader has no thumb-reachable commit button until they reach the page foot.

### What good looks like (without prescribing the redesign)

A cold-traffic page of this length typically wants: hero CTA → repeat after social proof → repeat after "How it works" → embedded diagnostic → repeat after "What you'll get" → final CTA. That's four CTAs minimum, plus a sticky mobile button after the user passes the hero fold.

---

## 6. Mobile experience

Reviewing the source rather than a live render, but the structure tells most of the story.

### Likely good

- The hero CTA has generous tap padding (`px-10 py-4`) — comfortable for thumbs.
- Profile chips wrap (`flex-wrap`) — no horizontal scroll on small screens.
- The diagnostic container is `max-w-[640px]` — appropriate for mobile readability.
- Sections stack to single column on mobile (all grids use `md:grid-cols-3`).
- ScrollReveal uses `eager` on the hero (line 173), so the H1 paints without waiting on intersection observers — good for LCP.

### Likely problematic

- **The hero headline is long.** "FTP STUCK FOR A YEAR? IT'S ALMOST ALWAYS ONE OF FOUR THINGS." at `var(--text-hero)` will likely run 4–6 lines on a phone, dominating the first viewport and pushing the CTA below the fold. Worth measuring.
- **The microcopy under the CTA** ("No email needed to start · 4 minutes · Free · N cyclists took it this week") is separated by middots. On a narrow phone this will wrap awkwardly across 2–3 lines and lose its punchy rhythm. Consider stacking on small screens or dropping a separator.
- **Every section uses ScrollReveal.** That's at least 7 intersection observer animations on the way down. On a cheap Android with throttled CPU this can feel laggy or jittery. Worth profiling.
- **No sticky CTA**, as noted above. This is a bigger miss on mobile than on desktop.
- **Header is included** (line 168). On mobile, the global header eats vertical space the cold visitor would rather give to the hero. Consider a stripped-down landing-page header for paid traffic.
- **No imagery anywhere.** On mobile especially, an all-text page reads as a wall. A single hero image (Anthony, a power meter, a rider on a climb) would break the visual monotony and add humanity.

---

## 7. Competitive comparison

How does /plateau stack up against the kind of pages cold traffic compares it against?

### vs. TrainerRoad / Zwift / FasCat / similar coaching landings

| Element | Roadman /plateau | Typical competitor |
|---|---|---|
| Founder/coach face above the fold | ✗ Absent | ✓ Standard — usually a headshot or short video |
| Athlete photography | ✗ None | ✓ Heavy — riders, bikes, races |
| Specific member testimonial with name + photo + result | ✗ None | ✓ Standard — usually 3–5 |
| "As featured on" platform logos | ✗ None | ✓ Standard — Apple/Spotify/Strava/etc |
| Quantified social proof | ✓ Dynamic recent count, "1M monthly listeners" | ✓ Comparable |
| Time-to-result promised | ✓ "4 minutes" — clear | Variable |
| Free/no-card framing | ✓ Clear | Often murkier |
| Founder voice in copy | Partial — FAQ has it, hero doesn't | Variable |
| Specific outcome described | ✓ Strong — "one of four profiles" | Often weaker |
| Mid-page CTAs | ✗ Absent | ✓ Standard — 3–4 typically |
| Sticky mobile CTA | ✗ Absent | ✓ Standard on conversion-focused pages |

### vs. interactive diagnostic / quiz pages (the closest format match)

Cold-traffic quiz pages (think Buzzfeed-descendant brands like Calm, Noom, Athletic Greens onboarding) typically lead with:
- A single bold question identifying the user
- A face or character to attach the brand to
- 3–5 trust elements stacked tight
- One CTA, large, unambiguous

Roadman /plateau hits 3 of 4. The missing piece — the **face** — is the most expensive omission given that the brand's product *is* Anthony.

### Where Roadman beats most competitors

- **The four named profiles** (Under-recovered, Polarisation Failure, Strength Gap, Fuelling Deficit) signal a real underlying model rather than a generic "find your style" quiz. This is the page's strongest competitive differentiator and should be leaned on harder.
- **The dynamic submission count** is rarer than it should be — most quiz pages use static "10,000+ taken" lies.
- **The honest FAQ** — particularly *"At the end you'll see whether Not Done Yet is the right fit. If it's not, the diagnosis is yours to keep — we don't run a hard-sell sequence"* — is exactly the brand voice working at full strength. This line should be promoted out of the FAQ and into the page body. It is the single most cold-traffic-disarming sentence on the page.

---

## Top 10 fixes ranked by cold-traffic impact

These are *recommendations*, not a brief. Reviewer's call on which to action.

1. **Add Anthony to the page.** Name, headshot, one line. Hero or immediately below.
2. **Verify or rephrase "1,400+ podcast conversations" and the Pogačar/Froome/Bernal claim.** Both are sceptic-magnets. Replace with named experts already in the brand bible (Lorang, Seiler, Dunne, Morton).
3. **Add at least one named, photographed member testimonial with a specific outcome.** "Cat 3 to Cat 1," "20% body fat to 7%" are already in the brand bible.
4. **Add a mid-page CTA** between social proof and "How it works."
5. **Add a sticky mobile CTA** after the hero scrolls out of view.
6. **Promote the no-hard-sell FAQ line** into the body of the page. It's the best cold-traffic-disarming sentence on the page and it's currently buried.
7. **Rename "Polarisation Failure"** in the teaser chips to plain English (e.g. "Grey-zone trap"). Keep the technical name in the actual diagnosis if you want.
8. **Drop "almost always"** from the hero. Commit to four.
9. **Add platform credibility logos** (Apple Podcasts, Spotify, YouTube subscriber count) below the social proof strip.
10. **Tighten the email expectation.** Either change "no email needed to start" to "your email is needed to receive the result" (honest framing), or move email collection to the front so the bait-and-switch risk is eliminated.

---

## What not to change

- The hero subhead's cadence ("Twelve questions. Four minutes...") is the right voice. Don't touch it.
- The dynamic recent-submission count. Keep.
- The four named profiles. The specificity is the moat.
- The honest FAQ tone. Particularly the Q&A pairs about "Will this just sell me?" and "What if my diagnosis doesn't sound like me?" — these are best-in-class for the format.
- The colour palette and type system. On-brand, on-spec, working.

---

*Audit covers static page structure and copy. No JS execution path or rendered-pixel verification was performed; recommendations marked "likely" assume rendered behaviour matches the source.*
