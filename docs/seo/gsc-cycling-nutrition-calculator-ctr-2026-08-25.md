# Google Search Console decision: cycling nutrition calculator CTR

Decision date: 25 August 2026

Baseline window: three months ending 24 August 2026

Property: `https://roadmancycling.com/`

## Why this page was selected

The established tool `/tools/fuelling` recorded **2,480 clicks, 57,640
impressions, 4.3% CTR and average position 4.7**. The exact query `cycling
nutrition calculator` recorded **91 clicks, 14,334 impressions, 0.6% CTR and
average position 1.7**.

This is a title and answer-quality opportunity, not a ranking-discovery
problem. The page already ranks near the top, but its old title led with
`Cycling Fuelling Calculator` and did not exactly name the dominant query.

## Query and page evidence

The exact-query page split was:

| Page | Clicks | Impressions |
| --- | ---: | ---: |
| `/tools/fuelling` | 91 | 14,323 |
| `/tools/energy-availability` | 0 | 162 |
| `/tools/fuel-planner` | 0 | 69 |

The small overlap does not justify a redirect or consolidation. The fuelling
tool is already the unambiguous owner; the release strengthens that ownership
without changing its URL.

Leading queries for the page included:

| Query | Clicks | Impressions |
| --- | ---: | ---: |
| `cycling nutrition calculator` | 91 | 14,323 |
| `carbs per hour cycling` | 37 | 931 |
| `how many carbs per hour cycling` | 28 | 805 |
| `cycling carb calculator` | 92 | 151 |
| `carbs per hour cycling calculator` | 76 | 245 |
| `cycling fuel calculator` | 72 | 137 |

`carb cycling calculator` is a different diet intent. The page does not target
or add that phrase even though it generated 617 impressions.

## Content-quality finding

The old landing copy mixed useful inputs with claims that were more certain
than the model or source literature permits. In particular, it described a
calculated carbohydrate burn rate as precise, implied body weight changed the
carbohydrate recommendation when the implementation uses it only for fluid,
treated 2:1 glucose:fructose as the universal high-intake ratio, and presented
fluid and sodium population estimates as prescriptions.

The release:

1. leads the title, H1, breadcrumb and internal tool labels with `Cycling
   Nutrition Calculator` while preserving `fuelling`, `carbs per hour` and
   `cycling fuel calculator` language;
2. labels every output as a planning estimate that must be rehearsed;
3. explains exactly which inputs drive carbohydrate versus fluid;
4. separates routine 30–90 g/hr planning from specialised 90–120 g/hr
   strategies;
5. warns against overdrinking and body-mass gain as well as dehydration;
6. adds visible author, review date, review scope, corrections path and primary
   sources; and
7. connects the WebPage and WebApplication entities with `dateModified`,
   `reviewedBy`, `author`, `mainEntity` and source citations.

Primary sources checked:

- Romijn et al. 1993, PMID `8214047`
- Coyle et al. 1992, PMID `1501563`
- Jeukendrup 2013, PMID `23765351`
- Norte et al. 2026, PMID `42322010`
- Baker et al. 2016, PMID `26070030`
- ACSM exercise and fluid replacement position stand, PMID `17277604`
- NATA fluid replacement consensus statement, PMID `28985128`

Anthony Walsh completed primary-source verification. This is not represented
as review by a registered dietitian or clinician.

## Measurement plan

Do not compare partial post-release days with the baseline.

- Seven-day checkpoint: 25–31 August 2026, earliest reliable review 3
  September 2026.
- Twenty-eight-day checkpoint: 25 August–21 September 2026, earliest reliable
  review 24 September 2026.
- Track `/tools/fuelling`, the exact query `cycling nutrition calculator`, the
  `cycling carb calculator`, `carbs per hour` and `cycling fuel calculator`
  families, and non-brand mobile versus desktop CTR.
- Primary success metric: exact-query CTR rises from 0.6% without material loss
  from average position 1.7.
- Secondary success metrics: page-wide CTR rises from 4.3%, title rewrites
  decline, and the page remains the dominant URL for the exact query.

Google Search Console validation and manual request-indexing actions remain a
separate, user-approved write step.
