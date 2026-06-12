# STATUS — The Roadman Manifesto

**Phase:** 0 complete · evidence map done · **proposed outline awaiting Anthony's approval** (`outline/proposed-v1.md`) · priority transcription running
**Last updated:** 2026-06-12
**Operator:** Claude Code

---

## FLAGS FOR ANTHONY (decisions needed)

1. **Four decisions at the top of `outline/proposed-v1.md`** — thesis precision (the archive supports *inverted levers + recovery-governed*, not literal reverse-blocks; Seiler's own study is equivocal), the attack-our-own-thesis chapter, a voice memo for the personal-story chapter, and whether limited external sources are allowed for history/physiology. Nothing drafts until you rule.
2. **Knowledge graph repo location** (open from 06-11). Supabase `transcripts` store is not in this repo; need Ted's pointer. New timestamped transcripts are written in a KG-shaped JSON (versioned raw segments, diarization field reserved) so ingestion is a mapping job, not a redo.
3. **Five priority episodes are YouTube-only** — ep-2148 (Seiler 80/20), ep-2205 (Friel after-40), ep-40 (Friel training week), ep-38 (Barrett), ep-2035 (Impey). No audio in the Anchor feed, and YouTube blocks this environment (bot wall — tried captions and audio). They need re-transcription from a machine with YouTube access, OR quotes from them get ear-verified by you/Ted. The first three are load-bearing for the outline.
4. **Good news, blocklist:** the false "Lorang coached Pogačar" claim does **not** exist anywhere in the archive (full grep, all transcripts). It's purely a brand-bible import. Lorang is correctly described in ep-2134 as Red Bull–Bora head of performance / Roglič's coach.

## Re-transcription (in progress, runs unattended)

Whisper **large-v3**, word timestamps, VAD; output to `sources/transcripts/` as KG-shaped `.json` + readable `[mm:ss]` `.txt`. Acting under the Phase 0 mandate (priority episodes missing or unusable) + Anthony's 06-12 "move without my input" instruction. Queue, in order:

1. ~~Friel — How to Train Smarter with Less Time~~ ← running
2. Friel — Triathletes CAN Self Coach
3. Friel — Founders Series: Training Peaks Story
4. Seiler — ep-2095 audio twin · 5. Wakefield — ep-2132 twin · 6. Galpin · 7. Bigham ep-2106 · 8. Lipman ep-2154

~7.4h audio ≈ 1.4–2.8× wall each on this box; resumable (`sources/transcribe-priority.py`, skips finished episodes). Each lands as its own commit.

---

## What exists (three stores, all this repo)

| Store | Location | Count | Source | Timestamps | Speakers |
|---|---|---|---|---|---|
| MDX frontmatter `transcript` | `content/podcast/*.mdx` | 607 of 609 pages | YouTube auto-captions (~340 eps) + Whisper audio pipeline | ❌ | ❌ |
| Canonical `.txt` | `content/podcast/transcripts/` | 279 files | `scripts/transcribe-audio-episodes.ts`, faster-whisper, **default model `base.en` (not large-v3)** | ❌ | ❌ |
| Postgres `mcp_episodes.transcript_text` (+ `claims`/`quotes`/`topic_tags` extraction tables, drizzle 0045/0046) | Vercel Postgres | unverified — no DB credentials in this environment | seeded from MDX | ❌ | inferred, per-claim/quote fields |

- The schema itself confirms the gap: timestamp fields are documented as "Null for the current plain-text transcripts; populated once Whisper emits timestamped output" (`src/lib/db/schema.ts`).
- YouTube auto-captions remain available as fallback for anything not yet transcribed.

## Coverage vs the archive

- Canonical catalog: **1,283 episodes** (live Anchor RSS, audited 2026-06-10 — `docs/episode-coverage-audit.md`, per-episode missing list in `docs/episode-coverage-missing.csv`).
- Covered on site: **≈639 (~50%)**. Missing ≈644, overwhelmingly the **Feb 2022 – Dec 2023 daily back-catalog (492 eps)** — mostly solo dailies, low value for the Manifesto evidence layer.
- Discrepancy note: the coverage audit states 709 MDX pages; the repo (main and this branch) has **609**. Doesn't change the headline gap, but the audit's coverage % may be slightly optimistic.

## Priority guest coverage (Section 4)

| Guest | Status | Key episodes with transcripts |
|---|---|---|
| **Stephen Seiler** | ✅ fully covered | `ep-2148` 80/20 Training (ep#2426, 2024-03-11, 65k-char transcript), `ep-2095` cycling fast at low HR, + clips. None in missing list. |
| **Joe Friel** | ◐ partial | On site: `ep-40` ideal training week, `ep-2205` faster after 40, `ep-2177` fat-loss clip. **3 audio episodes missing** (Flag 3). |
| **John Wakefield** | ✅ fully covered | `ep-2132` Bora endurance building, `ep-38` World Tour coach secrets, + zone-2 episodes. None in missing list. |
| Dan Bigham | ✅ | `ep-2106` aerodynamics. |
| Andy Galpin | ✅ | `the-science-of-getting-faster-after-40-dr-andy-galpin` (the 2026-05-04 item in the missing CSV is the audio twin of this 2026-05-01 YouTube page — same episode, not a real gap). |
| Dr. David Dunne | ✅ | `ep-2035` / `ep-2044` World Tour nutritionist episodes. |

## Quality spot-check (5 transcripts)

1. `ep-2148` Seiler (YouTube captions): 65k chars; no speaker labels, no timestamps, no sentence punctuation; ASR errors ("the roban podcast").
2. `ep-2205` Friel: same profile.
3. `ep-2132` Wakefield: same ("Roan welcome back").
4. `ireland-lead-the-world.txt` (Whisper base.en): punctuated but heavy garble ("WellTastBeshall", "ritalianoint").
5. `dealing-with-extreme-altitude-colombia-edition.txt`: "Anthony Welch", "long-chevages".

**Verdict:** usable for locating arguments, themes and approximate wording across the archive — the evidence-mining layer works today. **Not safe for verbatim quotation or speaker attribution as-is.** Interview transcripts interleave host and guest with no markers; attribution must be inferred from context and verified, or the quote paraphrased and flagged (Section 6 rule).

## Reusable infrastructure found

- `claims` / `quotes` extraction tables + `scripts/extract-claims.ts`, `extract-key-quotes.ts`, `review-claims.ts` — match the Manifesto's claim-tracing needs.
- `src/lib/ask/corrections.ts:47` already encodes the **Lorang–Pogačar blocklist correction** with wrong-pattern variants — seed for `manifesto/blocklist.md` (done).
- Prior verify-step art: `QUOTE_AUTHENTICITY_AUDIT_MAY2026.txt`, `CITATION-VERIFICATION-REPORT.md`, `roadman-method-quote-audit.md`.
- MDX `chapters` frontmatter carries coarse chapter timestamps on many interview episodes — a stopgap for "approximate timestamp" citation until re-transcription.

## Audit checklist (Section 2)

- [x] Locate every existing transcript store — 3 found in this repo; Supabase knowledge-graph store not here (Flag 1)
- [x] Count episodes covered vs full archive — ~639/1,283 pages, 607 with transcript text
- [x] Spot-check quality on 5 transcripts — see above
- [x] Confirm priority-guest coverage — Seiler ✅, Wakefield ✅, Friel ◐ (3 missing)
- [x] Record findings in STATUS.md
- [ ] Fresh transcription for missing/unusable priority episodes — **blocked on Flags 1–3 (Anthony)**

## Session log

- **2026-06-12 (am)** — On Anthony's "move without my input" instruction: (1) evidence map built from full archive sweep, `sources/evidence-map.md` — 10 themes, verbatim-ASR excerpts with inferred speakers, honest GAPS section; key finding: thesis must be framed as inverted levers/recovery-governed, not literal reverse blocks (Seiler ep-2095 contradicts the naive version). (2) Proposed outline `outline/proposed-v1.md` — 12 chapters, Sacred Cow arc, page budget 62–82, decisions for Anthony up top. **Stopped at the outline gate.** (3) Large-v3 timestamped transcription queue running (8 episodes: 3 recovered Friel + 5 priority audio twins). (4) Verify scanner `verify/scan.py` built and tested (blocklist hard-fail, banned words/openers, structural tells, uncited quotes). (5) Found 5 priority episodes are YouTube-only and unreachable from this environment — flagged.
- **2026-06-11** — Phase 0 audit run. Created `/manifesto` skeleton (STATUS.md, CLAUDE.md, blocklist.md). No outline drafted, no chapters drafted. **Stopped at the Phase 0 gate for Anthony's review.**
