#!/usr/bin/env python3
"""
Local Whisper transcription worker for the Roadman audio back-catalogue.

Reads a manifest JSON ({"model","compute_type","language","jobs":[{"mp3","txt"}]})
on argv[1], loads the speech-to-text model ONCE, then transcribes every job to a
plain-text file. Emits one JSON status line per job on stdout so the Node
orchestrator can stream progress and stay resumable.

Engine: faster-whisper (CTranslate2, int8 on CPU) when available — falls back to
openai-whisper. Both are the open-source Whisper model running locally; no API,
no cost.
"""

import json
import sys
import time


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def emit(obj: dict) -> None:
    # One JSON object per line on stdout = the machine-readable channel.
    print(json.dumps(obj), flush=True)


def load_faster_whisper(model_name: str, compute_type: str):
    from faster_whisper import WhisperModel

    log(f"[whisper] loading faster-whisper model={model_name} compute_type={compute_type} (cpu)")
    model = WhisperModel(model_name, device="cpu", compute_type=compute_type)

    def transcribe(mp3_path: str, language: str) -> str:
        segments, _info = model.transcribe(
            mp3_path,
            language=language or None,
            beam_size=1,                    # greedy — fastest, fine for clear speech
            condition_on_previous_text=False,  # avoids runaway repetition on long audio
            vad_filter=False,
        )
        return "".join(seg.text for seg in segments).strip()

    return transcribe


def load_openai_whisper(model_name: str):
    import whisper

    # openai-whisper uses bare sizes (no compute_type); .en variants are valid.
    log(f"[whisper] loading openai-whisper model={model_name} (fallback)")
    model = whisper.load_model(model_name)

    def transcribe(mp3_path: str, language: str) -> str:
        result = model.transcribe(
            mp3_path,
            language=language or None,
            condition_on_previous_text=False,
            fp16=False,
        )
        return str(result.get("text", "")).strip()

    return transcribe


def main() -> int:
    if len(sys.argv) < 2:
        log("usage: transcribe_audio.py <manifest.json>")
        return 2

    manifest = json.load(open(sys.argv[1], encoding="utf-8"))
    model_name = manifest.get("model", "base.en")
    compute_type = manifest.get("compute_type", "int8")
    language = manifest.get("language", "en")
    jobs = manifest.get("jobs", [])

    log(f"[whisper] {len(jobs)} job(s) to transcribe")

    try:
        transcribe = load_faster_whisper(model_name, compute_type)
    except Exception as e:  # noqa: BLE001 — fall back to the reference implementation
        log(f"[whisper] faster-whisper unavailable ({e}); falling back to openai-whisper")
        transcribe = load_openai_whisper(model_name)

    for job in jobs:
        mp3 = job["mp3"]
        txt = job["txt"]
        start = time.time()
        try:
            text = transcribe(mp3, language)
            if not text:
                emit({"mp3": mp3, "ok": False, "error": "empty transcript"})
                continue
            with open(txt, "w", encoding="utf-8") as fh:
                fh.write(text)
            emit({
                "mp3": mp3,
                "txt": txt,
                "ok": True,
                "chars": len(text),
                "words": len(text.split()),
                "seconds": round(time.time() - start, 1),
            })
        except Exception as e:  # noqa: BLE001 — one bad file shouldn't kill the batch
            emit({"mp3": mp3, "ok": False, "error": str(e)})

    return 0


if __name__ == "__main__":
    sys.exit(main())
