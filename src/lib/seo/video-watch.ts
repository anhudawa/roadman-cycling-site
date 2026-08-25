import { SITE_ORIGIN } from "@/lib/brand-facts";
import { getAllEpisodes, type EpisodeMeta } from "@/lib/podcast";

export type VideoEpisode = EpisodeMeta & { youtubeId: string };

export function getVideoEpisodes(): VideoEpisode[] {
  return getAllEpisodes().filter(
    (episode): episode is VideoEpisode => Boolean(episode.youtubeId),
  );
}

export function getWatchUrl(slug: string): string {
  return `${SITE_ORIGIN}/watch/${slug}`;
}

export function getYouTubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}`;
}

export function getYouTubeThumbnailUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

function durationParts(duration: string): number[] {
  const parts = duration.split(":").map(Number);
  if (
    (parts.length !== 2 && parts.length !== 3) ||
    parts.some((part) => !Number.isFinite(part) || part < 0)
  ) {
    return [];
  }
  return parts;
}

export function durationToSeconds(duration: string): number | null {
  const parts = durationParts(duration);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

export function durationToIso(duration: string): string | null {
  const parts = durationParts(duration);
  if (parts.length === 3) {
    return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
  }
  if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`;
  return null;
}
