# Article Template Redesign — July 2026

**Date:** 2026-07-10
**Purpose:** Close the structural gap between the blog post template and the Masters Cycling Training Report model. Design document only — no code changes.
**Framework:** Dominance Audit July 2026, Phase 1 item: "Redesign article template around Masters Report model"

---

## 1. Current Blog Post Template Structure

**File:** `src/app/(content)/blog/[slug]/page.tsx` (959 lines)
**Frontmatter interface:** `src/lib/blog.ts` → `BlogFrontmatter`

### What exists today

The blog post template renders these sections, in order:

| # | Section | Source | Always rendered? |
|---|---------|--------|-----------------|
| 1 | **Hero** (pillar badge, reading time, H1 title, author, dates, share buttons) | Frontmatter | Yes |
| 2 | **Breadcrumbs** | Computed from route | Yes |
| 3 | **Answer Capsule** (one-paragraph direct answer + keyTakeaways bullets) | `answerCapsule` + `keyTakeaways` frontmatter | Conditional — only if `answerCapsule` is set |
| 4 | **Evidence Level** (strong/moderate/emerging/anecdotal badge) | `evidenceLevel` frontmatter | Conditional |
| 5 | **Cited Claims Table** (claim, Roadman position, evidence source, implication) | `citedClaims` frontmatter | Conditional |
| 6 | **Primary Hub Link** (link to parent topic hub) | `primaryHub` frontmatter or first resolved topic | Conditional |
| 7 | **Cluster Hub Link** (link to parent cluster hub) | Computed from cluster-hubs.ts | Conditional |
| 8 | **Featured Experts** (named entities strip) | `featuredEntities` frontmatter | Conditional |
| 9 | **Series Navigation** (Part X of Y) | `seriesSlug` + `seriesOrder` frontmatter | Conditional |
| 10 | **Article body** (MDX content) | `content` field | Yes |
| 11 | **Series Navigation** (repeated at bottom) | Same as #9 | Conditional |
| 12 | **Plateau Diagnostic CTA** | Component, pillar-aware | Yes |
| 13 | **WeeksOutSelector** (event training plan widget) | EVENTS lookup | Conditional |
| 14 | **Mentioned Events** (free training plan links) | Body text scan | Conditional |
| 15 | **Inline Article CTA** (mid-article, pillar-aware) | Component | Yes |
| 16 | **FAQ accordion** (visible + FAQPage JSON-LD) | `faq` frontmatter | Conditional |
| 17 | **Next Step Block** (three-option conversion) | Component, pillar-aware | Yes |
| 18 | **Email Capture** (Saturday Spin newsletter) | Component | Yes |
| 19 | **Intent CTA** (inferred from keywords) | Component, keyword-aware | Yes |
| 20 | **Topic Hub Back-links** | Computed from topics | Conditional |
| 21 | **Author byline + Share Buttons** | Hardcoded "Anthony Walsh" | Yes |
| 22 | **Author Bio** (E-E-A-T) | `AuthorBio` component | Yes |
| 23 | **Article Citation Block** (APA citation + microdata) | Component | Yes |
| 24 | **Evidence Block** (experts, episodes, review date, reviewedBy) | `experts` + `relatedEpisodes` + `reviewedBy` frontmatter | Yes (falls back to Anthony-only) |
| 25 | **Ask Roadman CTA** (AI assistant handoff) | Component | Yes |
| 26 | **Related Calculators** (graph-powered) | Content graph | Conditional |
| 27 | **Key Terms** (glossary links) | Content graph | Conditional |
| 28 | **Related Posts** (3 cards) | Pillar/keyword heuristic or curated | Conditional |
| 29 | **Related Podcast Episodes** | `relatedEpisodes` frontmatter | Conditional |
| 30 | **Related Content** (cross-type: blog + podcast) | Component | Yes |
| 31 | **Journey Links** (funnel-aware next step) | Component | Yes |
| 32 | **Sticky Coaching Bar** | Coaching/nutrition pillars only | Conditional |

### Frontmatter fields available

All defined in `BlogFrontmatter` (src/lib/blog.ts):

