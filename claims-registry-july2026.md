# Roadman Cycling Claims Registry — July 2026

**Audit date:** 2026-07-10
**Purpose:** Document every public-facing numerical claim on the site, flag inconsistencies.
**Source of truth:** `src/lib/brand-facts.ts` (BRAND_STATS object)

---

## Summary of Inconsistencies Found

| Severity | Count | Description |
|----------|-------|-------------|
| **CRITICAL** | 2 | Community member count (1,800 vs 2,100); Coaching years ("13 years" is now stale — it is 2026, coaching since 2013 = 13 years, but `FOUNDER.foundedYear` = 2021 is used in one bio) |
| **HIGH** | 3 | YouTube combined subscribers (74K vs 75K in two different places); NDY paid member count (113 hardcoded in 3 places — will go stale); Article count ("170+" hardcoded — actual count is 480+ per session logs) |
| **MEDIUM** | 1 | `expert-reviewers` bio uses `FOUNDER.foundedYear` (2021) for "Coaching since" phrasing, which is technically correct in context but confusing alongside "since 2013" elsewhere |

---

## Detailed Claims Registry

### 1. Podcast Episode Count

| Claim | Value Found | File/Location | Context | Consistent? | Notes |
|-------|-------------|---------------|---------|-------------|-------|
| Canonical value | `1,400+` (episodeCount: 1400) | `src/lib/brand-facts.ts:65-66` | BRAND_STATS source of truth | YES | Canonical |
| Homepage stats bar | `1,400+` | `src/components/features/home/StatsSection.tsx:7` | Hardcoded in stats array | YES | Should reference BRAND_STATS |
| Homepage hero | `1,400+ episodes` | `src/components/features/home/HeroSection.tsx:219` | Hardcoded string | YES | Should reference BRAND_STATS |
| Footer | `1,400+ episodes` | `src/components/layout/Footer.tsx:150` | Hardcoded string | YES | Should reference BRAND_STATS |
| Start-here page | `1,400+ podcast episodes` | `src/app/(content)/start-here/page.tsx:168` | Hardcoded string (appears 4x on page) | YES | Should reference BRAND_STATS |
| About page | `Over 1,400 conversations` | `src/app/(marketing)/about/page.tsx:211,333` | Hardcoded string | YES | |
| Method page | `1,400+ conversations` | `src/app/(method)/method/page.tsx:19,24` | Hardcoded string | YES | |
| Coaching page | `1,400+ conversations` | `src/app/(marketing)/coaching/page.tsx:313,518` | Hardcoded string | YES | |
| Ask page | `1,400+ podcast conversations` | `src/app/(marketing)/ask/page.tsx:13,18,104` | Hardcoded string | YES | |
| Partners page | `1,400+ episodes` | `src/app/(marketing)/partners/page.tsx:118,495` | Hardcoded string | YES | |
| Podcast page | `1,400+ episodes` comment | `src/app/(content)/podcast/page.tsx:123` | Code comment referencing the claim | YES | |
| Offer ladder | `1,400+ podcast episodes` | `src/lib/offer-ladder.ts:87,263` | Hardcoded string | YES | |
| Brand messaging | `1,400+ episodes` | `src/lib/brand-messaging.ts:66,68` | Hardcoded string | YES | |
| ~20 blog posts | `1,400+` / `1,400` | `content/blog/*.mdx` (multiple) | Hardcoded in blog content | YES | Will go stale over time |
| MCP resources | `1,400+ episodes` | `src/lib/mcp/resources.ts:17` | Hardcoded string | YES | |
| Admin API prompts | `1,400+ episodes` | `src/app/api/admin/exploder/*.ts` (3 files) | System prompts | YES | |

**Assessment:** Currently consistent at "1,400+" everywhere. However, nearly all instances are hardcoded strings rather than referencing `BRAND_STATS.episodeCountLabel`. When the count changes, 50+ files will need updating.

---

### 2. Podcast Download Count

