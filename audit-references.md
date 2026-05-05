# Reference & Citation Accuracy Audit — Roadman Cycling

**Date:** 3 May 2026
**Scope:** 276 blog posts (`content/blog/`), coaching page (`coaching-page.html`), marketing pages, topic hubs, entity files, and supporting code.
**Auditor:** Automated + web-verified

---

## CRITICAL — Must Fix

### C-01: Dan Lorang falsely credited as coach of Pogačar and Vingegaard

Dan Lorang has **never coached Tadej Pogačar or Jonas Vingegaard**. Pogačar rides for UAE Team Emirates (coached by Joxean Fernández Matxín, then Javier Sola from 2025). Vingegaard rides for Visma–Lease a Bike (coached by Grischa Niermann / Tim Heemskerk). Lorang was Head of Performance at Red Bull–Bora–Hansgrohe, coaching riders like Remco Evenepoel — a different team entirely. This error appears in **multiple files**:

| File | Line | Text |
|------|------|------|
| `content/blog/vo2-max-workouts-cyclists-over-40.mdx` | 87 | `role: Head coach, BORA-hansgrohe; coached Pogačar and Vingegaard` |
| `content/blog/cycling-training-plan-masters-over-40.mdx` | 85 | `role: Head coach, BORA-hansgrohe; coached Pogačar and Vingegaard` |
| `content/blog/zone-2-cycling-heart-rate-vs-power-vs-rpe.mdx` | 82 | `role: Head coach, BORA-hansgrohe; coached Pogačar and Vingegaard` |
| `content/blog/what-dan-lorang-says-about-endurance.mdx` | 4 | `seoDescription: 'Dan Lorang — coach to Pogačar, Vingegaard and triathlon world champions...'` |
| `content/topics/ftp-training.mdx` | 176 | `**Dan Lorang** (coached Pogacar, former Red Bull–Bora–Hansgrohe)` |
| `src/lib/coaching-segments.ts` | 101 | `"the work coaches like Dan Lorang do with Vingegaard and Pogacar"` |
| `src/app/api/admin/exploder/generate/route.ts` | 22, 74 | `"Dan Lorang — the guy who coached Pogacar"` / `"coached Pogacar and Vingegaard"` |
| `src/app/api/admin/exploder/fact-check/route.ts` | 23 | `Dan Lorang: coached Tadej Pogacar (UAE Team Emirates) and Jonas Vingegaard (Visma-Lease a Bike)` |

**Note:** The entity file (`content/entities/dan-lorang.mdx`, line 4) uses softer language — "Coached at the level Pogacar and Vingegaard race at" — which is technically defensible but misleading when the blog frontmatter directly claims he coached them.

**Recommended fix:** Replace all instances with accurate attribution, e.g. "Head of Performance, Red Bull–Bora–Hansgrohe; coached Remco Evenepoel, Jan Frodeno, Anne Haug, Lucy Charles-Barclay."

### C-02: Dan Lorang title inconsistency — "Head coach" vs "Head of Performance"

Lorang's actual title at Red Bull–Bora–Hansgrohe was **"Head of Performance"** (confirmed via team press releases and LinkedIn). Several blog files use the incorrect title **"Head coach, BORA-hansgrohe"**:

| File | Line |
|------|------|
| `content/blog/vo2-max-workouts-cyclists-over-40.mdx` | 87 |
| `content/blog/cycling-training-plan-masters-over-40.mdx` | 85 |
| `content/blog/zone-2-cycling-heart-rate-vs-power-vs-rpe.mdx` | 82 |

Other files correctly use "Head of Performance, Red Bull–Bora-Hansgrohe" — this should be standardised across the site.

### C-03: Fact-check route hardcodes the false Lorang/Pogačar claim

The server-side fact-check system (`src/app/api/admin/exploder/fact-check/route.ts`, line 23) includes as a "fact": `Dan Lorang: coached Tadej Pogacar (UAE Team Emirates) and Jonas Vingegaard (Visma-Lease a Bike)`. This means auto-generated content may propagate this error into new articles. The generate route (`src/app/api/admin/exploder/generate/route.ts`, lines 22 and 74) also embeds this false claim as a style example.

---

## WARNING — Should Fix

### W-01: Coaching page testimonial — "20% body fat → 7%" (Chris O'Connor)

`coaching-page.html` (rendered HTML, "Real Results" section) states: `Chris O'Connor · Ireland · 20% body fat → 7%`. A body fat of 7% is extremely low — competitive bodybuilders on stage typically sit at 5–8%. For an amateur cyclist, 7% would be unusual and potentially unhealthy to maintain. The corresponding case study article (`content/blog/cycling-coaching-results-before-and-after.mdx`) mentions the 16kg weight loss (84kg → 68kg) but does **not** claim 7% body fat. If the 7% figure is accurate, it warrants clinical context; if not, it should be corrected.

