# Post-ride recovery food owner — 31 August 2026

## Search Console baseline

Google Search Console was read while signed in to the `roadmancycling.com`
domain property. The window is the three months ending 29 August 2026.

### Page performance

`/blog/best-recovery-foods-after-cycling` recorded:

- 115 clicks;
- 13,418 impressions;
- 0.9% CTR;
- average position 7.4; and
- 4,083 impressions in Google's generative-AI features.

This is a high-impression, first-page CTR and answer-trust opportunity. The page
already receives enough exposure to improve without changing its established
URL.

### Leading visible queries

| Query | Clicks | Impressions |
| --- | ---: | ---: |
| `post ride meal` | 2 | 24 |
| `what to eat after cycling` | 1 | 78 |
| `what to eat after cycling to lose weight` | 1 | 40 |
| `cycling recovery food` | 1 | 39 |
| `post ride recovery food` | 1 | 19 |
| `cycling recovery meals` | 1 | 19 |
| `best recovery drink for cyclists` | 1 | 13 |
| `smoothie for cyclists 2026` | 0 | 260 |
| `smoothie for cyclists 2025` | 0 | 173 |

The page also appeared within the broader `cycling recovery` family with two
clicks from 270 visible impressions, more impressions than any other page in
that filtered table. The family spans distinct food, active recovery, general
recovery and recovery-week jobs; those pages should remain separate.

## Ownership decision

- Keep `/blog/best-recovery-foods-after-cycling` as the broad owner for **what
  to eat after cycling**, post-ride meals, recovery drinks and recovery
  smoothies.
- Keep `/blog/post-ride-recovery-nutrition-cyclists` as a narrower supporting
  explainer rather than creating another broad list.
- Keep `/blog/cycling-recovery-tips` as the non-nutrition recovery owner.
- Keep `/blog/cycling-active-recovery-rides-guide` for the active-versus-rest
  decision.
- Keep weight-loss content focused on the wider energy-balance problem and link
  back to the recovery-food owner for the post-ride decision.

## Problems corrected

- A 30–60-minute window was presented as equally urgent after every ride.
- One fixed 3:1 or 4:1 carbohydrate-to-protein ratio was called optimal.
- An old carb-plus-protein result was presented without the later meta-analysis
  showing no added glycogen-resynthesis benefit when carbohydrate is adequate.
- The nine-man Karp trial was used to declare chocolate milk equivalent to all
  commercial recovery products and one tenth of the price.
- Tart cherry was described as working like ibuprofen without gut damage.
- A high-dose alcohol experiment averaging 12 standard drinks was presented as
  evidence that two or three pints reduce muscle protein synthesis by 37%.
- Fixed fat, fluid and supplement rules were stated without the rider and
  turnaround context needed to use them safely.

## Changes shipped

1. Reframed the search title and opening around `what to eat after cycling` and
   supplied seven direct meal or snack options.
2. Split rapid recovery (about eight hours or less) from normal next-day and
   longer recovery instead of using one magic window.
3. Added situational carbohydrate and protein ranges with explicit boundaries,
   practical meal examples, weight-loss context and dairy-free options.
4. Added dedicated, query-matched sections for recovery smoothies, chocolate
   milk, tart cherry, alcohol and hydration.
5. Added review metadata, evidence level, cited claims and visible primary
   PubMed sources.
6. Added `/app?source=recovery-nutrition` to the one existing Beehiiv app
   waitlist so the future recovery product can learn which job drove demand.
7. Pinned the owner in LLM discovery and added AI benchmark prompt 353 plus
   recurring IndexNow coverage.

## Evidence boundary

- The short-recovery carbohydrate review (PMID 33507402) included 29 trials and
  246 participants. Its scope was recovery periods of eight hours or less. It
  found that carbohydrate improved glycogen resynthesis over water and that
  adding protein did not improve it over adequate carbohydrate.
- The chocolate-milk cyclist trial (PMID 16676705) included nine trained men in
  a crossover laboratory protocol. It supports chocolate milk as one viable
  option, not a universal best product.
- The tart-cherry review (PMID 41945263) included 19 athlete trials and found
  selected effects alongside substantial heterogeneity and low-to-moderate
  certainty; no pooled soreness effect was significant.
- The alcohol trial (PMID 24533082) included eight active men and approximately
  12 standard drinks. Its 37% result cannot be assigned to two or three pints.

## Measurement

Do not treat recrawl as a ranking result. Compare equivalent trailing 28-day
windows only after the refreshed page has had at least 21 days to be recrawled
and served.

Track:

- page clicks, impressions, CTR and average position;
- ownership for `what to eat after cycling`, `post ride meal`, `cycling recovery
  food`, `cycling recovery meals`, `recovery smoothie for cyclists` and the
  weight-loss modifier;
- Google AI feature impressions and whether answers preserve the short-
  turnaround boundary;
- app-waitlist conversion from `roadman-app-waitlist-recovery-nutrition-*`;
- crawl/index state and canonical selection; and
- monthly citation accuracy for AI benchmark prompt 353.

