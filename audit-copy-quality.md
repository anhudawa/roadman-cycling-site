# Copy Quality & AI Slop Audit — Roadman Cycling Site

**Date:** 2026-05-03
**Benchmark:** Rouleur 9.5/10, "The Approachable Expert" voice
**Scope:** All `.tsx` and `.mdx` files under `src/`
**Action:** Report only — no fixes applied

---

## 1. Banned AI Slop Terms

### "seamless" / "seamlessly"

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `src/app/(marketing)/partners/page.tsx` | 246 | `"The host made the entire process seamless, delivering scripts and reads quickly and professionally…"` |
| 2 | `src/app/(marketing)/partners/page.tsx` | 694 | Same quote rendered in page body: `"The host made the entire process seamless, delivering scripts and reads…"` |

**Verdict:** This is a direct quote from a discovery+ sponsor testimonial. Replacing it would alter a third-party endorsement. **Low severity** — consider whether you want to paraphrase the testimonial or leave verbatim.

### "world-class" (overuse)

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `src/app/(content)/guests/page.tsx` | 10 | Page title: `"Podcast Guests — World-Class Coaches, Scientists & Pro Cyclists"` |
| 2 | `src/app/(content)/guests/page.tsx` | 17 | OG title: `"Podcast Guests — World-Class Coaches, Scientists & Pro Cyclists"` |
| 3 | `src/app/(content)/guests/page.tsx` | 86 | Body copy: `"World-class coaches, scientists, pro cyclists, and endurance…"` |
| 4 | `src/app/(content)/guests/[slug]/page.tsx` | 27 | Meta description fallback: `"…Expert cycling knowledge from world-class guests."` |
| 5 | `src/app/(marketing)/partners/page.tsx` | 770 | Section comment/heading: `"WORLD-CLASS GUESTS — Credibility"` |
| 6 | `src/app/(marketing)/partners/page.tsx` | 783 | Rendered heading: `"WORLD-CLASS GUESTS"` |
| 7 | `src/components/layout/Footer.tsx` | 149 | Footer copy: `"1,400+ episodes of world-class expertise into content that makes you faster."` |

**Verdict:** Seven instances across four files. The term is accurate (LeMond, Seiler, Lorang are genuinely elite), but at seven occurrences it's overused and starts reading like padding. **Medium severity** — keep 2–3 strategic uses, replace the rest with specific descriptors ("World Tour-level", "leading", "elite", or name-drop).

### "deep dive" / "deep-dive"

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `src/app/(marketing)/inner-circle/page.tsx` | 122 | Feature title: `"Monthly 45-minute video deep-dive"` |
| 2 | `src/app/(marketing)/inner-circle/page.tsx` | 175 | Comparison table: `"Monthly video deep-dive"` |
| 3 | `src/app/(marketing)/inner-circle/page.tsx` | 219 | FAQ answer: `"…monthly video deep-dive, quarterly bloods."` |
| 4 | `src/app/(marketing)/inner-circle/page.tsx` | 267 | Schema/meta: `"…monthly video deep-dive, quarterly bloods."` |
| 5 | `src/app/(marketing)/inner-circle/page.tsx` | 989 | Body copy: `"Monthly 45-minute video deep-dive"` |
| 6 | `src/app/(marketing)/entity/not-done-yet/page.tsx` | 45 | Feature description: `"Deep-dive sessions on nutrition, race-day fuelling…"` |
| 7 | `src/app/(content)/topics/page.tsx` | 72 | Page heading: `"DEEP DIVES"` |

**Verdict:** Used to describe actual long-form coaching sessions and topic hubs, so contextually defensible. But seven instances make it feel like a crutch. **Low-medium severity** — the topics page heading ("DEEP DIVES") is fine as a section name; the Inner Circle instances should be trimmed. Consider "monthly video review", "monthly 1:1 session", or "monthly strategy call" as alternatives.

### "masterclass"

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `src/app/(marketing)/inner-circle/page.tsx` | 56 | `"Live calls, masterclasses, the room of serious cyclists."` |
| 2 | `src/app/(marketing)/inner-circle/page.tsx` | 158 | `"Live masterclasses"` |
| 3 | `src/app/(marketing)/entity/not-done-yet/page.tsx` | 12 | `"…expert masterclasses, and a private group…"` |
| 4 | `src/app/(marketing)/entity/not-done-yet/page.tsx` | 43 | `"Expert masterclasses"` |
| 5 | `src/app/(content)/plan/[event]/[weeksOut]/page.tsx` | 366 | `"masterclasses. 7-day free trial."` |
| 6 | `src/app/(community)/community/page.tsx` | 171 | `"expert masterclasses. For cyclists who've been…"` |
| 7 | `src/app/(community)/community/page.tsx` | 178 | `"Expert masterclasses (Seiler, Lorang)"` |
| 8 | `src/app/(community)/community/not-done-yet/page.tsx` | 15 | `"…expert masterclasses, and a private community…"` |
| 9 | `src/app/(community)/community/not-done-yet/page.tsx` | 22 | Same text in OG description |
| 10 | `src/app/(community)/community/not-done-yet/page.tsx` | 136 | `"…expert masterclasses, and weekly coaching calls…"` |

