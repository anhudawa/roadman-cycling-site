# Roadman Cycling: Site Positioning and Copy Handover

Date: 2026-05-03

## Offer Ladder (The Spine)

1. **Free content** — Podcast, Guides, Tools, Saturday Spin newsletter, Clubhouse
2. **Plateau Diagnostic** — Lead magnet, segmentation, routing tool
3. **Not Done Yet** — Core paid COACHING product (not community/membership)
4. **1:1 Coaching** — Premium/bespoke, application-based

## Naming Discipline

- **Not Done Yet** = coaching (always)
- **Saturday Spin** = newsletter (always)
- **Plateau Diagnostic** = lead magnet / segmentation tool (always)
- **Clubhouse** = free community (if strategic)
- **1:1 Coaching** = premium tier (always separate from NDY)

## Core Positioning

"Roadman helps serious amateur and masters cyclists stop plateauing through a coached system built for real life."

## Homepage Hero Direction

Headline: Stop plateauing. Start progressing.
Subhead: Evidence-based coaching for serious amateur and masters cyclists who want to get faster without training like they're 25 and unemployed.
Primary CTA: Take the Plateau Diagnostic
Secondary CTA: See How Roadman Coaching Works

## CTA Hierarchy

- General/cold pages: Take the Plateau Diagnostic
- Content pages: Take the Plateau Diagnostic or Join Saturday Spin
- Core commercial pages: Join Not Done Yet
- Premium pages: Apply for 1:1 Coaching

## Implementation Phases

### Phase 1: Commercial Architecture
- Offer ladder config (lib/offer-ladder.ts, lib/brand-messaging.ts)
- Navigation updates
- /coaching → offer ladder overview
- /apply → clarify NDY coaching positioning
- Route structure cleanup

### Phase 2: Core Conversion Pages
- Homepage rewrite (rider problem first, media stats as proof)
- Plateau Diagnostic elevation site-wide
- /coaching as ladder hub with comparison table
- Not Done Yet coaching page (reposition from community)
- 1:1 Coaching page (new, premium tier)
- Rider-state routing component

### Phase 3: Content Template Upgrades
- Blog article dynamic CTAs by category
- Podcast episode topic-matched CTAs
- Guest page "what this means for your training" sections
- Email capture component updates

### Phase 4: New Pages
- /start-here (orientation for cold traffic)
- /masters (Masters Performance Hub)
- /event-prep (Event Prep Hub)
- /apps-vs-coaching (comparison/commercial page)
- /which-option (interactive tier routing)
- /results (proof library by rider type)
