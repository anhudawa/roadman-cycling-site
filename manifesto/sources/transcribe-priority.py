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

    {"slug": "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler", "title": "How To Cycle Fast At A Lower Heart Rate With Dr Stephen Seiler", "guest": "Dr Stephen Seiler", "pubDate": "2024-11-04", "duration": "00:51:30", "rssGuid": "8a2814b4-8c69-48b4-b0e7-ddd551e79287", "audio": "https://anchor.fm/s/a09110e0/podcast/play/93810246/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2024-9-31%2F389056361-44100-2-060f2680e00eb.mp3", "local": "ep-2095-secret-to-cycling-fast-at-a-low-.mp3"},
    {"slug": "ep-2132-how-do-team-bora-approach-building-endurance-we-find-out-joh", "title": "Elite Cycling Strategies WITH Bora Hansgrove’s John Wakefield", "guest": "John Wakefield", "pubDate": "2024-05-06", "duration": "00:55:22", "rssGuid": "9b6dbb46-91db-47f2-8252-11a1a8a02c73", "audio": "https://anchor.fm/s/a09110e0/podcast/play/86367279/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2024-4-6%2F376697337-44100-2-d4f616ae2592e.mp3", "local": "ep-2132-how-do-team-bora-approach-buildi.mp3"},
    {"slug": "the-science-of-getting-faster-after-40-dr-andy-galpin", "title": "The Science Of Getting Faster After 40 With Dr. Andy Galpin", "guest": "Dr Andy Galpin", "pubDate": "2026-05-04", "duration": "00:53:02", "rssGuid": "8fa14b38-b02a-4cdd-8be0-75ad71e65fe3", "audio": "https://anchor.fm/s/a09110e0/podcast/play/119336191/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2026-4-1%2F423266356-44100-2-22fdb81a91cd7.mp3", "local": "the-science-of-getting-faster-after-40-d.mp3"},
    {"slug": "ep-2106-he-accidentally-mastered-aerodynamics-dan-bigham", "title": "How to Ride Faster: Olympic Insights from Dan Bigham on Aerodynamics", "guest": "Dan Bigham", "pubDate": "2024-09-13", "duration": "00:45:10", "rssGuid": "c3575f0d-b73b-4f35-a9c1-39962663a868", "audio": "https://anchor.fm/s/a09110e0/podcast/play/91655280/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2024-8-13%2F386280580-44100-2-609c0e6bacd01.mp3", "local": "ep-2106-he-accidentally-mastered-aerodyn.mp3"},
    {"slug": "ep-2154-how-to-beat-99-by-getting-faster-with-age-dr-david-lipman", "title": "Turning Back the Clock: How to Beat 99% by Getting Faster with Age", "guest": "Dr David Lipman", "pubDate": "2024-02-19", "duration": "01:09:30", "rssGuid": "c8cdab5e-1471-4682-9e0c-fe15bbbf0f17", "audio": "https://anchor.fm/s/a09110e0/podcast/play/82887285/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2024-1-19%2F368002897-44100-2-2d95eee18351d.mp3", "local": "ep-2154-how-to-beat-99-by-getting-faster.mp3"},
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