**Verdict:** These are actual masterclass sessions (Seiler, Lorang teaching), so the term is literally correct. **No action needed** — exempted per the audit rules ("unless actual masterclass"). Flagged for awareness only.

### "unlock" / "unlocks"

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `src/app/(content)/tools/masters-ftp-benchmark/layout.tsx` | 63 | `"…explaining the most common unlocks at that level — whether that is intensity discipline, strength training…"` |

**Verdict:** Used in a technical coaching context (what training adaptation to target next). Borderline — reads naturally in this context but is on the banned list. **Low severity** — consider replacing with "gains", "breakthroughs", or "next steps".

Note: Other `unlock`/`unlocked` instances in `predict/[slug]/page.tsx` (lines 105–379) and `wrapped/_components/` are code logic (gating content behind email capture), not user-facing copy.

### "landscape" (non-literal)

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `src/app/(marketing)/coaching/[location]/page.tsx` | 645 | `"…we understand the all-island racing landscape."` |

**Verdict:** Borderline. This refers to the competitive racing scene in Ireland, not a physical landscape. **Low severity** — could replace with "racing scene" or "racing calendar" for clarity.

### "transform your"

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `src/app/(content)/plan/[event]/page.tsx` | 65 | `"…8 weeks of focused work can still be enough to transform your result."` |

**Verdict:** Generic fitness language. **Medium severity** — rephrase to something specific like "shift your finish time" or "make a real difference to your result".

---

## 2. Generic Fitness Language

| # | File | Line | Issue | Suggestion |
|---|------|------|-------|------------|
| 1 | `src/app/(content)/plan/[event]/page.tsx` | 65 | "transform your result" | Generic motivational phrasing. Use concrete language: "improve your finish time", "take 20 minutes off". |

**Overall:** The site is remarkably clean of generic fitness copy. Almost all content is cycling-specific and technical. Only one instance found.

---

## 3. Tone Violations

**No significant tone violations found.** The copy consistently hits "The Approachable Expert" register — direct, cycling-specific, peer-to-peer. The FAQ answers across coaching pages are particularly strong: concrete, evidence-backed, no fluff.

Minor observations (not violations):

- The sponsor/partners page (`partners/page.tsx`) shifts into a more corporate B2B register, which is appropriate for that audience.
- The "Sponsorship Quiz" CTA (`partners/page.tsx:853`) is the only mildly clickbaity element but is functional — it's a lead-qualifying flow, not a BuzzFeed quiz.

---

## 4. Terminology Inconsistencies

### "NDY" in user-facing copy

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `src/app/(marketing)/inner-circle/page.tsx` | 209 | FAQ answer: `"…a sixth pillar that NDY doesn't have at all…"` |
| 2 | `src/app/(marketing)/inner-circle/page.tsx` | 826 | Comparison table label: `"NDY:"` |
| 3 | `src/app/(marketing)/coaching/page.tsx` | 158 | Metric delta: `"+60w in 3 months on NDY"` |

**Verdict:** "NDY" appears in user-facing copy in three places. The rule is "Not Done Yet" in user-facing content. Line 209 is especially notable — it uses both "Not Done Yet" and "NDY" in the same paragraph, which is acceptable if the first usage establishes the abbreviation. Lines 826 and 158 use "NDY" without establishing it first. **Medium severity.**

Note: `entity/not-done-yet/page.tsx:128` lists "NDY" as a `schema.org` `alternateName`, which is acceptable (structured data, not displayed copy). Admin pages using "NDY" are internal-only and exempt.

### "quiz" used for Plateau Diagnostic

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `src/app/(marketing)/plateau/page.tsx` | 29 | Code comment: `"starting the quiz"` |
| 2 | `src/app/(marketing)/plateau/_components/StickyMobileCta.tsx` | 12 | Code comment: `"inside the quiz"` |
| 3 | `src/components/features/ndy/FitOverlay.tsx` | 78 | Aria label: `"Find your fit quiz"` |
| 4 | `src/components/features/ndy/FitOverlay.tsx` | 83 | Aria label: `"Close quiz"` |

**Verdict:** The code comments are internal-only (no issue). The aria labels on `FitOverlay.tsx` are read by screen readers and count as user-facing. The "Find your fit" flow is separate from the Plateau Diagnostic, so "quiz" may be acceptable there — but confirm whether this flow should use different terminology. **Low severity.**