| Claim | Value Found | File/Location | Context | Consistent? | Notes |
|-------|-------------|---------------|---------|-------------|-------|
| Canonical value | `100M+` (100,000,000) | `src/lib/brand-facts.ts:80-81` | BRAND_STATS source of truth | YES | Canonical |
| Homepage stats bar | `100M+` | `src/components/features/home/StatsSection.tsx:6` | Hardcoded | YES | |
| Homepage hero | `100M+ downloads` | `src/components/features/home/HeroSection.tsx:215` | Hardcoded | YES | |
| Homepage body | `100M+ DOWNLOADS.` | `src/app/page.tsx:267` | Hardcoded | YES | |
| About page | `100 million` / `100M+` | `src/app/(marketing)/about/page.tsx:27,34,69,218` | Mixed formats | YES | Consistent value, different formatting |
| Method SocialProof | `100 million downloads` | `src/app/(method)/method/_components/sales/SocialProof.tsx:45` | Spelled out | YES | |
| Method SocialProof | `100M+ downloads` | `src/app/(method)/method/_components/sales/SocialProof.tsx:104` | Abbreviated | YES | |
| Method Hero | `100M+` | `src/app/(method)/method/_components/sales/Hero.tsx:60` | Stat display | YES | |
| Partners page | `100M+` (5 instances) | `src/app/(marketing)/partners/page.tsx:21,28,45,121,314` | Various contexts | YES | |
| Press page | `100M+` | `src/app/(marketing)/about/press/page.tsx:30,82,300` | Hardcoded | YES | |
| Podcast page | `100M+ PODCAST DOWNLOADS` | `src/app/(content)/podcast/page.tsx:116` | Hardcoded | YES | |
| Go landing page | `100M+` (4 instances) | `src/app/go/page.tsx:504,620,973` | Hardcoded | YES | |
| Go/ads page | `100M+` (3 instances) | `src/app/go/ads/page.tsx:492,826` | Hardcoded | YES | |
| Sponsor page | `100M+` | `src/app/(marketing)/sponsor/SponsorClientSections.tsx:67` | Hardcoded | YES | |
| Authors | `100M+ podcast downloads` | `src/lib/authors.ts:52` | Hardcoded | YES | |
| Podcast RSS feed | `100M+ downloads` | `src/app/feed/podcast/route.ts:7` | Hardcoded | YES | |
| ~5 blog posts | `100 million` / `100M+` | `content/blog/*.mdx` (multiple) | Hardcoded | YES | |

**Assessment:** Consistent at "100M+" everywhere. Same fragility issue — hardcoded everywhere instead of referencing BRAND_STATS.

---

### 3. Community Member Count (Clubhouse — Free Skool)

| Claim | Value Found | File/Location | Context | Consistent? | Notes |
|-------|-------------|---------------|---------|-------------|-------|
| Canonical value | `1,800+` (1,800) | `src/lib/brand-facts.ts:97-98` | BRAND_STATS source of truth | -- | Canonical |
| Homepage stats bar | `1,800+` | `src/components/features/home/StatsSection.tsx:9` | Hardcoded | YES | Matches canonical |
| PDF reports | `1,800+ members` | `src/lib/paid-reports/pdf/content.ts:233` | Hardcoded | YES | Matches canonical |
| **Community page** | **`2,100+ members`** | **`src/app/(community)/community/page.tsx:113`** | **Hardcoded** | **NO** | **CONFLICT: 2,100 vs canonical 1,800** |
| **Community page** | **`2,100 cyclists`** | **`src/app/(community)/community/page.tsx:117`** | **Hardcoded** | **NO** | **CONFLICT** |
| **Clubhouse page** | **`2,100+`** (4 instances) | **`src/app/(community)/community/clubhouse/page.tsx:10,17,60,132`** | **Meta + body** | **NO** | **CONFLICT: 2,100 vs canonical 1,800** |
| **NextStepBlock** | **`2,100+ riders`** | **`src/components/features/conversion/NextStepBlock.tsx:145`** | **Hardcoded** | **NO** | **CONFLICT** |

**CRITICAL INCONSISTENCY:** The `brand-facts.ts` canonical value says **1,800+**, but the community page and clubhouse page say **2,100+**. The community/clubhouse pages were likely updated more recently than brand-facts.ts. One of these is wrong. The actual Skool count needs to be verified and all values aligned. The existing fact-check report at `scripts/fact-check-report.md` also flagged "2,100+" as UNVERIFIABLE.

---

### 4. NDY (Not Done Yet) Paid Community Member Count

| Claim | Value Found | File/Location | Context | Consistent? | Notes |
|-------|-------------|---------------|---------|-------------|-------|
| PDF reports | `113 serious amateur cyclists` | `src/lib/paid-reports/pdf/content.ts:232,620` | Hardcoded | -- | No canonical source |
| Apply page | `113 riders inside` | `src/app/(community)/apply/PersonalisedDiagnosticBlock.tsx:101` | Hardcoded | YES (with above) | |
| Method SocialProof | `113 in the paid community` | `src/app/(method)/method/_components/sales/SocialProof.tsx:108` | Hardcoded | YES (with above) | |
| Product routing | `100+ serious riders` | `src/lib/diagnostic/product-routing.ts:239` | Rounded down | SOFT YES | Different rounding |

