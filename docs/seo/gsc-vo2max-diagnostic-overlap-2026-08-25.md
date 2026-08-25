# VO2max diagnostic overlap — GSC decision record

**Decision date:** 25 August 2026

**Source:** Google Search Console Performance for `sc-domain:roadmancycling.com`

**Performance window:** 27 July–23 August 2026 (28 days)

## Decision

- `/blog/vo2max-cycling-fixable-reasons-low` remains the canonical Roadman answer to “why is my VO2 max so low?”, low-score causes and diagnostic next steps.
- `/blog/vo2max-training-cyclists-seven-reasons` permanently redirects to that incumbent because it repeated the same seven-reasons diagnostic with 0.652 body-text cosine similarity and no durable independent intent.
- The following URLs remain separate because their job and existing demand are distinct:
  - `/blog/cycling-vo2max-intervals` — interval protocols and execution;
  - `/blog/vo2max-intervals-cycling-session-guide` — session-level guidance;
  - `/blog/vo2-max-workouts-cyclists-over-40` — masters-specific programming; and
  - `/blog/vo2max-cycling-what-your-number-means-guide` — measurement and interpretation.

## Search Console evidence

| URL | Clicks | Impressions | CTR | Position | Role after consolidation |
| --- | ---: | ---: | ---: | ---: | --- |
| `/blog/vo2max-cycling-fixable-reasons-low` | 38 | 6,920 | 0.5% | 6.5 | Canonical low-score diagnostic |
| `/blog/vo2max-training-cyclists-seven-reasons` | 27 | 3,930 | 0.7% | 7.9 | Redirected diagnostic duplicate |
| `/blog/cycling-vo2max-intervals` | 408 | 19,800 | 2.1% | 4.9 | Interval-protocol owner |
| `/blog/vo2max-intervals-cycling-session-guide` | 49 | 3,110 | 1.6% | 7.9 | Session-guide owner |
| `/blog/vo2-max-workouts-cyclists-over-40` | 174 | 8,700 | 2.0% | 6.6 | Masters-workout owner |
| `/blog/vo2max-cycling-what-your-number-means-guide` | 38 | 5,290 | 0.7% | 6.8 | Measurement and benchmark owner |

On mobile, the incumbent diagnostic recorded 4 clicks and 2,154 impressions at position 6.6. The exact query `why is my vo2 max so low` produced 503 mobile impressions, one click and position 8.7, all but two impressions assigned to the incumbent article. This supports improving the existing URL rather than publishing another answer.

The later duplicate's visible queries included `is vo2 max genetic or trained`, `aerobic base vs vo2 max`, `vo2max training` and `is vo2 max trainable`. These questions are now answered on the incumbent diagnostic or routed to the retained interval guide.

## Trust corrections merged into the incumbent

The previous diagnostic and its duplicate made several claims more certain than the evidence allowed. The consolidated guide now:

- distinguishes a wearable estimate from laboratory respiratory-gas measurement;
- replaces “rarely genetics” with the HERITAGE study's more defensible finding that baseline and training response vary and have a familial component;
- removes the universal prescription of two 4 x 4-minute sessions every week;
- describes the Seiler 4 x 8-minute result as a small trial rather than a universal gold standard;
- removes a universal eight-hour sleep minimum and the claim that one short night lowers haemoglobin;
- removes a standalone ferritin cutoff and tells readers to seek contextual clinical interpretation before supplementing iron; and
- adds clear medical boundaries for an abrupt unexplained decline or warning symptoms.

## Verification requirements

1. The canonical diagnostic returns 200, self-canonicalises and remains in the sitemap.
2. The retired diagnostic returns a permanent redirect to the canonical URL and is absent from the sitemap.
3. Active topic maps, related-post routes and the full machine-readable index no longer emit the retired slug.
4. The separate measurement, interval, session and masters pages continue to return 200.
5. The canonical page exposes its updated review date, author/reviewer, cited claims and primary-source links.