- `title`, `seoTitle`, `seoDescription`, `excerpt`
- `pillar`, `author`, `publishDate`, `updatedDate`
- `featuredImage`, `keywords`
- `primaryHub` (optional topic hub slug)
- `relatedEpisodes[]`, `relatedPosts[]`
- `faq[]` (question/answer pairs)
- `answerCapsule` (one-paragraph direct answer)
- `keyTakeaways[]` (2-3 bullet takeaways)
- `experts[]` (name, role, href)
- `featuredEntities[]` (entity page slugs)
- `reviewedBy`, `lastReviewed`
- `citedClaims[]` (claim, position, evidenceSource, implication, evidenceLevel)
- `claimsHeading`, `claimsCaption`
- `evidenceLevel`, `evidenceNote`
- `claimReviews[]` (myth-busting schema)
- `howTo` (step-by-step schema)
- `seriesSlug`, `seriesOrder`, `seriesTitle`

---

## 2. Masters Cycling Training Report — The Gold Standard

**Blog post file:** `content/blog/masters-cycling-training-report-2026.mdx` (720+ lines)
**Squeeze page file:** `src/app/masters-report/page.tsx` (367 lines)

### What makes this post structurally different from a typical blog post

The Masters Report uses the same blog template component, but its frontmatter and content are structured to satisfy all 10 audit elements. Here is what the post does that most blog posts do not:

| Audit Element | Masters Report Implementation | How it's done |
|---------------|------------------------------|---------------|
| 1. Primary query | Title + seoTitle laser-focused on "masters cycling training report 2026" | `seoTitle` frontmatter |
| 2. User-centred title | "The Masters Cycling Training Report 2026" — names the deliverable | `title` frontmatter |
| 3. Direct answer | 120-word `answerCapsule` covering VO2max decline rate, strength prescription, protein dose, recovery window, female-specific caveats | `answerCapsule` frontmatter |
| 4. Who this is for | Implicit in the opening section ("The 48-year-old at the back of the Sunday group") — but NOT a structured component | Body copy only |
| 5. Decision framework | The entire 18-section structure IS the decision framework — but no structured `decisionFramework` component exists | Body copy only |
| 6. Original Roadman evidence | Five named case studies, 1,400+ episode conversations cited, NDY coaching pool data | Body copy |
| 7. Limitations and exceptions | Female masters section explicitly called out as different; research base acknowledged as smaller | Body copy |
| 8. Named author and reviewer | `author: Anthony Walsh` + `reviewedBy: 'Anthony Walsh, with editorial review by the Roadman Cycling coaching team'` — this is the ONLY blog post with `reviewedBy` | Frontmatter |
| 9. Supporting sources | `experts[]` array names Seiler, Lorang, Friel with guest page links; 5 FAQs with inline citations; `relatedEpisodes[]` links 3 episodes | Frontmatter + body |
| 10. Logical next action | Body ends with what to do next; squeeze page drives email capture | Body copy |

### What the squeeze page adds (not part of blog template)

The `/masters-report` squeeze page (`src/app/masters-report/page.tsx`) adds:
- Credibility ribbon (100M+ downloads, 1,400+ episodes)
- Four teaser findings with stats (0.5%, 72 HOURS, 1.6-2.2 G/KG, +43 WATTS)
- "Inside the report" stat strip (18 sections, 40+ citations, 5 case studies, 12-week block)
- Section highlights checklist (10 items)
- Email capture form (top + bottom)

These are lead-gen page elements, not article template elements.

---

## 3. Answer Page Template — The Structured Comparison

**File:** `src/components/templates/AnswerTemplate.tsx` (429 lines)
**Data interface:** `src/lib/answers.ts` → `AnswerPage`

### What the answer template has that the blog template does not

The answer template has explicit, structured sections for every audit element:

