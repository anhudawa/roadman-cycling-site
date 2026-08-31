# FTP calculator static-delivery fix — 31 August 2026

## Decision

Keep `/tools/ftp-zones` as the canonical owner for unqualified FTP calculator
and seven-zone cycling power intent. Preserve the published answer, zone model
and search-owner boundaries while removing a confirmed delivery defect.

## Search Console before-state

Source: Google Search Console, Web, latest complete 28 days versus the previous
28 days, captured 31 August 2026. Google marks filtered tables as potentially
partial.

The exact query `ftp calculator` recorded 44 clicks, 4,522 impressions, 1.0%
CTR and average position 8.2. The general owner page view recorded 29 clicks
from 2,218 impressions. These figures are the pre-release baseline; the first
fixed post-release review is 5 September 2026.

## Confirmed production defect

A cold anonymous request captured before this change returned:

- `Cache-Control: private, no-cache, no-store`
- `x-vercel-cache: MISS`
- 7.41-second time to first byte

The route was reading authentication cookies and rider-profile data during the
public page request solely to provide an optional saved FTP. That made a stable,
high-demand calculator private and uncached for crawlers and anonymous riders.

## Change

- Force the public FTP calculator to static generation.
- Remove cookie, session and profile-database reads from the page request.
- Load an optional signed-in FTP after hydration from the same narrow private
  profile endpoint used by the fuelling calculator.
- Consolidate the two calculators onto one private defaults endpoint.
- Do not overwrite an FTP the rider types while the private request is in flight.
- Keep the private response `no-store`; anonymous riders still receive the full
  calculator with a null prefill.

## Release gate

- Unit tests cover anonymous, rider-session and Method-session defaults.
- Search-owner tests prevent auth or database imports returning to either public
  calculator page.
- Type check, lint, SEO quality audit and production build must pass.
- The build route table must classify both calculators as static.
- Live headers must change from private/MISS to a public prerendered response.
- A signed-out 250 W calculation must still produce the seven published zones.

## Measurement

Record delivery headers and repeat-response samples immediately after release.
At the fixed 5 September checkpoint, compare exact-query ownership, clicks,
impressions, CTR and position without changing the page during the cohort. Use
complete seven- and 28-day windows for ranking conclusions.
