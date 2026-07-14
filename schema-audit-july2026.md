# Schema Markup Audit -- July 2026

_Last run: 2026-07-10. Scope: Complete inventory of all JSON-LD structured data across the Roadman Cycling codebase. Audit-only -- no code changes made._

---

## Executive Summary

The site's structured data implementation is **significantly ahead of most cycling/coaching sites**. There are 11 reusable schema components in `src/components/seo/`, used across 90+ pages. The sitewide `@graph` correctly connects Organization, WebSite, Person, and PodcastSeries with stable `@id` anchors. Every content page emits at least a BreadcrumbList.

The dominance audit's 10 recommended schema types are **all implemented**. The gaps are in consistency, depth, and a few high-value types that would strengthen the entity graph for AI search engines.

---

## 1. What Currently Exists

### 1.1 Sitewide Schema (root layout)

| Schema Type | Component | Location | Status |
|---|---|---|---|
| Organization | `OrganizationJsonLd` | `src/app/layout.tsx` | Full. name, legalName, alternateName, logo (ImageObject), foundingDate, foundingLocation, sameAs (11 URLs inc. Wikidata Q140139864), contactPoint, knowsAbout (8 topics), founder -> Person @id |
| WebSite + SearchAction | `OrganizationJsonLd` | `src/app/layout.tsx` | Full. potentialAction with SearchAction + EntryPoint template `/search?q={search_term_string}`, publisher -> Organization @id |
| Person (Anthony Walsh) | `OrganizationJsonLd` | `src/app/layout.tsx` | Full. jobTitle, sameAs (6 URLs inc. Wikidata Q140138269), knowsAbout, worksFor -> Organization @id |
| PodcastSeries | `OrganizationJsonLd` | `src/app/layout.tsx` | Full. webFeed (RSS), sameAs (6 URLs inc. Wikidata Q140138232), author -> Person @id, publisher -> Organization @id |
| BreadcrumbList | `RouteBreadcrumbJsonLd` | `src/app/layout.tsx` | Auto-generated from pathname. Skips 30+ route patterns where pages emit their own richer breadcrumb. 37 segment labels mapped. |

**Cross-reference architecture:** All entities linked via 4 stable `@id` anchors defined in `src/lib/brand-facts.ts`:
- `https://roadmancycling.com/#organization`
- `https://roadmancycling.com/#website`
- `https://roadmancycling.com/#podcast`
- `https://roadmancycling.com/author/anthony-walsh#person`

### 1.2 Reusable Schema Components

| Component | File | Schema Type(s) | Used By |
|---|---|---|---|
| `JsonLd` | `src/components/seo/JsonLd.tsx` | Base renderer | All pages |
| `OrganizationJsonLd` | `src/components/seo/JsonLd.tsx` | Organization + WebSite + Person + PodcastSeries (@graph) | Root layout |
| `ArticleJsonLd` | `src/components/seo/JsonLd.tsx` | Article | Blog, answers |
| `FAQPageJsonLd` | `src/components/seo/JsonLd.tsx` | FAQPage | Various |
| `BreadcrumbJsonLd` | `src/components/seo/JsonLd.tsx` | BreadcrumbList | Various |
| `PodcastEpisodeJsonLd` | `src/components/seo/JsonLd.tsx` | PodcastEpisode | Podcast episodes (simple) |
| `FAQSchema` | `src/components/seo/FAQSchema.tsx` | FAQPage | Tools, coaching, events, etc. |
| `BreadcrumbSchema` | `src/components/seo/BreadcrumbSchema.tsx` | BreadcrumbList (auto-prepends Home) | Various |
| `HowToSchema` | `src/components/seo/HowToSchema.tsx` | HowTo | Tools, training plans |
| `SoftwareApplicationSchema` | `src/components/seo/SoftwareApplicationSchema.tsx` | WebApplication | Tools, Race Predictor |
| `PodcastEpisodeSchema` | `src/components/seo/PodcastEpisodeSchema.tsx` | PodcastEpisode (rich: Spotify, guest) | Podcast episodes (rich) |
| `ClaimReviewSchema` | `src/components/seo/ClaimReviewSchema.tsx` | ClaimReview (@graph) | Blog posts (conditional) |
| `RouteBreadcrumbJsonLd` | `src/components/seo/RouteBreadcrumbJsonLd.tsx` | BreadcrumbList (auto, client-side) | Root layout fallback |
| `ArticleCitationBlock` | `src/components/seo/ArticleCitationBlock.tsx` | Article (HTML microdata, not JSON-LD) | Blog citation blocks |
| `ToolSchemas` | `src/components/seo/ToolSchemas.tsx` | WebApplication + HowTo + BreadcrumbList + FAQPage (composite) | Tool layout pages |
| `MethodCourseJsonLd` | `src/app/(method)/method/_components/MethodCourseJsonLd.tsx` | Course + CourseInstance + sub-Course + Offer + Schedule | Method course page |