| Audit Element | Answer Template Section | Component/Data |
|---------------|------------------------|----------------|
| 1. Primary query | `question` field (always a user-phrased question) | `AnswerPage.question` |
| 2. User-centred title | H1 is the question itself | Hardcoded pattern |
| 3. Direct answer | `AnswerCapsule` (always rendered, required field) | `AnswerPage.directAnswer` (required) |
| 4. Who this is for | "WHO THIS IS FOR / IS THIS YOU?" section with label + detail cards | `AnswerPage.whoFor[]` (structured array) |
| 5. Decision framework | "THE ROADMAN VIEW" editorial stance section | `AnswerPage.roadmanView[]` |
| 6. Original Roadman evidence | "EXPERT EVIDENCE / WHAT THE EXPERTS SAY" with named guests, credentials, episode links | `AnswerPage.expertEvidence[]` |
| 7. Limitations and exceptions | "COMMON MISTAKES / WHAT CYCLISTS GET WRONG" (mistake + fix pairs) | `AnswerPage.commonMistakes[]` |
| 8. Named author and reviewer | EvidenceBlock with `reviewedBy` | `AnswerPage.reviewedBy` |
| 9. Supporting sources | Related episodes, expert evidence, EvidenceBlock | Multiple fields |
| 10. Logical next action | "PRACTICAL APPLICATION / DO THIS WEEK" with numbered steps | `AnswerPage.practicalApplication[]` |

### Key structural difference

The answer template makes all 10 elements **required data fields** with **dedicated rendering sections**. The blog template makes most of them optional frontmatter with conditional rendering. The answer template enforces a consistent information architecture; the blog template allows any combination.

---

## 4. Gap Analysis: Blog Template vs the 10-Element Audit Model

| # | Audit Element | Blog Template Status | Gap |
|---|---------------|---------------------|-----|
| 1 | Primary query | **Partial.** `seoTitle` exists but most posts have generic titles. No enforcement that the title targets one query. | PROCESS gap, not template gap. Needs editorial guidelines. |
| 2 | User-centred title | **Partial.** `title` field exists. Most titles are informational, not user-centred ("X Guide" not "How to X when Y"). | PROCESS gap. |
| 3 | Direct answer | **Available but optional.** `answerCapsule` + `keyTakeaways` exist in frontmatter and render via `AnswerCapsule` component. But only a subset of posts populate them. | ADOPTION gap. The template supports it. Need to populate it on all canonical posts. |
| 4 | Who this is for | **MISSING.** No `whoFor` field in `BlogFrontmatter`. No component in blog template. The answer template has it. | TEMPLATE + FRONTMATTER gap. Need to add `whoFor` to `BlogFrontmatter` and render a "Who this is for" section. |
| 5 | Decision framework | **MISSING.** No `decisionFramework` or `roadmanView` field in `BlogFrontmatter`. No dedicated section. Some posts embed frameworks in body MDX, but nothing structured or extractable. | TEMPLATE + FRONTMATTER gap. Need a structured "The Roadman Position" or "Decision Framework" section. |
| 6 | Original Roadman evidence | **Partial.** `experts[]` and `featuredEntities[]` exist. `citedClaims[]` exists. `EvidenceBlock` renders at the bottom. But there is no dedicated "Our evidence" section above the fold — the EvidenceBlock is at the very bottom of the page. | POSITION gap. Evidence signals exist but are buried below 20+ sections. Need a visible evidence summary near the top. |
| 7 | Limitations and exceptions | **MISSING.** No `limitations` or `commonMistakes` field in `BlogFrontmatter`. No dedicated section. Some posts address limitations in body MDX. | TEMPLATE + FRONTMATTER gap. Need a "Limitations" or "When this doesn't apply" section. |
| 8 | Named author and reviewer | **Available but underused.** `author` (always set), `reviewedBy` (exists in frontmatter, renders in EvidenceBlock). Only 2 of 1,010+ posts have `reviewedBy` populated. | ADOPTION gap. The template supports it. Need to populate on all canonical posts. |
| 9 | Supporting sources | **Strong.** `experts[]`, `relatedEpisodes[]`, `citedClaims[]`, `EvidenceBlock`, `ArticleCitationBlock` all exist. | No template gap. Already well-served. |
| 10 | Logical next action | **Partial.** `NextStepBlock`, `JourneyLinks`, `IntentCTA` exist — but these are conversion CTAs, not editorial "here's what to do with this information" guidance. The answer template's `practicalApplication[]` ("DO THIS WEEK") is editorially different from a CTA. | TEMPLATE + FRONTMATTER gap. Need a structured "What to do next" section that is editorial, not commercial. |

