# GSC decision — high-impression Tour de France stage results

**Decision date:** 26 August 2026  
**Owners:** `/tour-de-france/stage/1`, `/11`, `/13`, `/14`  
**Change:** replace pre-race predictions with primary-source result records

## Search Console evidence

Exact-query Web performance in the active Search Console range:

| Query                          | Owner                      | Clicks | Impressions |  CTR | Avg position |                Owner share |
| ------------------------------ | -------------------------- | -----: | ----------: | ---: | -----------: | -------------------------: |
| `tour de france stage 1`       | `/tour-de-france/stage/1`  |      4 |         778 | 0.5% |          9.7 |     772 of 778 impressions |
| `stage 11 tour de france 2026` | `/tour-de-france/stage/11` |      6 |         705 | 0.9% |          8.0 |     703 of 705 impressions |
| `tour de france stage 13`      | `/tour-de-france/stage/13` |      3 |       1,048 | 0.3% |          9.6 | 1,040 of 1,048 impressions |
| `stage 14 tour de france 2026` | `/tour-de-france/stage/14` |      7 |         689 | 1.0% |          8.7 |     689 of 689 impressions |

Together these exact queries produced 20 clicks from 3,220 impressions. Each stage URL already owns virtually all of its query history, so the job is freshness, answer completeness and CTR rather than consolidation.

## Source-reviewed result record

| Stage | Winner            |    Time | Second                  | Third                      |
| ----: | ----------------- | ------: | ----------------------- | -------------------------- |
|     1 | Jonas Vingegaard  |   21:47 | Filippo Ganna +8s       | Tadej Pogačar +12s         |
|    11 | Søren Wærenskjold | 3:10:06 | Olav Kooij same time    | Jasper Philipsen same time |
|    13 | Mauro Schmid      | 4:06:58 | Harold Tejada same time | Tom Pidcock +2s            |
|    14 | Tadej Pogačar     | 4:00:07 | Isaac del Toro +38s     | Paul Seixas +38s           |

Every record cites the official Tour de France stage report, classification and route page. The visible result replaces the speculative tactical section, the SportsEvent status becomes completed, and FAQ answers expose the winner, podium and race story in answer-ready form.

## Measurement checkpoints

- **5 September 2026:** confirm recrawl, result-title impressions and whether each URL remains the dominant owner.
- **26 September 2026:** compare clicks, CTR, average position and owner impression share with this baseline.

Success means maintaining at least 95% owner share while improving combined CTR above the 0.62% baseline. Ranking gains without result-snippet CTR gains are not sufficient.
