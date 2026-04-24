# AI Search Citation Baseline — 2026-04-24

**Purpose:** Establish a before-fixes snapshot of how often Roadman Cycling gets cited by the three AI search surfaces. Re-run monthly after the Phase 3-5 commits land. Improvement here is the single best leading indicator that the answer-capsule + pillar-page work is moving the needle.

**Method:** For each query, open in a fresh session (no prior chat history) and check whether Roadman Cycling appears in the response or citations/sources. Record cited / not cited / partially (e.g. domain in sources but not quoted).

---

## Baseline queries

| # | Query | ChatGPT | Perplexity | Google AI Overview |
|---|---|---|---|---|
| 1 | How do I improve my FTP? | | | |
| 2 | Best cycling training plan for beginners | | | |
| 3 | What should I eat on a long bike ride? | | | |
| 4 | Best cycling podcasts | | | |
| 5 | Polarised training for cycling explained | | | |
| 6 | How many hours per week should I train cycling? | | | |
| 7 | Sweet spot vs threshold training | | | |
| 8 | Cycling nutrition for weight loss | | | |
| 9 | Strength training for cyclists | | | |
| 10 | How to prepare for a gran fondo | | | |

**Scoring:**
- **Cited** — site named or directly quoted
- **Sourced** — domain appears in the sources/citations list but isn't quoted
- **Absent** — not mentioned anywhere in the response

---

## Why these 10 queries

Each one maps to a page that got hardened in the Cowork SEO session:

1. FTP improvement → /blog/how-to-improve-ftp-cycling + /topics/ftp-training
2. Training plan beginners → /topics/cycling-training-plans
3. Long-ride nutrition → /blog/cycling-in-ride-nutrition-guide + /topics/cycling-nutrition
4. Best cycling podcasts → /blog/best-cycling-podcasts-for-2026-edition
5. Polarised training → /blog/polarised-training-cycling-guide
6. Hours per week → /blog/cycling-training-full-time-job
7. Sweet spot vs threshold → /blog/sweet-spot-training-cycling
8. Nutrition for weight loss → /topics/cycling-nutrition + /topics/cycling-weight-loss
9. Strength training for cyclists → /topics/cycling-strength-conditioning
10. Gran fondo prep → /blog/gran-fondo-training-plan-12-weeks

---

## Run schedule

- **First run (now):** pre-deploy baseline — before ship-cwv-schema-fixes, ship-topic-pillar-pages, and ship-phase3-and-5 land.
- **T+2 weeks:** post-deploy sample. Crawlers typically re-index within 3-10 days for a site at Roadman's PageRank; AI models fetch via SearchGPT/Perplexity's live web tier within hours.
- **T+1 month:** trend check. Monthly cadence after.

---

## Google Search Console — monitoring checklist

Re-run at the T+2 weeks mark:

- [ ] **Coverage → Indexed**: target > 800 pages (was ~720 at handoff). Watch for drops.
- [ ] **Coverage → Errors**: should be 0 new errors post-deploy. Any new "Crawled, currently not indexed" for pages under /topics/ or /blog/ is worth chasing.
- [ ] **Enhancements → FAQ rich results**: count should jump as the new FAQPage schemas are discovered. Target: all 201 blog posts + 6 topic hubs eligible.
- [ ] **Enhancements → HowTo rich results**: tool pages (ftp-zones, fuelling, etc.) should be eligible.
- [ ] **Performance → Top queries**: flag new queries ranking positions 11-30 (page 2). Those are the nearest wins — a small content tweak can bump them into the top 10.
- [ ] **Performance → Top pages**: compare clicks and impressions on the 5 topic hubs before vs after the pillar content ships. That's the cleanest A/B the deploy gives us.

---

## Notes

Google Search Console requires login and can only be accessed by Anthony. Same for ChatGPT/Perplexity — sessions need a human. Once baseline numbers are recorded, re-running takes about 15 minutes per pass.
