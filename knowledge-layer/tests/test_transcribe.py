"""Stage 1 unit tests: quality scoring + audio cache logic (FIXTURE data only)."""

from pipeline.stages.transcribe import cache_path, ensure_audio, quality_score


def _raw(probs, no_speech=0.0, text="FIXTURE words here"):
    return {
        "model": "fixture",
        "segments": [{
            "start": 0.0, "end": 5.0, "text": text, "no_speech_prob": no_speech,
            "words": [{"word": "w", "start": 0, "end": 1, "probability": p} for p in probs],
        }],
    }


def test_high_confidence_scores_high():
    assert quality_score(_raw([0.95, 0.97, 0.92])) > 0.9


def test_low_confidence_words_penalised():
    clean = quality_score(_raw([0.9] * 10))
    noisy = quality_score(_raw([0.9] * 5 + [0.3] * 5))
    assert noisy < clean


def test_garbage_segments_penalised():
    good = _raw([0.9] * 4)
    bad = _raw([0.9] * 4)
    bad["segments"].append({"start": 5, "end": 9, "text": "", "no_speech_prob": 0.95, "words": []})
    assert quality_score(bad) < quality_score(good)


def test_empty_transcript_scores_zero():
    assert quality_score({"segments": []}) == 0.0
    assert quality_score({}) == 0.0


def test_score_bounded():
    assert 0.0 <= quality_score(_raw([0.1] * 20, no_speech=0.99, text="")) <= 1.0


def test_cache_path_sanitises_guid():
    p = cache_path("/tmp/cache", "guid/with:odd chars?")
    assert p.name == "guid_with_odd_chars_.mp3"
    assert str(p.parent) == "/tmp/cache"


def test_ensure_audio_skips_existing(tmp_path):
    existing = cache_path(tmp_path, "fixture-guid")
    existing.parent.mkdir(parents=True, exist_ok=True)
    existing.write_bytes(b"FIXTURE AUDIO BYTES")
    # URL is unreachable on purpose: proves no download is attempted when cached.
    path = ensure_audio("http://invalid.invalid/nope.mp3", tmp_path, "fixture-guid")
    assert path == existing
    assert path.read_bytes() == b"FIXTURE AUDIO BYTES"
