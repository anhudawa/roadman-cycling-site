# Blog Accuracy — Slice AD (32 posts)

Fact-check pass over 32 blog posts (files alphabetical `derek-teel-*` → `lachlan-morton-*`). Focus: physiological claims with numbers, expert attributions, study citations, pro-rider facts, cycling-scene facts.

## 1. Files edited (11 of 32)

- `content/blog/derek-teel-best-exercises-cyclists.mdx`
- `content/blog/eating-like-pidcock-60-days.mdx`
- `content/blog/every-roadman-episode-with-dan-lorang.mdx`
- `content/blog/every-roadman-episode-with-stephen-seiler.mdx` (updatedDate only)
- `content/blog/fast-talk-vs-cycling-podcast-vs-roadman.mdx`
- `content/blog/fasted-vs-fueled-cycling.mdx`
- `content/blog/how-much-does-online-cycling-coach-cost-2026.mdx`
- `content/blog/how-to-periodise-cycling-season.mdx`
- `content/blog/how-to-structure-cycling-training-plan.mdx`
- `content/blog/indoor-cycling-for-triathletes-winter-plan.mdx`
- `content/blog/john-archibald-ride-faster-than-98-percent.mdx`

The remaining 21 posts were read in full and verified; no edits required.

## 2. Factual corrections

