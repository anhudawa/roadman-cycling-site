# Blog Quality Audit — content/blog/ (2026-06-10)

Sitewide quality pass across all **374** blog posts in `content/blog/`. Checked for: slop words, wrong CTAs, non-USD pricing, Dan Lorang misattribution, Vekta mentions, barbell prescriptions, and broken internal links. Violations found were fixed in the same pass; this report records what was checked, what was found, and what was changed.

## Summary

| Check | Result | Fixed |
|---|---|---|
| Slop words | 1 genuine violation (`seamless`) | ✅ 1 |
| Wrong CTAs | 0 — all Skool links are canonical | — |
| Non-USD pricing | 2 colloquial GBP ("quid") refs | ✅ 2 |
| Dan Lorang misattribution | 2 factual errors | ✅ 2 |
| Vekta mentions | 0 | — |
| Barbell prescriptions | 0 violations (all correctly framed) | — |
| Broken internal links | 78 dead frontmatter refs | ✅ 78 |

**Total: 83 fixes across 28 files.** No push (per workflow).

---

## 1. Slop words

Searched for the banned list (`unlock`, `dive into`, `game-changer`, `journey`, `landscape`, `leverage`, `tapestry`, `delve`, `harness`, `navigate`, `elevate`) plus the wider brand AI-slop list (`seamless`, `unleash`, `robust`, `synergy`, etc.).

Almost all raw matches were **legitimate, not slop**:
- `leverage` — every instance is either the idiom *"highest-leverage"* (acceptable) or literal physical leverage (handlebars, cranks). No verb usage ("leverage your X") anywhere.
- `elevate` — every instance is physiological (*"elevate heart rate"*, *"elevate blood glucose"*, *"elevate muscle protein synthesis"*). Not slop.
- `navigate` — only literal (*"navigate tight trees"* on an MTB).
- `unlock` — only literal Zwift game mechanics (*"jersey unlocks, levels"*), and one inside a **verbatim guest quote** from Ben Hoffman (*"unlocking the potential of the mind"*) — quotes are not altered.

**Fixed (1):**
- `wahoo-vs-garmin-cycling-computers.mdx:116` — *"the integration is seamless"* → *"and it just works"*. `seamless` is a banned generic intensifier.

## 2. CTAs

All `skool.com/*` links across the blog point to the canonical **`https://www.skool.com/roadmancycling`**. The two non-canonical regex hits were prose mentions ("the Roadman Skool community", "the Roadman free Skool community"), not links. **No fixes needed.**

## 3. Pricing (must be USD)

Roadman's digital products are already quoted in USD everywhere ($195/mo community, $297–397/mo Method, $65 courses).

The euro figures in `bike-fit-guide-cyclists.mdx`, `what-to-expect-cycling-training-camp.mdx`, `why-girona-best-place-train-cycling.mdx`, and `girona-training-camps-2026.mdx` are **real, Europe-based training-camp and local-cost prices** (e.g. €995 Girona camps). These were **left unchanged** — converting a published product price to USD would misstate an actual figure, which is a worse error than a currency mismatch.

**Fixed (2)** — colloquial GBP ("quid") on generic third-party gear:
- `is-a-cycling-coach-worth-it.mdx:95` — *"15-20 quid a month"* → *"$20-25 a month"* (training-app subscription).
- `mtb-suspension-setup-complete-guide.mdx:66` — *"about 25 quid"* → *"about $30"* (shock pump).

## 4. Dan Lorang misattribution

Lorang's accurate CV: Head of Performance at Red Bull–Bora–Hansgrohe (Roglič's *team*); coached Jan Frodeno and Anne Haug to Ironman world titles; now coaches Lucy Charles-Barclay. He is **not** personally Roglič's coach, and did **not** coach Vingegaard.

Most references use the correct *"(Roglič's team)"* framing. Two were factually wrong:

**Fixed (2):**
- `cycling-training-six-hours-roglic-coach.mdx:88` — expert `role: Coached Vingegaard, Roglic; current Bora-Hansgrohe coach` → `Head of Performance at Red Bull–Bora–Hansgrohe; coached Jan Frodeno and Anne Haug to Ironman world titles`. (Vingegaard is Visma, not Lorang's athlete; "coached Roglic" personally is false.)
- `polarised-training-cycling-complete-guide.mdx:220` — *"the coach behind Primož Roglič and Ironman world champion Jan Frodeno"* → *"head of performance at Red Bull–Bora-Hansgrohe (Primož Roglič's team) and the coach behind Ironman world champion Jan Frodeno"*.

> Note: `content/drafts/companion/companion-ep-2134-…mdx` contains stronger misattributions ("the mastermind behind Primož Roglič's success"). It is in `content/drafts/`, **out of scope** for this `content/blog/` pass — flagged for a future draft cleanup.

## 5. Vekta

**Zero** mentions in `content/blog/`. Clean.

## 6. Barbell prescriptions

No violations. Every barbell mention is correctly framed against the Roadman editorial position for the 35–55 amateur audience — heavy bilateral barbell work is consistently presented as research-context or as the expert's prescription, immediately followed by the Roadman substitution (single-leg / hip-hinge / front-loaded patterns at controlled load). Examples of correct framing: `strength-training-cyclists-over-40-what-works.mdx`, `cycling-deadlift-guide.mdx:184`, `derek-teel-best-exercises-cyclists.mdx:108` ("Roadman take"), `new-study-confirms-heavy-strength-training-beats-more-miles-after-40.mdx`. Loaded hip-thrust progressions (low spinal load) and the conditional trap-bar hinge for experienced lifters are within the endorsed approach.

## 7. Broken internal links

- **Markdown links** to `/blog/` and `/podcast/`: **0 broken** (374 files). A concurrent link-cleanup pass had already delinked/fixed dead `/blog/` links.
- **Frontmatter `relatedEpisodes` / `relatedPosts`**: **78 dead references** across 24 files. `getEpisodeBySlug()` / `getPostBySlug()` do a direct filename lookup with no alias resolution, so these silently rendered nothing (lost "Related episodes" cards + lost JSON-LD citations).

**Fixed (78):** every dead slug resolved to its real file by episode-number prefix + title disambiguation. Two needed content-based resolution because the filename doesn't reflect the topic:
- `ep-4-low-cadence-training-8-7-vo2max-gain` → `ep-4-new-study-finally-confirms-what-cycling-coaches-have-been-sa` (its title *is* "Low Cadence Training: 8.7% VO2max Gain", episodeNumber 2262).
- `ep-new-study-heavy-strength-training-cyclists-over-40` → `ep-new-study-finally-confirms-what-winning-masters-cyclists-have-known` (title "Heavy Strength Training for Cyclists Over 40").

`relatedPosts` substitutions: `cycling-ethics` → `hidden-motors-mechanical-doping-cycling`; `common-training-mistakes-from-coaches` → `biggest-training-mistakes-from-coaches`; `cycling-shoes-fit-courtney-conley` → `courtney-conley-cycling-shoes-fit`.

After the fix, a re-scan reports **0 broken markdown links and 0 broken frontmatter refs**, and all 374 files parse as valid YAML frontmatter.

---

## Scope / commit notes

- Committed **only the 28 files this audit changed**. The working tree had a separate, in-progress link-cleanup touching other `content/blog/` files and a background job rewriting `content/podcast/` — those were left unstaged (`scope commits by path`).
- Not pushed (each push = a paid Vercel deploy).