Note: `CoachingDecisionCTA.tsx` uses "TAKE THE QUIZ: COACH OR APP?" — this is a separate coach-vs-app decision flow, not the Plateau Diagnostic, so "quiz" is acceptable there. `partners/page.tsx:853` "Take the Sponsorship Quiz" is also a separate flow.

### "1:1 coaching" vs "Roadman Inner Circle"

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `src/app/(marketing)/about/how-we-coach/page.tsx` | 116 | Section title: `"1:1 Coaching"` |
| 2 | `src/app/(marketing)/coaching/triathletes/page.tsx` | 225 | Schema description: `"…weekly 1:1 coaching…"` |
| 3 | `src/app/(marketing)/entity/not-done-yet/page.tsx` | 89 | Feature name: `"1:1 Coaching"` |

**Verdict:** These use "1:1 coaching" as a generic descriptor of the format, not as a product name competing with "Roadman Inner Circle". Context is appropriate — they describe the coaching modality, not the product. **No action needed.**

### "asynchronous-first" in user-facing copy

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `src/app/(marketing)/coaching/page.tsx` | 141 | `"…all communication is asynchronous-first."` |
| 2 | `src/app/(marketing)/coaching/[location]/page.tsx` | 227 | `"All coaching communication is asynchronous-first…"` |
| 3 | `src/app/(marketing)/coaching/[location]/page.tsx` | 237 | `"…regular asynchronous check-ins plus live calls…"` |
| 4 | `src/app/(marketing)/coaching/[location]/page.tsx` | 243 | Feature bullet: `"Asynchronous-first communication for cross-Atlantic coaching"` |
| 5 | `src/app/(community)/community/not-done-yet/page.tsx` | 118 | `"The coaching runs asynchronously…"` |

**Verdict:** "async" as a standalone term is banned, but "asynchronous" is the full word. Still, "asynchronous" is jargon that won't land with most amateur cyclists — it's tech/startup language. **Medium severity** — consider "on your own schedule", "you don't have to be online at the same time", or "message-based" as alternatives.

---

## 5. Currency Issues (£ / €)

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `src/components/paid-reports/UpsellCard.tsx` | 34 | `return \`€\${major}\`;` |
| 2 | `src/components/paid-reports/UpsellCard.tsx` | 36 | `return \`£\${major}\`;` |
| 3 | `src/app/(content)/reports/[product]/success/page.tsx` | 48 | `return \`€\${major}\`;` |
| 4 | `src/app/(content)/reports/[product]/success/page.tsx` | 50 | `return \`£\${major}\`;` |
| 5 | `src/app/admin/(dashboard)/paid-reports/page.tsx` | 37 | `return \`€\${major}\`;` |
| 6 | `src/app/admin/(dashboard)/paid-reports/page.tsx` | 39 | `return \`£\${major}\`;` |

**Verdict:** All six instances are in `formatPrice()` utility functions that switch on the currency code from Stripe. These render £ or € only when the payment was made in GBP or EUR respectively. This is **correct behaviour** — showing a customer their actual payment currency. The default/USD branch correctly renders `$`. **No action needed** — these are dynamic currency displays, not hardcoded pricing copy.

---

## 6. "async" in User-Facing Content

No instances of the standalone word "async" appear in user-facing copy. All `async` occurrences are JavaScript keywords (`async function`, `t.async=!0`), HTML attributes (`decoding="async"`), or code comments. **Clean.**

---

## Summary

| Category | Findings | Severity |
|----------|----------|----------|
| **AI slop — "world-class"** | 7 instances across 4 files | Medium (overuse) |
| **AI slop — "deep dive/deep-dive"** | 7 instances across 3 files | Low-Medium |
| **AI slop — "seamless"** | 2 instances in 1 file | Low (sponsor quote) |
| **AI slop — "unlock/unlocks"** | 1 instance | Low |
| **AI slop — "landscape" (non-literal)** | 1 instance | Low |
| **Generic fitness — "transform your"** | 1 instance | Medium |
| **Terminology — "NDY" in user copy** | 3 instances | Medium |
| **Terminology — "asynchronous"** | 5 instances | Medium (jargon) |
| **Terminology — "quiz" for aria labels** | 2 instances | Low |
| **Currency (£/€)** | 6 instances | None (dynamic Stripe formatting) |
| **Tone violations** | 0 | Clean |
| **"masterclass"** | 10 instances | None (actual masterclasses) |
| **"async" (standalone)** | 0 in user copy | Clean |

**Total flagged items: 27** (excluding exempted masterclass and currency instances)

**Overall assessment:** The site is in strong shape. The copy is cycling-specific, technically grounded, and tonally consistent. The main action items are: trim "world-class" usage, diversify away from "deep-dive" on the Inner Circle page, expand "NDY" to "Not Done Yet" in the three user-facing instances, and replace "asynchronous" with plain language.
