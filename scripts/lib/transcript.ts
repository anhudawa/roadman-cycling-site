import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

/**
 * Fetch a YouTube transcript via yt-dlp's iOS player client.
 *
 * Why: the youtube-transcript npm package (and yt-dlp's default web client)
 * now return empty/"disabled" captions because YouTube forces a PO token on
 * the web client. The iOS player client still serves the timedtext tracks.
 * curl_cffi (pip) provides the TLS impersonation yt-dlp uses under the hood.
 *
 * We download the json3 subtitle track to a temp dir, parse it, then clean up.
 * `--ignore-no-formats-error` is required: the iOS client exposes no
 * downloadable video format without a PO token, which otherwise aborts the run
 * before subtitles are written.
 */
function ytDlpJson3(videoId: string): string | null {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "roadman-subs-"));
  try {
    execFileSync(
      "python3",
      [
        "-m",
        "yt_dlp",
        "--write-subs",
        "--write-auto-subs",
        "--sub-langs",
        "en.*",
        "--sub-format",
        "json3",
        "--skip-download",
        "--ignore-no-formats-error",
        "--no-warnings",
        "--quiet",
        "--extractor-args",
        "youtube:player_client=ios",
        "-o",
        path.join(tmpDir, "%(id)s.%(ext)s"),
        `https://www.youtube.com/watch?v=${videoId}`,
      ],
      { stdio: ["ignore", "ignore", "ignore"], timeout: 120000 }
    );

    // Pick the best json3 file: prefer a plain "en" track over "en-orig"
    // (auto), then fall back to whichever has the most text.
    const files = fs
      .readdirSync(tmpDir)
      .filter((f) => f.startsWith(videoId) && f.endsWith(".json3"));
    if (files.length === 0) return null;

    let best: { text: string; words: number } | null = null;
    for (const f of files) {
      const isOrig = f.includes(".en-orig.");
      const text = parseJson3(fs.readFileSync(path.join(tmpDir, f), "utf-8"));
      if (!text) continue;
      const words = text.split(/\s+/).length;
      // Prefer non-orig at equal length; otherwise prefer longer.
      if (
        !best ||
        words > best.words ||
        (words === best.words && !isOrig)
      ) {
        best = { text, words };
      }
    }
    return best?.text ?? null;
  } catch {
    return null;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

interface Json3Seg {
  utf8?: string;
}
interface Json3Event {
  segs?: Json3Seg[];
}

/**
 * Convert a YouTube json3 subtitle payload to plain text.
 *
 * Auto-caption json3 emits "rolling" lines where a later event repeats an
 * earlier one with more words appended. We dedup at the line level: drop a
 * line that is identical to, or a strict prefix of, the following line.
 */
function parseJson3(raw: string): string | null {
  let data: { events?: Json3Event[] };
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  const events = data.events ?? [];
  if (events.length === 0) return null;

  // Each event becomes a line. Newline-only "append" events are dropped here
  // and reintroduced as line boundaries.
  const lines: string[] = [];
  for (const ev of events) {
    const segText = (ev.segs ?? [])
      .map((s) => s.utf8 ?? "")
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    if (segText) lines.push(segText);
  }

  // Rolling-caption dedup.
  const deduped: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i];
    const next = lines[i + 1];
    if (next && (next === cur || next.startsWith(cur + " "))) {
      // Current line is a prefix of the next — the next is the fuller version.
      continue;
    }
    if (deduped.length && deduped[deduped.length - 1] === cur) continue;
    deduped.push(cur);
  }

  const joined = deduped.join(" ");
  return cleanTranscript(joined) || null;
}

function cleanTranscript(text: string): string {
  return text
    .replace(/\[Music\]/gi, "")
    .replace(/\[Applause\]/gi, "")
    .replace(/\[Laughter\]/gi, "")
    .replace(/\[inaudible\]/gi, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fetch and clean a YouTube video transcript. Returns null when no captions
 * are available for the video.
 */
export async function fetchTranscript(
  videoId: string
): Promise<string | null> {
  return ytDlpJson3(videoId);
}

/**
 * Truncate transcript for AI processing (keep first ~8000 words)
 */
export function truncateTranscript(
  transcript: string,
  maxWords: number = 8000
): string {
  const words = transcript.split(/\s+/);
  if (words.length <= maxWords) return transcript;
  return words.slice(0, maxWords).join(" ") + "...";
}