### 1.3 Per-Page Schema Inventory

#### Content Pages

| Route | Schema Types | Notable Fields |
|---|---|---|
| `/blog/[slug]` | BlogPosting, BreadcrumbList, FAQPage (cond.), ClaimReview (cond.), HowTo (cond.) | mentions (Person + PodcastEpisode), citations, speakable, isPartOf topic graph, about Thing nodes |
| `/podcast/[slug]` | PodcastEpisode, BreadcrumbList, VideoObject (cond.), Quotation @graph (cond.), FAQPage (cond.) | AudioObject, Clip/hasPart, full transcript, guest Person with sameAs/knowsAbout |
| `/podcast` | PodcastSeries, ItemList (top 20), BreadcrumbList | numberOfEpisodes, webFeed |
| `/answers/[slug]` | Article, FAQPage (cond.), BreadcrumbList | isPartOf (topic @ids), mentions (experts + episodes), speakable |
| `/glossary/[slug]` | DefinedTerm, WebPage (with speakable), BreadcrumbList | inDefinedTermSet -> DefinedTermSet @id |
| `/question/[slug]` | QAPage, WebPage, FAQPage (cond.), BreadcrumbList | acceptedAnswer, speakable |
| `/compare/[slug]` | Article, ItemList, FAQPage, BreadcrumbList | about (2 Thing nodes), verdictWinner ordering, speakable |
| `/problem/[slug]` | WebPage, QAPage, BreadcrumbList | Citation to expert evidence |
| `/topics/[slug]` | @graph: CollectionPage + Thing, BreadcrumbList, FAQPage (cond.) | hasPart (BlogPosting refs), sameAs, speakable |
| `/pillars/[slug]` | @graph: CollectionPage, BreadcrumbList | hasPart (up to 10 BlogPosting refs), speakable |
| `/event/[slug]` | Article + SportsEvent (in about), FAQPage, BreadcrumbList | nextAnnualStartDate, location |
| `/experts/[expertSlug]` | ProfilePage + Person, BreadcrumbList | sameAs, knowsAbout, worksFor |
| `/experts/[expertSlug]/[topicSlug]` | ProfilePage + Person, FAQPage, BreadcrumbList | Expert-topic intersection |
| `/guests/[slug]` | ProfilePage + Person, BreadcrumbList | sameAs, worksFor, hasOccupation, memberOf, subjectOf (PodcastEpisode array) |
| `/benchmarks` | Dataset, Article, BreadcrumbList | variableMeasured (5), CC-BY-4.0 license, DataDownload distribution |
| `/plan/[event]` | CollectionPage, Course + CourseInstance[], FAQSchema, BreadcrumbList | about SportsEvent, hasCourseInstance per phase, speakable |
| `/plan/[event]/[weeksOut]` | HowTo, FAQSchema, BreadcrumbList | totalTime ISO duration, supply, HowToStep array |
| `/predict/[slug]` (landing) | BreadcrumbList, SoftwareApplication, SportsActivityLocation, FAQPage | 2 Offers (free + $29 premium), containedInPlace |
| `/predict` (layout) | SoftwareApplicationSchema, BreadcrumbList | Race Predictor tool schema |

#### Marketing Pages

