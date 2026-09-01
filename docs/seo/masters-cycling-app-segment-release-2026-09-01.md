# Masters cycling app segment release — 1 September 2026

## Ownership decision

Keep `/app` as Roadman's canonical owner for broad cycling strength, readiness, recovery and branded app searches.

Publish `/app/masters` as a distinct product-fit and early-access page for cyclists over 40 and over 50. It supports the app owner rather than creating a second product. `/masters` remains the educational owner for broad masters-cycling searches.

## Search Console baseline

The frozen 28-day Web baseline (`2026-08-02` to `2026-08-29`) is stored in `docs/seo/data/gsc-masters-cycling-app-lane-28d-2026-08-29.json`.

The exact masters/over-40/over-50 cycling-app regex returned:

- 0 clicks
- 0 impressions
- 0 matching query rows

This clean pre-release baseline means the new segment can establish intent without rewriting an existing ranked owner.

## Released

- Self-canonical `/app/masters` landing page for cycling-app, masters, over-40 and over-50 product-fit intent
- One app identity: the segment page is linked to the established SoftwareApplication entity at `/app#software`
- One Beehiiv app waitlist: both forms retain the permanent `app-waitlist` audience while recording `masters-app` and form placement as source attribution
- Explicit product boundaries: no age-only prescription, diagnosis, guaranteed outcome or silent replacement of an external cycling plan
- Broad app-owner match phrases and a declared supporting-destination relationship for masters-app queries
- Reciprocal discovery from `/app`, the product feed, MCP app record, knowledge graph, sitemap and both AI discovery files
- Two AI-citation benchmark prompts for the masters-app lane
- Links to the educational masters hub, over-50 strength guide, recovery owner, readiness tool, placement tool and independent masters-app comparison

## Measurement

- Day 7: confirm `/app/masters`, sitemap inclusion, app-feed discovery and both waitlist sources are live.
- Day 14: rerun the frozen regex and inspect whether Google selects `/app/masters` for segment intent while retaining `/app` for broad product intent.
- Day 28: compare impressions, page selection and branded/non-branded query mix; adjust copy only if the new page has enough stable data to interpret.
- Keep both app pages under the normal freshness guardrail unless a delivery, accuracy or conversion-tracking defect appears.