**HIGH RISK:** "113" is hardcoded in 3 public-facing locations with no canonical source in BRAND_STATS. This number will go stale quickly as members join/leave. Should be added to brand-facts.ts.

---

### 5. Article/Post Count

| Claim | Value Found | File/Location | Context | Consistent? | Notes |
|-------|-------------|---------------|---------|-------------|-------|
| **Start-here page** | **`170+ articles`** | **`src/app/(content)/start-here/page.tsx:138,168`** | **Hardcoded** | **NO** | **STALE: actual count is 480+ per session logs** |
| **NextStepBlock** | **`170+ articles`** | **`src/components/features/conversion/NextStepBlock.tsx:173`** | **Hardcoded** | **NO** | **STALE** |
| llms.txt | `${posts.length} articles` | `src/app/llms.txt/route.ts:199` | Dynamic | YES | Correctly uses live count |
| blog-images.ts comment | `133 of 170 posts` | `src/lib/blog-images.ts:14` | Code comment from April audit | N/A | Internal comment, not public |

**HIGH INCONSISTENCY:** "170+ articles" was accurate months ago but the site now has 480+ blog posts. The llms.txt route correctly uses `posts.length` dynamically. The hardcoded "170+" in start-here and NextStepBlock is severely out of date.

---

### 6. Newsletter Subscriber Count

| Claim | Value Found | File/Location | Context | Consistent? | Notes |
|-------|-------------|---------------|---------|-------------|-------|
| Canonical value | `30,000+` (30,000) | `src/lib/brand-facts.ts:92-94` | BRAND_STATS source of truth | YES | Canonical |
| Homepage stats bar | `30,000+` | `src/components/features/home/StatsSection.tsx:8` | Hardcoded | YES | |
| Homepage hero | `30,000+ newsletter` | `src/components/features/home/HeroSection.tsx:217` | Hardcoded | YES | |
| Newsletter page | `30,000+ cyclists` | `src/app/(marketing)/newsletter/page.tsx:79` | Hardcoded | YES | |
| Partners page | `30,000+` (3 instances) | `src/app/(marketing)/partners/page.tsx:138,140,314` | Hardcoded | YES | |
| Sponsor calculator | `30,000+ inboxes` | `src/app/(marketing)/sponsor/SponsorClientSections.tsx:67` | Hardcoded | YES | |
| Method SocialProof | `30,000+ on the newsletter` | `src/app/(method)/method/_components/sales/SocialProof.tsx:110` | Hardcoded | YES | |
| Plateau page | `over 30,000 cyclists` | `src/app/(marketing)/plateau/page.tsx:338` | Hardcoded | YES | |
| Against the Clock | `30,000+ subscribers` | `src/app/(marketing)/against-the-clock/partner/page.tsx:188` | Hardcoded | YES | |

**Assessment:** Consistent at "30,000+" everywhere. brand-facts.ts notes this is "especially volatile" — should be checked against live Beehiiv count.

---

### 7. YouTube Subscriber Count

| Claim | Value Found | File/Location | Context | Consistent? | Notes |
|-------|-------------|---------------|---------|-------------|-------|
| Canonical (main) | `61,000+` (61,000) | `src/lib/brand-facts.ts:85-86` | BRAND_STATS source of truth | YES | Canonical — main channel only |
| Method SocialProof | `61K+ YouTube subscribers` | `src/app/(method)/method/_components/sales/SocialProof.tsx:106` | Hardcoded | YES | |
| Press page | `61,000+` | `src/app/(marketing)/about/press/page.tsx:47` | Hardcoded | YES | |
| Go page | `BRAND_STATS.youtubeSubscribersLabel` | `src/app/go/page.tsx:633` (3 instances) | Dynamic | YES | Correctly references canonical |
| **Partners page** | **`74K+ subscribers combined`** | **`src/app/(marketing)/partners/page.tsx:59`** | **Hardcoded** | **INCONSISTENT** | **Claims 74K combined (main + clips)** |
| **MCP resources** | **`75K combined subscribers`** | **`src/lib/mcp/resources.ts:18`** | **Hardcoded** | **INCONSISTENT** | **Claims 75K combined — conflicts with 74K on partners page** |
| brand-facts.ts comment | `~13.2K` clips channel | `src/lib/brand-facts.ts:83` | Code comment | -- | 61K + 13.2K = 74.2K, so 74K is correct and 75K is wrong |