| Route | Schema Types | Notable Fields |
|---|---|---|
| `/` (homepage) | @graph: WebPage + 2x ItemList + FAQPage | Pillars ItemList, Tools ItemList, 6 brand Q&As |
| `/coaching` | Service, Course + CourseInstance, BreadcrumbList, FAQSchema | Offer $195 USD, areaServed (IE, UK, US) |
| `/coaching/[location]` | Service (localized), FAQSchema, BreadcrumbList | Location-specific |
| `/coaching/triathletes` | Service, FAQSchema, BreadcrumbList | Triathlon-specific |
| `/training-camps` | CollectionPage, BreadcrumbList, @graph: Event[] + TouristTrip[] | Offers in EUR, GeoCoordinates, itineraries |
| `/training-camps` (CampDetail) | Event, TouristTrip, FAQPageJsonLd, BreadcrumbList | PostalAddress, maximumAttendeeCapacity |
| `/races/[slug]` | SportsEvent (cond.), BreadcrumbList | nextAnnualStartDate, sport="Cycling" |
| `/races` | CollectionPage, BreadcrumbList | numberOfItems, ListItem per race |
| `/inner-circle` | Service, FAQSchema, BreadcrumbList | Offer $525/mo |
| `/training-plans` | CollectionPage, FAQSchema, BreadcrumbList | Training plan hub |
| `/tour-de-france` | SportsEvent, BreadcrumbList | 21 subEvent SportsEvents (all stages) |
| `/tour-de-france/stage/[number]` | SportsEvent, BreadcrumbList | superEvent -> parent TdF, start/finish locations |
| `/about` | ProfilePage + Person, BreadcrumbList | mentions (12 expert Persons) |
| `/method` | Course + CourseInstance + sub-Course[], Offer, Schedule | 12 modules, instructor, educationalLevel |

#### Entity Pages

| Route | Schema Types | Notable Fields |
|---|---|---|
| `/entity/anthony-walsh` | ProfilePage + Person | Full: sameAs, knowsAbout, worksFor, Wikidata |
| `/entity/roadman-cycling` | AboutPage + Organization | Full: sameAs, founder, foundingDate, logo |
| `/entity/roadman-podcast` | AboutPage + PodcastSeries | numberOfEpisodes, webFeed, sameAs |
| `/entity/not-done-yet` | AboutPage + Service | 2 Offers ($195/mo, $1,950/yr) |
| `/entity/roadman-method` | AboutPage + DefinedTerm | subjectOf CreativeWork |
| `/entity/against-the-clock` | AboutPage + CreativeWorkSeries | sameAs to 4 Wikipedia articles, hasPart Article |
| `/entity/ask-roadman` | AboutPage + WebApplication | EducationalApplication category, free |
| `/entity/[slug]` (dynamic) | ProfilePage + Person | From MDX frontmatter, subjectOf PodcastEpisode[] |

### 1.4 Additional Schema Features

| Feature | Where | Details |
|---|---|---|
| Speakable | Blog, questions, comparisons, answers, topics, benchmarks, plans | SpeakableSpecification targeting `h1`, `.short-answer`, `.answer-capsule`, `.verdict-block` |
| ClaimReview | Blog posts (conditional) | Myth-busting articles with rated claims, 1-5 scale |
| Quotation | Podcast episodes (conditional) | @graph of Quotation nodes from keyQuotes |
| Microdata | ArticleCitationBlock | HTML microdata (itemScope/itemProp) for citation aid |
| knowledge-graph.json | `/knowledge-graph.json/route.ts` | Custom property-graph API (nodes+edges), not JSON-LD but serves connected entity data |

---

## 2. Audit vs Dominance Audit Requirements

| Recommended Type | Status | Coverage | Gaps |
|---|---|---|---|
| Organization (sitewide) | IMPLEMENTED | Every page via root layout | None. All fields present. Wikidata linked. |
| WebSite + SearchAction (sitewide) | IMPLEMENTED | Every page via root layout | None. Valid EntryPoint template. |
| BreadcrumbList (sitewide) | IMPLEMENTED | Every page (auto-fallback + 30+ per-page overrides) | None. Comprehensive coverage. |
| Person + ProfilePage | IMPLEMENTED | Entity pages, guest pages, expert pages, author pages, about page | Minor: dynamic entity pages rely on MDX frontmatter quality for sameAs completeness |
| Article/BlogPosting | IMPLEMENTED | All 1,010+ blog posts, answer pages, comparisons, event guides | Minor: `dateModified` falls back to `datePublished` when not explicitly set |
| PodcastSeries + PodcastEpisode | IMPLEMENTED | Series on index + sitewide graph; episodes on all episode pages | Minor: two overlapping components (simple vs rich) -- the rich one has Spotify/guest, the simple one uses @id refs |
| WebApplication/SoftwareApplication | IMPLEMENTED | All 34 tools via ToolSchemas, Race Predictor, Ask Roadman entity | None. All free tools marked with $0 Offer. |
| Dataset | IMPLEMENTED | /benchmarks page | Gap: only 1 page uses Dataset. Could apply to research pages, paid reports, data-heavy tools |
| FAQPage | IMPLEMENTED | 40+ pages (blog conditional, tools, coaching, events, topics, etc.) | None. Widespread and conditional (returns null when empty) |
| HowTo | IMPLEMENTED | Tools (via ToolSchemas), training plan phases, blog (conditional) | None. Well-integrated with step arrays. |

