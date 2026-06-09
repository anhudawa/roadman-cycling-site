"""Stage 1 — Transcription: Whisper large-v3, word-level timestamps.

Per-episode, idempotent, resumable. Flow per episode:
  1. download the RSS enclosure into the local audio cache (atomic, skipped
     when already present — this doubles as the owned audio mirror)
  2. transcribe with faster-whisper (preferred) or openai-whisper, word
     timestamps on
  3. compute transcript_quality_score; < 0.5 flags the episode but continues
  4. insert a NEW transcripts version row (immutability is trigger-enforced)
  5. status: pending -> transcribing -> diarizing (next stage) | failed

Raw transcript jsonb contract (consumed by diarize/segment):
  {"model": str, "language": str,
   "segments": [{"start": s, "end": s, "text": str, "no_speech_prob": float,
                 "words": [{"word": str, "start": s, "end": s, "probability": float}]}]}

Audit note: the prior site-rebuild pipeline had no word timestamps or
diarization, so nothing from it is reused here (STATUS.md, 2026-06-09).
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from ..config import Config

QUALITY_FLAG_THRESHOLD = 0.5
LOW_CONFIDENCE_WORD_P = 0.5
GARBAGE_NO_SPEECH_P = 0.8


def cache_path(cache_dir: str | Path, rss_guid: str) -> Path:
    """Deterministic local path for an episode's audio, keyed on rss_guid."""
    stem = re.sub(r"[^A-Za-z0-9._-]", "_", rss_guid)
    return Path(cache_dir) / f"{stem}.mp3"


def ensure_audio(audio_url: str, cache_dir: str | Path, rss_guid: str) -> Path:
    """Download the enclosure unless already cached. Atomic write; returns path."""
    target = cache_path(cache_dir, rss_guid)
    if target.exists() and target.stat().st_size > 0:
        return target
    target.parent.mkdir(parents=True, exist_ok=True)
    tmp = target.with_suffix(".part")

    from urllib.request import Request, urlopen

    req = Request(audio_url, headers={"User-Agent": "roadman-knowledge-pipeline/0.1"})
    with urlopen(req, timeout=300) as resp, tmp.open("wb") as out:
        while chunk := resp.read(1 << 20):
            out.write(chunk)
    if tmp.stat().st_size == 0:
        tmp.unlink()
        raise RuntimeError(f"empty download from {audio_url}")
    tmp.rename(target)
    return target


def quality_score(raw: dict[str, Any]) -> float:
    """Heuristic transcript quality in [0, 1] (§5 stage 1).

    Penalises low average word confidence, a high share of low-confidence
    words, and garbage segments (high no_speech_prob or empty text).
    """
    segments = raw.get("segments", [])
    words = [w for s in segments for w in s.get("words", [])]
    if not segments or not words:
        return 0.0
    probs = [float(w.get("probability", 0.0)) for w in words]
    avg_p = sum(probs) / len(probs)
    low_ratio = sum(1 for p in probs if p < LOW_CONFIDENCE_WORD_P) / len(probs)
    garbage_ratio = sum(
        1 for s in segments
        if float(s.get("no_speech_prob", 0.0)) > GARBAGE_NO_SPEECH_P or not s.get("text", "").strip()
    ) / len(segments)
    return max(0.0, min(1.0, avg_p - 0.3 * low_ratio - 0.3 * garbage_ratio))


def transcribe_file(audio_path: Path, model_name: str) -> dict[str, Any]:
    """Run Whisper with word timestamps. Heavy deps imported lazily —
    install faster-whisper (preferred) or openai-whisper on the worker box."""
    try:
        from faster_whisper import WhisperModel  # type: ignore
    except ImportError:
        return _transcribe_openai_whisper(audio_path, model_name)

    model = WhisperModel(model_name)
    segments_iter, info = model.transcribe(str(audio_path), word_timestamps=True)
    segments = []
    for seg in segments_iter:
        segments.append({
            "start": seg.start,
            "end": seg.end,
            "text": seg.text,
            "no_speech_prob": seg.no_speech_prob,
            "words": [
                {"word": w.word, "start": w.start, "end": w.end, "probability": w.probability}
                for w in (seg.words or [])
            ],
        })
    return {"model": f"faster-whisper/{model_name}", "language": info.language,
            "segments": segments}


