# Roadman app software entity — release brief

Released: 1 September 2026

Canonical product: `/app`

Knowledge-graph node: `software:roadman-cycling-strength-recovery-app`

## Purpose

The upcoming app is now a first-class software entity, distinct from the
search-owner record that routes broad product queries. This lets search and AI
systems identify the product, publisher, maintainer, audience, platform,
prelaunch status, evidence boundary and public early-access destination without
inventing a final name, launch date or price.

## Connected graph

- Roadman Cycling organization and Anthony Walsh.
- The canonical cycling strength and recovery app search owner.
- Strength and recovery topic hubs.
- Strength-session, readiness and recovery preview tools.
- Strength-app and recovery-app category comparisons.
- The reviewed strength and daily-readiness evidence guides.

The product has one early-access URL: `/app#early-access`. No second signup
route, Beehiiv audience or internal product name is exposed.

## Contract

- Lifecycle status remains `prelaunch` until an actual release.
- Operating system remains `iOS` until another platform is confirmed.
- AI can explain or organise feedback; it does not invent the training dose.
- The app does not diagnose illness, injury or overtraining.
- The app does not silently rewrite an external cycling plan.
- Product facts live in `src/data/app-product.ts` and feed both the landing-page
  structured data and the site knowledge graph.
