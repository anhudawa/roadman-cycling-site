# Roadman Cycling $€” Site Architecture Design Spec

**Date:** 2026-04-01
**Status:** APPROVED $€” Decisions finalised 2026-04-02
**Replaces:** roadmancycling.com (ClickFunnels)
**Stack:** Next.js 16 (App Router) + Tailwind CSS 4 + Vercel
**Design:** Dark-first, mobile-first, award-calibre (Awwwards SOTD target)

### Key Decisions (2026-04-02)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hero | Video background | Cinematic cycling footage, autoplay muted |
| CMS | Sanity | Real-time preview, GROQ queries, structured content |
| Podcast hosting | Spotify for Podcasters | Embed player via Spotify |
| Payments | Stripe (direct) | Own the payment flow, not through ClickFunnels |
| Email | Beehiiv | Modern newsletter platform, replaces dormant CF list |
| Animations | Framer Motion | Component animations + scroll triggers, no GSAP |
| Build priority | Blog system first | Highest SEO leverage $€” organic traffic is priority #1 |
| Domain | roadmancycling.com (keep) | Existing domain authority + brand recognition |

---

## 1. Strategic Context

### Why This Site Exists

Roadman Cycling has a 100M+ download podcast, 29,782 email contacts, 49.4K Instagram followers, 30K Facebook followers, and a Skool community doing ~$15,929/month. But the current site is a ClickFunnels page $€” a funnel tool pretending to be a website. It has:

- No blog (zero organic search presence)
- No podcast archive (100M+ downloads with no SEO value captured)
- No interactive tools (no lead magnets beyond a static PDF toolkit)
- No community showcase
- No content hub
- Only 112 external link taps/month from 255K Instagram reach (0.04% CTR)

**The new site must be the conversion engine that bridges the gap between Roadman's massive audience (100M+ downloads) and its revenue (~$191K/year).** The podcast audience is the largest undermonetised asset. Every episode should generate SEO traffic. Every page should move visitors toward the community.

### Business Goals (Priority Order)

1. **Capture organic search traffic** $€” Podcast-to-blog system targeting keyword clusters around training, nutrition, recovery, cycling performance
2. **Convert visitors to email subscribers** $€” From 29,782 to 100K+ contacts through tools, blog, and content
3. **Drive free community signups** $€” Clubhouse as the gateway (currently 1,852 members)
4. **Upgrade free to paid** $€” Not Done Yet community ($15-$1,950/year tiers)
5. **Establish brand authority** $€” Award-worthy design that positions Roadman as the premium cycling content brand
6. **Replace ClickFunnels** $€” Own the domain, own the data, own the experience

### Target Personas (from Brand Bible)

| Persona | Codename | Priority | Entry Point |
|---------|----------|----------|-------------|
| Plateau-Stuck Club Racer | Tom | Premium upsell | Blog (training), FTP calculator |
| Bucket-List Gran Fondo Achiever | Mark | Standard tier | Blog (events), tyre pressure calc |
| Comeback Athlete | James | Emotional hook | Blog (nutrition/weight), race weight calc |
| Podcast Loyalist | Dave | Volume conversion | Podcast archive, community showcase |

---

## 2. Site Architecture $€” Information Architecture

### Sitemap

```
/                           $†’ Home (cinematic hero, value prop, social proof)
/podcast                    $†’ Podcast hub (search, filter, latest episodes)
/podcast/[slug]             $†’ Individual episode page (player, transcript, blog post, schema)
/blog                       $†’ Blog index (all posts, filtered by pillar)
/blog/[slug]                $†’ Individual blog post (SEO-optimised long-form)
/tools                      $†’ Tools hub (all calculators)
/tools/tyre-pressure        $†’ Tyre Pressure Calculator
/tools/energy-availability  $†’ Energy Availability Calculator
/tools/shock-pressure       $†’ Shock Pressure Calculator
/tools/ftp-zones            $†’ FTP Zone Calculator
/tools/race-weight          $†’ Race Weight Calculator
/tools/fuelling             $†’ In-Ride Fuelling Calculator
/community                  $†’ Community overview (Clubhouse + Not Done Yet)
/community/clubhouse        $†’ Free community (Clubhouse) landing
/community/not-done-yet     $†’ Paid community (Not Done Yet) sales page
/about                      $†’ About Anthony + Roadman story
/contact                    $†’ Contact form
/strength-training          $†’ Strength Training course sales page (replaces CF funnel)
/newsletter                 $†’ Newsletter signup landing page
```