**INCONSISTENCY:** Partners page says "74K+ combined" while MCP resources says "75K combined." Based on the brand-facts.ts comment (61K main + ~13.2K clips = 74.2K), "74K+" is correct and "75K" is rounded up too aggressively. Neither figure is in BRAND_STATS.

---

### 8. Newsletter Open Rate

| Claim | Value Found | File/Location | Context | Consistent? | Notes |
|-------|-------------|---------------|---------|-------------|-------|
| Canonical value | `65%+` | `src/lib/brand-facts.ts:95` | BRAND_STATS source of truth | YES | Canonical |
| Partners page | `65%+ open rate` | `src/app/(marketing)/partners/page.tsx:108,138,141` | Hardcoded | YES | |
| Sponsor calculator | `65% open rate` | `src/app/(marketing)/sponsor/SponsorClientSections.tsx:67` | Hardcoded | YES | Missing "+" |
| Plateau page | `65%+ open rate` | `src/app/(marketing)/plateau/page.tsx:338` | Hardcoded | YES | |
| Against the Clock | `65%+ open rate` | `src/app/(marketing)/against-the-clock/partner/page.tsx:82` | Hardcoded | YES | |

**Assessment:** Consistent. Should be verified against live Beehiiv analytics.

---

### 9. Instagram Followers

| Claim | Value Found | File/Location | Context | Consistent? | Notes |
|-------|-------------|---------------|---------|-------------|-------|
| Canonical value | `49,000+` (49,000) | `src/lib/brand-facts.ts:88-89` | BRAND_STATS source of truth | YES | Canonical |
| Facts page | `BRAND_STATS.instagramFollowersLabel` | `src/app/(marketing)/facts/page.tsx:69` | Dynamic | YES | |
| Against the Clock | `BRAND_STATS.instagramFollowersLabel` | `src/app/(marketing)/against-the-clock/partner/page.tsx:85` | Dynamic | YES | |

**Assessment:** Consistent and mostly dynamic references. Good pattern.

---

### 10. Coaching Results / Testimonials

| Claim | Value Found | File/Location | Context | Consistent? | Notes |
|-------|-------------|---------------|---------|-------------|-------|
| FTP +90w | `FTP +90w` | `src/app/go/page.tsx:140` | Damien Maloney testimonial | -- | Individual result |
| +43 WATTS | `+43 WATTS` | `src/app/masters-report/page.tsx:51` | Masters report stat | -- | Individual result |
| Cat 3 to Cat 1 | `Cat 3 → Cat 1` | `src/app/go/page.tsx:149`, `src/lib/testimonials.ts:77`, and ~25 more locations | Daniel Stone case study | YES | Consistently attributed |
| Cat 3 to Cat 1 timeline | `14 months` | `src/lib/questions.ts:1039,1051`, `src/app/llms.txt/route.ts:115` | Case study detail | -- | |
| Cat 3 to Cat 1 timeline | `One season` / `one coached season` | `src/lib/testimonials.ts:77,79`, `src/lib/case-studies.ts:388,394` | Same person, different framing | **SOFT CONFLICT** | "14 months" vs "one season" — seasons are typically ~8 months |
| Body fat 20% to 7% | `20% → 7%` | `src/app/go/page.tsx:158`, `src/app/page.tsx:497` | Chris O'Connor result | YES | Consistent |
| +15% FTP for masters | `+15% FTP` | `src/app/llms-full.txt/route.ts:232` | "Typical results" claim | -- | Only appears once; verify if this is substantiated |

**Assessment:** Individual results are consistently attributed. The "Cat 3 to Cat 1 in 14 months" vs "one season" framing is a soft inconsistency — 14 months spans more than one racing season.

---

### 11. Searchable Episode Pages

| Claim | Value Found | File/Location | Context | Consistent? | Notes |
|-------|-------------|---------------|---------|-------------|-------|
| Canonical value | `810+` (actual: 814) | `src/lib/brand-facts.ts:75-76` | BRAND_STATS source of truth | YES | Canonical |
| Entity pages | `BRAND_STATS.searchableEpisodePagesLabel` | Various entity pages | Dynamic | YES | Correctly references canonical |
| Facts page | `BRAND_STATS.searchableEpisodePagesLabel` | `src/app/(marketing)/facts/page.tsx:84` | Dynamic | YES | |