---

## 5. Specific Recommendations

### A. New frontmatter fields to add to `BlogFrontmatter`

These fields already exist on `AnswerPage` and can be lifted directly:

```
// Who this article is for — structured audience segmentation.
// Rendered as a grid of label + detail cards above the article body.
whoFor?: { label: string; detail: string }[];

// The Roadman position — editorial stance on the topic.
// Not neutral Wikipedia prose. 1-3 paragraphs of Anthony's take.
roadmanView?: string[];

// Practical application — what to do this week.
// Numbered steps the reader can act on immediately.
practicalApplication?: { title: string; detail: string }[];

// Common mistakes / limitations — what cyclists get wrong,
// or when this advice does not apply.
commonMistakes?: { mistake: string; fix: string }[];
```

**Location:** `src/lib/blog.ts`, inside `BlogFrontmatter` interface.

### B. New sections to add to the blog post page component

Add these sections to `src/app/(content)/blog/[slug]/page.tsx`, positioned between the AnswerCapsule/EvidenceLevel/CitedClaims block and the article body:

1. **"WHO THIS IS FOR"** — Renders `whoFor[]` as a grid of cards. Same component pattern as `AnswerTemplate` lines 103-130.

2. **"THE ROADMAN VIEW"** — Renders `roadmanView[]` as a bordered editorial-stance block. Same component pattern as `AnswerTemplate` lines 132-162.

3. **"DO THIS WEEK"** — Renders `practicalApplication[]` as numbered steps. Position: after the article body, before the FAQ. Same component pattern as `AnswerTemplate` lines 224-261. This is the editorial next-action, distinct from the commercial CTAs that follow.

4. **"WHAT CYCLISTS GET WRONG"** — Renders `commonMistakes[]` as mistake/fix pairs. Position: after "Do This Week", before FAQ. Same component pattern as `AnswerTemplate` lines 263-303.

### C. Existing sections to reposition

1. **Move EvidenceBlock higher.** Currently at position #24 (near the very bottom). The reviewer name, expert list, and last-reviewed date should appear within the top 30% of the page — after the AnswerCapsule, before the article body. Add a compact "Reviewed by X | Last reviewed Y | Evidence level: Z" line below the AnswerCapsule. Keep the full EvidenceBlock at the bottom as well — the top instance is a trust badge, the bottom instance is the full attribution.

2. **Make AnswerCapsule mandatory for canonical posts.** The component and frontmatter field already exist. The template already renders it conditionally. For the 10 canonical cluster pages and all priority articles, `answerCapsule` should be populated.

### D. No changes needed (already well-served)

- **Primary query / user-centred title:** These are editorial decisions, not template gaps.
- **Supporting sources:** `experts[]`, `citedClaims[]`, `EvidenceBlock`, `ArticleCitationBlock` already cover this thoroughly.
- **FAQ accordion:** Already exists with both visible rendering and FAQPage JSON-LD.
- **Series navigation:** Already exists and works.
- **Structured data:** BlogPosting, FAQPage, ClaimReview, HowTo, BreadcrumbList all implemented.

---

## 6. Frontmatter vs Component Changes

| Change | Type | File(s) |
|--------|------|---------|
| Add `whoFor` field | Frontmatter + component | `src/lib/blog.ts` (interface) + `page.tsx` (render) |
| Add `roadmanView` field | Frontmatter + component | `src/lib/blog.ts` (interface) + `page.tsx` (render) |
| Add `practicalApplication` field | Frontmatter + component | `src/lib/blog.ts` (interface) + `page.tsx` (render) |
| Add `commonMistakes` field | Frontmatter + component | `src/lib/blog.ts` (interface) + `page.tsx` (render) |
| Add compact reviewer badge near top | Component only | `page.tsx` (new section after AnswerCapsule) |
| Populate `answerCapsule` on canonical posts | Content only | `content/blog/*.mdx` (10+ posts) |
| Populate `reviewedBy` on canonical posts | Content only | `content/blog/*.mdx` (10+ posts) |
| Populate `whoFor` on canonical posts | Content only | `content/blog/*.mdx` (10+ posts, after field exists) |