### W-02: Brian Smith title — "sports director" at MTN-Qhubeka

`content/blog/brian-smith-suffering-coaching-roadman-podcast.mdx`, line ~112: Claims Brian Smith was "former MTN-Qhubeka sports director." Per public records, Smith was appointed **General Manager** (interim) at MTN-Qhubeka in 2014. His directeur sportif role was at **Endura Racing** (the predecessor team). The distinction matters for credibility — "sports director" and "general manager" are different roles.

### W-03: Wikipedia link for Brian Smith has broken markdown syntax

`content/blog/brian-smith-suffering-coaching-roadman-podcast.mdx`, line 112: The link `[Brian Smith](https://en.wikipedia.org/wiki/Brian_Smith_(cyclist))` will break in markdown because the URL contains parentheses. The closing `)` of `(cyclist)` is interpreted as the end of the markdown link. Should be encoded as `Brian_Smith_%28cyclist%29`.

### W-04: Vague expert attribution — "multiple interviews" / "repeated framing"

Several posts attribute claims to experts with phrases like "Dan Lorang has been explicit in multiple interviews" or "Seiler's repeated framing across Roadman appearances" without citing specific episode numbers or dates. While not factually wrong, this makes claims harder to verify and weakens editorial credibility. Key files:

| File | Line | Issue |
|------|------|-------|
| `content/blog/steady-state-vs-interval-training-cycling.mdx` | ~113 | "Dan Lorang has been explicit in multiple interviews" — no episodes cited |
| `content/blog/what-dan-lorang-says-about-endurance.mdx` | 86–143 | `citedClaims` with `evidenceSource` as "Lorang's repeated framing across Roadman appearances" — no episode IDs |
| `content/blog/what-stephen-seiler-says-about-polarised-training.mdx` | 100–143 | `citedClaims` with `evidenceSource` as "Seiler's analysis of elite intensity distribution" — no specific paper |
| `content/blog/vasilis-anastopoulos-cavendish-sprint-training.mdx` | ~165 | "Joe Friel has made this point consistently across his writing and coaching career" — no specific citation |

### W-05: "1 million monthly listeners" — unverified marketing claim

The claim "over 1 million monthly listeners" appears in:

- `coaching-page.html` (JSON-LD schema: "1M+ monthly listeners across 18 countries")
- `content/blog/how-we-record-the-roadman-podcast.mdx` (lines 30, 81)
- `content/blog/fast-talk-vs-cycling-podcast-vs-roadman.mdx` (line 147)

This is a business metric that cannot be independently verified. If accurate, consider adding a "verified by [platform]" qualifier or a date stamp. If approximate, use qualifying language ("approaching one million" or "roughly one million").

### W-06: Draft article title — "Is This the End of TrainingPeaks?"

`content/drafts/companion/companion-ep-2049-team-jayco-s-secret-ai-tech-is-this-the-end-of-trainingpeaks.mdx` — This draft's title and description frame TrainingPeaks as potentially obsolete ("could replace TrainingPeaks' dominance"). Given TrainingPeaks is described as a partner (coaching delivered via TrainingPeaks, per `coaching-page.html` JSON-LD schema), publishing this article as-is could damage the partner relationship. The body content is balanced, but the headline is provocative.

### W-07: Stephen Seiler quote may be paraphrased, not direct

`content/blog/zone-2-training-complete-guide.mdx`, line ~92: A quote in quotation marks attributed to Professor Stephen Seiler ("The athletes who perform best over a career are the ones who are disciplined enough to keep the easy days genuinely easy...") reads as a paraphrase of his research position rather than a verified direct quote. If this is a direct transcript from a podcast episode, cite the episode. If paraphrased, remove quotation marks.

### W-08: Dan Lorang departure status needs temporal context

Multiple files describe Dan Lorang as "Head of Performance at Red Bull–Bora–Hansgrohe" in present tense. Per official team announcements (redbullborahansgrohe.com), Lorang announced he will leave after the 2026 Tour de France. Files written before this announcement are fine historically, but new content and the entity file should note the departure. Key file: `content/entities/dan-lorang.mdx` (line 4) still describes him with present-tense language.

---

## NOTE — Low Priority / Informational

### N-01: External links are well-maintained

105 unique external URLs were found across blog content. The vast majority (80+) are PubMed links to peer-reviewed studies, properly formatted with correct PMIDs. A smaller set link to Wikipedia, YouTube (own channel), doi.org, and PMC. Only 5 non-academic external domains were found:

- `trainingpeaks.com` — partner site, links functional
- `redbullborahansgrohe.com` — team site, specific article link
- `skool.com/roadmancycling` — own community
- `thebms.org.uk` — British Menopause Society
- `sportsci.org` — sports science resource

No broken external domains detected. No suspicious or misspelled domains. No hidden affiliate tracking parameters found.

