# Wet-riding search consolidation — 26 August 2026

## Search Console baseline

Page-filtered Google Search Console performance for 24 May–23 August 2026 showed 0 clicks and 0 impressions for each duplicate answer URL:

- `/answers/best-tyre-pressure-road-cycling`
- `/answers/cycling-in-rain-tips-and-gear`
- `/answers/cycling-in-wet-conditions-safety`

The established owners are `/blog/cycling-tyre-pressure-guide` for tyre-pressure information, `/tools/tyre-pressure` for the calculation task, and `/blog/cycling-in-rain-guide` for wet-riding intent.

## Decision

Remove the three zero-traffic answer records so they leave the answer inventory and sitemap. Permanently redirect the old URLs to the relevant established pillar. Repoint all internal references directly to the final owner rather than relying on redirect hops.

The wet-riding, wet-descending, wet-racing, braking and cornering guides now share one bounded pressure position: calculate from complete system weight and measured mounted width, obey tyre and rim compatibility and limits, and test only 1-2 PSI changes. They no longer prescribe a universal 5-10 PSI rain reduction or a universal wet stopping-distance percentage.

The release also aligns the tubeless comparison and setup answers with the same tyre-system hierarchy. The exact tyre-rim pairing, component pressure limits and product instructions come first; independent rolling-resistance tests are labelled as setup-specific. Universal watt, puncture-rate, sealant-volume and maintenance-interval claims were removed.

## Measurement

- Confirm all three legacy URLs return a permanent redirect after production deployment.
- Confirm the final owners return 200, self-canonicalise and remain in the sitemap.
- Compare impressions, clicks and query ownership after 7 days on 3 September 2026 and after 28 days on 24 September 2026.
- Treat migrated impressions as a positive consolidation signal; do not judge the change from the retired URLs alone.
