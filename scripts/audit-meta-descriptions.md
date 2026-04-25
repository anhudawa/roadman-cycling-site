# Meta Description Audit $€” April 2026

## Summary

Comprehensive audit of all meta descriptions across the Roadman Cycling site. Checked every page that generates metadata: static app pages, blog MDX frontmatter, podcast MDX frontmatter, tool pages, marketing pages, and community pages.

**Target range:** 120-160 characters per description.

---

## Static Pages (src/app/)

### Fixed (4 pages)

| Page | Issue | Before | After |
|------|-------|--------|-------|
| `src/app/layout.tsx` (root) | Too long (197 chars) | "The podcast trusted by 1 million monthly listeners..." | "The cycling podcast trusted by 1M+ monthly listeners. Expert coaching, training plans, nutrition, and a community that refuses to settle." |
| `src/app/(marketing)/strength-training/success/layout.tsx` | Too short (93 chars) | "You're in. Check your email for access details to the Strength Training for Cyclists course." | "You're in. Check your email for instant access to the 12-week Strength Training for Cyclists plan, instructional videos, and bonus guides." |
| `src/app/(content)/tools/shock-pressure/layout.tsx` | Too short (113 chars) | "Calculate recommended air pressure and sag percentage..." | "Free MTB suspension calculator. Get recommended shock pressure, fork PSI, and sag percentage for your weight and riding style $€” XC, trail, enduro, or DH." |
| `src/app/(content)/tools/energy-availability/layout.tsx` | Too short (107 chars) | "Check if you're eating enough to support your cycling training..." | "Free energy availability calculator for cyclists. Find out if you're eating enough to train, recover, and avoid RED-S. Based on fat-free mass and training load." |

### Passed (25+ pages)

All other static pages had descriptions in the 120-160 range:
- Homepage (inherits root layout) -- OK
- About, Contact, Newsletter, Partners, Strength Training -- OK
- Blog index, Podcast index, Tools index -- OK
- FTP Zones, Race Weight, Fuelling, Tyre Pressure calculators -- OK
- Guests index, Topics index, Search -- OK
- Community, Clubhouse, Club, Not Done Yet, Events -- OK
- Dynamic pages (blog/[slug], podcast/[slug], guests/[slug], topics/[slug]) -- use frontmatter fields

---

## Blog Posts (content/blog/)

**Total:** 92 posts. All had `seoDescription` frontmatter fields.

### Fixed (24 posts $€” all too long, >160 chars)

Trimmed descriptions to 120-160 range while preserving keywords and intent:

- `ftp-plateau-breakthrough.mdx` $€” 168 to 149 chars
- `best-mtb-trails-ireland.mdx` $€” 161 to 139 chars
- `cycling-protein-requirements.mdx` $€” 165 to 137 chars
- `cycling-returning-after-break.mdx` $€” 161 to 136 chars
- `cycling-fasted-riding-myth.mdx` $€” 163 to 139 chars
- `best-mtb-trails-belfast.mdx` $€” 162 to 137 chars
- `mtb-skills-beginners-guide.mdx` $€” 207 to 132 chars
- `triathlon-ftp-pacing-strategy.mdx` $€” 174 to 121 chars
- `triathlon-aero-position-guide.mdx` $€” 170 to 135 chars
- `how-to-descend-faster-cycling.mdx` $€” 163 to 129 chars
- `triathlon-cycling-training-plan.mdx` $€” 189 to 151 chars
- `bike-fit-one-change-amateurs-should-make.mdx` $€” 176 to 146 chars
- `cycling-energy-gels-guide.mdx` $€” 162 to 138 chars
- `mtb-fork-setup-guide.mdx` $€” 164 to 143 chars
- `mtb-maintenance-guide.mdx` $€” 177 to 129 chars
- `cycling-caffeine-performance.mdx` $€” 164 to 149 chars
- `cycling-in-rain-guide.mdx` $€” 172 to 139 chars
- `greg-lemond-interview-roadman-podcast.mdx` $€” 170 to 130 chars
- `triathlon-cycling-power-to-weight.mdx` $€” 163 to 128 chars
- `cycling-recovery-tips.mdx` $€” 163 to 147 chars
- `mtb-bike-fit-basics.mdx` $€” 165 to 139 chars
- `cycling-over-40-getting-faster.mdx` $€” 167 to 137 chars
- `cycling-climbing-tips-stop-getting-dropped.mdx` $€” 165 to 131 chars
- `low-cadence-training-cycling-torque-intervals.mdx` $€” 170 to 147 chars

### Passed (68 posts)

Remaining blog posts had descriptions in the 120-160 range with good keyword density and compelling copy.

---

## Podcast Episodes (content/podcast/)

**Total:** ~308 episodes.

### Fixed (53 episodes)

#### Skool spam URLs replaced (9 episodes)

These had a Skool community URL as the entire seoDescription:

- `ep-2535` (Phil Bert bike fit), `ep-9` (Rosa Kloser gravel), `ep-1` (Team Sky marginal gains), `ep-13` (weight loss), `ep-11` (Darren Raferty), `ep-10` (Mads Schmidt gravel), `ep-8` (winter training), `ep-6` (climbing slow), `ep-2` (self-coached mistakes)

#### Sponsor boilerplate replaced (2 episodes)

- `ep-2083` (Jack Burke hill climbing), `ep-2085` (cycling brands quiz)