### URL Strategy

- All URLs lowercase, hyphenated, no trailing slashes
- Blog posts: `/blog/zone-2-training-complete-guide`
- Podcast episodes: `/podcast/ep-247-dan-lorang-periodisation`
- Tools: `/tools/ftp-zones`
- No date-based URLs (evergreen content strategy)

### Route Groups (Next.js App Router)

```
src/app/
$”œ$”€$”€ (marketing)/           $†’ Public pages with marketing layout
$”$   $”œ$”€$”€ page.tsx           $†’ Home
$”$   $”œ$”€$”€ about/
$”$   $”œ$”€$”€ contact/
$”$   $”œ$”€$”€ newsletter/
$”$   $””$”€$”€ strength-training/
$”œ$”€$”€ (content)/             $†’ Content pages with content layout
$”$   $”œ$”€$”€ blog/
$”$   $”$   $”œ$”€$”€ page.tsx       $†’ Blog index
$”$   $”$   $””$”€$”€ [slug]/
$”$   $”œ$”€$”€ podcast/
$”$   $”$   $”œ$”€$”€ page.tsx       $†’ Podcast hub
$”$   $”$   $””$”€$”€ [slug]/
$”$   $””$”€$”€ tools/
$”$       $”œ$”€$”€ page.tsx       $†’ Tools hub
$”$       $”œ$”€$”€ tyre-pressure/
$”$       $”œ$”€$”€ energy-availability/
$”$       $”œ$”€$”€ shock-pressure/
$”$       $”œ$”€$”€ ftp-zones/
$”$       $”œ$”€$”€ race-weight/
$”$       $””$”€$”€ fuelling/
$”œ$”€$”€ (community)/           $†’ Community pages with community layout
$”$   $””$”€$”€ community/
$”$       $”œ$”€$”€ page.tsx       $†’ Community overview
$”$       $”œ$”€$”€ clubhouse/
$”$       $””$”€$”€ not-done-yet/
$”œ$”€$”€ api/                   $†’ API routes
$”$   $”œ$”€$”€ newsletter/        $†’ Email capture endpoint
$”$   $”œ$”€$”€ contact/           $†’ Contact form endpoint
$”$   $””$”€$”€ og/                $†’ Dynamic OG image generation
$””$”€$”€ layout.tsx             $†’ Root layout (global nav, footer, analytics)
```

---

## 3. Design System

### Brand Tokens (Tailwind 4 @theme)

```css
@import "tailwindcss";

@theme {
  /* Roadman Brand Colours */
  --color-off-white: #FAFAFA;
  --color-coral: #F16363;
  --color-mid-grey: #545559;
  --color-purple: #4C1273;
  --color-charcoal: #252526;
  --color-deep-purple: #210140;

  /* Semantic Colours */
  --color-background: #252526;
  --color-background-deep: #210140;
  --color-foreground: #FAFAFA;
  --color-foreground-muted: #545559;
  --color-accent: #F16363;
  --color-brand: #4C1273;

  /* Typography */
  --font-heading: 'Bebas Neue', sans-serif;
  --font-body: 'Work Sans', sans-serif;

  /* Spacing Scale */
  --spacing-section: 6rem;
  --spacing-section-mobile: 3rem;

  /* Animation */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-slow: 800ms;
  --duration-medium: 400ms;
  --duration-fast: 200ms;
}

@custom-variant dark (&:is(.dark *));
```

### Typography Scale

| Element | Font | Size (desktop) | Size (mobile) | Weight | Transform |
|---------|------|---------------|---------------|--------|-----------|
| Hero headline | Bebas Neue | 8rem (128px) | 3.5rem (56px) | Bold | Uppercase |
| Section headline | Bebas Neue | 4rem (64px) | 2.5rem (40px) | Bold | Uppercase |
| Subsection | Bebas Neue | 2rem (32px) | 1.5rem (24px) | Light | Uppercase |
| Body large | Work Sans | 1.25rem (20px) | 1.125rem (18px) | Regular | None |
| Body | Work Sans | 1rem (16px) | 1rem (16px) | Regular | None |
| Caption | Work Sans | 0.875rem (14px) | 0.875rem (14px) | Regular | None |
| CTA button | Bebas Neue | 1.25rem (20px) | 1.125rem (18px) | Bold | Uppercase |