### `every-roadman-episode-with-dan-lorang.mdx`
- **Before:** "announced in April 2026 that he will leave Red Bull-Bora-Hansgrohe at the end of the 2026 season."
- **After:** "announced in early 2026 that he will leave Red Bull-Bora-Hansgrohe after the 2026 Tour de France."
- **Source:** [Red Bull-Bora-Hansgrohe official announcement](https://www.redbullborahansgrohe.com/en/news/dan-lorang-to-leave-red-bull-bora-hansgrohe) — Lorang leaves at the end of July 2026 (after the Tour), not at end of season. This was wrong in three places; replace_all used.

### `fast-talk-vs-cycling-podcast-vs-roadman.mdx`
- **Before:** "Over 1,400 guest interviews mean..."
- **After:** "Over 1,300 episodes mean..."
- **Source:** Brand guardrail (1,300+ episodes, NOT 1,400+). Matches Anthony's own About bio.

### `fast-talk-vs-cycling-podcast-vs-roadman.mdx`, `how-much-does-online-cycling-coach-cost-2026.mdx`, `how-to-periodise-cycling-season.mdx`, `how-to-structure-cycling-training-plan.mdx`, `indoor-cycling-for-triathletes-winter-plan.mdx`
- **Before:** "John Wakefield, Director of Development at Red Bull-Bora-Hansgrohe" (variant phrasings)
- **After:** "Director of Coaching and Sports Science" / "John Wakefield at Red Bull-Bora-Hansgrohe"
- **Source:** [Wakefield LinkedIn](https://www.linkedin.com/in/john-wakefield-a7449785/) and [team profile](https://www.redbullborahansgrohe.com/en/news/john-wakefield-and-tim-meeusen-take-on-new-roles-at-the-team). His actual title is Director of Coaching, Sports Science & Technical Development; "Director of Development" was incorrect.

### `john-archibald-ride-faster-than-98-percent.mdx`
- **Before:** "Archibald is a British track cyclist who has competed at the highest level, set national records…"
- **After:** "Archibald is a British time-trial and track specialist who has competed at the highest level, holds UK national time-trial records (including the 100-mile and 50-mile records)…"
- **Source:** [Cycling Weekly — 100-mile TT record (2024)](https://www.cyclingweekly.com/news/31mph-for-100-miles-how-john-archibald-broke-one-of-the-toughest-time-trial-records), [Wikipedia](https://en.wikipedia.org/wiki/John_Archibald_(cyclist)). The guardrail explicitly flags him as a time-trial specialist; "track cyclist" alone is incomplete.

### `indoor-cycling-for-triathletes-winter-plan.mdx`
- **Before:** "Tim Spector's work on metabolic flexibility doesn't mean training fasted."
- **After:** "Building metabolic flexibility doesn't mean training fasted." (Spector attribution removed)
- **Rationale:** Tim Spector's research is microbiome / individualised nutrition, not metabolic flexibility per se. Guardrail explicitly warns against over-attributing to Spector.

### `fasted-vs-fueled-cycling.mdx`
- **Before:** "Louise Burke's 2018 research on race-walkers demonstrated that chronic low-carbohydrate availability impaired performance…"
- **After:** Corrected year (Burke et al., 2017 – the seminal race-walker paper – plus 2020 replication) with DOI-linked PubMed citations.
- **Source:** [Burke et al. 2017, J Physiol](https://pubmed.ncbi.nlm.nih.gov/28012184/); [Burke et al. 2020, PLOS One](https://pubmed.ncbi.nlm.nih.gov/32497061/).

### `fasted-vs-fueled-cycling.mdx`
- **Before:** "Tim Spector's work on metabolic health reinforces a related point: chronic under-fuelling degrades gut health…"
- **After:** "Tim Spector's microbiome and metabolic-health research reinforces a related point: food diversity and regular fuelling support the gut microbiome and blood-sugar stability…"
- **Rationale:** Kept Spector reference in his legitimate microbiome/blood-sugar lane; removed the stretch to "under-fuelling" specifically.

## 3. Citations added (peer-reviewed)

### `derek-teel-best-exercises-cyclists.mdx`
- FAQ on strength training + cycling economy → softened "4–8% economy improvement" claim (not universally supported; Rønnestad 2015 showed no economy change in elite cyclists) and cited [Sunde et al. 2010, JSCR](https://pubmed.ncbi.nlm.nih.gov/19855311/).
- Main text → added [Sunde et al. 2010](https://pubmed.ncbi.nlm.nih.gov/19855311/) and [Rønnestad & Mujika 2014, Scand J Med Sci Sports](https://pubmed.ncbi.nlm.nih.gov/23914932/).

### `eating-like-pidcock-60-days.mdx`
- Periodised nutrition claim → added [Impey et al. 2018, Sports Medicine (Fuel for the Work Required framework)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5889771/).
- 90–120 g/hr carbohydrate claim → added [Jeukendrup 2014, Sports Medicine](https://pmc.ncbi.nlm.nih.gov/articles/PMC4008807/).

### `fasted-vs-fueled-cycling.mdx`
- Burke race-walker work → [PubMed 28012184](https://pubmed.ncbi.nlm.nih.gov/28012184/), [PubMed 32497061](https://pubmed.ncbi.nlm.nih.gov/32497061/).
- Marquet sleep-low claim tightened to the actual 20 km TT improvement (~3%) with [PubMed 26741119](https://pubmed.ncbi.nlm.nih.gov/26741119/).

## 4. Softened claims

- Derek Teel post: "heavy resistance training improves cycling economy by 4–8%" → softened to "Sunde and colleagues reporting roughly a 5% improvement after eight weeks; results vary by protocol and population." Rønnestad 2015 (25-week study) actually found no economy change in elite cyclists, so the old blanket figure was stronger than the literature supports.
- Indoor cycling for triathletes post: removed speculative Tim Spector attribution ("work on metabolic flexibility") — kept the practical point that training fasted is not the same as building metabolic flexibility.

## 5. Flagged for review

- `every-roadman-episode-with-dan-lorang.mdx` and `fast-talk-vs-cycling-podcast-vs-roadman.mdx` — "Episode 1 / Episode 2 / etc." sections are schematic summaries, not literal episode titles. Worth a future pass to replace with the real episode slugs/titles once the archive is indexed.
- `how-we-record-the-roadman-podcast.mdx` — claims "1,300+ interviews" and "over a million monthly listens." Both align with guardrail; no change needed. But if audience numbers grow, update here.
- `is-a-cycling-coach-worth-it.mdx` — specific athlete FTP/wattage gains ("+90 watts" for Damien; "+15%" for Brian at 52) are testimonial claims. Not externally verifiable by me; recommend the growth team confirm these match what's on the testimonials page.
- `ironman-bike-training-plan-16-weeks.mdx` — the final paragraph ends mid-sentence ("adding an extra run session in Phase"). This is a content-completeness issue, not a factual error, but worth flagging to editorial.
- `eating-like-pidcock-60-days.mdx` and `how-pro-cyclist-trains-60-days.mdx` — first-person "I tried X for 60 days" claims (weight stable, +18W FTP, +0.25 W/kg). No way to verify independently; assume author honesty.

## 6. What was checked and left unchanged

- Greg LeMond: 3× Tour champion (1986, 1989, 1990); 1987 hunting accident, 37 pellets; 8-second 1989 TT margin. All correct.
- Rosa Kloser: 2024 Unbound Gravel 200 winner (NOT "Gravel World Champion"). Post already phrased correctly.
- Dan Bigham: "former UCI Hour Record holder" is correct (held briefly in 2022 before Ganna). No "Ineos" mis-attribution found in this slice.
- Stephen Seiler: American-born, University of Agder, polarised training — all correct.
- Joe Friel: author of The Cyclist's Training Bible — correct.
- Lachlan Morton: EF Education rider; 2021 Alt Tour, Brest → Paris, 5,510 km, finished ahead of peloton — all correct.
- Jan Frodeno Ironman World titles 2015/2016/2019 — correct.
- Andy Pruitt: founder of Boulder Center for Sports Medicine, Specialized Body Geometry consultant — correct.
- Fred Whitton Challenge: ~180 km, ~3,500 m climbing, Hardknott ~30% gradient, early May — correct.

## 7. Commit hash

_Set after commit._