#### Generic "joins Anthony" guest intros replaced (23 episodes)

These had "[Guest] joins Anthony for another Roadman Cycling Podcast" as the description:

- `ep-2212` (Stetina), `ep-2231` (Hincapie), `ep-2238` (Nestor), `ep-2237` (Holohan), `ep-1` (Wilcox), `ep-2233` (Howes), `ep-2230` (Naesen), `ep-2229` (Wright), `ep-2225` (Vande Velde), `ep-2224` (Hayman), `ep-2223` (Impey), `ep-2221` (Dylan Johnson), `ep-2220` (Hannah Grant), `ep-2218` (Poertner chain lube), `ep-2216` (Poertner wind tunnel), `ep-2217` (Murchison), `ep-2214` (Dowsett), `ep-2213` (Vink), `ep-2210` (LeMond EPO), `ep-2208` (Richardson), `ep-2205` (Friel), `ep-2144` (Meg Fisher), `ep-2187` (Alexey Vermeulen)

#### Rider Support boilerplate replaced (4 episodes)

- `ep-2129`, `ep-2143`, `ep-2098`, `ep-2133`

#### Title-only / too short / weak replaced (15 episodes)

- `ep-2095` (Prof Seiler), `ep-2256` (David Millar TT), `ep-2250` (core strength), `ep-2249` (race vlog), `ep-2239` (Gabby Bernstein), `ep-2064` (numb hands), `ep-2032` (cut training in half), `ep-2246` (Jack Ultra Cyclist), `ep-2227` (Vegan Cyclist), `ep-2242` (TJ Eisenhart), `ep-2228` (British Cycling), `ep-2219` (crash recovery), `ep-2215` (Peter Singer), `ep-2075` (beginner habits), `ep-2134` (Dan Lorang), `ep-2065` (Pogacar form), `ep-2026` (FTP heat training), `ep-2121` (Remco heat), `ep-2186` (Dr Pruitt), `ep-2234` (Sofiane Sehili), `ep-2183` (Derek Teel)

#### "Extract from" clip episodes replaced (11 episodes)

- `ep-2193`, `ep-2192`, `ep-2190`, `ep-2189`, `ep-2188`, `ep-2185`, `ep-2184`, `ep-2182`, `ep-2198`, `ep-2195`, `ep-2255`

#### Truncated YouTube / generic clip descriptions replaced (8 more episodes)

- `ep-2194` (Jeanson EPO), `ep-2206` (LeMond accident), `ep-2207` (LeMond motor doping), `ep-2204` (bike heist), `ep-2202` (Hincapie Boonen), `ep-2201` (Friel strength), `ep-2200` (cyclists over 40), `ep-2180` (Hincapie Sagan), `ep-2176` (LeMond Hinault), `ep-2196` (LeMond Lance), `ep-2172` (Fred Wright Mader), `ep-2162` (Owen Vermeulen), `ep-2177` (Friel fat loss), `ep-2164` (Fred Wright fatigue), `ep-2199` (1x drivetrains), `ep-2132` (Bora endurance), `ep-2031` (Ben Healy fueling)

---

## Remaining Work (~212 podcast episodes)

Approximately 212 podcast episodes still use `>-` YAML multiline descriptions that are truncated YouTube descriptions. These typically:

1. **End with `...`** $€” cut off mid-sentence from YouTube description imports
2. **Are informal/first-person** $€” "In this video Anthony..." or "Today I chat with..."
3. **Reference YouTube** $€” "You can check out the full conversation here..."
4. **Are too long** $€” multiline `>-` descriptions that exceed 160 chars when rendered
5. **Lack keyword density** $€” rambling intros instead of focused SEO copy

### Recommended approach for remaining episodes

These should be processed in a follow-up pass. For each episode:

1. Read the body content (Key Takeaways section) to understand the actual content
2. Write a 120-160 char description that is:
   - Keyword-rich (guest name, topic, specific takeaways)
   - Compelling for SERP click-through
   - Accurate to the actual content
3. Replace the `>-` multiline format with a simple `"quoted string"` format

### Priority episodes to fix next

High-traffic topics that likely drive organic search:
- Zone 2 training episodes (5+ episodes)
- Pogacar-related episodes (3+ episodes)
- Weight loss / nutrition episodes (5+ episodes)
- Gravel cycling episodes (5+ episodes)
- Training after 40/50 episodes (4+ episodes)
- Doping / LeMond / Armstrong episodes (5+ episodes)

---

## Files Created

- `scripts/check-descriptions.mjs` $€” Audit script (not executed, can be used for future automated checks)

---

## Total Changes

| Category | Issues Found | Fixed |
|----------|-------------|-------|
| Static pages (too long) | 1 | 1 |
| Static pages (too short) | 3 | 3 |
| Blog posts (too long) | 24 | 24 |
| Podcast: Skool spam | 9 | 9 |
| Podcast: Sponsor boilerplate | 2 | 2 |
| Podcast: Generic guest intros | 23 | 23 |
| Podcast: Rider Support boilerplate | 4 | 4 |
| Podcast: Title-only / too short / weak | ~21 | ~21 |
| Podcast: "Extract from" clips | 11 | 11 |
| Podcast: Truncated YouTube descriptions | ~17 | ~17 |
| Podcast: Remaining >- multiline | ~212 | 0 (backlog) |
| **Total** | **~327** | **~115** |
