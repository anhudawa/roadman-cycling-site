"""Stage 2 alignment tests (FIXTURE words/intervals; fictional dialogue)."""

from pipeline.stages.diarize import (
    SpeakerInterval,
    assign_word_speakers,
    build_speaker_turns,
    diarized_transcript,
)


def _w(word, start, end):
    return {"word": word, "start": start, "end": end, "probability": 0.9}


INTERVALS = [
    SpeakerInterval(0.0, 5.0, "SPEAKER_00"),
    SpeakerInterval(5.2, 10.0, "SPEAKER_01"),
]


def test_words_assigned_by_overlap():
    words = [_w("FIXTURE", 1.0, 1.4), _w("hello", 6.0, 6.3)]
    annotated = assign_word_speakers(words, INTERVALS)
    assert annotated[0]["speaker"] == "SPEAKER_00"
    assert annotated[1]["speaker"] == "SPEAKER_01"


def test_word_straddling_boundary_goes_to_larger_overlap():
    annotated = assign_word_speakers([_w("FIXTURE", 4.8, 5.8)], INTERVALS)
    # 0.2s in SPEAKER_00 vs 0.6s in SPEAKER_01
    assert annotated[0]["speaker"] == "SPEAKER_01"


def test_word_in_small_gap_snaps_to_nearest():
    annotated = assign_word_speakers([_w("FIXTURE", 5.05, 5.15)], INTERVALS)
    assert annotated[0]["speaker"] in ("SPEAKER_00", "SPEAKER_01")


def test_word_far_from_any_interval_stays_unassigned():
    annotated = assign_word_speakers([_w("FIXTURE", 30.0, 30.5)], INTERVALS)
    assert annotated[0]["speaker"] is None


def test_turns_group_consecutive_words():
    words = [
        _w("FIXTURE", 0.5, 0.8), _w("opening", 0.9, 1.2),
        _w("reply", 6.0, 6.4), _w("here", 6.5, 6.8),
        _w("FIXTURE", 4.0, 4.5),
    ]
    # words sorted by time: two from 00, then 01, ordering matters
    words.sort(key=lambda w: w["start"])
    turns = build_speaker_turns(assign_word_speakers(words, INTERVALS))
    assert [t["label"] for t in turns] == ["SPEAKER_00", "SPEAKER_01"]
    assert turns[0]["text"] == "FIXTURE opening FIXTURE"
    assert turns[1]["text"] == "reply here"
    assert turns[0]["start"] == 0.5 and turns[0]["end"] == 4.5


def test_diarized_transcript_keeps_original_and_adds_turns():
    raw = {
        "model": "fixture",
        "segments": [{
            "start": 0, "end": 10, "text": "FIXTURE", "no_speech_prob": 0.0,
            "words": [_w("FIXTURE", 1.0, 1.5), _w("reply", 6.0, 6.5)],
        }],
    }
    out = diarized_transcript(raw, INTERVALS, {"SPEAKER_00": "expert-host-uuid"})
    assert out["segments"] == raw["segments"]  # original Whisper data intact
    assert out["speaker_turns"][0]["speaker_expert_id"] == "expert-host-uuid"
    assert out["speaker_turns"][1]["speaker_expert_id"] is None  # unresolved stays None