**Assessment:** Consistent. Good use of dynamic references. The actual count (814) is slightly above the label (810+), which is acceptable rounding.

---

### 12. Coaching Years / Founded Date

| Claim | Value Found | File/Location | Context | Consistent? | Notes |
|-------|-------------|---------------|---------|-------------|-------|
| Brand founded | `2021` | `src/lib/brand-facts.ts:29` | FOUNDER.foundedYear | YES | Canonical |
| Coaching since | `2013` | `src/lib/brand-facts.ts:48` | BRAND.coachingSince | YES | Canonical |
| Brand messaging | `13 years coaching` | `src/lib/brand-messaging.ts:66` | Hardcoded string | **STALE** | 2026 - 2013 = 13 years, correct now but will go stale in 2027 |
| Expert reviewers | `Coaching since ${FOUNDER.foundedYear}` | `src/app/(marketing)/about/expert-reviewers/page.tsx:49` | Dynamic, but uses wrong constant | **CONFUSING** | Uses `FOUNDER.foundedYear` (2021) in "Coaching since" phrasing, then clarifies "continuously since 2013" |
| Homepage schema | `coaching since 2013` | `src/app/page.tsx:716` | Hardcoded | YES | |

**Assessment:** The two dates (2021 brand founding, 2013 coaching start) are correct but the expert-reviewers page says "Coaching cyclists since 2021" (via `FOUNDER.foundedYear`) before clarifying "continuously since 2013." This is technically accurate but reads oddly. The "13 years" in brand-messaging.ts should be made dynamic.

---

### 13. Video Episodes (YouTube)

| Claim | Value Found | File/Location | Context | Consistent? | Notes |
|-------|-------------|---------------|---------|-------------|-------|
| Canonical value | `311+` (311) | `src/lib/brand-facts.ts:70-71` | BRAND_STATS source of truth | YES | Canonical |
| MCP resources | `311+ on YouTube video` | `src/lib/mcp/resources.ts:17` | Hardcoded | YES | |

**Assessment:** Consistent but only referenced in 2 places.

---

## Structural Recommendations

### 1. CRITICAL: Resolve community member count (1,800 vs 2,100)
The community page and clubhouse page use 2,100+. brand-facts.ts and the homepage use 1,800+. Check the actual Skool member count and align everything to one number.

### 2. HIGH: Update article count from "170+" to actual
The site now has 480+ blog posts. "170+ articles" in start-here and NextStepBlock is severely outdated. Either make it dynamic (like llms.txt does with `posts.length`) or update to the current number.

### 3. HIGH: Add NDY member count to brand-facts.ts
"113" is hardcoded in 3 public-facing places with no canonical source. Add a `ndyMembers` field to BRAND_STATS to prevent drift.

### 4. HIGH: Fix YouTube combined subscriber discrepancy
Partners page says 74K+, MCP resources says 75K. Align to the correct figure based on actual channel stats.

### 5. MEDIUM: Centralise hardcoded claims
Nearly all of the 50+ instances of "1,400+" are hardcoded strings. When the episode count changes, every file needs manual updating. Consider creating a shared component or using BRAND_STATS references more broadly. The same applies to "100M+" (30+ hardcoded instances) and "30,000+" (10+ instances).

### 6. LOW: Make coaching years dynamic
"13 years" in brand-messaging.ts is correct for 2026 but will be wrong in 2027. Use `new Date().getFullYear() - BRAND.coachingSince` or similar.

---

## Files to Fix (Priority Order)

1. `src/lib/brand-facts.ts` — Update `communityMembersLabel` to match reality (1,800 or 2,100?)
2. `src/app/(community)/community/page.tsx` — Align member count to brand-facts.ts
3. `src/app/(community)/community/clubhouse/page.tsx` — Align member count (4 instances)
4. `src/components/features/conversion/NextStepBlock.tsx` — Fix "170+ articles" AND "2,100+ riders"
5. `src/app/(content)/start-here/page.tsx` — Fix "170+ articles" (2 instances)
6. `src/lib/paid-reports/pdf/content.ts` — Add NDY count to brand-facts, reference it
7. `src/app/(community)/apply/PersonalisedDiagnosticBlock.tsx` — Reference brand-facts for NDY count
8. `src/app/(method)/method/_components/sales/SocialProof.tsx` — Reference brand-facts for NDY count
9. `src/app/(marketing)/partners/page.tsx:59` — Fix "74K+" to match MCP resources or vice versa
10. `src/lib/mcp/resources.ts:18` — Fix "75K" to match actual (74K)
