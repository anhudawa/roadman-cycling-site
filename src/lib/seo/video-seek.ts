/** Shared URL/timestamp rules; safe to import into the video player. */
export function parseVideoTime(value: string | null): number | null {
  if (value === null || !/^\d+(?::\d{2}){0,2}$/.test(value)) return null;
  const parts = value.split(":").map(Number);
  if (parts.slice(1).some((part) => part > 59)) return null;
  const seconds = parts.reduce((total, part) => total * 60 + part, 0);
  return Number.isSafeInteger(seconds) && seconds >= 0 ? seconds : null;
}

export function formatVideoTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = String(seconds % 60).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}`
    : `${minutes}:${remainder}`;
}

export function getYouTubeEmbedUrl(youtubeId: string, startSeconds = 0): string {
  const url = `https://www.youtube.com/embed/${youtubeId}`;
  return Number.isSafeInteger(startSeconds) && startSeconds > 0
    ? `${url}?start=${startSeconds}`
    : url;
}

export function getVideoMomentHref(watchUrl: string, seconds: number): string {
  return seconds > 0 ? `${watchUrl}?t=${seconds}#video` : `${watchUrl}#video`;
}
