#!/usr/bin/env python3
"""Manifesto priority-episode transcription worker.

Transcribes missing priority episodes with Whisper large-v3 (int8, word
timestamps, VAD) and writes, per episode, into manifesto/sources/transcripts/:

  <slug>.json — knowledge-graph-shaped record: episode metadata + immutable
                raw whisper segments (start/end/text/avg_logprob/words),
                versioned, diarization field present but null (pending —
                pyannote needs a gated HF model not available here).
  <slug>.txt  — readable transcript with [mm:ss] paragraph markers for
                fast human verification of quotes.

Queue is ordered by Manifesto evidence value. Idempotent: skips episodes
whose .json already exists.
"""
import json, os, sys, time, urllib.request
from faster_whisper import WhisperModel

REPO = "/home/user/roadman-cycling-site"
OUT = os.path.join(REPO, "manifesto/sources/transcripts")
TMP = "/tmp/manifesto-audio"
os.makedirs(OUT, exist_ok=True)
os.makedirs(TMP, exist_ok=True)

QUEUE = [
    {
        "slug": "how-to-train-smarter-with-less-time-joe-friel",
        "title": "How to Train Smarter with Less Time With Joe Friel",
        "guest": "Joe Friel",
        "pubDate": "2025-08-06",
        "duration": "00:52:53",
        "rssGuid": "335530fa-00cd-40d0-b427-87573ef18006",
        "audio": "https://anchor.fm/s/a09110e0/podcast/play/106487900/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2025-7-5%2F405178179-44100-2-bcab8b3d9930a.mp3",
        "local": "friel-train-smarter.mp3",
    },
    {
        "slug": "triathletes-can-self-coach-joe-friel",
        "title": "Triathletes CAN Self Coach! With Joe Friel",
        "guest": "Joe Friel",
        "pubDate": "2024-01-17",
        "duration": "00:45:15",
        "rssGuid": "2fdbc4df-b8a2-4ae7-abc5-10f774638675",
        "audio": "https://anchor.fm/s/a09110e0/podcast/play/81365700/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2024-0-16%2Fd3029ceb-4dc2-1011-867b-59036be43e0b.mp3",
        "local": "friel-self-coach.mp3",
    },
    {
        "slug": "founders-series-training-peaks-story-joe-friel",
        "title": "Founders Series: The Training Peaks Story with Joe Friel",
        "guest": "Joe Friel",
        "pubDate": "2022-12-20",
        "duration": "00:39:43",
        "rssGuid": "39ab83fb-3920-4dc6-8896-f61e9a285f0e",
        "audio": "https://anchor.fm/s/a09110e0/podcast/play/62436558/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2022-11-19%2Faf6c98be-4657-9807-38c8-6cde645598a3.mp3",
        "local": "friel-founders.mp3",
    },
]

def mmss(t):
    return f"{int(t)//60:02d}:{int(t)%60:02d}"

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

log("loading large-v3 (int8, 4 threads)")
model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)

for ep in QUEUE:
    json_path = os.path.join(OUT, ep["slug"] + ".json")
    if os.path.exists(json_path):
        log(f"skip (done): {ep['slug']}")
        continue
    audio_path = os.path.join(TMP, ep["local"])
    if not os.path.exists(audio_path):
        log(f"downloading {ep['slug']}")
        urllib.request.urlretrieve(ep["audio"], audio_path)
    log(f"transcribing {ep['slug']} ({ep['duration']})")
    t0 = time.time()
    segs, info = model.transcribe(audio_path, language="en", word_timestamps=True, vad_filter=True)
    segments = []
    for s in segs:
        segments.append({
            "id": s.id, "start": round(s.start, 2), "end": round(s.end, 2),
            "text": s.text, "avg_logprob": round(s.avg_logprob, 4),
            "no_speech_prob": round(s.no_speech_prob, 4),
            "words": [{"w": w.word, "s": round(w.start, 2), "e": round(w.end, 2),
                       "p": round(w.probability, 3)} for w in (s.words or [])],
        })
        if s.id % 50 == 0:
            log(f"  …{mmss(s.end)} of audio")
    record = {
        "version": 1,
        "episode": {k: ep[k] for k in ("slug", "title", "guest", "pubDate", "duration", "rssGuid")},
        "asr": {"engine": "faster-whisper", "model": "large-v3",
                "compute_type": "int8", "language": info.language,
                "duration_sec": round(info.duration, 1),
                "transcribed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())},
        "diarization": None,  # pending — run pyannote at ingestion into the KG store
        "segments": segments,
        "text": "".join(s["text"] for s in segments).strip(),
    }
    with open(json_path, "w") as f:
        json.dump(record, f, ensure_ascii=False)
    # readable txt: paragraph break + [mm:ss] marker every ~45s of audio
    lines, cur, cur_start = [], [], 0.0
    for s in segments:
        if not cur:
            cur_start = s["start"]
        cur.append(s["text"].strip())
        if s["end"] - cur_start >= 45:
            lines.append(f"[{mmss(cur_start)}] " + " ".join(cur))
            cur = []
    if cur:
        lines.append(f"[{mmss(cur_start)}] " + " ".join(cur))
    with open(os.path.join(OUT, ep["slug"] + ".txt"), "w") as f:
        f.write(f"# {ep['title']}\n# {ep['pubDate']} · {ep['duration']} · guest: {ep['guest']}\n"
                f"# whisper large-v3 · UNVERIFIED ASR — verify quotes against audio\n\n")
        f.write("\n\n".join(lines) + "\n")
    log(f"done {ep['slug']} in {(time.time()-t0)/60:.0f} min ({len(segments)} segments)")

log("queue complete")
