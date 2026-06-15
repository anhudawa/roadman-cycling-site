# Verify Report — Chapter 1 (draft v1)

**Draft:** `drafts/ch01-v1.md` · **Verified:** 2026-06-15 · **Scanner:** `verify/scan.py` → **clean** (0 issues)

**Verdict:** Voice-safe and structurally clean. **Not yet quote-safe.** Chapter 1 is built on three caption-grade ASR transcripts with no speaker labels; I wrote it as paraphrase-with-citation rather than block quotation precisely to keep misattribution risk low. Every item below must be confirmed before this chapter is published.

---

## Blocklist scan (HARD rules)
- **Lorang/Pogačar:** not present. Chapter names no coaches. ✅
- No coach-rider attributions made anywhere in the chapter. ✅

## Banned words / openers / structural tells
- Banned words: none. Banned openers: none. ✅
- Em-dash density 2 (incl. title), under threshold. "Not X. It's Y." shape reduced to 2 instances. No three-consecutive-same-shape paragraphs. ✅

## Claim tracing (every empirical claim → episode)

| # | Claim as written | Source | Status |
|---|---|---|---|
| 1 | Dale: 42, two kids, full-time job, Cat 3, ~15 h/week for a year, getting *worse*, motivation/willpower breaking | `ep-2105` (rider-support, host-solo: Anthony + co-host Sarah) | **In transcript, clear.** Profile stated almost verbatim by the letter. ✅ |
| 2 | "the lack of progress is starting to break his will to train at all" | `ep-2105` | Paraphrase of Dale's letter ("the lack of progress is starting to affect my willpower to train"). Tighten/quote exactly on ear-check. ⚠️ |
| 3 | The body keeps one ledger; the nervous system doesn't distinguish training stress from life stress; cortisol accumulates | `ep-2105` (host's diagnosis) | **Paraphrase, attributed to episode, speaker = host.** Transcript: "your body doesn't differentiate between stress from dose and stress from training." Rendered as my prose, not a quote. ✅ low-risk |
| 4 | Time-limited riders typically train too hard, do too little genuine easy riding, under-recover | `ep-2039` (Dr Christian Schrot, Team Jayco — **interview, speaker INFERRED**) | Paraphrase of Schrot's point. Speaker attribution inferred (no labels). Do not promote to a quote without ear-check. ⚠️ |
| 5 | Anthony: 12–15 h/week for 12 yrs at Cat 1; cut to ~half; 75 kg holding 400 W/20 min, later 80 kg and "could not" | `ep-2032` (host-solo, speaker confirmed) | **In transcript.** 400 W / 75 kg / weight gain to 80 kg all stated. Exact later figure (370 W) deliberately withheld for Ch 11. ✅ |
| 6 | The "lies I told myself" list (train smarter / quality over quantity / 15 yrs of base / how much could I lose) | `ep-2032` | **Near-verbatim**, lightly compressed from ASR: "I'll just train a little bit smarter. Quality over quantity. I've got 15 years of base… How much fitness could I actually lose?" Confirm exact wording on ear-check. ⚠️ |
| 7 | A sports scientist published the reason for the non-linear decline "over a decade ago" | `ep-2032` (refers to Seiler, 2013, Int. J. Sports Physiol. Perf.) | **Deliberately left unnamed/undated in the draft.** The specific Seiler-2013 citation belongs in Ch 5/8 and must be verified against the *actual paper*, not the ASR, before naming. ⚠️ defer |
| 8 | "designed for the young professional with twenty-five empty hours / masters athlete with nine" thesis statement | Book thesis (evidence-map synthesis), not a single-episode claim | Framing/argument, not an empirical claim. Acceptable in a hook chapter. The "25h-week origin" premise itself is THIN in the archive (evidence-map GAPS) and gets external sourcing in Ch 2 per outline decision 4. ⚠️ flagged for Ch 2 |

## Quotes verbatim-checked against transcript with speaker confirmed
**None presented as verbatim block quotes** — deliberate. Items 2, 6 are the closest to direct quotation and are flagged for ear-check. When the audio re-transcriptions land, swap the paraphrases for verified verbatim where it strengthens the prose.

## Flags for Anthony
1. **ep-2105 figure ambiguity:** Dale's FTP is ASR-garbled ("2 185 Watts" — likely 285 W, possibly 185 W). I did **not** state his wattage anywhere; the chapter doesn't need it. If you want the number in, confirm it by ear.
2. **Schrot speaker (item 4)** is inferred from an unlabelled interview. Low stakes here (paraphrase, no name in body) but noted per the attribution rule.
3. **Item 7 (Seiler 2013):** left vague on purpose. Flagging so it is not silently promoted to a hard citation later without checking the paper.
4. This chapter leans on **ep-2032**, which is also the spine of **Ch 11** (your personal story). Decide whether the 400→370 W reveal lives here as a teaser (current: withheld) or is saved entirely for Ch 11. Current draft withholds it.

## Status
Draft v1 clears the mechanical gate and is ready for your read as a **proof-of-voice sample**. Treat the ⚠️ rows as the to-do list before it is publication-ready.
