# STATUS — The Roadman Manifesto

**Phase:** 0 — transcript audit **COMPLETE**, awaiting Anthony's review (gate before Phase 1)
**Last updated:** 2026-06-11
**Operator:** Claude Code

---

## FLAGS FOR ANTHONY (decisions needed)

1. **Knowledge graph repo location.** The Supabase `transcripts` table (knowledge graph Phase 0 package) is NOT in this repo — no Supabase config exists anywhere here. The DB here is Vercel Postgres. Need Ted's pointer to the repo/project before fresh transcription can be written in a compatible format (Section 2 rule). This session is also scoped to `roadman-cycling-site` only, so I could not check other repos.
2. **Timestamps don't exist in any current transcript store.** The "episode + approximate timestamp" traceability rule cannot be met from existing transcripts. Recommend re-transcribing only the ~15–25 priority evidence episodes (Seiler/Friel/Wakefield + secondary) with Whisper large-v3 + word timestamps (+ diarization), into the knowledge-graph schema once located. Approve?
3. **Three Joe Friel audio episodes are missing entirely** (no page, no transcript) — likely high-value for the masters chapters:
   - "How to Train Smarter with Less Time With Joe Friel" (2025-08-06)
   - "Triathletes CAN Self Coach! With Joe Friel" (2024-01-17)
   - "Founders Series: The Training Peaks Story with Joe Friel" (2022-12-20)
   - (also Dirk Friel, "The Evolution of Coaching", 2022-06-23 — lower priority)
   Transcribe these as part of item 2?
4. **Verbatim-quote risk.** No current transcript has speaker labels; all are raw ASR with visible errors (details below). Until priority episodes are re-transcribed, any quote must be re-verified by ear against audio/YouTube. This is workable but slow — another reason for item 2.

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

- **2026-06-11** — Phase 0 audit run. Created `/manifesto` skeleton (STATUS.md, CLAUDE.md, blocklist.md). No outline drafted, no chapters drafted. **Stopped at the Phase 0 gate for Anthony's review.**
