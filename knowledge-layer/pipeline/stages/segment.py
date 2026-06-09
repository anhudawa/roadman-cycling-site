"""Stage 3 — Segmentation: 200-500 word topical chunks respecting speaker turns.

Simple approach per the handover (don't over-engineer): consecutive turns by
the same speaker are merged into a run; runs longer than the word ceiling are
split at sentence boundaries with proportional timestamp interpolation. A
segment never mixes speakers — segments.speaker_id is a single (nullable)
expert, and claims inherit attribution from it.

Input turns come from the latest transcript version: diarize writes
"speaker_turns" [{speaker_expert_id, start, end, text}]; if absent (pilot
runs before diarization), Whisper segments are used with speaker None, which
downstream routes claims to review as ambiguous_speaker rather than guessing.

Re-running replaces an episode's segments (delete + insert). Claims cascade
on delete: re-segmentation implies re-extraction, by design.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

from ..config import Config

MIN_WORDS = 200
MAX_WORDS = 500

_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")


@dataclass
class Turn:
    speaker: str | None  # expert uuid (or None when unresolved)
    start: float
    end: float
    text: str


@dataclass
class Segment:
    speaker: str | None
    start: float
    end: float
    text: str

    @property
    def word_count(self) -> int:
        return len(self.text.split())


def _merge_runs(turns: list[Turn]) -> list[Turn]:
    """Merge consecutive turns by the same speaker into single runs."""
    runs: list[Turn] = []
    for t in turns:
        if not t.text.strip():
            continue
        if runs and runs[-1].speaker == t.speaker:
            prev = runs[-1]
            runs[-1] = Turn(prev.speaker, prev.start, t.end, prev.text + " " + t.text)
        else:
            runs.append(Turn(t.speaker, t.start, t.end, t.text))
    return runs


def _split_run(run: Turn, max_words: int, min_words: int) -> list[Segment]:
    """Split one same-speaker run at sentence boundaries, interpolating timestamps."""
    words_total = len(run.text.split())
    if words_total <= max_words:
        return [Segment(run.speaker, run.start, run.end, run.text.strip())]

    sentences = _SENTENCE_SPLIT.split(run.text.strip())
    chunks: list[list[str]] = [[]]
    for sentence in sentences:
        current_words = sum(len(s.split()) for s in chunks[-1])
        if current_words >= min_words and current_words + len(sentence.split()) > max_words:
            chunks.append([])
        chunks[-1].append(sentence)

    # A short trailing chunk merges back into its predecessor when that stays
    # within bounds — better one 510-word segment than a 40-word orphan.
    if len(chunks) > 1:
        tail_words = sum(len(s.split()) for s in chunks[-1])
        prev_words = sum(len(s.split()) for s in chunks[-2])
        if tail_words < min_words and prev_words + tail_words <= int(max_words * 1.1):
            chunks[-2].extend(chunks.pop())

    duration = run.end - run.start
    segments, consumed = [], 0
    for chunk in chunks:
        text = " ".join(chunk).strip()
        n = len(text.split())
        start = run.start + duration * (consumed / words_total)
        consumed += n
        end = run.start + duration * (consumed / words_total)
        segments.append(Segment(run.speaker, round(start, 2), round(end, 2), text))
    return segments


def build_segments(turns: list[Turn], min_words: int = MIN_WORDS,
                   max_words: int = MAX_WORDS) -> list[Segment]:
    segments: list[Segment] = []
    for run in _merge_runs(turns):
        segments.extend(_split_run(run, max_words, min_words))
    return segments


def turns_from_transcript(raw: dict[str, Any]) -> list[Turn]:
    if raw.get("speaker_turns"):
        return [
            Turn(t.get("speaker_expert_id"), t["start"], t["end"], t["text"])
            for t in raw["speaker_turns"]
        ]
    return [Turn(None, s["start"], s["end"], s["text"]) for s in raw.get("segments", [])]


def run(cfg: Config, episode_numbers: list[int]) -> None:
    from .. import db

    with db.connect(cfg) as conn:
        with conn.cursor() as cur:
            if episode_numbers:
                cur.execute(
                    "select id, episode_number from episodes "
                    "where episode_number = any(%s)", (episode_numbers,),
                )
            else:
                cur.execute("select id, episode_number from episodes where status = 'segmenting'")
            episodes = cur.fetchall()
        if not episodes:
            print("segment: no eligible episodes.")
            return

        for ep_id, ep_number in episodes:
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        "select raw from transcripts where episode_id = %s "
                        "order by version desc limit 1", (ep_id,),
                    )
                    row = cur.fetchone()
                    if row is None:
                        raise RuntimeError("no transcript for episode")
                    segments = build_segments(turns_from_transcript(row[0]))
                    cur.execute("delete from segments where episode_id = %s", (ep_id,))
                    for s in segments:
                        cur.execute(
                            "insert into segments (episode_id, speaker_id, start_ts, end_ts, text) "
                            "values (%s, %s, %s, %s, %s)",
                            (ep_id, s.speaker, s.start, s.end, s.text),
                        )
                    cur.execute(
                        "update episodes set status = 'extracting', updated_at = now() "
                        "where id = %s", (ep_id,),
                    )
                conn.commit()
                print(f"segment: ep {ep_number} -> {len(segments)} segments")
            except Exception as exc:
                conn.rollback()
                with conn.cursor() as cur:
                    cur.execute(
                        "update episodes set status = 'failed', status_detail = %s, "
                        "updated_at = now() where id = %s",
                        (f"segment: {exc}"[:500], ep_id),
                    )
                conn.commit()
                print(f"segment: ep {ep_number} FAILED: {exc}")
