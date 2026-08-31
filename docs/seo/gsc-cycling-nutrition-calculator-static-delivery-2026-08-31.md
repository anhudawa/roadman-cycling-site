# Cycling nutrition calculator static-delivery fix — 31 August 2026

## Decision

Keep `/tools/fuelling` as the canonical owner for cycling nutrition calculator,
cycling fuelling calculator and carbs-per-hour calculator intent. Do not rewrite
the answer, evidence or title again before the 3 September fixed owner review.

Remove the confirmed delivery defect now: the public tool was reading
authentication cookies and rider-profile data during the page request. That made
an otherwise evergreen search owner private, uncached and slow for every crawler
and anonymous rider.

## Search Console before-state

Source: Google Search Console, exact page containing `/tools/fuelling`, Web,
latest complete 28 days versus the previous 28 days, captured 31 August 2026.
Google marks filtered tables as potentially partial.

| Signal | Latest 28 days | Previous 28 days | Change |
| --- | ---: | ---: | ---: |
| Clicks | 675 | 885 | -210 |
| Impressions | 17,891 | 21,929 | -4,038 |
| CTR | 3.8% | 4.0% | -0.2 points |
| Average position | 5.6 | 4.3 | -1.3 positions |

The largest visible query loss was `cycling nutrition calculator`: 19 clicks
and 3,574 impressions versus 44 clicks and 5,527 impressions. Higher-specificity
queries remained useful: `cycling carb calculator` earned 29 clicks from 44
impressions and `carbs per hour cycling calculator` earned 24 from 72.

## Confirmed production defect

A cold public request captured before this change returned:

- `Cache-Control: private, no-cache, no-store`
- `x-vercel-cache: MISS`
- 7.62-second time to first byte

The statically generated gear calculator comparison returned
`x-vercel-cache: PRERENDER` and began in 0.58 seconds in the same check. One
request is not a lab benchmark, but the response headers and route classification
confirm the architectural problem independently of network variation.

## Change

- Force the public calculator page to static generation.
- Remove cookie, session and profile-database reads from the page request.
- Load optional signed-in weight and FTP defaults after hydration from a narrow
  private endpoint.
- Preserve both rider-profile and Method-session prefills, including pounds to
  kilograms conversion.
- Do not overwrite values a rider types while the private request is in flight.
- Keep the private response `no-store`; anonymous riders receive the complete
  calculator with a null prefill.

## Release gate

- Unit tests cover anonymous, rider-session and Method-session responses.
- Search-owner regression test prevents auth/database imports returning to the
  public page.
- Type check, lint, SEO quality audit and production build must pass.
- The build route table must classify `/tools/fuelling` as static.
- Live headers must change from private/MISS to a public prerendered response.
- Calculator arithmetic and signed-out interaction must remain unchanged.

## Measurement

The existing fixed owner checkpoint remains 3 September 2026. Record delivery
headers and repeat response samples immediately after release; judge ranking and
click movement only from complete seven- and 28-day cohorts. The current content
refresh and this delivery fix have separate mechanisms, so retain both release
dates in later analysis.