---

## 3. What's Missing or Could Be Improved

### 3.1 High Priority -- New Schema Types

| Schema Type | Where to Add | SEO/AEO Impact | Effort |
|---|---|---|---|
| **Review + AggregateRating** | Coaching, NDY, Inner Circle, Method course, training camps | High -- Google shows star ratings in SERPs. Testimonials exist on `/proof` but have no schema. | Medium |
| **Product** | Paid reports (`/predict/[slug]` premium), Roadman Method | Medium -- enables price/availability rich results for commercial pages | Low |
| **VideoObject** (standalone) | Blog posts with embedded YouTube, podcast episodes without current VideoObject | Medium -- enables video carousel and video rich results | Medium |
| **Event** (community) | `/events` page, Skool community events | Medium -- local event carousel | Low |
| **MedicalWebPage / HealthTopicContent** | Health-adjacent content (recovery, testosterone, nutrition) | Low-Medium -- niche but signals E-E-A-T for YMYL-adjacent topics | High (requires review) |

### 3.2 Medium Priority -- Enhancements to Existing Schema

| Enhancement | Current State | Recommended | Impact |
|---|---|---|---|
| **Dataset on more pages** | Only on `/benchmarks` | Add to `/research`, data-heavy tools (FTP Calculator, VO2max, TSS), paid report landing pages | Medium -- proprietary data is the audit's differentiator |
| **Consistent `dateModified`** | Falls back to `datePublished` on blog posts when not explicitly set | Ensure all updated posts have explicit `dateModified` in frontmatter | Medium -- freshness signals |
| **ImageObject consistency** | Some schema uses string URLs, most use ImageObject | Standardize all `image` fields to ImageObject with width/height/caption | Low |
| **Speakable on all content pages** | Present on blog, questions, comparisons, answers, topics, benchmarks | Add to all remaining content types (glossary, experts, events, races) | Low-Medium -- AEO optimization |
| **Merge duplicate components** | 2x BreadcrumbList, 2x FAQPage, 2x PodcastEpisode components | Consolidate to single components with full feature sets | Low (code hygiene) |
| **VideoObject on blog posts** | Only on podcast episodes (conditional) | Blog posts with YouTube embeds should get VideoObject | Medium |
| **Offer harmonization** | Different Offer patterns (some USD, some EUR, some free) | Ensure all Offers specify validFrom, priceValidUntil where applicable | Low |

### 3.3 Low Priority -- Nice to Have

| Enhancement | Details | Impact |
|---|---|---|
| **SpeakableSpecification expansion** | Currently targets CSS selectors; could add `xpath` for more precision | Low |
| **InteractionCounter** | Add to PodcastEpisode (download counts), blog posts (share/comment counts if available) | Low |
| **Audience** | Add `audience` (EducationalAudience) to Course, Method, coaching pages -- "Masters cyclists aged 35-55" | Low |
| **EducationalOccupationalCredential** | Add to Anthony Walsh's Person for coaching credentials | Low |
| **ExercisePlan** | Training plan phases could use ExercisePlan instead of/alongside HowTo | Low |
| **NutritionInformation** | Fuel Planner tool, nutrition blog posts | Low |
| **PropertyValue on tools** | Tool output schemas could use PropertyValue for structured results | Low |

---

## 4. Priority Recommendations

### Tier 1: Do First (highest SERP/AEO impact, lowest effort)

