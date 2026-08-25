# Cycling-over-50 overlap — GSC decision record

**Decision date:** 25 August 2026

**Source:** Google Search Console Performance for `sc-domain:roadmancycling.com`

**Performance window:** 24 May–23 August 2026 (three months; Search Console last updated approximately five hours before collection)

## Decision

- `/blog/cycling-over-50-training` remains the editorial owner for broad cycling-over-50 training intent.
- `/blog/cycling-over-50-evidence-based-training-guide` permanently redirects to the established owner.
- The useful research, source links and practical material from the July page were merged into the January owner.
- `/blog/joe-friel-fast-after-50-cycling-method` remains indexable because it owns a distinct named-expert and book-method intent.
- `/masters` remains the cluster-level knowledge owner; the consolidated guide is its age-50 supporting destination.

## Search Console evidence

With the query filter **Queries containing `cycling over 50`**, Search Console reported **2 clicks, 47 impressions, 4.3% CTR and average position 5.3**. The Pages table exposed four Roadman URLs:

| URL | Clicks | Impressions | Role after consolidation |
|---|---:|---:|---|
| `/blog/joe-friel-fast-after-50-cycling-method` | 2 | 29 | Named-expert / Fast After 50 method |
| `/blog/cycling-over-50-training` | 0 | 40 | Broad editorial owner |
| `/blog/strength-training-cyclists-over-50` | 0 | 1 | Narrow strength intent |
| `/blog/cycling-over-50-evidence-based-training-guide` | 0 | 1 | Redirected duplicate |

Search Console warns that filtered card totals and table rows can be partial, so page-row impressions need not sum to the card. The decision rests on the relative URL split and the all-query page evidence below, not on adding those rows together.

Across all queries in the same three-month window:

| Page | Clicks | Impressions | CTR | Average position |
|---|---:|---:|---:|---:|
| `/blog/cycling-over-50-training` | 78 | 3,290 | 2.4% | 15.7 |
| `/blog/cycling-over-50-evidence-based-training-guide` | 4 | 411 | 1.0% | 22.5 |

The incumbent URL therefore had **19.5× the clicks**, **8.0× the impressions**, a higher CTR and the stronger average ranking position. A body-text term-frequency cosine check measured **0.656 similarity** between the two broad guides, compared with 0.418 between the incumbent and the Joe Friel method page.

## Evidence and trust remediation

The merge also corrected claims that were too absolute for the cited evidence:

- replaced a blanket 72–96-hour recovery rule with an individual response framework;
- replaced the universal 1.8–2.2g/kg protein target with a qualified 1.2–1.6g/kg practical range for many active older adults;
- replaced “eight hours minimum” with the adult consensus floor of seven or more hours;
- removed claims that sarcopenia is almost entirely preventable or that one weekly schedule fits every rider;
- added five graded claims, named human review, primary-source links, evidence limitations and medical warning signs.

## Verification requirements

1. The retired URL returns a permanent redirect to `/blog/cycling-over-50-training`.
2. The canonical URL returns 200, self-canonicalises and remains in the sitemap.
3. The retired file and sitemap entry are absent.
4. Active topic maps, answer routing, AI benchmark prompts and internal links reference only the canonical URL.
5. The canonical page exposes author, reviewer, reviewed date, evidence-graded claims and direct primary-source links.
6. The Joe Friel and strength-training pages remain indexable with their distinct intents intact.