### Design Principles (Award-Calibre)

1. **Cinematic scale** $€” Hero sections with full-viewport imagery, oversized typography, dramatic negative space
2. **Scroll-driven storytelling** $€” Content reveals through scroll, parallax layers, and progressive disclosure
3. **Purposeful animation** $€” Every motion communicates meaning (section reveals, hover states, number counters)
4. **Dark dominance** $€” Charcoal (#252526) base with deep purple (#210140) for premium sections, coral (#F16363) for energy/CTAs
5. **Mobile-first immersion** $€” Touch-friendly, swipeable, fast. No desktop-first compromises.
6. **Photography-led** $€” Full-bleed cycling imagery (roads, climbs, peloton, suffering faces) as section backdrops
7. **Micro-interactions** $€” Cursor effects, hover reveals, smooth state transitions on calculators

### Component Library (Core)

```
src/components/
$”œ$”€$”€ ui/                    $†’ Atomic design elements
$”$   $”œ$”€$”€ Button.tsx         $†’ Primary (coral), Secondary (purple), Ghost
$”$   $”œ$”€$”€ Input.tsx          $†’ Form inputs with floating labels
$”$   $”œ$”€$”€ Badge.tsx          $†’ Content pillar tags
$”$   $”œ$”€$”€ Card.tsx           $†’ Episode cards, blog cards, tool cards
$”$   $”œ$”€$”€ Avatar.tsx         $†’ Guest/member avatars
$”$   $”œ$”€$”€ Counter.tsx        $†’ Animated number counters (100M+, 1,852 members)
$”$   $””$”€$”€ Skeleton.tsx       $†’ Loading states
$”œ$”€$”€ layout/                $†’ Structural components
$”$   $”œ$”€$”€ Header.tsx         $†’ Sticky header with scroll-aware behaviour
$”$   $”œ$”€$”€ Footer.tsx         $†’ Full footer with nav, social, newsletter
$”$   $”œ$”€$”€ Section.tsx        $†’ Full-width section wrapper with scroll animations
$”$   $”œ$”€$”€ Container.tsx      $†’ Max-width content container
$”$   $””$”€$”€ MobileNav.tsx      $†’ Full-screen mobile navigation overlay
$”œ$”€$”€ features/              $†’ Feature-specific components
$”$   $”œ$”€$”€ podcast/
$”$   $”$   $”œ$”€$”€ EpisodeCard.tsx
$”$   $”$   $”œ$”€$”€ EpisodePlayer.tsx
$”$   $”$   $”œ$”€$”€ PodcastSearch.tsx
$”$   $”$   $””$”€$”€ TranscriptViewer.tsx
$”$   $”œ$”€$”€ blog/
$”$   $”$   $”œ$”€$”€ BlogCard.tsx
$”$   $”$   $”œ$”€$”€ BlogContent.tsx
$”$   $”$   $”œ$”€$”€ TableOfContents.tsx
$”$   $”$   $””$”€$”€ RelatedPosts.tsx
$”$   $”œ$”€$”€ tools/
$”$   $”$   $”œ$”€$”€ Calculator.tsx      $†’ Base calculator shell
$”$   $”$   $”œ$”€$”€ TyrePressure.tsx
$”$   $”$   $”œ$”€$”€ EnergyAvailability.tsx
$”$   $”$   $”œ$”€$”€ ShockPressure.tsx
$”$   $”$   $”œ$”€$”€ FTPZones.tsx
$”$   $”$   $”œ$”€$”€ RaceWeight.tsx
$”$   $”$   $””$”€$”€ Fuelling.tsx
$”$   $”œ$”€$”€ community/
$”$   $”$   $”œ$”€$”€ MemberTestimonial.tsx
$”$   $”$   $”œ$”€$”€ TierComparison.tsx
$”$   $”$   $””$”€$”€ CommunityStats.tsx
$”$   $””$”€$”€ conversion/
$”$       $”œ$”€$”€ EmailCapture.tsx    $†’ Inline + modal email capture
$”$       $”œ$”€$”€ CTABanner.tsx       $†’ Full-width conversion banners
$”$       $””$”€$”€ ExitIntent.tsx      $†’ Exit-intent popup
$””$”€$”€ seo/
    $”œ$”€$”€ JsonLd.tsx              $†’ Structured data component
    $”œ$”€$”€ MetaTags.tsx            $†’ Dynamic meta tags
    $””$”€$”€ Breadcrumbs.tsx         $†’ Breadcrumb navigation + schema
```

---

## 4. Page Designs

### 4.1 Home Page (`/`)

**Purpose:** First impression. Cinematic brand statement. Social proof. Clear paths forward.

**Sections (scroll order):**

1. **Hero** $€” Full-viewport. Background: dramatic cycling footage or high-contrast still (road disappearing into mountain). Overlay: deep purple gradient from bottom. Copy: "CYCLING IS HARD. WE MAKE IT LESS HARD." (Bebas Neue, 128px). Sub: "The podcast trusted by 100 million listeners. The community where serious cyclists stop guessing." CTA: "Listen Now" (coral) + "Join Free" (ghost).

2. **Social Proof Bar** $€” Horizontal scroll of logos/numbers: "100M+ Downloads" | "1,852 Community Members" | "61K YouTube Subscribers" | "Featured Experts: Seiler, Lorang, Morton". Animated counters on scroll-into-view.

3. **Content Pillars** $€” Five cards (Coaching, Nutrition, S&C, Recovery, Le Metier) with hover-reveal descriptions. Each links to filtered blog view. Dark cards with coral accent lines.

4. **Latest Episodes** $€” 3 latest podcast episodes as cinematic cards with play buttons. Horizontal scroll on mobile. Each shows guest photo, episode title, duration.

5. **Tools Showcase** $€” Interactive preview of one calculator (e.g., FTP Zones). "Type your FTP" input right on the homepage that generates a preview result, then CTA to full tool + email capture.

6. **Community Section** $€” Split: Left = Clubhouse (free, "Join 1,852 cyclists"), Right = Not Done Yet (paid, "The serious cyclists' system"). Member testimonials carousel. Real screenshots of wins.

7. **Anthony Walsh** $€” Photo + short bio. "I've spent 10 years sitting across the table from the best coaches, scientists, and riders in the world. This is everything I've learned." CTA to About page.

8. **Newsletter CTA** $€” Full-width coral section. "Get the insights. No fluff. Once a week." Email input + submit.

9. **Footer** $€” Full navigation, social links, podcast platform links, legal.

### 4.2 Podcast Hub (`/podcast`)

**Purpose:** Searchable, filterable archive of every episode. SEO goldmine.

- Hero: "THE ARCHIVE" with episode count and total downloads
- Search bar (full-text search across titles, guests, topics)
- Filter by content pillar (Coaching, Nutrition, S&C, Recovery, Le Metier)
- Filter by type (Interview, Solo, Panel, Sarah & Anthony)
- Episode grid: cards with guest photo, title, duration, pillar badge, play button
- Pagination or infinite scroll
- Each card links to individual episode page

### 4.3 Episode Page (`/podcast/[slug]`)

**Purpose:** The SEO workhorse. Each episode becomes a long-form content page.

**Layout:**
- Hero: Episode title (Bebas Neue), guest name + photo, publish date, duration, pillar badges
- Embedded audio player (sticky on scroll)
- AI-generated long-form blog post (2,000-5,000 words targeting keyword cluster)
- Table of contents (auto-generated from H2/H3s)
- Key takeaways summary (bulleted)
- Full transcript (collapsible)
- Related episodes
- Email capture ("Get more like this")
- JSON-LD: PodcastEpisode + BlogPosting + Person (guest) + BreadcrumbList

### 4.4 Blog (`/blog` + `/blog/[slug]`)

**Purpose:** Pure SEO play. Long-form content targeting keyword clusters.

**Blog Index:**
- Hero: "THE KNOWLEDGE" with post count
- Filter by pillar
- Featured post (large card) + grid of recent posts
- Each card: title, excerpt, pillar badge, read time, date

**Blog Post:**
- Hero: Title, author (Anthony Walsh), date, read time, pillar badge
- Full-width featured image
- Long-form content with proper heading hierarchy (H1 $†’ H2 $†’ H3)
- Table of contents sidebar (sticky on desktop)
- Inline CTAs every ~800 words
- Related posts
- Author bio footer
- Email capture
- JSON-LD: BlogPosting + Person + BreadcrumbList

### 4.5 Tools Hub (`/tools`)

**Purpose:** Lead magnets. Interactive tools that provide genuine value, capture emails, and position Roadman as the authority.

**Tools Index:**
- Hero: "YOUR TOOLKIT" with tool descriptions
- 6 tool cards in a grid, each with:
  - Icon/illustration
  - Tool name
  - One-line description
  - "Try it free" CTA

**Individual Tool Pages:**
Each calculator is a full, interactive experience:

1. **Tyre Pressure Calculator** $€” Inputs: rider weight, bike weight, tyre width, road surface, conditions. Output: front/rear PSI with explanation. Formula based on industry-standard calculations.

2. **Energy Availability Calculator** $€” Inputs: weight, training load (hours/week), caloric intake. Output: EA score, risk assessment (RED-S), recommendations. This is the body composition hook.

3. **Shock Pressure Calculator** $€” Inputs: rider weight, shock type, riding style. Output: recommended PSI/sag percentage.

4. **FTP Zone Calculator** $€” Inputs: FTP value. Output: 7-zone power table with descriptions, training recommendations per zone. This is the training methodology hook.

5. **Race Weight Calculator** $€” Inputs: height, current weight, body fat %, target event. Output: optimal race weight range, timeline, approach. The hidden motivator tool.

6. **In-Ride Fuelling Calculator** $€” Inputs: ride duration, intensity, weight. Output: carbs/hour target, hydration plan, specific product suggestions. The nutrition hook.

**Conversion flow per tool:**
1. User inputs data $†’ gets partial result (above the fold)
2. "Get your full personalised report" $†’ email capture gate
3. Full result delivered on-page + emailed
4. Follow-up: "Join 1,852 cyclists in the Clubhouse" CTA

### 4.6 Community Pages

**Community Overview (`/community`):**
- Split hero: Clubhouse (free) vs Not Done Yet (paid)
- What you get at each level
- Member testimonials (real results: "Cat 3 to Cat 1", "20% to 7% body fat")
- FAQ

**Clubhouse (`/community/clubhouse`):**
- Free community landing page
- What's inside: weekly Q&A, training plans, community
- Social proof (member count, engagement stats)
- CTA: "Join Free" $†’ Skool link

**Not Done Yet (`/community/not-done-yet`):**
- Premium sales page (replaces Skool About page as primary entry)
- Three-tier comparison table (Standard $15, Premium $195, VIP $1,950)
- Offer stack breakdown
- Video from Anthony
- Member results showcase
- Objection handling
- Risk reversal / guarantee
- CTA: "Apply Now" $†’ application funnel

### 4.7 About (`/about`)

- Anthony's story $€” from listener to host to having the world's best on speed dial
- The "Riding Through" manifesto
- Expert network showcase (Seiler, Lorang, Morton, etc.)
- Team (Sarah, Sinead, Wes)
- Press/features if any

### 4.8 Strength Training (`/strength-training`)

- Replaces the ClickFunnels strength training funnel ($3,075 from 63 orders)
- Sales page for the $49.99 course
- Video preview
- Curriculum outline
- Testimonials
- CTA: Purchase (integrate with Stripe or existing payment provider)

---

## 5. Technical Architecture

### Data Layer

**Content Management:**
- MDX files for blog posts (version-controlled, developer-friendly)
- JSON/YAML for podcast episode metadata
- Future: headless CMS (Sanity or Contentful) when content volume requires it
- Static generation (SSG) for all content pages at build time
- ISR (Incremental Static Regeneration) for frequently updated pages

**Podcast Data:**
```typescript
interface Episode {
  slug: string;
  title: string;
  guest: string;
  guestImage: string;
  description: string;
  publishDate: string;
  duration: string;
  audioUrl: string;        // Podcast hosting platform embed
  pillar: ContentPillar;
  type: 'interview' | 'solo' | 'panel' | 'sarah-anthony';
  keywords: string[];
  transcript: string;
  blogContent: string;     // AI-generated SEO blog post
  seoTitle: string;
  seoDescription: string;
}

type ContentPillar = 'coaching' | 'nutrition' | 'strength' | 'recovery' | 'le-metier';
```

**Blog Data:**
```typescript
interface BlogPost {
  slug: string;
  title: string;
  author: string;
  publishDate: string;
  updatedDate?: string;
  pillar: ContentPillar;
  excerpt: string;
  content: string;         // MDX content
  featuredImage: string;
  readTime: number;
  keywords: string[];
  relatedEpisodes?: string[];
  seoTitle: string;
  seoDescription: string;
}
```

### SEO Architecture

**Per-page SEO:**
- Dynamic `<title>` and `<meta description>` via Next.js Metadata API
- Open Graph tags with dynamic OG images (generated via `/api/og`)
- Twitter Card meta tags
- Canonical URLs
- JSON-LD structured data on every page

**Structured Data per page type:**

| Page | Schema Types |
|------|-------------|
| Home | Organization, WebSite, SearchAction |
| Episode | PodcastEpisode, BlogPosting, Person, BreadcrumbList |
| Blog Post | BlogPosting, Person, BreadcrumbList |
| Tool | WebApplication, HowTo, FAQPage |
| About | Person (Anthony), Organization |
| Community | Product (for paid tiers), Organization |

**Sitemap:** Auto-generated XML sitemap via `next-sitemap`
**Robots.txt:** Allow all content pages, block API routes and admin
**Internal linking:** Every blog post and episode page links to related content, tools, and community pages

### Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | 95+ |
| LCP (Largest Contentful Paint) | < 1.5s |
| FID (First Input Delay) | < 50ms |
| CLS (Cumulative Layout Shift) | < 0.05 |
| Time to Interactive | < 2s |
| Page weight (initial) | < 200KB JS |

**How we hit these:**
- Server Components by default (zero JS for static content)
- Client Components only for interactivity (calculators, search, player)
- Image optimisation via `next/image` with WebP/AVIF
- Font optimisation via `next/font/google`
- Route-level code splitting (automatic with App Router)
- Streaming with Suspense for dynamic content
- Edge runtime for API routes where possible

### Email Integration

- Newsletter signup $†’ API route $†’ email service (ConvertKit, Resend, or existing ClickFunnels list)
- Tool email capture $†’ same flow with persona tagging
- Contact form $†’ API route $†’ notification email
- All forms: client-side validation + server-side validation + honeypot spam protection

### Analytics & Tracking

- Vercel Analytics (Web Vitals)
- Google Analytics 4 (or Plausible for privacy)
- Google Search Console
- Event tracking: email signups, tool usage, podcast plays, CTA clicks, scroll depth
- UTM parameter handling for campaign attribution

---

## 6. Conversion Architecture

### The Funnel (Every Page)

```
ATTRACT              $†’ ENGAGE              $†’ CAPTURE              $†’ CONVERT
Blog/SEO/Social        Content/Tools          Email/Community        Paid Community

Organic search     $†’   Read blog post     $†’   Email capture      $†’   Clubhouse (free)
Social media       $†’   Use calculator     $†’   Tool result gate   $†’   Not Done Yet (paid)
Podcast link       $†’   Listen to episode  $†’   Newsletter signup  $†’   Strength Training
Direct/referral    $†’   Browse archive     $†’   Exit intent        $†’   Premium/VIP
```

### Email Capture Points

1. **Inline blog CTAs** $€” Every ~800 words in blog posts
2. **Tool result gates** $€” Partial result free, full result gated
3. **Newsletter section** $€” Footer of every page + dedicated page
4. **Exit intent popup** $€” Triggered on mouse-leave (desktop) or scroll-up pattern (mobile)
5. **Content upgrades** $€” Downloadable PDFs related to specific blog topics
6. **Podcast follow-up** $€” "Get the show notes + resources" email capture on episode pages

### CTA Hierarchy

| Priority | CTA | Colour | Placement |
|----------|-----|--------|-----------|
| Primary | "Join the Clubhouse" / "Join Free" | Coral (#F16363) | Hero, section ends, sidebar |
| Secondary | "Subscribe to Newsletter" | Purple (#4C1273) | Footer, blog inline, tools |
| Tertiary | "Not Done Yet" / "Go Premium" | Deep Purple (#210140) | Community pages, after value delivery |

---

## 7. Content Strategy (Podcast-to-Blog System)

### How It Works

Every podcast episode generates a long-form SEO blog post:

1. **Episode publishes** $†’ transcript generated
2. **Keyword research** $†’ identify target cluster for episode topic
3. **Blog post generated** $†’ 2,000-5,000 word article structured around the keyword cluster, drawing from transcript + knowledge base
4. **SEO optimised** $†’ title tag, meta description, headings, internal links, schema
5. **Published** $†’ episode page with both player and blog content

### Content Pillar $†’ Keyword Cluster Mapping

| Pillar | Example Keyword Clusters |
|--------|------------------------|
| Coaching | "zone 2 training cycling", "FTP improvement plan", "polarised training", "cycling periodisation" |
| Nutrition | "cycling weight loss", "in-ride fuelling", "cyclist body composition", "race weight calculator" |
| S&C | "strength training for cyclists", "cycling core exercises", "gym workout for cyclists" |
| Recovery | "cycling recovery tips", "sleep and cycling performance", "overtraining syndrome cycling" |
| Le Metier | "cycling etiquette group ride", "best cycling podcasts", "cycling culture" |

### Blog Post Structure (Template)

```markdown
# [Keyword-Rich H1 Title]

[Hook paragraph $€” problem/insight from the episode]

## Table of Contents
[Auto-generated]

## [H2: Main Topic Section]
[Content drawn from episode, expanded with context from knowledge base]

### [H3: Subtopic]
[Specific, actionable advice]

> "Quote from expert guest" $€” [Guest Name], [Credential]

## [H2: Practical Application]
[How to actually do this $€” sessions, numbers, specifics]

## Key Takeaways
[Bulleted summary]

## Listen to the Full Episode
[Embedded player + episode details]

---

**Want more?** [Email capture CTA]
**Ready to stop guessing?** [Community CTA]
```

---

## 8. Interactive Tools $€” Technical Specs

### Shared Calculator Architecture

All calculators share a common pattern:
- Client Component (needs interactivity)
- Form inputs with real-time validation
- Instant calculation (no server round-trip)
- Animated result reveal
- Email gate for "full report" (optional enhancement)
- Share results functionality
- Mobile-optimised touch inputs (sliders, steppers)

### Calculator Formulas

**Tyre Pressure:**
- Based on rider+bike weight distribution (45% front / 55% rear)
- Adjusted for tyre width (using ISO/ETRTO standards)
- Surface and condition modifiers
- Output: front PSI, rear PSI, with explanation

**FTP Zones (7-zone model):**
```
Zone 1: Active Recovery    $€” < 55% FTP
Zone 2: Endurance          $€” 56-75% FTP
Zone 3: Tempo              $€” 76-90% FTP
Zone 4: Threshold          $€” 91-105% FTP
Zone 5: VO2max             $€” 106-120% FTP
Zone 6: Anaerobic Capacity $€” 121-150% FTP
Zone 7: Neuromuscular      $€” 150%+ FTP
```

**Energy Availability:**
- EA = (Energy Intake - Exercise Energy Expenditure) / Fat-Free Mass
- Risk thresholds: < 30 kcal/kg FFM/day = concern, < 20 = high risk (RED-S)
- Inputs: weight, body fat %, daily calories, training hours, avg intensity

**Race Weight:**
- Target range based on height, body fat %, event type
- Uses competitive cyclist reference ranges (not general population BMI)
- Timeline based on safe loss rate (0.5-1% body weight/week)

**In-Ride Fuelling:**
- Based on duration, intensity (% FTP), and body weight
- < 60min: water only. 60-90min: 30-60g carbs/hr. 90min+: 60-90g carbs/hr. 3hr+: 90-120g carbs/hr
- Hydration: 500-750ml/hr, adjusted for conditions

**Shock Pressure:**
- Based on rider weight, shock travel, riding style
- Output: recommended PSI and target sag percentage (25-30% trail, 20-25% XC)

---

## 9. Award-Worthy Design Elements

### What Makes Sites Win Awwwards

Based on 2025-2026 SOTD winners, these patterns are expected:

1. **Scroll-triggered reveals** $€” Content fades/slides in as you scroll. Not cheesy $€” purposeful.
2. **Parallax depth** $€” Layered elements that move at different speeds creating depth.
3. **Custom cursor** $€” Cursor changes on interactive elements (play button on episodes, etc.)
4. **Smooth page transitions** $€” Route changes with crossfade or slide animations.
5. **Oversized typography** $€” Headlines that dominate the viewport.
6. **Horizontal scroll sections** $€” For carousels and showcases.
7. **Video backgrounds** $€” Hero section with autoplay muted cycling footage.
8. **Number animations** $€” Stats that count up when scrolled into view.
9. **Magnetic buttons** $€” Buttons that subtly attract to the cursor on hover.
10. **Grain texture** $€” Subtle film grain overlay on dark sections for cinematic feel.

### Specific to Roadman

- **The Road Line** $€” A continuous road/route line that threads through the page as a design element (like a GPS trace)
- **Gradient shifts** $€” Background subtly shifts from charcoal $†’ deep purple $†’ charcoal as you scroll through sections
- **Cycling photography** $€” Full-bleed, high-contrast, desaturated cycling images as section dividers
- **The Coral Pulse** $€” CTAs have a subtle pulsing glow effect to draw the eye
- **Stats Reveal** $€” "100M+ Downloads" counts up from 0 with each digit rolling like an odometer

---

## 10. Questions for Morning Review

These decisions need your input before deep implementation:

1. **Hero creative:** Video background (cycling footage) vs. static high-contrast image vs. abstract animated gradient? Each has performance/vibe trade-offs.

2. **CMS strategy:** Start with MDX files (simpler, version-controlled) or go straight to a headless CMS like Sanity (more scalable, non-dev editing)? Recommendation: MDX now, migrate to CMS when content volume demands it.

3. **Podcast hosting integration:** Which platform hosts the podcast audio? (Apple, Spotify, Buzzsprout, Libsyn, etc.) $€” this determines the embed player approach.

4. **Payment integration:** Keep Stripe through ClickFunnels for the strength training course, or integrate Stripe directly into the new site?

5. **Email service:** Stay on ClickFunnels email (29,782 contacts), or migrate to a dedicated platform (ConvertKit, Resend, Mailchimp)? Recommendation: Migrate.

6. **Animation library:** Framer Motion (most capable, larger bundle) vs. GSAP (industry standard for award sites) vs. CSS-only (lightest, limited)? Recommendation: Framer Motion for component animations + a small GSAP integration for scroll-driven effects.

7. **Content priority:** Which section should we build first after the layout? Blog system (SEO value) vs. Tools (lead magnets) vs. Podcast archive (content hub)?

8. **Domain:** Keep roadmancycling.com or consider a new domain?

---

## 11. Implementation Phases (Proposed)

### Phase 1: Foundation (Week 1)
- Next.js 15 scaffold with Tailwind 4
- Design system (tokens, typography, components)
- Layout system (header, footer, mobile nav)
- Home page (all sections)
- Basic SEO setup (metadata, sitemap, robots)

### Phase 2: Content Engine (Week 2-3)
- Blog system (index + post pages)
- Podcast archive (hub + episode pages)
- Search and filtering
- MDX rendering pipeline
- Structured data (JSON-LD)
- OG image generation

### Phase 3: Tools & Lead Magnets (Week 3-4)
- All 6 calculators
- Email capture integration
- Tool result pages
- Share functionality

### Phase 4: Community & Conversion (Week 4-5)
- Community overview page
- Clubhouse landing
- Not Done Yet sales page
- Strength Training sales page
- Exit intent popup
- CTA optimisation

### Phase 5: Polish & Launch (Week 5-6)
- Scroll animations and micro-interactions
- Performance optimisation
- Cross-browser testing
- Mobile testing
- Content migration
- DNS cutover from ClickFunnels
- Analytics setup
- Launch

---

*This spec is a living document. Sections will be refined based on morning review feedback.*