1. **Add Review/AggregateRating to commercial pages** -- Testimonials already exist on `/proof`, `/coaching`, `/inner-circle`, `/training-camps`. Wire them into schema. Star ratings in SERPs are the single highest-impact rich result for conversion.

2. **Expand Dataset schema to research and data tools** -- The benchmarks page already has a working Dataset implementation. Replicate to `/research`, FTP Calculator, VO2max Calculator, TSS Calculator, Power-to-Speed tool. Proprietary data is the audit's core differentiator.

3. **Add Product schema to paid offerings** -- Roadman Method ($297-397), premium race predictions ($29), paid reports. Enables price/availability in Google Shopping and merchant results.

### Tier 2: Do Next (medium effort, strong signal)

4. **Enforce explicit `dateModified` in blog frontmatter** -- Currently falls back to `datePublished`. When consolidating/updating posts per the audit, ensure the MDX frontmatter carries a real modified date. Critical for freshness signals on the 1,010-post corpus.

5. **Add VideoObject to blog posts with YouTube embeds** -- Grep for YouTube embed patterns and conditionally emit VideoObject. Enables video carousel in SERPs.

6. **Add Speakable to all remaining content types** -- Glossary, expert pages, event guides, race guides. Low effort since the pattern exists. High AEO impact since AI engines look for speakable content.

### Tier 3: Code Hygiene

7. **Consolidate duplicate schema components** -- Merge `BreadcrumbJsonLd` + `BreadcrumbSchema` into one (keep the auto-Home-prepend from BreadcrumbSchema). Merge `FAQPageJsonLd` + `FAQSchema` into one. Merge `PodcastEpisodeJsonLd` + `PodcastEpisodeSchema` into one (keep Spotify/guest support from the rich version). This reduces maintenance surface and prevents drift.

---

## 5. Schema Component Map

```
src/components/seo/
  JsonLd.tsx                    -- Base renderer + Organization graph + Article + FAQ + Breadcrumb + PodcastEpisode
  JsonLd.test.tsx               -- 19 tests covering all JsonLd.tsx types
  BreadcrumbSchema.tsx          -- BreadcrumbList (auto-prepends Home)
  FAQSchema.tsx                 -- FAQPage (different prop name from FAQPageJsonLd)
  HowToSchema.tsx               -- HowTo with steps
  SoftwareApplicationSchema.tsx -- WebApplication
  PodcastEpisodeSchema.tsx      -- PodcastEpisode (rich: Spotify, guest, duration conversion)
  ClaimReviewSchema.tsx         -- ClaimReview @graph
  RouteBreadcrumbJsonLd.tsx     -- Client-side auto BreadcrumbList from pathname
  ArticleCitationBlock.tsx      -- HTML microdata citation block
  ToolSchemas.tsx               -- Composite: WebApplication + HowTo + Breadcrumb + FAQ

src/app/(method)/method/_components/
  MethodCourseJsonLd.tsx        -- Course with modules, schedule, offers
```

---

## 6. Connected Entity Graph Status

The site already has a **strong connected entity graph**:

- 4 sitewide @id anchors (Organization, WebSite, Person, PodcastSeries) referenced by every content page
- 7 dedicated entity pages with Wikidata `sameAs` links (Q140138232, Q140138269, Q140139864)
- Per-page @id patterns: `/blog/{slug}#article`, `/podcast/{slug}#episode`, `/guests/{slug}#person`, `/topics/{slug}#thing`, `/topics/{slug}#topic`
- `canonical-entities.ts` registry with 40+ entities carrying verified sameAs URLs
- `knowledge-graph.json` API endpoint serving a custom property-graph (nodes + edges) of all site entities
- Cross-references flow bidirectionally: articles mention experts/episodes, episodes reference guests, topics reference articles, experts reference topics

**What would make this stronger:**
- Adding `sameAs` links to external authority pages (Wikipedia, Wikidata) for more entities beyond the core 3
- Adding `mentions` arrays to more page types (currently rich on blog/answers, absent from events/races/tools)
- Adding `isBasedOn` or `citation` for research-backed content pointing to PubMed/DOI links
- Ensuring all Person entities across the site (experts, guests, author) use consistent @id patterns that resolve to a single node in the graph
