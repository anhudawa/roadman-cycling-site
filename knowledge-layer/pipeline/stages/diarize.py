"""Stage 2 — Diarization + speaker identification.

Two halves:
  1. ALIGNMENT (implemented, unit-tested): pyannote emits speaker intervals
     (start, end, label); Whisper emits word timestamps. Each word is assigned
     to the speaker interval with the greatest temporal overlap (nearest
     interval for words in gaps, unassigned when nothing is close), then
     consecutive same-label words become speaker turns.
  2. RUNNING pyannote + RESOLVING labels to experts: needs the GPU worker box
     and audio. Resolution order (§5 stage 2, binding): (a) episode guest
     list, (b) host voice-print (Anthony Walsh anchors one label),
     (c) LLM pass over the transcript opening for conversational cues,
     (d) unresolved -> speaker_expert_id stays None and downstream claims
     route to review_queue(ambiguous_speaker).
     NEVER guess between two plausible guests. Null is better than wrong.

Output: a NEW transcripts version whose raw carries the original Whisper
payload plus "speaker_turns": [{label, speaker_expert_id|None, start, end,
text}]. Transcripts are immutable; diarization always adds a version.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..config import Config

# A word whose midpoint lies further than this from every speaker interval
# stays unassigned (label None) rather than being attributed by proximity.
MAX_GAP_S = 2.0


@dataclass
class SpeakerInterval:
    start: float
    end: float
    label: str  # diarizer label, e.g. "SPEAKER_00"


def _overlap(a_start: float, a_end: float, b_start: float, b_end: float) -> float:
    return max(0.0, min(a_end, b_end) - max(a_start, b_start))


def assign_word_speakers(
    words: list[dict[str, Any]],
    intervals: list[SpeakerInterval],
) -> list[dict[str, Any]]:
    """Return words annotated with a "speaker" label (or None).

    Greatest-overlap wins; words in silence gaps go to the nearest interval
    within MAX_GAP_S of their midpoint, else stay unassigned.
    """
    annotated = []
    for w in words:
        w_start, w_end = float(w["start"]), float(w["end"])
        best_label, best_overlap = None, 0.0
        for iv in intervals:
            ov = _overlap(w_start, w_end, iv.start, iv.end)
            if ov > best_overlap:
                best_label, best_overlap = iv.label, ov
        if best_label is None and intervals:
            mid = (w_start + w_end) / 2
            nearest = min(intervals, key=lambda iv: min(abs(mid - iv.start), abs(mid - iv.end)))
            distance = min(abs(mid - nearest.start), abs(mid - nearest.end))
            if distance <= MAX_GAP_S:
                best_label = nearest.label
        annotated.append({**w, "speaker": best_label})
    return annotated


def build_speaker_turns(annotated_words: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Group consecutive same-label words into turns."""
    turns: list[dict[str, Any]] = []
    for w in annotated_words:
        text = w.get("word", "").strip()
        if not text:
            continue
        if turns and turns[-1]["label"] == w["speaker"]:
            turns[-1]["end"] = float(w["end"])
            turns[-1]["text"] += " " + text
        else:
            turns.append({
                "label": w["speaker"],
                "speaker_expert_id": None,  # filled by resolution, never guessed
                "start": float(w["start"]),
                "end": float(w["end"]),
                "text": text,
            })
    return turns


def diarized_transcript(raw: dict[str, Any], intervals: list[SpeakerInterval],
                        label_to_expert: dict[str, str] | None = None) -> dict[str, Any]:
    """Produce the new raw payload: original Whisper data + speaker_turns."""
    words = [w for seg in raw.get("segments", []) for w in seg.get("words", [])]
    turns = build_speaker_turns(assign_word_speakers(words, intervals))
    if label_to_expert:
        for t in turns:
            t["speaker_expert_id"] = label_to_expert.get(t["label"])
    return {**raw, "speaker_turns": turns}


def run(cfg: Config, episode_numbers: list[int]) -> None:
    raise SystemExit(
        "diarize: alignment logic is implemented and tested; running pyannote "
        "needs the GPU worker box + HUGGINGFACE token (P0-4 remainder). "
        "Speaker-to-expert resolution lands with it."
    )