### N-02: TrainingPeaks references — overwhelmingly positive/neutral

108 files across the codebase mention TrainingPeaks. All published blog references are **neutral-to-positive**, consistently framing TrainingPeaks as:

- A standard coaching delivery platform ("Personalised TrainingPeaks plans")
- A professional tool for structured workouts and load tracking (ATL/CTL/PMC)
- A credential qualifier ("TrainingPeaks Level 2")

No negative or dismissive mentions were found in published content. The one draft with a provocative headline (W-06 above) is the only potential concern.

### N-03: Coaching page schema claims "Course" type

`coaching-page.html` JSON-LD includes a `Course` schema type for the coaching service. Coaching is arguably a `Service`, not a `Course`. Google may not penalise this, but it's a schema accuracy note. Both `Service` and `Course` schemas are present — consider removing the `Course` one if coaching is not a structured educational programme with a defined curriculum and completion certificate.

### N-04: "1,400+ podcast conversations" is conservative

The claim "1,400+ expert podcast conversations" appears across ~15 blog posts and the coaching page. Episode numbering in the repo goes up to ep-2536, with 310+ episodes indexed. The "1,400+" figure appears to be a rounded-down number from a legitimate episode count. Not inaccurate, but could be updated to reflect growth (2,000+ or 2,500+ depending on how episodes are counted).

### N-05: Alan Murchison — "Michelin star at L'Ortolan from 2003 to 2014"

`content/blog/alan-murchison-michelin-star-chef-cycling-nutrition.mdx`, lines 31–36: Claims Murchison "held a Michelin star at L'Ortolan in Berkshire from 2003 to 2014." Wikipedia confirms he resigned from L'Ortolan in 2014 and the restaurant held a Michelin star during his tenure. The "from 2003" start date could not be independently verified from web sources — the restaurant opened in 2003 under his leadership, but the Michelin star may have been awarded in a later year. Minor point — consider verifying the exact year the star was awarded.

### N-06: Alistair Brownlee claim verified accurate

`content/blog/alistair-brownlee-endurance-lessons.mdx`: Claims "two-time Olympic triathlon gold medallist (London 2012, Rio 2016)." Verified correct via Olympics.com — Brownlee is the only athlete to hold two Olympic individual triathlon titles.

### N-07: Greg LeMond claims verified accurate

`content/blog/greg-lemond-interview-roadman-podcast.mdx`: Claims "3× Tour de France champion" (1986, 1989, 1990), the 1989 8-second margin, the shooting incident with "37 pellets permanently lodged," and LeMond as an early challenger of doping culture. All historically verified and accurate.

### N-08: Paris-Roubaix 2026 article is accurate

`content/blog/why-cycling-needed-wout-to-win-roubaix.mdx`: States "Wout van Aert won Paris-Roubaix 2026, outsprinting Tadej Pogačar." Verified correct — Van Aert won the sprint finish on 12 April 2026.

### N-09: Dan Bigham — "Former Hour Record holder" is technically accurate

Multiple files describe Dan Bigham as "Former UCI Hour Record holder." He held the record from 19 August 2022 (55.548 km) until Filippo Ganna broke it on 8 October 2022 (56.792 km). "Former" is correct. His current role as "Head of Engineering at Red Bull–Bora–Hansgrohe" (per Wikipedia) is consistent with site references.

### N-10: Academic citations are well-sourced

The site cites 80+ PubMed-indexed papers across blog content with correct PMID links. Frequently cited researchers include:

- Seiler & Kjerland (2006) — PMID 16430681
- Seiler (2010) — PMID 20861519
- Jeukendrup (2014) — PMID 24791919
- Stöggl & Sperlich (2014) — PMID 24550842
- Rønnestad & Mujika (2014) — PMID 23914932
- Burke et al. (2017, 2020)
- San-Millán & Brooks (2018) — PMID 28623613

All spot-checked PMIDs resolve to the correct papers. This is above-average editorial rigour for a cycling media brand.

---

## Summary

| Severity | Count | Key Theme |
|----------|-------|-----------|
| **Critical** | 3 | Dan Lorang falsely credited as coaching Pogačar/Vingegaard; wrong title; error baked into auto-generation system |
| **Warning** | 8 | Unverified testimonial metric (7% body fat), imprecise job titles, vague expert attribution, partner-sensitive draft, paraphrased quotes in quotation marks |
| **Note** | 10 | Informational — verified claims, minor schema issues, conservative podcast count |

**Overall assessment:** The site demonstrates strong editorial discipline with extensive peer-reviewed citations, properly attributed expert sources, and accurate historical claims. The critical issue — Dan Lorang being falsely credited as coach of Pogačar and Vingegaard — is the standout problem and appears in 8+ files including the auto-generation system, meaning it will propagate into future content unless fixed at the source.
