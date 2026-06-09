"""Stage 3 segmentation tests (FIXTURE turns; fictional speakers A/B)."""

from pipeline.stages.segment import Turn, build_segments, turns_from_transcript


def _sentence(i):
    return f"FIXTURE sentence number {i} with a handful of filler words to count."


def _long_text(sentences):
    return " ".join(_sentence(i) for i in range(sentences))


def test_short_turns_one_segment_per_speaker_run():
    turns = [
        Turn("expert-a", 0.0, 10.0, "FIXTURE short opener from the host."),
        Turn("expert-a", 10.0, 20.0, "FIXTURE follow-up from the same speaker."),
        Turn("expert-b", 20.0, 30.0, "FIXTURE reply from the guest."),
    ]
    segments = build_segments(turns)
    assert len(segments) == 2
    assert segments[0].speaker == "expert-a"
    assert segments[0].start == 0.0 and segments[0].end == 20.0
    assert "opener" in segments[0].text and "follow-up" in segments[0].text
    assert segments[1].speaker == "expert-b"


def test_segments_never_mix_speakers():
    turns = [
        Turn("expert-a", 0, 10, _long_text(10)),
        Turn("expert-b", 10, 20, _long_text(10)),
        Turn("expert-a", 20, 30, _long_text(10)),
    ]
    segments = build_segments(turns)
    assert [s.speaker for s in segments] == ["expert-a", "expert-b", "expert-a"]


def test_long_monologue_split_within_bounds():
    monologue = Turn("expert-a", 0.0, 3600.0, _long_text(150))  # ~1800 words
    segments = build_segments([monologue])
    assert len(segments) > 1
    for s in segments:
        assert s.word_count <= int(500 * 1.1)
    assert all(s.word_count >= 200 for s in segments[:-1])


def test_split_preserves_all_text_and_orders_timestamps():
    monologue = Turn("expert-a", 100.0, 1900.0, _long_text(120))
    segments = build_segments([monologue])
    rebuilt = " ".join(s.text for s in segments)
    assert rebuilt.split() == monologue.text.split()
    assert segments[0].start == 100.0
    assert segments[-1].end == 1900.0
    for a, b in zip(segments, segments[1:]):
        assert a.end <= b.start + 0.01


def test_none_speaker_turns_group_together():
    turns = [Turn(None, 0, 5, "FIXTURE one."), Turn(None, 5, 9, "FIXTURE two.")]
    segments = build_segments(turns)
    assert len(segments) == 1
    assert segments[0].speaker is None


def test_turns_from_transcript_prefers_speaker_turns():
    raw = {
        "segments": [{"start": 0, "end": 5, "text": "FIXTURE whisper segment"}],
        "speaker_turns": [
            {"speaker_expert_id": "expert-a", "start": 0, "end": 5, "text": "FIXTURE turn"},
        ],
    }
    turns = turns_from_transcript(raw)
    assert turns[0].speaker == "expert-a"


def test_turns_from_transcript_falls_back_to_whisper_segments():
    raw = {"segments": [{"start": 0, "end": 5, "text": "FIXTURE whisper segment"}]}
    turns = turns_from_transcript(raw)
    assert turns[0].speaker is None