def _transcribe_openai_whisper(audio_path: Path, model_name: str) -> dict[str, Any]:
    try:
        import whisper  # type: ignore
    except ImportError as exc:
        raise SystemExit(
            "transcribe: neither faster-whisper nor openai-whisper is installed. "
            "On the worker box: pip install faster-whisper"
        ) from exc

    model = whisper.load_model(model_name)
    result = model.transcribe(str(audio_path), word_timestamps=True)
    segments = [
        {
            "start": s["start"], "end": s["end"], "text": s["text"],
            "no_speech_prob": s.get("no_speech_prob", 0.0),
            "words": [
                {"word": w["word"], "start": w["start"], "end": w["end"],
                 "probability": w.get("probability", 0.0)}
                for w in s.get("words", [])
            ],
        }
        for s in result["segments"]
    ]
    return {"model": f"openai-whisper/{model_name}",
            "language": result.get("language", ""), "segments": segments}


def _select_episodes(cur, episode_numbers: list[int]) -> list[tuple]:
    """Rows: (id, rss_guid, audio_url, episode_number)."""
    if episode_numbers:
        cur.execute(
            "select id, rss_guid, audio_url, episode_number from episodes "
            "where episode_number = any(%s) order by episode_number",
            (episode_numbers,),
        )
    else:
        # --all-pending; also picks up prior failures for retry (idempotency)
        cur.execute(
            "select id, rss_guid, audio_url, episode_number from episodes "
            "where status in ('pending', 'failed') order by publish_date"
        )
    return cur.fetchall()


def run(cfg: Config, episode_numbers: list[int]) -> None:
    from .. import db

    with db.connect(cfg) as conn:
        with conn.cursor() as cur:
            episodes = _select_episodes(cur, episode_numbers)
        if not episodes:
            print("transcribe: no eligible episodes.")
            return

        for ep_id, rss_guid, audio_url, ep_number in episodes:
            label = f"ep {ep_number}" if ep_number is not None else f"guid {rss_guid}"
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        "update episodes set status = 'transcribing', status_detail = null, "
                        "pipeline_version = %s, updated_at = now() where id = %s",
                        (cfg.pipeline_version, ep_id),
                    )
                conn.commit()

                if not audio_url:
                    raise RuntimeError("no audio_url on episode row")
                audio = ensure_audio(audio_url, cfg.audio_cache_dir, rss_guid)
                raw = transcribe_file(audio, cfg.whisper_model)
                score = quality_score(raw)

                with conn.cursor() as cur:
                    cur.execute(
                        "select coalesce(max(version), 0) + 1 from transcripts "
                        "where episode_id = %s",
                        (ep_id,),
                    )
                    version = cur.fetchone()[0]
                    cur.execute(
                        "insert into transcripts (episode_id, version, model, raw) "
                        "values (%s, %s, %s, %s)",
                        (ep_id, version, raw["model"], json.dumps(raw)),
                    )
                    flag = (
                        f"transcript_quality {score:.2f} below {QUALITY_FLAG_THRESHOLD}"
                        if score < QUALITY_FLAG_THRESHOLD else None
                    )
                    cur.execute(
                        "update episodes set status = 'diarizing', "
                        "transcript_quality_score = %s, status_detail = %s, "
                        "updated_at = now() where id = %s",
                        (score, flag, ep_id),
                    )
                conn.commit()
                print(f"transcribe: {label} done (v{version}, quality {score:.2f})")
            except Exception as exc:  # per-episode isolation: one failure never stops the run
                conn.rollback()
                with conn.cursor() as cur:
                    cur.execute(
                        "update episodes set status = 'failed', status_detail = %s, "
                        "updated_at = now() where id = %s",
                        (f"transcribe: {exc}"[:500], ep_id),
                    )
                conn.commit()
                print(f"transcribe: {label} FAILED: {exc}")
