import { type YouTubeVideo } from "./youtube-api.js";

export interface FilterResult {
  passed: YouTubeVideo[];
  filtered: { video: YouTubeVideo; reason: string }[];
}

const SHORTS_PATTERNS = /#shorts/i;
const CLIP_PATTERNS =
  /\b(short|clip|highlight|promo|teaser|preview|coming soon|trailer)\b/i;

export function filterVideos(videos: YouTubeVideo[]): FilterResult {
  const passed: YouTubeVideo[] = [];
  const filtered: { video: YouTubeVideo; reason: string }[] = [];

  for (const video of videos) {
    const durationSec = video.duration;

    // Skip YouTube Shorts (< 60 seconds)
    if (durationSec < 60) {
      filtered.push({ video, reason: "Short (< 60s)" });
      continue;
    }

    // Skip #shorts tagged content
    if (
      SHORTS_PATTERNS.test(video.title) ||
      SHORTS_PATTERNS.test(video.description)
    ) {
      filtered.push({ video, reason: "#shorts tag" });
      continue;
    }

    // Skip short clips (< 5 min with clip-like title)
    if (durationSec < 300 && CLIP_PATTERNS.test(video.title)) {
      filtered.push({ video, reason: "Short clip (< 5min with clip title)" });
      continue;
    }

    // Skip live streams with 0 duration (not yet processed)
    if (durationSec === 0) {
      filtered.push({ video, reason: "Zero duration (unprocessed live stream)" });
      continue;
    }

    passed.push(video);
  }

  return { passed, filtered };
}