---

## 7. Implementation Priority

### Priority 1 — Structural parity with answer template (days 1-3)

These are the template changes that close the gap with the answer page format:

1. **Add `whoFor` to `BlogFrontmatter` + render section** — Highest impact new section. Immediately makes every article declare its audience explicitly, which is the single biggest differentiator between the answer template and the blog template.

2. **Add `roadmanView` to `BlogFrontmatter` + render section** — The editorial-stance block is what makes Roadman content different from commodity SEO content. This is the "original Roadman evidence" element.

3. **Add compact reviewer/evidence badge near the top** — Move trust signals above the fold. A single line: "Reviewed by [name] | Evidence: [level] | Updated [date]". Reuses existing data, no new frontmatter needed.

### Priority 2 — Action-oriented sections (days 3-5)

4. **Add `practicalApplication` to `BlogFrontmatter` + render section** — "DO THIS WEEK" gives every article a clear editorial next action, not just a CTA.

5. **Add `commonMistakes` to `BlogFrontmatter` + render section** — Covers both "limitations" and "what cyclists get wrong". Doubles as a trust signal (admitting when advice has boundaries).

### Priority 3 — Content population (days 5-10)

6. **Populate all new fields on the Masters Report post** — Make the existing gold-standard post use the new structured fields instead of embedding them in body MDX.

7. **Populate `answerCapsule` + `reviewedBy` on all 10 canonical cluster posts** — These fields already exist in the template; the gap is adoption.

8. **Populate `whoFor` + `roadmanView` on the 10 canonical posts** — After the template supports them.

### Priority 4 — Rollout to all important content (days 10-20)

9. **Populate new fields on all posts with `citedClaims` or `experts`** — These are already the highest-quality posts; adding the new fields brings them to full audit compliance.

10. **Update article QA audit script** — Add checks for the new fields to `scripts/audit-today.ts` so future articles are validated against the 10-element model.

---

## 8. What NOT to do

- **Do not create a new page template.** The blog template at 959 lines is already feature-rich. The gap is 4 missing frontmatter fields and their render sections, plus repositioning one existing block. A new template would fragment the codebase.

- **Do not make the new fields required.** There are 1,010+ blog posts. Making `whoFor` or `roadmanView` required would break the build. Keep them optional with conditional rendering, same as `answerCapsule`.

- **Do not duplicate the squeeze page pattern.** The `/masters-report` squeeze page (credibility ribbon, stat strip, email capture) is a lead-gen funnel surface. Those elements belong on marketing pages, not on the article template.

- **Do not touch the answer template.** It already has all 10 elements. Leave it as the reference implementation.

---

## 9. Section Order After Redesign

Proposed order for the blog post content area (between Hero and Footer):

1. Breadcrumbs
2. **Compact reviewer badge** (new — "Reviewed by X | Evidence: Y | Updated Z")
3. Answer Capsule + Key Takeaways (existing, conditional)
4. Evidence Level (existing, conditional)
5. Cited Claims Table (existing, conditional)
6. **"WHO THIS IS FOR"** (new, conditional)
7. **"THE ROADMAN VIEW"** (new, conditional)
8. Primary Hub Link (existing)
9. Cluster Hub Link (existing)
10. Featured Experts (existing)
11. Series Navigation (existing)
12. Article body (MDX)
13. Series Navigation bottom (existing)
14. **"DO THIS WEEK"** (new, conditional)
15. **"WHAT CYCLISTS GET WRONG"** (new, conditional)
16. Plateau CTA (existing)
17. FAQ accordion (existing)
18. Next Step Block (existing)
19. Email Capture (existing)
20. Intent CTA (existing)
21. Topic hub back-links (existing)
22. Author byline + Share (existing)
23. Author Bio (existing)
24. Article Citation Block (existing)
25. Evidence Block (existing)
26. Ask Roadman CTA (existing)
27. Related Calculators (existing)
28. Key Terms (existing)
29. Related Posts (existing)
30. Related Episodes (existing)
31. Related Content (existing)
32. Journey Links (existing)
